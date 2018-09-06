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

* git-log                    [count] > an opinionated pretty colored git log, 1-line-per-commit, clipped to ~110 chars
* git-tag-list               > list tags, including one line from the annotaged tag's commit message

* git-skip                   [file] > tell git to start ignoring upstream and local changes to the given file
* git-noskip                 [file] > tell git to stop ignoring upstream and local changes to the given file
* git-skiplist               > list the files for which git is currently ignoring upstream and local changes

* npm-update-version         [version] > inject the current version into package.json
* rs-sync                    [--major|--minor] [msg msg...] > dogfooding 101: use rad-scripts to publish rad-scripts

* rad                        [command] > show all available commands, can also be used to run commands if provided


Utilities include:

* run-utils           > run a command [sync/async] and get output; run an array of commands in specified folders
* folder-utils        > cd to the first found directory in an array (important for finding base folder of projects on different OSes/machines); walk files; walk folders
* string-utils        > string_pad, etc.
* version-control     > git semantic versioning via tags; sync git repos (auto commit+pull+push); extract svn revisions

See https://bitpost.com/news for more bloviating.  Devs don't need no stinkin ops.   Happy automating!  :-)


Most recent commits...
9536696  2 hours ago Added distro()                                                    HEAD -> ma.. Michael Behrns-Miller [mbehrnsm-silver]
9cbde54 6 months ago rad-scripts README small note                                       tag: 4.9.5 Michael Behrns-Miller [bitpost-gentoo]
443c7ad 6 months ago Documentation cleanup                                               tag: 4.9.4 Michael Behrns-Miller [bitpost-gentoo]
c561bc9 9 months ago Added file_exists                                                   tag: 4.9.3 Michael Behrns-Miller [bitpost-gentoo]

Version 4.9.7
