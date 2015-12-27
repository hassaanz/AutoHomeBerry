var path = require('path');

var camRecord = require(path.resolve(__dirname + '/camRecord'));
var gpioController = require(path.resolve(__dirname + '/gpioController'));
/*
 * Function onGpioMessage. Handles a GPIO control message received from a client.
 * @param data Object defining the GPIO Pin and Pin status to be modified.
 * pinStatus true sets pin state as high..
 * pinStatus false sets pin state as low.
 **/
function onGpioMessage(data) {
	if (data && data.pinNum && data.pinStatus) {
		var pin = data.pinNum;
		var pinStatus = data.pinStatus;
		// Change GPIO Pin status
		gpioController.setPinState(pin, pinStatus);
	}
}

/*
 * Function onCameraMessage. Handles a camera control message received from
 * a client.
 * @param camStatus boolean defining the camera state to be changed to.
 * true mean start sending camera stream.
 * false mean stop sending camera stream.
 **/
function onCameraMessage(camStatus) {
	if (camStatus == true) {
		// Turn On Camera
		// @TODO
		camRecord.start(function(err, ))
	} else {
		// Turn Off Camera
	}
}

var socketIOHandler = {
	_sockets : [],
	/*
	 * Function initialize. Initializes the socket.io event listeners.
	 * @param io. The socket.io objecct for which event listeners are to be
	 * attached.
	 **/
	initialize: function(io) {
		io.on('connection', function (socket) {
			socketIOHandler._sockets.push(socket);
			socket.on('gpio', function(data) {
				onGpioMessage(data);
			});
			socket.on('camera', function(camStatus) {
				onCameraMessage(camStatus);
			})
			socket.on('gpioStates', function(camStatus) {
				var pinsArr = gpioController.getPinsState();
				socket.emit('gpioStates', pinsArr);
			})

		})
	}
}

module.exports = socketIOHandler;
