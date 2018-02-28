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

All commands:

* rad [command]              > show available commands, can also be used to run commands if provided
* git-sync                   [--major|--minor|--patch] [msg msg...] > stash, pull, pop, stamp, commit, tag, push
* git-sync-notag             > a git-sync version to commit code without a tag; bad form perhaps, but up to you

* git-tag-list               > list tags, including one line from the annotaged tag's commit message
* git-version                > returns the current git semantic version, based on [git describe]
* git-version-clean          > returns MAJOR.MINOR.PATCH git version (suffix stripped)

* git-next-major             > returns what would be the next MAJOR semantic version
* git-next-minor             > returns what would be the next MINOR semantic version
* git-next-patch             > returns what would be the next PATCH semantic version
* git-next-build             > returns what would be the next BUILD semantic version (less common)

* git-skip                   [file] > tell git to start ignoring upstream and local changes to the given file
* git-noskip                 [file] > tell git to stop ignoring upstream and local changes to the given file
* git-skiplist               > list the files for which git is currently ignoring upstream and local changes

* get-svn-rev                > parses and returns the svn current revision from [svn info]
* get-svn-last-changed-rev   > parses and returns the svn last-changed revision from [svn info]

* make-folder                [path] > makes the folder (even if deep), returns true if succeeds or already exists

* npm-update-version         [version] > inject the current version into package.json
* rs-sync                    [--major|--minor] [msg msg...] > dogfooding 101: use rad-scripts to publish rad-scripts

Utilities include:

* run-utils           > run a command [sync/async] and get output; run an array of commands in specified folders
* folder-utils        > cd to the first found directory in an array (important for finding base folder of projects on different OSes/machines); walk files; walk folders
* string-utils        > string_pad, etc.
* version-control     > git semantic versioning via tags; sync git repos (auto commit+pull+push); extract svn revisions

See https://bitpost.com/news for more bloviating.  Devs don't need no stinkin ops.   Happy automating!  :-)


Most recent commits...
c561bc9 2 months ago Added file_exists                                                 HEAD -> ma.. Michael Behrns-Miller [bitpost-gentoo]
2bdafa7 4 months ago Unlock restrictive package dependency versioning                    tag: 4.9.2 Michael Behrns-Miller [mbehrnsm-gold-ubuntu]
53adb62 8 months ago Added missing file                                                  tag: 4.9.1 Michael Behrns-Miller [bitpost-gentoo]
d21e0b3 8 months ago Updated make_dir to deep-capable make_folder Made available as ..   tag: 4.9.0 Michael Behrns-Miller [bitpost-gentoo]

Version 4.9.4
