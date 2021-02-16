var chart;
var duration = 15; //seconds


//* customized click handler for legend (to figure out why clicks aren't always registered..)
var newLegendClickHandler = function (e, legendItem) {
	var index = legendItem.datasetIndex;
	var ci = this.chart;
	var meta = ci.getDatasetMeta(index);

	// See controller.isDatasetVisible comment
	meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;

	// We hid a dataset ... rerender the chart
	// console.log("click registered by legend.");
	ci.update();
};

function initChart(rate, refresh_frequency) {
	var id = 'chart';
	// var duration = 60000; //ms
	if (!refresh_frequency)
		refresh_frequency = 0;

	const container = document.createElement('canvas');
	container.id = "chart";
	var parent = document.getElementById("chart-container");
	parent.appendChild(container);
	container.width = parent.width;
	container.height = parent.height;

	Chart.defaults.global.defaultFontColor = mediumEmphasisColor;
	Chart.defaults.global.defaultFontFamily = "Futura";

	var datasets = [];

	platform.sensors.forEach(sensor => {
		if (sensor.isGraphed == true) {
			if (Array.isArray(sensor.index)) {
				for (var i = 0; i < sensor.index.length; i++) {
					datasets.push({
						data: [],
						pointRadius: 1,
						borderWidth: 1,
						label: sensor.name + '_' + i,
						borderColor: sensor.color,
						pointBackgroundColor: sensor.color, //? maybe make 3 distinct colors?
						pointBorderWidth: 0,
						pointRadius: 0,
						fill: false, // no fill
						lineTension: 0 // straight line
					});
				}
			}
			else {
				datasets.push({
					data: [],
					pointRadius: 1,
					borderWidth: 1,
					label: sensor.name,
					borderColor: sensor.color,
					pointBackgroundColor: sensor.color,
					pointBorderWidth: 0,
					pointRadius: 0,
					fill: false, // no fill
					lineTension: 0 // straight line
				});
			}
		}
	});

	var ctx = document.getElementById(id).getContext('2d');
	chart = new Chart(ctx, {
		type: 'line',
		spanGaps: false,
		maintainAspectRatio: false,
		data: {
			datasets: datasets
		},
		options: {
			// downsample: {
			// 	enabled: true,
			// 	threshold: 5,
			// },
			legend: {
				labels: {
					usePointStyle: true
				},
				position: "top",
				fullWidth: true,
				onClick: newLegendClickHandler
			},
			title: {
				display: "false"
			},
			scales: {
				xAxes: [{
					type: 'realtime', // auto-scroll on X axis
					realtime: {
						delay: 1000
					},
					display: false
				}],
				yAxes: [{
					position: "right",
				}]
			},
			plugins: {
				streaming: {
					refresh: refresh_frequency, //* controls data refresh frequency (in ms)
					duration: duration*1000,
					onRefresh: function (chart) { // callback on chart update interval
						var i = 0;
						var now = Date.now();
						platform.sensors.forEach(sensor => {
							if (sensor.isGraphed == true) {
								if (Array.isArray(sensor.index)) {
									for (var j = 0; j < sensor.index.length; j++) {
										Array.prototype.push.apply(
											chart.data.datasets[i].data, [{ x: now, y: sensor.value[j] }]); //? changed this while working uChart. did it help?
										i++;
									}
								}
								else {
									Array.prototype.push.apply(
										chart.data.datasets[i].data, [{ x: now, y: sensor.value }]);
									i++;
								}
							}
						});
					}
				}
			}
		}
	});
	fillTimeAxis(duration*1000);

	if (rate)
		changeChartFrameRate(rate);
}

function changeChartFrameRate(rate) {
	if (rate == 0)
		chart.options.plugins.streaming.frameRate = 30;
	else
		chart.options.plugins.streaming.frameRate = rate;
	console.log("chart fps changed to " + chart.options.plugins.streaming.frameRate)

	// if (1000 / parseInt(rate) < refresh_frequency) {
	// 	refresh_frequency = 1000 / parseInt(rate);
	// }
}

function fillTimeAxis(duration) {
	var secondsPerLabel = 5;
	var limit = (duration / 1000);

	var parent_container = window.getComputedStyle(document.getElementById("chart-container"));
	// var container_width = parseFloat(mycss.getPropertyValue("width").split("px")) + 50 + "px";
	var container_width = parseFloat(parent_container.getPropertyValue("width").split("px")) + 0 + "px";
	// console.log(container_width)
	document.getElementById('time-axis-container').style.width = container_width;

	for (i = limit; i >= 0; i--) {
		var tr = '<td>' + i + '</td>';
		if (i % secondsPerLabel === 0) {
			document.getElementById('time-axis').innerHTML += tr;
		}
	}
}

function pauseChart() {
	chart.options.scales.xAxes[0].realtime.pause = true;
	window.chart.update({
		duration: 0
	});
}

function resumeChart() {
	chart.options.scales.xAxes[0].realtime.pause = false;
	window.chart.update({
		duration: 0
	});
}








// var accelData;
// const accelChartRate = 250; //ms

// var seriesOptions = [{
// 	strokeStyle: 'rgba(255, 0, 0, 1)',
// 	// fillStyle: 'rgba(255, 0, 0, 0.1)',
// 	lineWidth: 1
// },
// {
// 	strokeStyle: 'rgba(0, 255, 0, 1)',
// 	// fillStyle: 'rgba(0, 255, 0, 0.1)',
// 	lineWidth: 1
// },
// {
// 	strokeStyle: 'rgba(0, 0, 255, 1)',
// 	// fillStyle: 'rgba(0, 0, 255, 0.1)',
// 	lineWidth: 1
// },
// ];

// function initAccelChart() {
// 	accelData = [new TimeSeries(), new TimeSeries(), new TimeSeries()];

// 	var timeline = new SmoothieChart({
// 		millisPerPixel: 50,
// 		grid: {
// 			strokeStyle: 'transparent',
// 			borderVisible: false,
// 			lineWidth: 1,
// 			millisPerLine: 1000,
// 			verticalSections: 4,
// 			fillStyle: 'transparent'
// 		},
// 		tooltip: true,
// 		limitFPS: 15
// 	});
// 	for (var i = 0; i < accelData.length; i++) {
// 		timeline.addTimeSeries(accelData[i], seriesOptions[i]);
// 	}
// 	timeline.streamTo(document.getElementById("accelChart"), accelChartRate);
// }

// function updateAccelChart(time) {
// 	accelData[0].append(time, laX);
// 	accelData[1].append(time, laY);
// 	accelData[2].append(time, laZ);
// }

// var velData;
// const velChartRate = 250; //ms

// var seriesOptions = [{
// 	strokeStyle: 'rgba(255, 0, 0, 1)',
// 	// fillStyle: 'rgba(255, 0, 0, 0.1)',
// 	lineWidth: 1
// },
// {
// 	strokeStyle: 'rgba(0, 255, 0, 1)',
// 	// fillStyle: 'rgba(0, 255, 0, 0.1)',
// 	lineWidth: 1
// },
// {
// 	strokeStyle: 'rgba(0, 0, 255, 1)',
// 	// fillStyle: 'rgba(0, 0, 255, 0.1)',
// 	lineWidth: 1
// },
// ];

// function initVelChart() {
// 	velData = [new TimeSeries(), new TimeSeries(), new TimeSeries()];

// 	var timeline = new SmoothieChart({
// 		millisPerPixel: 50,
// 		grid: {
// 			strokeStyle: 'transparent',
// 			borderVisible: false,
// 			lineWidth: 1,
// 			millisPerLine: 1000,
// 			verticalSections: 4,
// 			fillStyle: 'transparent'
// 		},
// 		tooltip: true,
// 		limitFPS: 15
// 	});
// 	for (var i = 0; i < velData.length; i++) {
// 		timeline.addTimeSeries(velData[i], seriesOptions[i]);
// 	}
// 	timeline.streamTo(document.getElementById("velChart"), velChartRate);
// }

// function updateVelChart(time) {
// 	velData[0].append(time, vX);
// 	velData[1].append(time, vY);
// 	velData[2].append(time, vZ);
// }
