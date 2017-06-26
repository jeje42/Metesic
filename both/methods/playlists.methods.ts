import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Observable } from 'rxjs/Observable';

import { PlayLists } from '../collections/playlists.collection';
import { PlayListsUsers } from '../collections/playlists-users.collection';

import { PlayList } from '../models/playlist.model';

import { PlayListUser } from '../models/playlist-user.model';

Meteor.methods({
	addVideoToPlaylist: function(playListId: string, videoMetaId: string){
		if (Meteor.isServer) {
			console.log("addVideoToPlaylist : " + playListId + " ; " + videoMetaId);
			PlayLists.update({_id: playListId}, {$addToSet: {list: videoMetaId}});
		}
	},
	setPlayListToPlayListUser: function(_idPlaylist: string){
		if(Meteor.isServer){
			// //logger.info("setPlayListToPlayListUser : " + _idPlaylist + " ; " + Meteor.user());
			console.log("setPlayListToPlayListUser : " + _idPlaylist + " ; " + Meteor.user());
			let playListsUsers: PlayListUser =  PlayListsUsers.findOne({user: Meteor.user()._id});
	    if(playListsUsers === undefined){
	      PlayListsUsers.insert({
	        user: Meteor.user()._id,
	        currentPlaylist: _idPlaylist
	      })
	    }else{
				var number : Observable<number> = PlayListsUsers.update({_id: playListsUsers._id}, {$set : {currentPlaylist: _idPlaylist}});
			}
		}
	},
	addPlayList: function(newPlaylist: PlayList, setToCurrentUser: boolean){
		console.log("addPlayList : " + newPlaylist.name + " ; " + setToCurrentUser);
		var dejaPresent: PlayList = PlayLists.findOne({name: newPlaylist.name});
		if(dejaPresent === undefined){
			let idInserted : Observable<string> = PlayLists.insert(newPlaylist);
			idInserted.subscribe(idInserted => {
				console.log("addPlayList call to setPlayListToPlayListUser : " + idInserted);
				if(idInserted && setToCurrentUser){
					Meteor.call('setPlayListToPlayListUser', idInserted);
				}
			})
		}else{
			if(setToCurrentUser){
				Meteor.call('setPlayListToPlayListUser', dejaPresent._id);
			}
		}
	},
	removePlayList: function(playListId: string){
		if(Meteor.isServer){
			var playlist: PlayList = PlayLists.findOne({_id: playListId});
			var playListUser = PlayListsUsers.findOne({user: Meteor.user()._id});
			if(playListUser != undefined && playlist != undefined && playListUser.currentPlaylist === playListId){
				PlayListsUsers.update({_id: playListUser._id}, {$set : {currentPlaylist: undefined}});
			}
			PlayLists.remove(playListId);
		}
	}
});
