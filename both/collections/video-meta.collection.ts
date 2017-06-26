import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { VideoMeta } from '../models/video-meta.model';

export const VideosMetas = new MongoObservable.Collection<VideoMeta>('videosMetas');

function loggedIn() {
  return !!Meteor.user();
}

VideosMetas.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});
