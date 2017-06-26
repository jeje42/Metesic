import {_} from 'meteor/underscore';
import {check} from 'meteor/check';
import {Meteor} from 'meteor/meteor';

/**
 * File system store
 * @param options
 * @constructor
 */
UploadFS.store.LocalJeje = function (options) {
    // Default options
    options = _.extend({
        mode: '0744',
        path: 'ufs/uploads',
        writeMode: '0744'
    }, options);

    // Check options
    if (typeof options.mode !== 'string') {
        throw new TypeError('mode is not a string');
    }
    if (typeof options.path !== 'string') {
        throw new TypeError('path is not a string');
    }
    if (typeof options.writeMode !== 'string') {
        throw new TypeError('writeMode is not a string');
    }

    // Private attributes
    let mode = options.mode;
    let path = options.path;
    let writeMode = options.writeMode;

    if (Meteor.isServer) {
        const fs = Npm.require('fs');

        fs.stat(path, function (err) {
            if (err) {
                const mkdirp = Npm.require('mkdirp');

                // Create the directory
                mkdirp(path, {mode: mode}, function (err) {
                    if (err) {
                        console.error('ufs: cannot create store at ' + path + ' (' + err.message + ')');
                    } else {
                        console.info('ufs: store created at ' + path);
                    }
                });
            } else {
                // Set directory permissions
                fs.chmod(path, mode, function (err) {
                    err && console.error('ufs: cannot set store permissions ' + mode + ' (' + err.message + ')');
                });
            }
        });
    }

    // Create the store
    let self = new UploadFS.Store(options);

    /**
     * Returns the file path
     * @param fileId
     * @param file
     * @return {string}
     */
    self.getFilePath = function (fileId, file) {
        file = file || self.getCollection().findOne(fileId, {fields: {extension: 1}});
        return file.path;
    };

    /**
     * Returns the path or sub path
     * @param file
     * @return {string}
     */
    self.getPath = function (file) {
      return path + (file ? '/' + file : '');
    };


    if (Meteor.isServer) {
      /**
       * Writes the file to the store
       * @param rs
       * @param fileId
       * @param callback
       */
      self.write = function (rs, fileId, callback) {
          console.log("Call to self.write ! ");
          let file = self.getCollection().findOne({_id: fileId});
          let ws = self.getWriteStream(fileId, file);

          let errorHandler = Meteor.bindEnvironment(function (err) {
              self.getCollection().remove({_id: fileId});
              self.onWriteError.call(self, err, fileId, file);
              callback.call(self, err);
          });

          ws.on('error', errorHandler);
          ws.on('finish', Meteor.bindEnvironment(function () {
              let size = 0;
              let readStream = self.getReadStream(fileId, file);

              readStream.on('error', Meteor.bindEnvironment(function (error) {
                  callback.call(self, error, null);
              }));
              readStream.on('data', Meteor.bindEnvironment(function (data) {
                  size += data.length;
              }));
              readStream.on('end', Meteor.bindEnvironment(function () {
                  // Set file attribute
                  file.complete = true;
                  file.etag = UploadFS.generateEtag();
                  file.path = self.getFileRelativeURL(fileId);
                  file.progress = 1;
                  file.size = size;
                  file.token = self.generateToken();
                  file.uploading = false;
                  file.uploadedAt = new Date();
                  file.url = self.getFileURL(fileId);

                  // Sets the file URL when file transfer is complete,
                  // this way, the image will loads entirely.
                  self.getCollection().direct.update({_id: fileId}, {
                      $set: {
                          complete: file.complete,
                          etag: file.etag,
                          path: file.path,
                          progress: file.progress,
                          size: file.size,
                          token: file.token,
                          uploading: file.uploading,
                          uploadedAt: file.uploadedAt,
                          url: file.url
                      }
                  });

                  // Return file info
                  callback.call(self, null, file);

                  // Execute callback
                  if (typeof self.onFinishUpload == 'function') {
                      self.onFinishUpload.call(self, file);
                  }

                  // Simulate write speed
                  if (UploadFS.config.simulateWriteDelay) {
                      Meteor._sleepForMs(UploadFS.config.simulateWriteDelay);
                  }

                  // Copy file to other stores
                  if (self.options.copyTo instanceof Array) {
                      for (let i = 0; i < self.options.copyTo.length; i += 1) {
                          let store = self.options.copyTo[i];

                          if (!store.getFilter() || store.getFilter().isValid(file)) {
                              self.copy(fileId, store);
                          }
                      }
                  }
              }));
          }));

          // Execute transformation
          self.transformWrite(rs, ws, fileId, file);
      };

        /**
         * Removes the file
         * @param fileId
         * @param callback
         */
        self.delete = function (fileId, callback) {
            let path = self.getFilePath(fileId);

            if (typeof callback !== 'function') {
                callback = function (err) {
                    err && console.error('ufs: cannot delete file "' + fileId + '" at ' + path + ' (' + err.message + ')');
                }
            }
            const fs = Npm.require('fs');
            fs.stat(path, Meteor.bindEnvironment(function (err, stat) {
                if (!err && stat && stat.isFile()) {
                    fs.unlink(path, Meteor.bindEnvironment(function () {
                        self.getCollection().remove(fileId);
                        callback.call(this);
                    }));
                }
            }));
        };

        /**
         * Returns the file read stream
         * @param fileId
         * @param file
         * @param options
         * @return {*}
         */
        self.getReadStream = function (fileId, file, options) {
            const fs = Npm.require('fs');
            options = _.extend({}, options);
            return fs.createReadStream(self.getFilePath(fileId, file), {
                flags: 'r',
                encoding: null,
                autoClose: true,
                start: options.start,
                end: options.end
            });
        };

        /**
         * Returns the file write stream
         * @param fileId
         * @param file
         * @param options
         * @return {*}
         */
        self.getWriteStream = function (fileId, file, options) {
            const fs = Npm.require('fs');
            options = _.extend({}, options);
            return fs.createWriteStream(self.getFilePath(fileId, file), {
                flags: 'a',
                encoding: null,
                mode: writeMode,
                start: options.start
            });
        };
    }

    return self;
};
