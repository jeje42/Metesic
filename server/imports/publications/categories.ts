import { Meteor } from 'meteor/meteor';
import { Categories } from '../../../both/collections/categories.collection';

import { loggedIsAdmin } from './checkAdmin';

Meteor.publish('categories', function() {
	if(this.userId != undefined){
		return Categories.find();
	}
});
