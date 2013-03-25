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
        //if (i < 100000)
        actorLayer.add(actors[i].group);
    });

    // create all the movies
    movies = {};
    $.each(moviesJSON, function(i, elem) {
        var opts = elem;
        opts.x = window.innerWidth/3*2;
        opts.y = window.innerHeight/2;
        movies[i] = new Movie(opts);
        //if (i < 100000) 
            movieLayer.add(movies[i].group);
    });

    console.log(actors);
    console.log(movies);
    // actorLayer.add(actors[31].group);
    // console.log(actors[31]);
    // console.log(movies[591]);
    // console.log(movies[8358]);
    // // actorLayer.add(actors[6].group);
    // // actorLayer.add(actors[22].group);
    // // actorLayer.add(actors[31].group);
    // // actorLayer.add(actors[35].group);   // 3
    // // movieLayer.add(movies[22].group);   // 22
    // // movieLayer.add(movies[58].group);
    // // movieLayer.add(movies[74].group);
    // // movieLayer.add(movies[98].group);
    // movieLayer.add(movies[591].group);
    // movies[8358].group.attrs.x = window.innerWidth/3;
    // movieLayer.add(movies[8358].group);
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
            if (counter < 20) {
            counter++;
            console.log(counter);
            orbitX = movies[actors[i].path[actors[i].currentMovie]].group.attrs.x;
            orbitY = movies[actors[i].path[actors[i].currentMovie]].group.attrs.y;
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

function foo() {
    var theta = 0;
    setInterval(function() {
        var actor = actors[3];

        actor.group.setPosition({
            x: window.innerWidth/2 + Math.cos(theta)*200,
            y: window.innerHeight/2 + Math.sin(theta)*200
        });

        theta += Math.PI*2/360*3/2;
        stage.draw();

    }, 50);
    actors[3].startTail()
}