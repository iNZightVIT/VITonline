
class samp_twoCat extends visBase {
	constructor(inputData, headingGroup, headingContinuous, statistic, focus) {
		super(inputData, headingGroup, headingContinuous, statistic, focus);
		this.windowHelper = setUpWindow3({'left':5, 'right':5, 'top':5, 'bottom':5}, false);
		this.sampleStatType = "diff";
		this.popDrawType = 1;
		this.calcLargeCI = true;
        this.valueAllowCategorical = true;
        this.includeSampleSection = false;
        this.sampleSize = 40;
		// text labels for each section.
		this.sectionLabels = ['Data','Sample','Sampling Distribution'];
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

	getSampleSize(sampleSize){
        this.sampleSize = parseInt(sampleSize ? sampleSize : this.sampleSize);
		return parseInt(this.sampleSize);
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

	makeSample(populations, numSamples, sampleSize, statistic, saveSample){
		this.samples = [];
		for(var i = 0; i<numSamples;i++){
			let sample = []
			// this.samples.push([]);
			for(var g = 0; g < this.groups.length; g++){
				sample.push([]);
			}
            var stats = [];
            let indexes = pickRand(sampleSize, this.allPop.length);
			for(var j = 0; j < sampleSize;j++){
				var index =indexes[j];
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


	// *****************************ANIMATIONS********************************

	populationDropDown(settings, currentAnimation){
		var self = this;

		// Delete Old elements
		d3.select("#circleOverlay").selectAll("circle").data([]).exit().remove();
		var circleOverlay = settings.drawArea.select("#circleOverlay").selectAll("g").data([]);
		circleOverlay.exit().remove();

		var self = this;
		sharedProportionMultiBarFadeInNoExitNoStatsHidden.apply(this, [settings, currentAnimation]);

		matchPropBars.apply(this, [[0, 1], true]);

		let sample_circles = d3.selectAll("#samp circle")[0];
		for(let sc = 0; sc < sample_circles.length; sc++){
			let samp_circ = d3.select(sample_circles[sc]);
			samp_circ.attr("cx", samp_circ.attr("data-px"));
			samp_circ.attr("cy", samp_circ.attr("data-py"));
			samp_circ.style("fill", samp_circ.attr("data-pfill"));
			samp_circ.attr("r", samp_circ.attr("data-pr"));
			samp_circ.style("opacity", 0.2);
			samp_circ.style("fill-opacity", 1);
        }
        d3.selectAll(".pop circle").style("opacity", 0.2);

	    this.animationController(settings, currentAnimation);
	}
	buildUpSlow(settings, currentAnimation, upto, max, self, seen){
        let sample_circles = d3.selectAll("#samp circle")[0];
        let pop_id = "";
        let id = "";
		for(let sc = 0; sc < sample_circles.length; sc++){
			let samp_circ = d3.select(sample_circles[sc]);
			id = samp_circ[0][0].id;
			let primary_category = id.split('---')[1];
			let secondary_category = id.split('---').slice(2, id.split('---').length - 1).join('---').replace(/\W/g,'');
			let id_values = id.split('---');
			if(seen.includes(id)) continue;
			let primary_category_name = [...self.valueCategories][settings.sample[upto].value].replace(/ /g,'');
			if((settings.sample[upto].group.replace(/\W/g,'') == secondary_category) && (primary_category_name == primary_category)){
                pop_id = samp_circ.attr("data-id");
				samp_circ.attr("cy", function(){
					return d3.select(this).attr("data-cy");
				}).attr("r", function(){
					return d3.select(this).attr("data-r");
				}).attr("cx", function(){
					return d3.select(this).attr("data-cx");
				// }).transition().duration(500/settings.repititions).attr("fill-opacity", 1);
				}).style("fill", function(){
					return d3.select(this).attr("data-fill");
				}).attr("fill-opacity", 1).style("opacity", 1);
				seen.push(id);
				break;
			}
			console.log(settings.sample[upto]);
        }
        if(upto >= max){
			this.animationController(settings, currentAnimation);
			return;
		}
        if(pop_id == ""){

            this.animationController(settings, currentAnimation);
			return;
        }
        console.log(pop_id);
        console.log(d3.selectAll("#samp #"+id));
        console.log(d3.selectAll(".pop #"+pop_id));
		d3.selectAll("#samp #"+id).attr("stroke-opacity", 1).attr("fill-opacity", 1).transition().duration(500/settings.repititions).each('end', function(d, i){
			if(i == 0){
				settings.buildListUpto = upto+1;
				self.buildUpSlow(settings, currentAnimation, upto+1, max, self, seen);
			}
		});
		d3.selectAll(".pop #"+pop_id).style("opacity", 1);




	}
	buildList(settings, currentAnimation){
		var self = this;
		if(!settings.restarting){
			order(settings.sample);
			var goSlow = (settings.repititions == 1 || settings.repititions == 5) && !settings.incDist;
			var i = this.upTo;
			if(goSlow){
                self.buildupMem = [];
				this.buildUpSlow(settings, currentAnimation, 0, self.sampleSize, self, self.buildupMem);
			}else{
                let sample_circles = d3.selectAll("#samp circle");
				sample_circles.attr('cy', function(){return d3.select(this).attr("data-cy")})
				.attr('cx', function(){return d3.select(this).attr("data-cx")})
				.attr('r', function(){return d3.select(this).attr("data-r")})
				.style('fill', function(){return d3.select(this).attr("data-fill")})
                .style('fill-opacity', 1);
                
                for(let sc = 0; sc < sample_circles[0].length; sc++){
                    let samp_circ = d3.select(sample_circles[0][sc]);
                    let pop_id = samp_circ.attr("data-id");
                    d3.selectAll(".pop #"+pop_id).style("opacity", 1);
                }

				self.animationController(settings, currentAnimation);
			}
		}else{
			this.buildUpSlow(settings, currentAnimation, settings.buildListUpto, self.sampleSize, self, self.buildupMem);
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

