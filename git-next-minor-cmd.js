#!/usr/bin/env node

var version_control = require('./version-control.js');
console.log(version_control.git_next_minor());
