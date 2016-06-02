#!/usr/bin/env node

var fs = require('fs');
var vc = require('./version-control.js');
var ru = require('./run-utils.js');

// You can use this as an example for publishing of your own node packages, as well as any other complex project.
// Here we handle the following stages, it should handle all edge cases related to npm publishing!
//
//      UPDATE VERSION if there were code changes, and stamp it into the app as needed
//      NPM INSTALL to ensure usage is up-to-date
//      UPDATE README via usage
//      SYNC (commit+pull+tag+push)
//      NPM PUBLISH
//      NPM INSTALL to get any remote changes installed
//
// Feel free to leave a comment if you find there's something not handled in this example: 
//      https://bitpost.com/news/category/projects/rad-scripts/
//
var rs_publish = function(argv) {

    var tag_params = vc.parse_tag_parameters(process.argv);
    var comment = tag_params.comment;
    var version = tag_params.next_version;

    // If there have been code changes, stamp the "next" version into the app.
    if (vc.git_version_valid(version) && vc.git_changes('.').length > 0) {
        vc.npm_update_version(version);
    }

    // Quietly reinstall, so we get any recently-made changes to usage.
    ru.run_command_quietly('npm install -g');

    // Directly update README.md with usage, whoop
    var readme = ru.run_command_sync('rad');
    var filename = 'README.md';
    fs.writeFileSync(filename, readme,'utf-8');
    // console.log(filename + " was updated...");

    // commit + pull + tag + push
    // NOTE that at this point, we will not have changed anything if there were no code changes, so we won't get a commit.
    if (vc.git_sync('.',comment,version)) {

        // There were changes, so let's publish now.
        ru.run_command_sync_to_console('npm publish');
    }
    
    // Quietly reinstall, so we get any recently-made remote changes.
    ru.run_command_quietly('npm install -g');
}

module.exports.rs_publish = rs_publish;
