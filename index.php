<?php
$JSON_URL = $_GET['jsonb64'];
$JSON_POST = $_POST['p_data'];
?>
<!doctype html>
<html>
	<head>
		<link rel = "stylesheet" href="indexCSS.css">
		<link rel = "stylesheet" href="display.css">
		<script src="index.js"></script>	
		<script src="shared/bases/modelBase.js"></script>
		<script src="shared/bases/viewBase.js"></script>
		<script src="shared/helperFunctions.js"></script>
		<script id="json_url_data" type="application/json"><?php echo htmlspecialchars($JSON_URL);?></script>
		<script id="json_post_data" type="application/json"><?php echo htmlspecialchars($JSON_POST);?></script>
	</head>
	<body>
		<div id="buttonCenter">
			<div id="buttonContainer">
				<div class="menutitle"><p class="menutitle t2">V</p><p class ="menutitle t1">I</p><p class ="menutitle t2">T Online</p> </div>
				<p> The capabilities of iNZightVIT's  Visual inference Tools (VIT) modules are being reworked in JavaScript by Ben Halsted for online use.  Try in Chrome, Firefox or Safari (not IE). <br>
				<i>This short video gives some idea of how it works <a href="https://www.stat.auckland.ac.nz/~wild/VITonline/VIT_bootstrap1.mp4 ">VIT_bootstrap1.mp4)</a></i></p>

				<!-- <a href ="samplingVariation/SamplingVariation.php" class="bluebutton"><p class="buttontext">Sampling Variation</p></a> -->
				<button type="button" onclick="postSamplingVariation()" class="bluebutton"><p class="buttontext">Sampling Variation</p></button>
				<!-- <a href ="bootstrap/bootstrap.html" class="bluebutton"><p class="buttontext">Bootstrapping</p></a> -->
				<button type="button" onclick="postBootstrap()" class="bluebutton"><p class="buttontext">Bootstrapping</p></button>
				<!-- <a href ="RandomisationVar/RVar.html" class="bluebutton"><p class="buttontext">Randomisation Variation</p></a> -->
				<button type="button" onclick="postRandomisationVar()" class="bluebutton"><p class="buttontext">Randomisation Variation</p></button>
				<!-- <a href ="randomisationTest/RVar.html" class="bluebutton"><p class="buttontext">Randomisation Test</p></a> -->
				<button type="button" onclick="postRansomisationTest()" class="bluebutton"><p class="buttontext">Randomisation Test</p></button>
			</div>
		</div>
	</body>


</html>