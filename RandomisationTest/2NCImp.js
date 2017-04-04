
class twoNC extends visBase {
	constructor(inputData, headingGroup, headingContinuous, statistic) {
		super(inputData, headingGroup, headingContinuous, statistic);
		this.windowHelper = setUpWindow3({'left':5, 'right':5, 'top':5, 'bottom':5}, true);
		// text labels for each section.
		this.sectionLabels = ['Data','Re-Randomised Data','Re-Randomisation Distribution'];
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

	getSampleSize(){
		this.allPop.length;
	}
	makeSample(populations, numSamples, sampleSize, statistic){
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
			this.samples.push([]);
			for(var g = 0; g < this.groups.length; g++){
				this.samples[i].push([]);
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
					this.samples[i][newGroup].push(nI);
					thisIndex++;
				}
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
		popTextG.append("text").text(function(d){return d.value}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width/4).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").attr("text-anchor","middle");
		popTextG.append("text").text(function(d){return d.group}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("stroke", function(d){return colorByIndex[self.groups.indexOf(d.group)]}).attr("text-anchor","middle");

		placeInto.append("g").attr("id","redTContainer");
		placeInto.append("text").text("Re-randomised").attr("x",(self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width/2)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("display","inline-block").attr("text-anchor","middle");

	}

	cleanUpRepitition(){
		var self = this;
		d3.selectAll(".memLine").style("opacity",0.2).style("stroke","steelblue").attr("y2",function(){ return d3.select(this).attr("y1")-self.windowHelper.lineHeight*2});;
		d3.selectAll("#diffLine").remove();
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
			var headSize = 20;
			if(Math.abs(diff) < headSize) headSize =Math.abs(diff)*0.5;
			if(diff != 0) {var arrowHead = diff / Math.abs(diff);} else { var arrowHead = 0;}
			var arrow = drawArrow(this.xScale(this.groupStats[this.groups[1]]), this.xScale(this.groupStats[this.groups[0]]), middle, svg, "CISplit", 1, "blue");
			arrow[1].transition().duration(2000).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height + 7.5).attr("x1",this.sampleStatScale(this.populationStatistic)).attr("x2", this.sampleStatScale(this.populationStatistic) - 10);
			arrow[2].transition().duration(2000).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height - 7.5).attr("x1",this.sampleStatScale(this.populationStatistic)).attr("x2", this.sampleStatScale(this.populationStatistic) - 10);
			arrow[0].transition().duration(2000).attr("x1",this.sampleStatScale(0)).attr("x2",this.sampleStatScale(this.populationStatistic)).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height)
				.transition().duration(500).each("end",function(){
					// axis marker
					svg.append("text").attr("x", self.sampleStatScale(self.populationStatistic)).attr("y", self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height + self.windowHelper.graphSection.S2.axisArea.height).text(Math.round(self.populationStatistic*100)/100).style("stroke","blue").style("opacity",1).attr("font-size", self.windowHelper.fontSize);
					svg.append("line").attr("x1", self.sampleStatScale(self.populationStatistic)).attr("x2", self.sampleStatScale(self.populationStatistic)).attr("y1", self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height + self.windowHelper.graphSection.S2.axisArea.height).attr("y2", self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height + self.windowHelper.radius).style("stroke-width", 2).style("stroke", "blue");
					
					// proportion above sample
					if(!large){
						svg.append("text").attr("id", "tailCountText").attr("x", self.sampleStatScale(self.populationStatistic) + 5).attr("y", self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height - self.windowHelper.radius*16).text(self.tailCount + " / 1000 = " + self.tailCount/1000).style("stroke","blue").style("opacity",1).attr("font-size", self.windowHelper.fontSize).attr("text-anchor", "middle");
					}else{
						svg.append("text").attr("id", "tailCountText").attr("x", self.sampleStatScale(self.populationStatistic) + 5).attr("y", self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height - self.windowHelper.radius*16).text(self.largeTailSize + " / 10000 = " + self.largeTailSize/10000).style("stroke","blue").style("opacity",1).attr("font-size", self.windowHelper.fontSize).attr("text-anchor", "middle");

					}
					svg.append("line").attr("x1", self.sampleStatScale(self.populationStatistic)).attr("x2", self.sampleStatScale(self.populationStatistic)).attr("y1", self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height - self.windowHelper.radius*16).attr("y2", self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height + self.windowHelper.radius).style("stroke-width", 1).style("stroke", "blue");

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
			    .attr("stroke","#556270")
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
		    .attr("stroke","#556270")
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
		}).attr("x",self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width/2).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S2.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("stroke", function(d){return colorByIndex[self.groups.indexOf(d.group)]}).attr("text-anchor","middle");

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
		if(!this.settings.restarting){
			var allInSample = settings.sample.slice();
			var powScale = d3.scale.pow();
			powScale.exponent(4);
			powScale.domain([0,settings.delay*2]);
		}else{
			var powScale = this.settings.powScale;
			var self = this;
		    var fillInTime = this.transitionSpeed/this.baseTransitionSpeed;
		    this.settings.restarting = false;
		}
		var sampMean = this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
		if(!sampMean) {
			this.animationController(settings, currentAnimation);
			return;
		}
		for(var k = 0;k<sampMean.length-1;k++){
			this.drawnMeans.push(sampMean[k]);
		}
		var middle = this.windowHelper.graphSection.S2.displayArea.getMiddleHeight();
		if(this.drawnMeans.length > 0){
			var mLines = d3.select(".sampleLines").selectAll("g").data(this.drawnMeans);
			var meanLineG = mLines.enter().append("g");
			meanLineG.append("line").attr("class","memLine").attr("x1", function(d){return self.xScale(d.stats[0]);}).attr("x2", function(d){return self.xScale(d.stats[0]);}).attr("y1", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][0] + this.windowHelper.lineHeight*3).attr("y2", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][0] - this.windowHelper.lineHeight).style("stroke-width", 3).style("stroke", "black").style("opacity",1);
			meanLineG.append("line").attr("class","memLine").attr("x1", function(d){return self.xScale(d.stats[1]);}).attr("x2", function(d){return self.xScale(d.stats[1]);}).attr("y1", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][2] + this.windowHelper.lineHeight*3).attr("y2", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][2] - this.windowHelper.lineHeight).style("stroke-width", 3).style("stroke", "black").style("opacity",1);
		
			d3.selectAll(".memLine").style("opacity",0.2).style("stroke","steelblue").attr("y2",function(){ return d3.select(this).attr("y1")-self.windowHelper.lineHeight*2});;
			d3.selectAll("#diffLine").remove();
		}
		this.drawnMeans.push(sampMean[sampMean.length-1]);
		mLines = d3.select(".sampleLines").selectAll("g").data(this.drawnMeans);
		meanLineG = mLines.enter().append("g");
		meanLineG.append("line").attr("class","memLine").attr("x1", function(d){return self.xScale(d.stats[0]);}).attr("x2", function(d){return self.xScale(d.stats[0]);}).attr("y1", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][0] + this.windowHelper.lineHeight*3).attr("y2", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][0] - this.windowHelper.lineHeight).style("stroke-width", 3).style("stroke", "black").style("opacity",1);
		meanLineG.append("line").attr("class","memLine").attr("x1", function(d){return self.xScale(d.stats[1]);}).attr("x2", function(d){return self.xScale(d.stats[1]);}).attr("y1", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][2] + this.windowHelper.lineHeight*3).attr("y2", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][2] - this.windowHelper.lineHeight).style("stroke-width", 3).style("stroke", "black").style("opacity",1);
		drawArrow(function(d){return self.xScale(d.stats[1]);},function(d){return self.xScale(d.stats[0]);},middle, meanLineG, "diffLine", 1, "red");
		var circleOverlay = d3.select("#circleOverlay").selectAll("circle").transition().duration(this.transitionSpeed/2).each('end', function(d, i){
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


	distDrop(settings, currentAnimation){
		var self = this;
		var sentFinish = false;
		if(!settings.restarting){
			d3.select(".meanOfSamples").selectAll("g").remove();

			var middle = this.windowHelper.graphSection.S2.displayArea.getMiddleHeight();
			var sampMean = this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
			if(this.transitionSpeed > 200){
				var downTo = this.sampleStatistics[settings.indexUpTo].yPerSample[0];
				var redLine = d3.select(".meanOfSamples").selectAll("g").data(sampMean).enter().append("g");

				var to = this.xScale(sampMean[0].stats[1]);
				var from = this.xScale(sampMean[0].stats[0]);
				var toScaled = sampMean[0].stats[1] - sampMean[0].stats[0];
				var diff = (to-from) / 10;
				var yValue = middle;
				if(Math.abs(diff) < headSize) headSize =Math.abs(diff)*0.5;
				if(diff != 0) {var arrowHead = diff / Math.abs(diff);} else { var arrowHead = 0;}

				var diff = to - from;
				var headSize = 10;
				self.headSize = headSize;
				self.arrowHead = arrowHead;
				self.toScaled = toScaled;
				var arrow = drawArrow(self.xScale(sampMean[0].stats[1]), self.xScale(sampMean[0].stats[0]), middle, redLine, "redlineMain", 1, "red");
				arrow[1].transition().duration(this.transitionSpeed).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height- this.windowHelper.radius*2).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height + headSize*arrowHead/2 - this.windowHelper.radius*2).attr("x1",this.sampleStatScale(toScaled)).attr("x2", this.sampleStatScale(toScaled) - arrowHead*headSize);
				arrow[2].transition().duration(this.transitionSpeed).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height- this.windowHelper.radius*2).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height - headSize*arrowHead/2 - this.windowHelper.radius*2).attr("x1",this.sampleStatScale(toScaled)).attr("x2", this.sampleStatScale(toScaled) - arrowHead*headSize);
				arrow[0].transition().duration(this.transitionSpeed).attr("x1",this.sampleStatScale(0)).attr("x2",this.sampleStatScale(toScaled)).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height- this.windowHelper.radius*2).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height - this.windowHelper.radius*2);
			} 
			var meanCircles = d3.select("#sampleDisplay").selectAll("circle").filter(function(d, i){
				return (i>=settings.indexUpTo) && (i <settings.indexUpTo+settings.jumps);
			});

			this.settings.sampMean = sampMean;
			this.settings.meanCircles = meanCircles;
			this.settings.diff = diff;
		}else{
			var sampMean = this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
			var redLine = d3.select("#sampleDisplay").selectAll("g").data(sampMean).enter().append("g");
			var downTo = this.sampleStatistics[settings.indexUpTo].yPerSample[0];
			var rL = this.settings.redLine;
			d3.select("#redlineMaina1").transition().duration(this.transitionSpeed).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height - this.windowHelper.radius*2).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height + self.headSize*self.arrowHead/2).attr("x1",this.sampleStatScale(self.toScaled)).attr("x2", this.sampleStatScale(self.toScaled) - self.arrowHead*self.headSize);
			d3.select("#redlineMaina2").transition().duration(this.transitionSpeed).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height -self.headSize*self.arrowHead/2).attr("x1",this.sampleStatScale(self.toScaled)).attr("x2", this.sampleStatScale(self.toScaled) - self.arrowHead*self.headSize);
			d3.select("#redlineMainmain").transition().duration(this.transitionSpeed).attr("x1",this.sampleStatScale(0)).attr("x2",this.sampleStatScale(self.toScaled)).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height);


			var sampMean = this.settings.sampMean;
			var meanCircles = this.settings.meanCircles;

			this.settings.restarting = false;
		}

		if(this.transitionSpeed > 200){
			var acrossTo = this.sampleStatistics[settings.indexUpTo].xPerSample[0];
		}
		if(settings.goSlow || this.transitionSpeed == 500){
			meanCircles = meanCircles.transition().delay(this.transitionSpeed).attr("fill-opacity",1).attr("stroke-opacity",1).style("stroke", "steelblue").attr("cy", function(d){return d.yPerSample[0]}).each('end', function(d, i){
				if(!sentFinish){
					self.animationController(settings, currentAnimation);
					sentFinish = true;
				}
			});
		}else{
			meanCircles = meanCircles.attr("fill-opacity",1).attr("stroke-opacity",1).style("stroke", "steelblue").attr("cy", function(d){return d.yPerSample[0]});
				self.animationController(settings, currentAnimation);
		}
	}
}

