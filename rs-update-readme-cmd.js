#!/usr/bin/env node

var fs = require('fs');
var ru = require('./run-utils.js');

// Dogfood rad-scripts to update README.
try {
    var readme = ru.run_command_sync('rad');
    var filename = 'README.md';
    fs.writeFileSync(filename, readme,'utf-8');
    console.log(filename + " was updated...");
}
catch (err) {
    console.log("readme could not be updated: "+err);
    process.exit(1);
}
