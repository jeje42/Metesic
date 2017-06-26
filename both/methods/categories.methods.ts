import { Categories } from '../collections/categories.collection';
import { Category } from '../models/category.model';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

Meteor.methods({
	addCategory: function(name: string) {
		if (Meteor.isServer) {
			Categories.insert({name:name});
		}
	},

	deleteCategory: function(id: string) {
		if (Meteor.isServer) {
			Categories.remove({_id:id});
		}
	}
});
