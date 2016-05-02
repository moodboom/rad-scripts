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
    /* if (changes.length ) */ { tasks.plus(push_task  ); }   // Always push in case we already committed something

    if (tasks.length > 1) {

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

    ru.runsteps(tasks);
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


// =========== git_version: gets the git version, using [git describe], which includes tag, commit count, and current hash prefix, as a string ============
var git_version = function () {

    var desc = ru.run_command_sync('git describe --always --tags').trim();

    // If this doesn't start with a number then a dot, we won't know what to do...
    if (desc.match(/^[0-9]\./) == null)
        return "Unknown git version ["+desc+"]\nPlease tag the repository with a semantic version:\n\n   git tag -a #.#.# -m \"tag description\"\n";

    return desc;
}


// =========== git_version_clean: gets the git version stripped to MAJOR.MINOR.PATCH ============
var git_version_clean = function () {

    var desc = git_version();

    var tokens = desc.match(/(^[0-9]*.[0-9]*.[0-9]*)/);
    if (tokens != null)
        return tokens[1];

    return desc;
}


// =========== git_next_version: gets the git version, then strips hash and increments the commit count by one ============
var git_next_version = function () {

    // NOTE: this can be used to stamp a product with the next pending semantic version just before it is committed.
    // We add one to the "build" commit count, and we exclude the hash (since we won't know it until post-commit).
    // This process ensures that we have a correct stamp on the app without resorting to obnoxious CI-driven commits.

    var desc = git_version();

    // First we check to see if we are sitting right on a tag, eg [1.2.3].  If so, return [1.2.3-1].
    var tokens = desc.match(/(^[0-9]*.[0-9]*.[0-9]*$)/);
    if (tokens != null)
        return tokens[1] + "-1";

    tokens = desc.match(/(^[0-9]*.[0-9]*.[0-9]*)(.[0-9]*).*/);

    if (tokens == null || tokens[2] == null)
        return "-- unknown --";

    // Now turn [1.2.3-4-g#######] into [1.2.3-5]...
    var build = parseInt(tokens[2]) + 1;
    return tokens[1] + build;
}


// =========== git_tag_list: list tags, including 1 line from the annotaged tag's commit message ============
var git_tag_list = function(message) {

    return ru.run_command_sync("git tag -n");
}


// =========== git_tag_major: gets the git version and adds a tag for the next major release ============
var git_tag_major = function(message) {

    var desc = git_version();
    if (desc.substr(0,7) == "Unknown") return desc;

    var tokens = desc.match(/([0-9]+)(.[0-9]+.[0-9]+.[0-9]+).+/);
    var major = parseInt(tokens[1]) + 1;
    if (major == null) return "Unable to tag";

    // Always sync any changes before tagging, in case the user forgot.
    // If they already committed this won't do anything.
    git_sync('.',message);

    return ru.run_command_sync("git tag -a -m \""+message+"\" "+major+".0.0");
}


// =========== git_tag_minor: gets the git version and adds a tag for the next minor release ============
var git_tag_minor = function(message) {

    var desc = git_version();
    if (desc.substr(0,7) == "Unknown") return desc;

    var tokens = desc.match(/([0-9]*).([0-9]*)/);
    var major = tokens[1];
    var minor = parseInt(tokens[2]) + 1;
    if (minor == null) return "Unable to tag";

    git_sync('.',message);
    return ru.run_command_sync("git tag -a -m \""+message+"\" "+major+"."+minor+".0");
}


// =========== git_tag_patch: gets the git version and adds a tag for the next patch ============
var git_tag_patch = function(message) {

    var desc = git_version();
    if (desc.substr(0,7) == "Unknown") return desc;

    var tokens = desc.match(/([0-9]*).([0-9]*).([0-9]*)/);
    var major = tokens[1];
    var minor = tokens[2];
    var patch = parseInt(tokens[3]) + 1;
    if (patch == null) return "Unable to tag";

    git_sync('.',message);
    return ru.run_command_sync("git tag -a -m \""+message+"\" "+major+"."+minor+"."+patch);
}


// =========== svn_last_changed_rev: gets the SVN "last changed rev" for the current folder, as a string ============
var svn_last_changed_rev = function () {

    var run = ru.run_command_sync;

    var svn_info = run("svn info");

    // extract the "Last Changed Rev"
    var regx = /^Last Changed Rev: (.*)$/gm;
    var array_result = regx.exec(svn_info);

    // return the first group result ([0] contains the whole result)
    return array_result[1];
}


// =========== svn_rev: gets the SVN current revision for the current repo, as a string ============
var svn_rev = function () {

    var run = ru.run_command_sync;

    var svn_info = run("svn info");

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
module.exports.git_version = git_version;
module.exports.git_version_clean = git_version_clean;
module.exports.git_next_version = git_next_version;
module.exports.git_tag_list = git_tag_list;
module.exports.git_tag_major = git_tag_major;
module.exports.git_tag_minor = git_tag_minor;
module.exports.git_tag_patch = git_tag_patch;
module.exports.svn_last_changed_rev = svn_last_changed_rev;
module.exports.svn_rev = svn_rev;
module.exports.build_semantic_version = build_semantic_version;

