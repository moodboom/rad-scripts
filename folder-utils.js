#!/usr/bin/env node

import * as path from 'path';
import * as fs from 'fs';
import { minimatch } from 'minimatch';

//=========== cdfolder: cd to folder, return false if the folder doesn't exist ============
export const cdfolder = function ( folder ) {

  // SYNCHRONOUS change wd and catch any error
  try {
    process.chdir( folder );
    return process.cwd();
  }
  catch ( err ) {
    return false;
  }
}

// =========== cdfirst: change to first found folder ============
export const cdfirst = function ( candidates ) {

  // NOTE that this is the way to get "home", cross-platform, if it is ever needed.
  // var homedir = (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME;

  for ( var i = 0; i < candidates.length; i++ ) {

    // ignore failures until we find one that works
    if ( cdfolder( candidates[ i ] ) ) {
      return process.cwd();
    }
  }

  var msg = "ERROR: No candidate folder found";
  console.log( msg );
  return msg;
};

// ========== make_folder : make the given folder (no matter how deep) =========
export const make_folder = function ( target_path ) {

  // We will catch EEXIST exceptions so we can return true if it already exists.
  try {

    const sep = path.sep;
    const initDir = path.isAbsolute( target_path ) ? sep : '';
    target_path.split( sep ).reduce( ( parentDir, childDir ) => {
      const curDir = path.resolve( parentDir, childDir );
      if ( !fs.existsSync( curDir ) ) {
        fs.mkdirSync( curDir );
      }
      return curDir;
    }, initDir );

  } catch ( e ) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}

//=========== folder_exists: returns true if the folder exists ============
export const folder_exists = function ( folder ) {
  try {
    return fs.statSync( folder ).isDirectory();
  }
  catch ( err ) {
    return false;
  }
}

//=========== link_exists: returns true if the link exists ============
export const link_exists = function ( folder ) {
  try {
    return fs.lstatSync( folder ).isSymbolicLink();
  }
  catch ( err ) {
    return false;
  }
}

//=========== file_exists: returns true if the file exists ============
export const file_exists = function ( file ) {
  try {
    return fs.statSync( file ).isFile();
  }
  catch ( err ) {
    return false;
  }
}

//=========== file_diff: returns true if the two files differ ============
export const file_diff = function ( file1, file2 ) {
  try {
    var file1_as_string = fs.readFileSync( file1, 'utf8' );
    var file2_as_string = fs.readFileSync( file2, 'utf8' );
    return file1_as_string != file2_as_string;
  }
  catch ( err ) {
    return false;
  }
}

// =========== find_first_folder: find and return first existing folder in a list of candidates ============
export const find_first_folder = function ( candidates ) {

  for ( var i = 0; i < candidates.length; i++ ) {
    if ( folder_exists( candidates[ i ] ) ) {
      return candidates[ i ];
    }
  }

  var msg = "ERROR: No candidate folder found";
  console.log( msg );
  return msg;
};


export function get_files_in_one_dir( dir, pattern, files_ ) {
  files_ = files_ || [];
  var files = fs.readdirSync( dir );
  for ( var i in files ) {
    // ODD CASE: Avoid non-owned properties, in case the base array definition has been extended.
    // NOTE We found that we needed this because we typically extend arrays to enable in-place array addition.
    // http://stackoverflow.com/questions/1374126/how-to-extend-an-existing-javascript-array-with-another-array-without-creating
    if ( files.hasOwnProperty( i ) ) {
      var name = dir + '/' + files[ i ];
      if ( !fs.statSync( name ).isDirectory() ) {
        if ( minimatch( files[ i ], pattern ) ) {
          files_.push( name );
        }
      }
    }
  }
  return files_;
}


// =========== walk: gather all files in a folder ============
// TODO node-dir is probably more robust/feature-filled, check it out!
export const walk = function ( dir, pattern, done ) {
  var results = [];


  // console.log(dir);


  fs.readdir( dir, function ( err, list ) {
    if ( err ) return done( err );
    var pending = list.length;
    if ( !pending ) return done( null, results );
    list.forEach( function ( file ) {
      file = path.resolve( dir, file );
      fs.stat( file, function ( err, stat ) {
        if ( stat && stat.isDirectory() ) {
          walk( file, pattern, function ( err, res ) {
            results = results.concat( res );
            if ( !--pending ) done( null, results );
          } );
        } else {

          if ( !pattern || minimatch( file, pattern ) ) {
            results.push( file );
          }

          // console.log(file);

          if ( !--pending ) done( null, results );
        }
      } );
    } );
  } );
};

// Similar to previous, but only returns directories not files within them.
export const walksubdirs = function ( dir, done ) {
  var results = [];
  fs.readdir( dir, function ( err, list ) {
    if ( err ) return done( err );
    var pending = list.length;
    if ( !pending ) return done( null, results );
    list.forEach( function ( file ) {
      file = path.resolve( dir, file );
      fs.stat( file, function ( err, stat ) {
        if ( stat && stat.isDirectory() ) {
          results.push( file );
          walksubdirs( file, function ( err, res ) {
            results = results.concat( res );
            if ( !--pending ) done( null, results );
          } );
        } else {
          if ( !--pending ) done( null, results );
        }
      } );
    } );
  } );
};

//=========== fileRegexReplace: find and replace the given regex in the file ============
export const fileRegexReplace = function ( filename, regex, replacement, flags = "g" ) {
  var file_as_string = fs.readFileSync( filename, 'utf8' );
  var reg = new RegExp( regex, flags );
  file_as_string = file_as_string.replace( reg, replacement );
  fs.writeFileSync( filename, file_as_string );
}
export const fileRegexReplaceMultiline = function ( filename, regex, replacement ) {
  return fileRegexReplace( filename, regex, replacement, "gm" );
}
