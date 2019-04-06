import { PlayListsUsers } from '../../../both/collections/playlists-users.collection';
import { PlayLists } from '../../../both/collections/playlists.collection';

import {PlayList} from '../../../both/models/playlist.model';
import {VideoPlayList} from '../../../both/models/video-playlist.model';

export function initPlayerPlayList() {
	logger.info("Listing PlayListsUsers");
	var playlists = PlayListsUsers.find();
	if (playlists.cursor.count() === 0) {
		logger.info("No playLists yet !")
	}else{
		playlists.fetch().forEach(videoMeta => {logger.info(JSON.stringify(videoMeta))});
	}

	logger.info("Listing PlayLists");
	var playlists2 = PlayLists.find();
	if (playlists2.cursor.count() === 0) {
		logger.info("No playLists yet !")
	}else{
		playlists2.fetch().forEach(playList => {
			updateVideosInPlayList(playList);
		});
	}

}

function updateVideosInPlayList(playList: PlayList){
	logger.info("updateVideosInPlayList !");
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
		logger.info("Updating !" + playList.list.length + " ; " + newList.length);
		PlayLists.update({_id: playList._id}, {$set: {list: newList}});
	}
}
