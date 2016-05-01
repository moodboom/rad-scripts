# rad-scripts
My rad scripts: reusable node functions for rapid app development, continuous integration, and semantic versioning.

Includes:
* run-utils: run a command [sync/async] and get output; run an array of commands in specified folders
* folder-utils: cd to the first found directory in an array (important for finding base folder of projects on different OSes/machines); walk files; walk folders
* version-control: git semantic versioning via tags; sync git repos (auto commit+pull+push); extract svn revisions

Semantic versioning is available for git repositories through the following commands:
* git-tag-major msg...
* git-tag-minor msg...
* git-tag-patch msg...
Following semantic versioning guidelines, developers can tag major/minor/patch releases without knowing numeric tag details.  The developer can then focus on whether commits since the last tag include breaking changes (major), addition of new functionality (minor), or bugfixes (patch).