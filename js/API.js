var movieNames = ["How the Grinch Stole Christmas","Cast Away","Mission: Impossible II","Gladiator","What Women Want","The Perfect Storm","Harry Potter and the Sorcerer's Stone","The Lord of the Rings: The Fellowship of the Ring","Rush Hour 2","The Mummy Returns","Pearl Harbor","Ocean's Eleven","Jurassic Park III","Planet of the Apes","Spider-Man","The Lord of the Rings: The Two Towers","Star Wars: Episode II - Attack of the Clones","Harry Potter and the Chamber of Secrets","My Big Fat Greek Wedding","Signs","Austin Powers in Goldmember","Men in Black II","The Lord of the Rings: The Return of the King","Pirates of the Caribbean: The Curse of the Black Pearl","The Matrix Reloaded","Bruce Almighty","X2","Elf","Spider-Man 2","The Passion of the Christ","Meet the Fockers","Harry Potter and the Prisoner of Azkaban","The Day After Tomorrow","The Bourne Supremacy","National Treasure","Star Wars: Episode III - Revenge of the Sith","The Chronicles of Narnia: The Lion","the Witch and the Wardrobe","Harry Potter and the Goblet of Fire","War of the Worlds","King Kong","Wedding Crashers","Charlie and the Chocolate Factory","Batman Begins","Mr. & Mrs. Smith","Hitch","Pirates of the Caribbean: Dead Man's Chest","Night at the Museum","X-Men: The Last Stand","The Da Vinci Code","300","Superman Returns","Spider-Man 3","Transformers","Pirates of the Caribbean: At World's End","Harry Potter and the Order of the Phoenix","I Am Legend","The Bourne Ultimatum","National Treasure: Book of Secrets","The Dark Knight","Iron Man","Indiana Jones and the Kingdom of the Crystal Skull","Hancock","Twilight","Avatar","Transformers: Revenge of the Fallen","Harry Potter and the Half-Blood Prince","The Twilight Saga: New Moon","The Hangover","Star Trek","The Blind Side","Sherlock Holmes","X-Men Origins: Wolverine","Night at the Museum: Battle of the Smithsonian","Alice in Wonderland","Iron Man 2","The Twilight Saga: Eclipse","Harry Potter and the Deathly Hallows: Part 1","Inception","The Karate Kid","Harry Potter and the Deathly Hallows: Part 2","Transformers: Dark of the Moon","The Twilight Saga: Breaking Dawn - Part 1","The Hangover Part II","Pirates of the Caribbean: On Stranger Tides","Fast Five","Mission: Impossible - Ghost Protocol","Sherlock Holmes: A Game of Shadows","Thor","Rise of the Planet of the Apes","Captain America: The First Avenger","The Avengers","The Dark Knight Rises","The Hunger Games","Skyfall","The Hobbit: An Unexpected Journey","The Twilight Saga: Breaking Dawn - Part 2","The Amazing Spider-Man","Ted","Lincoln","Men in Black 3"];

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