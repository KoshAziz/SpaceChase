// --- Features ---
// - Start Screen (Enter/Tap to Start)
// - Level System based on Points
// - Rainbow Bullets (Hue Cycling)
// - Ship Upgrade System (Automatic Cheapest, includes Auto-Fire) - Uses Money
// - Score-based Shield System (Gain shield charge every 50 points, max 1) - Uses Points
// - Redesigned Spaceship Look (Score-based color/shape, added details, thinner) - Uses Points
// - Dynamic Parallax Star Background (with occasional planet)
// - Enhanced Engine Thrust Effect (More reactive)
// - Asteroid Splitting
// - Player Lives (Max 3)
// - Simple Explosion Particles (Asteroid destruction + Bullet impact)
// - Score-based Difficulty Increase - Uses Levels + Time
// - Health Potions: Spawn randomly, restore 1 life on pickup (up to max).
// --- Modifications ---
// - Removed Name Input and Leaderboard system. // NEW
// - Implemented separate Points (milestones) and Money (upgrades) systems.
// - Upgrade costs reduced.
// - Asteroids only spawn from Top, Left, and Right edges.
// - Asteroid speed reduced (but now scales slightly with level).
// - Ship movement changed to free keyboard control (Arrows/WASD).
// - Spacebar tap-to-shoot always enabled; hold-to-shoot enabled via Auto-Fire upgrade.
// - Background gradient color changes every 10 seconds.
// - Ship no longer resets position on non-fatal hit.
// - Added brief invulnerability after losing a life.
// - Added Touch Controls: Tap to shoot and move towards tap.
// - Mobile Adjustments: Lower base asteroid spawn rate.
// - Max shield charges reduced to 1.
// - Asteroids visuals enhanced (shading, craters, rotation).
// - Added occasional background planet.
// --------------------------

// --- Game Objects & State ---
let ship;
let bullets = [];
let asteroids = [];
let particles = [];
let stars = [];
let potions = [];

// Game State Management
const GAME_STATE = { START_SCREEN: 0, PLAYING: 1, GAME_OVER: 2 };
let gameState = GAME_STATE.START_SCREEN;

// Score, Level & Resources
let points = 0;
let money = 0;
let lives = 3;
const MAX_LIVES = 3;
let currentLevel = 1;
const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 5000, 8000, 12000];

// Game Settings & Thresholds
let baseAsteroidSpawnRate;
let currentAsteroidSpawnRate;
let potionSpawnRate = 0.001;
let initialAsteroids = 5;
let minAsteroidSize = 15;
const SHIELD_POINTS_THRESHOLD = 50;
const MAX_SHIELD_CHARGES = 1;
const SHAPE_CHANGE_POINTS_THRESHOLD = 100;
// REMOVED: Leaderboard constants
const MAX_ASTEROID_SPEED = 4.0;

// --- UI & Messages ---
let infoMessage = "";
let infoMessageTimeout = 0;
// REMOVED: Name input elements and variables
// let nameInput;
// let submitButton;
// let playerName = "";
// let scoreSubmitted = false;

// --- Background ---
let currentTopColor;
let currentBottomColor;
const BACKGROUND_CHANGE_INTERVAL = 600;
let isMobile = false;

// --- Background Planet Variables ---
let planetVisible = false;
let planetPos;
let planetVel;
let planetSize;
let planetBaseColor;
let planetDetailColor1;
let planetDetailColor2;
let lastPlanetAppearanceTime = -Infinity;
const PLANET_MIN_INTERVAL = 30000;
const PLANET_MAX_INTERVAL = 60000;


// ==================
// p5.js Setup Function
// ==================
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  // Mobile Detection
  let ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
    isMobile = true;
  }
  // Base spawn rate set in resetGame/setDifficulty

  // Initialize background elements
  createStarfield(200);
  textAlign(CENTER, CENTER);
  textSize(20);
  currentTopColor = color(260, 80, 10);
  currentBottomColor = color(240, 70, 25);

  // REMOVED: Name Input & Submit Button creation

  // Wait in START_SCREEN state
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
        } while (ship && dist(startPos.x, startPos.y, shipX, shipY) < 150);
        asteroids.push(new Asteroid(startPos.x, startPos.y));
    }
}

function createParticles(x, y, count, particleColor, particleSize = null, particleSpeedMult = 1) {
    let baseHue = hue(particleColor);
    let baseSat = saturation(particleColor);
    let baseBri = brightness(particleColor);
    for (let i = 0; i < count; i++) {
        let pColor = color( baseHue + random(-10, 10), baseSat * random(0.8, 1.0), baseBri * random(0.9, 1.0), 100 );
        particles.push(new Particle(x, y, pColor, particleSize, particleSpeedMult));
    }
}

function createStarfield(numStars) { stars = []; for (let i = 0; i < numStars; i++) { stars.push(new Star()); } }

// REMOVED: Leaderboard Functions (getLeaderboard, saveToLeaderboard)
// REMOVED: submitScore function

// --- Function to set difficulty based on level ---
function setDifficultyForLevel(level) { let mobileFactor = isMobile ? 0.7 : 1.0; baseAsteroidSpawnRate = (0.009 + (level - 1) * 0.001) * mobileFactor; currentAsteroidSpawnRate = baseAsteroidSpawnRate; }


// ==================
// p5.js Draw Loop
// ==================
function draw() {
  // Background color change logic
  if (gameState !== GAME_STATE.START_SCREEN && frameCount > 0 && frameCount % BACKGROUND_CHANGE_INTERVAL === 0) {
      let topH = random(180, 300); let bottomH = (topH + random(20, 60)) % 360;
      currentTopColor = color(topH, random(70, 90), random(10, 20)); currentBottomColor = color(bottomH, random(60, 85), random(25, 40));
  }

  // Planet Appearance Logic
  if (gameState !== GAME_STATE.START_SCREEN) {
      let currentTime = millis();
      if (!planetVisible && currentTime - lastPlanetAppearanceTime > random(PLANET_MIN_INTERVAL, PLANET_MAX_INTERVAL)) {
          planetVisible = true; planetSize = random(width * 0.2, width * 0.5);
          let edge = floor(random(4));
          if (edge === 0) planetPos = createVector(random(width), -planetSize / 2); else if (edge === 1) planetPos = createVector(width + planetSize / 2, random(height)); else if (edge === 2) planetPos = createVector(random(width), height + planetSize / 2); else planetPos = createVector(-planetSize / 2, random(height));
          let targetPos = createVector(random(width * 0.2, width * 0.8), random(height * 0.2, height * 0.8)); planetVel = p5.Vector.sub(targetPos, planetPos); planetVel.normalize(); planetVel.mult(random(0.1, 0.4));
          let baseH = random(360); planetBaseColor = color(baseH, random(40, 70), random(50, 80)); planetDetailColor1 = color((baseH + random(20, 50)) % 360, random(50, 70), random(60, 90)); planetDetailColor2 = color((baseH + random(180, 220)) % 360, random(30, 60), random(40, 70));
          lastPlanetAppearanceTime = currentTime;
      }
      if (planetVisible) {
          planetPos.add(planetVel); let buffer = planetSize * 0.6;
          if (planetPos.x < -buffer || planetPos.x > width + buffer || planetPos.y < -buffer || planetPos.y > height + buffer) { planetVisible = false; }
      }
  }

  drawBackgroundAndStars(); // Draw background, planet, stars

  // --- Game State Machine ---
  switch (gameState) {
    case GAME_STATE.START_SCREEN:
      displayStartScreen();
      break;
    case GAME_STATE.PLAYING:
      runGameLogic();
      break;
    case GAME_STATE.GAME_OVER:
      runGameLogic(); // Still draw the game state behind the overlay
      displayGameOver();
      break;
  }

  // Display Info Messages
  if (infoMessageTimeout > 0) { displayInfoMessage(); if (gameState === GAME_STATE.PLAYING) { infoMessageTimeout--; } }
}

// --- Function for Start Screen ---
function displayStartScreen() {
    textSize(48); fill(50, 90, 100); textAlign(CENTER, CENTER); text("ASTEROID ATTACK", width/2, height/3);
    textSize(22); fill(0, 0, 100); let startInstruction = isMobile ? "Tap Screen to Start" : "Press Enter to Start"; text(startInstruction, width / 2, height / 2 + 50);
}


// --- Function for Main Game Logic ---
function runGameLogic() {
  ship.update(); ship.draw();
  for (let i = bullets.length - 1; i >= 0; i--) { bullets[i].update(); bullets[i].draw(); if (bullets[i].isOffscreen()) { bullets.splice(i, 1); } }
  for (let i = particles.length - 1; i >= 0; i--) { particles[i].update(); particles[i].draw(); if (particles[i].isDead()) { particles.splice(i, 1); } }
  handleAsteroidsAndCollisions();
  handlePotions();

  if (gameState === GAME_STATE.PLAYING) {
      let timeFactor = floor(frameCount / 1800) * 0.0005;
      currentAsteroidSpawnRate = baseAsteroidSpawnRate + timeFactor;
      if (random(1) < currentAsteroidSpawnRate && asteroids.length < 25) { asteroids.push(new Asteroid()); }
      if (random(1) < potionSpawnRate && potions.length < 2) { potions.push(new HealthPotion()); }
  }

  if (gameState === GAME_STATE.PLAYING) { displayHUD(); }
}

// ==================
// Collision Handling Functions
// ==================
function handleAsteroidsAndCollisions() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        if (!asteroids[i]) continue;
        if (gameState === GAME_STATE.PLAYING) { asteroids[i].update(); }
        asteroids[i].draw();

        let asteroidHitByBullet = false;
        if (gameState === GAME_STATE.PLAYING) {
            for (let j = bullets.length - 1; j >= 0; j--) {
                if (asteroids[i] && bullets[j] && asteroids[i].hits(bullets[j])) {
                    createParticles(bullets[j].pos.x, bullets[j].pos.y, 3, color(60, 60, 100), 2, 0.5);
                    let oldPoints = points;
                    let asteroidSizeValue = asteroids[i] ? asteroids[i].size : 50;
                    points += floor(map(asteroidSizeValue, minAsteroidSize, 80, 5, 15));
                    money += 2;
                    let shieldsToAdd = floor(points / SHIELD_POINTS_THRESHOLD) - floor(oldPoints / SHIELD_POINTS_THRESHOLD);
                    if (shieldsToAdd > 0 && ship.shieldCharges < MAX_SHIELD_CHARGES) { let actualAdded = ship.gainShields(shieldsToAdd); if (actualAdded > 0) { infoMessage = `+${actualAdded} SHIELD CHARGE(S)!`; infoMessageTimeout = 90; } }
                    let oldShapeLevel = floor(oldPoints / SHAPE_CHANGE_POINTS_THRESHOLD);
                    let newShapeLevel = floor(points / SHAPE_CHANGE_POINTS_THRESHOLD);
                    if (newShapeLevel > oldShapeLevel) { ship.changeShape(newShapeLevel); infoMessage = "SHIP SHAPE EVOLVED!"; infoMessageTimeout = 120; }
                    if (currentLevel < LEVEL_THRESHOLDS.length && points >= LEVEL_THRESHOLDS[currentLevel]) { currentLevel++; setDifficultyForLevel(currentLevel); infoMessage = `REACHED LEVEL ${currentLevel}!`; infoMessageTimeout = 150; }
                    let upgradedInLoop = true;
                    while (upgradedInLoop) { upgradedInLoop = false; let cost1 = ship.getUpgradeCost('fireRate'); let cost2 = ship.getUpgradeCost('spreadShot'); let cost3 = ship.getUpgradeCost('autoFire'); let numCost1 = (typeof cost1 === 'number') ? cost1 : Infinity; let numCost2 = (typeof cost2 === 'number') ? cost2 : Infinity; let numCost3 = (typeof cost3 === 'number') ? cost3 : Infinity; let cheapestCost = Math.min(numCost1, numCost2, numCost3); if (cheapestCost === Infinity || money < cheapestCost) break; if (numCost1 <= numCost2 && numCost1 <= numCost3) { if (money >= numCost1 && ship.attemptUpgrade('fireRate')) upgradedInLoop = true; } else if (numCost2 <= numCost1 && numCost2 <= numCost3) { if (money >= numCost2 && ship.attemptUpgrade('spreadShot')) upgradedInLoop = true; } else { if (money >= numCost3 && ship.attemptUpgrade('autoFire')) upgradedInLoop = true; } if (!upgradedInLoop) break; }
                    let currentAsteroid = asteroids[i]; let asteroidPos = currentAsteroid.pos.copy(); let asteroidColor = currentAsteroid.color;
                    asteroids.splice(i, 1); bullets.splice(j, 1); asteroidHitByBullet = true;
                    createParticles(asteroidPos.x, asteroidPos.y, floor(asteroidSizeValue / 3), asteroidColor);
                    if (asteroidSizeValue > minAsteroidSize * 2) { let newSize = asteroidSizeValue * 0.6; let splitSpeedMultiplier = random(0.8, 2.0); let vel1 = p5.Vector.random2D().mult(splitSpeedMultiplier); let vel2 = p5.Vector.random2D().mult(splitSpeedMultiplier); asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel1)); asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel2)); }
                    break;
                }
            }
        }

        if (asteroidHitByBullet) continue;

        if (gameState === GAME_STATE.PLAYING && ship.invulnerableTimer <= 0 && asteroids[i] && asteroids[i].hitsShip(ship)) {
            if (ship.shieldCharges > 0) { ship.loseShield(); createParticles(ship.pos.x, ship.pos.y, 25, color(180, 80, 100)); createParticles(asteroids[i].pos.x, asteroids[i].pos.y, floor(asteroids[i].size / 3), asteroids[i].color); asteroids.splice(i, 1); }
            else { lives--; createParticles(ship.pos.x, ship.pos.y, 30, color(0, 80, 100)); if (lives <= 0) { gameState = GAME_STATE.GAME_OVER; infoMessage = ""; infoMessageTimeout = 0; cursor(ARROW); } else { ship.setInvulnerable(); createParticles(asteroids[i].pos.x, asteroids[i].pos.y, floor(asteroids[i].size / 3), asteroids[i].color); asteroids.splice(i, 1); } }
        }
    }
}

function handlePotions() {
    for (let i = potions.length - 1; i >= 0; i--) {
        if (gameState === GAME_STATE.PLAYING) { potions[i].update(); }
        potions[i].draw();
        if (gameState === GAME_STATE.PLAYING && potions[i].hitsShip(ship)) { if (lives < MAX_LIVES) { lives++; infoMessage = "+1 LIFE!"; infoMessageTimeout = 90; } else { points += 25; infoMessage = "+25 POINTS (MAX LIVES)!"; infoMessageTimeout = 90; } potions.splice(i, 1); }
        else if (potions[i].isOffscreen()) { potions.splice(i, 1); }
    }
}

// ==================
// Background Drawing Function
// ==================
function drawBackgroundAndStars() {
    for(let y=0; y < height; y++){ let inter = map(y, 0, height, 0, 1); let c = lerpColor(currentTopColor, currentBottomColor, inter); stroke(c); line(0, y, width, y); } noStroke();
    if (planetVisible) { drawPlanet(); }
    for (let star of stars) { star.update(); star.draw(); }
}

function drawPlanet() {
    push(); translate(planetPos.x, planetPos.y); noStroke();
    fill(planetBaseColor); ellipse(0, 0, planetSize, planetSize);
    fill(planetDetailColor1); arc(0, 0, planetSize, planetSize, PI * 0.1, PI * 0.6, OPEN); arc(0, 0, planetSize * 0.8, planetSize * 0.8, PI * 0.7, PI * 1.2, OPEN);
    fill(planetDetailColor2); arc(0, 0, planetSize * 0.9, planetSize * 0.9, PI * 1.3, PI * 1.9, OPEN);
    noFill(); strokeWeight(planetSize * 0.05); stroke(hue(planetBaseColor), 20, 100, 15); ellipse(0, 0, planetSize * 1.05, planetSize * 1.05);
    pop();
}

// ==================
// Display Functions
// ==================
function displayHUD() {
  let hudTextSize = 18;
  textSize(hudTextSize);
  fill(0, 0, 100, 80);
  noStroke();
  textAlign(LEFT, TOP);
  text("Points: " + points, 15, 15);
  text(`Money: $${money}`, 15, 40);
  text(`Lives: ${lives} / ${MAX_LIVES}`, 15, 65);
  text(`Shields: ${ship.shieldCharges} / ${MAX_SHIELD_CHARGES}`, 15, 90);
  text(`Level: ${currentLevel}`, 15, 115);
  textAlign(RIGHT, TOP);
  fill(0, 0, 100, 80);
  text(`Rate Lvl: ${ship.fireRateLevel}/${ship.maxLevel}`, width - 15, 15);
  text(`Spread Lvl: ${ship.spreadShotLevel}/${ship.maxLevel}`, width - 15, 40);
  text(`Auto-Fire: ${ship.autoFireLevel > 0 ? 'ON' : 'OFF'}`, width - 15, 65);
}

function displayInfoMessage() { fill(0, 0, 100); textSize(16); textAlign(CENTER, BOTTOM); text(infoMessage, width / 2, height - 20); }

// MODIFIED: Simplified Game Over screen (no name input/leaderboard)
function displayGameOver() {
    fill(0, 0, 0, 50); rect(0, 0, width, height);
    fill(0, 90, 100); textSize(60); textAlign(CENTER, CENTER); text("GAME OVER", width / 2, height / 3);
    fill(0, 0, 100); textSize(30); text("Final Points: " + points, width / 2, height / 3 + 60);
    textAlign(CENTER, CENTER); textSize(22); let pulse = map(sin(frameCount * 0.1), -1, 1, 60, 100); fill(0, 0, pulse); text("Click or Tap to Restart", width / 2, height * 0.7);
    cursor(ARROW);
}

// MODIFIED: Resets game state for restarting
function resetGame() {
    ship = new Ship();
    bullets = []; particles = []; asteroids = []; potions = [];
    points = 0; money = 0; lives = 3;
    currentLevel = 1;
    setDifficultyForLevel(currentLevel);
    // scoreSubmitted = false; // Removed
    spawnInitialAsteroids();
    currentTopColor = color(260, 80, 10); currentBottomColor = color(240, 70, 25);
    frameCount = 0; infoMessage = ""; infoMessageTimeout = 0;
    // nameInput.hide(); // Removed
    // submitButton.hide(); // Removed
    cursor();
    lastPlanetAppearanceTime = -Infinity;
    planetVisible = false;
    // gameState = GAME_STATE.PLAYING; // State is set by the function calling resetGame
}

// --- Function to start the game ---
function startGame() {
    resetGame(); // Setup initial game state
    gameState = GAME_STATE.PLAYING; // Change state to playing
}


// ==================
// Input Handling Functions
// MODIFIED: Simplified restart logic
// ==================
function mousePressed() {
  if (gameState === GAME_STATE.GAME_OVER) {
     // Click anywhere on game over to restart
     startGame();
  } else if (gameState === GAME_STATE.PLAYING) {
    ship.shoot();
  }
}

function keyPressed() {
    if (gameState === GAME_STATE.START_SCREEN) {
        if (keyCode === ENTER || keyCode === RETURN) {
            startGame();
        }
    } else if (gameState === GAME_STATE.PLAYING) {
        if (keyCode === 32) { // SPACEBAR for shooting
            ship.shoot();
            return false;
        }
    } else if (gameState === GAME_STATE.GAME_OVER) {
         // Any key press restarts on game over
         startGame();
    }
}

function touchStarted() {
    if (gameState === GAME_STATE.START_SCREEN) {
        startGame();
        return false;
    } else if (gameState === GAME_STATE.GAME_OVER) {
         // Tap anywhere on game over to restart
         startGame();
        return false;
    } else if (gameState === GAME_STATE.PLAYING) {
        ship.shoot(); // Tap shoots in game
        return false;
    }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createStarfield(200);
  // REMOVED: Positioning logic for removed input/button
  if (ship) {
      // ship.resetPosition(); // Optionally reset ship pos on resize
  }
}


// ==================
// Ship Class
// ==================
class Ship {
  constructor() { this.pos = createVector(width / 2, height - 50); this.vel = createVector(0, 0); this.thrust = 0.3; this.touchThrustMultiplier = 1.1; this.friction = 0.98; this.maxSpeed = 7; this.size = 30; this.cockpitColor = color(180, 100, 100); this.engineColor1 = color(30, 100, 100); this.engineColor2 = color(0, 100, 100); this.finColor = color(220, 60, 70); this.detailColor = color(0, 0, 60); this.shapeState = 0; this.shootCooldown = 0; this.baseShootDelay = 15; this.shootDelayPerLevel = 2; this.shieldCharges = 0; this.shieldVisualRadius = this.size * 1.1; this.invulnerableTimer = 0; this.invulnerabilityDuration = 120; this.maxLevel = 5; this.fireRateLevel = 0; this.spreadShotLevel = 0; this.autoFireLevel = 0; this.maxAutoFireLevel = 1; this.baseUpgradeCost = 30; this.costMultiplier = 2.0; this.autoFireCost = 50; }
  gainShields(amount) { let currentCharges = this.shieldCharges; this.shieldCharges = min(this.shieldCharges + amount, MAX_SHIELD_CHARGES); return this.shieldCharges - currentCharges; }
  loseShield() { if (this.shieldCharges > 0) { this.shieldCharges--; } }
  setInvulnerable() { this.invulnerableTimer = this.invulnerabilityDuration; }
  changeShape(level) { this.shapeState = (level % 2); }
  get currentShootDelay() { return max(3, this.baseShootDelay - (this.fireRateLevel * this.shootDelayPerLevel)); }
  getUpgradeCost(upgradeType) { let level; if (upgradeType === 'fireRate') { level = this.fireRateLevel; if (level >= this.maxLevel) return "MAX"; return floor(this.baseUpgradeCost * pow(this.costMultiplier, level)); } else if (upgradeType === 'spreadShot') { level = this.spreadShotLevel; if (level >= this.maxLevel) return "MAX"; return floor(this.baseUpgradeCost * pow(this.costMultiplier, level)); } else if (upgradeType === 'autoFire') { level = this.autoFireLevel; if (level >= this.maxAutoFireLevel) return "MAX"; return this.autoFireCost; } else { return Infinity; } }
  attemptUpgrade(upgradeType) { let cost = this.getUpgradeCost(upgradeType); if (typeof cost !== 'number') return false; let currentLevel, maxLevelForType; let upgradeName = upgradeType.replace(/([A-Z])/g, ' $1').toUpperCase(); if (upgradeType === 'fireRate') { currentLevel = this.fireRateLevel; maxLevelForType = this.maxLevel; } else if (upgradeType === 'spreadShot') { currentLevel = this.spreadShotLevel; maxLevelForType = this.maxLevel; } else if (upgradeType === 'autoFire') { currentLevel = this.autoFireLevel; maxLevelForType = this.maxAutoFireLevel; } else { return false; } if (currentLevel < maxLevelForType && money >= cost) { money -= cost; if (upgradeType === 'fireRate') this.fireRateLevel++; else if (upgradeType === 'spreadShot') this.spreadShotLevel++; else if (upgradeType === 'autoFire') this.autoFireLevel++; if (infoMessageTimeout <= 0) { infoMessage = `${upgradeName} UPGRADED!`; if (upgradeType !== 'autoFire') { infoMessage += ` (Lvl ${currentLevel + 1})`; } infoMessageTimeout = 120; } return true; } else { return false; } }
  resetUpgrades() { this.fireRateLevel = 0; this.spreadShotLevel = 0; this.autoFireLevel = 0; }
  resetPosition() { this.pos.set(width / 2, height - 50); this.vel.set(0, 0); this.invulnerableTimer = 0; this.shapeState = 0; }
  update() { if (this.invulnerableTimer > 0) { this.invulnerableTimer--; } if (this.autoFireLevel > 0 && keyIsDown(32)) { this.shoot(); } let isTouching = touches.length > 0; if (isTouching) { let touchPos = createVector(touches[0].x, touches[0].y); let direction = p5.Vector.sub(touchPos, this.pos); if (direction.magSq() > 1) { direction.normalize(); this.vel.add(direction.mult(this.thrust * this.touchThrustMultiplier)); } } else { let movingUp = keyIsDown(UP_ARROW) || keyIsDown(87); let movingDown = keyIsDown(DOWN_ARROW) || keyIsDown(83); let movingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65); let movingRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68); if (movingUp) { this.vel.y -= this.thrust; } if (movingDown) { this.vel.y += this.thrust; } if (movingLeft) { this.vel.x -= this.thrust; } if (movingRight) { this.vel.x += this.thrust; } } this.vel.mult(this.friction); this.vel.limit(this.maxSpeed); this.pos.add(this.vel); let margin = this.size * 0.7; this.pos.x = constrain(this.pos.x, margin, width - margin); this.pos.y = constrain(this.pos.y, margin, height - margin); if (this.shootCooldown > 0) { this.shootCooldown--; } }
  shoot() { if (this.shootCooldown <= 0) { let bulletX = this.pos.x; let bulletY = this.pos.y - this.size * 0.6; let numShots = 1; let spreadAngle = 0; if (this.spreadShotLevel >= 1 && this.spreadShotLevel <= 2) { numShots = 3; spreadAngle = PI / 20; } else if (this.spreadShotLevel >= 3 && this.spreadShotLevel <= 4) { numShots = 3; spreadAngle = PI / 15; } else if (this.spreadShotLevel >= this.maxLevel) { numShots = 5; spreadAngle = PI / 12; } for (let i = 0; i < numShots; i++) { let angle = 0; if (numShots > 1) { angle = map(i, 0, numShots - 1, -spreadAngle, spreadAngle); } bullets.push(new Bullet(bulletX, bulletY, angle)); } this.shootCooldown = this.currentShootDelay; } }
  draw() { if (this.invulnerableTimer <= 0 || (this.invulnerableTimer > 0 && frameCount % 10 < 5) ) { push(); translate(this.pos.x, this.pos.y); if (this.shieldCharges > 0) { let shieldAlpha = map(sin(frameCount * 0.15), -1, 1, 40, 80); let shieldHue = 180; fill(shieldHue, 80, 100, shieldAlpha); noStroke(); ellipse(0, 0, this.shieldVisualRadius * 2, this.shieldVisualRadius * 2); strokeWeight(1.5); stroke(shieldHue, 90, 100, shieldAlpha + 30); noFill(); ellipse(0, 0, this.shieldVisualRadius * 2, this.shieldVisualRadius * 2); } let enginePulseFactor = 1.0 + this.vel.mag() * 0.3; let enginePulse = map(sin(frameCount * 0.2), -1, 1, 0.8, 1.2) * enginePulseFactor; let engineSize = this.size * 0.5 * enginePulse; let engineBrightness = map(sin(frameCount * 0.3), -1, 1, 80, 100); noStroke(); for (let i = engineSize * 1.5; i > 0; i -= 3) { let alpha = map(i, 0, engineSize * 1.5, 0, 30); fill(hue(this.engineColor2), 100, engineBrightness, alpha); ellipse(0, this.size * 0.5, i, i * 1.5); } fill(hue(this.engineColor1), 100, 100); ellipse(0, this.size * 0.5, engineSize * 0.6, engineSize * 1.2); stroke(0, 0, 80); strokeWeight(1.5); let pointsHue = (200 + points * 0.2) % 360; fill(pointsHue, 80, 95); let bodyWidthFactor = 0.6; beginShape(); if (this.shapeState === 0) { vertex(0, -this.size * 0.7); bezierVertex( this.size * bodyWidthFactor * 0.8, -this.size * 0.3, this.size * bodyWidthFactor * 0.9,  this.size * 0.0, this.size * bodyWidthFactor * 1.0,  this.size * 0.4); bezierVertex( this.size * bodyWidthFactor * 0.5,  this.size * 0.6, -this.size * bodyWidthFactor * 0.5,  this.size * 0.6, -this.size * bodyWidthFactor * 1.0,  this.size * 0.4); bezierVertex(-this.size * bodyWidthFactor * 0.9,  this.size * 0.0, -this.size * bodyWidthFactor * 0.8, -this.size * 0.3, 0, -this.size * 0.7); } else { let s = this.size * 1.1; let evolvedWidthFactor = bodyWidthFactor * 1.1; vertex(0, -s * 0.8); bezierVertex( s * evolvedWidthFactor * 0.8, -s * 0.2, s * evolvedWidthFactor * 0.9,  s * 0.1, s * evolvedWidthFactor * 1.0,  s * 0.5); bezierVertex( s * evolvedWidthFactor * 0.5,  s * 0.7, -s * evolvedWidthFactor * 0.5,  s * 0.7, -s * evolvedWidthFactor * 1.0,  s * 0.5); bezierVertex(-s * evolvedWidthFactor * 0.9,  s * 0.1, -s * evolvedWidthFactor * 0.8, -s * 0.2, 0, -s * 0.8); } endShape(CLOSE); strokeWeight(1); stroke(this.detailColor); if (this.shapeState === 0) { line(-this.size * bodyWidthFactor * 0.5, -this.size * 0.1, -this.size * bodyWidthFactor * 0.75, this.size * 0.3); line( this.size * bodyWidthFactor * 0.5, -this.size * 0.1,  this.size * bodyWidthFactor * 0.75, this.size * 0.3); } else { let s = this.size * 1.1; let ewf = bodyWidthFactor * 1.1; line(-s * ewf * 0.6, -s * 0.05, -s * ewf * 0.8, s * 0.4); line( s * ewf * 0.6, -s * 0.05,  s * ewf * 0.8, s * 0.4); line(0, -s*0.4, 0, s*0.1); } let finYOffset = this.shapeState === 0 ? this.size * 0.3 : this.size * 1.1 * 0.35; let finXBase = this.shapeState === 0 ? this.size * bodyWidthFactor * 0.6 : this.size * 1.1 * bodyWidthFactor * 1.1 * 0.7; let finTipX = this.shapeState === 0 ? this.size * bodyWidthFactor * 1.1 : this.size * 1.1 * bodyWidthFactor * 1.1 * 1.1; let finRearX = this.shapeState === 0 ? this.size * bodyWidthFactor * 0.75 : this.size * 1.1 * bodyWidthFactor * 1.1 * 0.8; let finRearY = this.shapeState === 0 ? this.size * 0.6 : this.size * 1.1 * 0.7; fill(this.finColor); stroke(0, 0, 60); strokeWeight(1); triangle( finXBase, finYOffset, finTipX, finYOffset + this.size*0.1, finRearX, finRearY); triangle(-finXBase, finYOffset, -finTipX, finYOffset + this.size*0.1, -finRearX, finRearY); fill(this.cockpitColor); noStroke(); ellipse(0, -this.size * 0.15, this.size * 0.4, this.size * 0.5); fill(0, 0, 100, 50); ellipse(0, -this.size * 0.2, this.size * 0.2, this.size * 0.25); pop(); } }
}

// ==================
// Bullet Class
// ==================
class Bullet {
  constructor(x, y, angle = 0) { this.pos = createVector(x, y); this.speed = 16; this.size = 5; this.startHue = frameCount % 360; this.hue = this.startHue; let baseAngle = -PI / 2; this.vel = p5.Vector.fromAngle(baseAngle + angle); this.vel.mult(this.speed); }
  update() { this.pos.add(this.vel); this.hue = (this.hue + 4) % 360; }
  draw() { fill(this.hue, 90, 100); stroke(0, 0, 100); strokeWeight(1); ellipse(this.pos.x, this.pos.y, this.size, this.size * 2.5); }
  isOffscreen() { let margin = this.size * 3; return (this.pos.y < -margin || this.pos.y > height + margin || this.pos.x < -margin || this.pos.x > width + margin); }
}

// ==================
// Asteroid Class
// ==================
class Asteroid {
  constructor(x, y, size, vel) { this.size = size || random(30, 80); this.pos = createVector(); let isInitialPlacement = (x !== undefined && y !== undefined); if (isInitialPlacement) { this.pos.x = x; this.pos.y = y; } else { let edge = floor(random(3)); if (edge === 0) { this.pos.x = random(width); this.pos.y = -this.size / 2; } else if (edge === 1) { this.pos.x = width + this.size / 2; this.pos.y = random(height * 0.7); } else { this.pos.x = -this.size / 2; this.pos.y = random(height * 0.7); } } if (vel) { this.vel = vel; } else { let baseSpeedMin = 0.6 + (currentLevel - 1) * 0.1; let baseSpeedMax = 1.8 + (currentLevel - 1) * 0.2; this.speed = min(MAX_ASTEROID_SPEED, random(baseSpeedMin, baseSpeedMax)) * (this.size > 50 ? 0.9 : 1.1); if (isInitialPlacement) { this.vel = p5.Vector.random2D(); } else { let targetX = width / 2 + random(-width * 0.25, width * 0.25); let targetY = height / 2 + random(-height * 0.25, height * 0.25); let direction = createVector(targetX - this.pos.x, targetY - this.pos.y); direction.normalize(); direction.rotate(random(-PI / 12, PI / 12)); this.vel = direction; } this.vel.mult(this.speed); } this.color = color(random(20, 50), random(30, 70), random(30, 60)); this.rotation = random(TWO_PI); this.rotationSpeed = random(-0.025, 0.025); this.rotationAccel = 0.0001; this.vertices = []; let numVertices = floor(random(8, 16)); for (let i = 0; i < numVertices; i++) { let angleOffset = map(i, 0, numVertices, 0, TWO_PI); let r = this.size / 2 + random(-this.size * 0.4, this.size * 0.3); let v = p5.Vector.fromAngle(angleOffset); v.mult(r); this.vertices.push(v); } this.craters = []; let numCraters = floor(random(2, 6)); for (let i = 0; i < numCraters; i++) { let angle = random(TWO_PI); let radius = random(this.size * 0.1, this.size * 0.35); let craterSize = random(this.size * 0.1, this.size * 0.25); let craterPos = p5.Vector.fromAngle(angle).mult(radius); this.craters.push({ pos: craterPos, size: craterSize }); } }
  update() { this.pos.add(this.vel); this.rotationSpeed += random(-this.rotationAccel, this.rotationAccel); this.rotationSpeed = constrain(this.rotationSpeed, -0.05, 0.05); this.rotation += this.rotationSpeed; let buffer = this.size; if (this.pos.x < -buffer) this.pos.x = width + buffer; if (this.pos.x > width + buffer) this.pos.x = -buffer; if (this.pos.y < -buffer) this.pos.y = height + buffer; if (this.pos.y > height + buffer) this.pos.y = -buffer; }
  draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); let mainBri = brightness(this.color); let mainSat = saturation(this.color); let mainHue = hue(this.color); let highlightColor = color(mainHue, mainSat * 0.8, mainBri * 1.2); fill(highlightColor); noStroke(); beginShape(); for (let v of this.vertices) { vertex(v.x - 1, v.y - 1); } endShape(CLOSE); let shadowColor = color(mainHue, mainSat * 1.1, mainBri * 0.7); fill(shadowColor); noStroke(); beginShape(); for (let v of this.vertices) { vertex(v.x + 1, v.y + 1); } endShape(CLOSE); fill(this.color); stroke(mainHue, mainSat * 0.5, mainBri * random(1.3, 1.7)); strokeWeight(1.5); beginShape(); for (let v of this.vertices) { vertex(v.x, v.y); } endShape(CLOSE); noStroke(); fill(hue(this.color), saturation(this.color)*0.8, brightness(this.color) * 0.5, 80); for (let crater of this.craters) { ellipse(crater.pos.x, crater.pos.y, crater.size, crater.size * random(0.8, 1.2)); } pop(); }
  hits(bullet) { let d = dist(this.pos.x, this.pos.y, bullet.pos.x, bullet.pos.y); return d < this.size / 2 + bullet.size / 2; }
  hitsShip(ship) { let targetX = ship.pos.x; let targetY = ship.pos.y; let targetRadius = ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5; let d = dist(this.pos.x, this.pos.y, targetX, targetY); return d < this.size / 2 + targetRadius; }
}

// ==================
// Particle Class
// ==================
class Particle {
  constructor(x, y, particleColor, size = null, speedMult = 1) { this.pos = createVector(x, y); this.vel = p5.Vector.random2D(); this.vel.mult(random(1.5, 5) * speedMult); this.lifespan = 100; this.baseHue = hue(particleColor); this.baseSat = saturation(particleColor); this.baseBri = brightness(particleColor); this.size = size !== null ? size : random(2, 6); }
  update() { this.pos.add(this.vel); this.lifespan -= 3; this.vel.mult(0.97); }
  draw() { noStroke(); fill(this.baseHue, this.baseSat, this.baseBri, this.lifespan); ellipse(this.pos.x, this.pos.y, this.size); }
  isDead() { return this.lifespan <= 0; }
}

// ==================
// Star Class
// ==================
class Star {
    constructor() { this.x = random(width); this.y = random(height); this.layer = floor(random(3)); this.size = map(this.layer, 0, 2, 0.5, 2.5); this.speed = map(this.layer, 0, 2, 0.1, 0.5); this.brightness = random(60, 100); }
    update() { this.y += this.speed; if (this.y > height + this.size) { this.y = -this.size; this.x = random(width); } }
    draw() { fill(0, 0, this.brightness); noStroke(); ellipse(this.x, this.y, this.size); }
}

// ==================
// HealthPotion Class
// ==================
class HealthPotion {
    constructor(x, y) { this.pos = createVector(x || random(width * 0.1, width * 0.9), y || -30); this.vel = createVector(0, random(0.5, 1.5)); this.size = 20; this.bodyWidth = this.size * 0.6; this.bodyHeight = this.size * 0.8; this.neckWidth = this.size * 0.3; this.neckHeight = this.size * 0.4; this.rotation = 0; this.rotationSpeed = random(-0.01, 0.01); }
    update() { this.pos.add(this.vel); this.rotation += this.rotationSpeed; }
    draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); fill(0, 85, 90); noStroke(); rect(-this.bodyWidth / 2, -this.bodyHeight / 2, this.bodyWidth, this.bodyHeight, 3); rect(-this.neckWidth / 2, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth, this.neckHeight); ellipse(0, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth * 1.2, this.neckWidth * 0.4); fill(0, 0, 100); rectMode(CENTER); rect(0, 0, this.bodyWidth * 0.5, this.bodyWidth * 0.15); rect(0, 0, this.bodyWidth * 0.15, this.bodyWidth * 0.5); rectMode(CORNER); pop(); }
    hitsShip(ship) { let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y); return d < this.size / 2 + ship.size * 0.5; }
    isOffscreen() { let margin = this.size * 2; return (this.pos.y > height + margin); }
}
