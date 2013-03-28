// movie object
function Movie(opts) {
    // local vars
    this.imageAnim;
    this.flipAnim;
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

    // start getting the image
    var imageObj = new Image();
    var self = this;
    imageObj.onload = function() {
        self.imageCircle.setFillPatternImage(imageObj);
    }
    imageObj.src = opts.poster;

    /*
     * sun group
     */
    this.sunGroup = new Kinetic.Group();

    // gradient circle
    this.sunGroup.add(new Kinetic.Circle({
        radius: 150,
        fill: 'yellow'
    }));

    /*
     * image group
     */
    this.imageGroup = new Kinetic.Group({
        opacity: 0
    });
    this.imageGroup.hide();

    // image circle
    this.imageCircle = new Kinetic.Circle({
        radius: 135,
        fillPatternOffset: [250, 320],
        fillPatternScale: .6,
        fillPatternRepeat: false
    });
    this.imageGroup.add(this.imageCircle);

    // label group
    var labelGroup = new Kinetic.Group();

    // label text
    var label = new Kinetic.Text({
        fontSize: 20,
        fill: 'black',
        text: this.title
    });
    label.setX(-label.textWidth/2);
    label.setY((70-label.textHeight)/2);

    // label background
    var labelBackground = new Kinetic.Rect({
        width: 230,
        height: 70,
        fill: 'yellow',
        stroke: null,
        cornerRadius: 5
    });
    labelBackground.setX(-labelBackground.getWidth()/2);

    labelGroup.add(labelBackground);
    labelGroup.add(label);
    labelGroup.setY(85);
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
    this.infoGroup.add(this.sunGroup.clone());

    // label
    this.infoGroup.add(labelGroup.clone());

    this.infoGroup.add(new Kinetic.Circle({
        fill: 'black',
        radius: 10
    }));



    /*
     * main group
     */
    this.group = new Kinetic.Group({
        x: opts.x,
        y: opts.y
    });

    // combine
    this.group.add(this.sunGroup);
    this.group.add(this.imageGroup);
    this.group.add(this.infoGroup);
}

// show the movie's image instead of the sun
Movie.prototype.showImage = function() {
    // show the image group
    this.imageGroup.show();

    // stop existing animation
    if (this.imageAnim)
        this.imageAnim.stop();

    // start the animation
    var self = this;
    this.imageAnim = new Kinetic.Animation(function() {
        var newOpacity = self.imageGroup.getOpacity() + .05;
        if (newOpacity >= 1) {
            self.imageGroup.setOpacity(1);
            self.imageAnim.stop();
        }
        self.imageGroup.setOpacity(newOpacity);
        stage.draw();
    });
    this.imageAnim.start();
}

// show the minimal movie view (sun instead of image)
Movie.prototype.showSun = function() {
    // show the sun group
    this.sunGroup.show();

    // stop existing animation
    if (this.imageAnim)
        this.imageAnim.stop();

    // start the animation
    var self = this;
    this.imageAnim = new Kinetic.Animation(function() {
        var newOpacity = self.imageGroup.getOpacity() - .05;
        if (newOpacity <= 0) {
            self.imageGroup.setOpacity(0);
            self.imageAnim.stop();

            // hide the image group for speed
            self.imageGroup.hide();
        }
        self.imageGroup.setOpacity(newOpacity);
        stage.draw();
    });
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
    var self = this;
    this.flipAnim = new Kinetic.Animation(function() {
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
            self.theta = Math.PI
            self.group.attrs.scale.x = -1;
            self.flipAnim.stop();
        }

        self.group.attrs.scale.x = Math.cos(self.theta);
        stage.draw();
    });
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
    var self = this;
    this.flipAnim = new Kinetic.Animation(function() {
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
            self.group.attrs.scale.x = 1;
            self.flipAnim.stop();
        }

        self.group.attrs.scale.x = Math.cos(self.theta);
        stage.draw();
    });
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