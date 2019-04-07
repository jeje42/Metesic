/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Karl STEIN
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
import {_} from "meteor/underscore";
import {Meteor} from "meteor/meteor";
import {WebApp} from "meteor/webapp";
import {UploadFS} from "./ufs";


if (Meteor.isServer) {

    const domain = Npm.require('domain');
    const fs = Npm.require('fs');
    const http = Npm.require('http');
    const https = Npm.require('https');
    const mkdirp = Npm.require('mkdirp');
    const stream = Npm.require('stream');
    const URL = Npm.require('url');
    const zlib = Npm.require('zlib');


    Meteor.startup(() => {
        let path = UploadFS.config.tmpDir;
        let mode = UploadFS.config.tmpDirPermissions;

        fs.stat(path, (err) => {
            if (err) {
                // Create the temp directory
                mkdirp(path, {mode: mode}, (err) => {
                    if (err) {
                        console.error(`ufs: cannot create temp directory at "${path}" (${err.message})`);
                    } else {
                        console.log(`ufs: temp directory created at "${path}"`);
                    }
                });
            } else {
                // Set directory permissions
                fs.chmod(path, mode, (err) => {
                    err && console.error(`ufs: cannot set temp directory permissions ${mode} (${err.message})`);
                });
            }
        });
    });

    // Create domain to handle errors
    // and possibly avoid server crashes.
    let d = domain.create();

    d.on('error', (err) => {
        console.error('ufs: ' + err.message);
    });

    var checkTokens = function(req){
      if(req.url.indexOf('?') != -1){
        var params = req.url.substring(req.url.indexOf('?')+1)
        req.url = req.url.substring(0, req.url.indexOf('?'))

        var paramsArray = params.split('&')
        if(paramsArray){
          var userId = undefined
          var loginToken = undefined
          paramsArray.forEach(param => {
            var keyValue = param.split("=")
            if("userId" == keyValue[0]){
              userId = keyValue[1]
            }else if("loginToken" == keyValue[0]){
              loginToken = keyValue[1]
            }
          })

          if(userId && loginToken){
            var user = Meteor.users.findOne({'_id': userId, 'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(loginToken)})
            if(user != undefined){
              return true
            }
          }
        }

        return false
      }
    }

    // Listen HTTP requests to serve files
    WebApp.connectHandlers.use((req, res, next) => {
        // Quick check to see if request should be catch
        if (req.url.indexOf(UploadFS.config.storesPath) === -1) {
            next();
            return;
        }

        // Remove store path
        let parsedUrl = URL.parse(req.url);
        let path = parsedUrl.pathname.substr(UploadFS.config.storesPath.length + 1);

        let allowCORS = () => {
            // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            res.setHeader("Access-Control-Allow-Methods", "POST");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        };

        if (req.method === "OPTIONS") {
            let regExp = new RegExp('^\/([^\/\?]+)\/([^\/\?]+)$');
            let match = regExp.exec(path);

            // Request is not valid
            if (match === null) {
                res.writeHead(400);
                res.end();
                return;
            }

            // Get store
            let store = UploadFS.getStore(match[1]);
            if (!store) {
                res.writeHead(404);
                res.end();
                return;
            }

            // If a store is found, go ahead and allow the origin
            allowCORS();

            next();
        }
        else if (req.method === 'POST') {
            // Get store
            let regExp = new RegExp('^\/([^\/\?]+)\/([^\/\?]+)$');
            let match = regExp.exec(path);

            // Request is not valid
            if (match === null) {
                res.writeHead(400);
                res.end();
                return;
            }

            // Get store
            let store = UploadFS.getStore(match[1]);
            if (!store) {
                res.writeHead(404);
                res.end();
                return;
            }

            // If a store is found, go ahead and allow the origin
            allowCORS();

            // Get file
            let fileId = match[2];
            if (store.getCollection().find({_id: fileId}).count() === 0) {
                res.writeHead(404);
                res.end();
                return;
            }

            // Check upload token
            if (!store.checkToken(req.query.token, fileId)) {
                res.writeHead(403);
                res.end();
                return;
            }

            let tmpFile = UploadFS.getTempFilePath(fileId);
            let ws = fs.createWriteStream(tmpFile, {flags: 'a'});
            let fields = {uploading: true};
            let progress = parseFloat(req.query.progress);
            if (!isNaN(progress) && progress > 0) {
                fields.progress = Math.min(progress, 1);
            }

            req.on('data', (chunk) => {
                ws.write(chunk);
            });
            req.on('error', (err) => {
                res.writeHead(500);
                res.end();
            });
            req.on('end', Meteor.bindEnvironment(() => {
                // Update completed state without triggering hooks
                store.getCollection().direct.update({_id: fileId}, {$set: fields});
                ws.end();
            }));
            ws.on('error', (err) => {
                console.error(`ufs: cannot write chunk of file "${fileId}" (${err.message})`);
                fs.unlink(tmpFile, (err) => {
                    err && console.error(`ufs: cannot delete temp file "${tmpFile}" (${err.message})`);
                });
                res.writeHead(500);
                res.end();
            });
            ws.on('finish', () => {
                res.writeHead(204, {"Content-Type": 'text/plain'});
                res.end();
            });
        }
        else if (req.method == 'GET') {
            if(!checkTokens(req)){
              res.writeHead(400);
              res.end();
              return;
            }
            // Get store, file Id and file name
            let regExp = new RegExp('^\/([^\/\?]+)\/([^\/\?]+)(?:\/([^\/\?]+))?$');
            let match = regExp.exec(path);

            // Avoid 504 Gateway timeout error
            // if file is not handled by UploadFS.
            if (match === null) {
                next();
                return;
            }

            // Get store
            const storeName = match[1];
            const store = UploadFS.getStore(storeName);

            if (!store) {
                res.writeHead(404);
                res.end();
                return;
            }

            if (store.onRead !== null && store.onRead !== undefined && typeof store.onRead !== 'function') {
                console.error(`ufs: Store.onRead is not a function in store "${storeName}"`);
                res.writeHead(500);
                res.end();
                return;
            }

            // Remove file extension from file Id
            let index = match[2].indexOf('.');
            let fileId = index !== -1 ? match[2].substr(0, index) : match[2];

            // Get file from database
            const file = store.getCollection().findOne({_id: fileId});
            if (!file) {
                res.writeHead(404);
                res.end();
                return;
            }

            // Simulate read speed
            if (UploadFS.config.simulateReadDelay) {
                Meteor._sleepForMs(UploadFS.config.simulateReadDelay);
            }

            d.run(() => {
                // Check if the file can be accessed
                if (store.onRead.call(store, fileId, file, req, res) !== false) {
                    let options = {};
                    let status = 200;

                    // Prepare response headers
                    let headers = {
                        'Content-Type': file.type,
                        'Content-Length': file.size
                    };

                    // Add ETag header
                    if (typeof file.etag === 'string') {
                        headers['ETag'] = file.etag;
                    }

                    // Add Last-Modified header
                    if (file.modifiedAt instanceof Date) {
                        headers['Last-Modified'] = file.modifiedAt.toUTCString();
                    }
                    else if (file.uploadedAt instanceof Date) {
                        headers['Last-Modified'] = file.uploadedAt.toUTCString();
                    }

                    // Parse request headers
                    if (typeof req.headers === 'object') {

                        // Compare ETag
                        if (req.headers['if-none-match']) {
                            if (file.etag === req.headers['if-none-match']) {
                                res.writeHead(304); // Not Modified
                                res.end();
                                return;
                            }
                        }

                        // Compare file modification date
                        if (req.headers['if-modified-since']) {
                            const modifiedSince = new Date(req.headers['if-modified-since']);

                            if ((file.modifiedAt instanceof Date && file.modifiedAt > modifiedSince)
                                || file.uploadedAt instanceof Date && file.uploadedAt > modifiedSince) {
                                res.writeHead(304); // Not Modified
                                res.end();
                                return;
                            }
                        }

                        // Send data in range
                        if (typeof req.headers.range === 'string') {
                            let range = req.headers.range;

                            // Range is not valid
                            if (!range) {
                                res.writeHead(416);
                                res.end();
                                return;
                            }

                            let positions = range.replace(/bytes=/, '').split('-');
                            let start = parseInt(positions[0], 10);
                            let total = file.size;
                            let end = positions[1] ? parseInt(positions[1], 10) : total - 1;

                            // Update headers
                            headers['Content-Range'] = `bytes ${start}-${end}/${total}`;
                            headers['Accept-Ranges'] = `bytes`;
                            headers['Content-Length'] = (end - start) + 1;

                            status = 206; // partial content
                            options.start = start;
                            options.end = end;
                        }
                    }

                    // Open the file stream
                    let rs = store.getReadStream(fileId, file, options);
                    let ws = new stream.PassThrough();

                    rs.on('error', Meteor.bindEnvironment((err) => {
                        store.onReadError.call(store, err, fileId, file);
                        res.end();
                    }));
                    ws.on('error', Meteor.bindEnvironment((err) => {
                        store.onReadError.call(store, err, fileId, file);
                        res.end();
                    }));
                    ws.on('close', () => {
                        // Close output stream at the end
                        ws.emit('end');
                    });

                    // Transform stream
                    store.transformRead(rs, ws, fileId, file, req, headers);

                    // Parse request headers
                    if (typeof req.headers === 'object') {
                        // Compress data using if needed (ignore audio/video as they are already compressed)
                        if (typeof req.headers['accept-encoding'] === 'string' && !/^(audio|video)/.test(file.type)) {
                            let accept = req.headers['accept-encoding'];

                            // Compress with gzip
                            if (accept.match(/\bgzip\b/)) {
                                headers['Content-Encoding'] = 'gzip';
                                delete headers['Content-Length'];
                                res.writeHead(status, headers);
                                ws.pipe(zlib.createGzip()).pipe(res);
                                return;
                            }
                            // Compress with deflate
                            else if (accept.match(/\bdeflate\b/)) {
                                headers['Content-Encoding'] = 'deflate';
                                delete headers['Content-Length'];
                                res.writeHead(status, headers);
                                ws.pipe(zlib.createDeflate()).pipe(res);
                                return;
                            }
                        }
                    }

                    // Send raw data
                    if (!headers['Content-Encoding']) {
                        res.writeHead(status, headers);
                        ws.pipe(res);
                    }

                } else {
                    res.end();
                }
            });
        } else {
            next();
        }
    });
}
