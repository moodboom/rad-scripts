#!/usr/bin/env node

var vc = require('./version-control.js');
var ru = require('./run-utils.js');
var rs = require('./rs.js');

var args = process.argv.slice(2);

var version;
     if (args[0] == '--major') { version = vc.git_next_major(); args = args.slice(1); }
else if (args[0] == '--minor') { version = vc.git_next_minor(); args = args.slice(1); }
else if (args[0] == '--patch') { version = vc.git_next_patch(); args = args.slice(1); }
else                           { version = vc.git_next_patch()                        }

if (!vc.git_version_valid(version)) {
    console.log("Please tag your repo with a valid semantic version.");
    process.exit(1);
}

var comment = ru.combine_params(args);
rs.rs_publish(comment,version);
