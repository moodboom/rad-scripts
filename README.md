# rad-scripts
Easily add semantic versioning to all your git repositories, and integrate the versioning into your apps.

The rad-scripts mantra:

   Automatically tag your code with a semantic version every time you push

Rad-scripts facilitates semantic versioning of git repositories.
Following semantic versioning guidelines, developers can tag 
major/minor/patch releases without knowing numeric tag details.
Instead, the developer can focus on whether commits since the last tag 
include breaking changes (major), addition of new functionality (minor), 
or bugfixes (patch).  

To painlessly kick things off, just start using git-sync to push your changes.
This automatically applies semantic version tags to your code, starting with v0.0.0.
Use --major when pushing breaking changes, and --minor when pushing new features.
Other than that, it should all be automatic.

In more complex continuously automated environments, rad-scripts provides a framework
for you to stamp the "next version" into your code base right before pushing.
Best practice is to create an app-specific "stamp" script for your app, and use it for every commit.
Any type of app is supported, through a generic callback; npm module publishing is also supported.
See rs-sync-cmd.js for a complete example that is used to publish rad-scripts itself.

git-sync is the primary command.  It automates version stamping through a rebased push:

  stash, pull --rebase, stash pop, determine "next" version, stamp, commit, tag, push, publish

git-sync will drop you back to the command line on any conflicts.  Automating this workflow can save hours.

Common commands:

* git-sync                   [--major|--minor|--patch] [msg msg...] > stash, pull, pop, stamp, commit, tag, push
* git-sync-notag             > a git-sync version to commit code without a tag; bad form perhaps, but up to you

* git-log                    [--branch|-b name] [count] > an opinionated pretty colored git log, clipped to ~110 chars
* git-branchlog              [--branch|-b name OR -all|-a] [--with-commits|-c] > an opinionated branch summary log
* git-tag-list               > list tags, including one line from the annotaged tag's commit message

* git-skip                   [file] > tell git to start ignoring upstream and local changes to the given file
* git-noskip                 [file] > tell git to stop ignoring upstream and local changes to the given file
* git-skiplist               > list the files for which git is currently ignoring upstream and local changes

* npm-update-version         [version] > inject the current version into package.json
* rs-sync                    [--major|--minor] [msg msg...] > dogfooding 101: use rad-scripts to publish rad-scripts

* list-commands              > lists all available commands


See https://bitpost.com/news for more bloviating.  Devs don't need no stinkin ops.   Happy automating!  :-)


Most recent commits...
4175ed1 11 months .. git-log widened tag by 1 char                                                                                                                                                                HEAD -> mas.. Michael Behrns-Miller [mel..
4f9c3dc 1 year, 8 .. git-log now nicely fills pretty much any size terminal window using tput                                                                                                                      tag: 4.10.12 Michael Behrns-Miller [vip..
29041b9 1 year, 9 .. Put in delay before tail using new sleep function Really I swear Dammit Stupidness Try again loser                                                                                            tag: 4.10.11 Michael Behrns-Miller [vip..
cbf43c8 1 year, 9 .. Javascript sleep function fixup in run-utils.js Third time a charm                                                                                                                            tag: 4.10.10 Michael Behrns-Miller [vip..

Version 4.10.14
