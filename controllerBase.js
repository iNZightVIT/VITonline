var URLSearchParams=URLSearchParams||function(){"use strict";function e(e){var n,r,i,s,o,u,c=Object.create(null);this[a]=c;if(!e)return;if(typeof e=="string"){e.charAt(0)==="?"&&(e=e.slice(1));for(s=e.split("&"),o=0,u=s.length;o<u;o++)i=s[o],n=i.indexOf("="),-1<n?f(c,l(i.slice(0,n)),l(i.slice(n+1))):i.length&&f(c,l(i),"")}else if(t(e))for(o=0,u=e.length;o<u;o++)i=e[o],f(c,i[0],i[1]);else for(r in e)f(c,r,e[r])}function f(e,n,r){n in e?e[n].push(""+r):e[n]=t(r)?r:[""+r]}function l(e){return decodeURIComponent(e.replace(i," "))}function c(e){return encodeURIComponent(e).replace(r,o)}function h(){try{return!!Symbol.iterator}catch(e){return!1}}var t=Array.isArray,n=e.prototype,r=/[!'\(\)~]|%20|%00/g,i=/\+/g,s={"!":"%21","'":"%27","(":"%28",")":"%29","~":"%7E","%20":"+","%00":"\0"},o=function(e){return s[e]},u=h(),a="__URLSearchParams__:"+Math.random();n.append=function(t,n){f(this[a],t,n)},n.delete=function(t){delete this[a][t]},n.get=function(t){var n=this[a];return t in n?n[t][0]:null},n.getAll=function(t){var n=this[a];return t in n?n[t].slice(0):[]},n.has=function(t){return t in this[a]},n.set=function(t,n){this[a][t]=[""+n]},n.forEach=function(t,n){var r=this[a];Object.getOwnPropertyNames(r).forEach(function(e){r[e].forEach(function(r){t.call(n,r,e,this)},this)},this)},n.keys=function(){var t=[];this.forEach(function(e,n){t.push(n)});var n={next:function(){var e=t.shift();return{done:e===undefined,value:e}}};return u&&(n[Symbol.iterator]=function(){return n}),n},n.values=function(){var t=[];this.forEach(function(e){t.push(e)});var n={next:function(){var e=t.shift();return{done:e===undefined,value:e}}};return u&&(n[Symbol.iterator]=function(){return n}),n},n.entries=function(){var t=[];this.forEach(function(e,n){t.push([n,e])});var n={next:function(){var e=t.shift();return{done:e===undefined,value:e}}};return u&&(n[Symbol.iterator]=function(){return n}),n},u&&(n[Symbol.iterator]=n.entries),n.toJSON=function(){return{}},n.toString=function w(){var e=this[a],t=[],n,r,i,s;for(r in e){i=c(r);for(n=0,s=e[r];n<s.length;n++)t.push(i+"="+c(s[n]))}return t.join("&")};var p=Object.defineProperty,d=Object.getOwnPropertyDescriptor,v=function(e){function t(t,r){n.append.call(this,t,r),t=this.toString(),e.set.call(this._usp,t?"?"+t:"")}function r(t){n.delete.call(this,t),t=this.toString(),e.set.call(this._usp,t?"?"+t:"")}function i(t,r){n.set.call(this,t,r),t=this.toString(),e.set.call(this._usp,t?"?"+t:"")}return function(e,n){return e.append=t,e.delete=r,e.set=i,p(e,"_usp",{configurable:!0,writable:!0,value:n})}},m=function(e){return function(t,n){return p(t,"_searchParams",{configurable:!0,writable:!0,value:e(n,t)}),n}},g=function(t){var r=t.append;t.append=n.append,e.call(t,t._usp.search.slice(1)),t.append=r},y=function(e,t){if(!(e instanceof t))throw new TypeError("'searchParams' accessed on an object that does not implement interface "+t.name)},b=function(t){var n=t.prototype,r=d(n,"searchParams"),i=d(n,"href"),s=d(n,"search"),o;!r&&s&&s.set&&(o=m(v(s)),Object.defineProperties(n,{href:{get:function(){return i.get.call(this)},set:function(e){var t=this._searchParams;i.set.call(this,e),t&&g(t)}},search:{get:function(){return s.get.call(this)},set:function(e){var t=this._searchParams;s.set.call(this,e),t&&g(t)}},searchParams:{get:function(){return y(this,t),this._searchParams||o(this,new e(this.search.slice(1)))},set:function(e){y(this,t),o(this,e)}}}))};return b(HTMLAnchorElement),/^function|object$/.test(typeof URL)&&URL.prototype&&b(URL),e}();

var controllerBase = function(){
	this.view = new view(this);
	this.model = new model(this);
	this.model.loadData();
	this.view.loadMain(this.model.dataHeadings);
	this.parseURL(window.location.search);

	this.paused = false;
	this.going = false;
	this.fadeOn = false;
}
controllerBase.prototype.getPresets = function(){
		this.model.getPresets(this.view.setupPresets);
	}
controllerBase.prototype.loadFromPreset = function(filename, fromURL){
	if(filename.split(':')[0]=="preset"){
		filename = filename.split(':')[1];
	}
	this.model.loadFromPreset(filename, fromURL);
	var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?file=preset:' + filename;
	this.fileURL = newurl;
	if(!fromURL){
		window.history.pushState({path:newurl},'', newurl);
	}
}
controllerBase.prototype.loadFromURL = function(url, fromURL) {
	this.model.loadFromURL(url, fromURL);
	var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?file=' + url;
	this.fileURL = newurl;
	if(!fromURL){
		window.history.pushState({path:newurl},'', newurl);
	}
}
function isURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(str);
}
controllerBase.prototype.parseURL = function(url){
	var urlParams = new URLSearchParams(window.location.search);
	//alert(url);
	var file = urlParams.get("file");
	if(file){
		if(file == "testdata"){
			this.loadTestData(true);
		}else if(isURL(file)){
			this.loadFromURL(file, true);
		}else{
			this.loadFromPreset(file, true);
		}
	}
}

controllerBase.prototype.parseRestOfURL = function() {
	var urlParams = new URLSearchParams(window.location.search);
	// set input vars as fake variables ()
	var variables = urlParams.getAll("var");
	if(variables){
		var e = {};
		e.target = {};
		e.target.selectedOptions = [];
		for (var v in variables){
			var va = {};
			va.value = variables[v];
			e.target.selectedOptions.push(va);
		}
	}
	this.varSelected(e, true);

	var focus = urlParams.get("focus");
	if(focus){
		var e = {};
		e.target = {};
		e.target.value = focus;
		this.focusSelected(e, true);
	}

	var stat = urlParams.get("stat");
	if(stat){
		if(stat != "Mean" && stat != "Median" && stat != "proportion")
			stat = "Mean";
		this.model.display.changeStat(stat);
	}


	var sampleSize = urlParams.has("samplesize") ? urlParams.get("samplesize") : this.model.display.sampleSize;
	this.switchTab2();
	var statSelection = d3.select("#statSelect");
	statSelection.attr("value", stat);
	d3.select("#Calculate").attr("disabled", true);
	this.startVisFull(sampleSize);
}
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
controllerBase.prototype.startAnimation = function(numReps, goSlow, incDist){
		this.model.display.startAnim(numReps, goSlow, incDist);
	}
controllerBase.prototype.resetScreen = function(){
		this.model.display.resetLines();
	}
controllerBase.prototype.startVisFull = function(sampleSize){
		this.model.destroy();
		//var sampleSize = d3.select("#sampsize").property("value");
		this.model.display.setUpPopulation();
		this.model.display.setUpSamples(sampleSize);
		this.model.display.draw();
		this.view.finishSetUp();

	}
controllerBase.prototype.notImplemented = function(){

	}
controllerBase.prototype.loadFromText = function(text){
		this.model.loadFromText(text);
	}
controllerBase.prototype.startVisPreveiw = function(){
		d3.select("#Calculate").attr("disabled", null);
		d3.select("#tab2Mid").selectAll("*").remove();
		d3.select("#tab2Bot").selectAll("*").remove();
		this.view.visPreveiw();
		this.model.display.setUpPopulation();
		this.model.display.drawPop();

		if(this.model.display.implemented == false){
			d3.select("#Calculate").attr("value","Visualisation not implemented").attr("disabled",true);
		}
	}
controllerBase.prototype.impButPressed = function(e){
		this.view.destroyFocus();
		this.view.destroyVSelect();
		this.model.getFile(e);
	}
controllerBase.prototype.loadTestData = function(fromURL){
		this.view.destroyFocus();
		this.view.destroyVSelect();
		this.model.loadPresetData(fromURL);
		var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?file=testdata';
		this.fileURL = newurl;
		if(!fromURL){
			window.history.pushState({path:newurl},'', newurl);
		}
	}
controllerBase.prototype.varSelected = function(e, fromURL){
		d3.select(".svg").selectAll("text").remove();
		this.view.destroyFocus();
		this.view.destroyVSelect();
		this.model.varSelected(e.target.selectedOptions);
		this.view.varSelected(e.target.selectedOptions);

		if(!fromURL){
			if(this.fileURL){
				var newurl = this.fileURL;
				for (var i = 0; i < e.target.selectedOptions.length; i++){
					newurl += ("&var="+e.target.selectedOptions[i].value);
				}
				this.varURL = newurl;
				window.history.pushState({path:newurl},'', newurl);
			}

		}
		
	}
controllerBase.prototype.noVisAvail = function(){
		this.view.noVisAvail();
	}
controllerBase.prototype.focusSelected = function(e, fromURL){
		var changeTo = e.target.value;
		//this.model.destroy();
		this.model.switchFocus(changeTo);
		this.startVisPreveiw();
		if(!fromURL){
			var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search.split("&focus")[0] + "&focus=" + e.target.value;
			window.history.pushState({path:newurl},'', newurl);
		}
	}
controllerBase.prototype.backPressed = function(){
		this.model.destroy();
		this.view.leaveVis();
	}
controllerBase.prototype.stopPressed = function(){
		this.model.display.stop();
		this.view.doneVis();
		this.paused = false;
	}
controllerBase.prototype.statChanged = function(e){
		this.model.display.changeStat(e.target.value);
		this.startVisPreveiw();
		var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search.split("&stat")[0] + "&stat=" + e.target.value;;
		window.history.pushState({path:newurl},'', newurl);
	}
controllerBase.prototype.startVisPressed = function(){
		//this.view.finishSetUp();
		this.startVisFull(this.model.display.sampleSize);
		d3.select("#Calculate").attr("disabled", true);
		d3.select("#Pause").attr("disabled", null);
	}
controllerBase.prototype.setUpDataVeiw = function(csv, fromURL){
		var self = this;
		this.model.setUpDataVeiw(csv, function(h){self.view.setUpDataVeiw(h); if(fromURL){self.parseRestOfURL()}});
		
	}
controllerBase.prototype.setUpStatSelection = function(category){
		this.view.setUpStatSelection(category);
	}
controllerBase.prototype.makeFocusSelector = function(unique, cat){
		this.view.focusSelector(unique, cat);
	}
controllerBase.prototype.makeVarSelector = function(cat1,cat2){
		this.view.makeVarSelector(cat1,cat2);
	}
controllerBase.prototype.varChanged = function(e){
		var changeTo = e.target.value;
		this.view.destroyFocus();
		this.model.switchVar(changeTo);
		this.startVisPreveiw();
	}
controllerBase.prototype.switchTab2 = function(){
		d3.select("#tab1").style("display","none");
		d3.select("#tab2").style("display","block");
		this.view.setUpTab2();
		if(this.model.display.sampleSize != 20){
			d3.select("#sampsize").attr("value",String(this.model.display.sampleSize));
		}
		this.setUpStatSelection(this.model.stats[this.model.currentCategory])
		if(this.model.display.implemented == false){
			d3.select("#Calculate").attr("value","Visualisation not implemented").attr("disabled",true);
		}
	}
controllerBase.prototype.switchTab1 = function(){
		d3.select("#tab1").style("display","block");
		d3.select("#tab2").style("display","none");
		this.view.leaveVis();
		//this.view.makeButtons();
		//this.setUpStatSelection(this.model.stats[this.model.currentCategory])
	}

controllerBase.prototype.startSampling = function(incDist){
		var name = "Sampling";
		if(incDist) name = "Dist";
		var radios = document.getElementsByName(name);
		var numRepitions = 0;
		for(var i =0; i<radios.length;i++){
			if(radios[i].checked){
				numRepitions = parseInt(radios[i].value,10);
				break;
			}
		}
		var goSlow = false;
		if(numRepitions < 10 && !(incDist && numRepitions == 5)){
			goSlow = true;
		}
		this.going = true;
		this.view.startedVis(incDist);
		this.startAnimation(numRepitions, goSlow, incDist);
	}
controllerBase.prototype.pause = function(){
		if(!this.paused){
			this.model.display.pause();
			d3.select("#pauseButton").attr("value","Restart");
			this.paused = true;
		}else{
			if(this.model.display.pauseCalled) return;
			this.model.display.unPause();
			this.view.unPause(this.model.display.incDist);
			d3.select("#pauseButton").attr("value","Pause");
			this.paused = false;
		}
	}
controllerBase.prototype.doneVis = function(){
		this.view.doneVis();
	}
controllerBase.prototype.showCI = function(){
		this.model.display.showCI("1");
	}
controllerBase.prototype.showLargeCI = function(){
		this.model.display.showLargeCI();
	}
controllerBase.prototype.showCITenk = function(){
		this.model.display.showCI("10");
	}
controllerBase.prototype.fadeToggle = function(){
		if(!this.fadeOn){
			this.view.fadeOn();
			this.fadeOn = true;
		}else{
			this.view.fadeOff();
			this.fadeOn = false;
		}
	}