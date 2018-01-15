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
			Folders.insert({
				path: path,
				name: Folder.createNameFromPath(path),
				father: Folder.createFatherPath(path),
				children: [],
				isFolder: isFolder,
				isInCollection: (action === ScanActions.Add) ? true : false,
				size: size
			});
			let foldersLocal: Observable<Folder[]> = Folders.find({path: path});
			foldersLocal.subscribe(list => {
					let folderReturn: Folder = list[0];
					if(folderReturn === undefined){
						return;
					}
					updateFolderAction(folderReturn, path, children, isFolder, action);
			})
		}else{
			updateFolderAction(folder, path, children, isFolder, action);
		}
	}).run();
}

function updateFolderAction(folder: Folder, path: string, children: string[], isFolder: boolean, action: ScanActions){
	if (action === ScanActions.RemoveCollection) {
		if(!folder.isFolder){
			let videoMeta = VideosMetas.findOne({folderId : folder._id});
			console.log("Appel de removeVideo pour le folder " + folder.name);
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
					var newAdress = "https://" + "jeje-guidon.servehttp.com" + ":" + "443" + getSubstringUrl(video.url, "", "afterAdressPort") ;

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

function scanFolder(path: string, depth: number, action: ScanActions): void {
	check(path, String);

	var fs = Npm.require("fs");

	fs.readdir(path, function(err, files) {
		if (err) {
			console.log(err);
			return;
		}

		purgeChildren(path, files);

		var Fiber = Npm.require("fibers");
		Fiber(function() {
			for (var file of files) {
				if(checkScanConditions(file)){
					Folders.update({ path: path }, { $addToSet: { children: file } });
				}
			}
		}).run();

		for (var file of files) {
			var childPath: string = Folder.createChildPath(path, file);
			scanFile(childPath, depth, action);
		}
	});
}

function scanFile(path: string, depth: number, action: ScanActions) {
	if (!checkScanConditions(path))
		return;

	var fs = Npm.require("fs");
	var util = Npm.require('util');

	fs.stat(path, function(err, stats) {
		if (err) {
			console.log(err);
			return;
		}

		if (stats.isDirectory()) {
			insertOrUpdateFolder(path, [], true, action, stats.size);

			if (depth != -2)
				depth--;

			if (depth === -2 || depth >= 0) {
				scanFolder(path, depth, action);
			}
		} else {
			insertOrUpdateFolder(path, [], false, action, stats.size);
		}
	})

}

Meteor.methods({
	scanFolderBeginning: function(path: string, depth: number, action: ScanActions) {
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
