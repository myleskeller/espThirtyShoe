//TODO binary websocket
//TODO make communication follow standardized format
//TODO modularize sensor component
//TODO type
//TODO graph
//TODO coordinates/orientation

// var websocket_address = "ws://192.168.88.16:81/";
// var websocket_address = "ws://127.0.0.1:81/";
var message_array = [31];
var mcu_string;
const indices = {
	'LINEAR_ACCELEROMETER_X': 0,
	'LINEAR_ACCELEROMETER_Y': 1,
	'LINEAR_ACCELEROMETER_Z': 2,
	'POSITION_X': 3,
	'POSITION_Y': 4,
	'POSITION_Z': 5,
	'DISTANCE_R': 6, //swapped
	'DISTANCE_L': 7, //swapped
	'EULER_ROLL': 8,
	'EULER_PITCH': 9,
	'EULER_YAW': 10,
	'TIMESTAMP': 11,
	'MOVEMENT': 12,
	'VELOCITY_X': 13,
	'VELOCITY_Y': 14,
	'VELOCITY_Z': 15,
	'GYROMETER_X': 16,
	'GYROMETER_Y': 17,
	'GYROMETER_Z': 18,
	'MAGNOMETER_X': 19,
	'MAGNOMETER_Y': 20,
	'MAGNOMETER_Z': 21,
	'MAGNOMETER_A': 22,
	'ACCELEROMETER_X': 23,
	'ACCELEROMETER_Y': 24,
	'ACCELEROMETER_Z': 25,
	'QUATERNION_X': 26,
	'QUATERNION_Y': 27,
	'QUATERNION_Z': 28,
	'QUATERNION_R': 29,
	'QUATERNION_A': 30
};

const headers = Object.keys(indices);
var laX = message_array[indices.LINEAR_ACCELEROMETER_X];
var laY = message_array[indices.LINEAR_ACCELEROMETER_Y];
var laZ = message_array[indices.LINEAR_ACCELEROMETER_Z];

var eP = message_array[indices.EULER_ROLL]; //swapped
var eR = message_array[indices.EULER_PITCH]; //swapped
var eY = message_array[indices.EULER_YAW];

var dR = message_array[indices.DISTANCE_R];
var dL = message_array[indices.DISTANCE_L];

var pX = message_array[indices.POSITION_X];
var pY = message_array[indices.POSITION_Y];
var pZ = message_array[indices.POSITION_Z];

var qX = message_array[indices.QUATERNION_X];
var qY = message_array[indices.QUATERNION_Y];
var qZ = message_array[indices.QUATERNION_Z];
var qR = message_array[indices.QUATERNION_R];
var qA = message_array[indices.QUATERNION_A];

var mA = message_array[indices.MAGNOMETER_A];

var sp = message_array[indices.TIMESTAMP];

function initWebSocket(websocket_address) {
	websocket_address = "ws://" + websocket_address + '/';

	// connection = new WebSocket(websocket_address);
	connection = new ReconnectingWebSocket(websocket_address, null, {
		debug: false,
		reconnectInterval: 3000
	});

	connection.onopen = function () {
		connection.send('Connect ' + new Date());
		resumeChart();
	};

	connection.onerror = function (error) {
		console.log('WebSocket Error ', error);
	};

	connection.onmessage = function (e) {
		// console.log('Server: ', e.data)
		//* dialogue communication channel
		if (e.data[0] == '$') {
			if (e.data[1] == '$') // "$$" means procedure complete.
				closeDialogue();
			else {
				mcu_string = e.data.slice(1);
				// mcu_string = mcu_string.replace(/$/g, '\n');
				mcu_string = mcu_string.split('$').join('\n');

				mcu_string = mcu_string.replace("Enter [Y]", "Press OK");
				// console.log(mcu_string);
				updateDialogue();
				showDialogue();
			}
		} else if (e.data[0] != ',') {
			var console_message = e.data;
			addConsoleLog(console_message);
			console.log('Server: ', e.data);
		} else {
			message_array = e.data.split(" ").join("").slice(1).split(',');
			validateData(message_array);
			//* should set all empty csv data from MCU to 0.
			message_array.forEach(function (element) {
				if (typeof element == 'undefined' || element.length == 0 || element == null || element == undefined) {
					element = 0;
				}
				// console.log(message_array);
			});

			updateGraphics();
			updateVariables();
			updateChart(dL, dR);
			colorScaleValue(dL);
			colorScaleValue(dR);
			sendDataToFileStream();
			// updateDialogue();
		}
	};

	connection.onclose = function () {
		console.log('WebSocket connection closed');
		pauseChart();
	};
}

function validateData() {
	laX = message_array[indices.LINEAR_ACCELEROMETER_X];
	laY = message_array[indices.LINEAR_ACCELEROMETER_Y];
	laZ = message_array[indices.LINEAR_ACCELEROMETER_Z];

	eR = message_array[indices.EULER_ROLL];
	eP = message_array[indices.EULER_PITCH];
	eY = message_array[indices.EULER_YAW];

	pX = message_array[indices.POSITION_X];
	pY = message_array[indices.POSITION_Y];
	pZ = message_array[indices.POSITION_Z];

	qX = message_array[indices.QUATERNION_X];
	qY = message_array[indices.QUATERNION_Y];
	qZ = message_array[indices.QUATERNION_Z];
	qR = message_array[indices.QUATERNION_R];
	qA = message_array[indices.QUATERNION_A];

	switch (parseInt(message_array[indices.MOVEMENT])) {
		case 1:
			mv = "Motionless";
			break;
		case 2:
			mv = "???";
			break;
		case 3:
			mv = "Stable";
			break;
		case 4:
			mv = "Moving";
			break;
		default:
			console.log("message_array is messed up.");
			break;
	}

	switch (parseInt(message_array[indices.MAGNOMETER_A])) {
		case 0:
			mA = "Unreliable";
			break;
		case 1:
			mA = "Low";
			break;
		case 2:
			mA = "Medium";
			break;
		case 3:
			mA = "High";
			break;
		default:
			console.log("message_array is messed up.");
			break;
	}

	sp = parseInt(message_array[indices.TIMESTAMP]) / 1000; //easier to remove floating point at arduino level and convert back here

	var dRNew = message_array[indices.DISTANCE_R];
	var dLNew = message_array[indices.DISTANCE_L];
	if (dRNew > max_range || dRNew < min_range) {
		dR = Number.NaN;
	} else {
		dR = dRNew;
	}
	if (dLNew > max_range || dLNew < min_range) {
		dL = Number.NaN;
	} else {
		dL = dLNew;
	}
}
