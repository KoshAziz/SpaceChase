// --- Features ---
// - Start Screen (Enter/Tap to Start) - Title "Space-Chase" + Dynamic // MODIFIED (Size, Effect, Color)
// - Level System based on Points
// - Rainbow Bullets (Hue Cycling)
// - Ship Upgrade System (Manual Purchase in Shop, includes Auto-Fire) - Uses Money // MODIFIED (Manual Shop)
// - Score-based Shield System (Gain shield charge every 50 points, max 1) - Uses Points
// - Redesigned Spaceship Look (Score-based color/shape, added details, thinner) - Uses Points
// - Dynamic Parallax Star Background (with occasional planet, galaxy, black hole) // MODIFIED (Twinkle)
// - Enhanced Engine Thrust Effect (More reactive)
// - Asteroid Splitting
// - Player Lives (Max 3)
// - Simple Explosion Particles (Asteroid destruction + Bullet impact) // MODIFIED (Variation)
// - Score-based Difficulty Increase - Uses Levels + Time // MODIFIED (Spawn Rate & Max Count)
// - Health Potions: Spawn randomly, restore 1 life on pickup (up to max).
// - Simple Enemy Ships that shoot at the player (No Auto-Aim). // MODIFIED (Appearance: Black Ship, Slight Drift)
// - Temporary Power-Ups (Temp Shield, Rapid Fire, EMP Burst)
// - Visual Nebula Clouds in background
// - ADDED: Pause Functionality (Press ESC during gameplay)
// - ADDED: Upgrade Shop Screen between levels // NEW FEATURE
// --- Modifications ---
// - Removed Name Input and Leaderboard system.
// - Implemented separate Points (milestones) and Money (upgrades) systems.
// - Upgrade costs reduced.
// - Asteroids only spawn from Top, Left, and Right edges.
// - Asteroid speed reduced (but now scales slightly with level). // MODIFIED (More Variation)
// - Ship movement changed to free keyboard control (Arrows/WASD).
// - Spacebar tap-to-shoot always enabled; hold-to-shoot enabled via Auto-Fire upgrade.
// - Background gradient color changes every 20 seconds.
// - Ship no longer resets position on non-fatal hit.
// - Added brief invulnerability after losing a life.
// - Added Touch Controls: Tap to shoot and move towards tap.
// - Mobile Adjustments: Lower base asteroid spawn rate.
// - Max shield charges reduced to 1.
// - Asteroids visuals enhanced (shading, craters, rotation). // MODIFIED (Rotation Variation)
// - Added occasional background planet.
// - Added subtle background galaxy effect.
// - Added distant black hole effect.
// - REMOVED BOSS FIGHT MECHANICS
// - Increased Ship Speed
// - Increased Asteroid Spawn Rate Scaling & Max Asteroid Count per Level
// - Added subtle screen shake on life loss.
// - Changed Title Color Order & Darkened Red
// - Removed automatic cheapest upgrade on level up. // MODIFIED
// - Added simple sideways drift to enemy movement. // NEW "Cool Stuff"
// - Added sound effect placeholder comments. // NEW "Cool Stuff"
// - Added upgrade purchase particle effect. // NEW "Cool Stuff"
// - Added distinct shop background. // NEW "Cool Stuff"
// --------------------------

// --- Game Objects & State ---
let ship;
let bullets = [];
let asteroids = [];
let particles = [];
let stars = [];
let potions = [];
let enemyShips = [];
let enemyBullets = [];
let powerUps = [];
let nebulas = [];

// Game State Management
const GAME_STATE = { START_SCREEN: 0, PLAYING: 1, GAME_OVER: 2, UPGRADE_SHOP: 3 }; // <-- ADDED UPGRADE_SHOP
let gameState = GAME_STATE.START_SCREEN;
let isPaused = false;

// Power-Up Types
const POWERUP_TYPES = { TEMP_SHIELD: 0, RAPID_FIRE: 1, EMP_BURST: 2 };
const NUM_POWERUP_TYPES = 3;

// Score, Level & Resources
let points = 0;
let money = 0;
let lives = 3;
const MAX_LIVES = 3;
let currentLevel = 1;
const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 5000, 7500, 10500]; // Points needed to START the next level

// Game Settings & Thresholds
let baseAsteroidSpawnRate;
let currentAsteroidSpawnRate;
let baseEnemySpawnRate;
let currentEnemySpawnRate;
let powerUpSpawnRate = 0.0015;
let potionSpawnRate = 0.001;
let nebulaSpawnRate = 0.0005;
let initialAsteroids = 5;
let minAsteroidSize = 15;
const SHIELD_POINTS_THRESHOLD = 50;
const MAX_SHIELD_CHARGES = 1;
const SHAPE_CHANGE_POINTS_THRESHOLD = 100;
const MAX_ASTEROID_SPEED = 4.0;
const MAX_ENEMY_SPEED = 3.0;

// --- UI & Messages ---
let infoMessage = "";
let infoMessageTimeout = 0;
let shopButtons = []; // For upgrade shop interactions
let levelTransitionFlash = 0; // For visual feedback when starting next level

// --- Background ---
let currentTopColor;
let currentBottomColor;
const BACKGROUND_CHANGE_INTERVAL = 1200; // ~20 seconds at 60fps
let isMobile = false;

// --- Background Scenery Variables ---
let planetVisible = false;
let planetPos, planetVel, planetSize, planetBaseColor, planetDetailColor1, planetDetailColor2;
let lastPlanetAppearanceTime = -Infinity;
const PLANET_MIN_INTERVAL = 30000; // 30 seconds
const PLANET_MAX_INTERVAL = 60000; // 60 seconds

// --- Screen Shake Variables ---
let screenShakeIntensity = 0;
let screenShakeDuration = 0;

// ==================
// p5.js Setup Function
// ==================
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  // Basic mobile detection
  let ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) { isMobile = true; }

  createStarfield(200); // Initialize stars
  textAlign(CENTER, CENTER);
  textSize(20); // Default text size

  // Initialize background colors
  currentTopColor = color(260, 80, 10); // Dark blue/purple
  currentBottomColor = color(240, 70, 25); // Slightly lighter blue
}

// ==================
// Helper Functions
// ==================
// Spawn initial asteroids away from the player start area
function spawnInitialAsteroids() { asteroids = []; for (let i = 0; i < initialAsteroids; i++) { let startPos; let shipX = ship ? ship.pos.x : width / 2; let shipY = ship ? ship.pos.y : height - 50; do { startPos = createVector(random(width), random(height * 0.7)); } while (ship && dist(startPos.x, startPos.y, shipX, shipY) < 150); asteroids.push(new Asteroid(startPos.x, startPos.y)); } }
// Create explosion/impact particles
function createParticles(x, y, count, particleColor, particleSize = null, particleSpeedMult = 1) { let baseHue = hue(particleColor); let baseSat = saturation(particleColor); let baseBri = brightness(particleColor); for (let i = 0; i < count; i++) { let pColor = color( baseHue + random(-10, 10), baseSat * random(0.8, 1.0), baseBri * random(0.9, 1.0), 100 ); particles.push(new Particle(x, y, pColor, particleSize, particleSpeedMult)); } }
// Initialize the starfield
function createStarfield(numStars) { stars = []; for (let i = 0; i < numStars; i++) { stars.push(new Star()); } }
// Set difficulty parameters based on the current level
function setDifficultyForLevel(level) { let mobileFactor = isMobile ? 0.7 : 1.0; baseAsteroidSpawnRate = (0.009 + (level - 1) * 0.0015) * mobileFactor; currentAsteroidSpawnRate = baseAsteroidSpawnRate; baseEnemySpawnRate = (0.002 + (level - 1) * 0.0005) * mobileFactor; currentEnemySpawnRate = baseEnemySpawnRate; }
// Define buttons for the upgrade shop
function setupShopButtons() { shopButtons = []; let buttonWidth = 200; let buttonHeight = 50; let startY = height / 2 - 100; let spacing = 70; shopButtons.push({ id: 'fireRate', x: width / 2 - buttonWidth / 2, y: startY, w: buttonWidth, h: buttonHeight }); shopButtons.push({ id: 'spreadShot', x: width / 2 - buttonWidth / 2, y: startY + spacing, w: buttonWidth, h: buttonHeight }); shopButtons.push({ id: 'autoFire', x: width / 2 - buttonWidth / 2, y: startY + spacing * 2, w: buttonWidth, h: buttonHeight }); shopButtons.push({ id: 'nextLevel', x: width / 2 - buttonWidth / 2, y: startY + spacing * 3 + 20, w: buttonWidth, h: buttonHeight }); }

// ==================
// p5.js Draw Loop
// ==================
function draw() {
  // Background color change logic (runs even when paused/in shop)
  if (gameState !== GAME_STATE.START_SCREEN && frameCount > 0 && frameCount % BACKGROUND_CHANGE_INTERVAL === 0) { let topH = random(180, 300); let bottomH = (topH + random(20, 60)) % 360; currentTopColor = color(topH, random(70, 90), random(10, 20)); currentBottomColor = color(bottomH, random(60, 85), random(25, 40)); }

  // Background Scenery Update Logic (runs even when paused/in shop)
  if (gameState !== GAME_STATE.START_SCREEN) { let currentTime = millis(); if (!planetVisible && currentTime - lastPlanetAppearanceTime > random(PLANET_MIN_INTERVAL, PLANET_MAX_INTERVAL)) { planetVisible = true; planetSize = random(width * 0.2, width * 0.5); let edge = floor(random(4)); if (edge === 0) planetPos = createVector(random(width), -planetSize / 2); else if (edge === 1) planetPos = createVector(width + planetSize / 2, random(height)); else if (edge === 2) planetPos = createVector(random(width), height + planetSize / 2); else planetPos = createVector(-planetSize / 2, random(height)); let targetPos = createVector(random(width * 0.2, width * 0.8), random(height * 0.2, height * 0.8)); planetVel = p5.Vector.sub(targetPos, planetPos); planetVel.normalize(); planetVel.mult(random(0.1, 0.3)); let baseH = random(360); planetBaseColor = color(baseH, random(40, 70), random(50, 80)); planetDetailColor1 = color((baseH + random(20, 50)) % 360, random(50, 70), random(60, 90)); planetDetailColor2 = color((baseH + random(180, 220)) % 360, random(30, 60), random(40, 70)); lastPlanetAppearanceTime = currentTime; } if (planetVisible) { planetPos.add(planetVel); let buffer = planetSize * 0.6; if (planetPos.x < -buffer || planetPos.x > width + buffer || planetPos.y < -buffer || planetPos.y > height + buffer) { planetVisible = false; } } }

  // Draw background elements first
  drawBackgroundAndStars(); // Includes Nebulas

  // Apply Screen Shake
  push();
  if (screenShakeDuration > 0) {
      translate(random(-screenShakeIntensity, screenShakeIntensity), random(-screenShakeIntensity, screenShakeIntensity));
  }

  // Game State Machine
  switch (gameState) {
    case GAME_STATE.START_SCREEN:
        displayStartScreen();
        break;
    case GAME_STATE.PLAYING:
        runGameLogic(); // Checks internally if paused
        if (isPaused) { displayPauseScreen(); }
        break;
    case GAME_STATE.UPGRADE_SHOP: // <-- NEW STATE
        displayUpgradeShop();
        break;
    case GAME_STATE.GAME_OVER:
        runGameLogic(); // Draw final frame elements
        displayGameOver();
        break;
  }

  // Info Messages (Draws on top, even when paused if timeout active)
  if (infoMessageTimeout > 0) {
      displayInfoMessage();
      if (gameState === GAME_STATE.PLAYING && !isPaused) { // Only decrement timer if playing and not paused
           infoMessageTimeout--;
      } else if (gameState === GAME_STATE.UPGRADE_SHOP) {
           infoMessageTimeout--; // Decrement in shop too
      }
   }

   // Level Transition Flash
   if (levelTransitionFlash > 0) {
       fill(0, 0, 100, levelTransitionFlash * 10); // White flash
       rect(0, 0, width, height);
       levelTransitionFlash--;
   }

  pop(); // End screen shake transformation
}

// --- Function for Start Screen ---
function displayStartScreen() { let titleText = "Space-Chase"; let titleSize = 64; textSize(titleSize); textAlign(CENTER, CENTER); let totalWidth = textWidth(titleText); let startX = width / 2 - totalWidth / 2; let currentX = startX; let titleY = height / 3; for (let i = 0; i < titleText.length; i++) { let char = titleText[i]; let charWidth = textWidth(char); let yOffset = sin(frameCount * 0.08 + i * 0.6) * 6; fill(0, 0, 0, 40); text(char, currentX + charWidth / 2 + 3, titleY + yOffset + 3); if (i % 2 === 0) { fill(0, 0, 100); } else { fill(0, 100, 75); } text(char, currentX + charWidth / 2, titleY + yOffset); currentX += charWidth; } textSize(22); fill(0, 0, 100); textAlign(CENTER, CENTER); let startInstruction = isMobile ? "Tap Screen to Start" : "Press Enter to Start"; text(startInstruction, width / 2, height / 2 + 50); }

// --- Function for Pause Screen ---
function displayPauseScreen() {
    fill(0, 0, 0, 50); // Black with 50% alpha overlay
    rect(0, 0, width, height);
    // Draw "PAUSED" text
    fill(0, 0, 100); // White
    textSize(64); // Larger Pause Text
    textAlign(CENTER, CENTER);
    text("PAUSED", width / 2, height / 2 - 20);
    textSize(22); // Reset size
    text("Press ESC to Resume", width / 2, height / 2 + 40);
}

// --- Function for Upgrade Shop Screen ---
function displayUpgradeShop() {
    // Simple background for the shop
    fill(240, 50, 15, 90); // Semi-transparent dark blue
    rect(0, 0, width, height);

    fill(0, 0, 100);
    textSize(48);
    textAlign(CENTER, TOP);
    text(`Level ${currentLevel} Complete!`, width / 2, 50);
    textSize(32);
    text("Upgrade Shop", width / 2, 110);

    textSize(24);
    textAlign(CENTER, TOP);
    text(`Money: $${money}`, width / 2, 160);

    // Draw Buttons and Info
    textSize(16);
    textAlign(CENTER, CENTER);
    for (let button of shopButtons) {
        let cost = "?";
        let label = "";
        let isMaxed = false;
        let canAfford = false;
        let currentLevelText = "";

        if (button.id === 'fireRate') {
            cost = ship.getUpgradeCost('fireRate');
            isMaxed = (cost === "MAX");
            if (!isMaxed) canAfford = (money >= cost);
            currentLevelText = `Lvl ${ship.fireRateLevel}/${ship.maxLevel}`;
            label = `Fire Rate ${currentLevelText}`;
        } else if (button.id === 'spreadShot') {
            cost = ship.getUpgradeCost('spreadShot');
            isMaxed = (cost === "MAX");
            if (!isMaxed) canAfford = (money >= cost);
            currentLevelText = `Lvl ${ship.spreadShotLevel}/${ship.maxLevel}`;
            label = `Spread Shot ${currentLevelText}`;
        } else if (button.id === 'autoFire') {
            cost = ship.getUpgradeCost('autoFire');
            isMaxed = (cost === "MAX");
             if (!isMaxed) canAfford = (money >= cost);
             currentLevelText = ship.autoFireLevel > 0 ? 'ON' : 'OFF';
            label = `Auto-Fire (${currentLevelText})`;
        } else if (button.id === 'nextLevel') {
            label = `Start Level ${currentLevel + 1}`;
            isMaxed = false; // Always available
            canAfford = true; // No cost
        }

        // Button Appearance
        let buttonColor = color(200, 70, 50); // Default button blue
        let textColor = color(0, 0, 100); // White text

        if (button.id !== 'nextLevel') {
            if (isMaxed) {
                buttonColor = color(0, 0, 50); // Greyed out if maxed
                textColor = color(0, 0, 80);
                label += " (MAX)";
            } else if (!canAfford) {
                buttonColor = color(0, 70, 40); // Reddish if cannot afford
                textColor = color(0, 0, 90);
                label += ` ($${cost})`;
            } else {
                 buttonColor = color(120, 70, 50); // Green if affordable
                 label += ` ($${cost})`;
            }
        } else {
             buttonColor = color(90, 70, 60); // Start level button color (e.g., green)
        }


        fill(buttonColor);
        stroke(0, 0, 80);
        strokeWeight(2);
        rect(button.x, button.y, button.w, button.h, 5); // Rounded corners

        fill(textColor);
        noStroke();
        text(label, button.x + button.w / 2, button.y + button.h / 2);
    }
}

// --- Function for Main Game Logic (ADDED Pause Check) ---
function runGameLogic() {
  // --- ADDED: Exit if paused ---
  if (isPaused) {
      // Still draw existing things if needed, but don't update logic
      if (ship) ship.draw(); // Draw ship in paused state
      for (let b of bullets) b.draw();
      for (let p of particles) p.draw(); // Particles will freeze
      for (let a of asteroids) a.draw();
      for (let e of enemyShips) e.draw();
      for (let eb of enemyBullets) eb.draw();
      for (let pt of potions) pt.draw();
      for (let pu of powerUps) pu.draw();
      displayHUD(); // Show HUD even when paused
      return; // Stop further execution of game logic
  }
  // --- End Pause Check ---

  if (!ship) return; // Should not happen in PLAYING state, but safety check

  // Update game state timers (moved here so they pause)
  if (screenShakeDuration > 0) screenShakeDuration--;
  if (screenShakeDuration <= 0) screenShakeIntensity = 0;

  // Update & Draw player ship, bullets, particles
  ship.update(); ship.draw(); // Ship update includes powerup timer decrements
  for (let i = bullets.length - 1; i >= 0; i--) { bullets[i].update(); bullets[i].draw(); if (bullets[i].isOffscreen()) { bullets.splice(i, 1); } }
  for (let i = particles.length - 1; i >= 0; i--) { particles[i].update(); particles[i].draw(); if (particles[i].isDead()) { particles.splice(i, 1); } }

  // Update & Draw Enemies and Enemy Bullets
  for (let i = enemyShips.length - 1; i >= 0; i--) { enemyShips[i].update(); enemyShips[i].draw(); if (enemyShips[i].isOffscreen()) { enemyShips.splice(i, 1); } }
  for (let i = enemyBullets.length - 1; i >= 0; i--) { enemyBullets[i].update(); enemyBullets[i].draw(); if (enemyBullets[i].isOffscreen()) { enemyBullets.splice(i, 1); } }

  // Update & Draw Asteroids
  for (let i = asteroids.length - 1; i >= 0; i--) { if (!asteroids[i]) continue; asteroids[i].update(); asteroids[i].draw(); }

  // Update & Draw PowerUps
  for (let i = powerUps.length - 1; i >= 0; i--) { powerUps[i].update(); powerUps[i].draw(); if (powerUps[i].isOffscreen()) { powerUps.splice(i, 1); } }

  // Update & Draw Potions (handled in handlePotions)
   handlePotions(); // Update and draw potions, handle pickup

  // Handle Collisions & Pickups
  handleCollisions();
  handlePowerUps(); // Handle powerup pickup

  // Spawning Logic
  if (gameState === GAME_STATE.PLAYING) {
      // Increase spawn rates slightly over time within a level
      let timeFactor = floor(frameCount / 1800) * 0.0005; // Increases every 30 seconds
      currentAsteroidSpawnRate = baseAsteroidSpawnRate + timeFactor;
      currentEnemySpawnRate = baseEnemySpawnRate + timeFactor * 0.5;

      // Calculate maximum allowed entities based on level
      let maxAsteroidsAllowed = min(40, 15 + currentLevel * 3); // Caps at 40
      let maxEnemiesAllowed = min(8, 2 + floor(currentLevel / 2)); // Caps at 8
      let maxPotionsAllowed = 2;
      let maxPowerUpsAllowed = 1;
      let maxNebulasAllowed = 2; // Max background nebulas

      // Spawn Asteroids
      if (random(1) < currentAsteroidSpawnRate && asteroids.length < maxAsteroidsAllowed) {
          asteroids.push(new Asteroid());
      }
      // Spawn Enemies
      if (random(1) < currentEnemySpawnRate && enemyShips.length < maxEnemiesAllowed) {
          enemyShips.push(new EnemyShip());
      }
      // Spawn Potions
      if (random(1) < potionSpawnRate && potions.length < maxPotionsAllowed) {
          potions.push(new HealthPotion());
      }
      // Spawn PowerUps
      if (random(1) < powerUpSpawnRate && powerUps.length < maxPowerUpsAllowed) {
          let type = floor(random(NUM_POWERUP_TYPES));
          powerUps.push(new PowerUp(type));
      }
      // Spawn Nebulas (background element)
       if (random(1) < nebulaSpawnRate && nebulas.length < maxNebulasAllowed) {
           nebulas.push(new Nebula());
       }
  }

  // Display Heads Up Display
  if (gameState === GAME_STATE.PLAYING) { displayHUD(); }
}

// ==================
// Collision / Pickup Handling Functions
// ==================

// Handle PowerUp Pickup
function handlePowerUps() {
    if (gameState !== GAME_STATE.PLAYING || !ship || isPaused) return;
    for (let i = powerUps.length - 1; i >= 0; i--) {
        if (powerUps[i].hitsShip(ship)) {
            let powerUpType = powerUps[i].type;
            let pickupPos = powerUps[i].pos.copy(); // Position for particles
            powerUps.splice(i, 1); // Remove powerup

            switch (powerUpType) {
                case POWERUP_TYPES.TEMP_SHIELD:
                    ship.tempShieldActive = true;
                    infoMessage = "TEMPORARY SHIELD!";
                    createParticles(pickupPos.x, pickupPos.y, 20, color(45, 90, 100)); // Yellow particles
                     // TODO: Play powerup sound (Shield)
                    break;
                case POWERUP_TYPES.RAPID_FIRE:
                    ship.rapidFireTimer = 300; // 5 seconds at 60fps
                    infoMessage = "RAPID FIRE!";
                    createParticles(pickupPos.x, pickupPos.y, 20, color(120, 90, 100)); // Green particles
                    // TODO: Play powerup sound (Rapid Fire)
                    break;
                case POWERUP_TYPES.EMP_BURST:
                    infoMessage = "EMP BURST!";
                    createParticles(ship.pos.x, ship.pos.y, 50, color(210, 100, 100), 10, 3); // Large blue burst at ship
                    // Clear asteroids
                    for (let k = asteroids.length - 1; k >= 0; k--) {
                        createParticles(asteroids[k].pos.x, asteroids[k].pos.y, 10, asteroids[k].color);
                    }
                    asteroids = [];
                     // Clear enemy ships
                    for (let k = enemyShips.length - 1; k >= 0; k--) {
                        createParticles(enemyShips[k].pos.x, enemyShips[k].pos.y, 15, color(300, 80, 90));
                    }
                    enemyShips = [];
                     // TODO: Play powerup sound (EMP)
                    break;
            }
            infoMessageTimeout = 120; // Show message for 2 seconds
        }
    }
}

// Handle Bullet Hits, Player Damage, and Level Progression
function handleCollisions() {
    if (gameState !== GAME_STATE.PLAYING || !ship || isPaused) return;

    // --- Player Bullet Collisions ---
    // Bullets vs Asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        if (!asteroids[i]) continue; // Skip if somehow undefined (safety)
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (asteroids[i] && bullets[j] && asteroids[i].hits(bullets[j])) {
                // TODO: Play asteroid hit sound

                let impactParticleCount = floor(random(2, 5));
                createParticles(bullets[j].pos.x, bullets[j].pos.y, impactParticleCount, color(60, 60, 100), 2, 0.5); // Small grey impact spark

                let oldPoints = points;
                let asteroidSizeValue = asteroids[i] ? asteroids[i].size : 50; // Store size before splice
                points += floor(map(asteroidSizeValue, minAsteroidSize, 80, 5, 15)); // More points for bigger asteroids
                money += 2; // Gain money for upgrades

                // Check for Shield Point Threshold
                let shieldsToAdd = floor(points / SHIELD_POINTS_THRESHOLD) - floor(oldPoints / SHIELD_POINTS_THRESHOLD);
                if (shieldsToAdd > 0 && ship.shieldCharges < MAX_SHIELD_CHARGES) {
                    let actualAdded = ship.gainShields(shieldsToAdd);
                    if (actualAdded > 0) {
                        infoMessage = `+${actualAdded} SHIELD CHARGE(S)!`;
                        infoMessageTimeout = 90;
                         // TODO: Play shield gain sound
                    }
                }

                 // Check for Ship Shape Change Threshold
                let oldShapeLevel = floor(oldPoints / SHAPE_CHANGE_POINTS_THRESHOLD);
                let newShapeLevel = floor(points / SHAPE_CHANGE_POINTS_THRESHOLD);
                if (newShapeLevel > oldShapeLevel) {
                     ship.changeShape(newShapeLevel);
                     infoMessage = "SHIP SHAPE EVOLVED!";
                     infoMessageTimeout = 120;
                     // TODO: Play ship evolve sound
                 }


                // Asteroid Destruction & Splitting
                let currentAsteroid = asteroids[i];
                let asteroidPos = currentAsteroid.pos.copy();
                let asteroidColor = currentAsteroid.color;
                asteroids.splice(i, 1); // Remove asteroid
                bullets.splice(j, 1);   // Remove bullet
                createParticles(asteroidPos.x, asteroidPos.y, floor(asteroidSizeValue / 3), asteroidColor); // Explosion particles
                 // TODO: Play asteroid explosion sound

                // Split asteroid if large enough
                if (asteroidSizeValue > minAsteroidSize * 2) {
                     let newSize = asteroidSizeValue * 0.6;
                     let splitSpeedMultiplier = random(0.8, 2.0);
                     let vel1 = p5.Vector.random2D().mult(splitSpeedMultiplier);
                     let vel2 = p5.Vector.random2D().mult(splitSpeedMultiplier);
                     asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel1));
                     asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel2));
                }

                 // Check for Level Up (AFTER processing the hit)
                if (currentLevel < LEVEL_THRESHOLDS.length && points >= LEVEL_THRESHOLDS[currentLevel]) {
                     // --- LEVEL UP! ---
                     // TODO: Play level up fanfare sound
                     points += 100 * currentLevel; // Bonus points
                     money += 25 * currentLevel; // Bonus money

                     // --- Transition to Upgrade Shop ---
                     gameState = GAME_STATE.UPGRADE_SHOP;
                     infoMessage = `Level ${currentLevel} Cleared!`;
                     infoMessageTimeout = 180; // Show message longer
                     setupShopButtons(); // Prepare shop UI elements
                     cursor(ARROW); // Show cursor in shop

                     // Clear bullets and enemies for the shop screen (optional, but cleaner)
                     bullets = [];
                     enemyShips = [];
                     enemyBullets = [];
                     powerUps = []; // Clear leftover powerups
                     potions = []; // Clear leftover potions

                     return; // Exit collision check early as we're changing state
                 }


                break; // Bullet hit one asteroid, stop checking this bullet
            }
        } // End bullet loop
    } // End asteroid loop

    // Bullets vs Enemy Ships
    for (let i = enemyShips.length - 1; i >= 0; i--) {
        if (!enemyShips[i]) continue;
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (enemyShips[i] && bullets[j] && enemyShips[i].hits(bullets[j])) {
                 // TODO: Play enemy hit/explosion sound
                points += 20;
                money += 5;
                createParticles(enemyShips[i].pos.x, enemyShips[i].pos.y, 15, color(300, 80, 90), 3, 1.2); // Enemy explosion particles
                enemyShips.splice(i, 1); // Remove enemy
                bullets.splice(j, 1);    // Remove bullet
                break; // Bullet hit one enemy, stop checking this bullet
            }
        }
    }


    // --- Player Ship Collisions ---
    if (ship.invulnerableTimer <= 0) { // Check collisions only if not invulnerable

        // Helper function to handle taking damage
        const takeDamage = (sourceObject, sourceArray, index) => {
            let gameOver = false;
             // TODO: Play damage/shield hit sound

            if (ship.tempShieldActive) { // Check temporary shield first
                ship.tempShieldActive = false;
                createParticles(ship.pos.x, ship.pos.y, 30, color(45, 100, 100)); // Yellow shield burst
                infoMessage = "TEMPORARY SHIELD LOST!";
                infoMessageTimeout = 90;
                // Don't remove source object, shield absorbed it
                if (sourceObject && sourceArray && index !== undefined) {
                     if (sourceObject instanceof EnemyBullet) { // Bullets disappear on shield hit
                         sourceArray.splice(index, 1);
                     }
                }

            } else if (ship.shieldCharges > 0) { // Check regular shields
                ship.loseShield();
                createParticles(ship.pos.x, ship.pos.y, 25, color(180, 80, 100)); // Cyan shield burst
                // Don't remove source object if it's an asteroid/ship, shield absorbed it
                // Remove enemy bullets even if shield absorbs
                 if (sourceObject && sourceArray && index !== undefined) {
                     if (sourceObject instanceof EnemyBullet) {
                         sourceArray.splice(index, 1);
                     }
                 }

            } else { // No shields, take hull damage
                 // TODO: Play hull damage/life lost sound
                lives--;
                createParticles(ship.pos.x, ship.pos.y, 30, color(0, 80, 100)); // Red explosion
                screenShakeIntensity = 5; // Add screen shake
                screenShakeDuration = 15;

                if (lives <= 0) { // Check for Game Over
                    gameState = GAME_STATE.GAME_OVER;
                     // TODO: Play game over sound
                    infoMessage = ""; // Clear any pending messages
                    infoMessageTimeout = 0;
                    cursor(ARROW); // Show cursor on game over
                    gameOver = true;
                } else {
                    ship.setInvulnerable(); // Grant brief invulnerability
                }

                 // Remove the colliding object (asteroid, enemy ship, enemy bullet)
                 if (sourceObject && sourceArray && index !== undefined) {
                    let explosionColor = sourceObject.color || color(0,0,50);
                    let particleCount = sourceObject.size ? floor(sourceObject.size / 2) : 15;
                    if (sourceObject instanceof EnemyShip) { explosionColor = color(300, 80, 90); particleCount = 15; }
                    else if (sourceObject instanceof EnemyBullet) { explosionColor = color(300, 80, 90); particleCount = 5; }
                    createParticles(sourceObject.pos.x, sourceObject.pos.y, particleCount, explosionColor);
                    sourceArray.splice(index, 1);
                 }
            }


            return gameOver; // Return true if game ended
        };

        // Check Asteroid Collisions with Ship
        for (let i = asteroids.length - 1; i >= 0; i--) {
            if (asteroids[i] && asteroids[i].hitsShip(ship)) {
                if (takeDamage(asteroids[i], asteroids, i)) return; // Game Over, exit
                break; // Only handle one collision per frame
            }
        }

        // Check Enemy Ship Collisions with Ship
        for (let i = enemyShips.length - 1; i >= 0; i--) {
             if (enemyShips[i] && enemyShips[i].hitsShip(ship)) {
                 if (takeDamage(enemyShips[i], enemyShips, i)) return; // Game Over, exit
                 break; // Only handle one collision per frame
            }
        }

        // Check Enemy Bullet Collisions with Ship
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
             if (enemyBullets[i] && enemyBullets[i].hitsShip(ship)) {
                 if (takeDamage(enemyBullets[i], enemyBullets, i)) return; // Game Over, exit
                 break; // Only handle one collision per frame
            }
        }
    } // End invulnerability check
}

// Handle Health Potion Pickup and Drawing
function handlePotions() {
    if (gameState !== GAME_STATE.PLAYING || isPaused) {
        // Still draw existing potions if paused
        for (let i = potions.length - 1; i >= 0; i--) {
            potions[i].draw();
        }
        return;
    }

    for (let i = potions.length - 1; i >= 0; i--) {
        potions[i].update();
        potions[i].draw();

        if (potions[i].hitsShip(ship)) {
            // TODO: Play potion pickup sound
            if (lives < MAX_LIVES) {
                lives++;
                infoMessage = "+1 LIFE!";
                infoMessageTimeout = 90;
            } else {
                points += 25; // Give points if at max lives
                infoMessage = "+25 POINTS (MAX LIVES)!";
                infoMessageTimeout = 90;
            }
            potions.splice(i, 1); // Remove potion
        } else if (potions[i].isOffscreen()) {
            potions.splice(i, 1); // Remove if offscreen
        }
    }
}


// ==================
// Drawing Functions
// ==================

// Draw Background Gradient, Stars, Nebulas, and Scenery
function drawBackgroundAndStars() {
    // Draw Gradient Background
    for(let y=0; y < height; y++){
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(currentTopColor, currentBottomColor, inter);
        stroke(c);
        line(0, y, width, y);
    }
    noStroke();

    // Update and Draw Nebulas
    for (let i = nebulas.length - 1; i >= 0; i--) {
        if (gameState === GAME_STATE.PLAYING && !isPaused) nebulas[i].update(); // Only update if playing and not paused
        nebulas[i].draw();
        if (nebulas[i].isOffscreen()) {
            nebulas.splice(i, 1);
        }
    }

    // Draw Distant Scenery
    drawBlackHole();
    drawGalaxy();
    if (planetVisible) { drawPlanet(); }

    // Update and Draw Stars
    for (let star of stars) {
        if (gameState === GAME_STATE.PLAYING && !isPaused) star.update(); // Only update if playing and not paused
        star.draw();
    }
}

// Draw distant black hole effect
function drawBlackHole() {
    push();
    let bhX = width * 0.8; // Position
    let bhY = height * 0.2;
    let bhSize = width * 0.05; // Base size

    // Black center
    fill(0);
    noStroke();
    ellipse(bhX, bhY, bhSize, bhSize);

    // Accretion disk / lensing effect (subtle)
    let ringCount = 5;
    let maxRingSize = bhSize * 3;
    let minRingSize = bhSize * 1.1;
    noFill();
    for (let i = 0; i < ringCount; i++) {
        let size = lerp(minRingSize, maxRingSize, i / (ringCount - 1));
        let hue = random(0, 60); // Yellow/Orange hues
        let alpha = map(i, 0, ringCount - 1, 40, 5); // Fainter outer rings
        let sw = map(i, 0, ringCount - 1, 1, 4); // Thicker inner rings
        strokeWeight(sw);
        stroke(hue, 90, 90, alpha);
        ellipse(bhX, bhY, size * random(0.95, 1.05), size * random(0.95, 1.05)); // Slightly irregular shape
    }
    pop();
}

// Draw distant galaxy effect
function drawGalaxy() {
    push();
    let centerX = width / 2;
    let centerY = height / 2;
    let baseHue1 = 270; // Purple
    let baseHue2 = 200; // Cyan
    let alphaVal = 2; // Very transparent
    let angle = frameCount * 0.0003; // Slow rotation

    translate(centerX, centerY);
    rotate(angle);
    translate(-centerX, -centerY); // Rotate around center

    noStroke();
    // Draw multiple layered ellipses for galaxy arms
    fill(baseHue1, 50, 60, alphaVal);
    ellipse(centerX - width * 0.1, centerY - height * 0.1, width * 1.2, height * 0.3);
    fill(baseHue2, 60, 70, alphaVal);
    ellipse(centerX + width * 0.15, centerY + height * 0.05, width * 1.1, height * 0.4);
    fill((baseHue1 + baseHue2) / 2, 55, 65, alphaVal * 0.8); // Blend color
    ellipse(centerX, centerY, width * 0.9, height * 0.5);
    pop();
}

// Draw the occasional planet
function drawPlanet() {
    push();
    translate(planetPos.x, planetPos.y);
    noStroke();

    // Base planet color
    fill(planetBaseColor);
    ellipse(0, 0, planetSize, planetSize);

    // Add some detail using arcs
    fill(planetDetailColor1);
    arc(0, 0, planetSize, planetSize, PI * 0.1, PI * 0.6, OPEN);
    arc(0, 0, planetSize * 0.8, planetSize * 0.8, PI * 0.7, PI * 1.2, OPEN);
    fill(planetDetailColor2);
    arc(0, 0, planetSize * 0.9, planetSize * 0.9, PI * 1.3, PI * 1.9, OPEN);

    // Add a subtle atmospheric ring
    noFill();
    strokeWeight(planetSize * 0.05);
    stroke(hue(planetBaseColor), 20, 100, 15); // Faint whiteish ring
    ellipse(0, 0, planetSize * 1.05, planetSize * 1.05);
    pop();
}

// Display Heads Up Display (Score, Lives, etc.)
function displayHUD() {
    let hudTextSize = 18;
    textSize(hudTextSize);
    fill(0, 0, 100, 80); // Semi-transparent white
    noStroke();

    // Left Aligned Info
    textAlign(LEFT, TOP);
    text("Points: " + points, 15, 15);
    text(`Money: $${money}`, 15, 40);
    text(`Lives: ${lives} / ${MAX_LIVES}`, 15, 65);
    text(`Shields: ${ship.shieldCharges} / ${MAX_SHIELD_CHARGES}`, 15, 90);
    text(`Level: ${currentLevel}`, 15, 115);

    // Right Aligned Info (Upgrades)
    textAlign(RIGHT, TOP);
    fill(0, 0, 100, 80);
    text(`Rate Lvl: ${ship.fireRateLevel}/${ship.maxLevel}`, width - 15, 15);
    text(`Spread Lvl: ${ship.spreadShotLevel}/${ship.maxLevel}`, width - 15, 40);
    text(`Auto-Fire: ${ship.autoFireLevel > 0 ? 'ON' : 'OFF'}`, width - 15, 65);
}

// Display temporary info messages (Powerups, Shields, etc.)
function displayInfoMessage() {
    fill(0, 0, 100); // White
    textSize(16);
    textAlign(CENTER, BOTTOM);
    text(infoMessage, width / 2, height - 20);
}

// Display Game Over Screen
function displayGameOver() {
    fill(0, 0, 0, 50); // Dark overlay
    rect(0, 0, width, height);

    fill(0, 90, 100); // Red
    textSize(60);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 3);

    fill(0, 0, 100); // White
    textSize(30);
    text("Final Points: " + points, width / 2, height / 3 + 60);
    // Could add Final Level Reached here too

    textAlign(CENTER, CENTER);
    textSize(22);
    // Pulsing text effect
    let pulse = map(sin(frameCount * 0.1), -1, 1, 60, 100);
    fill(0, 0, pulse); // White, pulsing brightness
    let restartInstruction = isMobile ? "Tap Screen to Restart" : "Click or Press Enter to Restart";
    text(restartInstruction, width / 2, height * 0.7);
    cursor(ARROW); // Ensure cursor is visible
}


// ==================
// Game State Control Functions
// ==================

// Reset game variables to initial state
function resetGame() {
    ship = new Ship(); // Create a new ship (resets upgrades too)
    bullets = [];
    particles = [];
    asteroids = [];
    potions = [];
    enemyShips = [];
    enemyBullets = [];
    powerUps = [];
    nebulas = []; // Reset background elements too

    points = 0;
    money = 0; // Start with 0 money
    lives = 3;
    currentLevel = 1; // Start at level 1
    setDifficultyForLevel(currentLevel); // Set initial difficulty

    // Reset background colors
    currentTopColor = color(260, 80, 10);
    currentBottomColor = color(240, 70, 25);
    lastPlanetAppearanceTime = -Infinity; // Reset planet timer
    planetVisible = false;

    frameCount = 0; // Reset frameCount for effects? (optional)
    infoMessage = "";
    infoMessageTimeout = 0;
    screenShakeDuration = 0;
    screenShakeIntensity = 0;
    isPaused = false; // Ensure not paused
    levelTransitionFlash = 0;

    cursor(); // Use default game cursor (or hide if needed)
    spawnInitialAsteroids(); // Spawn starting asteroids
}

// Start a new game
function startGame() {
    resetGame();
    gameState = GAME_STATE.PLAYING;
}

// Proceed to the next level from the shop
function startNextLevel() {
    if (gameState !== GAME_STATE.UPGRADE_SHOP) return; // Only works from shop

    currentLevel++;
    setDifficultyForLevel(currentLevel);

    // Reset ship position and clear hazards for the new level
    ship.resetPositionForNewLevel(); // Keep upgrades, reset pos/invuln
    asteroids = []; // Clear any remaining asteroids (optional)
    // Keep particles? They should fade out.
    // Keep nebulas? They are background.

    frameCount = 0; // Reset frame count for level timing? (optional)
    infoMessage = `Starting Level ${currentLevel}`;
    infoMessageTimeout = 90;
    levelTransitionFlash = 10; // Start white flash effect

    // Spawn some initial asteroids for the new level
    spawnInitialAsteroids();

    gameState = GAME_STATE.PLAYING; // Back to the action
    cursor(); // Hide cursor again for gameplay
}


// ==================
// Input Handling Functions
// ==================

// Handle Mouse Clicks
function mousePressed() {
    if (gameState === GAME_STATE.START_SCREEN) {
        startGame();
    } else if (gameState === GAME_STATE.PLAYING && !isPaused) {
        ship.shoot();
         // TODO: Play shoot sound
    } else if (gameState === GAME_STATE.UPGRADE_SHOP) {
        // Check shop button clicks
        for (let button of shopButtons) {
            if (mouseX > button.x && mouseX < button.x + button.w &&
                mouseY > button.y && mouseY < button.y + button.h) {
                handleShopButtonPress(button.id);
                break; // Handle only one button press per click
            }
        }
    } else if (gameState === GAME_STATE.GAME_OVER) {
        startGame();
    }
}

// Handle Keyboard Presses
function keyPressed() {
    if (keyCode === ESCAPE && gameState === GAME_STATE.PLAYING) {
        isPaused = !isPaused; // Toggle pause only during gameplay
        if (isPaused) cursor(ARROW); else cursor(); // Show/hide cursor on pause
    } else if (gameState === GAME_STATE.START_SCREEN) {
        if (keyCode === ENTER || keyCode === RETURN) {
            startGame();
        }
    } else if (gameState === GAME_STATE.PLAYING && !isPaused) {
        // Allow shooting with spacebar (prevent default browser scroll)
        if (keyCode === 32) { // Spacebar
            ship.shoot();
            // TODO: Play shoot sound
            return false; // Prevent default browser behavior
        }
    } else if (gameState === GAME_STATE.UPGRADE_SHOP) {
         // Allow pressing Enter to start next level?
         if (keyCode === ENTER || keyCode === RETURN) {
             handleShopButtonPress('nextLevel');
         }
    } else if (gameState === GAME_STATE.GAME_OVER) {
        if (keyCode === ENTER || keyCode === RETURN) {
            startGame();
        }
    }
}

// Handle Touch Input
function touchStarted() {
    if (touches.length === 0) return false; // Safety check
    let touchX = touches[0].x;
    let touchY = touches[0].y;

    if (gameState === GAME_STATE.START_SCREEN) {
        startGame();
        return false; // Consume touch event
    } else if (gameState === GAME_STATE.GAME_OVER) {
        startGame();
        return false; // Consume touch event
    } else if (gameState === GAME_STATE.UPGRADE_SHOP) {
         // Check shop button touches
         for (let button of shopButtons) {
             if (touchX > button.x && touchX < button.x + button.w &&
                 touchY > button.y && touchY < button.y + button.h) {
                 handleShopButtonPress(button.id);
                 return false; // Consume touch event
             }
         }
         return false; // Don't process movement touches in shop
    } else if (gameState === GAME_STATE.PLAYING && !isPaused) {
        // In gameplay, touch controls movement (in ship.update) AND shooting
        ship.shoot();
        // TODO: Play shoot sound
        return false; // Consume touch event to prevent multi-actions
    }
    return false; // Default prevent default
}

// Handle Shop Button Logic
function handleShopButtonPress(buttonId) {
    if (gameState !== GAME_STATE.UPGRADE_SHOP) return;

    if (buttonId === 'nextLevel') {
        startNextLevel();
        // TODO: Play UI confirm/next level sound
    } else {
        // Attempt upgrade
        let success = ship.attemptUpgrade(buttonId);
        if (success) {
             // TODO: Play upgrade success sound
             // Add particle effect at button location? or ship location? Let's try button.
             let button = shopButtons.find(b => b.id === buttonId);
             if(button) {
                  createParticles(button.x + button.w / 2, button.y + button.h / 2, 15, color(120, 80, 100), 5, 1.5); // Greenish particles
             }
             // Update info message maybe? Ship.attemptUpgrade already does.
        } else {
            // TODO: Play UI error/cannot afford sound (optional)
            // Maybe flash the money display red briefly?
            let cost = ship.getUpgradeCost(buttonId);
            if (cost !== "MAX" && money < cost) {
                infoMessage = "Not enough money!";
                infoMessageTimeout = 60;
            } else if (cost === "MAX") {
                 infoMessage = "Upgrade Maxed Out!";
                 infoMessageTimeout = 60;
            }
        }
    }
}


// Handle Window Resizing
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    createStarfield(200); // Recreate stars for new size
    if (gameState === GAME_STATE.UPGRADE_SHOP) {
        setupShopButtons(); // Reposition shop buttons on resize
    }
}


// ==================
// Ship Class
// ==================
class Ship {
    constructor() {
        this.pos = createVector(width / 2, height - 50);
        this.vel = createVector(0, 0);
        this.thrust = 0.38; // Acceleration force
        this.touchThrustMultiplier = 1.1; // Slightly more responsive touch movement
        this.friction = 0.98; // Slows down ship naturally
        this.maxSpeed = 9; // Maximum velocity
        this.size = 30; // Base size for collision/drawing

        // Colors
        this.cockpitColor = color(180, 100, 100); // Cyan
        this.engineColor1 = color(30, 100, 100); // Orange
        this.engineColor2 = color(0, 100, 100); // Red
        this.finColor = color(220, 60, 70); // Blueish-grey
        this.detailColor = color(0, 0, 60); // Dark grey

        // State & Abilities
        this.shapeState = 0; // For visual evolution based on points
        this.shootCooldown = 0; // Timer between shots
        this.baseShootDelay = 15; // Base frames between shots
        this.shootDelayPerLevel = 2; // Reduction per fire rate level
        this.shieldCharges = 0; // Current shield points
        this.shieldVisualRadius = this.size * 1.1; // Visual size of shield effect
        this.invulnerableTimer = 0; // Timer for invulnerability after taking damage
        this.invulnerabilityDuration = 120; // Frames of invulnerability (2 seconds)

        // Upgrades
        this.maxLevel = 5; // Max level for rate/spread
        this.fireRateLevel = 0;
        this.spreadShotLevel = 0;
        this.autoFireLevel = 0; // 0 = off, 1 = on
        this.maxAutoFireLevel = 1;
        this.baseUpgradeCost = 30; // Starting cost for rate/spread
        this.costMultiplier = 2.0; // How much cost increases per level
        this.autoFireCost = 50; // Fixed cost for auto-fire

        // Temporary Power-Up States
        this.rapidFireTimer = 0; // Timer for rapid fire power-up
        this.tempShieldActive = false; // Flag for temporary shield power-up
    }

    // Add shield charges, up to the maximum
    gainShields(amount) {
        let currentCharges = this.shieldCharges;
        this.shieldCharges = min(this.shieldCharges + amount, MAX_SHIELD_CHARGES);
        return this.shieldCharges - currentCharges; // Return how many were actually added
    }

    // Remove one shield charge
    loseShield() {
        if (this.shieldCharges > 0) {
            this.shieldCharges--;
        }
    }

    // Activate temporary invulnerability
    setInvulnerable() {
        this.invulnerableTimer = this.invulnerabilityDuration;
    }

    // Change visual appearance based on points milestones
    changeShape(level) {
        this.shapeState = (level % 2); // Simple toggle for now (0 or 1)
    }

    // Calculate current shooting delay based on upgrades and powerups
    get currentShootDelay() {
        if (this.rapidFireTimer > 0) {
            return 2; // Very fast for rapid fire power-up
        } else {
            // Base delay minus reduction from upgrades, minimum of 3 frames
            return max(3, this.baseShootDelay - (this.fireRateLevel * this.shootDelayPerLevel));
        }
    }

    // Get the cost of the next upgrade level
    getUpgradeCost(upgradeType) {
        let level;
        if (upgradeType === 'fireRate') {
            level = this.fireRateLevel;
            if (level >= this.maxLevel) return "MAX";
            return floor(this.baseUpgradeCost * pow(this.costMultiplier, level));
        } else if (upgradeType === 'spreadShot') {
            level = this.spreadShotLevel;
            if (level >= this.maxLevel) return "MAX";
            return floor(this.baseUpgradeCost * pow(this.costMultiplier, level));
        } else if (upgradeType === 'autoFire') {
            level = this.autoFireLevel;
            if (level >= this.maxAutoFireLevel) return "MAX";
            return this.autoFireCost;
        } else {
            return Infinity; // Should not happen
        }
    }

    // Attempt to purchase an upgrade
    attemptUpgrade(upgradeType) {
        let cost = this.getUpgradeCost(upgradeType);
        if (typeof cost !== 'number') return false; // Already maxed

        let currentLevel, maxLevelForType;
        let upgradeName = upgradeType.replace(/([A-Z])/g, ' $1').toUpperCase(); // Format name for messages

        // Determine current/max level based on type
        if (upgradeType === 'fireRate') { currentLevel = this.fireRateLevel; maxLevelForType = this.maxLevel; }
        else if (upgradeType === 'spreadShot') { currentLevel = this.spreadShotLevel; maxLevelForType = this.maxLevel; }
        else if (upgradeType === 'autoFire') { currentLevel = this.autoFireLevel; maxLevelForType = this.maxAutoFireLevel; }
        else { return false; } // Invalid type

        // Check affordability and level cap
        if (currentLevel < maxLevelForType && money >= cost) {
            money -= cost; // Deduct cost

            // Increment level
            if (upgradeType === 'fireRate') this.fireRateLevel++;
            else if (upgradeType === 'spreadShot') this.spreadShotLevel++;
            else if (upgradeType === 'autoFire') this.autoFireLevel++;

            // Display confirmation message (only if no other message is active)
            // Removed this - letting the shop handle messages now
            // if (infoMessageTimeout <= 0) {
            //     infoMessage = `${upgradeName} UPGRADED!`;
            //     if (upgradeType !== 'autoFire') { infoMessage += ` (Lvl ${currentLevel + 1})`; }
            //     infoMessageTimeout = 120;
            // }
            return true; // Upgrade successful
        } else {
            // Cannot afford or already maxed
            return false; // Upgrade failed
        }
    }

    // Reset ship state for a new level (keep upgrades)
    resetPositionForNewLevel() {
        this.pos.set(width / 2, height - 50);
        this.vel.set(0, 0);
        this.invulnerableTimer = 60; // Brief invulnerability at level start
        // Don't reset upgrades (fireRateLevel, etc.)
        // Don't reset shapeState
        this.rapidFireTimer = 0; // End powerups between levels
        this.tempShieldActive = false;
    }

    // Update ship position, velocity, timers, and handle input
    update() {
        // Decrement timers
        if (this.invulnerableTimer > 0) { this.invulnerableTimer--; }
        if (this.rapidFireTimer > 0) { this.rapidFireTimer--; }
        if (this.shootCooldown > 0) { this.shootCooldown--; }

        // --- Handle Movement Input ---
        let isTouching = touches.length > 0;
        let targetVel = createVector(0, 0); // Target velocity based on input

        if (isTouching) {
             // Move towards touch position
             let touchPos = createVector(touches[0].x, touches[0].y);
             let direction = p5.Vector.sub(touchPos, this.pos);
             // Only apply thrust if touch is not right on the ship
             if (direction.magSq() > 1) { // Use magSq for efficiency
                  direction.normalize();
                  // Apply thrust scaled by distance? Or just fixed? Let's use fixed scaled thrust.
                  targetVel = direction.mult(this.maxSpeed * this.touchThrustMultiplier); // Move towards touch faster
             }
             // Apply velocity directly towards touch - makes it very responsive
             this.vel.lerp(targetVel, 0.15); // Smoothly interpolate towards target velocity


        } else {
             // Keyboard controls (WASD or Arrows)
             let movingUp = keyIsDown(UP_ARROW) || keyIsDown(87); // W
             let movingDown = keyIsDown(DOWN_ARROW) || keyIsDown(83); // S
             let movingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65); // A
             let movingRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68); // D

             // Calculate target velocity based on key presses
             if (movingUp) { targetVel.y -= this.thrust; }
             if (movingDown) { targetVel.y += this.thrust; }
             if (movingLeft) { targetVel.x -= this.thrust; }
             if (movingRight) { targetVel.x += this.thrust; }

             // Apply acceleration
             this.vel.add(targetVel); // Add thrust vector directly seems wrong. Let's accelerate towards target instead.

             // Alternative: Accelerate ship based on input direction
             let acceleration = createVector(0, 0);
             if (movingUp) { acceleration.y -= this.thrust; }
             if (movingDown) { acceleration.y += this.thrust; }
             if (movingLeft) { acceleration.x -= this.thrust; }
             if (movingRight) { acceleration.x += this.thrust; }
             this.vel.add(acceleration); // Add acceleration to velocity

             // Apply friction only when not accelerating via keys? No, always apply friction.
              this.vel.mult(this.friction); // Apply friction
        }


        // Limit speed and apply velocity
        this.vel.limit(this.maxSpeed); // Clamp velocity magnitude
        this.pos.add(this.vel); // Update position

        // Keep ship within screen bounds
        let margin = this.size * 0.7; // Allow fins/nose to slightly touch edge
        this.pos.x = constrain(this.pos.x, margin, width - margin);
        this.pos.y = constrain(this.pos.y, margin, height - margin);

        // Handle Auto-Fire (if upgraded and spacebar held)
        if (this.autoFireLevel > 0 && keyIsDown(32)) { // Spacebar
            this.shoot();
            // TODO: Play shoot sound (potentially different sound for auto-fire?)
        }
    }

    // Create bullets based on upgrades
    shoot() {
        if (this.shootCooldown <= 0) {
            let bulletX = this.pos.x;
            let bulletY = this.pos.y - this.size * 0.6; // Origin slightly in front of center

            // Determine number of shots and spread angle based on upgrade level
            let numShots = 1;
            let spreadAngle = 0; // Radians

            if (this.spreadShotLevel >= 1 && this.spreadShotLevel <= 2) { numShots = 3; spreadAngle = PI / 20; } // ~9 degrees total spread
            else if (this.spreadShotLevel >= 3 && this.spreadShotLevel <= 4) { numShots = 3; spreadAngle = PI / 15; } // ~12 degrees total spread
            else if (this.spreadShotLevel >= this.maxLevel) { numShots = 5; spreadAngle = PI / 12; } // ~15 degrees total spread

            // Create bullets
            for (let i = 0; i < numShots; i++) {
                let angle = 0;
                if (numShots > 1) {
                    // Calculate angle for each shot in the spread
                    angle = map(i, 0, numShots - 1, -spreadAngle, spreadAngle);
                }
                bullets.push(new Bullet(bulletX, bulletY, angle));
            }

            this.shootCooldown = this.currentShootDelay; // Reset cooldown
        }
    }

    // Draw the ship, shields, and engine effects
    draw() {
        // Blinking effect when invulnerable
        if (this.invulnerableTimer <= 0 || (this.invulnerableTimer > 0 && frameCount % 10 < 5) ) {
             push();
             translate(this.pos.x, this.pos.y);

             // Draw Shields (if active)
             // Temporary Shield (Yellow, larger pulse)
             if (this.tempShieldActive) {
                  let tempShieldAlpha = map(sin(frameCount * 0.25), -1, 1, 50, 90);
                  let tempShieldHue = 45; // Yellow
                  fill(tempShieldHue, 90, 100, tempShieldAlpha);
                  noStroke();
                  ellipse(0, 0, this.shieldVisualRadius * 2.2, this.shieldVisualRadius * 2.2); // Larger ellipse
                  strokeWeight(2);
                  stroke(tempShieldHue, 100, 100, tempShieldAlpha + 20);
                  noFill();
                  ellipse(0, 0, this.shieldVisualRadius * 2.2, this.shieldVisualRadius * 2.2); // Outline
             }
             // Regular Shield (Cyan, smaller pulse)
             else if (this.shieldCharges > 0) {
                  let shieldAlpha = map(sin(frameCount * 0.15), -1, 1, 40, 80);
                  let shieldHue = 180; // Cyan
                  fill(shieldHue, 80, 100, shieldAlpha);
                  noStroke();
                  ellipse(0, 0, this.shieldVisualRadius * 2, this.shieldVisualRadius * 2);
                  strokeWeight(1.5);
                  stroke(shieldHue, 90, 100, shieldAlpha + 30);
                  noFill();
                  ellipse(0, 0, this.shieldVisualRadius * 2, this.shieldVisualRadius * 2);
             }

            // Draw Engine Thrust Effect
            let enginePulseFactor = 1.0 + this.vel.mag() * 0.3; // More thrust when moving faster
            let pulseSpeed = (this.rapidFireTimer > 0) ? 0.4 : 0.2; // Faster pulse during rapid fire
            let enginePulse = map(sin(frameCount * pulseSpeed), -1, 1, 0.8, 1.2) * enginePulseFactor;
            let engineSize = this.size * 0.5 * enginePulse; // Base size pulsating
            let engineBrightness = map(sin(frameCount * 0.3), -1, 1, 80, 100); // Flickering brightness
            noStroke();
            // Draw outer glow (red)
            for (let i = engineSize * 1.5; i > 0; i -= 3) {
                 let alpha = map(i, 0, engineSize * 1.5, 0, 30); // Fades out
                 fill(hue(this.engineColor2), 100, engineBrightness, alpha);
                 ellipse(0, this.size * 0.5, i, i * 1.5); // Elongated glow
            }
            // Draw inner core (orange)
            fill(hue(this.engineColor1), 100, 100);
            ellipse(0, this.size * 0.5, engineSize * 0.6, engineSize * 1.2); // Elongated core

            // Draw Ship Body
            stroke(0, 0, 80); // Dark outline
            strokeWeight(1.5);
            let pointsHue = (200 + points * 0.2) % 360; // Hue changes with points (Subtle)
            fill(pointsHue, 80, 95); // Main body color (blueish, shifts with points)
            let bodyWidthFactor = 0.6; // How wide the ship body is relative to size

            beginShape();
             // Base Shape (State 0)
             if (this.shapeState === 0) {
                 vertex(0, -this.size * 0.7); // Nose tip
                 // Bezier curves for smooth sides
                 bezierVertex( this.size * bodyWidthFactor * 0.8, -this.size * 0.3,   // Control point 1
                               this.size * bodyWidthFactor * 0.9,  this.size * 0.0,   // Control point 2
                               this.size * bodyWidthFactor * 1.0,  this.size * 0.4);  // Anchor point (widest)
                 bezierVertex( this.size * bodyWidthFactor * 0.5,  this.size * 0.6,   // Control point 3
                              -this.size * bodyWidthFactor * 0.5,  this.size * 0.6,   // Control point 4
                              -this.size * bodyWidthFactor * 1.0,  this.size * 0.4); // Anchor point (widest other side)
                 bezierVertex(-this.size * bodyWidthFactor * 0.9,  this.size * 0.0,   // Control point 5
                              -this.size * bodyWidthFactor * 0.8, -this.size * 0.3,   // Control point 6
                               0, -this.size * 0.7);                                 // Back to nose tip
             }
             // Evolved Shape (State 1) - Slightly larger, more angular?
             else {
                 let s = this.size * 1.1; // Slightly larger base size for evolved shape
                 let evolvedWidthFactor = bodyWidthFactor * 1.1; // Slightly wider
                 vertex(0, -s * 0.8); // Sharper nose
                 // More angular curves
                 bezierVertex( s * evolvedWidthFactor * 0.8, -s * 0.2, s * evolvedWidthFactor * 0.9,  s * 0.1, s * evolvedWidthFactor * 1.0,  s * 0.5); // Wider mid-section
                 bezierVertex( s * evolvedWidthFactor * 0.5,  s * 0.7, -s * evolvedWidthFactor * 0.5,  s * 0.7, -s * evolvedWidthFactor * 1.0,  s * 0.5);
                 bezierVertex(-s * evolvedWidthFactor * 0.9,  s * 0.1, -s * evolvedWidthFactor * 0.8, -s * 0.2, 0, -s * 0.8);
             }
             endShape(CLOSE);


            // Draw Details (Lines, Fins)
             strokeWeight(1);
             stroke(this.detailColor); // Dark grey for details

             // Body lines
             if (this.shapeState === 0) {
                 line(-this.size * bodyWidthFactor * 0.5, -this.size * 0.1, -this.size * bodyWidthFactor * 0.75, this.size * 0.3);
                 line( this.size * bodyWidthFactor * 0.5, -this.size * 0.1,  this.size * bodyWidthFactor * 0.75, this.size * 0.3);
             } else { // Different details for evolved shape
                 let s = this.size * 1.1;
                 let ewf = bodyWidthFactor * 1.1;
                 line(-s * ewf * 0.6, -s * 0.05, -s * ewf * 0.8, s * 0.4); // Angled lines
                 line( s * ewf * 0.6, -s * 0.05,  s * ewf * 0.8, s * 0.4);
                 line(0, -s*0.4, 0, s*0.1); // Center line
             }


            // Fins (shape changes slightly with state)
            let finYOffset = this.shapeState === 0 ? this.size * 0.3 : this.size * 1.1 * 0.35;
            let finXBase = this.shapeState === 0 ? this.size * bodyWidthFactor * 0.6 : this.size * 1.1 * bodyWidthFactor * 1.1 * 0.7; // Base of fin connection
            let finTipX = this.shapeState === 0 ? this.size * bodyWidthFactor * 1.1 : this.size * 1.1 * bodyWidthFactor * 1.1 * 1.1; // Outer tip of fin
            let finRearX = this.shapeState === 0 ? this.size * bodyWidthFactor * 0.75 : this.size * 1.1 * bodyWidthFactor * 1.1 * 0.8; // Rear corner of fin
            let finRearY = this.shapeState === 0 ? this.size * 0.6 : this.size * 1.1 * 0.7; // Rear corner Y pos

            fill(this.finColor); // Blueish-grey fins
            stroke(0, 0, 60); // Dark outline for fins
            strokeWeight(1);
            // Draw fins as triangles
            triangle( finXBase, finYOffset,  finTipX, finYOffset + this.size*0.1,  finRearX, finRearY); // Right fin
            triangle(-finXBase, finYOffset, -finTipX, finYOffset + this.size*0.1, -finRearX, finRearY); // Left fin


            // Draw Cockpit
            fill(this.cockpitColor); // Cyan cockpit
            noStroke();
            ellipse(0, -this.size * 0.15, this.size * 0.4, this.size * 0.5); // Main cockpit shape
            // Add a small reflection highlight
            fill(0, 0, 100, 50); // Semi-transparent white
            ellipse(0, -this.size * 0.2, this.size * 0.2, this.size * 0.25);

             pop(); // Restore drawing state
        } // End invulnerability blink check
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
        // Rainbow effect: Start hue based on frame count for variation
        this.startHue = frameCount % 360;
        this.hue = this.startHue;
        // Calculate velocity based on ship's forward direction (-PI/2) plus spread angle
        let baseAngle = -PI / 2; // Upwards
        this.vel = p5.Vector.fromAngle(baseAngle + angle);
        this.vel.mult(this.speed);
    }

    update() {
        this.pos.add(this.vel); // Move bullet
        this.hue = (this.hue + 4) % 360; // Cycle hue for rainbow effect
    }

    draw() {
        fill(this.hue, 90, 100); // Use cycling hue
        stroke(0, 0, 100); // White outline
        strokeWeight(1);
        ellipse(this.pos.x, this.pos.y, this.size, this.size * 2.5); // Elongated shape
    }

    // Check if bullet is off screen
    isOffscreen() {
        let margin = this.size * 3; // Generous margin
        return (this.pos.y < -margin || this.pos.y > height + margin ||
                this.pos.x < -margin || this.pos.x > width + margin);
    }
}


// ==================
// Asteroid Class
// ==================
class Asteroid {
    constructor(x, y, size, vel) {
        this.size = size || random(30, 80); // Use provided size or random
        this.pos = createVector();

        let isInitialPlacement = (x !== undefined && y !== undefined); // Check if position is provided

        if (isInitialPlacement) {
            // Use provided position (e.g., for initial spawn or splits)
            this.pos.x = x;
            this.pos.y = y;
        } else {
            // Spawn randomly offscreen (Top, Left, Right edges only)
            let edge = floor(random(3)); // 0 = Top, 1 = Right, 2 = Left
            if (edge === 0) { // Top edge
                this.pos.x = random(width);
                this.pos.y = -this.size / 2;
            } else if (edge === 1) { // Right edge
                this.pos.x = width + this.size / 2;
                this.pos.y = random(height * 0.7); // Spawn in upper 70%
            } else { // Left edge
                this.pos.x = -this.size / 2;
                this.pos.y = random(height * 0.7); // Spawn in upper 70%
            }
        }

        // Set velocity
        if (vel) {
            // Use provided velocity (for splits)
            this.vel = vel;
        } else {
            // Calculate random velocity towards the center area
            let baseSpeedMin = 0.6 + (currentLevel - 1) * 0.1; // Scale speed with level
            let baseSpeedMax = 1.8 + (currentLevel - 1) * 0.2;
            this.speed = min(MAX_ASTEROID_SPEED, random(baseSpeedMin, baseSpeedMax)); // Cap speed

            // Smaller asteroids move slightly faster/slower (more variation)
            this.speed *= (this.size > 50 ? 0.9 : 1.1);
            this.speed *= random(0.9, 1.1); // Add some randomness

            if (isInitialPlacement) {
                 // If placed initially (not edge spawn), give random direction
                 this.vel = p5.Vector.random2D();
            } else {
                // Aim towards the general center area with some randomness
                let targetX = width / 2 + random(-width * 0.25, width * 0.25);
                let targetY = height / 2 + random(-height * 0.25, height * 0.25);
                let direction = createVector(targetX - this.pos.x, targetY - this.pos.y);
                direction.normalize();
                direction.rotate(random(-PI / 12, PI / 12)); // Add slight angle variation
                this.vel = direction;
            }
            this.vel.mult(this.speed);
        }

        // Visual properties
        this.color = color(random(20, 50), random(30, 70), random(30, 60)); // Brown/grey tones
        this.rotation = random(TWO_PI); // Initial rotation
        this.rotationSpeed = random(-0.04, 0.04); // Base rotation speed
        this.rotationAccel = 0.0001; // Tiny random change in rotation speed

        // Generate irregular shape vertices
        this.vertices = [];
        let numVertices = floor(random(8, 16)); // Variable number of points
        for (let i = 0; i < numVertices; i++) {
            let angleOffset = map(i, 0, numVertices, 0, TWO_PI);
            // Vary radius for jagged shape
            let r = this.size / 2 + random(-this.size * 0.4, this.size * 0.3);
            let v = p5.Vector.fromAngle(angleOffset);
            v.mult(r);
            this.vertices.push(v);
        }

        // Add craters for detail
        this.craters = [];
        let numCraters = floor(random(2, 6));
        for (let i = 0; i < numCraters; i++) {
            let angle = random(TWO_PI);
            let radius = random(this.size * 0.1, this.size * 0.35); // Position on surface
            let craterSize = random(this.size * 0.1, this.size * 0.25); // Size of crater
            let craterPos = p5.Vector.fromAngle(angle).mult(radius); // Offset from center
            this.craters.push({ pos: craterPos, size: craterSize });
        }
    }

    update() {
        this.pos.add(this.vel); // Move asteroid

        // Update rotation with slight random acceleration/deceleration
        this.rotationSpeed += random(-this.rotationAccel, this.rotationAccel);
        this.rotationSpeed = constrain(this.rotationSpeed, -0.05, 0.05); // Limit rotation speed
        this.rotation += this.rotationSpeed;

        // Wrap around screen edges
        let buffer = this.size; // Generous buffer
        if (this.pos.x < -buffer) this.pos.x = width + buffer;
        if (this.pos.x > width + buffer) this.pos.x = -buffer;
        // Wrap top/bottom too
        if (this.pos.y < -buffer) this.pos.y = height + buffer;
        if (this.pos.y > height + buffer) this.pos.y = -buffer;
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);

        let mainBri = brightness(this.color);
        let mainSat = saturation(this.color);
        let mainHue = hue(this.color);

        // Subtle 3D effect using offset shapes
        // Highlight (slightly offset up-left)
        let highlightColor = color(mainHue, mainSat * 0.8, mainBri * 1.2);
        fill(highlightColor);
        noStroke();
        beginShape();
        for (let v of this.vertices) { vertex(v.x - 1, v.y - 1); }
        endShape(CLOSE);

        // Shadow (slightly offset down-right)
        let shadowColor = color(mainHue, mainSat * 1.1, mainBri * 0.7);
        fill(shadowColor);
        noStroke();
        beginShape();
        for (let v of this.vertices) { vertex(v.x + 1, v.y + 1); }
        endShape(CLOSE);

        // Main asteroid body
        fill(this.color);
        stroke(mainHue, mainSat * 0.5, mainBri * random(1.3, 1.7)); // Slightly varied edge highlight
        strokeWeight(1.5);
        beginShape();
        for (let v of this.vertices) { vertex(v.x, v.y); }
        endShape(CLOSE);

        // Draw craters (darker ellipses)
        noStroke();
        fill(hue(this.color), saturation(this.color)*0.8, brightness(this.color) * 0.5, 80); // Darker, semi-transparent
        for (let crater of this.craters) {
            ellipse(crater.pos.x, crater.pos.y, crater.size, crater.size * random(0.8, 1.2)); // Slightly irregular crater shape
        }

        pop();
    }

    // Check collision with a bullet (circle collision)
    hits(bullet) {
        let d = dist(this.pos.x, this.pos.y, bullet.pos.x, bullet.pos.y);
        return d < this.size / 2 + bullet.size / 2;
    }

    // Check collision with the player ship (circle collision, considers shield)
    hitsShip(ship) {
        let targetX = ship.pos.x;
        let targetY = ship.pos.y;
        // Determine ship's effective radius (base size or shield size)
        let targetRadius = ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5);
        let d = dist(this.pos.x, this.pos.y, targetX, targetY);
        return d < this.size / 2 + targetRadius;
    }
}


// ==================
// Particle Class
// ==================
class Particle {
    constructor(x, y, particleColor, size = null, speedMult = 1) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D(); // Random initial direction
        this.vel.mult(random(1.5, 5) * speedMult); // Random initial speed
        this.lifespan = 100; // Alpha value, decreases over time
        // Store base color components
        this.baseHue = hue(particleColor);
        this.baseSat = saturation(particleColor);
        this.baseBri = brightness(particleColor);
        this.size = size !== null ? size : random(2, 6); // Use provided size or random
    }

    update() {
        this.pos.add(this.vel); // Move particle
        this.lifespan -= 3; // Decrease lifespan (fade out)
        this.vel.mult(0.97); // Apply friction to slow down
    }

    draw() {
        noStroke();
        // Use base color with decreasing alpha
        fill(this.baseHue, this.baseSat, this.baseBri, this.lifespan);
        ellipse(this.pos.x, this.pos.y, this.size);
    }

    // Check if particle has faded out
    isDead() {
        return this.lifespan <= 0;
    }
}


// ==================
// Star Class
// ==================
class Star {
    constructor() {
        this.x = random(width);
        this.y = random(height);
        // Assign to different layers for parallax effect
        this.layer = floor(random(3)); // 0 = farthest, 2 = nearest
        this.size = map(this.layer, 0, 2, 0.5, 2.5); // Larger stars for nearer layers
        this.speed = map(this.layer, 0, 2, 0.1, 0.5); // Faster speed for nearer layers
        this.baseBrightness = random(60, 90); // Base brightness
        this.twinkleOffset = random(TWO_PI); // Random offset for twinkle effect timing
    }

    update() {
        this.y += this.speed; // Move star down based on layer speed
        // Wrap around screen if moved off bottom edge
        if (this.y > height + this.size) {
            this.y = -this.size; // Reset to top
            this.x = random(width); // Randomize x position
        }
    }

    draw() {
        // Calculate twinkling brightness using sine wave
        let twinkleFactor = map(sin(frameCount * 0.05 + this.twinkleOffset), -1, 1, 0.8, 1.2);
        let currentBrightness = constrain(this.baseBrightness * twinkleFactor, 40, 100); // Clamp brightness
        fill(0, 0, currentBrightness); // White star with varying brightness
        noStroke();
        ellipse(this.x, this.y, this.size);
    }
}


// ==================
// HealthPotion Class
// ==================
class HealthPotion {
    constructor(x, y) {
        // Spawn at provided coords or randomly near top
        this.pos = createVector(x || random(width * 0.1, width * 0.9), y || -30);
        this.vel = createVector(0, random(0.5, 1.5)); // Moves downwards slowly
        this.size = 20; // Base size for drawing and collision

        // Dimensions for drawing the potion bottle shape
        this.bodyWidth = this.size * 0.6;
        this.bodyHeight = this.size * 0.8;
        this.neckWidth = this.size * 0.3;
        this.neckHeight = this.size * 0.4;

        this.rotation = 0; // Current rotation
        this.rotationSpeed = random(-0.01, 0.01); // Slow, random wobble
    }

    update() {
        this.pos.add(this.vel); // Move potion
        this.rotation += this.rotationSpeed; // Update rotation
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);

        // Draw potion bottle shape
        fill(0, 85, 90); // Red color for health
        noStroke();
        // Body (rectangle with rounded corners)
        rect(-this.bodyWidth / 2, -this.bodyHeight / 2, this.bodyWidth, this.bodyHeight, 3);
        // Neck (rectangle)
        rect(-this.neckWidth / 2, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth, this.neckHeight);
        // Top lip (ellipse)
        ellipse(0, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth * 1.2, this.neckWidth * 0.4);

        // Draw white cross symbol
        fill(0, 0, 100); // White
        rectMode(CENTER); // Draw rectangles from center
        rect(0, 0, this.bodyWidth * 0.5, this.bodyWidth * 0.15); // Horizontal bar
        rect(0, 0, this.bodyWidth * 0.15, this.bodyWidth * 0.5); // Vertical bar
        rectMode(CORNER); // Reset rectMode

        pop();
    }

    // Check collision with player ship (circle collision)
    hitsShip(ship) {
        let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y);
        // Using half size for potion, ship effective radius depends on shields
        let shipRadius = ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5);
        return d < this.size / 2 + shipRadius;
    }

    // Check if potion is off screen
    isOffscreen() {
        let margin = this.size * 2;
        return (this.pos.y > height + margin); // Only check bottom edge
    }
}


// ==================
// PowerUp Class
// ==================
class PowerUp {
    constructor(type) {
        this.type = type; // Store powerup type (TEMP_SHIELD, RAPID_FIRE, EMP_BURST)
        // Spawn randomly near top edge
        this.pos = createVector(random(width * 0.1, width * 0.9), -30);
        this.vel = createVector(0, random(0.8, 1.8)); // Moves downwards
        this.size = 22; // Base size for drawing/collision
        this.pulseOffset = random(TWO_PI); // Offset for pulsing animation timing

        // Set icon and color based on type
        this.icon = '?';
        this.color = color(0, 0, 100); // Default white
        switch (this.type) {
            case POWERUP_TYPES.TEMP_SHIELD: this.icon = 'S'; this.color = color(45, 90, 100); break; // Yellow
            case POWERUP_TYPES.RAPID_FIRE: this.icon = 'R'; this.color = color(120, 90, 100); break; // Green
            case POWERUP_TYPES.EMP_BURST: this.icon = 'E'; this.color = color(210, 90, 100); break; // Blue
        }
    }

    update() {
        this.pos.add(this.vel); // Move powerup
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);

        // Pulsing size effect
        let pulse = map(sin(frameCount * 0.1 + this.pulseOffset), -1, 1, 0.9, 1.1);
        let currentSize = this.size * pulse;
        let currentBrightness = brightness(this.color) * pulse; // Pulse brightness too

        // Outer glow
        fill(hue(this.color), saturation(this.color) * 0.8, currentBrightness * 0.8, 80);
        noStroke();
        ellipse(0, 0, currentSize * 1.2, currentSize * 1.2);

        // Inner circle with icon
        fill(hue(this.color), saturation(this.color), currentBrightness);
        stroke(0, 0, 100); // White outline
        strokeWeight(1.5);
        // Draw icon text in the center
        textSize(currentSize * 0.8); // Scale text size
        textAlign(CENTER, CENTER);
        text(this.icon, 0, currentSize * 0.05); // Slight Y offset for better centering

        pop();
    }

    // Check collision with player ship (circle collision)
    hitsShip(ship) {
        let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y);
         let shipRadius = ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5);
        return d < this.size / 2 + shipRadius;
    }

    // Check if powerup is off screen
    isOffscreen() {
        let margin = this.size * 2;
        return (this.pos.y > height + margin); // Only check bottom edge
    }
}


// ==================
// EnemyShip Class
// ==================
class EnemyShip {
    constructor() {
        this.size = 28; // Size for drawing/collision
        this.pos = createVector();
        this.vel = createVector();
        this.shootCooldown = random(120, 240); // Time between shots (2-4 seconds)
        this.shootTimer = this.shootCooldown; // Timer until next shot
        this.bulletSpeed = 3.5 + currentLevel * 0.1; // Bullet speed increases with level

        // Spawn at top, left, or right edge
        let edge = floor(random(3));
        if (edge === 0) { // Top
            this.pos.x = random(width);
            this.pos.y = -this.size / 2;
            this.vel.set(random(-0.5, 0.5), random(0.8, 1.5)); // Moves mostly down
        } else if (edge === 1) { // Right
            this.pos.x = width + this.size / 2;
            this.pos.y = random(height * 0.5); // Upper half
            this.vel.set(random(-1.5, -0.8), random(-0.5, 0.5)); // Moves mostly left
        } else { // Left
            this.pos.x = -this.size / 2;
            this.pos.y = random(height * 0.5); // Upper half
            this.vel.set(random(0.8, 1.5), random(-0.5, 0.5)); // Moves mostly right
        }

        // Scale speed slightly with level
        let speedScale = min(MAX_ENEMY_SPEED, 1.0 + (currentLevel - 1) * 0.1);
        this.vel.mult(speedScale);

        // Add a slight random sideways drift ("cool stuff")
        this.sidewaysDrift = random(-0.2, 0.2) * speedScale;
        this.vel.x += this.sidewaysDrift;
    }

    update() {
        this.pos.add(this.vel); // Move ship

        // Shooting logic
        this.shootTimer--;
        if (this.shootTimer <= 0 && ship && gameState === GAME_STATE.PLAYING) { // Only shoot if player exists and game is playing
            this.shoot();
            // Reset cooldown (shorter cooldown at higher levels)
            this.shootCooldown = random(max(40, 120 - currentLevel * 5), max(80, 240 - currentLevel * 10));
            this.shootTimer = this.shootCooldown;
        }
    }

    // Create an enemy bullet
    shoot() {
        // Simple: shoots straight down for now
        let aimAngle = PI / 2; // Downwards
        enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y, aimAngle, this.bulletSpeed));
         // TODO: Play enemy shoot sound
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);

        // Simple black triangular/angular ship design
        fill(0, 0, 15); // Very dark grey/black
        stroke(0, 80, 50); // Dark red outline
        strokeWeight(1.5);
        beginShape();
        vertex(0, -this.size * 0.6); // Top point
        vertex(this.size * 0.5, this.size * 0.4); // Bottom right wingtip
        vertex(this.size * 0.3, this.size * 0.3); // Indent near engine
        vertex(-this.size * 0.3, this.size * 0.3); // Other indent
        vertex(-this.size * 0.5, this.size * 0.4); // Bottom left wingtip
        endShape(CLOSE);

        // Could add a small red "eye" or engine glow here later
        // fill(0, 100, 100); noStroke(); ellipse(0, 0, 3);

        pop();
    }

    // Check if enemy is off screen
    isOffscreen() {
        let margin = this.size * 2; // Generous margin
        return (this.pos.y > height + margin || this.pos.y < -margin ||
                this.pos.x < -margin || this.pos.x > width + margin);
    }

    // Check collision with a player bullet (circle collision)
    hits(playerBullet) {
        let d = dist(this.pos.x, this.pos.y, playerBullet.pos.x, playerBullet.pos.y);
        return d < this.size / 2 + playerBullet.size / 2;
    }

    // Check collision with the player ship (circle collision, considers shield)
    hitsShip(playerShip) {
        let d = dist(this.pos.x, this.pos.y, playerShip.pos.x, playerShip.pos.y);
        let targetRadius = playerShip.tempShieldActive ? playerShip.shieldVisualRadius*1.1 : (playerShip.shieldCharges > 0 ? playerShip.shieldVisualRadius : playerShip.size * 0.5);
        // Use a smaller collision radius for the enemy ship body itself
        return d < this.size * 0.4 + targetRadius;
    }
}


// ==================
// EnemyBullet Class
// ==================
class EnemyBullet {
    constructor(x, y, angle, speed) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.fromAngle(angle); // Set velocity from angle
        this.vel.mult(speed);
        this.size = 6; // Small bullet size
        this.color = color(300, 80, 90); // Magenta/Purple color
    }

    update() {
        this.pos.add(this.vel); // Move bullet
    }

    draw() {
        fill(this.color);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.size, this.size); // Simple circle
    }

    // Check collision with player ship (circle collision, considers shield)
    hitsShip(ship) {
        let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y);
        let targetRadius = ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5);
        return d < this.size / 2 + targetRadius;
    }

    // Check if bullet is off screen
    isOffscreen() {
        let margin = this.size * 2;
        return (this.pos.y > height + margin || this.pos.y < -margin ||
                this.pos.x < -margin || this.pos.x > width + margin);
    }
}


// ==================
// Nebula Class (Background Element)
// ==================
class Nebula {
    constructor() {
        this.numEllipses = floor(random(8, 15)); // Number of ellipses per nebula cloud
        this.ellipses = []; // Array to hold ellipse data {pos, w, h, alpha}
        this.rotation = random(TWO_PI); // Initial rotation
        this.rotationSpeed = random(-0.0005, 0.0005); // Very slow rotation
        this.baseAlpha = random(4, 10); // Overall transparency (very subtle)

        // Define overall size and starting position/velocity
        let overallWidth = random(width * 0.5, width * 1.2); // Can be quite large
        let overallHeight = random(height * 0.3, height * 0.6);

        // Start offscreen left or right and move slowly across
        if (random(1) < 0.5) { // Start Left
             this.pos = createVector(-overallWidth / 2, random(height));
             this.vel = createVector(random(0.05, 0.15), random(-0.02, 0.02)); // Slow right drift
        } else { // Start Right
             this.pos = createVector(width + overallWidth / 2, random(height));
             this.vel = createVector(random(-0.15, -0.05), random(-0.02, 0.02)); // Slow left drift
        }

        // Choose two base colors to blend between
        let h1 = random(240, 330); // Blues, Purples, Pinks
        let h2 = (h1 + random(-40, 40)) % 360; // Similar nearby hue
        this.color1 = color(h1, random(40, 70), random(20, 50)); // Dark, desaturated
        this.color2 = color(h2, random(40, 70), random(20, 50));

        // Create individual ellipses within the nebula cloud
        for (let i = 0; i < this.numEllipses; i++) {
            this.ellipses.push({
                pos: createVector(random(-overallWidth * 0.4, overallWidth * 0.4), random(-overallHeight * 0.4, overallHeight * 0.4)), // Random offset from center
                w: random(overallWidth * 0.2, overallWidth * 0.6), // Random width
                h: random(overallHeight * 0.2, overallHeight * 0.6), // Random height
                alpha: this.baseAlpha * random(0.7, 1.3) // Slight alpha variation per ellipse
            });
        }
    }

    update() {
        this.pos.add(this.vel); // Move the whole nebula
        this.rotation += this.rotationSpeed; // Rotate the whole nebula
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y); // Move to nebula position
        rotate(this.rotation); // Apply rotation
        noStroke();

        // Draw each constituent ellipse
        for (let el of this.ellipses) {
            // Blend between the two base colors based on horizontal position within the cloud
            let inter = map(el.pos.x, -width * 0.4, width * 0.4, 0, 1);
            let c = lerpColor(this.color1, this.color2, inter);
            // Set fill with calculated color and individual alpha
            fill(hue(c), saturation(c), brightness(c), el.alpha);
            ellipse(el.pos.x, el.pos.y, el.w, el.h); // Draw the ellipse
        }
        pop();
    }

    // Check if the nebula is completely off screen
    isOffscreen() {
        // Use an estimated bounding radius for simplicity
        let maxDimension = max(this.ellipses.reduce((maxR, el) => max(maxR, el.pos.mag() + max(el.w, el.h) / 2), 0), width * 0.6); // Estimate radius
        let margin = maxDimension;
        return (this.pos.x < -margin || this.pos.x > width + margin ||
                this.pos.y < -margin || this.pos.y > height + margin);
    }
}
