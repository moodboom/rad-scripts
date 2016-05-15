#!/usr/bin/env node

var fs = require('fs');
var vc = require('./version-control.js');
var ru = require('./run-utils.js');

var rs_publish = function(comment,version) {

    if (vc.git_version_valid(version))
        vc.npm_update_version(version);

    // Reinstall, so we get any recently-made changes to usage.
    ru.run_command_sync_to_console('npm install -g');

    // Directly update README.md with usage, whoop
    var readme = ru.run_command_sync('rad');
    var filename = 'README.md';
    fs.writeFileSync(filename, readme,'utf-8');
    console.log(filename + " was updated...");

    // commit + pull + tag + push
    vc.git_sync('.',comment,version);

    // npm publish
    ru.run_command_sync_to_console('npm publish');
}

module.exports.rs_publish = rs_publish;
