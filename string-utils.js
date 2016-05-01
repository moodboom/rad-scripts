#!/usr/bin/env node


//=========== string_pad: string pad function originally from http://stackoverflow.com/a/24398129/717274 ============
// Usage is a little funky, as you have to provide a full-sized buffer, but the advantage is faster speed.
// Examples:
// 
//      string_pad('0000000000',123,true);
//      '0000000123'
// 
//      var padding = Array(256).join(' '), // make a string of 255 spaces
//      string_pad(padding,'abc,true);
//      result: 255-byte string ending in 'abc'
//
function string_pad(pad, str, padLeft) {
  if (typeof str === 'undefined') 
    return pad;
  if (padLeft) {
    return (pad + str).slice(-pad.length);
  } else {
    return (str + pad).substring(0, pad.length);
  }
}


module.exports.string_pad = string_pad;
