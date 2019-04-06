import { Meteor } from 'meteor/meteor';
import { Videos } from '../../../both/collections/videos.collection';
import { VideosUsers } from '../../../both/collections/videos-users.collection';


import { loggedIsAdmin } from './checkAdmin';

Meteor.publish('videos', function() {
  if(this.userId != undefined){
    return Videos.collection.find();
  }
});


Meteor.publish('videosUsers', function(){
  return VideosUsers.find(buildQueryPlayListsUsers.call(this));
});

function buildQueryPlayListsUsers(): Object {
  return {
    // current user
    $and: [{
      user: this.userId
    }, {
      user: {
        $exists: true
      }
    }]
  };
}
