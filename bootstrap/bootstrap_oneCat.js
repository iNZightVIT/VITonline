
class bootstrap_oneCat extends visBase {
	constructor(inputData, headingGroup, headingContinuous, statistic, focus) {
		super(inputData, headingGroup, headingContinuous, statistic, focus);
		this.windowHelper = setUpWindow3({'left':5, 'right':5, 'top':5, 'bottom':5}, true);
		this.sampleStatType = "stat";
		this.popDrawType = 1;
		// text labels for each section.
		this.sectionLabels = ['Data','Resampled','Resample Distribution'];
		//this.animationList = [this.populationDropDown,this.buildList, this.fadeIn, this.endNoDist, this.distDrop, this.endDist ];
		this.animationList = [this.populationDropDown.bind(this),
						this.buildList.bind(this), 
						this.fadeIn.bind(this), 
						this.endNoDist.bind(this), 
						this.distDrop.bind(this),
						this.endDist.bind(this)];
	}

	setUpPopCategory(items, scale, radius, top, bottom){
		// No real need to set anything up here, everything done when drawn.
	}

	getSampleSize(){
		return this.allPop.length;
	}
	makeSample(populations, numSamples, sampleSize, statistic){
		this.samples = [];
		for(var i = 0; i<numSamples;i++){
			this.samples.push([]);
			for(var g = 0; g < this.groups.length; g++){
				this.samples[i].push([]);
			}
			var stats = [];
			for(var j = 0; j < sampleSize;j++){
					var group = Math.ceil(Math.random()*this.groups.length) - 1;
					var index =	Math.ceil(Math.random()*populations[this.groups[group]].length) - 1;
					var nI = new item (populations[this.groups[group]][index].value, j);
					nI.popId = populations[this.groups[group]][index].id;
					nI.popGroup = group;
					nI.group =	populations[this.groups[group]][index].group;
					nI.order = j;
					nI.groupIndex = group;
					this.samples[i][group].push(nI);
			}
		}
	}
	setUpSampleCategory(items, scale, radius, sample, top, bottom){
		// Sets the y value for all population circles in the category to make it look heaped. 
		heapYValues3(items, scale, radius, sample, top,bottom);
	}
	fillBaseSampleSection(placeInto){
		var self = this;
		placeInto.append("text").text(this.headingGroup).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(2/4)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");
		var popTextG = placeInto.selectAll("g").data(this.allPop).enter().append("g");
		popTextG.append("text").text(function(d){return (d.value == 1 || self.groups.length == 2) ? d.group : "Other"}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(2/4)).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[1-d.value]}).attr("text-anchor","middle");

		placeInto.append("g").attr("id","redTContainer");
		placeInto.append("text").text("ReSample").attr("x",(self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width/2)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("display","inline-block").attr("text-anchor","middle");

	}
	drawPopulationStatistic(placeInto){
		var middle = this.windowHelper.graphSection.S1.displayArea.getMiddleHeight();
		d3.select("#population").append("line").attr("id","popProp")
			.attr("x1", this.xScale(this.populationStatistic))
			.attr("x2", this.xScale(this.populationStatistic))
			.attr("y1", middle +this.windowHelper.graphSection.S1.displayArea.height*(3/8))
			.attr("y2", middle)
			.style("stroke-width", 3)
			.style("stroke", "black").style("opacity",1);

		d3.select("#population").append("text").attr("id","popPropText").text(Math.round(this.populationStatistic*100)/100)
			.attr("x", this.xScale(this.populationStatistic) + 5)
			.attr("y", middle +this.windowHelper.graphSection.S1.displayArea.height*(3/8))
			.style("fill", "black").style("opacity",1).style("font-size", this.windowHelper.fontSize);
	}

	cleanUpRepitition(){
		var self = this;
		d3.selectAll(".memLine").style("opacity",0.2).style("stroke","steelblue").attr("y2",function(){ return d3.select(this).attr("y1")-self.windowHelper.lineHeight*2});;
		d3.selectAll("#diffLine").remove();
		d3.selectAll("#samp").remove();
	}
	setUpCI(statList){
			var CISplit = Math.abs(this.populationStatistic - statList[this.numSamples*0.95]);
			for(var k = 0; k < this.numSamples;k++){
				if(Math.abs(this.populationStatistic - this.sampleStatistics[k].value) >= CISplit){
					this.sampleStatistics[k].inCI = false;
				}else{
					this.sampleStatistics[k].inCI = true;
				}
			}
			this.CISplit = CISplit;
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


	// *****************************ANIMATIONS********************************

	populationDropDown(settings, currentAnimation){
		var self = this;

		// Delete Old elements
		d3.select("#circleOverlay").selectAll("circle").data([]).exit().remove();
		var circleOverlay = settings.drawArea.select("#circleOverlay").selectAll("g").data([]);
		circleOverlay.exit().remove();


	    this.animationController(settings, currentAnimation);
	}
	buildUpSlow(settings, currentAnimation, upto, popText, max, self){
		d3.selectAll("#redHighlight").remove();
		if(upto >= max){
			this.animationController(settings, currentAnimation);
			return;
		}
		drawArrow(self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(2/8), self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(1/8), settings.sample[upto].popId < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize/2 + (self.windowHelper.fontSize+2)*(settings.sample[upto].popId+1)) : -10, popText, "redHighlight", 1, "red" );
		d3.selectAll(".t"+settings.sample[upto].order).attr("stroke-opacity", 1).attr("fill-opacity", 1).transition().duration(500/settings.repititions).each('end', function(d, i){
			self.buildUpSlow(settings, currentAnimation, upto+1, popText, max, self);
		});
		d3.selectAll(".t"+settings.sample[upto].order).style("opacity", 1);


	}
	buildList(settings, currentAnimation){
		var self = this;
		order(settings.sample);
		var goSlow = (settings.repititions == 1 || settings.repititions == 5) && !settings.incDist;
		var popText = d3.select("#sampleReRandomised").empty() ? d3.select("#dynamic").append("g").attr("id", "sampleReRandomised") : d3.select("#sampleReRandomised");
		popText = popText.selectAll("g").data([]);
		popText.exit().remove();
		var i = this.upTo;

		popText = d3.select("#sampleReRandomised").selectAll("g").data(settings.sample);

		var popTextG =popText.enter().append("g");
		popTextG.append("text").text(function(d){
			return d.group;
		}).attr("class",function(d){return "t"+d.order}).attr("x",self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width*(2/4)).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S2.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[self.groups.indexOf(d.group)]}).attr("text-anchor","middle").style("opacity", goSlow ? 0 : 1);

		if(goSlow){
			this.buildUpSlow(settings, currentAnimation, 0, popText, self.allPop.length, self);
		}else{
			d3.select("#circleOverlay").selectAll("circle").attr("stroke-opacity", 1).attr("fill-opacity", 1);
			this.animationController(settings, currentAnimation);
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
			var allInSample = settings.sample.slice();
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
		for(var k = 1;k<sampMean.length;k++){
			this.drawnMeans.push(sampMean[k]);
		}

		// Draw Bars
		var numDivisions = 1;
		var divisions = this.windowHelper.graphSection.S2.displayArea.getDivisions(numDivisions, 'height');
		var divSections = divisions[0];
		var divHeight = divisions[1];
		for(var i = 0;i<numDivisions;i++){
			var pos = divSections[i] - divHeight/2 - this.windowHelper.radius*2;
			var catSVG = d3.select("#samples").append("g").attr("id","samp");

			// Now split on main categories. We want a category for the focus and one for other.
			var focusGroup = allInSample.filter(function(x){return x.value == 1});
			var otherGroup = allInSample.filter(function(x){return x.value != 1});

			this.drawProportionBars(catSVG, divHeight, pos, self.xScale, focusGroup, otherGroup, "samp");
		}

		var middle = this.windowHelper.graphSection.S2.displayArea.getMiddleHeight();
		if(this.drawnMeans.length > 0){
			var mLines = d3.select(".sampleLines").selectAll("g").data(this.drawnMeans);
			var meanLineG = mLines.enter().append("g");
			meanLineG.append("line").attr("class","memLine")
				.attr("x1", function(d){return self.xScale(d.stats[0]);})
				.attr("x2", function(d){return self.xScale(d.stats[0]);})
				.attr("y1", middle + divHeight*(3/8))
				.attr("y2", divSections[0] - divHeight/2 - this.windowHelper.radius*2)
				.style("stroke-width", 3)
				.style("stroke", "black").style("opacity",1);
		
			d3.selectAll(".memLine").style("opacity",0.2).style("stroke","steelblue").attr("y2", divSections[0] - divHeight*(1/4) - this.windowHelper.radius*2);;
			d3.selectAll("#diffLine").remove();
		}
		this.drawnMeans.push(sampMean[0]);
		mLines = d3.select(".sampleLines").selectAll("g").data(this.drawnMeans);
		meanLineG = mLines.enter().append("g");
		meanLineG.append("line").attr("class","memLine")
			.attr("x1", function(d){return self.xScale(d.stats[0]);})
			.attr("x2", function(d){return self.xScale(d.stats[0]);})
			.attr("y1", middle + divHeight*(3/8))
			.attr("y2", divSections[0] - divHeight/2 - this.windowHelper.radius*2)
			.style("stroke-width", 3)
			.style("stroke", "black").style("opacity",1);


		var circleOverlay = d3.select(".memLine").transition().duration(this.transitionSpeed/2).each('end', function(d, i){
			if(settings.incDist){
				self.animationController(settings, currentAnimation);
			}else{
				d3.select("#differenceLine").remove();
				self.animationController(settings, currentAnimation);
			}
		});

	}


	distDrop(settings, currentAnimation){
		var self = this;
		if(!settings.restarting){
			d3.select(".meanOfSamples").selectAll("g").remove();

			var middle = this.windowHelper.graphSection.S2.displayArea.getMiddleHeight();
			var sampMean = this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
			if(this.transitionSpeed > 200){
				var downTo = this.sampleStatistics[settings.indexUpTo].yPerSample[0];
				var redLine = d3.select(".meanOfSamples").selectAll("g").data(sampMean).enter().append("g");

				var numDivisions = 1;
				var divisions = this.windowHelper.graphSection.S2.displayArea.getDivisions(numDivisions, 'height');
				var divSections = divisions[0];
				var divHeight = divisions[1];
				var arrow = redLine.append("line").attr("id", "redLineMain")			
					.attr("x1", self.xScale(sampMean[0].stats[0]))
					.attr("x2", self.xScale(sampMean[0].stats[0]))
					.attr("y1", middle + divHeight*(3/8))
					.attr("y2", divSections[0] - divHeight/2 - this.windowHelper.radius*2)
					.style("stroke-width", 3)
					.style("stroke", "red").style("opacity",1);

				arrow.transition().duration(this.transitionSpeed)
				.attr("y1",downTo)
				.attr("y2",downTo);
			} 
			var meanCircles = d3.select("#sampleDisplay").selectAll("circle").filter(function(d, i){
				return (i>=settings.indexUpTo) && (i <settings.indexUpTo+settings.jumps);
			});

			this.settings.sampMean = sampMean;
			this.settings.meanCircles = meanCircles;
		}else{
			var sampMean = this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
			var redLine = d3.select("#sampleDisplay").selectAll("g").data(sampMean).enter().append("g");
			var downTo = this.sampleStatistics[settings.indexUpTo].yPerSample[0];
			var rL = this.settings.redLine;
			d3.select("#redLineMain").transition().duration(this.transitionSpeed)				
				.attr("y1",downTo)
				.attr("y2",downTo);

			var sampMean = this.settings.sampMean;
			var meanCircles = this.settings.meanCircles;

			this.settings.restarting = false;
		}

		if(this.transitionSpeed > 200){
			var acrossTo = this.sampleStatistics[settings.indexUpTo].xPerSample[0];
		}
		if(settings.goSlow || this.transitionSpeed == 500){
			meanCircles = meanCircles.transition().delay(this.transitionSpeed).attr("fill-opacity",1).attr("stroke-opacity",1).style("stroke", "steelblue").attr("cy", function(d){return d.yPerSample[0]}).each('end', function(d, i){
				self.animationController(settings, currentAnimation);
			});
		}else{
			meanCircles = meanCircles.attr("fill-opacity",1).attr("stroke-opacity",1).style("stroke", "steelblue").attr("cy", function(d){return d.yPerSample[0]});
				self.animationController(settings, currentAnimation);
		}
	}
}

