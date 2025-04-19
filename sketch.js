// --- New Features Added ---
// - Asteroid Splitting
// - Player Lives
// - Simple Explosion Particles
// - Score-based Difficulty Increase
// --------------------------

let ship;
let bullets = [];
let asteroids = [];
let particles = []; // <-- NEW: Array for explosion particles
let score = 0;
let baseAsteroidSpawnRate = 0.01; // Start slightly lower
let currentAsteroidSpawnRate = baseAsteroidSpawnRate; // Will increase with score
let isGameOver = false;
let lives = 3; // <-- NEW: Player lives
let initialAsteroids = 5;
let minAsteroidSize = 15; // Minimum size before an asteroid is just destroyed


// ==================
// p5.js Setup Function
// ==================
function setup() {
  createCanvas(windowWidth, windowHeight);
  ship = new Ship();
  spawnInitialAsteroids();
  textAlign(CENTER, CENTER);
  textSize(20);
  noCursor(); // Hide the default cursor
}

// ==================
// Helper Functions
// ==================

// <-- NEW: Function to spawn initial asteroids -->
function spawnInitialAsteroids() {
    asteroids = []; // Clear existing asteroids first
    for (let i = 0; i < initialAsteroids; i++) {
        // Ensure initial asteroids don't spawn right on top of the ship
        let startPos;
        do {
            startPos = createVector(random(width), random(height * 0.6)); // Spawn away from bottom
        } while (dist(startPos.x, startPos.y, ship.x, ship.y) < 150); // Min distance from ship start
        asteroids.push(new Asteroid(startPos.x, startPos.y));
    }
}

// <-- NEW: Function to create explosion particles -->
function createParticles(x, y, count, particleColor) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, particleColor));
    }
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
  ship.draw(); // Draw ship first

  // --- Update and Draw Bullets ---
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].draw();
    if (bullets[i].isOffscreen()) {
      bullets.splice(i, 1); // Remove bullet if it goes off-screen
    }
  }

  // --- Update and Draw Particles --- // <-- NEW Section -->
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }


  // --- Spawn New Asteroids ---
  // Increase spawn rate slightly based on score
  currentAsteroidSpawnRate = baseAsteroidSpawnRate + (score * 0.0001);
  if (random(1) < currentAsteroidSpawnRate && asteroids.length < 20) { // Limit max asteroids
    asteroids.push(new Asteroid());
  }

  // --- Update and Draw Asteroids / Check Collisions ---
  for (let i = asteroids.length - 1; i >= 0; i--) {
    // Ensure asteroid exists (might be removed mid-loop by splitting)
    if (!asteroids[i]) continue;

    asteroids[i].update();
    asteroids[i].draw();

    // Check collision: Bullet vs Asteroid
    let asteroidHit = false;
    for (let j = bullets.length - 1; j >= 0; j--) {
      // Check asteroid and bullet still exist and collision happens
      if (asteroids[i] && bullets[j] && asteroids[i].hits(bullets[j])) {
        score++;

        // --- Asteroid Splitting Logic --- // <-- NEW Section -->
        let currentAsteroid = asteroids[i]; // Reference before splicing
        let asteroidPos = currentAsteroid.pos.copy();
        let asteroidSize = currentAsteroid.size;
        let asteroidColor = currentAsteroid.color; // Get color for particles

        // Remove original asteroid and bullet
        asteroids.splice(i, 1);
        bullets.splice(j, 1);
        asteroidHit = true; // Mark asteroid as hit for this frame

        createParticles(asteroidPos.x, asteroidPos.y, floor(asteroidSize / 4), asteroidColor); // <-- Create particles

        // If asteroid is large enough, split it
        if (asteroidSize > minAsteroidSize * 2) { // Only split if it results in reasonably sized pieces
           let newSize = asteroidSize * 0.6; // Make new ones smaller
           asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize));
           asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize));
        }
        // --- End Splitting Logic ---

        break; // Exit inner loop (bullet loop) as this bullet hit something
      }
    }

    // If asteroid destroyed by bullet, skip ship collision check for this asteroid
    if (asteroidHit) continue;

    // Check collision: Ship vs Asteroid (only if asteroid exists and wasn't just hit)
    if (asteroids[i] && asteroids[i].hitsShip(ship)) {
        // --- Lives Logic --- // <-- NEW Section -->
        lives--; // Decrement lives
        createParticles(ship.x, ship.y, 20, ship.color); // Ship explosion particles

        if (lives <= 0) {
            isGameOver = true; // Set game over flag only if out of lives
        } else {
            // Reset ship position (optional: add brief invulnerability later)
            ship.x = width/2;
            // Remove the asteroid that hit the ship
            createParticles(asteroids[i].pos.x, asteroids[i].pos.y, floor(asteroids[i].size / 4), asteroids[i].color);
            asteroids.splice(i, 1);
        }
        // --- End Lives Logic ---
    }
  }

  // --- Display Score and Lives ---
  displayScoreAndLives(); // <-- MODIFIED: Now shows lives too
}

// ==================
// Display Functions (Modified)
// ==================

// <-- MODIFIED: Function name and content -->
function displayScoreAndLives() {
  fill(255); // White text
  noStroke();
  textSize(24);
  textAlign(LEFT, TOP);
  text("Score: " + score, 20, 20);
  text("Lives: " + lives, 20, 50); // <-- NEW: Display lives
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
    particles = []; // Clear particles
    score = 0;
    lives = 3; // Reset lives
    currentAsteroidSpawnRate = baseAsteroidSpawnRate; // Reset spawn rate
    isGameOver = false;
    spawnInitialAsteroids(); // Respawn asteroids
    noCursor(); // Hide cursor again
}


// ==================
// Input Handling (No changes needed here)
// ==================

function mousePressed() {
  // If the game is over, clicking restarts it
  if (isGameOver) {
     resetGame();
  } else {
    // Otherwise, clicking fires a bullet from the ship's nose
    let bullet = new Bullet(ship.x, ship.y - ship.size / 2);
    bullets.push(bullet);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (ship) {
      ship.y = height - 40;
  }
}


// ==================
// Ship Class (No changes needed here)
// ==================
class Ship {
  constructor() {
    this.x = width / 2;
    this.y = height - 40;
    this.size = 25;
    this.color = color(220, 220, 255);
  }

  update() {
    this.x = mouseX;
    this.x = constrain(this.x, this.size / 2, width - this.size / 2);
    this.y = height - 40;
  }

  draw() {
    fill(this.color);
    noStroke();
    beginShape();
    vertex(this.x, this.y - this.size / 2);
    vertex(this.x - this.size / 2, this.y + this.size / 2);
    vertex(this.x + this.size / 2, this.y + this.size / 2);
    endShape(CLOSE);

    if (mouseIsPressed && !isGameOver) {
       fill(255, 150, 0);
       triangle(
         this.x - this.size * 0.3, this.y + this.size / 2,
         this.x + this.size * 0.3, this.y + this.size / 2,
         this.x, this.y + this.size * 0.8 + random(5)
       );
    }
  }
}

// ==================
// Bullet Class (No changes needed here)
// ==================
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 12;
    this.size = 6;
    this.color = color(100, 255, 100);
  }

  update() {
    this.y -= this.speed;
  }

  draw() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size * 1.5);
  }

  isOffscreen() {
    return this.y < -this.size;
  }
}

// ==================
// Asteroid Class (Minor change in constructor for splitting)
// ==================
class Asteroid {
  // Added explicit velocity parameter for splitting control
  constructor(x, y, size, vel) {
    this.size = size || random(25, 70);
    this.pos = createVector();

    // If position is given, use it (for splitting or specific spawns)
    if (x !== undefined && y !== undefined) {
        this.pos.x = x;
        this.pos.y = y;
    } else { // Otherwise, spawn from an edge
        let edge = floor(random(4));
        if (edge === 0) { // Top
            this.pos.x = random(width);
            this.pos.y = -this.size / 2;
        } else if (edge === 1) { // Right
            this.pos.x = width + this.size / 2;
            this.pos.y = random(height);
        } else if (edge === 2) { // Bottom (Force Top for now)
            this.pos.x = random(width);
            this.pos.y = -this.size / 2;
        } else { // Left
            this.pos.x = -this.size / 2;
            this.pos.y = random(height);
        }
    }

    // Use provided velocity if available (for splitting), otherwise calculate new
    if (vel) {
        this.vel = vel;
    } else {
        let angle;
        // Calculate angle based on roughly where it spawned, aiming towards center
        if (this.pos.y < 0) angle = random(PI * 0.1, PI * 0.9); // From Top
        else if (this.pos.x > width) angle = random(PI * 0.6, PI * 1.4); // From Right
        else if (this.pos.x < 0) angle = random(-PI * 0.4, PI * 0.4); // From Left
        else angle = random(TWO_PI); // Default if somehow spawned mid-screen

        // If position was provided (e.g. split), give random angle
         if (x !== undefined && y !== undefined) {
            angle = random(TWO_PI);
         }

        this.speed = random(1, 3.5) * (this.size > 40 ? 1 : 1.5); // Smaller asteroids move slightly faster
        this.vel = p5.Vector.fromAngle(angle);
        this.vel.mult(this.speed);
    }


    this.color = color(random(150, 200), random(100, 150), random(80, 120));
    this.rotation = random(TWO_PI);
    this.rotationSpeed = random(-0.02, 0.02);

    this.vertices = [];
    let numVertices = floor(random(8, 16));
    for (let i = 0; i < numVertices; i++) {
      let angleOffset = map(i, 0, numVertices, 0, TWO_PI);
      let r = this.size / 2 + random(-this.size * 0.25, this.size * 0.15);
      let v = p5.Vector.fromAngle(angleOffset + this.rotation);
      v.mult(r);
      this.vertices.push(v);
    }
  }

  update() {
    this.pos.add(this.vel);
    this.rotation += this.rotationSpeed;

    if (this.pos.x < -this.size) this.pos.x = width + this.size;
    if (this.pos.x > width + this.size) this.pos.x = -this.size;
    if (this.pos.y < -this.size) this.pos.y = height + this.size;
    if (this.pos.y > height + this.size) this.pos.y = -this.size;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    fill(this.color);
    stroke(230);
    strokeWeight(1.5);
    beginShape();
    for (let v of this.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
    pop();
  }

  hits(bullet) {
    let d = dist(this.pos.x, this.pos.y, bullet.x, bullet.y);
    return d < this.size / 2 + bullet.size / 2;
  }

  hitsShip(ship) {
    let d = dist(this.pos.x, this.pos.y, ship.x, ship.y);
    return d < this.size / 2 + ship.size / 2; // Simplified ship collision radius
  }
}

// ==================
// Particle Class (NEW CLASS)
// ==================
class Particle {
  constructor(x, y, particleColor) {
    this.pos = createVector(x, y);
    // Give particle a random velocity direction and magnitude
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(1, 4)); // Random speed
    this.lifespan = 60; // How many frames the particle lasts (1 second at 60fps)
    this.color = particleColor || color(255, 255, 100); // Use asteroid color or default yellow
    this.size = random(2, 5);
  }

  update() {
    this.pos.add(this.vel);
    this.lifespan -= 2; // Decrease lifespan faster
    this.vel.mult(0.98); // Slow down particle slightly
  }

  draw() {
    noStroke();
    // Fade out particle as it ages
    fill(red(this.color), green(this.color), blue(this.color), this.lifespan * 4); // Adjust alpha based on lifespan
    ellipse(this.pos.x, this.pos.y, this.size);
  }

  // Check if particle has faded out
  isDead() {
    return this.lifespan <= 0;
  }
}
