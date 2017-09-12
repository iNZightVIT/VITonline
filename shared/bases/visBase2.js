class visBase2 {
    constructor(inputData, headingGroup, headingContinuous, statistic, focus){

        // This is the raw input data
        this.inputData = inputData;

        // This is the group to split on, I.E gender
        this.headingGroup = headingGroup;

        // This is the data to use for each data point, I.E height
        // For proportions, this is also the values of the primary group, E.G 0:male 1:female
        this.headingContinuous = headingContinuous;

        // GET RID OF?
        // This is the statistic to use for showing differences between groups, I.E mean or median.
        this.statistic = statistic;

        // This is the named prroportion to display on proportion visualisations, I.E for Ethnicity is
        // chosen and European is chosen as the focus, it will show European vs Other. 
        // Basically used to pick which category should be value 0.
        this.focus = focus;

        this.population;

        // We want to sort the main split category. This is indexed by sortCategory.
        this.sortCategory = 0;
        this.categoryValues = [];

        this.baseSVG = d3.select(".svg");

        this.includeSampleSection = false;

        this.popDrawType = 1;

        this.calcLargeCI = true;

        // Replaceable functions

        // Function to calculate the overall statistic, usually Mean or Median or Proportion.
        this.mainStatistic = dataPointsMean;

        // Function to calculate the statistic of interest for the samples.
        this.sampleStatistic = dataPointsMean;

        // Functions to calculate any extra statistics for all points in the data sets.
        this.extraNonCategorisedStatistics = {};

        // Functions to calculate any extra statistics for each category.
        this.extraCategorisedStatistics = {};

        // Function to draw the population axis
        this.drawPopAxis = drawPopAxis;

        // Function to draw the population data
        this.drawPopulationCategories = drawPopulationCategories;

        // Function to label sections
        this.labelSections = labelSections;

        // Function to draw the sample section
        this.drawSampleSection = drawSampleSection;

        this.drawSampleAxis;

        this.drawPopulationStatistic;

        this.drawSampleDisplay;

    }

    changeStat(newStatistic){
        // TODO
    }

    setUpPopCategory(items, scale, radius, top, bottom){
        // Sets the y value for all population circles in the category to make it look heaped. 
        heapYValues4(items, scale, radius, 0, top,bottom);
    }

    setUpPopulation(){
        var self = this;

        // Set the variables we are tracking for this data set.
        this.population = new data_set(this.headingContinuous, this.headingGroup, this.focus);

        // Add all input data points to the population data set.
        for(var i = 0; i < this.inputData.length; i++){
            var observation = this.inputData[i];
            this.population.add(observation);
        }

        // Calculate our desired statistics for the population.
        calcDataSetStatistics(this.population, this.mainStatistic, this.extraNonCategorisedStatistics, this.extraCategorisedStatistics);

        // Make a scale that converts values between [min, max] to values to draw on the screen.
        this.xScale = d3.scale.linear().range([this.includeSampleSection ? this.windowHelper.graphSection.x1 : this.windowHelper.sampleSection.x1,this.windowHelper.graphSection.x2]);
        this.xScale.domain([this.population.statistics.min, this.population.statistics.max]);

        // We want to draw categories in increasing order of main statistic, so arrows point right.
        this.categoryValues = this.population.getCategories(this.sortCategory);
        this.categoryValues.sort(function(a,b){
            return self.population.statistics.categories[a].overallStatistic - self.population.statistics.categories[b].overallStatistic;
        });

        // Sets up a section for each of the categorical variable possibilities. (If visualising proportion, split on second categorical, *NOT IMPLEMENTED YET*)
        var numDivisions = this.categoryValues.length;
        var divisions = this.windowHelper.graphSection.S1.displayArea.getDivisions(numDivisions, 'height');
        var divSections = divisions[0];
        var divHeight = divisions[1];
        for(var j =0; j <numDivisions; j++){
            var top = divSections[j] - divHeight;
            var bottom = divSections[j] - divHeight/2;

            // setUp the items in each category.
            this.setUpPopCategory(this.population.categorisedDataPoints[this.categoryValues[j]], this.xScale, this.windowHelper.radius, top, bottom);
        }

        this.popSetup = true;
    }

    destroy(){
        this.baseSVG.selectAll("*").remove();
    }
    getSampleSize(){

    }
    getSampleSize(){
        return this.population.allDataPoints.length;
    }
    makeSingleSample(dataSet, sampleFrom, sampleSize){
        return sampleFrom;
    }
    makeSamples(sampleFrom, numberOfSamples, sampleSize, statistic){
        var samples = [];
        var sampleStatistics = [];
        // Set the variables we are tracking for this data set.
        var sample = new data_set(this.headingContinuous, this.headingGroup, this.focus);

        for (var s = 0; s < numberOfSamples; s++){
            sample = this.makeSingleSample(sample, this.population, sampleSize);

            // Calculate our desired statistics for the sample.
            var singleSampleStatistic = calcDataSetStatistics(sample, statistic, this.extraNonCategorisedStatistics, this.extraCategorisedStatistics);
            samples.push(sample);
            sampleStatistics.push(singleSampleStatistic);
        }
        return [samples, sampleStatistics];
    }
    setUpSamples(){
        var self = this;

        var sSize = this.getSampleSize();
        if(sSize == null){
            return;
        }

        if(this.calcLargeCI){
            this.setUpLargeCI(sSize);
        }

        // Make samples.
        var result = this.makeSamples(this.population, 1000, sSize, this.sampleStatistic);

        // List of sample data sets.
        this.samples = result[0];

        // List of statistics for the samples for easy access.
        this.sampleStatistics = result[1];

    }
    setUpLargeCI(){
    }

    setUpCI(){
    }
    draw(){
        var self = this;
        if(!this.statsDone) return;
        this.drawPop();
        this.drawSample();
    }
    drawPop(){
        // Cancel if setup has not run.
        if(!this.popSetup) return;

        // add a group to place all population elements into.
        var popDraw = this.baseSVG.append("g").attr("id", "population");

        // draw axis for first 2 sections.
        this.drawPopAxis(this, popDraw);

        // add a group to place population elements into.
        var popCategories = popDraw.append("g").attr("class","pop");
        this.drawPopulationCategories(this, popCategories);
        
        this.labelSections(this, popDraw);

        if(this.includeSampleSection){
            this.drawSampleSection(this, popDraw);
        }

        this.drawPopExtra(this, popDraw);
    }
    drawPopExtra(self, placeInto){
        return;
    }

    drawSample(){
        // cancel if setup has not run.
        if(!this.sampSetup) return;
        var self = this;

        var sampleDraw = d3.select(".svg").append("g").attr("id", "samples");

        // does not handle more than 2 categories right now.
        //if(this.groups.length > 2) return;

        // draw axis for section 3
        this.drawSampleAxis(sampleDraw);

        this.drawPopulationStatistic(sampleDraw);
        
        this.drawSampleDisplay(sampleDraw);     

        var overlayContainer = d3.select(".svg").append("g").attr("id", "dynamic").append("g").attr("id","circleOverlay");
        overlayContainer.append("g").attr("id","circleOverlayStill");
        overlayContainer.append("g").attr("id","circleOverlayDrop");
        d3.select("#fadeButton").remove();   
    }

}