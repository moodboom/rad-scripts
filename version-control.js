#!/usr/bin/env nodeold

var path = require('path');             // For path.normalize
var fs = require('fs');
var ru = require('./run-utils.js');
var unknown_version = 'unknown version';


//=========== git_changes: gets any changes in the current folder; returns blank if none ============
var git_changes = function(folder) {

    // Steps will be called synchronously so we can use cd.
    process.chdir(folder);

    // Outgoing changes: git log @{u}.. Incoming changes: git log ..@{u}

    // NOTE: this will tell us if there are recent commits that have not been pushed yet.
    // We actually do not want that, the rebase pull will take care of those.
    // var changes = ru.run_command_sync("git log @{u}..");

    var changes = ru.run_command_sync("git status -uno --porcelain");
    return changes;
}


//=========== git_remote_changes: returns if remote changes exist, blank if none ============
var git_remote_changes = function(folder) {

    // Steps will be called synchronously so we can use cd.
    process.chdir(folder);

    ru.run_command_quietly('git remote update');
    return ru.run_command_sync("git log HEAD..HEAD@{u} --oneline");
}


// =========== git_sync ============
// NOTE: This follows the rad-scripts mantra of semver-tagging every push.
//
// We consider the following flows here.
//
// 1) commit, pull --rebase, determine "next" version, stamp, commit, tag, push, publish
// This process is thorough but would often result in two commits.
// Also, if you committed local changes somewhere else they'll be screwed by rebase
// (but that would be uncommon).
// See http://stackoverflow.com/questions/2472254/when-should-i-use-git-pull-rebase
//
// 2) pull, determine "next" version, stamp, commit, tag, push, publish
// Best practice is to pull before starting work, and finish before others push.  Not always possible.  :-)
// So this process can result in merges when there were remote changes - but that's the cost of doing business.
// The problem is the pull - it won't happen if changes are not committed first.
//
// 3) determine "next" version using local and remote tags, stamp, commit, pull --rebase, tag, push, publish
// This process is does everything we need.
// The difficulty is in implementing the first step.
//
// 4) stash, pull --rebase, stash pop, determine "next" version, stamp, commit, tag, push, publish
// This is just as good as 3 and is easier.  It does everything we need, well, for the typical commit.
//
// We will go with the fourth.
//
var git_sync = function(folder,tag_params,stamp_callback_function)
{
    Array.prototype.plus = function (other_array) {
        other_array.forEach(function(v) {this.push(v)}, this);
    }

    var blip = "";
    try {

        process.chdir(path.normalize(folder));

        var changes = git_changes(folder);

        var remote_changes = git_remote_changes(folder);
        if (changes) {
            changes = (changes.length>0);
        }
        if (remote_changes) {
            remote_changes = (remote_changes.length>0);
        }

        var any_changes = changes || remote_changes;

        // Currently we bail out before printing "---" blip, as it's fairly chatty.
        if (!any_changes)
        {
            // There may be more to do after we return, doh!
            // process.exit(0);
            
            return 0;
        }

        // Build blip.
             if (changes && remote_changes && !tag_params.pull_only) { blip = '<=>'; }
        else if (changes && !tag_params.pull_only                  ) { blip = '>>>'; }
        else if (remote_changes                                    ) { blip = '<<<'; }
        else                                                         { blip = '---'; }

        // We can't get the version here because we haven't done a pull yet and we don't yet know what it will be.     
        // if (git_version_valid(version)    ) { blip += ' ['+version+']'; }

        console.log('----------------------------------');
        console.log(blip + ' ' + folder);
        console.log('----------------------------------');

        // If comment is anything other than blank, build a proper comment format that we can slap on the end of cmd.
        var comment = tag_params.comment;
        if (comment.length > 0)
        {
            comment = " -m \"" + comment + "\"";
        }

        if (changes && remote_changes) {
            // Why did we originally use --keep-index here?
            // ru.run_command_quietly('git stash --keep-index');
            ru.run_command_sync_to_console('git stash');
        }

        // See note in function header regarding --rebase
        if (remote_changes) {
            ru.run_command_sync_to_console('git pull --rebase');
        }

        if (changes && remote_changes) {
            ru.run_command_sync_to_console('git stash pop');
        }

        // We are now ready to push.  Bail out if we only wanted pull.
        if (tag_params.pull_only)
            return 0;
        
        if (changes) {
            if (tag_params.notag) {

                // Just commit, no tag work at all.
                ru.run_command_sync_to_console('git commit -a' + comment);

            } else {

                // Now we can get the "next" version.
                // We had to wait until after the pull,
                // since there may have been newer REMOTE version tags.
                var version;
                     if (tag_params.major) { version = git_next_major(); }
                else if (tag_params.minor) { version = git_next_minor(); }
                else                       { version = git_next_patch(); }
                if (!git_version_valid(version)) {
                    console.log("Can't determine 'next' version of current tag...");
                    process.exit(1);
                }

                // Here is where we would do any version stamping into whatever product or app we are supporting.
                // This is very app-specific, so we expect an (optional) callback function to get it done, if desired.
                //
                // Here's how you provide the function signature:
                //
                //      var tag_params = vc.parse_tag_parameters(process.argv);
                //      var app_stamp_callback_function = function(err, version) {
                //          if (err) throw err; // Check for the error and throw if it exists.
                //          // STAMP VERSION INTO PRODUCT CODE as needed
                //      };
                //      git_sync('.',tag_params,app_stamp_callback_function);
                //
                if (stamp_callback_function)
                {
                    // We don't want to throw an error, so we pass null for the error argument
                    // See: http://stackoverflow.com/questions/19739755/nodejs-callbacks-simple-example
                    stamp_callback_function(null, version);
                }

                // Make sure your editor waits before returning if you want to be able to provide comments on the fly.
                // TODO get on-the-fly commit message and use as the tag message.  Right now we prompt twice.

                // Commit
                ru.run_command_sync_to_console('git commit -a' + comment);

                // Tag
                ru.run_command_sync_to_console('git tag -a' + comment + ' ' + version);
            }
        }

        // Always push in case we already committed something
        // You should really make [--follow-tags] the default via push.followTags
        ru.run_command_sync_to_console('git push --follow-tags');

        // Erp... this is causing failure in scripts.  We need to return 0 on success.
        // Return true if there were changes.
        // return changes;

        return 0;
    }
    catch (err) {
        // NOTE: this is VERY noisy...
        // console.log(err);

        // If blip is not set, we had an earlier error in just trying to connect to the repo.
        if (blip == "") {
            console.log('----------------------------------');
            console.log("*** ["+folder+"] WARNING: git-sync could not connect to this repo...");
            console.log('----------------------------------');
        } else {
            console.log("*** ["+folder+"] WARNING: git-sync did not complete, check repo for conflicts...");
            console.log('----------------------------------');
        }
        
        return -1;
    }
}


// =========== git_clone: clones a repo ============
var git_clone = function(remote_repo,local_folder,sync)
{
    var exec;
    if (sync)
        exec = require('child_process').execSync;
    else 
        exec = require('child_process').exec;

    // Make sure the task specifies the full target folder since these may be called async.
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

        console.log("No semantic version tag found, creating 0.0.0...");
        var tagattempt = ru.run_command_sync('git tag -a -m "rad-scripts auto-created initial tag" 0.0.0');
        desc = ru.run_command_sync('git describe --always --tags').trim();

        // If we still don't have a valid version, it's likely that the repo has just been created.
        // The user will need to commit first to create HEAD.
        // We COULD try committing... but that is fraught with peril to do right here...
        if (!git_version_valid(desc)) {
            console.log("Unable to tag - perhaps you need to make an initial commit first to actually create HEAD.\nOutput:\n"+tagattempt+"\n");
            return unknown_version;
        }
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


// NOTE: These are used by git-sync to determine the "next" version.

// =========== git_next_major ============
var git_next_major = function() {
    var desc = git_version();
    if (desc == unknown_version) return desc;
    return next_major(desc);
}
var next_major = function(desc) {
    var tokens = desc.match(/([0-9]*).*/);
    var major = parseInt(tokens[1]) + 1;
    if (major == null) return unknown_version;

    return major+".0.0";
}


// =========== git_next_minor ============
var git_next_minor = function() {
    var desc = git_version();
    if (desc == unknown_version) return desc;
    return next_minor(desc);
}
var next_minor = function(desc) {
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
    return next_patch(desc);
}
var next_patch = function(desc) {
    var tokens = desc.match(/([0-9]*).([0-9]*).([0-9]*)/);
    var major = tokens[1];
    var minor = tokens[2];
    var patch = parseInt(tokens[3]) + 1;
    if (major == null || minor == null || patch == null) return unknown_version;

    return major+"."+minor+"."+patch;
}


// =========== git_next_build (DEPRECATED in most use cases): gets the git version, then strips hash and increments the commit count by one ============
var git_next_build = function () {

    var desc = git_version();
    if (desc == unknown_version) return desc;
    return next_build(desc);
}
var next_build = function (desc) {
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
var git_tag_list = function(tag_params) {

    var head = 10
    if (tag_params.comment != null && tag_params.comment.length)
	head = tag_params.comment
	
    // get tags, then sort output numerically
    ru.run_command_sync_to_console("git tag -n|sort -V -r|head -"+head);

    // OLD way, output does not pipe properly if we don't sync_to_console
    // return ru.run_command_sync("git tag -n | sort -n | tail "+message);  <-- doesn't pipe
}


// =========== git_branchlog: show a concise branch merge history ============
var git_branchlog = function(tag_params) {

    // branches, prettified; see here:
    //     https://stackoverflow.com/questions/1838873/visualizing-branch-topology-in-git

    var cmd = "git log --graph --oneline --all"

    // by default we simplify
    // if any chars were typed after the command, then don't simplify (ie show all commits)
    if (tag_params.comment == null || tag_params.comment.length == 0)
        cmd += " --simplify-by-decoration"

    ru.run_command_sync_to_console(cmd);
}


// =========== git_log: concise pretty log ============
var git_log = function(tag_params) {

    var head = 10
    if (tag_params.comment != null && tag_params.comment.length)
        head = tag_params.comment

    // get log, prettified; see here:
    //     http://stackoverflow.com/questions/1441010/the-shortest-possible-output-from-git-log-containing-author-and-date
    // ru.run_command_sync_to_console("git log --pretty=\"%C(auto,yellow)%h%C(auto,magenta)% G? %C(auto,blue)%>(12,trunc)%ad %C(auto,green)%<(7,trunc)%aN%C(auto,reset)%s%C(auto,red)% gD% D\" --date=relative|head "+tag_params.comment);
    // ru.run_command_sync_to_console("git log --pretty=\"%C(auto,blue)%>(12,trunc)%ad %C(auto,red)% gD% D %C(auto,reset)%s %C(auto,white)%aN\" --date=relative -"+head);
    ru.run_command_sync_to_console("git log --pretty=\"%h %C(auto,blue)%>(12,trunc)%ad %C(auto,reset)%<(65,trunc)%s %C(auto,red)%>(12,trunc)%D %C(auto,white)%an\" --date=relative -"+head);
}


//=========== git_skip: tell git to start ignoring upstream and local changes to the given file ============
var git_skip = function(file) {
    ru.run_command_sync_to_console("git update-index --skip-worktree "+file);
}


//=========== git_noskip: tell git to stop ignoring upstream and local changes to the given file ============
var git_noskip = function(file) {
    ru.run_command_sync_to_console("git update-index --no-skip-worktree "+file);
}


//=========== git_skiplist: list the files for which git is currently ignoring upstream and local changes ============
var git_skiplist = function() {
    try {
        ru.run_command_sync_to_console("git ls-files -v . | grep ^S");
    }
    catch (err) {
    }
}


//=========== git_folder_from_url: extract top level folder name ============
var git_folder_from_url = function(url) {

    // Get project name out of this:
    // ssh://user@me.com:1000/subdirs/folder.git
    var git_regex = "/([a-zA-Z0-9-]+)([.]git)?$";
    var greg_result = url.match(git_regex);
    if (greg_result && greg_result[1])
        return greg_result[1];
    else
        return "unknown";
}


// =========== parse_tag_parameters: utility commonly needed to parse tag-based command line parameters ============
var parse_tag_parameters = function(argv,noslice) {

    // Typical node argv sets include [#path#/node #path#/node_cmd param1 param2 ...]
    // By default, we slice off the first two, but some callers do that themselves.
    var args;
    if (noslice)
        args = argv;
    else
        args = argv.slice(2);

    var major = 0;
    var minor = 0;
    var pull_only = 0;

    // If there are no changes, don't bother with the version.
    // NOTE: This is actually important for new repos that have not been tagged yet.
    // We don't want to mess with them yet by trying to force the first tag.
    var changes = git_changes('.');
    if (changes.length)
    {
             if (args[0] == '--major') { major = 1; args = args.slice(1); }
        else if (args[0] == '--minor') { minor = 1; args = args.slice(1); }
        else if (args[0] == '--pull-only') { pull_only = 1; args = args.slice(1); }

        // We used to actually get the version here.
        // The reason we CAN'T is that there may be newer REMOTE version tags that we haven't pulled at this time.
        // We need to determine the actual next version LATER in git-sync.
        /*
             if (args[0] == '--major') { version = git_next_major(); args = args.slice(1); }
        else if (args[0] == '--minor') { version = git_next_minor(); args = args.slice(1); }
        else if (args[0] == '--patch') { version = git_next_patch(); args = args.slice(1); }
        else                           { version = git_next_patch()                        }
        if (!git_version_valid(version)) {
            process.exit(1);
        }
        */
    }

    var comment = ru.combine_params(args);

    return {
        "major" : major,
        "minor" : minor,
        "pull_only" : pull_only,
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
module.exports.git_branchlog = git_branchlog;
module.exports.git_log = git_log;
module.exports.git_tag_list = git_tag_list;
module.exports.git_next_major = git_next_major;
module.exports.git_next_minor = git_next_minor;
module.exports.git_next_patch = git_next_patch;
module.exports.git_next_build = git_next_build;
module.exports.next_major = next_major;
module.exports.next_minor = next_minor;
module.exports.next_patch = next_patch;
module.exports.next_build = next_build;
module.exports.git_skip = git_skip;
module.exports.git_noskip = git_noskip;
module.exports.git_skiplist = git_skiplist;
module.exports.git_folder_from_url = git_folder_from_url;
module.exports.parse_tag_parameters = parse_tag_parameters;
module.exports.npm_update_version = npm_update_version;
module.exports.svn_last_changed_rev = svn_last_changed_rev;
module.exports.svn_rev = svn_rev;
module.exports.build_semantic_version = build_semantic_version;
