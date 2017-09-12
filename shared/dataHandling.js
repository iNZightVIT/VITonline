class data_point {
    constructor(values, categories, id){
        this.values = values;
        this.categories = categories;

        // For drawing as a point
        this.xValueInitial = 0;
        this.yValueInitial = 0;
        this.xValuePerSample = [];
        this.yValuePerSample = [];
        this.id = id;
    }
}
class data_set {
    constructor(valuesToTrack, categories, focus){

        // This is the variable names (column in excel) for the numeretic values each data point has.
        // 0 or 1 for proportional values.
        this.valuesToTrack = valuesToTrack;

        // The variable names for categories to keep track of.
        this.categories = categories;

        // For proportions, this is the named category that is focused on.
        this.focus = focus;

        this.allDataPoints = [];
        this.categorisedDataPoints = {};
        this.statistics = {};
        this.categoryValues = [];
        this.valueEnum = null;
        this.id = 0;
    }

    add(dataPoint){

        // Extract category values
        var dataPointCategoryValues = [];
        for (var i = 0; i < this.categories.length+1; i++){
            if(i >= this.categoryValues.length){
                this.categoryValues.push(new Set());
                if(this.focus){
                    if(i == 0) this.categoryValues[0].add(this.focus);
                    this.categorisedDataPoints[this.focus] = [];
                }
            }
            var categoryValue;
            if(this.categories[i] == null){
                categoryValue = "No Category";
            }else{
                categoryValue = dataPoint[this.categories[i]];
            }
            
            dataPointCategoryValues.push(categoryValue);

            if(!(this.categoryValues[i].has(categoryValue))){
                this.categoryValues[i].add(categoryValue);
                this.categorisedDataPoints[categoryValue] = [];
            }
        }
        if (this.categories.length == 1 && this.categoryValues.length < 2){
            this.categoryValues.push(new Set());
            this.categoryValues[1].add("");
        }
        // Extract values
        var dataPointValues = [];
        for (var i = 0; i < this.valuesToTrack.length; i++){
            var dpValue;

            // If there are no value variables to track, use a category variable
            // by setting the value to the category index.
            if(this.valuesToTrack[i] == null){
                dpValue = [...this.categoryValues[0]].indexOf(dataPoint[this.categories[0]]) == 0 ? 0 : 1;
            }else{
                dpValue = parseFloat(dataPoint[this.valuesToTrack[i]]);
            }
            if(isNaN(dpValue)) return;
            dataPointValues.push(dpValue);
        }

        // Add the new data point to the lists.
        var newDataPoint = new data_point(dataPointValues, dataPointCategoryValues, this.id);
        for (var i = 0; i < this.categories.length+1; i++){
            var categoryValue;
            if(this.categories[i] == null){
                categoryValue = "No Category";
            }else{
                categoryValue = dataPoint[this.categories[i]];
            }
            this.categorisedDataPoints[categoryValue].push(newDataPoint);
        }
        this.allDataPoints.push(newDataPoint);
        this.id++;

    }

    setStatistics(statistics){
        this.statistics = statistics;
    }

    getCategories(category){
        return [...this.categoryValues[category]];
    }



}

function dataPointsMean(dataPoints){
    var sum = dataPoints.reduce((s,v) => s + v.values[0], 0);
    return sum/dataPoints.length;
}

function dataPointsMin(dataPoints){
    var min = dataPoints.reduce((s,v) => s == null ? v.values[0] : Math.min(s, v.values[0]), null);
    return min;
}

function dataPointsMax(dataPoints){
    var max = dataPoints.reduce((s,v) => s == null ? v.values[0] : Math.max(s, v.values[0]), null);
    return max;
}

function calcDataSetStatistics(dataSet, mainStatistic, extraOverallStatistics = {}, extraGroupStatistics = {}){
    var statistics = {};
    statistics.overallStatistic = mainStatistic(dataSet.allDataPoints);
    statistics.min = dataPointsMin(dataSet.allDataPoints);
    statistics.max = dataPointsMax(dataSet.allDataPoints);

    statistics.categories = {};
    var categories = dataSet.categoryValues.reduce((s,v) => [...v][0] != "" ? s.concat([...v]) : s,[]);
    for(var c = 0; c < categories.length; c++){
        var category = categories[c];
        statistics.categories[category] = {};

        var categoryDataPoints = dataSet.categorisedDataPoints[category];
        statistics.categories[category].overallStatistic = mainStatistic(categoryDataPoints);
        statistics.categories[category].diffFromAll = statistics.categories[category].overallStatistic - statistics.overallStatistic;
        statistics.categories[category].min = dataPointsMin(categoryDataPoints);
        statistics.categories[category].max = dataPointsMax(categoryDataPoints);

        for(var extraG = 0; extraG < Object.keys(extraGroupStatistics).length; extraG++){
            var funcName = Object.keys(extraGroupStatistics)[extraG];
            statistics.categories[category][funcName] = extraGroupStatistics[funcName](categoryDataPoints);
        } 
    }
    for(var extra = 0; extra < Object.keys(extraOverallStatistics).length; extra++){
        var funcName = Object.keys(extraOverallStatistics)[extra];
        statistics[funcName] = extraOverallStatistics[funcName](categoryDataPoints);
    }

    dataSet.setStatistics(statistics);
    return statistics;
}