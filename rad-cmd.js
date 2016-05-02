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
    { name: 'git-sync'                  , desc: '> commits any changes in the current branch, pulls remote changes, and pushes the result'                                              },
    { name: 'git-version'               , desc: '> returns the current git semantic version, based on [git describe]'                                                                   },
    { name: 'git-version-clean'         , desc: '> returns MAJOR.MINOR.PATCH git version (suffix stripped)'                                                                             },
    { name: 'git-tag-list'              , desc: '> list tags, including 1 line from the annotaged tag\'s commit message'                                                                },
    { name: 'git-tag-major'             , desc: '> creates a tag that represents the next MAJOR semantic version; minor+patch+build are reset to 0'                                     },
    { name: 'git-tag-minor'             , desc: '> creates a tag that represents the next MINOR semantic version; patch+build are reset to 0'                                           },
    { name: 'git-tag-patch'             , desc: '> creates a tag that represents the next PATCH semantic version; it is a tag so [git describe] build count resets to 0'                },
    { name: 'git-next-version'          , desc: '> returns what would be the next version after the next commit; important for auto-stamping version into app'                          },
    { name: 'get-svn-rev'               , desc: '> parses and returns the svn current revision from [svn info]'                                                                         },
    { name: 'get-svn-last-changed-rev'  , desc: '> parses and returns the svn last-changed revision from [svn info]'                                                                    },
    { name: 'npm-publish'               , desc: '> inject the current version into package.json, commit, and publish a new tagged release to npm'                                       },
    { name: 'rs-update-readme'          , desc: '> dogfooding 101: use rad-scripts to dynamically update README.md'                                                                     },
    { name: 'rs-publish'                , desc: '> dogfooding 201: use rad-scripts to publish a new rad-scripts release to npm'                                                         }
];

for (var i = 0;i < cmds.length;i++) {
    if (args[0] == cmds[i].name) {
        var steps = [{ name: cmds[i].name, folder: '.', cmd: cmds[i].name}];
        return ru.runsteps(steps);
    }
}

// Generate usage, including a full app description, as this will be dynamically used to create README.md.  All docs in one place!  Cool.
console.log(
    '# rad-scripts\n' +
    'Reusable node functions for rapid app development, continuous integration, and semantic versioning.\n\n' +

    'usage: rad [command]\n\n' +

    'Commands include:\n'
);
for (var i = 0;i < cmds.length;i++) {
    console.log('* '+su.string_pad('                           ',cmds[i].name)+cmds[i].desc);
}

console.log(
'\nUtilities include:\n\n'+

'* ' +su.string_pad('                    ','run-utils')        +'> run a command [sync/async] and get output; run an array of commands in specified folders\n'+
'* ' +su.string_pad('                    ','folder-utils')     +'> cd to the first found directory in an array (important for finding base folder of projects on different OSes/machines); walk files; walk folders\n'+
'* ' +su.string_pad('                    ','string-utils')     +'> string_pad, etc.\n'+
'* ' +su.string_pad('                    ','version-control')  +'> git semantic versioning via tags; sync git repos (auto commit+pull+push); extract svn revisions\n\n'+

'Semantic versioning is available for git repositories.  Following semantic versioning guidelines, developers can tag major/minor/patch releases without knowing numeric tag details.  The developer can then focus on whether commits since the last tag include breaking changes (major), addition of new functionality (minor), or bugfixes (patch).\n'
);

process.exit(1);
