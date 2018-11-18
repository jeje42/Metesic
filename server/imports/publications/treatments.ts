import { Meteor } from 'meteor/meteor';
import { FoldersTreatments } from '../../../both/collections/folder-treatment.collection';

import { loggedIsAdmin } from './checkAdmin';

Meteor.publish('folderTreatment', function() {
	if(loggedIsAdmin(this.userId)){
		return FoldersTreatments.find();
	}
});
