// --- New Features Added ---
// - Keyboard Controls (Arrow Keys for Movement, Spacebar for Shooting)
// - Evolving Ship Appearance based on Total Upgrade Level
// --- Previous Additions Kept ---
// - Rainbow Bullets (Hue Cycling)
// - Ship Upgrade System (Fire Rate, Spread Shot) via Keyboard ('1', '2')
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

let upgradeMessage = "";
let upgradeMessageTimeout = 0;

// --- NEW: Keyboard state tracking ---
let moveSpeed = 7; // How fast the ship moves with keys

// ==================
// p5.js Setup Function
// ==================
function setup() {
  createCanvas(windowWidth, windowHeight);
  ship = new Ship();
  spawnInitialAsteroids();
  createStarfield(200);
  textAlign(CENTER, CENTER);
  textSize(20);
  noCursor(); // Keep cursor hidden initially
  colorMode(HSB, 360, 100, 100, 100);
}

// ==================
// Helper Functions (Mostly unchanged)
// ==================
function spawnInitialAsteroids() { /* ... same as before ... */ }
function createParticles(x, y, count, particleColor) { /* ... same as before ... */ }
function createStarfield(numStars) { /* ... same as before ... */ }

// ==================
// p5.js Draw Loop
// ==================
function draw() {
  drawBackgroundAndStars();

  if (isGameOver) {
    displayGameOver();
    // Show cursor again on game over screen, regardless of input method
    cursor(ARROW);
    return;
  } else {
      noCursor(); // Keep cursor hidden during gameplay
  }

  // --- Handle Keyboard Input for Movement --- // <-- NEW -->
  handleKeyboardMovement();

  // --- Update & Draw Everything Else ---
  ship.update(); // Mouse movement is now handled inside update
  ship.draw();
  for (let i = bullets.length - 1; i >= 0; i--) { /* ... bullet logic ... */ }
  for (let i = particles.length - 1; i >= 0; i--) { /* ... particle logic ... */ }
  handleAsteroidsAndCollisions(); // Includes asteroid update/draw

  // --- Spawn New Asteroids ---
  currentAsteroidSpawnRate = baseAsteroidSpawnRate + (score * 0.0001);
  if (random(1) < currentAsteroidSpawnRate && asteroids.length < 25) { /* ... spawn logic ... */ }

  // --- Display HUD & Messages ---
  displayHUD();
  if (upgradeMessageTimeout > 0) { /* ... upgrade message logic ... */ }
}

// ==================
// Keyboard Movement Handling (NEW FUNCTION)
// ==================
function handleKeyboardMovement() {
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // Left Arrow or 'A'
        ship.move(-moveSpeed);
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // Right Arrow or 'D'
        ship.move(moveSpeed);
    }
    // Note: We are NOT handling Up/Down movement currently
    // if (keyIsDown(UP_ARROW) || keyIsDown(87)) { // Up Arrow or 'W' }
    // if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { // Down Arrow or 'S' }
}

// ==================
// Collision Handling (Unchanged)
// ==================
function handleAsteroidsAndCollisions() { /* ... same as before ... */ }

// ==================
// Background Function (Unchanged)
// ==================
function drawBackgroundAndStars() { /* ... same as before ... */ }

// ==================
// Display Functions (Minor tweak for clarity)
// ==================
function displayHUD() {
  fill(0, 0, 100, 80); noStroke(); textSize(18); textAlign(LEFT, TOP);
  text("Score: " + score, 15, 15);
  text("Lives: " + lives, 15, 40);

  textAlign(RIGHT, TOP);
  let fireRateCost = ship.getUpgradeCost('fireRate');
  let spreadShotCost = ship.getUpgradeCost('spreadShot');

  fill(ship.fireRateLevel < ship.maxLevel ? color(120, 70, 90) : color(0, 0, 50));
  text(`[1] Rate (${ship.fireRateLevel}/${ship.maxLevel}): ${fireRateCost}`, width - 15, 15);

  fill(ship.spreadShotLevel < ship.maxLevel ? color(120, 70, 90) : color(0, 0, 50));
  text(`[2] Spread (${ship.spreadShotLevel}/${ship.maxLevel}): ${spreadShotCost}`, width - 15, 40);

  // Optional: Add hint for spacebar shooting
  textAlign(CENTER, TOP);
  fill(0,0,100, 50); // Faint white
  text("Arrows/AD=Move | Space=Shoot | 1,2=Upgrade", width/2, 10);

}
function displayUpgradeMessage() { /* ... same as before ... */ }
function displayGameOver() { /* ... same as before ... */ }

// ==================
// Reset Function (Unchanged)
// ==================
function resetGame() { /* ... same as before ... */ }

// ==================
// Input Handling (MODIFIED)
// ==================
function mousePressed() {
  if (isGameOver) {
     resetGame();
  } else {
    ship.shoot(); // Click still shoots
  }
}

function keyPressed() {
    if (isGameOver) return;

    if (keyCode === 32) { // Spacebar
        ship.shoot();
        return; // Prevent default browser spacebar action (scrolling)
    }

    if (key === '1') {
        ship.attemptUpgrade('fireRate');
    } else if (key === '2') {
        ship.attemptUpgrade('spreadShot');
    }
}

function windowResized() { /* ... same as before ... */ }

// ==================
// Ship Class (MODIFIED for Keyboard Movement & Evolving Look)
// ==================
class Ship {
  constructor() {
    // ... (initial properties mostly same as before) ...
    this.baseY = height - 50;
    this.x = width / 2;
    this.y = this.baseY;
    this.size = 30;
    this.baseColor = color(200, 80, 95); // Store base color
    this.cockpitColor = color(180, 100, 100);
    this.engineColor1 = color(30, 100, 100);
    this.engineColor2 = color(0, 100, 100);
    this.hoverOffset = 0;
    this.shootCooldown = 0;
    this.maxLevel = 5;
    this.fireRateLevel = 0;
    this.spreadShotLevel = 0;
    this.baseShootDelay = 15;
    this.shootDelayPerLevel = 2;
    this.baseUpgradeCost = 50;
    this.costMultiplier = 2.5;

    // --- NEW: Appearance Level ---
    this.appearanceLevel = 0; // Will be updated based on upgrades
  }

  get currentShootDelay() { /* ... same as before ... */ }
  getUpgradeCost(upgradeType) { /* ... same as before ... */ }

  // --- NEW: Update appearance level ---
  updateAppearanceLevel() {
      let totalLevel = this.fireRateLevel + this.spreadShotLevel;
      if (totalLevel <= 2) {
          this.appearanceLevel = 0;
      } else if (totalLevel <= 6) {
          this.appearanceLevel = 1;
      } else {
          this.appearanceLevel = 2;
      }
  }


  attemptUpgrade(upgradeType) {
      // ... (upgrade logic same as before) ...
      let cost = this.getUpgradeCost(upgradeType);
      let currentLevel;
      let canUpgrade = false;

      if (upgradeType === 'fireRate') currentLevel = this.fireRateLevel;
      else if (upgradeType === 'spreadShot') currentLevel = this.spreadShotLevel;
      else return;

      if (currentLevel < this.maxLevel && score >= cost) {
          score -= cost;
          if (upgradeType === 'fireRate') this.fireRateLevel++;
          else if (upgradeType === 'spreadShot') this.spreadShotLevel++;
          upgradeMessage = `${upgradeType.replace(/([A-Z])/g, ' $1').toUpperCase()} UPGRADED!`;
          canUpgrade = true;
          this.updateAppearanceLevel(); // <-- Update look after successful upgrade
      } else if (currentLevel >= this.maxLevel) {
          upgradeMessage = `${upgradeType.replace(/([A-Z])/g, ' $1').toUpperCase()} MAX LEVEL!`;
      } else {
          upgradeMessage = `NEED ${cost} PTS FOR ${upgradeType.replace(/([A-Z])/g, ' $1').toUpperCase()}!`;
      }
      upgradeMessageTimeout = 120;
  }

  resetUpgrades() { /* ... same as before ... */ }
  resetPosition() { /* ... same as before ... */ }

  // --- NEW: Keyboard move method ---
  move(amount) {
      this.x += amount;
      // Apply constraints immediately
      this.x = constrain(this.x, this.size * 0.7, width - this.size * 0.7);
  }


  update() {
    // --- MOUSE OVERRIDE ---
    // If mouse moves significantly, assume mouse control is intended
    // This prevents jitter if mouse is bumped while using keys
    // Disabled for now, but could be added back if needed:
    // if (abs(mouseX - this.x) > 10) {
    //     this.x = mouseX;
    // }

    // --- CONSTRAIN POSITION (redundant if move() constrains, but safe) ---
    this.x = constrain(this.x, this.size * 0.7, width - this.size * 0.7);

    // --- HOVER ---
    this.hoverOffset = sin(frameCount * 0.08) * 3;
    this.y = this.baseY + this.hoverOffset;

    // --- COOLDOWN ---
    if (this.shootCooldown > 0) {
        this.shootCooldown--;
    }
  }

  shoot() { /* ... same as before ... */ }


  // --- DRAW (MODIFIED for Evolving Look) ---
  draw() {
    push();
    translate(this.x, this.y);

    // --- Draw Engine Glow (Slightly adjusted based on level) ---
    let enginePulse = map(sin(frameCount * 0.2 + this.hoverOffset * 0.5), -1, 1, 0.8, 1.2);
    let baseEngineSize = this.size * 0.5 * enginePulse;
    // Make engine bigger/brighter at higher levels
    let engineSizeMultiplier = 1 + this.appearanceLevel * 0.2;
    let engineSize = baseEngineSize * engineSizeMultiplier;
    let engineBrightness = map(sin(frameCount * 0.3), -1, 1, 80, 100);
    noStroke();
    // Outer Glow
    for (let i = engineSize * 1.5; i > 0; i -= 3) {
        let alpha = map(i, 0, engineSize * 1.5, 0, 30 + this.appearanceLevel * 10); // More alpha glow
        fill(hue(this.engineColor2), 100, engineBrightness, alpha);
        ellipse(0, this.size * 0.5, i, i* 1.5);
    }
    // Inner Core
     fill(hue(this.engineColor1), 100, 100);
     ellipse(0, this.size * 0.5, engineSize * 0.6, engineSize * 1.2);


    // --- Draw Ship Body based on Appearance Level ---
    stroke(0, 0, 80); strokeWeight(1.5);

    if (this.appearanceLevel === 0) { // Base Level Look
        fill(this.baseColor);
        beginShape(); // Original curved shape
        vertex(0, -this.size * 0.7);
        bezierVertex(this.size * 0.5, -this.size * 0.4, this.size * 0.6, this.size * 0.1, this.size * 0.7, this.size * 0.4);
        bezierVertex(this.size * 0.4, this.size * 0.5, -this.size * 0.4, this.size * 0.5, -this.size * 0.7, this.size * 0.4);
        bezierVertex(-this.size * 0.6, this.size * 0.1, -this.size * 0.5, -this.size * 0.4, 0, -this.size * 0.7);
        endShape(CLOSE);
    } else if (this.appearanceLevel === 1) { // Mid Level Look
        // Change color slightly, add small winglets
        fill(hue(this.baseColor) + 20, saturation(this.baseColor), brightness(this.baseColor)); // Shift hue slightly
        beginShape(); // Original curved shape
        vertex(0, -this.size * 0.7);
        bezierVertex(this.size * 0.5, -this.size * 0.4, this.size * 0.6, this.size * 0.1, this.size * 0.7, this.size * 0.4);
        bezierVertex(this.size * 0.4, this.size * 0.5, -this.size * 0.4, this.size * 0.5, -this.size * 0.7, this.size * 0.4);
        bezierVertex(-this.size * 0.6, this.size * 0.1, -this.size * 0.5, -this.size * 0.4, 0, -this.size * 0.7);
        endShape(CLOSE);
        // Add winglets
        fill(hue(this.baseColor) - 30, 80, 70); // Contrasting color
        triangle(this.size * 0.6, this.size * 0.3, this.size * 0.8, this.size * 0.5, this.size * 0.5, this.size * 0.5); // Right winglet
        triangle(-this.size * 0.6, this.size * 0.3, -this.size * 0.8, this.size * 0.5, -this.size * 0.5, this.size * 0.5); // Left winglet
    } else { // Max Level Look
        // More angular, aggressive look, different color
        fill(hue(this.baseColor) + 150, 90, 90); // Purple/Pinkish color
        beginShape(); // More angular shape
        vertex(0, -this.size * 0.8); // Sharper nose
        vertex(this.size * 0.9, this.size * 0.5); // Wider, sharper wing tip R
        vertex(this.size * 0.3, this.size * 0.4); // Indent near body R
        vertex(0, this.size * 0.6); // Tail center
        vertex(-this.size * 0.3, this.size * 0.4); // Indent near body L
        vertex(-this.size * 0.9, this.size * 0.5); // Wider, sharper wing tip L
        endShape(CLOSE);
         // Add fins
        fill(hue(this.baseColor) + 180, 80, 70); // Contrasting teal color
        triangle(this.size * 0.7, this.size * 0.4, this.size * 1.1, this.size * 0.6, this.size * 0.6, this.size * 0.6); // Right fin
        triangle(-this.size * 0.7, this.size * 0.4, -this.size * 1.1, this.size * 0.6, -this.size * 0.6, this.size * 0.6); // Left fin
    }

    // --- Draw Cockpit (Same for all levels for now) ---
    fill(this.cockpitColor); noStroke();
    ellipse(0, -this.size * 0.15, this.size * 0.4, this.size * 0.5);
    fill(0, 0, 100, 50);
    ellipse(0, -this.size * 0.2, this.size * 0.2, this.size * 0.25);

    pop();
  }
}


// ==================
// Bullet Class (Unchanged)
// ==================
class Bullet { /* ... same as before ... */ }

// ==================
// Asteroid Class (Unchanged)
// ==================
class Asteroid { /* ... same as before ... */ }

// ==================
// Particle Class (Unchanged)
// ==================
class Particle { /* ... same as before ... */ }

// ==================
// Star Class (Unchanged)
// ==================
class Star { /* ... same as before ... */ }
