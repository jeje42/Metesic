import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { UserAdmin } from '../models/user-admin.model'

export const UsersAdmin = new MongoObservable.Collection<UserAdmin>('usersAdmin');

function loggedIn() {
  return !!Meteor.user();
}

function allowInsert() {
  if(!loggedIn())
    return false;

  let alReadyOne: UserAdmin = UsersAdmin.findOne();
  if(alReadyOne === undefined){
    return true;
  }
  return false;
}

function allowUpdate() {
  return false;
}

function allowRemove() {
  if(!loggedIn())
    return false;

  let alReadyOne: UserAdmin = UsersAdmin.findOne();
  if(alReadyOne === undefined){
    return true;
  }
  if(alReadyOne.userId === Meteor.user()._id){
    return true;
  }
  return false;
}


UsersAdmin.allow({
  insert: allowInsert,
  update: allowUpdate,
  remove: allowRemove
});
