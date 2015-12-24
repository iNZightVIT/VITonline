

function controller(){
	this.view = new view(this);
	this.model = new model(this);
	this.model.loadData();
	this.view.loadMain(this.model.dataHeadings);
	this.startAnimation = function(numReps, goSlow){
		this.model.display.startAnim(numReps, goSlow);
	}
	this.resetScreen = function(){
		this.model.display.resetLines();
	}
	this.startVisFull = function(){
		this.model.destroy();
		var sampleSize = d3.select("#sampsize").property("value");
		this.model.display.setUpPopulation();
		this.model.display.setUpSamples(sampleSize);
		this.model.display.draw();
		this.view.makeButtons();
	}
	this.startVisPreveiw = function(){
		this.view.visPreveiw();
		this.model.display.setUpPopulation();
		this.model.display.drawPop();
	}
	this.impButPressed = function(e){
		this.model.getFile(e);
	}
	this.loadTestData = function(){
		this.model.loadPresetData();
	}
	this.varSelected = function(e){
		this.view.destroyFocus();
		this.model.varSelected(e.target.selectedOptions);
		this.view.varSelected();
	}
	this.focusSelected = function(e){
		var changeTo = e.target.value;
		this.model.destroy();
		this.model.switchFocus(changeTo);
		this.startVisPreveiw();
	}
	this.backPressed = function(){
		this.model.destroy();
		this.view.leaveVis();
	}
	this.stopPressed = function(){
		this.model.display.stop();
	}
	this.statChanged = function(e){
		this.model.display.changeStat(e.target.value);
		this.startVisPreveiw();
	}
	this.startVisPressed = function(){
		this.view.finishSetUp();
	}
	this.setUpDataVeiw = function(csv){
		var self = this;
		this.model.setUpDataVeiw(csv, function(h){self.view.setUpDataVeiw(h)});
		
	}
	this.setUpStatSelection = function(category){
		this.view.setUpStatSelection(category);
	}
	this.makeFocusSelector = function(unique, cat){
		this.view.focusSelector(unique, cat);
	}
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