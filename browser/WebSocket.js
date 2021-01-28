//TODO convert ASCII websocket to binary 
//TODO make communication follow standardized format
//TODO rework graph to accommodate all sensors
//TODO integrate object coordinates/orientation into 3d positioning
//TODO fix the bs that broke with the node server for some reason
//TODO change sensors index to be dynamically allocated instead of hard-coded 


// var websocket_address = "ws://192.168.88.16:81/";
// var websocket_address = "ws://127.0.0.1:81/";
var message_array = [31];
var mcu_string;
const indices = {
	'LINEAR-ACCELEROMETER_X': 0,
	'LINEAR-ACCELEROMETER_Y': 1,
	'LINEAR-ACCELEROMETER_Z': 2,
	'POSITION_X': 3,
	'POSITION_Y': 4,
	'POSITION_Z': 5,
	'DISTANCE_RIGHT': 6, //swapped
	'DISTANCE_LEFT': 7, //swapped
	'EULER_ROLL': 8,
	'EULER_PITCH': 9,
	'EULER_YAW': 10,
	'TIMESTAMP': 11,
	'CLASSIFIER_MOVEMENT': 12,
	'VELOCITY_X': 13,
	'VELOCITY_Y': 14,
	'VELOCITY_Z': 15,
	'GYROMETER_X': 16,
	'GYROMETER_Y': 17,
	'GYROMETER_Z': 18,
	'MAGNOMETER_X': 19,
	'MAGNOMETER_Y': 20,
	'MAGNOMETER_Z': 21,
	'MAGNOMETER_ACCURACY': 22,
	'ACCELEROMETER_X': 23,
	'ACCELEROMETER_Y': 24,
	'ACCELEROMETER_Z': 25,
	'QUATERNION_I': 26,
	'QUATERNION_J': 27,
	'QUATERNION_K': 28,
	'QUATERNION_REAL': 29,
};

const headers = Object.keys(indices);

function initWebSocket(websocket_address) {
	websocket_address = "ws://" + window.location.hostname + ':81/';
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
		//* dialogue communication channel
		if (e.data[0] == '$') {
			handleDialogueData(e.data);
		} else if (e.data[0] != ',') {
			handleConsoleData(e.data);
		} else {
			handleSensorData(e.data);
			updateSensors();
			sendDataToFileStream();
		}
	};

	connection.onclose = function () {
		console.log('WebSocket connection closed');
		pauseChart();
	};
}

function updateSensors() {
	sensors.forEach(element => {
		element.validateOutput();

		if (page_visible) {
			element.updateUIValue();
			// element.updateGraphics(); //TODO massive overhaul of mesh and variable handling required.
			updateChart(sensors[7].value, sensors[8].value);
			// colorScaleValue(dL);
			// colorScaleValue(dR);
		}
	});
}

function handleSensorData(data) {
	message_array = data.split(" ").join("").slice(1).split(',');
	//* should set all empty csv data from MCU to 0.
	for (i = 0; i < message_array.length; i++) {
		if (typeof message_array[i] == 'undefined' || message_array[i].length == 0 || message_array[i] == null || message_array[i] == undefined) {
			message_array[i] = 0;
		}
		else {
			message_array[i] = parseFloat(message_array[i]);
		}
	}
}

function handleDialogueData(input) {
	if (input[1] == '$') // "$$" means procedure complete.
		closeDialogue();
	else {
		mcu_string = input.slice(1);
		// mcu_string = mcu_string.replace(/$/g, '\n');
		mcu_string = mcu_string.split('$').join('\n');

		mcu_string = mcu_string.replace("Enter [Y]", "Press OK");
		// console.log(mcu_string);
		updateDialogue();
		showDialogue();
	}
}