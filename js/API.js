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

            // twilight fix
            var index = 0;
            if (elem == 'The Twilight Saga: Breaking Dawn - Part 1')
                index = 1;

            // planet of the apes fix
            if (elem == 'Planet of the Apes')
                index = 1;

            // lookup the movie by ID
            $.get(endpoint + 'movie/' + data.results[index].id, {
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
                                profile: null,
                                popularity: data.popularity
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

function orderByPopularity() {
    $.each(moviesJSON, function(i, elem) {
        // sort the actors by popularity
        elem.actorIds.sort(function(a, b) {
            return actorsJSON[b].popularity - actorsJSON[a].popularity;
        });
    });
}

function forJohnAndMichelle() {
    var out = {};
    $.each(moviesJSON, function(i, elem) {
        console.log(elem)
        var entry = {
            title: elem.title,
            actors: []
        };

        $.each(elem.actorIds, function(i, elem) {
            entry.actors.push(actorsJSON[elem].name + ' - ' + actorsJSON[elem].popularity);
        });

        out[i] = entry;
    });

    console.log(JSON.stringify(out));
}