
class randVar_oneNum extends visBase {
	constructor(inputData, headingGroup, headingContinuous, statistic) {
		super(inputData, headingGroup, headingContinuous, statistic);
		this.sampleStatType = "diff";
		//this.colorIndex = ["red", "blue"];
		this.colorIndex = colorByIndex;
		this.windowHelper = setUpWindow3({'left':5, 'right':5, 'top':5, 'bottom':5}, true);
		// text labels for each section.
		this.sectionLabels = ['Data','Randomly grouped data','Randomisation Distribution'];
		//this.animationList = [this.populationDropDown,this.buildList, this.splitIntoRandCategories, this.fadeIn, this.endNoDist, this.distDrop, this.endDist ];
		this.animationList = [this.dropDown.bind(this),
						this.splitUp.bind(this), 
						this.endNoDist.bind(this), 
						this.distDrop.bind(this),
						this.endDist.bind(this)];
	}

	setUpPopCategory(items, scale, radius, top, bottom){
		// Sets the y value for all population circles in the category to make it look heaped. 
		heapYValues3(items, scale, radius, 0, top,bottom);
	}
	drawPopulationCategories(placeInto){
		var popDrawFunctions = [this.drawContinuous.bind(this), this.drawProportional.bind(this)];
		var popDrawFunction = popDrawFunctions[this.popDrawType];
		popDrawFunction(placeInto);
		
		d3.select("#population").select(".pop").selectAll("circle").style("fill-opacity", 0);
	}
	drawPopulationStatistic(placeInto){
	}

	getSampleSize(){
		return this.allPop.length;
	}
	makeSample(populations, numSamples, sampleSize, statistic, saveSample){
		this.samples = [];
		for(var i = 0; i<numSamples;i++){
			// this.samples.push([[],[]]);
			let sample = [[],[]];
			for(var k = 0; k<sampleSize;k++){
				var popItem = this.allPop[k];
				var gRand = Math.round(Math.random());
				var nI = new item(popItem.value, k);
				nI.popId = popItem.id;
				nI.popGroup = popItem.group;
				nI.order = k;
				// Sets initial x and y (first element is for 'population' sample) to be same as the parents.
				nI.xPerSample[0] =popItem.xPerSample[0];
				nI.yPerSample[0] =popItem.yPerSample[0];
				
				nI.group =	gRand;
				nI.groupIndex = gRand;
				sample[gRand].push(nI);
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
		placeInto.append("text").text(this.headingContinuous).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width/2).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");
		var popTextG = placeInto.selectAll("g").data(this.allPop).enter().append("g");
		popTextG.append("text").text(function(d){return d.value}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width/2).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").attr("text-anchor","middle");
		placeInto.append("g").attr("id","redTContainer");
		placeInto.append("text").text("Random Groups").attr("x",(self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width/2)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("display","inline-block").attr("text-anchor","middle");

	}

	cleanUpRepitition(){
		var self = this;
		d3.select("#circleOverlay").selectAll("*").remove();
		d3.selectAll(".memLine").style("opacity",0.2).style("stroke","steelblue").attr("y2",function(){ return d3.select(this).attr("y1")-self.windowHelper.lineHeight*2});;
		d3.selectAll("#diffLine").remove();
	}


	// *****************************ANIMATIONS********************************

	dropDown(settings, currentAnimation){
		settings.sample.sort(function(a,b){return (a.order-b.order)})
		var self = this;
		if(!self.settings.restarting){
			var popText = d3.select("#sampText");
			popText = popText.selectAll("text").data([]);
			popText.exit().remove();
			var dropCircle = d3.select("#circleOverlay").selectAll("circle").data(this.allPop);
			   dropCircle.enter().append("circle")
			    .attr("cx", function(d, i) { 
			    	return d.xPerSample[0]; })
			    .attr("cy", function(d) {
			    	return d.yPerSample[0];
			    })
			    .attr("r", self.windowHelper.radius )
			    .attr("fill-opacity", 0)
			    .style("stroke","#556270")
			    .attr("stroke-opacity",1);
		}
		else{
			dropCircle = d3.select("#circleOverlay").select("#static").selectAll("circle");
			settings.restarting = false;
		}
		if(settings.goSlow){
			dropCircle.transition().duration(this.transitionSpeed).attr("cy", function(d){return d.yPerSample[0] + self.windowHelper.graphSection.S2.displayArea.y}).transition().duration(this.transitionSpeed).each('end',function(d,i){
				if(d==self.allPop[0]){
					self.animationController(settings, currentAnimation);
					
				}
			});
		}else{
			dropCircle.attr("cy", function(d){return d.yPerSample[0] + self.windowHelper.graphSection.S2.displayArea.y});
			self.animationController(settings, currentAnimation);

		}

	}
	splitUp(settings, currentAnimation){
		var self = this;

		if(!self.settings.restarting){
		d3.select("#circleOverlay").selectAll("circle").attr("stroke-opacity", 0.1);
		var splitCircle = d3.select("#circleOverlay").select("#split").empty() ? d3.select("#circleOverlay").append("g").attr('id', "split") : d3.select("#circleOverlay").select("#split");
		splitCircle = d3.select("#circleOverlay").select("#split").selectAll("circle").data(settings.sample);
		   splitCircle.enter().append("circle")
		    .attr("cx", function(d, i) { 
		    	return d.xPerSample[0]; })
		    .attr("cy", function(d) {
		    	return d.yPerSample[0] + self.windowHelper.graphSection.S2.displayArea.y;
		    })
		    .attr("r", function(d) { return self.windowHelper.radius; })
		    .attr("fill-opacity", 0.5)
		    .style("stroke","#556270")
		    .attr("stroke-opacity",1);

		var popText = d3.select("#sampleReRandomised").empty() ? d3.select("#dynamic").append("g").attr("id", "sampleReRandomised") : d3.select("#sampleReRandomised");
		popText.style("fill","black");
		popText = popText.selectAll("text").data([]);
		popText.exit().remove();
		popText = d3.select("#sampleReRandomised").selectAll("text").data(settings.sample);
		var newText = popText.enter().append("text").text(function(d){
			if(d.group == 0){
				return "A";
			}else{
				return "B";
			}
		}).attr("x",self.windowHelper.sampleSection.S2.getMiddleWidth()).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill",function(d) {return self.colorIndex[d.group]}).style("opacity",1).attr("text-anchor", "middle");
		}else{
			var splitCircle = d3.select("#circleOverlay").select("#split").selectAll("circle");
			settings.restarting = false;
		}

		sharedFadeInNoExit.apply(this, [settings, currentAnimation]);

		if(settings.goSlow){
		splitCircle.style("fill", function(d){
			var test = self.colorIndex[d.group];
			return test}).transition().duration(this.transitionSpeed).attr("cy",function(d,i){
				return d.yPerSample[settings.indexUpTo+1];
			}).each("end", function(d){
				if(d==settings.sample[0]){
					self.animationController(settings, currentAnimation);
					
				}
		});
		}else{
			splitCircle.style("fill", function(d){return self.colorIndex[d.group];}).attr("cy",function(d,i){return d.yPerSample[settings.indexUpTo+1]})
			.transition().duration(this.transitionSpeed).each("end", function(d){
				if(d==settings.sample[0]){
					self.animationController(settings, currentAnimation);
					
				}
		});
		}



	}

	distDrop(settings, currentAnimation){
		sharedDistDrop.apply(this, [settings, currentAnimation]);
	}
}

