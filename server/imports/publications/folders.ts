import { Meteor } from 'meteor/meteor';
import { Folders } from '../../../both/collections/folders.collection';

import { loggedIsAdmin } from './checkAdmin';

Meteor.publish('folders', function() {
	if(loggedIsAdmin(this.userId)){
		return Folders.find();
	}
});
