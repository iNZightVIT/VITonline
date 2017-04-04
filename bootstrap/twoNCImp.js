
class twoNC extends visBase {
	constructor(inputData, headingGroup, headingContinuous, statistic) {
		super(inputData, headingGroup, headingContinuous, statistic);
		this.windowHelper = setUpWindow3({'left':5, 'right':5, 'top':5, 'bottom':5}, true);
		// text labels for each section.
		this.sectionLabels = ['Data','Re-Randomised Data','Re-Randomisation Distribution'];
		//this.animationList = [this.populationDropDown,this.buildList, this.fadeIn, this.endNoDist, this.distDrop, this.endDist ];
		this.animationList = [this.populationDropDown.bind(this),
						this.buildList.bind(this), 
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
					var group = Math.ceil(Math.random()*2) - 1;
					var index =	Math.ceil(Math.random()*populations[this.groups[group]].length) - 1;
					var nI = new item (populations[this.groups[group]][index].value, j);
					nI.popId = populations[this.groups[group]][index].id;
					nI.popGroup = group;
					nI.xPerSample[0] =populations[this.groups[group]][index].xPerSample[0];
					nI.yPerSample[0] =populations[this.groups[group]][index].yPerSample[0];
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
		placeInto.append("text").text(this.headingContinuous).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width/4).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");
		placeInto.append("text").text(this.headingGroup).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");
		var popTextG = placeInto.selectAll("g").data(this.allPop).enter().append("g");
		popTextG.append("text").text(function(d){return d.value}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width/4).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").attr("text-anchor","middle");
		popTextG.append("text").text(function(d){return d.group}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[self.groups.indexOf(d.group)]}).attr("text-anchor","middle");

		placeInto.append("g").attr("id","redTContainer");
		placeInto.append("text").text("ReSample").attr("x",(self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width/2)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("display","inline-block").attr("text-anchor","middle");

	}

	cleanUpRepitition(){
		var self = this;
		d3.selectAll(".memLine").style("opacity",0.2).style("stroke","steelblue").attr("y2",function(){ return d3.select(this).attr("y1")-self.windowHelper.lineHeight*2});;
		d3.selectAll("#diffLine").remove();
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

		var middle = this.windowHelper.graphSection.S1.displayArea.getMiddleHeight();
		var to = this.xScale(this.groupStats[this.groups[1]]);
		var from = this.xScale(this.groupStats[this.groups[0]]);
		var diff = to - from;
		var headSize = 20;
		if(Math.abs(diff) < headSize) headSize =Math.abs(diff)*0.5;
		if(diff != 0) {var arrowHead = diff / Math.abs(diff);} else { var arrowHead = 0;}
		var arrow = drawArrow(this.xScale(this.groupStats[this.groups[1]]), this.xScale(this.groupStats[this.groups[0]]), middle, container, "CISplit", 1, "blue");
		arrow[1].transition().duration(1000).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height- this.windowHelper.radius*2).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height + headSize*arrowHead/2 - this.windowHelper.radius*2).attr("x1",this.sampleStatScale(this.populationStatistic)).attr("x2", this.sampleStatScale(this.populationStatistic) - arrowHead*headSize);
		arrow[2].transition().duration(1000).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height- this.windowHelper.radius*2).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height - headSize*arrowHead/2 - this.windowHelper.radius*2).attr("x1",this.sampleStatScale(this.populationStatistic)).attr("x2", this.sampleStatScale(this.populationStatistic) - arrowHead*headSize);
		arrow[0].transition().duration(1000).attr("x1",this.sampleStatScale(0)).attr("x2",this.sampleStatScale(this.populationStatistic)).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height- this.windowHelper.radius*2).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height - this.windowHelper.radius*2)
			.transition().duration(500).each("end",function(){
				container.append("text").attr("x", self.sampleStatScale(self.populationStatistic)).attr("y", self.windowHelper.graphSection.S3.displayArea.y2).text(Math.round(self.populationStatistic*100)/100).style("stroke","blue").style("opacity",1);
				container.append("line").attr("x1", self.sampleStatScale(self.populationStatistic)).attr("x2", self.sampleStatScale(self.populationStatistic)).attr("y1", self.windowHelper.graphSection.S3.displayArea.y2 + self.windowHelper.graphSection.S3.axisArea.height/2).attr("y2", self.windowHelper.graphSection.S3.displayArea.y2 - self.windowHelper.graphSection.S3.axisArea.height/2).style("stroke-width", 2).style("stroke", "blue");

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
			})

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

		// Add new elements in, appear on top of original population.
		circleOverlay = settings.drawArea.select("#circleOverlay").selectAll("circle").data(settings.sample, function(d){return d.order});
		var circles = circleOverlay.enter().append("circle");
		circles.attr("class", "move")
	    .attr("cx", function(d, i) { 
	    	return d.xPerSample[0]; })
	    .attr("cy", function(d) {
	    	return d.yPerSample[settings.indexUpTo+1];
	    })
	    .attr("r", function(d) { return self.windowHelper.radius; })
	    .attr("fill-opacity", 0)
	    .attr("stroke","#556270")
	    .attr("stroke-opacity",0)
	    .style("fill",function(d){return colorByIndex[d.popGroup]}).attr("class",function(d){return "c"+d.order});

	    this.animationController(settings, currentAnimation);
	}
	buildUpSlow(settings, currentAnimation, upto, popText, max, self){
		d3.selectAll(".redHighlight").remove();
		if(upto >= max){
			this.animationController(settings, currentAnimation);
			return;
		}
		popText.append("text").attr("class", "redHighlight").text(self.allPop[settings.sample[upto].popId].value).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width/4).attr("y", settings.sample[upto].popId < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(settings.sample[upto].popId+1)) : -10).style("font-size",self.windowHelper.fontSize).style("display","inline-block").attr("text-anchor","middle").style("fill", "red");
		d3.selectAll(".c"+settings.sample[upto].order).attr("stroke-opacity", 1).attr("fill-opacity", 1).transition().duration(500/settings.repititions).each('end', function(d, i){
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
			return d.value;
		}).attr("class",function(d){return "t"+d.order}).attr("x",self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width*(1/4)).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S2.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", "black").attr("text-anchor","middle").style("opacity", goSlow ? 0 : 1);

		popTextG.append("text").text(function(d){
			return d.group;
		}).attr("class",function(d){return "t"+d.order}).attr("x",self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width*(3/4)).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S2.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[self.groups.indexOf(d.group)]}).attr("text-anchor","middle").style("opacity", goSlow ? 0 : 1);

		if(goSlow){
			this.buildUpSlow(settings, currentAnimation, 0, popText, self.allPop.length, self);
		}else{
			d3.select("#circleOverlay").selectAll("circle").attr("stroke-opacity", 1).attr("fill-opacity", 1);
			this.animationController(settings, currentAnimation);
		}


	}

	fadeIn(settings, currentAnimation){
		sharedFadeIn.apply(this, [settings, currentAnimation]);

	}


	distDrop(settings, currentAnimation){
		sharedDistDrop.apply(this, [settings, currentAnimation]);
	}
}

