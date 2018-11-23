import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Setting } from '../models/setting.model';

import { UsersAdmin } from './users-admin.collection'
import { UserAdmin } from '../models/user-admin.model'

export const Settings = new MongoObservable.Collection<Setting>('settings');

function loggedIn() {
	return !!Meteor.user();
}


/**
 * authInsert - just one settings instance is authorized
 *
 * @return {type}  description
 */
function authInsert(){
	if(!loggedIn()){
		return false
	}
	var alreadyThere:Setting = Settings.findOne();
	if(alreadyThere){
		return false
	}

	return true
}


/**
 * authRemove - cannot remove the settings
 *
 * @return {type}  description
 */
function authRemove(){
	return false
}


/**
 * authUpdate - update authorized if the current user is admin
 *
 * @return {type}  description
 */
function authUpdate(){
	let admin: UserAdmin = UsersAdmin.findOne();
	if(admin && admin.userId == Meteor.userId()){
		return true
	}

	return false
}

Settings.allow({
	insert: authInsert,
	update: authUpdate,
	remove: authRemove
});
