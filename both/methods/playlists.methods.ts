import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Observable } from 'rxjs/Observable';

import { PlayLists } from '../collections/playlists.collection';
import { PlayListsUsers } from '../collections/playlists-users.collection';
import { VideosUsers } from '../collections/videos-users.collection';

import { PlayList } from '../models/playlist.model';
import { VideoPlayList } from '../models/video-playlist.model';

import { PlayListUser } from '../models/playlist-user.model';
import { VideoUser } from '../models/video-user.model';

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
			var videoPlayList: VideoPlayList = {
				id_videoMeta: videoMetaId,
				date : new Date()
			};
			PlayLists.update({_id: playListId}, {$push: {list: videoPlayList}});
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
	setVideoPlayListUser: function(_idVideo: string, playList: string){
			let videoUser: VideoUser =  VideosUsers.findOne({user: Meteor.user()._id, playList: playList});
			if(videoUser == undefined){
				VideosUsers.insert({
					user : Meteor.user()._id,
					currentVideo : _idVideo,
					currentTime : 0,
					playList: playList
				})
			}
	    if(videoUser != undefined && videoUser.currentVideo != _idVideo){
	      var number : Observable<number> = VideosUsers.update({_id: videoUser._id}, {$set : {currentVideo: _idVideo, playList: playList}});
	    }
	},

	/**
	 * setCurrentTime - sets the PlayListUser.currentTime to time.
	 *
	 * @param  {type} time: number description
	 * @return {type}              description
	 */
	setCurrentTime: function(time: number){
		if(Meteor.isServer){
			let playListsUsers: PlayListUser =  PlayListsUsers.findOne({user: Meteor.user()._id});
	    if(playListsUsers != undefined){
	      var number : Observable<number> = PlayListsUsers.update({_id: playListsUsers._id}, {$set : {currentTime: time}});
	    }
		}
	},

	/**
	 * blankCurrentVideo - resets PlayListUser.currentVideo and PlayListUser.currentTime to undefined.
	 * Deprecated !
	 * @return {type}  description
	 */
	blankCurrentVideo: function(){
		let videoUser: VideoUser =  VideosUsers.findOne({user: Meteor.userId()});
		if(videoUser){
			VideosUsers.update({_id: videoUser._id}, {$set : {currentVideo: null, currentTime: 0}});
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
	 * removePlayList - removes the playListId from PlayLists and if necessary PlayListUser.
	 * Deprecated !
	 *
	 * @param  {type} playListId: string description
	 * @return {type}                    description
	 */
	removePlayList: function(playListId: string){
		var playlist: PlayList = PlayLists.findOne({_id: playListId});
		var playListUser = PlayListsUsers.findOne({user: Meteor.user()._id});
		console.log(playlist + " ; " + playListId + " : " + playListUser + " ; " + playListUser.currentPlaylist)
		if(playListUser && playlist && playListUser.currentPlaylist === playListId){
			console.log("removePlayList PlayListUsers ! " + Meteor.user() + " ; " + playListUser.user + " ; " + playListUser.currentPlaylist + " ; " + playListId)
			let modifs = PlayListsUsers.update({user: Meteor.user()}, {$set : {currentPlaylist: "test"}});
			modifs.subscribe((number) => {
				console.log("Modifs : " + number)
			})
		}
		PlayLists.remove(playListId);
	}
});
