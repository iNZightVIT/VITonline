function buttonController(buttonString){
	var fn = buttonString.split("(")[0];
	var params = buttonString.split("(")[1].split(")")[0];
	mainControl.fn(params);
}

class WindowSection {
	constructor(x1,y1,x2,y2){
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;

		this.x = x1;
		this.y = y1;
		this.width = Math.abs(x2-x1);
		this.height = Math.abs(y2-y1);
	}

	getDivisions(x, direction = 'height'){
		if(direction = 'height'){
			var sectionHeight = this.height/x;
			var divisions = [];
			var sum = Math.min(this.y1, this.y2);
			for(var i = 1; i <= x; i++){
				sum += sectionHeight;
				divisions.push(sum);
			}
			return [divisions, sectionHeight];
		}
	}
	getDivisionPlacement(x, direction = 'height'){
		if(direction = 'height'){
			var sectionHeight = this.height/x;
			var divisions = [];
			var sum = Math.min(this.y1, this.y2);
			for(var i = 1; i <= x; i++){
				sum += sectionHeight;
				divisions.push(this.y + sum);
			}
			return [divisions, sectionHeight];
		}
	}

	getMiddleHeight(){
		return this.y1 + (this.height/2);
	}
	getMiddleWidth(){
		return this.x1 + (this.width/2);
	}
}

function setUpWindow(radius){
	var windowHelper = new Object();
	windowHelper.width = window.innerWidth*0.8;
	windowHelper.height = window.innerHeight*0.92*0.99;
	windowHelper.innerWidth = windowHelper.width - radius*2;
	windowHelper.margin = windowHelper.height/10;
	windowHelper.section1 = new Object();
	windowHelper.section2 = new Object();
	windowHelper.section3 = new Object();

	windowHelper.sampleSection = windowHelper.width/3;
	windowHelper.marginSample = windowHelper.sampleSection/50;
	windowHelper.sampleSectionDiv = (windowHelper.sampleSection - windowHelper.marginSample*3)/6;

	windowHelper.section1.height = windowHelper.height/3 - radius*2;
	windowHelper.section2.height = windowHelper.height/3 - radius*2;
	windowHelper.section3.height = windowHelper.height/3 - radius*10;

	windowHelper.section1.top = 0 + radius;
	windowHelper.section1.bottom = windowHelper.section1.top + windowHelper.section1.height;
	windowHelper.section1.twoThird = windowHelper.section1.top + windowHelper.section1.height/3 *2;

	windowHelper.section2.top = windowHelper.section1.bottom + radius;
	windowHelper.section2.bottom = windowHelper.section2.top + windowHelper.section2.height;
	windowHelper.section2.twoThird = windowHelper.section2.top + windowHelper.section2.height/3 *2;

	windowHelper.section3.top = windowHelper.section2.bottom + radius;
	windowHelper.section3.bottom = windowHelper.section3.top + windowHelper.section3.height;
	windowHelper.section3.twoThird = windowHelper.section3.top + windowHelper.section3.height/3 *2;

	windowHelper.lineHeight = windowHelper.section1.height /5;
	return windowHelper;
}
function setUpWindow2(margins){
	var windowHelper = new Object();
	windowHelper.width = window.innerWidth*0.8;
	windowHelper.height = window.innerHeight*0.92*0.99;
	windowHelper.fontSize = windowHelper.width/80;
	windowHelper.realWidth = windowHelper.width - margins.left - margins.right;
	windowHelper.realHeight = windowHelper.height - margins.top - margins.bottom;

	windowHelper.radius = windowHelper.realWidth/300;
	windowHelper.lineHeight = windowHelper.realHeight/50;

	windowHelper.sampleSection = new Object();
	windowHelper.sampleSection.x = 0;
	windowHelper.sampleSection.y = 0;
	windowHelper.sampleSection.width = windowHelper.realWidth/3;
	windowHelper.sampleSection.height = windowHelper.realHeight;

	windowHelper.sampleSection.S1 = new Object();
	windowHelper.sampleSection.S1.x = windowHelper.sampleSection.x;
	windowHelper.sampleSection.S1.y = windowHelper.sampleSection.y;
	windowHelper.sampleSection.S1.width = (windowHelper.sampleSection.width - margins.left)/2;
	windowHelper.sampleSection.S1.height = windowHelper.sampleSection.height;

	windowHelper.sampleSection.S2 = new Object();
	windowHelper.sampleSection.S2.x = windowHelper.sampleSection.x + windowHelper.sampleSection.S1.width + margins.left;
	windowHelper.sampleSection.S2.y = windowHelper.sampleSection.y;
	windowHelper.sampleSection.S2.width = (windowHelper.sampleSection.width - margins.left)/2;
	windowHelper.sampleSection.S2.height = windowHelper.sampleSection.height;

	windowHelper.graphSection = new Object();
	windowHelper.graphSection.x = windowHelper.sampleSection.x+windowHelper.sampleSection.width + margins.left;
	windowHelper.graphSection.y = 0;
	windowHelper.graphSection.width = windowHelper.realWidth - windowHelper.graphSection.x;
	windowHelper.graphSection.height = windowHelper.realHeight;

	windowHelper.graphSection.S1 = new Object();
	windowHelper.graphSection.S1.x = windowHelper.graphSection.x;
	windowHelper.graphSection.S1.y = windowHelper.graphSection.y;
	windowHelper.graphSection.S1.width = windowHelper.graphSection.width;
	windowHelper.graphSection.S1.height = windowHelper.graphSection.height/3;
	windowHelper.graphSection.S1.titleArea = new Object();
	windowHelper.graphSection.S1.titleArea.y = windowHelper.graphSection.S1.y;
	windowHelper.graphSection.S1.titleArea.height = windowHelper.graphSection.S1.height*0.05;
	windowHelper.graphSection.S1.displayArea = new Object();
	windowHelper.graphSection.S1.displayArea.y = windowHelper.graphSection.S1.y + windowHelper.graphSection.S1.titleArea.height;
	windowHelper.graphSection.S1.displayArea.height = windowHelper.graphSection.S1.height*0.9;
	windowHelper.graphSection.S1.displayArea.middle = windowHelper.graphSection.S1.displayArea.y + (windowHelper.graphSection.S1.displayArea.height/2);
	windowHelper.graphSection.S1.displayArea.q1 = windowHelper.graphSection.S1.displayArea.y + (windowHelper.graphSection.S1.displayArea.height/4)
	windowHelper.graphSection.S1.displayArea.q3 = windowHelper.graphSection.S1.displayArea.middle + (windowHelper.graphSection.S1.displayArea.height/4)
	windowHelper.graphSection.S1.axisArea = new Object();
	windowHelper.graphSection.S1.axisArea.y = windowHelper.graphSection.S1.y + windowHelper.graphSection.S1.titleArea.height + windowHelper.graphSection.S1.displayArea.height;
	windowHelper.graphSection.S1.axisArea.height = windowHelper.graphSection.S1.height*0.05;

	windowHelper.graphSection.S2 = new Object();
	windowHelper.graphSection.S2.x = windowHelper.graphSection.x;
	windowHelper.graphSection.S2.y = windowHelper.graphSection.y + windowHelper.graphSection.S1.height;
	windowHelper.graphSection.S2.width = windowHelper.graphSection.width;
	windowHelper.graphSection.S2.height = windowHelper.graphSection.height/3;
	windowHelper.graphSection.S2.titleArea = new Object();
	windowHelper.graphSection.S2.titleArea.y = windowHelper.graphSection.S2.y;
	windowHelper.graphSection.S2.titleArea.height = windowHelper.graphSection.S2.height*0.05;
	windowHelper.graphSection.S2.displayArea = new Object();
	windowHelper.graphSection.S2.displayArea.y = windowHelper.graphSection.S2.y + windowHelper.graphSection.S2.titleArea.height;
	windowHelper.graphSection.S2.displayArea.height = windowHelper.graphSection.S2.height*0.9;
	windowHelper.graphSection.S2.displayArea.middle = windowHelper.graphSection.S2.displayArea.y + (windowHelper.graphSection.S2.displayArea.height/2);
	windowHelper.graphSection.S2.displayArea.q1 = windowHelper.graphSection.S2.displayArea.y + (windowHelper.graphSection.S2.displayArea.height/4)
	windowHelper.graphSection.S2.displayArea.q3 = windowHelper.graphSection.S2.displayArea.middle + (windowHelper.graphSection.S2.displayArea.height/4)
	windowHelper.graphSection.S2.axisArea = new Object();
	windowHelper.graphSection.S2.axisArea.y = windowHelper.graphSection.S2.y + windowHelper.graphSection.S2.titleArea.height + windowHelper.graphSection.S2.displayArea.height;
	windowHelper.graphSection.S2.axisArea.height = windowHelper.graphSection.S2.height*0.05;

	windowHelper.graphSection.S3 = new Object();
	windowHelper.graphSection.S3.x = windowHelper.graphSection.x;
	windowHelper.graphSection.S3.y = windowHelper.graphSection.S2.y + windowHelper.graphSection.S2.height;
	windowHelper.graphSection.S3.width = windowHelper.graphSection.width;
	windowHelper.graphSection.S3.height = windowHelper.graphSection.height/3;
	windowHelper.graphSection.S3.titleArea = new Object();
	windowHelper.graphSection.S3.titleArea.y = windowHelper.graphSection.S3.y;
	windowHelper.graphSection.S3.titleArea.height = windowHelper.graphSection.S3.height*0.05;
	windowHelper.graphSection.S3.displayArea = new Object();
	windowHelper.graphSection.S3.displayArea.y = windowHelper.graphSection.S3.y + windowHelper.graphSection.S3.titleArea.height;
	windowHelper.graphSection.S3.displayArea.height = windowHelper.graphSection.S3.height*0.9;
	windowHelper.graphSection.S3.displayArea.middle = windowHelper.graphSection.S3.displayArea.y + (windowHelper.graphSection.S3.displayArea.height/2);
	windowHelper.graphSection.S3.displayArea.q1 = windowHelper.graphSection.S3.displayArea.y + (windowHelper.graphSection.S3.displayArea.height/4)
	windowHelper.graphSection.S3.displayArea.q3 = windowHelper.graphSection.S3.displayArea.middle + (windowHelper.graphSection.S3.displayArea.height/4)
	windowHelper.graphSection.S3.axisArea = new Object();
	windowHelper.graphSection.S3.axisArea.y = windowHelper.graphSection.S3.y + windowHelper.graphSection.S3.titleArea.height + windowHelper.graphSection.S3.displayArea.height;
	windowHelper.graphSection.S3.axisArea.height = windowHelper.graphSection.S3.height*0.05;

	return windowHelper;

}

function setUpWindow3(margins, includeSampleSection){
	var windowHelper = new Object();

	let container_bbox = d3.select("#rightHalf").node().getBoundingClientRect();

	windowHelper.width = container_bbox['width'] * 0.95;
	windowHelper.height = container_bbox['height']*0.94;
	windowHelper.realWidth = windowHelper.width - margins.left - margins.right;
	windowHelper.realHeight = windowHelper.height - margins.top - margins.bottom;

	windowHelper.radius = windowHelper.realWidth/275;
	windowHelper.lineHeight = windowHelper.realHeight/50;
	windowHelper.fontSize = windowHelper.width/70;

	windowHelper.sampleSection = new WindowSection(margins.left, margins.top, includeSampleSection ? windowHelper.realWidth/3 : 0,windowHelper.realHeight);

	windowHelper.sampleSection.S1 = new WindowSection(windowHelper.sampleSection.x1, 
												windowHelper.sampleSection.y1, 
												windowHelper.sampleSection.x1 + (windowHelper.sampleSection.width - margins.left)/2, 
												windowHelper.sampleSection.y2);

	windowHelper.sampleSection.S2 = new WindowSection(windowHelper.sampleSection.S1.x2 + margins.left, 
												windowHelper.sampleSection.y1, 
												windowHelper.sampleSection.S1.x2 + margins.left + (windowHelper.sampleSection.width - margins.left)/2, 
												windowHelper.sampleSection.y2);

	windowHelper.graphSection = new WindowSection(windowHelper.sampleSection.x2 + (margins.left*4),
												0,
												windowHelper.realWidth,
												windowHelper.realHeight);

	//Section 1
	windowHelper.graphSection.S1 = new WindowSection(windowHelper.graphSection.x1,
												windowHelper.graphSection.y1,
												windowHelper.graphSection.x2,
												windowHelper.graphSection.y1 + windowHelper.graphSection.height/3);

	windowHelper.graphSection.S1.titleArea = new WindowSection(windowHelper.graphSection.S1.x1,
												windowHelper.graphSection.S1.y1,
												windowHelper.graphSection.S1.x2,
												windowHelper.graphSection.S1.y1 + windowHelper.graphSection.S1.height * 0.1);

	windowHelper.graphSection.S1.displayArea = new WindowSection(windowHelper.graphSection.S1.x1,
												windowHelper.graphSection.S1.titleArea.y2,
												windowHelper.graphSection.S1.x2,
												windowHelper.graphSection.S1.titleArea.y2 + windowHelper.graphSection.S1.height * 0.8);

	windowHelper.graphSection.S1.axisArea = new WindowSection(windowHelper.graphSection.S1.x1,
												windowHelper.graphSection.S1.displayArea.y2,
												windowHelper.graphSection.S1.x2,
												windowHelper.graphSection.S1.displayArea.y2 + windowHelper.graphSection.S1.height * 0.1);


	// Section 2
	windowHelper.graphSection.S2 = new WindowSection(windowHelper.graphSection.x1,
												windowHelper.graphSection.S1.y2,
												windowHelper.graphSection.x2,
												windowHelper.graphSection.S1.y2 + windowHelper.graphSection.height/3);

	windowHelper.graphSection.S2.titleArea = new WindowSection(windowHelper.graphSection.S2.x1,
												windowHelper.graphSection.S2.y1,
												windowHelper.graphSection.S2.x2,
												windowHelper.graphSection.S2.y1 + windowHelper.graphSection.S2.height * 0.1);

	windowHelper.graphSection.S2.displayArea = new WindowSection(windowHelper.graphSection.S2.x1,
												windowHelper.graphSection.S2.titleArea.y2,
												windowHelper.graphSection.S2.x2,
												windowHelper.graphSection.S2.titleArea.y2 + windowHelper.graphSection.S2.height * 0.8);

	windowHelper.graphSection.S2.axisArea = new WindowSection(windowHelper.graphSection.S2.x1,
												windowHelper.graphSection.S2.displayArea.y2,
												windowHelper.graphSection.S2.x2,
												windowHelper.graphSection.S2.displayArea.y2 + windowHelper.graphSection.S2.height * 0.1);

	// Section 3
	windowHelper.graphSection.S3 = new WindowSection(windowHelper.graphSection.x1,
												windowHelper.graphSection.S2.y2,
												windowHelper.graphSection.x2,
												windowHelper.graphSection.S2.y2 + windowHelper.graphSection.height/3);

	windowHelper.graphSection.S3.titleArea = new WindowSection(windowHelper.graphSection.S3.x1,
												windowHelper.graphSection.S3.y1,
												windowHelper.graphSection.S3.x2,
												windowHelper.graphSection.S3.y1 + windowHelper.graphSection.S3.height * 0.1);

	windowHelper.graphSection.S3.displayArea = new WindowSection(windowHelper.graphSection.S3.x1,
												windowHelper.graphSection.S3.titleArea.y2,
												windowHelper.graphSection.S3.x2,
												windowHelper.graphSection.S3.titleArea.y2 + windowHelper.graphSection.S3.height * 0.8);

	windowHelper.graphSection.S3.axisArea = new WindowSection(windowHelper.graphSection.S3.x1,
												windowHelper.graphSection.S3.displayArea.y2,
												windowHelper.graphSection.S3.x2,
												windowHelper.graphSection.S3.displayArea.y2 + windowHelper.graphSection.S3.height * 0.1);



	return windowHelper;
}
function drawArrow(to, from, yValue, placement, id, op, color){
	var group = placement.append("svg").attr("id",id);
	let to_num = isNaN(to) ? 0 : to;
	let from_num = isNaN(from) ? 0 : from;
	var diff = to_num - from;
	if(isNaN(diff)){
		var data = placement.data();
		data = data[data.length-1];
		to_num = to(data);
		from_num = from(data);
		var diff = to_num - from_num;
	}
	var mainLine = group.append("line").attr("x1", from_num).attr("x2", to).attr("y1", yValue).attr("y2", yValue).style("stroke-width", 2).style("stroke", color).style("opacity", op).attr("id", id+"main");
	var headSize = 10;
	if(Math.abs(diff) < headSize) headSize =Math.abs(diff)*0.5;
	if(diff != 0) {var arrowHead = diff / Math.abs(diff);} else { var arrowHead = 0;}
	var direction = diff > 0 ? -1 : 1;
	var arm1 = group.append("line").attr("x1", to_num).attr("x2", to_num - arrowHead*headSize).attr("y1", yValue).attr("y2", yValue + arrowHead*1*headSize/2).style("stroke-width", 2).style("stroke", color).style("opacity", op).attr("id", id+"a1");
	var arm2 = group.append("line").attr("x1", to_num).attr("x2", to_num - arrowHead*headSize).attr("y1", yValue).attr("y2", yValue - arrowHead*1*headSize/2).style("stroke-width", 2).style("stroke", color).style("opacity", op).attr("id", id+"a2");
	// var arm1 = group.append("line").attr("x1", to).attr("x2", to + (10*direction)).attr("y1", yValue).attr("y2", yValue + 5).style("stroke-width", 2).style("stroke", color).style("opacity", op).attr("id", id+"a1");
	// var arm2 = group.append("line").attr("x1", to).attr("x2", to + (10*direction)).attr("y1", yValue).attr("y2", yValue - 5).style("stroke-width", 2).style("stroke", color).style("opacity", op).attr("id", id+"a2");
	return [mainLine, arm1, arm2];
}

	function showHelp(){
		d3.select("#helpBox").remove();
		this.windowHelper = setUpWindow(5);
		var hBox = d3.select(".svg").append("svg").attr("id","helpBox");
		hBox.append("circle").attr("cx",this.windowHelper.width/16).attr("cy",this.windowHelper.height/16).attr("r",10).style("fill", "#094b85");
		hBox.append("text").attr("x",this.windowHelper.width/16 - 10/2).attr("y",this.windowHelper.height/16+10/2).text("1").style("fill","white").style("font-weight",700);
		hBox.append("text").attr("x",this.windowHelper.width/16 + 10 + 10).attr("y",this.windowHelper.height/16 + 10/2).text("Select a File").style("font-weight",700);

		hBox.append("circle").attr("cx",this.windowHelper.width/16).attr("cy",this.windowHelper.height/3).attr("r",10).style("fill", "#094b85");
		hBox.append("text").attr("x",this.windowHelper.width/16 - 10/2).attr("y",this.windowHelper.height/3+10/2).text("2").style("fill","white").style("font-weight",700);
		hBox.append("text").attr("x",this.windowHelper.width/16 + 10 + 10).attr("y",this.windowHelper.height/3 + 10/2).text("Select Variables. Use Ctrl+Click to select Multiple").style("font-weight",700);
	}
function drawArrowDown(to, from, xValue, placement, id, op, color, width){
	var group = placement.append("svg").attr("id",id);
	group.append("line").attr("y1", from).attr("y2", to).attr("x1", xValue).attr("x2", xValue).style("stroke-width", 2).style("stroke", color).style("opacity", op).style("stroke-width",width);
	var diff = to - from;
	if(isNaN(diff)){
		var data = placement.data();
		data = data[data.length-1];
		var to= to(data);
		var from = from(data);
		var diff = to - from;
	}
	var headSize = 10;
	if(Math.abs(diff) < headSize) headSize =Math.abs(diff)*0.5;
	if(diff != 0) {var arrowHead = diff / Math.abs(diff);} else { var arrowHead = 0;}
	group.append("line").attr("y1", to).attr("y2", to - arrowHead*headSize).attr("x1", xValue).attr("x2", xValue + arrowHead*1*headSize/2).style("stroke-width", 2).style("stroke", color).style("opacity", op).style("stroke-width",width);
	group.append("line").attr("y1", to).attr("y2", to - arrowHead*headSize).attr("x1", xValue).attr("x2", xValue - arrowHead*1*headSize/2).style("stroke-width", 2).style("stroke", color).style("opacity", op).style("stroke-width",width);

}
function heapYValues3(itemsToHeap, xScale, radius, sampleIndex, areaTopY, areaBottomY){
	var section = radius * 0.8;
	var buckets = {};
	var maxY = 0;
	for(var i = 0; i < itemsToHeap.length;i++){
		var thisItem = itemsToHeap[i];
		thisItem.xPerSample[sampleIndex] = xScale(thisItem.value);
		thisItem.yPerSample[sampleIndex] = 0;

		var nearest = Math.round(thisItem.xPerSample[sampleIndex] / section)*section;
		if(!(nearest in buckets)){
			buckets[nearest] = [];
		}
		thisItem.yPerSample[sampleIndex] = radius * buckets[nearest].length;
		buckets[nearest].push(thisItem);
		if(thisItem.yPerSample[sampleIndex] > maxY){
			maxY = thisItem.yPerSample[sampleIndex];
		}
	}
	yScale = d3.scale.linear().range([areaBottomY,Math.max(areaBottomY - maxY,areaTopY+radius*2)]);
	yScale.domain([0,maxY]);
	for(var l = 0; l<itemsToHeap.length;l++){
		var curValue = itemsToHeap[l].yPerSample[sampleIndex];
		itemsToHeap[l].yPerSample[sampleIndex] = yScale(curValue);
	}
}

function heapYValues4(itemsToHeap, xScale, radius, sampleIndex, areaTopY, areaBottomY){
	var section = radius * 0.8;
	var buckets = {};
	var maxY = 0;
	for(var i = 0; i < itemsToHeap.length;i++){
		var thisItem = itemsToHeap[i];
		thisItem.xValuePerSample[sampleIndex] = xScale(thisItem.values[0]);
		thisItem.yValuePerSample[sampleIndex] = 0;

		var nearest = Math.round(thisItem.xValuePerSample[sampleIndex] / section)*section;
		if(!(nearest in buckets)){
			buckets[nearest] = [];
		}
		thisItem.yValuePerSample[sampleIndex] = radius * buckets[nearest].length;
		buckets[nearest].push(thisItem);
		if(thisItem.yValuePerSample[sampleIndex] > maxY){
			maxY = thisItem.yValuePerSample[sampleIndex];
		}
	}
	yScale = d3.scale.linear().range([areaBottomY,Math.max(areaBottomY - maxY,areaTopY+radius*2)]);
	yScale.domain([0,maxY]);
	for(var l = 0; l<itemsToHeap.length;l++){
		var curValue = itemsToHeap[l].yValuePerSample[sampleIndex];
		itemsToHeap[l].yValuePerSample[sampleIndex] = yScale(curValue);
	}
}

function getStatistic(stat, origItems, total){
	var items = origItems.slice(0);
	if(total <= 0 || items.length <= 0){
		return 0;
	}
	if(stat =="Mean"){
		var mean = 0;
		for(var i =0;i<items.length;i++){
			mean += items[i].value;
		}
		if(isNaN(mean)){
			alert("wat");
		}
		return mean/items.length;
	}
	if(stat =="Median"){
		if(items.length == 1) return items[0].value;
		items.sort(function(a,b){return a.value - b.value});
		var itemLow = items[Math.floor((items.length-1)/2)];
		var itemHigh = items[Math.ceil((items.length-1)/2)];
		if(!item){
			alert("wat");
		}
		var med = (itemLow.value + itemHigh.value)/2;
		return med;
	}
	if(stat =="Lq"){
		// Find median
		if(items.length == 1) return items[0].value;
		items.sort(function(a,b){return a.value - b.value});
		var itemLow = items[Math.floor((items.length-1)/2)];
		var itemHigh = items[Math.ceil((items.length-1)/2)];

		// If Median is a single value, return median of items below.
		if(itemLow == itemHigh){
			return getStatistic("Median", items.slice(0,Math.floor((items.length-1)/2)));
		}else{
			return getStatistic("Median", items.slice(0,Math.ceil((items.length-1)/2)));
		}

		// if(items.length == 1) return items[0].value;
		// items.sort(function(a,b){return a.value - b.value});
		// var lQIndexLow = Math.floor(items.length*0.25);
		// var lQIndexHigh = Math.ceil(items.length*0.25);

		// return (items[lQIndexLow].value+items[lQIndexHigh].value)/2;
	}
	if(stat =="Uq"){
		// Find median
		if(items.length == 1) return items[0].value;
		items.sort(function(a,b){return a.value - b.value});
		var itemLow = items[Math.floor((items.length-1)/2)];
		var itemHigh = items[Math.ceil((items.length-1)/2)];

		// If Median is a single value, return median of items above.
		if(itemLow == itemHigh){
			return getStatistic("Median", items.slice(Math.ceil((items.length-1)/2) + 1));
		}else{
			return getStatistic("Median", items.slice(Math.ceil((items.length-1)/2)));
		}
		// if(items.length == 1) return items[0].value;
		// items.sort(function(a,b){return a.value - b.value});
		// var lQIndexLow = Math.floor(items.length*0.75);
		// var lQIndexHigh = Math.ceil(items.length*0.75);

		// return (items[lQIndexLow].value+items[lQIndexHigh].value)/2;
	}
	if(stat = "Proportion"){
		//var focusItems = items.filter(function(i){return i.value==0})
		return total> 0 ? items.length/total : 0;
	}
}

function item(value, id){
this.value = value;
this.id = id;
this.level = 1;
this.xPerSample = {};
this.yPerSample = {};
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function order(array) {
	array.sort(function(a, b){
		if(a.order < b.order) return -1;
		if(a.order > b.order) return 1;
		return 0;
	});
	return array;
}

function pickRand(numToPick, numFrom){
var indexs = [];
while(indexs.length < numToPick){
	var randomNumber = Math.ceil(Math.random()*numFrom) - 1;
	var found = false;
	for(var i =0;i<indexs.length;i++){
		if(indexs[i] == randomNumber){
			found = true;
			break;
		}
	}
	if(!found){
		indexs.push(randomNumber);
	}
}
return indexs;
}

function findMean(numbers){
var total = 0;
for(var i = 0;i<numbers.length;i++){
	total += numbers[i];
}
return total/numbers.length;
}
function findMeanItems(numbers){
var total = 0;
for(var i = 0;i<numbers.length;i++){
	total += numbers[i].value;
}
return total/numbers.length;
}

function makeSamples(population, numSamples, sampleSize){
var samples = [];
for(var i = 0; i<numSamples;i++){
	samples.push([]);
	var indexs = pickRand(sampleSize, population.length);
	for(var k = 0; k<sampleSize;k++){
		samples[i].push(population[indexs[k]]);
	}
}
return samples;
}
function leastSquares(xSeries, ySeries){
	var sumX = xSeries.reduce(function( prev, cur){return prev+cur});
	var sumY = ySeries.reduce(function( prev, cur){return prev+cur});
	var sumXY = xSeries.map(function(d,i){return d*ySeries[i]}).reduce(function( prev, cur){return prev+cur});
	var sumXX = xSeries.map(function(d,i){return d*d}).reduce(function( prev, cur){return prev+cur});
	var N = xSeries.length;
	var slope = (N*sumXY - sumX*sumY)/(N*sumXX - sumX*sumX);
	var intercept = (sumY - slope*sumX)/N;
	return [slope, intercept];
}
//var colorByIndex = [d3.rgb("blue"),d3.rgb("red")];
var colorByIndex = ['#377eb8','#e41a1c','#4daf4a','#984ea3','#ff7f00','#AAAA33','#a65628','magenta']
//alert(leastSquares([60,61,62,63,65],[3.1,3.6,3.8,4,4.1]));
function onlyUnique(value, index, self) { 
	if(["na", "n/a", "n\\a"].includes(value.toLowerCase())){
		return false;
	}
    return self.indexOf(value) === index;
}

function makeBoxplot(x,y,width,height,population,xScale,lq,med,uq){
		var median = getStatistic("Median", population);
		var lQ = getStatistic("Lq", population);
		var uQ = getStatistic("Uq", population);
		//d3.select(".svg").append("rect").attr("x",x).attr("y",y).attr("width",width).attr("height",height).attr("fill","green");
		var container = d3.select(".svg").append("svg").attr("id","bPlot");
		container.append("line").attr("x1",x).attr("x2",xScale(lQ)).attr("y1",y + height/2).attr("y2",y+height/2);
		container.append("line").attr("x1",xScale(lQ)).attr("x2",xScale(lQ)).attr("y1",y).attr("y2",y+height);
		container.append("line").attr("x1",xScale(median)).attr("x2",xScale(median)).attr("y1",y).attr("y2",y+height);
		container.append("line").attr("x1",xScale(uQ)).attr("x2",xScale(uQ)).attr("y1",y).attr("y2",y+height);
		container.append("line").attr("x1",xScale(uQ)).attr("x2",x+width).attr("y1",y + height/2).attr("y2",y+height/2);
		container.append("line").attr("x1",xScale(lQ)).attr("x2",xScale(uQ)).attr("y1",y).attr("y2",y);
		container.append("line").attr("x1",xScale(lQ)).attr("x2",xScale(uQ)).attr("y1",y+height).attr("y2",y+height);

}
function getFontSize(wH, leng){
	if (leng > 60) leng = 60;
		var fontSize = (wH.height - (leng*2)) / (leng+2);
		if(fontSize>wH.sampleSection*0.05)fontSize=wH.sampleSection*0.05;
		var titleFS = wH.width * wH.height / 50000;
		return [fontSize, titleFS];
}

function getMiddle(a,b){
	return (a + (b-a)/2);
}

