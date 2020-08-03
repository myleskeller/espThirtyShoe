var rate = 0;
var id = 'chart';
var duration = 60000; //ms
var chart;
var buf = {};
buf[id] = [
	[],
	[]
];
//decimation vars
// var decimationThreshold = 10; //values per plot-point
// var miniCounterL = 0;
// var miniCounterR = 0;
// var miniBufL = [];
// var miniBufR = [];
function initChart() {
	Chart.defaults.global.defaultFontColor = mediumEmphasisColor;
	Chart.defaults.global.defaultFontFamily = "Futura";

	var ctx = document.getElementById(id).getContext('2d');
	chart = new Chart(ctx, {
		type: 'line',
		spanGaps: false,
		data: {
			datasets: [{
				data: [],
				pointRadius: 1,
				borderWidth: 1,
				label: 'Left Distance (mm)', // 'left' distance data
				borderColor: data1Color, // line color
				pointBackgroundColor: data1Color,
				pointBorderWidth: 0,
				pointRadius: 0,
				fill: false, // no fill
				lineTension: 0 // straight line
			}, {
				data: [],
				pointRadius: 1,
				borderWidth: 1,
				label: 'Right Distance (mm)', // 'right' distance data
				borderColor: data2Color, // line color
				pointBackgroundColor: data2Color,
				pointBorderWidth: 0,
				pointRadius: 0,
				fill: false, // no fill
				lineTension: 0 // straight line
			}]
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
				fullWidth: true
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
					duration: duration, // display data for the latest 6000ms (1 mins)
					onRefresh: function(chart) { // callback on chart update interval
						Array.prototype.push.apply(
							chart.data.datasets[0].data, buf[id][0]
						); // add 'left' distance data to chart
						Array.prototype.push.apply(
							chart.data.datasets[1].data, buf[id][1]
						); // add 'right' distance data to chart
						buf[id] = [
							[],
							[]
						]; // clear buffer
					}
				}
			}
		}
	});
	fillTimeAxis();

	// initAccelChart();
}

function changeChartFrameRate() {
	if (rate == 0)
		chart.options.plugins.streaming.frameRate = 30;
	else
		chart.options.plugins.streaming.frameRate = 1000 / parseFloat(rate);
}

function updateChart(dL, dR) {
	if (dL === 0) {
		dL = NaN;
	}
	if (dR === 0) {
		dR = NaN;
	}
	var now = Date.now();
	buf[id][0].push({ //left
		x: now, // timestamp
		y: dL // distance
	});
	buf[id][1].push({ //right
		x: now, // timestamp
		y: dR // distance
	});

	// updateAccelChart(now);
}

function fillTimeAxis() {
	var secondsPerLabel = 5;
	var limit = duration / 1000;

	var mycss = window.getComputedStyle(document.getElementById("chart-container"));
	document.getElementById('time-axis').style.width = mycss.getPropertyValue("width");
	var cellWidth = mycss.getPropertyValue("width").slice(0, -2);
	cellWidth = cellWidth / ((limit / secondsPerLabel) + 1);
	cellWidth = Math.round(cellWidth);
	// console.log(cellWidth);

	var x = document.getElementsByClassName('time-value');
	for (i = 0; i < x.length; i++) {
		x[i].style.width = cellWidth;
	}

	for (i = limit; i >= 0; i--) {
		var guts = '<div class="time-value" style="width: ' + cellWidth + 'px;">' + i + '</div>';
		if (i % secondsPerLabel === 0) {
			document.getElementById('time-axis').innerHTML += guts;
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
//
// var seriesOptions = [{
// 		strokeStyle: 'rgba(255, 0, 0, 1)',
// 		fillStyle: 'rgba(255, 0, 0, 0.1)',
// 		lineWidth: 1
// 	},
// 	{
// 		strokeStyle: 'rgba(0, 255, 0, 1)',
// 		fillStyle: 'rgba(0, 255, 0, 0.1)',
// 		lineWidth: 1
// 	},
// 	{
// 		strokeStyle: 'rgba(0, 0, 255, 1)',
// 		fillStyle: 'rgba(0, 0, 255, 0.1)',
// 		lineWidth: 1
// 	},
// ];

// function initAccelChart() {
// 	// Initialize an empty TimeSeries for each CPU.
// 	accelData = [new TimeSeries(), new TimeSeries(), new TimeSeries()];
//
// 	// var now = new Date().getTime();
// 	// for (var t = now - 1000 * 50; t <= now; t += 1000) {
// 	//   addRandomValueToDataSets(t, accelData);
// 	// }
// 	// Every second, simulate a new set of readings being taken from each CPU.
// 	// setInterval(function() {
// 	//   addRandomValueToDataSets(new Date().getTime(), accelData);
// 	// }, 1000);
//
//
// 	// Build the timeline
// 	var timeline = new SmoothieChart({
// 		millisPerPixel: 50,
// 		grid: {
// 			strokeStyle: 'transparent',
// 			borderVisible: false,
// 			lineWidth: 1,
// 			millisPerLine: 1000,
// 			verticalSections: 4
// 		},
// 		tooltip: true,
// 		limitFPS: 15
// 	});
// 	for (var i = 0; i < accelData.length; i++) {
// 		timeline.addTimeSeries(accelData[i], seriesOptions[i]);
// 	}
// 	timeline.streamTo(document.getElementById("accelChart"), accelChartRate);
// }

// function addRandomValueToDataSets(time, dataSets) {
//   for (var i = 0; i < dataSets.length; i++) {
//     dataSets[i].append(time, Math.random());
//   }
// }

// function updateAccelChart(time) {
// 	accelData[0].append(time, vX);
// 	accelData[1].append(time, vY);
// 	accelData[2].append(time, vZ);
// }
