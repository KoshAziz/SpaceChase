// --- Features ---
// - Start Screen (Enter/Tap to Start) - Title "Space-Chase" + Dynamic // MODIFIED (Color Order)
// - Level System based on Points
// - Rainbow Bullets (Hue Cycling)
// - Ship Upgrade System (Automatic Cheapest, includes Auto-Fire) - Uses Money
// - Score-based Shield System (Gain shield charge every 50 points, max 1) - Uses Points
// - Redesigned Spaceship Look (Score-based color/shape, added details, thinner) - Uses Points
// - Dynamic Parallax Star Background (with occasional planet, galaxy, black hole)
// - Enhanced Engine Thrust Effect (More reactive)
// - Asteroid Splitting
// - Player Lives (Max 3)
// - Simple Explosion Particles (Asteroid destruction + Bullet impact)
// - Score-based Difficulty Increase - Uses Levels + Time // MODIFIED (Spawn Rate & Max Count)
// - Health Potions: Spawn randomly, restore 1 life on pickup (up to max).
// --- Modifications ---
// - Removed Name Input and Leaderboard system.
// - Implemented separate Points (milestones) and Money (upgrades) systems.
// - Upgrade costs reduced.
// - Asteroids only spawn from Top, Left, and Right edges.
// - Asteroid speed reduced (but now scales slightly with level).
// - Ship movement changed to free keyboard control (Arrows/WASD).
// - Spacebar tap-to-shoot always enabled; hold-to-shoot enabled via Auto-Fire upgrade.
// - Background gradient color changes every 20 seconds.
// - Ship no longer resets position on non-fatal hit.
// - Added brief invulnerability after losing a life.
// - Added Touch Controls: Tap to shoot and move towards tap.
// - Mobile Adjustments: Lower base asteroid spawn rate.
// - Max shield charges reduced to 1.
// - Asteroids visuals enhanced (shading, craters, rotation).
// - Added occasional background planet.
// - Added subtle background galaxy effect.
// - Added distant black hole effect.
// - REMOVED BOSS FIGHT MECHANICS
// - Increased Ship Speed
// - Changed Title Color Order
// - Increased Asteroid Spawn Rate Scaling & Max Asteroid Count per Level
// --------------------------

// --- Game Objects & State ---
let ship;
let bullets = [];
let asteroids = [];
let particles = [];
let stars = [];
let potions = [];
// REMOVED: let boss = null;
// REMOVED: let enemyBullets = [];

// Game State Management - REMOVED BOSS_FIGHT state
const GAME_STATE = { START_SCREEN: 0, PLAYING: 1, GAME_OVER: 2 };
let gameState = GAME_STATE.START_SCREEN;

// Score, Level & Resources
let points = 0;
let money = 0;
let lives = 3;
const MAX_LIVES = 3;
let currentLevel = 1;
// Adjusted thresholds for potentially smoother progression without bosses as gatekeepers
const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 5000, 7500, 10500]; // Example adjustment

// Game Settings & Thresholds
let baseAsteroidSpawnRate;
let currentAsteroidSpawnRate;
let potionSpawnRate = 0.001;
let initialAsteroids = 5; // Starting asteroids at game start
let minAsteroidSize = 15;
const SHIELD_POINTS_THRESHOLD = 50;
const MAX_SHIELD_CHARGES = 1;
const SHAPE_CHANGE_POINTS_THRESHOLD = 100;
const MAX_ASTEROID_SPEED = 4.0;

// --- UI & Messages ---
let infoMessage = "";
let infoMessageTimeout = 0;
// REMOVED Name input related variables

// --- Background ---
let currentTopColor;
let currentBottomColor;
const BACKGROUND_CHANGE_INTERVAL = 1200; // Frames (20 seconds at 60fps)
let isMobile = false;

// --- Background Scenery Variables ---
let planetVisible = false;
let planetPos, planetVel, planetSize, planetBaseColor, planetDetailColor1, planetDetailColor2;
let lastPlanetAppearanceTime = -Infinity;
const PLANET_MIN_INTERVAL = 30000; // milliseconds
const PLANET_MAX_INTERVAL = 60000; // milliseconds

// REMOVED: Freighter variables


// ==================
// p5.js Setup Function
// ==================
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  // Mobile Detection
  let ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) { isMobile = true; }

  // Initialize background elements
  createStarfield(200);
  textAlign(CENTER, CENTER);
  textSize(20);
  currentTopColor = color(260, 80, 10); // Initial dark blue top
  currentBottomColor = color(240, 70, 25); // Initial darker blue bottom

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
        // Ensure asteroids don't spawn too close to the ship's starting area
        do {
            startPos = createVector(random(width), random(height * 0.7)); // Spawn in upper 70%
        } while (ship && dist(startPos.x, startPos.y, shipX, shipY) < 150);
        asteroids.push(new Asteroid(startPos.x, startPos.y));
    }
}

function createParticles(x, y, count, particleColor, particleSize = null, particleSpeedMult = 1) {
    let baseHue = hue(particleColor);
    let baseSat = saturation(particleColor);
    let baseBri = brightness(particleColor);
    for (let i = 0; i < count; i++) {
        // Slightly vary particle color
        let pColor = color(
           baseHue + random(-10, 10),
           baseSat * random(0.8, 1.0),
           baseBri * random(0.9, 1.0),
           100 // Alpha
        );
        particles.push(new Particle(x, y, pColor, particleSize, particleSpeedMult));
    }
}

function createStarfield(numStars) {
    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }
}
// REMOVED: Leaderboard functions
// REMOVED: submitScore function

// --- Function to set difficulty based on level (MODIFIED Spawn Rate Scaling) ---
function setDifficultyForLevel(level) {
    let mobileFactor = isMobile ? 0.7 : 1.0; // Spawn less frequently on mobile
    // --- MODIFIED: Increased the per-level increment from 0.001 to 0.0015 ---
    baseAsteroidSpawnRate = (0.009 + (level - 1) * 0.0015) * mobileFactor;
    currentAsteroidSpawnRate = baseAsteroidSpawnRate;
}


// ==================
// p5.js Draw Loop
// ==================
function draw() {
  // Background color change logic
  if (gameState !== GAME_STATE.START_SCREEN && frameCount > 0 && frameCount % BACKGROUND_CHANGE_INTERVAL === 0) {
      let topH = random(180, 300); // Hue range from cyan to magenta/purple
      let bottomH = (topH + random(20, 60)) % 360; // Slightly different hue for bottom
      currentTopColor = color(topH, random(70, 90), random(10, 20)); // Dark, saturated top
      currentBottomColor = color(bottomH, random(60, 85), random(25, 40)); // Slightly lighter, saturated bottom
  }

  // --- Background Scenery Update Logic ---
  if (gameState !== GAME_STATE.START_SCREEN) {
      let currentTime = millis();
      // Planet Logic
      if (!planetVisible && currentTime - lastPlanetAppearanceTime > random(PLANET_MIN_INTERVAL, PLANET_MAX_INTERVAL)) {
          planetVisible = true;
          planetSize = random(width * 0.2, width * 0.5);
          // Determine entry edge (0:Top, 1:Right, 2:Bottom, 3:Left)
          let edge = floor(random(4));
          if (edge === 0) planetPos = createVector(random(width), -planetSize / 2); // Top edge
          else if (edge === 1) planetPos = createVector(width + planetSize / 2, random(height)); // Right edge
          else if (edge === 2) planetPos = createVector(random(width), height + planetSize / 2); // Bottom edge
          else planetPos = createVector(-planetSize / 2, random(height)); // Left edge

          // Target somewhere near the center, slowly drift across
          let targetPos = createVector(random(width * 0.2, width * 0.8), random(height * 0.2, height * 0.8));
          planetVel = p5.Vector.sub(targetPos, planetPos);
          planetVel.normalize();
          planetVel.mult(random(0.1, 0.3)); // Very slow speed

          // Generate planet colors
          let baseH = random(360);
          planetBaseColor = color(baseH, random(40, 70), random(50, 80));
          planetDetailColor1 = color((baseH + random(20, 50)) % 360, random(50, 70), random(60, 90));
          planetDetailColor2 = color((baseH + random(180, 220)) % 360, random(30, 60), random(40, 70)); // Contrasting color

          lastPlanetAppearanceTime = currentTime;
      }
      if (planetVisible) {
          planetPos.add(planetVel);
          // Check if planet is off-screen
          let buffer = planetSize * 0.6; // Allow it to go slightly off before disappearing
          if (planetPos.x < -buffer || planetPos.x > width + buffer ||
              planetPos.y < -buffer || planetPos.y > height + buffer) {
              planetVisible = false;
          }
      }
  }

  drawBackgroundAndStars(); // Draw background, galaxy, planet, stars

  // --- Game State Machine ---
  switch (gameState) {
    case GAME_STATE.START_SCREEN: displayStartScreen(); break;
    case GAME_STATE.PLAYING: runGameLogic(); break;
    // REMOVED: case GAME_STATE.BOSS_FIGHT: runBossFightLogic(); break;
    case GAME_STATE.GAME_OVER: runGameLogic(); displayGameOver(); break; // Renumbered GAME_OVER
  }

  // Display Info Messages
  if (infoMessageTimeout > 0) {
      displayInfoMessage();
      // Only decrease timeout when playing
      if (gameState === GAME_STATE.PLAYING) {
          infoMessageTimeout--;
      }
  }
}

// --- MODIFIED: Function for Start Screen (White character first) ---
function displayStartScreen() {
    // --- Dynamic Title ---
    let titleText = "Space-Chase";
    let titleSize = 48;
    textSize(titleSize);
    textAlign(CENTER, CENTER); // Base alignment for position calculation
    let totalWidth = textWidth(titleText);
    let startX = width / 2 - totalWidth / 2;
    let currentX = startX;
    let titleY = height / 3;

    for (let i = 0; i < titleText.length; i++) {
        let char = titleText[i];
        let charWidth = textWidth(char);

        // --- MODIFIED: Swapped brightness values ---
        // Alternating color (slightly off-black/white) - STARTING WITH WHITE
        let charBrightness = (i % 2 === 0) ? 95 : 10; // White (95) if even index, Black (10) if odd index

        fill(0, 0, charBrightness); // Black/White (Saturation 0)

        // Wobble effect
        let yOffset = sin(frameCount * 0.08 + i * 0.6) * 6; // Adjust frequency, phase shift, amplitude

        // Draw character (use CENTER alignment for individual chars based on calculated pos)
        text(char, currentX + charWidth / 2, titleY + yOffset);
        currentX += charWidth; // Move to next character position
    }
    // --- End Dynamic Title ---

    // Draw instructions
    textSize(22);
    fill(0, 0, 100); // White
    textAlign(CENTER, CENTER); // Reset alignment if changed
    let startInstruction = isMobile ? "Tap Screen to Start" : "Press Enter to Start";
    text(startInstruction, width / 2, height / 2 + 50);
}


// --- Function for Main Game Logic (Asteroids - MODIFIED Max Asteroid Limit) ---
function runGameLogic() {
  if (!ship) return; // Exit if ship doesn't exist (e.g., during GAME_OVER before restart)

  // Update & Draw game objects
  ship.update();
  ship.draw();

  for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].update();
      bullets[i].draw();
      if (bullets[i].isOffscreen()) {
          bullets.splice(i, 1);
      }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].isDead()) {
          particles.splice(i, 1);
      }
  }

  handleAsteroidsAndCollisions();
  handlePotions();

  // Spawn new asteroids and potions during PLAYING state
  if (gameState === GAME_STATE.PLAYING) {
      // Slightly increase spawn rate over time (independent of level-based rate)
      let timeFactor = floor(frameCount / 1800) * 0.0005; // Increase every 30 seconds
      currentAsteroidSpawnRate = baseAsteroidSpawnRate + timeFactor;

      // --- MODIFIED: Dynamic max asteroid limit based on level ---
      let maxAsteroidsAllowed = min(40, 20 + currentLevel * 2); // Base 20 + 2 per level, capped at 40

      // Spawn Asteroid if below the dynamic limit
      if (random(1) < currentAsteroidSpawnRate && asteroids.length < maxAsteroidsAllowed) {
          asteroids.push(new Asteroid());
      }
      // Spawn Potion
      if (random(1) < potionSpawnRate && potions.length < 2) { // Limit max potions
          potions.push(new HealthPotion());
      }
  }

  // Display HUD only when playing
  if (gameState === GAME_STATE.PLAYING) {
      displayHUD();
  }
}

// --- REMOVED: Function for Boss Fight Logic ---
// function runBossFightLogic() { ... }


// ==================
// Collision Handling Functions
// ==================
function handleAsteroidsAndCollisions() {
    // Only handle collisions when playing
    if (gameState !== GAME_STATE.PLAYING) return;

    // Iterate backwards through asteroids for safe removal
    for (let i = asteroids.length - 1; i >= 0; i--) {
        // Check if asteroid still exists (might be removed mid-loop)
        if (!asteroids[i]) continue;

        asteroids[i].update();
        asteroids[i].draw();

        let asteroidHitByBullet = false;

        // Check collision with Bullets
        for (let j = bullets.length - 1; j >= 0; j--) {
            // Check if both asteroid and bullet exist and collide
            if (asteroids[i] && bullets[j] && asteroids[i].hits(bullets[j])) {
                // Effects for bullet hit
                createParticles(bullets[j].pos.x, bullets[j].pos.y, 3, color(60, 60, 100), 2, 0.5); // Small impact sparks

                // Score and Resources
                let oldPoints = points;
                let asteroidSizeValue = asteroids[i] ? asteroids[i].size : 50; // Use default if asteroid disappears
                points += floor(map(asteroidSizeValue, minAsteroidSize, 80, 5, 15)); // More points for bigger asteroids
                money += 2; // Flat money per hit

                // Shield gain check
                let shieldsToAdd = floor(points / SHIELD_POINTS_THRESHOLD) - floor(oldPoints / SHIELD_POINTS_THRESHOLD);
                if (shieldsToAdd > 0 && ship.shieldCharges < MAX_SHIELD_CHARGES) {
                    let actualAdded = ship.gainShields(shieldsToAdd);
                    if (actualAdded > 0) {
                        infoMessage = `+${actualAdded} SHIELD CHARGE(S)!`;
                        infoMessageTimeout = 90;
                    }
                }

                // Ship shape evolution check
                let oldShapeLevel = floor(oldPoints / SHAPE_CHANGE_POINTS_THRESHOLD);
                let newShapeLevel = floor(points / SHAPE_CHANGE_POINTS_THRESHOLD);
                if (newShapeLevel > oldShapeLevel) {
                    ship.changeShape(newShapeLevel);
                    infoMessage = "SHIP SHAPE EVOLVED!";
                    infoMessageTimeout = 120;
                }

                // --- MODIFIED: Level Up Logic (Replaces Boss Trigger) ---
                if (currentLevel < LEVEL_THRESHOLDS.length && points >= LEVEL_THRESHOLDS[currentLevel]) {
                    asteroids = []; // Clear existing asteroids
                    potions = [];   // Clear existing potions
                    bullets = [];   // Clear player bullets

                    // Award points/money for leveling up (like defeating a boss)
                    points += 200 * currentLevel;
                    money += 40 * currentLevel;

                    currentLevel++; // Advance level
                    setDifficultyForLevel(currentLevel); // Increase difficulty
                    infoMessage = `LEVEL ${currentLevel}!`; // Display level up message
                    infoMessageTimeout = 180;

                    // Spawn a health potion centrally if needed
                    if (lives < MAX_LIVES) {
                        potions.push(new HealthPotion(width / 2, height / 2));
                    }

                    // Attempt to auto-buy cheapest upgrade after leveling up
                    let upgradedInLoop = true;
                    while (upgradedInLoop) {
                        upgradedInLoop = false;
                        let cost1 = ship.getUpgradeCost('fireRate');
                        let cost2 = ship.getUpgradeCost('spreadShot');
                        let cost3 = ship.getUpgradeCost('autoFire');
                        let numCost1 = (typeof cost1 === 'number') ? cost1 : Infinity;
                        let numCost2 = (typeof cost2 === 'number') ? cost2 : Infinity;
                        let numCost3 = (typeof cost3 === 'number') ? cost3 : Infinity;
                        let cheapestCost = Math.min(numCost1, numCost2, numCost3);
                        if (cheapestCost === Infinity || money < cheapestCost) break; // No affordable upgrades

                        if (numCost1 <= numCost2 && numCost1 <= numCost3) { // Try Fire Rate first if cheapest
                            if (money >= numCost1 && ship.attemptUpgrade('fireRate')) upgradedInLoop = true;
                        } else if (numCost2 <= numCost1 && numCost2 <= numCost3) { // Try Spread Shot if cheapest
                            if (money >= numCost2 && ship.attemptUpgrade('spreadShot')) upgradedInLoop = true;
                        } else { // Try Auto-Fire if cheapest
                            if (money >= numCost3 && ship.attemptUpgrade('autoFire')) upgradedInLoop = true;
                        }
                         if (!upgradedInLoop) break; // Exit if no upgrade bought in this iteration
                    }

                    return; // Exit collision checks for this frame after level up
                }
                // --- End Modified Level Up Logic ---
                else {
                    // Check for automatic upgrades only if NOT leveling up this frame
                    let upgradedInLoop = true;
                    while (upgradedInLoop) {
                        upgradedInLoop = false;
                        let cost1 = ship.getUpgradeCost('fireRate');
                        let cost2 = ship.getUpgradeCost('spreadShot');
                        let cost3 = ship.getUpgradeCost('autoFire');
                        let numCost1 = (typeof cost1 === 'number') ? cost1 : Infinity;
                        let numCost2 = (typeof cost2 === 'number') ? cost2 : Infinity;
                        let numCost3 = (typeof cost3 === 'number') ? cost3 : Infinity;
                        let cheapestCost = Math.min(numCost1, numCost2, numCost3);
                        if (cheapestCost === Infinity || money < cheapestCost) break; // No affordable upgrades

                        if (numCost1 <= numCost2 && numCost1 <= numCost3) { // Try Fire Rate first if cheapest
                            if (money >= numCost1 && ship.attemptUpgrade('fireRate')) upgradedInLoop = true;
                        } else if (numCost2 <= numCost1 && numCost2 <= numCost3) { // Try Spread Shot if cheapest
                            if (money >= numCost2 && ship.attemptUpgrade('spreadShot')) upgradedInLoop = true;
                        } else { // Try Auto-Fire if cheapest
                            if (money >= numCost3 && ship.attemptUpgrade('autoFire')) upgradedInLoop = true;
                        }
                        if (!upgradedInLoop) break; // Exit if no upgrade bought in this iteration
                    }
                }

                // Handle asteroid splitting / destruction
                let currentAsteroid = asteroids[i];
                let asteroidPos = currentAsteroid.pos.copy();
                let asteroidColor = currentAsteroid.color;
                asteroids.splice(i, 1); // Remove the hit asteroid
                bullets.splice(j, 1);   // Remove the hitting bullet
                asteroidHitByBullet = true;
                createParticles(asteroidPos.x, asteroidPos.y, floor(asteroidSizeValue / 3), asteroidColor); // Explosion particles

                // Split asteroid if large enough
                if (asteroidSizeValue > minAsteroidSize * 2) {
                    let newSize = asteroidSizeValue * 0.6; // Smaller pieces
                    let splitSpeedMultiplier = random(0.8, 2.0); // Vary split speed
                    let vel1 = p5.Vector.random2D().mult(splitSpeedMultiplier);
                    let vel2 = p5.Vector.random2D().mult(splitSpeedMultiplier);
                    asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel1));
                    asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel2));
                }
                break; // Exit inner loop once a bullet hits this asteroid
            }
        } // End bullet loop

        // If asteroid was hit by a bullet this frame, skip ship collision check
        if (asteroidHitByBullet) continue;

        // Check for collision with ship (only if not invulnerable)
        if (ship.invulnerableTimer <= 0 && asteroids[i] && asteroids[i].hitsShip(ship)) {
            // Check if ship has shields
            if (ship.shieldCharges > 0) {
                ship.loseShield();
                createParticles(ship.pos.x, ship.pos.y, 25, color(180, 80, 100)); // Shield break effect
                // Destroy asteroid even if shield takes the hit
                createParticles(asteroids[i].pos.x, asteroids[i].pos.y, floor(asteroids[i].size / 3), asteroids[i].color);
                asteroids.splice(i, 1);
            } else {
                // No shields - lose a life
                lives--;
                createParticles(ship.pos.x, ship.pos.y, 30, color(0, 80, 100)); // Ship hit effect (red)
                // Check for game over
                if (lives <= 0) {
                    gameState = GAME_STATE.GAME_OVER;
                    infoMessage = ""; // Clear any active messages
                    infoMessageTimeout = 0;
                    cursor(ARROW); // Show normal cursor
                } else {
                    // Not game over, just lost a life
                    ship.setInvulnerable(); // Grant brief invulnerability
                    // Destroy the asteroid that hit the ship
                    createParticles(asteroids[i].pos.x, asteroids[i].pos.y, floor(asteroids[i].size / 3), asteroids[i].color);
                    asteroids.splice(i, 1);
                }
            }
        }
    } // End asteroid loop
}


function handlePotions() {
    // Only handle potions when playing
    if (gameState !== GAME_STATE.PLAYING) return;

    for (let i = potions.length - 1; i >= 0; i--) {
        potions[i].update();
        potions[i].draw();

        // Check collision with ship
        if (potions[i].hitsShip(ship)) {
            if (lives < MAX_LIVES) {
                lives++; // Restore life if not maxed
                infoMessage = "+1 LIFE!";
                infoMessageTimeout = 90;
            } else {
                points += 25; // Award points if already at max lives
                infoMessage = "+25 POINTS (MAX LIVES)!";
                infoMessageTimeout = 90;
            }
            potions.splice(i, 1); // Remove potion
        } else if (potions[i].isOffscreen()) {
            potions.splice(i, 1); // Remove if it drifts off screen
        }
    }
}

// ==================
// Background Drawing Function
// ==================
function drawBackgroundAndStars() {
    // Draw Gradient Background
    for(let y=0; y < height; y++){
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(currentTopColor, currentBottomColor, inter);
        stroke(c); // Set line color to interpolated color
        line(0, y, width, y); // Draw a horizontal line
    }
    noStroke(); // Reset stroke

    // Draw background elements (order matters for layering)
    drawBlackHole(); // Draw black hole first (furthest away)
    drawGalaxy();    // Then galaxy
    if (planetVisible) { drawPlanet(); } // Then planet
    // REMOVED Freighter

    // Draw Stars on top
    for (let star of stars) {
        star.update();
        star.draw();
    }
}

// --- Function to draw distant black hole ---
function drawBlackHole() {
    push();
    let bhX = width * 0.8; // Positioned towards top right
    let bhY = height * 0.2;
    let bhSize = width * 0.05; // Relative size

    // Central black circle
    fill(0); // Pure black
    noStroke();
    ellipse(bhX, bhY, bhSize, bhSize);

    // Accretion disk / lensing effect (rings)
    let ringCount = 5;
    let maxRingSize = bhSize * 3;
    let minRingSize = bhSize * 1.1;
    noFill();
    for (let i = 0; i < ringCount; i++) {
        let size = lerp(minRingSize, maxRingSize, i / (ringCount - 1));
        // Faint, colorful, wispy rings
        let hue = random(0, 60); // Reds, oranges, yellows
        let alpha = map(i, 0, ringCount - 1, 40, 5); // Fade out further away
        let sw = map(i, 0, ringCount - 1, 1, 4); // Thicker rings closer in
        strokeWeight(sw);
        stroke(hue, 90, 90, alpha);
        // Slight wobble/irregularity
        ellipse(bhX, bhY, size * random(0.95, 1.05), size * random(0.95, 1.05));
    }
    pop();
}

// --- Function to draw subtle galaxy ---
function drawGalaxy() {
    push();
    let centerX = width / 2;
    let centerY = height / 2;
    let baseHue1 = 270; // Purplish
    let baseHue2 = 200; // Cyanish
    let alphaVal = 2; // Very transparent
    let angle = frameCount * 0.0003; // Slow rotation

    translate(centerX, centerY);
    rotate(angle);
    translate(-centerX, -centerY); // Rotate around center

    noStroke();
    // Draw overlapping ellipses to simulate galaxy shape
    fill(baseHue1, 50, 60, alphaVal); // Dim purple layer
    ellipse(centerX - width * 0.1, centerY - height * 0.1, width * 1.2, height * 0.3);

    fill(baseHue2, 60, 70, alphaVal); // Dim cyan layer, slightly offset
    ellipse(centerX + width * 0.15, centerY + height * 0.05, width * 1.1, height * 0.4);

    fill((baseHue1 + baseHue2) / 2, 55, 65, alphaVal * 0.8); // Blended center layer
    ellipse(centerX, centerY, width * 0.9, height * 0.5);
    pop();
}

function drawPlanet() {
    push();
    translate(planetPos.x, planetPos.y);
    noStroke();

    // Base planet color
    fill(planetBaseColor);
    ellipse(0, 0, planetSize, planetSize);

    // Add some detail using arcs (simulating continents/clouds)
    fill(planetDetailColor1);
    arc(0, 0, planetSize, planetSize, PI * 0.1, PI * 0.6, OPEN);
    arc(0, 0, planetSize * 0.8, planetSize * 0.8, PI * 0.7, PI * 1.2, OPEN);

    fill(planetDetailColor2);
    arc(0, 0, planetSize * 0.9, planetSize * 0.9, PI * 1.3, PI * 1.9, OPEN);

    // Add subtle atmosphere ring
    noFill();
    strokeWeight(planetSize * 0.05);
    stroke(hue(planetBaseColor), 20, 100, 15); // Faint, bright ring, low saturation
    ellipse(0, 0, planetSize * 1.05, planetSize * 1.05);

    pop();
}

// ==================
// Display Functions
// ==================
function displayHUD() {
  let hudTextSize = 18;
  textSize(hudTextSize);
  fill(0, 0, 100, 80); // Semi-transparent white text
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
  fill(0, 0, 100, 80); // Semi-transparent white text
  text(`Rate Lvl: ${ship.fireRateLevel}/${ship.maxLevel}`, width - 15, 15);
  text(`Spread Lvl: ${ship.spreadShotLevel}/${ship.maxLevel}`, width - 15, 40);
  text(`Auto-Fire: ${ship.autoFireLevel > 0 ? 'ON' : 'OFF'}`, width - 15, 65);
}

function displayInfoMessage() {
    fill(0, 0, 100); // Solid white
    textSize(16);
    textAlign(CENTER, BOTTOM);
    text(infoMessage, width / 2, height - 20); // Display at bottom center
}

// MODIFIED: Simplified Game Over screen
function displayGameOver() {
    // Semi-transparent overlay
    fill(0, 0, 0, 50);
    rect(0, 0, width, height);

    // Game Over Text
    fill(0, 90, 100); // Red color
    textSize(60);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 3);

    // Final Score
    fill(0, 0, 100); // White color
    textSize(30);
    text("Final Points: " + points, width / 2, height / 3 + 60);

    // Restart Instructions (pulsing)
    textAlign(CENTER, CENTER);
    textSize(22);
    let pulse = map(sin(frameCount * 0.1), -1, 1, 60, 100); // Brightness pulse
    fill(0, 0, pulse);
    text("Click or Tap to Restart", width / 2, height * 0.7);

    // Ensure cursor is visible
    cursor(ARROW);
}

// MODIFIED: Resets game state for restarting
function resetGame() {
    ship = new Ship(); // Create a new ship (resets upgrades, pos, etc.)
    bullets = [];
    particles = [];
    asteroids = [];
    potions = [];
    // REMOVED: enemyBullets = []; boss = null;

    // Reset score, resources, level
    points = 0;
    money = 0;
    lives = 3;
    currentLevel = 1;
    setDifficultyForLevel(currentLevel); // Reset difficulty

    // Reset background
    currentTopColor = color(260, 80, 10);
    currentBottomColor = color(240, 70, 25);
    lastPlanetAppearanceTime = -Infinity;
    planetVisible = false;

    // Reset UI state
    frameCount = 0; // Reset frameCount for timing if needed
    infoMessage = "";
    infoMessageTimeout = 0;

    // Hide mouse cursor during gameplay
    cursor(); // Use p5's default (usually hides based on context)

    // Spawn initial asteroids
    spawnInitialAsteroids();
}

// --- Function to start the game ---
function startGame() {
    resetGame(); // Reset all game variables
    gameState = GAME_STATE.PLAYING; // Set state to playing
}


// ==================
// Input Handling Functions
// ==================
function mousePressed() {
  if (gameState === GAME_STATE.GAME_OVER) {
      startGame();
  } else if (gameState === GAME_STATE.PLAYING) {
      ship.shoot(); // Tap to shoot
  } else if (gameState === GAME_STATE.START_SCREEN) {
      // Allow click to start as well, especially for desktop
      startGame();
  }
}

function keyPressed() {
    if (gameState === GAME_STATE.START_SCREEN) {
        if (keyCode === ENTER || keyCode === RETURN) {
            startGame();
        }
    } else if (gameState === GAME_STATE.PLAYING) {
        // Use spacebar for shooting (single shot per press unless auto-fire upgrade active)
        if (keyCode === 32) { // 32 = Spacebar
            ship.shoot();
            return false; // Prevent default browser scroll behavior for spacebar
        }
    } else if (gameState === GAME_STATE.GAME_OVER) {
        // Allow keyboard restart too
        // Any key press could restart, or restrict to Enter
         if (keyCode === ENTER || keyCode === RETURN) {
             startGame();
         }
    }
}

function touchStarted() {
    // Handle touch events primarily for mobile gameplay flow
    if (gameState === GAME_STATE.START_SCREEN) {
        startGame();
        return false; // Prevent default touch behavior
    } else if (gameState === GAME_STATE.GAME_OVER) {
        startGame();
        return false; // Prevent default touch behavior
    } else if (gameState === GAME_STATE.PLAYING) {
        // Touch acts as shoot command AND movement direction
        ship.shoot();
        // Movement is handled within ship.update() by checking touches.length
        return false; // Prevent default touch behavior
    }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createStarfield(200); // Recreate stars for new size
  // Ship position is handled by constraints, no need to reset typically
}


// ==================
// Ship Class (MODIFIED for speed)
// ==================
class Ship {
  constructor() {
    this.pos = createVector(width / 2, height - 50);
    this.vel = createVector(0, 0);
    // --- MODIFIED: Increased thrust for faster acceleration ---
    this.thrust = 0.38; // Was 0.3
    this.touchThrustMultiplier = 1.1; // Slightly more responsive touch thrust
    this.friction = 0.98; // Controls how quickly the ship slows down
    // --- MODIFIED: Increased maxSpeed for higher top speed ---
    this.maxSpeed = 9; // Was 7
    this.size = 30; // Base size
    this.cockpitColor = color(180, 100, 100); // Cyan cockpit
    this.engineColor1 = color(30, 100, 100); // Yellow inner engine
    this.engineColor2 = color(0, 100, 100); // Red outer engine glow
    this.finColor = color(220, 60, 70); // Bluish-grey fins
    this.detailColor = color(0, 0, 60); // Dark grey details
    this.shapeState = 0; // 0 for base shape, 1 for evolved shape
    this.shootCooldown = 0;
    this.baseShootDelay = 15; // Frames between shots at level 0
    this.shootDelayPerLevel = 2; // Reduction per fire rate level
    this.shieldCharges = 0;
    this.shieldVisualRadius = this.size * 1.1; // Shield slightly larger than ship
    this.invulnerableTimer = 0; // Frames remaining of invulnerability
    this.invulnerabilityDuration = 120; // Frames (2 seconds at 60fps)
    this.maxLevel = 5; // Max upgrade level for fire rate/spread
    this.fireRateLevel = 0;
    this.spreadShotLevel = 0;
    this.autoFireLevel = 0; // 0 = off, 1 = on
    this.maxAutoFireLevel = 1; // Only one level for auto-fire toggle
    this.baseUpgradeCost = 30; // Starting cost for upgrades
    this.costMultiplier = 2.0; // Cost doubles each level
    this.autoFireCost = 50; // Fixed cost for auto-fire
  }

  gainShields(amount) {
    let currentCharges = this.shieldCharges;
    this.shieldCharges = min(this.shieldCharges + amount, MAX_SHIELD_CHARGES);
    return this.shieldCharges - currentCharges; // Return how many were actually added
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
    // Cycle between 2 shapes based on level milestones
    this.shapeState = (level % 2);
  }

  get currentShootDelay() {
    // Calculate delay based on fire rate level, with a minimum delay
    return max(3, this.baseShootDelay - (this.fireRateLevel * this.shootDelayPerLevel));
  }

  getUpgradeCost(upgradeType) {
    let level;
    if (upgradeType === 'fireRate') {
      level = this.fireRateLevel;
      if (level >= this.maxLevel) return "MAX"; // Already maxed out
      return floor(this.baseUpgradeCost * pow(this.costMultiplier, level));
    } else if (upgradeType === 'spreadShot') {
      level = this.spreadShotLevel;
      if (level >= this.maxLevel) return "MAX";
      return floor(this.baseUpgradeCost * pow(this.costMultiplier, level));
    } else if (upgradeType === 'autoFire') {
        level = this.autoFireLevel;
        if (level >= this.maxAutoFireLevel) return "MAX";
        return this.autoFireCost; // Fixed cost for auto-fire toggle
    } else {
      return Infinity; // Unknown upgrade type
    }
  }

  attemptUpgrade(upgradeType) {
    let cost = this.getUpgradeCost(upgradeType);
    if (typeof cost !== 'number') return false; // It's "MAX" or unknown

    let currentLevel, maxLevelForType;
    let upgradeName = upgradeType.replace(/([A-Z])/g, ' $1').toUpperCase(); // Format name for message

    if (upgradeType === 'fireRate') {
        currentLevel = this.fireRateLevel;
        maxLevelForType = this.maxLevel;
    } else if (upgradeType === 'spreadShot') {
        currentLevel = this.spreadShotLevel;
        maxLevelForType = this.maxLevel;
    } else if (upgradeType === 'autoFire') {
        currentLevel = this.autoFireLevel;
        maxLevelForType = this.maxAutoFireLevel;
    } else {
        return false; // Should not happen if getUpgradeCost worked
    }

    if (currentLevel < maxLevelForType && money >= cost) {
      money -= cost;
      if (upgradeType === 'fireRate') this.fireRateLevel++;
      else if (upgradeType === 'spreadShot') this.spreadShotLevel++;
      else if (upgradeType === 'autoFire') this.autoFireLevel++;

      // Show upgrade message only if no other message is active
       if (infoMessageTimeout <= 0) {
         infoMessage = `${upgradeName} UPGRADED!`;
         if (upgradeType !== 'autoFire') { // Add level for non-toggle upgrades
            infoMessage += ` (Lvl ${currentLevel + 1})`;
         }
         infoMessageTimeout = 120;
       }
      return true; // Upgrade successful
    } else {
      return false; // Not enough money or already max level
    }
  }

   resetUpgrades() {
      // Called indirectly when new Ship() is created in resetGame()
      this.fireRateLevel = 0;
      this.spreadShotLevel = 0;
      this.autoFireLevel = 0;
   }

  resetPosition() {
      // Called indirectly when new Ship() is created in resetGame()
    this.pos.set(width / 2, height - 50);
    this.vel.set(0, 0);
    this.invulnerableTimer = 0; // Reset invulnerability too
    this.shapeState = 0; // Reset shape
  }

  update() {
    // Invulnerability timer
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer--;
    }

    // Auto-fire check (if upgrade purchased and space held)
    if (this.autoFireLevel > 0 && keyIsDown(32)) { // 32 is the keyCode for Spacebar
        this.shoot();
    }

    // Handle Touch Input OR Keyboard Input
    let isTouching = touches.length > 0;
    if (isTouching) {
      // Move towards touch position
      let touchPos = createVector(touches[0].x, touches[0].y);
      let direction = p5.Vector.sub(touchPos, this.pos);
      // Only apply thrust if touch is not right on the ship
      if (direction.magSq() > 1) { // Use magSq for efficiency
        direction.normalize();
        this.vel.add(direction.mult(this.thrust * this.touchThrustMultiplier));
      }
    } else {
      // Handle Keyboard Input (WASD or Arrow Keys)
      let movingUp = keyIsDown(UP_ARROW) || keyIsDown(87); // W
      let movingDown = keyIsDown(DOWN_ARROW) || keyIsDown(83); // S
      let movingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65); // A
      let movingRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68); // D

      if (movingUp) { this.vel.y -= this.thrust; }
      if (movingDown) { this.vel.y += this.thrust; }
      if (movingLeft) { this.vel.x -= this.thrust; }
      if (movingRight) { this.vel.x += this.thrust; }
    }

    // Apply friction and limit speed
    this.vel.mult(this.friction);
    this.vel.limit(this.maxSpeed);

    // Update position
    this.pos.add(this.vel);

    // Keep ship within screen bounds (with a small margin)
    let margin = this.size * 0.7;
    this.pos.x = constrain(this.pos.x, margin, width - margin);
    this.pos.y = constrain(this.pos.y, margin, height - margin);

    // Cooldown timer for shooting
    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }
  }

  shoot() {
    if (this.shootCooldown <= 0) {
      let bulletX = this.pos.x;
      let bulletY = this.pos.y - this.size * 0.6; // Fire from the nose

      // Determine number of shots and spread based on upgrade level
      let numShots = 1;
      let spreadAngle = 0;
      if (this.spreadShotLevel >= 1 && this.spreadShotLevel <= 2) {
        numShots = 3; spreadAngle = PI / 20; // Narrow spread
      } else if (this.spreadShotLevel >= 3 && this.spreadShotLevel <= 4) {
         numShots = 3; spreadAngle = PI / 15; // Medium spread
      } else if (this.spreadShotLevel >= this.maxLevel) {
        numShots = 5; spreadAngle = PI / 12; // Wider spread
      }

      // Create bullets
      for (let i = 0; i < numShots; i++) {
        let angle = 0;
        if (numShots > 1) {
          // Calculate angle for each bullet in the spread
          angle = map(i, 0, numShots - 1, -spreadAngle, spreadAngle);
        }
        bullets.push(new Bullet(bulletX, bulletY, angle));
      }

      this.shootCooldown = this.currentShootDelay; // Reset cooldown based on fire rate
    }
  }

  draw() {
    // Blinking effect when invulnerable
    if (this.invulnerableTimer <= 0 || (this.invulnerableTimer > 0 && frameCount % 10 < 5) ) {
      push(); // Isolate transformations and styles
      translate(this.pos.x, this.pos.y);

      // --- Draw Shield ---
      if (this.shieldCharges > 0) {
        let shieldAlpha = map(sin(frameCount * 0.15), -1, 1, 40, 80); // Pulsing alpha
        let shieldHue = 180; // Cyan color
        fill(shieldHue, 80, 100, shieldAlpha);
        noStroke();
        ellipse(0, 0, this.shieldVisualRadius * 2, this.shieldVisualRadius * 2);
        // Outline for definition
        strokeWeight(1.5);
        stroke(shieldHue, 90, 100, shieldAlpha + 30); // Slightly more opaque outline
        noFill();
        ellipse(0, 0, this.shieldVisualRadius * 2, this.shieldVisualRadius * 2);
      }

      // --- Draw Engine Thrust ---
      let enginePulseFactor = 1.0 + this.vel.mag() * 0.3; // More thrust when moving faster
      let enginePulse = map(sin(frameCount * 0.2), -1, 1, 0.8, 1.2) * enginePulseFactor;
      let engineSize = this.size * 0.5 * enginePulse;
      let engineBrightness = map(sin(frameCount * 0.3), -1, 1, 80, 100);
      noStroke();
      // Outer Glow (Orange/Red)
      for (let i = engineSize * 1.5; i > 0; i -= 3) {
          let alpha = map(i, 0, engineSize * 1.5, 0, 30);
          fill(hue(this.engineColor2), 100, engineBrightness, alpha);
          ellipse(0, this.size * 0.5, i, i * 1.5); // Elongated ellipse for thrust cone
      }
      // Inner Core (Yellow/Orange)
      fill(hue(this.engineColor1), 100, 100);
      ellipse(0, this.size * 0.5, engineSize * 0.6, engineSize * 1.2);


      // --- Draw Ship Body ---
      stroke(0, 0, 80); // Dark grey outline
      strokeWeight(1.5);
      // Body color changes subtly based on points
      let pointsHue = (200 + points * 0.2) % 360; // Shift hue from blue towards purple/red
      fill(pointsHue, 80, 95);

      let bodyWidthFactor = 0.6; // How wide the ship body is relative to size

      beginShape();
      if (this.shapeState === 0) { // Base Shape
          vertex(0, -this.size * 0.7); // Nose tip
          // Right side curve (bezier from nose to wing base)
          bezierVertex(
              this.size * bodyWidthFactor * 0.8, -this.size * 0.3, // Control point 1
              this.size * bodyWidthFactor * 0.9,  this.size * 0.0, // Control point 2
              this.size * bodyWidthFactor * 1.0,  this.size * 0.4  // Endpoint (wing base)
          );
          // Right side rear curve (bezier from wing base to center rear)
          bezierVertex(
              this.size * bodyWidthFactor * 0.5,  this.size * 0.6, // Control point 1
             -this.size * bodyWidthFactor * 0.5,  this.size * 0.6, // Control point 2
             -this.size * bodyWidthFactor * 1.0,  this.size * 0.4  // Endpoint (left wing base - symmetrical)
          );
          // Left side curve (bezier from left wing base to nose)
           bezierVertex(
             -this.size * bodyWidthFactor * 0.9,  this.size * 0.0, // Control point 1
             -this.size * bodyWidthFactor * 0.8, -this.size * 0.3, // Control point 2
              0, -this.size * 0.7 // Endpoint (nose tip)
          );
      } else { // Evolved Shape (Slightly larger and more angular)
          let s = this.size * 1.1; // Slightly larger base size
          let evolvedWidthFactor = bodyWidthFactor * 1.1; // Slightly wider
          vertex(0, -s * 0.8); // Sharper nose
           bezierVertex( s * evolvedWidthFactor * 0.8, -s * 0.2, s * evolvedWidthFactor * 0.9,  s * 0.1, s * evolvedWidthFactor * 1.0,  s * 0.5); // Right curve
           bezierVertex( s * evolvedWidthFactor * 0.5,  s * 0.7, -s * evolvedWidthFactor * 0.5,  s * 0.7, -s * evolvedWidthFactor * 1.0,  s * 0.5); // Rear curve
           bezierVertex(-s * evolvedWidthFactor * 0.9,  s * 0.1, -s * evolvedWidthFactor * 0.8, -s * 0.2, 0, -s * 0.8); // Left curve
      }
      endShape(CLOSE);

      // --- Draw Details ---
      strokeWeight(1);
      stroke(this.detailColor); // Darker detail lines
       if (this.shapeState === 0) {
            // Simple detail lines for base shape
            line(-this.size * bodyWidthFactor * 0.5, -this.size * 0.1, -this.size * bodyWidthFactor * 0.75, this.size * 0.3);
            line( this.size * bodyWidthFactor * 0.5, -this.size * 0.1,  this.size * bodyWidthFactor * 0.75, this.size * 0.3);
       } else {
           // More complex detail lines for evolved shape
           let s = this.size * 1.1;
           let ewf = bodyWidthFactor * 1.1;
           line(-s * ewf * 0.6, -s * 0.05, -s * ewf * 0.8, s * 0.4);
           line( s * ewf * 0.6, -s * 0.05,  s * ewf * 0.8, s * 0.4);
           line(0, -s*0.4, 0, s*0.1); // Center line
       }

      // --- Draw Fins ---
      // Adjust fin position/size based on shapeState
      let finYOffset = this.shapeState === 0 ? this.size * 0.3 : this.size * 1.1 * 0.35;
      let finXBase   = this.shapeState === 0 ? this.size * bodyWidthFactor * 0.6 : this.size * 1.1 * bodyWidthFactor * 1.1 * 0.7;
      let finTipX    = this.shapeState === 0 ? this.size * bodyWidthFactor * 1.1 : this.size * 1.1 * bodyWidthFactor * 1.1 * 1.1;
      let finRearX   = this.shapeState === 0 ? this.size * bodyWidthFactor * 0.75 : this.size * 1.1 * bodyWidthFactor * 1.1 * 0.8;
      let finRearY   = this.shapeState === 0 ? this.size * 0.6 : this.size * 1.1 * 0.7;

      fill(this.finColor);
      stroke(0, 0, 60); // Dark outline for fins
      strokeWeight(1);
      // Right Fin
      triangle( finXBase, finYOffset,  finTipX, finYOffset + this.size*0.1,  finRearX, finRearY);
      // Left Fin
      triangle(-finXBase, finYOffset, -finTipX, finYOffset + this.size*0.1, -finRearX, finRearY);


      // --- Draw Cockpit ---
      fill(this.cockpitColor);
      noStroke();
      ellipse(0, -this.size * 0.15, this.size * 0.4, this.size * 0.5); // Main cockpit shape
      // Cockpit highlight
      fill(0, 0, 100, 50); // White, semi-transparent
      ellipse(0, -this.size * 0.2, this.size * 0.2, this.size * 0.25);


      pop(); // Restore previous drawing style
    }
  }
}

// ==================
// Bullet Class
// ==================
class Bullet {
  constructor(x, y, angle = 0) {
    this.pos = createVector(x, y);
    this.speed = 16; // Faster bullets
    this.size = 5;
    this.startHue = frameCount % 360; // Base hue on frame count for rainbow effect start
    this.hue = this.startHue;
    let baseAngle = -PI / 2; // Point upwards
    this.vel = p5.Vector.fromAngle(baseAngle + angle); // Apply spread angle
    this.vel.mult(this.speed);
  }

  update() {
    this.pos.add(this.vel);
    this.hue = (this.hue + 4) % 360; // Cycle hue for rainbow effect
  }

  draw() {
    fill(this.hue, 90, 100); // Bright, saturated rainbow color
    stroke(0, 0, 100); // White outline for visibility
    strokeWeight(1);
    ellipse(this.pos.x, this.pos.y, this.size, this.size * 2.5); // Elongated shape
  }

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
    this.size = size || random(30, 80); // Use provided size or random default
    this.pos = createVector();

    let isInitialPlacement = (x !== undefined && y !== undefined);

    // Determine starting position
    if (isInitialPlacement) {
        // Used for initial spawning or splitting
        this.pos.x = x;
        this.pos.y = y;
    } else {
        // Spawn from Top, Left, or Right edge (not bottom)
        let edge = floor(random(3));
        if (edge === 0) { // Top edge
            this.pos.x = random(width);
            this.pos.y = -this.size / 2;
        } else if (edge === 1) { // Right edge
            this.pos.x = width + this.size / 2;
            this.pos.y = random(height * 0.7); // Avoid spawning too low
        } else { // Left edge
            this.pos.x = -this.size / 2;
            this.pos.y = random(height * 0.7); // Avoid spawning too low
        }
    }

    // Determine velocity
    if (vel) {
        // Use provided velocity (for splitting)
        this.vel = vel;
    } else {
        // Calculate initial velocity for newly spawned asteroids
        let baseSpeedMin = 0.6 + (currentLevel - 1) * 0.1;
        let baseSpeedMax = 1.8 + (currentLevel - 1) * 0.2;
        this.speed = min(MAX_ASTEROID_SPEED, random(baseSpeedMin, baseSpeedMax));
        // Apply speed modifier based on size (smaller = slightly faster)
        this.speed *= (this.size > 50 ? 0.9 : 1.1);

        if (isInitialPlacement) {
            // If placed initially (not edge spawn), give random direction
             this.vel = p5.Vector.random2D();
        } else {
            // If spawned from edge, aim vaguely towards center area
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
    this.color = color(random(20, 50), random(30, 70), random(30, 60)); // Brown/greyish hues
    this.rotation = random(TWO_PI); // Initial random rotation
    this.rotationSpeed = random(-0.025, 0.025); // Initial random rotation speed
    this.rotationAccel = 0.0001; // Very slight random change in rotation speed

    // Generate vertices for irregular shape
    this.vertices = [];
    let numVertices = floor(random(8, 16));
    for (let i = 0; i < numVertices; i++) {
        let angleOffset = map(i, 0, numVertices, 0, TWO_PI);
        // Vary radius to create bumps and dips
        let r = this.size / 2 + random(-this.size * 0.4, this.size * 0.3);
        let v = p5.Vector.fromAngle(angleOffset);
        v.mult(r);
        this.vertices.push(v);
    }

    // Generate crater details
    this.craters = [];
    let numCraters = floor(random(2, 6));
    for (let i = 0; i < numCraters; i++) {
        let angle = random(TWO_PI);
        let radius = random(this.size * 0.1, this.size * 0.35); // How far from center
        let craterSize = random(this.size * 0.1, this.size * 0.25);
        let craterPos = p5.Vector.fromAngle(angle).mult(radius);
        this.craters.push({ pos: craterPos, size: craterSize });
    }
  }

  update() {
    this.pos.add(this.vel);

    // Update rotation
    this.rotationSpeed += random(-this.rotationAccel, this.rotationAccel);
    this.rotationSpeed = constrain(this.rotationSpeed, -0.05, 0.05); // Limit rotation speed
    this.rotation += this.rotationSpeed;

    // Wrap around screen edges
    let buffer = this.size; // Use a larger buffer to ensure smooth wrapping
    if (this.pos.x < -buffer) this.pos.x = width + buffer;
    if (this.pos.x > width + buffer) this.pos.x = -buffer;
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

    // Simple shading: highlight and shadow offset slightly
    let highlightColor = color(mainHue, mainSat * 0.8, mainBri * 1.2);
    fill(highlightColor);
    noStroke();
    beginShape();
    for (let v of this.vertices) {
        vertex(v.x - 1, v.y - 1); // Offset slightly up-left
    }
    endShape(CLOSE);

    let shadowColor = color(mainHue, mainSat * 1.1, mainBri * 0.7);
    fill(shadowColor);
    noStroke();
    beginShape();
    for (let v of this.vertices) {
        vertex(v.x + 1, v.y + 1); // Offset slightly down-right
    }
    endShape(CLOSE);

    // Main asteroid body
    fill(this.color);
    stroke(mainHue, mainSat * 0.5, mainBri * random(1.3, 1.7)); // Jagged, brighter outline
    strokeWeight(1.5);
    beginShape();
    for (let v of this.vertices) {
        vertex(v.x, v.y);
    }
    endShape(CLOSE);

    // Draw craters
    noStroke();
    fill(hue(this.color), saturation(this.color)*0.8, brightness(this.color) * 0.5, 80); // Darker, semi-transparent
    for (let crater of this.craters) {
        ellipse(crater.pos.x, crater.pos.y, crater.size, crater.size * random(0.8, 1.2)); // Slightly irregular craters
    }

    pop();
  }

  hits(bullet) {
    // Simple circle collision detection
    let d = dist(this.pos.x, this.pos.y, bullet.pos.x, bullet.pos.y);
    return d < this.size / 2 + bullet.size / 2;
  }

  hitsShip(ship) {
    let targetX = ship.pos.x;
    let targetY = ship.pos.y;
    // Use shield radius if active, otherwise approximate ship body radius
    let targetRadius = ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5;
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
    this.baseHue = hue(particleColor);
    this.baseSat = saturation(particleColor);
    this.baseBri = brightness(particleColor);
    this.size = size !== null ? size : random(2, 6); // Use provided size or random default
  }

  update() {
    this.pos.add(this.vel);
    this.lifespan -= 3; // Fade out speed
    this.vel.mult(0.97); // Slow down over time (particle friction)
  }

  draw() {
    noStroke();
    // Use HSB color mode directly with lifespan as alpha
    fill(this.baseHue, this.baseSat, this.baseBri, this.lifespan);
    ellipse(this.pos.x, this.pos.y, this.size);
  }

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
        this.layer = floor(random(3)); // 0, 1, or 2
        this.size = map(this.layer, 0, 2, 0.5, 2.5); // Smaller stars for further layers
        this.speed = map(this.layer, 0, 2, 0.1, 0.5); // Slower speed for further layers
        this.brightness = random(60, 100); // Vary brightness slightly
    }

    update() {
        this.y += this.speed; // Move downwards based on layer speed
        // Reset star to top if it goes off bottom edge
        if (this.y > height + this.size) {
            this.y = -this.size;
            this.x = random(width); // Give it a new horizontal position
        }
    }

    draw() {
        fill(0, 0, this.brightness); // White stars (HSB: Sat=0, Bri=brightness)
        noStroke();
        ellipse(this.x, this.y, this.size);
    }
}

// ==================
// HealthPotion Class
// ==================
class HealthPotion {
    constructor(x, y) {
        // Spawn at specific location (e.g., after level up) or random top position
        this.pos = createVector(x || random(width * 0.1, width * 0.9), y || -30);
        this.vel = createVector(0, random(0.5, 1.5)); // Drift downwards slowly
        this.size = 20; // Base size for drawing calculations
        // Dimensions for drawing the potion shape
        this.bodyWidth = this.size * 0.6;
        this.bodyHeight = this.size * 0.8;
        this.neckWidth = this.size * 0.3;
        this.neckHeight = this.size * 0.4;
        this.rotation = 0;
        this.rotationSpeed = random(-0.01, 0.01); // Slow, gentle rotation
    }

    update() {
        this.pos.add(this.vel);
        this.rotation += this.rotationSpeed;
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);

        // Draw potion bottle shape
        fill(0, 85, 90); // Red color for health
        noStroke();
        // Body
        rect(-this.bodyWidth / 2, -this.bodyHeight / 2, this.bodyWidth, this.bodyHeight, 3); // Rounded corners
        // Neck
        rect(-this.neckWidth / 2, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth, this.neckHeight);
        // Top lip
        ellipse(0, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth * 1.2, this.neckWidth * 0.4);

        // Draw white cross symbol
        fill(0, 0, 100); // White
        rectMode(CENTER); // Draw rectangles from center
        rect(0, 0, this.bodyWidth * 0.5, this.bodyWidth * 0.15); // Horizontal bar
        rect(0, 0, this.bodyWidth * 0.15, this.bodyWidth * 0.5); // Vertical bar
        rectMode(CORNER); // Reset rectMode

        pop();
    }

    hitsShip(ship) {
        // Simple circle collision
        let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y);
        // Use half ship size for collision radius
        return d < this.size / 2 + ship.size * 0.5;
    }

    isOffscreen() {
        let margin = this.size * 2;
        return (this.pos.y > height + margin); // Check if way off bottom edge
    }
}

// ==================
// REMOVED: Boss Class
// ==================
// class Boss { ... }

// ==================
// REMOVED: EnemyBullet Class
// ==================
// class EnemyBullet { ... }
