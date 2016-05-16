var Preloader = ( function() {
	var settings = {
		selector: {
			preloader: '.preloader'
		},
		charCode: 0,
		charCodeMin: 65,
		charCodeMax: 91,
		interval: 200,
		minDuration: 2000,
		timeStart: null
	}

	var init = function() {
		Debug.log( 'preloader.init()' );

		bindEventHandlers();

		build();
		start();
	}

	var bindEventHandlers = function() {
		Debug.log( 'preloader.bindEventHandlers()' );

		$( document )
			.on( 'pastes/built', function() {

				var now = Date.now();
				var delay = settings.minDuration - ( now - settings.timeStart );
				if( delay < 0 ) {
					delay = 0;
				}

				setTimeout( function() {
					stop();
				}, delay );
			} );
	}

	var build = function() {
		Debug.log( 'preloader.build()' );

		settings.element = $( '<div></div>' );

		settings.element
			.attr( 'data-char', String.fromCharCode( settings.charCodeMin ) )
			.addClass( 'preloader' )
			.appendTo( $( 'body' ) );

		$( document ).trigger( 'preloader/built' );
	}

	var start = function() {
		Debug.log( 'preloader.start()' );

		settings.timeStart = Date.now();

		settings.charCode = settings.charCodeMin;
		settings.interval = setInterval( function() {
			step();
		}, settings.interval );

		$( 'html' )
			.addClass( 'visible--preloader' );

		$( document ).trigger( 'preloader/start' );
	}

	var stop = function() {
		Debug.log( 'preloader.stop()' );

		if( settings.element.length > 0 ) {
			settings.element
				.remove();
		}

		clearInterval( settings.interval );

		$( 'html' )
			.removeClass( 'visible--preloader' );		

		$( document ).trigger( 'preloader/stop' );		
	}

	var step = function() {
		Debug.log( 'preloader.step()' );

		settings.charCode = ( settings.charCode < settings.charCodeMax - 1 ) ? ( settings.charCode + 1 ) : settings.charCodeMin;
		
		Debug.log( settings.charCode );

		settings.element
			.attr( 'data-char', String.fromCharCode( settings.charCode ) )
			.toggleClass( 'inverted' );

		$( document ).trigger( 'preloader/step' );
	}	

	return {
		init: function() { init(); }
	}
} )();


$( document ).ready( function() {
	Preloader.init();
} );