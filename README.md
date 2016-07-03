# rad-scripts
Easily add semantic versioning to all your git repositories, and integrate the versioning into your apps.

The rad-scripts mantra:
   Every time you post code, you should tag it with a new semantic version

Usage: rad [command]

Rad-scripts facilitates semantic versioning of git repositories.
Following semantic versioning guidelines, developers can tag 
major/minor/patch releases without knowing numeric tag details.
Instead, the developer can focus on whether commits since the last tag 
include breaking changes (major), addition of new functionality (minor), 
or bugfixes (patch).  

To painlessly kick things off, just start using git-sync to commit your changes.
This automatically applies semantic version tags to your code, starting with v0.0.0.
Use --major when committing breaking changes, and --minor when committing new features.
Other than that, it should all be automatic.

In more complex continuously automated environments, rad-scripts provides a framework
for you to stamp the "next version" into your code base right before committing.
Best practice is to create an app-specific "stamp" script for your app, and use it for every commit.
Any type of app is supported, through a generic callback; npm module publishing is also supported.
See rs-sync-cmd.js for a complete example that is used to publish rad-scripts itself.

Commands include:

* git-sync                   [--major|--minor|--patch] [msg msg...] > stash, pull, pop, stamp, commit, tag, push

* git-tag-list               > list tags, including 1 line from the annotaged tag's commit message
* git-version                > returns the current git semantic version, based on [git describe]
* git-version-clean          > returns MAJOR.MINOR.PATCH git version (suffix stripped)

* git-next-major             > returns what would be the next MAJOR semantic version
* git-next-minor             > returns what would be the next MINOR semantic version
* git-next-patch             > returns what would be the next PATCH semantic version
* git-next-build             > returns what would be the next BUILD semantic version
* npm-update-version         [version] > inject the current version into package.json
* get-svn-rev                > parses and returns the svn current revision from [svn info]
* get-svn-last-changed-rev   > parses and returns the svn last-changed revision from [svn info]
* git-sync-notag             a git-sync version to commit code without a tag; bad form perhaps, but up to you

* rs-update-readme           > dogfooding 101: use rad-scripts to dynamically update README.
* rs-sync                    [--major|--minor] [msg msg...] > dogfooding 102: use rad-scripts to publish rad-scripts

Utilities include:

* run-utils           > run a command [sync/async] and get output; run an array of commands in specified folders
* folder-utils        > cd to the first found directory in an array (important for finding base folder of projects on different OSes/machines); walk files; walk folders
* string-utils        > string_pad, etc.
* version-control     > git semantic versioning via tags; sync git repos (auto commit+pull+push); extract svn revisions

See https://bitpost.com/news for more bloviating.  Devs don't need no stinkin ops.   Happy automating!  :-)


