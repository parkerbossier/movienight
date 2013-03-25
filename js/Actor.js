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

    // start getting the image
    var imageObj = new Image();
    var self = this;
    imageObj.onload = function() {
        self.imageCircle.setFillPatternImage(imageObj);
    }
    imageObj.src = opts.profile;

    // star group
    this.starGroup = new Kinetic.Group();

    // gradient background
    this.starGroup.add(new Kinetic.Circle({
        radius: 70,
        opacity: 0.6,
        fillRadialGradientStartPoint: 0,
        fillRadialGradientStartRadius: 10,
        fillRadialGradientEndPoint: 0,
        fillRadialGradientEndRadius: 70,
        fillRadialGradientColorStops: [0, 'black', 1, 'white']
    }));

    // star
    this.starGroup.add(new Kinetic.Star({
        numPoints: 5,
        innerRadius: 35,
        outerRadius: 55,
        fill: 'white',
        stroke: null
    }));

    // image group
    this.imageGroup = new Kinetic.Group({
        opacity: 0
    });
    this.imageGroup.hide();

    // background circle
    this.imageGroup.add(new Kinetic.Circle({
        radius: 70,
        fill: 'white',
        opacity: .9
    }));

    // image circle
    this.imageCircle = new Kinetic.Circle({
        radius: 60,
        fillPatternOffset: [250, 320],
        fillPatternScale: .2,
        fillPatternRepeat: false
    });
    this.imageGroup.add(this.imageCircle);

    // label (don't add yet)
    var label = new Kinetic.Text({
        fontSize: 20,
        fill: 'black',
        text: this.name,
        y: 45
    });
    label.setX(-label.textWidth/2);

    // label background
    this.imageGroup.add(new Kinetic.Rect({
        width: label.textWidth + 20,
        height: label.textHeight + 10,
        x: -(label.textWidth + 20)/2,
        y: 40,
        fill: 'white',
        stroke: null,
        cornerRadius: 5
    }));

    // now we can add the label text
    this.imageGroup.add(label);

    // group
    this.group = new Kinetic.Group({
        x: opts.x,
        y: opts.y
    });

    // trail
    this.tail = new Kinetic.Group();
    tailLayer.add(this.tail);

    // combine
    this.group.add(this.starGroup);
    this.group.add(this.imageGroup);
}

// show the actor's image instead of the star
Actor.prototype.showImage = function() {
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

            // hide the star group for speed
            self.starGroup.hide();
        }
        self.imageGroup.setOpacity(newOpacity);
        stage.draw();
    });
    this.imageAnim.start();
}

// show the minimal actor view (star instead of image)
Actor.prototype.showStar = function() {
    // show the star group
    this.starGroup.show();

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