import { Meteor } from 'meteor/meteor';
import { Settings } from '../../../both/collections/settings.collection';

Meteor.publish('settings', function() {
	// if(this.userId){
		return Settings.find();
	// }
});
