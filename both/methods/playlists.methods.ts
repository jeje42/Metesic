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
	 * addVideosToPlaylist - adds the VideoMeta to the PlayList
	 *
	 * @param  {type} playListId: string  description
	 * @param  {type} videoMetaId: string description
	 * @return {type}                     description
	 */
	addVideosToPlaylist: function(playListId: string, lVideoMetaId: string[]): void{
		// if (Meteor.isServer) {
			let playList: PlayList = PlayLists.findOne({_id: playListId})
			let position = 0
			if(playList){
				position = playList.list.length
			}

			let lVideoPlayList: VideoPlayList[] = []
			lVideoMetaId.forEach(videoMetaId => {
				lVideoPlayList.push({
					id_videoMeta: videoMetaId,
					date : new Date(),
					currentPosition: position
				})
				position++
			})

			PlayLists.update({_id: playListId}, {$push: {list: { $each: lVideoPlayList}}});
		// }
	},

	/**
	 * setPlayListToPlayListUser - sets the PlayList as current PlayList for the current user (PlayListUser.active boolean).
	 *
	 * @param  {type} _idPlaylist: string description
	 * @return {type}                     description
	 */
	setPlayListToPlayListUser: function(_idPlaylist: string): void{
		if(Meteor.isServer){
			const userId = Meteor.userId()

			PlayListsUsers.update({user: userId, active: true}, {$set : {active: false}}).subscribe(() => {
				let playListsUser: PlayListUser =  PlayListsUsers.findOne({user: userId, playlist: _idPlaylist});
		    if(playListsUser === undefined){
		      PlayListsUsers.insert({
		        user: userId,
		        playlist: _idPlaylist,
						currentPosition:0,
						active: true
		      })
		    }else{
					PlayListsUsers.update({_id: playListsUser._id}, {$set : {active: true}});
				}
			})
		}
	},

	/**
	 * setVideoPlayListUser - sets the PlayListUser.currentVideo to _idVideo.
	 *
	 * @param  {type} _idVideo: string description
	 * @return {type}                  description
	 */
	setVideoPlayListUser: function(playListUserId: string): void{
			let videoUser: VideoUser =  VideosUsers.findOne({playListUserId: playListUserId});
			if(videoUser == undefined){
				console.log("inserting VideosUsers !")
				VideosUsers.insert({
					user: Meteor.userId(),
					playListUserId: playListUserId,
					currentTime : 0
				})
			}
	},

	/**
	 * setCurrentTime - sets the PlayListUser.currentTime to time.
	 *
	 * @param  {type} time: number description
	 * @return {type}              description
	 */
	setCurrentTime: function(time: number): void{
		if(Meteor.isServer){
			let playListsUsers: PlayListUser =  PlayListsUsers.findOne({user: Meteor.user()._id});
	    if(playListsUsers != undefined){
	      PlayListsUsers.update({_id: playListsUsers._id}, {$set : {currentTime: time}});
	    }
		}
	},

	/**
	 * blankCurrentVideo - resets PlayListUser.currentVideo and PlayListUser.currentTime to undefined.
	 * Deprecated !
	 * @return {type}  description
	 */
	blankCurrentVideo: function(): void{
		let videoUser: VideoUser =  VideosUsers.findOne({user: Meteor.userId()});
		if(videoUser){
			VideosUsers.update({_id: videoUser._id}, {$set : {currentVideo: null, currentTime: 0}});
		}
	},

	afterDeleteVideoFromPlaylist: function(idPlayList: string, position: number): void{
		let list: PlayListUser[] = PlayListsUsers.find({playlist: idPlayList}).fetch()
		list.forEach(playListUser => {
			if(playListUser.currentPosition>position){
				PlayListsUsers.update({_id: playListUser._id}, {$set: {currentPosition: playListUser.currentPosition-1}})
			}
		})

		let playList:PlayList = PlayLists.findOne({_id: idPlayList})
		for(let i=0; i< playList.list.length ; i++){
			if(playList.list[i].currentPosition>position){
				let placeholder = {};
				placeholder['list.' + i + '.currentPosition'] = playList.list[i].currentPosition-1
				PlayLists.update({_id: idPlayList}, {$set: placeholder})
			}
		}
	},

	/**
	 * addPlayList - inserts the newPlaylist to the database and sets it to the current User if setToCurrentUser.
	 *
	 * @param  {type} newPlaylist: PlayList     description
	 * @param  {type} setToCurrentUser: boolean description
	 * @return {type}                           description
	 */
	addPlayList: function(newPlaylist: PlayList, setToCurrentUser: boolean): void{
		var dejaPresent: PlayList = PlayLists.findOne({name: newPlaylist.name});
		if(dejaPresent === undefined){
			PlayLists.insert(newPlaylist).subscribe(idInserted => {
				if(idInserted && setToCurrentUser){
					Meteor.call('setPlayListToPlayListUser', idInserted);
				}
			})
		}else{
			if(setToCurrentUser){
				Meteor.call('setPlayListToPlayListUser', dejaPresent._id);
			}
		}
	}
});
