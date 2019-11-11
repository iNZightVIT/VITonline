
class randVar_oneCat extends visBase {
	constructor(inputData, headingGroup, headingContinuous, statistic, focus) {
		super(inputData, headingGroup, headingContinuous, statistic, focus);
		this.sampleStatType = "diff";
		//this.colorIndex = ["red", "blue"];
		this.colorIndex = colorByIndex;
		this.windowHelper = setUpWindow3({'left':5, 'right':5, 'top':5, 'bottom':5}, true);
		// text labels for each section.
		this.sectionLabels = ['Data','Randomly grouped data','Randomisation Distribution'];
		//this.animationList = [this.populationDropDown,this.buildList, this.splitIntoRandCategories, this.fadeIn, this.endNoDist, this.distDrop, this.endDist ];
		this.animationList = [this.dropDown.bind(this),
						this.splitUp.bind(this), 
						this.fadeIn.bind(this), 
						this.endNoDist.bind(this), 
						this.distDrop.bind(this),
                        this.endDist.bind(this)];
        this.valueAllowCategorical = true;
        this.popDrawType = 1;
        this.num_categories = 2;
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
    setSampleStatistic(diff, categoryStatistics){
		if(this.sampleGroups.length <= 2){
			return this.sampleStatType == 'diff' ? diff : categoryStatistics[0];
		}else{
			var sum = 0;
			let pop_stat = this.populationStatistics.population.statistic;
			for(var g = 0; g < this.sampleGroups.length; g++){
				sum += Math.abs(categoryStatistics[g] - pop_stat);
			}
			return sum/this.sampleGroups.length;
		}
    }
    setupSampleGroups(){
        let groups = ["A", "B", "C", "D", "E", "F"]
		this.sampleGroups = groups.slice(0, this.num_categories);
	}
	getSampleSize(){
		return this.allPop.length;
    }
    getStatisticEachSample(i, g, sample){
		if(sample == undefined){
			sample = this.samples[i];
		}
		var populationSize = sample[g].length;
		return getStatistic(this.statistic, sample[g].filter(function(item){return item.value == 0}), populationSize);
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
		for(var i = 0; i<numSamples;i++){
			// this.samples.push([[],[]]);
			let sample = [[],[]];
			for(var k = 0; k<sampleSize;k++){
				var popItem = this.allPop[k];
				var gRand = Math.round(Math.random() * (this.num_categories - 1));
				var nI = new item(popItem.value, k);
				nI.popId = popItem.id;
				nI.popGroup = popItem.group;
				nI.order = k;
				// Sets initial x and y (first element is for 'population' sample) to be same as the parents.
				nI.xPerSample[0] =popItem.xPerSample[0];
				nI.yPerSample[0] =popItem.yPerSample[0];
				
				nI.group =	this.sampleGroups[gRand];
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
		popTextG.append("text").text(function(d){return [...self.valueCategories][d.value]})
		.attr('fill', (d) => colorByIndex[d.value])
		.attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width/2).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").attr("text-anchor","middle");
		placeInto.append("g").attr("id","redTContainer");
		placeInto.append("text").text("Random Groups").attr("x",(self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width/2)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("display","inline-block").attr("text-anchor","middle");

	}

	cleanUpRepitition(){
		var self = this;
		d3.select("#circleOverlay").selectAll("*").remove();
		d3.selectAll(".memLine").style("opacity",0.2).style("stroke","steelblue").attr("y2",function(){ return d3.select(this).attr("y1")-self.windowHelper.lineHeight*2});;
        d3.selectAll("#diffLine").remove();
        d3.selectAll("#redlineMain").remove();
		d3.selectAll("#samp").remove();
		d3.selectAll("#sampArrow").remove();
		for(var g = 0; g < this.groups.length; g++){
			d3.selectAll("#distArrow"+g).remove();
		}
	}


	// *****************************ANIMATIONS********************************

	dropDown(settings, currentAnimation){
		settings.sample.sort(function(a,b){return (a.order-b.order)})
        var self = this;
        
		if(!self.settings.restarting){
			var popText = d3.select("#sampText");
			popText = popText.selectAll("text").data([]);
            popText.exit().remove();
            
            sharedProportionMultiBarFadeInNoExitNoStatsHidden.apply(this, [settings, currentAnimation]);
            matchPropBars.apply(this, [[0]]);
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
		}
		else{
            let sample_circles = d3.selectAll("#samp circle")[0];
			settings.restarting = false;
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

	}
	splitUp(settings, currentAnimation){
		var self = this;

		if(!self.settings.restarting){

            var circles = d3.selectAll("#samp circle");
            var popText = d3.select("#sampleReRandomised").empty() ? d3.select("#dynamic").append("g").attr("id", "sampleReRandomised") : d3.select("#sampleReRandomised");
            popText.style("fill","black");
            popText = popText.selectAll("text").data([]);
            popText.exit().remove();
            popText = d3.select("#sampleReRandomised").selectAll("text").data(settings.sample);
            var newText = popText.enter().append("text").text(function(d){
                return d.group;
			})
			// .attr('fill', (d) => colorByIndex[d.group])
			.attr("x",self.windowHelper.sampleSection.S2.getMiddleWidth()).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill",function(d) {return self.colorIndex[2 + self.sampleGroups.indexOf(d.group)]}).style("opacity",1).attr("text-anchor", "middle");
        
        }else{
			var circles = d3.selectAll("#samp circle");
			settings.restarting = false;
		}

		// sharedFadeInNoExit.apply(this, [settings, currentAnimation]);

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
                .attr("cx", function(d) {
			    	return d3.select(this).attr("data-cx");
		    	})
				.attr("r", function(d) {
			    	return d3.select(this).attr("data-r");
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

