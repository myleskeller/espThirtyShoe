//for cross-browser support of window visibility detection
var page_visible = true;
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") {
	hidden = "hidden";
	visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
	hidden = "msHidden";
	visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
	hidden = "webkitHidden";
	visibilityChange = "webkitvisibilitychange";
}
// Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document.addEventListener === "undefined" || hidden === undefined)
	console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");

function handleVisibilityChange() {
	if (document[hidden]) {
		page_visible = false;
		// console.log("invisible");
	} else {
		page_visible = true;
		// console.log("visible");
	}
}

function addEventListeners() {
	// Handle page visibility change
	document.addEventListener(visibilityChange, handleVisibilityChange, false);

	//click listeners
	document.getElementById("button_expandSettingsMenu").addEventListener("click", function (event) {
		expandSettingsMenu();
		alert("not implemented yet.");
	});

	document.getElementById("dialogue_ok").addEventListener("click", function (event) {
		connection.send('Y');
	});

	document.getElementById("button_toggleAccelerometerMotion").addEventListener("click", function (event) {
		document.getElementById('button_toggleAccelerometerMotion').classList.toggle('active');
		if (motion_translation == true) {
			motion_translation = false;
		} else {
			motion_translation = true;
		}
	});

	document.getElementById("button_toggleChartVisibility").addEventListener("click", function (event) {
		var _chart = document.getElementById('chart');
		var _axis = document.getElementById('time-axis-container');
		document.getElementById('button_toggleChartVisibility').classList.toggle('active');

		if (_chart.style.display === 'none') {
			_chart.style.display = 'flex';
			_axis.style.display = 'block';
			resumeChart();
		} else {
			_chart.style.display = 'none';
			_axis.style.display = 'none';
			pauseChart();
		}
	});

	document.getElementById("button_toggleConsoleVisibility").addEventListener("click", function (event) {
		var _console = document.getElementById('console');
		document.getElementById('button_toggleConsoleVisibility').classList.toggle('active');

		if (_console.style.display === 'none') {
			_console.style.display = 'flex';
		} else {
			_console.style.display = 'none';
		}
	});

	for (i = 0; i < sensors.length; i++) {
		//TODO add procedural adding of click listeners to toggle state of sensors
		var _name = sensors[i].name;
		var button_element = 'button_' + _name;

		var _button_element = document.getElementById(button_element);
		addMouseListeners(_button_element);
		console.log("added event listeners for " + sensors[i].name)

		_button_element.addEventListener("click", function (event) {
			//* toggle state of button
			_button_element.classList.toggle('active');
			//* toggle rendering of object
			// var __name = _name;
			// var _sensor = sensors.filter(obj => {
			// 	return obj.name === __name;
			// })
			var __name = this.id.replace("button_", '');
			// console.log("who dis?" + __name);
			// var _sensor = this.//syntax to get element id as string//
			// console.log("is sensors already create??" + sensors);

			// var _sensor = sensors.filter(obj => {
			// 	return obj.name === __name;
			// })
			var _sensor = sensors.find(x => x.name == __name);
			this.classList.toggle('active');

			// console.log("who dis?" + _sensor.name)

			_sensor.toggleVisibility(); //! this reference is out of scope and will need to be accomplished another way.
			// if (sensors[i].visible == false) {
			// 	// if (_console.style.display === 'none') {
			// 	sensors[i].visible = true;
			// 	// _console.style.display = 'flex';
			// } else {
			// 	sensors[i].visible = false;
			// 	// _console.style.display = 'none';
			// }
		});
	}

	document.getElementById("button_changeShoeTexture").addEventListener("click", function (event) {
		document.getElementById('button_changeShoeTexture').classList.toggle('active');
		toggleWireframe();
	});

	document.getElementById("button_restartESP").addEventListener("click", function (event) {
		connection.send('!');
	});

	document.getElementById("button_calibrateAccel").addEventListener("click", function (event) {
		result = confirm("To calibrate the accelerometer, set the shoe on a still surface and press OK.");
		if (result == true) {
			connection.send('0');
		} else {
			handleConsoleData("Calibration cancelled.");
		}
	});

	document.getElementById("button_emaFilterToggle").addEventListener("click", function (event) {
		connection.send('e');
		document.getElementById('button_emaFilterToggle').classList.toggle('active');
		document.getElementById('button_emaFilterToggleIcon').classList.toggle('active');
	});

	document.getElementById("button_lpFilterToggle").addEventListener("click", function (event) {
		connection.send('l');
		document.getElementById('button_lpFilterToggle').classList.toggle('active');
		document.getElementById('button_lpFilterToggleIcon').classList.toggle('active');
	});

	document.getElementById("button_hpFilterToggle").addEventListener("click", function (event) {
		connection.send('h');
		document.getElementById('button_hpFilterToggle').classList.toggle('active');
		document.getElementById('button_hpFilterToggleIcon').classList.toggle('active');

	});

	document.getElementById("button_tareGyro").addEventListener("click", function (event) {
		connection.send('c');
		alert("are you sure you want to tare the IMU?");
	});

	document.getElementById("button_changeUpdateSpeed").addEventListener("click", function (event) {
		changeUpdateSpeed();
	});

	document.getElementById("button_changeFilterFrequency").addEventListener("click", function (event) {
		changeFilterAlpha();
	});

	document.getElementById("emaval").addEventListener("click", function (event) {
		changeFilterAlpha();
	});

	document.getElementById("lpval").addEventListener("click", function (event) {
		changeLPFilter();
	});

	document.getElementById("hpval").addEventListener("click", function (event) {
		changeHPFilter();
	});

	var _record = document.getElementById('button_toggleRecordData');
	_record.addEventListener("click", function (event) {
		if (recording_data == false) {
			_record.classList.toggle('mdi-record-rec');
			_record.classList.toggle('mdi-stop-circle');
			_record.style.color = errorColor;
			beginRecordDataToFileStream();
		} else {
			endRecordDataToFileStream();
			_record.classList.toggle('mdi-record-rec');
			_record.classList.toggle('mdi-stop-circle');
			_record.style.color = disabledColor;
		}
	});
	_record.addEventListener("mouseover", function (event) {
		if (recording_data == false) {
			_record.style.color = secondaryColor;
		} else {
			_record.style.color = data1Color;
		}
	});
	_record.addEventListener("mouseout", function (event) {
		if (recording_data == false) {
			_record.style.color = disabledColor;
		} else {
			_record.style.color = errorColor;
		}
	});

	// hover listeners
	addMouseListeners(document.getElementById("button_expandSettingsMenu"));
	addMouseListeners(document.getElementById("button_toggleChartVisibility"));
	addMouseListeners(document.getElementById("button_toggleConsoleVisibility"));
	addMouseListeners(document.getElementById("button_changeShoeTexture"));
	addMouseListeners(document.getElementById("button_tareGyro"));
	addMouseListeners(document.getElementById("button_restartESP"));
	addMouseListeners(document.getElementById("button_calibrateAccel"));
	addMouseListeners(document.getElementById("button_changeUpdateSpeed"));
	addMouseListeners(document.getElementById("button_emaFilterToggle"));
	addMouseListeners(document.getElementById("button_lpFilterToggle"));
	addMouseListeners(document.getElementById("button_hpFilterToggle"));
	addMouseListeners(document.getElementById("button_toggleAccelerometerMotion"));

	//gets and sets position of icons for weird, stacked icons
	var ema_top = document.getElementById("button_emaFilterToggle").getBoundingClientRect().top;
	var lp_top = document.getElementById("button_lpFilterToggle").getBoundingClientRect().top;
	var hp_top = document.getElementById("button_hpFilterToggle").getBoundingClientRect().top;

	var icon_height = document.getElementById("button_emaFilterToggle").clientHeight;


	//hacky way to stack mdi icons
	var _emaIcon = document.getElementById("button_emaFilterToggleIcon");
	_emaIcon.style.position = "absolute";
	_emaIcon.style.right = (10 - icon_height / 3) + 'px';
	_emaIcon.style.top = (ema_top - icon_height / 3) + 'px';
	var _lpIcon = document.getElementById("button_lpFilterToggleIcon");
	_lpIcon.style.position = "absolute";
	_lpIcon.style.right = (10 - icon_height / 3) + 'px';
	_lpIcon.style.top = (lp_top - icon_height / 3) + 'px';
	var _hpIcon = document.getElementById("button_hpFilterToggleIcon");
	_hpIcon.style.position = "absolute";
	_hpIcon.style.right = (10 - icon_height / 3) + 'px';
	_hpIcon.style.top = (hp_top - icon_height / 3) + 'px';
}

function addMouseListeners(element) {
	element.addEventListener("mouseover", function (event) {
		element.style.color = secondaryColor;
	});
	element.addEventListener("mouseout", function (event) {
		if (element.classList.contains("active")) {
			element.style.color = highEmphasisColor;
		} else {
			element.style.color = disabledColor;
		}
	});
}

function handleConsoleData(log) {
	console.log('Server: ', log);
	document.getElementById('logs').innerHTML += log + '</br>';
}

function changeUpdateSpeed() {
	rate = prompt("sensor polling rate (in milliseconds):", rate);
	if (rate == null || rate == "") {
		connection.send('r0');
		handleConsoleData("polling rate set to realtime.");
	} else {
		connection.send('r' + rate);
		handleConsoleData('polling rate set to ' + rate + '.');
	}
	changeChartFrameRate();
}

function handleConsoleData(log) {
	document.getElementById('logs').innerHTML += log + '</br>';
}

function changeFilterAlpha() {
	connection.send('$');
	freq = prompt("acceleration-to-position EMA filter alpha:", EMA);
	if (freq == null || freq == "") {
		handleConsoleData("alpha not changed.");
	} else {
		connection.send('f' + parseFloat(freq) * 1000); //changes 0.0# to #00, because i don't get how websocket deals with unsigned chars.
		handleConsoleData('alpha set to ' + freq + '.');
	}
}

function changeLPFilter() {
	connection.send('$');
	freq = prompt("acceleration-to-position low-pass filter cutoff frequency:", LP);
	if (freq == null || freq == "") {
		handleConsoleData("cutoff frequency not changed.");
	} else {
		connection.send('o' + parseFloat(freq) * 1000); //changes 0.0# to #00, because i don't get how websocket deals with unsigned chars.
		handleConsoleData('cutoff frequency set to ' + freq + '.');
	}
}

function changeHPFilter() {
	connection.send('$');
	freq = prompt("acceleration-to-position high-pass filter cutoff frequency:", HP);
	if (freq == null || freq == "") {
		handleConsoleData("cutoff frequency not changed.");
	} else {
		connection.send('i' + parseFloat(freq) * 1000); //changes 0.0# to #00, because i don't get how websocket deals with unsigned chars.
		handleConsoleData('cutoff frequency set to ' + freq + '.');
	}
}

function closeDialogue() {
	document.getElementById('dialogue').style.display = 'none';
	mcu_string = "";
}

function showDialogue() {
	document.getElementById('dialogue').style.display = 'block';
}

function updateDialogue() {
	if (document.getElementById('dialogue').style.display == 'block') {
		document.getElementById('dialogue_prompt').innerText = mcu_string;
	}
}

function initChecklist() {
	var content = '<table>';
	sensors.forEach(element => {
		content +=
			'<tr>' +
			'<td><i id="button_' + element.name + '" class="active mdi mdi-eye"></i></td>' +
			'<td>' + getIcon(element.icon) + '</td>' +//;
			'<td>' + element.name + '</td>';//+
		if (Array.isArray(element.index)) {
			for (i = 0; i < element.index.length; i++) {
				var label = Object.keys(indices)[element.index[i]].split('_')[1];
				content += '<td class="tooltip"><div id="item_' + element.name + i + '" class="item"></div><span class="tooltiptext">' + label + '</span></td>';
			}
		}
		else {
			var label = Object.keys(indices)[element.index].split('_')[1];
			content += '<td class="tooltip"><div id="item_' + element.name + '" class="item"></div><span class="tooltiptext"> !!!' + label + '</span></td>';
		}
		content += '</tr>';
	});

	content += '</table>';
	document.getElementById("info").innerHTML = content;

}

function getIcon(input) {
	return '<i class="mdi mdi-' + input + '">';
}

function LightenDarkenColor(col, amt) {
	var usePound = false;
	if (col[0] == "#") {
		col = col.slice(1);
		usePound = true;
	}
	var num = parseInt(col, 16);
	var r = (num >> 16) + amt;
	if (r > 255) r = 255;
	else if (r < 0) r = 0;
	var b = ((num >> 8) & 0x00FF) + amt;
	if (b > 255) b = 255;
	else if (b < 0) b = 0;
	var g = (num & 0x0000FF) + amt;
	if (g > 255) g = 255;
	else if (g < 0) g = 0;
	return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

function colorScaleValue(measurement) {
	var color;
	if (measurement < min_accurate_range) {
		var difference = min_accurate_range - measurement;
		// console.log(difference);

		color = LightenDarkenColor(errorColor, difference);
		// document.getElementById('"' + toString(measurement) + '"').style.color = color;
		// console.log(color);
	}
	if (measurement > max_accurate_range) {
		var difference = min_accurate_range - measurement;
		// console.log(difference);

		color = LightenDarkenColor(errorColor, difference);
		// document.getElementById(measurement).style.color = color;
		// console.log(color);
	}
}
