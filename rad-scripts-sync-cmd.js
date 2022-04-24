#!/usr/bin/env node

import {writeFileSync} from 'fs';
import * as gs from '@moodboom/git-semver'; // ugg, circular, we gonna be ok?  :-)
import { run_command_quietly, run_command_sync, run_command_sync_to_console } from './run-utils.js';

var tag_params = gs.parse_tag_parameters(process.argv);

// callback to STAMP VERSION into module
var rs_stamp_callback_function = function(err, version) {
    if (err) throw err; // Check for the error and throw if it exists.

    gs.npm_update_version(version);

    // Quietly reinstall, so we get any recently-made changes to usage.
    run_command_quietly('npm install -g');

    // Directly update README.md with usage, whoop
    var readme = run_command_sync('rad-scripts');

    // Let's add the version, and the most recent commits, to the readme, for fun.
    // Note that usage will not include this, only the README.md file.
    // But it should be visible on github/npm.
    readme += "\n\nMost recent commits...\n";
    readme += run_command_sync('git-log 4')
    readme += "\nVersion "+version;
    readme += "\n";

    var filename = 'README.md';
    writeFileSync(filename, readme,'utf-8');

};

// SYNC and PUBLISH CHANGES
var changes = gs.git_changes(process.cwd());

gs.git_sync(process.cwd(),tag_params,rs_stamp_callback_function);

if (changes)
{
    // There were changes, so let's publish now.
    run_command_sync_to_console('npm publish');
}

// Quietly reinstall, so we get any recently-made remote changes.
run_command_quietly('npm install -g');
