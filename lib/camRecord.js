var camRecord = {}

function getCamFormat(camFormats, reqFormat, width, height) {
	var retFor = null;
	for (var i = 0; i < camFormats.length; i++) {
		var f = camFormats[i];
		// console.log(f);
		if (f.formatName == reqFormat) {
			retFor = f;
			if (f.width == width && f.height == height) {
				retFor = f;
				break;
			}
		}
	}
	return retFor;
}

var toPng = function () {
    var rgb = cam.toRGB();
    var png = new pngjs.PNG({
        width: cam.width, height: cam.height,
        deflateLevel: 1, deflateStrategy: 1,
    });
    var size = cam.width * cam.height;
    for (var i = 0; i < size; i++) {
        png.data[i * 4 + 0] = rgb[i * 3 + 0];
        png.data[i * 4 + 1] = rgb[i * 3 + 1];
        png.data[i * 4 + 2] = rgb[i * 3 + 2];
        png.data[i * 4 + 3] = 255;
    }
    return png;
};

var cam = new v4l2camera.Camera("/dev/video0")
var reqFormat = 'YUYV';
var width = 640;
var height = 480;

var format = getCamFormat(cam.formats, reqFormat, width, height);
console.log(format);
cam.configSet(format);


if (cam.configGet().formatName !== "YUYV") {
    console.log("YUYV camera required");
    process.exit(1);
}

camRecord.start = function startCam(format, wd, ht, cb) {
	var callback = cb;
	if (typeof(format) == 'function') {
		callback = format;
	}
	var reqFormat = format || 'YUYV';
	var width = wd || 640;
	var height = ht || 480;

	var cam = new v4l2camera.Camera("/dev/video0")

	var format = getCamFormat(cam.formats, reqFormat, width, height);
	cam.configSet(format);

	if (cam.configGet().formatName !== "YUYV") {
		return callback('YUYV camera required');
	}
	if (this._recording) {
		return callback('Camera already started.');
	}

	this._recording = true;
	this._cam =cam;
	cam.start();
	callback(null, 'Camera Started')''
}

camRecord.stop = function stopCam(cb) {
	if (this._recording === true) {
		this._recording = false;
		cam.stop(cb);
	}
}
camRecord.getFrame = function getCamFrame(cb) {
	if (this._recording) {
		cam.capture(function() {
			var frameArr = cam.frameRaw();
			cb(null, frameArr);
		})
	} else {
		cb('Must Start camera before fetching frame. See camRecord.start');
	}
}

module.exports = camRecord;
