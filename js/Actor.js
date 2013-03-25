// actor object
function Actor(opts) {
    // local vars
    this.tailPlaceInterval;
    this.tailDegradeInterval;
    this.imageAnim;

    // capture options
    this.dob = opts.dob;
    this.name = opts.name;
    this.path = opts.movieIds;
    this.currentMovie = 0;
    this.rad = 250;
    this.period = 5000;
    this.state = "orbit";
    this.time = 0;
    this.angle = 0;

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
        text: this.name,
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
    this.group.add(this.label);
}

// show the actor's image instead of the star
Actor.prototype.showImage = function() {
    // show the image and label
    this.imageCircle.show();
    this.label.show();

    // stop existing animation
    if (this.imageAnim)
        this.imageAnim.stop();

    // start the animation
    var self = this;
    this.imageAnim = new Kinetic.Animation(function() {
        var newOpacity = self.imageCircle.getOpacity() + .05;
        if (newOpacity >= 1) {
            self.imageCircle.setOpacity(1);
            self.label.setOpacity(1);
            self.imageAnim.stop();

            // hide the hidden stuff for speed
            self.star.hide();
            self.gradientCircle.hide();
        }
        self.imageCircle.setOpacity(newOpacity);
        self.label.setOpacity(newOpacity);
        stage.draw();
    });
    this.imageAnim.start();
}

// show the minimal actor view (star instead of image)
Actor.prototype.showStar = function() {
    // show the star parts
    this.gradientCircle.show();
    this.star.show();

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
            self.imageAnim.stop();

            // hide the hidden stuff for speed
            self.imageCircle.hide();
            self.label.hide();
        }
        self.imageCircle.setOpacity(newOpacity);
        self.label.setOpacity(newOpacity);
        stage.draw();
    });
    this.imageAnim.start();
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