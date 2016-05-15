#!/usr/bin/env node

var fs = require('fs');
var vc = require('./version-control.js');
var ru = require('./run-utils.js');

var rs_publish = function(comment,version) {

    // If there have been code changes, stamp the "next" version into the app.
    if (vc.git_version_valid(version) && ru.git_changes().length > 0) {
        vc.npm_update_version(version);
    }

    // Reinstall, so we get any recently-made changes to usage.
    ru.run_command_sync_to_console('npm install -g');

    // Directly update README.md with usage, whoop
    var readme = ru.run_command_sync('rad');
    var filename = 'README.md';
    fs.writeFileSync(filename, readme,'utf-8');
    console.log(filename + " was updated...");

    // commit + pull + tag + push
    // NOTE that at this point, we will not have changed anything if there were no code changes, so we won't get a commit.
    if (vc.git_sync('.',comment,version)) {

        // There were changes, so let's publish now.
        ru.run_command_sync_to_console('npm publish');
    }
    
    // Reinstall, so we get any recently-made remote changes.
    ru.run_command_sync_to_console('npm install -g');
}

module.exports.rs_publish = rs_publish;
