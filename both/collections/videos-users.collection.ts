import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { VideoUser } from '../models/video-user.model';

export const VideosUsers = new MongoObservable.Collection<VideoUser>('videosUsers');

function loggedIn() {
  return !!Meteor.user();
}

VideosUsers.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});
