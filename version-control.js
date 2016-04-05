#!/usr/bin/env node


// =========== git_sync: commits, then pulls, then pushes to the default remote repo ============
var git_sync = function(folder,comment)
{
    var exec = require('child_process').exec;

    // DEBUG
    // console.log(process.cwd());
    // console.log(folder);

    // If comment is anything other than blank, build a proper comment format that we can slap on the end of cmd.
    if (comment.length > 0)
    {
        comment = " -m \"" + comment + "\"";

    }

    // Run these in order.
    // Make sure the task specifies the full target folder since these will be called async.
    // i.e., don't use process.cwd()...
    var cmd1 = 'cd ' + folder + ' && git commit -a' + comment;
    var cmd2 = 'cd ' + folder + ' && git pull';
    var cmd3 = 'cd ' + folder + ' && git push';

    exec(cmd1, function(error, stdout, stderr) {

        // Sometimes stupid emacs fails with "emacs: standard input is not a tty".
        // I can't BELIEVE I used that as my primary editor for years!!  Think globally, EDIT LOCALLY.
        if (stderr) {

            if (stdout.length > 0 ) console.log(stdout);
            console.log(stderr);

        } else {

            exec(cmd2, function(error, stdout, stderr) {
                if (error) {
                    console.log('=========================================================');
                    console.log('PULL FAIL: ' + folder);
                    console.log('=========================================================');
                    if (stdout.length > 0 ) console.log(stdout);
                    if (stderr.length > 0 ) console.log(stderr);
                } else {
                    exec(cmd3, function(error, stdout, stderr) {
                        if (error) {
                            console.log('=========================================================');
                            console.log('PUSH FAIL: ' + folder);
                            console.log('=========================================================');
                            if (stdout.length > 0 ) console.log(stdout);
                            if (stderr.length > 0 ) console.log(stderr);
                        } else
                        {
                            // MDM Eventually remove this chatter.
                            // console.log(stdout);
                            // console.log(stderr);
                            // console.log('==================== SYNC COMPLETE ====================\n');
                            // console.log("<=> * [" + process.cwd() + "] " + cmd1 + " && " + cmd2 + " && " + cmd3);

                            console.log("<=> " + folder);
                        }
                    });
                }
            });
        }
    });
}


// =========== git_clone: clones a repo ============
var git_clone = function(remote_repo,local_folder)
{
    var exec = require('child_process').exec;

    // Run these in order.
    // Make sure the task specifies the full target folder since these will be called async.
    // i.e., don't use process.cwd()...
    var cmd1 = 'git clone ' + remote_repo + ' ' + local_folder;

    exec(cmd1, function(error, stdout, stderr) {

        if (stderr) {

            if (stdout.length > 0 ) console.log(stdout);
            console.log(stderr);

        } else {

            console.log("cloned: " + local_folder);
        }
    });
}


// =========== svn_last_changed_rev: gets the SVN "last changed rev" for the current folder, as a string ============
var svn_last_changed_rev = function () {

    var ru = require('./run-utils.js');
    var run = ru.run_command_sync;

    var svn_info = run("svn", ["info"]);

    // extract the "Last Changed Rev"
    var regx = /^Last Changed Rev: (.*)$/gm;
    var array_result = regx.exec(svn_info);

    // return the first group result ([0] contains the whole result)
    return array_result[1];
}


// =========== svn_rev: gets the SVN current revision for the current repo, as a string ============
var svn_rev = function () {

    var ru = require('./run-utils.js');
    var run = ru.run_command_sync;

    var svn_info = run("svn", ["info"]);

    // extract the "Last Changed Rev"
    var regx = /^Revision: (.*)$/gm;
    var array_result = regx.exec(svn_info);

    // return the first group result ([0] contains the whole result)
    return array_result[1];
}


// ============ build_semantic_version: builds "next" historical semver, with validation using stored result ===============
var build_semantic_version = function (major,minor,patch,build,lastVersionFolder) {

    var fs = require('fs');
    var args = process.argv.slice(2);

    process.chdir(lastVersionFolder);

    var m  = parseInt(fs.readFileSync('major.txt', 'utf-8'));
    var n  = parseInt(fs.readFileSync('minor.txt', 'utf-8'));
    var p  = parseInt(fs.readFileSync('patch.txt', 'utf-8'));
    var b  = parseInt(fs.readFileSync('build.txt', 'utf-8'));

    // Compare to parameters
    // If different, adjust and save
    var m2 = major;
    var n2 = minor;
    var p2 = patch;
    var b2 = build;

    if (m2 != m)
    {
        // Validate
        if (
                m2 != m + 1
            ||	n2 != 0
            ||	p2 != 0
        ) {
            console.log('New major version provided incorrectly: old('+m+'.'+n+'.'+p+'.'+b+") new("+m2+'.'+n2+'.'+p2+'.'+b2+')');
            process.exit(1);
        }

        // Reset n p
        m = m2;
        n = 0;
        p = 0;
        fs.writeFileSync('major.txt', m, 'utf-8');
        fs.writeFileSync('minor.txt', n, 'utf-8');
        fs.writeFileSync('patch.txt', p, 'utf-8');

    } else if (n2 != n) {

        // Validate
        if (
                n2 != n + 1
            ||	p2 != 0
        ) {
            console.log('New minor version provided incorrectly: old('+m+'.'+n+'.'+p+'.'+b+") new("+m2+'.'+n2+'.'+p2+'.'+b2+')');
            process.exit(1);
        }

        // Reset p
        n = n2;
        p = 0;
        fs.writeFileSync('minor.txt', n, 'utf-8');
        fs.writeFileSync('patch.txt', p, 'utf-8');

    } else if (p2 != p) {

        // Validate
        if ( p2 != p + 1 )
        {
            console.log('New patch version provided incorrectly: old('+m+'.'+n+'.'+p+'.'+b+") new("+m2+'.'+n2+'.'+p2+'.'+b+')');
            process.exit(1);
        }

        p = p2;
        fs.writeFileSync('patch.txt', p, 'utf-8');

    }

    // Write the new build version.
    b = b2;
    fs.writeFileSync('build.txt', b, 'utf-8');

    return m+'.'+n+'.'+p+'.'+b;
}

module.exports.git_sync = git_sync;
module.exports.git_clone = git_clone;
module.exports.svn_last_changed_rev = svn_last_changed_rev;
module.exports.svn_rev = svn_rev;
module.exports.build_semantic_version = build_semantic_version;

