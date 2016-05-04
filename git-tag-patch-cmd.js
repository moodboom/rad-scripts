#!/usr/bin/env node

var vc = require('./version-control.js');
var ru = require('./run-utils.js');

var args = process.argv.slice(2);
var comment = ru.combine_params(args);

vc.git_tag_patch(comment);
