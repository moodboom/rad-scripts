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
    // Make sure the final task specifies the target folder since these will be called async.
    // i.e., don't use process.cwd()...
    var cmd1 = 'cd ' + folder + ' && git commit -a' + comment;
    var cmd2 = 'cd ' + folder + ' && git pull';
    var cmd3 = 'cd ' + folder + ' && git push';

    exec(cmd1, function(error, stdout, stderr) {

        // Sometimes stupid emacs fails with "emacs: standard input is not a tty".
        // I can't BELIEVE I used that as my primary editor for years!!  Think globally, EDIT LOCALLY.
        if (stderr) {

            console.log(stdout);
            console.log(stderr);

        } else {

            exec(cmd2, function(error, stdout, stderr) {
                if (error) {
                    console.log(stdout);
                    console.log(stderr);
                    console.log('==================== GIT PULL FAILED ====================\n');
                } else {
                    exec(cmd3, function(error, stdout, stderr) {
                        if (error) {
                            console.log(stdout);
                            console.log(stderr);
                            console.log('==================== GIT PUSH FAILED ====================\n');
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


// =========== svn_last_changed_rev: gets the SVN "last changed rev" for the current folder, as a string ============
var svn_last_changed_rev = function () {

    var run = exports.run_command_sync;

    var svn_info = run("svn", ["info"]);

    // extract the "Last Changed Rev"
    var regx = /^Last Changed Rev: (.*)$/gm;
    var array_result = regx.exec(svn_info);

    // return the first group result ([0] contains the whole result)
    return array_result[1];
}


// =========== svn_rev: gets the SVN current revision for the current repo, as a string ============
var svn_rev = function () {

    var run = exports.run_command_sync;

    var svn_info = run("svn", ["info"]);

    // extract the "Last Changed Rev"
    var regx = /^Revision: (.*)$/gm;
    var array_result = regx.exec(svn_info);

    // return the first group result ([0] contains the whole result)
    return array_result[1];
}


module.exports.git_sync = git_sync;
module.exports.svn_last_changed_rev = svn_last_changed_rev;
module.exports.svn_rev = svn_rev;
