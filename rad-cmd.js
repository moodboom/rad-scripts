#!/usr/bin/env node

// This script defines the top-level command of rad-scripts.
// It requires a second sub-command.
// Type [rad] for usage.
//
// NOTE: Substeps can typically be run directly, via binaries defined in package.json that call the corresponding '-cmd.js' scripts.
// But we always provide access to all available substeps here too, to stay organized, centralized and documented.

var path = require('path');             // For path.join
var ru = require('./run-utils.js');     // For runsteps
var su = require('./string-utils.js');  // For string_pad

var args = process.argv.slice(2);

var cmds = [
    { name: 'git-sync'                  , desc: '[--major|--minor|--patch] [msg msg...] > stash, pull, pop, stamp, commit, tag, push'       },
    { name: 'git-sync-notag'            , desc: '> a git-sync version to commit code without a tag; bad form perhaps, but up to you\n'      },

    { name: 'git-log'                   , desc: '[--branch|-b name] [count] > an opinionated pretty colored git log, clipped to ~110 chars' },
    { name: 'git-branchlog'             , desc: '[--branch|-b name] [--with-commits|-c] [-all|-a] > an opinionated branch summary log'      },
    { name: 'git-tag-list'              , desc: '> list tags, including one line from the annotaged tag\'s commit message\n'                },

    { name: 'git-skip'                  , desc: '[file] > tell git to start ignoring upstream and local changes to the given file'          },
    { name: 'git-noskip'                , desc: '[file] > tell git to stop ignoring upstream and local changes to the given file'           },
    { name: 'git-skiplist'              , desc: '> list the files for which git is currently ignoring upstream and local changes\n'         },

    { name: 'npm-update-version'        , desc: '[version] > inject the current version into package.json'                                  },
    { name: 'rs-sync'                   , desc: '[--major|--minor] [msg msg...] > dogfooding 101: use rad-scripts to publish rad-scripts\n' },

    // Minor commands
    
    { name: 'list-commands'             , desc: '> lists all available commands\n'   },

    { name: 'make-folder'               , desc: '[path] > makes the folder (even if deep), returns true if succeeds or already exists\n'    },

    { name: 'git-version'               , desc: '> returns the current git semantic version, based on [git describe]'                       },
    { name: 'git-version-clean'         , desc: '> returns MAJOR.MINOR.PATCH git version (suffix stripped)\n'                               },
    { name: 'git-next-major'            , desc: '> returns what would be the next MAJOR semantic version'                                   },
    { name: 'git-next-minor'            , desc: '> returns what would be the next MINOR semantic version'                                   },
    { name: 'git-next-patch'            , desc: '> returns what would be the next PATCH semantic version'                                   },
    { name: 'git-next-build'            , desc: '> returns what would be the next BUILD semantic version (less common)\n'                   },

    { name: 'get-svn-rev'               , desc: '> parses and returns the svn current revision from [svn info]'                             },
    { name: 'get-svn-last-changed-rev'  , desc: '> parses and returns the svn last-changed revision from [svn info]\n'                      }

];

for (var i = 0;i < cmds.length;i++) {
    if (args[0] == cmds[i].name && cmds[i].name != 'list-commands') {
        var steps = [{ name: cmds[i].name, folder: '.', cmd: cmds[i].name}];
        return ru.runsteps(steps);
    }
}

// Generate usage, including a full app description, as this will be dynamically used to create README.md.  All docs in one place!  Cool.
if (args[0] != 'list-commands') {
    console.log(
        '# rad-scripts\n' +        
        'Easily add semantic versioning to all your git repositories, and integrate the versioning into your apps.\n\n' +

        'The rad-scripts mantra:\n' +
        '\n' +
        '   Automatically tag your code with a semantic version every time you push\n' +
        '\n' +
        'Rad-scripts facilitates semantic versioning of git repositories.\n'+
        'Following semantic versioning guidelines, developers can tag \n' +
        'major/minor/patch releases without knowing numeric tag details.\n' +
        'Instead, the developer can focus on whether commits since the last tag \n' +
        'include breaking changes (major), addition of new functionality (minor), \n' +
        'or bugfixes (patch).  \n' +
        '\n' +
        'To painlessly kick things off, just start using git-sync to push your changes.\n'+
        'This automatically applies semantic version tags to your code, starting with v0.0.0.\n' +
        'Use --major when pushing breaking changes, and --minor when pushing new features.\n' +
        'Other than that, it should all be automatic.\n' +
        '\n' +
        'In more complex continuously automated environments, rad-scripts provides a framework\n' +
        'for you to stamp the "next version" into your code base right before pushing.\n' +
        'Best practice is to create an app-specific "stamp" script for your app, and use it for every commit.\n' +
        'Any type of app is supported, through a generic callback; npm module publishing is also supported.\n' +
        'See rs-sync-cmd.js for a complete example that is used to publish rad-scripts itself.\n' +
        '\n' +
        'git-sync is the primary command.  It automates version stamping through a rebased push:\n' +
        '\n' +
        '  stash, pull --rebase, stash pop, determine "next" version, stamp, commit, tag, push, publish\n' +
        '\n' +
        'git-sync will drop you back to the command line on any conflicts.  Automating this workflow can save hours.\n' +
        '\n' +
        'Common commands:\n'
    );
}
for (var i = 0;i < cmds.length;i++) {
    console.log('* '+su.string_pad('                           ',cmds[i].name)+cmds[i].desc);

    // Stop after 'list-commands' if we are not listing all commands.
    if (cmds[i].name == 'list-commands') 
        if (args[0] != 'list-commands')
            break
}

if (args[0] == 'list-commands') {
    console.log(
        '\n'+
        'Utilities include:\n'+
        '\n'+
        '* ' +su.string_pad('                    ','run-utils')        +'> run a command [sync/async] and get output; run an array of commands in specified folders\n'+
        '* ' +su.string_pad('                    ','folder-utils')     +'> cd to the first found directory in an array (important for finding base folder of projects on different OSes/machines); walk files; walk folders\n'+
        '* ' +su.string_pad('                    ','string-utils')     +'> string_pad, etc.\n'+
        '* ' +su.string_pad('                    ','version-control')  +'> git semantic versioning via tags; sync git repos (auto commit+pull+push); extract svn revisions\n'
    );
}

console.log(
    '\n'+
    'See https://bitpost.com/news for more bloviating.  Devs don\'t need no stinkin ops.   Happy automating!  :-)\n\n'
);

// Getting the usage is important in scripts, don't error out.
process.exit(0);
