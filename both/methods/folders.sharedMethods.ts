import { Folders } from '../collections/folders.collection';
import { Folder } from '../models/folder.model';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

/**
 * Removes the file and its children recursively from the database.
 */
export function removeFile(file: Folder) {
	var Fiber = Npm.require("fibers");

	Fiber(function() {
		if (file.isFolder) {
			for (var child of file.children) {
				if (child === undefined)
					continue;

				removeFileByPath(Folder.createChildPath(file.path, child));
			}
		}
		console.log("Deleting " + file.path);
		Folders.remove({ path: file.path });
	}).run();
}

export function removeFileByPath(filePath: string) {
	var file: Folder = Folders.findOne({ path: filePath });
	if (file != undefined)
		removeFile(file);
}

export enum ScanActions {
	Read,
	Add,
	RemoveCollection,
	RemoveDatabase
}
