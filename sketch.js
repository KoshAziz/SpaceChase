// --- Features ---
// - Start Screen (Enter/Tap to Start) - Title "Space-Chase" + Dynamic // ENHANCED (Style, Animation)
// - Level System based on Points (Up to Level 15)
// - Rainbow Bullets (Hue Cycling) // ENHANCED (Trail Effect)
// - Ship Upgrade System (Manual Purchase in Shop: Fire Rate, Spread Shot) - Uses Money // ENHANCED (UI Style)
// - Score-based Shield System (Gain shield charge every 50 points, max 1) - Uses Points
// - Redesigned Spaceship Look (Score-based color/shape, added details, thinner) // ENHANCED (Hover, Thrust Particles, Upgrade Tint)
// - Dynamic Parallax Star Background (with occasional planet, galaxy, black hole) // ENHANCED (Twinkle, Shooting Stars, Slower BH Effect)
// - Enhanced Engine Thrust Effect (More reactive) // ENHANCED (Particles, Reduced Thrust Value, Smaller Visual)
// - Asteroid Splitting
// - Player Lives (Max 3)
// - Simple Explosion Particles (Asteroid destruction + Bullet impact) // ENHANCED (Variety, Count)
// - Score-based Difficulty Increase - Uses Levels + Time // MODIFIED (Scales to Lvl 15)
// - Health Potions: Spawn randomly, restore 1 life on pickup (up to max). // ENHANCED (Visual Pulse)
// - Simple Enemy Ships that shoot at the player (No Auto-Aim). // MODIFIED (Appearance: Black Ship, Slight Drift)
// - Temporary Power-Ups (Temp Shield, Rapid Fire, EMP Burst) // ENHANCED (Visual Pulse)
// - Visual Nebula Clouds in background // ENHANCED (Subtlety)
// - ADDED: Pause Functionality (Press ESC during gameplay) // ENHANCED (UI Style)
// - ADDED: Upgrade Shop Screen between levels (Levels 1-14) // ENHANCED (UI Style)
// - ADDED: Win Screen after completing Level 15 // ENHANCED (UI Style)
// - ADDED: Monospace Font & UI Color Palette // NEW UI FEATURE
// - ADDED: Styled HUD with Icons & Panel // MODIFIED (Moved Upgrade Levels)
// - ADDED: Styled Buttons & Menu Panels // NEW UI FEATURE
// - ADDED: Combo System (Timer, Counter, Max Bonus, Visual Feedback) // NEW GAMEPLAY FEATURE
// --- Modifications ---
// - Removed Name Input and Leaderboard system.
// - Implemented separate Points (milestones) and Money (upgrades) systems.
// - Asteroids only spawn from Top, Left, and Right edges.
// - Ship movement changed to free keyboard control (Arrows/WASD).
// - Spacebar/Tap to shoot always enabled.
// - Background gradient color changes every 20 seconds.
// - Added brief invulnerability after losing a life.
// - Added Touch Controls: Tap to shoot and move towards tap.
// - Mobile Adjustments: Lower base asteroid spawn rate. // ENHANCED (UI Scaling/Layout)
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
// - ENHANCED: Added particles for shield hits and pickup collection.
// - ENHANCED: Changed enemy bullet appearance.
// - MODIFIED: Reduced ship thrust value.
// - MODIFIED: Reduced black hole visual jitter ("slower" appearance).
// - MODIFIED: Reduced size of engine thrust visual effect.
// - MODIFIED: Adjusted UI element sizes and layout for mobile friendliness.
// - MODIFIED: Moved Rate/Spread level text to bottom-right corner.
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
const GAME_STATE = { START_SCREEN: 0, PLAYING: 1, GAME_OVER: 2, UPGRADE_SHOP: 3, WIN_SCREEN: 4 };
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
// Point thresholds to FINISH each level (index k = points needed to finish level k)
const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 5000, 7500, 10500, 14000, 18000, 22500, 27500, 33000, 39000, 45500, 52500, 60000];
const MAX_LEVEL = 15;


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
// UI Colors
let uiPanelColor;
let uiBorderColor;
let uiTextColor;
let uiHighlightColor;
let uiButtonColor;
let uiButtonHoverColor;
let uiButtonDisabledColor;
let uiButtonBorderColor;


// --- Background ---
let currentTopColor;
let currentBottomColor;
const BACKGROUND_CHANGE_INTERVAL = 1200; // 20 seconds at 60fps
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


// --- Combo System Variables --- // NEW
let comboCounter = 0;
let comboTimer = 0;
let maxComboReached = 0;
const COMBO_TIMEOUT_DURATION = 180; // 3 seconds at 60fps
let showComboText = false; // Flag to briefly show combo text
let comboTextTimeout = 0;


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
    textFont('monospace'); // Use monospace font

    // Define UI Colors
    uiPanelColor = color(220, 50, 20, 85);
    uiBorderColor = color(180, 70, 80, 90);
    uiTextColor = color(0, 0, 95);
    uiHighlightColor = color(60, 80, 100); // Yellowish
    uiButtonColor = color(200, 60, 50);
    uiButtonHoverColor = color(200, 70, 60);
    uiButtonDisabledColor = color(0, 0, 30);
    uiButtonBorderColor = color(200, 70, 90);

    // Initial background gradient colors
    currentTopColor = color(260, 80, 10);
    currentBottomColor = color(240, 70, 25);
    // Set initial difficulty
    setDifficultyForLevel(currentLevel);
}


// ==================
// Helper Functions
// ==================
function spawnInitialAsteroids() { asteroids = []; for (let i = 0; i < initialAsteroids; i++) { let startPos; let shipX = ship ? ship.pos.x : width / 2; let shipY = ship ? ship.pos.y : height - 50; do { startPos = createVector(random(width), random(height * 0.7)); } while (ship && dist(startPos.x, startPos.y, shipX, shipY) < 150); asteroids.push(new Asteroid(startPos.x, startPos.y)); } }
function createParticles(x, y, count, particleColor, particleSize = null, speedMult = 1, lifespanMult = 1) { let baseHue = hue(particleColor); let baseSat = saturation(particleColor); let baseBri = brightness(particleColor); for (let i = 0; i < count; i++) { let pColor = color( (baseHue + random(-15, 15)) % 360, baseSat * random(0.7, 1.1), baseBri * random(0.8, 1.2), 100 ); particles.push(new Particle(x, y, pColor, particleSize, speedMult, lifespanMult)); } }
function createStarfield(numStars) { stars = []; for (let i = 0; i < numStars; i++) { stars.push(new Star()); } }
function setDifficultyForLevel(level) { let effectiveLevel = min(level, MAX_LEVEL); let mobileFactor = isMobile ? 0.7 : 1.0; baseAsteroidSpawnRate = (0.009 + (effectiveLevel - 1) * 0.0015) * mobileFactor; currentAsteroidSpawnRate = baseAsteroidSpawnRate; baseEnemySpawnRate = (0.002 + (effectiveLevel - 1) * 0.0005) * mobileFactor; currentEnemySpawnRate = baseEnemySpawnRate; }
function setupShopButtons() { shopButtons = []; let buttonWidth = isMobile ? 190 : 240; let buttonHeight = isMobile ? 45 : 55; let startY = height / 2 - (isMobile ? 75 : 90); let spacing = isMobile ? 65 : 80; let nextLevelSpacing = isMobile ? 25 : 30; shopButtons.push({ id: 'fireRate', x: width / 2 - buttonWidth / 2, y: startY, w: buttonWidth, h: buttonHeight }); shopButtons.push({ id: 'spreadShot', x: width / 2 - buttonWidth / 2, y: startY + spacing, w: buttonWidth, h: buttonHeight }); shopButtons.push({ id: 'nextLevel', x: width / 2 - buttonWidth / 2, y: startY + spacing * 2 + nextLevelSpacing, w: buttonWidth, h: buttonHeight }); }


// ==================
// p5.js Draw Loop
// ==================
function draw() {
    // --- Background Updates ---
    if (gameState !== GAME_STATE.START_SCREEN && frameCount > 0 && frameCount % BACKGROUND_CHANGE_INTERVAL === 0) { let topH = random(180, 300); let bottomH = (topH + random(20, 60)) % 360; currentTopColor = color(topH, random(70, 90), random(10, 20)); currentBottomColor = color(bottomH, random(60, 85), random(25, 40)); }
    if (gameState !== GAME_STATE.START_SCREEN) { let currentTime = millis(); if (!planetVisible && currentTime - lastPlanetAppearanceTime > random(PLANET_MIN_INTERVAL, PLANET_MAX_INTERVAL)) { planetVisible = true; planetSize = random(width * 0.2, width * 0.5); let edge = floor(random(4)); if (edge === 0) planetPos = createVector(random(width), -planetSize / 2); else if (edge === 1) planetPos = createVector(width + planetSize / 2, random(height)); else if (edge === 2) planetPos = createVector(random(width), height + planetSize / 2); else planetPos = createVector(-planetSize / 2, random(height)); let targetPos = createVector(random(width * 0.2, width * 0.8), random(height * 0.2, height * 0.8)); planetVel = p5.Vector.sub(targetPos, planetPos); planetVel.normalize(); planetVel.mult(random(0.1, 0.3)); let baseH = random(360); planetBaseColor = color(baseH, random(40, 70), random(50, 80)); planetDetailColor1 = color((baseH + random(20, 50)) % 360, random(50, 70), random(60, 90)); planetDetailColor2 = color((baseH + random(180, 220)) % 360, random(30, 60), random(40, 70)); lastPlanetAppearanceTime = currentTime; } if (planetVisible) { planetPos.add(planetVel); let buffer = planetSize * 0.6; if (planetPos.x < -buffer || planetPos.x > width + buffer || planetPos.y < -buffer || planetPos.y > height + buffer) { planetVisible = false; } } }
    if (gameState === GAME_STATE.PLAYING && !isPaused && random(1) < shootingStarSpawnRate) { shootingStars.push(new ShootingStar()); }

    // --- Drawing ---
    drawBackgroundAndStars();

    push(); // Isolate screen shake
    if (screenShakeDuration > 0) { translate(random(-screenShakeIntensity, screenShakeIntensity), random(-screenShakeIntensity, screenShakeIntensity)); }

    // --- Game State Logic & Drawing ---
    switch (gameState) {
        case GAME_STATE.START_SCREEN: displayStartScreen(); break;
        case GAME_STATE.PLAYING: runGameLogic(); if (isPaused) { displayPauseScreen(); } break;
        case GAME_STATE.UPGRADE_SHOP: displayUpgradeShop(); break;
        case GAME_STATE.GAME_OVER: runGameLogic(); displayGameOver(); break; // Still draw faded game behind
        case GAME_STATE.WIN_SCREEN: runGameLogic(); displayWinScreen(); break; // Still draw faded game behind
    }

    // --- Overlays ---
    if (infoMessageTimeout > 0) { displayInfoMessage(); if ((gameState === GAME_STATE.PLAYING && !isPaused) || gameState === GAME_STATE.UPGRADE_SHOP) { infoMessageTimeout--; } }
    if (levelTransitionFlash > 0) { fill(0, 0, 100, levelTransitionFlash * 10); rect(0, 0, width, height); levelTransitionFlash--; }

    pop(); // End screen shake
}


// --- Screen Display Functions ---
function displayStartScreen() { let titleText = "Space-Chase"; let titleSize = isMobile ? 56 : 72; textSize(titleSize); textAlign(CENTER, CENTER); let totalWidth = textWidth(titleText); let startX = width / 2 - totalWidth / 2; let currentX = startX; let titleY = height / 3; for (let i = 0; i < titleText.length; i++) { let char = titleText[i]; let charWidth = textWidth(char); let yOffset = sin(frameCount * 0.1 + i * 0.7) * (isMobile ? 7 : 10); fill(0, 0, 0, 50); text(char, currentX + charWidth / 2 + (isMobile ? 3 : 4), titleY + yOffset + (isMobile ? 3 : 4)); let h = (frameCount * 4 + i * 25) % 360; fill(h, 95, 100); text(char, currentX + charWidth / 2, titleY + yOffset); currentX += charWidth; } stroke(uiBorderColor); strokeWeight(1.5); line(width * 0.2, titleY + 80, width * 0.8, titleY + 80); line(width * 0.3, titleY + 90, width * 0.7, titleY + 90); let instructionSize = isMobile ? 20 : 24; textSize(instructionSize); fill(uiTextColor); textAlign(CENTER, CENTER); let startInstruction = isMobile ? "Tap Screen to Start" : "Press Enter to Start"; let instrWidth = textWidth(startInstruction) + 40; fill(uiPanelColor); stroke(uiBorderColor); strokeWeight(1); rect(width / 2 - instrWidth / 2, height / 2 + 50, instrWidth, instructionSize + 20, 5); noStroke(); fill(uiTextColor); text(startInstruction, width / 2, height / 2 + 60 + instructionSize / 2); }
function displayPauseScreen() { drawPanelBackground(width * 0.6, height * 0.4); fill(uiTextColor); textSize(isMobile ? 54 : 64); textAlign(CENTER, CENTER); text("PAUSED", width / 2, height / 2 - 30); textSize(isMobile ? 18 : 22); text("Press ESC to Resume", width / 2, height / 2 + 40); }
function displayUpgradeShop() { drawPanelBackground(width * (isMobile ? 0.9 : 0.7), height * (isMobile ? 0.75 : 0.7)); fill(uiTextColor); textSize(isMobile ? 36 : 48); textAlign(CENTER, TOP); text(`Level ${currentLevel} Complete!`, width / 2, height * 0.2); textSize(isMobile ? 26 : 32); text("Upgrade Shop", width / 2, height * 0.2 + (isMobile ? 50 : 65)); textSize(isMobile ? 20 : 26); textAlign(CENTER, TOP); fill(uiHighlightColor); text(`Money: $${money}`, width / 2, height * 0.2 + (isMobile ? 90 : 115)); textSize(isMobile ? 15 : 17); textAlign(CENTER, CENTER); for (let button of shopButtons) { drawStyledButton(button); } }
function displayGameOver() { drawPanelBackground(width * (isMobile ? 0.8 : 0.6), height * 0.5); fill(color(0, 80, 100)); textSize(isMobile ? 52 : 68); textAlign(CENTER, CENTER); text("GAME OVER", width / 2, height / 3); fill(uiTextColor); textSize(isMobile ? 26 : 34); text("Final Points: " + points, width / 2, height / 3 + (isMobile ? 60 : 75)); textAlign(CENTER, CENTER); textSize(isMobile ? 18 : 22); let pulse = map(sin(frameCount * 0.1), -1, 1, 70, 100); fill(0, 0, pulse); let restartInstruction = isMobile ? "Tap Screen to Restart" : "Click or Press Enter to Restart"; text(restartInstruction, width / 2, height * 0.7); cursor(ARROW); }
function displayWinScreen() { drawPanelBackground(width * (isMobile ? 0.85 : 0.7), height * 0.6); let winTextSize = isMobile ? 58 : 72; textSize(winTextSize); textAlign(CENTER, CENTER); let winY = height / 3; let winText = "YOU WIN!"; let totalWinWidth = textWidth(winText); let startWinX = width / 2 - totalWinWidth / 2; let currentWinX = startWinX; for (let i = 0; i < winText.length; i++) { let char = winText[i]; let charWidth = textWidth(char); let h = (frameCount * 4 + i * 30) % 360; fill(h, 95, 100); text(char, currentWinX + charWidth / 2, winY); currentWinX += charWidth; } fill(uiTextColor); textSize(isMobile ? 26 : 34); text("Final Points: " + points, width / 2, winY + (isMobile ? 65 : 80)); textAlign(CENTER, CENTER); textSize(isMobile ? 18 : 22); let pulse = map(sin(frameCount * 0.1), -1, 1, 70, 100); fill(0, 0, pulse); let restartInstruction = isMobile ? "Tap Screen to Play Again" : "Click or Press Enter to Play Again"; text(restartInstruction, width / 2, height * 0.7); cursor(ARROW); }
function drawPanelBackground(panelWidth, panelHeight) { let panelX = width / 2 - panelWidth / 2; let panelY = height / 2 - panelHeight / 2; fill(uiPanelColor); stroke(uiBorderColor); strokeWeight(2); rect(panelX, panelY, panelWidth, panelHeight, 10); }
function drawStyledButton(button) { let cost = "?"; let label = ""; let isMaxed = false; let canAfford = false; let currentLevelText = ""; if (button.id === 'fireRate') { cost = ship.getUpgradeCost('fireRate'); isMaxed = (cost === "MAX"); if (!isMaxed) canAfford = (money >= cost); currentLevelText = `Lvl ${ship.fireRateLevel}/${ship.maxLevel}`; label = `Fire Rate ${currentLevelText}`; } else if (button.id === 'spreadShot') { cost = ship.getUpgradeCost('spreadShot'); isMaxed = (cost === "MAX"); if (!isMaxed) canAfford = (money >= cost); currentLevelText = `Lvl ${ship.spreadShotLevel}/${ship.maxLevel}`; label = `Spread Shot ${currentLevelText}`; } else if (button.id === 'nextLevel') { label = `Start Level ${currentLevel + 1}`; isMaxed = false; canAfford = true; } let buttonCol; let textCol = uiTextColor; let borderCol = uiButtonBorderColor; let hover = !isMobile && (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h); if (button.id !== 'nextLevel') { if (isMaxed) { buttonCol = uiButtonDisabledColor; textCol = color(0, 0, 60); label += " (MAX)"; borderCol = color(0, 0, 40); } else if (!canAfford) { buttonCol = color(0, 75, 50, 80); textCol = color(0, 0, 85); label += ` ($${cost})`; borderCol = color(0, 80, 70); } else { buttonCol = hover ? uiButtonHoverColor : uiButtonColor; label += ` ($${cost})`; borderCol = uiButtonBorderColor; } } else { buttonCol = hover ? color(90, 75, 70) : color(90, 70, 60); borderCol = color(90, 80, 85); } fill(buttonCol); stroke(borderCol); strokeWeight(hover ? 2.5 : 1.5); rect(button.x, button.y, button.w, button.h, 6); noFill(); strokeWeight(1); stroke(0, 0, 100, 20); line(button.x + 2, button.y + 2, button.x + button.w - 2, button.y + 2); line(button.x + 2, button.y + 2, button.x + 2, button.y + button.h - 2); stroke(0, 0, 0, 30); line(button.x + 2, button.y + button.h - 2, button.x + button.w - 2, button.y + button.h - 2); line(button.x + button.w - 2, button.y + 2, button.x + button.w - 2, button.y + button.h - 2); fill(textCol); noStroke(); text(label, button.x + button.w / 2, button.y + button.h / 2); }


// --- Main Game Logic ---
function runGameLogic() {
    // If paused, just draw everything statically and the pause screen
    if (isPaused) {
        if (ship) ship.draw();
        for (let b of bullets) b.draw();
        for (let p of particles) p.draw();
        for (let a of asteroids) a.draw();
        for (let e of enemyShips) e.draw();
        for (let eb of enemyBullets) eb.draw();
        for (let pt of potions) pt.draw();
        for (let pu of powerUps) pu.draw();
        displayHUD(); // Draw HUD even when paused
        // Don't display combo text when paused
        return;
    }

    if (!ship) return; // Should not happen in PLAYING state, but safety first

    // --- Updates ---
    if (screenShakeDuration > 0) screenShakeDuration--;
    if (screenShakeDuration <= 0) screenShakeIntensity = 0;

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

    for (let i = enemyShips.length - 1; i >= 0; i--) {
        enemyShips[i].update();
        enemyShips[i].draw();
        if (enemyShips[i].isOffscreen()) {
            enemyShips.splice(i, 1);
        }
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].update();
        enemyBullets[i].draw();
        if (enemyBullets[i].isOffscreen()) {
            enemyBullets.splice(i, 1);
        }
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
        if (!asteroids[i]) continue; // Safety check
        asteroids[i].update();
        asteroids[i].draw();
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
        // PowerUps handle their own drawing/update inside handlePowerUps
    }

    // --- Handle Game Mechanics ---
    handlePotions(); // Updates & draws potions, checks collection
    handleCollisions(); // Updates collisions, handles hits, level ups
    handlePowerUps(); // Updates & draws powerups, checks collection

    // --- Combo Timer Logic --- // NEW
    if (comboTimer > 0) {
        comboTimer--;
        if (comboTimer <= 0) {
            // Combo ended! Award bonus based on maxComboReached
            if (maxComboReached >= 3) { // Award bonus for combos of 3 or more
                let bonusPoints = maxComboReached * 5; // Example bonus calculation
                let bonusMoney = floor(maxComboReached / 3); // Example bonus calculation
                points += bonusPoints;
                money += bonusMoney;
                infoMessage = `Combo Bonus: +${bonusPoints} PTS, +$${bonusMoney}! (Max: x${maxComboReached})`;
                infoMessageTimeout = 120; // Show message for 2 seconds
                /* TODO: Play combo end sound? */
            }
            // Reset for next potential combo
            comboCounter = 0;
            maxComboReached = 0;
            showComboText = false; // Hide combo text immediately
            comboTextTimeout = 0;
        }
    }

    if (comboTextTimeout > 0) {
         comboTextTimeout--;
         if (comboTextTimeout <= 0) {
             showComboText = false; // Hide after timeout if combo continues
         }
    }
    // --- End Combo Timer Logic ---

    // --- Spawning Logic (Only during active play) ---
    if (gameState === GAME_STATE.PLAYING) {
        // Difficulty scaling based on time within the level
        let timeFactor = floor(frameCount / 1800) * 0.0005; // Increases slightly every 30 seconds
        currentAsteroidSpawnRate = baseAsteroidSpawnRate + timeFactor;
        currentEnemySpawnRate = baseEnemySpawnRate + timeFactor * 0.5;

        // Define maximum entities allowed based on level
        let maxAsteroidsAllowed = min(40, 15 + currentLevel * 3);
        let maxEnemiesAllowed = min(8, 2 + floor(currentLevel / 2));
        let maxPotionsAllowed = 2;
        let maxPowerUpsAllowed = 1;
        let maxNebulasAllowed = 3;

        // Spawn entities based on probability and limits
        if (random(1) < currentAsteroidSpawnRate && asteroids.length < maxAsteroidsAllowed) {
            asteroids.push(new Asteroid());
        }
        if (random(1) < currentEnemySpawnRate && enemyShips.length < maxEnemiesAllowed) {
            enemyShips.push(new EnemyShip());
        }
        if (random(1) < potionSpawnRate && potions.length < maxPotionsAllowed) {
            potions.push(new HealthPotion());
        }
        if (random(1) < powerUpSpawnRate && powerUps.length < maxPowerUpsAllowed) {
            let type = floor(random(NUM_POWERUP_TYPES));
            powerUps.push(new PowerUp(type));
        }
        if (random(1) < nebulaSpawnRate && nebulas.length < maxNebulasAllowed) {
            nebulas.push(new Nebula());
        }
    }

    // --- Display HUD and Combo Text ---
    if (gameState === GAME_STATE.PLAYING) {
        displayHUD();
        displayComboText(); // NEW Call to display combo counter text
    }
}


// --- Collision and Pickup Handling ---
function handlePowerUps() {
    // Draw powerups even if paused or game over, but don't update/collect
    if (gameState !== GAME_STATE.PLAYING || isPaused) {
        for (let i = powerUps.length - 1; i >= 0; i--) {
             powerUps[i].draw();
        }
        return;
    }
    if (!ship) return;

    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].update();
        powerUps[i].draw();

        if (powerUps[i].hitsShip(ship)) {
            let powerUpType = powerUps[i].type;
            let pickupPos = powerUps[i].pos.copy();
            let pickupColor = powerUps[i].color;
            powerUps.splice(i, 1); // Remove power-up
            createParticles(pickupPos.x, pickupPos.y, 25, pickupColor, 4, 1.8, 0.8); // Pickup effect

            switch (powerUpType) {
                case POWERUP_TYPES.TEMP_SHIELD:
                    ship.tempShieldActive = true;
                    infoMessage = "TEMPORARY SHIELD!";
                    createParticles(ship.pos.x, ship.pos.y, 20, color(45, 90, 100));
                    break; /* TODO: Play sound */
                case POWERUP_TYPES.RAPID_FIRE:
                    ship.rapidFireTimer = 300; // 5 seconds
                    infoMessage = "RAPID FIRE!";
                    createParticles(ship.pos.x, ship.pos.y, 20, color(120, 90, 100));
                    break; /* TODO: Play sound */
                case POWERUP_TYPES.EMP_BURST:
                    infoMessage = "EMP BURST!";
                    createParticles(ship.pos.x, ship.pos.y, 60, color(210, 100, 100), 12, 3.5, 1.2); // Big EMP effect
                    // Destroy all asteroids
                    for (let k = asteroids.length - 1; k >= 0; k--) {
                        createParticles(asteroids[k].pos.x, asteroids[k].pos.y, 15, asteroids[k].color, 3, 1.5);
                    }
                    asteroids = [];
                    // Destroy all enemy ships
                    for (let k = enemyShips.length - 1; k >= 0; k--) {
                         createParticles(enemyShips[k].pos.x, enemyShips[k].pos.y, 20, color(300, 80, 90));
                    }
                    enemyShips = [];
                    break; /* TODO: Play sound */
            }
            infoMessageTimeout = 120; // Show message for 2 seconds
        } else if (powerUps[i].isOffscreen()) {
            powerUps.splice(i, 1); // Remove if offscreen
        }
    }
}
function handleCollisions() {
    if (gameState !== GAME_STATE.PLAYING || !ship || isPaused) return;

    // --- Player Bullet Collisions ---
    for (let i = asteroids.length - 1; i >= 0; i--) {
        if (!asteroids[i]) continue; // Safety check
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (asteroids[i] && bullets[j] && asteroids[i].hits(bullets[j])) {
                /* TODO: Play asteroid hit sound */
                let impactParticleCount = floor(random(3, 6));
                createParticles(bullets[j].pos.x, bullets[j].pos.y, impactParticleCount, color(60, 40, 100), 2, 0.8, 0.7); // Bullet impact sparks

                let oldPoints = points;
                let asteroidSizeValue = asteroids[i] ? asteroids[i].size : 50;
                points += floor(map(asteroidSizeValue, minAsteroidSize, 80, 5, 15)); // Points based on size
                money += 2; // Money for asteroid kill

                // --- COMBO LOGIC START --- // NEW
                comboCounter++;
                comboTimer = COMBO_TIMEOUT_DURATION; // Reset timer on kill
                maxComboReached = max(maxComboReached, comboCounter); // Update max for this streak
                if (comboCounter >= 2) { // Only show text for x2 or higher
                    showComboText = true; // Trigger visual feedback display
                    comboTextTimeout = 60; // Show text for 1 second
                }
                /* TODO: Play combo tick sound? */
                // --- COMBO LOGIC END ---

                // Shield Gain Check
                let shieldsToAdd = floor(points / SHIELD_POINTS_THRESHOLD) - floor(oldPoints / SHIELD_POINTS_THRESHOLD);
                if (shieldsToAdd > 0 && ship.shieldCharges < MAX_SHIELD_CHARGES) {
                    let actualAdded = ship.gainShields(shieldsToAdd);
                    if (actualAdded > 0) {
                        infoMessage = `+${actualAdded} SHIELD CHARGE(S)!`;
                        infoMessageTimeout = 90;
                        /* TODO: Play shield gain sound */
                    }
                }

                // Ship Shape Change Check
                let oldShapeLevel = floor(oldPoints / SHAPE_CHANGE_POINTS_THRESHOLD);
                let newShapeLevel = floor(points / SHAPE_CHANGE_POINTS_THRESHOLD);
                if (newShapeLevel > oldShapeLevel) {
                    ship.changeShape(newShapeLevel);
                    infoMessage = "SHIP SHAPE EVOLVED!";
                    infoMessageTimeout = 120;
                    /* TODO: Play shape change sound */
                }

                // Asteroid Destruction & Splitting
                let currentAsteroid = asteroids[i];
                let asteroidPos = currentAsteroid.pos.copy();
                let asteroidColor = currentAsteroid.color;
                asteroids.splice(i, 1); // Remove asteroid
                bullets.splice(j, 1); // Remove bullet
                createParticles(asteroidPos.x, asteroidPos.y, floor(asteroidSizeValue / 2.5), asteroidColor, null, 1.2, 1.1); // Asteroid explosion
                /* TODO: Play asteroid explosion sound */

                if (asteroidSizeValue > minAsteroidSize * 2) { // Split if large enough
                    let newSize = asteroidSizeValue * 0.6;
                    let splitSpeedMultiplier = random(0.8, 2.0);
                    let vel1 = p5.Vector.random2D().mult(splitSpeedMultiplier);
                    let vel2 = p5.Vector.random2D().mult(splitSpeedMultiplier);
                    asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel1));
                    asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel2));
                }

                // Level Up Check
                if (currentLevel < MAX_LEVEL && points >= LEVEL_THRESHOLDS[currentLevel]) {
                    /* TODO: Play level complete sound */
                    points += 100 * currentLevel; // Bonus points for level clear
                    money += 25 * currentLevel; // Bonus money for level clear
                    gameState = GAME_STATE.UPGRADE_SHOP;
                    infoMessage = `Level ${currentLevel} Cleared!`;
                    infoMessageTimeout = 180;
                    setupShopButtons();
                    cursor(ARROW);
                    // Clear transient objects for shop
                    bullets = [];
                    enemyShips = [];
                    enemyBullets = [];
                    powerUps = [];
                    potions = [];
                    // Reset combo on level end
                    comboCounter = 0; // NEW
                    comboTimer = 0;   // NEW
                    maxComboReached = 0; // NEW
                    showComboText = false; // NEW
                    comboTextTimeout = 0; // NEW
                    return; // Exit collision check early
                } else if (currentLevel === MAX_LEVEL && points >= LEVEL_THRESHOLDS[currentLevel]) { // Win Condition
                    /* TODO: Play win sound */
                    gameState = GAME_STATE.WIN_SCREEN;
                    infoMessage = ""; // Clear any pending messages
                    infoMessageTimeout = 0;
                    cursor(ARROW);
                     // Clear transient objects for win screen
                    bullets = [];
                    enemyShips = [];
                    enemyBullets = [];
                    powerUps = [];
                    potions = [];
                    asteroids = []; // Clear asteroids too on win
                    particles = []; // Clear particles
                    // Reset combo on win
                    comboCounter = 0; // NEW
                    comboTimer = 0;   // NEW
                    maxComboReached = 0; // NEW
                    showComboText = false; // NEW
                    comboTextTimeout = 0; // NEW
                    return; // Exit collision check early
                }
                break; // Exit inner loop (bullet is gone)
            }
        }
    }

    for (let i = enemyShips.length - 1; i >= 0; i--) {
        if (!enemyShips[i]) continue; // Safety check
        for (let j = bullets.length - 1; j >= 0; j--) {
             if (enemyShips[i] && bullets[j] && enemyShips[i].hits(bullets[j])) {
                /* TODO: Play enemy hit sound */
                points += 20; // Points for enemy kill
                money += 5;  // Money for enemy kill

                // --- COMBO LOGIC START --- // NEW
                comboCounter++;
                comboTimer = COMBO_TIMEOUT_DURATION; // Reset timer on kill
                maxComboReached = max(maxComboReached, comboCounter); // Update max for this streak
                 if (comboCounter >= 2) { // Only show text for x2 or higher
                    showComboText = true; // Trigger visual feedback display
                    comboTextTimeout = 60; // Show text for 1 second
                 }
                /* TODO: Play combo tick sound? */
                // --- COMBO LOGIC END ---

                createParticles(enemyShips[i].pos.x, enemyShips[i].pos.y, 20, color(300, 80, 90), 4, 1.5); // Enemy explosion
                enemyShips.splice(i, 1); // Remove enemy
                bullets.splice(j, 1); // Remove bullet
                break; // Exit inner loop (bullet is gone)
            }
        }
    }

    // --- Player Ship Collisions (If not invulnerable) ---
    if (ship.invulnerableTimer <= 0) {
        const takeDamage = (sourceObject, sourceArray, index) => {
            /* TODO: Play player hit sound */
            let gameOver = false;

            // Reset combo if hit
            if (comboCounter > 0) {
                 // Maybe award bonus if combo was broken by hit? Optional.
                 if (maxComboReached >= 3) {
                     let bonusPoints = maxComboReached * 5;
                     let bonusMoney = floor(maxComboReached / 3);
                     points += bonusPoints;
                     money += bonusMoney;
                     infoMessage = `Combo Broken! Bonus: +${bonusPoints} PTS, +$${bonusMoney} (Max: x${maxComboReached})`;
                     infoMessageTimeout = 120;
                 }
                 comboCounter = 0;
                 comboTimer = 0;
                 maxComboReached = 0;
                 showComboText = false;
                 comboTextTimeout = 0;
            }

            if (ship.tempShieldActive) {
                ship.tempShieldActive = false;
                createParticles(ship.pos.x, ship.pos.y, 40, color(45, 100, 100), 5, 2.0); // Temp shield break effect
                infoMessage = "TEMPORARY SHIELD LOST!";
                infoMessageTimeout = 90;
                 /* TODO: Play temp shield break sound */
                // Apply small effect to the source object
                if (sourceObject && sourceArray && index !== undefined) {
                     createParticles(sourceObject.pos.x, sourceObject.pos.y, 5, color(45,90,100));
                     // Remove enemy bullet if it broke the shield
                     if (sourceObject instanceof EnemyBullet) {
                          sourceArray.splice(index, 1);
                     }
                 }

            } else if (ship.shieldCharges > 0) {
                ship.loseShield();
                createParticles(ship.pos.x, ship.pos.y, 35, color(180, 80, 100), 4, 1.8); // Shield break effect
                /* TODO: Play shield break sound */
                // Apply small effect to the source object
                if (sourceObject && sourceArray && index !== undefined) {
                     createParticles(sourceObject.pos.x, sourceObject.pos.y, 5, color(180,80,100));
                     // Remove enemy bullet if it broke the shield
                     if (sourceObject instanceof EnemyBullet) {
                          sourceArray.splice(index, 1);
                     }
                 }
            } else {
                /* TODO: Play life lost sound */
                lives--;
                createParticles(ship.pos.x, ship.pos.y, 40, color(0, 90, 100), 5, 2.2); // Life lost explosion
                screenShakeIntensity = 7;
                screenShakeDuration = 20;

                if (lives <= 0) {
                    gameState = GAME_STATE.GAME_OVER;
                    /* TODO: Play game over sound */
                    infoMessage = ""; // Clear messages
                    infoMessageTimeout = 0;
                    cursor(ARROW);
                    gameOver = true;
                } else {
                    ship.setInvulnerable(); // Grant brief invulnerability
                }

                // Destroy the object that hit the player (if applicable)
                if (sourceObject && sourceArray && index !== undefined) {
                    let explosionColor = sourceObject.color || color(0,0,50); // Default greyish
                    let particleCount = sourceObject.size ? floor(sourceObject.size / 1.5) : 20; // Scale particles with size for asteroids

                    if (sourceObject instanceof EnemyShip) {
                        explosionColor = color(300, 80, 90); // Enemy explosion color
                        particleCount = 25;
                    } else if (sourceObject instanceof EnemyBullet) {
                        explosionColor = color(0, 100, 100); // Enemy bullet explosion color
                        particleCount = 8;
                    }
                    createParticles(sourceObject.pos.x, sourceObject.pos.y, particleCount, explosionColor);
                    sourceArray.splice(index, 1); // Remove the object
                }
            }
            return gameOver; // Return true if game is over
        };

        // Check Asteroid Collisions
        for (let i = asteroids.length - 1; i >= 0; i--) {
            if (asteroids[i] && asteroids[i].hitsShip(ship)) {
                if (takeDamage(asteroids[i], asteroids, i)) return; // Game Over, exit
                break; // Ship was hit, no need to check other asteroids in this frame
            }
        }

        // Check Enemy Ship Collisions (if game not over)
        if (gameState === GAME_STATE.PLAYING) {
             for (let i = enemyShips.length - 1; i >= 0; i--) {
                 if (enemyShips[i] && enemyShips[i].hitsShip(ship)) {
                     if (takeDamage(enemyShips[i], enemyShips, i)) return; // Game Over, exit
                     break; // Ship was hit
                 }
             }
        }

         // Check Enemy Bullet Collisions (if game not over)
         if (gameState === GAME_STATE.PLAYING) {
             for (let i = enemyBullets.length - 1; i >= 0; i--) {
                 if (enemyBullets[i] && enemyBullets[i].hitsShip(ship)) {
                     if (takeDamage(enemyBullets[i], enemyBullets, i)) return; // Game Over, exit
                     break; // Ship was hit
                 }
             }
         }
    }
}
function handlePotions() {
     // Draw potions even if paused or game over, but don't update/collect
    if (gameState !== GAME_STATE.PLAYING || isPaused) {
        for (let i = potions.length - 1; i >= 0; i--) {
             potions[i].draw();
        }
        return;
    }
     if (!ship) return;

    for (let i = potions.length - 1; i >= 0; i--) {
        potions[i].update();
        potions[i].draw();
        if (potions[i].hitsShip(ship)) {
            /* TODO: Play potion pickup sound */
            createParticles(potions[i].pos.x, potions[i].pos.y, 20, color(0, 80, 100), 4, 1.5); // Pickup effect
            if (lives < MAX_LIVES) {
                lives++;
                infoMessage = "+1 LIFE!";
                infoMessageTimeout = 90;
            } else {
                points += 25; // Give points if already at max lives
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
function drawBackgroundAndStars() {
    // Gradient background
    for(let y=0; y < height; y++){
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(currentTopColor, currentBottomColor, inter);
        stroke(c);
        line(0, y, width, y);
    }
    noStroke();

    // Nebulas (drawn behind stars)
    for (let i = nebulas.length - 1; i >= 0; i--) {
        if (gameState === GAME_STATE.PLAYING && !isPaused) nebulas[i].update();
        nebulas[i].draw();
        if (nebulas[i].isOffscreen()) {
            nebulas.splice(i, 1);
        }
    }

    // Black Hole & Galaxy (Subtle background elements)
    drawBlackHole();
    drawGalaxy();

    // Optional Planet
    if (planetVisible) {
        drawPlanet();
    }

     // Shooting Stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        if (gameState === GAME_STATE.PLAYING && !isPaused) shootingStars[i].update();
        shootingStars[i].draw();
        if (shootingStars[i].isDone()) {
            shootingStars.splice(i, 1);
        }
    }

    // Static Stars
    for (let star of stars) {
        if (gameState === GAME_STATE.PLAYING && !isPaused) star.update(); // Twinkle effect
        star.draw();
    }
}
function drawBlackHole() {
    push();
    let bhX = width * 0.8; // Position
    let bhY = height * 0.2;
    let bhSize = width * 0.05; // Base size

    // Black center
    fill(0);
    noStroke();
    ellipse(bhX, bhY, bhSize * 1.1, bhSize * 1.1); // Slightly larger than inner ring

    // Accretion disk rings
    let ringCount = 7;
    let maxRingSize = bhSize * 3.5;
    let minRingSize = bhSize * 1.2;
    noFill();
    // Use a slower time variation for the overall effect
    let slowVariation = sin(frameCount * 0.01);

    for (let i = 0; i < ringCount; i++) {
        // Individual ring pulsation
        let sizeFactor = lerp(0.95, 1.05, (sin(frameCount * 0.02 + i * 0.5) + 1) / 2);
        let size = lerp(minRingSize, maxRingSize, i / (ringCount - 1)) * sizeFactor;
        let hue = lerp(0, 60, i / (ringCount - 1)) + sin(frameCount * 0.03 + i) * 5; // Hue shift + variation
        let alpha = map(i, 0, ringCount - 1, 50, 3); // Outer rings fainter
        let sw = map(i, 0, ringCount - 1, 1.5, 5); // Outer rings thicker

        strokeWeight(sw);
        stroke(hue, 90, 90, alpha); // HSB color with alpha
        ellipse(bhX, bhY, size, size);
    }
    pop();
}
function drawGalaxy() {
     push();
     // Center roughly in the middle, slightly offset
     let centerX = width / 2;
     let centerY = height / 2;
     let baseHue1 = 270; // Purple-ish
     let baseHue2 = 200; // Cyan-ish
     let alphaVal = 2.5; // Very subtle alpha
     let angle = frameCount * 0.0003; // Very slow rotation

     translate(centerX, centerY);
     rotate(angle);
     translate(-centerX, -centerY); // Rotate around center

     noStroke();
     // Draw multiple overlapping ellipses to simulate galaxy arms/dust
     fill(baseHue1, 50, 60, alphaVal);
     ellipse(centerX - width * 0.1, centerY - height * 0.1, width * 1.3, height * 0.35);
     fill(baseHue2, 60, 70, alphaVal);
     ellipse(centerX + width * 0.15, centerY + height * 0.05, width * 1.2, height * 0.45);
     // Central blend
     fill((baseHue1 + baseHue2) / 2, 55, 65, alphaVal * 0.9);
     ellipse(centerX, centerY, width * 1.0, height * 0.55);

     pop();
}
function drawPlanet() {
    push();
    translate(planetPos.x, planetPos.y);

    // Planet Body
    noStroke();
    fill(planetBaseColor);
    ellipse(0, 0, planetSize, planetSize);

    // Simple "continents" or features using arcs
    fill(planetDetailColor1);
    arc(0, 0, planetSize, planetSize, PI * 0.1, PI * 0.6, OPEN); // Example arc 1
    arc(0, 0, planetSize * 0.8, planetSize * 0.8, PI * 0.7, PI * 1.2, OPEN); // Example arc 2

    fill(planetDetailColor2);
    arc(0, 0, planetSize * 0.9, planetSize * 0.9, PI * 1.3, PI * 1.9, OPEN); // Example arc 3

    // Simple atmospheric haze ring
    noFill();
    strokeWeight(planetSize * 0.06); // Ring thickness relative to planet size
    stroke(hue(planetBaseColor), 20, 100, 20); // Faint white/light color based on planet hue
    ellipse(0, 0, planetSize * 1.06, planetSize * 1.06); // Slightly larger than planet

    pop();
}


// --- HUD & Info Messages ---
function displayHUD() {
    let hudH = isMobile ? 45 : 60; // Height of the HUD panel
    let topMargin = 5;
    let sideMargin = 10;
    let iconSize = isMobile ? 16 : 20;
    let textSizeVal = isMobile ? 14 : 18;
    let spacing = isMobile ? 8 : 12; // Spacing between elements
    let bottomMargin = 10; // Margin for bottom-right text

    // Draw Top Panel Background
    fill(uiPanelColor);
    stroke(uiBorderColor);
    strokeWeight(1.5);
    rect(0, 0, width, hudH); // Draw panel across the top

    // Draw Top Panel Content (Left-aligned)
    textSize(textSizeVal);
    fill(uiTextColor);
    textAlign(LEFT, CENTER);
    let currentX = sideMargin;

    // Level and Points
    text(`LEVEL: ${currentLevel}`, currentX, hudH / 2);
    currentX += textWidth(`LEVEL: ${currentLevel}`) + spacing * 2;
    text(`PTS: ${points}`, currentX, hudH / 2);
    currentX += textWidth(`PTS: ${points}`) + spacing * 2;

    // Money
    fill(uiHighlightColor); // Yellow for money
    text(`$: ${money}`, currentX, hudH / 2);
    currentX += textWidth(`$: ${money}`) + spacing * 2;

    // Lives
    fill(color(0, 80, 100)); // Red for lives
    text(`♥: ${lives}`, currentX, hudH / 2); // Using heart symbol
    currentX += textWidth(`♥: ${lives}`) + spacing * 2;

    // Shields
    fill(color(180, 70, 100)); // Cyan for shields
    text(`🛡: ${ship.shieldCharges}`, currentX, hudH / 2); // Using shield symbol (may not render everywhere)
    // currentX += textWidth(`🛡: ${ship.shieldCharges}`) + spacing * 3; // Removed for space

    // Draw Upgrade Levels (Bottom Right Corner)
    textAlign(RIGHT, BOTTOM); // Align bottom-right
    fill(uiTextColor); // Standard text color
    textSize(textSizeVal * 0.9); // Slightly smaller text
    text(`RATE:${ship.fireRateLevel} SPREAD:${ship.spreadShotLevel}`, width - sideMargin, height - bottomMargin);
}
function displayInfoMessage() {
    let msgSize = isMobile ? 15 : 18;
    textSize(msgSize);
    textAlign(CENTER, CENTER);
    let msgWidth = textWidth(infoMessage);
    let padding = 10;
    let boxH = msgSize + padding;
    let boxY = height - boxH - (isMobile? 15 : 30); // Adjusted Y pos slightly higher

    // Draw background box
    fill(uiPanelColor);
    stroke(uiBorderColor);
    strokeWeight(1.5);
    rect(width/2 - msgWidth/2 - padding, boxY, msgWidth + padding*2, boxH, 5); // Rounded corners

    // Draw text
    fill(uiTextColor);
    noStroke();
    text(infoMessage, width / 2, boxY + boxH / 2);
}
function displayComboText() { // NEW Function for Combo Visual Feedback
    if (showComboText && comboCounter >= 2) { // Only show if combo is active and at least x2
        let comboSize = isMobile ? 28 : 36;
        let comboY = height * 0.25; // Position it somewhere visible (e.g., top quarter)
        let alpha = map(comboTextTimeout, 0, 60, 0, 100); // Fade out effect based on remaining display time

        push(); // Isolate transformations and styles
        textAlign(CENTER, CENTER);
        textSize(comboSize);

        // Simple pulse/scale effect while text is visible
        let scaleFactor = 1.0 + sin(map(comboTextTimeout, 60, 0, 0, PI)) * 0.08; // Small scale pulse
        translate(width / 2, comboY);
        scale(scaleFactor);

        // Draw text with an outline for better visibility
        stroke(0, 0, 0, alpha * 0.8); // Black outline, fades with text
        strokeWeight(4);
        fill(uiHighlightColor); // Use a bright color (yellowish)
        text(`COMBO x${comboCounter}!`, 0, 0);

        // Reset fill/stroke for safety if needed elsewhere
        noStroke();
        fill(255); // Or reset to a default
        pop(); // Restore previous drawing state
    }
}


// --- Game State Control ---
function resetGame() {
    ship = new Ship();
    bullets = [];
    particles = [];
    asteroids = [];
    potions = [];
    enemyShips = [];
    enemyBullets = [];
    powerUps = [];
    nebulas = [];
    shootingStars = [];
    points = 0;
    money = 0;
    lives = 3;
    currentLevel = 1;
    setDifficultyForLevel(currentLevel);
    // Reset background
    currentTopColor = color(260, 80, 10);
    currentBottomColor = color(240, 70, 25);
    lastPlanetAppearanceTime = -Infinity;
    planetVisible = false;
    frameCount = 0; // Reset frameCount for time-based scaling
    // Reset UI messages
    infoMessage = "";
    infoMessageTimeout = 0;
    // Reset effects
    screenShakeDuration = 0;
    screenShakeIntensity = 0;
    isPaused = false;
    levelTransitionFlash = 0;
    // Reset Combo System // NEW
    comboCounter = 0;
    comboTimer = 0;
    maxComboReached = 0;
    showComboText = false;
    comboTextTimeout = 0;
    cursor(); // Reset cursor to default
    spawnInitialAsteroids();
}
function startGame() {
    resetGame();
    gameState = GAME_STATE.PLAYING;
}
function startNextLevel() {
    if (gameState !== GAME_STATE.UPGRADE_SHOP) return;
    currentLevel++;
    setDifficultyForLevel(currentLevel);
    ship.resetPositionForNewLevel(); // Reset ship position and clear temp effects
    asteroids = []; // Clear remaining asteroids from previous level
    frameCount = 0; // Reset frameCount for time-based difficulty in new level
    infoMessage = `Starting Level ${currentLevel}`;
    infoMessageTimeout = 90;
    levelTransitionFlash = 15; // Brief white flash
    spawnInitialAsteroids(); // Spawn new set of asteroids
    gameState = GAME_STATE.PLAYING;
    cursor(); // Hide system cursor
}


// --- Input Handling ---
function mousePressed() {
    if (gameState === GAME_STATE.START_SCREEN) {
        startGame();
    } else if (gameState === GAME_STATE.PLAYING && !isPaused) {
        ship.shoot();
        /* TODO: Play shoot sound */
    } else if (gameState === GAME_STATE.UPGRADE_SHOP) {
        for (let button of shopButtons) {
            if (mouseX > button.x && mouseX < button.x + button.w &&
                mouseY > button.y && mouseY < button.y + button.h) {
                handleShopButtonPress(button.id);
                break;
            }
        }
    } else if (gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN_SCREEN) {
        startGame();
    }
}
function keyPressed() {
    if (keyCode === ESCAPE && gameState === GAME_STATE.PLAYING) {
        isPaused = !isPaused;
        if (isPaused) cursor(ARROW); // Show cursor when paused
        else cursor();              // Hide cursor when playing
    } else if (gameState === GAME_STATE.START_SCREEN) {
        if (keyCode === ENTER || keyCode === RETURN) {
            startGame();
        }
    } else if (gameState === GAME_STATE.PLAYING && !isPaused) {
        // Use spacebar for shooting (keyboard fallback)
        if (keyCode === 32) { // 32 is the key code for Spacebar
            ship.shoot();
            /* TODO: Play shoot sound */
            return false; // Prevent default browser behavior for spacebar
        }
        // Arrow keys/WASD are checked directly in ship.update() via keyIsDown()
    } else if (gameState === GAME_STATE.UPGRADE_SHOP) {
         // Allow pressing Enter to proceed to the next level
         if (keyCode === ENTER || keyCode === RETURN) {
             handleShopButtonPress('nextLevel');
         }
    } else if (gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN_SCREEN) {
        // Allow pressing Enter to restart
        if (keyCode === ENTER || keyCode === RETURN) {
            startGame();
        }
    }
}
function touchStarted() {
    if (touches.length === 0) return false; // Should not happen, but safety check

    let touchX = touches[0].x;
    let touchY = touches[0].y;

    if (gameState === GAME_STATE.START_SCREEN) {
        startGame();
        return false; // Consume the touch event
    } else if (gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN_SCREEN) {
        startGame();
        return false; // Consume the touch event
    } else if (gameState === GAME_STATE.UPGRADE_SHOP) {
         // Handle button presses in the shop for touch
         for (let button of shopButtons) {
            if (touchX > button.x && touchX < button.x + button.w &&
                touchY > button.y && touchY < button.y + button.h) {
                handleShopButtonPress(button.id);
                return false; // Consume the touch event
            }
         }
         return false; // Consume touch even if no button hit
    } else if (gameState === GAME_STATE.PLAYING && !isPaused) {
        // Tap shoots, movement is handled by ship.update() checking touches.length
        ship.shoot();
        /* TODO: Play shoot sound */
        return false; // Consume the touch event
    }

    return false; // Default: consume touch events in other states if necessary
}
function handleShopButtonPress(buttonId) {
    if (gameState !== GAME_STATE.UPGRADE_SHOP) return;

    if (buttonId === 'nextLevel') {
        startNextLevel();
        /* TODO: Play confirmation/next level sound */
    } else {
        // Attempt to buy fireRate or spreadShot upgrade
        let success = ship.attemptUpgrade(buttonId);
        if (success) {
            /* TODO: Play upgrade success sound */
            // Visual effect for successful purchase
            let button = shopButtons.find(b => b.id === buttonId);
            if(button) {
                createParticles(button.x + button.w / 2, button.y + button.h / 2, 20, color(120, 80, 100), 6, 2.0, 0.8); // Greenish particles
            }
        } else {
            /* TODO: Play upgrade fail/error sound */
            // Provide feedback if purchase failed
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
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    createStarfield(200); // Recreate starfield for new size
    // Re-calculate button positions if the shop or other UI elements are open
    if (gameState === GAME_STATE.UPGRADE_SHOP || gameState === GAME_STATE.WIN_SCREEN || gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.PAUSE_SCREEN ) {
        // Potentially re-setup buttons or panel sizes if they depend on width/height
    }
     if (gameState === GAME_STATE.UPGRADE_SHOP) {
         setupShopButtons(); // Recalculate shop button positions
     }
}


// ======================================================================
// ========================== CLASS DEFINITIONS =========================
// ======================================================================


// ==================
// Ship Class
// ==================
class Ship {
    constructor() {
        this.pos = createVector(width / 2, height - 50);
        this.vel = createVector(0, 0);
        this.thrust = 0.38; // Lowered acceleration for smoother control
        this.touchThrustMultiplier = 1.15; // How quickly ship moves towards touch point
        this.friction = 0.975; // Air resistance
        this.maxSpeed = 9.5; // Max velocity
        this.size = 30; // Base size
        // Colors
        this.cockpitColor = color(180, 100, 100); // Cyan
        this.baseEngineColor1 = color(30, 100, 100); // Orange
        this.baseEngineColor2 = color(0, 100, 100);  // Red
        this.finColor = color(220, 60, 70); // Bluish-grey
        this.detailColor = color(0, 0, 60); // Dark grey for lines

        this.shapeState = 0; // 0 = base, 1 = evolved

        // Shooting
        this.shootCooldown = 0;
        this.baseShootDelay = 15; // Frames between shots at level 0
        this.shootDelayPerLevel = 2; // Reduction per fire rate level

        // Shields & Health
        this.shieldCharges = 0;
        this.shieldVisualRadius = this.size * 1.2;
        this.invulnerableTimer = 0;
        this.invulnerabilityDuration = 120; // 2 seconds at 60fps

        // Upgrades
        this.maxLevel = 5; // Max level for Fire Rate and Spread Shot
        this.fireRateLevel = 0;
        this.spreadShotLevel = 0;
        this.baseUpgradeCost = 30;
        this.costMultiplier = 2.0;

        // Temporary Power-Ups
        this.rapidFireTimer = 0;
        this.tempShieldActive = false;

        // Visual Effects
        this.hoverOffset = 0; // For subtle up/down bobbing
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
        // Simple toggle between two shapes based on threshold level
        this.shapeState = (level % 2);
    }

    get currentShootDelay() {
        if (this.rapidFireTimer > 0) {
            return 2; // Rapid fire overrides normal delay
        } else {
            // Calculate delay based on fire rate level, ensure minimum delay
            return max(3, this.baseShootDelay - (this.fireRateLevel * this.shootDelayPerLevel));
        }
    }

    getUpgradeCost(upgradeType) {
        let level;
        if (upgradeType === 'fireRate') {
            level = this.fireRateLevel;
            if (level >= this.maxLevel) return "MAX"; // Already maxed
            return floor(this.baseUpgradeCost * pow(this.costMultiplier, level));
        } else if (upgradeType === 'spreadShot') {
            level = this.spreadShotLevel;
             if (level >= this.maxLevel) return "MAX"; // Already maxed
            return floor(this.baseUpgradeCost * pow(this.costMultiplier, level));
        } else {
            return Infinity; // Invalid upgrade type
        }
    }

    attemptUpgrade(upgradeType) {
        let cost = this.getUpgradeCost(upgradeType);
        if (typeof cost !== 'number') return false; // Is "MAX" or invalid

        let currentLevel, maxLevelForType;
        if (upgradeType === 'fireRate') {
            currentLevel = this.fireRateLevel;
            maxLevelForType = this.maxLevel;
        } else if (upgradeType === 'spreadShot') {
            currentLevel = this.spreadShotLevel;
            maxLevelForType = this.maxLevel;
        } else {
            return false; // Invalid type
        }

        if (currentLevel < maxLevelForType && money >= cost) {
            money -= cost; // Deduct cost
            if (upgradeType === 'fireRate') this.fireRateLevel++;
            else if (upgradeType === 'spreadShot') this.spreadShotLevel++;
            return true; // Upgrade successful
        } else {
            return false; // Cannot afford or already maxed
        }
    }

    resetPositionForNewLevel() {
        this.pos.set(width / 2, height - 50); // Center bottom
        this.vel.set(0, 0); // Stop movement
        this.invulnerableTimer = 60; // Brief invulnerability at level start
        this.rapidFireTimer = 0; // Clear powerups
        this.tempShieldActive = false;
    }

    update() {
        // Timers
        if (this.invulnerableTimer > 0) { this.invulnerableTimer--; }
        if (this.rapidFireTimer > 0) { this.rapidFireTimer--; }
        if (this.shootCooldown > 0) { this.shootCooldown--; }

        // Visual Hover Effect
        this.hoverOffset = sin(frameCount * 0.05) * 2; // Slow, small bobbing

        // Movement Logic
        let isTouching = isMobile && touches.length > 0; // Check for active touch on mobile
        let acceleration = createVector(0, 0);
        let applyThrustParticles = false;

        if (isTouching) {
            // --- Touch Controls ---
            let touchPos = createVector(touches[0].x, touches[0].y);
            let direction = p5.Vector.sub(touchPos, this.pos); // Vector from ship to touch point

            // Only move if touch is reasonably far from the ship center
            if (direction.magSq() > (this.size * 0.5) * (this.size * 0.5)) {
                 direction.normalize();
                 // Lerp towards a target velocity based on direction and max speed
                 let targetVel = direction.copy().mult(this.maxSpeed * this.touchThrustMultiplier);
                 // Use lerp for smoother acceleration/deceleration towards the target velocity
                 this.vel.lerp(targetVel, 0.15); // Adjust the 0.15 value to change responsiveness
                 applyThrustParticles = this.vel.magSq() > 0.1; // Show thrust if moving noticeably
            } else {
                 // If touching very close to the ship, decelerate (apply friction)
                 this.vel.mult(this.friction);
            }

        } else {
            // --- Keyboard Controls ---
            let movingUp = keyIsDown(UP_ARROW) || keyIsDown(87); // W
            let movingDown = keyIsDown(DOWN_ARROW) || keyIsDown(83); // S
            let movingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65); // A
            let movingRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68); // D

            if (movingUp) { acceleration.y -= this.thrust; applyThrustParticles = true;}
            if (movingDown) { acceleration.y += this.thrust; } // No thrust particles for moving down
            if (movingLeft) { acceleration.x -= this.thrust; applyThrustParticles = true;}
            if (movingRight) { acceleration.x += this.thrust; applyThrustParticles = true;}

            this.vel.add(acceleration); // Apply acceleration from keys
            this.vel.mult(this.friction); // Apply friction regardless of input
        }

        // --- Engine Thrust Particles ---
        if (applyThrustParticles && frameCount % 3 === 0) { // Spawn particles less frequently
            let thrustColor = lerpColor(this.baseEngineColor1, color(60, 100, 100), this.fireRateLevel / this.maxLevel); // Color shifts towards yellow/green with upgrades
             createParticles(
                 this.pos.x, this.pos.y + this.size * 0.55, // Spawn below ship center
                 1, // Number of particles per frame
                 thrustColor,
                 3, // Particle size
                 1.5, // Speed multiplier
                 0.5 // Lifespan multiplier (shorter lifespan)
             );
        }

        // --- Final Movement Update ---
        this.vel.limit(this.maxSpeed); // Cap speed
        this.pos.add(this.vel); // Apply velocity to position

        // Keep ship within screen bounds
        let margin = this.size * 0.7; // Allow edges to slightly go off-screen
        this.pos.x = constrain(this.pos.x, margin, width - margin);
        this.pos.y = constrain(this.pos.y, margin, height - margin);
    }

    shoot() {
        if (this.shootCooldown <= 0) {
            let originY = this.pos.y - this.size * 0.6 + this.hoverOffset; // Adjust Y based on hover

            // Determine bullet origins and firing pattern based on spreadShotLevel
            let originPoints = [createVector(this.pos.x, originY)]; // Default single origin
            let numShots = 1;
            let spreadAngle = 0;

            // Levels 1-2: 3 shots, narrow spread
            if (this.spreadShotLevel >= 1 && this.spreadShotLevel <= 2) {
                 let offset = this.size * 0.15;
                 originPoints = [
                     createVector(this.pos.x - offset, originY + 5), // Slightly lower side origins
                     createVector(this.pos.x, originY),              // Center origin
                     createVector(this.pos.x + offset, originY + 5)
                 ];
                 numShots = 3;
                 spreadAngle = PI / 20; // Narrow angle
            }
            // Levels 3-4: 3 shots, wider spread
            else if (this.spreadShotLevel >= 3 && this.spreadShotLevel <= 4) {
                 let offset = this.size * 0.2;
                 originPoints = [
                     createVector(this.pos.x - offset, originY + 5),
                     createVector(this.pos.x, originY),
                     createVector(this.pos.x + offset, originY + 5)
                 ];
                 numShots = 3;
                 spreadAngle = PI / 15; // Wider angle
            }
             // Level 5 (Max): 5 shots, wider spread
            else if (this.spreadShotLevel >= this.maxLevel) {
                 let offset1 = this.size * 0.25; // Outer origin X offset
                 let offset2 = this.size * 0.1;  // Inner origin X offset
                 originPoints = [
                     createVector(this.pos.x - offset1, originY + 8), // Outer points slightly lower
                     createVector(this.pos.x - offset2, originY + 3), // Inner points slightly lower
                     createVector(this.pos.x, originY),              // Center
                     createVector(this.pos.x + offset2, originY + 3),
                     createVector(this.pos.x + offset1, originY + 8)
                 ];
                 numShots = 5;
                 spreadAngle = PI / 12; // Widest angle
            }

            // Fire the bullets
            for (let i = 0; i < numShots; i++) {
                 let angle = 0;
                 if (numShots > 1) {
                     // Map index 'i' to the spread angle range
                     angle = map(i, 0, numShots - 1, -spreadAngle, spreadAngle);
                 }
                 // Use the corresponding origin point, fallback to center if array mismatch
                 let origin = originPoints[i] || originPoints[0];
                 bullets.push(new Bullet(origin.x, origin.y, angle));
            }

            this.shootCooldown = this.currentShootDelay; // Reset cooldown
        }
    }

    draw() {
        // Blinking effect when invulnerable
        if (this.invulnerableTimer <= 0 || (this.invulnerableTimer > 0 && frameCount % 10 < 5) ) {
            push(); // Isolate ship drawing transformations and styles
            translate(this.pos.x, this.pos.y + this.hoverOffset); // Apply position and hover

             // --- Shield Visuals ---
             if (this.tempShieldActive) { // Draw temporary shield (yellowish)
                 let tempShieldAlpha = map(sin(frameCount * 0.3), -1, 1, 60, 100); // Pulsing alpha
                 let tempShieldHue = 45; // Yellow hue
                 fill(tempShieldHue, 90, 100, tempShieldAlpha); // Solid fill, slightly transparent
                 noStroke();
                 ellipse(0, 0, this.shieldVisualRadius * 2.3, this.shieldVisualRadius * 2.3); // Larger radius for temp shield
                 strokeWeight(2.5);
                 stroke(tempShieldHue, 100, 100, tempShieldAlpha + 25); // Brighter outline
                 noFill();
                 ellipse(0, 0, this.shieldVisualRadius * 2.3, this.shieldVisualRadius * 2.3);
             } else if (this.shieldCharges > 0) { // Draw regular shield (cyan)
                 let shieldAlpha = map(sin(frameCount * 0.2), -1, 1, 50, 90); // Pulsing alpha
                 let shieldHue = 180; // Cyan hue
                 fill(shieldHue, 80, 100, shieldAlpha); // Solid fill, slightly transparent
                 noStroke();
                 ellipse(0, 0, this.shieldVisualRadius * 2.1, this.shieldVisualRadius * 2.1);
                 strokeWeight(2);
                 stroke(shieldHue, 90, 100, shieldAlpha + 35); // Brighter outline
                 noFill();
                 ellipse(0, 0, this.shieldVisualRadius * 2.1, this.shieldVisualRadius * 2.1);
             }

            // --- Engine Glow Effect ---
            // Engine pulse scales slightly with velocity magnitude and rapid fire status
            let enginePulseFactor = 1.0 + this.vel.mag() * 0.04; // Less intense scaling with speed
            let pulseSpeed = (this.rapidFireTimer > 0) ? 0.5 : 0.25; // Faster pulse during rapid fire
            let enginePulse = map(sin(frameCount * pulseSpeed), -1, 1, 0.8, 1.3) * enginePulseFactor;
            let engineSize = this.size * 0.55 * enginePulse; // Base size * pulse factor
            let engineBrightness = map(sin(frameCount * 0.35), -1, 1, 85, 100); // Flicker brightness
            noStroke();
            // Color transition based on fire rate upgrade
            let engineColor1 = lerpColor(this.baseEngineColor1, color(60, 90, 100), this.fireRateLevel / this.maxLevel);
            let engineColor2 = lerpColor(this.baseEngineColor2, color(45, 90, 100), this.fireRateLevel / this.maxLevel);
            // Draw glow layers (outer, fainter)
            for (let i = engineSize * 1.2; i > 0; i -= 3) {
                let alpha = map(i, 0, engineSize * 1.2, 0, 30); // Fade out alpha
                 fill(hue(engineColor2), saturation(engineColor2), engineBrightness, alpha);
                 ellipse(0, this.size * 0.55, i * 0.8, i * 1.2); // Oval shape for engine glow
            }
            // Draw core engine flame (inner, brighter)
            fill(hue(engineColor1), saturation(engineColor1), 100); // Use brighter color 1
            ellipse(0, this.size * 0.55, engineSize * 0.5, engineSize * 1.0); // Smaller, more intense core


             // --- Ship Body ---
            stroke(0, 0, 85); // Dark outline for the body
            strokeWeight(1.5);
            // Body color changes hue based on points (subtle)
            let pointsHue = (200 + points * 0.2) % 360; // Starts blueish, shifts towards green/yellow
            fill(pointsHue, 85, 98); // Main body color
            let bodyWidthFactor = 0.6; // How wide the ship body is relative to size

            beginShape();
            if (this.shapeState === 0) { // Base Shape
                // Thin, sleek design using bezier curves for smoothness
                vertex(0, -this.size * 0.7); // Nose tip
                // Right side curve control points
                bezierVertex(
                    this.size * bodyWidthFactor * 0.8, -this.size * 0.3, // Control point 1
                    this.size * bodyWidthFactor * 0.9, this.size * 0.0,  // Control point 2
                    this.size * bodyWidthFactor * 1.0, this.size * 0.4   // Endpoint (wing/body edge)
                );
                 // Bottom curve control points (symmetric for right side)
                bezierVertex(
                    this.size * bodyWidthFactor * 0.5, this.size * 0.6,  // Control point 3
                    -this.size * bodyWidthFactor * 0.5, this.size * 0.6, // Control point 4 (mirrored)
                    -this.size * bodyWidthFactor * 1.0, this.size * 0.4  // Endpoint (left wing/body edge)
                );
                // Left side curve control points (mirrored)
                bezierVertex(
                    -this.size * bodyWidthFactor * 0.9, this.size * 0.0, // Control point 5
                    -this.size * bodyWidthFactor * 0.8, -this.size * 0.3, // Control point 6
                    0, -this.size * 0.7                          // Back to nose tip
                );
            } else { // Evolved Shape (Slightly larger, more angular/detailed)
                 let s = this.size * 1.1; // Slightly larger base size
                 let evolvedWidthFactor = bodyWidthFactor * 1.1; // Slightly wider
                 vertex(0, -s * 0.8); // Sharper nose
                 // Right side (more angular curves)
                 bezierVertex( s * evolvedWidthFactor * 0.8, -s * 0.2, s * evolvedWidthFactor * 0.9, s * 0.1, s * evolvedWidthFactor * 1.0, s * 0.5); // Wider wing endpoint
                 // Bottom (wider base)
                 bezierVertex( s * evolvedWidthFactor * 0.5, s * 0.7, -s * evolvedWidthFactor * 0.5, s * 0.7, -s * evolvedWidthFactor * 1.0, s * 0.5);
                 // Left side (mirrored)
                 bezierVertex(-s * evolvedWidthFactor * 0.9, s * 0.1, -s * evolvedWidthFactor * 0.8, -s * 0.2, 0, -s * 0.8);
            }
            endShape(CLOSE);


            // --- Body Details & Fins ---
            strokeWeight(1.2);
            stroke(this.detailColor); // Dark grey lines
            // Simple panel lines based on shape state
            if (this.shapeState === 0) {
                 line(-this.size * bodyWidthFactor * 0.5, -this.size * 0.1, -this.size * bodyWidthFactor * 0.75, this.size * 0.3);
                 line( this.size * bodyWidthFactor * 0.5, -this.size * 0.1, this.size * bodyWidthFactor * 0.75, this.size * 0.3);
            } else {
                 let s = this.size * 1.1;
                 let ewf = bodyWidthFactor * 1.1;
                 line(-s * ewf * 0.6, -s * 0.05, -s * ewf * 0.8, s * 0.4); // Slightly different line angles
                 line( s * ewf * 0.6, -s * 0.05, s * ewf * 0.8, s * 0.4);
                 line(0, -s*0.4, 0, s*0.1); // Center line detail
            }

             // Fins (adjust based on shape state)
            let finYOffset = this.shapeState === 0 ? this.size * 0.3 : this.size * 1.1 * 0.35;
            let finXBase = this.shapeState === 0 ? this.size * bodyWidthFactor * 0.6 : this.size * 1.1 * bodyWidthFactor * 1.1 * 0.7;
            let finTipX = this.shapeState === 0 ? this.size * bodyWidthFactor * 1.1 : this.size * 1.1 * bodyWidthFactor * 1.1 * 1.1;
            let finRearX = this.shapeState === 0 ? this.size * bodyWidthFactor * 0.75 : this.size * 1.1 * bodyWidthFactor * 1.1 * 0.8;
            let finRearY = this.shapeState === 0 ? this.size * 0.6 : this.size * 1.1 * 0.7;

            fill(this.finColor); // Bluish-grey
            stroke(0, 0, 65); // Slightly darker outline for fins
            strokeWeight(1);
            triangle( finXBase, finYOffset, finTipX, finYOffset + this.size*0.1, finRearX, finRearY); // Right fin
            triangle(-finXBase, finYOffset, -finTipX, finYOffset + this.size*0.1, -finRearX, finRearY); // Left fin


            // --- Cockpit ---
            fill(this.cockpitColor); // Cyan
            noStroke();
            ellipse(0, -this.size * 0.15, this.size * 0.4, this.size * 0.5); // Main cockpit shape
            // Cockpit highlight/glare
            fill(0, 0, 100, 60); // White, semi-transparent
            ellipse(0, -this.size * 0.2, this.size * 0.25, this.size * 0.3); // Smaller ellipse offset up

            pop(); // Restore drawing state
        }
    }
}


// ==================
// Bullet Class
// ==================
class Bullet {
    constructor(x, y, angle = 0) {
        this.pos = createVector(x, y);
        this.speed = 17;
        this.size = 5.5;
        this.startHue = frameCount % 360; // Base hue on frameCount for cycling
        this.hue = this.startHue;
        // Calculate initial velocity vector based on ship's forward (-PI/2) plus spread angle
        let baseAngle = -PI / 2; // Upwards direction
        this.vel = p5.Vector.fromAngle(baseAngle + angle);
        this.vel.mult(this.speed);
        // Trail effect
        this.trail = [];
        this.trailLength = 5; // Number of trail segments
    }

    update() {
         // Add current position to the beginning of the trail
        this.trail.unshift(this.pos.copy());
        // Remove the oldest position if the trail is too long
        if (this.trail.length > this.trailLength) {
            this.trail.pop();
        }

        this.pos.add(this.vel); // Move bullet
        this.hue = (this.hue + 5) % 360; // Cycle hue for rainbow effect
    }

    draw() {
        noStroke();
        // Draw trail segments
        for (let i = 0; i < this.trail.length; i++) {
            let trailPos = this.trail[i];
            // Alpha decreases towards the end of the trail
            let alpha = map(i, 0, this.trail.length - 1, 50, 0);
            // Size decreases towards the end of the trail
            let trailSize = map(i, 0, this.trail.length - 1, this.size, this.size * 0.5);
            fill(this.hue, 90, 100, alpha); // Use current bullet hue for trail
            ellipse(trailPos.x, trailPos.y, trailSize, trailSize * 2.0); // Elongated trail segments
        }

        // Draw main bullet head
        fill(this.hue, 95, 100); // Bright, current hue
        stroke(0, 0, 100); // White outline
        strokeWeight(1);
        ellipse(this.pos.x, this.pos.y, this.size, this.size * 2.5); // Elongated shape
    }

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

        // Position: Use provided or spawn off-screen from top/left/right
        this.pos = createVector();
        let isInitialPlacement = (x !== undefined && y !== undefined);
        if (isInitialPlacement) {
             // Used by spawnInitialAsteroids
            this.pos.x = x;
            this.pos.y = y;
        } else {
             // Spawn during gameplay from edges
            let edge = floor(random(3)); // 0: Top, 1: Right, 2: Left
            if (edge === 0) { // Top Edge
                this.pos.x = random(width);
                this.pos.y = -this.size / 2;
            } else if (edge === 1) { // Right Edge
                this.pos.x = width + this.size / 2;
                this.pos.y = random(height * 0.7); // Spawn in upper 70% of side edges
            } else { // Left Edge
                this.pos.x = -this.size / 2;
                this.pos.y = random(height * 0.7);
            }
        }

        // Velocity: Use provided (for splitting) or calculate new
        if (vel) {
            this.vel = vel; // Used for split asteroids
        } else {
            // Calculate speed based on level and size
            let baseSpeedMin = 0.6 + (currentLevel - 1) * 0.1;
            let baseSpeedMax = 1.8 + (currentLevel - 1) * 0.2;
            this.speed = min(MAX_ASTEROID_SPEED, random(baseSpeedMin, baseSpeedMax));
            this.speed *= (this.size > 50 ? 0.9 : 1.1); // Smaller are slightly faster
            this.speed *= random(0.9, 1.1); // Add some randomness

            // Calculate direction
            if (isInitialPlacement) {
                // Initial asteroids get random direction
                 this.vel = p5.Vector.random2D();
            } else {
                // New asteroids aim roughly towards the center area with variation
                let targetX = width / 2 + random(-width * 0.25, width * 0.25);
                let targetY = height / 2 + random(-height * 0.25, height * 0.25);
                let direction = createVector(targetX - this.pos.x, targetY - this.pos.y);
                direction.normalize();
                direction.rotate(random(-PI / 12, PI / 12)); // Add slight angle variation
                this.vel = direction;
            }
            this.vel.mult(this.speed);
        }

        // Visuals
        this.color = color(random(20, 50), random(30, 70), random(35, 65)); // Brown/Grey Hues
        this.rotation = random(TWO_PI);
        this.rotationSpeed = random(-0.04, 0.04);
        this.rotationAccel = 0.0001; // Slight random change in rotation speed

        // Shape vertices (jagged edges)
        this.vertices = [];
        let numVertices = floor(random(9, 18));
        for (let i = 0; i < numVertices; i++) {
            let angleOffset = map(i, 0, numVertices, 0, TWO_PI);
            // Random radius for each vertex to create irregularity
            let r = this.size / 2 + random(-this.size * 0.45, this.size * 0.35);
            let v = p5.Vector.fromAngle(angleOffset);
            v.mult(r);
            this.vertices.push(v);
        }

        // Crater details
        this.craters = [];
        let numCraters = floor(random(2, 7));
        for (let i = 0; i < numCraters; i++) {
             let angle = random(TWO_PI);
             let radius = random(this.size * 0.1, this.size * 0.4); // Distance from center
             let craterSize = random(this.size * 0.1, this.size * 0.3);
             let craterPos = p5.Vector.fromAngle(angle).mult(radius);
             this.craters.push({ pos: craterPos, size: craterSize });
        }
    }

    update() {
        this.pos.add(this.vel);

        // Update rotation with slight acceleration/deceleration
        this.rotationSpeed += random(-this.rotationAccel, this.rotationAccel);
        this.rotationSpeed = constrain(this.rotationSpeed, -0.06, 0.06); // Limit rotation speed
        this.rotation += this.rotationSpeed;

        // Screen Wrap (Simpler than bouncing)
        let buffer = this.size; // Allow wrapping slightly before fully off-screen
        if (this.pos.x < -buffer) this.pos.x = width + buffer;
        if (this.pos.x > width + buffer) this.pos.x = -buffer;
        if (this.pos.y < -buffer) this.pos.y = height + buffer;
        if (this.pos.y > height + buffer) this.pos.y = -buffer;
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);

        // Simple shading using slightly offset shapes
        let mainBri = brightness(this.color);
        let mainSat = saturation(this.color);
        let mainHue = hue(this.color);

        // Highlight layer (offset slightly up-left)
        let highlightColor = color(mainHue, mainSat * 0.7, mainBri * 1.3);
        fill(highlightColor);
        noStroke();
        beginShape();
        for (let v of this.vertices) { vertex(v.x - 1.5, v.y - 1.5); }
        endShape(CLOSE);

        // Shadow layer (offset slightly down-right)
        let shadowColor = color(mainHue, mainSat * 1.2, mainBri * 0.6);
        fill(shadowColor);
        noStroke();
        beginShape();
        for (let v of this.vertices) { vertex(v.x + 1.5, v.y + 1.5); }
        endShape(CLOSE);

        // Main body shape
        fill(this.color);
        stroke(mainHue, mainSat * 0.4, mainBri * random(1.4, 1.8)); // Slightly brighter, varying edge color
        strokeWeight(1.8);
        beginShape();
        for (let v of this.vertices) { vertex(v.x, v.y); }
        endShape(CLOSE);

        // Draw craters (darker depressions)
        noStroke();
        fill(hue(this.color), saturation(this.color)*0.7, brightness(this.color) * 0.4, 90); // Darker, desaturated color
        for (let crater of this.craters) {
            ellipse(crater.pos.x, crater.pos.y, crater.size, crater.size * random(0.7, 1.3)); // Slightly irregular crater shapes
        }

        pop();
    }

    // Collision check with a bullet (simple circle collision)
    hits(bullet) {
        let d = dist(this.pos.x, this.pos.y, bullet.pos.x, bullet.pos.y);
        return d < this.size / 2 + bullet.size / 2;
    }

    // Collision check with the ship (considers shields)
    hitsShip(ship) {
        let targetX = ship.pos.x;
        let targetY = ship.pos.y;
        // Determine the ship's effective radius based on active shields
        let targetRadius;
        if (ship.tempShieldActive) {
            targetRadius = ship.shieldVisualRadius * 1.1; // Slightly larger hit area for temp shield
        } else if (ship.shieldCharges > 0) {
            targetRadius = ship.shieldVisualRadius; // Normal shield radius
        } else {
            targetRadius = ship.size * 0.5; // Core ship body radius
        }
        let d = dist(this.pos.x, this.pos.y, targetX, targetY);
        // Check distance against sum of radii
        return d < this.size / 2 + targetRadius;
    }
}


// ==================
// Particle Class
// ==================
class Particle {
    constructor(x, y, particleColor, size = null, speedMult = 1, lifespanMult = 1) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D(); // Random initial direction
        this.vel.mult(random(1.5, 6) * speedMult); // Random speed within range, scaled
        this.lifespan = 100 * lifespanMult * random(0.8, 1.5); // Base lifespan, scaled, with randomness
        this.maxLifespan = this.lifespan; // Store initial lifespan for alpha calculation
        // Store base color components
        this.baseHue = hue(particleColor);
        this.baseSat = saturation(particleColor);
        this.baseBri = brightness(particleColor);
        // Use provided size or random, add variation
        this.size = size !== null ? size * random(0.8, 1.2) : random(2, 7);
        this.drag = random(0.95, 0.99); // Slow down factor
    }

    update() {
        this.pos.add(this.vel);
        this.lifespan -= 2.5; // Decrease lifespan each frame
        this.vel.mult(this.drag); // Apply drag to slow down
    }

    draw() {
        noStroke();
        // Alpha fades out as lifespan decreases
        let currentAlpha = map(this.lifespan, 0, this.maxLifespan, 0, 100);
        fill(this.baseHue, this.baseSat, this.baseBri, currentAlpha);
        // Size shrinks as lifespan decreases
        ellipse(this.pos.x, this.pos.y, this.size * (this.lifespan / this.maxLifespan));
    }

    isDead() {
        return this.lifespan <= 0;
    }
}


// ==================
// Star Class (Parallax Background)
// ==================
class Star {
    constructor() {
        this.x = random(width);
        this.y = random(height);
        this.layer = floor(random(4)); // 4 layers for parallax effect
        // Size and speed depend on layer (closer layers = larger, faster)
        this.size = map(this.layer, 0, 3, 0.4, 2.8);
        this.speed = map(this.layer, 0, 3, 0.05, 0.6);
        // Base brightness and twinkle properties
        this.baseBrightness = random(50, 95);
        this.twinkleSpeed = random(0.03, 0.08);
        this.twinkleRange = random(0.6, 1.4); // How much brightness varies
        this.twinkleOffset = random(TWO_PI); // Random start phase for twinkle
    }

    update() {
        // Move star down based on its layer speed
        this.y += this.speed;
        // Wrap star to top if it goes off bottom edge
        if (this.y > height + this.size) {
            this.y = -this.size;
            this.x = random(width); // New horizontal position when wrapping
        }
    }

    draw() {
        // Calculate twinkle effect using sine wave
        let twinkleFactor = map(sin(frameCount * this.twinkleSpeed + this.twinkleOffset), -1, 1, 1.0 - this.twinkleRange / 2, 1.0 + this.twinkleRange / 2);
        let currentBrightness = constrain(this.baseBrightness * twinkleFactor, 30, 100); // Apply twinkle, constrain brightness
        fill(0, 0, currentBrightness, 90); // White star with varying brightness and fixed alpha
        noStroke();
        ellipse(this.x, this.y, this.size, this.size);
    }
}


// ==================
// ShootingStar Class
// ==================
class ShootingStar {
    constructor() {
        this.startX = random(width);
        this.startY = random(-50, -10); // Start above the screen
        this.pos = createVector(this.startX, this.startY);
        let angle = random(PI * 0.3, PI * 0.7); // Angle range (mostly downwards)
        this.speed = random(15, 30); // Fast speed
        this.vel = p5.Vector.fromAngle(angle).mult(this.speed);
        this.len = random(50, 150); // Length of the tail
        this.brightness = random(80, 100);
        this.lifespan = 100; // How long the star is visible (controls fade out)
    }

    update() {
        this.pos.add(this.vel);
        this.lifespan -= 2; // Fade out over time
    }

    draw() {
        if (this.lifespan <= 0) return; // Don't draw if faded out

        // Alpha based on remaining lifespan
        let alpha = map(this.lifespan, 0, 100, 0, 100);
        // Calculate tail start position based on velocity and length
        let tailPos = p5.Vector.sub(this.pos, this.vel.copy().setMag(this.len));

        strokeWeight(random(1.5, 3)); // Slightly varying thickness
        stroke(0, 0, this.brightness, alpha); // White color, fading alpha
        line(this.pos.x, this.pos.y, tailPos.x, tailPos.y); // Draw the line (tail)
    }

    isDone() {
        // Remove if faded or completely off-screen
        return this.lifespan <= 0 ||
               this.pos.y > height + this.len ||
               this.pos.x < -this.len ||
               this.pos.x > width + this.len;
    }
}


// ==================
// HealthPotion Class
// ==================
class HealthPotion {
    constructor(x, y) {
        // Use provided position or spawn randomly near top
        this.pos = createVector(x || random(width * 0.1, width * 0.9), y || -30);
        this.vel = createVector(0, random(0.5, 1.5)); // Moves straight down slowly
        this.size = 20; // Base size for drawing calculations
        // Dimensions for potion shape
        this.bodyWidth = this.size * 0.6;
        this.bodyHeight = this.size * 0.8;
        this.neckWidth = this.size * 0.3;
        this.neckHeight = this.size * 0.4;
        // Rotation and visual pulse
        this.rotation = 0;
        this.rotationSpeed = random(-0.015, 0.015); // Slow, gentle rotation
        this.pulseOffset = random(TWO_PI); // Random start for pulse effect
    }

    update() {
        this.pos.add(this.vel);
        this.rotation += this.rotationSpeed;
        // No screen wrapping needed, just check offscreen status
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);

        // Pulsing glow effect behind the potion
        let pulseFactor = map(sin(frameCount * 0.15 + this.pulseOffset), -1, 1, 0.8, 1.2);
        let glowAlpha = map(pulseFactor, 0.8, 1.2, 20, 60); // Map pulse to alpha
        fill(0, 90, 100, glowAlpha); // Red glow (matching potion color)
        noStroke();
        ellipse(0, 0, this.size * 1.5 * pulseFactor, this.size * 1.5 * pulseFactor); // Pulsing ellipse

        // Draw potion body (rectangle + neck + stopper)
        fill(0, 85, 90); // Red color for potion liquid/glass
        noStroke();
        // Body
        rect(-this.bodyWidth / 2, -this.bodyHeight / 2, this.bodyWidth, this.bodyHeight, 3); // Rounded corners
        // Neck
        rect(-this.neckWidth / 2, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth, this.neckHeight);
        // Stopper/Top
        ellipse(0, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth * 1.2, this.neckWidth * 0.4);

        // Simple cross symbol (white)
        fill(0, 0, 100); // White
        rectMode(CENTER); // Draw rects from center
        rect(0, 0, this.bodyWidth * 0.5, this.bodyWidth * 0.15); // Horizontal bar
        rect(0, 0, this.bodyWidth * 0.15, this.bodyWidth * 0.5); // Vertical bar
        rectMode(CORNER); // Reset rectMode

        pop();
    }

    hitsShip(ship) {
        let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y);
        // Check against ship's effective radius (including shields)
        let shipRadius;
        if (ship.tempShieldActive) shipRadius = ship.shieldVisualRadius * 1.1;
        else if (ship.shieldCharges > 0) shipRadius = ship.shieldVisualRadius;
        else shipRadius = ship.size * 0.5;
        return d < this.size * 0.7 + shipRadius; // Use 70% of visual size for collision
    }

    isOffscreen() {
        let margin = this.size * 2;
        return (this.pos.y > height + margin); // Only need to check bottom edge
    }
}


// ==================
// PowerUp Class
// ==================
class PowerUp {
    constructor(type) {
        this.type = type;
        this.pos = createVector(random(width * 0.1, width * 0.9), -30); // Spawn randomly near top
        this.vel = createVector(0, random(0.8, 1.8)); // Moves straight down
        this.size = 22;
        this.pulseOffset = random(TWO_PI); // Random start for pulse
        this.rotation = random(TWO_PI); // Random start rotation
        this.rotationSpeed = random(-0.02, 0.02); // Gentle rotation

        // Set icon and color based on type
        this.icon = '?';
        this.color = color(0, 0, 100); // Default white
        switch (this.type) {
            case POWERUP_TYPES.TEMP_SHIELD:
                this.icon = 'S'; // Shield
                this.color = color(45, 90, 100); // Yellow
                break;
            case POWERUP_TYPES.RAPID_FIRE:
                this.icon = 'R'; // Rapid Fire
                this.color = color(120, 90, 100); // Green
                break;
            case POWERUP_TYPES.EMP_BURST:
                this.icon = 'E'; // EMP
                this.color = color(210, 90, 100); // Light Blue
                break;
        }
    }

    update() {
        this.pos.add(this.vel);
        this.rotation += this.rotationSpeed;
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);

        // Pulsing size and brightness effect
        let pulse = map(sin(frameCount * 0.2 + this.pulseOffset), -1, 1, 0.9, 1.2);
        let currentSize = this.size * pulse;
        let currentBrightness = brightness(this.color) * pulse; // Scale base brightness
        let glowAlpha = map(pulse, 0.9, 1.2, 30, 80); // Alpha for outer glow

        // Draw outer glow
        fill(hue(this.color), saturation(this.color) * 0.8, currentBrightness * 0.8, glowAlpha); // Slightly desaturated, dimmer glow color
        noStroke();
        ellipse(0, 0, currentSize * 1.5, currentSize * 1.5); // Larger ellipse for glow

        // Draw main power-up body (circle)
        fill(hue(this.color), saturation(this.color), currentBrightness); // Main color, pulsed brightness
        stroke(0, 0, 100, 80); // White outline, semi-transparent
        strokeWeight(2);
        ellipse(0, 0, currentSize, currentSize);

        // Draw icon text inside
        fill(0, 0, 100); // White text
        noStroke();
        textSize(currentSize * 0.8); // Scale text size with pulse
        textAlign(CENTER, CENTER);
        text(this.icon, 0, currentSize * 0.05); // Slight Y offset for centering

        pop();
    }

    hitsShip(ship) {
         let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y);
         // Check against ship's effective radius (including shields)
         let shipRadius;
         if (ship.tempShieldActive) shipRadius = ship.shieldVisualRadius * 1.1;
         else if (ship.shieldCharges > 0) shipRadius = ship.shieldVisualRadius;
         else shipRadius = ship.size * 0.5;
         return d < this.size * 0.7 + shipRadius; // Use 70% of visual size for collision
    }

    isOffscreen() {
        let margin = this.size * 2;
        return (this.pos.y > height + margin); // Only need to check bottom edge
    }
}


// ==================
// EnemyShip Class
// ==================
class EnemyShip {
    constructor() {
        this.size = 28; // Visual size
        this.pos = createVector();
        this.vel = createVector();
        // Shooting timer
        this.shootCooldown = random(120, 240); // Time between shots (2-4 seconds)
        this.shootTimer = this.shootCooldown; // Initial timer value
        this.bulletSpeed = 3.5 + currentLevel * 0.1; // Bullet speed increases with level

        // Spawn from Top, Left, or Right edges
        let edge = floor(random(3));
        if (edge === 0) { // Top edge
            this.pos.x = random(width);
            this.pos.y = -this.size / 2;
            this.vel.set(random(-0.5, 0.5), random(0.8, 1.5)); // Mostly downwards, slight horizontal drift
        } else if (edge === 1) { // Right edge
            this.pos.x = width + this.size / 2;
            this.pos.y = random(height * 0.5); // Upper half of screen height
            this.vel.set(random(-1.5, -0.8), random(-0.5, 0.5)); // Mostly leftwards, slight vertical drift
        } else { // Left edge
            this.pos.x = -this.size / 2;
            this.pos.y = random(height * 0.5);
            this.vel.set(random(0.8, 1.5), random(-0.5, 0.5)); // Mostly rightwards, slight vertical drift
        }

        // Scale speed based on level, up to max
        let speedScale = min(MAX_ENEMY_SPEED, 1.0 + (currentLevel - 1) * 0.1);
        this.vel.mult(speedScale);

        // Add simple sideways drift for less predictable movement
        this.sidewaysDrift = random(-0.25, 0.25) * speedScale; // Scale drift with base speed
        this.vel.x += this.sidewaysDrift;
    }

    update() {
        this.pos.add(this.vel);

        // Shooting logic
        this.shootTimer--;
        // Only shoot if player ship exists and game is actively playing
        if (this.shootTimer <= 0 && ship && gameState === GAME_STATE.PLAYING) {
            this.shoot();
            // Reset cooldown with variation and level scaling (fires faster at higher levels)
            this.shootCooldown = random(max(40, 120 - currentLevel * 5), max(80, 240 - currentLevel * 10));
            this.shootTimer = this.shootCooldown;
        }

        // No screen wrapping for enemies - they fly off
    }

    shoot() {
        // Simple shot straight down (PI/2 radians)
        let aimAngle = PI / 2; // Downwards
        enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y + this.size * 0.3, aimAngle, this.bulletSpeed));
         /* TODO: Play enemy shoot sound */
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);

        // Simple angular black ship design
        fill(0, 0, 20); // Very dark grey/black body
        stroke(0, 90, 60); // Dull red outline
        strokeWeight(1.8);
        beginShape();
        vertex(0, -this.size * 0.65); // Nose tip
        vertex(this.size * 0.55, this.size * 0.45); // Right wingtip/rear
        vertex(this.size * 0.3, this.size * 0.35); // Right inner engine area
        vertex(-this.size * 0.3, this.size * 0.35); // Left inner engine area
        vertex(-this.size * 0.55, this.size * 0.45); // Left wingtip/rear
        endShape(CLOSE);

        // Simple red "cockpit" light
        fill(0, 100, 100); // Bright red
        noStroke();
        ellipse(0, -this.size * 0.1, 4, 6); // Small oval near the front

        pop();
    }

    isOffscreen() {
        let margin = this.size * 2; // Generous margin
        return (this.pos.y > height + margin || this.pos.y < -margin ||
                this.pos.x < -margin || this.pos.x > width + margin);
    }

    // Collision check with player bullet
    hits(playerBullet) {
        let d = dist(this.pos.x, this.pos.y, playerBullet.pos.x, playerBullet.pos.y);
        return d < this.size / 2 + playerBullet.size / 2; // Simple circle collision
    }

    // Collision check with the player ship (accounts for shields)
    hitsShip(playerShip) {
        let d = dist(this.pos.x, this.pos.y, playerShip.pos.x, playerShip.pos.y);
         // Check against ship's effective radius (including shields)
        let targetRadius;
        if (playerShip.tempShieldActive) targetRadius = playerShip.shieldVisualRadius * 1.1;
        else if (playerShip.shieldCharges > 0) targetRadius = playerShip.shieldVisualRadius;
        else targetRadius = playerShip.size * 0.5;
        // Use slightly smaller collision radius for enemy ship body
        return d < this.size * 0.45 + targetRadius;
    }
}


// ==================
// EnemyBullet Class
// ==================
class EnemyBullet {
    constructor(x, y, angle, speed) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.fromAngle(angle);
        this.vel.mult(speed);
        this.size = 7; // Slightly larger than player bullets
        this.color = color(0, 90, 100); // Red color
    }

    update() {
        this.pos.add(this.vel);
    }

    draw() {
        noStroke();
        // Outer glow effect
        fill(0, 80, 100, 50); // Red, semi-transparent
        ellipse(this.pos.x, this.pos.y, this.size * 1.8, this.size * 1.8); // Larger ellipse for glow

        // Core bullet
        fill(this.color); // Solid red
        ellipse(this.pos.x, this.pos.y, this.size, this.size); // Simple circle
    }

    hitsShip(ship) {
        let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y);
         // Check against ship's effective radius (including shields)
        let targetRadius;
        if (ship.tempShieldActive) targetRadius = ship.shieldVisualRadius * 1.1;
        else if (ship.shieldCharges > 0) targetRadius = ship.shieldVisualRadius;
        else targetRadius = ship.size * 0.5;
        return d < this.size * 0.6 + targetRadius; // Use 60% of bullet size for collision
    }

    isOffscreen() {
        let margin = this.size * 3;
        return (this.pos.y > height + margin || this.pos.y < -margin ||
                this.pos.x < -margin || this.pos.x > width + margin);
    }
}


// ==================
// Nebula Class (Background Element)
// ==================
class Nebula {
    constructor() {
        this.numEllipses = floor(random(10, 20)); // Number of ellipses composing the nebula cloud
        this.ellipses = []; // Stores properties of each ellipse
        this.rotation = random(TWO_PI);
        this.rotationSpeed = random(-0.0004, 0.0004); // Very slow rotation
        this.baseAlpha = random(3, 8); // Overall transparency (very subtle)

        // Define overall size and initial position/velocity
        let overallWidth = random(width * 0.6, width * 1.4);
        let overallHeight = random(height * 0.4, height * 0.7);
        // Start off-screen left or right
        if (random(1) < 0.5) { // Start Left
            this.pos = createVector(-overallWidth / 2, random(height));
            this.vel = createVector(random(0.04, 0.12), random(-0.015, 0.015)); // Moves right slowly
        } else { // Start Right
            this.pos = createVector(width + overallWidth / 2, random(height));
            this.vel = createVector(random(-0.12, -0.04), random(-0.015, 0.015)); // Moves left slowly
        }

        // Define two base colors for the nebula gradient/blend
        let h1 = random(240, 330); // Purple/Pink/Blue range
        let h2 = (h1 + random(-50, 50)) % 360; // Second color nearby hue
        this.color1 = color(h1, random(40, 75), random(15, 45)); // Low saturation/brightness
        this.color2 = color(h2, random(40, 75), random(15, 45));

        // Create individual ellipses within the nebula structure
        for (let i = 0; i < this.numEllipses; i++) {
            this.ellipses.push({
                pos: createVector( // Relative position within the nebula
                    random(-overallWidth * 0.45, overallWidth * 0.45),
                    random(-overallHeight * 0.45, overallHeight * 0.45)
                ),
                w: random(overallWidth * 0.15, overallWidth * 0.7), // Random width
                h: random(overallHeight * 0.15, overallHeight * 0.7), // Random height
                alpha: this.baseAlpha * random(0.6, 1.4) // Individual alpha variation
            });
        }
    }

    update() {
        this.pos.add(this.vel); // Move the entire nebula structure
        this.rotation += this.rotationSpeed; // Rotate the structure
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y); // Move to nebula's center
        rotate(this.rotation); // Apply rotation

        noStroke();
        // Draw each component ellipse
        for (let el of this.ellipses) {
            // Interpolate color based on ellipse's horizontal position within the nebula
            let inter = map(el.pos.x, -width * 0.45, width * 0.45, 0, 1);
            let c = lerpColor(this.color1, this.color2, inter);
            // Apply individual alpha and slight random flicker
            fill(hue(c), saturation(c), brightness(c), el.alpha * random(0.9, 1.1));
            ellipse(el.pos.x, el.pos.y, el.w, el.h); // Draw the ellipse
        }
        pop();
    }

    isOffscreen() {
        // Check if the nebula is completely off-screen using a rough bounding radius
        let maxDimension = max(
            this.ellipses.reduce((maxR, el) => max(maxR, el.pos.mag() + max(el.w, el.h) / 2), 0),
            width * 0.7 // Ensure minimum check radius
        );
        let margin = maxDimension; // Use the calculated max dimension as margin
        return (this.pos.x < -margin || this.pos.x > width + margin ||
                this.pos.y < -margin || this.pos.y > height + margin);
    }
}
