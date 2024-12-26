# rad-scripts
Robust tooling for node-based command line scripting.

Stop (re-)learning cryptic unintuitive bash.  Tap the full power of node modules on the command line.  This is all you need to write quick scripts, or deep cut async multi-stage programs.

NOTE that there are other tools that leverage this toolset, for example, see:
[@moodboom/git-semver](https://www.npmjs.com/package/%40moodboom%2Fgit-semver)

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
* ping:                        Ping the specified host and return true/false
* ping_google:                 Ping google.com and return true/false
* ping_gw:                     Ping local gateway and return true/false
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
* sync:                        used to publish rad-scripts, using git-sync from @moodboom/git-semver
* update:                      used to publish rad-scripts, using git-sync from @moodboom/git-semver
* list-commands:               lists all available commands
* make-folder:                 [path] > makes the folder (even if deep), returns true if succeeds or already exists


Most recent commits...
  7958888  3 weeks ago Get latest git-semver fixes                           HEAD -> mai.. Michael Behrns-Miller [cob..
  dc2fbd9  3 weeks ago Update eslint dev dep                                   tag: 5.0.14 Michael Behrns-Miller [cob..
  8d65f53  4 weeks ago Npm update                                              tag: 5.0.13 Michael Behrns-Miller [cob..
  f894bd5  4 weeks ago Import fixes                                             tag: 0.0.0 Michael Behrns-Miller [cob..

Version 5.0.16
