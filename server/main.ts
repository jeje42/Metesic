import { Meteor } from 'meteor/meteor';
//import { Loggly} from

import { loadParties } from './imports/fixtures/parties';
import { searchVideos, updateVideosUrls, checkIndexesVideosMeta } from './imports/fixtures/videos';
import { initPlayerPlayList } from './imports/fixtures/playlists';
import { insertFile } from './imports/fixtures/videosImport';
import { initAdmin } from './imports/fixtures/user-admin';


import '../both/methods/folders.methods';
import '../both/methods/parties.methods';


import './imports/publications/categories';
import './imports/publications/folders';
import './imports/publications/images';
import './imports/publications/parties';
import './imports/publications/playlists';
import './imports/publications/users';
import './imports/publications/videos';
import './imports/publications/videosMeta';

function initLogger() {
	let winston = Npm.require('winston');
	// logger = new (winston.Logger)({
  //   transports: [
  //     new (winston.transports.Console)({'timestamp':true})
  //   ]
	// });
	logger = new (winston.Logger)({
	  transports: [
	    new (winston.transports.Console)({ json: true, timestamp: true }),
	    new winston.transports.File({ filename: Meteor.settings.winston.transports, json: true, timestamp: true })
	  ],
	  exceptionHandlers: [
	    new (winston.transports.Console)({ json: true, timestamp: true }),
	    new winston.transports.File({ filename: Meteor.settings.winston.exceptionHandlers, json: true, timestamp: true })
	  ],
	  exitOnError: false
	});

	const log4js = Npm.require('log4js');
	// log4js.configure({
	//   "appenders": { "doudou": { "type": "file", "filename": "doudou.log" } }
	//   // categories: { default: { appenders: ['cheese'], level: 'error' } }
	// });

	// log4js.configure({
  //   appenders: [
  //       { type: 'console' },
  //       { type: 'file', filename: 'doudou.log', category: 'cheese' }
  //   ]
	// });

	// var log4js = log4js.getLogger();
	// logger = log4js.getLogger();
	// //logger.level = 'debug';

}


Meteor.startup(() => {
	var Future = Npm.require('fibers/future');
	checkIndexesVideosMeta();
	// initLogger();
	// loadParties();
	searchVideos();
	// updateVideosUrls();
	initPlayerPlayList();
	insertFile();
	initAdmin();
});
