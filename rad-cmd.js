#!/usr/bin/env node

// This script defines the top-level command of rad-scripts, moodboom's reusable node functions for rapid app dev.
// Type [rad] for usage.
//
// NOTE: Substeps can typically be run directly, via binaries defined in package.json that call the corresponding '-cmd.js' scripts.
// But we always provide access to all available substeps here too, to stay organized, centralized and documented.

var path = require('path');             // For path.join
var ru = require('./run-utils.js');     // For runsteps
var su = require('./string-utils.js');  // For string_pad


var args = process.argv.slice(2);

var cmds = [
    { name: 'git-sync'                  , desc: 'commits any changes in the current branch, pulls remote changes, and pushes the result'                                              },
    { name: 'git-version'               , desc: 'returns the current git semantic version, based on [git describe]'                                                                   },
    { name: 'git-version-clean'         , desc: 'returns MAJOR.MINOR.PATCH git version (suffix stripped)'                                                                             },
    { name: 'git-tag-major'             , desc: 'creates a tag that represents the next MAJOR semantic version; minor+patch+build are reset to 0'                                     },
    { name: 'git-tag-minor'             , desc: 'creates a tag that represents the next MINOR semantic version; patch+build are reset to 0'                                           },
    { name: 'git-tag-patch'             , desc: 'creates a tag that represents the next PATCH semantic version; it is a tag so [git describe] build are reset to 0'                   },
    { name: 'git-next-version'          , desc: 'returns what would be the next version after the next commit; important for auto-stamping version into app'                          },
    { name: 'get-svn-rev'               , desc: 'parses and returns the svn current revision from [svn info]'                                                                         },
    { name: 'get-svn-last-changed-rev'  , desc: 'parses and returns the svn last-changed revision from [svn info]'                                                                    },
    { name: 'npm-publish'               , desc: 'inject the current version into package.json, commit, and publish a new tagged release to npm'                                       }
];

for (var i = 0;i < cmds.length;i++) {
    if (args[0] == cmds[i].name) {
        var steps = [{ name: cmds[i].name, folder: '.', cmd: cmds[i].name}];
        return ru.runsteps(steps);
    }
}

console.log(
    '\n' +
    'usage: rad [command]\n\n' +

    'Commands include:\n'
);
for (var i = 0;i < cmds.length;i++) {
    console.log('  '+su.string_pad('                           ',cmds[i].name)+cmds[i].desc);
}
console.log();
process.exit(1);
