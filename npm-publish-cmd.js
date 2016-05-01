#!/usr/bin/env node

var fs = require('fs');
var ru = require('./run-utils.js');
var vc = require('./version-control.js';

var version = vc.git_version_clean();
console.log('Stamping version ['+version+']...');

try {

    var filename = 'package.json';
    var origversion = fs.readFileSync(filename);
    //   "version": "1.3.0",  ==>    "version": "###git_version_clean###",
    var newversion = origversion.replace(/\"version\".*$/, '\"version\": \"'+version+'\",');
    fs.writeFileSync(filename, newversion);
    console.log(filename + " was updated...");

    ru.run_command_sync_to_console('npm publish');
}
catch (err) {
    console.log("Version could not be updated: "+err);
    process.exit(1);
}
