import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Folder } from '../models/folder.model';

export const Folders = new MongoObservable.Collection<Folder>('folders');

function loggedIn() {
	return !!Meteor.user();
}

Folders.allow({
	insert: loggedIn,
	update: loggedIn,
	remove: loggedIn
});
