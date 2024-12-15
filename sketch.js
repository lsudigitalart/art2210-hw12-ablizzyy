let shared;
let myRacer;

function preload() {
  partyConnect(
    "wss://demoserver.p5party.org", 
    "hello_party"
  );
  shared = partyLoadShared("shared", { racers: [] });
}

function setup() {
  createCanvas(800, 400);
  noStroke();

  // Each client gets a unique shape and color.
  const shapeTypes = ["circle", "square", "triangle"];
  let myShape = shapeTypes[floor(random(shapeTypes.length))];
  let myColor = color(random(255), random(255), random(255));

  // Create my racer.
  myRacer = new Racer(width / 4, height / 2, myShape, myColor);
  shared.racers.push(myRacer.getSharedData());
}

function mousePressed() {
  myRacer.x = mouseX;
  myRacer.y = mouseY;
}

function draw() {
  background(220);
  fill(0);
  textSize(16);
  textAlign(CENTER);
  text("Press SPACE to boost your racer!", width / 2, 30);

  // Draw finish line
  stroke(0);
  line(width - 50, 0, width - 50, height);
  noStroke();
  text("Finish", width - 25, height / 2);

  // Update and display all racers.
  shared.racers = shared.racers.map(r => Racer.fromSharedData(r));
  for (let racer of shared.racers) {
    racer.update();
    racer.display();
  }

  // Check if my racer reaches the finish line.
  if (myRacer.x > width - 50) {
    fill(0, 255, 0);
    textSize(32);
    text("You win!", width / 2, height / 2);
    noLoop();
  }

  // Synchronize my racer's data.
  shared.racers[partyConnect.clientId] = myRacer.getSharedData();
}

function keyPressed() {
  if (key === ' ') {
    myRacer.boost();
  }
}

// Racer class definition.
class Racer {
  constructor(x, y, shape, col) {
    this.x = x;
    this.y = y;
    this.shape = shape;
    this.color = col;
    this.speed = 2;
    this.boostDuration = 0;
  }

  static fromSharedData(data) {
    let racer = new Racer(data.x, data.y, data.shape, color(data.color[0], data.color[1], data.color[2]));
    racer.speed = data.speed;
    racer.boostDuration = data.boostDuration;
    return racer;
  }

  getSharedData() {
    return {
      x: this.x,
      y: this.y,
      shape: this.shape,
      color: [red(this.color), green(this.color), blue(this.color)],
      speed: this.speed,
      boostDuration: this.boostDuration
    };
  }

  boost() {
    this.boostDuration = 30; // Boost lasts for 30 frames.
  }

  update() {
    if (this.boostDuration > 0) {
      this.speed = 5;
      this.boostDuration--;
    } else {
      this.speed = 2;
    }
    this.x += this.speed;
  }

  display() {
    fill(this.color);
    noStroke();
    switch (this.shape) {
      case "circle":
        ellipse(this.x, this.y, 40);
        break;
      case "square":
        rect(this.x - 20, this.y - 20, 40, 40);
        break;
      case "triangle":
        triangle(this.x - 20, this.y + 20, this.x + 20, this.y + 20, this.x, this.y - 20);
        break;
    }
  }
}

