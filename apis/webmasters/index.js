const google = require('googleapis');
const wmapi = google.webmasters('v3');

wmapi.searchanalytics.query({
	key: 'AIzaSyAzlPcHhmCh_nkMFNxOudU5Gz2bOaTdadQ',
	siteUrl: 'https://www.visitspokane.com/',
	startDate: '2017-09-01',
	endDate: '2017-09-02'
}, function(err, res, data) {
	console.log(err);
	console.log(res);
	console.log(data);
});
