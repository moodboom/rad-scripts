#!/usr/bin/env node

var vc = require('./version-control.js');
var ru = require('./run-utils.js');

var args = process.argv.slice(2);
var comment = ru.combine_params(args);

// top-level dev script to publish and commit a release
ru.run_command_sync_to_console('rs-publish');
vc.git_tag_patch(comment);
