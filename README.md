# rad-scripts
Tools that allow you to easily use Javascript for all your scripting needs.

NOTE: previously embedded git semver commands have been moved to the git-semver module.
Install the [@moodboom/git-semver](https://www.npmjs.com/package/%40moodboom%2Fgit-semver) module to get that functionality.

Common functions and commands:

* run_command_sync_to_console: Run one command and let output immediately flow to console
* run_command_async_to_console:Async run one command and dump output to console when complete
* run_command_quietly:         Runs without output unless error
* run_command:                 Run a command asynchronously and get the output when it finishes in a callback
* run_command_sync:            Run a command synchronously and get the output when it finishes
* runsteps:                    Run a specific set of commands in specific directories
* hasArg:                      Check a set of args for a value; eg: hasArg( args, '--init')
* combine_params:              Combine an array of params with separator
* distro:                      Return distro name from lsb_release
* hostname:                    Return hostname
* ping_gw:                     Ping local gateway
* ping_google:                 Ping google.com
* cdfolder:                    cd to folder, return false if the folder doesn't exist
* cdfirst:                     change to first found folder from list of candidates
* make_folder:                 make the given folder (no matter how deep)
* folder_exists:               returns true if the folder exists
* link_exists:                 returns true if the link exists
* file_exists:                 returns true if the file exists
* file_diff:                   returns true if the two files differ
* find_first_folder:           find and return first existing folder in a list of candidates
* get_files_in_one_dir:        non-recursive get files
* walk:                        gather all files in a folder
* walksubdirs:                 Similar to previous, but only returns directories not files within them.
* fileRegexReplace:            find and replace the given regex in the file
* fileRegexReplaceMultiline:   find and replace across lines (gm)
* string_pad:                  Provide buffer and returns padded string
* rad-scripts-sync:            use git-sync from @moodboom/git-semver to commit and publish rad-scripts
* list-commands:               lists all available commands
* make-folder:                 [path] > makes the folder (even if deep), returns true if succeeds or already exists


Most recent commits...
6e9cafe 2 minutes .. Update packages                                         HEAD -> mas.. Michael Behrns-Miller [cast]
c791372  4 weeks ago Install                                                  tag: 4.10.47 Michael Behrns-Miller [hoa..
8d70c6a 3 months ago install                                                  tag: 4.10.46 Michael Behrns-Miller [abt..
6dc347d 3 months ago Version bump                                             tag: 4.10.45 Michael Behrns-Miller [pos..

Version 4.10.49
