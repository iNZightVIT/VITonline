	matchPropBars = function(m_index = [0], random = false){
		let circles = d3.selectAll(".pop circle")[0];
		let sample_circles = d3.selectAll("#samp circle")[0];
		let matched_population_circles = [];
		for(let sc = 0; sc < sample_circles.length; sc++){
			let my_id = sample_circles[sc].id;
			let primary_category = my_id.split('---')[1];
			let secondary_category = my_id.split('---').slice(2, my_id.split('---').length - 1).join('---');
			id_values = [primary_category, secondary_category];

			let match_on_index = m_index;
			let matched = [];
			for(let c = 0; c < circles.length; c++){
				let match_id = circles[c].id;
				if(matched_population_circles.includes(match_id)) continue;
				let match_primary_category = match_id.split('---')[1];
				let match_secondary_category = match_id.split('---').slice(2, match_id.split('---').length - 1).join('---');
				match_id_values = [match_primary_category, match_secondary_category];
				let match = true;
				for (let m of match_on_index){
					if(id_values[m] != match_id_values[m]) match = false;
				}
				
				if(match){
					let pop_circ = d3.select(circles[c]);
					if(!random){
						matched_population_circles.push(match_id);
						let samp_circ = d3.select(sample_circles[sc]);
						
						samp_circ.attr("data-id", pop_circ.attr("id"));
						samp_circ.attr("data-px", pop_circ.attr("data-cx"));
						samp_circ.attr("data-py", pop_circ.attr("data-cy"));
						samp_circ.attr("data-pfill", pop_circ.attr("data-fill"));
						samp_circ.attr("data-pr", pop_circ.attr("data-r"));
						break;
					}else{
						matched.push(pop_circ)
					}
				}
			}
			if(random){
				let rand_id = Math.floor(Math.random() * matched.length);
				let pop_circ = matched[rand_id];
				if(pop_circ == undefined){
					console.log("no match");
				}
				matched_population_circles.push(pop_circ.attr("id"));
				let samp_circ = d3.select(sample_circles[sc]);
				samp_circ.attr("data-id", pop_circ.attr("id"));
				samp_circ.attr("data-px", pop_circ.attr("data-cx"));
				samp_circ.attr("data-py", pop_circ.attr("data-cy"));
				samp_circ.attr("data-pfill", pop_circ.attr("data-fill"));
				samp_circ.attr("data-pr", pop_circ.attr("data-r"));
			}
		}
	}
	
	showDifference = function( sampMean){
		if(this.sampleStatType != "diff"){
			return;
		}
		var self = this;
		var middle = this.windowHelper.graphSection.S2.displayArea.getMiddleHeight();
		if(this.drawnMeans.length > 0){
			var mLines = d3.select(".sampleLines").selectAll("g").data(this.drawnMeans);
			var meanLineG = mLines.enter().append("g");
			meanLineG.append("line").attr("class","memLine").attr("x1", function(d){return self.xScale(d.stats[0]);}).attr("x2", function(d){return self.xScale(d.stats[0]);}).attr("y1", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][0] + this.windowHelper.lineHeight*3).attr("y2", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][0] - this.windowHelper.lineHeight).style("stroke-width", 3).style("stroke", "black").style("opacity",1);
			meanLineG.append("line").attr("class","memLine").attr("x1", function(d){return self.xScale(d.stats[1]);}).attr("x2", function(d){return self.xScale(d.stats[1]);}).attr("y1", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][2] + this.windowHelper.lineHeight*3).attr("y2", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][2] - this.windowHelper.lineHeight).style("stroke-width", 3).style("stroke", "black").style("opacity",1);
		
			d3.selectAll(".memLine").style("opacity",0.2).style("stroke","darkgrey").attr("y2", function(){ return d3.select(this).attr("y1")-self.windowHelper.lineHeight*2});
			d3.selectAll("#diffLine").remove();
		}
		this.drawnMeans.push(sampMean[0]);
		mLines = d3.select(".sampleLines").selectAll("g").data(this.drawnMeans);
		meanLineG = mLines.enter().append("g");
		meanLineG.append("line").attr("class","memLine").attr("x1", function(d){return self.xScale(d.stats[0]);}).attr("x2", function(d){return self.xScale(d.stats[0]);}).attr("y1", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][0] + this.windowHelper.lineHeight*3).attr("y2", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][0] - this.windowHelper.lineHeight).style("stroke-width", 3).style("stroke", "black").style("opacity",1);
		meanLineG.append("line").attr("class","memLine").attr("x1", function(d){return self.xScale(d.stats[1]);}).attr("x2", function(d){return self.xScale(d.stats[1]);}).attr("y1", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][2] + this.windowHelper.lineHeight*3).attr("y2", this.windowHelper.graphSection.S2.displayArea.getDivisions(4,'height')[0][2] - this.windowHelper.lineHeight).style("stroke-width", 3).style("stroke", "black").style("opacity",1);
		drawArrow(function(d){return self.xScale(d.stats[1]);},function(d){return self.xScale(d.stats[0]);},middle, meanLineG, "diffLine", 1, "darkgrey");
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
		
			d3.selectAll(".memLine").style("opacity",0.2).style("stroke","darkgrey").attr("y2", function(){ return d3.select(this).attr("y1")-self.windowHelper.lineHeight*2});
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
				var arrow = drawArrow(self.xScale(sampMean[0].stats[1]), self.xScale(sampMean[0].stats[0]), middle, redLine, "redlineMain", 1, "darkgrey");
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
			meanCircles = meanCircles.transition().delay(this.transitionSpeed).attr("fill-opacity",1).attr("stroke-opacity",1).attr("cy", function(d){return d.yPerSample[0]}).each('end', function(d, i){
				if(!sentFinish){
					self.animationController(settings, currentAnimation);
					sentFinish = true;
				}
			});
		}else{
			meanCircles = meanCircles.attr("fill-opacity",1).attr("stroke-opacity",1).attr("cy", function(d){return d.yPerSample[0]});
				self.animationController(settings, currentAnimation);
		}
	}


	sharedMultiCatDistDrop = function(settings, currentAnimation){
		if(this.transitionSpeed > 200){
			let self = this;
			var sampMean = this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
			var stat = this.populationStatistics.population.statistic;			
			var divisions = this.windowHelper.graphSection.S2.displayArea.getDivisions(this.groups.length, 'height');
			var divSections = divisions[0];
			var divHeight = divisions[1];
			for(var g = 0; g < this.groups.length; g++){
				var pos = divSections[g] - divHeight/2 - this.windowHelper.radius*2;
				var groupName = this.groups[g];
				drawArrow(this.xScale(sampMean[0].stats[g]), this.xScale(stat), pos, d3.select(".meanOfSamples"), "distArrow"+g, 1, "darkgrey");
				d3.select("#distArrow"+g+"a1").remove();
				d3.select("#distArrow"+g+"a2").remove();
				var subtractY = this.windowHelper.graphSection.S2.height - (divHeight/1.2 * g);
				// var subtractX = 0 - (this.xScale(sampMean[0].stats[g]) - this.xScale(stat))/2;
				var subtractX = Math.max(0 - (this.xScale(sampMean[0].stats[g]) - this.xScale(stat)), 0);
				d3.select("#distArrow"+g).selectAll("*").transition().duration(this.transitionSpeed)
					.attr("transform", "translate("+ subtractX +", " + subtractY +")").each("end", function(d, i){
						var id = d3.select(this).attr("id");
						if(id == "distArrow0main"){
							var headSize = 7.5;
							var toScaled = sampMean[0].value;
							var diff = self.sampleStatScale(sampMean[0].value);
							var yValue = self.windowHelper.graphSection.S3.displayArea.getMiddleHeight();
							if(Math.abs(diff) < headSize) headSize =Math.abs(diff)*0.5;
							if(diff != 0) {var arrowHead = diff / Math.abs(diff);} else { var arrowHead = 0;}

							// var arrow = drawArrow(self.xScale(stat + (sampMean[0].value)/2), self.xScale(stat - (sampMean[0].value)/2), self.windowHelper.graphSection.S3.displayArea.getDivisions(3, 'height')[1] + self.windowHelper.graphSection.S3.displayArea.y1, d3.select(".meanOfSamples"), "redlineMain", 1, "darkgrey");
							var arrow = drawArrow(self.xScale(stat + (sampMean[0].value)), self.xScale(stat), self.windowHelper.graphSection.S3.displayArea.getDivisions(3, 'height')[1] + self.windowHelper.graphSection.S3.displayArea.y1, d3.select(".meanOfSamples"), "redlineMain", 1, "darkgrey");
							arrow[1].transition().duration(self.transitionSpeed).attr("y1",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height- self.windowHelper.radius*2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height + headSize*arrowHead/2 - self.windowHelper.radius*2).attr("x1",self.sampleStatScale(toScaled)).attr("x2", self.sampleStatScale(toScaled) - arrowHead*headSize);
							arrow[2].transition().duration(self.transitionSpeed).attr("y1",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height- self.windowHelper.radius*2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height - headSize*arrowHead/2 - self.windowHelper.radius*2).attr("x1",self.sampleStatScale(toScaled)).attr("x2", self.sampleStatScale(toScaled) - arrowHead*headSize);
							arrow[0].transition().duration(self.transitionSpeed).attr("x1",self.sampleStatScale(0)).attr("x2",self.sampleStatScale(toScaled)).attr("y1",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height- self.windowHelper.radius*2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y + self.windowHelper.graphSection.S3.displayArea.height - self.windowHelper.radius*2);

							sharedDistDropNoArrow.apply(self, [settings, currentAnimation]);
						}
					});

			}
		}else{
			sharedDistDropNoArrow.apply(this, [settings, currentAnimation]);
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
			meanCircles = meanCircles.transition().delay(this.transitionSpeed).attr("fill-opacity",1).attr("stroke-opacity",1).attr("cy", function(d){return d.yPerSample[0]}).each('end', function(d, i){
				self.animationController(settings, currentAnimation);
			});
		}else{
			meanCircles = meanCircles.attr("fill-opacity",1).attr("stroke-opacity",1).attr("cy", function(d){return d.yPerSample[0]});
				self.animationController(settings, currentAnimation);
		}
	}
	sharedDistDropNoArrow = function(settings, currentAnimation){
		var self = this;
		var sentFinish = false;
		if(!settings.restarting){
			d3.select(".meanOfSamples").selectAll("g").remove();

			var sampMean = this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
			var meanCircles = d3.select("#sampleDisplay").selectAll("circle").filter(function(d, i){
				return (i>=settings.indexUpTo) && (i <settings.indexUpTo+settings.jumps);
			});

			this.settings.sampMean = sampMean;
			this.settings.meanCircles = meanCircles;
		}else{
			var sampMean = this.settings.sampMean? this.settings.sampMean :this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
			var meanCircles = this.settings.meanCircles ? this.settings.meanCircles : d3.select("#sampleDisplay").selectAll("circle").filter(function(d, i){
				return (i>=settings.indexUpTo) && (i <settings.indexUpTo+settings.jumps);
			});

			this.settings.restarting = false;
		}

		if(settings.goSlow || this.transitionSpeed == 500){
			meanCircles = meanCircles.transition().delay(this.transitionSpeed).attr("fill-opacity",1).attr("stroke-opacity",1).attr("cy", function(d){return d.yPerSample[0]}).each('end', function(d, i){
				if(!sentFinish){
					self.animationController(settings, currentAnimation);
					sentFinish = true;
				}
			});
		}else{
			meanCircles = meanCircles.attr("fill-opacity",1).attr("stroke-opacity",1).attr("cy", function(d){return d.yPerSample[0]});
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

	sharedSingleFadeIn = function(settings, currentAnimation){
		var self = this;
		showSingleStat.apply(this, [this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps)]);
		var circleOverlay = d3.select("#circleOverlay").selectAll("circle").transition().duration(this.transitionSpeed).each('end', function(d, i){
			if(i == 0){
				if(settings.incDist){
					self.animationController(settings, currentAnimation);
				}else{
					d3.select("#differenceLine").remove();
					self.animationController(settings, currentAnimation);
				}
			}
		});
	}

	sharedMultiArrowFadeIn = function (settings, currentAnimation){
		var self = this;
		var sampMean = this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
		var stat = this.populationStatistics.population.statistic;			
		var divisions = this.windowHelper.graphSection.S2.displayArea.getDivisions(this.groups.length, 'height');
		var divSections = divisions[0];
		var divHeight = divisions[1];
		d3.selectAll("#sampArrow").remove();
		for(var g = 0; g < this.groups.length; g++){
			var pos = divSections[g] - divHeight/2 - this.windowHelper.radius*2;
			var groupName = this.groups[g];
			drawArrow(this.xScale(sampMean[0].stats[g]), this.xScale(stat), pos, d3.select(".meanOfSamples"), "sampArrow", 1, "darkgrey");
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

	sharedProportionBarFadeInNoExitNoStats = function(settings, currentAnimation){
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
	}
	sharedProportionBarFadeInNoExitNoStatsHidden = function(settings, currentAnimation){
		sharedProportionBarFadeInNoExitNoStats.apply(this, [settings, currentAnimation]);
		d3.selectAll("#samp circle").style("opacity", 0);
		d3.selectAll("#samp rect").style("opacity", 0);
		d3.selectAll("#samp text").style("opacity", 0);
	}
	sharedProportionBarFadeInNoExit = function(settings, currentAnimation){
		sharedProportionBarFadeInNoExitNoStats.apply(this, [settings, currentAnimation]);
		var sampMean = this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);
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

	sharedProportionMultiBarFadeInNoExitNoStats = function(settings, currentAnimation){
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

		// Draw Bars
		var numDivisions = this.sampleGroups.length;
		var divisions = this.windowHelper.graphSection.S2.displayArea.getDivisions(numDivisions, 'height');
		var divSections = divisions[0];
		var divHeight = divisions[1];
		for(var i = 0;i<numDivisions;i++){
			var pos = divSections[i] - divHeight/2 - this.windowHelper.radius*2;
			var catSVG = d3.select("#samples").append("g").attr("id","samp");

			// Now split on main categories. We want a category for the focus and one for other.
			var focusGroup = settings.sample.filter(function(x){return x.value == 0 && x.group == self.sampleGroups[i]});
			var otherGroup = settings.sample.filter(function(x){return x.value != 0 && x.group == self.sampleGroups[i]});

			this.drawProportionBars(catSVG, divHeight, pos, self.xScale, focusGroup, otherGroup, this.sampleGroups[i], i, [...this.valueCategories]);
		}
	}

	sharedProportionMultiBarFadeInNoExitNoStatsHidden = function(settings, currentAnimation){
		sharedProportionMultiBarFadeInNoExitNoStats.apply(this, [settings, currentAnimation]);
		d3.selectAll("#samp circle").style("opacity", 0);
		d3.selectAll("#samp rect").style("opacity", 0);
		d3.selectAll("#samp text").style("opacity", 0);
	}

	sharedProportionMultiBarFadeInNoExit = function(settings, currentAnimation){
		
		sharedProportionMultiBarFadeInNoExitNoStats.apply(this, [settings, currentAnimation]);
		var sampMean = this.sampleStatistics.slice(settings.indexUpTo, settings.indexUpTo+settings.jumps);

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
	sharedProportionMultiBarFadeInNoStat = function(settings, currentAnimation){
		var self = this;
		sharedProportionMultiBarFadeInNoExitNoStats.apply(this, [settings, currentAnimation]);
		var circleOverlay = d3.select("circle").transition().duration(settings.incDist ? this.transitionSpeed*1 : this.transitionSpeed*3).each('end', function(d, i){
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
			let diff_col = this.groups.length < 3 ? "red" : "red";
			var arrow = drawArrow(this.xScale(this.groupStats[this.groups[1]]), this.xScale(this.groupStats[this.groups[0]]), middle, svg, "CISplit", 1, diff_col);
			arrow[1].transition().duration(2000).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height + 7.5).attr("x1",this.sampleStatScale(this.populationStatistic)).attr("x2", this.sampleStatScale(this.populationStatistic) - 10);
			arrow[2].transition().duration(2000).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height - 7.5).attr("x1",this.sampleStatScale(this.populationStatistic)).attr("x2", this.sampleStatScale(this.populationStatistic) - 10);
			arrow[0].transition().duration(2000).attr("x1",this.sampleStatScale(0)).attr("x2",this.sampleStatScale(this.populationStatistic)).attr("y1",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height).attr("y2",this.windowHelper.graphSection.S3.displayArea.y + this.windowHelper.graphSection.S3.displayArea.height)
				.transition().duration(500).each("end",completed);
	}