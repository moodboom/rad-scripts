# rad-scripts
Easy semantic versioning of git repositories along with other rapid app dev tools.

usage: rad [command]

The rad-scripts mantra:
   Every time you post code, you should tag it with a new semantic version

Rad-scripts facilitates semantic versioning of git repositories.
Following semantic versioning guidelines, developers can tag 
major/minor/patch releases without knowing numeric tag details.  
Instead, the developer can focus on whether commits since the last tag 
include breaking changes (major), addition of new functionality (minor), 
or bugfixes (patch).  

For simpler environments, you can use git-tag-xxx commands out of the box.
These apply tags to the latest code via: commit pull push tag push.

In more complex continuously automated environments, use git-next-xxx to
determine the pending version and apply it to the code base right before committing.
Best practice is to create 3 app-specific major,minor,patch commit scripts
that manage the details, and use them for every commit.

See rs-xxx scripts (used to publish rad-scripts itself).

Commands include:

* git-sync                   [msg msg...] > commits any changes in the current branch, pulls remote changes, and pushes the result
* git-version                > returns the current git semantic version, based on [git describe]
* git-version-clean          > returns MAJOR.MINOR.PATCH git version (suffix stripped)
* git-tag-list               > list tags, including 1 line from the annotaged tag's commit message
* git-next-major             > returns what would be the next MAJOR semantic version
* git-next-minor             > returns what would be the next MINOR semantic version
* git-next-patch             > returns what would be the next PATCH semantic version
* git-next-build             > returns what would be the next BUILD semantic version
* git-tag-major              [msg msg...] > creates a tag that represents the next MAJOR semantic version; minor+patch+build are reset to 0
* git-tag-minor              [msg msg...] > creates a tag that represents the next MINOR semantic version; patch+build are reset to 0
* git-tag-patch              [msg msg...] > creates a tag that represents the next PATCH semantic version; build resets to 0
* npm-update-version         [version] > inject the current version into package.json
* get-svn-rev                > parses and returns the svn current revision from [svn info]
* get-svn-last-changed-rev   > parses and returns the svn last-changed revision from [svn info]

* rs-update-readme           > dogfooding 101: use rad-scripts to dynamically update README.
* rs-patch                   [msg msg...] > dogfooding 301: top-level dev script to commit and publish an rs patch
* rs-minor                   [msg msg...] > dogfooding 302: top-level dev script to commit and publish an rs minor release
* rs-major                   [msg msg...] > dogfooding 303: top-level dev script to commit and publish an rs major release

Utilities include:

* run-utils           > run a command [sync/async] and get output; run an array of commands in specified folders
* folder-utils        > cd to the first found directory in an array (important for finding base folder of projects on different OSes/machines); walk files; walk folders
* string-utils        > string_pad, etc.
* version-control     > git semantic versioning via tags; sync git repos (auto commit+pull+push); extract svn revisions

See https://bitpost.com/news for more bloviating.  Devs don't need no stinkin ops.  Happy automating!  :-)


