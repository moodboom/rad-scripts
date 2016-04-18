#!/usr/bin/env nodeold

var ru = require('./run-utils.js');


//=========== git_changes: gets any changes in the current folder; returns blank if none ============
var git_changes = function(folder) {

    // Steps will be called synchronously so we can use cd.
    process.chdir(folder);

    return ru.run_command_sync("git status -uno --porcelain");
}


//=========== git_remote_changes: returns if remote changes exist, blank if none ============
var git_remote_changes = function(folder) {

    // Steps will be called synchronously so we can use cd.
    process.chdir(folder);

    ru.run_command_quietly('git remote update');
    return ru.run_command_sync("git log HEAD..HEAD@{u} --oneline");
}


// =========== git_sync: commits, then pulls, then pushes to the default remote repo, as needed ============
var git_sync = function(folder,comment)
{
    Array.prototype.plus = function (other_array) {
        other_array.forEach(function(v) {this.push(v)}, this);
    }

    var changes = git_changes(folder);
    var remote_changes = git_remote_changes(folder);

    // If comment is anything other than blank, build a proper comment format that we can slap on the end of cmd.
    if (comment.length > 0)
    {
        comment = " -m \"" + comment + "\"";
    }

    var commit_task = [{ name: 'commit', folder: folder, cmd: 'git commit -a' + comment    }];
    var pull_task   = [{ name: 'pull'  , folder: folder, cmd: 'git pull'                   }];
    var push_task   = [{ name: 'push'  , folder: folder, cmd: 'git push'                   }];

    // Build tasks.
    var tasks = [];
    if (changes.length       ) { tasks.plus(commit_task); }
    if (remote_changes.length) { tasks.plus(pull_task  ); }
    if (changes.length       ) { tasks.plus(push_task  ); }

    if (tasks.length) {

        // Build blip.
        var blip = "";
             if (changes.length && remote_changes.length) { blip = '<=>'; }
        else if (changes.length                         ) { blip = '>>>'; }
        else if (remote_changes.length                  ) { blip = '<<<'; }
        else                                              { blip = '---'; }

        console.log('----------------------------------');
        console.log(blip + ' ' + folder);
        console.log('----------------------------------');
    }

    ru.runsteps(tasks,'quiet');
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

module.exports.git_changes = git_changes;
module.exports.git_sync = git_sync;
module.exports.git_clone = git_clone;
module.exports.svn_last_changed_rev = svn_last_changed_rev;
module.exports.svn_rev = svn_rev;
module.exports.build_semantic_version = build_semantic_version;

