// three.js demo

// cube orbits one of two spheres - click to switch sphere

/*  TODO
	-add sphere/cube constructors
	-change rotation to always face center of sphere?
	-update orbits to be able to move in z-dimension as well
	
	BUGS / ISSUES
	-clicking on cube doesn't always seem to move it (no errors in console)
	-opening the console throws off the scene, breaks location/based code
	-pixelation == :-(

*/

"use strict";
/*jslint plusplus: true, browser: true*/
/*global $, jQuery, alert, console, THREE, requestAnimationFrame*/


$(document).ready(function () {
	// general vars
	var cubes = [],
		spheres = [],
		i,
		// scene vars
		scene,
		camera,
		renderer,
		pointLight,
		// object interaction/click location vars
		vector,
		projector,
		raycaster,
		intersects,
		// orbiting cube 1 info
		cube1Geometry,
		cube1Material,
		cube1,
		// orbiting cube 2 info
		cube2Geometry,
		cube2Material,
		cube2,
		// sphere 1 info
		sphere1Geometry,
		sphere1Material,
		sphere1,
		// sphere 2 info
		sphere2Geometry,
		sphere2Material,
		sphere2,
		// sphere 3 info
		sphere3Geometry,
		sphere3Material,
		sphere3,
		// sphere 4 info
		sphere4Geometry,
		sphere4Material,
		sphere4,
		// sphere 5 info
		sphere5Geometry,
		sphere5Material,
		sphere5;

	// create scene variables
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	//camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2,
	//	window.innerHeight / 2, window.innerHeight / -2, 1, 1000);
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// create cube 1
	cube1Geometry = new THREE.CubeGeometry(25, 25, 25);
	cube1Material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
	cube1 = new THREE.Mesh(cube1Geometry, cube1Material);
	cube1.angle = 0;
	cube1.lastTrans = 0;
	cube1.radius = 100;
	cube1.counter = 100;
	cube1.transitioning = false;
	cube1.speed = 1;
	cube1.path = [0, 1, 2, 3, 4];
	cube1.current = 0;
	cubes.push(cube1);

	// create cube 2
	cube2Geometry = new THREE.CubeGeometry(25, 25, 25);
	cube2Material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
	cube2 = new THREE.Mesh(cube2Geometry, cube2Material);
	cube2.angle = 0;
	cube2.lastTrans = 0;
	cube2.radius = 150;
	cube2.counter = 100;
	cube2.transitioning = false;
	cube2.speed = 0.5;
	cube2.path = [2, 3, 1, 0, 4];
	cube2.current = 0;
	cubes.push(cube2);

	// create sphere 1
	sphere1Geometry = new THREE.SphereGeometry(30, 16, 16);  // radius, segments, rings
	sphere1Material = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
	sphere1 = new THREE.Mesh(sphere1Geometry, sphere1Material);
	sphere1.center = {"x": -200, "y": 200, "z": 0};
	spheres.push(sphere1);

	// create sphere 2
	sphere2Geometry = new THREE.SphereGeometry(30, 16, 16);  // radius, segments, rings
	sphere2Material = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
	sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material);
	sphere2.center = {"x": 0, "y": 0, "z": 0};
	spheres.push(sphere2);

	// create sphere 3
	sphere3Geometry = new THREE.SphereGeometry(30, 16, 16);  // radius, segments, rings
	sphere3Material = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
	sphere3 = new THREE.Mesh(sphere3Geometry, sphere3Material);
	sphere3.center = {"x": 200, "y": 200, "z": 0};
	spheres.push(sphere3);

	// create sphere 4
	sphere4Geometry = new THREE.SphereGeometry(30, 16, 16);  // radius, segments, rings
	sphere4Material = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
	sphere4 = new THREE.Mesh(sphere4Geometry, sphere4Material);
	sphere4.center = {"x": 200, "y": -200, "z": 0};
	spheres.push(sphere4);

	// create sphere 5
	sphere5Geometry = new THREE.SphereGeometry(30, 16, 16);  // radius, segments, rings
	sphere5Material = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
	sphere5 = new THREE.Mesh(sphere5Geometry, sphere5Material);
	sphere5.center = {"x": -200, "y": -200, "z": 0};
	spheres.push(sphere5);

	// create light source
	pointLight = new THREE.PointLight(0xFFFFFF);
	pointLight.position.set(10, 200, 130);

	// add all objects to scene
	for (i = 0; i < cubes.length; i++) {
		cubes[i].currSphere = spheres[cubes[i].path[cubes[i].current]].center;
		cubes[i].position.set(
			cubes[i].currSphere.x + cubes[i].radius,
			cubes[i].currSphere.y,
			cubes[i].currSphere.z);
		scene.add(cubes[i]);
	}
	for (i = 0; i < spheres.length; i++) {
		spheres[i].position.set(
			spheres[i].center.x,
			spheres[i].center.y,
			spheres[i].center.z);
		scene.add(spheres[i]);
	}
	scene.add(pointLight);

	camera.position.z = 500;

	projector = new THREE.Projector();

	// click handlers for cube switching
	$('canvas').click( function (event) {
		var clicked;
		event.preventDefault();
		// create vector
		vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,
			- ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		// unproject 2D click point into 3D vector
		projector.unprojectVector(vector, camera);
		// make ray from vector
		raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
		// check if ray intersects any cube
		intersects = raycaster.intersectObjects(cubes);
		if (intersects.length > 0) {
			clicked = intersects[0].object;

			// if intersection, set new sphere and transitioning for top object intersected
			//intersects[0].object.currSphere = (intersects[0].object.currSphere === sphere1.center) ? sphere2.center : sphere1.center;
			clicked.current++;
			if (clicked.current >= clicked.path.length) clicked.current = 0;
			clicked.currSphere = spheres[clicked.path[clicked.current]].center;
			clicked.transitioning = true;
		}
	});

	function render() {
		requestAnimationFrame(render);

		// for each cube, update location info
		for (i = 0; i < cubes.length; i++) {
			cubes[i].angle += cubes[i].speed;
			cubes[i].radians = cubes[i].angle * (Math.PI / 180);

			if (cubes[i].angle - cubes[i].lastTrans > 360) {
				cubes[i].lastTrans = cubes[i].angle;
				cubes[i].current++;
				if (cubes[i].current >= cubes[i].path.length) cubes[i].current = 0;
				cubes[i].currSphere = spheres[cubes[i].path[cubes[i].current]].center;
				cubes[i].transitioning = true;
			}

			cubes[i].targetLoc = {
				"x": cubes[i].currSphere.x + cubes[i].radius * Math.cos(cubes[i].radians),
				"y": cubes[i].currSphere.y + cubes[i].radius * Math.sin(cubes[i].radians),
				"z": 0};

			// UPDATE THIS: Consider whether to change rotation so that
			//	orbiters always face center of orbit?
			cubes[i].rotation.x += 0.03;
			cubes[i].rotation.y += 0.01;

			// if recently switched, move smoothly toward new location
			if (cubes[i].transitioning) {
				cubes[i].position.set(
					// move 1/counter-th of the way to the goal (this will be 1% if counter == 100)
					cubes[i].position.x + ((cubes[i].targetLoc.x - cubes[i].position.x) / cubes[i].counter),
					cubes[i].position.y + ((cubes[i].targetLoc.y - cubes[i].position.y) / cubes[i].counter),
					0);
				cubes[i].counter--;

				if (cubes[i].counter === 0) {
					cubes[i].lastTrans = cubes[i].angle;
					cubes[i].transitioning = false;
					// UPDATE THIS: will currently set any counter to 100, instead of cube's default
					cubes[i].counter = 100;
				}
			// else, update location in orbit
			} else {
				cubes[i].position.set(
					cubes[i].targetLoc.x,
					cubes[i].targetLoc.y,
					0);
			}
		}

		renderer.render(scene, camera);

	}

	render();

});






// // debug lines in center of scene
	// var geometry = new THREE.CylinderGeometry(2, 2, 20);
	// geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 10, 0));
	// var xAxis = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
	// 	color: 0xff0000
	// }));
	// xAxis.rotation.z = -Math.PI/2;
	// scene.add(xAxis);

	// var yAxis = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
	// 	color: 0x00ff00
	// }));
	// scene.add(yAxis);

	// var zAxis = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
	// 	color: 0x0000ff
	// }));
	// zAxis.rotation.x = Math.PI/2;
	// scene.add(zAxis);


	// // click handlers for dragging
	// var xClick, yClick;
	// renderer.domElement.addEventListener('mousedown', function(e) {
	// 	xClick = e.pageX;
	// 	yClick = e.pageY;
	// 	renderer.domElement.addEventListener('mousemove', handleDrag);
	// });
	// renderer.domElement.addEventListener('mouseup', function(e) {
	// 	xClick = e.pageX;
	// 	yClick = e.pageY;
	// 	renderer.domElement.removeEventListener('mousemove', handleDrag);
	// });
	// function handleDrag(e) {
	// 	// compute deltas and reset last clicked location
	// 	var dX = (e.pageX-xClick);
	// 	var dY = (e.pageY-yClick);
	// 	xClick = e.pageX;
	// 	yClick = e.pageY;

	// 	// rotate the camera
	// 	scene.rotation.x += dY/100;
	// 	scene.rotation.y += dX/100;
	// 	scene.updateMatrix();
	// }