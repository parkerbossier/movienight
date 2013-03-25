var imageBase, moviesJSON, actorsJSON, directorsJSON;
var endpoint = 'http://api.themoviedb.org/3/';
var apiKey = '742fa948b5cbc1a2c82dbd37f14e2f7e';
var actors, movies, directors;
var movieNames = ["How the Grinch Stole Christmas","Cast Away","Mission: Impossible II","Gladiator","What Women Want","The Perfect Storm","Harry Potter and the Sorcerer's Stone","The Lord of the Rings: The Fellowship of the Ring","Rush Hour 2","The Mummy Returns","Pearl Harbor","Ocean's Eleven","Jurassic Park III","Planet of the Apes","Spider-Man","The Lord of the Rings: The Two Towers","Star Wars: Episode II - Attack of the Clones","Harry Potter and the Chamber of Secrets","My Big Fat Greek Wedding","Signs","Austin Powers in Goldmember","Men in Black II","The Lord of the Rings: The Return of the King","Pirates of the Caribbean: The Curse of the Black Pearl","The Matrix Reloaded","Bruce Almighty","X2","Elf","Spider-Man 2","The Passion of the Christ","Meet the Fockers","Harry Potter and the Prisoner of Azkaban","The Day After Tomorrow","The Bourne Supremacy","National Treasure","Star Wars: Episode III - Revenge of the Sith","The Chronicles of Narnia: The Lion, the Witch and the Wardrobe","Harry Potter and the Goblet of Fire","War of the Worlds","King Kong","Wedding Crashers","Charlie and the Chocolate Factory","Batman Begins","Mr. & Mrs. Smith","Hitch","Pirates of the Caribbean: Dead Man's Chest","Night at the Museum","X-Men: The Last Stand","The Da Vinci Code","300","Superman Returns","Spider-Man 3","Transformers","Pirates of the Caribbean: At World's End","Harry Potter and the Order of the Phoenix","I Am Legend","The Bourne Ultimatum","National Treasure: Book of Secrets","The Dark Knight","Iron Man","Indiana Jones and the Kingdom of the Crystal Skull","Hancock","Twilight","Avatar","Transformers: Revenge of the Fallen","Harry Potter and the Half-Blood Prince","The Twilight Saga: New Moon","The Hangover","Star Trek","The Blind Side","Sherlock Holmes","X-Men Origins: Wolverine","Night at the Museum: Battle of the Smithsonian","Alice in Wonderland","Iron Man 2","The Twilight Saga: Eclipse","Harry Potter and the Deathly Hallows: Part 1","Inception","The Karate Kid","Harry Potter and the Deathly Hallows: Part 2","Transformers: Dark of the Moon","The Twilight Saga: Breaking Dawn - Part 1","The Hangover Part II","Pirates of the Caribbean: On Stranger Tides","Fast Five","Mission: Impossible - Ghost Protocol","Sherlock Holmes: A Game of Shadows","Thor","Rise of the Planet of the Apes","Captain America: The First Avenger","The Avengers","The Dark Knight Rises","The Hunger Games","Skyfall","The Hobbit: An Unexpected Journey","The Twilight Saga: Breaking Dawn - Part 2","The Amazing Spider-Man","Ted","Lincoln","Men in Black 3"];

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
    $.each({
        22: moviesJSON[22]
    }, function(i, elem) {
        var opts = elem;
        opts.x = window.innerWidth/3*2;
        opts.y = window.innerHeight/2;
        movies[i] = new Movie(opts);
    });

    actorLayer.add(actors[3].group);
    movieLayer.add(movies[22].group);
    stage.add(tailLayer);
    stage.add(actorLayer);
    stage.add(movieLayer);
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
    this.movieIds = opts.movieIds;
    this.name = opts.name;

    // image circle
    this.imageCircle = new Kinetic.Circle({
        radius: 70,
        fillPatternOffset: [250, 320],
        fillPatternScale: .2,
        fillPatternRepeat: false
    });
    //this.imageCircle.hide();

    // start getting the image
    var imageObj = new Image();
    var self = this;
    imageObj.onload = function() {
        self.imageCircle.setFillPatternImage(imageObj);
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
    this.group.add(this.star);
    this.group.add(this.imageCircle);
}

// show the actor's image instead of the star
Actor.prototype.showImage = function() {
    this.star.hide();
    this.gradientCircle.hide()
    this.imageCircle.show();
    stage.draw();
}

// show the minimal actor view (star instead of image)
Actor.prototype.showStar = function() {
    this.imageCircle.hide();
    this.star.show();
    this.gradientCircle.show()
}

// start dropping a tail
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

// stop and clear the tail
Actor.prototype.stopTail = function() {
    this.tail.children = [];
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

        theta += Math.PI*2/360;
        stage.draw();

    }, 50);
    actors[3].startTail()
}

function bar() {
    var genres = [];
    $.each(moviesJSON, function(i, elem) {
        $.each(elem.genres, function(i, elem) {
            if (genres.indexOf(elem) == -1)
                genres.push(elem);
        });
    });
    console.log(genres);
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