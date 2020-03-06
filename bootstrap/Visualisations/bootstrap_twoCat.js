
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
		// return this.allPop.length < 51 ? this.allPop.length : null;
		return this.allPop.length;
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

	makeSample(populations, numSamples, sampleSize, statistic, saveSample, withinSample = true){
		this.samples = [];
		for(var i = 0; i<numSamples;i++){
			// this.samples.push([]);
			let sample = [];
			for(var g = 0; g < this.groups.length; g++){
				sample.push([]);
			}
			var stats = [];
			if(!withinSample){
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
					sample[groupIndex].push(nI);
				}
			}else{
				let sample_counter = 0;
				for(let g of this.groups){
					let group_pop_elements = this.allPop.filter((pe) => pe.group == g);
					let num_in_group = group_pop_elements.length;
					for(var j = 0; j < num_in_group;j++){
						var index = Math.ceil(Math.random()*group_pop_elements.length) - 1;
						var pickedOriginal = group_pop_elements[index];
						var group = pickedOriginal.group;
						var groupIndex = this.groups.indexOf(group);

						var nI = new item (pickedOriginal.value, sample_counter);
						nI.popId = pickedOriginal.id;
						nI.popGroup = groupIndex;
						nI.xPerSample[0] = pickedOriginal.xPerSample[0];
						nI.yPerSample[0] = pickedOriginal.yPerSample[0];
						nI.group =	group;
						nI.order = sample_counter;
						nI.groupIndex = groupIndex;
						sample[groupIndex].push(nI);
						sample_counter++;
					}
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
		placeInto.append("text").text(this.headingGroup).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");
		placeInto.append("text").text(this.headingContinuous).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(1/4)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");

		var popTextG = placeInto.selectAll("g").data(this.allPop).enter().append("g");
		// popTextG.append("text").text(function(d){return (d.value == 1 || self.groups.length == 2) ? d.group : "Other"}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[[...self.valueCategories].length+self.groups.indexOf(d.group)]}).attr("text-anchor","middle");
		popTextG.append("text").text(function(d){return (d.group)}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[[...self.valueCategories].length+self.groups.indexOf(d.group)]}).attr("text-anchor","middle");
		popTextG.append("text").text(function(d){return [...self.valueCategories][d.value]}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(1/4)).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[d.value]}).attr("text-anchor","middle");

		placeInto.append("g").attr("id","redTContainer");
		placeInto.append("text").text("ReSample").attr("x",(self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width/2)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("display","inline-block").attr("text-anchor","middle");

	}

	cleanUpRepitition(){
		var self = this;
		d3.selectAll(".memLine").style("opacity",0.2).style("stroke","steelblue").attr("y2",function(){ return d3.select(this).attr("y1")-self.windowHelper.lineHeight*2});;
		d3.selectAll("#diffLine").remove();
		d3.selectAll("#samp").remove();
		d3.selectAll("#redlineMain").remove();
		d3.selectAll("#sampArrow").remove();
		for(var g = 0; g < this.groups.length; g++){
			d3.selectAll("#distArrow"+g).remove();
		}
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
				var after = function(visibleCircles, container, svg){
					visibleCircles.style("opacity",0.2).transition().duration(500).each("end",function(d,i){
					if(i==0){
					drawArrowDown(self.windowHelper.graphSection.S3.axisArea.y2, self.windowHelper.graphSection.S3.displayArea.y2 - self.windowHelper.graphSection.S3.displayArea.height/2, self.sampleStatScale(CIVar[0]), container, "ciDownArrow", 1, "red",0.75);
					drawArrowDown(self.windowHelper.graphSection.S3.axisArea.y2, self.windowHelper.graphSection.S3.displayArea.y2 - self.windowHelper.graphSection.S3.displayArea.height/2, self.sampleStatScale(CIVar[1]), container, "ciDownArrow", 1, "red",0.75);
					//d3.select("#CISplit").append("line").attr("y1",self.windowHelper.section3.bottom - self.windowHelper.section3.height/4).attr("y2",self.windowHelper.section3.bottom + self.windowHelper.section3.height/10).attr("x1",self.xScale2(self.populationStatistic-self.CISplit)).attr("x2",self.xScale2(self.populationStatistic-self.CISplit)).style("stroke","red");
					//d3.select("#CISplit").append("line").attr("y1",self.windowHelper.section3.bottom - self.windowHelper.section3.height/4).attr("y2",self.windowHelper.section3.bottom + self.windowHelper.section3.height/10).attr("x1",self.xScale2(self.populationStatistic+self.CISplit)).attr("x2",self.xScale2(self.populationStatistic+self.CISplit)).style("stroke","red");
										// proportion above sample
					
					// var ciTextLabel = Math.round((self.populationStatistic+self.CISplit)*100)/100;
					// if(large){
					// 	ciTextLabel = Math.round((self.populationStatistic+self.largeCISplit)*100)/100;
						
					// }

					container.append("text").attr("y",self.windowHelper.graphSection.S3.axisArea.y2).attr("x",self.sampleStatScale(CIVar[1])).text(Math.round((CIVar[1])*100)/100).style("stroke","red").style("fill", "red").style("font-size", 12).attr("dominant-baseline","hanging");
					container.append("text").attr("y",self.windowHelper.graphSection.S3.axisArea.y2).attr("x",self.sampleStatScale(CIVar[0])).text(Math.round((CIVar[0])*100)/100).style("stroke","red").style("fill", "red").style("font-size", 12).attr("dominant-baseline","hanging")
						.transition().duration(500).each("end",function(){
							container.append("line").attr("y1",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("x1",self.sampleStatScale(CIVar[0])).attr("x2",self.sampleStatScale(CIVar[1])).style("stroke","red").style("stroke-width",5);
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

		var self = this;
		sharedProportionMultiBarFadeInNoExitNoStatsHidden.apply(this, [settings, currentAnimation]);

		matchPropBars.apply(this, [[0, 1]]);

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

	    this.animationController(settings, currentAnimation);
	}
	buildUpSlow(settings, currentAnimation, upto, popText, max, self, seen){
		let sample_circles = d3.selectAll("#samp circle")[0];
		for(let sc = 0; sc < sample_circles.length; sc++){
			let samp_circ = d3.select(sample_circles[sc]);
			let id = samp_circ[0][0].id;
			let primary_category = id.split('---')[1];
			let secondary_category = id.split('---').slice(2, id.split('---').length - 1).join('---');
			let id_values = id.split('---');
			if(seen.includes(id)) continue;
			let primary_category_name = [...self.valueCategories][settings.sample[upto].value].replace(/ /g,'')
			if((settings.sample[upto].group.replace(/\W/g,'') == secondary_category) && (primary_category_name == primary_category)){
				samp_circ.attr("cy", function(){
					return d3.select(this).attr("data-cy");
				}).attr("r", function(){
					return d3.select(this).attr("data-r");
				}).attr("cx", function(){
					return d3.select(this).attr("data-cx");
				// }).transition().duration(500/settings.repititions).attr("fill-opacity", 1);
				}).style("fill", function(){
					return d3.select(this).attr("data-fill");
				}).attr("fill-opacity", 1);
				seen.push(id);
				break;
			}
			// console.log(settings.sample[upto]);
		}

		d3.selectAll("#redHighlight").remove();
		if(upto >= max){
			this.animationController(settings, currentAnimation);
			return;
		}
		drawArrow(self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(1/8), self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(0/8), settings.sample[upto].popId < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize/2 + (self.windowHelper.fontSize+2)*(settings.sample[upto].popId+1)) : -10, popText, "redHighlight", 1, "red" );
		d3.selectAll(".t"+settings.sample[upto].order).attr("stroke-opacity", 1).attr("fill-opacity", 1).transition().duration(500/settings.repititions).each('end', function(d, i){
			if(i == 0){
				settings.buildListUpto = upto+1;
				self.buildUpSlow(settings, currentAnimation, upto+1, popText, max, self, seen);
			}
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
					// return (d.value == 1 || self.groups.length == 2) ? d.group : "Other"
					return d.group
				}).attr("class",function(d){return "t"+d.order}).attr("x",self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width*(3/4)).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S2.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[[...self.valueCategories].length+self.groups.indexOf(d.group)]}).attr("text-anchor","middle").style("opacity", goSlow ? 0 : 1);

			popTextG.append("text").text(function(d){
				return [...self.valueCategories][d.value]
			}).attr("class",function(d){return "t"+d.order}).attr("x",self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width*(1/4)).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S2.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[d.value]}).attr("text-anchor","middle").style("opacity", goSlow ? 0 : 1);

			if(goSlow){
				this.buildUpSlow(settings, currentAnimation, 0, popText, Math.min(self.allPop.length, 40), self, []);
			}else{
				d3.selectAll("#samp circle").attr('cy', function(){return d3.select(this).attr("data-cy")})
				.attr('cx', function(){return d3.select(this).attr("data-cx")})
				.attr('r', function(){return d3.select(this).attr("data-r")})
				.style('fill', function(){return d3.select(this).attr("data-fill")})
				.style('fill-opacity', 1);
				self.animationController(settings, currentAnimation);
			}
		}else{
			popText = d3.select("#sampleReRandomised").selectAll("g").data(settings.sample);
			this.buildUpSlow(settings, currentAnimation, settings.buildListUpto, popText, Math.min(self.allPop.length, 40), self);
		}


	}

	fadeIn(settings, currentAnimation){
		let self = this;
		if(this.sampleStatType == "diff"){
			sharedProportionMultiBarFadeIn.apply(this, [settings, currentAnimation]);
		}else{
			sharedMultiArrowFadeIn.apply(this, [settings, currentAnimation]);
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

				d3.selectAll("#samp rect").transition().duration(this.transitionSpeed).style("opacity", 1);
				d3.selectAll("#samp text").transition().duration(this.transitionSpeed).style("opacity", 1)
				// sharedProportionMultiBarFadeInNoStat.apply(this, [settings, currentAnimation]);
			}else{
			d3.selectAll("#samp rect").style("opacity", 1);
			d3.selectAll("#samp text").style("opacity", 1)
			// sharedProportionMultiBarFadeInNoStat.apply(this, [settings, currentAnimation]);
			}
		}
	}


	distDrop(settings, currentAnimation){
		if(this.sampleStatType == "diff"){
			sharedDistDrop.apply(this, [settings, currentAnimation]);
		}else{
			sharedMultiCatDistDrop.apply(this, [settings, currentAnimation]);
		}
	}
	removeBar(settings, currentAnimation){
		if(settings.repititions > 500){
			d3.selectAll("#samp").remove();
		}
		this.animationController(settings, currentAnimation);
	}
}

