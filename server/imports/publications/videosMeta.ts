import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { VideosMetas } from '../../../both/collections/video-meta.collection';

import { loggedIsAdmin } from './checkAdmin';

interface Options {
  [key: string]: any;
}

Meteor.publish('videosMetas', function(searchName?: string) {
  if(this.userId === undefined){
    return;
  }
	const selector = buildQuery.call(this, undefined, searchName);

  //logger.info("Publishing videosMetas with selector : " + JSON.stringify(selector));
	return VideosMetas.find(selector);
});

Meteor.publish('videoMeta', function(videoMetaId: string) {
  if(this.userId === undefined){
    return;
  }
	return VideosMetas.find(buildQuery.call(this, videoMetaId, undefined));
});


function buildQuery(videoId?: string, searchName?: string): Object {
  const isAvailable = {
    $or: [{
      // party is public
      public: true
    },
    // or
    {
      // current user is the owner
      $and: [{
        owner: this.userId
      }, {
        owner: {
          $exists: true
        }
      }]
    }]
  };

  if (videoId) {
    return {
      // only single video
      $and: [{
          _id: videoId
        },
        isAvailable
      ]
    };
  }

  if(searchName == undefined || searchName == null){
    return isAvailable;
  }


  let searchRegEx = {
    '$regex': searchName,
    '$options': 'i'
  };
  return {
    $and: [{
        name: searchRegEx
      },
      isAvailable
    ]
  };


}
