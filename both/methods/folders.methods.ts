import { Folders } from '../collections/folders.collection';
import { Videos } from '../collections/videos.collection';
import { VideosMetas } from '../collections/video-meta.collection';
import { Folder } from '../models/folder.model';
import { Video } from '../models/video.model';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

import { removeFileByPath, ScanActions } from './folders.sharedMethods';
import { uploadVideosPointer, getSubstringUrl } from './videos.methods';

//TODO : index unique : https://docs.mongodb.com/manual/core/index-unique/
/**
 *
 */
function insertOrUpdateFolder(path: string, children: string[], isFolder: boolean, action: ScanActions, size:number) {
	var Fiber = Npm.require("fibers");

	Fiber(function() {
		var folder: Folder = Folders.findOne({ path: path });
		if (folder === undefined) {
			let idFolder = Folders.collection.insert({
				path: path,
				name: Folder.createNameFromPath(path),
				father: Folder.createFatherPath(path),
				children: [],
				isFolder: isFolder,
				isInCollection: (action === ScanActions.Add) ? true : false,
				size: size
			});
			folder = Folders.findOne({ _id: idFolder });
			updateFolderAction(folder, path, children, isFolder, action);
		}else{
			updateFolderAction(folder, path, children, isFolder, action);
		}
	}).run();
}

function updateFolderAction(folder: Folder, path: string, children: string[], isFolder: boolean, action: ScanActions){
	if (action === ScanActions.RemoveCollection) {
		if(!folder.isFolder){
			let videoMeta = VideosMetas.findOne({folderId : folder._id});
			Meteor.call('removeVideo',videoMeta);
		}
		Folders.update({ path: path }, { $set: { isInCollection: false } });
	} else if (action === ScanActions.RemoveDatabase) {
		Folders.remove({ path: path });
	} else if (action === ScanActions.Add) {
		addToCollection(folder);
	} else {
		Folders.update({ path: path }, { $addToSet: { children: children } });
		Folders.update({ path: path }, { $set: { isFolder: isFolder } });
	}
}

function addToCollection(folder: Folder){
	console.log("addToCollection" + folder.path);
	var Fiber = Npm.require("fibers");

	Fiber(function() {
		if(folder.isFolder){
			console.log(folder.name + " is a folder a is not added to filesystem");
			Folders.update({ path: folder.path }, {$set: { isInCollection: true } });
		}else{
			console.log(folder.name + " is not a folder, call to uploadVideosPointer");
			if(!checkAddCondition(folder.name)){
				return;
			}
			uploadVideosPointer(folder)
	      .then((result) => {
					var video = Videos.findOne({_id: result._id});

					let adress = Meteor.settings.public.adress
					let port = Meteor.settings.public.port
					let protocole = "https"
					if(!adress || !port){
						adress = "jerome-guidon.fr"
						port = "446"
					}
					if(adress == "localhost"){
						protocole = "http"
					}
					var newAdress = protocole + "://" + adress + ":" + port + getSubstringUrl(video.url, "", "afterAdressPort") ;


					Videos.update(result._id, {
						$set: { url:  newAdress},
				    });

					VideosMetas.insert({
						name: folder.name,
						folderId: folder._id,
						description: "",
						video: result._id,
						public: true,
						owner: null
					});

					Folders.update({ path: folder.path }, { $set: { isInCollection: true } });
					Meteor.call('checkCategoriesForVideo', result._id);
	      })
	      .catch((error) => {
	        this.uploading = false;
	      });
		}
	}).run();
}


function checkAddCondition(name: string){
	var length = name.length;
	 if(length>4){
		 var res = name.substring(length-4, length);
		 if(".mp4" == res){
			 return true;
		 }
	 }
	 return false;
}

/**
 * toScan : path to scan
 * returns false if toScan is undefined or if toScan is a hidden file
 **/
function checkScanConditions(toScan: string) {
	if (toScan === undefined)
		return false;

	if (toScan[toScan.lastIndexOf("/") + 1] === ".")
		return false;

	return true;
}

/**
 * Removes the children of path (in the database occurrence with the path key) not in the files array
 */
function purgeChildren(path: string, files: string[]) {
	var Fiber = Npm.require("fibers");

	Fiber(function() {
		let folder: Folder = Folders.findOne({ path: path });
		if (folder === undefined) {
			return;
		}
		for (var child of folder.children) {
			if (child === undefined)
				continue;

			if (files.lastIndexOf(child) === -1) {
				Folders.update({ path: path }, { $pull: { children: child } });
				removeFileByPath(Folder.createChildPath(folder.path,child));
			}
		}
	}).run();
}

/**
 * scanFolder - scans the folder path with fs.readdir
 * updates Folder.children with the containing files/folders returned by fs.readdir
 * launches scanFile for each containing files/folders.
 *
 * @param  {type} path: string        description
 * @param  {type} depth: number       description
 * @param  {type} action: ScanActions description
 * @return {type}                     description
 */
function scanFolder(path: string, depth: number, action: ScanActions): void {
	check(path, String);

	var Future = Npm.require('fibers/future'), wait = Future.wait;
	var fs = Future.wrap(Npm.require('fs'));

	var files = fs.readdirFuture(path).wait()
	// , function(err, files) {
		// if (err) {
		// 	console.log(err);
		// 	return;
		// }

		if(action == ScanActions.RemoveCollection || action == ScanActions.RemoveDatabase){
			purgeChildren(path, files);
		}

		// var Fiber = Npm.require("fibers");
		// Fiber(function() {
		for (var file of files) {
			if(checkScanConditions(file)){
				Folders.update({ path: path }, { $addToSet: { children: file } });
			}
		}
		// }).run();

		for (var file of files) {
			var childPath: string = Folder.createChildPath(path, file);
			scanFile(childPath, depth, action);
		}
}


/**
 * scanFile - launches fs.stat for path.
 * If path is a directory, lauches scanFolder for it.
 *
 *
 * @param  {type} path: string        description
 * @param  {type} depth: number       guides the depth of recursivity. If -2, never stops, overwise stop if depth=0.
 * @param  {type} action: ScanActions description
 * @return {type}                     description
 */
var scanFile = function(path: string, depth: number, action: ScanActions) {
		if (!checkScanConditions(path))
			return;

		var Future = Npm.require('fibers/future'), wait = Future.wait;
		var fs = Future.wrap(Npm.require('fs'));

		// var fs = Npm.require("fs");

		let fsPath = fs.statFuture(path).wait()

		// , function(err, stats) {
		// if (err) {
		// 	console.log(err);
		// 	return;
		// }

		if (fsPath.isDirectory()) {
			insertOrUpdateFolder(path, [], true, action, fsPath.size);

			if (depth != -2)
				depth--;

			if (depth === -2 || depth >= 0) {
				scanFolder(path, depth, action);
			}
		} else {
			insertOrUpdateFolder(path, [], false, action, fsPath.size);
		}
	// })
}

Meteor.methods({
	scanFolderBeginning: function(path: string, depth: number, action: ScanActions) {
		if(!action){
			action = ScanActions.Read;
		}
		if (Meteor.isServer) {
			scanFile(path, depth, action);
		}
	},

	changeCollectionFolder: function(folder: Folder, checked: boolean) {
		if (Meteor.isServer) {
			//			changeCollection(folder, checked);
			scanFile(folder.path, -2, checked ? ScanActions.Add : ScanActions.RemoveCollection);
		}
	}
});
