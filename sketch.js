// Ensure HSB color mode for easier color manipulation if needed later
// Although this specific example uses RGB/HSB interchangeably for simple colors.
// colorMode(HSB, 360, 100, 100); // Uncomment if specific HSB colors are desired

let ship;
let bullets = [];
let asteroids = [];
let score = 0;
let asteroidSpawnRate = 0.015; // Probability per frame to spawn an asteroid
let isGameOver = false;

// ==================
// p5.js Setup Function
// ==================
function setup() {
  createCanvas(windowWidth, windowHeight);
  ship = new Ship();
  // Spawn initial asteroids
  for (let i = 0; i < 5; i++) {
    asteroids.push(new Asteroid());
  }
  textAlign(CENTER, CENTER);
  textSize(20);
  noCursor(); // Hide the default cursor
}

// ==================
// p5.js Draw Loop
// ==================
function draw() {
  // Dark blue space with slight transparency for trails effect
  background(10, 10, 30, 150);

  if (isGameOver) {
    displayGameOver();
    return; // Stop game logic when game over
  }

  // --- Update and Draw Ship ---
  ship.update();
  ship.draw();

  // --- Update and Draw Bullets ---
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].draw();
    if (bullets[i].isOffscreen()) {
      bullets.splice(i, 1); // Remove bullet if it goes off-screen
    }
  }

  // --- Spawn New Asteroids ---
  // Spawn asteroids based on probability, limiting the total number
  if (random(1) < asteroidSpawnRate && asteroids.length < 20) {
    asteroids.push(new Asteroid());
  }

  // --- Update and Draw Asteroids / Check Collisions ---
  // Iterate backwards through asteroids for safe removal
  for (let i = asteroids.length - 1; i >= 0; i--) {
    asteroids[i].update();
    asteroids[i].draw();

    // Check collision: Bullet vs Asteroid
    let asteroidHit = false;
    // Iterate backwards through bullets for safe removal
    for (let j = bullets.length - 1; j >= 0; j--) {
      // Ensure both asteroid and bullet still exist before checking
      if (asteroids[i] && bullets[j] && asteroids[i].hits(bullets[j])) {
        // Optional: Implement asteroid splitting here
        // e.g., if (asteroids[i].size > 30) { createSmallerAsteroids(); }
        asteroids.splice(i, 1); // Remove asteroid
        bullets.splice(j, 1); // Remove bullet
        score++;
        asteroidHit = true; // Mark asteroid as hit
        break; // Exit inner loop (bullet loop) as asteroid is gone
      }
    }

    // If the asteroid was destroyed by a bullet, skip the ship collision check
    if (asteroidHit) continue;

    // Check collision: Ship vs Asteroid (only if asteroid still exists)
    if (asteroids[i] && asteroids[i].hitsShip(ship)) {
       isGameOver = true; // Set game over flag
       // Optional: Add logic for losing a life instead of immediate game over
    }
  }

  // --- Display Score ---
  displayScore();
}

// ==================
// Helper Functions
// ==================

function displayScore() {
  fill(255); // White text
  noStroke();
  textSize(24);
  textAlign(LEFT, TOP);
  text("Score: " + score, 20, 20);
}

function displayGameOver() {
    background(0); // Black screen
    fill(255, 0, 0); // Red text
    textSize(50);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2 - 40);
    fill(255); // White text
    textSize(25);
    text("Final Score: " + score, width / 2, height / 2 + 20);
    textSize(20);
    text("Click to Restart", width / 2, height / 2 + 60);
    cursor(ARROW); // Show cursor again
}

function resetGame() {
    ship = new Ship();
    bullets = [];
    asteroids = [];
    score = 0;
    isGameOver = false;
    // Spawn initial asteroids
    for (let i = 0; i < 5; i++) {
        asteroids.push(new Asteroid());
    }
    noCursor(); // Hide cursor again
    // loop(); // Restart the draw loop if it was stopped (usually not needed if using isGameOver flag)
}


// ==================
// Input Handling
// ==================

function mousePressed() {
  // If the game is over, clicking restarts it
  if (isGameOver) {
     resetGame();
  } else {
    // Otherwise, clicking fires a bullet from the ship's nose
    let bullet = new Bullet(ship.x, ship.y - ship.size / 2);
    bullets.push(bullet);
    // Optional: Play shooting sound here
  }
}

// Adjust canvas size and ship position when window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Keep ship at the bottom after resize
  if (ship) { // Check if ship exists (might not during initial setup)
      ship.y = height - 40;
  }
}


// ==================
// Ship Class
// ==================
class Ship {
  constructor() {
    this.x = width / 2;
    this.y = height - 40; // Position near bottom
    this.size = 25;       // Ship size (approximate radius for collision)
    this.color = color(220, 220, 255); // Light blue/white ship
  }

  update() {
    // Ship follows the mouse horizontally
    this.x = mouseX;
    // Constrain ship to stay within screen bounds
    this.x = constrain(this.x, this.size / 2, width - this.size / 2);
    // Keep fixed y position (could be changed for vertical movement)
    this.y = height - 40;
  }

  draw() {
    fill(this.color);
    noStroke();
    // Draw a simple triangle ship
    beginShape();
    vertex(this.x, this.y - this.size / 2); // Top point
    vertex(this.x - this.size / 2, this.y + this.size / 2); // Bottom left
    vertex(this.x + this.size / 2, this.y + this.size / 2); // Bottom right
    endShape(CLOSE);

    // Optional: Draw a small flame when mouse is pressed (visual feedback for shooting)
    // Make sure it only shows when the game is active
    if (mouseIsPressed && !isGameOver) {
       fill(255, 150, 0); // Orange flame color
       triangle(
         this.x - this.size * 0.3, this.y + this.size / 2, // Left base of flame
         this.x + this.size * 0.3, this.y + this.size / 2, // Right base of flame
         this.x, this.y + this.size * 0.8 + random(5) // Flickering tip of flame
       );
    }
  }
}

// ==================
// Bullet Class
// ==================
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 12;   // How fast the bullet travels
    this.size = 6;    // Bullet size (diameter)
    this.color = color(100, 255, 100); // Bright Green
  }

  update() {
    this.y -= this.speed; // Move upwards
  }

  draw() {
    fill(this.color);
    noStroke();
    // Draw bullet as a slightly elongated ellipse
    ellipse(this.x, this.y, this.size, this.size * 1.5);
  }

  // Check if bullet is off the top of the screen
  isOffscreen() {
    return this.y < -this.size; // Check if fully off screen
  }
}

// ==================
// Asteroid Class
// ==================
class Asteroid {
  constructor(x, y, size) {
    // Determine spawn position and angle based on edges
    this.size = size || random(25, 70); // Use provided size or random
    this.pos = createVector();
    let angle;

    let edge = floor(random(4)); // Choose a random edge (0: Top, 1: Right, 2: Bottom (unused), 3: Left)

    if (edge === 0) { // Top Edge
       this.pos.x = random(width);
       this.pos.y = -this.size / 2; // Start just off-screen
       angle = random(PI * 0.1, PI * 0.9); // Angle towards bottom half
    } else if (edge === 1) { // Right Edge
       this.pos.x = width + this.size / 2;
       this.pos.y = random(height);
       angle = random(PI * 0.6, PI * 1.4); // Angle towards left half
    } else if (edge === 2) { // Bottom Edge (Currently forcing to Top)
       // For simplicity, let's stick to top/left/right spawns for now
       // You could enable bottom spawns here if desired
       this.pos.x = random(width);
       this.pos.y = -this.size / 2; // Force top entry
       angle = random(PI * 0.1, PI * 0.9);
    } else { // Left Edge
       this.pos.x = -this.size / 2;
       this.pos.y = random(height);
       angle = random(-PI * 0.4, PI * 0.4); // Angle towards right half (adjust range if needed)
    }

    // Allow overriding spawn position if x, y are provided (useful for splitting)
    if (x !== undefined && y !== undefined) {
        this.pos.x = x;
        this.pos.y = y;
        // If spawned from splitting, give it a random direction
        angle = random(TWO_PI);
    }


    this.speed = random(1, 3.5); // Random speed
    this.vel = p5.Vector.fromAngle(angle); // Create velocity vector from angle
    this.vel.mult(this.speed);            // Set magnitude of velocity

    // Aesthetic properties
    this.color = color(random(150, 200), random(100, 150), random(80, 120)); // Grey/brown tones
    this.rotation = random(TWO_PI);         // Initial random rotation
    this.rotationSpeed = random(-0.02, 0.02); // Slow random rotation speed

    // Create a jagged polygonal shape for the asteroid
    this.vertices = [];
    let numVertices = floor(random(8, 16)); // Number of points in the polygon
    for (let i = 0; i < numVertices; i++) {
      let angleOffset = map(i, 0, numVertices, 0, TWO_PI);
      // Vary the radius for each vertex to create jaggedness
      let r = this.size / 2 + random(-this.size * 0.25, this.size * 0.15);
      // Create a vector for the vertex based on angle and radius
      let v = p5.Vector.fromAngle(angleOffset + this.rotation); // Apply initial rotation offset
      v.mult(r);
      this.vertices.push(v);
    }
  }

  update() {
    this.pos.add(this.vel);          // Update position based on velocity
    this.rotation += this.rotationSpeed; // Update rotation

    // Wrap asteroid around screen edges
    if (this.pos.x < -this.size / 2) this.pos.x = width + this.size / 2;
    if (this.pos.x > width + this.size / 2) this.pos.x = -this.size / 2;
    if (this.pos.y < -this.size / 2) this.pos.y = height + this.size / 2;
    if (this.pos.y > height + this.size / 2) this.pos.y = -this.size / 2;
  }

  draw() {
    push(); // Isolate transformations (translate, rotate) for this asteroid
    translate(this.pos.x, this.pos.y); // Move origin to asteroid's position
    rotate(this.rotation);             // Rotate the asteroid
    fill(this.color);
    stroke(230); // Light grey outline
    strokeWeight(1.5);
    beginShape();
    for (let v of this.vertices) { // Draw the asteroid shape using its vertices
      vertex(v.x, v.y);
    }
    endShape(CLOSE); // Close the polygon shape
    pop(); // Restore previous drawing state
  }

  // Collision detection with a bullet (approximated as circles)
  hits(bullet) {
    // Calculate distance between center of asteroid and bullet
    let d = dist(this.pos.x, this.pos.y, bullet.x, bullet.y);
    // Check if distance is less than sum of their approximate radii
    // Using asteroid size/2 and bullet size/2
    return d < this.size / 2 + bullet.size / 2;
  }

  // Collision detection with the ship (approximated as circles)
  hitsShip(ship) {
    // Calculate distance between center of asteroid and ship
    let d = dist(this.pos.x, this.pos.y, ship.x, ship.y);
    // Check if distance is less than sum of their approximate radii
    // Using asteroid size/2 and ship size/2
    return d < this.size / 2 + ship.size / 2;
  }
}