#!/usr/bin/env node

var vc = require('./version-control.js');
var rs = require('./rs.js');

var tag_params = vc.parse_tag_parameters(process.argv);
rs.rs_publish(tag_params.comment,tag_params.next_version);
