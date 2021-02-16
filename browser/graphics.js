var cameraFov = 35;
var motion_translation = true;
var manager = new THREE.LoadingManager();
var timestamp, last_timestamp;
const bottom_center_shoe = new THREE.Vector3();
var current_scale;

const scene = new THREE.Scene();
var renderer;
var camera;

manager.onLoad = function () {
	initGraphicsAfterLoading();
};

function initRender() {
	scene.background = new THREE.Color(backgroundColor);
	createMeshes(scene); //calls initGraphicsAfterLoading() after model load is complete
	// createGravityVector(scene);
}

function initGraphicsAfterLoading() {
	const container = document.createElement('div');
	container.id = "render-container";
	// container.classList.add("item"); //should add it to the biggest box in this golden ratio garbage..
	// container.classList.add("a"); //should add it to the biggest box in this golden ratio garbage..
	// document.body.appendChild(container);
	document.getElementsByClassName("container")[0].appendChild(container);
	var _shoe = scene.getObjectByName("shoe");
	camera = new THREE.PerspectiveCamera(cameraFov, window.innerWidth / window.innerHeight, 0.1, 10000);
	camera.position.set(1000, 0, 0); //! right.stl; normal
	camera.position.set(0, 1000, 0); //! camera is -90deg offset from viewpoint axis, and model needs to roll -90deg;

	// camera.position.set(-400, 400, 100); //shoe_reduced.stl

	// camera.position.set(1000, 00, 0); //right.stl


	const controls = new THREE.OrbitControls(camera, container);
	controls.addEventListener('change', render);

	const lights = createLights();
	const materials = createMaterials();

	scene.add(
		lights.ambient,
		// lights.main,
	);

	// var axesHelper = new THREE.AxesHelper(100);
	// _shoe.attach(axesHelper);
	//
	// var axesHelperScene = new THREE.AxesHelper(2000);
	// scene.attach(axesHelperScene);

	renderer = createRenderer(container);
	setupOnWindowResize(camera, container, renderer);

	// renderer.setAnimationLoop(() => {
	// 	renderer.render(scene, camera);
	// });

	setupSelectAndZoom(camera, container, controls, materials);

	//trying to optimize...
	_shoe.matrixAutoUpdate = false;
	_shoe.getObjectByName("lineL").matrixAutoUpdate = false;
	_shoe.getObjectByName("lineR").matrixAutoUpdate = false;
	scene.getObjectByName("gravity").matrixAutoUpdate = false;

	render();
}

function render() {
	// if (resizeRendererToDisplaySize(renderer)) {
	// 	const canvas = renderer.domElement;
	// 	camera.aspect = canvas.clientWidth / canvas.clientHeight;
	// 	camera.updateProjectionMatrix();
	// }
	renderer.render(scene, camera);
}

function createLights() {
	const ambient = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 5);
	ambient.name = "ambient";
	const main = new THREE.DirectionalLight(0xffffff, 5);
	main.position.set(10, 10, 10);
	main.name = "main";
	return {
		ambient,
		main
	};
}

function createLines(_shoe) { //if attaching to shoe doesn't work, deal with attaching to scene
	var geometryL = new THREE.Geometry();
	var geometryR = new THREE.Geometry();

	var shoe_bottom = _shoe.geometry.boundingBox.min.y;
	geometryL.vertices.push(
		new THREE.Vector3(-shoe_width / 2, shoe_bottom, -shoe_width / 4),
		new THREE.Vector3(-shoe_width / 2, shoe_bottom, -1 * current_scale * max_range)
	);
	geometryR.vertices.push(
		new THREE.Vector3(shoe_width / 2, shoe_bottom, -shoe_width / 4),
		new THREE.Vector3(shoe_width / 2, shoe_bottom, -1 * current_scale * max_range)
	);
	var meshLineL = new MeshLine();
	var meshLineR = new MeshLine();
	meshLineL.setGeometry(geometryL);
	meshLineR.setGeometry(geometryR);

	var lineLmaterial = new MeshLineMaterial({
		// color: data1Color,
		color: platform.sensors[getSensorIndexByID("uC0_DISTANCE")].color,
		lineWidth: 2
	});
	var lineRmaterial = new MeshLineMaterial({
		color: platform.sensors[getSensorIndexByID("uC0_DISTANCE1")].color,
		// color: data2Color,
		lineWidth: 2
	});

	lineL = new THREE.Mesh(meshLineL.geometry, lineLmaterial); // this syntax could definitely be improved!
	lineR = new THREE.Mesh(meshLineR.geometry, lineRmaterial); // this syntax could definitely be improved!
	lineL.name = "lineL";
	lineR.name = "lineR";
	lineL.pivot = new THREE.Vector3(-shoe_width / 2, shoe_bottom, -shoe_width / 4); //set lineL pivot to first point
	lineR.pivot = new THREE.Vector3(shoe_width / 2, shoe_bottom, -shoe_width / 4); //set lineR pivot to first point
	_shoe.attach(lineL);
	_shoe.attach(lineR);
}

function createLights() {
	const ambient = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 5);
	ambient.name = "ambient";
	const main = new THREE.DirectionalLight(0xffffff, 5);
	main.position.set(10, 10, 10);
	main.name = "main";
	return {
		ambient,
		main
	};
}

function createGravityVector(object) { //if attaching to shoe doesn't work, deal with attaching to scene
	var geometryGravity = new THREE.Geometry();
	geometryGravity.dynamic = true;
	geometryGravity.verticesNeedUpdate = true;

	geometryGravity.vertices.push(
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, -1, 0)
	);

	gravityLine = new MeshLine();
	gravityLine.setGeometry(geometryGravity);

	var linematerial = new MeshLineMaterial({
		color: primaryColor,
		lineWidth: 0.5
	});

	var line = new THREE.Mesh(gravityLine.geometry, linematerial); // this syntax could definitely be improved!
	line.name = "gravity";
	line.scale.x = line.scale.y = line.scale.z = 100;
	object.attach(line);
}

function createMaterials() {
	const main = new THREE.MeshStandardMaterial({
		color: 0xcccccc,
		flatShading: true,
		transparent: true,
		opacity: 0.8
	});
	main.color.convertSRGBToLinear();
	const highlight = new THREE.MeshStandardMaterial({
		color: 0xff4444,
		flatShading: true
	});
	highlight.color.convertSRGBToLinear();
	return {
		main,
		highlight
	};
}

function createMeshes(_scene) {
	var loader = new THREE.STLLoader(manager);
	loader.load('./right.stl', function (geometry) {
		// loader.load('./shoe_reduced.stl', function (geometry) {
		var shoeMaterial = new THREE.MeshPhongMaterial({
			color: secondaryColor,
			specular: 0x444444,
			shininess: 10,
			wireframe: true,
			flatShading: false,
			depthWrite: true,
			clipIntersection: false
		});
		var mesh = new THREE.Mesh(geometry, shoeMaterial);
		mesh.name = "shoe";

		// mesh.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(35), THREE.Math.degToRad(0)); //shoe_reduced.stl
		mesh.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(180), THREE.Math.degToRad(0)); //! right.stl; normally correct
		// mesh.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(0), THREE.Math.degToRad(0)); //right.stl

		shoe_length = getSize(mesh).z;
		shoe_width = getSize(mesh).x;
		shoe_height = getSize(mesh).y;
		current_scale = shoe_actual_z / parseFloat(shoe_length);

		//construct gravity line
		createGravityVector(mesh);

		mesh.pivot = new THREE.Vector3(0, 0, shoe_length * (1 / 4)); //set shoe model pivot point to IMU location

		//construct helper dot for pivot point
		var dotGeometry = new THREE.Geometry();
		dotGeometry.vertices.push(mesh.pivot);
		var dotMaterial = new THREE.PointsMaterial({
			size: 5,
			sizeAttenuation: false
		});
		var dot = new THREE.Points(dotGeometry, dotMaterial);
		mesh.attach(dot);

		//construct distance lines
		createLines(mesh);

		//move shoe back to origin
		mesh.translateZ(shoe_length * (1 / 4)); //translate shoe model back to pivot point
		_scene.add(mesh);
	});
}

function createRenderer(container) {
	const renderer = new THREE.WebGLRenderer({
		antialias: false
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.physicallyCorrectLights = true;
	container.appendChild(renderer.domElement);
	return renderer;
}

function setupOnWindowResize(camera, container, renderer) {
	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});
}

function setupSelectAndZoom(camera, container, controls, materials) {
	const selection = [];
	let isDragging = false;
	const mouse = new THREE.Vector2();
	const raycaster = new THREE.Raycaster();
	container.addEventListener('mousedown', () => {
		isDragging = false;
	}, false);
	container.addEventListener('mousemove', () => {
		isDragging = true;
	}, false);
	window.addEventListener('mouseup', event => {
		if (isDragging) {
			isDragging = false;
			return;
		}
		isDragging = false;
		mouse.x = event.clientX / window.innerWidth * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	}, false);
}

function zoomCameraToSelection(camera, controls, selection, fitRatio = 1.2) {
	const box = new THREE.Box3();
	box.expandByObject(selection);
	const size = box.getSize(new THREE.Vector3());
	const center = box.getCenter(new THREE.Vector3());
	const maxSize = Math.max(size.x, size.y, size.z);
	const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
	const fitWidthDistance = fitHeightDistance / camera.aspect;
	const distance = fitRatio * Math.max(fitHeightDistance, fitWidthDistance);
	const direction = controls.target.clone().
		sub(camera.position).
		normalize().
		multiplyScalar(distance);
	controls.maxDistance = distance * 10;
	controls.target.copy(center);
	camera.near = distance / 100;
	camera.far = distance * 100;
	camera.updateProjectionMatrix();
	camera.position.copy(controls.target).sub(direction);
	controls.update();
}

function updateGraphics() {
	sensors.forEach(element => {
		if (element.updateGraphics() == true)
			render();
	});
}

function checkDistanceValidity() {
	//check for valid distance data by comparing range of pitch (x-angle of shoe) towards sky/ground
	if (eR > max_valid_pitch || eR < min_valid_pitch) { //needed to negate again...
		// console.log(eP + ">" + Math.round(max_valid_pitch * 100) / 100 + "||" + eP + "<" + Math.round(min_valid_pitch * 100) / 100);
		lineL.material.uniforms.color.value = lineR.material.uniforms.color.value = new THREE.Color("rgb(80, 80, 80)");

	} else {
		lineL.material.uniforms.color.value = new THREE.Color(data1Color);
		lineR.material.uniforms.color.value = new THREE.Color(data2Color);
	}
}

function getSize(object) {
	object.geometry.computeBoundingBox();
	object.userData.size = {
		'x': Math.abs(object.geometry.boundingBox.min.x) + object.geometry.boundingBox.max.x,
		'y': Math.abs(object.geometry.boundingBox.min.y) + object.geometry.boundingBox.max.y,
		'z': Math.abs(object.geometry.boundingBox.min.z) + object.geometry.boundingBox.max.z
	};
	return object.userData.size;
}

function toggleWireframe(object) {
	var _shoe = scene.getObjectByName("shoe");
	if (_shoe.material.wireframe === true) {
		_shoe.material.wireframe = false;
	} else {
		_shoe.material.wireframe = true;
	}
}

//prototype override for adding pivot to object3D
(function () {
	'use strict';

	THREE.Object3D.prototype.updateMatrix = function () {
		this.matrix.compose(this.position, this.quaternion, this.scale);

		var pivot = this.pivot;

		if (pivot != null) {
			var px = pivot.x,
				py = pivot.y,
				pz = pivot.z;
			var te = this.matrix.elements;

			te[12] += px - te[0] * px - te[4] * py - te[8] * pz;
			te[13] += py - te[1] * px - te[5] * py - te[9] * pz;
			te[14] += pz - te[2] * px - te[6] * py - te[10] * pz;
		}
		this.matrixWorldNeedsUpdate = true;
	};
}());