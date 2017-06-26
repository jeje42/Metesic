import { Meteor } from 'meteor/meteor';

import { Parties } from '../../../both/collections/parties.collection';
import { UsersAdmin } from '../../../both/collections/users-admin.collection';

import { loggedIsAdmin } from './checkAdmin';

Meteor.publish('uninvited', function (partyId: string) {
  const party = Parties.findOne(partyId);

  if (!party) {
    throw new Meteor.Error('404', 'No such party!');
  }

  return Meteor.users.find({
    _id: {
      $nin: party.invited || [],
      $ne: this.userId
    }
  });
});

// Server
Meteor.publish('userData', function () {
  if(loggedIsAdmin(this.userId)){
  // if (this.userId) {
  //   return Meteor.users.find({ _id: this.userId }, {
  //     fields: { other: 1, things: 1 }
  //   });
  // } else {
  //   this.ready();
  // }
    return Meteor.users.find();
  }
});

Meteor.publish('userAdmin', function () {
  if(loggedIsAdmin(this.userId)){
    if(this.userId != undefined){
      return UsersAdmin.find();
    }
  }
});
