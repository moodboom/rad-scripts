#!/usr/bin/env node

var fs = require('fs');
var ru = require('./run-utils.js');
var vc = require('./version-control.js');

var version = vc.git_version_clean();
console.log('Stamping version ['+version+']...');

// Dogfood rad-scripts to publish rad-scripts!
try {

    var readme = ru.run_command_sync('rs-update-readme');

    // Note: this will push the README.md change for us.
    ru.run_command_sync_to_console('npm-publish');
}
catch (err) {
    console.log("Error publishing: "+err);
    process.exit(1);
}
