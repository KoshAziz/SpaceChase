// --- Features ---
// - Start Screen (Enter/Tap to Start) - Title "Space-Chase" + Dynamic // MODIFIED (Size, Effect, Color)
// - Level System based on Points
// - Rainbow Bullets (Hue Cycling) // ENHANCED (Trail Effect)
// - Ship Upgrade System (Manual Purchase in Shop: Fire Rate, Spread Shot) - Uses Money
// - Score-based Shield System (Gain shield charge every 50 points, max 1) - Uses Points
// - Redesigned Spaceship Look (Score-based color/shape, added details, thinner) // ENHANCED (Hover, Thrust Particles, Upgrade Tint)
// - Dynamic Parallax Star Background (with occasional planet, galaxy, black hole) // ENHANCED (Twinkle, Shooting Stars, Slower BH Effect)
// - Enhanced Engine Thrust Effect (More reactive) // ENHANCED (Particles, Reduced Thrust Value)
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
  colorMode(HSB, 360, 100, 100, 100);
  let ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) { isMobile = true; }
  createStarfield(200);
  textAlign(CENTER, CENTER);
  textSize(20);
  currentTopColor = color(260, 80, 10);
  currentBottomColor = color(240, 70, 25);
}


// ==================
// Helper Functions
// ==================
function spawnInitialAsteroids() { asteroids = []; for (let i = 0; i < initialAsteroids; i++) { let startPos; let shipX = ship ? ship.pos.x : width / 2; let shipY = ship ? ship.pos.y : height - 50; do { startPos = createVector(random(width), random(height * 0.7)); } while (ship && dist(startPos.x, startPos.y, shipX, shipY) < 150); asteroids.push(new Asteroid(startPos.x, startPos.y)); } }
function createParticles(x, y, count, particleColor, particleSize = null, speedMult = 1, lifespanMult = 1) {
    let baseHue = hue(particleColor); let baseSat = saturation(particleColor); let baseBri = brightness(particleColor);
    for (let i = 0; i < count; i++) {
        let pColor = color( (baseHue + random(-15, 15)) % 360, baseSat * random(0.7, 1.1), baseBri * random(0.8, 1.2), 100 );
        particles.push(new Particle(x, y, pColor, particleSize, speedMult, lifespanMult));
    }
}
function createStarfield(numStars) { stars = []; for (let i = 0; i < numStars; i++) { stars.push(new Star()); } }
function setDifficultyForLevel(level) { let mobileFactor = isMobile ? 0.7 : 1.0; baseAsteroidSpawnRate = (0.009 + (level - 1) * 0.0015) * mobileFactor; currentAsteroidSpawnRate = baseAsteroidSpawnRate; baseEnemySpawnRate = (0.002 + (level - 1) * 0.0005) * mobileFactor; currentEnemySpawnRate = baseEnemySpawnRate; }
function setupShopButtons() { shopButtons = []; let buttonWidth = 220; let buttonHeight = 55; let startY = height / 2 - 90; let spacing = 80; shopButtons.push({ id: 'fireRate', x: width / 2 - buttonWidth / 2, y: startY, w: buttonWidth, h: buttonHeight }); shopButtons.push({ id: 'spreadShot', x: width / 2 - buttonWidth / 2, y: startY + spacing, w: buttonWidth, h: buttonHeight }); shopButtons.push({ id: 'nextLevel', x: width / 2 - buttonWidth / 2, y: startY + spacing * 2 + 30, w: buttonWidth, h: buttonHeight }); }


// ==================
// p5.js Draw Loop
// ==================
function draw() {
  if (gameState !== GAME_STATE.START_SCREEN && frameCount > 0 && frameCount % BACKGROUND_CHANGE_INTERVAL === 0) { let topH = random(180, 300); let bottomH = (topH + random(20, 60)) % 360; currentTopColor = color(topH, random(70, 90), random(10, 20)); currentBottomColor = color(bottomH, random(60, 85), random(25, 40)); }
  if (gameState !== GAME_STATE.START_SCREEN) { let currentTime = millis(); if (!planetVisible && currentTime - lastPlanetAppearanceTime > random(PLANET_MIN_INTERVAL, PLANET_MAX_INTERVAL)) { planetVisible = true; planetSize = random(width * 0.2, width * 0.5); let edge = floor(random(4)); if (edge === 0) planetPos = createVector(random(width), -planetSize / 2); else if (edge === 1) planetPos = createVector(width + planetSize / 2, random(height)); else if (edge === 2) planetPos = createVector(random(width), height + planetSize / 2); else planetPos = createVector(-planetSize / 2, random(height)); let targetPos = createVector(random(width * 0.2, width * 0.8), random(height * 0.2, height * 0.8)); planetVel = p5.Vector.sub(targetPos, planetPos); planetVel.normalize(); planetVel.mult(random(0.1, 0.3)); let baseH = random(360); planetBaseColor = color(baseH, random(40, 70), random(50, 80)); planetDetailColor1 = color((baseH + random(20, 50)) % 360, random(50, 70), random(60, 90)); planetDetailColor2 = color((baseH + random(180, 220)) % 360, random(30, 60), random(40, 70)); lastPlanetAppearanceTime = currentTime; } if (planetVisible) { planetPos.add(planetVel); let buffer = planetSize * 0.6; if (planetPos.x < -buffer || planetPos.x > width + buffer || planetPos.y < -buffer || planetPos.y > height + buffer) { planetVisible = false; } } }
  if (gameState === GAME_STATE.PLAYING && !isPaused && random(1) < shootingStarSpawnRate) { shootingStars.push(new ShootingStar()); }

  drawBackgroundAndStars();

  push();
  if (screenShakeDuration > 0) { translate(random(-screenShakeIntensity, screenShakeIntensity), random(-screenShakeIntensity, screenShakeIntensity)); }

  switch (gameState) {
    case GAME_STATE.START_SCREEN: displayStartScreen(); break;
    case GAME_STATE.PLAYING: runGameLogic(); if (isPaused) { displayPauseScreen(); } break;
    case GAME_STATE.UPGRADE_SHOP: displayUpgradeShop(); break;
    case GAME_STATE.GAME_OVER: runGameLogic(); displayGameOver(); break;
  }

  if (infoMessageTimeout > 0) { displayInfoMessage(); if (gameState === GAME_STATE.PLAYING && !isPaused) { infoMessageTimeout--; } else if (gameState === GAME_STATE.UPGRADE_SHOP) { infoMessageTimeout--; } }
  if (levelTransitionFlash > 0) { fill(0, 0, 100, levelTransitionFlash * 10); rect(0, 0, width, height); levelTransitionFlash--; }
  pop();
}


function displayStartScreen() { let titleText = "Space-Chase"; let titleSize = 72; textSize(titleSize); textAlign(CENTER, CENTER); let totalWidth = textWidth(titleText); let startX = width / 2 - totalWidth / 2; let currentX = startX; let titleY = height / 3; for (let i = 0; i < titleText.length; i++) { let char = titleText[i]; let charWidth = textWidth(char); let yOffset = sin(frameCount * 0.08 + i * 0.6) * 8; fill(0, 0, 0, 50); text(char, currentX + charWidth / 2 + 4, titleY + yOffset + 4); let h = (frameCount * 2 + i * 20) % 360; fill(h, 90, 100); text(char, currentX + charWidth / 2, titleY + yOffset); currentX += charWidth; } textSize(24); fill(0, 0, 100); textAlign(CENTER, CENTER); let startInstruction = isMobile ? "Tap Screen to Start" : "Press Enter to Start"; text(startInstruction, width / 2, height / 2 + 60); }
function displayPauseScreen() { fill(0, 0, 0, 60); rect(0, 0, width, height); fill(0, 0, 100); textSize(72); textAlign(CENTER, CENTER); text("PAUSED", width / 2, height / 2 - 30); textSize(24); text("Press ESC to Resume", width / 2, height / 2 + 50); }
function displayUpgradeShop() {
    fill(240, 60, 20, 95); rect(0, 0, width, height); fill(0, 0, 100); textSize(52); textAlign(CENTER, TOP); text(`Level ${currentLevel} Complete!`, width / 2, 60); textSize(36); text("Upgrade Shop", width / 2, 125); textSize(28); textAlign(CENTER, TOP); text(`Money: $${money}`, width / 2, 180); textSize(18); textAlign(CENTER, CENTER);
    for (let button of shopButtons) {
        let cost = "?"; let label = ""; let isMaxed = false; let canAfford = false; let currentLevelText = "";
        if (button.id === 'fireRate') { cost = ship.getUpgradeCost('fireRate'); isMaxed = (cost === "MAX"); if (!isMaxed) canAfford = (money >= cost); currentLevelText = `Lvl ${ship.fireRateLevel}/${ship.maxLevel}`; label = `Fire Rate ${currentLevelText}`; }
        else if (button.id === 'spreadShot') { cost = ship.getUpgradeCost('spreadShot'); isMaxed = (cost === "MAX"); if (!isMaxed) canAfford = (money >= cost); currentLevelText = `Lvl ${ship.spreadShotLevel}/${ship.maxLevel}`; label = `Spread Shot ${currentLevelText}`; }
        else if (button.id === 'nextLevel') { label = `Start Level ${currentLevel + 1}`; isMaxed = false; canAfford = true; }

        let buttonColor; let textColor = color(0, 0, 100); let borderColor = color(0, 0, 85); let hover = (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h);

        if (button.id !== 'nextLevel') { if (isMaxed) { buttonColor = color(0, 0, 55); textColor = color(0, 0, 80); label += " (MAX)"; borderColor = color(0, 0, 40); } else if (!canAfford) { buttonColor = color(0, 75, 50); textColor = color(0, 0, 90); label += ` ($${cost})`; borderColor = color(0, 80, 70); } else { buttonColor = hover ? color(120, 75, 65) : color(120, 70, 55); label += ` ($${cost})`; borderColor = color(120, 80, 80); } }
        else { buttonColor = hover ? color(90, 75, 70) : color(90, 70, 60); borderColor = color(90, 80, 85); }

        fill(buttonColor); stroke(borderColor); strokeWeight(hover ? 3 : 2); rect(button.x, button.y, button.w, button.h, 8); fill(textColor); noStroke(); text(label, button.x + button.w / 2, button.y + button.h / 2);
    }
}


function runGameLogic() {
  if (isPaused) { if (ship) ship.draw(); for (let b of bullets) b.draw(); for (let p of particles) p.draw(); for (let a of asteroids) a.draw(); for (let e of enemyShips) e.draw(); for (let eb of enemyBullets) eb.draw(); for (let pt of potions) pt.draw(); for (let pu of powerUps) pu.draw(); displayHUD(); return; }
  if (!ship) return;
  if (screenShakeDuration > 0) screenShakeDuration--; if (screenShakeDuration <= 0) screenShakeIntensity = 0;
  ship.update(); ship.draw();
  for (let i = bullets.length - 1; i >= 0; i--) { bullets[i].update(); bullets[i].draw(); if (bullets[i].isOffscreen()) { bullets.splice(i, 1); } }
  for (let i = particles.length - 1; i >= 0; i--) { particles[i].update(); particles[i].draw(); if (particles[i].isDead()) { particles.splice(i, 1); } }
  for (let i = enemyShips.length - 1; i >= 0; i--) { enemyShips[i].update(); enemyShips[i].draw(); if (enemyShips[i].isOffscreen()) { enemyShips.splice(i, 1); } }
  for (let i = enemyBullets.length - 1; i >= 0; i--) { enemyBullets[i].update(); enemyBullets[i].draw(); if (enemyBullets[i].isOffscreen()) { enemyBullets.splice(i, 1); } }
  for (let i = asteroids.length - 1; i >= 0; i--) { if (!asteroids[i]) continue; asteroids[i].update(); asteroids[i].draw(); }
  for (let i = powerUps.length - 1; i >= 0; i--) { powerUps[i].update(); powerUps[i].draw(); if (powerUps[i].isOffscreen()) { powerUps.splice(i, 1); } }
  handlePotions(); handleCollisions(); handlePowerUps();

  if (gameState === GAME_STATE.PLAYING) {
      let timeFactor = floor(frameCount / 1800) * 0.0005; currentAsteroidSpawnRate = baseAsteroidSpawnRate + timeFactor; currentEnemySpawnRate = baseEnemySpawnRate + timeFactor * 0.5;
      let maxAsteroidsAllowed = min(40, 15 + currentLevel * 3); let maxEnemiesAllowed = min(8, 2 + floor(currentLevel / 2)); let maxPotionsAllowed = 2; let maxPowerUpsAllowed = 1; let maxNebulasAllowed = 3;
      if (random(1) < currentAsteroidSpawnRate && asteroids.length < maxAsteroidsAllowed) { asteroids.push(new Asteroid()); }
      if (random(1) < currentEnemySpawnRate && enemyShips.length < maxEnemiesAllowed) { enemyShips.push(new EnemyShip()); }
      if (random(1) < potionSpawnRate && potions.length < maxPotionsAllowed) { potions.push(new HealthPotion()); }
      if (random(1) < powerUpSpawnRate && powerUps.length < maxPowerUpsAllowed) { let type = floor(random(NUM_POWERUP_TYPES)); powerUps.push(new PowerUp(type)); }
      if (random(1) < nebulaSpawnRate && nebulas.length < maxNebulasAllowed) { nebulas.push(new Nebula()); }
  }
  if (gameState === GAME_STATE.PLAYING) { displayHUD(); }
}


function handlePowerUps() {
    if (gameState !== GAME_STATE.PLAYING || !ship || isPaused) return;
    for (let i = powerUps.length - 1; i >= 0; i--) {
        if (powerUps[i].hitsShip(ship)) {
            let powerUpType = powerUps[i].type; let pickupPos = powerUps[i].pos.copy(); let pickupColor = powerUps[i].color; powerUps.splice(i, 1);
            createParticles(pickupPos.x, pickupPos.y, 25, pickupColor, 4, 1.8, 0.8);
            switch (powerUpType) {
                case POWERUP_TYPES.TEMP_SHIELD: ship.tempShieldActive = true; infoMessage = "TEMPORARY SHIELD!"; createParticles(ship.pos.x, ship.pos.y, 20, color(45, 90, 100)); break; // TODO: Play powerup sound (Shield)
                case POWERUP_TYPES.RAPID_FIRE: ship.rapidFireTimer = 300; infoMessage = "RAPID FIRE!"; createParticles(ship.pos.x, ship.pos.y, 20, color(120, 90, 100)); break; // TODO: Play powerup sound (Rapid Fire)
                case POWERUP_TYPES.EMP_BURST: infoMessage = "EMP BURST!"; createParticles(ship.pos.x, ship.pos.y, 60, color(210, 100, 100), 12, 3.5, 1.2); for (let k = asteroids.length - 1; k >= 0; k--) { createParticles(asteroids[k].pos.x, asteroids[k].pos.y, 15, asteroids[k].color, 3, 1.5); } asteroids = []; for (let k = enemyShips.length - 1; k >= 0; k--) { createParticles(enemyShips[k].pos.x, enemyShips[k].pos.y, 20, color(300, 80, 90)); } enemyShips = []; break; // TODO: Play powerup sound (EMP)
            }
            infoMessageTimeout = 120;
        }
    }
}


function handleCollisions() {
    if (gameState !== GAME_STATE.PLAYING || !ship || isPaused) return;
    for (let i = asteroids.length - 1; i >= 0; i--) {
        if (!asteroids[i]) continue;
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (asteroids[i] && bullets[j] && asteroids[i].hits(bullets[j])) { // TODO: Play asteroid hit sound
                let impactParticleCount = floor(random(3, 6)); createParticles(bullets[j].pos.x, bullets[j].pos.y, impactParticleCount, color(60, 40, 100), 2, 0.8, 0.7);
                let oldPoints = points; let asteroidSizeValue = asteroids[i] ? asteroids[i].size : 50; points += floor(map(asteroidSizeValue, minAsteroidSize, 80, 5, 15)); money += 2;
                let shieldsToAdd = floor(points / SHIELD_POINTS_THRESHOLD) - floor(oldPoints / SHIELD_POINTS_THRESHOLD); if (shieldsToAdd > 0 && ship.shieldCharges < MAX_SHIELD_CHARGES) { let actualAdded = ship.gainShields(shieldsToAdd); if (actualAdded > 0) { infoMessage = `+${actualAdded} SHIELD CHARGE(S)!`; infoMessageTimeout = 90; } } // TODO: Play shield gain sound
                let oldShapeLevel = floor(oldPoints / SHAPE_CHANGE_POINTS_THRESHOLD); let newShapeLevel = floor(points / SHAPE_CHANGE_POINTS_THRESHOLD); if (newShapeLevel > oldShapeLevel) { ship.changeShape(newShapeLevel); infoMessage = "SHIP SHAPE EVOLVED!"; infoMessageTimeout = 120; } // TODO: Play ship evolve sound
                let currentAsteroid = asteroids[i]; let asteroidPos = currentAsteroid.pos.copy(); let asteroidColor = currentAsteroid.color; asteroids.splice(i, 1); bullets.splice(j, 1); createParticles(asteroidPos.x, asteroidPos.y, floor(asteroidSizeValue / 2.5), asteroidColor, null, 1.2, 1.1); // TODO: Play asteroid explosion sound
                if (asteroidSizeValue > minAsteroidSize * 2) { let newSize = asteroidSizeValue * 0.6; let splitSpeedMultiplier = random(0.8, 2.0); let vel1 = p5.Vector.random2D().mult(splitSpeedMultiplier); let vel2 = p5.Vector.random2D().mult(splitSpeedMultiplier); asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel1)); asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel2)); }
                if (currentLevel < LEVEL_THRESHOLDS.length && points >= LEVEL_THRESHOLDS[currentLevel]) { // TODO: Play level up fanfare sound
                     points += 100 * currentLevel; money += 25 * currentLevel; gameState = GAME_STATE.UPGRADE_SHOP; infoMessage = `Level ${currentLevel} Cleared!`; infoMessageTimeout = 180; setupShopButtons(); cursor(ARROW); bullets = []; enemyShips = []; enemyBullets = []; powerUps = []; potions = []; return;
                 }
                break;
            }
        }
    }
    for (let i = enemyShips.length - 1; i >= 0; i--) {
        if (!enemyShips[i]) continue;
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (enemyShips[i] && bullets[j] && enemyShips[i].hits(bullets[j])) { // TODO: Play enemy hit/explosion sound
                points += 20; money += 5; createParticles(enemyShips[i].pos.x, enemyShips[i].pos.y, 20, color(300, 80, 90), 4, 1.5); enemyShips.splice(i, 1); bullets.splice(j, 1); break;
            }
        }
    }

    if (ship.invulnerableTimer <= 0) {
        const takeDamage = (sourceObject, sourceArray, index) => { // TODO: Play damage/shield hit sound
            let gameOver = false;
            if (ship.tempShieldActive) { ship.tempShieldActive = false; createParticles(ship.pos.x, ship.pos.y, 40, color(45, 100, 100), 5, 2.0); infoMessage = "TEMPORARY SHIELD LOST!"; infoMessageTimeout = 90; if (sourceObject && sourceArray && index !== undefined) { createParticles(sourceObject.pos.x, sourceObject.pos.y, 5, color(45,90,100)); if (sourceObject instanceof EnemyBullet) { sourceArray.splice(index, 1); } } }
            else if (ship.shieldCharges > 0) { ship.loseShield(); createParticles(ship.pos.x, ship.pos.y, 35, color(180, 80, 100), 4, 1.8); if (sourceObject && sourceArray && index !== undefined) { createParticles(sourceObject.pos.x, sourceObject.pos.y, 5, color(180,80,100)); if (sourceObject instanceof EnemyBullet) { sourceArray.splice(index, 1); } } }
            else { // TODO: Play hull damage/life lost sound
                 lives--; createParticles(ship.pos.x, ship.pos.y, 40, color(0, 90, 100), 5, 2.2); screenShakeIntensity = 7; screenShakeDuration = 20;
                 if (lives <= 0) { gameState = GAME_STATE.GAME_OVER; infoMessage = ""; infoMessageTimeout = 0; cursor(ARROW); gameOver = true; } // TODO: Play game over sound
                 else { ship.setInvulnerable(); }
                 if (sourceObject && sourceArray && index !== undefined) { let explosionColor = sourceObject.color || color(0,0,50); let particleCount = sourceObject.size ? floor(sourceObject.size / 1.5) : 20; if (sourceObject instanceof EnemyShip) { explosionColor = color(300, 80, 90); particleCount = 25; } else if (sourceObject instanceof EnemyBullet) { explosionColor = color(0, 100, 100); particleCount = 8; } createParticles(sourceObject.pos.x, sourceObject.pos.y, particleCount, explosionColor); sourceArray.splice(index, 1); }
            }
            return gameOver;
        };
        for (let i = asteroids.length - 1; i >= 0; i--) { if (asteroids[i] && asteroids[i].hitsShip(ship)) { if (takeDamage(asteroids[i], asteroids, i)) return; break; } }
        for (let i = enemyShips.length - 1; i >= 0; i--) { if (enemyShips[i] && enemyShips[i].hitsShip(ship)) { if (takeDamage(enemyShips[i], enemyShips, i)) return; break; } }
        for (let i = enemyBullets.length - 1; i >= 0; i--) { if (enemyBullets[i] && enemyBullets[i].hitsShip(ship)) { if (takeDamage(enemyBullets[i], enemyBullets, i)) return; break; } }
    }
}


function handlePotions() {
    if (gameState !== GAME_STATE.PLAYING || isPaused) { for (let i = potions.length - 1; i >= 0; i--) { potions[i].draw(); } return; }
    for (let i = potions.length - 1; i >= 0; i--) {
        potions[i].update(); potions[i].draw();
        if (potions[i].hitsShip(ship)) { // TODO: Play potion pickup sound
             createParticles(potions[i].pos.x, potions[i].pos.y, 20, color(0, 80, 100), 4, 1.5);
            if (lives < MAX_LIVES) { lives++; infoMessage = "+1 LIFE!"; infoMessageTimeout = 90; }
            else { points += 25; infoMessage = "+25 POINTS (MAX LIVES)!"; infoMessageTimeout = 90; } potions.splice(i, 1);
        } else if (potions[i].isOffscreen()) { potions.splice(i, 1); }
    }
}


function drawBackgroundAndStars() {
    for(let y=0; y < height; y++){ let inter = map(y, 0, height, 0, 1); let c = lerpColor(currentTopColor, currentBottomColor, inter); stroke(c); line(0, y, width, y); } noStroke();
    for (let i = nebulas.length - 1; i >= 0; i--) { if (gameState === GAME_STATE.PLAYING && !isPaused) nebulas[i].update(); nebulas[i].draw(); if (nebulas[i].isOffscreen()) { nebulas.splice(i, 1); } }
    drawBlackHole(); drawGalaxy(); if (planetVisible) { drawPlanet(); }
    for (let i = shootingStars.length - 1; i >= 0; i--) { if (gameState === GAME_STATE.PLAYING && !isPaused) shootingStars[i].update(); shootingStars[i].draw(); if (shootingStars[i].isDone()) { shootingStars.splice(i, 1); } }
    for (let star of stars) { if (gameState === GAME_STATE.PLAYING && !isPaused) star.update(); star.draw(); }
}

// Modified Black Hole Drawing
function drawBlackHole() {
    push();
    let bhX = width * 0.8; let bhY = height * 0.2; let bhSize = width * 0.05;
    fill(0); noStroke(); ellipse(bhX, bhY, bhSize * 1.1, bhSize * 1.1);
    let ringCount = 7; let maxRingSize = bhSize * 3.5; let minRingSize = bhSize * 1.2;
    noFill();
    // Use frameCount for slow, deterministic variation instead of pure random jitter
    let slowVariation = sin(frameCount * 0.01);
    for (let i = 0; i < ringCount; i++) {
        let sizeFactor = lerp(0.95, 1.05, (sin(frameCount * 0.02 + i * 0.5) + 1) / 2); // Slow size oscillation
        let size = lerp(minRingSize, maxRingSize, i / (ringCount - 1)) * sizeFactor;
        let hue = lerp(0, 60, i / (ringCount - 1)) + sin(frameCount * 0.03 + i) * 5; // Slow hue shift
        let alpha = map(i, 0, ringCount - 1, 50, 3);
        let sw = map(i, 0, ringCount - 1, 1.5, 5);
        strokeWeight(sw);
        stroke(hue, 90, 90, alpha);
        // Removed random offsets: ellipse(bhX + random(-sw, sw), bhY + random(-sw, sw), size * random(0.9, 1.1), size * random(0.9, 1.1));
        ellipse(bhX, bhY, size, size); // Draw rings without random jitter
    }
    pop();
}

function drawGalaxy() { push(); let centerX = width / 2; let centerY = height / 2; let baseHue1 = 270; let baseHue2 = 200; let alphaVal = 2.5; let angle = frameCount * 0.0003; translate(centerX, centerY); rotate(angle); translate(-centerX, -centerY); noStroke(); fill(baseHue1, 50, 60, alphaVal); ellipse(centerX - width * 0.1, centerY - height * 0.1, width * 1.3, height * 0.35); fill(baseHue2, 60, 70, alphaVal); ellipse(centerX + width * 0.15, centerY + height * 0.05, width * 1.2, height * 0.45); fill((baseHue1 + baseHue2) / 2, 55, 65, alphaVal * 0.9); ellipse(centerX, centerY, width * 1.0, height * 0.55); pop(); }
function drawPlanet() { push(); translate(planetPos.x, planetPos.y); noStroke(); fill(planetBaseColor); ellipse(0, 0, planetSize, planetSize); fill(planetDetailColor1); arc(0, 0, planetSize, planetSize, PI * 0.1, PI * 0.6, OPEN); arc(0, 0, planetSize * 0.8, planetSize * 0.8, PI * 0.7, PI * 1.2, OPEN); fill(planetDetailColor2); arc(0, 0, planetSize * 0.9, planetSize * 0.9, PI * 1.3, PI * 1.9, OPEN); noFill(); strokeWeight(planetSize * 0.06); stroke(hue(planetBaseColor), 20, 100, 20); ellipse(0, 0, planetSize * 1.06, planetSize * 1.06); pop(); }
function displayHUD() {
    let hudTextSize = 18; let hudPadding = 8; let lineSpacing = 25; let topMargin = 15; let leftMargin = 15;
    textSize(hudTextSize); noStroke();
    const drawHudText = (txt, x, y, alignment) => { textAlign(alignment, TOP); let txtWidth = textWidth(txt); fill(0, 0, 0, 40); if (alignment === LEFT) { rect(x - hudPadding / 2, y - hudPadding / 2, txtWidth + hudPadding, hudTextSize + hudPadding, 3); } else if (alignment === RIGHT) { rect(x + hudPadding / 2 - (txtWidth + hudPadding), y - hudPadding / 2, txtWidth + hudPadding, hudTextSize + hudPadding, 3); } fill(0, 0, 100, 90); text(txt, x, y); };
    drawHudText("Points: " + points, leftMargin, topMargin, LEFT); drawHudText(`Money: $${money}`, leftMargin, topMargin + lineSpacing, LEFT); drawHudText(`Lives: ${lives} / ${MAX_LIVES}`, leftMargin, topMargin + lineSpacing * 2, LEFT); drawHudText(`Shields: ${ship.shieldCharges} / ${MAX_SHIELD_CHARGES}`, leftMargin, topMargin + lineSpacing * 3, LEFT); drawHudText(`Level: ${currentLevel}`, leftMargin, topMargin + lineSpacing * 4, LEFT);
    let rightMargin = width - leftMargin; drawHudText(`Rate Lvl: ${ship.fireRateLevel}/${ship.maxLevel}`, rightMargin, topMargin, RIGHT); drawHudText(`Spread Lvl: ${ship.spreadShotLevel}/${ship.maxLevel}`, rightMargin, topMargin + lineSpacing, RIGHT);
}
function displayInfoMessage() { fill(0, 0, 100); textSize(18); textAlign(CENTER, BOTTOM); fill(0,0,0,40); rect(width/2 - textWidth(infoMessage)/2 - 10, height - 45, textWidth(infoMessage) + 20, 30, 5); fill(0, 0, 100); text(infoMessage, width / 2, height - 25); }
function displayGameOver() { fill(0, 0, 0, 60); rect(0, 0, width, height); fill(0, 90, 100); textSize(72); textAlign(CENTER, CENTER); text("GAME OVER", width / 2, height / 3); fill(0, 0, 100); textSize(36); text("Final Points: " + points, width / 2, height / 3 + 70); textAlign(CENTER, CENTER); textSize(24); let pulse = map(sin(frameCount * 0.1), -1, 1, 70, 100); fill(0, 0, pulse); let restartInstruction = isMobile ? "Tap Screen to Restart" : "Click or Press Enter to Restart"; text(restartInstruction, width / 2, height * 0.7); cursor(ARROW); }
function resetGame() {
    ship = new Ship(); bullets = []; particles = []; asteroids = []; potions = []; enemyShips = []; enemyBullets = []; powerUps = []; nebulas = []; shootingStars = [];
    points = 0; money = 0; lives = 3; currentLevel = 1; setDifficultyForLevel(currentLevel);
    currentTopColor = color(260, 80, 10); currentBottomColor = color(240, 70, 25); lastPlanetAppearanceTime = -Infinity; planetVisible = false;
    frameCount = 0; infoMessage = ""; infoMessageTimeout = 0; screenShakeDuration = 0; screenShakeIntensity = 0; isPaused = false; levelTransitionFlash = 0;
    cursor(); spawnInitialAsteroids();
}
function startGame() { resetGame(); gameState = GAME_STATE.PLAYING; }
function startNextLevel() {
    if (gameState !== GAME_STATE.UPGRADE_SHOP) return;
    currentLevel++; setDifficultyForLevel(currentLevel); ship.resetPositionForNewLevel(); asteroids = [];
    frameCount = 0; infoMessage = `Starting Level ${currentLevel}`; infoMessageTimeout = 90; levelTransitionFlash = 15;
    spawnInitialAsteroids(); gameState = GAME_STATE.PLAYING; cursor();
}


function mousePressed() {
    if (gameState === GAME_STATE.START_SCREEN) { startGame(); }
    else if (gameState === GAME_STATE.PLAYING && !isPaused) { ship.shoot(); } // TODO: Play shoot sound
    else if (gameState === GAME_STATE.UPGRADE_SHOP) { for (let button of shopButtons) { if (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h) { handleShopButtonPress(button.id); break; } } }
    else if (gameState === GAME_STATE.GAME_OVER) { startGame(); }
}
function keyPressed() {
    if (keyCode === ESCAPE && gameState === GAME_STATE.PLAYING) { isPaused = !isPaused; if (isPaused) cursor(ARROW); else cursor(); }
    else if (gameState === GAME_STATE.START_SCREEN) { if (keyCode === ENTER || keyCode === RETURN) { startGame(); } }
    else if (gameState === GAME_STATE.PLAYING && !isPaused) { if (keyCode === 32) { ship.shoot(); return false; } } // TODO: Play shoot sound (spacebar press)
    else if (gameState === GAME_STATE.UPGRADE_SHOP) { if (keyCode === ENTER || keyCode === RETURN) { handleShopButtonPress('nextLevel'); } }
    else if (gameState === GAME_STATE.GAME_OVER) { if (keyCode === ENTER || keyCode === RETURN) { startGame(); } }
}
function touchStarted() {
    if (touches.length === 0) return false; let touchX = touches[0].x; let touchY = touches[0].y;
    if (gameState === GAME_STATE.START_SCREEN) { startGame(); return false; }
    else if (gameState === GAME_STATE.GAME_OVER) { startGame(); return false; }
    else if (gameState === GAME_STATE.UPGRADE_SHOP) { for (let button of shopButtons) { if (touchX > button.x && touchX < button.x + button.w && touchY > button.y && touchY < button.y + button.h) { handleShopButtonPress(button.id); return false; } } return false; }
    else if (gameState === GAME_STATE.PLAYING && !isPaused) { ship.shoot(); return false; } // TODO: Play shoot sound (tap)
    return false;
}
function handleShopButtonPress(buttonId) {
    if (gameState !== GAME_STATE.UPGRADE_SHOP) return;
    if (buttonId === 'nextLevel') { startNextLevel(); } // TODO: Play UI confirm/next level sound
    else {
        let success = ship.attemptUpgrade(buttonId);
        if (success) { // TODO: Play upgrade success sound
             let button = shopButtons.find(b => b.id === buttonId); if(button) { createParticles(button.x + button.w / 2, button.y + button.h / 2, 20, color(120, 80, 100), 6, 2.0, 0.8); }
        } else { // TODO: Play UI error/cannot afford sound (optional)
            let cost = ship.getUpgradeCost(buttonId); if (cost !== "MAX" && money < cost) { infoMessage = "Not enough money!"; infoMessageTimeout = 60; } else if (cost === "MAX") { infoMessage = "Upgrade Maxed Out!"; infoMessageTimeout = 60; }
        }
    }
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); createStarfield(200); if (gameState === GAME_STATE.UPGRADE_SHOP) { setupShopButtons(); } }




// ==================
// Ship Class
// ==================
class Ship {
    constructor() {
        this.pos = createVector(width / 2, height - 50); this.vel = createVector(0, 0);
        this.thrust = 0.38; // <-- REDUCED THRUST VALUE
         this.touchThrustMultiplier = 1.15; this.friction = 0.975; this.maxSpeed = 9.5; this.size = 30;
        this.cockpitColor = color(180, 100, 100); this.baseEngineColor1 = color(30, 100, 100); this.baseEngineColor2 = color(0, 100, 100);
        this.finColor = color(220, 60, 70); this.detailColor = color(0, 0, 60);
        this.shapeState = 0; this.shootCooldown = 0; this.baseShootDelay = 15; this.shootDelayPerLevel = 2; this.shieldCharges = 0; this.shieldVisualRadius = this.size * 1.2;
         this.invulnerableTimer = 0; this.invulnerabilityDuration = 120;
        this.maxLevel = 5; this.fireRateLevel = 0; this.spreadShotLevel = 0;
        this.baseUpgradeCost = 30; this.costMultiplier = 2.0;
        this.rapidFireTimer = 0; this.tempShieldActive = false; this.hoverOffset = 0;
    }

    gainShields(amount) { let currentCharges = this.shieldCharges; this.shieldCharges = min(this.shieldCharges + amount, MAX_SHIELD_CHARGES); return this.shieldCharges - currentCharges; }
    loseShield() { if (this.shieldCharges > 0) { this.shieldCharges--; } }
    setInvulnerable() { this.invulnerableTimer = this.invulnerabilityDuration; }
    changeShape(level) { this.shapeState = (level % 2); }
    get currentShootDelay() { if (this.rapidFireTimer > 0) { return 2; } else { return max(3, this.baseShootDelay - (this.fireRateLevel * this.shootDelayPerLevel)); } }

    getUpgradeCost(upgradeType) {
        let level;
        if (upgradeType === 'fireRate') { level = this.fireRateLevel; if (level >= this.maxLevel) return "MAX"; return floor(this.baseUpgradeCost * pow(this.costMultiplier, level)); }
        else if (upgradeType === 'spreadShot') { level = this.spreadShotLevel; if (level >= this.maxLevel) return "MAX"; return floor(this.baseUpgradeCost * pow(this.costMultiplier, level)); }
        else { return Infinity; }
    }

    attemptUpgrade(upgradeType) {
        let cost = this.getUpgradeCost(upgradeType); if (typeof cost !== 'number') return false;
        let currentLevel, maxLevelForType; let upgradeName = upgradeType.replace(/([A-Z])/g, ' $1').toUpperCase();
        if (upgradeType === 'fireRate') { currentLevel = this.fireRateLevel; maxLevelForType = this.maxLevel; }
        else if (upgradeType === 'spreadShot') { currentLevel = this.spreadShotLevel; maxLevelForType = this.maxLevel; }
        else { return false; }
        if (currentLevel < maxLevelForType && money >= cost) { money -= cost; if (upgradeType === 'fireRate') this.fireRateLevel++; else if (upgradeType === 'spreadShot') this.spreadShotLevel++; return true; }
        else { return false; }
    }

    resetPositionForNewLevel() { this.pos.set(width / 2, height - 50); this.vel.set(0, 0); this.invulnerableTimer = 60; this.rapidFireTimer = 0; this.tempShieldActive = false; }

    update() {
        if (this.invulnerableTimer > 0) { this.invulnerableTimer--; } if (this.rapidFireTimer > 0) { this.rapidFireTimer--; } if (this.shootCooldown > 0) { this.shootCooldown--; }
        this.hoverOffset = sin(frameCount * 0.05) * 2;
        let isTouching = touches.length > 0; let acceleration = createVector(0, 0); let applyThrustParticles = false;
        if (isTouching) { let touchPos = createVector(touches[0].x, touches[0].y); let direction = p5.Vector.sub(touchPos, this.pos); if (direction.magSq() > 1) { direction.normalize(); let targetVel = direction.mult(this.maxSpeed * this.touchThrustMultiplier); this.vel.lerp(targetVel, 0.15); applyThrustParticles = true; } }
        else { let movingUp = keyIsDown(UP_ARROW) || keyIsDown(87); let movingDown = keyIsDown(DOWN_ARROW) || keyIsDown(83); let movingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65); let movingRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68); if (movingUp) { acceleration.y -= this.thrust; applyThrustParticles = true;} if (movingDown) { acceleration.y += this.thrust; } if (movingLeft) { acceleration.x -= this.thrust; applyThrustParticles = true;} if (movingRight) { acceleration.x += this.thrust; applyThrustParticles = true;} this.vel.add(acceleration); this.vel.mult(this.friction); }
        if (applyThrustParticles && frameCount % 3 === 0) { let thrustColor = lerpColor(this.baseEngineColor1, color(60, 100, 100), this.fireRateLevel / this.maxLevel); createParticles(this.pos.x, this.pos.y + this.size * 0.55, 1, thrustColor, 3, 1.5, 0.5); } // Adjusted Y offset for particles
        this.vel.limit(this.maxSpeed); this.pos.add(this.vel);
        let margin = this.size * 0.7; this.pos.x = constrain(this.pos.x, margin, width - margin); this.pos.y = constrain(this.pos.y, margin, height - margin);
    }

    shoot() {
        if (this.shootCooldown <= 0) {
            let originY = this.pos.y - this.size * 0.6 + this.hoverOffset; let originPoints = [createVector(this.pos.x, originY)];
            if (this.spreadShotLevel >= 1 && this.spreadShotLevel <= 2) { let offset = this.size * 0.15; originPoints = [ createVector(this.pos.x - offset, originY + 5), createVector(this.pos.x, originY), createVector(this.pos.x + offset, originY + 5) ]; }
            else if (this.spreadShotLevel >= 3 && this.spreadShotLevel <= 4) { let offset = this.size * 0.2; originPoints = [ createVector(this.pos.x - offset, originY + 5), createVector(this.pos.x, originY), createVector(this.pos.x + offset, originY + 5) ]; }
            else if (this.spreadShotLevel >= this.maxLevel) { let offset1 = this.size * 0.25; let offset2 = this.size * 0.1; originPoints = [ createVector(this.pos.x - offset1, originY + 8), createVector(this.pos.x - offset2, originY + 3), createVector(this.pos.x, originY), createVector(this.pos.x + offset2, originY + 3), createVector(this.pos.x + offset1, originY + 8) ]; }
            let numShots = 1; let spreadAngle = 0;
            if (this.spreadShotLevel >= 1 && this.spreadShotLevel <= 2) { numShots = 3; spreadAngle = PI / 20; } else if (this.spreadShotLevel >= 3 && this.spreadShotLevel <= 4) { numShots = 3; spreadAngle = PI / 15; } else if (this.spreadShotLevel >= this.maxLevel) { numShots = 5; spreadAngle = PI / 12; }
            for (let i = 0; i < numShots; i++) { let angle = 0; if (numShots > 1) { angle = map(i, 0, numShots - 1, -spreadAngle, spreadAngle); } let origin = originPoints[i] || originPoints[0]; bullets.push(new Bullet(origin.x, origin.y, angle)); }
            this.shootCooldown = this.currentShootDelay;
        }
    }

    draw() { if (this.invulnerableTimer <= 0 || (this.invulnerableTimer > 0 && frameCount % 10 < 5) ) { push(); translate(this.pos.x, this.pos.y + this.hoverOffset); if (this.tempShieldActive) { let tempShieldAlpha = map(sin(frameCount * 0.3), -1, 1, 60, 100); let tempShieldHue = 45; fill(tempShieldHue, 90, 100, tempShieldAlpha); noStroke(); ellipse(0, 0, this.shieldVisualRadius * 2.3, this.shieldVisualRadius * 2.3); strokeWeight(2.5); stroke(tempShieldHue, 100, 100, tempShieldAlpha + 25); noFill(); ellipse(0, 0, this.shieldVisualRadius * 2.3, this.shieldVisualRadius * 2.3); } else if (this.shieldCharges > 0) { let shieldAlpha = map(sin(frameCount * 0.2), -1, 1, 50, 90); let shieldHue = 180; fill(shieldHue, 80, 100, shieldAlpha); noStroke(); ellipse(0, 0, this.shieldVisualRadius * 2.1, this.shieldVisualRadius * 2.1); strokeWeight(2); stroke(shieldHue, 90, 100, shieldAlpha + 35); noFill(); ellipse(0, 0, this.shieldVisualRadius * 2.1, this.shieldVisualRadius * 2.1); } let enginePulseFactor = 1.0 + this.vel.mag() * 0.4; let pulseSpeed = (this.rapidFireTimer > 0) ? 0.5 : 0.25; let enginePulse = map(sin(frameCount * pulseSpeed), -1, 1, 0.8, 1.3) * enginePulseFactor; let engineSize = this.size * 0.55 * enginePulse; let engineBrightness = map(sin(frameCount * 0.35), -1, 1, 85, 100); noStroke(); let engineColor1 = lerpColor(this.baseEngineColor1, color(60, 90, 100), this.fireRateLevel / this.maxLevel); let engineColor2 = lerpColor(this.baseEngineColor2, color(45, 90, 100), this.fireRateLevel / this.maxLevel); for (let i = engineSize * 1.6; i > 0; i -= 3) { let alpha = map(i, 0, engineSize * 1.6, 0, 35); fill(hue(engineColor2), saturation(engineColor2), engineBrightness, alpha); ellipse(0, this.size * 0.55, i, i * 1.6); } fill(hue(engineColor1), saturation(engineColor1), 100); ellipse(0, this.size * 0.55, engineSize * 0.7, engineSize * 1.3); stroke(0, 0, 85); strokeWeight(1.5); let pointsHue = (200 + points * 0.2) % 360; fill(pointsHue, 85, 98); let bodyWidthFactor = 0.6; beginShape(); if (this.shapeState === 0) { vertex(0, -this.size * 0.7); bezierVertex( this.size * bodyWidthFactor * 0.8, -this.size * 0.3, this.size * bodyWidthFactor * 0.9, this.size * 0.0, this.size * bodyWidthFactor * 1.0, this.size * 0.4); bezierVertex( this.size * bodyWidthFactor * 0.5, this.size * 0.6, -this.size * bodyWidthFactor * 0.5, this.size * 0.6, -this.size * bodyWidthFactor * 1.0, this.size * 0.4); bezierVertex(-this.size * bodyWidthFactor * 0.9, this.size * 0.0, -this.size * bodyWidthFactor * 0.8, -this.size * 0.3, 0, -this.size * 0.7); } else { let s = this.size * 1.1; let evolvedWidthFactor = bodyWidthFactor * 1.1; vertex(0, -s * 0.8); bezierVertex( s * evolvedWidthFactor * 0.8, -s * 0.2, s * evolvedWidthFactor * 0.9, s * 0.1, s * evolvedWidthFactor * 1.0, s * 0.5); bezierVertex( s * evolvedWidthFactor * 0.5, s * 0.7, -s * evolvedWidthFactor * 0.5, s * 0.7, -s * evolvedWidthFactor * 1.0, s * 0.5); bezierVertex(-s * evolvedWidthFactor * 0.9, s * 0.1, -s * evolvedWidthFactor * 0.8, -s * 0.2, 0, -s * 0.8); } endShape(CLOSE); strokeWeight(1.2); stroke(this.detailColor); if (this.shapeState === 0) { line(-this.size * bodyWidthFactor * 0.5, -this.size * 0.1, -this.size * bodyWidthFactor * 0.75, this.size * 0.3); line( this.size * bodyWidthFactor * 0.5, -this.size * 0.1, this.size * bodyWidthFactor * 0.75, this.size * 0.3); } else { let s = this.size * 1.1; let ewf = bodyWidthFactor * 1.1; line(-s * ewf * 0.6, -s * 0.05, -s * ewf * 0.8, s * 0.4); line( s * ewf * 0.6, -s * 0.05, s * ewf * 0.8, s * 0.4); line(0, -s*0.4, 0, s*0.1); } let finYOffset = this.shapeState === 0 ? this.size * 0.3 : this.size * 1.1 * 0.35; let finXBase = this.shapeState === 0 ? this.size * bodyWidthFactor * 0.6 : this.size * 1.1 * bodyWidthFactor * 1.1 * 0.7; let finTipX = this.shapeState === 0 ? this.size * bodyWidthFactor * 1.1 : this.size * 1.1 * bodyWidthFactor * 1.1 * 1.1; let finRearX = this.shapeState === 0 ? this.size * bodyWidthFactor * 0.75 : this.size * 1.1 * bodyWidthFactor * 1.1 * 0.8; let finRearY = this.shapeState === 0 ? this.size * 0.6 : this.size * 1.1 * 0.7; fill(this.finColor); stroke(0, 0, 65); strokeWeight(1); triangle( finXBase, finYOffset, finTipX, finYOffset + this.size*0.1, finRearX, finRearY); triangle(-finXBase, finYOffset, -finTipX, finYOffset + this.size*0.1, -finRearX, finRearY); fill(this.cockpitColor); noStroke(); ellipse(0, -this.size * 0.15, this.size * 0.4, this.size * 0.5); fill(0, 0, 100, 60); ellipse(0, -this.size * 0.2, this.size * 0.25, this.size * 0.3); pop(); } } }


// ==================
// Bullet Class
// ==================
class Bullet { constructor(x, y, angle = 0) { this.pos = createVector(x, y); this.speed = 17; this.size = 5.5; this.startHue = frameCount % 360; this.hue = this.startHue; let baseAngle = -PI / 2; this.vel = p5.Vector.fromAngle(baseAngle + angle); this.vel.mult(this.speed); this.trail = []; this.trailLength = 5; } update() { this.trail.unshift(this.pos.copy()); if (this.trail.length > this.trailLength) { this.trail.pop(); } this.pos.add(this.vel); this.hue = (this.hue + 5) % 360; } draw() { noStroke(); for (let i = 0; i < this.trail.length; i++) { let trailPos = this.trail[i]; let alpha = map(i, 0, this.trail.length - 1, 50, 0); let trailSize = map(i, 0, this.trail.length - 1, this.size, this.size * 0.5); fill(this.hue, 90, 100, alpha); ellipse(trailPos.x, trailPos.y, trailSize, trailSize * 2.0); } fill(this.hue, 95, 100); stroke(0, 0, 100); strokeWeight(1); ellipse(this.pos.x, this.pos.y, this.size, this.size * 2.5); } isOffscreen() { let margin = this.size * 5; return (this.pos.y < -margin || this.pos.y > height + margin || this.pos.x < -margin || this.pos.x > width + margin); } }


// ==================
// Asteroid Class
// ==================
class Asteroid { constructor(x, y, size, vel) { this.size = size || random(30, 85); this.pos = createVector(); let isInitialPlacement = (x !== undefined && y !== undefined); if (isInitialPlacement) { this.pos.x = x; this.pos.y = y; } else { let edge = floor(random(3)); if (edge === 0) { this.pos.x = random(width); this.pos.y = -this.size / 2; } else if (edge === 1) { this.pos.x = width + this.size / 2; this.pos.y = random(height * 0.7); } else { this.pos.x = -this.size / 2; this.pos.y = random(height * 0.7); } } if (vel) { this.vel = vel; } else { let baseSpeedMin = 0.6 + (currentLevel - 1) * 0.1; let baseSpeedMax = 1.8 + (currentLevel - 1) * 0.2; this.speed = min(MAX_ASTEROID_SPEED, random(baseSpeedMin, baseSpeedMax)); this.speed *= (this.size > 50 ? 0.9 : 1.1); this.speed *= random(0.9, 1.1); if (isInitialPlacement) { this.vel = p5.Vector.random2D(); } else { let targetX = width / 2 + random(-width * 0.25, width * 0.25); let targetY = height / 2 + random(-height * 0.25, height * 0.25); let direction = createVector(targetX - this.pos.x, targetY - this.pos.y); direction.normalize(); direction.rotate(random(-PI / 12, PI / 12)); this.vel = direction; } this.vel.mult(this.speed); } this.color = color(random(20, 50), random(30, 70), random(35, 65)); this.rotation = random(TWO_PI); this.rotationSpeed = random(-0.04, 0.04); this.rotationAccel = 0.0001; this.vertices = []; let numVertices = floor(random(9, 18)); for (let i = 0; i < numVertices; i++) { let angleOffset = map(i, 0, numVertices, 0, TWO_PI); let r = this.size / 2 + random(-this.size * 0.45, this.size * 0.35); let v = p5.Vector.fromAngle(angleOffset); v.mult(r); this.vertices.push(v); } this.craters = []; let numCraters = floor(random(2, 7)); for (let i = 0; i < numCraters; i++) { let angle = random(TWO_PI); let radius = random(this.size * 0.1, this.size * 0.4); let craterSize = random(this.size * 0.1, this.size * 0.3); let craterPos = p5.Vector.fromAngle(angle).mult(radius); this.craters.push({ pos: craterPos, size: craterSize }); } } update() { this.pos.add(this.vel); this.rotationSpeed += random(-this.rotationAccel, this.rotationAccel); this.rotationSpeed = constrain(this.rotationSpeed, -0.06, 0.06); this.rotation += this.rotationSpeed; let buffer = this.size; if (this.pos.x < -buffer) this.pos.x = width + buffer; if (this.pos.x > width + buffer) this.pos.x = -buffer; if (this.pos.y < -buffer) this.pos.y = height + buffer; if (this.pos.y > height + buffer) this.pos.y = -buffer; } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); let mainBri = brightness(this.color); let mainSat = saturation(this.color); let mainHue = hue(this.color); let highlightColor = color(mainHue, mainSat * 0.7, mainBri * 1.3); fill(highlightColor); noStroke(); beginShape(); for (let v of this.vertices) { vertex(v.x - 1.5, v.y - 1.5); } endShape(CLOSE); let shadowColor = color(mainHue, mainSat * 1.2, mainBri * 0.6); fill(shadowColor); noStroke(); beginShape(); for (let v of this.vertices) { vertex(v.x + 1.5, v.y + 1.5); } endShape(CLOSE); fill(this.color); stroke(mainHue, mainSat * 0.4, mainBri * random(1.4, 1.8)); strokeWeight(1.8); beginShape(); for (let v of this.vertices) { vertex(v.x, v.y); } endShape(CLOSE); noStroke(); fill(hue(this.color), saturation(this.color)*0.7, brightness(this.color) * 0.4, 90); for (let crater of this.craters) { ellipse(crater.pos.x, crater.pos.y, crater.size, crater.size * random(0.7, 1.3)); } pop(); } hits(bullet) { let d = dist(this.pos.x, this.pos.y, bullet.pos.x, bullet.pos.y); return d < this.size / 2 + bullet.size / 2; } hitsShip(ship) { let targetX = ship.pos.x; let targetY = ship.pos.y; let targetRadius = ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5); let d = dist(this.pos.x, this.pos.y, targetX, targetY); return d < this.size / 2 + targetRadius; } }


// ==================
// Particle Class
// ==================
class Particle { constructor(x, y, particleColor, size = null, speedMult = 1, lifespanMult = 1) { this.pos = createVector(x, y); this.vel = p5.Vector.random2D(); this.vel.mult(random(1.5, 6) * speedMult); this.lifespan = 100 * lifespanMult * random(0.8, 1.5); this.maxLifespan = this.lifespan; this.baseHue = hue(particleColor); this.baseSat = saturation(particleColor); this.baseBri = brightness(particleColor); this.size = size !== null ? size * random(0.8, 1.2) : random(2, 7); this.drag = random(0.95, 0.99); } update() { this.pos.add(this.vel); this.lifespan -= 2.5; this.vel.mult(this.drag); } draw() { noStroke(); let currentAlpha = map(this.lifespan, 0, this.maxLifespan, 0, 100); fill(this.baseHue, this.baseSat, this.baseBri, currentAlpha); ellipse(this.pos.x, this.pos.y, this.size * (this.lifespan / this.maxLifespan)); } isDead() { return this.lifespan <= 0; } }


// ==================
// Star Class
// ==================
class Star { constructor() { this.x = random(width); this.y = random(height); this.layer = floor(random(4)); this.size = map(this.layer, 0, 3, 0.4, 2.8); this.speed = map(this.layer, 0, 3, 0.05, 0.6); this.baseBrightness = random(50, 95); this.twinkleSpeed = random(0.03, 0.08); this.twinkleRange = random(0.6, 1.4); this.twinkleOffset = random(TWO_PI); } update() { this.y += this.speed; if (this.y > height + this.size) { this.y = -this.size; this.x = random(width); } } draw() { let twinkleFactor = map(sin(frameCount * this.twinkleSpeed + this.twinkleOffset), -1, 1, 1.0 - this.twinkleRange / 2, 1.0 + this.twinkleRange / 2); let currentBrightness = constrain(this.baseBrightness * twinkleFactor, 30, 100); fill(0, 0, currentBrightness, 90); noStroke(); ellipse(this.x, this.y, this.size, this.size); } }


// ==================
// ShootingStar Class
// ==================
class ShootingStar { constructor() { this.startX = random(width); this.startY = random(-50, -10); this.pos = createVector(this.startX, this.startY); let angle = random(PI * 0.3, PI * 0.7); this.speed = random(15, 30); this.vel = p5.Vector.fromAngle(angle).mult(this.speed); this.len = random(50, 150); this.brightness = random(80, 100); this.lifespan = 100; } update() { this.pos.add(this.vel); this.lifespan -= 2; } draw() { if (this.lifespan <= 0) return; let alpha = map(this.lifespan, 0, 100, 0, 100); let tailPos = p5.Vector.sub(this.pos, this.vel.copy().setMag(this.len)); strokeWeight(random(1.5, 3)); stroke(0, 0, this.brightness, alpha); line(this.pos.x, this.pos.y, tailPos.x, tailPos.y); } isDone() { return this.lifespan <= 0 || this.pos.y > height + this.len || this.pos.x < -this.len || this.pos.x > width + this.len; } }


// ==================
// HealthPotion Class
// ==================
class HealthPotion { constructor(x, y) { this.pos = createVector(x || random(width * 0.1, width * 0.9), y || -30); this.vel = createVector(0, random(0.5, 1.5)); this.size = 20; this.bodyWidth = this.size * 0.6; this.bodyHeight = this.size * 0.8; this.neckWidth = this.size * 0.3; this.neckHeight = this.size * 0.4; this.rotation = 0; this.rotationSpeed = random(-0.015, 0.015); this.pulseOffset = random(TWO_PI); } update() { this.pos.add(this.vel); this.rotation += this.rotationSpeed; } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); let pulseFactor = map(sin(frameCount * 0.15 + this.pulseOffset), -1, 1, 0.8, 1.2); let glowAlpha = map(pulseFactor, 0.8, 1.2, 20, 60); fill(0, 90, 100, glowAlpha); noStroke(); ellipse(0, 0, this.size * 1.5 * pulseFactor, this.size * 1.5 * pulseFactor); fill(0, 85, 90); noStroke(); rect(-this.bodyWidth / 2, -this.bodyHeight / 2, this.bodyWidth, this.bodyHeight, 3); rect(-this.neckWidth / 2, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth, this.neckHeight); ellipse(0, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth * 1.2, this.neckWidth * 0.4); fill(0, 0, 100); rectMode(CENTER); rect(0, 0, this.bodyWidth * 0.5, this.bodyWidth * 0.15); rect(0, 0, this.bodyWidth * 0.15, this.bodyWidth * 0.5); rectMode(CORNER); pop(); } hitsShip(ship) { let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y); let shipRadius = ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5); return d < this.size * 0.7 + shipRadius; } isOffscreen() { let margin = this.size * 2; return (this.pos.y > height + margin); } }


// ==================
// PowerUp Class
// ==================
class PowerUp { constructor(type) { this.type = type; this.pos = createVector(random(width * 0.1, width * 0.9), -30); this.vel = createVector(0, random(0.8, 1.8)); this.size = 22; this.pulseOffset = random(TWO_PI); this.rotation = random(TWO_PI); this.rotationSpeed = random(-0.02, 0.02); this.icon = '?'; this.color = color(0, 0, 100); switch (this.type) { case POWERUP_TYPES.TEMP_SHIELD: this.icon = 'S'; this.color = color(45, 90, 100); break; case POWERUP_TYPES.RAPID_FIRE: this.icon = 'R'; this.color = color(120, 90, 100); break; case POWERUP_TYPES.EMP_BURST: this.icon = 'E'; this.color = color(210, 90, 100); break; } } update() { this.pos.add(this.vel); this.rotation += this.rotationSpeed; } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); let pulse = map(sin(frameCount * 0.2 + this.pulseOffset), -1, 1, 0.9, 1.2); let currentSize = this.size * pulse; let currentBrightness = brightness(this.color) * pulse; let glowAlpha = map(pulse, 0.9, 1.2, 30, 80); fill(hue(this.color), saturation(this.color) * 0.8, currentBrightness * 0.8, glowAlpha); noStroke(); ellipse(0, 0, currentSize * 1.5, currentSize * 1.5); fill(hue(this.color), saturation(this.color), currentBrightness); stroke(0, 0, 100, 80); strokeWeight(2); ellipse(0, 0, currentSize, currentSize); fill(0, 0, 100); noStroke(); textSize(currentSize * 0.8); textAlign(CENTER, CENTER); text(this.icon, 0, currentSize * 0.05); pop(); } hitsShip(ship) { let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y); let shipRadius = ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5); return d < this.size * 0.7 + shipRadius; } isOffscreen() { let margin = this.size * 2; return (this.pos.y > height + margin); } }


// ==================
// EnemyShip Class
// ==================
class EnemyShip { constructor() { this.size = 28; this.pos = createVector(); this.vel = createVector(); this.shootCooldown = random(120, 240); this.shootTimer = this.shootCooldown; this.bulletSpeed = 3.5 + currentLevel * 0.1; let edge = floor(random(3)); if (edge === 0) { this.pos.x = random(width); this.pos.y = -this.size / 2; this.vel.set(random(-0.5, 0.5), random(0.8, 1.5)); } else if (edge === 1) { this.pos.x = width + this.size / 2; this.pos.y = random(height * 0.5); this.vel.set(random(-1.5, -0.8), random(-0.5, 0.5)); } else { this.pos.x = -this.size / 2; this.pos.y = random(height * 0.5); this.vel.set(random(0.8, 1.5), random(-0.5, 0.5)); } let speedScale = min(MAX_ENEMY_SPEED, 1.0 + (currentLevel - 1) * 0.1); this.vel.mult(speedScale); this.sidewaysDrift = random(-0.25, 0.25) * speedScale; this.vel.x += this.sidewaysDrift; } update() { this.pos.add(this.vel); this.shootTimer--; if (this.shootTimer <= 0 && ship && gameState === GAME_STATE.PLAYING) { this.shoot(); this.shootCooldown = random(max(40, 120 - currentLevel * 5), max(80, 240 - currentLevel * 10)); this.shootTimer = this.shootCooldown; } } shoot() { let aimAngle = PI / 2; enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y + this.size * 0.3, aimAngle, this.bulletSpeed)); } draw() { push(); translate(this.pos.x, this.pos.y); fill(0, 0, 20); stroke(0, 90, 60); strokeWeight(1.8); beginShape(); vertex(0, -this.size * 0.65); vertex(this.size * 0.55, this.size * 0.45); vertex(this.size * 0.3, this.size * 0.35); vertex(-this.size * 0.3, this.size * 0.35); vertex(-this.size * 0.55, this.size * 0.45); endShape(CLOSE); fill(0, 100, 100); noStroke(); ellipse(0, -this.size * 0.1, 4, 6); pop(); } isOffscreen() { let margin = this.size * 2; return (this.pos.y > height + margin || this.pos.y < -margin || this.pos.x < -margin || this.pos.x > width + margin); } hits(playerBullet) { let d = dist(this.pos.x, this.pos.y, playerBullet.pos.x, playerBullet.pos.y); return d < this.size / 2 + playerBullet.size / 2; } hitsShip(playerShip) { let d = dist(this.pos.x, this.pos.y, playerShip.pos.x, playerShip.pos.y); let targetRadius = playerShip.tempShieldActive ? playerShip.shieldVisualRadius*1.1 : (playerShip.shieldCharges > 0 ? playerShip.shieldVisualRadius : playerShip.size * 0.5); return d < this.size * 0.45 + targetRadius; } }


// ==================
// EnemyBullet Class
// ==================
class EnemyBullet { constructor(x, y, angle, speed) { this.pos = createVector(x, y); this.vel = p5.Vector.fromAngle(angle); this.vel.mult(speed); this.size = 7; this.color = color(0, 90, 100); } update() { this.pos.add(this.vel); } draw() { noStroke(); fill(0, 80, 100, 50); ellipse(this.pos.x, this.pos.y, this.size * 1.8, this.size * 1.8); fill(this.color); ellipse(this.pos.x, this.pos.y, this.size, this.size); } hitsShip(ship) { let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y); let targetRadius = ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5); return d < this.size * 0.6 + targetRadius; } isOffscreen() { let margin = this.size * 3; return (this.pos.y > height + margin || this.pos.y < -margin || this.pos.x < -margin || this.pos.x > width + margin); } }


// ==================
// Nebula Class
// ==================
class Nebula { constructor() { this.numEllipses = floor(random(10, 20)); this.ellipses = []; this.rotation = random(TWO_PI); this.rotationSpeed = random(-0.0004, 0.0004); this.baseAlpha = random(3, 8); let overallWidth = random(width * 0.6, width * 1.4); let overallHeight = random(height * 0.4, height * 0.7); if (random(1) < 0.5) { this.pos = createVector(-overallWidth / 2, random(height)); this.vel = createVector(random(0.04, 0.12), random(-0.015, 0.015)); } else { this.pos = createVector(width + overallWidth / 2, random(height)); this.vel = createVector(random(-0.12, -0.04), random(-0.015, 0.015)); } let h1 = random(240, 330); let h2 = (h1 + random(-50, 50)) % 360; this.color1 = color(h1, random(40, 75), random(15, 45)); this.color2 = color(h2, random(40, 75), random(15, 45)); for (let i = 0; i < this.numEllipses; i++) { this.ellipses.push({ pos: createVector(random(-overallWidth * 0.45, overallWidth * 0.45), random(-overallHeight * 0.45, overallHeight * 0.45)), w: random(overallWidth * 0.15, overallWidth * 0.7), h: random(overallHeight * 0.15, overallHeight * 0.7), alpha: this.baseAlpha * random(0.6, 1.4) }); } } update() { this.pos.add(this.vel); this.rotation += this.rotationSpeed; } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); noStroke(); for (let el of this.ellipses) { let inter = map(el.pos.x, -width * 0.45, width * 0.45, 0, 1); let c = lerpColor(this.color1, this.color2, inter); fill(hue(c), saturation(c), brightness(c), el.alpha * random(0.9, 1.1)); ellipse(el.pos.x, el.pos.y, el.w, el.h); } pop(); } isOffscreen() { let maxDimension = max(this.ellipses.reduce((maxR, el) => max(maxR, el.pos.mag() + max(el.w, el.h) / 2), 0), width * 0.7); let margin = maxDimension; return (this.pos.x < -margin || this.pos.x > width + margin || this.pos.y < -margin || this.pos.y > height + margin); } }
