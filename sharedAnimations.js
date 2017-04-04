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