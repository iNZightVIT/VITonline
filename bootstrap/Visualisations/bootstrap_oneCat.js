
class bootstrap_oneCat extends visBase {
	constructor(inputData, headingGroup, headingContinuous, statistic, focus) {
		super(inputData, headingGroup, headingContinuous, statistic, focus);
		this.windowHelper = setUpWindow3({'left':5, 'right':5, 'top':5, 'bottom':5}, true);
		this.sampleStatType = "stat";
		this.popDrawType = 1;
		this.calcLargeCI = true;
		// text labels for each section.
		this.sectionLabels = ['Data','Re-Sample','Bootstrap Distribution'];

		this.valueAllowCategorical = true;
		//this.animationList = [this.populationDropDown,this.buildList, this.fadeIn, this.endNoDist, this.distDrop, this.endDist ];
		this.animationList = [this.populationDropDown.bind(this),
						this.buildList.bind(this), 
						this.fadeIn.bind(this), 
						this.endNoDist.bind(this), 
						this.distDrop.bind(this),
						this.removeBar.bind(this),
						this.endDist.bind(this)];
	}

	setUpPopCategory(items, scale, radius, top, bottom){
		// No real need to set anything up here, everything done when drawn.
	}

	getSampleSize(){
		// return this.allPop.length < 51 ? this.allPop.length : null;
		return this.allPop.length;
	}
	makeSample(populations, numSamples, sampleSize, statistic, saveSample){
		this.samples = [];
		for(var i = 0; i<numSamples;i++){
			// this.samples.push([]);
			let sample = [];
			for(var g = 0; g < [...this.valueCategories].length; g++){
				sample.push([]);
			}
			var stats = [];
			for(var j = 0; j < sampleSize;j++){
				var index = Math.ceil(Math.random()*this.allPop.length) - 1;
				var group = [...this.valueCategories][this.allPop[index].value];
				var groupIndex = this.allPop[index].value;
					var nI = new item (this.allPop[index].value, j);
					nI.popId = this.allPop[index].id;
					nI.group =	group;
					nI.order = j;
					nI.groupIndex = groupIndex;
					sample[groupIndex].push(nI);
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
		placeInto.append("text").text(this.headingContinuous).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(2/4)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");
		var popTextG = placeInto.selectAll("g").data(this.allPop).enter().append("g");
		popTextG.append("text").text(function(d){return [...self.valueCategories][d.value]}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(2/4)).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[d.value]}).attr("text-anchor","middle");

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
	setUpLargeCI(sSize){
		var self = this;
		// Get the tail proportion info for 10,000 samples.
		this.resetSampleStatistics();
		this.makeSample(this.populations, 10000, sSize, this.statistic, false);
		// this.setUpSampleStatistics();
		this.largeTailSize = 0;
		var statList = this.sampleStatType == 'diff' ? this.sampleStatistics.map(function(statObj){ return statObj.diff}) : this.sampleStatistics.map(function(statObj){ return statObj.stats[0]});
		// statlist.sort(function(a,b){
		// 	if(Math.abs(self.populationStatistic - a ) < Math.abs(self.populationStatistic - b)) return -1;
		// 	if(Math.abs(self.populationStatistic - a ) > Math.abs(self.populationStatistic - b)) return 1;
		// 	return 0;
		// });

		// this.largeCISplit = Math.abs(this.populationStatistic - statlist[10000*0.95]);
		statList.sort(function(a, b){
			return parseFloat(a) - parseFloat(b);
		});
		let lower_CI = statList[Math.floor(this.numSamples*0.025)];
		let upper_CI = statList[Math.ceil(this.numSamples*0.975)];
		this.largeCISplit = [lower_CI, upper_CI];
	}
	setUpCI(statList){
		var CISplit = Math.abs(this.populationStatistic - statList[this.numSamples*0.95]);
		statList.sort(function(a, b){
			return parseFloat(a) - parseFloat(b);
		});
		let lower_CI = statList[Math.floor(this.numSamples*0.025)];
		let upper_CI = statList[Math.ceil(this.numSamples*0.975)];
		for(var k = 0; k < this.numSamples;k++){
			if(this.sampleStatistics[k].value < lower_CI || this.sampleStatistics[k].value > upper_CI){
				this.sampleStatistics[k].inCI = false;
			}else{
				this.sampleStatistics[k].inCI = true;
			}
		}
		this.CISplit = [lower_CI, upper_CI];
	}
	showCI(num, large){
		var self = this;
		var CIVar = this.CISplit;
		var svg = d3.select(".svg");
		if(num == "10000" || large || false){
			CIVar = this.largeCISplit;
		}
		var container = !svg.select("#CISplitContainer").empty() ? svg.select("CISplitContainer") : svg.append("svg").attr("id","CISplitContainer");
				var visibleCircles = d3.selectAll(".notInCI").filter(function(){
					return this.attributes["fill-opacity"].value == "1";
				});
				visibleCircles.style("opacity",0.2).transition().duration(500).each("end",function(d,i){
					if(i==0){
					drawArrowDown(self.windowHelper.graphSection.S3.axisArea.y2, self.windowHelper.graphSection.S3.displayArea.y2 - self.windowHelper.graphSection.S3.displayArea.height/2, self.sampleStatScale(CIVar[0]), container, "ciDownArrow", 1, "red",0.75);
					drawArrowDown(self.windowHelper.graphSection.S3.axisArea.y2, self.windowHelper.graphSection.S3.displayArea.y2 - self.windowHelper.graphSection.S3.displayArea.height/2, self.sampleStatScale(CIVar[1]), container, "ciDownArrow", 1, "red",0.75);
					//d3.select("#CISplit").append("line").attr("y1",self.windowHelper.section3.bottom - self.windowHelper.section3.height/4).attr("y2",self.windowHelper.section3.bottom + self.windowHelper.section3.height/10).attr("x1",self.xScale2(self.populationStatistic-CIVar)).attr("x2",self.xScale2(self.populationStatistic-CIVar)).style("stroke","red");
					//d3.select("#CISplit").append("line").attr("y1",self.windowHelper.section3.bottom - self.windowHelper.section3.height/4).attr("y2",self.windowHelper.section3.bottom + self.windowHelper.section3.height/10).attr("x1",self.xScale2(self.populationStatistic+CIVar)).attr("x2",self.xScale2(self.populationStatistic+CIVar)).style("stroke","red");
										// proportion above sample
					
					// var ciTextLabel = Math.round((self.populationStatistic+CIVar)*100)/100;
					// if(large){
					// 	ciTextLabel = Math.round((self.populationStatistic+self.largeCISplit)*100)/100;
						
					// }

					container.append("text").attr("y",self.windowHelper.graphSection.S3.axisArea.y2).attr("x",self.sampleStatScale(CIVar[1])).text(Math.round((CIVar[1])*100)/100).style("stroke","red").style("fill", "red").style("font-size", 12).attr("dominant-baseline","hanging");
					container.append("text").attr("y",self.windowHelper.graphSection.S3.axisArea.y2).attr("x",self.sampleStatScale(CIVar[0])).text(Math.round((CIVar[0])*100)/100).style("stroke","red").style("fill", "red").style("font-size", 12).attr("dominant-baseline","hanging")
						.transition().duration(500).each("end",function(){
							container.append("line").attr("y1",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("x1",self.sampleStatScale(CIVar[0])).attr("x2",self.sampleStatScale(CIVar[1])).style("stroke","red").style("stroke-width",5)
								.transition().duration(500).each("end",function(){
									var midline = container.append("line").attr("y1",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("x1",self.sampleStatScale(CIVar[0])).attr("x2",self.sampleStatScale(CIVar[1])).style("stroke","red").style("stroke-width",5);
									var topline = container.append("line").attr("y1",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("x1",self.sampleStatScale(CIVar[0])).attr("x2",self.sampleStatScale(CIVar[1])).style("stroke","red").style("stroke-width",5);
									midline.transition().duration(1000).attr("y1",self.windowHelper.graphSection.S2.displayArea.y2 - self.windowHelper.graphSection.S2.displayArea.height/8).attr("y2",self.windowHelper.graphSection.S2.displayArea.y2 - self.windowHelper.graphSection.S2.displayArea.height/8);
									topline.transition().delay(1000).duration(1000).attr("y1",self.windowHelper.graphSection.S1.displayArea.y2 - self.windowHelper.graphSection.S1.displayArea.height/8 + 10).attr("y2",self.windowHelper.graphSection.S1.displayArea.y2 - self.windowHelper.graphSection.S1.displayArea.height/8 + 10)
									.transition().duration(50).each("end",function(){
										drawArrowDown(self.windowHelper.graphSection.S1.displayArea.y2, self.windowHelper.graphSection.S1.displayArea.y2 - self.windowHelper.graphSection.S1.displayArea.height/8 + 10, self.sampleStatScale(CIVar[0]), container, "ciDownArrow", 1, "red",0.75);
										drawArrowDown(self.windowHelper.graphSection.S1.displayArea.y2, self.windowHelper.graphSection.S1.displayArea.y2 - self.windowHelper.graphSection.S1.displayArea.height/8 + 10, self.sampleStatScale(CIVar[1]), container, "ciDownArrow", 1, "red",0.75);

									});
								});
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
			settings.buildListUpto = upto+1;
			self.buildUpSlow(settings, currentAnimation, upto+1, popText, max, self);
		});
		d3.selectAll(".t"+settings.sample[upto].order).style("opacity", 1);


	}
	buildList(settings, currentAnimation){
		var self = this;
		if(!settings.restarting){
			order(settings.sample);
			var goSlow = (settings.repititions == 1 || settings.repititions == 5) && !settings.incDist;
			var popText = d3.select("#sampleReRandomised").empty() ? d3.select("#dynamic").append("g").attr("id", "sampleReRandomised") : d3.select("#sampleReRandomised");
			popText = popText.selectAll("g").data([]);
			popText.exit().remove();
			var i = this.upTo;

			popText = d3.select("#sampleReRandomised").selectAll("g").data(settings.sample);

			var popTextG =popText.enter().append("g");
			popTextG.append("text").text(
				function(d){
					return [...self.valueCategories][d.value];
				}).attr("class",function(d){return "t"+d.order}).attr("x",self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width*(2/4)).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S2.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[d.value]}).attr("text-anchor","middle").style("opacity", goSlow ? 0 : 1);

			if(goSlow){
				this.buildUpSlow(settings, currentAnimation, 0, popText, Math.min(self.allPop.length, 40), self);
			}else{
				d3.select("#circleOverlay").selectAll("circle").attr("stroke-opacity", 1).attr("fill-opacity", 1);
				this.animationController(settings, currentAnimation);
			}
		}else{
			popText = d3.select("#sampleReRandomised").selectAll("g").data(settings.sample);
			this.buildUpSlow(settings, currentAnimation, settings.buildListUpto, popText, Math.min(self.allPop.length, 40), self);
		}


	}

	fadeIn(settings, currentAnimation){
		sharedProportionBarFadeIn.apply(this, [settings, currentAnimation]);
	}


	distDrop(settings, currentAnimation){
		sharedSingleStatDistDrop.apply(this, [settings, currentAnimation]);
	}
	removeBar(settings, currentAnimation){
		if(settings.repititions > 500){
			d3.select("#samp").remove();
		}
		this.animationController(settings, currentAnimation);
	}
}

