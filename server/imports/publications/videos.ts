import { Meteor } from 'meteor/meteor';
import { Videos } from '../../../both/collections/videos.collection';

import { loggedIsAdmin } from './checkAdmin';

Meteor.publish('videos', function() {
  if(loggedIsAdmin(this.userId)){
    return Videos.collection.find();
  }
});
