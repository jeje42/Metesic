import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { UploadFS } from 'meteor/jeje-ufs';
import { Video } from "../models/video.model";

export const Videos = new MongoObservable.Collection<Video>('videos');

// function loggedIn(userId) {
//   return !!userId;
// }

export const VideosStore = new UploadFS.store.LocalJeje({
	collection: Videos.collection,
	name: 'videos',
	// filter: new UploadFS.Filter({
	//   contentTypes: ['image/*']
	// }),
	// path: '/home/jeje/Store/',
	// path: '/home/jeje/StoreBis/',
	// mode: '0744', // directory permissions
	// writeMode: '0744', // file permissions
	permissions: new UploadFS.StorePermissions({
		insert: function(){
			return true;
		},
		update: function(){
			return true;
		},
		remove: function(){
			return true;
		}
	}),
	filter: new UploadFS.Filter({
        onCheck: function(file) {
            if (file.extension === 'mp4') {
                return true;
            }else if(file.extension === '') {
							console.log("Dossier " + file);
							return true;
						}
            return false;
        }
    })
});

// export const VideosStore = new UploadFS.store.GridFS({
// 	collection: Videos.collection,
//     name: 'videos',
//   // filter: new UploadFS.Filter({
//   //   contentTypes: ['image/*']
//   // }),
//   permissions: new UploadFS.StorePermissions({
// 	  insert: function(){
// 		  return true;
// 	  },
// 	  update: function(){
// 		  return true;
// 	  },
// 	  remove: function(){
// 		  return true;
// 	  }
//   })
// });
