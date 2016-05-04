# rad-scripts
Reusable node functions for rapid app development, continuous integration, and semantic versioning.

usage: rad [command]

Commands include:

* git-sync                   > commits any changes in the current branch, pulls remote changes, and pushes the result
* git-version                > returns the current git semantic version, based on [git describe]
* git-version-clean          > returns MAJOR.MINOR.PATCH git version (suffix stripped)
* git-tag-list               > list tags, including 1 line from the annotaged tag's commit message
* git-tag-major              > creates a tag that represents the next MAJOR semantic version; minor+patch+build are reset to 0
* git-tag-minor              > creates a tag that represents the next MINOR semantic version; patch+build are reset to 0
* git-tag-patch              > creates a tag that represents the next PATCH semantic version; build resets to 0
* git-next-version           > returns what would be the next version after the next commit; important for auto-stamping version into app
* npm-publish                > inject the current version into package.json, commit, and publish a new tagged release to npm
* get-svn-rev                > parses and returns the svn current revision from [svn info]
* get-svn-last-changed-rev   > parses and returns the svn last-changed revision from [svn info]
* rs-update-readme           > dogfooding 101: use rad-scripts to dynamically update README.
* rs-publish                 > dogfooding 201: use rad-scripts to publish a new rad-scripts release; see https://bitpost.com/news

Utilities include:

* run-utils           > run a command [sync/async] and get output; run an array of commands in specified folders
* folder-utils        > cd to the first found directory in an array (important for finding base folder of projects on different OSes/machines); walk files; walk folders
* string-utils        > string_pad, etc.
* version-control     > git semantic versioning via tags; sync git repos (auto commit+pull+push); extract svn revisions

Semantic versioning is available for git repositories.
Following semantic versioning guidelines, developers can tag 
major/minor/patch releases without knowing numeric tag details.  
The developer can then focus on whether commits since the last tag 
include breaking changes (major), addition of new functionality (minor), 
or bugfixes (patch).  

Tag commands perform a full set of git operations to ensure that 
the tag is applied to the latest local and remote code, and pushed.  
Precisely: commit pull push tag push.

To have ci automatically inject a semantic version into your app on every build, 
use the output of git-next-version to update your app's version 
right before committing.

Happy automating!  :-)

