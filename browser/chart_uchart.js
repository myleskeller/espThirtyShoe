// let data = [
//     [1546300800, 1546387200],    // x-values (timestamps)
//     [35, 71],    // y-values (series 1)
//     [90, 15],    // y-values (series 2)
// ];
var data = [];

function populateTimeDimension(data, interval) {
    for (var i = 0; i < interval; i++) {
        // console.log(data);

        data[0][i] = i;
    }
    console.log(data);
}

function initChart(rate, refresh_frequency) {
    let interval = 60 * refresh_frequency; //? eh?
    // const container = document.createElement('div');
    // container.id = "chart";
    var parent = document.getElementById("chart-container");
    // parent.appendChild(container);

    var datasets = [{}];

    var graphed_sensors = 0;
    platform.sensors.forEach(sensor => {
        if (sensor.isGraphed == true) {
            if (Array.isArray(sensor.index)) {
                for (var i = 0; i < sensor.index.length; i++) {
                    datasets.push({
                        show: true,
                        spanGaps: false,
                        // in-legend display
                        label: sensor.name + '_' + i,
                        value: (self, rawValue) => "$" + rawValue.toFixed(2), //? why this?
                        // value: sensor.value,
                        // series style
                        stroke: sensor.color, //? maybe make 3 distinct colors?
                        width: 1,
                        // fill: "rgba(255, 0, 0, 0.3)",
                        dash: [10, 5], //? see how this does for multi-variable datasets
                    });
                    graphed_sensors++;
                }
            }
            else {
                datasets.push({
                    show: true,
                    spanGaps: false,
                    // in-legend display
                    label: sensor.name,
                    value: (self, rawValue) => "$" + rawValue.toFixed(2), //? why this?
                    // value: sensor.value,
                    // series style
                    stroke: sensor.color,
                    width: 1,
                    // fill: "rgba(255, 0, 0, 0.3)",
                    // dash: [10, 5],
                });
                graphed_sensors++;
            }
        }
    });

    // var data = [];
    // for (var i = 0; i < graphed_sensors; i++)
    //     data[i].fill(0);

    data = [...Array(graphed_sensors + 1)].map(e => Array(interval));

    // populateTimeDimension(data, interval);
    updateData(data);

    let opts = {
        // time: false,
        title: "My Chart",
        id: "chart",
        // class: "my-chart", //? allegedly optional
        width: parent.width,
        height: parent.height,
        series: datasets,
    };

    let uplot = new uPlot(opts, data, parent);

    setInterval(function () {
        // start1 += 10;
        // let data1 = sliceData(start1, start1 + len1);
        uplot.setData(updateData(data));
    }, interval);

    function updateData(data) { //! nothing is showing up.
        data[0].push(Date.now());
        data[0].length = interval; //* should keep array length consistent
        var i = 0;
        platform.sensors.forEach(sensor => {
            // for (var i = 0; i < graphed_sensors; i++) {
            if (sensor.isGraphed == true) {
                if (Array.isArray(sensor.index)) {
                    for (var j = 0; j < sensor.index.length; j++) {
                        data[i].push(sensor.value[j]);
                        data[i].length = interval; //* should keep array length consistent
                        i++;
                    }
                }
                else {
                    // console.log(data)
                    data[i].push(sensor.value);
                    i++;
                }
                data[i].length = interval; //* should keep array length consistent
            }
        });
        // }
        // console.log(data)
    }

    // var id = 'chart';
    // var duration = 60000; //ms
    // if (!refresh_frequency)
    // 	refresh_frequency = 0;

    // const container = document.createElement('canvas');
    // container.id = "chart";
    // var parent = document.getElementById("chart-container");
    // parent.appendChild(container);
    // container.width = parent.width;
    // container.height = parent.height;

    // Chart.defaults.global.defaultFontColor = mediumEmphasisColor;
    // Chart.defaults.global.defaultFontFamily = "Futura";



    // var ctx = document.getElementById(id).getContext('2d');
    // chart = new Chart(ctx, {
    // 	type: 'line',
    // 	spanGaps: false,
    // 	maintainAspectRatio: false,
    // 	data: {
    // 		datasets: datasets
    // 	},
    // 	options: {
    // 		// downsample: {
    // 		// 	enabled: true,
    // 		// 	threshold: 5,
    // 		// },
    // 		legend: {
    // 			labels: {
    // 				usePointStyle: true
    // 			},
    // 			position: "top",
    // 			fullWidth: true,
    // 			onClick: newLegendClickHandler
    // 		},
    // 		title: {
    // 			display: "false"
    // 		},
    // 		scales: {
    // 			xAxes: [{
    // 				type: 'realtime', // auto-scroll on X axis
    // 				realtime: {
    // 					delay: 1000
    // 				},
    // 				display: false
    // 			}],
    // 			yAxes: [{
    // 				position: "right",
    // 			}]
    // 		},
    // 		plugins: {
    // 			streaming: {
    // 				refresh: refresh_frequency, //* controls data refresh frequency (in ms)
    // 				duration: duration,
    // 				onRefresh: function (chart) { // callback on chart update interval
    // 					var i = 0;
    // 					var now = Date.now();
    // 					platform.sensors.forEach(sensor => {
    // 						if (sensor.isGraphed == true) {
    // 							if (Array.isArray(sensor.index)) {
    // 								for (var j = 0; j < sensor.index.length; j++) {
    // 									Array.prototype.push.apply(
    // 										chart.data.datasets[i].data, [{ x: now, y: sensor.value[i] }]);
    // 									i++;
    // 								}
    // 							}
    // 							else {
    // 								Array.prototype.push.apply(
    // 									chart.data.datasets[i].data, [{ x: now, y: sensor.value }]);
    // 								i++;
    // 							}
    // 						}
    // 					});
    // 				}
    // 			}
    // 		}
    // 	}
    // });
    // fillTimeAxis(duration);

    // if (rate)
    // 	changeChartFrameRate(rate);
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

    var mycss = window.getComputedStyle(document.getElementById("chart-container"));
    var container_width = parseFloat(mycss.getPropertyValue("width").split("px")) + 50 + "px";
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
    // chart.options.scales.xAxes[0].realtime.pause = true;
    // window.chart.update({
    //     duration: 0
    // });
}

function resumeChart() {
    // chart.options.scales.xAxes[0].realtime.pause = false;
    // window.chart.update({
    //     duration: 0
    // });
}


