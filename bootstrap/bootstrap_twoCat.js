
class bootstrap_twoCat extends visBase {
	constructor(inputData, headingGroup, headingContinuous, statistic, focus) {
		super(inputData, headingGroup, headingContinuous, statistic, focus);
		this.windowHelper = setUpWindow3({'left':5, 'right':5, 'top':5, 'bottom':5}, true);
		this.sampleStatType = "diff";
		this.popDrawType = 1;
		this.calcLargeCI = true;
		this.valueAllowCategorical = true;
		// text labels for each section.
		this.sectionLabels = ['Data','Re-Sample','Bootstrap Distribution'];
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
		return this.allPop.length < 51 ? this.allPop.length : null;
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
				var index = Math.ceil(Math.random()*this.allPop.length) - 1;
				var pickedOriginal = this.allPop[index];


				var group = pickedOriginal.group;
				var groupIndex = this.groups.indexOf(group);

				var nI = new item (pickedOriginal.value, j);
					nI.popId = pickedOriginal.id;
					nI.popGroup = groupIndex;
					nI.xPerSample[0] = pickedOriginal.xPerSample[0];
					nI.yPerSample[0] = pickedOriginal.yPerSample[0];
					nI.group =	group;
					nI.order = j;
					nI.groupIndex = groupIndex;
				this.samples[i][groupIndex].push(nI);
			}
		}
	}

	getStatisticEachSample(i, g){
		var populationSize = this.samples[i][g].length;

		//Our statistic will be the proportion of values that match the focus out of each group.
		return getStatistic(this.statistic, this.samples[i][g].filter(function(item){return item.value == 0}), populationSize);
	}

	setUpSampleCategory(items, scale, radius, sample, top, bottom){
		// Sets the y value for all population circles in the category to make it look heaped. 
		heapYValues3(items, scale, radius, sample, top,bottom);
	}
	fillBaseSampleSection(placeInto){
		var self = this;
		placeInto.append("text").text(this.headingGroup).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");
		placeInto.append("text").text(this.headingContinuous).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(1/4)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");

		var popTextG = placeInto.selectAll("g").data(this.allPop).enter().append("g");
		popTextG.append("text").text(function(d){return (d.value == 1 || self.groups.length == 2) ? d.group : "Other"}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[[...self.valueCategories].length+self.groups.indexOf(d.group)]}).attr("text-anchor","middle");
		popTextG.append("text").text(function(d){return [...self.valueCategories][d.value]}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(1/4)).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[d.value]}).attr("text-anchor","middle");

		placeInto.append("g").attr("id","redTContainer");
		placeInto.append("text").text("ReSample").attr("x",(self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width/2)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("display","inline-block").attr("text-anchor","middle");

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
		this.makeSample(this.populations, 10000, sSize, this.statistic);
		this.setUpSampleStatistics();
		this.largeTailSize = 0;
		var statlist = this.sampleStatType == 'diff' ? this.sampleStatistics.map(function(statObj){ return statObj.diff}) : this.sampleStatistics.map(function(statObj){ return statObj.stats[0]});
		statlist.sort(function(a,b){
			if(Math.abs(self.populationStatistic - a ) < Math.abs(self.populationStatistic - b)) return -1;
			if(Math.abs(self.populationStatistic - a ) > Math.abs(self.populationStatistic - b)) return 1;
			return 0;
		});

		this.largeCISplit = Math.abs(this.populationStatistic - statlist[10000*0.95]);
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
		if(num == "10000" || large || true){
			CIVar = this.largeCISplit;
		}
		var container = !svg.select("#CISplitContainer").empty() ? svg.select("CISplitContainer") : svg.append("svg").attr("id","CISplitContainer");
				var visibleCircles = d3.selectAll(".notInCI").filter(function(){
					return this.attributes["fill-opacity"].value == "1";
				});
				var after = function(visibleCircles, container, svg){
					visibleCircles.style("opacity",0.2).transition().duration(500).each("end",function(d,i){
					if(i==0){
					drawArrowDown(self.windowHelper.graphSection.S3.axisArea.y2, self.windowHelper.graphSection.S3.displayArea.y2 - self.windowHelper.graphSection.S3.displayArea.height/2, self.sampleStatScale(self.populationStatistic-CIVar), container, "ciDownArrow", 1, "red",0.75);
					drawArrowDown(self.windowHelper.graphSection.S3.axisArea.y2, self.windowHelper.graphSection.S3.displayArea.y2 - self.windowHelper.graphSection.S3.displayArea.height/2, self.sampleStatScale(self.populationStatistic+CIVar), container, "ciDownArrow", 1, "red",0.75);
					//d3.select("#CISplit").append("line").attr("y1",self.windowHelper.section3.bottom - self.windowHelper.section3.height/4).attr("y2",self.windowHelper.section3.bottom + self.windowHelper.section3.height/10).attr("x1",self.xScale2(self.populationStatistic-self.CISplit)).attr("x2",self.xScale2(self.populationStatistic-self.CISplit)).style("stroke","red");
					//d3.select("#CISplit").append("line").attr("y1",self.windowHelper.section3.bottom - self.windowHelper.section3.height/4).attr("y2",self.windowHelper.section3.bottom + self.windowHelper.section3.height/10).attr("x1",self.xScale2(self.populationStatistic+self.CISplit)).attr("x2",self.xScale2(self.populationStatistic+self.CISplit)).style("stroke","red");
										// proportion above sample
					
					var ciTextLabel = Math.round((self.populationStatistic+self.CISplit)*100)/100;
					if(large){
						ciTextLabel = Math.round((self.populationStatistic+self.largeCISplit)*100)/100;
						
					}

					container.append("text").attr("y",self.windowHelper.graphSection.S3.axisArea.y2).attr("x",self.sampleStatScale(self.populationStatistic+CIVar)).text(Math.round((self.populationStatistic+CIVar)*100)/100).style("stroke","red").style("fill", "red").style("font-size", 12).attr("dominant-baseline","hanging");
					container.append("text").attr("y",self.windowHelper.graphSection.S3.axisArea.y2).attr("x",self.sampleStatScale(self.populationStatistic-CIVar)).text(Math.round((self.populationStatistic-CIVar)*100)/100).style("stroke","red").style("fill", "red").style("font-size", 12).attr("dominant-baseline","hanging")
						.transition().duration(500).each("end",function(){
							container.append("line").attr("y1",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("x1",self.sampleStatScale(self.populationStatistic-CIVar)).attr("x2",self.sampleStatScale(self.populationStatistic+CIVar)).style("stroke","red").style("stroke-width",5);
						});
					}
				});
				}
				CIDifferenceArrow.apply(this, [after.bind(this, visibleCircles, container, svg)]);


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
		drawArrow(self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(1/8), self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(0/8), settings.sample[upto].popId < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize/2 + (self.windowHelper.fontSize+2)*(settings.sample[upto].popId+1)) : -10, popText, "redHighlight", 1, "red" );
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
					return (d.value == 1 || self.groups.length == 2) ? d.group : "Other"
				}).attr("class",function(d){return "t"+d.order}).attr("x",self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width*(3/4)).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S2.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[[...self.valueCategories].length+self.groups.indexOf(d.group)]}).attr("text-anchor","middle").style("opacity", goSlow ? 0 : 1);

			popTextG.append("text").text(function(d){
				return [...self.valueCategories][d.value]
			}).attr("class",function(d){return "t"+d.order}).attr("x",self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width*(1/4)).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S2.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[d.value]}).attr("text-anchor","middle").style("opacity", goSlow ? 0 : 1);

			if(goSlow){
				this.buildUpSlow(settings, currentAnimation, 0, popText, self.allPop.length, self);
			}else{
				d3.select("#circleOverlay").selectAll("circle").attr("stroke-opacity", 1).attr("fill-opacity", 1);
				this.animationController(settings, currentAnimation);
			}
		}else{
			popText = d3.select("#sampleReRandomised").selectAll("g").data(settings.sample);
			this.buildUpSlow(settings, currentAnimation, settings.buildListUpto, popText, self.allPop.length, self);
		}


	}

	fadeIn(settings, currentAnimation){
		sharedProportionMultiBarFadeIn.apply(this, [settings, currentAnimation]);
	}


	distDrop(settings, currentAnimation){
		sharedSingleStatDistDrop.apply(this, [settings, currentAnimation]);
	}
	removeBar(settings, currentAnimation){
		if(settings.repititions > 500){
			d3.selectAll("#samp").remove();
		}
		this.animationController(settings, currentAnimation);
	}
}

