 <?php
 	header("Access-Control-Allow-Origin: *");
 	$url = $_GET["fn"];


 	// Remove all illegal characters from a url
	$url_no_space = filter_var($url, FILTER_SANITIZE_URL);

	// Validate url
	if (!filter_var($url_no_space, FILTER_VALIDATE_URL) === false) {
		echo file_get_contents(preg_replace("/[^\x20-\x7E]/", "", $url));
		//echo "hello";
	} else {
		echo("$url is not a valid URL");
	}
?>