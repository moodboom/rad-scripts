#!/usr/bin/env node

var fs = require('fs');
var ru = require('./run-utils.js');

// Dogfood rad-scripts to update README.
try {
    // Reinstall, just in case, so we get any recently-made changes to usage.
    ru.run_command_sync_to_console('npm install -g');

    var readme = ru.run_command_sync('rad');
    var filename = 'README.md';
    fs.writeFileSync(filename, readme,'utf-8');
    console.log(filename + " was updated...");
}
catch (err) {
    console.log("readme could not be updated: "+err);
    process.exit(1);
}
