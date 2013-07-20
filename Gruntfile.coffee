
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