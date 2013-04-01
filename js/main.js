// globals
var actors, movies, directors;
var stage, backgroundStarsLayer, staticOverlayLayer, actorLayer, movieLayer, tailLayer;
var currentZoom = 0;
var zoomLevels = [.5, .9, 1.6, 5];
var zoomIndicators, filterToggleGroup, zoomGroup;
var selectAllButton, selectNoneButton;
var greyColor = '#777777';
var goldColor = '#fed400';
var activeFilterColor = '#ffffff';
var yearFilters, genreFilters;

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

    // load the image
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
    staticOverlayLayer = new Kinetic.Layer();

    // add the overlay image
    var overlayImage = new Kinetic.Image({
        x: containerWidth/2,
        y: containerHeight/2,
        listening: false
    });
    staticOverlayLayer.add(overlayImage);

    // load the overlay image
    $('#main-overlay').one('load', function() {
        // get the image from the DOM (centered)
        overlayImage.setImage(this);
        overlayImage.setOffset([overlayImage.getWidth()/2, overlayImage.getHeight()/2]);

        staticOverlayLayer.draw();
    });

    /*
     * year group init
     */
    var yearGroup = new Kinetic.Group({
        x: containerWidth/2 + 2,
        y: containerHeight/2 + 86
    });
    staticOverlayLayer.add(yearGroup);

    // add the years
    var overshoot = 0;
    var thetaInit = Math.PI + Math.PI/180*overshoot;
    var thetaFinal = -Math.PI/180*overshoot;
    var step = -(thetaFinal-thetaInit)/13;
    var theta;
    yearFilters = [];
    for (var i = 0; i < 14; ++i) {
        // add the year
        theta = thetaInit+step*i;
        yearFilters[i] = new Kinetic.Text({
            fontSize: 25,
            fontFamily: 'advent',
            text: 2000+i,
            fill: activeFilterColor,
            x: Math.cos(theta)*386,
            y: Math.sin(theta)*386,
            rotation: theta+Math.PI/2
        });
        yearFilters[i].setOffset([yearFilters[i].getTextWidth()/2, yearFilters[i].getTextHeight()/2]);
        yearGroup.add(yearFilters[i]);

        // click handler
        yearFilters[i].on('click', function() {
            // turning year on
            if (this.getFill() != activeFilterColor) {
                unDimByYear(this.textArr[0].text);
                this.setFill(activeFilterColor);
            }

            // turning year off
            else {
                dimByYear(this.textArr[0].text);
                this.setFill(greyColor);
            }

            // update
            yearGroup.draw();

            // update filter toggles
            selectAllButton.setFill(greyColor);
            selectNoneButton.setFill(greyColor);
            filterToggleGroup.draw();
        });
    }

    /*
     * genre group init
     */
    var genreGroup = new Kinetic.Group({
        x: containerWidth/2 + 2,
        y: containerHeight/2 + 86
    });
    staticOverlayLayer.add(genreGroup);

    // add the genres
    overshoot = 0;
    thetaInit = Math.PI + Math.PI/180*overshoot;
    thetaFinal = -Math.PI/180*overshoot;
    step = -(thetaFinal-thetaInit)/(genres.length-1);
    genreFilters = [];
    for (i = 0; i < genres.length; ++i) {
        // add the year
        theta = thetaInit+step*i;
        genreFilters[i] = new Kinetic.Text({
            fontSize: 25,
            fontFamily: 'advent',
            text: genres[i],
            fill: activeFilterColor,
            x: Math.cos(theta)*446,
            y: Math.sin(theta)*446,
            rotation: theta+Math.PI/2
        });
        genreFilters[i].setOffset([genreFilters[i].getTextWidth()/2, genreFilters[i].getTextHeight()/2]);
        genreGroup.add(genreFilters[i]);

        // click handler
        genreFilters[i].on('click', function() {
            // turning year on
            if (this.getFill() != activeFilterColor) {
                unDimByGenre(this.textArr[0].text);
                this.setFill(activeFilterColor);
            }

            // turning year off
            else {
                dimByGenre(this.textArr[0].text);
                this.setFill(greyColor);
            }

            // update
            genreGroup.draw();

            // update filter toggles
            selectAllButton.setFill(greyColor);
            selectNoneButton.setFill(greyColor);
            filterToggleGroup.draw();
        });

        genreFilters[i].on('mouseover', (function(i) {
            return function() {
                genreFilters[i].setFill(goldColor);
                genreGroup.draw();
            }
        })(i));
        genreFilters[i].on('mouseout', function() {
            //genreFilters[i].setFill(goldColor);
            });
    }

    /*
     * filter toggle group init
     */
    var signWidth = 20;
    var lineWidth = 5;
    filterToggleGroup = new Kinetic.Group({
        x: 131,
        y: 89
    });
    staticOverlayLayer.add(filterToggleGroup);

    // select all
    var selectAllGroup = new Kinetic.Group();
    selectAllGroup.add(new Kinetic.Rect({
        fill: 'transparent',
        opacity: .5,
        width: 100,
        height: 30,
        x: -87,
        y: -15
    }));
    selectAllButton = new Kinetic.Circle({
        radius: signWidth/2,
        fill: goldColor
    });
    selectAllGroup.add(selectAllButton);
    filterToggleGroup.add(selectAllGroup);

    // select none
    var selectNoneGroup = new Kinetic.Group({
        y: 35
    });
    selectNoneGroup.add(new Kinetic.Rect({
        fill: 'transparent',
        opacity: .5,
        width: 122,
        height: 30,
        x: -109,
        y: -15
    }));
    selectNoneButton = new Kinetic.Circle({
        radius: signWidth/2,
        fill: greyColor
    });
    selectNoneGroup.add(selectNoneButton);
    filterToggleGroup.add(selectNoneGroup);

    // click handlers
    selectAllGroup.on('click', function() {
        selectAllButton.setFill(goldColor);
        selectNoneButton.setFill(greyColor);
        filterToggleGroup.draw();

        for (var i in genreFilters) {
            genreFilters[i].setFill(activeFilterColor);
        }
        for (var i in yearFilters) {
            yearFilters[i].setFill(activeFilterColor);
        }
        genreGroup.draw();
        yearGroup.draw();

        // dim all
        for (var j in movies) {
            movies[j].unDim();
        }
    });
    selectNoneGroup.on('click', function() {
        selectNoneButton.setFill(goldColor);
        selectAllButton.setFill(greyColor);
        filterToggleGroup.draw();

        for (var i in genreFilters) {
            genreFilters[i].setFill(greyColor);
        }
        for (var i in yearFilters) {
            yearFilters[i].setFill(greyColor);
        }
        genreGroup.draw();
        yearGroup.draw();

        // dim all
        for (var j in movies) {
            movies[j].dim();
        }
    });

    /*
     * zoom group init
     */
    zoomGroup = new Kinetic.Group({
        x: 118,
        y: 192
    });
    staticOverlayLayer.add(zoomGroup);
    var plusMinusColor = '#bbbbbb';

    // + button
    var plusGroup = new Kinetic.Group({
        x: 13
    });
    plusGroup.add(new Kinetic.Rect({
        width: signWidth,
        height: signWidth,
        offset: [signWidth/2, signWidth/2]
    }));
    plusGroup.add(new Kinetic.Rect({
        width: signWidth,
        height: lineWidth,
        offset: [signWidth/2, lineWidth/2],
        fill: plusMinusColor,
        stroke: null
    }));
    plusGroup.add(new Kinetic.Rect({
        width: lineWidth,
        height: signWidth,
        offset: [lineWidth/2, signWidth/2],
        fill: plusMinusColor,
        stroke: null
    }));
    zoomGroup.add(plusGroup);

    // - button
    var minusGroup = new Kinetic.Group({
        x: 13,
        y: 208
    });
    minusGroup.add(new Kinetic.Rect({
        width: signWidth,
        height: signWidth,
        offset: [signWidth/2, signWidth/2]
    }));
    minusGroup.add(new Kinetic.Rect({
        width: signWidth,
        height: lineWidth,
        offset: [signWidth/2, lineWidth/2],
        fill: plusMinusColor,
        stroke: null
    }));
    zoomGroup.add(minusGroup);

    // click handlers
    plusGroup.on('click', function() {
        setZoomLevel(Math.min(zoomLevels.length-1, currentZoom+1));
    });
    minusGroup.on('click', function() {
        setZoomLevel(Math.max(0, currentZoom-1));
    });

    // zoom levels
    zoomIndicators = [];
    for (i = 0; i < 4; ++i) {
        zoomIndicators[3-i] = new Kinetic.Circle({
            radius: signWidth/2,
            fill: greyColor,
            x: 13,
            y: i*40 + 46
        })
        zoomGroup.add(zoomIndicators[3-i]);

        // click handler
        zoomIndicators[3-i].on('click', (function(newLevel) {
            return function() {
                setZoomLevel(newLevel);
            }
        })(3-i));
    }
    zoomIndicators[0].setFill(goldColor);


    // draw it all
    staticOverlayLayer.draw();

    /*
     * tail layer init
     */
    tailLayer = new Kinetic.Layer();

    /*
     * movie layer init
     */

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
        y: containerHeight/2 - 30,
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

    /*
     * actor layer init
     */
    actorLayer = new Kinetic.Layer({
        scale: zoomLevels[0],
        x: containerWidth/2,
        y: containerHeight/2 - 30,
        offset: [bounds.right/2, bounds.bottom/2]
    });

    // create all the actors
    actors = {};
    $.each(actorsJSON, function(i, elem) {
        if (i > 4000)
            return;

        var opts = elem;
        actors[i] = new Actor(opts);
        actorLayer.add(actors[i].group);
    });

    /*
     * combine all the layers
     */
    stage.add(backgroundStarsLayer);
    stage.add(tailLayer);
    stage.add(actorLayer);
    stage.add(movieLayer);
    stage.add(staticOverlayLayer);

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
        if (dragging && currentZoom != 0) {
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

            tailLayer.setX(tailLayer.getX()+dX);
            tailLayer.setY(tailLayer.getY()+dY);
            tailLayer.draw();

            // parallax layers
            backgroundStarsLayer.setX(backgroundStarsLayer.getX()+dX/2);
            backgroundStarsLayer.setY(backgroundStarsLayer.getY()+dY/2);
            backgroundStarsLayer.draw();
        }
    });









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
            if (counter < 1000000) {
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

// zoom to the appropriate zoom level
var zooming = false;
function setZoomLevel(level) {
    // disallow changing the zoom if a change is in progress
    if (zooming)
        return;

    var step = (zoomLevels[level] - zoomLevels[currentZoom])/30;
    var anim = new Kinetic.Animation(function() {
        movieLayer.setScale(movieLayer.getScale().x + step);
        actorLayer.setScale(actorLayer.getScale().x + step);
        tailLayer.setScale(tailLayer.getScale().x + step);
        backgroundStarsLayer.setScale(backgroundStarsLayer.getScale().x + step/2);

        // base case
        if (Math.abs(movieLayer.getScale().x - zoomLevels[level]) < .001) {
            anim.stop();

            // change the indicator
            zoomIndicators[currentZoom].setFill(greyColor);
            zoomIndicators[level].setFill(goldColor);
            zoomGroup.draw();

            // update state
            currentZoom = level;
            zooming = false;
        }

        movieLayer.draw();
        backgroundStarsLayer.draw();
    });
    zooming = true;
    anim.start();
}