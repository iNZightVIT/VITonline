
class randTest_oneNum_oneCat extends visBase {
	constructor(inputData, headingGroup, headingContinuous, statistic) {
		super(inputData, headingGroup, headingContinuous, statistic);
		this.windowHelper = setUpWindow3({'left':5, 'right':5, 'top':5, 'bottom':5}, true);
		// text labels for each section.
		this.sectionLabels = ['Data','Re-Randomised Data','Re-Randomisation Distribution'];
		this.maxSize = 500;
		//this.animationList = [this.populationDropDown,this.buildList, this.splitIntoRandCategories, this.fadeIn, this.endNoDist, this.distDrop, this.endDist ];
		this.animationList = [this.populationDropDown.bind(this),
						this.buildList.bind(this), 
						this.splitIntoRandCategories.bind(this), 
						this.fadeIn.bind(this), 
						this.endNoDist.bind(this), 
						this.distDrop.bind(this),
						this.endDist.bind(this)];
	}

	setUpPopCategory(items, scale, radius, top, bottom){
		// Sets the y value for all population circles in the category to make it look heaped. 
		heapYValues3(items, scale, radius, 0, top,bottom);
	}

	getStatisticEachSample(i, g, sample){
		if(sample == undefined){
			sample = this.samples[i];
		}
		var populationSize = this.inputData.length;
		return getStatistic(this.statistic, sample[g], populationSize);
	}
	setSampleStatistic(diff, categoryStatistics){
		if(this.groups.length <= 2){
			return this.sampleStatType == 'diff' ? diff : categoryStatistics[0];
		}else{
			var sum = 0;
			for(var g = 0; g < this.groups.length; g++){
				sum += Math.abs(categoryStatistics[g] - this.populationStatistics.population.statistic);
			}
			return sum/this.groups.length;
		}
	}
	getSampleSize(){
		return this.allPop.length;
	}

	extraStatistics(populationStatistics){
		var sum = 0;
		for(var g = 0; g < this.groups.length; g++){
			sum += populationStatistics.groups[this.groups[g]].groupDeviation;
		}
		populationStatistics.averageDeviation = sum/this.groups.length;
		if(this.groups.length > 2){
			this.sampleStatType = "Deviation";
		}
	}

	makeSample(populations, numSamples, sampleSize, statistic, saveSample){
		this.samples = [];

		// Set of original counts for each category. 
		// Each sample should have the same number of counts.
		var initialGroupCounts = [];
		var orderingArray = [];
		var totalIndex = 0;
		for(var g = 0; g < this.groups.length; g++){
			initialGroupCounts.push(populations[this.groups[g]].length);
			for(var ind = 0; ind < populations[this.groups[g]].length; ind++){
				orderingArray.push(totalIndex);
				totalIndex++;
			}
		}
		for(var i = 0; i<numSamples;i++){
			// this.samples.push([]);
			let sample = [];
			for(var g = 0; g < this.groups.length; g++){
				sample.push([]);
			}
			// Copy the counts array so we can modify it.
			var sampleCategoryCounts = initialGroupCounts.slice();
			var oneSampleOrderingArray = orderingArray.slice();
			d3.shuffle(oneSampleOrderingArray);
			var indexToGroupMap = {};
			for(var n = 0; n < oneSampleOrderingArray.length; n++){
				var sum = 0;
				var group = null;
				for(var g = 0; g < this.groups.length; g++){
					sum += initialGroupCounts[g];
					if(n<sum){
						group = g;
						break;
					}
				}
				indexToGroupMap[oneSampleOrderingArray[n]] = group;
			}
			// For this visualisation, each sample is the same (and in the same order) as the population.
			// The only difference is the group is randomised.
			var thisIndex = 0;
			var sampleOrder = 0;
			for(var group = 0; group < this.groups.length; group++){
				for(var itemIndex = 0; itemIndex < populations[this.groups[group]].length; itemIndex++){
					var nI = new item (populations[this.groups[group]][itemIndex].value, itemIndex);
					nI.popId = populations[this.groups[group]][itemIndex].id;
					nI.popGroup = group;
					nI.order = sampleOrder;
					sampleOrder++;
					// Sets initial x and y (first element is for 'population' sample) to be same as the parents.
					nI.xPerSample[0] =populations[this.groups[group]][itemIndex].xPerSample[0];
					nI.yPerSample[0] =populations[this.groups[group]][itemIndex].yPerSample[0];

					// For Randomisation Tests, we want the group to be randomly selected but with the same proportions 
					// as the original.
					// Pick from the availiable groups, if count is 0 repick else subract 1 from count.
					var newGroup = indexToGroupMap[thisIndex];
					// do {
					// 	newGroup = Math.ceil(Math.random()*sampleCategoryCounts.length) - 1;
					// } while	(sampleCategoryCounts[newGroup] == 0);

					// sampleCategoryCounts[newGroup]--;
					
					nI.group =	this.groups[newGroup];
					nI.groupIndex = newGroup;
					sample[newGroup].push(nI);
					thisIndex++;
				}
			}
			this.handleSample(i, sample);
			if(saveSample){
				this.samples.push(sample);
			}
		}
	}
	setUpSampleCategory(items, scale, radius, sample, top, bottom){
		// Sets the y value for all population circles in the category to make it look heaped. 
		heapYValues3(items, scale, radius, sample, top,bottom);
	}
	fillBaseSampleSection(placeInto){
		var self = this;
		placeInto.append("text").text(this.headingContinuous).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width/4).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");
		placeInto.append("text").text(this.headingGroup).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");
		var popTextG = placeInto.selectAll("g").data(this.allPop).enter().append("g");
		popTextG.append("text").text(function(d){return d.value}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width/4).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").attr("text-anchor","middle");
		popTextG.append("text").text(function(d){return d.group}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[self.groups.indexOf(d.group)]}).attr("text-anchor","middle");

		placeInto.append("g").attr("id","redTContainer");
		placeInto.append("text").text("Re-randomised").attr("x",(self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width/2)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("display","inline-block").attr("text-anchor","middle");

	}
	drawPopulationStatistic(placeInto){
		if(this.sampleStatType == "diff"){
			var middle = this.windowHelper.graphSection.S1.displayArea.getMiddleHeight();
			drawArrow(this.xScale(this.groupStats[this.groups[1]]), this.xScale(this.groupStats[this.groups[0]]), middle, placeInto, "popDiff", 1, "red");
			placeInto.append("text").attr("x", this.xScale(this.groupStats[this.groups[1]])).attr("y", middle).text(Math.round((this.populationStatistic)*100)/100).style("stroke","red").style("opacity",1);
		}
	}
	drawPopExtra(placeInto){
		if(this.groups.length > 2){
			var stat = this.populationStatistics.population.statistic;
			placeInto.append("line").attr("x1", this.xScale(stat)).attr("x2", this.xScale(stat)).attr("y1", this.windowHelper.graphSection.S1.displayArea.y1).attr("y2", this.windowHelper.graphSection.S2.displayArea.y2).style("stroke", "black").style("stroke-width",1).attr("stroke-dasharray", "5,3");
			
			var divisions = this.windowHelper.graphSection.S1.displayArea.getDivisions(this.groups.length, 'height');
			var divSections = divisions[0];
			var divHeight = divisions[1];
			for(var g = 0; g < this.groups.length; g++){
				var pos = divSections[g] - divHeight/2 - this.windowHelper.radius*2;
				var groupName = this.groups[g];
				drawArrow(this.xScale(this.populationStatistics.groups[groupName].statistic), this.xScale(this.populationStatistics.population.statistic), pos, placeInto, "popArrow"+g, 1, "blue");
			}
		}
	}

	cleanUpRepitition(){
		var self = this;
		d3.selectAll(".memLine").style("opacity",0.2).style("stroke","steelblue").attr("y2",function(){ return d3.select(this).attr("y1")-self.windowHelper.lineHeight*2});
		d3.selectAll("#diffLine").remove();
		d3.selectAll("#redlineMain").remove();
		
		d3.selectAll("#sampArrow").remove();
		for(var g = 0; g < this.groups.length; g++){
			d3.selectAll("#distArrow"+g).remove();
		}
	}

	showCI(num, large){
		var self = this;
		var tailText = d3.select("#tailCountText");
		if(tailText[0][0] != null){
			tailText.text(self.tailCount + " / 1000 = " + self.tailCount/1000);	
		}else{
			var CIVar = this.CISplit;
			var svg = d3.select(".svg");
			if(num == "10000"){
				CIVar = this.LargeCISplit;
			}
			svg = svg.append("svg").attr("id","CISplit");

			var middle = this.windowHelper.graphSection.S1.displayArea.getMiddleHeight();
			var to = this.xScale(this.sampleStatistics[0].stats[1]);
			var from = this.xScale(this.sampleStatistics[0].stats[0]);
			var diff = to - from;
			var headSize = 10;
			if(Math.abs(diff) < headSize) headSize =Math.abs(diff)*0.5;
			if(diff != 0) {var arrowHead = diff / Math.abs(diff);} else { var arrowHead = 0;}
			var arrow = drawArrow(this.xScale(this.groupStats[this.groups[1]]), this.xScale(this.groupStats[this.groups[0]]), middle, svg, "CISplit", 1, "red");
			arrow[1].transition().duration(2000).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height + 7.5).attr("x1",this.sampleStatScale(this.populationStatistic)).attr("x2", this.sampleStatScale(this.populationStatistic) - 10);
			arrow[2].transition().duration(2000).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height - 7.5).attr("x1",this.sampleStatScale(this.populationStatistic)).attr("x2", this.sampleStatScale(this.populationStatistic) - 10);
			arrow[0].transition().duration(2000).attr("x1",this.sampleStatScale(0)).attr("x2",this.sampleStatScale(this.populationStatistic)).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height)
				.transition().duration(500).each("end",function(){
					// axis marker
					svg.append("text").attr("x", self.sampleStatScale(self.populationStatistic)).attr("y", self.windowHelper.graphSection.S3.axisArea.y2).text(Math.round(self.populationStatistic*100)/100).style("stroke","red").style("opacity",1).attr("font-size", self.windowHelper.fontSize).attr("dominant-baseline","hanging");
					svg.append("line").attr("x1", self.sampleStatScale(self.populationStatistic)).attr("x2", self.sampleStatScale(self.populationStatistic)).attr("y1", self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height + self.windowHelper.graphSection.S2.axisArea.height).attr("y2", self.windowHelper.graphSection.S3.axisArea.y2).style("stroke-width", 2).style("stroke", "red");
					
					// proportion above sample
					if(!large){
						svg.append("text").attr("id", "tailCountText").attr("x", self.sampleStatScale(self.populationStatistic) + 5).attr("y", self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height - self.windowHelper.radius*16).text(self.tailCount + " / 1000 = " + self.tailCount/1000).style("stroke","red").style("opacity",1).attr("font-size", self.windowHelper.fontSize).attr("text-anchor", "middle");
					}else{
						svg.append("text").attr("id", "tailCountText").attr("x", self.sampleStatScale(self.populationStatistic) + 5).attr("y", self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height - self.windowHelper.radius*16).text(self.largeTailSize + " / 10000 = " + self.largeTailSize/10000).style("stroke","red").style("opacity",1).attr("font-size", self.windowHelper.fontSize).attr("text-anchor", "middle");

					}
					svg.append("line").attr("x1", self.sampleStatScale(self.populationStatistic)).attr("x2", self.sampleStatScale(self.populationStatistic)).attr("y1", self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height - self.windowHelper.radius*16).attr("y2", self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height + self.windowHelper.radius).style("stroke-width", 1).style("stroke", "red");

					var visibleCircles = d3.selectAll(".notInCI").filter(function(){
						return this.attributes["fill-opacity"].value == "1";
					});
					visibleCircles.style("opacity",0.2).transition().duration(500).each("end",function(d,i){
						if(i==0){
						}
					});
				});
			}
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


	// *****************************ANIMATIONS********************************

	populationDropDown(settings, currentAnimation){
		var self = this;

		// If reps = 1 and distribution is not shown, do the population drop down. Otherwise, just just straight to the split.
		if(settings.repititions == 1 && !settings.incDist){
			if(!settings.restarting){
				var sentFinish = false;

				// Delete Old elements
				d3.select("#circleOverlay").selectAll("circle").data([]).exit().remove();
				var circleOverlay = settings.drawArea.select("#circleOverlay").selectAll("g").data([]);
				circleOverlay.exit().remove();

				// Add new elements in, appear on top of original population.
				circleOverlay = settings.drawArea.select("#circleOverlay").selectAll("circle").data(settings.sample, function(d){return d.order});
				var circles = circleOverlay.enter().append("circle");
				circles.attr("class", "move")
			    .attr("cx", function(d, i) { 
			    	return d.xPerSample[0]; })
			    .attr("cy", function(d) {
			    	return d.yPerSample[0];
			    })
			    .attr("r", function(d) { return self.windowHelper.radius; })
			    .attr("fill-opacity", 1)
			    .attr("stroke-opacity",1)
			    .style("fill",function(d){return colorByIndex[d.popGroup]}).attr("class",function(d){return "c"+d.popId});
			}else{

				// If restarting, select original circles again.
				var circles = d3.select("#circleOverlay").selectAll("circle");
				self.settings.restarting = false;
			}

			//	Pause
			circles.transition().duration(self.transitionSpeed)
			// Move down to middle of section 2.
			.transition().duration(self.transitionSpeed).attr('cy', (self.windowHelper.graphSection.S2.displayArea.getMiddleHeight()))
			// Remove fill, and once done move to next animation.
			.transition().duration(100).attr("fill-opacity", 0).transition().duration(settings.pauseDelay).each('end', function(d, i){
					if(d == self.settings.sample[0]){
						self.animationController(settings, currentAnimation);
					}
				});
		}else {
			d3.select("#circleOverlay").selectAll("circle").data([]).exit().remove();
			var circleOverlay = settings.drawArea.select("#circleOverlay").selectAll("g").data([]);
			circleOverlay.exit().remove();

			circleOverlay = settings.drawArea.select("#circleOverlay").selectAll("circle").data(settings.sample, function(d){return d.order});
			var circles = circleOverlay.enter().append("circle");
			circles.attr("class", "move")
		    .attr("cx", function(d, i) { 
		    	return d.xPerSample[0]; })
			.attr('cy', (self.windowHelper.graphSection.S2.displayArea.getMiddleHeight()))
		    .attr("r", function(d) { return self.windowHelper.radius; })
		    .attr("fill-opacity", 0)
		    .attr("stroke-opacity",1)
		    .style("fill",function(d){return colorByIndex[d.popGroup]}).attr("class",function(d){return "c"+d.popId});

			self.animationController(settings, currentAnimation);

		}

	}
	buildList(settings, currentAnimation){
		var self = this;
		order(settings.sample);
		var opacity = 1;
		if(settings.repititions == 1000) opacity = 0.2;
		var popText = d3.select("#sampleReRandomised").empty() ? d3.select("#dynamic").append("g").attr("id", "sampleReRandomised") : d3.select("#sampleReRandomised");
		popText = popText.selectAll("g").data([]);
		popText.exit().remove();
		var i = this.upTo;

		popText = d3.select("#sampleReRandomised").selectAll("g").data(settings.sample);

		var popTextG =popText.enter().append("g");
		popTextG.append("text").text(function(d){
			return d.group;
		}).attr("x",self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width/2).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S2.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[self.groups.indexOf(d.group)]}).attr("text-anchor","middle");

		this.animationController(settings, currentAnimation);

	}

	splitIntoRandCategories(settings, currentAnimation){
		var self = this;
		var circles = d3.select("#circleOverlay").selectAll("circle");
		// If reps = 1 and distribution is not shown, do the population drop down. Otherwise, just just straight to the split.
		if(settings.repititions == 1 || (settings.repititions == 5 && !settings.incDist)){
			circles.style("fill",function(d){return colorByIndex[d.groupIndex]})
			.attr("fill-opacity", 1)
			.transition().duration(self.transitionSpeed)
			.transition().duration(self.transitionSpeed)
			    .attr("cy", function(d) {
			    	return d.yPerSample[settings.indexUpTo+1];
		    	}).style("fill",function(d){return colorByIndex[d.groupIndex]})
				.each('end', function(d, i){
					self.settings.restarting = false;
					if(d == self.settings.sample[0]){
						self.animationController(settings, currentAnimation);
					}
				});
		}else {
			circles.attr("cy", function(d) {
			    	return d.yPerSample[settings.indexUpTo+1];
		    	}).style("fill",function(d){return colorByIndex[d.groupIndex]})
				.attr("fill-opacity", 1);
			self.settings.restarting = false;
			self.animationController(settings, currentAnimation);
		}

	}


	fadeIn(settings, currentAnimation){
		var self = this;
		if(this.sampleStatType == "diff"){
			sharedFadeIn.apply(this, [settings, currentAnimation]);
		}else{
			var sampMean = this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
			var stat = this.populationStatistics.population.statistic;			
			var divisions = this.windowHelper.graphSection.S2.displayArea.getDivisions(this.groups.length, 'height');
			var divSections = divisions[0];
			var divHeight = divisions[1];
			d3.selectAll("#sampArrow").remove();
			for(var g = 0; g < this.groups.length; g++){
				var pos = divSections[g] - divHeight/2 - this.windowHelper.radius*2;
				var groupName = this.groups[g];
				drawArrow(this.xScale(sampMean[0].stats[g]), this.xScale(this.populationStatistics.population.statistic), pos, d3.select(".meanOfSamples"), "sampArrow", 1, "darkgrey");
				d3.select(".meanOfSamples").append("line").attr("x1", this.xScale(sampMean[0].stats[g])).attr("x2", this.xScale(sampMean[0].stats[g])).attr("y1", pos+this.windowHelper.lineHeight).attr("y2", pos-this.windowHelper.lineHeight).style("stroke-width", 2).style("stroke", "black").style("stroke-width",3).attr("id", "sampArrow");

			}
			var circleOverlay = d3.select("#circleOverlay").selectAll("circle").transition().duration(this.transitionSpeed).each('end', function(d, i){
				if(d == settings.sample[0]){
					if(settings.incDist){
						self.animationController(settings, currentAnimation);
					}else{
						d3.select("#differenceLine").remove();
						self.animationController(settings, currentAnimation);
					}
				}
			});
		}

	}


	distDrop(settings, currentAnimation){
		var self = this;
		if(this.sampleStatType == "diff"){
			sharedDistDrop.apply(this, [settings, currentAnimation]);
		}else{
			if(this.transitionSpeed > 200){
				var sampMean = this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
				var stat = this.populationStatistics.population.statistic;			
				var divisions = this.windowHelper.graphSection.S2.displayArea.getDivisions(this.groups.length, 'height');
				var divSections = divisions[0];
				var divHeight = divisions[1];
				for(var g = 0; g < this.groups.length; g++){
					var pos = divSections[g] - divHeight/2 - this.windowHelper.radius*2;
					var groupName = this.groups[g];
					drawArrow(this.xScale(sampMean[0].stats[g]), this.xScale(this.populationStatistics.population.statistic), pos, d3.select(".meanOfSamples"), "distArrow"+g, 1, "darkgrey");
					d3.select("#distArrow"+g+"a1").remove();
					d3.select("#distArrow"+g+"a2").remove();
					var subtractY = this.windowHelper.graphSection.S2.height - (divHeight/1.2 * g);
					var subtractX = 0 - (this.xScale(sampMean[0].stats[g]) - this.xScale(this.populationStatistics.population.statistic))/2;
					d3.select("#distArrow"+g).selectAll("*").transition().duration(this.transitionSpeed)
						.attr("transform", "translate("+ subtractX +", " + subtractY +")").each("end", function(d, i){
							var id = d3.select(this).attr("id");
							if(id == "distArrow0main"){
								var headSize = 7.5;
								var toScaled = sampMean[0].value;
								var diff = self.sampleStatScale(sampMean[0].value);
								var yValue = self.windowHelper.graphSection.S3.displayArea.getMiddleHeight();
								if(Math.abs(diff) < headSize) headSize =Math.abs(diff)*0.5;
								if(diff != 0) {var arrowHead = diff / Math.abs(diff);} else { var arrowHead = 0;}

								var arrow = drawArrow(self.xScale(self.populationStatistics.population.statistic + (sampMean[0].value)/2), self.xScale(self.populationStatistics.population.statistic - (sampMean[0].value)/2), self.windowHelper.graphSection.S3.displayArea.getDivisions(3, 'height')[1] + self.windowHelper.graphSection.S3.displayArea.y1, d3.select(".meanOfSamples"), "redlineMain", 1, "darkgrey");
								arrow[1].transition().duration(self.transitionSpeed).attr("y1",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height- self.windowHelper.radius*2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height + headSize*arrowHead/2 - self.windowHelper.radius*2).attr("x1",self.sampleStatScale(toScaled)).attr("x2", self.sampleStatScale(toScaled) - arrowHead*headSize);
								arrow[2].transition().duration(self.transitionSpeed).attr("y1",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height- self.windowHelper.radius*2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height - headSize*arrowHead/2 - self.windowHelper.radius*2).attr("x1",self.sampleStatScale(toScaled)).attr("x2", self.sampleStatScale(toScaled) - arrowHead*headSize);
								arrow[0].transition().duration(self.transitionSpeed).attr("x1",self.sampleStatScale(0)).attr("x2",self.sampleStatScale(toScaled)).attr("y1",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height- self.windowHelper.radius*2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height - self.windowHelper.radius*2);

								sharedDistDropNoArrow.apply(self, [settings, currentAnimation]);
							}
						});

				}
			}else{
				sharedDistDropNoArrow.apply(this, [settings, currentAnimation]);
			}
		}
	}
}

