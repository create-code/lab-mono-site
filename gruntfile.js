module.exports = function( grunt ) {

	require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

	// destination path for deployment
	// overwrite in hidden .deployment file
	dest = 'path/for/deployment';
	try {
		require( './.deployment' );
	} catch( error ) {}

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		less: {
			development: {
				files: {
					'dist/css/style.css': 'src/less/style.less'
				}
			}
		},

		autoprefixer: {
			style: {
				src: 'dist/css/style.css',
				dest: 'dist/css/style.css'
			}
		},

		modernizr: {
			dist: {
				'dest' : 'src/js/modernizr.js',
				'options' : [
					'setClasses',
					'addTest',
					'html5printshiv',
					'testProp',
					'fnBind',
					'mq'
				],
				'tests' : [
					'touchevents',
					'pointerevents'
				],
				'files' : {
					'src': [
						'src/js/**/*.js',
						'src/less/**/*.less',
						'!node_modules/**/*',
						'!src/js/**/*.min.js'
					]
				}
			}
		},

		uglify: {
			options: {
				mangle: false
			},
			main: {
				files: {
					'dist/js/app.min.js': [
						'src/js/modernizr.js',
						'src/js/jquery.min.js',
						'src/js/debug.js',
						'src/js/viewport.js',
						'src/js/preloader.js'
					]
				}
			}
		},

		copy: {
			production: {
				files: [
					{
						expand: true,
						src: ['src/**/*', 'dist/**/*', '*.php', 'pastebin_dev_key', '!.*'],
						dest: dest + '/'
					},
		    	],
		  	},
		},

		watch: {
			css: {
				files: ['**/*.less'],
				tasks: ['buildcss']
			},
			js: {
				files: ['src/js/**/*.js','!js/**/*.min.js', '!pastebin_dev_key', '*.sublime-*'],
				tasks: ['buildjs']
			}
		}

	} );

	grunt.registerTask( 'default', ['build'] );

	grunt.registerTask( 'buildcss',  ['less', 'autoprefixer'] );
	grunt.registerTask( 'buildmodernizr', ['modernizr'] );
	grunt.registerTask( 'buildjs',  ['uglify'] );

	grunt.registerTask( 'deploy_production', ['copy:production'] );

	grunt.registerTask( 'build',  ['buildcss', 'buildmodernizr', 'buildjs'] );
};
