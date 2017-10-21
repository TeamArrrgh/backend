var google = require('googleapis');
var webmasters = google.webmasters('v3');
var OAuth2 = google.OAuth2('v2');
var oauth2Client = new OAuth2(
	"client_id",
	"client_secret",
	"redirectUrl"
);

var apiurl = 'https://www.googleapis.com/webmasters/v3/sites/[SITE_URL]/searchanalytics/query?key=';

// Returns Google Search Analytics Data
var get = function(url) {
	var rtnData = {};
	var params = {
		siteUrl : url,
		resource : "webmasters(v3).SearchAnalyticsQueryRequest"
	}

	// var data = webmasters.searchanalytics.query(params);

		// Retrieve tokens via token exchange explained above or set them:
	oauth2Client.setCredentials({
		access_token: 'ACCESS TOKEN HERE',
		refresh_token: 'REFRESH TOKEN HERE'
		// Optional, provide an expiry_date (milliseconds since the Unix Epoch)
		// expiry_date: (new Date()).getTime() + (1000 * 60 * 60 * 24 * 7)
	});

	webmasters.searchanalytics.query(params, {}, function (err, response) {
		rtnData = response;
	});

console.log('-------------------------------------------');
	return rtnData;
}

// Public API
module.exports = {
	get : get
}