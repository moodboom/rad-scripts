#!/usr/bin/env node

// Simple test suite for rad-scripts — no test framework needed.

import { strict as assert } from 'node:assert';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  string_pad,
  hasArg,
  combine_params,
  hostname,
  ping,
  ping_google,
  run_command_sync,
  folder_exists,
  file_exists,
  file_diff,
  make_folder,
  find_first_folder,
  get_files_in_one_dir,
  fileRegexReplace,
  sleep,
} from './index.js';

let passed = 0;
let failed = 0;

function test( name, fn ) {
  try {
    fn();
    passed++;
    console.log( `  [OK] ${name}` );
  } catch ( e ) {
    failed++;
    console.log( `  [FAIL] ${name}: ${e.message}` );
  }
}

console.log( '\nrad-scripts tests\n' );

// ---- string-utils ----

test( 'string_pad right-pads', () => {
  assert.equal( string_pad( '          ', 'hello' ), 'hello     ' );
});

test( 'string_pad left-pads', () => {
  assert.equal( string_pad( '0000000000', '123', true ), '0000000123' );
});

test( 'string_pad returns pad when str is undefined', () => {
  assert.equal( string_pad( 'xxx' ), 'xxx' );
});

// ---- run-utils: hasArg ----

test( 'hasArg finds value', () => {
  assert.equal( hasArg( [ '--init', '--verbose' ], '--init' ), true );
});

test( 'hasArg returns falsy for missing value', () => {
  assert.ok( !hasArg( [ '--init' ], '--other' ));
});

test( 'hasArg handles undefined args', () => {
  assert.ok( !hasArg( undefined, '--init' ));
});

// ---- run-utils: combine_params ----

test( 'combine_params joins with space', () => {
  assert.equal( combine_params( [ 'a', 'b', 'c' ] ), 'a b c' );
});

test( 'combine_params joins with custom separator', () => {
  assert.equal( combine_params( [ 'a', 'b' ], ',' ), 'a,b' );
});

test( 'combine_params handles empty/undefined', () => {
  assert.equal( combine_params( [] ), '' );
  assert.equal( combine_params( undefined ), '' );
});

// ---- run-utils: hostname ----

test( 'hostname returns a non-empty string', () => {
  const h = hostname();
  assert.ok( h.length > 0 );
  assert.equal( h, h.toLowerCase().trim() );
});

// ---- run-utils: run_command_sync ----

test( 'run_command_sync returns output', () => {
  const result = run_command_sync( 'echo hello' );
  assert.equal( result.trim(), 'hello' );
});

// ---- run-utils: ping ----

test( 'ping returns boolean', () => {
  const result = ping( 'localhost' );
  assert.equal( typeof result, 'boolean' );
});

test( 'ping rejects invalid host', () => {
  assert.equal( ping( 'host.invalid.zzz' ), false );
});

test( 'ping is safe from injection', () => {
  // This would execute "rm" via shell injection in the old version
  assert.equal( ping( '$(echo pwned)' ), false );
});

test( 'ping_google returns boolean', () => {
  assert.equal( typeof ping_google(), 'boolean' );
});

// ---- run-utils: sleep ----

test( 'sleep resolves after delay', async () => {
  const start = Date.now();
  await sleep( 50 );
  assert.ok( Date.now() - start >= 40 );
});

// ---- folder-utils ----

const tmpDir = mkdtempSync( join( tmpdir(), 'rad-test-' ));

test( 'folder_exists returns true for existing', () => {
  assert.equal( folder_exists( tmpDir ), true );
});

test( 'folder_exists returns false for missing', () => {
  assert.equal( folder_exists( '/no/such/folder/ever' ), false );
});

test( 'file_exists returns false for directory', () => {
  assert.equal( file_exists( tmpDir ), false );
});

test( 'make_folder creates nested dirs', () => {
  const deep = join( tmpDir, 'a', 'b', 'c' );
  make_folder( deep );
  assert.equal( folder_exists( deep ), true );
});

test( 'file_exists and file_diff work', () => {
  const f1 = join( tmpDir, 'f1.txt' );
  const f2 = join( tmpDir, 'f2.txt' );
  const f3 = join( tmpDir, 'f3.txt' );
  writeFileSync( f1, 'aaa' );
  writeFileSync( f2, 'bbb' );
  writeFileSync( f3, 'aaa' );
  assert.equal( file_exists( f1 ), true );
  assert.equal( file_diff( f1, f2 ), true );
  assert.equal( file_diff( f1, f3 ), false );
});

test( 'find_first_folder finds existing folder', () => {
  assert.equal( find_first_folder( [ '/no/such', tmpDir ] ), tmpDir );
});

test( 'get_files_in_one_dir matches pattern', () => {
  writeFileSync( join( tmpDir, 'test.txt' ), 'x' );
  writeFileSync( join( tmpDir, 'test.log' ), 'y' );
  const txtFiles = get_files_in_one_dir( tmpDir, '*.txt' );
  assert.ok( txtFiles.length >= 1 );
  assert.ok( txtFiles.every( f => f.endsWith( '.txt' )));
});

test( 'fileRegexReplace replaces content', () => {
  const f = join( tmpDir, 'replace.txt' );
  writeFileSync( f, 'hello world hello' );
  fileRegexReplace( f, 'hello', 'goodbye' );
  assert.equal( readFileSync( f, 'utf8' ), 'goodbye world goodbye' );
});

// cleanup
rmSync( tmpDir, { recursive: true, force: true });

// ---- summary ----

console.log( `\n${passed} passed, ${failed} failed\n` );
if ( failed > 0 ) process.exit( 1 );
