// --- Features ---
// - Start Screen (Enter/Tap to Start) - Title "Space-Chase" + Dynamic // MODIFIED (Size, Effect, Color)
// - Level System based on Points
// - Rainbow Bullets (Hue Cycling) // ENHANCED (Trail Effect)
// - Ship Upgrade System (Manual Purchase in Shop: Fire Rate, Spread Shot) - Uses Money
// - Score-based Shield System (Gain shield charge every 50 points, max 1) - Uses Points
// - Redesigned Spaceship Look (Score-based color/shape, added details, thinner) // ENHANCED (Hover, Thrust Particles, Upgrade Tint)
// - Dynamic Parallax Star Background (with occasional planet, galaxy, black hole) // ENHANCED (Twinkle, Shooting Stars, Slower BH Effect)
// - Enhanced Engine Thrust Effect (More reactive) // ENHANCED (Particles, Reduced Thrust Value, Smaller Visual)
// - Asteroid Splitting
// - Player Lives (Max 3)
// - Simple Explosion Particles (Asteroid destruction + Bullet impact) // ENHANCED (Variety, Count)
// - Score-based Difficulty Increase - Uses Levels + Time
// - Health Potions: Spawn randomly, restore 1 life on pickup (up to max). // ENHANCED (Visual Pulse)
// - Simple Enemy Ships that shoot at the player (No Auto-Aim). // MODIFIED (Appearance: Black Ship, Slight Drift)
// - Temporary Power-Ups (Temp Shield, Rapid Fire, EMP Burst) // ENHANCED (Visual Pulse)
// - Visual Nebula Clouds in background // ENHANCED (Subtlety)
// - ADDED: Pause Functionality (Press ESC during gameplay)
// - ADDED: Upgrade Shop Screen between levels
// --- Modifications ---
// - Removed Name Input and Leaderboard system.
// - Implemented separate Points (milestones) and Money (upgrades) systems.
// - Asteroids only spawn from Top, Left, and Right edges.
// - Ship movement changed to free keyboard control (Arrows/WASD).
// - Spacebar/Tap to shoot always enabled.
// - Background gradient color changes every 20 seconds.
// - Added brief invulnerability after losing a life.
// - Added Touch Controls: Tap to shoot and move towards tap.
// - Mobile Adjustments: Lower base asteroid spawn rate.
// - Max shield charges reduced to 1.
// - Asteroids visuals enhanced (shading, craters, rotation).
// - Added occasional background planet, subtle galaxy, black hole effect.
// - Increased Ship Speed (MaxSpeed unchanged, acceleration reduced)
// - Increased Asteroid Spawn Rate Scaling & Max Asteroid Count per Level
// - Added screen shake on life loss. // ENHANCED (Intensity)
// - Changed Title Color Order & Darkened Red
// - Removed automatic cheapest upgrade on level up.
// - Added simple sideways drift to enemy movement.
// - Added sound effect placeholder comments.
// - Added upgrade purchase particle effect.
// - Added distinct shop background.
// - REMOVED Auto-Fire Upgrade functionality entirely.
// - ENHANCED: Added backgrounds to HUD elements.
// - ENHANCED: Added particles for shield hits and pickup collection.
// - ENHANCED: Changed enemy bullet appearance.
// - MODIFIED: Reduced ship thrust value.
// - MODIFIED: Reduced black hole visual jitter ("slower" appearance).
// - MODIFIED: Reduced size of engine thrust visual effect.
// --------------------------


// --- Game Objects & State ---
let ship;
let bullets = [];
let asteroids = [];
let particles = [];
let stars = [];
let shootingStars = [];
let potions = [];
let enemyShips = [];
let enemyBullets = [];
let powerUps = [];
let nebulas = [];


// Game State Management
const GAME_STATE = { START_SCREEN: 0, PLAYING: 1, GAME_OVER: 2, UPGRADE_SHOP: 3 };
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
const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 5000, 7500, 10500];


// Game Settings & Thresholds
let baseAsteroidSpawnRate;
let currentAsteroidSpawnRate;
let baseEnemySpawnRate;
let currentEnemySpawnRate;
let powerUpSpawnRate = 0.0015;
let potionSpawnRate = 0.001;
let nebulaSpawnRate = 0.0005;
let shootingStarSpawnRate = 0.001;
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
let shopButtons = [];
let levelTransitionFlash = 0;


// --- Background ---
let currentTopColor;
let currentBottomColor;
const BACKGROUND_CHANGE_INTERVAL = 1200;
let isMobile = false;


// --- Background Scenery Variables ---
let planetVisible = false;
let planetPos, planetVel, planetSize, planetBaseColor, planetDetailColor1, planetDetailColor2;
let lastPlanetAppearanceTime = -Infinity;
const PLANET_MIN_INTERVAL = 30000;
const PLANET_MAX_INTERVAL = 60000;


// --- Screen Shake Variables ---
let screenShakeIntensity = 0;
let screenShakeDuration = 0;


// ==================
// p5.js Setup Function
// ==================
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100); // Use HSB color mode (Hue, Saturation, Brightness, Alpha)
  let ua = navigator.userAgent; // Get user agent string
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) { isMobile = true; } // Basic mobile detection
  createStarfield(200); // Initialize background stars
  textAlign(CENTER, CENTER); // Default text alignment
  textSize(20); // Default text size
  // Initial background gradient colors
  currentTopColor = color(260, 80, 10); // Dark blue/purple
  currentBottomColor = color(240, 70, 25); // Slightly lighter blue
}


// ==================
// Helper Functions
// ==================
// Spawn initial asteroids away from the player start area
function spawnInitialAsteroids() {
    asteroids = []; // Clear existing asteroids
    for (let i = 0; i < initialAsteroids; i++) {
        let startPos;
        let shipX = ship ? ship.pos.x : width / 2; // Use ship position if exists, otherwise center
        let shipY = ship ? ship.pos.y : height - 50;
        // Ensure asteroids don't spawn too close to the ship
        do {
            startPos = createVector(random(width), random(height * 0.7)); // Spawn in upper 70%
        } while (ship && dist(startPos.x, startPos.y, shipX, shipY) < 150); // Check distance
        asteroids.push(new Asteroid(startPos.x, startPos.y)); // Add new asteroid
    }
}

// Create explosion/impact particles
function createParticles(x, y, count, particleColor, particleSize = null, speedMult = 1, lifespanMult = 1) {
    let baseHue = hue(particleColor);
    let baseSat = saturation(particleColor);
    let baseBri = brightness(particleColor);
    for (let i = 0; i < count; i++) {
        // Add random variations to particle color
        let pColor = color(
            (baseHue + random(-15, 15)) % 360, // Hue variation
            baseSat * random(0.7, 1.1),       // Saturation variation
            baseBri * random(0.8, 1.2),       // Brightness variation
            100                               // Start fully opaque
        );
        particles.push(new Particle(x, y, pColor, particleSize, speedMult, lifespanMult)); // Add new particle
    }
}

// Initialize the starfield
function createStarfield(numStars) {
    stars = []; // Clear existing stars
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star()); // Add new star
    }
}

// Set difficulty parameters based on the current level
function setDifficultyForLevel(level) {
    let mobileFactor = isMobile ? 0.7 : 1.0; // Adjust spawn rates for mobile
    // Increase base spawn rates with level
    baseAsteroidSpawnRate = (0.009 + (level - 1) * 0.0015) * mobileFactor;
    currentAsteroidSpawnRate = baseAsteroidSpawnRate; // Set current rate
    baseEnemySpawnRate = (0.002 + (level - 1) * 0.0005) * mobileFactor;
    currentEnemySpawnRate = baseEnemySpawnRate; // Set current rate
}

// Define buttons for the upgrade shop
function setupShopButtons() {
    shopButtons = []; // Clear existing buttons
    let buttonWidth = 220;
    let buttonHeight = 55;
    let startY = height / 2 - 90; // Starting Y position for buttons
    let spacing = 80; // Vertical spacing between buttons
    // Add buttons for upgrades and next level
    shopButtons.push({ id: 'fireRate', x: width / 2 - buttonWidth / 2, y: startY, w: buttonWidth, h: buttonHeight });
    shopButtons.push({ id: 'spreadShot', x: width / 2 - buttonWidth / 2, y: startY + spacing, w: buttonWidth, h: buttonHeight });
    shopButtons.push({ id: 'nextLevel', x: width / 2 - buttonWidth / 2, y: startY + spacing * 2 + 30, w: buttonWidth, h: buttonHeight });
}


// ==================
// p5.js Draw Loop
// ==================
function draw() {
    // --- Background Updates (Run always) ---
    // Change background gradient periodically
    if (gameState !== GAME_STATE.START_SCREEN && frameCount > 0 && frameCount % BACKGROUND_CHANGE_INTERVAL === 0) {
        let topH = random(180, 300); // Random hue for top color
        let bottomH = (topH + random(20, 60)) % 360; // Related hue for bottom color
        currentTopColor = color(topH, random(70, 90), random(10, 20)); // Set new top color
        currentBottomColor = color(bottomH, random(60, 85), random(25, 40)); // Set new bottom color
    }
    // Update background planet visibility and position
    if (gameState !== GAME_STATE.START_SCREEN) {
        let currentTime = millis(); // Get current time
        // Check if it's time for a new planet to appear
        if (!planetVisible && currentTime - lastPlanetAppearanceTime > random(PLANET_MIN_INTERVAL, PLANET_MAX_INTERVAL)) {
            planetVisible = true; // Make planet visible
            planetSize = random(width * 0.2, width * 0.5); // Random size
            // Determine starting edge and position
            let edge = floor(random(4));
            if (edge === 0) planetPos = createVector(random(width), -planetSize / 2); // Top
            else if (edge === 1) planetPos = createVector(width + planetSize / 2, random(height)); // Right
            else if (edge === 2) planetPos = createVector(random(width), height + planetSize / 2); // Bottom
            else planetPos = createVector(-planetSize / 2, random(height)); // Left
            // Calculate velocity towards a random target near center
            let targetPos = createVector(random(width * 0.2, width * 0.8), random(height * 0.2, height * 0.8));
            planetVel = p5.Vector.sub(targetPos, planetPos);
            planetVel.normalize();
            planetVel.mult(random(0.1, 0.3)); // Slow speed
            // Set random planet colors
            let baseH = random(360);
            planetBaseColor = color(baseH, random(40, 70), random(50, 80));
            planetDetailColor1 = color((baseH + random(20, 50)) % 360, random(50, 70), random(60, 90));
            planetDetailColor2 = color((baseH + random(180, 220)) % 360, random(30, 60), random(40, 70));
            lastPlanetAppearanceTime = currentTime; // Reset timer
        }
        // Move planet and check if it's offscreen
        if (planetVisible) {
            planetPos.add(planetVel);
            let buffer = planetSize * 0.6; // Offscreen buffer
            if (planetPos.x < -buffer || planetPos.x > width + buffer || planetPos.y < -buffer || planetPos.y > height + buffer) {
                planetVisible = false; // Hide planet if offscreen
            }
        }
    }
    // Spawn shooting stars occasionally
    if (gameState === GAME_STATE.PLAYING && !isPaused && random(1) < shootingStarSpawnRate) {
        shootingStars.push(new ShootingStar());
    }

    // --- Drawing ---
    drawBackgroundAndStars(); // Draw gradient, stars, nebulas, scenery

    push(); // Isolate screen shake transformation
    // Apply screen shake if active
    if (screenShakeDuration > 0) {
        translate(random(-screenShakeIntensity, screenShakeIntensity), random(-screenShakeIntensity, screenShakeIntensity));
    }

    // --- Game State Logic ---
    switch (gameState) {
        case GAME_STATE.START_SCREEN:
            displayStartScreen(); // Show title and instructions
            break;
        case GAME_STATE.PLAYING:
            runGameLogic(); // Run main game loop
            if (isPaused) { displayPauseScreen(); } // Overlay pause screen if paused
            break;
        case GAME_STATE.UPGRADE_SHOP:
            displayUpgradeShop(); // Show upgrade purchase screen
            break;
        case GAME_STATE.GAME_OVER:
            runGameLogic(); // Run one last logic update to draw final state
            displayGameOver(); // Show game over message and score
            break;
    }

    // Display info messages (powerups, etc.)
    if (infoMessageTimeout > 0) {
        displayInfoMessage();
        // Decrement timer only if not paused (or in shop)
        if ((gameState === GAME_STATE.PLAYING && !isPaused) || gameState === GAME_STATE.UPGRADE_SHOP) {
            infoMessageTimeout--;
        }
    }
    // Display level transition flash effect
    if (levelTransitionFlash > 0) {
        fill(0, 0, 100, levelTransitionFlash * 10); // White flash, fades out
        rect(0, 0, width, height);
        levelTransitionFlash--;
    }
    pop(); // End screen shake transformation
}


// --- Screen Display Functions ---

// Display the initial start screen
function displayStartScreen() {
    let titleText = "Space-Chase";
    let titleSize = 72; // Larger title
    textSize(titleSize);
    textAlign(CENTER, CENTER);
    let totalWidth = textWidth(titleText);
    let startX = width / 2 - totalWidth / 2;
    let currentX = startX;
    let titleY = height / 3;
    // Draw title with shadow and dynamic color/effect
    for (let i = 0; i < titleText.length; i++) {
        let char = titleText[i];
        let charWidth = textWidth(char);
        let yOffset = sin(frameCount * 0.08 + i * 0.6) * 8; // Wave effect
        // Shadow
        fill(0, 0, 0, 50);
        text(char, currentX + charWidth / 2 + 4, titleY + yOffset + 4);
        // Colored Character (cycling hue)
        let h = (frameCount * 2 + i * 20) % 360;
        fill(h, 90, 100);
        text(char, currentX + charWidth / 2, titleY + yOffset);
        currentX += charWidth;
    }
    // Instructions
    textSize(24); // Larger instruction text
    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    let startInstruction = isMobile ? "Tap Screen to Start" : "Press Enter to Start";
    text(startInstruction, width / 2, height / 2 + 60);
}

// Display the pause overlay
function displayPauseScreen() {
    fill(0, 0, 0, 60); // Darker overlay
    rect(0, 0, width, height);
    fill(0, 0, 100); // White text
    textSize(72); // Large "PAUSED"
    textAlign(CENTER, CENTER);
    text("PAUSED", width / 2, height / 2 - 30);
    textSize(24); // Instruction text
    text("Press ESC to Resume", width / 2, height / 2 + 50);
}

// Display the upgrade shop interface
function displayUpgradeShop() {
    // Background overlay
    fill(240, 60, 20, 95); // Dark blue, mostly opaque
    rect(0, 0, width, height);

    // Titles
    fill(0, 0, 100); // White text
    textSize(52);
    textAlign(CENTER, TOP);
    text(`Level ${currentLevel} Complete!`, width / 2, 60);
    textSize(36);
    text("Upgrade Shop", width / 2, 125);

    // Money display
    textSize(28);
    textAlign(CENTER, TOP);
    text(`Money: $${money}`, width / 2, 180);

    // Draw Buttons
    textSize(18); // Button text size
    textAlign(CENTER, CENTER);
    for (let button of shopButtons) {
        let cost = "?";
        let label = "";
        let isMaxed = false;
        let canAfford = false;
        let currentLevelText = "";

        // Get upgrade info based on button ID
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
        } else if (button.id === 'nextLevel') {
            label = `Start Level ${currentLevel + 1}`;
            isMaxed = false; // Always available
            canAfford = true; // No cost
        }

        // Determine button appearance (color, border)
        let buttonColor;
        let textColor = color(0, 0, 100); // Default white text
        let borderColor = color(0, 0, 85); // Default border
        let hover = (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h); // Check for mouse hover

        if (button.id !== 'nextLevel') { // Upgrade buttons
            if (isMaxed) {
                buttonColor = color(0, 0, 55); // Greyed out
                textColor = color(0, 0, 80);
                label += " (MAX)";
                borderColor = color(0, 0, 40);
            } else if (!canAfford) {
                buttonColor = color(0, 75, 50); // Reddish
                textColor = color(0, 0, 90);
                label += ` ($${cost})`;
                borderColor = color(0, 80, 70);
            } else { // Can afford
                buttonColor = hover ? color(120, 75, 65) : color(120, 70, 55); // Green, slightly brighter on hover
                label += ` ($${cost})`;
                borderColor = color(120, 80, 80);
            }
        } else { // Next Level button
            buttonColor = hover ? color(90, 75, 70) : color(90, 70, 60); // Different green, brighter on hover
            borderColor = color(90, 80, 85);
        }

        // Draw the button rectangle
        fill(buttonColor);
        stroke(borderColor);
        strokeWeight(hover ? 3 : 2); // Thicker border on hover
        rect(button.x, button.y, button.w, button.h, 8); // Rounded corners

        // Draw the button text
        fill(textColor);
        noStroke();
        text(label, button.x + button.w / 2, button.y + button.h / 2);
    }
}


// --- Main Game Logic ---
function runGameLogic() {
  // --- PAUSE CHECK ---
  if (isPaused) {
      // Draw objects in their current state without updating logic
      if (ship) ship.draw();
      for (let b of bullets) b.draw();
      for (let p of particles) p.draw(); // Particles will freeze visually
      for (let a of asteroids) a.draw();
      for (let e of enemyShips) e.draw();
      for (let eb of enemyBullets) eb.draw();
      for (let pt of potions) pt.draw();
      for (let pu of powerUps) pu.draw();
      displayHUD(); // Show HUD even when paused
      return; // Exit function early if paused
  }
  // --- END PAUSE CHECK ---

  if (!ship) return; // Should not happen in PLAYING state, but safety check

  // Update timers (only if not paused)
  if (screenShakeDuration > 0) screenShakeDuration--;
  if (screenShakeDuration <= 0) screenShakeIntensity = 0; // Reset intensity when duration ends

  // Update & Draw Game Objects
  ship.update(); ship.draw();
  // Loop backwards for safe removal during iteration
  for (let i = bullets.length - 1; i >= 0; i--) { bullets[i].update(); bullets[i].draw(); if (bullets[i].isOffscreen()) { bullets.splice(i, 1); } }
  for (let i = particles.length - 1; i >= 0; i--) { particles[i].update(); particles[i].draw(); if (particles[i].isDead()) { particles.splice(i, 1); } }
  for (let i = enemyShips.length - 1; i >= 0; i--) { enemyShips[i].update(); enemyShips[i].draw(); if (enemyShips[i].isOffscreen()) { enemyShips.splice(i, 1); } }
  for (let i = enemyBullets.length - 1; i >= 0; i--) { enemyBullets[i].update(); enemyBullets[i].draw(); if (enemyBullets[i].isOffscreen()) { enemyBullets.splice(i, 1); } }
  for (let i = asteroids.length - 1; i >= 0; i--) { if (!asteroids[i]) continue; asteroids[i].update(); asteroids[i].draw(); } // Safety check for undefined asteroids
  for (let i = powerUps.length - 1; i >= 0; i--) { powerUps[i].update(); powerUps[i].draw(); if (powerUps[i].isOffscreen()) { powerUps.splice(i, 1); } }

  // Handle Pickups and Collisions
  handlePotions(); // Includes update, draw, and pickup logic
  handleCollisions(); // Handles bullet hits and player damage
  handlePowerUps(); // Includes update, draw, and pickup logic

  // --- Spawning Logic (Only in PLAYING state) ---
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
      let maxNebulasAllowed = 3; // Max background nebulas

      // Spawn entities based on rates and limits
      if (random(1) < currentAsteroidSpawnRate && asteroids.length < maxAsteroidsAllowed) { asteroids.push(new Asteroid()); }
      if (random(1) < currentEnemySpawnRate && enemyShips.length < maxEnemiesAllowed) { enemyShips.push(new EnemyShip()); }
      if (random(1) < potionSpawnRate && potions.length < maxPotionsAllowed) { potions.push(new HealthPotion()); }
      if (random(1) < powerUpSpawnRate && powerUps.length < maxPowerUpsAllowed) { let type = floor(random(NUM_POWERUP_TYPES)); powerUps.push(new PowerUp(type)); }
      if (random(1) < nebulaSpawnRate && nebulas.length < maxNebulasAllowed) { nebulas.push(new Nebula()); }
  }

  // Display Heads Up Display if playing
  if (gameState === GAME_STATE.PLAYING) { displayHUD(); }
}


// --- Collision and Pickup Handling ---

// Handle PowerUp Pickup
function handlePowerUps() {
    // Don't handle if not playing or paused
    if (gameState !== GAME_STATE.PLAYING || !ship || isPaused) {
        // Still draw existing powerups if paused
        for (let i = powerUps.length - 1; i >= 0; i--) { powerUps[i].draw(); }
        return;
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].update(); // Update position/animation
        powerUps[i].draw();   // Draw the powerup

        // Check for collision with ship
        if (powerUps[i].hitsShip(ship)) {
            let powerUpType = powerUps[i].type;
            let pickupPos = powerUps[i].pos.copy(); // Position for particles
            let pickupColor = powerUps[i].color;   // Get color before splicing
            powerUps.splice(i, 1); // Remove powerup from array

            // Create visual effect for pickup
            createParticles(pickupPos.x, pickupPos.y, 25, pickupColor, 4, 1.8, 0.8);

            // Activate the power-up effect
            switch (powerUpType) {
                case POWERUP_TYPES.TEMP_SHIELD:
                    ship.tempShieldActive = true;
                    infoMessage = "TEMPORARY SHIELD!";
                    createParticles(ship.pos.x, ship.pos.y, 20, color(45, 90, 100)); // Particles at ship
                    // TODO: Play powerup sound (Shield)
                    break;
                case POWERUP_TYPES.RAPID_FIRE:
                    ship.rapidFireTimer = 300; // 5 seconds at 60fps
                    infoMessage = "RAPID FIRE!";
                    createParticles(ship.pos.x, ship.pos.y, 20, color(120, 90, 100)); // Particles at ship
                    // TODO: Play powerup sound (Rapid Fire)
                    break;
                case POWERUP_TYPES.EMP_BURST:
                    infoMessage = "EMP BURST!";
                    // Large particle burst originating from the ship
                    createParticles(ship.pos.x, ship.pos.y, 60, color(210, 100, 100), 12, 3.5, 1.2);
                    // Destroy existing asteroids with particles
                    for (let k = asteroids.length - 1; k >= 0; k--) {
                        createParticles(asteroids[k].pos.x, asteroids[k].pos.y, 15, asteroids[k].color, 3, 1.5);
                    }
                    asteroids = []; // Clear asteroids array
                    // Destroy existing enemy ships with particles
                    for (let k = enemyShips.length - 1; k >= 0; k--) {
                        createParticles(enemyShips[k].pos.x, enemyShips[k].pos.y, 20, color(300, 80, 90));
                    }
                    enemyShips = []; // Clear enemies array
                    // TODO: Play powerup sound (EMP)
                    break;
            }
            infoMessageTimeout = 120; // Show message for 2 seconds
        } else if (powerUps[i].isOffscreen()) {
             powerUps.splice(i, 1); // Remove if offscreen
        }
    }
}


// Handle Bullet Hits, Player Damage, and Level Progression
function handleCollisions() {
    if (gameState !== GAME_STATE.PLAYING || !ship || isPaused) return; // Exit if not in active play

    // --- Player Bullet Collisions ---
    // Bullets vs Asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        if (!asteroids[i]) continue; // Safety check
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (asteroids[i] && bullets[j] && asteroids[i].hits(bullets[j])) {
                // TODO: Play asteroid hit sound

                // Create impact sparks
                let impactParticleCount = floor(random(3, 6));
                createParticles(bullets[j].pos.x, bullets[j].pos.y, impactParticleCount, color(60, 40, 100), 2, 0.8, 0.7);

                // Award points and money
                let oldPoints = points;
                let asteroidSizeValue = asteroids[i] ? asteroids[i].size : 50; // Store size before splice
                points += floor(map(asteroidSizeValue, minAsteroidSize, 80, 5, 15));
                money += 2;

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

                // Asteroid Destruction
                let currentAsteroid = asteroids[i];
                let asteroidPos = currentAsteroid.pos.copy();
                let asteroidColor = currentAsteroid.color;
                asteroids.splice(i, 1); // Remove asteroid
                bullets.splice(j, 1);   // Remove bullet
                // Create explosion particles
                createParticles(asteroidPos.x, asteroidPos.y, floor(asteroidSizeValue / 2.5), asteroidColor, null, 1.2, 1.1);
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

                // --- Check for Level Up ---
                if (currentLevel < LEVEL_THRESHOLDS.length && points >= LEVEL_THRESHOLDS[currentLevel]) {
                    // TODO: Play level up fanfare sound
                    points += 100 * currentLevel; // Bonus points
                    money += 25 * currentLevel;  // Bonus money

                    // Transition to Upgrade Shop
                    gameState = GAME_STATE.UPGRADE_SHOP;
                    infoMessage = `Level ${currentLevel} Cleared!`;
                    infoMessageTimeout = 180;
                    setupShopButtons(); // Prepare shop UI
                    cursor(ARROW); // Show cursor

                    // Clear transient objects for the shop screen
                    bullets = [];
                    enemyShips = [];
                    enemyBullets = [];
                    powerUps = [];
                    potions = [];

                    return; // Exit collision check early
                }

                break; // Bullet hit one asteroid, move to next bullet
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
                createParticles(enemyShips[i].pos.x, enemyShips[i].pos.y, 20, color(300, 80, 90), 4, 1.5); // Enemy explosion
                enemyShips.splice(i, 1); // Remove enemy
                bullets.splice(j, 1);    // Remove bullet
                break; // Bullet hit one enemy
            }
        }
    }

    // --- Player Ship Collisions ---
    if (ship.invulnerableTimer <= 0) { // Check only if not invulnerable

        // Helper function to process damage taken by the player
        const takeDamage = (sourceObject, sourceArray, index) => {
            // TODO: Play damage/shield hit sound
            let gameOver = false;

            if (ship.tempShieldActive) { // Check temporary shield first
                ship.tempShieldActive = false; // Use up temp shield
                createParticles(ship.pos.x, ship.pos.y, 40, color(45, 100, 100), 5, 2.0); // Shield burst effect
                infoMessage = "TEMPORARY SHIELD LOST!";
                infoMessageTimeout = 90;
                // Create small particle burst at the point of impact on the shield
                if (sourceObject && sourceArray && index !== undefined) {
                    createParticles(sourceObject.pos.x, sourceObject.pos.y, 5, color(45, 90, 100));
                    if (sourceObject instanceof EnemyBullet) { sourceArray.splice(index, 1); } // Enemy bullets are destroyed by shield
                }

            } else if (ship.shieldCharges > 0) { // Check regular shields
                ship.loseShield(); // Use up one shield charge
                createParticles(ship.pos.x, ship.pos.y, 35, color(180, 80, 100), 4, 1.8); // Shield burst effect
                // Create small particle burst at the point of impact on the shield
                if (sourceObject && sourceArray && index !== undefined) {
                     createParticles(sourceObject.pos.x, sourceObject.pos.y, 5, color(180, 80, 100));
                    if (sourceObject instanceof EnemyBullet) { sourceArray.splice(index, 1); } // Enemy bullets are destroyed by shield
                }

            } else { // No shields, take hull damage
                // TODO: Play hull damage/life lost sound
                lives--; // Lose a life
                createParticles(ship.pos.x, ship.pos.y, 40, color(0, 90, 100), 5, 2.2); // Red explosion at ship
                screenShakeIntensity = 7; // Apply screen shake
                screenShakeDuration = 20;

                if (lives <= 0) { // Check for Game Over
                    gameState = GAME_STATE.GAME_OVER;
                    // TODO: Play game over sound
                    infoMessage = ""; // Clear messages
                    infoMessageTimeout = 0;
                    cursor(ARROW); // Show cursor
                    gameOver = true;
                } else {
                    ship.setInvulnerable(); // Grant brief invulnerability after hit
                }

                // Remove the colliding object (asteroid, enemy ship, enemy bullet)
                if (sourceObject && sourceArray && index !== undefined) {
                    let explosionColor = sourceObject.color || color(0, 0, 50); // Default grey
                    let particleCount = sourceObject.size ? floor(sourceObject.size / 1.5) : 20; // More particles for larger objects
                    // Specific colors/counts for different object types
                    if (sourceObject instanceof EnemyShip) { explosionColor = color(300, 80, 90); particleCount = 25; }
                    else if (sourceObject instanceof EnemyBullet) { explosionColor = color(0, 100, 100); particleCount = 8; } // Enemy bullet destruction particles
                    createParticles(sourceObject.pos.x, sourceObject.pos.y, particleCount, explosionColor);
                    sourceArray.splice(index, 1); // Remove the object
                }
            }
            return gameOver; // Return true if game ended
        };

        // Check collisions with different object types
        for (let i = asteroids.length - 1; i >= 0; i--) { if (asteroids[i] && asteroids[i].hitsShip(ship)) { if (takeDamage(asteroids[i], asteroids, i)) return; break; } }
        for (let i = enemyShips.length - 1; i >= 0; i--) { if (enemyShips[i] && enemyShips[i].hitsShip(ship)) { if (takeDamage(enemyShips[i], enemyShips, i)) return; break; } }
        for (let i = enemyBullets.length - 1; i >= 0; i--) { if (enemyBullets[i] && enemyBullets[i].hitsShip(ship)) { if (takeDamage(enemyBullets[i], enemyBullets, i)) return; break; } }
    } // End invulnerability check
}


// Handle Health Potion Pickup and Drawing
function handlePotions() {
    // Don't handle if not playing or paused
    if (gameState !== GAME_STATE.PLAYING || isPaused) {
        // Still draw existing potions if paused
        for (let i = potions.length - 1; i >= 0; i--) { potions[i].draw(); }
        return;
    }

    for (let i = potions.length - 1; i >= 0; i--) {
        potions[i].update(); // Update position/animation
        potions[i].draw();   // Draw the potion

        // Check for collision with ship
        if (potions[i].hitsShip(ship)) {
            // TODO: Play potion pickup sound
            // Create pickup particle effect
            createParticles(potions[i].pos.x, potions[i].pos.y, 20, color(0, 80, 100), 4, 1.5);

            // Apply health or points bonus
            if (lives < MAX_LIVES) {
                lives++;
                infoMessage = "+1 LIFE!";
                infoMessageTimeout = 90;
            } else { // Give points if at max lives
                points += 25;
                infoMessage = "+25 POINTS (MAX LIVES)!";
                infoMessageTimeout = 90;
            }
            potions.splice(i, 1); // Remove potion
        } else if (potions[i].isOffscreen()) {
            potions.splice(i, 1); // Remove if offscreen
        }
    }
}


// --- Background Drawing Functions ---

// Draw Background Gradient, Stars, Nebulas, and Scenery
function drawBackgroundAndStars() {
    // Draw Gradient Background
    for(let y=0; y < height; y++){
        let inter = map(y, 0, height, 0, 1); // Interpolation factor
        let c = lerpColor(currentTopColor, currentBottomColor, inter); // Calculate color
        stroke(c); // Use color for line
        line(0, y, width, y); // Draw horizontal line
    }
    noStroke(); // Disable stroke for subsequent elements

    // Update and Draw Nebulas
    for (let i = nebulas.length - 1; i >= 0; i--) {
        if (gameState === GAME_STATE.PLAYING && !isPaused) nebulas[i].update(); // Only update if playing
        nebulas[i].draw();
        if (nebulas[i].isOffscreen()) { nebulas.splice(i, 1); } // Remove if offscreen
    }

    // Draw Distant Scenery
    drawBlackHole();
    drawGalaxy();
    if (planetVisible) { drawPlanet(); }

    // Update and Draw Shooting Stars
     for (let i = shootingStars.length - 1; i >= 0; i--) {
         if (gameState === GAME_STATE.PLAYING && !isPaused) shootingStars[i].update(); // Only update if playing
         shootingStars[i].draw();
         if (shootingStars[i].isDone()) { shootingStars.splice(i, 1); } // Remove if faded/offscreen
     }

    // Update and Draw Stars
    for (let star of stars) {
        if (gameState === GAME_STATE.PLAYING && !isPaused) star.update(); // Only update if playing
        star.draw();
    }
}

// Draw distant black hole effect (Modified for less jitter)
function drawBlackHole() {
    push(); // Isolate transformations and styles
    let bhX = width * 0.8; // Position X
    let bhY = height * 0.2; // Position Y
    let bhSize = width * 0.05; // Base size

    // Black center (slightly larger)
    fill(0);
    noStroke();
    ellipse(bhX, bhY, bhSize * 1.1, bhSize * 1.1);

    // Accretion disk / lensing effect
    let ringCount = 7; // Number of rings
    let maxRingSize = bhSize * 3.5; // Outer ring size
    let minRingSize = bhSize * 1.2; // Inner ring size
    noFill(); // Rings are outlines

    // Use frameCount for slow, deterministic variation instead of pure random jitter each frame
    let slowVariation = sin(frameCount * 0.01); // Slow sine wave for subtle changes

    for (let i = 0; i < ringCount; i++) {
        // Calculate size with slow oscillation
        let sizeFactor = lerp(0.95, 1.05, (sin(frameCount * 0.02 + i * 0.5) + 1) / 2);
        let size = lerp(minRingSize, maxRingSize, i / (ringCount - 1)) * sizeFactor;
        // Calculate hue with slow shift
        let hue = lerp(0, 60, i / (ringCount - 1)) + sin(frameCount * 0.03 + i) * 5; // Yellow/Orange hues
        // Calculate alpha (fades out) and stroke weight (thicker inner rings)
        let alpha = map(i, 0, ringCount - 1, 50, 3);
        let sw = map(i, 0, ringCount - 1, 1.5, 5);
        strokeWeight(sw);
        stroke(hue, 90, 90, alpha); // Set ring color and transparency

        // Draw the ellipse without random positional/size jitter
        ellipse(bhX, bhY, size, size);
    }
    pop(); // Restore previous drawing state
}


// Draw distant galaxy effect
function drawGalaxy() {
    push(); // Isolate transformations and styles
    let centerX = width / 2;
    let centerY = height / 2;
    let baseHue1 = 270; // Purple
    let baseHue2 = 200; // Cyan
    let alphaVal = 2.5; // Slightly more visible
    let angle = frameCount * 0.0003; // Slow rotation

    translate(centerX, centerY); // Move origin to center
    rotate(angle); // Rotate coordinate system
    translate(-centerX, -centerY); // Move origin back

    noStroke();
    // Draw multiple layered ellipses for galaxy arms (slightly larger)
    fill(baseHue1, 50, 60, alphaVal);
    ellipse(centerX - width * 0.1, centerY - height * 0.1, width * 1.3, height * 0.35);
    fill(baseHue2, 60, 70, alphaVal);
    ellipse(centerX + width * 0.15, centerY + height * 0.05, width * 1.2, height * 0.45);
    fill((baseHue1 + baseHue2) / 2, 55, 65, alphaVal * 0.9); // Blend color
    ellipse(centerX, centerY, width * 1.0, height * 0.55);
    pop(); // Restore previous drawing state
}

// Draw the occasional background planet
function drawPlanet() {
    push(); // Isolate transformations and styles
    translate(planetPos.x, planetPos.y); // Move to planet position
    noStroke();

    // Base planet color
    fill(planetBaseColor);
    ellipse(0, 0, planetSize, planetSize);

    // Add detail using arcs
    fill(planetDetailColor1);
    arc(0, 0, planetSize, planetSize, PI * 0.1, PI * 0.6, OPEN); // Use OPEN type for arcs
    arc(0, 0, planetSize * 0.8, planetSize * 0.8, PI * 0.7, PI * 1.2, OPEN);
    fill(planetDetailColor2);
    arc(0, 0, planetSize * 0.9, planetSize * 0.9, PI * 1.3, PI * 1.9, OPEN);

    // Add a slightly thicker atmospheric ring
    noFill();
    strokeWeight(planetSize * 0.06); // Thicker stroke
    stroke(hue(planetBaseColor), 20, 100, 20); // Faint whiteish ring, slightly more opaque
    ellipse(0, 0, planetSize * 1.06, planetSize * 1.06); // Slightly larger diameter
    pop(); // Restore previous drawing state
}

// Display Heads Up Display (Score, Lives, etc.) with backgrounds
function displayHUD() {
    let hudTextSize = 18;
    let hudPadding = 8; // Padding inside background rects
    let lineSpacing = 25; // Vertical space between lines
    let topMargin = 15;
    let leftMargin = 15;
    textSize(hudTextSize);
    noStroke();

    // Helper function to draw text with a semi-transparent background
    const drawHudText = (txt, x, y, alignment) => {
        textAlign(alignment, TOP); // Set text alignment
        let txtWidth = textWidth(txt); // Get text width for background sizing
        fill(0, 0, 0, 40); // Semi-transparent black background
        // Draw background rectangle based on alignment
        if (alignment === LEFT) {
            rect(x - hudPadding / 2, y - hudPadding / 2, txtWidth + hudPadding, hudTextSize + hudPadding, 3); // Rounded corners
        } else if (alignment === RIGHT) {
            rect(x + hudPadding / 2 - (txtWidth + hudPadding), y - hudPadding / 2, txtWidth + hudPadding, hudTextSize + hudPadding, 3);
        }
        fill(0, 0, 100, 90); // Brighter white text
        text(txt, x, y); // Draw the text
    };

    // Draw Left-Aligned Info
    drawHudText("Points: " + points, leftMargin, topMargin, LEFT);
    drawHudText(`Money: $${money}`, leftMargin, topMargin + lineSpacing, LEFT);
    drawHudText(`Lives: ${lives} / ${MAX_LIVES}`, leftMargin, topMargin + lineSpacing * 2, LEFT);
    drawHudText(`Shields: ${ship.shieldCharges} / ${MAX_SHIELD_CHARGES}`, leftMargin, topMargin + lineSpacing * 3, LEFT);
    drawHudText(`Level: ${currentLevel}`, leftMargin, topMargin + lineSpacing * 4, LEFT);

    // Draw Right-Aligned Info
    let rightMargin = width - leftMargin; // Calculate right margin position
    drawHudText(`Rate Lvl: ${ship.fireRateLevel}/${ship.maxLevel}`, rightMargin, topMargin, RIGHT);
    drawHudText(`Spread Lvl: ${ship.spreadShotLevel}/${ship.maxLevel}`, rightMargin, topMargin + lineSpacing, RIGHT);
}

// Display temporary info messages with background
function displayInfoMessage() {
    fill(0, 0, 100); // White text
    textSize(18); // Slightly larger text
    textAlign(CENTER, BOTTOM);
    // Draw background rectangle behind message
    fill(0, 0, 0, 40); // Semi-transparent black
    rect(width / 2 - textWidth(infoMessage) / 2 - 10, height - 45, textWidth(infoMessage) + 20, 30, 5); // Centered rect
    fill(0, 0, 100); // White text again
    text(infoMessage, width / 2, height - 25); // Draw message text
}

// Display Game Over Screen
function displayGameOver() {
    fill(0, 0, 0, 60); // Darker overlay
    rect(0, 0, width, height);

    fill(0, 90, 100); // Red "GAME OVER"
    textSize(72); // Larger text
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 3);

    fill(0, 0, 100); // White text for score
    textSize(36); // Larger score text
    text("Final Points: " + points, width / 2, height / 3 + 70);

    textAlign(CENTER, CENTER);
    textSize(24); // Restart instruction text size
    // Pulsing text effect
    let pulse = map(sin(frameCount * 0.1), -1, 1, 70, 100);
    fill(0, 0, pulse); // White, pulsing brightness
    let restartInstruction = isMobile ? "Tap Screen to Restart" : "Click or Press Enter to Restart";
    text(restartInstruction, width / 2, height * 0.7);
    cursor(ARROW); // Ensure cursor is visible
}

// --- Game State Control ---

// Reset game variables to initial state
function resetGame() {
    ship = new Ship(); // Create a new ship
    // Clear all game object arrays
    bullets = []; particles = []; asteroids = []; potions = []; enemyShips = []; enemyBullets = []; powerUps = []; nebulas = []; shootingStars = [];
    // Reset score, resources, level
    points = 0; money = 0; lives = 3; currentLevel = 1;
    setDifficultyForLevel(currentLevel); // Set initial difficulty
    // Reset background state
    currentTopColor = color(260, 80, 10); currentBottomColor = color(240, 70, 25); lastPlanetAppearanceTime = -Infinity; planetVisible = false;
    // Reset timers and flags
    frameCount = 0; infoMessage = ""; infoMessageTimeout = 0; screenShakeDuration = 0; screenShakeIntensity = 0; isPaused = false; levelTransitionFlash = 0;
    cursor(); // Use default game cursor
    spawnInitialAsteroids(); // Spawn starting asteroids
}

// Start a new game
function startGame() {
    resetGame(); // Reset all variables
    gameState = GAME_STATE.PLAYING; // Set state to playing
}

// Proceed to the next level from the shop
function startNextLevel() {
    if (gameState !== GAME_STATE.UPGRADE_SHOP) return; // Only works from shop

    currentLevel++; // Increment level
    setDifficultyForLevel(currentLevel); // Update difficulty settings
    ship.resetPositionForNewLevel(); // Reset ship position, keep upgrades
    asteroids = []; // Clear any remaining asteroids (optional)

    // Reset timers and apply visual flash
    frameCount = 0;
    infoMessage = `Starting Level ${currentLevel}`;
    infoMessageTimeout = 90;
    levelTransitionFlash = 15; // Start white flash effect (longer)

    spawnInitialAsteroids(); // Spawn initial asteroids for new level
    gameState = GAME_STATE.PLAYING; // Set state back to playing
    cursor(); // Hide cursor again for gameplay
}


// --- Input Handling ---

// Handle Mouse Clicks
function mousePressed() {
    if (gameState === GAME_STATE.START_SCREEN) { startGame(); } // Start game from start screen
    else if (gameState === GAME_STATE.PLAYING && !isPaused) { ship.shoot(); /* TODO: Play shoot sound */ } // Shoot in game
    else if (gameState === GAME_STATE.UPGRADE_SHOP) { // Handle shop button clicks
        for (let button of shopButtons) {
            if (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h) {
                handleShopButtonPress(button.id);
                break; // Handle only one button press
            }
        }
    } else if (gameState === GAME_STATE.GAME_OVER) { startGame(); } // Restart game from game over
}

// Handle Keyboard Presses
function keyPressed() {
    if (keyCode === ESCAPE && gameState === GAME_STATE.PLAYING) { // Toggle pause
        isPaused = !isPaused;
        if (isPaused) cursor(ARROW); else cursor(); // Show/hide cursor
    } else if (gameState === GAME_STATE.START_SCREEN) { // Start game
        if (keyCode === ENTER || keyCode === RETURN) { startGame(); }
    } else if (gameState === GAME_STATE.PLAYING && !isPaused) { // Shoot
        if (keyCode === 32) { // Spacebar
            ship.shoot();
            // TODO: Play shoot sound (spacebar press)
            return false; // Prevent default browser scroll behavior
        }
    } else if (gameState === GAME_STATE.UPGRADE_SHOP) { // Go to next level
        if (keyCode === ENTER || keyCode === RETURN) { handleShopButtonPress('nextLevel'); }
    } else if (gameState === GAME_STATE.GAME_OVER) { // Restart game
        if (keyCode === ENTER || keyCode === RETURN) { startGame(); }
    }
}

// Handle Touch Input
function touchStarted() {
    if (touches.length === 0) return false; // Safety check
    let touchX = touches[0].x;
    let touchY = touches[0].y;

    if (gameState === GAME_STATE.START_SCREEN) { startGame(); return false; } // Start game
    else if (gameState === GAME_STATE.GAME_OVER) { startGame(); return false; } // Restart game
    else if (gameState === GAME_STATE.UPGRADE_SHOP) { // Handle shop button touches
        for (let button of shopButtons) {
            if (touchX > button.x && touchX < button.x + button.w && touchY > button.y && touchY < button.y + button.h) {
                handleShopButtonPress(button.id);
                return false; // Consume touch
            }
        }
        return false; // Don't process movement touches in shop
    } else if (gameState === GAME_STATE.PLAYING && !isPaused) { // Shoot in game
        ship.shoot();
        // TODO: Play shoot sound (tap)
        return false; // Consume touch
    }
    return false; // Default prevent default
}

// Handle Shop Button Logic (Purchase or Next Level)
function handleShopButtonPress(buttonId) {
    if (gameState !== GAME_STATE.UPGRADE_SHOP) return;

    if (buttonId === 'nextLevel') {
        startNextLevel();
        // TODO: Play UI confirm/next level sound
    } else { // Attempt upgrade purchase
        let success = ship.attemptUpgrade(buttonId);
        if (success) {
            // TODO: Play upgrade success sound
            // Add particle effect at button location
            let button = shopButtons.find(b => b.id === buttonId);
            if (button) {
                createParticles(button.x + button.w / 2, button.y + button.h / 2, 20, color(120, 80, 100), 6, 2.0, 0.8); // Greenish particles
            }
        } else {
            // TODO: Play UI error/cannot afford sound (optional)
            // Show message if failed
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
    resizeCanvas(windowWidth, windowHeight); // Adjust canvas size
    createStarfield(200); // Recreate stars for new size
    if (gameState === GAME_STATE.UPGRADE_SHOP) {
        setupShopButtons(); // Reposition shop buttons
    }
}




// ==================
// Ship Class
// ==================
class Ship {
    constructor() {
        this.pos = createVector(width / 2, height - 50); // Initial position
        this.vel = createVector(0, 0); // Initial velocity
        this.thrust = 0.38; // Acceleration force (Reduced)
        this.touchThrustMultiplier = 1.15; // Factor for touch movement responsiveness
        this.friction = 0.975; // Slows down ship (less friction)
        this.maxSpeed = 9.5; // Maximum speed
        this.size = 30; // Base size for collision/drawing

        // Colors
        this.cockpitColor = color(180, 100, 100); // Cyan
        this.baseEngineColor1 = color(30, 100, 100); // Base Orange
        this.baseEngineColor2 = color(0, 100, 100); // Base Red
        this.finColor = color(220, 60, 70); // Blueish-grey
        this.detailColor = color(0, 0, 60); // Dark grey

        // State & Abilities
        this.shapeState = 0; // For visual evolution
        this.shootCooldown = 0; // Timer between shots
        this.baseShootDelay = 15; // Base frames between shots
        this.shootDelayPerLevel = 2; // Reduction per fire rate level
        this.shieldCharges = 0; // Current shield points
        this.shieldVisualRadius = this.size * 1.2; // Visual size of shield
        this.invulnerableTimer = 0; // Timer after taking damage
        this.invulnerabilityDuration = 120; // Frames of invulnerability

        // Upgrades
        this.maxLevel = 5; // Max level for rate/spread
        this.fireRateLevel = 0;
        this.spreadShotLevel = 0;
        this.baseUpgradeCost = 30; // Starting cost
        this.costMultiplier = 2.0; // Cost increase factor

        // Temporary Power-Up States
        this.rapidFireTimer = 0;
        this.tempShieldActive = false;
        this.hoverOffset = 0; // For hover animation
    }

    // Add shield charges
    gainShields(amount) {
        let currentCharges = this.shieldCharges;
        this.shieldCharges = min(this.shieldCharges + amount, MAX_SHIELD_CHARGES);
        return this.shieldCharges - currentCharges; // Return amount added
    }

    // Remove one shield charge
    loseShield() { if (this.shieldCharges > 0) { this.shieldCharges--; } }

    // Activate temporary invulnerability
    setInvulnerable() { this.invulnerableTimer = this.invulnerabilityDuration; }

    // Change visual appearance based on points milestones
    changeShape(level) { this.shapeState = (level % 2); } // Simple toggle

    // Calculate current shooting delay
    get currentShootDelay() {
        if (this.rapidFireTimer > 0) { return 2; } // Fast during powerup
        else { return max(3, this.baseShootDelay - (this.fireRateLevel * this.shootDelayPerLevel)); } // Based on upgrade
    }

    // Get the cost of the next upgrade level
    getUpgradeCost(upgradeType) {
        let level;
        if (upgradeType === 'fireRate') { level = this.fireRateLevel; if (level >= this.maxLevel) return "MAX"; return floor(this.baseUpgradeCost * pow(this.costMultiplier, level)); }
        else if (upgradeType === 'spreadShot') { level = this.spreadShotLevel; if (level >= this.maxLevel) return "MAX"; return floor(this.baseUpgradeCost * pow(this.costMultiplier, level)); }
        else { return Infinity; } // Should not happen
    }

    // Attempt to purchase an upgrade
    attemptUpgrade(upgradeType) {
        let cost = this.getUpgradeCost(upgradeType);
        if (typeof cost !== 'number') return false; // Already maxed

        let currentLevel, maxLevelForType;
        if (upgradeType === 'fireRate') { currentLevel = this.fireRateLevel; maxLevelForType = this.maxLevel; }
        else if (upgradeType === 'spreadShot') { currentLevel = this.spreadShotLevel; maxLevelForType = this.maxLevel; }
        else { return false; } // Invalid type

        if (currentLevel < maxLevelForType && money >= cost) { // Check affordability and level cap
            money -= cost; // Deduct cost
            // Increment level
            if (upgradeType === 'fireRate') this.fireRateLevel++;
            else if (upgradeType === 'spreadShot') this.spreadShotLevel++;
            return true; // Success
        } else {
            return false; // Failed
        }
    }

    // Reset ship state for a new level (keep upgrades)
    resetPositionForNewLevel() {
        this.pos.set(width / 2, height - 50); // Reset position
        this.vel.set(0, 0); // Reset velocity
        this.invulnerableTimer = 60; // Brief invulnerability
        this.rapidFireTimer = 0; // End powerups
        this.tempShieldActive = false;
    }

    // Update ship position, velocity, timers, and handle input
    update() {
        // Decrement timers
        if (this.invulnerableTimer > 0) { this.invulnerableTimer--; }
        if (this.rapidFireTimer > 0) { this.rapidFireTimer--; }
        if (this.shootCooldown > 0) { this.shootCooldown--; }

        // Hover animation offset
        this.hoverOffset = sin(frameCount * 0.05) * 2; // Slow bobbing

        // --- Handle Movement Input ---
        let isTouching = touches.length > 0;
        let acceleration = createVector(0, 0);
        let applyThrustParticles = false; // Flag to spawn particles

        if (isTouching) { // Touch controls
            let touchPos = createVector(touches[0].x, touches[0].y);
            let direction = p5.Vector.sub(touchPos, this.pos);
            if (direction.magSq() > 1) { // Only move if touch is away from ship center
                direction.normalize();
                let targetVel = direction.mult(this.maxSpeed * this.touchThrustMultiplier);
                this.vel.lerp(targetVel, 0.15); // Smoothly move towards touch
                applyThrustParticles = true; // Moving via touch
            }
        } else { // Keyboard controls
            let movingUp = keyIsDown(UP_ARROW) || keyIsDown(87); // W
            let movingDown = keyIsDown(DOWN_ARROW) || keyIsDown(83); // S
            let movingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65); // A
            let movingRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68); // D

            // Apply acceleration based on keys pressed
            if (movingUp) { acceleration.y -= this.thrust; applyThrustParticles = true; }
            if (movingDown) { acceleration.y += this.thrust; /* No particles for reverse? */ }
            if (movingLeft) { acceleration.x -= this.thrust; applyThrustParticles = true; }
            if (movingRight) { acceleration.x += this.thrust; applyThrustParticles = true; }
            this.vel.add(acceleration); // Add acceleration to velocity
            this.vel.mult(this.friction); // Apply friction
        }

        // Spawn thrust particles if accelerating forward/sideways
        if (applyThrustParticles && frameCount % 3 === 0) { // Limit spawn rate
            let thrustColor = lerpColor(this.baseEngineColor1, color(60, 100, 100), this.fireRateLevel / this.maxLevel); // Color shifts with upgrade
            // Spawn particle behind the ship, slightly randomized
            createParticles(this.pos.x, this.pos.y + this.size * 0.55, 1, thrustColor, 3, 1.5, 0.5);
        }

        // Limit speed and update position
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);

        // Keep ship within screen bounds
        let margin = this.size * 0.7;
        this.pos.x = constrain(this.pos.x, margin, width - margin);
        this.pos.y = constrain(this.pos.y, margin, height - margin);
    }

    // Create bullets based on upgrades
    shoot() {
        if (this.shootCooldown <= 0) { // Only shoot if cooldown is ready
            let originY = this.pos.y - this.size * 0.6 + this.hoverOffset; // Base Y origin + hover
            let originPoints = [createVector(this.pos.x, originY)]; // Default center

            // Determine number/position of bullet origins based on spread level
            if (this.spreadShotLevel >= 1 && this.spreadShotLevel <= 2) { let offset = this.size * 0.15; originPoints = [ createVector(this.pos.x - offset, originY + 5), createVector(this.pos.x, originY), createVector(this.pos.x + offset, originY + 5) ]; }
            else if (this.spreadShotLevel >= 3 && this.spreadShotLevel <= 4) { let offset = this.size * 0.2; originPoints = [ createVector(this.pos.x - offset, originY + 5), createVector(this.pos.x, originY), createVector(this.pos.x + offset, originY + 5) ]; }
            else if (this.spreadShotLevel >= this.maxLevel) { let offset1 = this.size * 0.25; let offset2 = this.size * 0.1; originPoints = [ createVector(this.pos.x - offset1, originY + 8), createVector(this.pos.x - offset2, originY + 3), createVector(this.pos.x, originY), createVector(this.pos.x + offset2, originY + 3), createVector(this.pos.x + offset1, originY + 8) ]; }

            // Determine number of shots and spread angle
            let numShots = 1; let spreadAngle = 0;
            if (this.spreadShotLevel >= 1 && this.spreadShotLevel <= 2) { numShots = 3; spreadAngle = PI / 20; }
            else if (this.spreadShotLevel >= 3 && this.spreadShotLevel <= 4) { numShots = 3; spreadAngle = PI / 15; }
            else if (this.spreadShotLevel >= this.maxLevel) { numShots = 5; spreadAngle = PI / 12; }

            // Create bullets
            for (let i = 0; i < numShots; i++) {
                let angle = 0; if (numShots > 1) { angle = map(i, 0, numShots - 1, -spreadAngle, spreadAngle); } // Calculate angle for spread
                let origin = originPoints[i] || originPoints[0]; // Use specific origin or default to center
                bullets.push(new Bullet(origin.x, origin.y, angle)); // Create new bullet
            }
            this.shootCooldown = this.currentShootDelay; // Reset cooldown
        }
    }

    // Draw the ship, shields, and engine effects
    draw() {
        // Blinking effect when invulnerable
        if (this.invulnerableTimer <= 0 || (this.invulnerableTimer > 0 && frameCount % 10 < 5)) {
            push(); // Isolate transformations and styles
            translate(this.pos.x, this.pos.y + this.hoverOffset); // Apply hover offset

            // --- Draw Shields (if active) ---
            if (this.tempShieldActive) { // Temporary Shield (Yellow)
                let tempShieldAlpha = map(sin(frameCount * 0.3), -1, 1, 60, 100); // Pulsing alpha
                let tempShieldHue = 45;
                fill(tempShieldHue, 90, 100, tempShieldAlpha); noStroke();
                ellipse(0, 0, this.shieldVisualRadius * 2.3, this.shieldVisualRadius * 2.3); // Fill
                strokeWeight(2.5); stroke(tempShieldHue, 100, 100, tempShieldAlpha + 25); noFill();
                ellipse(0, 0, this.shieldVisualRadius * 2.3, this.shieldVisualRadius * 2.3); // Outline
            } else if (this.shieldCharges > 0) { // Regular Shield (Cyan)
                let shieldAlpha = map(sin(frameCount * 0.2), -1, 1, 50, 90); // Pulsing alpha
                let shieldHue = 180;
                fill(shieldHue, 80, 100, shieldAlpha); noStroke();
                ellipse(0, 0, this.shieldVisualRadius * 2.1, this.shieldVisualRadius * 2.1); // Fill
                strokeWeight(2); stroke(shieldHue, 90, 100, shieldAlpha + 35); noFill();
                ellipse(0, 0, this.shieldVisualRadius * 2.1, this.shieldVisualRadius * 2.1); // Outline
            }

            // --- Draw Engine Thrust Effect ---
            let enginePulseFactor = 1.0 + this.vel.mag() * 0.4; // More pulse when moving faster
            let pulseSpeed = (this.rapidFireTimer > 0) ? 0.5 : 0.25; // Faster pulse during rapid fire
            let enginePulse = map(sin(frameCount * pulseSpeed), -1, 1, 0.8, 1.3) * enginePulseFactor;
            let engineSize = this.size * 0.55 * enginePulse; // Base size pulsating
            let engineBrightness = map(sin(frameCount * 0.35), -1, 1, 85, 100); // Flickering brightness
            noStroke();
            // Lerp engine colors based on fire rate level (shifts towards yellow/white)
            let engineColor1 = lerpColor(this.baseEngineColor1, color(60, 90, 100), this.fireRateLevel / this.maxLevel);
            let engineColor2 = lerpColor(this.baseEngineColor2, color(45, 90, 100), this.fireRateLevel / this.maxLevel);

            // Draw outer glow (color shifts with upgrade) - SMALLER EFFECT
            for (let i = engineSize * 1.2; i > 0; i -= 3) { // Reduced start size multiplier (was 1.6)
                let alpha = map(i, 0, engineSize * 1.2, 0, 30); // Adjusted alpha map range, reduced max alpha (was 35)
                fill(hue(engineColor2), saturation(engineColor2), engineBrightness, alpha);
                // Reduced ellipse size multipliers (was i, i * 1.6) -> (i * 0.8, i * 1.2)
                ellipse(0, this.size * 0.55, i * 0.8, i * 1.2); // Draw smaller, less elongated glow segment
            }
            // Draw inner core (color shifts with upgrade) - SMALLER EFFECT
            fill(hue(engineColor1), saturation(engineColor1), 100);
            // Reduced ellipse size multipliers (was engineSize * 0.7, engineSize * 1.3) -> (engineSize * 0.5, engineSize * 1.0)
            ellipse(0, this.size * 0.55, engineSize * 0.5, engineSize * 1.0); // Draw smaller core

            // --- Draw Ship Body ---
            stroke(0, 0, 85); // Darker outline
            strokeWeight(1.5);
            let pointsHue = (200 + points * 0.2) % 360; // Body hue shifts subtly with points
            fill(pointsHue, 85, 98); // Main body color (brighter)
            let bodyWidthFactor = 0.6; // Relative width
            beginShape(); // Draw main body shape using vertices and Bezier curves
            if (this.shapeState === 0) { // Base shape
                vertex(0, -this.size * 0.7);
                bezierVertex( this.size * bodyWidthFactor * 0.8, -this.size * 0.3, this.size * bodyWidthFactor * 0.9, this.size * 0.0, this.size * bodyWidthFactor * 1.0, this.size * 0.4);
                bezierVertex( this.size * bodyWidthFactor * 0.5, this.size * 0.6, -this.size * bodyWidthFactor * 0.5, this.size * 0.6, -this.size * bodyWidthFactor * 1.0, this.size * 0.4);
                bezierVertex(-this.size * bodyWidthFactor * 0.9, this.size * 0.0, -this.size * bodyWidthFactor * 0.8, -this.size * 0.3, 0, -this.size * 0.7);
            } else { // Evolved shape (slightly larger/different curves)
                let s = this.size * 1.1; let evolvedWidthFactor = bodyWidthFactor * 1.1;
                vertex(0, -s * 0.8);
                bezierVertex( s * evolvedWidthFactor * 0.8, -s * 0.2, s * evolvedWidthFactor * 0.9, s * 0.1, s * evolvedWidthFactor * 1.0, s * 0.5);
                bezierVertex( s * evolvedWidthFactor * 0.5, s * 0.7, -s * evolvedWidthFactor * 0.5, s * 0.7, -s * evolvedWidthFactor * 1.0, s * 0.5);
                bezierVertex(-s * evolvedWidthFactor * 0.9, s * 0.1, -s * evolvedWidthFactor * 0.8, -s * 0.2, 0, -s * 0.8);
            }
            endShape(CLOSE);

            // --- Draw Details (Lines, Fins, Cockpit) ---
            strokeWeight(1.2); stroke(this.detailColor); // Detail lines
            if (this.shapeState === 0) { line(-this.size * bodyWidthFactor * 0.5, -this.size * 0.1, -this.size * bodyWidthFactor * 0.75, this.size * 0.3); line( this.size * bodyWidthFactor * 0.5, -this.size * 0.1, this.size * bodyWidthFactor * 0.75, this.size * 0.3); }
            else { let s = this.size * 1.1; let ewf = bodyWidthFactor * 1.1; line(-s * ewf * 0.6, -s * 0.05, -s * ewf * 0.8, s * 0.4); line( s * ewf * 0.6, -s * 0.05, s * ewf * 0.8, s * 0.4); line(0, -s*0.4, 0, s*0.1); }
            // Fins (shape changes slightly with state)
            let finYOffset = this.shapeState === 0 ? this.size * 0.3 : this.size * 1.1 * 0.35; let finXBase = this.shapeState === 0 ? this.size * bodyWidthFactor * 0.6 : this.size * 1.1 * bodyWidthFactor * 1.1 * 0.7; let finTipX = this.shapeState === 0 ? this.size * bodyWidthFactor * 1.1 : this.size * 1.1 * bodyWidthFactor * 1.1 * 1.1; let finRearX = this.shapeState === 0 ? this.size * bodyWidthFactor * 0.75 : this.size * 1.1 * bodyWidthFactor * 1.1 * 0.8; let finRearY = this.shapeState === 0 ? this.size * 0.6 : this.size * 1.1 * 0.7;
            fill(this.finColor); stroke(0, 0, 65); strokeWeight(1); // Fin color and outline
            triangle( finXBase, finYOffset, finTipX, finYOffset + this.size*0.1, finRearX, finRearY); // Right fin
            triangle(-finXBase, finYOffset, -finTipX, finYOffset + this.size*0.1, -finRearX, finRearY); // Left fin
            // Cockpit
            fill(this.cockpitColor); noStroke(); ellipse(0, -this.size * 0.15, this.size * 0.4, this.size * 0.5); // Main shape
            fill(0, 0, 100, 60); ellipse(0, -this.size * 0.2, this.size * 0.25, this.size * 0.3); // Reflection

            pop(); // Restore previous drawing state
        } // End invulnerability blink check
    }
}


// ==================
// Bullet Class
// ==================
class Bullet {
    constructor(x, y, angle = 0) {
        this.pos = createVector(x, y); // Position
        this.speed = 17; // Speed
        this.size = 5.5; // Size
        this.startHue = frameCount % 360; // Initial hue for rainbow effect
        this.hue = this.startHue;
        let baseAngle = -PI / 2; // Upwards angle
        this.vel = p5.Vector.fromAngle(baseAngle + angle); // Calculate velocity vector
        this.vel.mult(this.speed); // Apply speed
        this.trail = []; // Array for trail positions
        this.trailLength = 5; // Max trail segments
    }

    update() {
        // Add current position to the beginning of the trail array
        this.trail.unshift(this.pos.copy());
        // Remove the oldest position if the trail exceeds the maximum length
        if (this.trail.length > this.trailLength) { this.trail.pop(); }

        this.pos.add(this.vel); // Move bullet
        this.hue = (this.hue + 5) % 360; // Cycle hue faster
    }

    draw() {
        // Draw Trail segments
        noStroke();
        for (let i = 0; i < this.trail.length; i++) {
            let trailPos = this.trail[i];
            // Alpha fades out along the trail
            let alpha = map(i, 0, this.trail.length - 1, 50, 0);
            // Size shrinks along the trail
            let trailSize = map(i, 0, this.trail.length - 1, this.size, this.size * 0.5);
            fill(this.hue, 90, 100, alpha); // Use bullet hue, fade alpha
            ellipse(trailPos.x, trailPos.y, trailSize, trailSize * 2.0); // Draw trail segment
        }

        // Draw Main Bullet Head
        fill(this.hue, 95, 100); // Brighter head color
        stroke(0, 0, 100); // White outline
        strokeWeight(1);
        ellipse(this.pos.x, this.pos.y, this.size, this.size * 2.5); // Elongated shape
    }

    // Check if bullet is off screen
    isOffscreen() {
        let margin = this.size * 5; // Generous margin
        return (this.pos.y < -margin || this.pos.y > height + margin ||
                this.pos.x < -margin || this.pos.x > width + margin);
    }
}


// ==================
// Asteroid Class
// ==================
class Asteroid {
    constructor(x, y, size, vel) {
        this.size = size || random(30, 85); // Use provided size or random
        this.pos = createVector(); // Position vector

        // Determine initial position
        let isInitialPlacement = (x !== undefined && y !== undefined);
        if (isInitialPlacement) { this.pos.x = x; this.pos.y = y; } // Use provided position
        else { // Spawn randomly offscreen (Top, Left, Right edges)
            let edge = floor(random(3));
            if (edge === 0) { this.pos.x = random(width); this.pos.y = -this.size / 2; }
            else if (edge === 1) { this.pos.x = width + this.size / 2; this.pos.y = random(height * 0.7); }
            else { this.pos.x = -this.size / 2; this.pos.y = random(height * 0.7); }
        }

        // Determine velocity
        if (vel) { this.vel = vel; } // Use provided velocity (for splits)
        else { // Calculate random velocity towards center area
            let baseSpeedMin = 0.6 + (currentLevel - 1) * 0.1;
            let baseSpeedMax = 1.8 + (currentLevel - 1) * 0.2;
            this.speed = min(MAX_ASTEROID_SPEED, random(baseSpeedMin, baseSpeedMax)); // Scale speed, cap maximum
            this.speed *= (this.size > 50 ? 0.9 : 1.1); // Size affects speed slightly
            this.speed *= random(0.9, 1.1); // Random speed variation
            if (isInitialPlacement) { this.vel = p5.Vector.random2D(); } // Random direction if placed initially
            else { // Aim towards center from edge
                let targetX = width / 2 + random(-width * 0.25, width * 0.25);
                let targetY = height / 2 + random(-height * 0.25, height * 0.25);
                let direction = createVector(targetX - this.pos.x, targetY - this.pos.y);
                direction.normalize();
                direction.rotate(random(-PI / 12, PI / 12)); // Slight angle variation
                this.vel = direction;
            }
            this.vel.mult(this.speed); // Apply speed to velocity vector
        }

        // Visual properties
        this.color = color(random(20, 50), random(30, 70), random(35, 65)); // Brown/grey tones
        this.rotation = random(TWO_PI); // Initial rotation
        this.rotationSpeed = random(-0.04, 0.04); // Rotation speed
        this.rotationAccel = 0.0001; // Slight change in rotation speed over time

        // Generate irregular shape vertices
        this.vertices = [];
        let numVertices = floor(random(9, 18)); // More vertices for detail
        for (let i = 0; i < numVertices; i++) {
            let angleOffset = map(i, 0, numVertices, 0, TWO_PI);
            let r = this.size / 2 + random(-this.size * 0.45, this.size * 0.35); // Vary radius
            let v = p5.Vector.fromAngle(angleOffset);
            v.mult(r);
            this.vertices.push(v);
        }

        // Add craters for detail
        this.craters = [];
        let numCraters = floor(random(2, 7)); // More potential craters
        for (let i = 0; i < numCraters; i++) {
            let angle = random(TWO_PI);
            let radius = random(this.size * 0.1, this.size * 0.4); // Position on surface
            let craterSize = random(this.size * 0.1, this.size * 0.3); // Size of crater
            let craterPos = p5.Vector.fromAngle(angle).mult(radius);
            this.craters.push({ pos: craterPos, size: craterSize });
        }
    }

    update() {
        this.pos.add(this.vel); // Move asteroid

        // Update rotation
        this.rotationSpeed += random(-this.rotationAccel, this.rotationAccel); // Apply small random change
        this.rotationSpeed = constrain(this.rotationSpeed, -0.06, 0.06); // Limit rotation speed
        this.rotation += this.rotationSpeed;

        // Wrap around screen edges
        let buffer = this.size;
        if (this.pos.x < -buffer) this.pos.x = width + buffer;
        if (this.pos.x > width + buffer) this.pos.x = -buffer;
        if (this.pos.y < -buffer) this.pos.y = height + buffer;
        if (this.pos.y > height + buffer) this.pos.y = -buffer;
    }

    draw() {
        push(); // Isolate transformations and styles
        translate(this.pos.x, this.pos.y); // Move to position
        rotate(this.rotation); // Apply rotation

        let mainBri = brightness(this.color);
        let mainSat = saturation(this.color);
        let mainHue = hue(this.color);

        // Subtle 3D effect using offset shapes
        // Highlight (brighter, offset up-left)
        let highlightColor = color(mainHue, mainSat * 0.7, mainBri * 1.3);
        fill(highlightColor); noStroke(); beginShape();
        for (let v of this.vertices) { vertex(v.x - 1.5, v.y - 1.5); } endShape(CLOSE);
        // Shadow (darker, offset down-right)
        let shadowColor = color(mainHue, mainSat * 1.2, mainBri * 0.6);
        fill(shadowColor); noStroke(); beginShape();
        for (let v of this.vertices) { vertex(v.x + 1.5, v.y + 1.5); } endShape(CLOSE);

        // Main asteroid body
        fill(this.color);
        stroke(mainHue, mainSat * 0.4, mainBri * random(1.4, 1.8)); // Varied edge highlight
        strokeWeight(1.8); // Thicker edge
        beginShape();
        for (let v of this.vertices) { vertex(v.x, v.y); } // Draw shape from vertices
        endShape(CLOSE);

        // Draw craters (darker ellipses)
        noStroke();
        fill(hue(this.color), saturation(this.color) * 0.7, brightness(this.color) * 0.4, 90); // Darker, semi-transparent
        for (let crater of this.craters) {
            ellipse(crater.pos.x, crater.pos.y, crater.size, crater.size * random(0.7, 1.3)); // Slightly irregular crater shape
        }

        pop(); // Restore previous drawing state
    }

    // Check collision with a bullet
    hits(bullet) {
        let d = dist(this.pos.x, this.pos.y, bullet.pos.x, bullet.pos.y);
        return d < this.size / 2 + bullet.size / 2; // Simple circle collision
    }

    // Check collision with the player ship (considers shield)
    hitsShip(ship) {
        let targetX = ship.pos.x;
        let targetY = ship.pos.y;
        // Determine ship's effective radius based on shields
        let targetRadius = ship.tempShieldActive ? ship.shieldVisualRadius * 1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5);
        let d = dist(this.pos.x, this.pos.y, targetX, targetY);
        return d < this.size / 2 + targetRadius; // Circle collision check
    }
}


// ==================
// Particle Class
// ==================
class Particle {
    constructor(x, y, particleColor, size = null, speedMult = 1, lifespanMult = 1) {
        this.pos = createVector(x, y); // Initial position
        this.vel = p5.Vector.random2D(); // Random initial direction
        this.vel.mult(random(1.5, 6) * speedMult); // Random initial speed (increased max)
        this.lifespan = 100 * lifespanMult * random(0.8, 1.5); // Base lifespan with variation
        this.maxLifespan = this.lifespan; // Store initial for alpha calculation
        // Store base color components
        this.baseHue = hue(particleColor);
        this.baseSat = saturation(particleColor);
        this.baseBri = brightness(particleColor);
        this.size = size !== null ? size * random(0.8, 1.2) : random(2, 7); // Use provided size or random (more variation)
        this.drag = random(0.95, 0.99); // Varying friction/drag
    }

    update() {
        this.pos.add(this.vel); // Move particle
        this.lifespan -= 2.5; // Decrease lifespan (slower fade)
        this.vel.mult(this.drag); // Apply drag to slow down
    }

    draw() {
        noStroke();
        // Calculate alpha based on remaining lifespan (fades out)
        let currentAlpha = map(this.lifespan, 0, this.maxLifespan, 0, 100);
        fill(this.baseHue, this.baseSat, this.baseBri, currentAlpha); // Set color and alpha
        // Particle shrinks over time
        ellipse(this.pos.x, this.pos.y, this.size * (this.lifespan / this.maxLifespan));
    }

    // Check if particle has faded out
    isDead() { return this.lifespan <= 0; }
}


// ==================
// Star Class
// ==================
class Star {
    constructor() {
        this.x = random(width); // Random X position
        this.y = random(height); // Random Y position
        this.layer = floor(random(4)); // Assign to one of 4 layers (0=farthest)
        // Size and speed depend on layer for parallax effect
        this.size = map(this.layer, 0, 3, 0.4, 2.8);
        this.speed = map(this.layer, 0, 3, 0.05, 0.6);
        this.baseBrightness = random(50, 95); // Base brightness
        // Parameters for twinkling effect
        this.twinkleSpeed = random(0.03, 0.08);
        this.twinkleRange = random(0.6, 1.4); // How much brightness varies
        this.twinkleOffset = random(TWO_PI); // Randomize timing
    }

    update() {
        this.y += this.speed; // Move star down
        // Wrap around if off screen bottom
        if (this.y > height + this.size) {
            this.y = -this.size; // Reset to top
            this.x = random(width); // New random X position
        }
    }

    draw() {
        // Calculate twinkling brightness using sine wave
        let twinkleFactor = map(sin(frameCount * this.twinkleSpeed + this.twinkleOffset), -1, 1, 1.0 - this.twinkleRange / 2, 1.0 + this.twinkleRange / 2);
        let currentBrightness = constrain(this.baseBrightness * twinkleFactor, 30, 100); // Clamp brightness
        fill(0, 0, currentBrightness, 90); // White star with varying brightness and slight transparency
        noStroke();
        ellipse(this.x, this.y, this.size, this.size); // Draw star
    }
}


// ==================
// ShootingStar Class
// ==================
class ShootingStar {
    constructor() {
        this.startX = random(width); // Random starting X
        this.startY = random(-50, -10); // Start above screen
        this.pos = createVector(this.startX, this.startY);
        let angle = random(PI * 0.3, PI * 0.7); // Angle mostly downwards
        this.speed = random(15, 30); // Random speed
        this.vel = p5.Vector.fromAngle(angle).mult(this.speed); // Calculate velocity
        this.len = random(50, 150); // Length of the tail
        this.brightness = random(80, 100); // Brightness
        this.lifespan = 100; // Duration to fade out
    }

    update() {
        this.pos.add(this.vel); // Move star
        this.lifespan -= 2; // Decrease lifespan
    }

    draw() {
        if (this.lifespan <= 0) return; // Don't draw if faded
        // Calculate alpha based on remaining lifespan
        let alpha = map(this.lifespan, 0, 100, 0, 100);
        // Calculate tail end position
        let tailPos = p5.Vector.sub(this.pos, this.vel.copy().setMag(this.len));
        strokeWeight(random(1.5, 3)); // Varying thickness
        stroke(0, 0, this.brightness, alpha); // Whiteish color, fading alpha
        line(this.pos.x, this.pos.y, tailPos.x, tailPos.y); // Draw the line (tail)
    }

    // Check if the shooting star is finished (faded or offscreen)
    isDone() {
        return this.lifespan <= 0 || this.pos.y > height + this.len || this.pos.x < -this.len || this.pos.x > width + this.len;
    }
}


// ==================
// HealthPotion Class
// ==================
class HealthPotion {
    constructor(x, y) {
        this.pos = createVector(x || random(width * 0.1, width * 0.9), y || -30); // Position
        this.vel = createVector(0, random(0.5, 1.5)); // Downward velocity
        this.size = 20; // Base size
        // Dimensions for drawing bottle shape
        this.bodyWidth = this.size * 0.6; this.bodyHeight = this.size * 0.8;
        this.neckWidth = this.size * 0.3; this.neckHeight = this.size * 0.4;
        this.rotation = 0; // Rotation angle
        this.rotationSpeed = random(-0.015, 0.015); // Slow wobble speed
        this.pulseOffset = random(TWO_PI); // Offset for pulse animation timing
    }

    update() {
        this.pos.add(this.vel); // Move
        this.rotation += this.rotationSpeed; // Rotate
    }

    draw() {
        push(); // Isolate styles and transformations
        translate(this.pos.x, this.pos.y); // Move to position
        rotate(this.rotation); // Apply rotation

        // Pulsing Glow Effect
        let pulseFactor = map(sin(frameCount * 0.15 + this.pulseOffset), -1, 1, 0.8, 1.2); // Calculate pulse size factor
        let glowAlpha = map(pulseFactor, 0.8, 1.2, 20, 60); // Calculate glow alpha based on pulse
        fill(0, 90, 100, glowAlpha); // Red glow color
        noStroke();
        ellipse(0, 0, this.size * 1.5 * pulseFactor, this.size * 1.5 * pulseFactor); // Draw outer glow ellipse

        // Draw Bottle Shape
        fill(0, 85, 90); // Red bottle color
        noStroke();
        rect(-this.bodyWidth / 2, -this.bodyHeight / 2, this.bodyWidth, this.bodyHeight, 3); // Body
        rect(-this.neckWidth / 2, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth, this.neckHeight); // Neck
        ellipse(0, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth * 1.2, this.neckWidth * 0.4); // Top lip

        // Draw White Cross Symbol
        fill(0, 0, 100); // White
        rectMode(CENTER); // Draw rectangles from center
        rect(0, 0, this.bodyWidth * 0.5, this.bodyWidth * 0.15); // Horizontal bar
        rect(0, 0, this.bodyWidth * 0.15, this.bodyWidth * 0.5); // Vertical bar
        rectMode(CORNER); // Reset rectMode

        pop(); // Restore previous drawing state
    }

    // Check collision with player ship
    hitsShip(ship) {
        let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y);
        let shipRadius = ship.tempShieldActive ? ship.shieldVisualRadius * 1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5);
        // Use slightly larger radius for pickup due to glow
        return d < this.size * 0.7 + shipRadius;
    }

    // Check if off screen
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
        this.type = type; // Store type
        this.pos = createVector(random(width * 0.1, width * 0.9), -30); // Position
        this.vel = createVector(0, random(0.8, 1.8)); // Downward velocity
        this.size = 22; // Base size
        this.pulseOffset = random(TWO_PI); // Pulse timing offset
        this.rotation = random(TWO_PI); // Initial rotation
        this.rotationSpeed = random(-0.02, 0.02); // Slow rotation speed
        // Set icon and color based on type
        this.icon = '?'; this.color = color(0, 0, 100); // Default
        switch (this.type) {
            case POWERUP_TYPES.TEMP_SHIELD: this.icon = 'S'; this.color = color(45, 90, 100); break; // Yellow
            case POWERUP_TYPES.RAPID_FIRE: this.icon = 'R'; this.color = color(120, 90, 100); break; // Green
            case POWERUP_TYPES.EMP_BURST: this.icon = 'E'; this.color = color(210, 90, 100); break; // Blue
        }
    }

    update() {
        this.pos.add(this.vel); // Move
        this.rotation += this.rotationSpeed; // Rotate
    }

    draw() {
        push(); // Isolate styles and transformations
        translate(this.pos.x, this.pos.y); // Move to position
        rotate(this.rotation); // Apply rotation

        // Pulsing size and brightness
        let pulse = map(sin(frameCount * 0.2 + this.pulseOffset), -1, 1, 0.9, 1.2);
        let currentSize = this.size * pulse;
        let currentBrightness = brightness(this.color) * pulse;

        // Outer glow effect
        let glowAlpha = map(pulse, 0.9, 1.2, 30, 80); // Alpha pulses with size
        fill(hue(this.color), saturation(this.color) * 0.8, currentBrightness * 0.8, glowAlpha);
        noStroke();
        ellipse(0, 0, currentSize * 1.5, currentSize * 1.5); // Larger, softer glow ellipse

        // Inner circle shape
        fill(hue(this.color), saturation(this.color), currentBrightness);
        stroke(0, 0, 100, 80); // Semi-transparent white outline
        strokeWeight(2);
        ellipse(0, 0, currentSize, currentSize); // Draw inner circle

        // Draw Icon Text
        fill(0, 0, 100); // White text
        noStroke();
        textSize(currentSize * 0.8); // Scale text size
        textAlign(CENTER, CENTER);
        text(this.icon, 0, currentSize * 0.05); // Slight Y offset for centering

        pop(); // Restore previous drawing state
    }

    // Check collision with player ship
    hitsShip(ship) {
        let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y);
        let shipRadius = ship.tempShieldActive ? ship.shieldVisualRadius * 1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5);
        // Use slightly larger radius for pickup due to glow
        return d < this.size * 0.7 + shipRadius;
    }

    // Check if off screen
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
        this.size = 28; // Base size
        this.pos = createVector(); // Position
        this.vel = createVector(); // Velocity
        this.shootCooldown = random(120, 240); // Time between shots (2-4s)
        this.shootTimer = this.shootCooldown; // Timer until next shot
        this.bulletSpeed = 3.5 + currentLevel * 0.1; // Bullet speed scales with level

        // Spawn at top, left, or right edge
        let edge = floor(random(3));
        if (edge === 0) { this.pos.x = random(width); this.pos.y = -this.size / 2; this.vel.set(random(-0.5, 0.5), random(0.8, 1.5)); } // Top -> Down
        else if (edge === 1) { this.pos.x = width + this.size / 2; this.pos.y = random(height * 0.5); this.vel.set(random(-1.5, -0.8), random(-0.5, 0.5)); } // Right -> Left
        else { this.pos.x = -this.size / 2; this.pos.y = random(height * 0.5); this.vel.set(random(0.8, 1.5), random(-0.5, 0.5)); } // Left -> Right

        // Scale speed slightly with level, cap maximum
        let speedScale = min(MAX_ENEMY_SPEED, 1.0 + (currentLevel - 1) * 0.1);
        this.vel.mult(speedScale);
        // Add slight random sideways drift for less predictable movement
        this.sidewaysDrift = random(-0.25, 0.25) * speedScale;
        this.vel.x += this.sidewaysDrift;
    }

    update() {
        this.pos.add(this.vel); // Move ship

        // Shooting logic
        this.shootTimer--;
        // Only shoot if player exists, game is playing, and timer is ready
        if (this.shootTimer <= 0 && ship && gameState === GAME_STATE.PLAYING) {
            this.shoot();
            // Reset cooldown (shorter cooldown at higher levels)
            this.shootCooldown = random(max(40, 120 - currentLevel * 5), max(80, 240 - currentLevel * 10));
            this.shootTimer = this.shootCooldown;
        }
    }

    // Create an enemy bullet
    shoot() {
        let aimAngle = PI / 2; // Shoots straight down
        // Spawn bullet slightly below the ship's center
        enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y + this.size * 0.3, aimAngle, this.bulletSpeed));
        // TODO: Play enemy shoot sound
    }

    draw() {
        push(); // Isolate styles and transformations
        translate(this.pos.x, this.pos.y); // Move to position

        // Draw ship body (angular black shape)
        fill(0, 0, 20); // Very dark grey/black
        stroke(0, 90, 60); // Dark red outline
        strokeWeight(1.8); // Slightly thicker outline
        beginShape(); // Draw shape using vertices
        vertex(0, -this.size * 0.65); // Top point
        vertex(this.size * 0.55, this.size * 0.45); // Bottom right wingtip
        vertex(this.size * 0.3, this.size * 0.35); // Indent near engine
        vertex(-this.size * 0.3, this.size * 0.35); // Other indent
        vertex(-this.size * 0.55, this.size * 0.45); // Bottom left wingtip
        endShape(CLOSE);

        // Add small red "cockpit" light
        fill(0, 100, 100); // Bright red
        noStroke();
        ellipse(0, -this.size * 0.1, 4, 6); // Small oval shape

        pop(); // Restore previous drawing state
    }

    // Check if enemy is off screen
    isOffscreen() {
        let margin = this.size * 2; // Generous margin
        return (this.pos.y > height + margin || this.pos.y < -margin ||
                this.pos.x < -margin || this.pos.x > width + margin);
    }

    // Check collision with a player bullet
    hits(playerBullet) {
        let d = dist(this.pos.x, this.pos.y, playerBullet.pos.x, playerBullet.pos.y);
        return d < this.size / 2 + playerBullet.size / 2; // Circle collision
    }

    // Check collision with the player ship (considers shield)
    hitsShip(playerShip) {
        let d = dist(this.pos.x, this.pos.y, playerShip.pos.x, playerShip.pos.y);
        let targetRadius = playerShip.tempShieldActive ? playerShip.shieldVisualRadius * 1.1 : (playerShip.shieldCharges > 0 ? playerShip.shieldVisualRadius : playerShip.size * 0.5);
        // Use slightly larger collision radius for enemy ship body
        return d < this.size * 0.45 + targetRadius;
    }
}


// ==================
// EnemyBullet Class
// ==================
class EnemyBullet {
    constructor(x, y, angle, speed) {
        this.pos = createVector(x, y); // Position
        this.vel = p5.Vector.fromAngle(angle); // Calculate velocity from angle
        this.vel.mult(speed); // Apply speed
        this.size = 7; // Slightly larger size
        this.color = color(0, 90, 100); // Bright Red color
    }

    update() { this.pos.add(this.vel); } // Move bullet

    draw() {
        // Draw a glow effect behind the bullet
        noStroke();
        fill(0, 80, 100, 50); // Semi-transparent red glow
        ellipse(this.pos.x, this.pos.y, this.size * 1.8, this.size * 1.8); // Larger ellipse for glow

        // Draw the core bullet
        fill(this.color); // Solid red core
        ellipse(this.pos.x, this.pos.y, this.size, this.size); // Draw core circle
    }

    // Check collision with player ship (considers shield)
    hitsShip(ship) {
        let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y);
        let targetRadius = ship.tempShieldActive ? ship.shieldVisualRadius * 1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5);
        // Slightly adjusted hit radius for bullet
        return d < this.size * 0.6 + targetRadius;
    }

    // Check if bullet is off screen
    isOffscreen() {
        let margin = this.size * 3; // Margin based on size
        return (this.pos.y > height + margin || this.pos.y < -margin ||
                this.pos.x < -margin || this.pos.x > width + margin);
    }
}


// ==================
// Nebula Class (Background Element)
// ==================
class Nebula {
    constructor() {
        this.numEllipses = floor(random(10, 20)); // More ellipses for denser look
        this.ellipses = []; // Array for ellipse data {pos, w, h, alpha}
        this.rotation = random(TWO_PI); // Initial rotation
        this.rotationSpeed = random(-0.0004, 0.0004); // Very slow rotation
        this.baseAlpha = random(3, 8); // Base transparency (very subtle)

        // Define overall size and starting position/velocity
        let overallWidth = random(width * 0.6, width * 1.4); // Can be large
        let overallHeight = random(height * 0.4, height * 0.7);

        // Start offscreen left or right and move slowly across
        if (random(1) < 0.5) { // Start Left
            this.pos = createVector(-overallWidth / 2, random(height));
            this.vel = createVector(random(0.04, 0.12), random(-0.015, 0.015)); // Slow right drift
        } else { // Start Right
            this.pos = createVector(width + overallWidth / 2, random(height));
            this.vel = createVector(random(-0.12, -0.04), random(-0.015, 0.015)); // Slow left drift
        }

        // Choose two base colors (blues, purples, pinks)
        let h1 = random(240, 330);
        let h2 = (h1 + random(-50, 50)) % 360; // Similar nearby hue
        this.color1 = color(h1, random(40, 75), random(15, 45)); // Dark, desaturated
        this.color2 = color(h2, random(40, 75), random(15, 45));

        // Create individual ellipses within the nebula cloud
        for (let i = 0; i < this.numEllipses; i++) {
            this.ellipses.push({
                pos: createVector(random(-overallWidth * 0.45, overallWidth * 0.45), random(-overallHeight * 0.45, overallHeight * 0.45)), // Random offset
                w: random(overallWidth * 0.15, overallWidth * 0.7), // Random width
                h: random(overallHeight * 0.15, overallHeight * 0.7), // Random height
                alpha: this.baseAlpha * random(0.6, 1.4) // Alpha variation per ellipse
            });
        }
    }

    update() {
        this.pos.add(this.vel); // Move the whole nebula
        this.rotation += this.rotationSpeed; // Rotate the whole nebula
    }

    draw() {
        push(); // Isolate styles
        translate(this.pos.x, this.pos.y); // Move to position
        rotate(this.rotation); // Apply rotation
        noStroke();

        // Draw each constituent ellipse
        for (let el of this.ellipses) {
            // Blend between the two base colors based on horizontal position
            let inter = map(el.pos.x, -width * 0.45, width * 0.45, 0, 1);
            let c = lerpColor(this.color1, this.color2, inter);
            // Set fill with calculated color and slightly randomized alpha
            fill(hue(c), saturation(c), brightness(c), el.alpha * random(0.9, 1.1));
            ellipse(el.pos.x, el.pos.y, el.w, el.h); // Draw the ellipse
        }
        pop(); // Restore styles
    }

    // Check if the nebula is completely off screen
    isOffscreen() {
        // Estimate bounding radius for simplicity
        let maxDimension = max(this.ellipses.reduce((maxR, el) => max(maxR, el.pos.mag() + max(el.w, el.h) / 2), 0), width * 0.7);
        let margin = maxDimension;
        return (this.pos.x < -margin || this.pos.x > width + margin ||
                this.pos.y < -margin || this.pos.y > height + margin);
    }
}
