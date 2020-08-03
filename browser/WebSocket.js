var websocket_address = "ws://192.168.88.16:81/";
var message_array = [12];
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
	'TIMESTAMP': 11
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

var sp = message_array[indices.TIMESTAMP];

function initWebSocket() {
	// connection = new WebSocket(websocket_address);
	connection = new ReconnectingWebSocket(websocket_address, null, {
		debug: false,
		reconnectInterval: 3000
	});

	connection.onopen = function() {
		connection.send('Connect ' + new Date());
		resumeChart();
	};

	connection.onerror = function(error) {
		console.log('WebSocket Error ', error);
	};

	connection.onmessage = function(e) {
		// console.log('Server: ', e.data);
		if (e.data[0] != ',') {
			var console_message = e.data;
			addConsoleLog(console_message);
			console.log('Server: ', e.data);

		} else {
			message_array = e.data.slice(1).split(',');
			validateData(message_array);

			updateGraphics(dL, dR, eR);
			updateVariables();
			updateChart(dL, dR);
			colorScaleValue(dL);
			colorScaleValue(dR);
			sendDataToFileStream();
		}
	};

	connection.onclose = function() {
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

	sp = parseInt(message_array[indices.TIMESTAMP])/1000; //easier to remove floating point at arduino level and convert back here

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
