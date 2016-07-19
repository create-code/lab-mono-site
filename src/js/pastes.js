var Pastes = ( function() {
	var settings = {
		selector: {
			pastes: 	'.pastes',
			paste:  	'.paste',
			scroller:  	'.paste-scroller'
		},
		scrollers: [],
		scrollStepMin: 1,
		scrollStepMax: 2,
		isScrolling: false
	}

	var init = function() {
		Debug.log( 'pastes.init()' );

		bindEventHandlers();
		loadData();
	}

	var bindEventHandlers = function() {
		Debug.log( 'pastes.bindEventHandlers()' );

		$( document )
			.on( 'pastes/data/loaded', function() {
				build();
				setScroller();
			} )
			.on( 'viewport/loop', function() {
				onLoop();
			} )
			.on( 'viewport/resize/finish', function() {
				onResize();
			} );
	}

	var onLoop = function() {
		scroll();
	}

	var onResize = function() {
		setScroller();
	}

	var loadData = function( callback ) {
		Debug.log( 'pastes.loadData()' );

		$.getJSON( 'pastebinFetcher.php', function( data ) {
			settings.data = data;

			$( document ).trigger( 'pastes/data/loaded' );
		} );
	}

	var build = function() {
		Debug.log( 'pastes.build()' );

		var pastes = $( settings.selector.pastes );
		for( var i = 0; i < settings.data.length; i++ ) {
			var text = settings.data[i]['paste_content'];
			text = text.replace( /&amp;/gi, '&' );
			var paste = $( '<article class="paste" data-url="' + encodeURI( settings.data[i]['paste_url'] ) + '"><div class="paste-scroller"><span class="paste-text">' + text + '</span></div><a href="' + encodeURI( settings.data[i]['paste_url'] ) + '" class="paste-link" target="_blank">' + encodeURI( settings.data[i]['paste_url'] ) + '</a></article>' );

			paste
				.appendTo( pastes );
		}

		$( document ).trigger( 'pastes/built' );
	}

	var setScroller = function() {
		Debug.log( 'pastes.setScroller()' );

		settings.isScrolling = true;
		settings.scrollers = [];

		var $scrollers = $( settings.selector.scroller );

		var i = 0;
		$scrollers.each( function() {
			var $scroller = $( this );
			var scroller = {};

			scroller.element = $scroller;
			scroller.scrollWidth = $scroller[0].scrollWidth;
			scroller.scrollLeft = 0;
			scroller.scrollStep = ( i % 2 === 0 ) ? settings.scrollStepMin : settings.scrollStepMax;

			settings.scrollers.push( scroller );

			i++;
		} );

		Debug.log( settings );
	}

	var scroll = function() {
		if( settings.isScrolling ) {
			for( var i = 0; i < settings.scrollers.length; i++ ) {
				settings.scrollers[i].scrollLeft = ( settings.scrollers[i].scrollLeft < settings.scrollers[i].scrollWidth - viewport.getWidth() ) ? settings.scrollers[i].element.scrollLeft() + settings.scrollers[i].scrollStep : 0;
				settings.scrollers[i].element.scrollLeft( settings.scrollers[i].scrollLeft );
			}
		}
	}

	return {
		init: function() { init(); }
	}
} )();


$( document ).ready( function() {
	Pastes.init();
} );
