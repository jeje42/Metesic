import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { PlayList } from '../models/playlist.model';

export const PlayLists = new MongoObservable.Collection<PlayList>('playLists');

function loggedIn() {
  return !!Meteor.user();
}

PlayLists.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});
