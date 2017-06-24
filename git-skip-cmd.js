#!/usr/bin/env node

var vc = require('./version-control.js');

// 0 = node, 1 = script path, so we ignore those.
// 2 = target file
var target = process.argv[2];
vc.git_skip(target);
