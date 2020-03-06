
class bootstrap_oneNum extends visBase {
	constructor(inputData, headingGroup, headingContinuous, statistic) {
		super(inputData, headingGroup, headingContinuous, statistic);
		this.windowHelper = setUpWindow3({'left':5, 'right':5, 'top':5, 'bottom':5}, true);
		// text labels for each section.
        this.sectionLabels = ['Data','Re-Sample','Bootstrap Distribution'];
        this.sampleStatType = 'value';
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
	makeSample(populations, numSamples, sampleSize, statistic, saveSample){
		this.samples = [];
		let sample = [];
		for(var i = 0; i<numSamples;i++){
			// this.samples.push([[]]);
			let sample = [[]];
			var stats = [];
			
			for(var j = 0; j < sampleSize;j++){
				var index = Math.ceil(Math.random()*this.allPop.length) - 1;
				let itemSelected = this.allPop[index];
				var nI = new item (itemSelected.value, itemSelected.id);
				nI.xPerSample[0] =this.allPop[index].xPerSample[0];
				nI.yPerSample[0] =this.allPop[index].yPerSample[0];
				sample[0].push(nI);
				nI.order = j;
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
		placeInto.append("text").text(this.headingContinuous).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width * (2/4)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");
		// placeInto.append("text").text(this.headingGroup).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");
		var popTextG = placeInto.selectAll("g").data(this.allPop).enter().append("g");
		popTextG.append("text").text(function(d){return d.value}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width * (2/4)).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").attr("text-anchor","middle");
		// popTextG.append("text").text(function(d){return d.group}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",function(d,i){return i < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", function(d){return colorByIndex[self.groups.indexOf(d.group)]}).attr("text-anchor","middle");

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

        container.append("text").attr("x", self.sampleStatScale(self.populationStatistic)).attr("y", self.windowHelper.graphSection.S3.axisArea.y2).text(Math.round(self.populationStatistic*100)/100).style("stroke","red").style("opacity",1).attr("dominant-baseline","hanging");
        container.append("line").attr("x1", self.sampleStatScale(self.populationStatistic)).attr("x2", self.sampleStatScale(self.populationStatistic)).attr("y1", self.windowHelper.graphSection.S3.displayArea.y2 - self.windowHelper.graphSection.S3.axisArea.height/2).attr("y2", self.windowHelper.graphSection.S3.axisArea.y2).style("stroke-width", 2).style("stroke", "red");

        var visibleCircles = d3.selectAll(".notInCI").filter(function(){
            return this.attributes["fill-opacity"].value == "1";
        });
        visibleCircles.style("opacity",0.2).transition().duration(500).each("end",function(d,i){
            if(i==0){
            drawArrowDown(self.windowHelper.graphSection.S3.axisArea.y2, self.windowHelper.graphSection.S3.displayArea.y2 - self.windowHelper.graphSection.S3.displayArea.height/2, self.sampleStatScale(CIVar[0]), container, "ciDownArrow", 1, "red",0.75);
            drawArrowDown(self.windowHelper.graphSection.S3.axisArea.y2, self.windowHelper.graphSection.S3.displayArea.y2 - self.windowHelper.graphSection.S3.displayArea.height/2, self.sampleStatScale(CIVar[1]), container, "ciDownArrow", 1, "red",0.75);
            //d3.select("#CISplit").append("line").attr("y1",self.windowHelper.section3.bottom - self.windowHelper.section3.height/4).attr("y2",self.windowHelper.section3.bottom + self.windowHelper.section3.height/10).attr("x1",self.xScale2(self.populationStatistic-self.CISplit)).attr("x2",self.xScale2(self.populationStatistic-self.CISplit)).style("stroke","red");
            //d3.select("#CISplit").append("line").attr("y1",self.windowHelper.section3.bottom - self.windowHelper.section3.height/4).attr("y2",self.windowHelper.section3.bottom + self.windowHelper.section3.height/10).attr("x1",self.xScale2(self.populationStatistic+self.CISplit)).attr("x2",self.xScale2(self.populationStatistic+self.CISplit)).style("stroke","red");
            container.append("text").attr("y",self.windowHelper.graphSection.S3.axisArea.y2).attr("x",self.sampleStatScale(CIVar[1])).text(Math.round((self.CISplit[1])*100)/100).style("stroke","red").style("fill", "red").style("font-size", 12).attr("dominant-baseline","hanging");
            container.append("text").attr("y",self.windowHelper.graphSection.S3.axisArea.y2).attr("x",self.sampleStatScale(CIVar[0])).text(Math.round((self.CISplit[0])*100)/100).style("stroke","red").style("fill", "red").style("font-size", 12).attr("dominant-baseline","hanging")
                .transition().duration(500).each("end",function(){
                    container.append("line").attr("y1",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("y2",self.windowHelper.graphSection.S3.displayArea.y1 + self.windowHelper.graphSection.S3.displayArea.height/2).attr("x1",self.sampleStatScale(self.CISplit[0])).attr("x2",self.sampleStatScale(self.CISplit[1])).style("stroke","red").style("stroke-width",5);

                });
            }
        });


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
		this.showSteps = false;
		if(settings.repititions == 1 && !settings.incDist) {
			this.showSteps = d3.select("#trackCBox").property("checked");
		}
        for (let s of settings.sample){
            s.upTo = settings.indexUpTo + 1;
        }
		// Delete Old elements
		d3.select("#circleOverlay").selectAll("circle").data([]).exit().remove();
		var circleOverlay = settings.drawArea.select("#circleOverlay").selectAll("g").data([]);
		circleOverlay.exit().remove();

		// Add new elements in, appear on top of original population.
		circleOverlay = settings.drawArea.select("#circleOverlay").selectAll("circle").data(settings.sample, function(d){return d.order});
		var circles = circleOverlay.enter().append("circle");
		circles.attr("class", "move")
	    .attr("cx", function(d, i) { 
	    	return d.xPerSample[d.upTo]; })
	    .attr("cy", function(d) {
	    	return d.yPerSample[d.upTo];
        })
        .attr("data-popID", function(d){
            return d.id;
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
			if(self.showSteps){
				self.trackListLines(settings, currentAnimation, 0, popText, max, self);
				return;
			}
			this.animationController(settings, currentAnimation);
			return;
		}
		let base_speed= (upto < 10 ? 500 : 250);
        let selected_sample_item = settings.sample[upto];
        d3.selectAll("#sampleReRandomised text").style("fill", "black")
            .attr("x", function(){return d3.select(this).attr("data-x") ? d3.select(this).attr("data-x") : d3.select(this).attr("x")})
            .attr("y", function(){return d3.select(this).attr("data-y") ? d3.select(this).attr("data-y") : d3.select(this).attr("y")});
		popText.append("text").attr("class", "redHighlight").text(self.allPop[selected_sample_item.id].value).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width * (2/4)).attr("y", selected_sample_item.id < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(selected_sample_item.id+1)) : -10).style("font-size",self.windowHelper.fontSize).style("display","inline-block").attr("text-anchor","middle").style("fill", "red");
		d3.selectAll(".pop .c"+selected_sample_item.id).attr("stroke-opacity", 1).attr("fill-opacity", 1).transition().duration(base_speed/settings.repititions).each('end', function(d, i){
            if(i == 0){
                self.buildUpSlow(settings, currentAnimation, upto+1, popText, max, self);
            }
		});
		
		if(this.showSteps){
			d3.select("#circleOverlay .c"+selected_sample_item.order).attr("stroke-opacity", 1).attr("fill-opacity", 1)
			.attr("data-cy", function(){return d3.select(this).attr("cy")})
			.attr("cy", function(){return d3.select(".pop .c"+selected_sample_item.id).attr("cy")})
			.transition().duration(base_speed/settings.repititions)
			.attr("cy", function(){return d3.select(this).attr("data-cy")});
		}else{
			d3.select("#circleOverlay .c"+selected_sample_item.order).attr("stroke-opacity", 1).attr("fill-opacity", 1);
		}
        
        
        if(upto < 10){

            d3.selectAll(".t"+selected_sample_item.order)
            .attr("data-x", function(){return d3.select(this).attr("x")})
            .attr("data-y", function(){return d3.select(this).attr("y")})
            .attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width * (2/4)).attr("y", (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(selected_sample_item.id+1)))
            .style("opacity", 1).style("fill", "red")
            .transition().duration(base_speed/settings.repititions)
            .attr("x", function(){return d3.select(this).attr("data-x") ? d3.select(this).attr("data-x") : d3.select(this).attr("x")})
            .attr("y", function(){return d3.select(this).attr("data-y") ? d3.select(this).attr("data-y") : d3.select(this).attr("y")});
        }else{

            d3.selectAll(".t"+selected_sample_item.order).style("opacity", 1).style("fill", "red");
        }


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
		}).attr("class",function(d){return "t"+d.order}).attr("x",self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width*(2/4)).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S2.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("fill", "black").attr("text-anchor","middle").style("opacity", goSlow ? 0 : 1);

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

	trackListLines(settings, currentAnimation, upto, popText, max, self){
		d3.selectAll(".redHighlight").remove();
		if(upto >= max){
			this.animationController(settings, currentAnimation);
			return;
		}
		let pop_item = self.allPop[upto];
        let selected_sample_items = settings.sample.filter((x) => (x.id == pop_item.id));
        d3.selectAll("#sampleReRandomised text").style("fill", "black")
            .attr("x", function(){return d3.select(this).attr("data-x") ? d3.select(this).attr("data-x") : d3.select(this).attr("x")})
			.attr("y", function(){return d3.select(this).attr("data-y") ? d3.select(this).attr("data-y") : d3.select(this).attr("y")});
		
		
		let pop_highlight = popText.append("text").attr("class", "redHighlight").text(self.allPop[pop_item.id].value)
			.attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width * (2/4))
			.attr("y", pop_item.id < 58 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(pop_item.id+1)) : -10)
			.style("font-size",self.windowHelper.fontSize).style("display","inline-block")
			.attr("text-anchor","middle")
			.style("fill", "red");
		
		for (let ssi of selected_sample_items){
			let sample_element = d3.select(".t"+ssi.order);
			sample_element.style("opacity", 1).style("fill", "red");
			
			let sample_e_bbox = sample_element.node().getBBox();
			let pop_e_bbox = pop_highlight.node().getBBox();
			popText.append("line").attr("class", "redHighlight")
			.attr("y1", pop_e_bbox.y + (pop_e_bbox.height / 2)).attr("x1", pop_e_bbox.x + (pop_e_bbox.width))
			.attr("y2", sample_e_bbox.y + (sample_e_bbox.height / 2)).attr("x2", sample_e_bbox.x + (sample_e_bbox.width * 0))
			.style("stroke", "red");
		}

		d3.selectAll(".pop .c"+pop_item.id).attr("stroke-opacity", 1).attr("fill-opacity", 1).transition().duration(500/settings.repititions).each('end', function(d, i){
            if(i == 0){
                self.trackListLines(settings, currentAnimation, upto+1, popText, max, self);
            }
		});
		
		// if(this.showSteps){
		// 	d3.select("#circleOverlay .c"+selected_sample_item.order).attr("stroke-opacity", 1).attr("fill-opacity", 1)
		// 	.attr("data-cy", function(){return d3.select(this).attr("cy")})
		// 	.attr("cy", function(){return d3.select(".pop .c"+selected_sample_item.id).attr("cy")})
		// 	.transition().duration(500/settings.repititions)
		// 	.attr("cy", function(){return d3.select(this).attr("data-cy")});
		// }else{
		// 	d3.select("#circleOverlay .c"+selected_sample_item.order).attr("stroke-opacity", 1).attr("fill-opacity", 1);
		// }
        
        
        // if(upto < 10){
        //     d3.selectAll(".t"+selected_sample_item.order)
        //     .attr("data-x", function(){return d3.select(this).attr("x")})
        //     .attr("data-y", function(){return d3.select(this).attr("y")})
        //     .attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width * (2/4)).attr("y", (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(selected_sample_item.id+1)))
        //     .style("opacity", 1).style("fill", "red")
        //     .transition().duration(500/settings.repititions)
        //     .attr("x", function(){return d3.select(this).attr("data-x") ? d3.select(this).attr("data-x") : d3.select(this).attr("x")})
        //     .attr("y", function(){return d3.select(this).attr("data-y") ? d3.select(this).attr("data-y") : d3.select(this).attr("y")});
        // }else{
        //     d3.selectAll(".t"+selected_sample_item.order).style("opacity", 1).style("fill", "red");
        // }	
	}

	fadeIn(settings, currentAnimation){
		sharedSingleFadeIn.apply(this, [settings, currentAnimation]);
	}


	distDrop(settings, currentAnimation){
		sharedSingleStatDistDrop.apply(this, [settings, currentAnimation]);
	}
}

