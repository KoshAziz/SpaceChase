// --- Features ---
// - Rainbow Bullets (Hue Cycling)
// - Ship Upgrade System (Fire Rate, Spread Shot) via Keyboard ('1', '2')
// - Score-based Shield System (Gain shield charge every 50 points, max 10)
// - Redesigned Spaceship Look (Score-based color/shape, added details) // MODIFIED
// - Dynamic Parallax Star Background
// - Enhanced Engine Thrust Effect (More reactive) // MODIFIED
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
// --------------------------

let ship;
let bullets = [];
let asteroids = [];
let particles = [];
let stars = [];
let potions = [];

let score = 0;
let baseAsteroidSpawnRate = 0.01;
let currentAsteroidSpawnRate = baseAsteroidSpawnRate;
let potionSpawnRate = 0.001;
let isGameOver = false;
let lives = 3;
const MAX_LIVES = 3;
let initialAsteroids = 5;
let minAsteroidSize = 15;
const SHIELD_SCORE_THRESHOLD = 50;
const MAX_SHIELD_CHARGES = 10;
const SHAPE_CHANGE_THRESHOLD = 100; // NEW: Score needed to change shape

// --- Info Message System Variables ---
let infoMessage = "";
let infoMessageTimeout = 0;

// --- Background Color Variables ---
let currentTopColor;
let currentBottomColor;
const BACKGROUND_CHANGE_INTERVAL = 600;


// ==================
// p5.js Setup Function
// ==================
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
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
  ship.draw(); // Draw handles blinking when invulnerable

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

                // --- NEW: Shape Change Logic ---
                let oldShapeLevel = floor(oldScore / SHAPE_CHANGE_THRESHOLD);
                let newShapeLevel = floor(score / SHAPE_CHANGE_THRESHOLD);
                if (newShapeLevel > oldShapeLevel) {
                    ship.changeShape(newShapeLevel); // Tell ship to change shape state
                    // Override shield message if shape changes
                    infoMessage = "SHIP SHAPE EVOLVED!";
                    infoMessageTimeout = 120; // Show longer
                }
                // --- End Shape Change Logic ---

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
                break;
            }
        }

        if (asteroidHitByBullet) continue;

        // --- Ship vs Asteroid ---
        // Check for invulnerability first
        if (ship.invulnerableTimer <= 0 && asteroids[i] && asteroids[i].hitsShip(ship)) {
            // Shield Check
            if (ship.shieldCharges > 0) {
                ship.loseShield();
                createParticles(ship.pos.x, ship.pos.y, 25, color(180, 80, 100)); // Shield burst
                createParticles(asteroids[i].pos.x, asteroids[i].pos.y, floor(asteroids[i].size / 3), asteroids[i].color); // Asteroid explodes
                asteroids.splice(i, 1); // Destroy asteroid
            } else {
                // No Shield: Lose Life
                lives--;
                createParticles(ship.pos.x, ship.pos.y, 30, color(0, 80, 100)); // Ship explodes

                if (lives <= 0) {
                    isGameOver = true; // Game over
                } else {
                    // No reset, just invulnerability
                    ship.setInvulnerable(); // Start invulnerability timer
                    // Destroy the asteroid that hit the ship
                    createParticles(asteroids[i].pos.x, asteroids[i].pos.y, floor(asteroids[i].size / 3), asteroids[i].color);
                    asteroids.splice(i, 1);
                }
            }
        } // End Ship vs Asteroid hit check (including invulnerability)
    } // End Asteroid Loop
}

// Handle Potions
function handlePotions() {
    for (let i = potions.length - 1; i >= 0; i--) {
        potions[i].update();
        potions[i].draw();

        // Check for collision with ship
        if (potions[i].hitsShip(ship)) {
            if (lives < MAX_LIVES) {
                lives++;
                infoMessage = "+1 LIFE!";
                infoMessageTimeout = 90;
            } else {
                 score += 10; // Give points if at max health
                 infoMessage = "+10 SCORE (MAX LIVES)!";
                 infoMessageTimeout = 90;
            }
            potions.splice(i, 1); // Remove potion
        }
        else if (potions[i].isOffscreen()) {
             potions.splice(i, 1); // Remove if offscreen
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

function displayHUD() {
  fill(0, 0, 100, 80);
  noStroke();
  textSize(18);
  textAlign(LEFT, TOP);
  text("Score: " + score, 15, 15);
  text(`Lives: ${lives} / ${MAX_LIVES}`, 15, 40);
  text(`Shields: ${ship.shieldCharges} / ${MAX_SHIELD_CHARGES}`, 15, 65);

  textAlign(RIGHT, TOP);
  let fireRateCost = ship.getUpgradeCost('fireRate');
  let spreadShotCost = ship.getUpgradeCost('spreadShot');

  fill(ship.fireRateLevel < ship.maxLevel ? color(120, 70, 90) : color(0, 0, 50));
  text(`[1] Rate (${ship.fireRateLevel}/${ship.maxLevel}): ${fireRateCost} pts`, width - 15, 15);

  fill(ship.spreadShotLevel < ship.maxLevel ? color(120, 70, 90) : color(0, 0, 50));
  text(`[2] Spread (${ship.spreadShotLevel}/${ship.maxLevel}): ${spreadShotCost} pts`, width - 15, 40);
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
    currentAsteroidSpawnRate = baseAsteroidSpawnRate;
    isGameOver = false;
    spawnInitialAsteroids();
    createStarfield(200);
    currentTopColor = color(260, 80, 10);
    currentBottomColor = color(240, 70, 25);
    frameCount = 0;
    infoMessage = "";
    infoMessageTimeout = 0;
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
  // return false; // Might prevent issues on mobile/touch?
}

function keyPressed() {
    if (isGameOver) return;
    if (key === '1') {
        ship.attemptUpgrade('fireRate');
    } else if (key === '2') {
        ship.attemptUpgrade('spreadShot');
    } else if (keyCode === 32) { // SPACEBAR
        ship.shoot();
        return false; // Prevent default spacebar action (scrolling)
    }
}

function touchStarted() {
    if (isGameOver) {
        resetGame();
    } else {
        ship.shoot();
    }
    return false; // Prevent default touch behavior
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
    this.detailColor = color(0, 0, 60); // Dark grey for details
    this.shapeState = 0; // NEW: 0 for base, 1 for evolved

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

  // NEW: Method to change shape state
  changeShape(level) {
      // Cycle between 2 shapes (0 and 1) based on level (every 100 points)
      this.shapeState = (level % 2); // Simple toggle for now
      // Could have more complex logic for more shapes:
      // this.shapeState = min(level, MAX_SHAPE_STATE);
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

  attemptUpgrade(upgradeType) {
      let cost = this.getUpgradeCost(upgradeType);
      let currentLevel;
      let upgradeName = upgradeType.replace(/([A-Z])/g, ' $1').toUpperCase();
      if (upgradeType === 'fireRate') currentLevel = this.fireRateLevel;
      else if (upgradeType === 'spreadShot') currentLevel = this.spreadShotLevel;
      else return;
      if (currentLevel < this.maxLevel && typeof cost === 'number' && score >= cost) {
          score -= cost;
          if (upgradeType === 'fireRate') this.fireRateLevel++;
          else if (upgradeType === 'spreadShot') this.spreadShotLevel++;
          infoMessage = `${upgradeName} UPGRADED! (Level ${currentLevel + 1})`;
      } else if (currentLevel >= this.maxLevel) {
          infoMessage = `${upgradeName} MAX LEVEL!`;
      } else if (typeof cost === 'number') {
          infoMessage = `NEED ${cost} PTS FOR ${upgradeName}!`;
      } else {
           infoMessage = `CANNOT UPGRADE ${upgradeName}`;
      }
      infoMessageTimeout = 120;
  }

  resetUpgrades() {
      this.fireRateLevel = 0;
      this.spreadShotLevel = 0;
  }

  resetPosition() {
      this.pos.set(width / 2, height - 50);
      this.vel.set(0, 0);
      this.invulnerableTimer = 0;
      this.shapeState = 0; // NEW: Reset shape state
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

  // MODIFIED: Draw the ship - includes shape state, score color, cooler look
  draw() {
    // Only draw if not blinking or during visible part of blink
    if (this.invulnerableTimer <= 0 || (this.invulnerableTimer > 0 && frameCount % 10 < 5) ) {
        push();
        translate(this.pos.x, this.pos.y);

        // --- Draw Shield Visual ---
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

        // --- Draw Engine Glow ---
        // MODIFIED: Increased reaction to velocity
        let enginePulseFactor = 1.0 + this.vel.mag() * 0.3; // Increased multiplier
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

        // --- Draw Ship Body ---
        stroke(0, 0, 80); // Base outline color
        strokeWeight(1.5);
        let scoreHue = (200 + score * 0.2) % 360; // Score-based color
        fill(scoreHue, 80, 95);

        // --- Shape State Logic ---
        beginShape();
        if (this.shapeState === 0) { // Base Shape
            vertex(0, -this.size * 0.7); // Nose
            bezierVertex( this.size * 0.6, -this.size * 0.3, this.size * 0.7,  this.size * 0.0, this.size * 0.8,  this.size * 0.4); // Right wing
            bezierVertex( this.size * 0.4,  this.size * 0.6, -this.size * 0.4,  this.size * 0.6, -this.size * 0.8,  this.size * 0.4); // Bottom
            bezierVertex(-this.size * 0.7,  this.size * 0.0, -this.size * 0.6, -this.size * 0.3, 0, -this.size * 0.7); // Left wing
        } else { // Evolved Shape (State 1) - Example: Sharper, slightly larger
            let s = this.size * 1.1; // Slightly larger scale for evolved shape
            vertex(0, -s * 0.8); // Sharper nose
            bezierVertex( s * 0.7, -s * 0.2, s * 0.8,  s * 0.1, s * 0.9,  s * 0.5); // Sharper right wing
            bezierVertex( s * 0.5,  s * 0.7, -s * 0.5,  s * 0.7, -s * 0.9,  s * 0.5); // Wider bottom
            bezierVertex(-s * 0.8,  s * 0.1, -s * 0.7, -s * 0.2, 0, -s * 0.8); // Sharper left wing
        }
        endShape(CLOSE);

        // --- Draw Details (Panel Lines) ---
        strokeWeight(1);
        stroke(this.detailColor); // Dark grey detail color
        // Example lines (adjust based on shape)
        if (this.shapeState === 0) {
             line(-this.size * 0.4, -this.size * 0.1, -this.size * 0.6, this.size * 0.3); // Left wing detail
             line( this.size * 0.4, -this.size * 0.1,  this.size * 0.6, this.size * 0.3); // Right wing detail
        } else {
             let s = this.size * 1.1;
             line(-s * 0.5, -s * 0.05, -s * 0.7, s * 0.4); // Evolved Left wing detail
             line( s * 0.5, -s * 0.05,  s * 0.7, s * 0.4); // Evolved Right wing detail
             line(0, -s*0.4, 0, s*0.1); // Center line detail
        }


        // --- Draw Fins ---
        // Adjust fin position slightly based on shape state if needed
        let finYOffset = this.shapeState === 0 ? this.size * 0.3 : this.size * 1.1 * 0.35;
        let finXOffset = this.shapeState === 0 ? this.size * 0.5 : this.size * 1.1 * 0.6;
        let finTipX = this.shapeState === 0 ? this.size * 0.9 : this.size * 1.1 * 1.0;
        let finRearX = this.shapeState === 0 ? this.size * 0.6 : this.size * 1.1 * 0.7;
        let finRearY = this.shapeState === 0 ? this.size * 0.6 : this.size * 1.1 * 0.7;

        fill(this.finColor);
        stroke(0, 0, 60);
        strokeWeight(1);
        // Right Fin
        triangle( finXOffset, finYOffset, finTipX, finYOffset + this.size*0.1, finRearX, finRearY);
        // Left Fin
        triangle(-finXOffset, finYOffset, -finTipX, finYOffset + this.size*0.1, -finRearX, finRearY);


        // --- Draw Cockpit ---
        fill(this.cockpitColor);
        noStroke();
        ellipse(0, -this.size * 0.15, this.size * 0.4, this.size * 0.5);
        fill(0, 0, 100, 50); // Glare
        ellipse(0, -this.size * 0.2, this.size * 0.2, this.size * 0.25);

        pop();
     } // End of drawing condition (for blinking)
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
    // Use ship size for collision, shape change is visual only for now
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
