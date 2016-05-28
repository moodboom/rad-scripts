#!/usr/bin/env nodeold

var fs = require('fs');
var ru = require('./run-utils.js');
var unknown_version = 'unknown version';


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


// =========== git_sync: commits, then pulls, (then tags if version is provided), then pushes to the default remote repo, as needed ============
// This may not be what is always wanted by everyone but for me it is always the common use case.
var git_sync = function(folder,comment,version)
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

    var commit_task = [{ name: 'commit'     , folder: folder, cmd: 'git commit -a' + comment                }];
    var pull_task   = [{ name: 'pull'       , folder: folder, cmd: 'git pull'                               }];
    var tag_task    = [{ name: 'tag'        , folder: folder, cmd: 'git tag -a' + comment + ' ' + version   }];
    var push_task   = [{ name: 'push'       , folder: folder, cmd: 'git push --follow-tags'                 }]; // You should really make [--follow-tags] the default via push.followTags

    // Build tasks.
    var tasks = [];
    if (changes.length                              ) { tasks.plus(commit_task); }
    if (remote_changes.length                       ) { tasks.plus(pull_task  ); }
    if (changes.length && git_version_valid(version)) { tasks.plus(tag_task   ); }
    /* if (changes.length ) */                        { tasks.plus(push_task  ); }   // Always push in case we already committed something

    if (tasks.length > 1) {

        // Build blip.
        var blip = "";
             if (changes.length && remote_changes.length) { blip = '<=>'; }
        else if (changes.length                         ) { blip = '>>>'; }
        else if (remote_changes.length                  ) { blip = '<<<'; }
        else                                              { blip = '---'; }
        if (git_version_valid(version)) { blip += ' ['+version+']'; }

        console.log('----------------------------------');
        console.log(blip + ' ' + folder);
        console.log('----------------------------------');
    }

    ru.runsteps(tasks);
    
    // Return true if there were changes.
    return (changes.length > 0); 
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

    if (!git_version_valid(desc)) {
        console.log("Unknown git version ["+desc+"]\nPlease tag the repository with a semantic version:\n\n   git tag -a #.#.# -m \"tag description\"\n");
        return unknown_version;
    }

    return desc;
}


// =========== git_version_clean: gets the git version stripped to MAJOR.MINOR.PATCH ============
var git_version_clean = function () {

    var desc = git_version();
    if (desc == unknown_version) return desc;

    var tokens = desc.match(/(^[0-9]*.[0-9]*.[0-9]*)/);
    if (tokens != null)
        return tokens[1];

    return desc;
}


//=========== git_version_valid: tests to see if a version is valid ============
var git_version_valid = function (version) {

    if (version == null)
        return false;
    
    // If this doesn't start with a number then a dot, we won't know what to do...
    if (version.match(/^[0-9]\./) == null)
        return false;

    return true;
}


// =========== git_next_major ============
var git_next_major = function() {

    var desc = git_version();
    if (desc == unknown_version) return desc;

    var tokens = desc.match(/([0-9]*).*/);
    var major = parseInt(tokens[1]) + 1;
    if (major == null) return unknown_version;

    return major+".0.0";
}


// =========== git_next_minor ============
var git_next_minor = function() {

    var desc = git_version();
    if (desc == unknown_version) return desc;

    var tokens = desc.match(/([0-9]*).([0-9]*)/);
    var major = tokens[1];
    var minor = parseInt(tokens[2]) + 1;
    if (major == null || minor == null) return unknown_version;

    return major+"."+minor+".0";
}


// =========== git_next_patch ============
var git_next_patch = function() {

    var desc = git_version();
    if (desc == unknown_version) return desc;

    var tokens = desc.match(/([0-9]*).([0-9]*).([0-9]*)/);
    var major = tokens[1];
    var minor = tokens[2];
    var patch = parseInt(tokens[3]) + 1;
    if (major == null || minor == null || patch == null) return unknown_version;

    return major+"."+minor+"."+patch;
}


// =========== git_next_build: gets the git version, then strips hash and increments the commit count by one ============
var git_next_build = function () {

    // NOTE: this can be used to stamp a product with the next pending semantic version just before it is committed.
    // We add one to the "build" commit count, and we exclude the hash (since we won't know it until post-commit).
    // This process ensures that we have a correct stamp on the app without resorting to obnoxious CI-driven commits.

    var desc = git_version();
    if (desc == unknown_version) return desc;

    // First we check to see if we are sitting right on a tag, eg [1.2.3].  If so, return [1.2.3-1].
    var tokens = desc.match(/(^[0-9]*.[0-9]*.[0-9]*$)/);
    if (tokens != null)
        return tokens[1] + "-1";

    tokens = desc.match(/(^[0-9]*.[0-9]*.[0-9]*)(.[0-9]*).*/);

    if (tokens == null || tokens[2] == null)
        return unknown_version;

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

    var desc = git_next_major();
    if (desc == unknown_version) { console.log("Unable to tag"); process.exit(1); }
    git_sync('.',message,desc);
}


// =========== git_tag_minor: gets the git version and adds a tag for the next minor release ============
var git_tag_minor = function(message) {

    var desc = git_next_minor();
    if (desc == unknown_version) { console.log("Unable to tag"); process.exit(1); }
    git_sync('.',message,desc);
}


// =========== git_tag_patch: gets the git version and adds a tag for the next patch ============
var git_tag_patch = function(message) {

    var desc = git_next_patch();
    if (desc == unknown_version) { console.log("Unable to tag"); process.exit(1); }
    git_sync('.',message,desc);
}


// =========== parse_tag_parameters: utility commonly needed to parse tag-based command line parameters ============
var parse_tag_parameters = function(argv) {

    var args = argv.slice(2);

    var version;
         if (args[0] == '--major') { version = git_next_major(); args = args.slice(1); }
    else if (args[0] == '--minor') { version = git_next_minor(); args = args.slice(1); }
    else if (args[0] == '--patch') { version = git_next_patch(); args = args.slice(1); }
    else                           { version = git_next_patch()                        }

    if (!vc.git_version_valid(version)) {
        console.log("Please tag your repo with a valid semantic version.");
        process.exit(1);
    }

    var comment = ru.combine_params(args);

    return {
        "next_version" : version,
        "comment" : comment
    };
}


// =========== npm_update_version ============
var npm_update_version = function(version) {
    var filename = 'package.json';
    try {
        console.log('Stamping version ['+version+'] into ['+filename+']...');
        var origversion = fs.readFileSync(filename,'utf-8');
        //   "version": "1.3.0",  ==>    "version": "###version###",
        var newversion = origversion.replace(/\"version\".*/, '\"version\": \"'+version+'\",');
        fs.writeFileSync(filename, newversion,'utf-8');
        // console.log(filename + " was updated...");
    }
    catch (err) {
        console.log(filename + ' could not be updated: ' + err);
        process.exit(1);
    }
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
module.exports.git_version_valid = git_version_valid;
module.exports.git_tag_list = git_tag_list;
module.exports.git_next_major = git_next_major;
module.exports.git_next_minor = git_next_minor;
module.exports.git_next_patch = git_next_patch;
module.exports.git_next_build = git_next_build;
module.exports.git_tag_major = git_tag_major;
module.exports.git_tag_minor = git_tag_minor;
module.exports.git_tag_patch = git_tag_patch;
module.exports.npm_update_version = npm_update_version;
module.exports.svn_last_changed_rev = svn_last_changed_rev;
module.exports.svn_rev = svn_rev;
module.exports.build_semantic_version = build_semantic_version;

