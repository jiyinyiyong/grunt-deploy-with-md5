var MD5, excapeDot, filenamePattern, fs, makeDate, matchName, moment, path,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

moment = require('moment');

MD5 = require('MD5');

path = require('path');

fs = require('fs');

filenamePattern = /^([\w\.]{3,10}\.)(\d{8}-[\w\d]{32}\.)?(\w{2,6})$/;

makeDate = function() {
  return moment().utc().format('MMDDHHmm');
};

matchName = function(name, md5text) {
  return name.indexOf(md5text) >= 0;
};

excapeDot = function(text) {
  return text.replace(/\./g, '\\.');
};

module.exports = function(grunt) {
  grunt.file.defaultEncoding = 'utf8';
  return grunt.registerMultiTask('deploy-with-md5', 'update time and md5 in filenames', function() {
    var _this = this;
    return this.files.map(function(item) {
      var currentBasenameList, oldBasenameList, srcMD5List;
      grunt.log.writeln('for dest: "%s"', item.dest);
      oldBasenameList = fs.readdirSync(item.dest);
      srcMD5List = [];
      currentBasenameList = [];
      item.src.map(function(srcPathname) {
        var appName, extName, match, md5, newRegexp, oldBasename, pattern, pickName, pickPathname, srcBasename, theOldBasepath;
        grunt.log.writeln('found file: "%s"', srcPathname);
        md5 = MD5(grunt.file.read(srcPathname));
        srcMD5List.push(md5);
        srcBasename = path.basename(srcPathname);
        match = srcBasename.match(filenamePattern);
        appName = match[1];
        extName = match[3];
        pattern = "" + (excapeDot(appName)) + "(\\d{8}-[0-9a-f]{32})?\\." + extName;
        newRegexp = new RegExp(pattern, 'g');
        pickName = "" + appName + (makeDate()) + "-" + md5 + "." + extName;
        pickPathname = path.join(item.dest, pickName);
        theOldBasepath = oldBasenameList.filter(function(name) {
          return matchName(name, md5);
        })[0];
        if (theOldBasepath != null) {
          oldBasename = path.basename(theOldBasepath);
          grunt.log.ok('file "%s" is not modified', oldBasename);
          pickName = oldBasename;
        } else {
          grunt.log.writeln('file "%s" changed, updating', srcPathname);
          grunt.file.copy(srcPathname, pickPathname);
          grunt.log.ok('generated file "%s"', pickPathname);
        }
        grunt.log.ok('updating html using: "%s"', pickName);
        _this.data.html.map(function(htmlName) {
          var content;
          content = grunt.file.read(htmlName);
          content = content.replace(newRegexp, pickName);
          return grunt.file.write(htmlName, content);
        });
        return currentBasenameList.push(pickName);
      });
      return oldBasenameList.map(function(givenBasename) {
        var oldPathname;
        if (__indexOf.call(currentBasenameList, givenBasename) < 0) {
          oldPathname = path.join(item.dest, givenBasename);
          grunt.log.warn('removing old file: "%s"', oldPathname);
          return grunt.file["delete"](oldPathname);
        }
      });
    });
  });
};
