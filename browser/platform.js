var sensors = [];

function initPlatform() {
    //TODO change index to be dynamically allocated instead of hard-coded

    sensors.push(new Accelerometer({
        index: [23, 24, 25],
        unit: "m/s^2",
        precision: 0.000000
    }));
    sensors.push(new LinearAccelerometer({
        index: [0, 1, 2],
        unit: "m/s^2",
        precision: 0.000000
    }));
    sensors.push(new Classifier({
        icon: "motion-sensor",
        index: 12,
        type: "motion",
        dictionary: { 1: "Motionless", 3: "Stable", 4: "Moving" }
    }));
    sensors.push(new Gyroscope({
        index: [16, 17, 18],
        unit: "rad/s",
        precision: 0.000000
    }));
    sensors.push(new Magnometer({
        index: [19, 20, 21, 22],
        unit: "µTesla",
        precision: 0.000000,
        accuracy: { 0: "Unreliable", 1: "Low", 2: "Medium", 3: "High" }
    }));
    sensors.push(new Quaternion({
        index: [26, 27, 28, 29],
        unit: "rad",
        precision: 0.000000,
    }));
    sensors.push(new Euler({
        index: [8, 9, 10],
        unit: "rad",
        precision: 0.000000,
    }));
   
    sensors.push(new Distance({
        index: 6,
        unit: "mm",
        precision: 0,
        limits: [0, 1000],
        orientation: "right"
    }));
    sensors.push(new Distance({
        index: 7,
        unit: "mm",
        precision: 0,
        limits: [0, 1000],
        orientation: "left"
    }));
     //TODO sensors get super-butthurt when you don't initialize them with an index value.
    // sensors.push(new Gravity({
        // location: [0, 0, 0]
    // }));
    // sensors.push(new Step());

    // console.log(sensors);
}