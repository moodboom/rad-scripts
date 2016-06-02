#!/usr/bin/env node

var vc = require('./version-control.js');
var rs = require('./rs.js');

rs.rs_publish(process.argv);
