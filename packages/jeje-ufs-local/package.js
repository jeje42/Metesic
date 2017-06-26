Package.describe({
  name: 'jeje-ufs-local',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.4.1');
  api.use('check@1.2.1');
  api.use('ecmascript');
  api.use('jeje-ufs@0.0.1');
  api.use('underscore@1.0.8');

  api.addFiles('jeje-ufs-local.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('jeje-ufs-local');
  api.mainModule('jeje-ufs-local-tests.js');
});

Npm.depends({
  mkdirp: '0.3.5'
});
