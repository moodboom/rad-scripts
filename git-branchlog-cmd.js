#!/usr/bin/env node

var vc = require('./version-control.js');

var tag_params = vc.parse_tag_parameters(process.argv);
vc.git_branchlog(tag_params);
