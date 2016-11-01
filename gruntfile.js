module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	var config = grunt.file.readYAML('Gruntconfig.yml');


	grunt.initConfig({
		concat:{
			dist:{
				src: config.jsSrcDir+'app.js',
				dest: config.jsDistDir+'app.js'
			}
		},

		jshint:{
			all:[
				'Gruntfile.js',
				config.jsSrcDir+'app.js'
				//config.jsSrcDir+"*.js"
			]
		},

		removelogging: {
			dist: {
				src: config.jsSrcDir+'app.js',
				dest: config.jsDistDir+'app.js',
			}
		},

		htmlmin:{
			dist:{
				options:{
					removeComments: true,
					collaspeWhitespace: true
				},
				files: {
					'dist/index.html' : 'src/index.html',
				}
			}
		},


		cssmin:{
			target:{
				files:[{
					expand:true,
					cwd:'src/css',
					src:['*.css'],
					dest:'dist/css'
				}]
			}
		},

		copy: {
			main: {
				files: [
					// includes files within path and its sub-directories
					{expand: true,  cwd: 'src/images/', src: ['**'], dest: 'dist/images'},
					{expand: true,  cwd: 'src/json/', src: ['**'], dest: 'dist/json'},
				],
			}
		},

		uglify: {
			options: {
				compress: {
					drop_console: true
				}
			},
			my_target: {
				files: {
					'dist/js/app.js': ['src/js/app.js']
				}
			}
		},

		imagemin: {                          // Task
			dynamic: {                         // Another target
				files: [{
					expand: true,                  // Enable dynamic expansion
					cwd: 'src/images',                   // Src matches are relative to this path
					src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
					dest: 'dist/images'                  // Destination path prefix
				}]
			}
		}


	});



grunt.loadNpmTasks('grunt-newer');

	grunt.registerTask('default', [
		//'jshint',
		//'removelogging'
		//'concat',
		'copy',
		// 'htmlmin',
		// 'cssmin',
		//'uglify',
		//'imagemin'
	]);

	grunt.registerTask('image', [
		'newer:imagemin:dynamic'
		]);
};