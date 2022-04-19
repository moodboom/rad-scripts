#!/usr/bin/env node

// This script defines the top-level command of rad-scripts.
// It requires a second sub-command.
// Type [rad] for usage.
//
// NOTE: Substeps can typically be run directly, via binaries defined in package.json that call the corresponding '-cmd.js' scripts.
// But we always provide access to all available substeps here too, to stay organized, centralized and documented.

import * as ru from './run-utils.js';
import * as su from './string-utils.js';

var args = process.argv.slice(2);

const cmds = [
    { name: 'rad-scripts-sync'          , desc: 'use git-sync from @moodboom/git-semver to commit and publish rad-scripts' },
    { name: 'list-commands'             , desc: 'lists all available commands' },
    { name: 'make-folder'               , desc: '[path] > makes the folder (even if deep), returns true if succeeds or already exists' },
];

const funcs = [
    { name: 'run_command_sync_to_console', desc: 'Run one command and let output immediately flow to console' },
    { name: 'run_command_async_to_console', desc: 'Async run one command and dump output to console when complete' },
    { name: 'run_command_quietly', desc: 'Runs without output unless error' },
    { name: 'run_command', desc: 'Run a command asynchronously and get the output when it finishes in a callback' },
    { name: 'run_command_sync', desc: 'Run a command synchronously and get the output when it finishes' },
    { name: 'runsteps', desc: 'Run a specific set of commands in specific directories' },
    { name: 'combine_params', desc: 'Combine an array of params with separator' },
    { name: 'distro', desc: 'Return distro name from lsb_release' },
    { name: 'hostname', desc: 'Return hostname' },
    { name: 'ping_gw', desc: 'Ping local gateway' },
    { name: 'ping_google', desc: 'Ping google.com' },
    { name: 'cdfolder', desc: 'cd to folder, return false if the folder doesn\'t exist' },
    { name: 'cdfirst', desc: 'change to first found folder from list of candidates' },
    { name: 'make_folder', desc: 'make the given folder (no matter how deep)' },
    { name: 'folder_exists', desc: 'returns true if the folder exists' },
    { name: 'link_exists', desc: 'returns true if the link exists' },
    { name: 'file_exists', desc: 'returns true if the file exists' },
    { name: 'file_diff', desc: 'returns true if the two files differ' },
    { name: 'find_first_folder', desc: 'find and return first existing folder in a list of candidates' },
    { name: 'get_files_in_one_dir', desc: 'non-recursive get files' },
    { name: 'walk', desc: 'gather all files in a folder' },
    { name: 'walksubdirs', desc: 'Similar to previous, but only returns directories not files within them.' },
    { name: 'fileRegexReplace', desc: 'find and replace the given regex in the file' },
    { name: 'fileRegexReplaceMultiline', desc: 'find and replace across lines (gm)' },
    { name: 'string_pad', desc: 'Provide buffer and returns padded string' },
];

for (var i = 0;i < cmds.length;i++) {
    if (args[0] == cmds[i].name && cmds[i].name != 'list-commands') {
        var steps = [{ name: cmds[i].name, folder: '.', cmd: cmds[i].name}];
        ru.runsteps(steps);
    }
}

// Generate usage, including a full app description, as this will be dynamically used to create README.md.  All docs in one place!  Cool.
if (args[0] != 'list-commands') {
    console.log(
        '# rad-scripts\n' +
        'Tools that allow you to easily use Javascript for all your scripting needs.\n\n' +

        'NOTE: previously embedded git semver commands have been moved to the git-semver module.\n' +
        'Install the @moodboom/git-semver module to get that functionality.\n\n' +

        'Common functions and commands:\n'
    );
}
for (var i = 0;i < funcs.length;i++) {
    console.log('* '+su.string_pad('                           ',funcs[i].name)+funcs[i].desc);
}
for (var i = 0;i < cmds.length;i++) {
    console.log('* '+su.string_pad('                           ',cmds[i].name)+cmds[i].desc);
}

// Getting the usage is important in scripts, don't error out.
process.exit(0);
