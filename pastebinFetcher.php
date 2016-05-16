<?php

class pastebinFetcher {

	private $settings = array(
		'api' => array(
			'url' 		=> 'http://pastebin.com/api/api_post.php',
			'url_raw'  	=> 'http://pastebin.com/raw/',
			'data' 		=> array(
				'api_option' 	=> 'trends',
				'api_dev_key' 	=> ''
			)
		),
		'max_count'  	=> 8,
		'max_length' 	=> 1200,
		'cache' 		=> array(
			'filename' 		=> 'cache.json',
			'lifetime' 		=> 2 * 60 * 60
		)
	);

	public function __construct() {
		if( $this->getDevKey() ) {
			$this->get();
		}
	}

	private function getDevKey() {
		if( $key = file_get_contents( 'pastebin_dev_key' ) ) {
			$this->settings['api']['data']['api_dev_key'] = $key;
			return $this->settings['api']['data']['api_dev_key'];
		} else {
			return false;
		}
	}

	private function fetchPastes() {
		$options = array(
		    'http' => array(
		        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
		        'method'  => 'POST',
		        'content' => http_build_query( $this->settings['api']['data'] )
		    )
		);
		$context  = stream_context_create( $options );
		$result = file_get_contents( $this->settings['api']['url'], false, $context );
		
		if( $result === false ) { 
			return false;
		} else {
			return $result;		
		}
	}

	private function fetchPaste( $id ) {
		if( $result = file_get_contents( $this->settings['api']['url_raw'] . urlencode( $id ) ) ) {
			return $result;
		} else {
			return false;
		}

	}

	private function fetch() {
		$result = $this->fetchPastes();
		if( $result ) {
			$result = "<?xml version='1.0'?><pastes>" . $result . "</pastes>";
			$pastes = simplexml_load_string( $result );

			$pastes = json_decode( json_encode( ( array ) $pastes ), TRUE );

			$output = array();

			if( $pastes['paste'] ) {
				for( $i = 0; ( $i < count( $pastes['paste'] ) && $i < $this->settings['max_count'] ); $i++ ) {
					if( $paste_content = $this->fetchPaste( $pastes['paste'][$i]['paste_key'] ) ) {
						$pastes['paste'][$i]['paste_length'] = mb_strlen( $paste_content );

						$paste_content = $this->santizeText( $paste_content );
						$pastes['paste'][$i]['paste_content'] = $paste_content;

						$output[] = $pastes['paste'][$i];
					}
				}

				return json_encode( $output );
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	private function santizeText( $text ) {
		// limit length
		$text = mb_substr( htmlentities( $text ), 0, $this->settings['max_length'] );

		// encode HTML to entities
		$text = htmlentities( $text );
		
		// replace multiple whitespaces with one
		$text = preg_replace( '/\s+/', ' ', $text );

		// replace all Unicode glyphs out of range
		$text = preg_replace( '/[^\00-\255]+/u', '', $text );

		return $text;
	}


	private function get() {
		global $settings;

		if( !file_exists( $this->settings['cache']['filename'] ) ) {
			$json = $this->fetch();
			if( $json ) { 
				file_put_contents( $this->settings['cache']['filename'], $json );
			}
		} else {
			if( time() - filemtime( $this->settings['cache']['filename'] ) > $this->settings['cache']['lifetime'] ) {			
				$json = $this->fetch();
				if( $json ) {
					file_put_contents( $this->settings['cache']['filename'], $json );
				}
			} else {
				$json = file_get_contents( $this->settings['cache']['filename'] );
			}
		} 

		if( $json ) {
			echo $json;
		} else {
			echo -1;
		}
	}
}

new pastebinFetcher();