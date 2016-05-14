#!/usr/bin/env node

var vc = require('./version-control.js');

var args = process.argv.slice(2);
var version = args[0];
vc.npm_update_version(version);
