import { PlayListsUsers } from '../../../both/collections/playlists-users.collection';
import { PlayLists } from '../../../both/collections/playlists.collection';

import {PlayList} from '../../../both/models/playlist.model';
import {VideoPlayList} from '../../../both/models/video-playlist.model';

export function initPlayerPlayList() {
	console.log("Listing PlayListsUsers");
	var playlists = PlayListsUsers.find();
	if (playlists.cursor.count() === 0) {
		console.log("No playLists yet !")
	}else{
		playlists.fetch().forEach(videoMeta => {console.log(videoMeta)});
	}

	console.log("Listing PlayLists");
	var playlists2 = PlayLists.find();
	if (playlists2.cursor.count() === 0) {
		console.log("No playLists yet !")
	}else{
		playlists2.fetch().forEach(playList => {
			updateVideosInPlayList(playList);
		});
	}

}

function updateVideosInPlayList(playList: PlayList){
	console.log("updateVideosInPlayList !");
	var newList: VideoPlayList[] = [];
	var updateList: boolean = false;
	for(var i=0 ; i<playList.list.length ; i++){
		var element = playList.list[i];

		if(typeof element == "string"){
			var videoPlayList: VideoPlayList = {
				id_videoMeta: element,
				date : new Date()
			};
			newList.push(videoPlayList);

			if(!updateList){
				updateList = true;
			}

		}else if(typeof element == "object"){
			newList.push(element);
		}
	}
	if(updateList){
		console.log("Updating !" + playList.list.length + " ; " + newList.length);
		PlayLists.update({_id: playList._id}, {$set: {list: newList}});
	}
}
