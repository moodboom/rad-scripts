#!/usr/bin/env node

var fs = require('fs');
var vc = require('./version-control.js');
var ru = require('./run-utils.js');

var tag_params = vc.parse_tag_parameters(process.argv);

// callback to STAMP VERSION into module
var rs_stamp_callback_function = function(err, version) {
    if (err) throw err; // Check for the error and throw if it exists.

    vc.npm_update_version(version);
    console.log(version);

    // Quietly reinstall, so we get any recently-made changes to usage.
    ru.run_command_quietly('npm install -g');

    // Directly update README.md with usage, whoop
    var readme = ru.run_command_sync('rad');

    // Let's add the version, and the most recent commits, to the readme, for fun.
    // Note that usage will not include this, only the README.md file.
    // But it should be visible on github/npm.
    readme += "Most recent commits...\n";
    readme += ru.run_command_sync('git-log 4')
    readme += "\nVersion "+version;
    readme += "\n";
    console.log(version);

    var filename = 'README.md';
    fs.writeFileSync(filename, readme,'utf-8');

};

// SYNC and PUBLISH CHANGES
var changes = vc.git_changes(process.cwd());

vc.git_sync(process.cwd(),tag_params,rs_stamp_callback_function);

if (changes)
{
    // There were changes, so let's publish now.
    ru.run_command_sync_to_console('npm publish');
}

// Quietly reinstall, so we get any recently-made remote changes.
ru.run_command_quietly('npm install -g');
