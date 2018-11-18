import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { FolderTreatment } from '../models/folder-treatment.model';

export const FoldersTreatments = new MongoObservable.Collection<FolderTreatment>('folderTreatment');

function loggedIn() {
  return !!Meteor.user();
}

FoldersTreatments.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});
