import { VideosMetas } from '../../../both/collections/video-meta.collection';
import { VideoMeta } from '../../../both/models/video-meta.model';

import { Videos } from '../../../both/collections/videos.collection';
import { Video } from '../../../both/models/video.model';

import { getSubstringUrl } from '../../../both/methods/videos.methods';


export function searchVideos() {
	Meteor.onConnection(function(conn) {
	    logger.info("Nouvelle Connexion : " + conn.clientAddress);
	});

	var videos = VideosMetas.find();
	if (videos.cursor.count() === 0) {
		logger.info("No video yet !")
	}else{
		videos.fetch().forEach(videoMeta => {logger.info(JSON.stringify(videoMeta))});
	}


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

	var adress = getSubstringUrl(wholeAdress, "","adress");
	var port = getSubstringUrl(wholeAdress, "","port");

	//if(adress === Meteor.settings.adress && port === Meteor.settings.port){
	if(adress === "jeje-guidon.servehttp.com" && port === "443"){
	// if(adress === "localhost" && port === "3000"){
		return;
	}

	vids.fetch().forEach(video => {

		var newAdress:string;

		newAdress = "https://" + "jeje-guidon.servehttp.com" + ":" + "443" + getSubstringUrl(video.url, "", "afterAdressPort");
		// newAdress = "http://" + "localhost" + ":" + "3000" + getSubstringUrl(video.url, "", "afterAdressPort");
		//newAdress = "http://" + Meteor.settings.adress + ":" + Meteor.settings.port + getSubstringUrl(video.url, "", "afterAdressPort") ;

		Videos.update(video._id, {
			$set: { url:  newAdress},
	    });
	});
}

export function checkIndexesVideosMeta() {
	var list = VideosMetas.collection._ensureIndex({name:1}, {unique: true});
}
