#!/usr/bin/env node

var vc = require('./version-control.js');
var ru = require('./run-utils.js');

var args = process.argv.slice(2);
var comment = ru.combine_params(args);

var version = vc.git_next_major();
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
