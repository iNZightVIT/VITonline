	showDifference = function( sampMean){
		var self = this;
		var middle = this.windowHelper.graphSection.S2.displayArea.getMiddleHeight();
		if(this.drawnMeans.length > 0){
			var mLines = d3.select(".sampleLines").selectAll("g").data(this.drawnMeans);
			var meanLineG = mLines.enter().append("g");
			meanLineG.append("line").attr("class","memLine").attr("x1", function(d){return self.xScale(d.stats[0]);}).attr("x2", function(d){return self.xScale(d.stats[0]);}).attr("y1", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][0] + this.windowHelper.lineHeight*3).attr("y2", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][0] - this.windowHelper.lineHeight).style("stroke-width", 3).style("stroke", "black").style("opacity",1);
			meanLineG.append("line").attr("class","memLine").attr("x1", function(d){return self.xScale(d.stats[1]);}).attr("x2", function(d){return self.xScale(d.stats[1]);}).attr("y1", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][2] + this.windowHelper.lineHeight*3).attr("y2", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][2] - this.windowHelper.lineHeight).style("stroke-width", 3).style("stroke", "black").style("opacity",1);
		
			d3.selectAll(".memLine").style("opacity",0.2).style("stroke","steelblue").attr("y2",function(){ return d3.select(this).attr("y1")-self.windowHelper.lineHeight*2});;
			d3.selectAll("#diffLine").remove();
		}
		this.drawnMeans.push(sampMean[0]);
		mLines = d3.select(".sampleLines").selectAll("g").data(this.drawnMeans);
		meanLineG = mLines.enter().append("g");
		meanLineG.append("line").attr("class","memLine").attr("x1", function(d){return self.xScale(d.stats[0]);}).attr("x2", function(d){return self.xScale(d.stats[0]);}).attr("y1", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][0] + this.windowHelper.lineHeight*3).attr("y2", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][0] - this.windowHelper.lineHeight).style("stroke-width", 3).style("stroke", "black").style("opacity",1);
		meanLineG.append("line").attr("class","memLine").attr("x1", function(d){return self.xScale(d.stats[1]);}).attr("x2", function(d){return self.xScale(d.stats[1]);}).attr("y1", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][2] + this.windowHelper.lineHeight*3).attr("y2", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][2] - this.windowHelper.lineHeight).style("stroke-width", 3).style("stroke", "black").style("opacity",1);
		drawArrow(function(d){return self.xScale(d.stats[1]);},function(d){return self.xScale(d.stats[0]);},middle, meanLineG, "diffLine", 1, "red");
	}

	showSingleStat = function(sampMean){
		var self = this;
		var middle = this.windowHelper.graphSection.S2.displayArea.getMiddleHeight();
		var divHeight = this.windowHelper.graphSection.S2.displayArea.height;
		var divSections = [this.windowHelper.graphSection.S2.displayArea.y2];
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
	}
	sharedDistDrop = function(settings, currentAnimation){
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

	sharedSingleStatDistDrop = function(settings, currentAnimation){
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

	sharedFadeInNoExit = function(settings, currentAnimation){
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
		for(var k = 1;k<sampMean.length;k++){
			this.drawnMeans.push(sampMean[k]);
		}
		showDifference.apply(this, [sampMean]);
	}
	sharedFadeIn = function(settings, currentAnimation){
		var self = this;
		sharedFadeInNoExit.apply(this, [settings, currentAnimation]);
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

	sharedProportionBarFadeInNoExit = function(settings, currentAnimation){
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
			var focusGroup = allInSample.filter(function(x){return x.value == 0});
			var otherGroup = allInSample.filter(function(x){return x.value != 0});

			this.drawProportionBars(catSVG, divHeight, pos, self.xScale, focusGroup, otherGroup, "", 0, [...this.valueCategories]);
		}

		showSingleStat.apply(this, [sampMean]);
	}

	sharedProportionBarFadeIn = function(settings, currentAnimation){
		var self = this;
		sharedProportionBarFadeInNoExit.apply(this, [settings, currentAnimation]);
		var circleOverlay = d3.select(".memLine").transition().duration(settings.incDist ? this.transitionSpeed*1 : this.transitionSpeed*3).each('end', function(d, i){
			if(settings.incDist){
				self.animationController(settings, currentAnimation);
			}else{
				d3.select("#differenceLine").remove();
				self.animationController(settings, currentAnimation);
			}
		});
	}

	sharedProportionMultiBarFadeInNoExit = function(settings, currentAnimation){
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
		var numDivisions = this.groups.length;
		var divisions = this.windowHelper.graphSection.S2.displayArea.getDivisions(numDivisions, 'height');
		var divSections = divisions[0];
		var divHeight = divisions[1];
		for(var i = 0;i<numDivisions;i++){
			var pos = divSections[i] - divHeight/2 - this.windowHelper.radius*2;
			var catSVG = d3.select("#samples").append("g").attr("id","samp");

			// Now split on main categories. We want a category for the focus and one for other.
			var focusGroup = settings.sample.filter(function(x){return x.value == 0 && x.group == self.groups[i]});
			var otherGroup = settings.sample.filter(function(x){return x.value != 0 && x.group == self.groups[i]});

			this.drawProportionBars(catSVG, divHeight, pos, self.xScale, focusGroup, otherGroup, this.groups[i], i, [...this.valueCategories]);
		}

		showDifference.apply(this, [sampMean]);
	}

	sharedProportionMultiBarFadeIn = function(settings, currentAnimation){
		var self = this;
		sharedProportionMultiBarFadeInNoExit.apply(this, [settings, currentAnimation]);
		var circleOverlay = d3.select(".memLine").transition().duration(settings.incDist ? this.transitionSpeed*1 : this.transitionSpeed*3).each('end', function(d, i){
			if(settings.incDist){
				self.animationController(settings, currentAnimation);
			}else{
				d3.select("#differenceLine").remove();
				self.animationController(settings, currentAnimation);
			}
		});
	}

	//************************************************************************************************
	// CI ANIMATIONS
	//************************************************************************************************

	CIDifferenceArrow = function(completed){
			var svg = d3.select(".svg");
			var middle = this.windowHelper.graphSection.S1.displayArea.getMiddleHeight();
			var to = this.xScale(this.sampleStatistics[0].stats[1]);
			var from = this.xScale(this.sampleStatistics[0].stats[0]);
			var diff = to - from;
			var headSize = 10;
			if(Math.abs(diff) < headSize) headSize =Math.abs(diff)*0.5;
			if(diff != 0) {var arrowHead = diff / Math.abs(diff);} else { var arrowHead = 0;}
			var arrow = drawArrow(this.xScale(this.groupStats[this.groups[1]]), this.xScale(this.groupStats[this.groups[0]]), middle, svg, "CISplit", 1, "blue");
			arrow[1].transition().duration(2000).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height + 7.5).attr("x1",this.sampleStatScale(this.populationStatistic)).attr("x2", this.sampleStatScale(this.populationStatistic) - 10);
			arrow[2].transition().duration(2000).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height - 7.5).attr("x1",this.sampleStatScale(this.populationStatistic)).attr("x2", this.sampleStatScale(this.populationStatistic) - 10);
			arrow[0].transition().duration(2000).attr("x1",this.sampleStatScale(0)).attr("x2",this.sampleStatScale(this.populationStatistic)).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height)
				.transition().duration(500).each("end",completed);
	}