
grunt-deploy-with-md5 is used in deployment
------

### Features:

* copy file from directory `a` to `b`, rename files with stamps
* the stamps of files are like `name.{%s date}-{%s md5}.extname`
* update script tags in the HTML file

### Usage:

Download via NPM:

```bash
npm install --save deploy-with-md5
```

`Gruntfile.coffee` like this:

```coffee
module.exports = (grunt) ->

  options =
    coffee:
      compile:
        options:
          bare: yes
          watch: yes
        files:
          'tasks/copy.js': 'coffee/copy.coffee'
    'deploy-with-md5':
      demo:
        files:
          'test/dest/': 'test/src/*'
        html: [
          'test/html/a.html'
        ]

  grunt.initConfig options

  grunt.loadNpmTasks 'grunt-contrib-coffee'

  grunt.task.loadTasks 'tasks'

  grunt.registerTask 'build', ['coffee:compile']
  grunt.registerTask 'test', ['deploy-with-md5:demo']
```

This plugin renames file from `test/src/` to `test/dest` with md5 and timestamps.
Also it will update the MD5 string in the given HTML files.

### Notice

This plugin is not will tested.
Be sure to know [Grunt][wiki] when you want to use this plugin.

[wiki]: https://github.com/gruntjs/grunt/wiki

### License

MIT