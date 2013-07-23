var MD5, excapeDot, filenameRegexp, fs, makeDate, matchName, moment, path;

moment = require('moment');

MD5 = require('MD5');

path = require('path');

fs = require('fs');

filenameRegexp = /^([\w\.]{3,10}\.)(\d{8}-[\w\d]{32}\.)?(\w{2,6})$/;

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
      var md5List, oldFiles;
      grunt.log.debug('for dest: "%s"', item.dest);
      oldFiles = fs.readdirSync(item.dest);
      md5List = [];
      item.src.map(function(relativeFile) {
        var appName, extName, match, md5, newName, newPathName, newRegexp, oldBasename, pattern;
        grunt.log.debug('found file: "%s"', relativeFile);
        md5 = MD5(grunt.file.read(relativeFile));
        md5List.push(md5);
        oldBasename = path.basename(relativeFile);
        match = oldBasename.match(filenameRegexp);
        appName = match[1];
        extName = match[3];
        pattern = "" + (excapeDot(appName)) + "(\\d{8}-[0-9a-f]{32})?\\." + extName;
        newRegexp = new RegExp(pattern, 'g');
        newName = "" + appName + (makeDate()) + "-" + md5 + "." + extName;
        newPathName = path.join(item.dest, newName);
        console.log('generated RegExp:', newRegexp);
        grunt.log.ok('updating html using: "%s"', newName);
        _this.data.html.map(function(name) {
          var content;
          content = grunt.file.read(name);
          content = content.replace(newRegexp, newName);
          return grunt.file.write(name, content);
        });
        if (oldFiles.some(function(name) {
          return matchName(name, md5);
        })) {
          return grunt.log.ok('file "%s" is not modified', relativeFile);
        } else {
          grunt.log.ok('file "%s" changed, updating', relativeFile);
          grunt.file.copy(relativeFile, newPathName);
          return grunt.log.ok('generated file "%s"', newPathName);
        }
      });
      return oldFiles.map(function(name) {
        var oldPathname;
        if (!(md5List.some(function(md5) {
          return matchName(name, md5);
        }))) {
          oldPathname = path.join(item.dest, name);
          grunt.log.warn('removing old file: "%s"', oldPathname);
          return grunt.file["delete"](oldPathname);
        }
      });
    });
  });
};
