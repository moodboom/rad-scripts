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
    { name: 'git-sync'                  , desc: '[msg msg...] > commits any changes in the current branch, pulls remote changes, and pushes the result'             },
    { name: 'git-version'               , desc: '> returns the current git semantic version, based on [git describe]'                                               },
    { name: 'git-version-clean'         , desc: '> returns MAJOR.MINOR.PATCH git version (suffix stripped)'                                                         },
    { name: 'git-tag-list'              , desc: '> list tags, including 1 line from the annotaged tag\'s commit message'                                            },
    { name: 'git-next-major'            , desc: '> returns what would be the next MAJOR semantic version'                                                           },
    { name: 'git-next-minor'            , desc: '> returns what would be the next MINOR semantic version'                                                           },
    { name: 'git-next-patch'            , desc: '> returns what would be the next PATCH semantic version'                                                           },
    { name: 'git-next-build'            , desc: '> returns what would be the next BUILD semantic version'                                                           },
    { name: 'git-tag-major'             , desc: '[msg msg...] > creates a tag that represents the next MAJOR semantic version; minor+patch+build are reset to 0'    },
    { name: 'git-tag-minor'             , desc: '[msg msg...] > creates a tag that represents the next MINOR semantic version; patch+build are reset to 0'          },
    { name: 'git-tag-patch'             , desc: '[msg msg...] > creates a tag that represents the next PATCH semantic version; build resets to 0'                   },
    { name: 'npm-update-version'        , desc: '[version] > inject the current version into package.json'                                                          },
    { name: 'get-svn-rev'               , desc: '> parses and returns the svn current revision from [svn info]'                                                     },
    { name: 'get-svn-last-changed-rev'  , desc: '> parses and returns the svn last-changed revision from [svn info]\n'                                              },

    { name: 'rs-update-readme'          , desc: '> dogfooding 101: use rad-scripts to dynamically update README.'                                                   },
    { name: 'rs-sync'                   , desc: '[--major|--minor|--patch] [msg msg...] > dogfooding 102: top-level script to commit tag and publish'               }
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
    'Easy semantic versioning of git repositories, along with other rapid app dev tools.\n\n' +

    'usage: rad [command]\n\n' +

    'The rad-scripts mantra:\n' +
    '   Every time you post code, you should tag it with a new semantic version\n' +
    '\n' +
    'Rad-scripts facilitates semantic versioning of git repositories.\n'+
    'Following semantic versioning guidelines, developers can tag \n' +
    'major/minor/patch releases without knowing numeric tag details.  \n' +
    'Instead, the developer can focus on whether commits since the last tag \n' +
    'include breaking changes (major), addition of new functionality (minor), \n' +
    'or bugfixes (patch).  \n' +
    '\n' +
    'For simpler environments, you can use git-tag-xxx commands out of the box.\n'+
    'These apply tags to the latest code via: commit pull push tag push.\n' +
    '\n' +
    'In more complex continuously automated environments, use git-next-xxx to\n' +
    'determine the pending version and apply it to the code base right before committing.\n' +
    'Best practice is to create an app-specific top-level sync script\n' +
    'that manages these details, and use it for every commit.\n' +
    '\n' +
    'See rs-sync-cmd.js / rs.js for a complete example that is used to publish rad-scripts itself.\n' +
    '\n' +
    'Commands include:\n'
);
for (var i = 0;i < cmds.length;i++) {
    console.log('* '+su.string_pad('                           ',cmds[i].name)+cmds[i].desc);
}

console.log(
    '\n'+
    'Utilities include:\n'+
    '\n'+
    '* ' +su.string_pad('                    ','run-utils')        +'> run a command [sync/async] and get output; run an array of commands in specified folders\n'+
    '* ' +su.string_pad('                    ','folder-utils')     +'> cd to the first found directory in an array (important for finding base folder of projects on different OSes/machines); walk files; walk folders\n'+
    '* ' +su.string_pad('                    ','string-utils')     +'> string_pad, etc.\n'+
    '* ' +su.string_pad('                    ','version-control')  +'> git semantic versioning via tags; sync git repos (auto commit+pull+push); extract svn revisions\n'+
    '\n'+
    'See https://bitpost.com/news for more bloviating.  Devs don\'t need no stinkin ops.  Happy automating!  :-)\n\n'
);

process.exit(1);
