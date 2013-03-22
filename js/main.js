var movies, actors, directors;
var movieNames = ['vanilla sky', 'minority report', 'mission: impossible'];
var endpoint = 'http://api.themoviedb.org/3/';
var apiKey = '742fa948b5cbc1a2c82dbd37f14e2f7e';
var imageBase;

// geometry vars
var actorStarOpts = {
    numPoints: 5,
    innerRadius: 35,
    outerRadius: 55,
    fill: 'white',
    stroke: null
};
var actorBackCircleOpts = {
    radius: 70,
    opacity: 0.6,
    fillRadialGradientStartPoint: 0,
    fillRadialGradientStartRadius: 10,
    fillRadialGradientEndPoint: 0,
    fillRadialGradientEndRadius: 70,
    fillRadialGradientColorStops: [0, 'black', 1, 'white']
};

var star, stage;
$(function () {
    apiInit();
    //getTheJSON();
    
    stage = new Kinetic.Stage({
        container: 'container',
        width: window.innerWidth,
        height: window.innerHeight,
        draggable: true
    });
    var actorLayer = new Kinetic.Layer();
    
    
    
    actorLayer.add(createActor(actors[500]));
    stage.add(actorLayer);
});

// API initialization
function apiInit() {
    $.ajaxSetup({
        async: false
    });

    // get image base
    $.get(endpoint + 'configuration', {
        api_key: apiKey
    }, function(data) {
        imageBase = data.images.base_url + 'w500';
    });
}

// fetch all the the JSON!
function getTheJSON() {
    // var inits
    movies = {};
    actors = {};
    directors = {};
    
    $.ajaxSetup({
        async: false
    });
    
    // get the movie IDs
    var movieIds = [];
    $.each(movieNames, function(i, elem) {
        $.get(endpoint + 'search/movie', {
            api_key: apiKey,
            query: elem
        }, function(data) {
            movieIds.push(data.results[0].id);
        });
    });
    
    // build each movie object
    $.each(movieIds, function(i, elem) {
        
        $.get(endpoint + 'movie/' + elem, {
            api_key: apiKey,
            append_to_response: 'images,casts'
        }, function(data) {
            var movie = {
                genres: [],
                actorIds: [],
                title: data.title,
                revenue: data.revenue,
                poster: data.images.posters[0].file_path
            };
            movies[data.id] = movie;
            
            // extract genres
            $.each(data.genres, function(i, elem) {
                movie.genres.push(elem.name) 
            });
            
            // find the director
            $.each(data.casts.crew, function(i, elem) {
                if (elem.job == 'Director') {
                    // add the director ID to the movie
                    movie.directorId = elem.id;
                   
                    // new director. add to directors list and initialize his movie list
                    if (!directors[elem.id]) {
                        directors[elem.id] = {
                            movieIds: [data.id]
                        };
                    }
                
                    // existing director. update his movie list
                    else {
                        directors[elem.id].movieIds.push(data.id);
                    }
                }
            });
            
            // capture the actors
            $.each(data.casts.cast, function(i, elem) {
                // add the actor ID to the movie
                movie.actorIds.push(elem.id);
                
                // new actor. add to actors list and initialize his movie list
                if (!actors[elem.id]) {
                    actors[elem.id] = {
                        movieIds: [data.id]
                    };
                }
                
                // existing actor. update his movie list
                else {
                    actors[elem.id].movieIds.push(data.id);
                }
            });
        });
    });
    
    // update actor details
    $.each(actors, function(i, elem) {
        
        $.get(endpoint + 'person/' + i, {
            api_key: apiKey,
            append_to_response: 'images'
        }, function(data) {
            $.extend(actors[i], {
                name: data.name,
                dob: data.birthday,
                profile: null
            });
            if (data.images.profiles.length)
                actors[i].profile = data.images.profiles[0].file_path;
        });
    });
    
    // update director details
    $.each(directors, function(i, elem) {
        
        $.get(endpoint + 'person/' + i, {
            api_key: apiKey,
            append_to_response: 'images'
        }, function(data) {
            $.extend(directors[i], {
                name: data.name,
                dob: data.birthday,
                profile: null
            });
            if (data.images.profiles.length)
                directors[i].profile = data.images.profiles[0].file_path;
        });
    });
}

// return the image path URL
function imagePath(path) {
    return imageBase + path;
}

// create and return an actor
function createActor(actor) {
    // group
    var opts = {
        x: window.innerWidth/2,
        y: window.innerHeight/2
    }
    var group = new Kinetic.Group(opts);
    
    // circle
    opts = $.extend({}, actorBackCircleOpts);
    var circle = new Kinetic.Circle(opts);
    
    // star
    opts = $.extend({}, actorStarOpts);
     star = new Kinetic.Star(opts);
    
    // combine
    group.add(circle);
    group.add(star);
        
    // load the image
    var imageObj = new Image();
    imageObj.onload = function() {
        var actorImage = new Kinetic.Image({
            image: imageObj,
            width: 70,
            height: 70
        });
        
        star.setFill(actorImage);
        console.log(star)
    };
    imageObj.src = imagePath(actor.profile);
   
    
    return group;
}
var star;

// show and hide the star!!!!