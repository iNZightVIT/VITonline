function quickLine(placeInto, x1, x2, y1, y2, id, className, style = {}, attr = {}){
    var line =  placeInto.append("line").attr("x1", x1)
                                        .attr("x2", x2)
                                        .attr("y1", y1)
                                        .attr("y2", y2);
    for(var key in style){
        line.style(key, style[key]);
    }
    for(var key in attr){
        line.attr(key, style[key]);
    }
    if(id) line.attr("id", id);
    if(className) line.attr("class", className);
}

function quickText(placeInto, x, y, text, id, className, style = {}, attr = {}){
    var text =  placeInto.append("text").attr("x", x)
                                        .attr("y", y)
                                        .text(text);
    for(var key in style){
        text.style(key, style[key]);
    }
    for(var key in attr){
        text.attr(key, style[key]);
    }
    if(id) text.attr("id", id);
    if(className) text.attr("class", className);
}

function drawContinuous(self, placeInto){
    var divisions = self.windowHelper.graphSection.S1.displayArea.getDivisions(self.categoryValues.length, 'height');
    var divSections = divisions[0];
    var divHeight = divisions[1];
    for(var i = 0; i < self.categoryValues.length; i++){
        var pos = divSections[i] - divHeight/2;
        var catSVG = placeInto.append("g").attr("id","pop" + i);
        catSVG.selectAll("circle").data(self.population.categorisedDataPoints[self.categoryValues[i]]).enter().append("circle")
            .attr("cx", function(d, i) { 
                return d.xValuePerSample[0]; })
            .attr("cy", function(d) {
                return d.yValuePerSample[0];
            })
            .attr("r", self.windowHelper.radius)
            .attr("class",function(d){return "c"+d.id})
            .style("fill", function(){return colorByIndex[i]});
        quickLine(catSVG, 
                self.xScale(self.population.statistics.categories[self.categoryValues[i]].overallStatistic),
                self.xScale(self.population.statistics.categories[self.categoryValues[i]].overallStatistic),
                pos + self.windowHelper.lineHeight,
                pos - self.windowHelper.lineHeight,
                "noId",
                "statLine");
        quickText(catSVG,
            self.windowHelper.graphSection.x2,
            pos - divHeight/4,
            self.categoryValues[i],
            "noId",
            "categoryLabel",
            {"fill":colorByIndex[i]});
        quickText(catSVG,
            self.windowHelper.graphSection.x2,
            pos - divHeight/4 + self.windowHelper.graphSection.S1.height,
            self.categoryValues[i],
            "noId",
            "categoryLabel",
            {"fill":colorByIndex[i]});
    }
}

function drawProportional(self, placeInto){
    var self = self;

    // Should make a division for each group.
    var numDivisions = self.population.getCategories(1).length;
    var divisions = self.windowHelper.graphSection.S1.displayArea.getDivisions(numDivisions, 'height');
    var divSections = divisions[0];
    var divHeight = divisions[1];
    for(var i = 0;i<numDivisions;i++){
        var pos = divSections[i] - divHeight/2 - self.windowHelper.radius*2;
        var catSVG = placeInto.append("g").attr("id","pop"+i);

        var groupName = self.population.getCategories(1)[i] != "No Category" ? self.population.getCategories(1)[i] : "";
        // Now split on main categories. We want a category for the focus and one for other.
        var focusGroup = self.population.categorisedDataPoints[self.population.getCategories(1)[i]].filter(function(x){return x.values[0] == 0});
        var otherGroup = self.population.categorisedDataPoints[self.population.getCategories(1)[i]].filter(function(x){return x.values[0] != 0});

        drawProportionBars(catSVG, divHeight, pos, self.xScale, focusGroup, otherGroup, groupName, i, self.categoryValues, self);
    }
}

function drawProportionBars(svg, divHeight, pos, xScale, fG, oG, name, i, barTitles, self){
    var self = self;

    var otherBar = "other";
    if(barTitles.length == 2) otherBar = barTitles[1];
    // Each bar has its start in units, its end in units, the total amouint of units and its name.
    var bars = [[0, fG.length, fG.length + oG.length, barTitles[0]], [fG.length, oG.length, fG.length + oG.length, otherBar]];

    // Bar Name (group)
    svg.append("text").text(name)
    .attr("x", xScale(1))
    .attr("y", pos - divHeight/4 - 2)
    .attr("text-anchor", "end")
    .attr("fill",colorByIndex[i+barTitles.length])
    .style("font-size", divHeight*0.4).style("opacity", 0.6);

    svg = svg.selectAll("g").data(bars);

    var barsSVG = svg.enter().append("g").attr("id", function(d){return name + i + d[3]});
    barsSVG.append("rect")
        .attr("height", divHeight/2)
        .attr("y", pos - divHeight/4)
        .attr("width", function(d){ return xScale((d[1]+ d[0])/d[2]) - xScale((d[0])/d[2]) })
        .attr("x", function(d){return xScale(d[0]/d[2])})
        .attr("fill",function(d,i){return colorByIndex[i]})
        .attr("fill-opacity","0.8");

    barsSVG.append("text").text(function(d){return d[1] > 0 ? d[1] : ""})
    .attr("x", function(d){return xScale(d[0]/d[2]) + (xScale((d[1]+ d[0])/d[2]) - xScale((d[0])/d[2])) /2 })
    .attr("y", pos)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("fill","white")
    .style("font-size", divHeight*0.6).style("opacity", 0.6);

    // barsSVG.append("line")
    // .attr("x1", function(d){return xScale(d[0]/d[2]) })
    // .attr("x2", function(d){return xScale(d[0]/d[2]) + (xScale((d[1]+ d[0])/d[2]) - xScale((d[0])/d[2])) })
    // .attr("y1", pos)
    // .attr("y2", pos);    

    barsSVG.append("text").text(function(d){return d[1] > 0 ? d[3] : ""})
    .attr("x", function(d){return xScale(d[0]/d[2])})
    .attr("y", pos - divHeight/4 - 2)
    .attr("text-anchor", "start")
    .attr("fill",function(d,i){return colorByIndex[i]})
    .style("font-size", self.windowHelper.fontSize);    
}

function drawPopulationCategories(self, placeInto){
    var popDrawFunctions = [drawContinuous.bind(self), drawProportional.bind(self)];
    var popDrawFunction = popDrawFunctions[self.popDrawType];
    popDrawFunction(self, placeInto);
}

function labelSections(self, placeInto){
    placeInto.append("text").attr("class","sectionLabel").attr("x", self.xScale.range()[0]).attr("y",self.windowHelper.graphSection.S1.titleArea.y1+2).text(self.sectionLabels[0]).style("opacity", 1).style("font-size",self.windowHelper.fontSize).style("fill","black").style("font-weight","bold").attr("dominant-baseline", "hanging");
    placeInto.append("text").attr("class","sectionLabel").attr("x", self.xScale.range()[0]).attr("y",self.windowHelper.graphSection.S2.titleArea.y1+2).text(self.sectionLabels[1]).style("opacity", 1).style("font-size",self.windowHelper.fontSize).style("fill","black").style("font-weight","bold").attr("dominant-baseline", "hanging");
    placeInto.append("text").attr("class","sectionLabel").attr("x", self.xScale.range()[0]).attr("y",self.windowHelper.graphSection.S3.titleArea.y1+2).text(self.sectionLabels[2]).style("opacity", 1).style("font-size",self.windowHelper.fontSize).style("fill","black").style("font-weight","bold").attr("dominant-baseline", "hanging");
}

function drawPopAxis(self, placeInto){
    var xAxis = d3.svg.axis();
    xAxis.scale(self.xScale).tickSize(2);
    placeInto.append("g").attr("class","axis").attr("transform", "translate(0," + (self.windowHelper.graphSection.S1.axisArea.y) + ")").call(xAxis);
    placeInto.append("g").attr("class","axis").attr("transform", "translate(0," + (self.windowHelper.graphSection.S2.axisArea.y) + ")").call(xAxis);
}

function fillBaseSampleSection(self, placeInto){
    placeInto.append("text").text(self.headingContinuous).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width/4).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");
    placeInto.append("text").text(self.headingGroup).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("margin",self.windowHelper.marginSample+"px").style("display","inline-block").attr("text-anchor","middle");
    var popTextG = placeInto.selectAll("g").data(self.allPop).enter().append("g");
    popTextG.append("text").text(function(d){return d.value}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width/4).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").attr("text-anchor","middle");
    popTextG.append("text").text(function(d){return d.group}).attr("x",self.windowHelper.sampleSection.S1.x + self.windowHelper.sampleSection.S1.width*(3/4)).attr("y",function(d,i){return i < 59 ? (self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize + (self.windowHelper.fontSize+2)*(i+1)) : -10}).style("font-size",self.windowHelper.fontSize).style("display","inline-block").style("stroke", function(d){return colorByIndex[self.groups.indexOf(d.group)]}).attr("text-anchor","middle");

    placeInto.append("g").attr("id","redTContainer");
    placeInto.append("text").text("Re-randomised").attr("x",(self.windowHelper.sampleSection.S2.x + self.windowHelper.sampleSection.S2.width/2)).attr("y",self.windowHelper.sampleSection.S1.y + self.windowHelper.fontSize).style("font-size",self.windowHelper.fontSize).style("font-weight", 700).style("display","inline-block").attr("text-anchor","middle");

}

function drawSampleSection(self, placeInto){
    var sampleSection = placeInto.append("g").attr("id","sampleSection");
    sampleSection.append("rect").attr("width",self.windowHelper.sampleSection.S1.width).attr("x", self.windowHelper.sampleSection.S1.x).attr("height",self.windowHelper.sampleSection.S1.height).attr("y", self.windowHelper.sampleSection.S1.y).attr("rx", "20").attr("ry","20").style("fill","#D0D0D0").style("stroke","black");
    sampleSection.append("rect").attr("width",self.windowHelper.sampleSection.S2.width).attr("x", self.windowHelper.sampleSection.S2.x).attr("height",self.windowHelper.sampleSection.S2.height).attr("y", self.windowHelper.sampleSection.S2.y).attr("rx", "20").attr("ry","20").style("fill","#D0D0D0").style("stroke","black");
    self.fillBaseSampleSection(sampleSection);
}

function drawSampleAxis(self, placeInto){
        var xAxis2 = d3.svg.axis();
        xAxis2.scale(self.sampleStatScale).tickSize(2);
        placeInto.append("g").attr("class","axis").attr("transform", "translate(0," + (self.windowHelper.graphSection.S3.axisArea.y) + ")").call(xAxis2);   

        // we want 0 to be bolded
        d3.selectAll(".axis text").filter(function(d){
            return d == 0;
        }).style("font-weight",700);
    }

function drawPopulationStatistic(self, placeInto){
        var middle = self.windowHelper.graphSection.S1.displayArea.getMiddleHeight();
        drawArrow(self.xScale(self.groupStats[self.groups[1]]), self.xScale(self.groupStats[self.groups[0]]), middle, placeInto, "popDiff", 1, "blue");
            placeInto.append("text").attr("x", self.xScale(self.groupStats[self.groups[1]])).attr("y", middle).text(Math.round((self.populationStatistic)*100)/100).style("stroke","blue").style("opacity",1);

    }

function drawSampleDisplay(self, placeInto){
        var middle = self.windowHelper.graphSection.S2.displayArea.getMiddleHeight();
        placeInto.append("g").attr("class","sampleDiffs");
        placeInto.append("g").attr("class","sampleLines2");
        var meanCircles = placeInto.append('g').attr("id", "sampleDisplay").selectAll("circle").data(self.sampleStatistics)
            .enter().append("circle")
            .attr("cx", function(d, i) { 
                return d.xPerSample[0]; })
            .attr("cy", function(d) {
                return d.yPerSample[0];
            })
            .attr("r", self.windowHelper.radius)
            .attr("fill-opacity", 0)
            .attr("stroke", "darkgrey")
            .attr("fill", "darkgrey")
            .attr("stroke-opacity",0)
            .attr("class",function(d){
                        if(d.inCI){
                            return "inCI";
                        }else{
                            return "notInCI";
                        }
                    });
    }