import { Meteor } from 'meteor/meteor';

import { loadCategories } from './imports/fixtures/categories';
import { searchVideos, updateVideosUrls, checkIndexesVideosMeta } from './imports/fixtures/videos';
import { initPlayerPlayList } from './imports/fixtures/playlists';
import { initAdmin } from './imports/fixtures/user-admin';
import { initLdap } from './imports/fixtures/ldap';
import { initSettings } from './imports/fixtures/settings';

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
import './imports/publications/treatments';
import './imports/publications/settings';


function initLogger() {
	const { createLogger, format, transports } = Npm.require('winston')
	const path = Npm.require('path');

	logger = createLogger({
	  level: 'debug',
	  format: format.combine(
	    format.label({ label: path.basename(process.mainModule.filename) }),
	    format.colorize(),
	    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	    format.printf(
	      info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
	    )
	  ),
	  transports: [
	    new transports.Console(),
	    new transports.File({
	      // filename: __dirname + '/../logs/errors.log',
				filename: '/tmp/metesic.info',
	      level: 'info'
	    }),
			new transports.File({
	      // filename: __dirname + '/../logs/errors.log',
				filename: '/tmp/metesic.error',
	      level: 'error'
	    })
	  ]
	});
}


Meteor.startup(() => {
	loadCategories()
	checkIndexesVideosMeta()
	initLogger()
	// loadParties()
	searchVideos()
	// updateVideosUrls()
	initPlayerPlayList()
	initAdmin()
	initLdap()
	initSettings()
});
