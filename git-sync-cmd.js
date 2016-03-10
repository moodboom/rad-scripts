#!/usr/bin/env node

var exec = require('child_process').exec;

// This script is designed to be run from within a git repo.
// You can pass any number of params to the command; they will all be concatenated into a single commit message.

// Process command line params.
// 0 = node, 1 = script path, so we ignore those.
var args = process.argv.slice(2);
var comment = "";
if (args.length > 0)
{
    // Build a comment if args are provided.
    // We take all args and automatically mash them together into one comment string.
    args.forEach(function(val,index,array){ 
        if (index != 0) 
        { comment += " "; } 
        comment += val; 
    });
}

var version_control = require('./version-control.js');
version_control.git_sync('.',comment);
