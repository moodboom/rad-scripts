#!/usr/bin/env node

// =========== run_command: run one command and get output ============
// Run a command and get the output.
// Sync version, this is the most useful.
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


// =========== run_command: run one command and get output ============
// Run a command and get the output.
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
var run_command_fire_and_forget = function (error, stdout, stderr) { 
    if (error) { 
        console.log(stdout);
        console.log(stderr);
        console.log("=== SEE ERROR ABOVE ===");
    } else { 
        // We don't use console.log() here because it adds \n.
        process.stdout.write(stdout);
    } 
}    


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
module.exports.run_command = run_command;
module.exports.run_command_fire_and_forget = run_command_fire_and_forget;
module.exports.runsteps = runsteps;
module.exports.combine_params = combine_params;
