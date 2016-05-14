#!/usr/bin/env node

var vc = require('./version-control.js');
var ru = require('./run-utils.js');
var rs = require('./rs.js');

var args = process.argv.slice(2);
var comment = ru.combine_params(args);
var version = vc.git_next_major();

rs.rs_publish(version,comment);
