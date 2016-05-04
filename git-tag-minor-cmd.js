#!/usr/bin/env node

var version_control = require('./version-control.js');
var ru = require('./run-utils.js');

var args = process.argv.slice(2);
var comment = ru.combine_params(args);

version_control.git_tag_minor(comment);
