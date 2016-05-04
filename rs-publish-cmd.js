#!/usr/bin/env node

var ru = require('./run-utils.js');
var vc = require('./version-control.js');

// Dogfood rad-scripts to publish rad-scripts!
try {

    var readme = ru.run_command_sync('rs-update-readme');

    // Note: this will update package.json.
    // It will also push the README.md change we just made.
    ru.run_command_sync_to_console('npm-publish');
}
catch (err) {
    console.log("Error publishing: "+err);
    process.exit(1);
}
