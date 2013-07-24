
moment = require 'moment'
MD5 = require 'MD5'
path = require 'path'
fs = require 'fs'

filenamePattern = /^([\w\.]{3,10}\.)(\d{8}-[\w\d]{32}\.)?(\w{2,6})$/

makeDate = -> moment().utc().format('MMDDHHmm')
matchName = (name, md5text) -> name.indexOf(md5text) >= 0
excapeDot = (text) -> text.replace(/\./g, '\\.')

module.exports = (grunt) ->
  grunt.file.defaultEncoding = 'utf8'

  grunt.registerMultiTask 'deploy-with-md5', 'update time and md5 in filenames', ->
    @files.map (item) =>
      grunt.log.writeln 'for dest: "%s"', item.dest

      oldBasenameList = fs.readdirSync item.dest
      srcMD5List = []

      currentBasenameList = []

      item.src.map (srcPathname) =>
        grunt.log.writeln 'found file: "%s"', srcPathname
        # generate md5
        md5 = MD5 grunt.file.read srcPathname
        srcMD5List.push md5
        # generate newName
        srcBasename = path.basename srcPathname
        match = srcBasename.match filenamePattern
        appName = match[1]
        extName = match[3]
        pattern = "#{excapeDot appName}(\\d{8}-[0-9a-f]{32})?\\.#{extName}"
        newRegexp = new RegExp pattern, 'g'
        # console.log 'generated RegExp:', newRegexp
        # generated RegExp
        pickName = "#{appName}#{makeDate()}-#{md5}.#{extName}"
        pickPathname = path.join item.dest, pickName
        # if md5 is still there, don't change
        theOldBasepath = oldBasenameList.filter((name) -> matchName name, md5)[0]
        if theOldBasepath?
          oldBasename = path.basename theOldBasepath
          grunt.log.ok 'file "%s" is not modified', oldBasename
          pickName = oldBasename
        else
          grunt.log.writeln 'file "%s" changed, updating', srcPathname
          grunt.file.copy srcPathname, pickPathname
          grunt.log.ok 'generated file "%s"', pickPathname
        # update html with new name based pattern
        grunt.log.ok 'updating html using: "%s"', pickName
        @data.html.map (htmlName) =>
          content = grunt.file.read htmlName
          content = content.replace newRegexp, pickName
          grunt.file.write htmlName, content
        # record the names in use
        currentBasenameList.push pickName
      # delete one that not used
      oldBasenameList.map (givenBasename) ->
        unless givenBasename in currentBasenameList
          oldPathname = path.join item.dest, givenBasename
          grunt.log.warn 'removing old file: "%s"', oldPathname
          grunt.file.delete oldPathname