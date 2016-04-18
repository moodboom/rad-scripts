#!/usr/bin/env node


var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

// MDM NOTE that node v0.12 or higher is required for this.
var execSync = require('child_process').execSync;
var spawnSync = require('child_process').spawnSync;

var spawnargs = require('spawn-args');


//=========== run_command_sync_to_console: run one command and let output immediately flow to console ============
var run_command_sync_to_console = function (cmd) {
    execSync(cmd, {stdio:[0,1,2]}, function(error, stdout, stderr) {
        if (error) {
            console.log('======= RUN ERROR =======');
            throw error;
        }
    });
}


//=========== run_command_async_to_console: async run one command and dump output to console when complete ============
var run_command_async_to_console = function (cmd) {
    exec(cmd, function(error, stdout, stderr) {
        if (stdout.length > 0 ) console.log(stdout);
        if (stderr.length > 0 ) console.log(stderr);
    });
}


//=========== run_command_quietly: runs without output unless error ============
var run_command_quietly = function (cmd) {
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
// run_command( "ls -l", function(text) { console.log (text) });
var run_command = function (cmd, callBack ) {

    var fullargs = spawnargs(cmd);
    cmd = fullargs[0];
    var args = fullargs.slice(1);

    // DEBUG this works!
    // var args = ["status"];
    // cmd = "git";

    // DEBUG this works!
    // cmd = "git";
    // var args = ["commit","-a","-m",'"synctrouble"'];

    // DEBUG:
    // console.log('cmd args: ' + cmd + ' ----- ' + args);

    var spawn = require('child_process').spawn;

    var child = spawn(cmd, args);
    // var child = spawn(cmd, args, {stdio: "inherit"});

    var resp = "";
    child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    child.stderr.on('data', function (buffer) { resp += 'ERROR: ' + buffer.toString() });

    child.stdout.on('end', function() { callBack (resp) });
}


// =========== run_command_sync: run one command and get output ============
// Run a command synchronously and get the output when it finishes.
// Usage:
// var lsout = run_command_sync( "ls", ["-l"]);
var run_command_sync = function (cmd) {

    var fullargs = spawnargs(cmd);
    cmd = fullargs[0];
    var args = fullargs.slice(1);

    var spawnSync = require('child_process').spawnSync;
    var outp = spawnSync(cmd, args, { encoding : 'utf8' });
    return outp.stdout;

    // From here:
    //  http://stackoverflow.com/questions/32393250/nodejs-child-process-spawnsync-or-child-process-spawn-wrapped-in-yieldable-gener
    // More example cde:
    // var ls = cp.spawnSync('ls', ['-l', '/usr'], { encoding : 'utf8' });
    // uncomment the following if you want to see everything returned by the spawnSync command
    // console.log('ls: ' , ls);
    // console.log('stdout here: \n' + ls.stdout);
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
// This function runs the requested steps.
// Verbosity can be:
//		"quiet"		no output
//		undefined	normal output - the step name and command output are logged to console
//		"verbose"	more output - step name, folder, command output
// Define async to get asynchronous execution.
var runsteps = function (steps,verbosity,async) {

    var path = require('path');

    steps.forEach(function(step,i) {
    // for (var i = 0;i < steps.length;i++) {

        try {

        	if (verbosity != "quiet") {
                console.log('step: ' + step.name);
        	}
            if (verbosity == "verbose") {
                console.log('cd: ' + process.cwd());
            }

            process.chdir(path.normalize(step.folder));

            if (async) {

                run_command(step.cmd, function(text) {
                    console.log ('------------------------------');
                    console.log(step.folder);
                    console.log ('------------------------------');
                    console.log (text)
                });

                // Workaround during testing
                // run_command_async_to_console(steps[i].cmd);

            } else if (verbosity != "quiet") {
        		run_command_sync_to_console(step.cmd);
        	} else {
        		run_command_quietly(step.cmd);
        	}
        }
        catch (err) {
            if (verbosity == "verbose") {
            	console.log(err);
            }
        }
    });
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
module.exports.run_command_async_to_console = run_command_async_to_console;
module.exports.run_command_quietly = run_command_quietly;
module.exports.run_command = run_command;
module.exports.runsteps = runsteps;
module.exports.combine_params = combine_params;
