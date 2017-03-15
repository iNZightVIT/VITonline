 <?php
 	header("Access-Control-Allow-Origin: *");
 	$url = $_GET["fn"];

 	// Remove all illegal characters from a url
	$url = filter_var($url, FILTER_SANITIZE_URL);

	// Validate url
	if (!filter_var($url, FILTER_VALIDATE_URL) === false) {
		echo file_get_contents($url);
	} else {
		echo("$url is not a valid URL");
	}
?>