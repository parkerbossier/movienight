// movie object
function Movie(opts) {
    // local vars
    this.imageAnim;

    // capture options
    this.actorIds = opts.actorIds;
    this.directorId = opts.directorId;
    this.genres = opts.genres;
    this.poster = opts.poster;
    this.revenue = opts.revenue;
    this.releaseDate = opts.releaseDate;
    this.title = opts.title;

    // image circle
    this.imageCircle = new Kinetic.Circle({
        radius: 70,
        fillPatternOffset: [250, 320],
        fillPatternScale: .2,
        fillPatternRepeat: false,
        opacity: 0
    });
    this.imageCircle.hide();

    // label
    this.label = new Kinetic.Text({
        fontSize: 30,
        fill: 'white',
        text: this.title,
        y: 80,
        opacity: 0
    });
    this.label.setX(-this.label.textWidth/2)
    this.label.hide();

    // start getting the image
    var imageObj = new Image();
    var self = this;
    imageObj.onload = function() {
        self.imageCircle.setFillPatternImage(imageObj);
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

// show the minimal movie view (sun instead of image)
Movie.prototype.showSun = function() {
    // show the sun
    this.gradientCircle.show();

    // stop existing animation
    if (this.imageAnim)
        this.imageAnim.stop();

    // start the animation
    var self = this;
    this.imageAnim = new Kinetic.Animation(function() {
        var newOpacity = self.imageCircle.getOpacity() - .05;
        if (newOpacity <= 0) {
            self.imageCircle.setOpacity(0);
            self.label.setOpacity(0);
            self.imageStarAnim.stop();

            // hide the hidden stuff for speed
            self.imageCircle.hide();
            self.label.hide();
        }
        self.imageCircle.setOpacity(newOpacity);
        self.label.setOpacity(newOpacity);
        stage.draw();
    });
    this.imageStarAnim.start();
}