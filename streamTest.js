var http = require("http");
var pngjs = require("pngjs");
var v4l2camera = require("v4l2camera");
var fs = require("fs");

var os = require('os');
var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
	var alias = 0;
	ifaces[ifname].forEach(function (iface) {
		if ('IPv4' !== iface.family || iface.internal !== false) {
		  // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
		  return;
		}
	    if (alias >= 1) {
	      // this single interface has multiple ipv4 addresses
	      console.log(ifname + ':' + alias, iface.address);
	    } else {
	      // this interface has only one ipv4 adress
	      console.log(ifname, iface.address);
	    }
	    ++alias;
	});
});

function toArrayBuffer(uintArr) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

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

var serverPort = 3001;

var times = function (n, async, cont) {
    return async(function rec(r) {return --n == 0 ? cont(r) : async(rec);});
};

var server = http.createServer(function (req, res) {
    //console.log(req.url);
    if (req.url === "/") {
        res.writeHead(200, {
            "content-type": "text/html;charset=utf-8",
        });
        res.end([
            "<!doctype html>",
            "<html><head><meta charset='utf-8'/>",
            "<script>(", script.toString(), ")()</script>",
            "</head><body>",
            "<img id='cam' width='352' height='288' />",
            "</body></html>",
        ].join(""));
        return;
    }
    if (req.url.match(/^\/.+\.jpg$/)) {
        res.writeHead(200, {
			'content-type': 'image/jpeg',
            "cache-control": "no-cache",
        });
		cam.start();
		times(6, cam.capture.bind(cam), function () {
	        var raw = cam.frameRaw();
			var stream = fs.createWriteStream("result.jpg");
			stream.end(Buffer(raw));
	        cam.stop();
			stream.on('end', function() {
				console.log('File saved');
				fs.createReadStream("result.jpg").pipe(res);
			});
	    });
    }
});
console.log('HTTP Server started on port:', serverPort);
server.listen(serverPort);

var script = function () {
    window.addEventListener("load", function (ev) {
        var cam = document.getElementById("cam");
        (function load() {
			var xhr = new XMLHttpRequest();
			xhr.open( "GET", "/" + Date.now() + ".png", true );
			xhr.responseType = "arraybuffer";
			var arrayBufferView = new Uint8Array( this.response );
		    var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
		    var urlCreator = window.URL || window.webkitURL;
		    var imageUrl = urlCreator.createObjectURL( blob );
		    var img = document.querySelector("#cam");
		    img.src = imageUrl;

            img.addEventListener("load", function loaded(ev) {
                cam.parentNode.replaceChild(img, cam);
                img.id = "cam";
                cam = img;
                load();
            }, false);
            img.src = "/" + Date.now() + ".jpg";
        })();
    }, false);
};

var toPng = function () {
    var rgb = cam.frameRaw();
    // var png = new pngjs.PNG({
    //     width: cam.width, height: cam.height,
    //     deflateLevel: 1, deflateStrategy: 1,
    // });
    // var size = cam.width * cam.height;
    // for (var i = 0; i < size; i++) {
    //     png.data[i * 4 + 0] = rgb[i * 3 + 0];
    //     png.data[i * 4 + 1] = rgb[i * 3 + 1];
    //     png.data[i * 4 + 2] = rgb[i * 3 + 2];
    //     png.data[i * 4 + 3] = 255;
    // }
	var png = rgb;
    return png;
};

var cam = new v4l2camera.Camera("/dev/video0")
var reqFormat = 'MJPG';
var width = 640;
var height = 480;

// console.log(cam.formats)
var format = getCamFormat(cam.formats, reqFormat, width, height);
console.log(format);
if (format == null) {
	console.log('Format' + reqFormat + 'not supported');
	process.exit(-1);
}
cam.configSet(format);
//console.log(cam.configGet());
// if (cam.configGet().formatName !== "YUYV") {
//     console.log("YUYV camera required");
//     process.exit(1);
// }

cam.configSet({width: 352, height: 288});
// cam.start();

// var camTimer;
// var framesCaptured = 0;
// var captureFrame = function() {
// 	cam.capture(function() {
// 		// if (framesCaptured++ > 24) {
// 		// 	camTimer = setTimeout(captureFrame, 1000);
// 		// 	framesCaptured = 0;
// 		// } else {
// 		// 	camTimer = setTimeout(captureFrame, 10);
// 		// }
// 		camTimer = setTimeout(captureFrame, 500);
// 	});
// }
// camTimer = setTimeout(captureFrame, 0);

// cam.capture(function loop() {
//     cam.capture(loop);
// });
