#!/usr/bin/env node

var fs = require('fs');
var minimatch = require("minimatch");


//=========== exists: cd to folder, return false if the folder doesn't exist ============
var cdfolder = function (folder) {

    // SYNCHRONOUS change wd and catch any error
    try {
        process.chdir(folder);
        return process.cwd();
    }
    catch (err) {
        return false;
    }
}

// =========== cdfirst: change to first found folder ============
var cdfirst = function (candidates) {

    // NOTE that this is the way to get "home", cross-platform, if it is ever needed.
    // var homedir = (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME;

    for (var i = 0;i < candidates.length;i++) {

        // ignore failures until we find one that works
        if (cdfolder(candidates[i])) {
          return process.cwd();
        }
    }

    var msg = "ERROR: No candidate folder found";
    console.log(msg);
    return msg;
};


// ========== make_folder : make the given folder (no matter how deep) =========
var make_folder = function (target_path) {

  // We will catch EEXIST exceptions so we can return true if it already exists.
  try {

      const path = require('path');
      const sep = path.sep;
      const initDir = path.isAbsolute(target_path) ? sep : '';
      target_path.split(sep).reduce((parentDir, childDir) => {
          const curDir = path.resolve(parentDir, childDir);
          if (!fs.existsSync(curDir)) {
              fs.mkdirSync(curDir);
          }
          return curDir;
      }, initDir);

  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}

//=========== folder_exists: returns true if the folder or file exists ============
var folder_exists = function (folder) {
    try {
        return fs.statSync(folder).isDirectory();
    }
    catch (err) {
        return false;
    }
}

//=========== file_exists: returns true if the file exists ============
var file_exists = function (file) {
    try {
        return fs.statSync(file).isFile();
    }
    catch (err) {
        return false;
    }
}

// =========== find_first_folder: find and return first existing folder in a list of candidates ============
var find_first_folder = function (candidates) {

    for (var i = 0;i < candidates.length;i++) {
        if (folder_exists(candidates[i])) {
          return candidates[i];
        }
    }

    var msg = "ERROR: No candidate folder found";
    console.log(msg);
    return msg;
};


function get_files_in_one_dir (dir, pattern, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        // ODD CASE: Avoid non-owned properties, in case the base array definition has been extended.
        // NOTE We found that we needed this because we typically extend arrays to enable in-place array addition.
        // http://stackoverflow.com/questions/1374126/how-to-extend-an-existing-javascript-array-with-another-array-without-creating
        if (files.hasOwnProperty(i)) {      
          var name = dir + '/' + files[i];
          if (!fs.statSync(name).isDirectory()){
              if (minimatch(files[i],pattern)) {
                files_.push(name);
              }
          }
        }
    }
    return files_;
}


// =========== walk: gather all files in a folder ============
// TODO node-dir is probably more robust/feature-filled, check it out!
var path = require('path');
var walk = function(dir,pattern,done) {
  var results = [];


  // console.log(dir);


  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, pattern, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {

          if (!pattern || minimatch(file,pattern)) {
            results.push(file);
          }
          
          // console.log(file);

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


module.exports.cdfolder = cdfolder;
module.exports.cdfirst = cdfirst;
module.exports.make_folder = make_folder;
module.exports.folder_exists = folder_exists;
module.exports.file_exists = file_exists;
module.exports.find_first_folder = find_first_folder;
module.exports.get_files_in_one_dir = get_files_in_one_dir;
module.exports.walk = walk;
module.exports.walksubdirs = walksubdirs;
