import { PlayListsUsers } from '../../../both/collections/playlists-users.collection';
import { PlayLists } from '../../../both/collections/playlists.collection';

import {PlayList} from '../../../both/models/playlist.model';


export function initPlayerPlayList() {
	console.log("Listing PlayListsUsers");
	var playlists = PlayListsUsers.find();
	if (playlists.cursor.count() === 0) {
		console.log("No platLists yet !")
	}else{
		playlists.fetch().forEach(videoMeta => {console.log(videoMeta)});
	}

	console.log("Listing PlayLists");
	var playlists2 = PlayLists.find();
	if (playlists2.cursor.count() === 0) {
		console.log("No platLists yet !")
	}else{
		playlists2.fetch().forEach(videoMeta => {console.log(videoMeta)});
	}

}
