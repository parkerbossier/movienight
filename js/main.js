var imageBase, moviesJSON, actorsJSON, directorsJSON;
var endpoint = 'http://api.themoviedb.org/3/';
var apiKey = '742fa948b5cbc1a2c82dbd37f14e2f7e';
var actors, movies, directors;
var movieNames = ["How the Grinch Stole Christmas","Cast Away","Mission: Impossible II","Gladiator","What Women Want","The Perfect Storm","Harry Potter and the Sorcerer's Stone","The Lord of the Rings: The Fellowship of the Ring","Rush Hour 2","The Mummy Returns","Pearl Harbor","Ocean's Eleven","Jurassic Park III","Planet of the Apes","Spider-Man","The Lord of the Rings: The Two Towers","Star Wars: Episode II - Attack of the Clones","Harry Potter and the Chamber of Secrets","My Big Fat Greek Wedding","Signs","Austin Powers in Goldmember","Men in Black II","The Lord of the Rings: The Return of the King","Pirates of the Caribbean: The Curse of the Black Pearl","The Matrix Reloaded","Bruce Almighty","X2","Elf","Spider-Man 2","The Passion of the Christ","Meet the Fockers","Harry Potter and the Prisoner of Azkaban","The Day After Tomorrow","The Bourne Supremacy","National Treasure","Star Wars: Episode III - Revenge of the Sith","The Chronicles of Narnia: The Lion","the Witch and the Wardrobe","Harry Potter and the Goblet of Fire","War of the Worlds","King Kong","Wedding Crashers","Charlie and the Chocolate Factory","Batman Begins","Mr. & Mrs. Smith","Hitch","Pirates of the Caribbean: Dead Man's Chest","Night at the Museum","X-Men: The Last Stand","The Da Vinci Code","300","Superman Returns","Spider-Man 3","Transformers","Pirates of the Caribbean: At World's End","Harry Potter and the Order of the Phoenix","I Am Legend","The Bourne Ultimatum","National Treasure: Book of Secrets","The Dark Knight","Iron Man","Indiana Jones and the Kingdom of the Crystal Skull","Hancock","Twilight","Avatar","Transformers: Revenge of the Fallen","Harry Potter and the Half-Blood Prince","The Twilight Saga: New Moon","The Hangover","Star Trek","The Blind Side","Sherlock Holmes","X-Men Origins: Wolverine","Night at the Museum: Battle of the Smithsonian","Alice in Wonderland","Iron Man 2","The Twilight Saga: Eclipse","Harry Potter and the Deathly Hallows: Part 1","Inception","The Karate Kid","Harry Potter and the Deathly Hallows: Part 2","Transformers: Dark of the Moon","The Twilight Saga: Breaking Dawn - Part 1","The Hangover Part II","Pirates of the Caribbean: On Stranger Tides","Fast Five","Mission: Impossible - Ghost Protocol","Sherlock Holmes: A Game of Shadows","Thor","Rise of the Planet of the Apes","Captain America: The First Avenger","The Avengers","The Dark Knight Rises","The Hunger Games","Skyfall","The Hobbit: An Unexpected Journey","The Twilight Saga: Breaking Dawn - Part 2","The Amazing Spider-Man","Ted","Lincoln","Men in Black 3"];

var stage, actorLayer, movieLayer, tailLayer;
$(function () {
    // stage init
    stage = new Kinetic.Stage({
        container: 'container',
        width: window.innerWidth,
        height: window.innerHeight,
        draggable: true
    });
    actorLayer = new Kinetic.Layer();
    movieLayer = new Kinetic.Layer();
    tailLayer = new Kinetic.Layer();

    // create all the actors
    actors = {};
    $.each(actorsJSON, function(i, elem) {
        var opts = elem;
        opts.x = window.innerWidth/3;
        opts.y = window.innerHeight/2;
        actors[i] = new Actor(opts);
    });

    // create all the movies
    movies = {};
    $.each(moviesJSON, function(i, elem) {
        var opts = elem;
        opts.x = window.innerWidth/3*2;
        opts.y = window.innerHeight/2;
        movies[i] = new Movie(opts);
    });

    //console.log(actors);
    //console.log(movies);
    actorLayer.add(actors[31].group);
    console.log(actors[31]);
    console.log(movies[591]);
    console.log(movies[8358]);
    // actorLayer.add(actors[6].group);
    // actorLayer.add(actors[22].group);
    // actorLayer.add(actors[31].group);
    // actorLayer.add(actors[35].group);   // 3
    // movieLayer.add(movies[22].group);   // 22
    // movieLayer.add(movies[58].group);
    // movieLayer.add(movies[74].group);
    // movieLayer.add(movies[98].group);
    movieLayer.add(movies[591].group);
    movies[8358].group.attrs.x = window.innerWidth/3;
    movieLayer.add(movies[8358].group);
    stage.add(tailLayer);
    stage.add(actorLayer);
    stage.add(movieLayer);

    var anim = new Kinetic.Animation( function (frame) {
        //frame.time;
        //frame.timeDiff;
        //frame.frameRate;
        //console.log("running");

        var orbitX,
            orbitY,
            radius,
            period,
            time,
            angle,
            current,
            next,
            distance,
            xDiff,
            yDiff,
            xDelt,
            yDelt,
            i;

        for (i in actors) {
            if (i == 31) {
            orbitX = movies[actors[i].path[actors[i].current]].group.attrs.x;
            orbitY = movies[actors[i].path[actors[i].current]].group.attrs.y;
            radius = actors[i].rad;
            period = actors[i].period;
            time = actors[i].time + frame.timeDiff;
            actors[i].time += frame.timeDiff;
            angle = actors[i].angle;

            switch (actors[i].state)
            {
            case "orbit":
                // if home/initial position not reached, orbit
                //if (actors[i].time % period < (period - 20)) {
                if (time < period) {
                    actors[i].group.setX(radius * Math.sin(2 * Math.PI * actors[i].time / period) + orbitX);
                    actors[i].group.setY(radius * Math.cos(2 * Math.PI * actors[i].time / period) + orbitY);
                } else {
                // after one full orbit, switch to positioning
                    actors[i].state = "positioning";
                    actors[i].time = 0;
                    //actors[i].attrs.fill = "green";

                    // calculate target angle to begin transition
                    current = movies[actors[i].path[actors[i].current]];
                    next = (actors[i].current+1 >= actors[i].path.length) ?
                        movies[actors[i].path[0]] : movies[actors[i].path[actors[i].current + 1]];

                    if (current === next) {
                        actors[i].state = "orbit";
                    }

                    // calculate angle and adjust to guarantee range between 0 and 2pi
                    actors[i].angle = Math.atan(-1 * (next.group.attrs.y - current.group.attrs.y)/(next.group.attrs.x - current.group.attrs.x));
                    if (next.group.attrs.x < current.group.attrs.x) {
                        actors[i].angle += Math.PI;
                    }
                    if (actors[i].angle < 0) { actors[i].angle = (2 * Math.PI) + (actors[i].angle); }
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
                    actors[i].current = (actors[i].current+1 >= actors[i].path.length) ? 0 : actors[i].current + 1;
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
                    current = movies[actors[i].path[actors[i].current]];
                    next = (actors[i].current+1 >= actors[i].path.length) ?
                        movies[actors[i].path[0]] : movies[actors[i].path[actors[i].current + 1]];

                    if (current === next) {
                        actors[i].state = "orbit";
                    }

                    // calculate angle and adjust to guarantee range between 0 and 2pi
                    actors[i].angle = Math.atan(-1 * (next.group.attrs.y - current.group.attrs.y)/(next.group.attrs.x - current.group.attrs.x));
                    if (next.group.attrs.x < current.group.attrs.x) {
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
                    actors[i].current = (actors[i].current+1 >= actors[i].path.length) ? 0 : actors[i].current + 1;
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
        }}
    }, actorLayer);

    anim.start();

});

// API initialization
function apiInit() {
    $.ajaxSetup({
        async: false
    });

    // get image base
    $.ajax(endpoint + 'configuration', {
        async: false,
        data: {
            api_key: apiKey
        },
        success: function(data) {
            imageBase = data.images.base_url + 'w500';
        }
    });
}

// fetch all the the JSON!
function getTheJSON() {
    // var inits
    moviesJSON = {};
    actorsJSON = {};
    directorsJSON = {};

    // loop through each movie name
    $.each(movieNames, function(i, elem) {

        // find the movie ID
        $.get(endpoint + 'search/movie', {
            api_key: apiKey,
            query: elem
        }, function(data) {

            // lookup the movie by ID
            $.get(endpoint + 'movie/' + data.results[0].id, {
                api_key: apiKey,
                append_to_response: 'images,casts'
            }, function(data) {

                // build the movie JSON
                var movie = {
                    genres: [],
                    actorIds: [],
                    title: data.title,
                    revenue: data.revenue,
                    poster: imageBase + data.images.posters[0].file_path,
                    releaseDate: data.release_date
                };
                moviesJSON[data.id] = movie;

                // extract genres
                $.each(data.genres, function(i, elem) {
                    movie.genres.push(elem.name)
                });

                // find the director in the response
                $.each(data.casts.crew, function(i, elem) {
                    if (elem.job == 'Director') {
                        // add the director ID to the movie
                        movie.directorId = elem.id;

                        // new director
                        if (!directorsJSON[elem.id]) {

                            // add to directors list and initialize his movie list
                            directorsJSON[elem.id] = {
                                movieIds: [data.id]
                            };

                            // get info from API
                            $.get(endpoint + 'person/' + elem.id, {
                                api_key: apiKey,
                                append_to_response: 'images'
                            }, function(data) {
                                $.extend(directorsJSON[elem.id], {
                                    name: data.name,
                                    dob: data.birthday,
                                    profile: null
                                });

                                if (data.images.profiles.length)
                                    directorsJSON[elem.id].profile = imageBase + data.images.profiles[0].file_path;
                            });
                        }

                        // existing director. update his movie list
                        else {
                            directorsJSON[elem.id].movieIds.push(data.id);
                        }
                    }
                });

                // capture the actors
                $.each(data.casts.cast, function(i, elem) {

                    // add the actor ID to the movie
                    movie.actorIds.push(elem.id);

                    // new actor
                    if (!actorsJSON[elem.id]) {

                        // add to actors list and initialize his movie list
                        actorsJSON[elem.id] = {
                            movieIds: [data.id]
                        };

                        // get info from API
                        $.get(endpoint + 'person/' + elem.id, {
                            api_key: apiKey,
                            append_to_response: 'images'
                        }, function(data) {
                            $.extend(actorsJSON[elem.id], {
                                name: data.name,
                                dob: data.birthday,
                                profile: null
                            });

                            if (data.images.profiles.length)
                                actorsJSON[elem.id].profile = imageBase + data.images.profiles[0].file_path;
                        });
                    }

                    // existing actor. update his movie list
                    else {
                        actorsJSON[elem.id].movieIds.push(data.id);
                    }
                });
            });
        });
    });
}

// actor object
function Actor(opts) {
    // local vars
    this.tailPlaceInterval;
    this.tailDegradeInterval;

    // capture options
    this.dob = opts.dob;
    this.name = opts.name;
    this.path = opts.movieIds;
    this.current = 0;
    this.rad = 250;
    this.period = 5000;
    this.state = "orbit";
    this.time = 0;
    this.angle = 0;

    // start getting the image
    var imageObj = new Image();
    var self = this;
    imageObj.onload = function() {
        self.image = new Kinetic.Image({
            image: imageObj
        });
    }
    imageObj.src = opts.profile;

    // group
    this.group = new Kinetic.Group({
        x: opts.x,
        y: opts.y
    });

    // gradient circle
    this.gradientCircle = new Kinetic.Circle({
        radius: 70,
        opacity: 0.6,
        fillRadialGradientStartPoint: 0,
        fillRadialGradientStartRadius: 10,
        fillRadialGradientEndPoint: 0,
        fillRadialGradientEndRadius: 70,
        fillRadialGradientColorStops: [0, 'black', 1, 'white']
    });

    // image circle
    this.imageCircle = new Kinetic.Circle({
        radius: 70,
        fillPatternImage: this.image
    });
    this.imageCircle.hide();

    // star
    this.star = new Kinetic.Star({
        numPoints: 5,
        innerRadius: 35,
        outerRadius: 55,
        fill: 'white',
        stroke: null
    });

    // trail
    this.tail = new Kinetic.Group();
    tailLayer.add(this.tail);

    // combine
    this.group.add(this.gradientCircle);
    this.group.add(this.imageCircle);
    this.group.add(this.star);
}
Actor.prototype.showImage = function() {
    this.star.hide();
    this.gradientCircle.hide()
    this.imageCircle.show();
}
Actor.prototype.showStar = function() {
    this.imageCircle.hide();
    this.star.show();
    this.gradientCircle.show()
}
Actor.prototype.startTail = function() {
    var maxTails = 20;
    var self = this;

    // palce tails
    this.tailPlaceInterval = setInterval(function() {
        // truncate the trail
        if (self.tail.children.length > maxTails-1)
            self.tail.children = self.tail.children.splice(1, maxTails-1);

        // create a new trail marker
        var tailMarker = new Kinetic.Circle({
            x: self.group.getX(),
            y: self.group.getY(),
            radius: 8,
            fill: 'white',
            stroke: null
        });
        self.tail.add(tailMarker);
    }, 500);

    // degrade tails
    this.tailDegradeInterval = setInterval(function() {
        var opacity;
        for (var i = 0; i < self.tail.children.length; ++i) {
            opacity = self.tail.children[i].getOpacity();
            self.tail.children[i].setOpacity(opacity*.99);
        }
    }, 50);
}
Actor.prototype.stopTail = function() {
    clearInterval(this.tailPlaceInterval);
    clearInterval(this.tailDegradeInterval);
}

function foo() {
    var theta = 0;
    setInterval(function() {
        var actor = actors[3];

        actor.group.setPosition({
            x: window.innerWidth/2 + Math.cos(theta)*200,
            y: window.innerHeight/2 + Math.sin(theta)*200
        });

        theta += Math.PI*2/360*2;
        stage.draw();

    }, 50);
    actors[3].startTail()
}

// movie object
function Movie(opts) {
    // capture options
    this.actorIds = opts.actorIds;
    this.directorId = opts.directorId;
    this.genres = opts.genres;
    this.poster = opts.poster;
    this.revenue = opts.revenue;
    this.releaseDate = opts.releaseDate;
    this.title = opts.title;

    // start getting the image
    var imageObj = new Image();
    var self = this;
    imageObj.onload = function() {
        self.image = new Kinetic.Image({
            image: imageObj
        });
    }
    imageObj.src = opts.poster;

    // group
    this.group = new Kinetic.Group({
        x: opts.x,
        y: opts.y
    });

    // gradient circle
    this.gradientCircle = new Kinetic.Circle({
        radius: 70,
        fillRadialGradientStartPoint: 0,
        fillRadialGradientStartRadius: 10,
        fillRadialGradientEndPoint: 0,
        fillRadialGradientEndRadius: 70,
        fillRadialGradientColorStops: [0, 'yellow', .9, 'yellow', 1, '#ffec91']
    });

    // image circle
    this.imageCircle = new Kinetic.Circle({
        radius: 70,
        fillPatternImage: this.image
    });
    this.imageCircle.hide();

    // combine
    this.group.add(this.gradientCircle);
    this.group.add(this.imageCircle);
}
Movie.prototype.showImage = function() {
    this.gradientCircle.hide()
    this.imageCircle.show();
}
Movie.prototype.showStar = function() {
    this.imageCircle.hide();
    this.gradientCircle.show();
}