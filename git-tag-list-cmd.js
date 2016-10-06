#!/usr/bin/env node

var vc = require('./version-control.js');

var tag_params = vc.parse_tag_parameters(process.argv);
vc.git_tag_list(tag_params);

// OLD way, output does not pipe properly if we don't sync_to_console
// console.log(version_control.git_tag_list());
