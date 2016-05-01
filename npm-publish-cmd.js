#!/usr/bin/env node

var fs = require('fs');
var ru = require('./run_utils.js');
var vc = require('./version_control.js';

var version = vc.git_version_clean();
console.log('Stamping version ['+version+']...');
fs.writeFileSync('version.txt', version, 'utf-8');

try {

    var filename = 'AboutDlgExtract.rc';
    var origversion = fs.readFileSync(filename, 'ucs-2');
    var newversion = origversion.replace(/\"DesignBase [0-9./]+\"/, '\"DesignBase '+m+'.'+n+'.'+p+'.'+b+'\"');
    var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var newversion = newversion.replace(/\"Date: .+\"/, '\"Date: '+date+'\"');
    fs.writeFileSync(filename, newversion, 'ucs-2');
    console.log(filename + " was updated...");


    // TODO

}
catch (err) {
    console.log("Version could not be updated: "+err);
    process.exit(1);
}
