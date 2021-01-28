//? get calibration/tare working
//? implement hardware stationary detection
//? make sure tare is correct
//TODO rework quaternion as default representation of orientation
//TODO change camera to focus on object rather than fixed viewpoint
//TODO see if quaternion yields better results than euler angles
//

const min_range = 1; //mm
const max_range = 1200; //mm
const min_accurate_range = 50; //mm
const max_accurate_range = 1000; //mm
const shoe_actual_z = 266.7; //mm

//observed leg apparatus extrema:
//min: 			 -10.89,		max: 			18.33
//imight be offset (since i was holding it) by 4 deg or excel may have offset origin displaced.
//min: -10.89+4 = -6.89,		max: 18.33+4 = 	22.33
//observed max shoe vertical displacement (from sole):
//min: 0 (duh)		max: 85.5434218516
const max_valid_pitch = THREE.Math.degToRad(18.33); //degrees
const min_valid_pitch = THREE.Math.degToRad(0); //degrees
const max_vertical_displacement = 85.5434218516; //mm


var freq;
var shoe_length, shoe_width, shoe_height, current_scale;
var gravityX, gravityY, gravityZ, gravityLine, lineL, lineR;

//linear regression formula
function estimatedDistanceFromGround(x) {
	return parseFloat(a) * parseFloat(x) * parseFloat(x) - parseFloat(b) * parseFloat(x) - parseFloat(c);
}
//triangle width
function getDistanceHorizontalDisplacement(distance) {
	return Math.sin(getDistanceComplementartyAngle()) * distance;
}
//triangle height
function getDistanceVerticalDisplacement(distance) {
	return Math.sin(eP) * distance;
}
//eP complementary angle
function getDistanceComplementartyAngle() {
	return Math.PI - eP;
}

function getPointY(distance) {
	return getDistanceHorizontalDisplacement(distance) + estimatedDistanceFromGround;
}

function updateGeometry(object) {
	gravityX = Math.cos(eP) * Math.sin(eR);
	gravityY = Math.sin(eP);
	gravityZ = -Math.cos(eP) * Math.cos(eR);

	var new_vector = new THREE.Vector3(gravityY, gravityZ, gravityX);

	var geometryGravity = new THREE.Geometry();
	geometryGravity.vertices.push(
		new THREE.Vector3(0, 0, 0),
		new_vector
	);
	gravityLine.setGeometry(geometryGravity);
	object.updateMatrix();
}

function updatePosition(_shoe) {
	//* offsets local position relative to object
	// _shoe.translateX((vX) ); // / current_scale); doesn't matter for rendering
	// _shoe.translateY((-vZ) ); // / current_scale);
	// _shoe.translateZ((-vY) ); // / current_scale);
	//* changes absolute position relative to origin
	_shoe.position.set(pX / current_scale, -pZ / current_scale, -pY / current_scale);

	// console.log((pY) * sp+','+ (-pZ) * sp +','+ (-pX) * sp);
	_shoe.updateMatrix();
}

function updateOrientation(_shoe) {
	_shoe.rotation.x = eR;
	_shoe.rotation.z = eP;
	_shoe.rotation.y = eY;
	// _shoe.rotation.y = parseFloat(eY)+THREE.Math.degToRad(180);  //doesn't matter for rendering
	_shoe.updateMatrix();
}

function updateAttitude(_shoe) {
	//* stuff always gets weird when the quaternion gets involved..
	// quat1 = new THREE.Quaternion(qR, qX, qY, qZ);
	quat1 = new THREE.Quaternion(sensors[4].value[3], sensors[4].value[0], sensors[4].value[1], sensors[4].value[2]);
	quat2 = new THREE.Quaternion(1, 0, 0, 0);
	// quat2.setFromAxisAngle ( axis : Vector3, angle : Float ); 
	//TODO figure out how to properly offset output quaternion to get correct rendering of orientation
	// quat2.setFromAxisAngle (new THREE.Vector3(-1, 0, 0), THREE.Math.degToRad(270)); //-roll
	// quat2.setFromAxisAngle (new THREE.Vector3(1, 0, 0), THREE.Math.degToRad(270)); //-roll
	// quat2.setFromAxisAngle (new THREE.Vector3(0, -1, 0), THREE.Math.degToRad(270)); //-pitch
	// quat2.setFromAxisAngle (new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(270)); //-pitch
	// quat2.setFromAxisAngle (new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(270)); //yaw 
	// quat2.setFromAxisAngle (new THREE.Vector3(0, 0, -1), THREE.Math.degToRad(270)); //yaw

	// quat2.setFromAxisAngle (new THREE.Vector3(-1, 0, 0), THREE.Math.degToRad(90)); //roll
	// quat2.setFromAxisAngle (new THREE.Vector3(1, 0, 0), THREE.Math.degToRad(90)); //-roll
	// quat2.setFromAxisAngle (new THREE.Vector3(0, -1, 0), THREE.Math.degToRad(90)); //pitch 
	// quat2.setFromAxisAngle (new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(90)); //-pitch
	// quat2.setFromAxisAngle (new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(90)); //yaw
	// quat2.setFromAxisAngle (new THREE.Vector3(0, 0, -1), THREE.Math.degToRad(90)); //-yaw

	// quat2.setFromAxisAngle (new THREE.Vector3(-1, 0, 0), THREE.Math.degToRad(180)); 
	// quat2.setFromAxisAngle (new THREE.Vector3(1, 0, 0), THREE.Math.degToRad(180)); 
	// quat2.setFromAxisAngle (new THREE.Vector3(0, -1, 0), THREE.Math.degToRad(180)); 
	// quat2.setFromAxisAngle (new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(180)); 
	// quat2.setFromAxisAngle (new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(180)); 
	// quat2.setFromAxisAngle (new THREE.Vector3(0, 0, -1), THREE.Math.degToRad(180)); 
	_shoe.quaternion.multiplyQuaternions(quat1, quat2);
	_shoe.updateMatrix();
}






const dataSetSize = 100;

function rk4(x, v, a, dt) {
	// Returns final (position, velocity) array after time dt has passed.
	//        x: initial position
	//        v: initial velocity
	//        a: acceleration function a(x,v,dt) (must be callable)
	//        dt: timestep
	var x1 = x;
	var v1 = v;
	var a1 = a(x1, v1, 0);

	var x2 = x + 0.5 * v1 * dt;
	var v2 = v + 0.5 * a1 * dt;
	var a2 = a(x2, v2, dt / 2);

	var x3 = x + 0.5 * v2 * dt;
	var v3 = v + 0.5 * a2 * dt;
	var a3 = a(x3, v3, dt / 2);

	var x4 = x + v3 * dt;
	var v4 = v + a3 * dt;
	var a4 = a(x4, v4, dt);

	var xf = x + (dt / 6) * (v1 + 2 * v2 + 2 * v3 + v4);
	var vf = v + (dt / 6) * (a1 + 2 * a2 + 2 * a3 + a4);

	return [xf, vf];
}

//acceleration function
function LAX(x, v, dt) {
	return parseFloat(laX);
}

function LAY(x, v, dt) {
	return parseFloat(laY);
}

function LAZ(x, v, dt) {
	return parseFloat(laZ);
}

// accelerate according to z-axis device motion
// function handleMotion(e) {
// 	if(e.acceleration.x === null || e.acceleration.y === null || e.acceleration.z === null) return;
// 	accelerate(e.acceleration.z, e.timeStamp);
// }
// step forward with new acceleration, applying some very crude filtering & friction
// function accelerate(t) {
function accelerate(t) { //, pX_old, pY_old, pZ_old, vX_old, vY_old, vZ_old) {
	var x = 0,
		y = 1,
		z = 2;
	// var pX, pY, pZ, vZ, vY, vZ;

	// var pX_old = positionArray[x][dataSetSize];
	// var pY_old = positionArray[y][dataSetSize];
	// var pZ_old = positionArray[z][dataSetSize];
	// var vX_old = velocityArray[x][dataSetSize];
	// var vY_old = velocityArray[y][dataSetSize];
	// var vZ_old = velocityArray[z][dataSetSize];

	//fourth order Runge-Kutta algorithm
	[pX, vX] = rk4(pX_old, vX_old, LAX, t);
	[pY, vY] = rk4(pY_old, vY_old, LAY, t);
	[pZ, vZ] = rk4(pZ_old, vZ_old, LAZ, t);

	vX *= .9; // friction
	vY *= .9; // friction
	vZ *= .9; // friction
	pX *= .999; // tend back to zero
	pY *= .999; // tend back to zero
	pZ *= .999; // tend back to zero

	// positionArray[x].shift();
	// positionArray[y].shift();
	// positionArray[z].shift();
	// positionArray[x].push(pX);
	// positionArray[y].push(pY);
	// positionArray[z].push(pZ);

	console.log("position:" + Math.round(pX * 100) / 100 + ',' + Math.round(pY * 100) / 100 + ',' + Math.round(pZ * 100) / 100);
	console.log("velocity:" + Math.round(vX * 100) / 100 + ',' + Math.round(vY * 100) / 100 + ',' + Math.round(vZ * 100) / 100);

	//filtration
	// ehhhh..

	// pX_old = pX;
	// pY_old = pY;
	// pZ_old = pZ;
	// vX_old = vX;
	// vY_old = vY;
	// vZ_old = vZ;

	// return pX, pY, pZ, vZ, vY, vZ;
}
// euler double integration
// function eulerStep(state0, state1) {
// 	var interval = (state1.time - state0.time) / 1000; // convert ms to s
// 	if (interval) {
// 		state1.position = state0.position + state0.velocity * interval;
// 		state1.velocity = state0.velocity + state0.acceleration * interval;
// 	}
// 	return Object.assign({}, state1);
// }

//wherever the transform goes:
// 'translate3d(' + 0 + 'px,' + 0 + 'px,' + (-z[0].position * 1000) + 'px)'


// const dataSetSize = 100;
//array for linear accelerometer data
var accelerometerData = Array.apply(null, {
	length: dataSetSize
}).map(function () {
	// return 4; //why is this 4??
});
// //Apply kalman filter
// var kalmanFilter = new KalmanFilter({
// 	R: 0.01,
// 	Q: 3
// });
//i'm not really sure how this syntax works
// var filteredAccelerometerData = accelerometerData.map(function (v) {
// 	return kalmanFilter.filter(v);
// });
