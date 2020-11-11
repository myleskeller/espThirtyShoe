var recording_data = false;
var start_time;
var total_time;
var recorded_data = [];
var skip_counter = 0;

function tableau(element_id, output_filename) {
	if (typeof Downloadify !== 'undefined') Downloadify.create(element_id, {
		swf: 'downloadify.swf',
		downloadImage: 'download.png',
		width: 100,
		height: 30,
		filename: ofile,
		data: function () {
			return doit('xlsx', output_filename, true);
		},
		transparent: false,
		append: false,
		dataType: 'base64',
		onComplete: function () {
			alert('Your File Has Been Saved!');
		},
		onCancel: function () {
			alert('You have cancelled the saving of this file.');
		},
		onError: function () {
			alert('You must put something in the File Contents or there will be nothing to save!');
		}
	});
	else document.getElementById(element_id).innerHTML = "";
}

function doit(type, filename, dl) {
	var ws = XLSX.utils.json_to_sheet(recorded_data, {
		skipHeader: true
	});
	var wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "Sensor Data");

	return dl ?
		XLSX.write(wb, {
			bookType: type,
			bookSST: true,
			type: 'base64'
		}) :
		XLSX.writeFile(wb, filename);
}

function doitCSV() {
	var ws = XLSX.utils.json_to_sheet(recorded_data, { skipHeader: true });

	// console.log(ws);
	var csv = XLSX.utils.sheet_to_csv(ws);
	console.log(csv);
	function s2ab(s) {
		var buf = new ArrayBuffer(s.length);
		var view = new Uint8Array(buf);
		for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
		return buf;
	}

	//! WHY DOES THIS LOOK CORRECT IN THE CONSOLE BUT NOT IN THE CSV FILE???!
	//TODO see if you can manually remove that CR or LB or whatever from the csv prior to writing?
	saveAs(new Blob([s2ab(csv)], { type: "application/octet-stream" }), "data.csv");
}



function beginRecordDataToFileStream() {
	recording_data = true;
	console.log("recording sensor data to filestream.");
	arrh = [
		"Packet number",
		"Gyroscope X (deg/s)", "Gyroscope Y (deg/s)", "Gyroscope Z (deg/s)",
		"Accelerometer X (g)", "Accelerometer Y (g)", "Accelerometer Z (g)",
		"Magnetometer X (G)", "Magnetometer Y (G)", "Magnetometer Z (G)"
	];
	recorded_data.push(arrh);
	// start_time = Date.now();
	start_time = 0;
	total_time = 0;
}

/*
function endRecordDataToFileStream() {
	tableau('button_toggleRecordData', 'data.xlsx');
	recording_data = false;
	doit('xlsx', 'data.xlsx');
	recorded_data = {};
	console.log("recorded " + magwick_array[magwick_indices.TIMESTAMP] + " iterations of sensor data.");
	start_time = null;
	skip_counter = 0;
}
*/

function endRecordDataToFileStream() {
	tableau('button_toggleRecordData', 'data.csv');
	recording_data = false;
	doitCSV();
	// doit('csv', 'data.csv');
	recorded_data = {};
	console.log("recorded " + total_time + " iterations of sensor data.");
	start_time = null;
	total_time = 0;
	skip_counter = 0;
}

function cancelRecordDataToFileStream() {
	recording_data = false;
	recorded_data = {};
	start_time = null;
	total_time = 0;
	skip_counter = 0;
}

/*
function sendDataToFileStream() { //this was the old version
	if (recording_data === true) {
		message_array[indices.TIMESTAMP] = getTimestamp();
		// console.log(message_array);
		// console.log("length: "+recorded_data.length);

		recorded_data.push(message_array);
	}
}
*/

function getTimestamp() {
	var updatedTime = Date.now();
	var difference = updatedTime - start_time;
	// console.log(parseFloat(difference) / 1000);
	return parseFloat(difference) / 1000;
}


function sendDataToFileStream() {
	if (recording_data === true) {

		total_time += 1;
		skip_counter++;
		if (skip_counter >= 2) { //* hopefully does the weird skip-every-two-iterations thing that magwick does in their test data
			total_time += 1;
			skip_counter = 0;
		}
		arr = [
			total_time,
			message_array[indices.GYROMETER_X], message_array[indices.GYROMETER_Y], message_array[indices.GYROMETER_Z],
			message_array[indices.ACCELEROMETER_X], message_array[indices.ACCELEROMETER_Y], message_array[indices.ACCELEROMETER_Z],
			message_array[indices.MAGNOMETER_X], message_array[indices.MAGNOMETER_Y], message_array[indices.MAGNOMETER_Z]
		];

		// magwick_array[magwick_indices.GYROMETER_X] = message_array[indices.GYROMETER_X];
		// magwick_array[magwick_indices.GYROMETER_Y] = message_array[indices.GYROMETER_Y];
		// magwick_array[magwick_indices.GYROMETER_Z] = message_array[indices.GYROMETER_Z];

		// magwick_array[magwick_indices.ACCELEROMETER_X] = message_array[indices.ACCELEROMETER_X];
		// magwick_array[magwick_indices.ACCELEROMETER_Y] = message_array[indices.ACCELEROMETER_Y];
		// magwick_array[magwick_indices.ACCELEROMETER_Z] = message_array[indices.ACCELEROMETER_Z];

		// magwick_array[magwick_indices.MAGNOMETER_X] = message_array[indices.MAGNOMETER_X];
		// magwick_array[magwick_indices.MAGNOMETER_Y] = message_array[indices.MAGNOMETER_Y];
		// magwick_array[magwick_indices.MAGNOMETER_Z] = message_array[indices.MAGNOMETER_Z];

		console.log(arr);
		// console.log("length: "+recorded_data.length);

		recorded_data.push(arr);
	}
}