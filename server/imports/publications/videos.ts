import { Meteor } from 'meteor/meteor';
import { Videos } from '../../../both/collections/videos.collection';

import { loggedIsAdmin } from './checkAdmin';

Meteor.publish('videos', function() {
  if(this.userId != undefined){
    return Videos.collection.find();
  }
});
