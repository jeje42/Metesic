import { Meteor } from 'meteor/meteor';

import { PlayLists } from '../../../both/collections/playlists.collection';
import { PlayListsUsers } from '../../../both/collections/playlists-users.collection';

interface Options {
  [key: string]: any;
}

Meteor.publish('playLists', function(options: Options) {
	const selector = buildQueryPlayLists.call(this, null, null);

	// Counts.publish(this, 'numberOfParties', Parties.collection.find(selector), { noReady: true });
	return PlayLists.find(selector, options);
});

Meteor.publish('playList', function(playListId: string) {
  return PlayLists.find(buildQueryPlayLists.call(this, playListId));
});

function buildQueryPlayLists(playListId?: string, name?: string): Object {
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

  if (playListId) {
    return {
      // only single party
      $and: [{
          _id: playListId
        },
        isAvailable
      ]
    };
  }

  // const searchRegEx = { '$regex': '.*' + (name || '') + '.*', '$options': 'i' };
  //
  // return {
  //   $and: [{
  //       'name': searchRegEx
  //     },
  //     isAvailable
  //   ]
  // };
  return isAvailable;
}

Meteor.publish('playlistsUsers', function(){
  return PlayListsUsers.find(buildQueryPlayListsUsers.call(this));
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
