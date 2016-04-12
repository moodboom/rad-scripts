#!/usr/bin/env node

// =========== run_command: run one command and get output ============
// Run a command synchronously and get the output when it finishes.
// Usage:
// var lsout = run_command_sync( "ls", ["-l"]);
var run_command_sync = function (cmd, args ) {
    var ss = require('child_process').spawnSync;
    var outp = ss(cmd, args, { encoding : 'utf8' });
    return outp.stdout;

    // From here:
    //  http://stackoverflow.com/questions/32393250/nodejs-child-process-spawnsync-or-child-process-spawn-wrapped-in-yieldable-gener
    // More example cde:
    // var ls = cp.spawnSync('ls', ['-l', '/usr'], { encoding : 'utf8' });
    // uncomment the following if you want to see everything returned by the spawnSync command
    // console.log('ls: ' , ls);
    // console.log('stdout here: \n' + ls.stdout);
}


//=========== run_command_sync_to_console: run one command and let output immediately flow to console ============
var run_command_sync_to_console = function (cmd) {
    var execSync = require('child_process').execSync;
    execSync(cmd, {stdio:[0,1,2]}, function(error, stdout, stderr) {
        if (error) {
            console.log('======= RUN ERROR =======');
            throw error;
        }
    });
}


//=========== run_command_quietly: runs without output unless error ============
var run_command_quietly = function (cmd) {
    var execSync = require('child_process').execSync;
    execSync(cmd, function(error, stdout, stderr) {
        if (error) {
            console.log('======= RUN ERROR =======');
            throw error;
        }
    });
}


// =========== run_command: run one command and get output ============
// Run a command asynchronously and get the output when it finishes in a callback.
// Usage:
// run_cmd( "ls", ["-l"], function(text) { console.log (text) });
var run_command = function (cmd, args, callBack ) {

    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";

    child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    child.stdout.on('end', function() { callBack (resp) });
}


// =========== runsteps: run a specific set of commands in specific directories ============
// Given: steps, an array of {name,folder,cmd} objects, eg:
//
//      var my_steps =
//      [
//          { name: 'update Project'        , folder: '.'       , cmd: 'git pull'       },
//          { name: 'build Project'         , folder: '.'       , cmd: 'make'           },
//      ];
//
// This function runs the requested steps synchronously, logging output to console as it goes.
// Verbosity can be:
//		"quiet"		no output
//		undefined	normal output - the step name and command output are logged to console
//		"verbose"	more output - step name, folder, command output
var runsteps = function (steps,verbosity) {

    var exec = require('child_process').exec;
    var execSync = require('child_process').execSync;
    var fs = require('fs');
    var path = require('path');

    for (var i = 0;i < steps.length;i++) {

        try {
        	
        	if (verbosity != "quiet") {
                console.log('step: ' + steps[i].name);
        	}
            if (verbosity == "verbose") {
                console.log('cd: ' + process.cwd());
            }

            process.chdir(path.normalize(steps[i].folder));
            
        	if (verbosity != "quiet") {
        		run_command_sync_to_console(steps[i].cmd);
        	} else {
        		run_command_quietly(steps[i].cmd);
        	}
        }
        catch (err) {
            if (verbosity == "verbose") {
            	console.log(err);
            }
        }
    }
}

var combine_params = function(params) {
    var result = "";
    if (params.length > 0)
    {
        params.forEach(function(val,index,array){
            if (index != 0) { result += " "; }
            result += val;
        });
    }
    return result;
}


module.exports.run_command_sync = run_command_sync;
module.exports.run_command_sync_to_console = run_command_sync_to_console;
module.exports.run_command_quietly = run_command_quietly; 
module.exports.run_command = run_command;
module.exports.runsteps = runsteps;
module.exports.combine_params = combine_params;
