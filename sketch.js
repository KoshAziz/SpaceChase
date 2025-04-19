// --- New Features Added ---
// - Rainbow Bullets (Hue Cycling)
// - Ship Upgrade System (Fire Rate, Spread Shot) via Keyboard ('1', '2')
// --- Previous Additions Kept ---
// - Redesigned Spaceship Look
// - Dynamic Parallax Star Background
// - Enhanced Engine Thrust Effect
// - Asteroid Splitting
// - Player Lives
// - Simple Explosion Particles
// - Score-based Difficulty Increase
// --------------------------

let ship;
let bullets = [];
let asteroids = [];
let particles = [];
let stars = [];
let score = 0;
let baseAsteroidSpawnRate = 0.01;
let currentAsteroidSpawnRate = baseAsteroidSpawnRate;
let isGameOver = false;
let lives = 3;
let initialAsteroids = 5;
let minAsteroidSize = 15;

// --- NEW: Upgrade System Variables ---
let upgradeMessage = ""; // To display feedback
let upgradeMessageTimeout = 0; // How long message shows

// ==================
// p5.js Setup Function
// ==================
function setup() {
  createCanvas(windowWidth, windowHeight);
  ship = new Ship(); // Ship now initializes its own upgrades
  spawnInitialAsteroids();
  createStarfield(200);
  textAlign(CENTER, CENTER);
  textSize(20);
  noCursor();
  colorMode(HSB, 360, 100, 100, 100);
}

// ==================
// Helper Functions
// ==================

function spawnInitialAsteroids() {
    asteroids = [];
    for (let i = 0; i < initialAsteroids; i++) {
        let startPos;
        do {
            // Use default values if ship isn't created yet during initial setup
            let shipX = ship ? ship.x : width / 2;
            let shipY = ship ? ship.y : height - 50;
            startPos = createVector(random(width), random(height * 0.6));
        } while (dist(startPos.x, startPos.y, ship.x, ship.y) < 150);
        asteroids.push(new Asteroid(startPos.x, startPos.y));
    }
}

function createParticles(x, y, count, particleColor) {
    let baseHue = hue(particleColor);
    for (let i = 0; i < count; i++) {
        let pColor = color(
            baseHue + random(-15, 15),
            random(60, 100),
            random(90, 100),
            100
        );
        particles.push(new Particle(x, y, pColor));
    }
}

function createStarfield(numStars) {
    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }
}

// ==================
// p5.js Draw Loop
// ==================
function draw() {
  drawBackgroundAndStars();

  if (isGameOver) {
    displayGameOver();
    return;
  }

  // --- Update & Draw Ship, Bullets, Particles, Asteroids ---
  ship.update();
  ship.draw();

  // Bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].draw();
    if (bullets[i].isOffscreen()) {
      bullets.splice(i, 1);
    }
  }

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }

  // Asteroids & Collisions
  handleAsteroidsAndCollisions();

  // --- Spawn New Asteroids ---
  currentAsteroidSpawnRate = baseAsteroidSpawnRate + (score * 0.0001);
  if (random(1) < currentAsteroidSpawnRate && asteroids.length < 25) {
    asteroids.push(new Asteroid());
  }

  // --- Display HUD ---
  displayHUD(); // <-- NEW: Combined display function

  // --- Display Upgrade Message --- // <-- NEW -->
  if (upgradeMessageTimeout > 0) {
      displayUpgradeMessage();
      upgradeMessageTimeout--;
  }
}

// ==================
// Collision Handling (Moved to separate function for clarity)
// ==================
function handleAsteroidsAndCollisions() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        if (!asteroids[i]) continue;
        asteroids[i].update();
        asteroids[i].draw();

        // Bullet vs Asteroid
        let asteroidHit = false;
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (asteroids[i] && bullets[j] && asteroids[i].hits(bullets[j])) {
                score++; // Score only for hitting asteroids
                let currentAsteroid = asteroids[i];
                let asteroidPos = currentAsteroid.pos.copy();
                let asteroidSize = currentAsteroid.size;
                let asteroidColor = currentAsteroid.color;

                asteroids.splice(i, 1);
                bullets.splice(j, 1);
                asteroidHit = true;

                createParticles(asteroidPos.x, asteroidPos.y, floor(asteroidSize / 3), asteroidColor);

                if (asteroidSize > minAsteroidSize * 2) {
                   let newSize = asteroidSize * 0.6;
                   let vel1 = p5.Vector.random2D().mult(random(1, 3));
                   let vel2 = p5.Vector.random2D().mult(random(1, 3));
                   asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel1));
                   asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel2));
                } else {
                    // Optional: Small chance to drop a 'score bonus' particle? Future idea.
                }
                break;
            }
        }

        if (asteroidHit) continue;

        // Ship vs Asteroid
        if (asteroids[i] && asteroids[i].hitsShip(ship)) {
            lives--;
            createParticles(ship.x, ship.y, 30, color(0, 80, 100)); // Red/Orange ship explosion
            // --- NEW: Reset upgrades on death? Or keep them? Let's keep them for now. ---
            // ship.resetUpgrades(); // Optional call here if needed

            if (lives <= 0) {
                isGameOver = true;
            } else {
                ship.resetPosition();
                createParticles(asteroids[i].pos.x, asteroids[i].pos.y, floor(asteroids[i].size / 3), asteroids[i].color);
                asteroids.splice(i, 1);
                // Brief invulnerability after respawn would be good here
            }
        }
    }
}


// ==================
// Background Function
// ==================
function drawBackgroundAndStars() {
    let topColor = color(260, 80, 10);
    let bottomColor = color(240, 70, 25);
    for(let y=0; y < height; y++){
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(topColor, bottomColor, inter);
        stroke(c);
        line(0, y, width, y);
    }
    noStroke();

    for (let star of stars) {
        star.update();
        star.draw();
    }
}


// ==================
// Display Functions
// ==================
// <-- NEW: Combined HUD function -->
function displayHUD() {
  fill(0, 0, 100, 80); // White text with some transparency
  noStroke();
  textSize(18); // Adjusted size
  textAlign(LEFT, TOP);
  text("Score: " + score, 15, 15);
  text("Lives: " + lives, 15, 40);

  // --- NEW: Display Upgrade Info ---
  textAlign(RIGHT, TOP);
  let fireRateCost = ship.getUpgradeCost('fireRate');
  let spreadShotCost = ship.getUpgradeCost('spreadShot');

  fill(ship.fireRateLevel < ship.maxLevel ? color(120, 70, 90) : color(0, 0, 50)); // Green if available, grey if maxed
  text(`[1] Rate (${ship.fireRateLevel}/${ship.maxLevel}): ${fireRateCost} pts`, width - 15, 15);

  fill(ship.spreadShotLevel < ship.maxLevel ? color(120, 70, 90) : color(0, 0, 50)); // Green if available, grey if maxed
  text(`[2] Spread (${ship.spreadShotLevel}/${ship.maxLevel}): ${spreadShotCost} pts`, width - 15, 40);

}

// <-- NEW: Function to show upgrade messages -->
function displayUpgradeMessage() {
    fill(0, 0, 100); // White
    textSize(16);
    textAlign(CENTER, BOTTOM);
    text(upgradeMessage, width / 2, height - 20); // Display at bottom center
}


function displayGameOver() {
    drawBackgroundAndStars();
    fill(0, 0, 0, 50);
    rect(0, 0, width, height);
    fill(0, 90, 100);
    textSize(60);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2 - 50);
    fill(0, 0, 100);
    textSize(30);
    text("Final Score: " + score, width / 2, height / 2 + 10);
    textSize(22);
    let pulse = map(sin(frameCount * 0.1), -1, 1, 60, 100);
    fill(0, 0, pulse);
    text("Click to Restart", width / 2, height / 2 + 60);
    cursor(ARROW);
}

function resetGame() {
    ship = new Ship(); // Creates a new ship with base upgrades
    bullets = [];
    particles = [];
    asteroids = []; // Clear asteroids before spawning new ones
    score = 0;
    lives = 3;
    currentAsteroidSpawnRate = baseAsteroidSpawnRate;
    isGameOver = false;
    spawnInitialAsteroids();
    createStarfield(200);
    noCursor();
}


// ==================
// Input Handling
// ==================
function mousePressed() {
  if (isGameOver) {
     resetGame();
  } else {
    ship.shoot();
  }
}

// --- NEW: Keyboard Input for Upgrades ---
function keyPressed() {
    if (isGameOver) return; // Don't allow upgrades when game over

    if (key === '1') {
        ship.attemptUpgrade('fireRate');
    } else if (key === '2') {
        ship.attemptUpgrade('spreadShot');
    }
    // Add more keys for other upgrades here (e.g., '3' for bullet speed)
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createStarfield(200);
  if (ship) {
      ship.baseY = height - 50; // Recalculate base Y on resize
      ship.resetPosition();
  }
}


// ==================
// Ship Class (UPGRADE LOGIC ADDED)
// ==================
class Ship {
  constructor() {
    this.baseY = height - 50;
    this.x = width / 2;
    this.y = this.baseY;
    this.size = 30;
    this.color = color(200, 80, 95);
    this.cockpitColor = color(180, 100, 100);
    this.engineColor1 = color(30, 100, 100);
    this.engineColor2 = color(0, 100, 100);
    this.hoverOffset = 0;
    this.shootCooldown = 0;

    // --- NEW: Upgrade Properties ---
    this.maxLevel = 5; // Max level for upgrades
    this.fireRateLevel = 0; // Starts at level 0
    this.spreadShotLevel = 0; // Starts at level 0

    this.baseShootDelay = 15; // Initial delay (higher is slower)
    this.shootDelayPerLevel = 2; // How much delay decreases per level

    // Costs scale up
    this.baseUpgradeCost = 50;
    this.costMultiplier = 2.5;
  }

  // --- NEW: Calculate current shoot delay ---
  get currentShootDelay() {
      return max(3, this.baseShootDelay - (this.fireRateLevel * this.shootDelayPerLevel)); // Ensure minimum delay
  }

  // --- NEW: Calculate upgrade cost ---
  getUpgradeCost(upgradeType) {
      let level;
      if (upgradeType === 'fireRate') {
          level = this.fireRateLevel;
      } else if (upgradeType === 'spreadShot') {
          level = this.spreadShotLevel;
      } else {
          return Infinity; // Unknown type
      }
      if (level >= this.maxLevel) return "MAX";
      // Cost = base * multiplier ^ level
      return floor(this.baseUpgradeCost * pow(this.costMultiplier, level));
  }

  // --- NEW: Attempt to buy an upgrade ---
  attemptUpgrade(upgradeType) {
      let cost = this.getUpgradeCost(upgradeType);
      let currentLevel;
      let canUpgrade = false;

      if (upgradeType === 'fireRate') currentLevel = this.fireRateLevel;
      else if (upgradeType === 'spreadShot') currentLevel = this.spreadShotLevel;
      else return; // Exit if unknown type

      if (currentLevel < this.maxLevel && score >= cost) {
          score -= cost; // Deduct score
          if (upgradeType === 'fireRate') this.fireRateLevel++;
          else if (upgradeType === 'spreadShot') this.spreadShotLevel++;
          upgradeMessage = `${upgradeType.replace(/([A-Z])/g, ' $1').toUpperCase()} UPGRADED!`; // Format name
          canUpgrade = true;
      } else if (currentLevel >= this.maxLevel) {
          upgradeMessage = `${upgradeType.replace(/([A-Z])/g, ' $1').toUpperCase()} MAX LEVEL!`;
      } else {
          upgradeMessage = `NEED ${cost} PTS FOR ${upgradeType.replace(/([A-Z])/g, ' $1').toUpperCase()}!`;
      }
      upgradeMessageTimeout = 120; // Show message for 2 seconds
  }

  // --- NEW: Reset Upgrades (Optional - call if needed e.g. on game over) ---
  resetUpgrades() {
      this.fireRateLevel = 0;
      this.spreadShotLevel = 0;
  }


  resetPosition() {
      this.x = width / 2;
      this.y = this.baseY;
  }

  update() {
    this.x = mouseX;
    this.x = constrain(this.x, this.size * 0.7, width - this.size * 0.7);
    this.hoverOffset = sin(frameCount * 0.08) * 3;
    this.y = this.baseY + this.hoverOffset;
    if (this.shootCooldown > 0) {
        this.shootCooldown--;
    }
  }

  shoot() {
      if (this.shootCooldown <= 0) {
          let bulletX = this.x;
          let bulletY = this.y - this.size * 0.6;

          // --- Apply Spread Shot ---
          let numShots = this.spreadShotLevel > 0 ? 3 : 1; // 1 or 3 shots
          let spreadAngle = PI / 18; // Angle between spread shots (adjust as needed)

          for (let i = 0; i < numShots; i++) {
              let angle = 0;
              if (numShots > 1) {
                  // Calculate angle for shots: middle, left, right
                  angle = map(i, 0, numShots - 1, -spreadAngle, spreadAngle);
              }
              bullets.push(new Bullet(bulletX, bulletY, angle)); // Pass angle to bullet
          }

          this.shootCooldown = this.currentShootDelay; // Use calculated delay
      }
  }


  draw() {
    push();
    translate(this.x, this.y);

    // Engine Glow
    let enginePulse = map(sin(frameCount * 0.2 + this.hoverOffset * 0.5), -1, 1, 0.8, 1.2);
    let engineSize = this.size * 0.5 * enginePulse;
    let engineBrightness = map(sin(frameCount * 0.3), -1, 1, 80, 100);
    noStroke();
    for (let i = engineSize * 1.5; i > 0; i -= 3) {
        let alpha = map(i, 0, engineSize * 1.5, 0, 30);
        fill(hue(this.engineColor2), 100, engineBrightness, alpha);
        ellipse(0, this.size * 0.5, i, i* 1.5);
    }
     fill(hue(this.engineColor1), 100, 100);
     ellipse(0, this.size * 0.5, engineSize * 0.6, engineSize * 1.2);

    // Ship Body
    stroke(0, 0, 80);
    strokeWeight(1.5);
    fill(this.color);
    beginShape();
    vertex(0, -this.size * 0.7);
    bezierVertex(this.size * 0.5, -this.size * 0.4, this.size * 0.6, this.size * 0.1, this.size * 0.7, this.size * 0.4);
    bezierVertex(this.size * 0.4, this.size * 0.5, -this.size * 0.4, this.size * 0.5, -this.size * 0.7, this.size * 0.4);
    bezierVertex(-this.size * 0.6, this.size * 0.1, -this.size * 0.5, -this.size * 0.4, 0, -this.size * 0.7);
    endShape(CLOSE);

    // Cockpit
    fill(this.cockpitColor);
    noStroke();
    ellipse(0, -this.size * 0.15, this.size * 0.4, this.size * 0.5);
    fill(0, 0, 100, 50);
    ellipse(0, -this.size * 0.2, this.size * 0.2, this.size * 0.25);

    pop();
  }
}

// ==================
// Bullet Class (COLOR CYCLE & ANGLE ADDED)
// ==================
class Bullet {
  constructor(x, y, angle = 0) { // <-- Added angle parameter (defaults to 0)
    this.pos = createVector(x, y); // Use vectors for easier angle math
    this.speed = 16; // Even faster bullets
    this.size = 5;
    this.startHue = frameCount % 360; // Start hue based on when it was fired
    this.hue = this.startHue;

    // Calculate initial velocity based on angle (up is -PI/2)
    let baseAngle = -PI / 2; // Straight up
    this.vel = p5.Vector.fromAngle(baseAngle + angle); // Apply spread angle
    this.vel.mult(this.speed);
  }

  update() {
    this.pos.add(this.vel); // Move based on velocity vector
    this.hue = (this.hue + 4) % 360; // Cycle hue fairly quickly
  }

  draw() {
    fill(this.hue, 90, 100); // Use cycling hue, bright saturation/brightness
    stroke(0, 0, 100); // White outline
    strokeWeight(1);
    // Draw elongated shape aligned with velocity (optional complexity)
    // For simplicity, keep drawing vertical ellipse for now
    ellipse(this.pos.x, this.pos.y, this.size, this.size * 2.5); // Even more elongated
  }

  isOffscreen() {
    // Check bounds based on position vector
    return (this.pos.y < -this.size * 2 ||
            this.pos.y > height + this.size * 2 ||
            this.pos.x < -this.size * 2 ||
            this.pos.x > width + this.size * 2);
  }
}

// ==================
// Asteroid Class (No major changes)
// ==================
class Asteroid {
  constructor(x, y, size, vel) {
    this.size = size || random(30, 80);
    this.pos = createVector();

    if (x !== undefined && y !== undefined) {
        this.pos.x = x; this.pos.y = y;
    } else {
        let edge = floor(random(4));
        if (edge === 0) { this.pos.x = random(width); this.pos.y = -this.size / 2; }
        else if (edge === 1) { this.pos.x = width + this.size / 2; this.pos.y = random(height); }
        else if (edge === 2) { this.pos.x = random(width); this.pos.y = -this.size / 2; }
        else { this.pos.x = -this.size / 2; this.pos.y = random(height); }
    }

    if (vel) {
        this.vel = vel;
    } else {
        let angle;
        if (this.pos.y < 0) angle = random(PI * 0.2, PI * 0.8);
        else if (this.pos.x > width) angle = random(PI * 0.7, PI * 1.3);
        else if (this.pos.x < 0) angle = random(-PI * 0.3, PI * 0.3);
        else angle = random(TWO_PI);
        if (x !== undefined && y !== undefined) angle = random(TWO_PI);
        this.speed = random(1, 3) * (this.size > 50 ? 1 : 1.3);
        this.vel = p5.Vector.fromAngle(angle);
        this.vel.mult(this.speed);
    }

    this.color = color(random(20, 50), random(30, 70), random(30, 60));
    this.rotation = random(TWO_PI);
    this.rotationSpeed = random(-0.025, 0.025);

    this.vertices = [];
    let numVertices = floor(random(7, 15));
    for (let i = 0; i < numVertices; i++) {
      let angleOffset = map(i, 0, numVertices, 0, TWO_PI);
      let r = this.size / 2 + random(-this.size * 0.3, this.size * 0.2);
      let v = p5.Vector.fromAngle(angleOffset + this.rotation); v.mult(r);
      this.vertices.push(v);
    }
  }
  update() {
    this.pos.add(this.vel); this.rotation += this.rotationSpeed;
    let buffer = this.size / 2;
    if (this.pos.x < -buffer) this.pos.x = width + buffer;
    if (this.pos.x > width + buffer) this.pos.x = -buffer;
    if (this.pos.y < -buffer) this.pos.y = height + buffer;
    if (this.pos.y > height + buffer) this.pos.y = -buffer;
  }
  draw() {
    push(); translate(this.pos.x, this.pos.y); rotate(this.rotation);
    fill(this.color);
    stroke(hue(this.color), saturation(this.color)*0.5, brightness(this.color) * 1.5);
    strokeWeight(2); beginShape();
    for (let v of this.vertices) { vertex(v.x, v.y); }
    endShape(CLOSE); pop();
  }
  hits(bullet) {
    let d = dist(this.pos.x, this.pos.y, bullet.pos.x, bullet.pos.y); // Use bullet.pos
    return d < this.size / 2 + bullet.size;
  }
  hitsShip(ship) {
    let d = dist(this.pos.x, this.pos.y, ship.x, ship.y);
    return d < this.size / 2 + ship.size * 0.5;
  }
}

// ==================
// Particle Class (No changes)
// ==================
class Particle {
  constructor(x, y, particleColor) {
    this.pos = createVector(x, y); this.vel = p5.Vector.random2D();
    this.vel.mult(random(1.5, 5)); this.lifespan = 100;
    this.baseHue = hue(particleColor); this.baseSat = saturation(particleColor);
    this.baseBri = brightness(particleColor); this.size = random(2, 6);
  }
  update() {
    this.pos.add(this.vel); this.lifespan -= 3; this.vel.mult(0.97);
  }
  draw() {
    noStroke(); fill(this.baseHue, this.baseSat, this.baseBri, this.lifespan);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
  isDead() { return this.lifespan <= 0; }
}

// ==================
// Star Class (No changes)
// ==================
class Star {
    constructor() {
        this.x = random(width); this.y = random(height);
        this.layer = floor(random(3)); this.size = map(this.layer, 0, 2, 0.5, 2.5);
        this.speed = map(this.layer, 0, 2, 0.1, 0.5); this.brightness = random(60, 100);
    }
    update() {
        this.y += this.speed;
        if (this.y > height + this.size) { this.y = -this.size; this.x = random(width); }
    }
    draw() {
        fill(0, 0, this.brightness); noStroke(); ellipse(this.x, this.y, this.size);
    }
}
