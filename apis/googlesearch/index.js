var request = require('request');
var googleapis = require('googleapis');
var qs = require('querystring');
var apiurl = 'https://www.googleapis.com/webmasters/v3/sites/[SITE_URL]/searchAnalytics/query?key=';
var apikey = process.env.GOOGLE_API_KEY;

console.log(googleapis);

// Returns Google Search Analytics Data
var get = function(url) {
  return url;
}

// Public API
module.exports = {
	get : get
}