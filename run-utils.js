#!/usr/bin/env node


import { normalize } from 'path';
import { exec, spawn, execSync } from 'child_process';

// To import spawnargs, we have to do some heavier lifting, because it is a "native" module.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const spawnargs = require('spawn-args');


//=========== run_command_sync_to_console: run one command and let output immediately flow to console ============
export const run_command_sync_to_console = function (cmd) {
  execSync(cmd, { stdio: [0, 1, 2] }, function (error, stdout, stderr) {
    if (error) {
      console.log('======= RUN ERROR =======');
      console.log(error);
      // throw error;
    }
  });
}


//=========== run_command_async_to_console: async run one command and dump output to console when complete ============
export const run_command_async_to_console = function (cmd) {
  exec(cmd, function (error, stdout, stderr) {
    if (stdout.length > 0) console.log(stdout);
    if (stderr.length > 0) console.log(stderr);
  });
}


//=========== run_command_quietly: runs without output unless error ============
export const run_command_quietly = function (cmd) {
  execSync(cmd, function (error, stdout, stderr) {
    if (error) {
      console.log('======= RUN ERROR =======');
      console.log(error);
    }
  });
}


// =========== run_command: run one command and get output ============
// Run a command asynchronously and get the output when it finishes in a callback.
// Usage:
// run_command( "ls -l", function(err,text) { console.log (text) });
export const run_command = function (cmd, callBack) {

  // TODO convert to exec()

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

  var child = spawn(cmd, args);
  // var child = spawn(cmd, args, {stdio: "inherit"});

  var resp = "";
  var errr = "";
  child.stdout.on('data', function (buffer) { resp += buffer.toString() });
  child.stderr.on('data', function (buffer) { errr += buffer.toString() });

  child.stdout.on('end', function () { callBack(errr, resp) });
}


// =========== run_command_sync: run one command and get output ============
// Run a command synchronously and get the output when it finishes.
// Usage:
// var lsout = run_command_sync("ls -l");
export const run_command_sync = function (cmd) {

  return execSync(cmd, function (error, stdout, stderr) {
    if (error) {
      console.log('======= RUN ERROR =======');
      console.log(error);
    }
    if (stderr) {
      console.log('======= RUN stderr =======');
      console.log(stderr);
    }
  }).toString();
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
//		undefined	normal output - the command output is logged to console
//		"verbose"	more output - step name, folder, command output
// Define async to get asynchronous execution.
export const runsteps = function (steps, verbosity, async) {

  steps.forEach(function (step, i) {

    try {

      process.chdir(normalize(step.folder));

      if (async) {

        run_command(step.cmd, function (text) {
          if (verbosity == "verbose") {
            console.log('------------------------------');
            console.log('step: ' + step.name);
            console.log('------------------------------');
            console.log(step.folder + '> ' + step.cmd);
          }
          console.log(text)
        });

      } else if (verbosity != "quiet") {

        if (verbosity == "verbose") {
          console.log('------------------------------');
          console.log('step: ' + step.name);
          console.log('------------------------------');
          console.log(step.folder + '> ' + step.cmd);
        }
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

export const hasArg = (args, a) => args?.some(ar => ar === a);

export const combine_params = function (params, separator = " ") {
  var result = "";
  if (params?.length > 0) {
    params.forEach(function (val, index, array) {
      if (index != 0) { result += separator; }
      result += val;
    });
  }
  return result;
}

export const distro = function () {
  var distroname = run_command_sync('lsb_release -i').split(":")[1].trim().toLowerCase();
  return distroname
}

export const hostname = function () {
  var hostname = run_command_sync('hostname').trim().toLowerCase()
  return hostname
}

export const ping_gw = function () {
  return run_command_sync("ping -q -w 1 -c 1 `ip r | grep default | head -n 1 | cut -d ' ' -f 3` > /dev/null && echo true || echo false")
}
export const ping_google = function () {
  return run_command_sync("ping -q -w 1 -c 1 google.com > /dev/null && echo true || echo false")
}

// This is a sleep for when you are in an async function, called eg:
//  await sleep(500);
// See: https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
export const sleep = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
