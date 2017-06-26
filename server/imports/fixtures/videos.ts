import { VideosMetas } from '../../../both/collections/video-meta.collection';
import { VideoMeta } from '../../../both/models/video-meta.model';

import { Videos } from '../../../both/collections/videos.collection';
import { Video } from '../../../both/models/video.model';


export function searchVideos() {
	Meteor.onConnection(function(conn) {
	    console.log("Nouvelle Connexion : " + conn.clientAddress);
	});

	var videos = VideosMetas.find();
	if (videos.cursor.count() === 0) {
		console.log("No video yet !")
	}else{
		videos.fetch().forEach(videoMeta => {console.log(videoMeta)});
	}


}

/**
 * @param : originalString : the url from which we want to extract some information
 * @param : parameter :
 *		- undefined or "" : gets the substring from the beginning to the separator
 * 		- "port" : returns the port number
 *		- "adress" : returns the adress
 *		- "afterAdressPort" : the whole String after adress and port
 * @param : separator :
 */
function getSubstring(originalString:string, separator:string, parameter:string){
	if(separator === undefined)
		return "";

	var toReturn = "";
	if(parameter === undefined || parameter === ""){
		toReturn = originalString.substring(0, originalString.search(separator));
	}else{
		originalString = originalString.substring("http://".length, originalString.length);
		if(parameter === "port"){
			toReturn = originalString.substring(originalString.search(":"), originalString.search("/"));
		}else if(parameter === "adress"){
			toReturn = originalString.substring(0, originalString.search(":"));
		}else if(parameter === "afterAdressPort"){
			toReturn = originalString.substring(originalString.search("/"), originalString.length);
		}
	}

	return toReturn;
}

export function updateVideosUrls() {
	var vids = Videos.find();
	if (vids.cursor.count() === 0) {
		return;
	}

	var first = vids.fetch()[0];
	var wholeAdress = first.url;

	if(wholeAdress === undefined){
		return;
	}

	var adress = getSubstring(wholeAdress, "","adress");
	var port = getSubstring(wholeAdress, "","port");

	if(adress === Meteor.settings.adress && port === Meteor.settings.port){
		return;
	}

	vids.fetch().forEach(video => {

		var newAdress:string;

		newAdress = "http://" + Meteor.settings.adress + ":" + Meteor.settings.port + getSubstring(video.url, "", "afterAdressPort") ;

		Videos.update(video._id, {
			$set: { url:  newAdress},
	    });
	});
}

export function checkIndexesVideosMeta() {
	console.log("checkIndexesVideosMeta debut");
	var list = VideosMetas.collection._ensureIndex({name:1}, {unique: true});
	// VideosMetas.collection._
	console.log("checkIndexesVideosMeta fin");
}
