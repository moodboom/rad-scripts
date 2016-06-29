#!/usr/bin/env node

var exec = require('child_process').exec;
var vc = require('./version-control.js');

// This script is designed to be run from within a git repo.
// It takes whatever code is in the working folder and pushes it out as the next semver release.
// By default, if there are code changes it will publish a patch release, but a major or minor release
// can be specified via optional params.
//
// Usage:
//     git-sync [--major|--minor] msg msg "msg with these [-?&|] should be quoted" ...

var tag_params = vc.parse_tag_parameters(process.argv);

// NOTE: The default "simple" git-sync command has no STAMP callback.
// See rs-sync-cmd.js for an example of how to make your own improved sync command.
vc.git_sync(process.cwd(),tag_params);
