"use strict";
/*jslint plusplus: true, browser: true*/
/*global $, jQuery, alert, console, Kinetic*/

$(document).ready( function () {
	// vars
	var actors = [],
		movies = [],
		i,
		centerX,
		centerY,
		orbitX,
		orbitY,
		stage,
		layer,
		actor1,
		actor2,
		actor3,
		movie1,
		movie2,
		movie3,
		movie4,
		movie5,
		x,
		y,
		anim,
		radius,
		period,
		time,
		angle,
		current,
		next;

	stage = new Kinetic.Stage({
		container: 'movie_night',
		width: window.innerWidth,
		height: window.innerHeight
	});

	centerX = stage.getWidth() / 2;
	centerY = stage.getHeight() / 2;

	layer = new Kinetic.Layer();

	movie1 = new Kinetic.Circle({
		x: centerX - 300,
		y: centerY - 300,
		radius: 35,
		fill: "yellow",
		stroke: "black",
		strokeWidth: 3
	});
	movies.push(movie1);

	movie2 = new Kinetic.Circle({
		x: centerX,
		y: centerY,
		radius: 35,
		fill: "yellow",
		stroke: "black",
		strokeWidth: 3
	});
	movies.push(movie2);

	movie3 = new Kinetic.Circle({
		x: centerX + 250,
		y: centerY - 250,
		radius: 35,
		fill: "yellow",
		stroke: "black",
		strokeWidth: 3
	});
	movies.push(movie3);

	movie4 = new Kinetic.Circle({
		x: centerX + 300,
		y: centerY + 300,
		radius: 35,
		fill: "yellow",
		stroke: "black",
		strokeWidth: 3
	});
	movies.push(movie4);

	movie5 = new Kinetic.Circle({
		x: centerX - 250,
		y: centerY + 250,
		radius: 35,
		fill: "yellow",
		stroke: "black",
		strokeWidth: 3
	});
	movies.push(movie5);


	actor1 = new Kinetic.Circle({
		x: centerX,
		y: centerY,
		radius: 25,
		fill: "red",
		stroke: "black",
		strokeWidth: 3,
		path: [4, 3, 2, 1, 0],
		current: 0,
		rad: 100,
		period: 4000,
		state: "orbit",
		counter: 100,
		time: 0,
		angle: 0
	});
	actors.push(actor1);

	actor2 = new Kinetic.Circle({
		x: centerX,
		y: centerY,
		radius: 25,
		fill: "red",
		stroke: "black",
		strokeWidth: 3,
		path: [1, 3, 4, 0, 2],
		current: 0,
		rad: 100,
		period: 5000,
		state: "orbit",
		counter: 100,
		time: 0,
		angle: 0
	});
	actors.push(actor2);

	actor3 = new Kinetic.Circle({
		x: centerX,
		y: centerY,
		radius: 25,
		fill: "red",
		stroke: "black",
		strokeWidth: 3,
		path: [0, 1, 3, 2],
		current: 0,
		rad: 100,
		period: 4500,
		state: "orbit",
		counter: 100,
		time: 0,
		angle: 0
	});
	actors.push(actor3);


	for (i = 0; i < actors.length; i++) {
		layer.add(actors[i]);
	}
	for (i = 0; i < movies.length; i++) {
		layer.add(movies[i]);
	}

	stage.add(layer);

	anim = new Kinetic.Animation( function (frame) {
		//frame.time;
		//frame.timeDiff;
		//frame.frameRate;

		for (i = 0; i < actors.length; i++) {
			orbitX = movies[actors[i].attrs.path[actors[i].attrs.current]].attrs.x;
			orbitY = movies[actors[i].attrs.path[actors[i].attrs.current]].attrs.y;
			radius = actors[i].attrs.rad;
			period = actors[i].attrs.period;
			time = actors[i].attrs.time + frame.timeDiff;
			actors[i].attrs.time += frame.timeDiff;
			angle = actors[i].attrs.angle;
			//console.log(frame.timeDiff);

			switch (actors[i].attrs.state)
			{
			case "orbit":
				// if home/initial position not reached, orbit
				if (actors[i].attrs.time % period < (period - 20)) {
					actors[i].setX(radius * Math.sin(2 * Math.PI * actors[i].attrs.time / period) + orbitX);
					actors[i].setY(radius * Math.cos(2 * Math.PI * actors[i].attrs.time / period) + orbitY);
				} else {
				// after one full orbit, switch to positioning
					actors[i].attrs.state = "positioning";
					actors[i].attrs.time = 0;
					actors[i].attrs.fill = "green";
					
					// calculate target angle to begin transition
					current = movies[actors[i].attrs.path[actors[i].attrs.current]];
					next = (actors[i].attrs.current+1 >= actors[i].attrs.path.length) ?
						movies[actors[i].attrs.path[0]] : movies[actors[i].attrs.path[actors[i].attrs.current + 1]];
					
					// calculate angle and adjust to guarantee range between 0 and 2pi
					actors[i].attrs.angle = Math.atan(-1 * (next.attrs.y - current.attrs.y)/(next.attrs.x - current.attrs.x));
					if (next.attrs.x < current.attrs.x) {
						actors[i].attrs.angle += Math.PI;
					}
					if (actors[i].attrs.angle < 0) { actors[i].attrs.angle = (2 * Math.PI) + (actors[i].attrs.angle); }
				}
				break;
			case "positioning":
				// orbit until target angle reached
				if (actors[i].attrs.time < (actors[i].attrs.angle / (2 * Math.PI)) * period) {
					actors[i].setX(radius * Math.sin(2 * Math.PI * actors[i].attrs.time / period) + orbitX);
					actors[i].setY(radius * Math.cos(2 * Math.PI * actors[i].attrs.time / period) + orbitY);
				} else {
					// target angle reached, begin transition to new orbit
					actors[i].attrs.state = "transitioning";
					actors[i].attrs.fill = "yellow";
					actors[i].attrs.current = (actors[i].attrs.current+1 >= actors[i].attrs.path.length) ? 0 : actors[i].attrs.current + 1;
					actors[i].attrs.time += 0.5 * period;
					actors[i].attrs.angle += Math.PI;
				}
				break;
			case "transitioning":
				// while transition in progress, move 1% toward destination each frame
				if (actors[i].attrs.counter > 0) {
					actors[i].attrs.time -= frame.timeDiff;

					actors[i].attrs.targX = radius * Math.sin(2 * Math.PI * actors[i].attrs.time / period) + orbitX;
					actors[i].attrs.targY = radius * Math.cos(2 * Math.PI * actors[i].attrs.time / period) + orbitY;
				
					actors[i].setX(actors[i].attrs.x + ((actors[i].attrs.targX - actors[i].attrs.x) / actors[i].attrs.counter));
					actors[i].setY(actors[i].attrs.y + ((actors[i].attrs.targY - actors[i].attrs.y) / actors[i].attrs.counter));

					actors[i].attrs.counter--;
				} else {
					// new orbit reached, begin orbiting opposite direction
					actors[i].attrs.state = "orbit2";
					actors[i].attrs.fill = "black";
					actors[i].attrs.counter = 100;

					// orbit position is calculated with trig off of "time"
					// new orbit will be going opposite direction from last orbit,
					//	so have to update "time" to avoid jumping forward or back when beginning new orbit
					if (actors[i].attrs.angle >= 0 && actors[i].attrs.angle <= Math.PI / 2) {
						actors[i].attrs.angle = (Math.PI / 2) - actors[i].attrs.angle;
					} else {
						actors[i].attrs.angle = (5 * Math.PI / 2) - actors[i].attrs.angle;
					}
					actors[i].attrs.time = period * (actors[i].attrs.angle / (2 * Math.PI));
				}
				break;
			case "orbit2":
				// if home/initial position not reached, orbit
				if (actors[i].attrs.time % period < (period - 20)) {
					actors[i].setX(radius * Math.cos(2 * Math.PI * actors[i].attrs.time / period) + orbitX);
					actors[i].setY(radius * Math.sin(2 * Math.PI * actors[i].attrs.time / period) + orbitY);
				} else {
					// after one full orbit, switch to positioning
					actors[i].attrs.state = "pos2";
					actors[i].attrs.fill = "blue";
					actors[i].attrs.time = 0;
					
					// calculate target angle to begin transition
					current = movies[actors[i].attrs.path[actors[i].attrs.current]];
					next = (actors[i].attrs.current+1 >= actors[i].attrs.path.length) ?
						movies[actors[i].attrs.path[0]] : movies[actors[i].attrs.path[actors[i].attrs.current + 1]];
					
					// calculate angle and adjust to guarantee range between 0 and 2pi
					actors[i].attrs.angle = Math.atan(-1 * (next.attrs.y - current.attrs.y)/(next.attrs.x - current.attrs.x));
					if (next.attrs.x < current.attrs.x) {
						actors[i].attrs.angle += Math.PI;
					}
					if (actors[i].attrs.angle >= 0) {
						actors[i].attrs.angle = (2 * Math.PI) - actors[i].attrs.angle - 0.5 * Math.PI;
					} else if (actors[i].attrs.angle > -1 * Math.PI / 2) {
						actors[i].attrs.angle = (-1 * actors[i].attrs.angle) + 1.5 * Math.PI;
					} else if (actors[i].attrs.angle < -1 * Math.PI / 2) {
						actors[i].attrs.angle = (-1 * actors[i].attrs.angle) - 0.5 * Math.PI;
					}
				}
				break;
			case "pos2":
				// orbit until target angle reached
				if (actors[i].attrs.time < (actors[i].attrs.angle / (2 * Math.PI)) * period) {
					actors[i].setX(radius * Math.cos(2 * Math.PI * actors[i].attrs.time / period) + orbitX);
					actors[i].setY(radius * Math.sin(2 * Math.PI * actors[i].attrs.time / period) + orbitY);
				} else {
					// target angle reached, begin transition
					actors[i].attrs.state = "trans2";
					actors[i].attrs.fill = "white";
					actors[i].attrs.current = (actors[i].attrs.current+1 >= actors[i].attrs.path.length) ? 0 : actors[i].attrs.current + 1;
					actors[i].attrs.time += 0.5 * period;
					actors[i].attrs.angle += Math.PI;
				}
				break;
			case "trans2":
				// while transition in progress, move 1% toward destination each frame
				if (actors[i].attrs.counter > 0) {
					actors[i].attrs.time -= frame.timeDiff;
					
					actors[i].attrs.targX = radius * Math.cos(2 * Math.PI * actors[i].attrs.time / period) + orbitX;
					actors[i].attrs.targY = radius * Math.sin(2 * Math.PI * actors[i].attrs.time / period) + orbitY;

					actors[i].setX(actors[i].attrs.x + ((actors[i].attrs.targX - actors[i].attrs.x) / actors[i].attrs.counter));
					actors[i].setY(actors[i].attrs.y + ((actors[i].attrs.targY - actors[i].attrs.y) / actors[i].attrs.counter));

					actors[i].attrs.counter--;
				} else {
					// new orbit reached, begin orbiting opposite direction
					actors[i].attrs.state = "orbit";
					actors[i].attrs.fill = "red";
					actors[i].attrs.counter = 100;

					// orbit position is calculated with trig off of "time"
					// new orbit will be going opposite direction from last orbit,
					//	so have to update "time" to avoid jumping forward or back when beginning new orbit
					if (actors[i].attrs.angle >= 0 && actors[i].attrs.angle <= Math.PI / 2) {
						actors[i].attrs.angle = (Math.PI / 2) - actors[i].attrs.angle;
					} else {
						actors[i].attrs.angle = (5 * Math.PI / 2) - actors[i].attrs.angle;
					}
					actors[i].attrs.time = period * (actors[i].attrs.angle / (2 * Math.PI));
				}
				break;
			}
		}
	}, layer);

	anim.start();
});


