// movie object
function Movie(opts) {
    // instance vars
    this.imageAnim;
    this.flipAnim;
    this.dimAnim;
    this.theta = 0;
    this.isFlipped;

    // capture options
    this.actorIds = opts.actorIds;
    this.directorId = opts.directorId;
    this.genres = opts.genres;
    this.poster = opts.poster;
    this.revenue = opts.revenue;
    this.releaseDate = opts.releaseDate;
    this.title = opts.title;
    this.x = opts.x;
    this.y = opts.y;
    this.scale = opts.scale/8;

    /*
     * dim circle
     */
    this.dimCircle = new Kinetic.Circle({
        opacity: 0,
        fill: '#333333',
        stroke: null
    });
    this.dimCircle.hide();

    /*
     * minimal group
     */
    this.minimalGroup = new Kinetic.Group();

    // add the sun image
    var self = this;
    $('#movie-front').one('load', function() {
        // get the image from the DOM
        var image = new Kinetic.Image({
            image: this
        });

        // add the image to the group and center the group (offset)
        self.minimalGroup.add(image);
        self.minimalGroup.setOffset([image.getWidth()/2, image.getHeight()/2]);
        self.minimalGroup.draw();

        // set the dim circle's dimensions
        self.dimCircle.setRadius(image.getWidth()/2 - 20);
    });

    /*
     * image group
     */
    this.imageGroup = new Kinetic.Group({
        opacity: 0
    });
    this.imageGroup.hide();

    // image clipping circle
    this.imageCircle = new Kinetic.Circle({
        radius: 155,
        fillPatternOffset: [250, 320],
        fillPatternScale: .6,
        fillPatternRepeat: false
    });
    this.imageGroup.add(this.imageCircle);

    // start getting the poster image
    var imageObj = new Image();
    imageObj.onload = function() {
        self.imageCircle.setFillPatternImage(imageObj);
    }
    imageObj.src = opts.poster;

    // label group
    var labelGroup = new Kinetic.Group();
    var labelWidth = 280;
    var labelHeight = 90;

    // label text
    var label = new Kinetic.Text({
        fontSize: 20,
        fill: 'black',
        text: this.title,
        align: 'center',
        width: labelWidth,
        offset: [labelWidth/2, 0],
        padding: 22
    });

    // label background
    var labelBackground = new Kinetic.Rect({
        width: labelWidth,
        height: labelHeight,
        offset: [labelWidth/2, 0],
        fill: '#fede3d',
        stroke: null,
        cornerRadius: 5
    });

    labelGroup.add(labelBackground);
    labelGroup.add(label);
    labelGroup.setY(90);
    this.imageGroup.add(labelGroup);

    /*
     * info group
     */
    this.infoGroup = new Kinetic.Group({
        scale: {
            x: -1
        }
    });
    this.infoGroup.hide();

    // background
    this.infoGroup.add(this.minimalGroup.clone());

    // info label image
    $('#movie-info-labels').one('load', function() {
        // get the image from the DOM
        var image = new Kinetic.Image({
            image: this
        });

        // add the info label image to the group and center the group (offset)
        self.infoGroup.add(image);
        image.setOffset([image.getWidth()/2, image.getHeight()/2 + 35]);
        self.infoGroup.draw();
    });

    // director text
    this.infoGroup.add(new Kinetic.Text({
        offset: [115, 0],
        y: -115,
        width: 230,
        text: directorsJSON[self.directorId].name,
        fontSize: 25,
        fill: 'black',
        align: 'center'
    }));

    // release date text
    var date = new Date(this.releaseDate)
    this.infoGroup.add(new Kinetic.Text({
        offset: [148, 0],
        y: -36,
        width: 162,
        text: this.releaseDate,
        fontSize: 25,
        fill: 'black',
        align: 'center'
    }));

    // revenue
    this.infoGroup.add(new Kinetic.Text({
        offset: [-9, 0],
        y: -36,
        width: 162,
        text: Math.round(this.revenue*100/1000000)/100,
        fontSize: 25,
        fill: 'black',
        align: 'center'
    }));

    // title label
    this.infoGroup.add(labelGroup.clone());

    /*
     * main group
     */
    this.group = new Kinetic.Group({
        x: this.x,
        y: this.y,
        scale: this.scale
    });

    // combine
    this.group.add(this.minimalGroup);
    this.group.add(this.imageGroup);
    this.group.add(this.infoGroup);
    this.group.add(this.dimCircle);

    this.group.on('click', function(e) {
        console.log(e)
        self.click();
    });
}

// show the movie's image instead of the sun
Movie.prototype.showImage = function() {
    // show the image group
    this.imageGroup.show();

    // stop existing animation
    if (this.imageAnim)
        this.imageAnim.stop();

    // start the animation
    this.imageAnim = new Kinetic.Animation((function(self) {
        var newOpacity = self.imageGroup.getOpacity() + .05;
        if (newOpacity >= 1) {
            self.imageGroup.setOpacity(1);
            self.imageAnim.stop();
        }
        self.imageGroup.setOpacity(newOpacity);
        self.group.draw();
    })(this));
    this.imageAnim.start();
}

// show the minimal movie view (sun instead of image)
Movie.prototype.showSun = function() {
    // show the sun group
    this.minimalGroup.show();

    // stop existing animation
    if (this.imageAnim)
        this.imageAnim.stop();

    // start the animation
    this.imageAnim = new Kinetic.Animation((function(self) {
        var newOpacity = self.imageGroup.getOpacity() - .05;
        if (newOpacity <= 0) {
            self.imageGroup.setOpacity(0);
            self.imageAnim.stop();

            // hide the image group for speed
            self.imageGroup.hide();
        }
        self.imageGroup.setOpacity(newOpacity);
        self.group.draw();
    })(this));
    this.imageAnim.start();
}

// flip the movie to the info side
Movie.prototype.flipToInfo = function() {
    // no-op if already on info
    if (this.theta == Math.PI)
        return;

    // stop existing animation
    if (this.flipAnim)
        this.flipAnim.stop();

    // start the animation
    this.isFlipped = false;
    this.flipAnim = new Kinetic.Animation((function(self) {
        self.theta += Math.PI/90*3;

        // handle flipping over
        if (!self.isFlipped && self.theta >= Math.PI/2) {
            self.flipped = true;

            // hide and show
            self.infoGroup.show();
            self.imageGroup.hide();
        }

        // stop flipping at 180 degrees
        if (self.theta >= Math.PI) {
            self.theta = Math.PI;
            self.group.attrs.scale.x = -self.scale;
            self.flipAnim.stop();
        }

        self.group.attrs.scale.x = Math.cos(self.theta) * self.scale;
        self.group.draw();
    })(this));
    this.flipAnim.start();
}

// flip the movie to the image side
Movie.prototype.flipToImage = function() {
    // no-op if already on image
    if (this.theta == 0)
        return;

    // stop existing animation
    if (this.flipAnim)
        this.flipAnim.stop();

    // start the animation
    this.isFlipped = false;
    this.flipAnim = new Kinetic.Animation((function(self) {
        self.theta -= Math.PI/90*3;

        // handle flipping over
        if (!self.isFlipped && self.theta <= Math.PI/2) {
            self.flipped = true;

            // hide and show
            self.imageGroup.show();
            self.infoGroup.hide();
        }

        // stop flipping at 180 degrees
        if (self.theta <= 0) {
            self.theta = 0;
            self.group.attrs.scale.x = self.scale;
            ;
            self.flipAnim.stop();
        }

        self.group.attrs.scale.x = Math.cos(self.theta) * self.scale;
        self.group.draw();
    })(this));
    this.flipAnim.start();
}

Movie.prototype.click = function() {
    // image to info
    if (this.theta == 0)
        this.flipToInfo();

    // info to image
    else if (this.theta == Math.PI)
        this.flipToImage();
}

// dim the movie
Movie.prototype.dim = function() {
    // show the image group
    this.dimCircle.show();

    // stop existing animation
    if (this.dimAnim)
        this.dimAnim.stop();

    // start the animation
    this.dimAnim = new Kinetic.Animation((function(self) {
        return function() {
            var newOpacity = self.dimCircle.getOpacity() + .2;
            if (newOpacity >= .9) {
                self.dimCircle.setOpacity(.9);
                self.dimAnim.stop();
            }
            self.dimCircle.setOpacity(newOpacity);
            self.group.draw();
        }
    })(this));
    this.dimAnim.start();
}

// undim the movie
Movie.prototype.unDim = function() {
    // stop existing animation
    if (this.dimAnim)
        this.dimAnim.stop();

    // start the animation
    this.dimAnim = new Kinetic.Animation((function(self) {
        return function() {
            var newOpacity = self.dimCircle.getOpacity() - .2;
            if (newOpacity <= 0) {
                self.dimCircle.setOpacity(0);
                self.dimCircle.hide();
                self.dimAnim.stop();
            }
            self.dimCircle.setOpacity(newOpacity);
            self.group.draw();
        }
    })(this));
    this.dimAnim.start();
}

// returns true if the movie has the specified genre
Movie.prototype.hasGenre = function(genre) {
    var found = false;
    $.each(this.genres, function(i, elem) {
        if (elem == genre) {
            found = true;
            return false;
        }
    });
    return found;
}