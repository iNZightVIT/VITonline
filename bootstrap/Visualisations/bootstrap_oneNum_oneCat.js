
class bootstrap_oneNum_oneCat extends visBase {
	constructor(inputData, headingGroup, headingContinuous, statistic) {
		super(inputData, headingGroup, headingContinuous, statistic);
		this.windowHelper = setUpWindow3({'left':5, 'right':5, 'top':5, 'bottom':5}, true);
		// text labels for each section.
		this.sectionLabels = ['Data','Re-Sample','Bootstrap Distribution'];
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
					var group = this.allPop[index].group;
					var groupIndex = this.groups.indexOf(group);
					var nI = new item (this.allPop[index].value, j);
					nI.popId = this.allPop[index].id;
					nI.popGroup = groupIndex;
					nI.xPerSample[0] =this.allPop[index].xPerSample[0];
					nI.yPerSample[0] =this.allPop[index].yPerSample[0];
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
					for(var j = 0; j < num_in_group; j++){
						var index = Math.ceil(Math.random()*group_pop_elements.length) - 1;
						var group = group_pop_elements[index].group;
						var groupIndex = this.groups.indexOf(group);
						var nI = new item (group_pop_elements[index].value, j);
						nI.popId = group_pop_elements[index].id;
						nI.popGroup = groupIndex;
						nI.xPerSample[0] =group_pop_elements[index].xPerSample[0];
						nI.yPerSample[0] =group_pop_elements[index].yPerSample[0];
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
		if(num == "10000"){
			CIVar = this.LargeCISplit;
		}
		var container = svg.append("svg").attr("id","CISplitContainer");

		var middle = this.windowHelper.graphSection.S1.displayArea.getMiddleHeight();
		var to = this.xScale(this.groupStats[this.groups[1]]);
		var from = this.xScale(this.groupStats[this.groups[0]]);
		var diff = to - from;
		var headSize = 10;
		if(Math.abs(diff) < headSize) headSize =Math.abs(diff)*0.5;
		if(diff != 0) {var arrowHead = diff / Math.abs(diff);} else { var arrowHead = 0;}
		let diff_col = this.groups.length < 3 ? "red" : "red";
		var arrow = drawArrow(this.xScale(this.groupStats[this.groups[1]]), this.xScale(this.groupStats[this.groups[0]]), middle, container, "CISplit", 1, diff_col);
		arrow[1].transition().duration(1000).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height- this.windowHelper.radius*2).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height + headSize*arrowHead/2 - this.windowHelper.radius*2).attr("x1",this.sampleStatScale(this.populationStatistic)).attr("x2", this.sampleStatScale(this.populationStatistic) - arrowHead*headSize);
		arrow[2].transition().duration(1000).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height- this.windowHelper.radius*2).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height - headSize*arrowHead/2 - this.windowHelper.radius*2).attr("x1",this.sampleStatScale(this.populationStatistic)).attr("x2", this.sampleStatScale(this.populationStatistic) - arrowHead*headSize);
		arrow[0].transition().duration(1000).attr("x1",this.sampleStatScale(0)).attr("x2",this.sampleStatScale(this.populationStatistic)).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height- this.windowHelper.radius*2).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height - this.windowHelper.radius*2)
			.transition().duration(500).each("end",function(){
				container.append("text").attr("x", self.sampleStatScale(self.populationStatistic)).attr("y", self.windowHelper.graphSection.S3.axisArea.y2).text(Math.round(self.populationStatistic*100)/100).style("stroke",diff_col).style("opacity",1).attr("dominant-baseline","hanging");
				container.append("line").attr("x1", self.sampleStatScale(self.populationStatistic)).attr("x2", self.sampleStatScale(self.populationStatistic)).attr("y1", self.windowHelper.graphSection.S3.displayArea.y2 - self.windowHelper.graphSection.S3.axisArea.height/2).attr("y2", self.windowHelper.graphSection.S3.axisArea.y2).style("stroke-width", 2).style("stroke", diff_col);

				var visibleCircles = d3.selectAll(".notInCI").filter(function(){
					return this.attributes["fill-opacity"].value == "1";
				});
				visibleCircles.style("opacity",0.2).transition().duration(500).each("end",function(d,i){
					if(i==0){
					drawArrowDown(self.windowHelper.graphSection.S3.axisArea.y2, self.windowHelper.graphSection.S3.displayArea.y2 - self.windowHelper.graphSection.S3.displayArea.height/2, self.sampleStatScale(CIVar[0]), container, "ciDownArrow", 1, "red",0.75);
					drawArrowDown(self.windowHelper.graphSection.S3.axisArea.y2, self.windowHelper.graphSection.S3.displayArea.y2 - self.windowHelper.graphSection.S3.displayArea.height/2, self.sampleStatScale(CIVar[1]), container, "ciDownArrow", 1, "red",0.75);
					//d3.select("#CISplit").append("line").attr("y1",self.windowHelper.section3.bottom - self.windowHelper.section3.height/4).attr("y2",self.windowHelper.section3.bottom + self.windowHelper.section3.height/10).attr("x1",self.xScale2(CIVar[0])).attr("x2",self.xScale2(CIVar[0])).style("stroke","red");
					//d3.select("#CISplit").append("line").attr("y1",self.windowHelper.section3.bottom - self.windowHelper.section3.height/4).attr("y2",self.windowHelper.section3.bottom + self.windowHelper.section3.height/10).attr("x1",self.xScale2(CIVar[1])).attr("x2",self.xScale2(CIVar[1])).style("stroke","red");
					container.append("text").attr("y",self.windowHelper.graphSection.S3.axisArea.y2).attr("x",self.sampleStatScale(CIVar[1])).text(Math.round((CIVar[1])*100)/100).style("stroke","red").style("fill", "red").style("font-size", 12).attr("dominant-baseline","hanging");
					container.append("text").attr("y",self.windowHelper.graphSection.S3.axisArea.y2).attr("x",self.sampleStatScale(CIVar[0])).text(Math.round((CIVar[0])*100)/100).style("stroke","red").style("fill", "red").style("font-size", 12).attr("dominant-baseline","hanging")
						.transition().duration(500).each("end",function(){
							container.append("line").attr("y1",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("x1",self.sampleStatScale(CIVar[0])).attr("x2",self.sampleStatScale(CIVar[1])).style("stroke","red").style("stroke-width",5);

						});
					}
				});
			})

	}
	setSampleStatistic(diff, categoryStatistics){
		if(this.groups.length <= 2){
			return this.sampleStatType == 'diff' ? diff : categoryStatistics[0];
		}else{
			var sum = 0;
			for(var g = 0; g < this.groups.length; g++){
				sum += Math.abs(categoryStatistics[g] - this.populationStatistics.population.statistic);
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
	drawPopulationStatistic(placeInto){
		if(this.sampleStatType == "diff"){
			var middle = this.windowHelper.graphSection.S1.displayArea.getMiddleHeight();
			drawArrow(this.xScale(this.groupStats[this.groups[1]]), this.xScale(this.groupStats[this.groups[0]]), middle, placeInto, "popDiff", 1, "red");
			placeInto.append("text").attr("x", this.xScale(this.groupStats[this.groups[1]])).attr("y", middle).text(Math.round((this.populationStatistic)*100)/100).style("stroke","red").style("opacity",1);
		}
	}
	drawPopExtra(placeInto){
		if(this.groups.length > 2){
			var stat = this.populationStatistics.population.statistic;
			placeInto.append("line").attr("x1", this.xScale(stat)).attr("x2", this.xScale(stat)).attr("y1", this.windowHelper.graphSection.S1.displayArea.y1).attr("y2", this.windowHelper.graphSection.S2.displayArea.y2).style("stroke", "black").style("stroke-width",1).attr("stroke-dasharray", "5,3");
			
			var divisions = this.windowHelper.graphSection.S1.displayArea.getDivisions(this.groups.length, 'height');
			var divSections = divisions[0];
			var divHeight = divisions[1];
			let diff_col = this.groups.length < 3 ? "red" : "blue";
			for(var g = 0; g < this.groups.length; g++){
				var pos = divSections[g] - divHeight/2 - this.windowHelper.radius*2;
				var groupName = this.groups[g];
				drawArrow(this.xScale(this.populationStatistics.groups[groupName].statistic), this.xScale(this.populationStatistics.population.statistic), pos, placeInto, "popArrow"+g, 1, diff_col);
			}
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

	cleanUpRepitition(){
		var self = this;
		d3.selectAll(".memLine").style("opacity",0.2).style("stroke","steelblue").attr("y2",function(){ return d3.select(this).attr("y1")-self.windowHelper.lineHeight*2});
		d3.selectAll("#diffLine").remove();
		d3.selectAll("#redlineMain").remove();
		
		d3.selectAll("#sampArrow").remove();
		for(var g = 0; g < this.groups.length; g++){
			d3.selectAll("#distArrow"+g).remove();
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
			this.buildUpSlow(settings, currentAnimation, 0, popText, Math.min(self.allPop.length, 40), self);
		}else{
			d3.select("#circleOverlay").selectAll("circle").attr("stroke-opacity", 1).attr("fill-opacity", 1);
			this.animationController(settings, currentAnimation);
		}


	}

	fadeIn(settings, currentAnimation){
		var self = this;
		if(this.sampleStatType == "diff"){
			sharedFadeIn.apply(this, [settings, currentAnimation]);
		}else{
			var sampMean = this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
			var stat = this.populationStatistics.population.statistic;			
			var divisions = this.windowHelper.graphSection.S2.displayArea.getDivisions(this.groups.length, 'height');
			var divSections = divisions[0];
			var divHeight = divisions[1];
			d3.selectAll("#sampArrow").remove();
			for(var g = 0; g < this.groups.length; g++){
				var pos = divSections[g] - divHeight/2 - this.windowHelper.radius*2;
				var groupName = this.groups[g];
				drawArrow(this.xScale(sampMean[0].stats[g]), this.xScale(this.populationStatistics.population.statistic), pos, d3.select(".meanOfSamples"), "sampArrow", 1, "darkgrey");
				d3.select(".meanOfSamples").append("line").attr("x1", this.xScale(sampMean[0].stats[g])).attr("x2", this.xScale(sampMean[0].stats[g])).attr("y1", pos+this.windowHelper.lineHeight).attr("y2", pos-this.windowHelper.lineHeight).style("stroke-width", 2).style("stroke", "black").style("stroke-width",3).attr("id", "sampArrow");

			}
			var circleOverlay = d3.select("#circleOverlay").selectAll("circle").transition().duration(this.transitionSpeed).each('end', function(d, i){
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

	}


	distDrop(settings, currentAnimation){
		var self = this;
		if(this.sampleStatType == "diff"){
			sharedDistDrop.apply(this, [settings, currentAnimation]);
		}else{
			// if(this.transitionSpeed > 200){
			// 	var sampMean = this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
			// 	var stat = this.populationStatistics.population.statistic;			
			// 	var divisions = this.windowHelper.graphSection.S2.displayArea.getDivisions(this.groups.length, 'height');
			// 	var divSections = divisions[0];
			// 	var divHeight = divisions[1];
			// 	for(var g = 0; g < this.groups.length; g++){
			// 		var pos = divSections[g] - divHeight/2 - this.windowHelper.radius*2;
			// 		var groupName = this.groups[g];
			// 		drawArrow(this.xScale(sampMean[0].stats[g]), this.xScale(this.populationStatistics.population.statistic), pos, d3.select(".meanOfSamples"), "distArrow"+g, 1, "darkgrey");
			// 		d3.select("#distArrow"+g+"a1").remove();
			// 		d3.select("#distArrow"+g+"a2").remove();
			// 		var subtractY = this.windowHelper.graphSection.S2.height - (divHeight/1.2 * g);
			// 		var subtractX = 0 - (this.xScale(sampMean[0].stats[g]) - this.xScale(this.populationStatistics.population.statistic))/2;
			// 		d3.select("#distArrow"+g).selectAll("*").transition().duration(this.transitionSpeed)
			// 			.attr("transform", "translate("+ subtractX +", " + subtractY +")").each("end", function(d, i){
			// 				var id = d3.select(this).attr("id");
			// 				if(id == "distArrow0main"){
			// 					var headSize = 7.5;
			// 					var toScaled = sampMean[0].value;
			// 					var diff = self.sampleStatScale(sampMean[0].value);
			// 					var yValue = self.windowHelper.graphSection.S3.displayArea.getMiddleHeight();
			// 					if(Math.abs(diff) < headSize) headSize =Math.abs(diff)*0.5;
			// 					if(diff != 0) {var arrowHead = diff / Math.abs(diff);} else { var arrowHead = 0;}

			// 					var arrow = drawArrow(self.xScale(self.populationStatistics.population.statistic + (sampMean[0].value)/2), self.xScale(self.populationStatistics.population.statistic - (sampMean[0].value)/2), self.windowHelper.graphSection.S3.displayArea.getDivisions(3, 'height')[1] + self.windowHelper.graphSection.S3.displayArea.y1, d3.select(".meanOfSamples"), "redlineMain", 1, "darkgrey");
			// 					arrow[1].transition().duration(self.transitionSpeed).attr("y1",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height- self.windowHelper.radius*2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height + headSize*arrowHead/2 - self.windowHelper.radius*2).attr("x1",self.sampleStatScale(toScaled)).attr("x2", self.sampleStatScale(toScaled) - arrowHead*headSize);
			// 					arrow[2].transition().duration(self.transitionSpeed).attr("y1",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height- self.windowHelper.radius*2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height - headSize*arrowHead/2 - self.windowHelper.radius*2).attr("x1",self.sampleStatScale(toScaled)).attr("x2", self.sampleStatScale(toScaled) - arrowHead*headSize);
			// 					arrow[0].transition().duration(self.transitionSpeed).attr("x1",self.sampleStatScale(0)).attr("x2",self.sampleStatScale(toScaled)).attr("y1",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height- self.windowHelper.radius*2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height - self.windowHelper.radius*2);

			// 					sharedDistDropNoArrow.apply(self, [settings, currentAnimation]);
			// 				}
			// 			});

			// 	}
			// }else{
			// 	sharedDistDropNoArrow.apply(this, [settings, currentAnimation]);
			// }
			sharedMultiCatDistDrop.apply(this, [settings, currentAnimation])
		}
	}
}

