var recording_data = false;
var start_time;
var recorded_data = [];

function tableau(element_id, output_filename) {
	if (typeof Downloadify !== 'undefined') Downloadify.create(element_id, {
		swf: 'downloadify.swf',
		downloadImage: 'download.png',
		width: 100,
		height: 30,
		filename: ofile,
		data: function() {
			return doit('xlsx', output_filename, true);
		},
		transparent: false,
		append: false,
		dataType: 'base64',
		onComplete: function() {
			alert('Your File Has Been Saved!');
		},
		onCancel: function() {
			alert('You have cancelled the saving of this file.');
		},
		onError: function() {
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

function beginRecordDataToFileStream() {
	recording_data = true;
	console.log("recording sensor data to filestream.");
	recorded_data.push(headers);
	start_time = Date.now();
}

function endRecordDataToFileStream() {
	tableau('button_toggleRecordData', 'data.xlsx');
	recording_data = false;
	doit('xlsx', 'data.xlsx');
	recorded_data = {};
	console.log("recorded " + message_array[indices.TIMESTAMP] + " seconds of sensor data.");
	start_time = null;
}

function cancelRecordDataToFileStream() {
	recording_data = false;
	recorded_data = {};
	start_time = null;
}

function sendDataToFileStream() {
	if (recording_data === true) {
		message_array[indices.TIMESTAMP] = getTimestamp();
		// console.log(message_array);
		// console.log("length: "+recorded_data.length);

		recorded_data.push(message_array);
	}
}

function getTimestamp() {
	var updatedTime = Date.now();
	var difference = updatedTime - start_time;
	// console.log(parseFloat(difference) / 1000);
	return parseFloat(difference) / 1000;
}
