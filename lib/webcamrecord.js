var chlidProc = require('child_process'),
	fs = require('fs');

var webcam = {};

function getWebCamObjs(cmdArr) {
	var retArr = [];
	for (var i = 0; i < cmdArr.length; i++) {
		var curStr = cmdArr[i];
		curStr.trim();
		console.log(curStr.toString('base64'));
		if (curStr !== "") {
			var tabInd = curStr.indexOf('\t'); 
			if (tabInd != -1) {
				curStr = curStr.substring(tabInd + 1, curStr.length);
			}
			retArr.push(curStr);
		}
	}
	return retArr;
}

// Use ffmpeg and v4l2 (video4linux2) to get Video capture devices list.
var getDevicesList = function getDevices() {
	var listDev = chlidProc.spawn('v4l2-ctl', ['--list-devices']);
	listDev.stdout.on('data', function(data) {
		var cmdRes = data.toString('ascii');
		cmdRes = getWebCamObjs(cmdRes.split("\n"));
		console.log('data:', cmdRes);
	});
	listDev.stderr.on('error', function(error) {
		console.err('Err listDev: ', error.toString('utf8'));
	});
	listDev.on('close' , function(closeCode) {
		console.log('List Devices closed with code: ', closeCode);
	});
};

webcam.getDevices = getDevicesList;

module.exports = webcam;