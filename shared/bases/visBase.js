class visBase {
	constructor(inputData, headingGroup, headingContinuous, statistic, focus){

		// This is the raw input data
		this.inputData = inputData;

		// This is the group to split on, I.E gender
		this.headingGroup = headingGroup;

		// This is the data to use for each data point, I.E height
		// For proportions, this is also the values of the primary group, E.G 0:male 1:female
		this.headingContinuous = headingContinuous;

		// This is the statistic to use for showing differences between groups, I.E mean or median.
		this.statistic = statistic;

		// This is the named prroportion to display on proportion visualisations, I.E for Ethnicity is
		// chosen and European is chosen as the focus, it will show European vs Other. 
		// Basically used to pick which category should be value 0.
		this.focus = focus;

		// whether or not to calculate the large CI numbers
		this.calcLargeCI = true;

		// what the type of value the last section shows, straight statistic for 1 category or difference for 2.
		this.sampleStatType = 'diff';

		// max number of samples to take
		this.numSamples = 1100;

		// include the boxes for samples
		this.includeSampleSection = true;

		// Allows the value to be categorical for comparing proportions between groups. E.G comparing gender for each 
		// travel type in [bus, walk, bike]. Travel style would be the value, group would be gender. For now keep
		// and display the cat values as either 1 for the focus or 0 for other.
		this.valueAllowCategorical = false;

		// Holds the names of categories splitting value.
		this.valueCategories = new Set();

		this.popSetup = false;
		this.sampSetup = false;
		this.animationIndex = 0;
		this.animationState = 0;

		// Type of visualisation for the population.
		// Continuous  = 0;
		// Proportional = 1;
		this.popDrawType = 0;

		this.maxSize = 2000;

		this.withinSample = false;
	}

	changeStat(newStatistic){
		this.statistic = newStatistic;
		this.destroy();
	}
	changeWS(new_ws){
		this.withinSample = new_ws;
		this.destroy();
	}
	setUpPopCategory(items, scale, radius, top, bottom){
		// Sets the y value for all population circles in the category to make it look heaped. 
		heapYValues3(items, scale, radius, 0, top,bottom);
	}

	setupSampleGroups(){
		this.sampleGroups = this.groups;
	}

	setUpPopulation(){
		var self = this;
		var max = null;
		var min = null;
		var populationSize = this.inputData.length;
		// This is the input data filtered to just the continuous and group data selected.
		// It is split by the group values. 
		this.populations = [];
		this.allPop = [];

		// List of the categories for grouping on. E.g ['male', 'female'] for grouping on gender. 
		// Is ordered, so changing the order changes the order show in the vis.
		this.groups = [];
		if(this.headingGroup == null) {
			this.groups = [""];
			this.populations[""] = [];
		}
		this.setupSampleGroups();
		// The statistic for each of the groups, ordered in the same way.
		this.groupStats = [];

		// Value categories real names.
		var allValueCategories = new Set();
		this.valueCategories = new Set();

		// For visualisations where the data is categorical, I.E proportions, we want the focus to be
		// the first value in the list of categories.
		if(this.focus != null){
			this.valueCategories.add(this.focus);
			allValueCategories.add(this.focus);
		}

		// For loop to go through every data point and extract the relevant info.
		// Here this is the category and value for every item.
		// Items also store their x and y values for drawing on the screen at every sample.
		// These item stubs are stored in this.population.

		
		// Min and Max for the population is also calculated here.
		for(var i = 0; i < populationSize;i++){
			var thisItem = new Object();
			var inputItem = this.inputData[i];

			if(this.headingGroup != null){
				// If we havent already encountered a value for this group, make a new one in this.populations.
				if(!(inputItem[this.headingGroup] in this.populations)) {
					this.populations[inputItem[this.headingGroup]] = [];
					this.groups.push(inputItem[this.headingGroup]);
				}
			}
			thisItem.group = this.headingGroup != null ? inputItem[this.headingGroup] : "";
			if(!this.valueAllowCategorical){
				thisItem.value = this.headingContinuous != null ? +inputItem[this.headingContinuous] : +(thisItem.group == this.focus);
			}else{
				var itemValueCategory = inputItem[this.headingContinuous];

				// If focus is set, we only want to compare the focus against all other values,
				// E.g comapre male to female but bike to school against all other transport options.
				allValueCategories.add(itemValueCategory);
				if(this.focus != null){
					itemValueCategory = itemValueCategory == this.focus ? itemValueCategory : "Other";
				}

				if(itemValueCategory != null){
					this.valueCategories.add(itemValueCategory);
				}
				thisItem.value =  [...this.valueCategories].indexOf(itemValueCategory);
			}
			if(isNaN(thisItem.value)) continue;
			if(max == null | thisItem.value > max) max = thisItem.value;
			if(min == null | thisItem.value < min) min = thisItem.value;
			thisItem.xPerSample = {};
			thisItem.yPerSample = {};
			thisItem.id = i;
			this.populations[thisItem.group].push(thisItem)
			this.allPop.push(thisItem);

		}

		if ([...allValueCategories].length == 1){
			alert("Chosen categorical variable only has one level: " + [...allValueCategories][0]);
		}

		//If there are only 2 categories for the value, call the second by its name instead of other
		if([...allValueCategories].length == 2) {
			this.valueCategories.delete("Other");
			this.valueCategories.add([...allValueCategories][1]);
		}

		// Make a scale that converts values between [min, max] to values to draw on the screen.
		this.xScale = d3.scale.linear().range([this.windowHelper.graphSection.x1,this.windowHelper.graphSection.x2]);
		this.xScale.domain([min,max]);
		var s = [];

		// we want the groups in order of lowest to highest statistic, (unless a focus is set, in which case it is first)
		// mainly so the arrow always points right (i think)
		this.groups.sort(function(a,b){
			return getStatistic(self.statistic,self.valueAllowCategorical ? self.populations[a].filter(function(i){return i.value==0}) : self.populations[a], self.valueAllowCategorical ? self.populations[a].length : populationSize) - getStatistic(self.statistic,self.valueAllowCategorical ? self.populations[b].filter(function(i){return i.value==0}) : self.populations[b], self.valueAllowCategorical ? self.populations[b].length : populationSize);
			// return getStatistic(self.statistic,self.valueAllowCategorical ? self.populations[a] : self.populations[a], self.valueAllowCategorical ? self.populations[a].length : populationSize) - getStatistic(self.statistic,self.valueAllowCategorical ? self.populations[b].filter(function(i){return i.value==0}) : self.populations[b], self.valueAllowCategorical ? self.populations[b].length : populationSize);
		})

		// Sets up a section for each of the categorical variable possibilities. (If visualising proportion, split on second categorical, *NOT IMPLEMENTED YET*)
		var numDivisions = this.groups.length;
		var divisions = this.windowHelper.graphSection.S1.displayArea.getDivisions(numDivisions, 'height');
		var divSections = divisions[0];
		var divHeight = divisions[1];
		for(var j =0; j <numDivisions; j++){
			var top = divSections[j] - divHeight;
			var bottom = divSections[j] - this.windowHelper.radius*2 - divHeight/2;

			// setUp the items in each category.
			this.setUpPopCategory(this.populations[this.groups[j]], this.xScale, this.windowHelper.radius, top, bottom);

			// gets the selected statistic for category.
			var stat = getStatistic(this.statistic, this.valueAllowCategorical ? this.populations[this.groups[j]].filter(function(i){return i.value==0}) : this.populations[this.groups[j]], this.valueAllowCategorical ? this.populations[this.groups[j]].length : populationSize);
			// var stat = getStatistic(this.statistic, this.valueAllowCategorical ? this.populations[this.groups[j]] : this.populations[this.groups[j]], this.valueAllowCategorical ? this.populations[this.groups[j]].length : populationSize);
			this.groupStats[this.groups[j]] = stat;
			s.push(stat);
		}

		// NOTE: THIS BIT IS HARDCODED FOR 2 CATEGORIES!!! PROBABLY SHOULD CHANGE AT SOME POINT.
		// Addes the difference in group means to preCalculatedTStat list.
		if(numDivisions >= 2){
			var newItem = new item(s[1]-s[0], i);
			newItem.s0 = s[0];
			newItem.s1 = s[1];
			

			if(this.groups.length != 2){
				//this.implemented = false;
			}

			this.populationDiff = newItem.value;
		}
		this.populationStatistics = this.setupPopulationStatistics();
		
		if(this.sampleStatType == 'diff'){
			// this.populationDiff = newItem.value;
			this.populationStatistic = this.populationDiff;
		}else if(this.sampleStatType == 'Deviation'){
			this.populationDiff = this.populationStatistics.averageDeviation;
			this.populationStatistic = this.populationStatistics.averageDeviation;
		}else{
			this.populationStatistic = this.groupStats[this.groups[0]];
		}
		if(this.allPop.length > this.maxSize){
			this.implemented = false;
		}
		this.popSetup = true;
	}

	setupPopulationStatistics(){
		var populationStatistics = new Object();
		populationStatistics.population = new Object();
		populationStatistics.population.statistic = getStatistic(this.statistic, this.valueAllowCategorical ? this.allPop.filter(function(i){return i.value==0}):this.allPop, this.allPop.length);
		if(this.popDrawType == 1){
			// populationStatistics.population.statistic = 1 - populationStatistics.population.statistic;
			populationStatistics.population.statistic = populationStatistics.population.statistic;
		}
		populationStatistics.groups = new Object();
		for(var g = 0; g < this.groups.length; g++){
			var groupName = this.groups[g];
			populationStatistics.groups[groupName] = new Object();
			var stat = getStatistic(this.statistic, this.valueAllowCategorical ? this.populations[groupName].filter(function(i){return i.value==0}) : this.populations[groupName], this.valueAllowCategorical ? this.populations[groupName].length : this.allPop.length);
			populationStatistics.groups[groupName].statistic = stat;
			var diff = Math.abs(populationStatistics.population.statistic - stat);
			populationStatistics.groups[groupName].groupDeviation = diff;
		}
		this.extraStatistics(populationStatistics);
		return(populationStatistics)
	}
	extraStatistics(populationStatistics){
		return;
	}

	getSampleSize(){

	}

	setUpSampleCategory(items, scale, radius, sample, top, bottom){
		// Sets the y value for all population circles in the category to make it look heaped. 
		heapYValues3(items, scale, radius, sample, top,bottom);
	}

	setUpLargeCI(sSize){
		// Get the tail proportion info for 10,000 samples.
		this.resetSampleStatistics();
		this.makeSample(this.populations, 10000, sSize, this.statistic, false, this.withinSample);
		// this.setUpSampleStatistics();
		this.largeTailSize = 0;
		for(var k = 0; k < this.sampleStatistics.length; k++){
			if(this.sampleStatistics[k].diff >= this.populationDiff){
				this.largeTailSize++;
			}
		}
	}

	setUpCI(statList){
		this.tailCount = 0;
		this.CISplit = this.populationStatistic;
		for(var k = 0; k < this.numSamples;k++){
			var sampleStat = this.sampleStatistics[k].value;
			if(sampleStat < this.CISplit){
				this.sampleStatistics[k].inCI = false;
			}else{
				this.sampleStatistics[k].inCI = true;
				this.tailCount++;
			}
		}
	}

	getStatisticEachSample(i, g, sample, prop_length){
		var populationSize = this.inputData.length;
		if(sample == undefined){
			sample = this.samples[i];
		}
		return getStatistic(this.statistic, sample[g], prop_length ? prop_length : populationSize);
	}
	setSampleStatistic(diff, categoryStatistics){
		return (this.sampleStatType == 'diff' || this.sampleStatType == "Deviation") ? diff : categoryStatistics[0];
	}
	handleSample(i, sample, prop_length = null){
		var categoryStatistics = [];
		if(sample == undefined){
			sample = this.samples[i];
		}
		for(var g = 0; g < sample.length; g++){

			// statistic for sample i, catagory g;
			var stat = this.getStatisticEachSample(i, g, sample, prop_length)
			categoryStatistics.push(stat);


		}
		var diff = null;

		// if there are more than 2 categories, we calculate the difference and put that in. otherwise null;
		// only supports difference between 2 groups.
		if(categoryStatistics.length == 2){
			diff = categoryStatistics[1] - categoryStatistics[0];
		}
		if(categoryStatistics.length > 2){
			let pop_stat = this.populationStatistics.population.statistic;
			diff = 0;
			for(var g = 0; g < sample.length; g++){
				let deviation = Math.abs(categoryStatistics[g] - pop_stat)
				if(isNaN(deviation)){
					console.log(categoryStatistics[g]);
				}
				diff += deviation;
			}
			diff /= sample.length;
		}
		if(this.largestDiff == null || diff > this.largestDiff){
			this.largestDiff = diff;
		}

		if(this.smallestDiff == null || diff < this.smallestDiff){
			this.smallestDiff = diff;
		}

		var sampleStats = new Object();
		sampleStats.diff = diff;
		sampleStats.stats = categoryStatistics;
		var sampleValue = this.setSampleStatistic(diff, categoryStatistics);
		sampleStats.value = sampleValue;
		sampleStats.xPerSample = {};
		sampleStats.yPerSample = {};
		this.sampleStatistics.push(sampleStats);

		if(this.largestStat == null || sampleValue > this.largestStat){
			this.largestStat = sampleValue;
		}

		if(this.smallestStat == null || sampleValue < this.smallestStat){
			this.smallestStat = sampleValue;
		}
	}
	// goes through samples and calculates the statistics, adding them to this.sampleStatistics.
	// each entry in sampleStatistics is a difference as well as a list of individual statistic for each sample.
	// returns the largest and smallest difference as well as largest and smallest individual statistic.
	setUpSampleStatistics(){
		this.sampleStatistics = [];
		this.largestDiff = null;
		this.smallestDiff = null;
		this.largestStat = null;
		this.smallestStat = null;

		for(var i = 0; i < this.samples.length; i++){
			this.handleSample(i);
		}
	}
	resetSampleStatistics(){
		this.sampleStatistics = [];
		this.largestDiff = null;
		this.smallestDiff = null;
		this.largestStat = null;
		this.smallestStat = null;
	}
	setUpSamples(sampleSize){
		var self = this;

		var sSize = this.getSampleSize(sampleSize);
		if(sSize == null){
			return;
		}
		var statList = [];

		if(this.calcLargeCI){
			this.setUpLargeCI(sSize);
		}

		this.resetSampleStatistics();
		this.makeSample(this.populations, this.numSamples, sSize, this.statistic, true, this.withinSample);
		// this.setUpSampleStatistics();
		var sampleStatRange = (this.sampleStatType == 'diff' || this.sampleStatType == "Deviation") ? [this.smallestDiff, this.largestDiff] : [this.smallestStat, this.largestStat];
		this.sampleStatScale = d3.scale.linear().range([this.windowHelper.graphSection.x,this.windowHelper.graphSection.x + this.windowHelper.graphSection.width]);
		this.originalStatScale = d3.scale.linear().range([this.windowHelper.graphSection.x,this.windowHelper.graphSection.x + this.windowHelper.graphSection.width]);
		this.originalStatScale.domain(sampleStatRange);
		var populationRange = this.xScale.domain();
		var halfDiff = (populationRange[1]-populationRange[0])/2;
		var sampleHalfDiff = (Math.max(Math.abs(sampleStatRange[0]),Math.abs(sampleStatRange[1]) ));
		let scaleOffset = 0;
		//let useDiff = Math.max(halfDiff, sampleHalfDiff);
		if(Math.abs(sampleStatRange[0]) > halfDiff && Math.abs(sampleStatRange[0]) >= Math.abs(sampleStatRange[1])){
			scaleOffset = (0-halfDiff) - Math.abs(sampleStatRange[0]);
		}else if(Math.abs(sampleStatRange[1]) > halfDiff && Math.abs(sampleStatRange[1]) >= Math.abs(sampleStatRange[0])){
			scaleOffset = Math.abs(sampleStatRange[1]) - (0+halfDiff);
		}

		// For Differences
		// has the same range as the population scale, but centered around 0.
		if(this.sampleStatType == "diff") {
			let extra = Math.max(Math.abs((0-halfDiff) - sampleStatRange[0]), Math.abs(sampleStatRange[1] - (0+halfDiff)), 0);
			// this.sampleStatScale.domain([0-halfDiff + scaleOffset, 0+halfDiff + scaleOffset]);
			this.sampleStatScale.domain([0 - (halfDiff + extra), 0 + (halfDiff + extra)]);
			this.sampleStatScale.domain([0 - (halfDiff), 0 + (halfDiff )]);
		}else if(this.sampleStatType == "Deviation"){
			this.sampleStatScale.domain([0,this.xScale.domain()[1] - this.xScale.domain()[0]]);
		}else{
			this.sampleStatScale.domain(populationRange);
		}

		// setup the sample displays in section 2.
		var divisions = this.windowHelper.graphSection.S2.displayArea.getDivisions(this.samples[0].length, 'height');
		var divSections = divisions[0];
		var divHeight = divisions[1];
		for(var j =0; j <this.samples[0].length;j++){
			var top = divSections[j] - divHeight;
			var bottom = divSections[j] - this.windowHelper.radius*2 - divHeight/2;		
			for(var k = 0;k<this.numSamples;k++){
				this.setUpSampleCategory(this.samples[k][j], this.xScale, this.windowHelper.radius,k+1,top,bottom);
			}
		}

		var statlist = (this.sampleStatType == 'diff' || this.sampleStatType == 'Deviation') ? this.sampleStatistics.map(function(statObj){ return statObj.diff}) : this.sampleStatistics.map(function(statObj){ return statObj.stats[0]});
		statlist.sort(function(a,b){
			if(Math.abs(self.populationStatistic - a ) < Math.abs(self.populationStatistic - b)) return -1;
			if(Math.abs(self.populationStatistic - a ) > Math.abs(self.populationStatistic - b)) return 1;
			return 0;
		});
		this.setUpCI(statlist);

		heapYValues3(this.sampleStatistics,this.sampleStatScale,this.windowHelper.radius,0,this.windowHelper.graphSection.S3.displayArea.y1,this.windowHelper.graphSection.S3.displayArea.y2 - this.windowHelper.radius*2);
		
		this.statsDone = true;
		this.sampSetup = true;
	}


	// This should just fill this.samples.
	// Each entry should be a sample split by group category.
	// I.E 2 samples with 2 categories: [[[1,2,3],[4,5,6]], [[1,3,5],[2,4,6]]]
	// 	   2 samples with no categories: [[[1,2,3,4,5,6]], [[1,2,3,4,5,6]]] (counts as 1 category so consistant)
	// Implementation will likely be different for each visualisation.
	makeSample(populations, numSamples, sampleSize, statistic, saveSample, withinSample){

	}

	draw(){
		var self = this;
		if(!this.statsDone) return;
		this.drawPop();
		this.drawSample();
	}

	drawContinuous(placeInto){
		var self = this;
		var divisions = this.windowHelper.graphSection.S1.displayArea.getDivisions(this.groups.length, 'height');
		var divSections = divisions[0];
		var divHeight = divisions[1];
		for(var i = 0;i<this.groups.length;i++){
			var pos = divSections[i] - divHeight/2 - this.windowHelper.radius*2;
			var catSVG = placeInto.append("g").attr("id","pop"+i);
			catSVG.selectAll("circle").data(this.populations[this.groups[i]]).enter().append("circle")
			    .attr("cx", function(d, i) { 
			    	return d.xPerSample[0]; })
			    .attr("cy", function(d) {
			    	return d.yPerSample[0];
			    })
			    .attr("r", function(d) { return self.windowHelper.radius; })
			    .attr("fill-opacity", 0.5)
			    .attr("stroke-opacity",1).attr("class",function(d){return "c"+d.id})
			    .style("fill", function(){return colorByIndex[i]});
			catSVG.append("line").attr("class", "pop-stat").attr("x1", this.xScale(this.groupStats[this.groups[i]])).attr("x2", this.xScale(this.groupStats[this.groups[i]])).attr("y1", pos+this.windowHelper.lineHeight).attr("y2", pos-this.windowHelper.lineHeight).style("stroke-width", 2).style("stroke", "black").style("stroke-width",3);
			catSVG.append("text").attr("class", "pop-stat").attr("y", pos - divHeight/4).attr("x", this.windowHelper.graphSection.x2).text(this.groups[i]).attr("fill",colorByIndex[i]).attr("text-anchor","end").style("opacity",1).style("font-size",this.windowHelper.fontSize).attr("alignment-baseline","middle");
			catSVG.append("text").attr("class", "pop-stat").attr("y", pos - divHeight/4 + this.windowHelper.graphSection.S1.height).attr("x", this.windowHelper.graphSection.x2).text(this.groups[i]).attr("fill",colorByIndex[i]).attr("text-anchor","end").style("opacity",1).style("font-size",this.windowHelper.fontSize).attr("alignment-baseline","middle");
		}
	}

	drawProportional(placeInto){
		var self = this;

		
		// Should make a division for each group.
		var numDivisions = this.groups.length;
		var divisions = this.windowHelper.graphSection.S1.displayArea.getDivisions(numDivisions, 'height');
		var divSections = divisions[0];
		var divHeight = divisions[1];
		for(var i = 0;i<numDivisions;i++){
			var pos = divSections[i] - divHeight/2 - this.windowHelper.radius*2;
			var catSVG = placeInto.append("g").attr("id","pop"+i);

			var groupName = this.groups[i];
			// Now split on main categories. We want a category for the focus and one for other.
			var focusGroup = self.populations[groupName].filter(function(x){return x.value == 0});
			var otherGroup = self.populations[groupName].filter(function(x){return x.value != 0});

			this.drawProportionBars(catSVG, divHeight, pos, self.xScale, focusGroup, otherGroup, groupName, i, [...this.valueCategories]);
		}
	}

	drawProportionBars(svg, divHeight, pos, xScale, fG, oG, name, i, barTitles){
		var self = this;
		// Each bar has its start in units, its end in units, the total amouint of units and its name.
		let bt1 = barTitles[0];
		let bt2 = barTitles[1];
		var bars = [[0, fG.length, fG.length + oG.length, bt1, name], [fG.length, oG.length, fG.length + oG.length, bt2, name]];

		// Bar Name (group)
		svg.append("text").text(name)
		.attr("x", xScale(1))
		.attr("y", pos - divHeight/4 - 2)
		.attr("text-anchor", "end")
		.attr("fill",colorByIndex[i+[...self.valueCategories].length])
		.style("font-size", divHeight*0.4).style("opacity", 0.6);

		svg = svg.selectAll("g").data(bars);

		var barsSVG = svg.enter().append("g").attr("id", function(d){return name + "\\" + i + d[3]});
		barsSVG.append("rect")
			.attr("height", divHeight/2)
			.attr("y", pos - divHeight/4)
			.attr("width", function(d){ return xScale((d[1]+ d[0])/d[2]) - xScale((d[0])/d[2]) })
			.attr("x", function(d){return xScale(d[0]/d[2])})
			.attr("fill",function(d,i){return colorByIndex[i]})
			.attr("fill-opacity","0.8");
		for(let b = 0; b < bars.length; b++){
			let bar = bars[b];
			let bar_width = xScale((bar[1] + bar[0])/bar[2]) - xScale((bar[0])/bar[2]);
			let bar_height = divHeight/2;
			let min_r = 2;
			let max_r = Math.min(bar_width, bar_height);
			let radius = max_r;
			let rows = 1;
			let row_l = bar[1];
			let max_row_length = bar_width / (min_r * 2);
			let width_r = bar_width / (row_l * 2);
			let height_r = bar_height / (rows * 2);
			let it_max = 20;
			let it = 0;
			while (it < it_max && (max_row_length < row_l || height_r > width_r * 1.5)){
				rows++;
				row_l = Math.ceil(bar[1]/rows);
				width_r = bar_width / (row_l*2);
				height_r = bar_height / (rows*2);
				it++;
			}
			rows = Math.ceil(bar[1]/row_l);
			width_r = bar_width / (row_l*2);
			height_r = bar_height / (rows*2);
			radius = Math.min(width_r, height_r);
			let y_free_space = bar_height - (rows * radius * 2);
			let y_top_margin = y_free_space / 2;
			let x_free_space = bar_width - (row_l * radius * 2);
			let x_left_margin = x_free_space / 2;
			let r = 0;
			let c = 0;
			let lim = Math.min(bar[1], max_row_length * (bar_height / (min_r *2)), 500);
			let bar_id = "#" + name + "\\" + i + bar[3].replace(/ /g,'')
			let bar_element = d3.select(barsSVG[0][b]);
			let item_x = xScale(bar[0] / bar[2]);
			for(let i = 0; i < lim; i++){
				bar_element.append("circle")
					.attr("cx", item_x + x_left_margin + radius + (radius * 2)*r)
					.attr("data-cx", item_x + x_left_margin + radius + (radius * 2)*r)
					.attr("cy", pos - (bar_height / 2) + y_top_margin + radius + (radius * 2)*c)
					.attr("data-cy", pos - (bar_height / 2) + y_top_margin + radius + (radius * 2)*c)
					.attr("id", 'pc---' + bar[3].replace(/ /g,'') + '---' + bar[4].replace(/\W/g,'') + '---' + i)
					.attr("data-fill", d3.rgb(colorByIndex[b]).brighter(0.5))
					.style("fill", d3.rgb(colorByIndex[b]).brighter(0.5))
					.attr("data-r", radius)
					.attr("r", radius)
				r++;
				if(r == row_l){
					c++;
					r = 0;
				}
				
			}
		}
		

		barsSVG.append("text").text(function(d){return d[1] > 0 ? d[1] : ""})
		.attr("x", function(d){return xScale(d[0]/d[2]) + (xScale((d[1]+ d[0])/d[2]) - xScale((d[0])/d[2])) /2 })
		.attr("y", pos)
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "central")
		.attr("fill","white")
		.style("font-size", divHeight*0.6).style("opacity", 0.6);

		// barsSVG.append("line")
		// .attr("x1", function(d){return xScale(d[0]/d[2]) })
		// .attr("x2", function(d){return xScale(d[0]/d[2]) + (xScale((d[1]+ d[0])/d[2]) - xScale((d[0])/d[2])) })
		// .attr("y1", pos)
		// .attr("y2", pos);	

		barsSVG.append("text").text(function(d){return d[1] > 0 ? d[3] : ""})
		.attr("x", function(d){return xScale(d[0]/d[2])})
		.attr("y", pos - divHeight/4 - 2)
		.attr("text-anchor", "start")
		.attr("fill",function(d,i){return colorByIndex[i]})
		.style("font-size", this.windowHelper.fontSize);	
	}

	drawPopulationCategories(placeInto){
		var popDrawFunctions = [this.drawContinuous.bind(this), this.drawProportional.bind(this)];
		var popDrawFunction = popDrawFunctions[this.popDrawType];
		popDrawFunction(placeInto);
	}

	labelSections(placeInto){
		var self = this;
    	placeInto.append("text").attr("class","sectionLabel").attr("x", self.xScale.range()[0]).attr("y",self.windowHelper.graphSection.S1.titleArea.y1+2).text(self.sectionLabels[0]).style("opacity", 1).style("font-size",self.windowHelper.fontSize).style("fill","black").style("font-weight","bold").attr("dominant-baseline", "hanging");
    	placeInto.append("text").attr("class","sectionLabel").attr("x", self.xScale.range()[0]).attr("y",self.windowHelper.graphSection.S2.titleArea.y1+2).text(self.sectionLabels[1]).style("opacity", 1).style("font-size",self.windowHelper.fontSize).style("fill","black").style("font-weight","bold").attr("dominant-baseline", "hanging");
    	placeInto.append("text").attr("class","sectionLabel").attr("x", self.xScale.range()[0]).attr("y",self.windowHelper.graphSection.S3.titleArea.y1+2).text(self.sectionLabels[2]).style("opacity", 1).style("font-size",self.windowHelper.fontSize).style("fill","black").style("font-weight","bold").attr("dominant-baseline", "hanging");
	}

	drawPopAxis(placeInto){
		var xAxis = d3.svg.axis();
		xAxis.scale(this.xScale).tickSize(2);
		placeInto.append("g").attr("class","axis").attr("transform", "translate(0," + (this.windowHelper.graphSection.S1.axisArea.y) + ")").call(xAxis);
		placeInto.append("g").attr("class","axis").attr("transform", "translate(0," + (this.windowHelper.graphSection.S2.axisArea.y) + ")").call(xAxis);
	}

	fillBaseSampleSection(placeInto){
		var self = this;
		let container = document.getElementById('sampleSectionPop');
		placeInto.append("text").text(this.headingContinuous).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width/4).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");
		placeInto.append("text").text(this.headingGroup).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");
		var popTextG = placeInto.selectAll("g").data(this.allPop).enter().append("g");
		popTextG.append("text").text(function(d){return d.value}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width/4).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").attr("text-anchor","middle");
		popTextG.append("text").text(function(d){return d.group}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("stroke", function(d){return colorByIndex[self.groups.indexOf(d.group)]}).attr("text-anchor","middle");

		placeInto.append("g").attr("id","redTContainer");
		placeInto.append("text").text("Re-randomised").attr("x",(self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width/2)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("display","inline-block").attr("text-anchor","middle");

	}

	drawSampleSection(placeInto){
		var self = this;
		var sampleSection = placeInto.append("g").attr("id","sampleSection");
		sampleSection.append("rect").attr('id', 'sampleSectionPop').attr("width",self.windowHelper.sampleSection.S1.width).attr("x", self.windowHelper.sampleSection.S1.x).attr("height",self.windowHelper.sampleSection.S1.height).attr("y", self.windowHelper.sampleSection.S1.y).attr("rx", "20").attr("ry","20").style("fill","#D0D0D0").style("stroke","black");
		sampleSection.append("rect").attr('id', 'sampleSectionSample').attr("width",self.windowHelper.sampleSection.S2.width).attr("x", self.windowHelper.sampleSection.S2.x).attr("height",self.windowHelper.sampleSection.S2.height).attr("y", self.windowHelper.sampleSection.S2.y).attr("rx", "20").attr("ry","20").style("fill","#D0D0D0").style("stroke","black");
		this.fillBaseSampleSection(sampleSection);
	}

	drawPop(){
		// Cancel if setup has not run.
		if(!this.popSetup) return;
		var self = this;

		// add a group to place all population elements into.
		var popDraw = d3.select(".svg").append("g").attr("id", "population");

		// draw axis for first 2 sections.
		this.drawPopAxis(popDraw);

		// add a group to place population elements into.
		var popCategories = popDraw.append("g").attr("class","pop");
 		this.drawPopulationCategories(popCategories);
		
		this.labelSections(popDraw);

		if(this.includeSampleSection){
			this.drawSampleSection(popDraw);
		}

		this.drawPopExtra(popDraw);
	}

	drawPopExtra(placeInto){
		return;
	}

	drawSampleAxis(placeInto){
		var xAxis2 = d3.svg.axis();
		xAxis2.scale(this.sampleStatScale).tickSize(2);
		placeInto.append("g").attr("class","axis").attr("id", "window_focus_axis").attr("transform", "translate(0," + (this.windowHelper.graphSection.S3.axisArea.y) + ")").call(xAxis2);	

		// we want 0 to be bolded
		d3.selectAll(".axis text").filter(function(d){
			return d == 0;
		}).style("font-weight",700);

		var xAxis3 = d3.svg.axis();
		xAxis3.scale(this.originalStatScale).tickSize(2);
		placeInto.append("g").attr("class","axis").attr("id", "dist_focus_axis").attr("transform", "translate(0," + (this.windowHelper.graphSection.S3.axisArea.y) + ")").attr("opacity", 0).call(xAxis3);	

		// we want 0 to be bolded
		d3.selectAll("#dist_focus_axis text").filter(function(d){
			return d == 0;
		}).style("font-weight",700);
	}

	drawPopulationStatistic(placeInto){
		let area = this.windowHelper.graphSection.S1.displayArea;
		var middle = this.windowHelper.graphSection.S1.displayArea.getMiddleHeight();
		if(this.sampleStatType == 'diff'){
			drawArrow(this.xScale(this.groupStats[this.groups[1]]), this.xScale(this.groupStats[this.groups[0]]), middle, placeInto, "popDiff", 1, "red");
			placeInto.append("text").attr("x", this.xScale(this.groupStats[this.groups[1]])).attr("y", middle).text(Math.round((this.populationStatistic)*100)/100).style("stroke","red").style("opacity",1);

		}else if(this.sampleStatType == 'Deviation'){
			
			// placeInto.append("line").attr("x1", this.xScale(this.populationStatistic)).attr("x2", this.xScale(this.populationStatistic))
			// .attr("y1", this.windowHelper.graphSection.S1.y).attr("y1", this.windowHelper.height)
			// .style("stroke-dasharray", 5)
			// placeInto.append("text").attr("x", this.xScale(this.populationStatistic) + 2).attr("y", this.windowHelper.graphSection.S1.displayArea.y2 - 2).text(Math.round((this.populationStatistic)*100)/100).style("stroke","red").style("opacity",1);

		}else{
			// drawArrow(this.xScale(this.groupStats[this.groups[1]]), this.xScale(this.groupStats[this.groups[0]]), middle, placeInto, "popDiff", 1, "red");
			placeInto.append("line").attr("x1", this.xScale(this.populationStatistic)).attr("x2", this.xScale(this.populationStatistic))
			.attr("y1", this.windowHelper.graphSection.S1.y).attr("y1", this.windowHelper.height)
			.style("stroke-dasharray", 5)
			let text_y = middle + this.windowHelper.graphSection.S1.displayArea.height / 4;
			
			placeInto.append("text").attr("x", this.xScale(this.populationStatistic)).attr("y", text_y).text(Math.round((this.populationStatistic)*100)/100).style("stroke","red").style("opacity",1);
			makeBoxplot( this.windowHelper.graphSection.S1.displayArea.x + this.windowHelper.radius,text_y,this.windowHelper.graphSection.S1.displayArea.width -this.windowHelper.radius,this.windowHelper.graphSection.S1.displayArea.height / 4 - this.windowHelper.radius,this.allPop,this.xScale);

		}

	}

	drawSampleDisplay(placeInto){
		var middle = this.windowHelper.graphSection.S2.displayArea.getMiddleHeight();
		placeInto.append("g").attr("class","sampleDiffs");
		placeInto.append("g").attr("class","sampleLines2");
		var meanCircles = placeInto.append('g').attr("id", "sampleDisplay").selectAll("circle").data(this.sampleStatistics)
			.enter().append("circle")
		    .attr("cx", function(d, i) { 
		    	return d.xPerSample[0]; })
		    .attr("cy", function(d) {
		    	return d.yPerSample[0];
			})
			.attr("data-value", (d) => d.value)
		    .attr("r", this.windowHelper.radius)
		    .attr("fill-opacity", 0)
		    .attr("stroke-opacity",0)
		    .attr("class",function(d){
				    	if(d.inCI){
				    		return "inCI";
				    	}else{
				    		return "notInCI";
				    	}
				    });
	}

	drawSample(){
		// cancel if setup has not run.
		if(!this.sampSetup) return;
		var self = this;

		var sampleDraw = d3.select(".svg").insert("g", ".meanOfSamples").attr("id", "samples");

		// does not handle more than 2 categories right now.
		//if(this.groups.length > 2) return;

		// draw axis for section 3
		this.drawSampleAxis(sampleDraw);

		this.drawPopulationStatistic(sampleDraw.append('g').attr('id', 'pop-stat'));
		
		this.drawSampleDisplay(sampleDraw);		

		var overlayContainer = d3.select(".svg").append("g").attr("id", "dynamic").append("g").attr("id","circleOverlay");
		overlayContainer.append("g").attr("id","circleOverlayStill");
		overlayContainer.append("g").attr("id","circleOverlayDrop");
		d3.select("#fadeButton").remove();
	}

	// Sets up all initial conditions for animations.
	// I.E sets the current sample index to use.
	startAnim(repititions, goSlow, incDist){
		this.drawnMeans = [];
		d3.select(".sampleLines").selectAll("*").remove();
		this.cleanUpRepitition();
		if(repititions >900) this.resetLines();
		if(this.animationState == 0){
			if(repititions == 1) this.transitionSpeed = 1000;
			if(repititions == 5) this.transitionSpeed = 500;
			if(repititions == 20) this.transitionSpeed = 100;
			if(repititions == 1000) this.transitionSpeed = 0;
			if(this.animationIndex > this.numSamples*0.9){
				this.animationIndex = this.animationIndex % this.numSamples;
				this.resetLines();
			}
			var start = this.animationIndex;
			var end = start + repititions;
			if(repititions > 100) this.transitionSpeed = 0;
			var jumps = 1;
			if(repititions > 20) 
			{
				jumps = 2;
				if(incDist) jumps = 10;
			}


			this.showSteps = false;

			var settings = new Object();
			settings.goSlow = goSlow;
			settings.indexUpTo = start;
			settings.incDist = incDist;
			settings.end = end;
			settings.jumps = jumps;
			settings.delay = 1000;
			settings.pauseDelay = this.transitionSpeed;
			settings.fadeIn = 200;
			settings.repititions = repititions;
			settings.sample = [].concat.apply([],this.samples[settings.indexUpTo]);
			settings.drawArea = d3.select("#dynamic");
			order(settings.sample);

			this.settings = settings;
			this.animationController(settings, -1);
		} 
	}

	// End of the animation list for animations not ending in showing the distribution.
	endNoDist(settings, currentAnimation){
		if(settings.incDist){
			this.animationController(settings, currentAnimation);
		}else{
			this.animStepper(settings);
		}
	}

	// End of the animation list for animations ending in showing the distribution.
	endDist(settings, currentAnimation){
		this.animStepper(settings);
	}

	// controls starting the next animation in the list.
	animationController(settings, currentAnimation){
		this.animationState = currentAnimation + 1;
		this.animationList[currentAnimation+1](settings, currentAnimation + 1);
	}

	cleanUpRepitition(){

	}
	// controls what happens at the end of an animation. Usually starts the next one,
	animStepper(settings){

		settings.indexUpTo += settings.jumps;

		this.animationIndex += settings.jumps; 
		this.settings = settings;

		// If all repitiontions have been played, or repititions have gone over the number of samples availiable, end.
		// Otherwise start a new repitition.
		if(settings.indexUpTo >= settings.end || settings.indexUpTo >= this.numSamples-10){
			mainControl.doneVis();
			if(settings.repititions == 1000 && settings.incDist){
				var svg = d3.select(".svg").append("g").attr("id","meanBox");
				d3.selectAll(".CIButton").attr("disabled",null);
			}
			this.animationState = 0;
			return;
		}else{
			// clean up last repitition
			this.cleanUpRepitition();
			settings.sample = [].concat.apply([],this.samples[settings.indexUpTo]);
			this.settings = settings;
			this.animationController(settings, -1);
		}
	}

	showCI(num, large){
		var self = this;
		var CIVar = this.CISplit;
		var svg = d3.select(".svg");
		if(num == "10000"){
			CIVar = this.LargeCISplit;
		}
		var container = svg.append("svg").attr("id","CISplitContainer");
				var visibleCircles = d3.selectAll(".notInCI").filter(function(){
					return this.attributes["fill-opacity"].value == "1";
				});
				visibleCircles.style("opacity",0.2).transition().duration(500).each("end",function(d,i){
					if(i==0){
					drawArrowDown(self.windowHelper.graphSection.S3.displayArea.y2, self.windowHelper.graphSection.S3.displayArea.y2 - self.windowHelper.graphSection.S3.displayArea.height/2, self.sampleStatScale(self.populationStatistic-CIVar), container, "ciDownArrow", 1, "red",0.75);
					drawArrowDown(self.windowHelper.graphSection.S3.displayArea.y2, self.windowHelper.graphSection.S3.displayArea.y2 - self.windowHelper.graphSection.S3.displayArea.height/2, self.sampleStatScale(self.populationStatistic+CIVar), container, "ciDownArrow", 1, "red",0.75);
					//d3.select("#CISplit").append("line").attr("y1",self.windowHelper.section3.bottom - self.windowHelper.section3.height/4).attr("y2",self.windowHelper.section3.bottom + self.windowHelper.section3.height/10).attr("x1",self.xScale2(self.populationStatistic-self.CISplit)).attr("x2",self.xScale2(self.populationStatistic-self.CISplit)).style("stroke","red");
					//d3.select("#CISplit").append("line").attr("y1",self.windowHelper.section3.bottom - self.windowHelper.section3.height/4).attr("y2",self.windowHelper.section3.bottom + self.windowHelper.section3.height/10).attr("x1",self.xScale2(self.populationStatistic+self.CISplit)).attr("x2",self.xScale2(self.populationStatistic+self.CISplit)).style("stroke","red");
					container.append("text").attr("y",self.windowHelper.graphSection.S3.displayArea.y2).attr("x",self.sampleStatScale(self.populationStatistic+CIVar)).text(Math.round((self.populationStatistic+self.CISplit)*100)/100).style("stroke","black").style("fill", "red").style("font-size", 12);
					container.append("text").attr("y",self.windowHelper.graphSection.S3.displayArea.y2).attr("x",self.sampleStatScale(self.populationStatistic-CIVar)).text(Math.round((self.populationStatistic-self.CISplit)*100)/100).style("stroke","black").style("fill", "red").style("font-size", 12)
						.transition().duration(500).each("end",function(){
							container.append("line").attr("y1",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("x1",self.sampleStatScale(self.populationStatistic-self.CISplit)).attr("x2",self.sampleStatScale(self.populationStatistic+self.CISplit)).style("stroke","red").style("stroke-width",5);

						});
					}
				});

	}
	showLargeCI() {
		var self = this;
		var tailText = d3.select("#tailCountText");
		if(tailText[0][0] != null){
			tailText.text(self.largeTailSize + " / 10000 = " + self.largeTailSize/10000)	
		}else{
			this.showCI("10", true);
		}
	}

	destroy(){
		d3.select(".svg").selectAll("*").remove();
		d3.select("#CISplit").remove();
		d3.select(".svg").append("svg").attr("class","sampleLines");
		d3.select(".svg").append("svg").attr("class","meanOfSamples");
		this.resetData();
	}

	stop(){
		this.animationState = 0;
		this.resetLines();
	}

	resetData(){

		// max number of samples to take
		this.numSamples = 1100;


		this.animationIndex = 0;

		this.animationState = 0;
	}

	resetLines(){
		this.animationState = 0;
		this.animationIndex = 1;
		d3.select("#sampText").selectAll("*").remove();
		d3.select("#redTContainer").selectAll("*").remove();
		
		d3.select("#meanBox").remove();
		d3.selectAll("#CISplit").remove();
		d3.selectAll(".CIButton").attr("disabled",true);
		d3.selectAll(".notInCI").style("opacity",1);
		this.drawnMeans = [];
		d3.select(".svg").selectAll("*").transition().duration(20).attr("stop","true");
		var self = this;
		var svg = d3.select(".svg");
		svg.select(".sampleLines").selectAll("*").remove();
		svg.select("#circleOverlay").selectAll("g").remove();
		svg.select("#circleOverlay").selectAll("circle").remove();
		svg.select(".sampleLines2").selectAll("line").style("opacity",0);

		svg.select(".sampleDiffs").selectAll("line").style("opacity",0);

		svg.select("#sampleDisplay").selectAll("circle").attr("fill-opacity", 0).attr("stroke-opacity", 0);
		svg.select("#CISplitContainer").remove();
		this.animationState = 0;
	}

	pause(){
		if(this.waiting){
			this.pauseCalled = true;
			return;
		}
		this.pauseCalled = false;
		var rL = d3.select("#redLine");
		if(rL[0][0] != null) {
			this.settings.redLine = [rL.attr("y1"), rL.attr("y2"), rL.attr("x1")]; 
		}
		d3.select(".svg").selectAll("*").transition().duration(20).attr("stop","true");
		this.pauseState = this.animationState;
		this.animationState = 0;
		d3.selectAll(".goButton").attr("disabled",true);
		this.settings.restarting = false;
	}

	unPause(){
		if(this.pauseCalled){
			return;
		}
		this.settings.restarting = true;
		this.animationController(this.settings, this.pauseState-1);
	}

	distFocus(){
		let self = this;
		// Turn off allowing the CI animation to play
		// Need this because of scaling changes the animation
		// doesnt know.
		// Also would come from faded area.
		d3.selectAll(".CIButton").attr("disabled",true);
		let middle_stat = this.smallestStat + (this.largestStat - this.smallestStat) / 2;
		let dist_focus_axis = document.querySelector('#dist_focus_axis');
		let window_focus_axis = document.querySelector('#window_focus_axis');
		let main_axis_transform = dist_focus_axis.getAttribute("transform");
		let main_axis_x = parseFloat(main_axis_transform.split('(')[1].split(',')[0])
		let main_axis_y = parseFloat(main_axis_transform.split('(')[1].split(',')[1])
		let dist_container = document.querySelector('#samples #sampleDisplay');
		let dist_items = document.querySelectorAll('#samples #sampleDisplay circle');
		let x_shift = -100;
		// dist_focus_axis.setAttribute("transform", `translate(${main_axis_x + x_shift}, ${main_axis_y})`);
		dist_focus_axis.setAttribute("opacity", 1);
		window_focus_axis.setAttribute("opacity", 0);
		// dist_container.setAttribute("transform", `translate(${x_shift}, 0)`);
		for(let dist_item of dist_items){
			console.log(this.originalStatScale.range);
			console.log(this.originalStatScale.domain);
			dist_item.setAttribute('cx', this.originalStatScale(parseFloat(dist_item.dataset.value)));
		}

		let ci_scale_change = function(v){
			return self.originalStatScale(self.sampleStatScale.invert(parseFloat(v)))
		}
		let ci_lines = document.querySelectorAll('#CISplitContainer line');
		let ci_text = document.querySelectorAll('#CISplitContainer text');
		if(ci_lines.length == 0) ci_lines = document.querySelectorAll('#CISplit line');
		if(ci_text.length == 0) ci_text = document.querySelectorAll('#CISplit text');
		for(let ci_line of [...ci_lines, ...ci_text]){
			for(let attr_to_rescale of ["x1", "x2", "x"]){
				let v = ci_line.getAttribute(attr_to_rescale);
				if(v == null) continue;
				let rescaled_v = ci_scale_change(v)
				ci_line.setAttribute(attr_to_rescale, rescaled_v);
				console.log(v);
				console.log(rescaled_v)
			}
			// let x1 = parseFloat(ci_line.getAttribute("x1"));
			// let x2 = parseFloat(ci_line.getAttribute("x2"));
			
		}




		let dynamic_circle = document.querySelectorAll('#dynamic circle');
		let dynamic_text = document.querySelectorAll('#dynamic text');
		let dynamic_line = document.querySelectorAll('#dynamic line');
		let population_circle = document.querySelectorAll('#population circle');
		let population_rect = document.querySelectorAll('#population rect');
		let population_text = document.querySelectorAll('#population text');
		let population_line = document.querySelectorAll('#population line');

		// for(let di of [...dynamic_circle, ...dynamic_line, ...dynamic_text]){
		// 	di.setAttribute('data-distopacity', di.getAttribute('opacity'));
		// 	di.setAttribute('opacity', 0.1);
		// 	di.setAttribute('data-diststroke-opacity', di.getAttribute('stroke-opacity'));
		// 	di.setAttribute('stroke-opacity', 0.1);
		// }


		// for(let di of [...population_circle, ...population_line, ...population_text]){
		// 	di.setAttribute('data-distopacity', di.getAttribute('opacity'));
		// 	di.setAttribute('opacity', 0.1);
		// 	di.setAttribute('data-diststroke-opacity', di.getAttribute('stroke-opacity'));
		// 	di.setAttribute('stroke-opacity', 0.1);
		// }
		// let pop_stat_circle = document.querySelectorAll('#pop-stat circle');
		// let pop_stat_text = document.querySelectorAll('#pop-stat text');
		// let pop_stat_line = document.querySelectorAll('#pop-stat line');

		// for(let di of [...pop_stat_circle, ...pop_stat_line, ...pop_stat_text]){
		// 	di.setAttribute('data-distopacity', di.getAttribute('opacity'));
		// 	di.setAttribute('opacity', 0.1);
		// }
		for(let di of [...dynamic_circle, ...dynamic_line, ...dynamic_text,
			...population_circle, ...population_rect, ...population_line, ...population_text,
			...document.querySelectorAll('.pop-stat')]){
			di.setAttribute('data-distopacity', di.getAttribute('opacity') != undefined ? di.getAttribute('opacity') : di.style.opacity);
			di.setAttribute('opacity', 0.1);
			di.style.opacity = 0.1;
			di.setAttribute('data-diststroke-opacity', di.getAttribute('stroke-opacity') != undefined ? di.getAttribute('stroke-opacity') : di.style['stroke-opacity']);
			di.setAttribute('stroke-opacity', 0.1);
			di.style['stroke-opacity'] = 0.1;
		}
		document.querySelector('#pop-stat').setAttribute('opacity', 0.1);
		document.querySelector('.sampleLines').setAttribute('opacity', 0.1);
		document.querySelector('.meanOfSamples').setAttribute('opacity', 0.1);
	}

	distFocusOff(){
		let self = this;
		// Reenable CI animation for normal screen
		d3.selectAll(".CIButton").attr("disabled",null);
		let middle_stat = this.smallestStat + (this.largestStat - this.smallestStat) / 2;
		let dist_focus_axis = document.querySelector('#dist_focus_axis');
		let window_focus_axis = document.querySelector('#window_focus_axis');
		let main_axis_transform = dist_focus_axis.getAttribute("transform");
		let main_axis_x = parseFloat(main_axis_transform.split('(')[1].split(',')[0])
		let main_axis_y = parseFloat(main_axis_transform.split('(')[1].split(',')[1])
		let dist_container = document.querySelector('#samples #sampleDisplay');
		let dist_items = document.querySelectorAll('#samples #sampleDisplay circle');
		let x_shift = -100;
		// dist_focus_axis.setAttribute("transform", `translate(${main_axis_x + x_shift}, ${main_axis_y})`);
		dist_focus_axis.setAttribute("opacity", 0);
		window_focus_axis.setAttribute("opacity", 1);
		// dist_container.setAttribute("transform", `translate(${x_shift}, 0)`);
		for(let dist_item of dist_items){
			console.log(this.originalStatScale.range);
			console.log(this.originalStatScale.domain);
			dist_item.setAttribute('cx', this.sampleStatScale(parseFloat(dist_item.dataset.value)));
		}
		let ci_scale_change = function(v){
			return self.sampleStatScale(self.originalStatScale.invert(parseFloat(v)))
		}
		let ci_lines = document.querySelectorAll('#CISplitContainer line');
		let ci_text = document.querySelectorAll('#CISplitContainer text');
		if(ci_lines.length == 0) ci_lines = document.querySelectorAll('#CISplit line');
		if(ci_text.length == 0) ci_text = document.querySelectorAll('#CISplit text');
		for(let ci_line of [...ci_lines, ...ci_text]){
			for(let attr_to_rescale of ["x1", "x2", "x"]){
				let v = ci_line.getAttribute(attr_to_rescale);
				if(v == null) continue;
				let rescaled_v = ci_scale_change(v)
				ci_line.setAttribute(attr_to_rescale, rescaled_v);
				console.log(v);
				console.log(rescaled_v)
			}
			// let x1 = parseFloat(ci_line.getAttribute("x1"));
			// let x2 = parseFloat(ci_line.getAttribute("x2"));
			
		}
		let dynamic_circle = document.querySelectorAll('#dynamic circle');
		let dynamic_text = document.querySelectorAll('#dynamic text');
		let dynamic_line = document.querySelectorAll('#dynamic line');
		let population_circle = document.querySelectorAll('#population circle');
		let population_rect = document.querySelectorAll('#population rect');
		let population_text = document.querySelectorAll('#population text');
		let population_line = document.querySelectorAll('#population line');
		let pop_stat_circle = document.querySelectorAll('#pop-stat circle');
		let pop_stat_text = document.querySelectorAll('#pop-stat text');
		let pop_stat_line = document.querySelectorAll('#pop-stat line');

		// for(let di of [...dynamic_circle, ...dynamic_line, ...dynamic_text]){
		// 	di.setAttribute('opacity', di.getAttribute('data-distopacity'));

		// }


		// for(let di of [...population_circle, ...population_line, ...population_text]){
		// 	di.setAttribute('opacity', di.getAttribute('data-distopacity'));
		// 	di.setAttribute('stroke-opacity', di.getAttribute('data-diststroke-opacity'));

		// }

		// for(let di of [...pop_stat_circle, ...pop_stat_line, ...pop_stat_text]){
		// 	di.setAttribute('opacity', di.getAttribute('data-distopacity'));
		// 	di.setAttribute('stroke-opacity', di.getAttribute('data-diststroke-opacity'));

		// }
		for(let di of [...dynamic_circle, ...dynamic_line, ...dynamic_text,
			...population_circle, ...population_rect, ...population_line, ...population_text,
			...pop_stat_circle, ...pop_stat_line, ...pop_stat_text,
			...document.querySelectorAll('.pop-stat')]){
				di.setAttribute('opacity', di.getAttribute('data-distopacity'));
				di.setAttribute('stroke-opacity', di.getAttribute('data-diststroke-opacity'));
				di.style.opacity = di.getAttribute('opacity');
				di.style['stroke-opacity'] = di.getAttribute('stroke-opacity');
		}
		document.querySelector('#pop-stat').setAttribute('opacity', 1);
		document.querySelector('.sampleLines').setAttribute('opacity', 1);
		document.querySelector('.meanOfSamples').setAttribute('opacity', 1);
	}

}