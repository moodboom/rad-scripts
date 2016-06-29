#!/usr/bin/env node

var exec = require('child_process').exec;
var vc = require('./version-control.js');

// This script is designed to be run from within a git repo.
// You can pass any number of params to the command; they will all be concatenated into a single commit message.

var tag_params = vc.parse_tag_parameters(process.argv);
tag_params.notag = 1;

// We don't provide the version here, as this command is specifically used to avoid tagging.
// You should consider using git-sync instead!
vc.git_sync(process.cwd(),tag_params);
