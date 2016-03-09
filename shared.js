#!/usr/bin/env node

var fs = require('fs');

// Example for improving cdfirst
/*
// =========== cdscripts ============
var cdscripts = function () {
    // NOTE that this is the way to get "home", cross-platform, if it is ever needed.
    // var homedir = (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME;

    // we check the list in order, first match wins
    var candidates = 
    [
        'D:/Michael\'s Data/development/scripts',   // WARNING: ALWAYS escape the single quote (even if in double quotes) or node barfs!  FUCKSAKE
        '/home/m/development/scripts',
    ];

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
};
*/

// =========== cdfirst: change to first found folder ============
var cdfirst = function (candidates) {

    // TODO

};


// =========== run_cmd: run one command and get output ============
// Sync version, this is the most useful
// Usage:
// var run = require('./shared.js').run_command_sync;
// var lsout = run( "ls", ["-l"]);
var run_command_sync = function (cmd, args ) {
    var ss = require('child_process').spawnSync;
    var outp = ss(cmd, args, { encoding : 'utf8' });

    // DEBUG
    // console.log(outp.stdout);

    return outp.stdout;

    // From here:
    //  http://stackoverflow.com/questions/32393250/nodejs-child-process-spawnsync-or-child-process-spawn-wrapped-in-yieldable-gener
    // More example cde:
    // var ls = cp.spawnSync('ls', ['-l', '/usr'], { encoding : 'utf8' });
    // uncomment the following if you want to see everything returned by the spawnSync command
    // console.log('ls: ' , ls);
    // console.log('stdout here: \n' + ls.stdout);
}


// sync version; you have to provide a callback function
// Usage:
// run_cmd( "ls", ["-l"], function(text) { console.log (text) });
var run_command = function (cmd, args, callBack ) {

    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";

    child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    child.stdout.on('end', function() { callBack (resp) });
}


// =========== justLogResponse ============
// This function is used to just log a command response,
// swallowing any errors, assuming this is part of a process that should carry on.
// It expects that the standard output of the command includes any necessary carriage returns; ie, none are added.
var justLogResponse = function (error, stdout, stderr) { 
    if (error) { 
        console.log(stdout);
        console.log(stderr);
        console.log("=== SEE ERROR ABOVE ===");
    } else { 
        // We don't use console.log() here because it adds \n.
        process.stdout.write(stdout);
    } 
}    


// =========== svn_last_changed_rev: gets the SVN "last changed rev" for the current folder, as a string ============
var svn_last_changed_rev = function () {

    var run = exports.run_command_sync;

    var svn_info = run("svn", ["info"]);

    // extract the "Last Changed Rev"
    var regx = /^Last Changed Rev: (.*)$/gm;
    var array_result = regx.exec(svn_info);

    // return the first group result ([0] contains the whole result)
    return array_result[1];
}


// =========== svn_rev: gets the SVN current revision for the current repo, as a string ============
var svn_rev = function () {

    var run = exports.run_command_sync;

    var svn_info = run("svn", ["info"]);

    // extract the "Last Changed Rev"
    var regx = /^Revision: (.*)$/gm;
    var array_result = regx.exec(svn_info);

    // return the first group result ([0] contains the whole result)
    return array_result[1];
}



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


// =========== runsteps: run a specific set of commands in specific directories ============
var runsteps = function (candidates,steps,verbosity) {

    // TODO, example follows...
    
    var exec = require('child_process').exec;
    var execSync = require('child_process').execSync;
    var fs = require('fs');
    var shared = require('./shared.js');

    shared.cdbase();
    var logfile = fs.createWriteStream('log.txt');

    var $msbuild = 'C:/Windows/Microsoft.NET/Framework/v4.0.30319/MSBuild.exe';
    var $msbuild2008 = 'C:/Windows/Microsoft.NET/Framework/v3.5/MSBuild.exe';
    var $mstest = '\"D:/Program Files (x86)/Microsoft Visual Studio 10.0/Common7/IDE/MSTest.exe\"';

    var steps = 
    [
        {   name: 'svn get', folder: 'MyCode'                         , cmd: 'svn up'                                                                                      },
    ];

    for (var i = 0;i < steps.length;i++) {

        // SYNCHRONOUS change wd
        // ignore failures until we find one that works
        try {
            console.log('step: ' + steps[i].name);

            shared.cdbase();
            process.chdir(steps[i].folder);
            // console.log(process.cwd());

            // VERBOSE: this shows output as commands execute...
            execSync(steps[i].cmd, {stdio:[0,1,2]}, function(error, stdout, stderr) {
            
            // QUIET: minimal output until an error is hit...
            // execSync(steps[i].cmd, function(error, stdout, stderr) {

                logfile.write('======' + steps[i].name + '======');

                if (error) {
                    logfile.write(stdout);
                    logfile.write(stderr);
                    logfile.write('==================== CI ERROR ====================\n');
                    
                    console.log('======= CI ERROR =======\n');
                    console.log('See log.txt for details.');

                    throw error;
                }

                // Log the details.  No need to bother the user.
                logfile.write(stdout);

            });

        }
        catch (err) {
            // console.log(err);
        }
    }
}

module.exports.cdfirst = cdfirst;
module.exports.run_command_sync = run_command_sync;
module.exports.run_command = run_command;
module.exports.justLogResponse = justLogResponse;
module.exports.svn_last_changed_rev = svn_last_changed_rev;
module.exports.svn_rev = svn_rev;
module.exports.walk = walk;
module.exports.walksubdirs = walksubdirs;
module.exports.runsteps = runsteps;
