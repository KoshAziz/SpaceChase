// --- Features ---
// - Rainbow Bullets (Hue Cycling)
// - Ship Upgrade System (Automatic Cheapest) // MODIFIED
// - Score-based Shield System (Gain shield charge every 50 points, max 10)
// - Redesigned Spaceship Look (Score-based color/shape, added details)
// - Dynamic Parallax Star Background
// - Enhanced Engine Thrust Effect (More reactive)
// - Asteroid Splitting
// - Player Lives (Max 3)
// - Simple Explosion Particles
// - Score-based Difficulty Increase
// - Health Potions: Spawn randomly, restore 1 life on pickup (up to max).
// --- Modifications ---
// - Upgrade costs reduced.
// - Asteroids only spawn from Top, Left, and Right edges.
// - Asteroid speed reduced.
// - Ship movement changed to free keyboard control (Arrows/WASD).
// - Added Spacebar as an alternative shooting key.
// - Score per asteroid hit increased to 2 points.
// - Background gradient color changes every 10 seconds.
// - Ship no longer resets position on non-fatal hit.
// - Added brief invulnerability after losing a life.
// - Added Touch Controls: Tap to shoot and move towards tap.
// - Mobile Adjustments: Lower asteroid spawn rate. // Touch upgrade removed
// --------------------------

let ship;
let bullets = [];
let asteroids = [];
let particles = [];
let stars = [];
let potions = [];

let score = 0;
let baseAsteroidSpawnRate = 0.01; // Default for desktop
let currentAsteroidSpawnRate; // Will be initialized in setup
let potionSpawnRate = 0.001;
let isGameOver = false;
let lives = 3;
const MAX_LIVES = 3;
let initialAsteroids = 5;
let minAsteroidSize = 15;
const SHIELD_SCORE_THRESHOLD = 50;
const MAX_SHIELD_CHARGES = 10;
const SHAPE_CHANGE_THRESHOLD = 100;

// --- Info Message System Variables ---
let infoMessage = "";
let infoMessageTimeout = 0;

// --- Background Color Variables ---
let currentTopColor;
let currentBottomColor;
const BACKGROUND_CHANGE_INTERVAL = 600;

// --- Mobile Detection ---
let isMobile = false;
// REMOVED: Upgrade area variables no longer needed
// let upgradeArea1 = null;
// let upgradeArea2 = null;


// ==================
// p5.js Setup Function
// ==================
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  // Mobile Detection & Spawn Rate Adjustment
  let ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
    isMobile = true;
    baseAsteroidSpawnRate = 0.007; // Lower rate for mobile
  } else {
    baseAsteroidSpawnRate = 0.01; // Default rate for desktop
  }
  currentAsteroidSpawnRate = baseAsteroidSpawnRate; // Initialize current rate

  ship = new Ship();
  spawnInitialAsteroids();
  createStarfield(200);
  textAlign(CENTER, CENTER);
  textSize(20);

  // Initialize background colors
  currentTopColor = color(260, 80, 10);
  currentBottomColor = color(240, 70, 25);
}

// ==================
// Helper Functions
// ==================
function spawnInitialAsteroids() {
    asteroids = [];
    for (let i = 0; i < initialAsteroids; i++) {
        let startPos;
        let shipX = ship ? ship.pos.x : width / 2;
        let shipY = ship ? ship.pos.y : height - 50;
        do {
             startPos = createVector(random(width), random(height * 0.7));
        } while (dist(startPos.x, startPos.y, shipX, shipY) < 150);
        asteroids.push(new Asteroid(startPos.x, startPos.y));
    }
}

function createParticles(x, y, count, particleColor) {
    let baseHue = hue(particleColor);
    let baseSat = saturation(particleColor);
    let baseBri = brightness(particleColor);
    for (let i = 0; i < count; i++) {
        let pColor = color(
            baseHue + random(-10, 10),
            baseSat * random(0.8, 1.0),
            baseBri * random(0.9, 1.0),
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
  // Check for background color change
  if (frameCount > 0 && frameCount % BACKGROUND_CHANGE_INTERVAL === 0) {
      let topH = random(180, 300);
      let bottomH = (topH + random(20, 60)) % 360;
      currentTopColor = color(topH, random(70, 90), random(10, 20));
      currentBottomColor = color(bottomH, random(60, 85), random(25, 40));
  }

  drawBackgroundAndStars();

  if (isGameOver) {
    displayGameOver();
    return;
  }

  // Update & Draw Game Elements
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

  // Asteroids & Collisions (Handles score increase and auto-upgrade check)
  handleAsteroidsAndCollisions();

  // Handle Potions
  handlePotions();

  // Spawn New Asteroids
  currentAsteroidSpawnRate = baseAsteroidSpawnRate + (score * 0.0001);
  if (random(1) < currentAsteroidSpawnRate && asteroids.length < 25) {
    asteroids.push(new Asteroid());
  }

  // Spawn Health Potions
  if (random(1) < potionSpawnRate && potions.length < 2) {
      potions.push(new HealthPotion());
  }

  // Display HUD
  displayHUD();

  // Display Info Messages
  if (infoMessageTimeout > 0) {
      displayInfoMessage();
      infoMessageTimeout--;
  }
}

// ==================
// Collision Handling Functions
// ==================
function handleAsteroidsAndCollisions() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        if (!asteroids[i]) continue;
        asteroids[i].update();
        asteroids[i].draw();

        // Bullet vs Asteroid
        let asteroidHitByBullet = false;
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (asteroids[i] && bullets[j] && asteroids[i].hits(bullets[j])) {
                let oldScore = score;
                score += 2; // Add score

                // --- Shield Gain Logic ---
                let shieldsToAdd = floor(score / SHIELD_SCORE_THRESHOLD) - floor(oldScore / SHIELD_SCORE_THRESHOLD);
                if (shieldsToAdd > 0 && ship.shieldCharges < MAX_SHIELD_CHARGES) {
                    let actualAdded = ship.gainShields(shieldsToAdd);
                    if (actualAdded > 0) {
                         infoMessage = `+${actualAdded} SHIELD CHARGE(S)!`;
                         infoMessageTimeout = 90;
                    }
                }

                // --- Shape Change Logic ---
                let oldShapeLevel = floor(oldScore / SHAPE_CHANGE_THRESHOLD);
                let newShapeLevel = floor(score / SHAPE_CHANGE_THRESHOLD);
                if (newShapeLevel > oldShapeLevel) {
                    ship.changeShape(newShapeLevel);
                    infoMessage = "SHIP SHAPE EVOLVED!"; // Override other messages
                    infoMessageTimeout = 120;
                }

                // --- NEW: Automatic Upgrade Logic ---
                let upgradedInLoop = true; // Flag to keep checking if upgrades are possible
                while (upgradedInLoop) {
                    upgradedInLoop = false; // Assume no upgrade this iteration unless one happens
                    let cost1 = ship.getUpgradeCost('fireRate');
                    let cost2 = ship.getUpgradeCost('spreadShot');
                    let numCost1 = (typeof cost1 === 'number') ? cost1 : Infinity;
                    let numCost2 = (typeof cost2 === 'number') ? cost2 : Infinity;

                    let cheapestCost = Math.min(numCost1, numCost2);

                    // If no upgrades are possible or affordable, exit loop
                    if (cheapestCost === Infinity || score < cheapestCost) {
                        break;
                    }

                    // Prioritize fire rate if costs are equal
                    if (numCost1 <= numCost2) {
                        if (ship.attemptUpgrade('fireRate')) { // attemptUpgrade now returns true on success
                            upgradedInLoop = true; // An upgrade happened, loop again
                        }
                    } else { // Spread shot is cheaper
                        if (ship.attemptUpgrade('spreadShot')) {
                            upgradedInLoop = true; // An upgrade happened, loop again
                        }
                    }
                } // --- End Auto Upgrade Loop ---


                // --- Process Asteroid Destruction ---
                let currentAsteroid = asteroids[i];
                let asteroidPos = currentAsteroid.pos.copy();
                let asteroidSize = currentAsteroid.size;
                let asteroidColor = currentAsteroid.color;

                asteroids.splice(i, 1);
                bullets.splice(j, 1);
                asteroidHitByBullet = true;

                createParticles(asteroidPos.x, asteroidPos.y, floor(asteroidSize / 3), asteroidColor);
                if (asteroidSize > minAsteroidSize * 2) {
                    let newSize = asteroidSize * 0.6;
                    let splitSpeedMultiplier = random(0.8, 2.0);
                    let vel1 = p5.Vector.random2D().mult(splitSpeedMultiplier);
                    let vel2 = p5.Vector.random2D().mult(splitSpeedMultiplier);
                    asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel1));
                    asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel2));
                }
                break; // Exit bullet loop
            }
        }

        if (asteroidHitByBullet) continue;

        // --- Ship vs Asteroid ---
        if (ship.invulnerableTimer <= 0 && asteroids[i] && asteroids[i].hitsShip(ship)) {
            if (ship.shieldCharges > 0) {
                ship.loseShield();
                createParticles(ship.pos.x, ship.pos.y, 25, color(180, 80, 100));
                createParticles(asteroids[i].pos.x, asteroids[i].pos.y, floor(asteroids[i].size / 3), asteroids[i].color);
                asteroids.splice(i, 1);
            } else {
                lives--;
                createParticles(ship.pos.x, ship.pos.y, 30, color(0, 80, 100));
                if (lives <= 0) {
                    isGameOver = true;
                } else {
                    ship.setInvulnerable();
                    createParticles(asteroids[i].pos.x, asteroids[i].pos.y, floor(asteroids[i].size / 3), asteroids[i].color);
                    asteroids.splice(i, 1);
                }
            }
        }
    }
}

// Handle Potions
function handlePotions() {
    for (let i = potions.length - 1; i >= 0; i--) {
        potions[i].update();
        potions[i].draw();
        if (potions[i].hitsShip(ship)) {
            if (lives < MAX_LIVES) {
                lives++;
                infoMessage = "+1 LIFE!";
                infoMessageTimeout = 90;
            } else {
                 score += 10;
                 infoMessage = "+10 SCORE (MAX LIVES)!";
                 infoMessageTimeout = 90;
            }
            potions.splice(i, 1);
        }
        else if (potions[i].isOffscreen()) {
             potions.splice(i, 1);
        }
    }
}

// ==================
// Background Drawing Function
// ==================
function drawBackgroundAndStars() {
    for(let y=0; y < height; y++){
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(currentTopColor, currentBottomColor, inter);
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

// MODIFIED: Simplified HUD for automatic upgrades
function displayHUD() {
  let hudTextSize = 18;
  textSize(hudTextSize);

  // Left Aligned Info
  fill(0, 0, 100, 80);
  noStroke();
  textAlign(LEFT, TOP);
  text("Score: " + score, 15, 15);
  text(`Lives: ${lives} / ${MAX_LIVES}`, 15, 40);
  text(`Shields: ${ship.shieldCharges} / ${MAX_SHIELD_CHARGES}`, 15, 65);

  // Right Aligned Upgrade Info (Simplified)
  textAlign(RIGHT, TOP);
  // Show current levels, color doesn't need to indicate affordability anymore
  fill(0, 0, 100, 80); // Consistent white text
  text(`Rate Lvl: ${ship.fireRateLevel}/${ship.maxLevel}`, width - 15, 15);
  text(`Spread Lvl: ${ship.spreadShotLevel}/${ship.maxLevel}`, width - 15, 40);

  // REMOVED: Bounding box calculation no longer needed
  // upgradeArea1 = null;
  // upgradeArea2 = null;
}


// Displays temporary info messages
function displayInfoMessage() {
    fill(0, 0, 100);
    textSize(16);
    textAlign(CENTER, BOTTOM);
    text(infoMessage, width / 2, height - 20);
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

// Resets the game state
function resetGame() {
    ship = new Ship();
    bullets = [];
    particles = [];
    asteroids = [];
    potions = [];
    score = 0;
    lives = 3;
    currentAsteroidSpawnRate = isMobile ? 0.007 : 0.01; // Use mobile rate if applicable
    isGameOver = false;
    spawnInitialAsteroids();
    createStarfield(200);
    currentTopColor = color(260, 80, 10);
    currentBottomColor = color(240, 70, 25);
    frameCount = 0;
    infoMessage = "";
    infoMessageTimeout = 0;
    // REMOVED: Upgrade area reset no longer needed
    // upgradeArea1 = null;
    // upgradeArea2 = null;
}


// ==================
// Input Handling Functions
// ==================
function mousePressed() {
  if (isGameOver) {
     resetGame();
  } else {
    ship.shoot();
  }
  // return false;
}

// MODIFIED: Removed upgrade keys
function keyPressed() {
    if (isGameOver) return;
    // Removed '1' and '2' key checks for upgrades
    if (keyCode === 32) { // SPACEBAR
        ship.shoot();
        return false; // Prevent default spacebar action (scrolling)
    }
}

// MODIFIED: Removed upgrade tap checks
function touchStarted() {
    if (isGameOver) {
        resetGame();
        return false; // Prevent default
    }

    // No longer checking for upgrade area taps
    ship.shoot();

    // Prevent default touch behavior (like scrolling or zooming)
    return false;
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createStarfield(200);
  if (ship) {
      ship.resetPosition();
  }
}


// ==================
// Ship Class
// ==================
class Ship {
  constructor() {
    // Movement & Position
    this.pos = createVector(width / 2, height - 50);
    this.vel = createVector(0, 0);
    this.thrust = 0.3;
    this.touchThrustMultiplier = 1.1;
    this.friction = 0.98;
    this.maxSpeed = 7;

    // Appearance
    this.size = 30;
    this.cockpitColor = color(180, 100, 100);
    this.engineColor1 = color(30, 100, 100);
    this.engineColor2 = color(0, 100, 100);
    this.finColor = color(220, 60, 70);
    this.detailColor = color(0, 0, 60);
    this.shapeState = 0;

    // Weapon
    this.shootCooldown = 0;
    this.baseShootDelay = 15;
    this.shootDelayPerLevel = 2;

    // Shields & Health
    this.shieldCharges = 0;
    this.shieldVisualRadius = this.size * 1.1;
    this.invulnerableTimer = 0;
    this.invulnerabilityDuration = 120;

    // Upgrades
    this.maxLevel = 5;
    this.fireRateLevel = 0;
    this.spreadShotLevel = 0;
    this.baseUpgradeCost = 30;
    this.costMultiplier = 2.0;
  }

  gainShields(amount) {
      let currentCharges = this.shieldCharges;
      this.shieldCharges = min(this.shieldCharges + amount, MAX_SHIELD_CHARGES);
      return this.shieldCharges - currentCharges;
  }

  loseShield() {
      if (this.shieldCharges > 0) {
          this.shieldCharges--;
      }
  }

  setInvulnerable() {
      this.invulnerableTimer = this.invulnerabilityDuration;
  }

  changeShape(level) {
      this.shapeState = (level % 2);
  }

  get currentShootDelay() {
      return max(3, this.baseShootDelay - (this.fireRateLevel * this.shootDelayPerLevel));
  }

  getUpgradeCost(upgradeType) {
      let level;
      if (upgradeType === 'fireRate') level = this.fireRateLevel;
      else if (upgradeType === 'spreadShot') level = this.spreadShotLevel;
      else return Infinity;
      if (level >= this.maxLevel) return "MAX";
      return floor(this.baseUpgradeCost * pow(this.costMultiplier, level));
  }

  // MODIFIED: Returns true on success, false otherwise
  attemptUpgrade(upgradeType) {
      let cost = this.getUpgradeCost(upgradeType);
      let currentLevel;
      let upgradeName = upgradeType.replace(/([A-Z])/g, ' $1').toUpperCase();

      if (upgradeType === 'fireRate') currentLevel = this.fireRateLevel;
      else if (upgradeType === 'spreadShot') currentLevel = this.spreadShotLevel;
      else return false; // Unknown type

      if (currentLevel < this.maxLevel && typeof cost === 'number' && score >= cost) {
          score -= cost; // Deduct score
          if (upgradeType === 'fireRate') this.fireRateLevel++;
          else if (upgradeType === 'spreadShot') this.spreadShotLevel++;
          // Don't overwrite existing message if one is already showing briefly
          if (infoMessageTimeout <= 0) {
             infoMessage = `${upgradeName} UPGRADED! (Lvl ${currentLevel + 1})`;
             infoMessageTimeout = 120;
          }
          return true; // Upgrade successful
      } else {
          // Optional: Display message if max level or not enough points?
          // For automatic, maybe better not to spam messages if unaffordable.
          // if (currentLevel >= this.maxLevel && infoMessageTimeout <= 0) {
          //     infoMessage = `${upgradeName} MAX LEVEL!`;
          //     infoMessageTimeout = 120;
          // }
          return false; // Upgrade failed (max level or not enough points)
      }
  }


  resetUpgrades() {
      this.fireRateLevel = 0;
      this.spreadShotLevel = 0;
  }

  resetPosition() {
      this.pos.set(width / 2, height - 50);
      this.vel.set(0, 0);
      this.invulnerableTimer = 0;
      this.shapeState = 0;
  }

  update() {
    if (this.invulnerableTimer > 0) { this.invulnerableTimer--; }

    let isTouching = touches.length > 0;
    if (isTouching) {
        let touchPos = createVector(touches[0].x, touches[0].y);
        let direction = p5.Vector.sub(touchPos, this.pos);
        if (direction.magSq() > 1) {
             direction.normalize();
             this.vel.add(direction.mult(this.thrust * this.touchThrustMultiplier));
        }
    } else {
        let movingUp = keyIsDown(UP_ARROW) || keyIsDown(87);
        let movingDown = keyIsDown(DOWN_ARROW) || keyIsDown(83);
        let movingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65);
        let movingRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68);
        if (movingUp) { this.vel.y -= this.thrust; }
        if (movingDown) { this.vel.y += this.thrust; }
        if (movingLeft) { this.vel.x -= this.thrust; }
        if (movingRight) { this.vel.x += this.thrust; }
    }

    this.vel.mult(this.friction);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);

    let margin = this.size * 0.7;
    this.pos.x = constrain(this.pos.x, margin, width - margin);
    this.pos.y = constrain(this.pos.y, margin, height - margin);

    if (this.shootCooldown > 0) { this.shootCooldown--; }
  }

  shoot() {
      if (this.shootCooldown <= 0) {
          let bulletX = this.pos.x;
          let bulletY = this.pos.y - this.size * 0.6;
          let numShots = 1;
          let spreadAngle = 0;
          if (this.spreadShotLevel >= 1 && this.spreadShotLevel <= 2) {
              numShots = 3; spreadAngle = PI / 20;
          } else if (this.spreadShotLevel >= 3 && this.spreadShotLevel <= 4) {
              numShots = 3; spreadAngle = PI / 15;
          } else if (this.spreadShotLevel >= this.maxLevel) {
              numShots = 5; spreadAngle = PI / 12;
          }
          for (let i = 0; i < numShots; i++) {
              let angle = 0;
              if (numShots > 1) { angle = map(i, 0, numShots - 1, -spreadAngle, spreadAngle); }
              bullets.push(new Bullet(bulletX, bulletY, angle));
          }
          this.shootCooldown = this.currentShootDelay;
      }
  }

  draw() {
    if (this.invulnerableTimer <= 0 || (this.invulnerableTimer > 0 && frameCount % 10 < 5) ) {
        push();
        translate(this.pos.x, this.pos.y);

        // Draw Shield Visual
        if (this.shieldCharges > 0) {
            let shieldAlpha = map(sin(frameCount * 0.15), -1, 1, 40, 80);
            let shieldHue = 180;
            fill(shieldHue, 80, 100, shieldAlpha);
            noStroke();
            ellipse(0, 0, this.shieldVisualRadius * 2, this.shieldVisualRadius * 2);
            strokeWeight(1.5);
            stroke(shieldHue, 90, 100, shieldAlpha + 30);
            noFill();
            ellipse(0, 0, this.shieldVisualRadius * 2, this.shieldVisualRadius * 2);
        }

        // Draw Engine Glow
        let enginePulseFactor = 1.0 + this.vel.mag() * 0.3;
        let enginePulse = map(sin(frameCount * 0.2), -1, 1, 0.8, 1.2) * enginePulseFactor;
        let engineSize = this.size * 0.5 * enginePulse;
        let engineBrightness = map(sin(frameCount * 0.3), -1, 1, 80, 100);
        noStroke();
        for (let i = engineSize * 1.5; i > 0; i -= 3) {
            let alpha = map(i, 0, engineSize * 1.5, 0, 30);
            fill(hue(this.engineColor2), 100, engineBrightness, alpha);
            ellipse(0, this.size * 0.5, i, i * 1.5);
        }
        fill(hue(this.engineColor1), 100, 100);
        ellipse(0, this.size * 0.5, engineSize * 0.6, engineSize * 1.2);

        // Draw Ship Body
        stroke(0, 0, 80);
        strokeWeight(1.5);
        let scoreHue = (200 + score * 0.2) % 360;
        fill(scoreHue, 80, 95);

        // Shape State Logic
        beginShape();
        if (this.shapeState === 0) { // Base Shape
            vertex(0, -this.size * 0.7);
            bezierVertex( this.size * 0.6, -this.size * 0.3, this.size * 0.7,  this.size * 0.0, this.size * 0.8,  this.size * 0.4);
            bezierVertex( this.size * 0.4,  this.size * 0.6, -this.size * 0.4,  this.size * 0.6, -this.size * 0.8,  this.size * 0.4);
            bezierVertex(-this.size * 0.7,  this.size * 0.0, -this.size * 0.6, -this.size * 0.3, 0, -this.size * 0.7);
        } else { // Evolved Shape (State 1)
            let s = this.size * 1.1;
            vertex(0, -s * 0.8);
            bezierVertex( s * 0.7, -s * 0.2, s * 0.8,  s * 0.1, s * 0.9,  s * 0.5);
            bezierVertex( s * 0.5,  s * 0.7, -s * 0.5,  s * 0.7, -s * 0.9,  s * 0.5);
            bezierVertex(-s * 0.8,  s * 0.1, -s * 0.7, -s * 0.2, 0, -s * 0.8);
        }
        endShape(CLOSE);

        // Draw Details (Panel Lines)
        strokeWeight(1);
        stroke(this.detailColor);
        if (this.shapeState === 0) {
             line(-this.size * 0.4, -this.size * 0.1, -this.size * 0.6, this.size * 0.3);
             line( this.size * 0.4, -this.size * 0.1,  this.size * 0.6, this.size * 0.3);
        } else {
             let s = this.size * 1.1;
             line(-s * 0.5, -s * 0.05, -s * 0.7, s * 0.4);
             line( s * 0.5, -s * 0.05,  s * 0.7, s * 0.4);
             line(0, -s*0.4, 0, s*0.1);
        }

        // Draw Fins
        let finYOffset = this.shapeState === 0 ? this.size * 0.3 : this.size * 1.1 * 0.35;
        let finXOffset = this.shapeState === 0 ? this.size * 0.5 : this.size * 1.1 * 0.6;
        let finTipX = this.shapeState === 0 ? this.size * 0.9 : this.size * 1.1 * 1.0;
        let finRearX = this.shapeState === 0 ? this.size * 0.6 : this.size * 1.1 * 0.7;
        let finRearY = this.shapeState === 0 ? this.size * 0.6 : this.size * 1.1 * 0.7;
        fill(this.finColor);
        stroke(0, 0, 60);
        strokeWeight(1);
        triangle( finXOffset, finYOffset, finTipX, finYOffset + this.size*0.1, finRearX, finRearY);
        triangle(-finXOffset, finYOffset, -finTipX, finYOffset + this.size*0.1, -finRearX, finRearY);

        // Draw Cockpit
        fill(this.cockpitColor);
        noStroke();
        ellipse(0, -this.size * 0.15, this.size * 0.4, this.size * 0.5);
        fill(0, 0, 100, 50);
        ellipse(0, -this.size * 0.2, this.size * 0.2, this.size * 0.25);

        pop();
     }
  }
}

// ==================
// Bullet Class
// ==================
class Bullet {
  constructor(x, y, angle = 0) {
    this.pos = createVector(x, y);
    this.speed = 16;
    this.size = 5;
    this.startHue = frameCount % 360;
    this.hue = this.startHue;
    let baseAngle = -PI / 2;
    this.vel = p5.Vector.fromAngle(baseAngle + angle);
    this.vel.mult(this.speed);
  }
  update() {
    this.pos.add(this.vel);
    this.hue = (this.hue + 4) % 360;
  }
  draw() {
    fill(this.hue, 90, 100);
    stroke(0, 0, 100);
    strokeWeight(1);
    ellipse(this.pos.x, this.pos.y, this.size, this.size * 2.5);
  }
  isOffscreen() {
    let margin = this.size * 3;
    return (this.pos.y < -margin || this.pos.y > height + margin ||
            this.pos.x < -margin || this.pos.x > width + margin);
  }
}

// ==================
// Asteroid Class
// ==================
class Asteroid {
  constructor(x, y, size, vel) {
    this.size = size || random(30, 80);
    this.pos = createVector();
    let isInitialPlacement = (x !== undefined && y !== undefined);
    if (isInitialPlacement) {
      this.pos.x = x; this.pos.y = y;
    } else {
      let edge = floor(random(3));
      if (edge === 0) { this.pos.x = random(width); this.pos.y = -this.size / 2; }
      else if (edge === 1) { this.pos.x = width + this.size / 2; this.pos.y = random(height * 0.7); }
      else { this.pos.x = -this.size / 2; this.pos.y = random(height * 0.7); }
    }
    if (vel) {
      this.vel = vel;
    } else {
       this.speed = random(0.6, 1.8) * (this.size > 50 ? 0.9 : 1.1);
       if (isInitialPlacement) { this.vel = p5.Vector.random2D(); }
       else {
           let targetX = width / 2 + random(-width * 0.25, width * 0.25);
           let targetY = height / 2 + random(-height * 0.25, height * 0.25);
           let direction = createVector(targetX - this.pos.x, targetY - this.pos.y);
           direction.normalize();
           direction.rotate(random(-PI / 12, PI / 12));
           this.vel = direction;
       }
       this.vel.mult(this.speed);
    }
    this.color = color(random(20, 50), random(30, 70), random(30, 60));
    this.rotation = random(TWO_PI);
    this.rotationSpeed = random(-0.025, 0.025);
    this.vertices = [];
    let numVertices = floor(random(7, 15));
    for (let i = 0; i < numVertices; i++) {
      let angleOffset = map(i, 0, numVertices, 0, TWO_PI);
      let r = this.size / 2 + random(-this.size * 0.35, this.size * 0.25);
      let v = p5.Vector.fromAngle(angleOffset + this.rotation); v.mult(r);
      this.vertices.push(v);
    }
  }
  update() {
    this.pos.add(this.vel); this.rotation += this.rotationSpeed;
    let buffer = this.size;
    if (this.pos.x < -buffer) this.pos.x = width + buffer;
    if (this.pos.x > width + buffer) this.pos.x = -buffer;
    if (this.pos.y < -buffer) this.pos.y = height + buffer;
    if (this.pos.y > height + buffer) this.pos.y = -buffer;
  }
  draw() {
    push(); translate(this.pos.x, this.pos.y); rotate(this.rotation);
    fill(this.color);
    stroke(hue(this.color), saturation(this.color) * 0.5, brightness(this.color) * 1.5);
    strokeWeight(2); beginShape();
    for (let v of this.vertices) { vertex(v.x, v.y); }
    endShape(CLOSE); pop();
  }
  hits(bullet) {
    let d = dist(this.pos.x, this.pos.y, bullet.pos.x, bullet.pos.y);
    return d < this.size / 2 + bullet.size / 2;
  }
  hitsShip(ship) {
    let targetX = ship.pos.x;
    let targetY = ship.pos.y;
    // Use ship base size for collision, regardless of visual shape state
    let targetRadius = ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5;
    let d = dist(this.pos.x, this.pos.y, targetX, targetY);
    return d < this.size / 2 + targetRadius;
  }
}

// ==================
// Particle Class
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
// Star Class
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

// ==================
// HealthPotion Class
// ==================
class HealthPotion {
    constructor(x, y) {
        this.pos = createVector(x || random(width * 0.1, width * 0.9), y || -30);
        this.vel = createVector(0, random(0.5, 1.5));
        this.size = 20;
        this.bodyWidth = this.size * 0.6;
        this.bodyHeight = this.size * 0.8;
        this.neckWidth = this.size * 0.3;
        this.neckHeight = this.size * 0.4;
        this.rotation = 0;
        this.rotationSpeed = random(-0.01, 0.01);
    }

    update() {
        this.pos.add(this.vel);
        this.rotation += this.rotationSpeed;
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);
        fill(0, 85, 90); // Red
        noStroke();
        rect(-this.bodyWidth / 2, -this.bodyHeight / 2, this.bodyWidth, this.bodyHeight, 3);
        rect(-this.neckWidth / 2, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth, this.neckHeight);
        ellipse(0, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth * 1.2, this.neckWidth * 0.4);
        fill(0, 0, 100); // White '+'
        rectMode(CENTER);
        rect(0, 0, this.bodyWidth * 0.5, this.bodyWidth * 0.15);
        rect(0, 0, this.bodyWidth * 0.15, this.bodyWidth * 0.5);
        rectMode(CORNER);
        pop();
    }

    hitsShip(ship) {
        let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y);
        // Use ship base size for potion collision, regardless of visual shape state
        return d < this.size / 2 + ship.size * 0.5;
    }

    isOffscreen() {
        let margin = this.size * 2;
        return (this.pos.y > height + margin);
    }
}
