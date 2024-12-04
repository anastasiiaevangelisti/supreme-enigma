let font;
let tSize = 100; // size for "menu"
let sectionSize = 25; // size for words in the row
let pointCount = 0.5; // particle density for text
let tposX, tposY;

let speed = 20; // speed of particles
let comebackSpeed = 100; // lower the numbers less power
let dia = 90; // interaction radius
let randomPos = true; // starting points random or fixed
let pointsDirection = "up"; // direction of points' movement
let interactionDirection = -0.5; // interaction strength

let textPoints = []; // array to hold points of either "menu" or words
let bgColor = [262, 100, 90]; // initial background color
let textColor = [16, 100, 40]; // initial text color
let radius = 20; // sensitivity radius for detecting mouse clicks
let showSections = false; // toggle between "menu" and words view
let contactView = false; // toggle for contact page

// Array of words to display after "menu" and their positions
let words = ["back", "works", "about", "contact"];
let sectionPositions;

let soundEffect;

function preload() {
  font = loadFont("font.ttf");
  soundEffect = loadSound("glitch-01-231255.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  textFont(font);

  calculatePositions();
  loadMenuPoints(); // Initially load "menu" points
  noCursor(); // Disable the standard cursor
}

function draw() {
  background(bgColor);

  if (contactView) {
    drawContactView(); // Show only contact email
  } else {
    for (let v of textPoints) {
      if (v instanceof Interact) {
        v.update();
        v.show();
        v.behaviors();
      }
    }
  }

  // Draw a black small ellipse at the cursor position
  noStroke();
  fill(0); // Black color
  ellipse(mouseX, mouseY, 8, 8); // Small ellipse (8x8 pixels)

  // Debugging: Draw bounding boxes (optional)
  if (!contactView) {
    noFill();
    stroke(200, 50, 100);
    strokeWeight(2);

    // Menu box
    //rect(width / 2 - tSize * 1.7, height / 2 - tSize, tSize * 3.4, tSize * 2);

    // Word boxes
    for (let pos of sectionPositions) {
     // rect(pos.x - sectionSize, pos.y - sectionSize, sectionSize * 2, sectionSize);
    }
  }
}

function mousePressed() {
  if (contactView) {
    // Return to "menu" from contact page
    contactView = false;
    textPoints = [];
    loadMenuPoints();
    return;
  }

  // Check if the mouse is within the bounding box of "menu"
  let menuBox = {
    x1: width / 2 - tSize * 1.7, // Adjusted for padding
    y1: height / 2 - tSize,
    x2: width / 2 + tSize * 1.7,
    y2: height / 2 + tSize,
  };
  if (
    mouseX > menuBox.x1 &&
    mouseX < menuBox.x2 &&
    mouseY > menuBox.y1 &&
    mouseY < menuBox.y2
  ) {
    soundEffect.play();
    toggleMenuInteraction();
    return;
  }

  for (let i = 0; i < textPoints.length; i++) {
    let v = textPoints[i];
    let distanceToMouse = dist(mouseX, mouseY, v.pos.x, v.pos.y);

    if (distanceToMouse < radius * 2) { // Expanded radius
      if (showSections) {
        if (words[0] === "back" && i < textPoints.length / 4) {
          // Check if clicked on "back"
          showSections = false;
          textPoints = [];
          loadMenuPoints();
          return;
        }

        if (words[3] === "contact" && i >= (textPoints.length * 3) / 4) {
          // Check if clicked on "contact"
          contactView = true;
          textPoints = [];
          soundEffect.play();
          return;
        }
      }

      // Toggle background and text color on click
      let tempColor = bgColor;
      bgColor = textColor;
      textColor = tempColor;

      // Show section points for words
      if (!showSections) {
        showSections = true;
        textPoints = [];
        loadSectionPoints();
      }
      break;
    }
  }
}

function toggleMenuInteraction() {
  showSections = !showSections;
  textPoints = [];
  if (showSections) {
    loadSectionPoints();
  } else {
    loadMenuPoints();
  }
}

function calculatePositions() {
  // Calculate "menu" position dynamically
  tposX = width / 2 - tSize * 1.5;
  tposY = height / 2 + tSize / 2;

  // Calculate positions for the section words dynamically
  sectionPositions = [
    { x: width / 5, y: height / 2 },
    { x: width / 2.5, y: height / 2 },
    { x: width / 1.7, y: height / 2 },
    { x: width / 1.2, y: height / 2 },
  ];
}

function loadMenuPoints() {
  // Load points for the "menu" word
  let points = font.textToPoints("menu", tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });
  for (let pt of points) {
    let textPoint = new Interact(
      pt.x,
      pt.y,
      speed,
      dia,
      randomPos,
      comebackSpeed,
      pointsDirection,
      interactionDirection
    );
    textPoints.push(textPoint);
  }
}

function loadSectionPoints() {
  // Load points for each word in the words array and place them in a row
  for (let i = 0; i < words.length; i++) {
    let points = font.textToPoints(words[i], sectionPositions[i].x, sectionPositions[i].y, sectionSize, {
      sampleFactor: pointCount,
    });
    for (let pt of points) {
      let textPoint = new Interact(
        pt.x,
        pt.y,
        speed,
        dia,
        randomPos,
        comebackSpeed,
        pointsDirection,
        interactionDirection
      );
      textPoints.push(textPoint);
    }
  }
}

function drawContactView() {
  // Display contact information in the center
  textAlign(CENTER, CENTER);
  fill(textColor);
  textSize(tSize / 3);
  text("anastasiiaevanglst@gmail.com", width / 2, height / 2);
}

function Interact(x, y, m, d, t, s, di, p) {
  // Start particles from the center of the canvas
  this.home = createVector(width / 2, height / 2);
  this.pos = this.home.copy();
  this.target = createVector(x, y);

  if (di == "general") this.vel = createVector();
  else if (di == "up") this.vel = createVector(0, -y);
  else if (di == "down") this.vel = createVector(0, y);
  else if (di == "left") this.vel = createVector(-x, 0);
  else if (di == "right") this.vel = createVector(x, 0);

  this.acc = createVector();
  this.r = 8;
  this.maxSpeed = m;
  this.maxforce = 1;
  this.dia = d;
  this.come = s;
  this.dir = p;
}

Interact.prototype.behaviors = function () {
  let arrive = this.arrive(this.target);
  let mouse = createVector(mouseX, mouseY);
  let flee = this.flee(mouse);

  this.applyForce(arrive);
  this.applyForce(flee);
};

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
};

Interact.prototype.arrive = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = this.maxSpeed;
  if (d < this.come) {
    speed = map(d, 0, this.come, 0, this.maxSpeed);
  }
  desired.setMag(speed);
  let steer = p5.Vector.sub(desired, this.vel);
  return steer;
};

Interact.prototype.flee = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();

  if (d < this.dia) {
    desired.setMag(this.maxSpeed);
    desired.mult(this.dir);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector(0, 0);
  }
};

Interact.prototype.update = function () {
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
};

Interact.prototype.show = function () {
  noStroke(); // Disable strokes
  fill(textColor); // Use the text color for points
  ellipse(this.pos.x, this.pos.y, 3, 3); // Render points as small circles
};
