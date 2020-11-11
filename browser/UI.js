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
			addConsoleLog("Calibration cancelled.");
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

function addConsoleLog(log) {
	document.getElementById('logs').innerHTML += log + '</br>';
}

function changeUpdateSpeed() {
	rate = prompt("sensor polling rate (in milliseconds):", rate);
	if (rate == null || rate == "") {
		connection.send('r0');
		addConsoleLog("polling rate set to realtime.");
	} else {
		connection.send('r' + rate);
		addConsoleLog('polling rate set to ' + rate + '.');
	}
	changeChartFrameRate();
}

function addConsoleLog(log) {
	document.getElementById('logs').innerHTML += log + '</br>';
}

function changeFilterAlpha() {
	connection.send('$');
	freq = prompt("acceleration-to-position EMA filter alpha:", EMA);
	if (freq == null || freq == "") {
		addConsoleLog("alpha not changed.");
	} else {
		connection.send('f' + parseFloat(freq) * 1000); //changes 0.0# to #00, because i don't get how websocket deals with unsigned chars.
		addConsoleLog('alpha set to ' + freq + '.');
	}
}

function changeLPFilter() {
	connection.send('$');
	freq = prompt("acceleration-to-position low-pass filter cutoff frequency:", LP);
	if (freq == null || freq == "") {
		addConsoleLog("cutoff frequency not changed.");
	} else {
		connection.send('o' + parseFloat(freq) * 1000); //changes 0.0# to #00, because i don't get how websocket deals with unsigned chars.
		addConsoleLog('cutoff frequency set to ' + freq + '.');
	}
}

function changeHPFilter() {
	connection.send('$');
	freq = prompt("acceleration-to-position high-pass filter cutoff frequency:", HP);
	if (freq == null || freq == "") {
		addConsoleLog("cutoff frequency not changed.");
	} else {
		connection.send('i' + parseFloat(freq) * 1000); //changes 0.0# to #00, because i don't get how websocket deals with unsigned chars.
		addConsoleLog('cutoff frequency set to ' + freq + '.');
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

function updateVariables() {
	// document.getElementById('steps').textContent = Math.round(steps);
	document.getElementById('dR').textContent = Math.round(dR);
	document.getElementById('dL').textContent = Math.round(dL);
	// document.getElementById('qI').textContent = '<' + qI + ', ';
	// document.getElementById('qJ').textContent = qJ + ', ';
	// document.getElementById('qK').textContent = qK + '> ';
	// document.getElementById('qA').textContent = Math.round(qA);
	// document.getElementById('aX').textContent = '<' + aX + ', ';
	// document.getElementById('aY').textContent = aY + ', ';
	// document.getElementById('aZ').textContent = aZ + '> ';
	// document.getElementById('aA').textContent = Math.round(aA);
	document.getElementById('laX').textContent = '<' + laX + ', ';
	document.getElementById('laY').textContent = laY + ', ';
	document.getElementById('laZ').textContent = laZ + '>';

	document.getElementById('vX').textContent = '[' + Math.round(vX * 100) / 100 + ', ';
	document.getElementById('vY').textContent = Math.round(vY * 100) / 100 + ', ';
	document.getElementById('vZ').textContent = Math.round(vZ * 100) / 100 + ']';
	// document.getElementById('gX').textContent = '(' + gX + ', ';
	// document.getElementById('gY').textContent = gY + ', ';
	// document.getElementById('gZ').textContent = gZ + ') ';
	document.getElementById('eR').textContent = '(' + Math.round(THREE.Math.radToDeg(eR * 100)) / 100 + ', ';
	document.getElementById('eP').textContent = Math.round(THREE.Math.radToDeg(eP * 100)) / 100 + ', ';
	document.getElementById('eY').textContent = Math.round(THREE.Math.radToDeg(eY * 100)) / 100 + ')';

	document.getElementById('pX').textContent = '[' + pX + ', ';
	document.getElementById('pY').textContent = pY + ', ';
	document.getElementById('pZ').textContent = pZ + ']';

	document.getElementById('sp').textContent = sp;

	document.getElementById('mv').textContent = mv;
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
