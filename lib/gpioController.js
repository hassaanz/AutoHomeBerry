var wpi = require('wiring-pi');

// Set numbering scheme to use.
wpi.setup('wpi');

var pins = [0, 2, 3, 1, 4, 5, 6, 7];

function isWritablePin(pinNum) {
	return pins.indexOf(pinNum) != -1? true: false;
}

function getAllPins() {
	var retArr = [];
	pins.forEach(function(pinNum) {
		wpi.pinMode(pinNum, wpi.OUTPUT);
		retArr.push({state: wpi.digitalRead(val), pin: pinNum});
	})
	return retArr;
}

function changePinState(pinNum, pinState, pinObjArr) {
	pinObjArr.forEach(function(pinObj) {
		if (pinObj.pin === pinNum) {
			pinObj.state = pinState;
			return;
		}
	});
}
var gpioController = {
	_pinStates : null,
	/**
	 * Function setPinState
	 * Set pin to read mode and set its value. Pin number refers to wiring-pi
	 * numbering scheme.
	 * @param pinNumber - Number. A pin number in wiring pi number scheme.
	 * @param pinState - boolean. True for high, false for low.
	 */
	setPinState: function(pinNumber, pinState) {
		if (this._pinStates === null) {
			this._pinStates = getAllPins();
		}
		var digitalVal = pinState === true ? 1 : 0;
		var pinNum = parseInt(pinNumber);
		if (isNaN(pinNum) || isNaN(digitalVal)) {
			return null;
		}
		if (!isWritablePin(pinNum)) {
			return null
		}
		// wpi.pinMode(pinNum, wpi.OUTPUT);
		wpi.digitalWrite(pinNum, digitalVal);
		changePinState(pinNum, digitalVal, this._pinStates);
		return true;
	},
	//Get an object containing all pins states.
	getPinsState: function() {
		this._pinStates = getAllPins();
		return this._pinStates;
	}
}

module.exports = gpioController;
