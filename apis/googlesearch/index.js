const googleTrends = require('google-trends-api');
var google = require('googleapis');
var webmasters = google.webmasters('v3');
var rawData = require('./raw_webmaster_data.json');
var moment = require('moment');

// Returns Google Search Analytics Data
var get = function(url) {
	var reportStruct = {};
	var count = 0;

	rawData['rows'].forEach(function(row){
		var newDate = new moment(row.keys[1]);
		var dateKey = newDate.format('YYYY').toString() + '-' + newDate.format('MM').toString();
		var tempData = {};

		if (count === 0 || (reportStruct[dateKey] === undefined)) {
			reportStruct[dateKey] = {
				keywords : {},
				keywordsArray : []
			};
		}

		if (reportStruct[dateKey].keywords[row.keys[0]] === undefined){
			tempData = {
				keyword : row.keys[0],
				frequency : 1,
				clicks : row.clicks,
				impressions : row.impressions,
				ctr : (row.ctr * 100),
				position : row.position,
				weight : ((row.clicks + row.impressions) * row.ctr)
			};
			reportStruct[dateKey].keywords[row.keys[0]] = tempData;
			// reportStruct[dateKey].keywordsArray.push(tempData);
		} else if (reportStruct[dateKey].keywords[row.keys[0]] !== undefined) {
			reportStruct[dateKey].keywords[row.keys[0]].frequency++;
			reportStruct[dateKey].keywords[row.keys[0]].clicks += row.clicks;
			reportStruct[dateKey].keywords[row.keys[0]].impressions += row.impressions;
			reportStruct[dateKey].keywords[row.keys[0]].ctr += row.ctr;
			reportStruct[dateKey].keywords[row.keys[0]].position += row.position;
			reportStruct[dateKey].keywords[row.keys[0]].weight = (
				((reportStruct[dateKey].keywords[row.keys[0]].clicks + reportStruct[dateKey].keywords[row.keys[0]].impressions) * reportStruct[dateKey].keywords[row.keys[0]].ctr) / 100
			);
		}
		count = count + 1;
		lastDateKey = dateKey;
	});

	for (var key in reportStruct) {
			// skip loop if the property is from prototype
			if (!reportStruct.hasOwnProperty(key)) continue;

			var obj = reportStruct[key].keywords;
			for (var prop in obj) {
					// skip loop if the property is from prototype
					if(!obj.hasOwnProperty(prop)) continue;
					reportStruct[key].keywordsArray.push(obj[prop]);
			}
			reportStruct[key].keywordsArray = arraySortBy(reportStruct[key].keywordsArray, "weight", "numeric", "desc");
	}
	return reportStruct;
}

// Returns Google Trends Data over time
var gettrendsovertime = function(keyword, startTime, endTime, geo) {
	var rtnData = [];

	rtnData = googleTrends.interestOverTime({keyword: keyword, startTime: startTime, endTime: endTime, geo: geo}).then((res) => {
		rtnData = res;
	}).catch((err) => {
		rtnData = [];
	})
	
	return rtnData;
}

	// Returns Google Trends Data over time
	// var getrelatedqueries = function(keyword, startdate, enddate, geo) {
	// 	var rtnData = {}
	// 	var params = {
	// 		keyword : term,
	// 		startTime : (startdate instanceof Date) ? startdate : new Date(startdate.toString()),
	// 		endTime : (startdate instanceof Date) ? enddate : new Date(enddate.toString()),
	// 		geo : (geo !== undefined) ? geo.toString() : 'US-WA-881'
	// 	}

	// 	googleTrends.relatedQueries(params).then((res) => {
	// 	  rtnData = res;
	// 	}).catch((err) => {
	// 	  console.log(err);
	// 	})
		
	// 	return rtnData;
	// }

	// private utility functions
	var arraySortBy = function(arr, prop, type, dir) {
		if (arr.length <= 1) { return arr; } // if the array is length 0 or 1 bail early
		
		var isSingle = prop instanceof Array && prop[0] instanceof Array ? false : true;
		var sortOps;
		if (isSingle === true) {
			sortOps = [{ prop : prop, type : type, dir : dir }];
		} else {
			// if multiple the arguments come in on prop so we need to unfold to an object
			sortOps = new Array(prop.length);
			for(var i = 0; i < prop.length; i++) {
				sortOps[i] = { prop : prop[i][0], type : prop[i][1], dir : prop[i][2] };
			}
		}
		
		// our prop should always be an array for lookup purposes
		for(var i = 0; i < sortOps.length; i++) {
			var op = sortOps[i];
			if (op.prop instanceof Array === false) { op.prop = [op.prop]; }
		}
		
		// go through the array and extract the values from it so that way we don't have to do a look-up on each comparison
		var temp = new Array(arr.length);
		for(var i = 0; i < arr.length; i++) {
			var item = arr[i];
			var result = { values : new Array(sortOps.length), index : i, sortOps : sortOps };
			for(var j = 0; j < sortOps.length; j++) {
				var op = sortOps[j];
				
				var value = item;
				for(var k = 0; k < op.prop.length; k++) {
					value = value[op.prop[k]];
					if (value === undefined) { break; }
				}
				
				result.values[j] = {
					raw : value, // original value needed in some comparisons
					clean : op.type === "alpha" && value !== undefined ? value.toLowerCase() : value
				}
			}
			
			temp[i] = result;
		}
		
		temp.sort(propCompare);
		
		// after the sort is completed, recompose our data array based on the indexes from our mapped array
		var done = new Array(temp.length);
		for(var i = 0; i < temp.length; i++) {
			done[i] = arr[temp[i].index];
		}
		return done;
	}
	
	var propCompare = function(a, b) {
		for(var i = 0; i < a.sortOps.length; i++) {
			var op = a.sortOps[i];
			var aVal = a.values[i].clean;
			var aValRaw = a.values[i].raw;
			var bVal = b.values[i].clean;
			var bValRaw = b.values[i].raw;
			var comp;
			
			if (aVal === undefined && bVal !== undefined) {
				comp = 1; // in an ascending sort undefined sorts to last, so if aVal is undefined bVal is smaller
			} else if (aVal !== undefined && bVal === undefined) {
				comp = -1; // in an ascending sort undefined sorts to last, so if bVal is undefined aVal is smaller
			} else if (aVal === undefined && bVal === undefined) {
				comp = 0; // both undefined, consider them equal
			} else if (op.type === "alpha") {
				// in alpha compare we want to compare without case first (all lower), and then with case, this way A goes before a and both go before B
				comp = aVal > bVal ? 1 : aVal < bVal ? -1 : aValRaw > bValRaw ? 1 : aValRaw < bValRaw ? -1 : 0;
			} else if (op.type === "numeric") {
				comp = aVal - bVal;
			} else if (op.type === "natural") {
				comp = naturalCompare(aVal, bVal);
			}
			
			if (comp !== 0) {
				comp *= op.dir === "asc" ? 1 : -1; // with a descending query we reverse the polarity
				return comp;
			}
		}
		
		return 0;
	}

// Public API
module.exports = {
	get : get,
	gettrendsovertime : gettrendsovertime,
	// getrelatedqueries : getrelatedqueries
}