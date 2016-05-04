#!/usr/bin/env node

var fs = require('fs');
var ru = require('./run-utils.js');
var vc = require('./version-control.js');

// TODO move this to a function in vc, and call it from here

try {

    // Get a "clean" version (no build suffix).
    // We want an npm-compatible true semantic version.
    // (plus we don't want it to change when we commit a package.json change, below)
    var version = vc.git_version_clean();
    console.log('Stamping version ['+version+']...');

    var filename = 'package.json';
    var origversion = fs.readFileSync(filename,'utf-8');
    //   "version": "1.3.0",  ==>    "version": "###git_version_clean###",
    var newversion = origversion.replace(/\"version\".*/, '\"version\": \"'+version+'\",');
    fs.writeFileSync(filename, newversion,'utf-8');
    console.log(filename + " was updated...");

    // Push the package.json change.
    ru.run_command_sync_to_console('git-sync auto-update of package.json');

    // Publish.
    ru.run_command_sync_to_console('npm publish');
}
catch (err) {
    console.log("Version could not be updated: "+err);
    process.exit(1);
}
