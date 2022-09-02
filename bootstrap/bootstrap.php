<?php
$JSON_URL = $_GET['jsonb64'] ?? '';
$JSON_POST = $_POST['p_data'] ?? '';
?>
<!doctype html>
<html>
	<head>
		<link rel = "stylesheet" href="../display.css">

		<script src="../shared/third_party/jquery.min.js"></script>
		<script src="../shared/third_party/d3.js" charset="utf-8"></script>

		<script src="../shared/helperFunctions.js"></script>
		<script src="../shared/sharedAnimations.js"></script>

		<script src="../shared/bases/modelBase.js"></script>
		<script src="MVC_Implementations/model.js"></script>
		<script src="../shared/bases/controllerBase.js"></script>
		<script src="MVC_Implementations/controller.js"></script>
		<script src="../shared/bases/visBase.js"></script>
		<script src="../shared/bases/viewBase.js"></script>
		<script src="MVC_Implementations/view.js"></script>

		<script src="Visualisations/bootstrap_oneNum_oneCat.js"></script>
		<script src="Visualisations/bootstrap_oneNum.js"></script>
		<script src="Visualisations/bootstrap_oneCat.js"></script>
		<script src="Visualisations/bootstrap_twoCat.js"></script>
		<script src="Visualisations/oneMean.js"></script>
		<script src="Visualisations/oneProportion.js"></script>
		<script src="Visualisations/twoProportion.js"></script>
		<script src="Visualisations/slope.js"></script>

        <script id="json_url_data" type="application/json"><?php echo htmlspecialchars($JSON_URL);?></script>
		<script id="json_post_data" type="application/json"><?php echo htmlspecialchars($JSON_POST);?></script>
	</head>
	<body>
	<div id="banner"></div>
		<div id="leftHalf">
			<div class = "controls">
			</div>
		</div>
		<div id="rightHalf">
			<div id ="displayLabel"><p id ="module"></p><p id ="file"></p><p id ="variable"></p><p id ="quantity"></p></div>
			<svg class="svg">
				<svg class = "sampleLines"></svg>
				<svg class = "meanOfSamples"></svg>
			</svg>
		</div>
		<div id="test"></div>
	</body>


</html>
