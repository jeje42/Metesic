import { UploadFS } from 'meteor/jeje-ufs';
import { VideosStore } from '../collections/videos.collection';

import { VideosMetas } from '../collections/video-meta.collection';
import { Videos } from '../collections/videos.collection'
import { Folders } from '../collections/folders.collection';
import { Categories } from '../collections/categories.collection'

import { Video } from '../models/video.model';
import { VideoMeta } from '../models/video-meta.model';
import { Folder } from '../models/folder.model';
import { Category } from '../models/category.model';

/**
 * @param : originalString : the url from which we want to extract some information
 * @param : parameter :
 *		- undefined or "" : gets the substring from the beginning to the separator
 * 		- "port" : returns the port number
 *		- "adress" : returns the adress
 *		- "afterAdressPort" : the whole String after adress and port
 * @param : separator :
 */
export function getSubstringUrl(originalString:string, separator:string, parameter:string){
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

export function uploadVideos(data: File): Promise<any> {
  if(Meteor.isClient){
    return;
  }
  return new Promise((resolve, reject) => {
    // pick from an object only: name, type and size
    const file = {
      name: data.name,
      type: data.type,
      size: data.size,
    };

    const upload = new UploadFS.Uploader({
      data,
      file,
      store: VideosStore,
      onError: reject,
      onComplete: resolve
    });

    upload.start();
  });
}

export function uploadVideosPointer(folder: Folder): Promise<any> {
  if(Meteor.isClient){
    return;
  }
  return new Promise((resolve, reject) => {
    // pick from an object only: name, type and size
    const file = {
      name: folder.name,
      path: folder.path,
      // type: data.type,
      size: folder.size,
      pointerMode:true
    };

    const upload = new UploadFS.Uploader({
      file,
      store: VideosStore,
      onError: reject,
      onComplete: resolve
    });

    upload.startPointer();
  });
}

Meteor.methods({
	countVideosMeta: function(searchRegEx: string, disabledCategories: string[]) {
		if(Meteor.isServer){
			var objectResearch = [];
			objectResearch.push({name: searchRegEx});
			if(this.disabledCategories != undefined && this.disabledCategories.length > 0){
				objectResearch.push({categories: {$elemMatch: {$in : disabledCategories}}});
			}

			return VideosMetas.collection.find({$and: objectResearch}).count();
		}
	},
checkCategoriesForVideo: function(videoId: string) {
	console.log("checkCategoriesForVideo : " + videoId);
  //logger.info("checkCategoriesForVideo : " + videoId);
  var foldersPath: string[] = Videos.findOne({_id:videoId}).path.split("/");
  for(var fol in foldersPath){
    //logger.info("checkCategoriesForVideo : " + videoId + " ; searching for " + foldersPath[fol] + " within Categories");
    var category:Category = Categories.findOne({name: foldersPath[fol]});
    if(category != undefined){
      console.log("checkCategoriesForVideo : " + videoId + " ; Adding " + category.name + " to the video");
      VideosMetas.update({video:videoId}, { $addToSet: { categories: category._id } });
    }
  }
},

removeVideo: function(videoMeta: VideoMeta){
  if(videoMeta == undefined){
		console.log("method removeVideo : cannot remove the video because it is undefined !");
    // throw new Meteor.Error("Method removeVideo : cannot remove the video because it is undefined !");
		return;
  }
  Videos.remove({_id:videoMeta.video});
  VideosMetas.remove({_id:videoMeta._id});
},

// Meteor.methods({
	deleteVideo: function(videoMeta: VideoMeta) {
		if (Meteor.isServer) {
      Videos.collection.remove({_id: videoMeta.video}, function(err, result){
        if(err){
          console.log("Cannot remove " + videoMeta.name + " from Videos because " + err);
          return;
        }
        VideosMetas.collection.remove({_id:videoMeta._id},function(err, result){
          if(err){
            console.log("Cannot remove " + videoMeta.name + " from VideosMetas because " + err);
            return;
          }
          Folders.update({_id : videoMeta.folderId}, {$set: {isInCollection: false}});
        });
      });
		}
	}
});
