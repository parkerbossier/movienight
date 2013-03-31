var imageBase, moviesJSON, actorsJSON, directorsJSON;
var endpoint = 'http://api.themoviedb.org/3/';
var apiKey = '742fa948b5cbc1a2c82dbd37f14e2f7e';
var actors, movies, directors;

var stage, backgroundStarsLayer, staticOverlayer, actorLayer, movieLayer, tailLayer;

// far to near
var currentZoom = 0;
var zoomLevels = [.4, .9, 1.6, 25];

// zoom to the appropriate zoom level
function setZoomLevel(level) {
    var step = (zoomLevels[level] - zoomLevels[currentZoom])/30;
    var anim = new Kinetic.Animation(function() {
        movieLayer.setScale(movieLayer.getScale().x + step);
        backgroundStarsLayer.setScale(backgroundStarsLayer.getScale().x + step/2);

        // base case
        if (Math.abs(movieLayer.getScale().x - zoomLevels[level]) < .001) {
            anim.stop();
            currentZoom = level;
        }

        movieLayer.draw();
        backgroundStarsLayer.draw();
    });
    anim.start();
}

var genres = ['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'];

$(function () {
    var containerHeight = $('#container').height();
    var containerWidth = $('#container').width();

    // vertically center the container
    if (window.innerHeight > containerHeight)
        $('#container').css('margin-top', (window.innerHeight - containerHeight)/2);

    // stage init
    stage = new Kinetic.Stage({
        container: 'container',
        width: containerWidth,
        height: containerHeight
    });

    /*
     * background stars layer init
     */
    backgroundStarsLayer = new Kinetic.Layer({
        x: containerWidth/2,
        y: containerHeight/2
    });
    $('#background-stars').one('load', function() {
        // get the image from the DOM (centered)
        var image = new Kinetic.Image({
            image: this
        });
        image.setOffset([image.getWidth()/2, image.getHeight()/2]);

        // add the image
        backgroundStarsLayer.add(image);
        backgroundStarsLayer.draw();
    });

    /*
     * static overlay layer init
     */
    staticOverlayer = new Kinetic.Layer();
    $('#main-overlay').one('load', function() {
        // get the image from the DOM (centered)
        var image = new Kinetic.Image({
            x: containerWidth/2,
            y: containerHeight/2,
            image: this
        });
        image.setOffset([image.getWidth()/2, image.getHeight()/2]);

        // add the image
        staticOverlayer.add(image);

        // year group init
        var yearGroup = new Kinetic.Group({
            x: containerWidth/2 - 2,
            y: containerHeight/2 + 86
        });
        staticOverlayer.add(yearGroup);

        // add the years
        var overshoot = 0;
        var thetaInit = Math.PI + Math.PI/180*overshoot;
        var thetaFinal = -Math.PI/180*overshoot;
        var step = -(thetaFinal-thetaInit)/13;
        var theta;
        for (var i = 0; i < 14; ++i) {
            // add the year
            theta = thetaInit+step*i;
            var text = new Kinetic.Text({
                fontSize: 25,
                fontFamily: 'advent',
                text: 2000+i,
                fill: '#ffffff',
                x: Math.cos(theta)*386,
                y: Math.sin(theta)*386,
                rotation: theta+Math.PI/2
            });
            text.setOffset([text.getTextWidth()/2, text.getTextHeight()/2]);
            yearGroup.add(text);

            // click handler
            text.on('click', function() {
                // turning year on
                if (this.getFill() != '#ffffff') {
                    unDimByYear(this.textArr[0].text);
                    this.setFill('#ffffff');
                }

                // turning year off
                else {
                    dimByYear(this.textArr[0].text);
                    this.setFill('#777777');
                }

                // update
                yearGroup.draw();
            });
        }

        // genre group init
        var genreGroup = new Kinetic.Group({
            x: containerWidth/2 - 2,
            y: containerHeight/2 + 86
        });
        staticOverlayer.add(genreGroup);

        // add the genres
        overshoot = 0;
        thetaInit = Math.PI + Math.PI/180*overshoot;
        thetaFinal = -Math.PI/180*overshoot;
        step = -(thetaFinal-thetaInit)/(genres.length-1);
        for (i = 0; i < genres.length; ++i) {
            // add the year
            theta = thetaInit+step*i;
            text = new Kinetic.Text({
                fontSize: 25,
                fontFamily: 'advent',
                text: genres[i],
                fill: '#ffffff',
                x: Math.cos(theta)*450,
                y: Math.sin(theta)*450,
                rotation: theta+Math.PI/2
            });
            text.setOffset([text.getTextWidth()/2, text.getTextHeight()/2]);
            genreGroup.add(text);

            // click handler
            text.on('click', function() {
                // turning year on
                if (this.getFill() != '#ffffff') {
                    unDimByGenre(this.textArr[0].text);
                    this.setFill('#ffffff');
                }

                // turning year off
                else {
                    dimByGenre(this.textArr[0].text);
                    this.setFill('#777777');
                }

                // update
                genreGroup.draw();
            });
        }

        staticOverlayer.draw();
    });

    /*
     * movie layer init
     */

    // spread out the movies
    for (var i in movieLocs) {
        movieLocs[i].x *= 10;
        movieLocs[i].y *= 10;
    }

    // find the bounding box
    var bounds = {
        top: 1000000,
        left: 1000000,
        bottom: -1000000,
        right: -1000000
    }
    for (var i in movieLocs) {
        if (movieLocs[i].x < bounds.left)
            bounds.left = movieLocs[i].x;
        if (movieLocs[i].x > bounds.right)
            bounds.right = movieLocs[i].x;
        if (movieLocs[i].y < bounds.top)
            bounds.top = movieLocs[i].y;
        if (movieLocs[i].y > bounds.bottom)
            bounds.bottom = movieLocs[i].y;
    }

    // normalize the bounding box to find the width and height
    bounds.bottom -= bounds.top;
    bounds.top = 0;
    bounds.right -= bounds.left;
    bounds.left = 0;

    // layer init
    movieLayer = new Kinetic.Layer({
        scale: zoomLevels[0],
        x: containerWidth/2,
        y: containerHeight/2,
        offset: [bounds.right/2, bounds.bottom/2]
    });

    // create all the movies
    movies = {};
    $.each(moviesJSON, function(i, elem) {
        var opts = elem;
        opts.x = movieLocs[i].x;
        opts.y = movieLocs[i].y;
        opts.scale = movieLocs[i].scale;

        movies[i] = new Movie(opts);
        movieLayer.add(movies[i].group);
    });

    actorLayer = new Kinetic.Layer();
    //    // create all the actors
    //    actors = {};
    //    var counter = 0;
    //    $.each(actorsJSON, function(i, elem) {
    //        var opts = elem;
    //        opts.x = window.innerWidth/3;
    //        opts.y = window.innerHeight/2;
    //        actors[i] = new Actor(opts);
    //        if (counter < 500) {
    //        actorLayer.add(actors[i].group);
    //        counter++;
    //        }
    //    });

    // add all the layers
    tailLayer = new Kinetic.Layer();
    stage.add(backgroundStarsLayer);
    stage.add(movieLayer);
    stage.add(tailLayer);
    stage.add(actorLayer);
    stage.add(staticOverlayer);

    /*
     * handle dragging
     */
    var dragging = false;
    var lastMouse;

    // start drag
    $('.kineticjs-content').on('mousedown', function(e) {
        dragging = true;
        lastMouse = {
            x: e.clientX,
            y: e.clientY
        }
    })

    // end drag
    .on('mouseup', function(e) {
        dragging = false;
    })

    // handle drag
    .on('mousemove', function(e) {
        if (dragging) {
            var dX = e.clientX - lastMouse.x;
            var dY = e.clientY - lastMouse.y;
            lastMouse.x = e.clientX;
            lastMouse.y = e.clientY;

            // 1:1 layers
            movieLayer.setX(movieLayer.getX()+dX);
            movieLayer.setY(movieLayer.getY()+dY);
            movieLayer.draw();

            actorLayer.setX(actorLayer.getX()+dX);
            actorLayer.setY(actorLayer.getY()+dY);
            actorLayer.draw();

            // parallax layers
            backgroundStarsLayer.setX(backgroundStarsLayer.getX()+dX/2);
            backgroundStarsLayer.setY(backgroundStarsLayer.getY()+dY/2);
            backgroundStarsLayer.draw();
        }
    });



    return;

    var counter = 0,
    offset = 0;

    for (var i in actors) {
        if (actors[i].path.length > 1) {
            actors[i].time += Math.floor(Math.random() * 5000);
        }
    }

    var anim = new Kinetic.Animation( function (frame) {
        var orbitX,
        orbitY,
        radius,
        period,
        time,
        angle,
        currentMovie,
        next,
        distance,
        xDiff,
        yDiff,
        xDelt,
        yDelt,
        i,
        counter = 0;

        for (i in actors) {
            if (counter < 500) {
                counter++;
                //console.log(counter);
                orbitX = movies[actors[i].path[actors[i].currentMovie]].group.attrs.x;
                orbitY = movies[actors[i].path[actors[i].currentMovie]].group.attrs.y;
                radius = 25;   //actors[i].rad;
                period = actors[i].period;
                time = actors[i].time + frame.timeDiff;
                actors[i].time += frame.timeDiff;
                angle = actors[i].angle;


                actors[i].group.attrs.scale.x = actors[i].group.attrs.scale.y = 0.2 / 3;

                switch (actors[i].state)
                {
                    case "orbit":
                        // if home/initial position not reached, orbit
                        if (actors[i].time % period < (period - 20)) {
                            actors[i].group.setX(radius * Math.sin(2 * Math.PI * actors[i].time / period) + orbitX);
                            actors[i].group.setY(radius * Math.cos(2 * Math.PI * actors[i].time / period) + orbitY);
                        } else {
                            // after one full orbit, switch to positioning
                            actors[i].state = "positioning";
                            actors[i].time = 0;
                            //actors[i].attrs.fill = "green";

                            // calculate target angle to begin transition
                            currentMovie = movies[actors[i].path[actors[i].currentMovie]];
                            next = (actors[i].currentMovie+1 >= actors[i].path.length) ?
                            movies[actors[i].path[0]] : movies[actors[i].path[actors[i].currentMovie + 1]];

                            if (currentMovie === next) {
                                actors[i].state = "orbit";
                            }

                            // calculate angle and adjust to guarantee range between 0 and 2pi
                            actors[i].angle = Math.atan(-1 * (next.group.attrs.y - currentMovie.group.attrs.y)/(next.group.attrs.x - currentMovie.group.attrs.x));
                            if (next.group.attrs.x < currentMovie.group.attrs.x) {
                                actors[i].angle += Math.PI;
                            }
                            if (actors[i].angle < 0) {
                                actors[i].angle = (2 * Math.PI) + (actors[i].angle);
                            }
                        }
                        break;
                    case "positioning":
                        // orbit until target angle reached
                        if (actors[i].time < (actors[i].angle / (2 * Math.PI)) * period) {
                            actors[i].group.setX(radius * Math.sin(2 * Math.PI * actors[i].time / period) + orbitX);
                            actors[i].group.setY(radius * Math.cos(2 * Math.PI * actors[i].time / period) + orbitY);
                        } else {
                            // target angle reached, begin transition to new orbit
                            actors[i].state = "transitioning";
                            //actors[i].attrs.fill = "yellow";
                            actors[i].currentMovie = (actors[i].currentMovie+1 >= actors[i].path.length) ? 0 : actors[i].currentMovie + 1;
                            actors[i].time += 0.5 * period;
                            actors[i].angle += Math.PI;
                        }
                        break;
                    case "transitioning":
                        // while transition in progress, move toward destination each frame at normalized speed
                        // calculate distance to be moved
                        distance = (2 * Math.PI * radius) * (frame.timeDiff / period);

                        // calculate target position
                        actors[i].targX = radius * Math.sin(2 * Math.PI * actors[i].time / period) + orbitX;
                        actors[i].targY = radius * Math.cos(2 * Math.PI * actors[i].time / period) + orbitY;

                        // diff between here and there
                        xDiff = actors[i].targX - actors[i].group.attrs.x;
                        yDiff = actors[i].targY - actors[i].group.attrs.y;

                        if (Math.pow(xDiff, 2) + Math.pow(yDiff, 2) > 2.5) {
                            actors[i].time -= frame.timeDiff;

                            // deltas to be moved this frame
                            xDelt = Math.sqrt(Math.pow(distance, 2) / (Math.pow(yDiff / xDiff, 2) + 1));
                            yDelt = (yDiff / xDiff) * xDelt;
                            if (xDiff < 0) xDelt = xDelt * -1;
                            if (yDelt < 0 && yDiff >=0) yDelt = yDelt * -1;
                            if (yDelt > 0 && yDiff <=0) yDelt = yDelt * -1;

                            actors[i].group.setX(actors[i].group.attrs.x + xDelt);
                            actors[i].group.setY(actors[i].group.attrs.y + yDelt);
                        } else {
                            // new orbit reached, begin orbiting opposite direction
                            actors[i].state = "orbit2";
                            //actors[i].attrs.fill = "black";
                            //actors[i].attrs.counter = 100;

                            // orbit position is calculated with trig off of "time"
                            // new orbit will be going opposite direction from last orbit,
                            //  so have to update "time" to avoid jumping forward or back when beginning new orbit
                            if (actors[i].angle >= 0 && actors[i].angle <= Math.PI / 2) {
                                actors[i].angle = (Math.PI / 2) - actors[i].angle;
                            } else {
                                actors[i].angle = (5 * Math.PI / 2) - actors[i].angle;
                            }
                            actors[i].time = period * (actors[i].angle / (2 * Math.PI));
                        }
                        break;
                    case "orbit2":
                        // if home/initial position not reached, orbit
                        if (actors[i].time % period < (period - 20)) {
                            actors[i].group.setX(radius * Math.cos(2 * Math.PI * actors[i].time / period) + orbitX);
                            actors[i].group.setY(radius * Math.sin(2 * Math.PI * actors[i].time / period) + orbitY);
                        } else {
                            // after one full orbit, switch to positioning
                            actors[i].state = "pos2";
                            //actors[i].attrs.fill = "blue";
                            actors[i].time = 0;

                            // calculate target angle to begin transition
                            currentMovie = movies[actors[i].path[actors[i].currentMovie]];
                            next = (actors[i].currentMovie+1 >= actors[i].path.length) ?
                            movies[actors[i].path[0]] : movies[actors[i].path[actors[i].currentMovie + 1]];

                            if (currentMovie === next) {
                                actors[i].state = "orbit";
                            }

                            // calculate angle and adjust to guarantee range between 0 and 2pi
                            actors[i].angle = Math.atan(-1 * (next.group.attrs.y - currentMovie.group.attrs.y)/(next.group.attrs.x - currentMovie.group.attrs.x));
                            if (next.group.attrs.x < currentMovie.group.attrs.x) {
                                actors[i].angle += Math.PI;
                            }
                            if (actors[i].angle >= 0) {
                                actors[i].angle = (2 * Math.PI) - actors[i].angle - 0.5 * Math.PI;
                            } else if (actors[i].angle > -1 * Math.PI / 2) {
                                actors[i].angle = (-1 * actors[i].angle) + 1.5 * Math.PI;
                            } else if (actors[i].angle < -1 * Math.PI / 2) {
                                actors[i].angle = (-1 * actors[i].angle) - 0.5 * Math.PI;
                            }
                        }
                        break;
                    case "pos2":
                        // orbit until target angle reached
                        if (actors[i].time < (actors[i].angle / (2 * Math.PI)) * period) {
                            actors[i].group.setX(radius * Math.cos(2 * Math.PI * actors[i].time / period) + orbitX);
                            actors[i].group.setY(radius * Math.sin(2 * Math.PI * actors[i].time / period) + orbitY);
                        } else {
                            // target angle reached, begin transition
                            actors[i].state = "trans2";
                            //actors[i].attrs.fill = "white";
                            actors[i].currentMovie = (actors[i].currentMovie+1 >= actors[i].path.length) ? 0 : actors[i].currentMovie + 1;
                            actors[i].time += 0.5 * period;
                            actors[i].angle += Math.PI;
                        }
                        break;
                    case "trans2":
                        // while transition in progress, move toward destination each frame at normalized speed
                        distance = (2 * Math.PI * radius) * (frame.timeDiff / period);

                        actors[i].targX = radius * Math.cos(2 * Math.PI * actors[i].time / period) + orbitX;
                        actors[i].targY = radius * Math.sin(2 * Math.PI * actors[i].time / period) + orbitY;

                        xDiff = actors[i].targX - actors[i].group.attrs.x;
                        yDiff = actors[i].targY - actors[i].group.attrs.y;

                        if (Math.pow(xDiff, 2) + Math.pow(yDiff, 2) > 2.5) {
                            actors[i].time -= frame.timeDiff;

                            xDelt = Math.sqrt(Math.pow(distance, 2) / (Math.pow(yDiff / xDiff, 2) + 1));
                            yDelt = (yDiff / xDiff) * xDelt;
                            if (xDiff < 0) xDelt = xDelt * -1;
                            if (yDelt < 0 && yDiff >=0) yDelt = yDelt * -1;
                            if (yDelt > 0 && yDiff <=0) yDelt = yDelt * -1;

                            actors[i].group.setX(actors[i].group.attrs.x + xDelt);
                            actors[i].group.setY(actors[i].group.attrs.y + yDelt);
                        } else {
                            // new orbit reached, begin orbiting opposite direction
                            actors[i].state = "orbit";
                            //actors[i].attrs.fill = "red";
                            //actors[i].attrs.counter = 100;

                            // orbit position is calculated with trig off of "time"
                            // new orbit will be going opposite direction from last orbit,
                            //  so have to update "time" to avoid jumping forward or back when beginning new orbit
                            if (actors[i].angle >= 0 && actors[i].angle <= Math.PI / 2) {
                                actors[i].angle = (Math.PI / 2) - actors[i].angle;
                            } else {
                                actors[i].angle = (5 * Math.PI / 2) - actors[i].angle;
                            }
                            actors[i].time = period * (actors[i].angle / (2 * Math.PI));

                        }
                        break;
                }
            }
        }
    }, actorLayer);

    anim.start();
});

// dim movies by year
function dimByYear(year) {
    for (var i in movies) {
        if (movies[i].releaseDate.indexOf(year) > 0)
            movies[i].dim();
    }
    movieLayer.draw();
}

// undim movies by year
function unDimByYear(year) {
    for (var i in movies) {
        if (movies[i].releaseDate.indexOf(year) > 0)
            movies[i].unDim();
    }
}

// dim movies by genre
function dimByGenre(genre) {
    for (var i in movies) {
        if (movies[i].hasGenre(genre))
            movies[i].dim();
    }
}

// undim movies by genre
function unDimByGenre(genre) {
    for (var i in movies) {
        if (movies[i].hasGenre(genre))
            movies[i].unDim();
    }
}