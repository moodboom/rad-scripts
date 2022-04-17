#!/usr/bin/env node

import { make_folder } from './folder-utils.js';

// 0 = node, 1 = script path, so we ignore those.
// 2 = target path
var target_path = process.argv[2];
make_folder(target_path);
