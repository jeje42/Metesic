import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { PlayListUser } from '../models/playlist-user.model';

export const PlayListsUsers = new MongoObservable.Collection<PlayListUser>('playlistsUsers');

function loggedIn() {
  return !!Meteor.user();
}

PlayListsUsers.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});
