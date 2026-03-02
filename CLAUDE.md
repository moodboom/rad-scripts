# rad-scripts

Public npm library: robust tooling for node-based command line scripting.

## Architecture
- **index.js**: re-exports all modules
- **run-utils.js**: shell command execution (`run_command_sync`, `run_command_sync_to_console`, etc.), `hasArg`, `combine_params`, `hostname`, `ping`, `sleep`
- **folder-utils.js**: filesystem ops (`folder_exists`, `file_exists`, `make_folder`, `walk`, `fileRegexReplace`, etc.)
- **string-utils.js**: `string_pad`
- **rad.js**: CLI handler for `rad sync`/`rad update` (self-publishing)
- **rad-cmd.js**, **make-folder-cmd.js**: bin entry points

## Dependencies
- `@moodboom/git-semver` — circular dependency (git-semver also depends on rad-scripts); works via npm deduplication
- `minimatch` — glob pattern matching for `walk()` and `get_files_in_one_dir()`
- `spawn-args` — CommonJS module, imported via `createRequire`

## Git Workflow
- Always commit and push with: `mh s <commit message>` (also publishes npm modules)
- On commit: compress context, update CLAUDE.md with completed changes, then run `mh s <message>` to commit and push

## Publishing
- Published to npm as `rad-scripts`
- `mh s <comment>` commits, tags, pushes, and publishes in one step
- `files` field in package.json controls what gets published
- `package-lock.json` is gitignored (library, not app)

## Testing
- `npm test` runs `node test.js` (24 tests, no framework)
- Tests cover: string_pad, hasArg, combine_params, hostname, run_command_sync, ping (including injection safety), sleep, folder/file ops, fileRegexReplace

## Security
- `ping()` uses `execFileSync` with argument array (no shell injection)
- `run_command_sync` and friends pass strings to shell — callers must not interpolate untrusted input
- `ping_gw()` gets gateway first, then passes it through safe `ping()`

## Conventions
- ES modules (`"type": "module"`)
- Consistent whitespace style: spaces inside parens/brackets, 2-space indent
- No linter configured (eslint was removed — broken config)
- `var` still used in some older functions; prefer `const`/`let` for new code

## .gitignore
- `node_modules`
- `package-lock.json`
