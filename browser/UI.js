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
	document.getElementById("button_expandSettingsMenu").addEventListener("click", function(event) {
		expandSettingsMenu();
		alert("not implemented yet.");
	});

	document.getElementById("button_toggleAccelerometerMotion").addEventListener("click", function(event) {
		document.getElementById('button_toggleAccelerometerMotion').classList.toggle('active');
		if (motion_translation == true) {
			motion_translation = false;
		} else {
			motion_translation = true;
		}
	});

	document.getElementById("button_toggleConsoleVisibility").addEventListener("click", function(event) {
		var _console = document.getElementById('console');
		document.getElementById('button_toggleConsoleVisibility').classList.toggle('active');

		if (_console.style.display === 'none') {
			_console.style.display = 'flex';
		} else {
			_console.style.display = 'none';
		}
	});

	document.getElementById("button_changeShoeTexture").addEventListener("click", function(event) {
		document.getElementById('button_changeShoeTexture').classList.toggle('active');
		toggleWireframe();
	});

	document.getElementById("button_restartESP").addEventListener("click", function(event) {
		connection.send('!');
		// alert("ESP32 restart command sent.");
	});

	document.getElementById("button_checkSensors").addEventListener("click", function(event) {
		connection.send('?');
		// alert("asking ESP32 for sensor statuses.");
	});

	document.getElementById("button_changeUpdateSpeed").addEventListener("click", function(event) {
		changeUpdateSpeed();
	});

	var _record = document.getElementById('button_toggleRecordData');
	_record.addEventListener("click", function(event) {
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
	_record.addEventListener("mouseover", function(event) {
		if (recording_data == false) {
			_record.style.color = secondaryColor;
		} else {
			_record.style.color = data1Color;
		}
	});
	_record.addEventListener("mouseout", function(event) {
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
	addMouseListeners(document.getElementById("button_checkSensors"));
	addMouseListeners(document.getElementById("button_restartESP"));
	addMouseListeners(document.getElementById("button_changeUpdateSpeed"));
	addMouseListeners(document.getElementById("button_toggleAccelerometerMotion"));
}

function addMouseListeners(element) {
	element.addEventListener("mouseover", function(event) {
		element.style.color = secondaryColor;
	});
	element.addEventListener("mouseout", function(event) {
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
		connection.send('f0');
		addConsoleLog("polling rate set to realtime.");
	} else {
		connection.send('f' + rate);
		addConsoleLog('polling rate set to ' + rate + '.');
	}
	changeChartFrameRate();
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
	document.getElementById('gravityX').textContent = '<' + gravityX + ', ';
	document.getElementById('gravityY').textContent = gravityY + ', ';
	document.getElementById('gravityZ').textContent = gravityZ + '>';
	// document.getElementById('gX').textContent = '(' + gX + ', ';
	// document.getElementById('gY').textContent = gY + ', ';
	// document.getElementById('gZ').textContent = gZ + ') ';
	document.getElementById('eR').textContent = '(' + THREE.Math.radToDeg(eR) + ', ';
	document.getElementById('eP').textContent = THREE.Math.radToDeg(eP) + ', ';
	document.getElementById('eY').textContent = THREE.Math.radToDeg(eY) + ')';

	document.getElementById('pX').textContent = '<' + pX + ', ';
	document.getElementById('pY').textContent = pY + ', ';
	document.getElementById('pZ').textContent = pZ + '>';

	document.getElementById('sp').textContent = sp;
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
