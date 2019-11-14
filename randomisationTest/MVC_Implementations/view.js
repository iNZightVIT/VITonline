function view(controller){
	viewBase.call(this, "sv", controller);
	d3.select("#module").text("module: Randomisation Test"+"; ");
	d3.select("#banner").text("Randomisation Test");
}
view.prototype = Object.create(viewBase.prototype);
view.prototype.constructor = view;
view.prototype.makeButtons = function(){
		d3.select("#stopButton").remove();
		d3.select("#tab2Top").append("input").attr("type","button").attr("value","Stop").classed("bluebutton", true).attr("id","stopButton").attr("disabled",null).attr("onClick","mainControl.stopPressed()").text("Stop")
			.style("height","15%");
		var tab2 = d3.select("#tab2");
		var vs = tab2.select("#tab2Mid").append("div").attr("id","visControls1");
		vs.append("label").text("Random groups");
		vs.append("input").attr("type","radio").attr("name","Sampling").attr("value","1").attr("id","sampOne").attr("class","repSelect").attr("checked",true).text("1").attr("onClick","mainControl.view.tSUnDisable()");
		vs.append("label").attr("for","sampOne").attr("class","repLabel").text("1");
		vs.append("input").attr("type","radio").attr("name","Sampling").attr("value","5").attr("id","sampFive").attr("class","repSelect").text("5").attr("onClick","mainControl.view.tSDisable()");
		vs.append("label").attr("for","sampFive").attr("class","repLabel").text("5");
		vs.append("input").attr("type","radio").attr("name","Sampling").attr("value","20").attr("id","sampTwenty").attr("class","repSelect").text("20").attr("onClick","mainControl.view.tSDisable()");
		vs.append("label").attr("for","sampTwenty").attr("class","repLabel").text("20");
		vs.append("input").attr("type","radio").attr("name","Sampling").attr("value","1000").attr("id","sampThousand").attr("class","repSelect").text("1000").attr("onClick","mainControl.view.tSDisable()");
		vs.append("label").attr("for","sampThousand").attr("class","repLabel").text("1000");

		vs.append("input").attr("type","button").attr("value","Go").attr("class","bluebutton").classed("goButton",true).attr("id","startSampling").attr("disabled",null).attr("onClick","mainControl.startSampling(false)").text("Go")
			.style("height","15%");

		vs = tab2.select("#tab2Bot").append("div").attr("id","visControls2");
		vs.append("label").text("Re-Randomisation Distribution");
		vs.append("input").attr("type","radio").attr("name","Dist").attr("value","1").attr("id","distOne").attr("class","repSelect").attr("checked",true).text("1");
		vs.append("label").attr("for","distOne").attr("class","repLabel").text("1");
		vs.append("input").attr("type","radio").attr("name","Dist").attr("value","5").attr("id","distFive").attr("class","repSelect").text("5");
		vs.append("label").attr("for","distFive").attr("class","repLabel").text("5");
		vs.append("input").attr("type","radio").attr("name","Dist").attr("value","20").attr("id","distTwenty").attr("class","repSelect").text("20");
		vs.append("label").attr("for","distTwenty").attr("class","repLabel").text("20");
		vs.append("input").attr("type","radio").attr("name","Dist").attr("value","1000").attr("id","distThousand").attr("class","repSelect").text("1000");
		vs.append("label").attr("for","distThousand").attr("class","repLabel").text("1000");
		vs.append("input").attr("type","button").attr("value","Go").attr("class","bluebutton").classed("goButton",true).attr("id","distSampling").attr("disabled",null).attr("onClick","mainControl.startSampling(true)").text("Go")
			.style("height","15%");
		tab2.select("#tab2Bot").append("input").attr("type","button").attr("value","Show Tail Proportion").attr("class","bluebutton").classed("CIButton",true).attr("id","CIButton").attr("disabled",true).attr("onClick","mainControl.showCI()").text("Show Tail Proportion")
			.style("height","15%");
		tab2.select("#tab2Bot").append("input").attr("type","button").attr("value","10,000 Sample Tail").attr("class","bluebutton").classed("CIButton",true).attr("id","CIButtonLarge").attr("disabled",true).attr("onClick","mainControl.showLargeCI()").text("10,000 Sample Tail")
			.attr("height","15%");
		tab2.select("#tab2Bot").append("input").attr("type","button").attr("value","Distribution Focus").attr("class","bluebutton").classed("distFocus",true).attr("id","distFocus").attr("disabled",null).attr("onClick","mainControl.distFocusToggle()").text("Distribution Focus")
			.style("height","15%");
}