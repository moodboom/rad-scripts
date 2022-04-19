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

var cmds = [
    { name: 'rad-scripts-sync'          , desc: '> use git-sync from @moodboom/git-semver to commit and publish rad-scripts'   },
    { name: 'list-commands'             , desc: '> lists all available commands'   },
    { name: 'make-folder'               , desc: '[path] > makes the folder (even if deep), returns true if succeeds or already exists'    },
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
        'Install the git-semver module instead of this to get that functionality.\n\n' +

        'Common commands:\n'
    );
}
for (var i = 0;i < cmds.length;i++) {
    console.log('* '+su.string_pad('                           ',cmds[i].name)+cmds[i].desc);

    // // Stop after 'list-commands' if we are not listing all commands.
    // if (cmds[i].name == 'list-commands') 
    //     if (args[0] != 'list-commands')
    //         break
}

// Getting the usage is important in scripts, don't error out.
process.exit(0);
