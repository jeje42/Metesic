import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Observable } from 'rxjs/Observable';

import { PlayLists } from '../collections/playlists.collection';
import { PlayListsUsers } from '../collections/playlists-users.collection';

import { PlayList } from '../models/playlist.model';

import { PlayListUser } from '../models/playlist-user.model';

Meteor.methods({

	/**
	 * addVideoToPlaylist - adds the VideoMeta to the PlayList
	 *
	 * @param  {type} playListId: string  description
	 * @param  {type} videoMetaId: string description
	 * @return {type}                     description
	 */
	addVideoToPlaylist: function(playListId: string, videoMetaId: string){
		if (Meteor.isServer) {
			PlayLists.update({_id: playListId}, {$addToSet: {list: videoMetaId}});
		}
	},

	/**
	 * setPlayListToPlayListUser - sets the PlayList as current PlayList the the current user (PlayListUser.currentPlaylist).
	 *
	 * @param  {type} _idPlaylist: string description
	 * @return {type}                     description
	 */
	setPlayListToPlayListUser: function(_idPlaylist: string){
		if(Meteor.isServer){
			// //logger.info("setPlayListToPlayListUser : " + _idPlaylist + " ; " + Meteor.user());
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

	/**
	 * setVideoPlayListUser - sets the PlayListUser.currentVideo to _idVideo.
	 *
	 * @param  {type} _idVideo: string description
	 * @return {type}                  description
	 */
	setVideoPlayListUser: function(_idVideo: string){
			let playListsUsers: PlayListUser =  PlayListsUsers.findOne({user: Meteor.user()._id});
	    if(playListsUsers != undefined && playListsUsers.currentVideo != _idVideo){
	      var number : Observable<number> = PlayListsUsers.update({_id: playListsUsers._id}, {$set : {currentVideo: _idVideo}});
	    }
	},

	/**
	 * setCurrentTime - sets the PlayListUser.currentTime to time.
	 *
	 * @param  {type} time: number description
	 * @return {type}              description
	 */
	setCurrentTime: function(time: number){
		// if(Meteor.isServer){
			let playListsUsers: PlayListUser =  PlayListsUsers.findOne({user: Meteor.user()._id});
	    if(playListsUsers != undefined){
	      var number : Observable<number> = PlayListsUsers.update({_id: playListsUsers._id}, {$set : {currentTime: time}});
	    }
		// }
	},

	/**
	 * blankCurrentVideo - resets PlayListUser.currentVideo and PlayListUser.currentTime to undefined.
	 *
	 * @return {type}  description
	 */
	blankCurrentVideo: function(){
		let playListsUsers: PlayListUser =  PlayListsUsers.findOne({user: Meteor.user()._id});
		if(playListsUsers != undefined){
			PlayListsUsers.update({_id: playListsUsers._id}, {$set : {currentVideo: undefined}});
			PlayListsUsers.update({_id: playListsUsers._id}, {$set : {currentTime: undefined}});
		}
	},

	/**
	 * addPlayList - inserts the newPlaylist to the database and sets it to the current User if setToCurrentUser.
	 *
	 * @param  {type} newPlaylist: PlayList     description
	 * @param  {type} setToCurrentUser: boolean description
	 * @return {type}                           description
	 */
	addPlayList: function(newPlaylist: PlayList, setToCurrentUser: boolean){
		var dejaPresent: PlayList = PlayLists.findOne({name: newPlaylist.name});
		if(dejaPresent === undefined){
			let idInserted : Observable<string> = PlayLists.insert(newPlaylist);
			idInserted.subscribe(idInserted => {
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
	/**
	 * removePlayList - removes the playListId fron PlayLists and if necessary PlayListUser.
	 *
	 * @param  {type} playListId: string description
	 * @return {type}                    description
	 */
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
