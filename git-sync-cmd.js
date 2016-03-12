#!/usr/bin/env node

var exec = require('child_process').exec;
var ru = require('./run-utils.js');

// This script is designed to be run from within a git repo.
// You can pass any number of params to the command; they will all be concatenated into a single commit message.

// Process command line params.
// 0 = node, 1 = script path, so we ignore those.
// 2+ = concatenated into one comment for commit message - git will prompt if needed if not provided
var args = process.argv.slice(2);
var comment = ru.combine_params(args);

var version_control = require('./version-control.js');
version_control.git_sync(process.cwd(),comment);
