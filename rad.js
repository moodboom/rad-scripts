#!/usr/bin/env node

// This script defines the top-level command of rad-scripts.
// It requires a second sub-command.
// Type [rad] for usage.
//
// NOTE: Substeps can typically be run directly, via binaries defined in package.json that call the corresponding '-cmd.js' scripts.
// But we always provide access to all available substeps here too, to stay organized, centralized and documented.

import {
  run_command_sync_to_console,
  run_command_quietly,
  runsteps,
} from './run-utils.js';
import { folder_exists } from './folder-utils.js';
import { string_pad } from './string-utils.js';
import {
  parse_tag_parameters,
  git_changes,
  git_sync,
} from '@moodboom/git-semver'; // ugg, circular, we gonna be ok?  :-)

const cmds = [
  { name: 'sync', desc: 'used to publish rad-scripts, using git-sync from @moodboom/git-semver' },
  { name: 'update', desc: 'used to publish rad-scripts, using git-sync from @moodboom/git-semver' },
  { name: 'list-commands', desc: 'lists all available commands' },
  { name: 'make-folder', desc: '[path] > makes the folder (even if deep), returns true if succeeds or already exists' },
];

const funcs = [
  { name: 'run_command_sync_to_console', desc: 'Run one command and let output immediately flow to console' },
  { name: 'run_command_async_to_console', desc: 'Async run one command and dump output to console when complete' },
  { name: 'run_command_quietly', desc: 'Runs without output unless error' },
  { name: 'run_command', desc: 'Run a command asynchronously and get the output when it finishes in a callback' },
  { name: 'run_command_sync', desc: 'Run a command synchronously and get the output when it finishes' },
  { name: 'runsteps', desc: 'Run a specific set of commands in specific directories' },
  { name: 'hasArg', desc: 'Check a set of args for a value; eg: hasArg( args, \'--init\')' },
  { name: 'combine_params', desc: 'Combine an array of params with separator' },
  { name: 'distro', desc: 'Return distro name from lsb_release' },
  { name: 'hostname', desc: 'Return hostname' },
  { name: 'ping', desc: 'Ping the specified host and return true/false' },
  { name: 'ping_google', desc: 'Ping google.com and return true/false' },
  { name: 'ping_gw', desc: 'Ping local gateway and return true/false' },
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

export const rad = ( target, args ) => {
  if ( target == 'update' || target == 'up' ) {

    const run_cmd = `git pull && npm install && npm link`;
    run_command_sync_to_console( run_cmd );

  } else if ( target == 'sync' || target == 'sy' ) {

    if ( !folder_exists( '../rad-scripts' ) ) {
      console.log( `You should sync from the repo root folder.` );
      exit( 1 );
    }

    const tagParams = parse_tag_parameters( process.argv );

    // git_sync to commit and tag a new version as appropriate.
    const stampCallbackFunction = ( err, version ) => {
      if ( err ) throw err;
      npm_update_version( version );

      // Quietly reinstall, so we get any recently-made changes to usage.
      run_command_quietly( 'npm install -g' );

      // Directly update README.md with usage, whoop
      const readme = run_command_sync( 'csd' );

      // Let's add the version, and the most recent commits, to the readme, for fun.
      // Note that usage will not include this, only the README.md file.
      // But it should be visible on github/npm.
      readme += "\n\nMost recent commits...\n";
      readme += run_command_sync( 'git-log 4' )
      readme += "\nVersion " + version;
      readme += "\n";

      const filename = 'README.md';
      writeFileSync( filename, readme, 'utf-8' );
    };

    // SYNC and PUBLISH CHANGES
    const changes = git_changes( process.cwd() );
    git_sync( process.cwd(), tagParams, stampCallbackFunction );
    if ( changes ) {
      // There were changes, so let's publish now.
      run_command_sync_to_console( 'npm publish' );
    }

    // Quietly reinstall, so we get any recently-made remote changes.
    run_command_quietly( 'npm install -g' );

  } else {
    for ( var i = 0; i < cmds.length; i++ ) {
      if ( target === cmds[ i ].name && cmds[ i ].name != 'list-commands' ) {
        const steps = [{ name: cmds[ i ].name, folder: '.', cmd: cmds[ i ].name }];
        runsteps( steps );
      }
    }
    
    // Generate usage, including a full app description, as this will be dynamically used to create README.md.  All docs in one place!  Cool.
    if ( target !== 'list-commands' ) {
      console.log(
        '# rad-scripts\n' +
        'Tools that allow you to easily use Javascript for all your scripting needs.\n\n' +
    
        'NOTE that there are other tools that leverage this toolset, for example, see:\n' +
        '[@moodboom/git-semver](https://www.npmjs.com/package/%40moodboom%2Fgit-semver)\n\n' +
    
        'Common functions and commands:\n',
      );
    }
    for ( var i = 0; i < funcs.length; i++ ) {
      console.log( '* ' + string_pad( '                             ', funcs[ i ].name + ":" ) + funcs[ i ].desc );
    }
    for ( var i = 0; i < cmds.length; i++ ) {
      console.log( '* ' + string_pad( '                             ', cmds[ i ].name + ":" ) + cmds[ i ].desc );
    }
    
  }
}
