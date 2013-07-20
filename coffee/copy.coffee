
moment = require 'moment'
MD5 = require 'MD5'
path = require 'path'
fs = require 'fs'

filenameRegexp = /^([\w\.]{3,10}\.)(\d{8}-[\w\d]{32}\.)?(\w{2,6})$/

makeDate = -> moment().utc().format('MMDDHHmm')
matchName = (name, md5text) -> name.indexOf(md5text) >= 0
excapeDot = (text) -> text.replace(/\./g, '\\.')

module.exports = (grunt) ->
  grunt.file.defaultEncoding = 'utf8'

  grunt.registerMultiTask 'deploy-with-md5', 'update time and md5 in filenames', ->
    @files.map (item) =>
      grunt.log.debug 'for dest: "%s"', item.dest

      oldFiles = fs.readdirSync item.dest
      md5List = []

      item.src.map (relativeFile) =>
        grunt.log.debug 'found file: "%s"', relativeFile
        md5 = MD5 grunt.file.read(relativeFile)
        md5List.push md5
        # if md5 is still there, don't change
        if (oldFiles.some (name) -> matchName name, md5)
          grunt.log.ok 'file "%s" is not modified', relativeFile
        else
          grunt.log.ok 'file "%s" changed, updating', relativeFile
          oldBasename = path.basename relativeFile
          match = oldBasename.match filenameRegexp
          appName = match[1]
          extName = match[3]
          pattern = "#{excapeDot appName}(\\d{8}-[0-9a-f]{32})?\\.#{extName}"
          newRegexp = new RegExp pattern
          # generated RegExp
          newName = "#{appName}#{makeDate()}-#{md5}.#{extName}"
          newPathName = path.join item.dest, newName
          grunt.file.copy relativeFile, newPathName
          grunt.log.ok 'generated file "%s"', newPathName
          # update html with new name based pattern
          @data.html.map (name) =>
            grunt.log.ok 'updating html: "%s"', name
            content = grunt.file.read name
            content = content.replace newRegexp, newName
            grunt.file.write name, content
      # delete one that not used
      oldFiles.map (name) ->
        unless (md5List.some (md5) -> matchName name, md5)
          oldPathname = path.join item.dest, name
          grunt.log.warn 'removing old file: "%s"', oldPathname
          grunt.file.delete oldPathname