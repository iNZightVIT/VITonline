function controller(){
	controllerBase.call(this);
}
controller.prototype = Object.create(controllerBase.prototype);
controller.prototype.constructor = controller;
controller.prototype.startVisFull = function(sampsize){
		this.model.destroy();
		if(!sampsize){
			var sampleSize = d3.select("#sampsize").property("value");
		}else{
			var sampleSize = sampsize;
		}
		this.model.display.setUpPopulation();
		this.model.display.setUpSamples(sampleSize);
		this.model.display.draw();
		this.view.finishSetUp();

	}

var oneMeanButton;
var twoMeanButton;
var dataScreen = null;
var mainControl = null;
window.onload = function(){
	//loadMain();
	//loadData();
	mainControl = new controller();
};