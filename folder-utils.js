#!/usr/bin/env node

var fs = require('fs');


// =========== cdfirst: change to first found folder ============
var cdfirst = function (candidates) {

    // NOTE that this is the way to get "home", cross-platform, if it is ever needed.
    // var homedir = (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME;

    for (var i = 0;i < candidates.length;i++) {

        // SYNCHRONOUS change wd
        // ignore failures until we find one that works
        try {
            process.chdir(candidates[i]);
            return process.cwd();
        }
        catch (err) {
        }
    }

    var msg = "ERROR: No candidate folder found";
    console.log(msg);
    return msg;
};


// =========== walk: gather all files in a folder ============
// TODO node-dir is probably more robust/feature-filled, check it out!
var path = require('path');
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

// Similar to previous, but only returns directories not files within them.
var walksubdirs = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          results.push(file);
          walksubdirs(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (!--pending) done(null, results);
        }
      });
    });
  });
};


module.exports.cdfirst = cdfirst;
module.exports.walk = walk;
module.exports.walksubdirs = walksubdirs;
