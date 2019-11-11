
class randTest_twoCat extends visBase {
	constructor(inputData, headingGroup, headingContinuous, statistic, focus) {
		super(inputData, headingGroup, headingContinuous, statistic, focus);
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
		this.valueAllowCategorical = true;
		this.popDrawType = 1;
	}

	setUpPopCategory(items, scale, radius, top, bottom){
		// Sets the y value for all population circles in the category to make it look heaped. 
		heapYValues3(items, scale, radius, 0, top,bottom);
	}

	setSampleStatistic(diff, categoryStatistics){
		if(this.groups.length <= 2){
			return this.sampleStatType == 'diff' ? diff : categoryStatistics[0];
		}else{
			var sum = 0;
			let pop_stat = this.populationStatistics.population.statistic;
			for(var g = 0; g < this.groups.length; g++){
				sum += Math.abs(categoryStatistics[g] - pop_stat);
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
					nI.xPerSample[0] = populations[this.groups[group]][itemIndex].xPerSample[0];
					nI.yPerSample[0] = populations[this.groups[group]][itemIndex].yPerSample[0];

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
	getStatisticEachSample(i, g, sample){
		if(sample == undefined){
			sample = this.samples[i];
		}
		var populationSize = sample[g].length;

		//Our statistic will be the proportion of values that match the focus out of each group.
		return getStatistic(this.statistic, sample[g].filter(function(item){return item.value == 0}), populationSize);
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
		popTextG.append("text").text(function(d){return [...self.valueCategories][d.value]})
		.attr('fill', (d) => colorByIndex[d.value]).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width/4).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").attr("text-anchor","middle");
		popTextG.append("text").text(function(d){return d.group}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[self.groups.indexOf(d.group)]}).attr("text-anchor","middle");

		placeInto.append("g").attr("id","redTContainer");
		placeInto.append("text").text("Re-randomised").attr("x",(self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width/2)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("display","inline-block").attr("text-anchor","middle");

	}
	// drawPopulationStatistic(placeInto){
	// 	if(this.sampleStatType == "diff"){
	// 		var middle = this.windowHelper.graphSection.S1.displayArea.getMiddleHeight();
	// 		drawArrow(this.xScale(this.groupStats[this.groups[1]]), this.xScale(this.groupStats[this.groups[0]]), middle, placeInto, "popDiff", 1, "blue");
	// 		placeInto.append("text").attr("x", this.xScale(this.groupStats[this.groups[1]])).attr("y", middle).text(Math.round((this.populationStatistic)*100)/100).style("stroke","blue").style("opacity",1);
	// 	}
	// }
	drawPopExtra(placeInto){
		if(this.groups.length > 2){
			var stat = this.populationStatistics.population.statistic;
			placeInto.append("line").attr("x1", this.xScale(stat)).attr("x2", this.xScale(stat)).attr("y1", this.windowHelper.graphSection.S1.displayArea.y1).attr("y2", this.windowHelper.graphSection.S2.displayArea.y2).style("stroke", "black").style("stroke-width",1).attr("stroke-dasharray", "5,3");
		}
	}

	cleanUpRepitition(){
		var self = this;
		d3.selectAll(".memLine").style("opacity",0.2).style("stroke","steelblue").attr("y2",function(){ return d3.select(this).attr("y1")-self.windowHelper.lineHeight*2});
		d3.selectAll("#diffLine").remove();
		d3.selectAll("#redlineMain").remove();
		d3.selectAll("#samp").remove();
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
		sharedProportionMultiBarFadeInNoExitNoStatsHidden.apply(this, [settings, currentAnimation]);

		matchPropBars.apply(this);

		let sample_circles = d3.selectAll("#samp circle")[0];
		for(let sc = 0; sc < sample_circles.length; sc++){
			let samp_circ = d3.select(sample_circles[sc]);
			samp_circ.attr("cx", samp_circ.attr("data-px"));
			samp_circ.attr("cy", samp_circ.attr("data-py"));
			samp_circ.style("fill", samp_circ.attr("data-pfill"));
			samp_circ.attr("r", samp_circ.attr("data-pr"));
			samp_circ.style("opacity", 1);
			samp_circ.style("fill-opacity", 1);
		}

		if((settings.repititions == 1 || settings.repititions == 5) && !settings.incDist){
			d3.selectAll("#samp circle").transition().duration(self.transitionSpeed)
			// Move down to middle of section 2.
			.transition().duration(self.transitionSpeed).attr('cy', (self.windowHelper.graphSection.S2.displayArea.getMiddleHeight()))
			// Remove fill, and once done move to next animation.
			.transition().duration(100).style("fill", "white").transition().duration(500).each('end', function(d, i){
					if(i == 0){
						self.animationController(settings, currentAnimation);
					}
				});
		}else if(settings.repititions < 5){
			d3.selectAll("#samp circle").attr('cy', (self.windowHelper.graphSection.S2.displayArea.getMiddleHeight()))
			.style("fill", "white").transition().duration(500).each('end', function(d, i){
					if(i == 0){
						self.animationController(settings, currentAnimation);
					}
				});
		}else{
			self.animationController(settings, currentAnimation);
		}

		// // If reps = 1 and distribution is not shown, do the population drop down. Otherwise, just just straight to the split.
		// if(settings.repititions == 1 && !settings.incDist){
		// 	if(!settings.restarting){
		// 		var sentFinish = false;

		// 		// Delete Old elements
		// 		d3.select("#circleOverlay").selectAll("circle").data([]).exit().remove();
		// 		var circleOverlay = settings.drawArea.select("#circleOverlay").selectAll("g").data([]);
		// 		circleOverlay.exit().remove();

		// 		// Add new elements in, appear on top of original population.
		// 		circleOverlay = settings.drawArea.select("#circleOverlay").selectAll("circle").data(settings.sample, function(d){return d.order});
		// 		var circles = circleOverlay.enter().append("circle");
		// 		circles.attr("class", "move")
		// 	    .attr("cx", function(d, i) { 
		// 	    	return d.xPerSample[0]; })
		// 	    .attr("cy", function(d) {
		// 	    	return d.yPerSample[0];
		// 	    })
		// 	    .attr("r", function(d) { return self.windowHelper.radius; })
		// 	    .attr("fill-opacity", 1)
		// 	    .attr("stroke","#556270")
		// 	    .attr("stroke-opacity",1)
		// 	    .style("fill",function(d){return colorByIndex[d.popGroup]}).attr("class",function(d){return "c"+d.popId});
		// 	}else{

		// 		// If restarting, select original circles again.
		// 		var circles = d3.select("#circleOverlay").selectAll("circle");
		// 		self.settings.restarting = false;
		// 	}

		// 	//	Pause
		// 	circles.transition().duration(self.transitionSpeed)
		// 	// Move down to middle of section 2.
		// 	.transition().duration(self.transitionSpeed).attr('cy', (self.windowHelper.graphSection.S2.displayArea.getMiddleHeight()))
		// 	// Remove fill, and once done move to next animation.
		// 	.transition().duration(100).attr("fill-opacity", 0).transition().duration(settings.pauseDelay).each('end', function(d, i){
		// 			if(d == self.settings.sample[0]){
		// 				self.animationController(settings, currentAnimation);
		// 			}
		// 		});
		// }else {
		// 	d3.select("#circleOverlay").selectAll("circle").data([]).exit().remove();
		// 	var circleOverlay = settings.drawArea.select("#circleOverlay").selectAll("g").data([]);
		// 	circleOverlay.exit().remove();

		// 	circleOverlay = settings.drawArea.select("#circleOverlay").selectAll("circle").data(settings.sample, function(d){return d.order});
		// 	var circles = circleOverlay.enter().append("circle");
		// 	circles.attr("class", "move")
		//     .attr("cx", function(d, i) { 
		//     	return d.xPerSample[0]; })
		// 	.attr('cy', (self.windowHelper.graphSection.S2.displayArea.getMiddleHeight()))
		//     .attr("r", function(d) { return self.windowHelper.radius; })
		//     .attr("fill-opacity", 0)
		//     .attr("stroke","#556270")
		//     .attr("stroke-opacity",1)
		//     .style("fill",function(d){return colorByIndex[d.popGroup]}).attr("class",function(d){return "c"+d.popId});

		// 	self.animationController(settings, currentAnimation);

		// }

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
		var circles = d3.selectAll("#samp circle");
		// If reps = 1 and distribution is not shown, do the population drop down. Otherwise, just just straight to the split.
		if(settings.repititions == 1 || (settings.repititions == 5 && !settings.incDist)){
			circles.attr("fill-opacity", 1)
			.transition().duration(self.transitionSpeed)
			.transition().duration(self.transitionSpeed)
			    .attr("cy", function(d) {
			    	return d3.select(this).attr("data-cy");
		    	})
			    .attr("cx", function(d) {
			    	return d3.select(this).attr("data-cx");
		    	})
			    .attr("r", function(d) {
			    	return d3.select(this).attr("data-r");
		    	})
			    .style("fill", function(d) {
			    	return d3.select(this).attr("data-fill");
		    	})
				.each('end', function(d, i){
					self.settings.restarting = false;
					if(i == 0){
						self.animationController(settings, currentAnimation);
					}
				});
		}else {
			circles.attr("cy", function(d) {
			    	return d3.select(this).attr("data-cy");
				})
				.attr("r", function(d) {
			    	return d3.select(this).attr("data-r");
		    	})
				.attr("cx", function(d) {
			    	return d3.select(this).attr("data-cx");
		    	}).style("fill", function(d) {
			    	return d3.select(this).attr("data-fill");
		    	})
				.attr("fill-opacity", 1);
			self.settings.restarting = false;
			self.animationController(settings, currentAnimation);
		}

	}


	fadeIn(settings, currentAnimation){
		var self = this;
		if(this.sampleStatType == "diff"){
			// sharedProportionMultiBarFadeIn.apply(this, [settings, currentAnimation]);
		}else{
			sharedMultiArrowFadeIn.apply(this, [settings, currentAnimation]);
		}
		d3.selectAll("#samp circle").transition().duration(this.transitionSpeed).style("opacity", 1).each('end', function(d, i){
			
			if(i == 0){
				
				if(settings.incDist){
					self.animationController(settings, currentAnimation);
				}else{
					d3.select("#differenceLine").remove();
					self.animationController(settings, currentAnimation);
				}
			}
		});
	
		if ((settings.repititions == 1)){
			var sampMean = self.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
			showDifference.apply(self, [sampMean]);
			d3.selectAll("#samp rect").transition().duration(this.transitionSpeed).style("opacity", 1);
			d3.selectAll("#samp text").transition().duration(this.transitionSpeed).style("opacity", 1)
			// sharedProportionMultiBarFadeInNoStat.apply(this, [settings, currentAnimation]);
		}else{
		var sampMean = self.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
		showDifference.apply(self, [sampMean]);
		d3.selectAll("#samp rect").style("opacity", 1);
		d3.selectAll("#samp text").style("opacity", 1)
		// sharedProportionMultiBarFadeInNoStat.apply(this, [settings, currentAnimation]);
		}

		

	}


	distDrop(settings, currentAnimation){
		var self = this;
		if(this.sampleStatType == "diff"){
			sharedDistDrop.apply(this, [settings, currentAnimation]);
		}else{
			sharedMultiCatDistDrop.apply(this, [settings, currentAnimation]);
		}
	}
}

