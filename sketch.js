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
// - ADDED: Multiple Enemy Types:
//   - Basic Enemy: Shoots straight.
//   - Kamikaze Enemy: Homes in on player, explodes on impact.
//   - Turret Enemy: Slow/Stationary, fires patterns (bursts/spirals).
//   - Swarmer Enemy: Small, appears in groups, simple movement.
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
// - Added simple sideways drift to enemy movement (Basic Enemy).
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
// - REFACTORED: Enemy logic into separate classes extending BaseEnemy.
// - MODIFIED: Title position moved down on Start Screen.
// - MODIFIED: HUD text size increased.
// - MODIFIED: Ship thrust increased for non-mobile (computer) controls.
// --------------------------


// --- Game Objects & State ---
let ship;
let bullets = [];
let asteroids = [];
let particles = [];
let stars = [];
let shootingStars = [];
let potions = [];
let enemyShips = []; // Holds ALL enemy types (Basic, Kamikaze, Turret, Swarmer)
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

// Enemy Types (used in BaseEnemy and spawning) - Though instanceof is used more now
const ENEMY_TYPES = { BASE: 0, KAMIKAZE: 1, TURRET: 2, SWARMER: 3 };


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
// --- Enemy Spawn Rates (Base probabilities, adjusted by level implicitly via total rate increase) ---
let baseEnemySpawnRate = 0.002; // Base rate for ANY enemy
let basicEnemyWeight = 10; // Relative chance weights
let kamikazeWeight = 0; // Starts appearing later
let turretWeight = 0;
let swarmerWeight = 0;
// --- Other Spawn Rates ---
let powerUpSpawnRate = 0.0015;
let potionSpawnRate = 0.001;
let nebulaSpawnRate = 0.0005;
let shootingStarSpawnRate = 0.001;
// --- Other Settings ---
let initialAsteroids = 5;
let minAsteroidSize = 15;
const SHIELD_POINTS_THRESHOLD = 50;
const MAX_SHIELD_CHARGES = 1;
const SHAPE_CHANGE_POINTS_THRESHOLD = 100;
const MAX_ASTEROID_SPEED = 4.0;
const MAX_ENEMY_SPEED_BASIC = 3.0; // Max speed for basic enemies
const MAX_ENEMY_SPEED_KAMIKAZE = 5.5; // Max speed for kamikazes
const MAX_ENEMY_SPEED_SWARMER = 2.5; // Max speed for swarmers


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


// --- Combo System Variables ---
let comboCounter = 0;
let comboTimer = 0;
let maxComboReached = 0;
const COMBO_TIMEOUT_DURATION = 180; // 3 seconds at 60fps
let showComboText = false;
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
    textFont('monospace');

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

function setDifficultyForLevel(level) {
    let effectiveLevel = min(level, MAX_LEVEL);
    let mobileFactor = isMobile ? 0.7 : 1.0;

    // Asteroid spawning scales up
    baseAsteroidSpawnRate = (0.009 + (effectiveLevel - 1) * 0.0015) * mobileFactor;
    currentAsteroidSpawnRate = baseAsteroidSpawnRate;

    // Base chance for ANY enemy to spawn scales up
    baseEnemySpawnRate = (0.002 + (effectiveLevel - 1) * 0.0006) * mobileFactor;

    // Adjust enemy type weights based on level
    basicEnemyWeight = 10; // Always present
    kamikazeWeight = (effectiveLevel >= 2) ? 3 + effectiveLevel : 0; // Appear Lvl 2+, more common later
    turretWeight = (effectiveLevel >= 5) ? 2 + floor(effectiveLevel / 2) : 0; // Appear Lvl 5+, slightly more common later
    swarmerWeight = (effectiveLevel >= 3) ? 4 + effectiveLevel : 0; // Appear Lvl 3+, more common later
}

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
function displayStartScreen() {
    let titleText = "Space-Chase";
    let titleSize = isMobile ? 56 : 72;
    textSize(titleSize);
    textAlign(CENTER, CENTER);
    let totalWidth = textWidth(titleText);
    let startX = width / 2 - totalWidth / 2;
    let currentX = startX;
    // --- MODIFICATION: Moved title down ---
    let titleY = height / 2.5; // Original was height / 3
    // -------------------------------------
    for (let i = 0; i < titleText.length; i++) {
        let char = titleText[i];
        let charWidth = textWidth(char);
        let yOffset = sin(frameCount * 0.1 + i * 0.7) * (isMobile ? 7 : 10);
        fill(0, 0, 0, 50);
        text(char, currentX + charWidth / 2 + (isMobile ? 3 : 4), titleY + yOffset + (isMobile ? 3 : 4));
        let h = (frameCount * 4 + i * 25) % 360;
        fill(h, 95, 100);
        text(char, currentX + charWidth / 2, titleY + yOffset);
        currentX += charWidth;
    }
    stroke(uiBorderColor);
    strokeWeight(1.5);
    line(width * 0.2, titleY + 80, width * 0.8, titleY + 80);
    line(width * 0.3, titleY + 90, width * 0.7, titleY + 90);
    let instructionSize = isMobile ? 20 : 24;
    textSize(instructionSize);
    fill(uiTextColor);
    textAlign(CENTER, CENTER);
    let startInstruction = isMobile ? "Tap Screen to Start" : "Press Enter to Start";
    let instrWidth = textWidth(startInstruction) + 40;
    fill(uiPanelColor);
    stroke(uiBorderColor);
    strokeWeight(1);
    rect(width / 2 - instrWidth / 2, height / 2 + 50, instrWidth, instructionSize + 20, 5);
    noStroke();
    fill(uiTextColor);
    text(startInstruction, width / 2, height / 2 + 60 + instructionSize / 2);
}
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
        for (let e of enemyShips) e.draw(); // Draw all enemy types
        for (let eb of enemyBullets) eb.draw();
        for (let pt of potions) pt.draw();
        for (let pu of powerUps) pu.draw();
        displayHUD();
        return;
    }

    if (!ship) return;

    // --- Updates ---
    if (screenShakeDuration > 0) screenShakeDuration--;
    if (screenShakeDuration <= 0) screenShakeIntensity = 0;

    ship.update();
    ship.draw();

    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        bullets[i].draw();
        if (bullets[i].isOffscreen()) { bullets.splice(i, 1); }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].isDead()) { particles.splice(i, 1); }
    }

    // Update and draw ALL enemies
    for (let i = enemyShips.length - 1; i >= 0; i--) {
        enemyShips[i].update(); // Polymorphism: calls update() of specific enemy type
        enemyShips[i].draw();   // Polymorphism: calls draw() of specific enemy type
        if (enemyShips[i].isOffscreen()) {
            enemyShips.splice(i, 1);
        }
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].update();
        enemyBullets[i].draw();
        if (enemyBullets[i].isOffscreen()) { enemyBullets.splice(i, 1); }
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
        if (!asteroids[i]) continue;
        asteroids[i].update();
        asteroids[i].draw();
    }

    // --- Handle Game Mechanics ---
    handlePotions();
    handleCollisions(); // Now handles different enemy types
    handlePowerUps();

    // --- Combo Timer Logic ---
    if (comboTimer > 0) {
        comboTimer--;
        if (comboTimer <= 0) {
            if (maxComboReached >= 3) {
                let bonusPoints = maxComboReached * 5;
                let bonusMoney = floor(maxComboReached / 3);
                points += bonusPoints;
                money += bonusMoney;
                infoMessage = `Combo Bonus: +${bonusPoints} PTS, +$${bonusMoney}! (Max: x${maxComboReached})`;
                infoMessageTimeout = 120;
                /* TODO: Play combo end sound? */
            }
            comboCounter = 0;
            maxComboReached = 0;
            showComboText = false;
            comboTextTimeout = 0;
        }
    }
    if (comboTextTimeout > 0) {
         comboTextTimeout--;
         if (comboTextTimeout <= 0) { showComboText = false; }
    }

    // --- Spawning Logic (Only during active play) ---
    if (gameState === GAME_STATE.PLAYING) {
        // Time-based difficulty increase (affects overall spawn rates)
        let timeFactor = floor(frameCount / 1800) * 0.0005; // Increases slightly every 30 seconds
        currentAsteroidSpawnRate = baseAsteroidSpawnRate + timeFactor;
        let currentTotalEnemySpawnRate = baseEnemySpawnRate + timeFactor * 0.5;

        // --- Entity Limits ---
        let maxAsteroidsAllowed = min(40, 15 + currentLevel * 3);
        let maxEnemiesAllowed = min(15, 5 + currentLevel * 2); // Increased max enemies slightly
        let maxPotionsAllowed = 2;
        let maxPowerUpsAllowed = 1;
        let maxNebulasAllowed = 3;

        // --- Spawning ---
        // Asteroids
        if (random(1) < currentAsteroidSpawnRate && asteroids.length < maxAsteroidsAllowed) {
            asteroids.push(new Asteroid());
        }

        // Enemies (Weighted Random Selection)
        if (random(1) < currentTotalEnemySpawnRate && enemyShips.length < maxEnemiesAllowed) {
            let totalWeight = basicEnemyWeight + kamikazeWeight + turretWeight + swarmerWeight;
            let typeRoll = random(totalWeight);

            if (typeRoll < swarmerWeight && currentLevel >= 3) { // Check Swarmers first (spawn multiples)
                let swarmCount = floor(random(5, 10));
                 let spawnX = random(width * 0.2, width * 0.8); // Spawn near middle top
                 let spawnY = -20;
                 for (let i = 0; i < swarmCount; i++) {
                     if (enemyShips.length < maxEnemiesAllowed) {
                         let offsetPos = createVector(spawnX + random(-50, 50), spawnY + random(-30, 30));
                         enemyShips.push(new SwarmerEnemy(offsetPos.x, offsetPos.y));
                     } else break; // Stop spawning swarm if max enemies reached
                 }
            } else if (typeRoll < swarmerWeight + turretWeight && currentLevel >= 5) {
                enemyShips.push(new TurretEnemy());
            } else if (typeRoll < swarmerWeight + turretWeight + kamikazeWeight && currentLevel >= 2) {
                enemyShips.push(new KamikazeEnemy());
            } else { // Default to Basic Enemy
                 enemyShips.push(new BasicEnemy());
            }
        }

        // Potions
        if (random(1) < potionSpawnRate && potions.length < maxPotionsAllowed) {
            potions.push(new HealthPotion());
        }
        // Power-ups
        if (random(1) < powerUpSpawnRate && powerUps.length < maxPowerUpsAllowed) {
            let type = floor(random(NUM_POWERUP_TYPES));
            powerUps.push(new PowerUp(type));
        }
        // Nebulas
        if (random(1) < nebulaSpawnRate && nebulas.length < maxNebulasAllowed) {
            nebulas.push(new Nebula());
        }
    }

    // --- Display HUD and Combo Text ---
    if (gameState === GAME_STATE.PLAYING) {
        displayHUD();
        displayComboText();
    }
}


// --- Collision and Pickup Handling ---
function handlePowerUps() {
    if (gameState !== GAME_STATE.PLAYING || isPaused) { for (let i = powerUps.length - 1; i >= 0; i--) { powerUps[i].draw(); } return; }
    if (!ship) return;

    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].update();
        powerUps[i].draw();
        if (powerUps[i].hitsShip(ship)) {
            let powerUpType = powerUps[i].type;
            let pickupPos = powerUps[i].pos.copy();
            let pickupColor = powerUps[i].color;
            powerUps.splice(i, 1);
            createParticles(pickupPos.x, pickupPos.y, 25, pickupColor, 4, 1.8, 0.8);

            switch (powerUpType) {
                case POWERUP_TYPES.TEMP_SHIELD: ship.tempShieldActive = true; infoMessage = "TEMPORARY SHIELD!"; createParticles(ship.pos.x, ship.pos.y, 20, color(45, 90, 100)); break; /* TODO: Play sound */
                case POWERUP_TYPES.RAPID_FIRE: ship.rapidFireTimer = 300; infoMessage = "RAPID FIRE!"; createParticles(ship.pos.x, ship.pos.y, 20, color(120, 90, 100)); break; /* TODO: Play sound */
                case POWERUP_TYPES.EMP_BURST: infoMessage = "EMP BURST!"; createParticles(ship.pos.x, ship.pos.y, 60, color(210, 100, 100), 12, 3.5, 1.2); for (let k = asteroids.length - 1; k >= 0; k--) { createParticles(asteroids[k].pos.x, asteroids[k].pos.y, 15, asteroids[k].color, 3, 1.5); } asteroids = []; for (let k = enemyShips.length - 1; k >= 0; k--) { createParticles(enemyShips[k].pos.x, enemyShips[k].pos.y, 20, enemyShips[k].getExplosionColor()); } enemyShips = []; break; /* TODO: Play sound */
            }
            infoMessageTimeout = 120;
        } else if (powerUps[i].isOffscreen()) { powerUps.splice(i, 1); }
    }
}
function handleCollisions() {
    if (gameState !== GAME_STATE.PLAYING || !ship || isPaused) return;

    // --- Player Bullet Collisions ---
    // Asteroids vs Bullets
    for (let i = asteroids.length - 1; i >= 0; i--) {
        if (!asteroids[i]) continue;
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (asteroids[i] && bullets[j] && asteroids[i].hits(bullets[j])) {
                /* TODO: Play asteroid hit sound */
                createParticles(bullets[j].pos.x, bullets[j].pos.y, floor(random(3, 6)), color(60, 40, 100), 2, 0.8, 0.7); // Bullet sparks

                let oldPoints = points;
                let asteroidSizeValue = asteroids[i].size;
                points += floor(map(asteroidSizeValue, minAsteroidSize, 80, 5, 15));
                money += 2;

                // --- COMBO ---
                comboCounter++;
                comboTimer = COMBO_TIMEOUT_DURATION;
                maxComboReached = max(maxComboReached, comboCounter);
                if (comboCounter >= 2) { showComboText = true; comboTextTimeout = 60; }
                /* TODO: Play combo tick sound? */

                // Shield Gain Check
                let shieldsToAdd = floor(points / SHIELD_POINTS_THRESHOLD) - floor(oldPoints / SHIELD_POINTS_THRESHOLD);
                if (shieldsToAdd > 0 && ship.shieldCharges < MAX_SHIELD_CHARGES) { let actualAdded = ship.gainShields(shieldsToAdd); if (actualAdded > 0) { infoMessage = `+${actualAdded} SHIELD CHARGE(S)!`; infoMessageTimeout = 90; /* TODO: Play shield gain sound */ } }

                // Ship Shape Change Check
                let oldShapeLevel = floor(oldPoints / SHAPE_CHANGE_POINTS_THRESHOLD); let newShapeLevel = floor(points / SHAPE_CHANGE_POINTS_THRESHOLD); if (newShapeLevel > oldShapeLevel) { ship.changeShape(newShapeLevel); infoMessage = "SHIP SHAPE EVOLVED!"; infoMessageTimeout = 120; /* TODO: Play shape change sound */ }

                // Asteroid Destruction & Splitting
                let asteroidPos = asteroids[i].pos.copy();
                let asteroidColor = asteroids[i].color;
                asteroids.splice(i, 1);
                bullets.splice(j, 1);
                createParticles(asteroidPos.x, asteroidPos.y, floor(asteroidSizeValue / 2.5), asteroidColor, null, 1.2, 1.1); // Asteroid explosion
                /* TODO: Play asteroid explosion sound */
                if (asteroidSizeValue > minAsteroidSize * 2) { let newSize = asteroidSizeValue * 0.6; let splitSpeedMultiplier = random(0.8, 2.0); let vel1 = p5.Vector.random2D().mult(splitSpeedMultiplier); let vel2 = p5.Vector.random2D().mult(splitSpeedMultiplier); asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel1)); asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel2)); }

                // --- Level Up / Win Check ---
                if (currentLevel < MAX_LEVEL && points >= LEVEL_THRESHOLDS[currentLevel]) { /* TODO: Play level complete sound */ points += 100 * currentLevel; money += 25 * currentLevel; gameState = GAME_STATE.UPGRADE_SHOP; infoMessage = `Level ${currentLevel} Cleared!`; infoMessageTimeout = 180; setupShopButtons(); cursor(ARROW); bullets = []; enemyShips = []; enemyBullets = []; powerUps = []; potions = []; comboCounter = 0; comboTimer = 0; maxComboReached = 0; showComboText = false; comboTextTimeout = 0; return; }
                else if (currentLevel === MAX_LEVEL && points >= LEVEL_THRESHOLDS[currentLevel]) { /* TODO: Play win sound */ gameState = GAME_STATE.WIN_SCREEN; infoMessage = ""; infoMessageTimeout = 0; cursor(ARROW); bullets = []; enemyShips = []; enemyBullets = []; powerUps = []; potions = []; asteroids = []; particles = []; comboCounter = 0; comboTimer = 0; maxComboReached = 0; showComboText = false; comboTextTimeout = 0; return; }
                break; // Exit inner loop (bullet gone)
            }
        }
    }

    // Enemies vs Bullets (All enemy types)
    for (let i = enemyShips.length - 1; i >= 0; i--) {
        let enemy = enemyShips[i]; // Reference the enemy
        if (!enemy) continue;

        for (let j = bullets.length - 1; j >= 0; j--) {
            if (bullets[j] && enemy.hits(bullets[j])) { // Use enemy's hit detection
                /* TODO: Play enemy hit sound (maybe type specific?) */
                createParticles(bullets[j].pos.x, bullets[j].pos.y, 5, color(0,0,100), 2); // Bullet impact sparks

                // Enemy takes damage, check if destroyed
                if (enemy.takeDamage(1)) { // Assuming player bullets do 1 damage
                    points += enemy.pointsValue;
                    money += enemy.moneyValue;

                    // --- COMBO ---
                    comboCounter++;
                    comboTimer = COMBO_TIMEOUT_DURATION;
                    maxComboReached = max(maxComboReached, comboCounter);
                    if (comboCounter >= 2) { showComboText = true; comboTextTimeout = 60; }
                     /* TODO: Play combo tick sound? */

                    // Create explosion based on enemy properties
                    createParticles(enemy.pos.x, enemy.pos.y, floor(enemy.size * 1.2), enemy.getExplosionColor(), enemy.size * 0.2, 1.3, 1.0);
                     /* TODO: Play enemy death sound */
                    enemyShips.splice(i, 1); // Remove dead enemy
                } else {
                    // Enemy was hit but survived (e.g., Turret)
                    createParticles(enemy.pos.x, enemy.pos.y, 3, enemy.getHitColor(), 2); // Smaller hit spark in enemy color
                }

                bullets.splice(j, 1); // Remove bullet
                break; // Exit inner loop (bullet gone)
            }
        }
    }

    // --- Player Ship Collisions (If not invulnerable) ---
    if (ship.invulnerableTimer <= 0) {
        const takeDamage = (sourceObject, sourceArray, index) => {
            /* TODO: Play player hit sound */
            let gameOver = false;

            // --- Reset Combo on Hit ---
            if (comboCounter > 0) { if (maxComboReached >= 3) { let bonusPoints = maxComboReached * 5; let bonusMoney = floor(maxComboReached / 3); points += bonusPoints; money += bonusMoney; infoMessage = `Combo Broken! Bonus: +${bonusPoints} PTS, +$${bonusMoney} (Max: x${maxComboReached})`; infoMessageTimeout = 120; } comboCounter = 0; comboTimer = 0; maxComboReached = 0; showComboText = false; comboTextTimeout = 0; }

            // --- Damage Logic (Shields/Life) ---
            if (ship.tempShieldActive) { ship.tempShieldActive = false; createParticles(ship.pos.x, ship.pos.y, 40, color(45, 100, 100), 5, 2.0); infoMessage = "TEMPORARY SHIELD LOST!"; infoMessageTimeout = 90; /* TODO: Play temp shield break sound */ if (sourceObject && sourceArray && index !== undefined) { createParticles(sourceObject.pos.x, sourceObject.pos.y, 5, color(45,90,100)); if (sourceObject instanceof EnemyBullet) { sourceArray.splice(index, 1); } } }
            else if (ship.shieldCharges > 0) { ship.loseShield(); createParticles(ship.pos.x, ship.pos.y, 35, color(180, 80, 100), 4, 1.8); /* TODO: Play shield break sound */ if (sourceObject && sourceArray && index !== undefined) { createParticles(sourceObject.pos.x, sourceObject.pos.y, 5, color(180,80,100)); if (sourceObject instanceof EnemyBullet) { sourceArray.splice(index, 1); } } }
            else { /* TODO: Play life lost sound */ lives--; createParticles(ship.pos.x, ship.pos.y, 40, color(0, 90, 100), 5, 2.2); screenShakeIntensity = 7; screenShakeDuration = 20; if (lives <= 0) { gameState = GAME_STATE.GAME_OVER; /* TODO: Play game over sound */ infoMessage = ""; infoMessageTimeout = 0; cursor(ARROW); gameOver = true; } else { ship.setInvulnerable(); }
                // Destroy the object that hit the player (if applicable and player lost life)
                if (sourceObject && sourceArray && index !== undefined) {
                    let explosionColor = (sourceObject.getExplosionColor) ? sourceObject.getExplosionColor() : (sourceObject.color || color(0,0,50));
                    let particleCount = sourceObject.size ? floor(sourceObject.size * 1.2) : 20; // Scale particles with size
                    if (sourceObject instanceof EnemyBullet) { particleCount = 8; }
                    createParticles(sourceObject.pos.x, sourceObject.pos.y, particleCount, explosionColor, sourceObject.size * 0.2);
                     // Only splice if the source is meant to be destroyed on impact (asteroids, enemy bullets, potentially basic/swarmer enemies)
                     // Kamikazes handle their own destruction later if they hit a shield.
                     if (!(sourceObject instanceof KamikazeEnemy)) {
                        sourceArray.splice(index, 1);
                     }
                }
            }
            return gameOver;
        };

        // Check Asteroid Collisions
        for (let i = asteroids.length - 1; i >= 0; i--) {
            if (asteroids[i] && asteroids[i].hitsShip(ship)) { if (takeDamage(asteroids[i], asteroids, i)) return; break; }
        }
        // Check Enemy Collisions (All Types)
        if (gameState === GAME_STATE.PLAYING) {
             for (let i = enemyShips.length - 1; i >= 0; i--) {
                 let enemy = enemyShips[i];
                 if (enemy && enemy.hitsShip(ship)) {
                     let isKamikaze = enemy instanceof KamikazeEnemy;
                     if (takeDamage(enemy, enemyShips, i)) return; // Game Over

                     // Special case: Kamikaze hits a shield/tempshield and survives the takeDamage call. Destroy it now.
                     if (isKamikaze && enemyShips[i] === enemy) { // Check it wasn't already removed by takeDamage
                          createParticles(enemy.pos.x, enemy.pos.y, floor(enemy.size * 1.5), enemy.getExplosionColor(), enemy.size * 0.3, 1.5, 1.2);
                          /* TODO: Play Kamikaze explosion sound */
                          enemyShips.splice(i, 1);
                     }
                     break; // Ship was hit, move to next frame
                 }
             }
        }
         // Check Enemy Bullet Collisions
         if (gameState === GAME_STATE.PLAYING) {
             for (let i = enemyBullets.length - 1; i >= 0; i--) {
                 if (enemyBullets[i] && enemyBullets[i].hitsShip(ship)) { if (takeDamage(enemyBullets[i], enemyBullets, i)) return; break; }
             }
         }
    }
}
function handlePotions() {
    if (gameState !== GAME_STATE.PLAYING || isPaused) { for (let i = potions.length - 1; i >= 0; i--) { potions[i].draw(); } return; }
    if (!ship) return;
    for (let i = potions.length - 1; i >= 0; i--) {
        potions[i].update();
        potions[i].draw();
        if (potions[i].hitsShip(ship)) { /* TODO: Play potion pickup sound */ createParticles(potions[i].pos.x, potions[i].pos.y, 20, color(0, 80, 100), 4, 1.5); if (lives < MAX_LIVES) { lives++; infoMessage = "+1 LIFE!"; infoMessageTimeout = 90; } else { points += 25; infoMessage = "+25 POINTS (MAX LIVES)!"; infoMessageTimeout = 90; } potions.splice(i, 1); }
        else if (potions[i].isOffscreen()) { potions.splice(i, 1); }
    }
}

// --- Background Drawing Functions ---
function drawBackgroundAndStars() { for(let y=0; y < height; y++){ let inter = map(y, 0, height, 0, 1); let c = lerpColor(currentTopColor, currentBottomColor, inter); stroke(c); line(0, y, width, y); } noStroke(); for (let i = nebulas.length - 1; i >= 0; i--) { if (gameState === GAME_STATE.PLAYING && !isPaused) nebulas[i].update(); nebulas[i].draw(); if (nebulas[i].isOffscreen()) { nebulas.splice(i, 1); } } drawBlackHole(); drawGalaxy(); if (planetVisible) { drawPlanet(); } for (let i = shootingStars.length - 1; i >= 0; i--) { if (gameState === GAME_STATE.PLAYING && !isPaused) shootingStars[i].update(); shootingStars[i].draw(); if (shootingStars[i].isDone()) { shootingStars.splice(i, 1); } } for (let star of stars) { if (gameState === GAME_STATE.PLAYING && !isPaused) star.update(); star.draw(); } }
function drawBlackHole() { push(); let bhX = width * 0.8; let bhY = height * 0.2; let bhSize = width * 0.05; fill(0); noStroke(); ellipse(bhX, bhY, bhSize * 1.1, bhSize * 1.1); let ringCount = 7; let maxRingSize = bhSize * 3.5; let minRingSize = bhSize * 1.2; noFill(); let slowVariation = sin(frameCount * 0.01); for (let i = 0; i < ringCount; i++) { let sizeFactor = lerp(0.95, 1.05, (sin(frameCount * 0.02 + i * 0.5) + 1) / 2); let size = lerp(minRingSize, maxRingSize, i / (ringCount - 1)) * sizeFactor; let hue = lerp(0, 60, i / (ringCount - 1)) + sin(frameCount * 0.03 + i) * 5; let alpha = map(i, 0, ringCount - 1, 50, 3); let sw = map(i, 0, ringCount - 1, 1.5, 5); strokeWeight(sw); stroke(hue, 90, 90, alpha); ellipse(bhX, bhY, size, size); } pop(); }
function drawGalaxy() { push(); let centerX = width / 2; let centerY = height / 2; let baseHue1 = 270; let baseHue2 = 200; let alphaVal = 2.5; let angle = frameCount * 0.0003; translate(centerX, centerY); rotate(angle); translate(-centerX, -centerY); noStroke(); fill(baseHue1, 50, 60, alphaVal); ellipse(centerX - width * 0.1, centerY - height * 0.1, width * 1.3, height * 0.35); fill(baseHue2, 60, 70, alphaVal); ellipse(centerX + width * 0.15, centerY + height * 0.05, width * 1.2, height * 0.45); fill((baseHue1 + baseHue2) / 2, 55, 65, alphaVal * 0.9); ellipse(centerX, centerY, width * 1.0, height * 0.55); pop(); }
function drawPlanet() { push(); translate(planetPos.x, planetPos.y); noStroke(); fill(planetBaseColor); ellipse(0, 0, planetSize, planetSize); fill(planetDetailColor1); arc(0, 0, planetSize, planetSize, PI * 0.1, PI * 0.6, OPEN); arc(0, 0, planetSize * 0.8, planetSize * 0.8, PI * 0.7, PI * 1.2, OPEN); fill(planetDetailColor2); arc(0, 0, planetSize * 0.9, planetSize * 0.9, PI * 1.3, PI * 1.9, OPEN); noFill(); strokeWeight(planetSize * 0.06); stroke(hue(planetBaseColor), 20, 100, 20); ellipse(0, 0, planetSize * 1.06, planetSize * 1.06); pop(); }

// --- HUD & Info Messages ---
function displayHUD() {
    let hudH = isMobile ? 45 : 60;
    let topMargin = 5;
    let sideMargin = 10;
    let iconSize = isMobile ? 16 : 20;
    // --- MODIFICATION: Increased HUD text size ---
    let textSizeVal = isMobile ? 18 : 22; // Original was 14 : 18
    // ------------------------------------------
    let spacing = isMobile ? 8 : 12;
    let bottomMargin = 10;

    fill(uiPanelColor);
    stroke(uiBorderColor);
    strokeWeight(1.5);
    rect(0, 0, width, hudH);

    textSize(textSizeVal); // Uses the modified size
    fill(uiTextColor);
    textAlign(LEFT, CENTER);
    let currentX = sideMargin;
    text(`LEVEL: ${currentLevel}`, currentX, hudH / 2);
    currentX += textWidth(`LEVEL: ${currentLevel}`) + spacing * 2;
    text(`PTS: ${points}`, currentX, hudH / 2);
    currentX += textWidth(`PTS: ${points}`) + spacing * 2;
    fill(uiHighlightColor);
    text(`$: ${money}`, currentX, hudH / 2);
    currentX += textWidth(`$: ${money}`) + spacing * 2;
    fill(color(0, 80, 100));
    text(`♥: ${lives}`, currentX, hudH / 2);
    currentX += textWidth(`♥: ${lives}`) + spacing * 2;
    fill(color(180, 70, 100));
    text(`🛡: ${ship.shieldCharges}`, currentX, hudH / 2);

    textAlign(RIGHT, BOTTOM);
    fill(uiTextColor);
    // --- MODIFICATION: Adjusted size for bottom-right text ---
    textSize(textSizeVal * 0.8); // Original was textSizeVal * 0.9
    // ------------------------------------------------------
    text(`RATE:${ship.fireRateLevel} SPREAD:${ship.spreadShotLevel}`, width - sideMargin, height - bottomMargin);
}
function displayInfoMessage() { let msgSize = isMobile ? 15 : 18; textSize(msgSize); textAlign(CENTER, CENTER); let msgWidth = textWidth(infoMessage); let padding = 10; let boxH = msgSize + padding; let boxY = height - boxH - (isMobile? 15 : 30); fill(uiPanelColor); stroke(uiBorderColor); strokeWeight(1.5); rect(width/2 - msgWidth/2 - padding, boxY, msgWidth + padding*2, boxH, 5); fill(uiTextColor); noStroke(); text(infoMessage, width / 2, boxY + boxH / 2); }
function displayComboText() { if (showComboText && comboCounter >= 2) { let comboSize = isMobile ? 28 : 36; let comboY = height * 0.25; let alpha = map(comboTextTimeout, 0, 60, 0, 100); push(); textAlign(CENTER, CENTER); textSize(comboSize); let scaleFactor = 1.0 + sin(map(comboTextTimeout, 60, 0, 0, PI)) * 0.08; translate(width / 2, comboY); scale(scaleFactor); stroke(0, 0, 0, alpha * 0.8); strokeWeight(4); fill(uiHighlightColor); text(`COMBO x${comboCounter}!`, 0, 0); noStroke(); fill(255); pop(); } }

// --- Game State Control ---
function resetGame() { ship = new Ship(); bullets = []; particles = []; asteroids = []; potions = []; enemyShips = []; enemyBullets = []; powerUps = []; nebulas = []; shootingStars = []; points = 0; money = 0; lives = 3; currentLevel = 1; setDifficultyForLevel(currentLevel); currentTopColor = color(260, 80, 10); currentBottomColor = color(240, 70, 25); lastPlanetAppearanceTime = -Infinity; planetVisible = false; frameCount = 0; infoMessage = ""; infoMessageTimeout = 0; screenShakeDuration = 0; screenShakeIntensity = 0; isPaused = false; levelTransitionFlash = 0; comboCounter = 0; comboTimer = 0; maxComboReached = 0; showComboText = false; comboTextTimeout = 0; cursor(); spawnInitialAsteroids(); }
function startGame() { resetGame(); gameState = GAME_STATE.PLAYING; }
function startNextLevel() { if (gameState !== GAME_STATE.UPGRADE_SHOP) return; currentLevel++; setDifficultyForLevel(currentLevel); ship.resetPositionForNewLevel(); asteroids = []; frameCount = 0; infoMessage = `Starting Level ${currentLevel}`; infoMessageTimeout = 90; levelTransitionFlash = 15; spawnInitialAsteroids(); gameState = GAME_STATE.PLAYING; cursor(); }


// --- Input Handling ---
function mousePressed() { if (gameState === GAME_STATE.START_SCREEN) { startGame(); } else if (gameState === GAME_STATE.PLAYING && !isPaused) { ship.shoot(); /* TODO: Play shoot sound */ } else if (gameState === GAME_STATE.UPGRADE_SHOP) { for (let button of shopButtons) { if (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h) { handleShopButtonPress(button.id); break; } } } else if (gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN_SCREEN) { startGame(); } }
function keyPressed() { if (keyCode === ESCAPE && gameState === GAME_STATE.PLAYING) { isPaused = !isPaused; if (isPaused) cursor(ARROW); else cursor(); } else if (gameState === GAME_STATE.START_SCREEN) { if (keyCode === ENTER || keyCode === RETURN) { startGame(); } } else if (gameState === GAME_STATE.PLAYING && !isPaused) { if (keyCode === 32) { ship.shoot(); /* TODO: Play shoot sound */ return false; } } else if (gameState === GAME_STATE.UPGRADE_SHOP) { if (keyCode === ENTER || keyCode === RETURN) { handleShopButtonPress('nextLevel'); } } else if (gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN_SCREEN) { if (keyCode === ENTER || keyCode === RETURN) { startGame(); } } }
function touchStarted() { if (touches.length === 0) return false; let touchX = touches[0].x; let touchY = touches[0].y; if (gameState === GAME_STATE.START_SCREEN) { startGame(); return false; } else if (gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN_SCREEN) { startGame(); return false; } else if (gameState === GAME_STATE.UPGRADE_SHOP) { for (let button of shopButtons) { if (touchX > button.x && touchX < button.x + button.w && touchY > button.y && touchY < button.y + button.h) { handleShopButtonPress(button.id); return false; } } return false; } else if (gameState === GAME_STATE.PLAYING && !isPaused) { ship.shoot(); /* TODO: Play shoot sound */ return false; } return false; }
function handleShopButtonPress(buttonId) { if (gameState !== GAME_STATE.UPGRADE_SHOP) return; if (buttonId === 'nextLevel') { startNextLevel(); /* TODO: Play sound */ } else { let success = ship.attemptUpgrade(buttonId); if (success) { /* TODO: Play sound */ let button = shopButtons.find(b => b.id === buttonId); if(button) { createParticles(button.x + button.w / 2, button.y + button.h / 2, 20, color(120, 80, 100), 6, 2.0, 0.8); } } else { /* TODO: Play sound */ let cost = ship.getUpgradeCost(buttonId); if (cost !== "MAX" && money < cost) { infoMessage = "Not enough money!"; infoMessageTimeout = 60; } else if (cost === "MAX") { infoMessage = "Upgrade Maxed Out!"; infoMessageTimeout = 60; } } } }
function windowResized() { resizeCanvas(windowWidth, windowHeight); createStarfield(200); if (gameState === GAME_STATE.UPGRADE_SHOP || gameState === GAME_STATE.WIN_SCREEN || gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.PAUSE_SCREEN ) { /* Potentially re-setup buttons or panel sizes if needed */ } if (gameState === GAME_STATE.UPGRADE_SHOP) { setupShopButtons(); } }




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
        this.thrust = 0.38; // Base thrust value
        this.touchThrustMultiplier = 1.15;
        this.friction = 0.975;
        this.maxSpeed = 9.5;
        this.size = 30;
        this.cockpitColor = color(180, 100, 100);
        this.baseEngineColor1 = color(30, 100, 100);
        this.baseEngineColor2 = color(0, 100, 100);
        this.finColor = color(220, 60, 70);
        this.detailColor = color(0, 0, 60);
        this.shapeState = 0;
        this.shootCooldown = 0;
        this.baseShootDelay = 15;
        this.shootDelayPerLevel = 2;
        this.shieldCharges = 0;
        this.shieldVisualRadius = this.size * 1.2;
        this.invulnerableTimer = 0;
        this.invulnerabilityDuration = 120;
        this.maxLevel = 5;
        this.fireRateLevel = 0;
        this.spreadShotLevel = 0;
        this.baseUpgradeCost = 30;
        this.costMultiplier = 2.0;
        this.rapidFireTimer = 0;
        this.tempShieldActive = false;
        this.hoverOffset = 0;
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
        if (this.rapidFireTimer > 0) {
            return 2; // Rapid fire override
        } else {
            // Calculate delay based on upgrade level
            return max(3, this.baseShootDelay - (this.fireRateLevel * this.shootDelayPerLevel));
        }
    }

    getUpgradeCost(upgradeType) {
        let level;
        if (upgradeType === 'fireRate') {
            level = this.fireRateLevel;
            if (level >= this.maxLevel) return "MAX";
            // Calculate cost based on level
            return floor(this.baseUpgradeCost * pow(this.costMultiplier, level));
        } else if (upgradeType === 'spreadShot') {
            level = this.spreadShotLevel;
            if (level >= this.maxLevel) return "MAX";
            // Calculate cost based on level
            return floor(this.baseUpgradeCost * pow(this.costMultiplier, level));
        } else {
            return Infinity; // Should not happen
        }
    }

    attemptUpgrade(upgradeType) {
        let cost = this.getUpgradeCost(upgradeType);
        if (typeof cost !== 'number') return false; // Already MAX or invalid type

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
            money -= cost;
            if (upgradeType === 'fireRate') this.fireRateLevel++;
            else if (upgradeType === 'spreadShot') this.spreadShotLevel++;
            return true; // Upgrade successful
        } else {
            return false; // Cannot afford or already maxed
        }
    }

     resetPositionForNewLevel() {
        this.pos.set(width / 2, height - 50);
        this.vel.set(0, 0);
        this.invulnerableTimer = 60; // Brief invulnerability at level start
        this.rapidFireTimer = 0; // Reset powerups
        this.tempShieldActive = false;
     }

    // --- MODIFIED Ship.update method ---
    update() {
        if (this.invulnerableTimer > 0) { this.invulnerableTimer--; }
        if (this.rapidFireTimer > 0) { this.rapidFireTimer--; }
        if (this.shootCooldown > 0) { this.shootCooldown--; }
        this.hoverOffset = sin(frameCount * 0.05) * 2;

        let isTouching = isMobile && touches.length > 0;
        let acceleration = createVector(0, 0);
        let applyThrustParticles = false;

        if (isTouching) {
            // --- Mobile touch controls (remains the same) ---
            let touchPos = createVector(touches[0].x, touches[0].y);
            let direction = p5.Vector.sub(touchPos, this.pos);
            if (direction.magSq() > (this.size * 0.5) * (this.size * 0.5)) {
                direction.normalize();
                let targetVel = direction.copy().mult(this.maxSpeed * this.touchThrustMultiplier);
                this.vel.lerp(targetVel, 0.15);
                applyThrustParticles = this.vel.magSq() > 0.1;
            } else {
                this.vel.mult(this.friction);
            }
        } else {
            // --- Keyboard controls ---
            // Apply more thrust on computer
            let currentThrust = this.thrust;
            if (!isMobile) {
                currentThrust *= 1.5; // Increase thrust by 50% for computer (adjust 1.5 as needed)
            }

            let movingUp = keyIsDown(UP_ARROW) || keyIsDown(87); // W
            let movingDown = keyIsDown(DOWN_ARROW) || keyIsDown(83); // S
            let movingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65); // A
            let movingRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68); // D

            // Use currentThrust instead of this.thrust
            if (movingUp) { acceleration.y -= currentThrust; applyThrustParticles = true;}
            if (movingDown) { acceleration.y += currentThrust; } // No thrust particles for moving down/backwards
            if (movingLeft) { acceleration.x -= currentThrust; applyThrustParticles = true;}
            if (movingRight) { acceleration.x += currentThrust; applyThrustParticles = true;}

            this.vel.add(acceleration);
            this.vel.mult(this.friction);
        }

        // Apply thrust particles (remains the same)
        if (applyThrustParticles && frameCount % 3 === 0) {
            let thrustColor = lerpColor(this.baseEngineColor1, color(60, 100, 100), this.fireRateLevel / this.maxLevel);
            createParticles(this.pos.x, this.pos.y + this.size * 0.55, 1, thrustColor, 3, 1.5, 0.5);
        }

        // Limit speed and update position (remains the same)
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);

        // Constrain position (remains the same)
        let margin = this.size * 0.7;
        this.pos.x = constrain(this.pos.x, margin, width - margin);
        this.pos.y = constrain(this.pos.y, margin, height - margin);
    }
    // --- End of MODIFIED Ship.update method ---


    shoot() {
        if (this.shootCooldown <= 0) {
            let originY = this.pos.y - this.size * 0.6 + this.hoverOffset; // Adjust for hover
            let originPoints = [createVector(this.pos.x, originY)]; // Default single shot origin
            let numShots = 1;
            let spreadAngle = 0;

            // Determine origins, number of shots, and spread based on upgrade level
             if (this.spreadShotLevel >= 1 && this.spreadShotLevel <= 2) { // 3 shots, narrow spread
                let offset = this.size * 0.15;
                originPoints = [
                    createVector(this.pos.x - offset, originY + 5), // Slightly lower side shots
                    createVector(this.pos.x, originY),
                    createVector(this.pos.x + offset, originY + 5)
                ];
                numShots = 3;
                spreadAngle = PI / 20;
             } else if (this.spreadShotLevel >= 3 && this.spreadShotLevel <= 4) { // 3 shots, wider spread
                let offset = this.size * 0.2;
                 originPoints = [
                     createVector(this.pos.x - offset, originY + 5),
                     createVector(this.pos.x, originY),
                     createVector(this.pos.x + offset, originY + 5)
                 ];
                numShots = 3;
                spreadAngle = PI / 15;
             } else if (this.spreadShotLevel >= this.maxLevel) { // 5 shots, wider spread
                let offset1 = this.size * 0.25;
                let offset2 = this.size * 0.1;
                 originPoints = [
                     createVector(this.pos.x - offset1, originY + 8), // Outer shots lower
                     createVector(this.pos.x - offset2, originY + 3), // Inner shots slightly lower
                     createVector(this.pos.x, originY),              // Center shot highest
                     createVector(this.pos.x + offset2, originY + 3),
                     createVector(this.pos.x + offset1, originY + 8)
                 ];
                numShots = 5;
                spreadAngle = PI / 12;
             }

            // Create bullets
            for (let i = 0; i < numShots; i++) {
                 let angle = 0;
                 if (numShots > 1) {
                     angle = map(i, 0, numShots - 1, -spreadAngle, spreadAngle);
                 }
                 let origin = originPoints[i] || originPoints[0]; // Use specific origin or default
                 bullets.push(new Bullet(origin.x, origin.y, angle));
            }

            this.shootCooldown = this.currentShootDelay; // Apply cooldown
        }
    }

    draw() {
        // Only draw if not invulnerable or flashing
        if (this.invulnerableTimer <= 0 || (this.invulnerableTimer > 0 && frameCount % 10 < 5) ) {
            push();
            translate(this.pos.x, this.pos.y + this.hoverOffset); // Apply hover offset

             // --- Draw Shields ---
             if (this.tempShieldActive) {
                let tempShieldAlpha = map(sin(frameCount * 0.3), -1, 1, 60, 100);
                let tempShieldHue = 45; // Yellow
                // Inner glow
                fill(tempShieldHue, 90, 100, tempShieldAlpha);
                noStroke();
                ellipse(0, 0, this.shieldVisualRadius * 2.3, this.shieldVisualRadius * 2.3);
                // Outer line
                strokeWeight(2.5);
                stroke(tempShieldHue, 100, 100, tempShieldAlpha + 25);
                noFill();
                ellipse(0, 0, this.shieldVisualRadius * 2.3, this.shieldVisualRadius * 2.3);
             } else if (this.shieldCharges > 0) {
                let shieldAlpha = map(sin(frameCount * 0.2), -1, 1, 50, 90);
                let shieldHue = 180; // Cyan
                // Inner glow
                fill(shieldHue, 80, 100, shieldAlpha);
                noStroke();
                ellipse(0, 0, this.shieldVisualRadius * 2.1, this.shieldVisualRadius * 2.1);
                 // Outer line
                strokeWeight(2);
                stroke(shieldHue, 90, 100, shieldAlpha + 35);
                noFill();
                ellipse(0, 0, this.shieldVisualRadius * 2.1, this.shieldVisualRadius * 2.1);
             }

            // --- Draw Engine Glow ---
            let enginePulseFactor = 1.0 + this.vel.mag() * 0.04; // Pulse more with speed
            let pulseSpeed = (this.rapidFireTimer > 0) ? 0.5 : 0.25; // Faster pulse during rapid fire
            let enginePulse = map(sin(frameCount * pulseSpeed), -1, 1, 0.8, 1.3) * enginePulseFactor;
            let engineSize = this.size * 0.55 * enginePulse;
            let engineBrightness = map(sin(frameCount * 0.35), -1, 1, 85, 100);
            noStroke();
            // Tint engine color based on fire rate upgrade
            let engineColor1 = lerpColor(this.baseEngineColor1, color(60, 90, 100), this.fireRateLevel / this.maxLevel);
            let engineColor2 = lerpColor(this.baseEngineColor2, color(45, 90, 100), this.fireRateLevel / this.maxLevel);
            // Outer glow layers
            for (let i = engineSize * 1.2; i > 0; i -= 3) {
                let alpha = map(i, 0, engineSize * 1.2, 0, 30);
                fill(hue(engineColor2), saturation(engineColor2), engineBrightness, alpha);
                ellipse(0, this.size * 0.55, i * 0.8, i * 1.2); // Oval shape
            }
            // Inner core
            fill(hue(engineColor1), saturation(engineColor1), 100); // Brightest core
            ellipse(0, this.size * 0.55, engineSize * 0.5, engineSize * 1.0); // Smaller oval

            // --- Draw Ship Body ---
            stroke(0, 0, 85); // Dark outline
            strokeWeight(1.5);
            // Base body color changes hue with points
            let pointsHue = (200 + points * 0.2) % 360; // Cycle hue (starts blueish)
            fill(pointsHue, 85, 98);

            let bodyWidthFactor = 0.6; // Controls base width

            beginShape();
            // Shape changes based on shapeState (driven by points)
            if (this.shapeState === 0) { // Base shape
                vertex(0, -this.size * 0.7); // Nose tip
                 // Curves defining the main body sides
                bezierVertex(
                    this.size * bodyWidthFactor * 0.8, -this.size * 0.3, // Control point 1 (right side)
                    this.size * bodyWidthFactor * 0.9, this.size * 0.0, // Control point 2 (right side)
                    this.size * bodyWidthFactor * 1.0, this.size * 0.4  // Endpoint (right rear)
                );
                bezierVertex(
                    this.size * bodyWidthFactor * 0.5, this.size * 0.6, // Control point 1 (bottom curve)
                   -this.size * bodyWidthFactor * 0.5, this.size * 0.6, // Control point 2 (bottom curve)
                   -this.size * bodyWidthFactor * 1.0, this.size * 0.4  // Endpoint (left rear)
                );
                bezierVertex(
                   -this.size * bodyWidthFactor * 0.9, this.size * 0.0, // Control point 1 (left side)
                   -this.size * bodyWidthFactor * 0.8, -this.size * 0.3, // Control point 2 (left side)
                    0, -this.size * 0.7 // Back to nose tip
                );
            } else { // Evolved shape (slightly larger and more angular/detailed)
                let s = this.size * 1.1; // Scale up
                let evolvedWidthFactor = bodyWidthFactor * 1.1; // Wider
                 vertex(0, -s * 0.8); // Sharper nose
                 bezierVertex(
                     s * evolvedWidthFactor * 0.8, -s * 0.2,
                     s * evolvedWidthFactor * 0.9, s * 0.1,
                     s * evolvedWidthFactor * 1.0, s * 0.5 // Wider rear points
                 );
                 bezierVertex(
                     s * evolvedWidthFactor * 0.5, s * 0.7,
                    -s * evolvedWidthFactor * 0.5, s * 0.7,
                    -s * evolvedWidthFactor * 1.0, s * 0.5
                 );
                 bezierVertex(
                    -s * evolvedWidthFactor * 0.9, s * 0.1,
                    -s * evolvedWidthFactor * 0.8, -s * 0.2,
                     0, -s * 0.8
                 );
            }
            endShape(CLOSE);

            // --- Draw Details ---
            strokeWeight(1.2);
            stroke(this.detailColor); // Darker detail lines
            if (this.shapeState === 0) {
                line(-this.size * bodyWidthFactor * 0.5, -this.size * 0.1, -this.size * bodyWidthFactor * 0.75, this.size * 0.3);
                line( this.size * bodyWidthFactor * 0.5, -this.size * 0.1, this.size * bodyWidthFactor * 0.75, this.size * 0.3);
            } else {
                 let s = this.size * 1.1;
                 let ewf = bodyWidthFactor * 1.1;
                line(-s * ewf * 0.6, -s * 0.05, -s * ewf * 0.8, s * 0.4); // Different detail lines
                line( s * ewf * 0.6, -s * 0.05, s * ewf * 0.8, s * 0.4);
                line(0, -s*0.4, 0, s*0.1); // Center line
            }

            // --- Draw Fins ---
            let finYOffset = this.shapeState === 0 ? this.size * 0.3 : this.size * 1.1 * 0.35;
            let finXBase = this.shapeState === 0 ? this.size * bodyWidthFactor * 0.6 : this.size * 1.1 * bodyWidthFactor * 1.1 * 0.7;
            let finTipX = this.shapeState === 0 ? this.size * bodyWidthFactor * 1.1 : this.size * 1.1 * bodyWidthFactor * 1.1 * 1.1;
            let finRearX = this.shapeState === 0 ? this.size * bodyWidthFactor * 0.75 : this.size * 1.1 * bodyWidthFactor * 1.1 * 0.8;
            let finRearY = this.shapeState === 0 ? this.size * 0.6 : this.size * 1.1 * 0.7;

            fill(this.finColor); // Fin color
            stroke(0, 0, 65); // Darker fin outline
            strokeWeight(1);
             // Right fin
            triangle( finXBase, finYOffset, finTipX, finYOffset + this.size*0.1, finRearX, finRearY);
             // Left fin
            triangle(-finXBase, finYOffset, -finTipX, finYOffset + this.size*0.1, -finRearX, finRearY);

            // --- Draw Cockpit ---
            fill(this.cockpitColor); // Cockpit color
            noStroke();
            ellipse(0, -this.size * 0.15, this.size * 0.4, this.size * 0.5); // Main cockpit shape
            // Cockpit highlight
            fill(0, 0, 100, 60); // White highlight, semi-transparent
            ellipse(0, -this.size * 0.2, this.size * 0.25, this.size * 0.3);

            pop(); // Restore drawing state
        }
    }
}


// ==================
// Bullet Class
// ==================
class Bullet { constructor(x, y, angle = 0) { this.pos = createVector(x, y); this.speed = 17; this.size = 5.5; this.startHue = frameCount % 360; // Hue cycles globally
this.hue = this.startHue; let baseAngle = -PI / 2; // Point upwards initially
this.vel = p5.Vector.fromAngle(baseAngle + angle); // Apply spread angle
this.vel.mult(this.speed); this.trail = []; this.trailLength = 5; } update() { // Store previous positions for trail
this.trail.unshift(this.pos.copy()); if (this.trail.length > this.trailLength) { this.trail.pop(); } this.pos.add(this.vel); this.hue = (this.hue + 5) % 360; // Cycle hue for rainbow effect
} draw() { noStroke(); // Draw trail fading out
for (let i = 0; i < this.trail.length; i++) { let trailPos = this.trail[i]; let alpha = map(i, 0, this.trail.length - 1, 50, 0); // Fade alpha
let trailSize = map(i, 0, this.trail.length - 1, this.size, this.size * 0.5); // Shrink size
fill(this.hue, 90, 100, alpha); ellipse(trailPos.x, trailPos.y, trailSize, trailSize * 2.0); // Elongated trail particles
} // Draw main bullet head
fill(this.hue, 95, 100); stroke(0, 0, 100); // White outline
strokeWeight(1); ellipse(this.pos.x, this.pos.y, this.size, this.size * 2.5); // Elongated shape
} isOffscreen() { let margin = this.size * 5; // Generous margin
return (this.pos.y < -margin || this.pos.y > height + margin || this.pos.x < -margin || this.pos.x > width + margin); } }


// ==================
// Asteroid Class
// ==================
class Asteroid { constructor(x, y, size, vel) { this.size = size || random(30, 85); // Allow setting size for splitting
this.pos = createVector(); let isInitialPlacement = (x !== undefined && y !== undefined); if (isInitialPlacement) { this.pos.x = x; this.pos.y = y; } else { // Spawn off-screen from Top, Left, or Right
let edge = floor(random(3)); if (edge === 0) { // Top edge
this.pos.x = random(width); this.pos.y = -this.size / 2; } else if (edge === 1) { // Right edge
this.pos.x = width + this.size / 2; this.pos.y = random(height * 0.7); // Don't spawn too low on sides
} else { // Left edge
this.pos.x = -this.size / 2; this.pos.y = random(height * 0.7); } } // Set velocity
if (vel) { // Use provided velocity (for splitting)
this.vel = vel; } else { // Calculate initial velocity
let baseSpeedMin = 0.6 + (currentLevel - 1) * 0.1; let baseSpeedMax = 1.8 + (currentLevel - 1) * 0.2; this.speed = min(MAX_ASTEROID_SPEED, random(baseSpeedMin, baseSpeedMax)); this.speed *= (this.size > 50 ? 0.9 : 1.1); // Smaller asteroids slightly faster
this.speed *= random(0.9, 1.1); // Add slight random variation
if (isInitialPlacement) { // If placed manually (initial spawn), random direction
this.vel = p5.Vector.random2D(); } else { // If spawned off-screen, aim generally towards center
let targetX = width / 2 + random(-width * 0.25, width * 0.25); let targetY = height / 2 + random(-height * 0.25, height * 0.25); let direction = createVector(targetX - this.pos.x, targetY - this.pos.y); direction.normalize(); direction.rotate(random(-PI / 12, PI / 12)); // Slight angle variation
this.vel = direction; } this.vel.mult(this.speed); } // Appearance
this.color = color(random(20, 50), random(30, 70), random(35, 65)); // Brown/Gray tones
this.rotation = random(TWO_PI); this.rotationSpeed = random(-0.04, 0.04); this.rotationAccel = 0.0001; // Slow random change in rotation speed
this.vertices = []; // Create irregular shape
let numVertices = floor(random(9, 18)); for (let i = 0; i < numVertices; i++) { let angleOffset = map(i, 0, numVertices, 0, TWO_PI); let r = this.size / 2 + random(-this.size * 0.45, this.size * 0.35); // Vary radius
let v = p5.Vector.fromAngle(angleOffset); v.mult(r); this.vertices.push(v); } // Add craters for detail
this.craters = []; let numCraters = floor(random(2, 7)); for (let i = 0; i < numCraters; i++) { let angle = random(TWO_PI); let radius = random(this.size * 0.1, this.size * 0.4); // Position within asteroid
let craterSize = random(this.size * 0.1, this.size * 0.3); let craterPos = p5.Vector.fromAngle(angle).mult(radius); this.craters.push({ pos: craterPos, size: craterSize }); } } update() { this.pos.add(this.vel); // Apply slight random change to rotation speed
this.rotationSpeed += random(-this.rotationAccel, this.rotationAccel); this.rotationSpeed = constrain(this.rotationSpeed, -0.06, 0.06); // Limit rotation speed
this.rotation += this.rotationSpeed; // Wrap around screen edges
let buffer = this.size; if (this.pos.x < -buffer) this.pos.x = width + buffer; if (this.pos.x > width + buffer) this.pos.x = -buffer; if (this.pos.y < -buffer) this.pos.y = height + buffer; if (this.pos.y > height + buffer) this.pos.y = -buffer; } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); // Simple 3D effect with highlight/shadow offset
let mainBri = brightness(this.color); let mainSat = saturation(this.color); let mainHue = hue(this.color); // Highlight layer
let highlightColor = color(mainHue, mainSat * 0.7, mainBri * 1.3); fill(highlightColor); noStroke(); beginShape(); for (let v of this.vertices) { vertex(v.x - 1.5, v.y - 1.5); // Offset slightly
} endShape(CLOSE); // Shadow layer
let shadowColor = color(mainHue, mainSat * 1.2, mainBri * 0.6); fill(shadowColor); noStroke(); beginShape(); for (let v of this.vertices) { vertex(v.x + 1.5, v.y + 1.5); // Offset opposite direction
} endShape(CLOSE); // Main body
fill(this.color); stroke(mainHue, mainSat * 0.4, mainBri * random(1.4, 1.8)); // Slightly brighter, varied outline
strokeWeight(1.8); beginShape(); for (let v of this.vertices) { vertex(v.x, v.y); } endShape(CLOSE); // Draw craters
noStroke(); fill(hue(this.color), saturation(this.color)*0.7, brightness(this.color) * 0.4, 90); // Darker, transparent fill
for (let crater of this.craters) { ellipse(crater.pos.x, crater.pos.y, crater.size, crater.size * random(0.7, 1.3)); // Slightly oval craters
} pop(); } hits(bullet) { // Simple circle collision check
let d = dist(this.pos.x, this.pos.y, bullet.pos.x, bullet.pos.y); return d < this.size / 2 + bullet.size / 2; } hitsShip(ship) { // Circle collision check against ship (or its shield)
let targetX = ship.pos.x; let targetY = ship.pos.y; // Check against shield radius if active, otherwise ship size
let targetRadius = ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5); let d = dist(this.pos.x, this.pos.y, targetX, targetY); return d < this.size / 2 + targetRadius; } }


// ==================
// Particle Class
// ==================
class Particle { constructor(x, y, particleColor, size = null, speedMult = 1, lifespanMult = 1) { this.pos = createVector(x, y); this.vel = p5.Vector.random2D(); // Random initial direction
this.vel.mult(random(1.5, 6) * speedMult); // Random speed with multiplier
this.lifespan = 100 * lifespanMult * random(0.8, 1.5); // Base lifespan with multiplier and variation
this.maxLifespan = this.lifespan; // Store initial for alpha mapping
this.baseHue = hue(particleColor); this.baseSat = saturation(particleColor); this.baseBri = brightness(particleColor); this.size = size !== null ? size * random(0.8, 1.2) : random(2, 7); // Allow fixed or random size
this.drag = random(0.95, 0.99); // Apply friction/drag
} update() { this.pos.add(this.vel); this.lifespan -= 2.5; // Decrease lifespan
this.vel.mult(this.drag); // Apply drag
} draw() { noStroke(); let currentAlpha = map(this.lifespan, 0, this.maxLifespan, 0, 100); // Fade out alpha
fill(this.baseHue, this.baseSat, this.baseBri, currentAlpha); ellipse(this.pos.x, this.pos.y, this.size * (this.lifespan / this.maxLifespan)); // Shrink size as it fades
} isDead() { return this.lifespan <= 0; } }


// ==================
// Star Class
// ==================
class Star { constructor() { this.x = random(width); this.y = random(height); this.layer = floor(random(4)); // Different layers for parallax
this.size = map(this.layer, 0, 3, 0.4, 2.8); // Size based on layer
this.speed = map(this.layer, 0, 3, 0.05, 0.6); // Speed based on layer (closer = faster)
this.baseBrightness = random(50, 95); this.twinkleSpeed = random(0.03, 0.08); this.twinkleRange = random(0.6, 1.4); // How much brightness varies
this.twinkleOffset = random(TWO_PI); // Unique twinkle phase
} update() { this.y += this.speed; // Move down based on layer speed
if (this.y > height + this.size) { // Wrap around top
this.y = -this.size; this.x = random(width); // New horizontal position
} } draw() { // Calculate twinkle effect
let twinkleFactor = map(sin(frameCount * this.twinkleSpeed + this.twinkleOffset), -1, 1, 1.0 - this.twinkleRange / 2, 1.0 + this.twinkleRange / 2); let currentBrightness = constrain(this.baseBrightness * twinkleFactor, 30, 100); fill(0, 0, currentBrightness, 90); // White, varying brightness and alpha
noStroke(); ellipse(this.x, this.y, this.size, this.size); } }


// ==================
// ShootingStar Class
// ==================
class ShootingStar { constructor() { this.startX = random(width); this.startY = random(-50, -10); // Start above screen
this.pos = createVector(this.startX, this.startY); let angle = random(PI * 0.3, PI * 0.7); // Angle downwards
this.speed = random(15, 30); this.vel = p5.Vector.fromAngle(angle).mult(this.speed); this.len = random(50, 150); // Length of the streak
this.brightness = random(80, 100); this.lifespan = 100; // How long it's visible
} update() { this.pos.add(this.vel); this.lifespan -= 2; // Fade out
} draw() { if (this.lifespan <= 0) return; let alpha = map(this.lifespan, 0, 100, 0, 100); // Fade alpha
let tailPos = p5.Vector.sub(this.pos, this.vel.copy().setMag(this.len)); // Calculate tail end
strokeWeight(random(1.5, 3)); // Varying thickness
stroke(0, 0, this.brightness, alpha); // Bright white, fading
line(this.pos.x, this.pos.y, tailPos.x, tailPos.y); } isDone() { // Remove if faded or off-screen
return this.lifespan <= 0 || this.pos.y > height + this.len || this.pos.x < -this.len || this.pos.x > width + this.len; } }


// ==================
// HealthPotion Class
// ==================
class HealthPotion { constructor(x, y) { this.pos = createVector(x || random(width * 0.1, width * 0.9), y || -30); // Spawn top or at specific point
this.vel = createVector(0, random(0.5, 1.5)); // Drift downwards slowly
this.size = 20; // Base size
this.bodyWidth = this.size * 0.6; this.bodyHeight = this.size * 0.8; this.neckWidth = this.size * 0.3; this.neckHeight = this.size * 0.4; this.rotation = 0; this.rotationSpeed = random(-0.015, 0.015); // Slow rotation
this.pulseOffset = random(TWO_PI); // Unique pulse phase
} update() { this.pos.add(this.vel); this.rotation += this.rotationSpeed; } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); // Pulse effect
let pulseFactor = map(sin(frameCount * 0.15 + this.pulseOffset), -1, 1, 0.8, 1.2); let glowAlpha = map(pulseFactor, 0.8, 1.2, 20, 60); // Faint red glow pulses
fill(0, 90, 100, glowAlpha); noStroke(); ellipse(0, 0, this.size * 1.5 * pulseFactor, this.size * 1.5 * pulseFactor); // Draw bottle shape
fill(0, 85, 90); // Red liquid color
noStroke(); rect(-this.bodyWidth / 2, -this.bodyHeight / 2, this.bodyWidth, this.bodyHeight, 3); // Body
rect(-this.neckWidth / 2, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth, this.neckHeight); // Neck
ellipse(0, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth * 1.2, this.neckWidth * 0.4); // Cork/Top
// Draw cross symbol
fill(0, 0, 100); // White cross
rectMode(CENTER); rect(0, 0, this.bodyWidth * 0.5, this.bodyWidth * 0.15); rect(0, 0, this.bodyWidth * 0.15, this.bodyWidth * 0.5); rectMode(CORNER); // Reset rect mode
pop(); } hitsShip(ship) { // Circle collision check against ship/shield
let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y); let shipRadius = ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5); return d < this.size * 0.7 + shipRadius; // Use potion radius + ship/shield radius
} isOffscreen() { let margin = this.size * 2; return (this.pos.y > height + margin); // Remove if it drifts off bottom
} }


// ==================
// PowerUp Class
// ==================
class PowerUp { constructor(type) { this.type = type; this.pos = createVector(random(width * 0.1, width * 0.9), -30); // Spawn top
this.vel = createVector(0, random(0.8, 1.8)); // Drift downwards
this.size = 22; this.pulseOffset = random(TWO_PI); this.rotation = random(TWO_PI); this.rotationSpeed = random(-0.02, 0.02); // Slow rotation
this.icon = '?'; // Default icon
this.color = color(0, 0, 100); // Default color (white)
// Set icon and color based on type
switch (this.type) { case POWERUP_TYPES.TEMP_SHIELD: this.icon = 'S'; this.color = color(45, 90, 100); break; // Yellow 'S'
case POWERUP_TYPES.RAPID_FIRE: this.icon = 'R'; this.color = color(120, 90, 100); break; // Green 'R'
case POWERUP_TYPES.EMP_BURST: this.icon = 'E'; this.color = color(210, 90, 100); break; // Blue 'E'
} } update() { this.pos.add(this.vel); this.rotation += this.rotationSpeed; } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); // Pulsing effect
let pulse = map(sin(frameCount * 0.2 + this.pulseOffset), -1, 1, 0.9, 1.2); let currentSize = this.size * pulse; let currentBrightness = brightness(this.color) * pulse; let glowAlpha = map(pulse, 0.9, 1.2, 30, 80); // Faint glow in power-up color
fill(hue(this.color), saturation(this.color) * 0.8, currentBrightness * 0.8, glowAlpha); noStroke(); ellipse(0, 0, currentSize * 1.5, currentSize * 1.5); // Main power-up orb
fill(hue(this.color), saturation(this.color), currentBrightness); stroke(0, 0, 100, 80); // White outline
strokeWeight(2); ellipse(0, 0, currentSize, currentSize); // Draw icon inside
fill(0, 0, 100); // White icon text
noStroke(); textSize(currentSize * 0.8); textAlign(CENTER, CENTER); text(this.icon, 0, currentSize * 0.05); // Adjust text position slightly
pop(); } hitsShip(ship) { // Circle collision check against ship/shield
let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y); let shipRadius = ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5); return d < this.size * 0.7 + shipRadius; } isOffscreen() { let margin = this.size * 2; return (this.pos.y > height + margin); // Remove if drifts off bottom
} }


// ==========================
// ===== ENEMY CLASSES ======
// ==========================

// ==================
// BaseEnemy Class (Parent for all enemy types)
// ==================
class BaseEnemy {
    constructor(x, y, size, health, pointsValue, moneyValue) {
        this.pos = createVector(x, y); // Position is now passed in
        this.vel = createVector();    // Velocity set by subclasses
        this.size = size;
        this.health = health;
        this.maxHealth = health; // Store max health if needed later
        this.pointsValue = pointsValue;
        this.moneyValue = moneyValue;
        this.hitColor = color(0, 0, 80); // Default hit color
        this.explosionColor = color(30, 80, 90); // Default explosion color (orange)
    }

    // Basic update: just applies velocity
    update() {
        this.pos.add(this.vel);
    }

    // Basic draw: subclasses MUST override this
    draw() {
        // Default placeholder if not overridden
        push();
        translate(this.pos.x, this.pos.y);
        fill(0, 100, 100); // Red placeholder
        rectMode(CENTER);
        rect(0, 0, this.size, this.size);
        pop();
    }

    // Basic collision check with player bullet (circle)
    hits(playerBullet) {
        let d = dist(this.pos.x, this.pos.y, playerBullet.pos.x, playerBullet.pos.y);
        return d < this.size / 2 + playerBullet.size / 2;
    }

    // Basic collision check with player ship (circle, considers shields)
    hitsShip(playerShip) {
        let d = dist(this.pos.x, this.pos.y, playerShip.pos.x, playerShip.pos.y);
        let targetRadius;
        if (playerShip.tempShieldActive) targetRadius = playerShip.shieldVisualRadius * 1.1;
        else if (playerShip.shieldCharges > 0) targetRadius = playerShip.shieldVisualRadius;
        else targetRadius = playerShip.size * 0.5;
        // Use enemy size * 0.45 for a slightly smaller body hitbox
        return d < this.size * 0.45 + targetRadius;
    }

    // Check if offscreen
    isOffscreen() {
        let margin = this.size * 2;
        return (this.pos.y > height + margin || this.pos.y < -margin ||
                this.pos.x < -margin || this.pos.x > width + margin);
    }

    // Take damage, return true if health <= 0
    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }

    // Get color for explosion particles
    getExplosionColor() {
        return this.explosionColor;
    }
     // Get color for hit sparks
     getHitColor() {
        return this.hitColor;
    }

    // Default spawn position logic (if not provided in constructor)
    _setDefaultSpawnPosition() {
         let edge = floor(random(3));
         if (edge === 0) { // Top
             this.pos.x = random(width); this.pos.y = -this.size / 2;
         } else if (edge === 1) { // Right
             this.pos.x = width + this.size / 2; this.pos.y = random(height * 0.6); // Spawn higher up on sides
         } else { // Left
             this.pos.x = -this.size / 2; this.pos.y = random(height * 0.6);
         }
    }
}


// ==================
// BasicEnemy Class
// ==================
class BasicEnemy extends BaseEnemy {
    constructor(x, y) {
        // Define properties for BasicEnemy
        super(x, y, 28, 1, 20, 5); // size, health, points, money

        // Set initial position if not provided
         if (x === undefined || y === undefined) {
            this._setDefaultSpawnPosition();
         }

        // Set velocity (similar to original EnemyShip)
        this.shootCooldown = random(120, 240);
        this.shootTimer = this.shootCooldown;
        this.bulletSpeed = 3.5 + currentLevel * 0.1;

        if (this.pos.y < 0) { // Coming from top
             this.vel.set(random(-0.5, 0.5), random(0.8, 1.5));
        } else if (this.pos.x > width) { // Coming from right
             this.vel.set(random(-1.5, -0.8), random(-0.5, 0.5));
        } else { // Coming from left
             this.vel.set(random(0.8, 1.5), random(-0.5, 0.5));
        }

        let speedScale = min(MAX_ENEMY_SPEED_BASIC, 1.0 + (currentLevel - 1) * 0.1);
        this.vel.mult(speedScale);
        this.vel.x += random(-0.25, 0.25) * speedScale; // Sideways drift

        // Colors specific to Basic Enemy
        this.bodyColor = color(0, 0, 20);
        this.outlineColor = color(0, 90, 60);
        this.cockpitColor = color(0, 100, 100);
        this.explosionColor = color(300, 80, 90); // Purpleish explosion
        this.hitColor = this.outlineColor;
    }

    update() {
        super.update(); // Apply velocity

        // Shooting logic
        this.shootTimer--;
        if (this.shootTimer <= 0 && ship && gameState === GAME_STATE.PLAYING) {
            this.shoot();
            this.shootCooldown = random(max(40, 120 - currentLevel * 5), max(80, 240 - currentLevel * 10));
            this.shootTimer = this.shootCooldown;
        }
    }

    shoot() {
        let aimAngle = PI / 2; // Straight down
        enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y + this.size * 0.3, aimAngle, this.bulletSpeed));
         /* TODO: Play basic enemy shoot sound */
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        fill(this.bodyColor);
        stroke(this.outlineColor);
        strokeWeight(1.8);
        beginShape(); // Original angular shape
        vertex(0, -this.size * 0.65);
        vertex(this.size * 0.55, this.size * 0.45);
        vertex(this.size * 0.3, this.size * 0.35);
        vertex(-this.size * 0.3, this.size * 0.35);
        vertex(-this.size * 0.55, this.size * 0.45);
        endShape(CLOSE);
        fill(this.cockpitColor); // Red "cockpit"
        noStroke();
        ellipse(0, -this.size * 0.1, 4, 6);
        pop();
    }

    getExplosionColor() { return this.explosionColor; }
    getHitColor() { return this.hitColor; }
}


// ==================
// KamikazeEnemy Class
// ==================
class KamikazeEnemy extends BaseEnemy {
    constructor(x, y) {
        super(x, y, 22, 1, 15, 3); // size, health, points, money

        // Set initial position if not provided
         if (x === undefined || y === undefined) {
            this._setDefaultSpawnPosition();
             // Ensure they don't spawn directly on top/bottom for better homing start
             this.pos.y = constrain(this.pos.y, -this.size, height * 0.6);
         }

        // Kamikaze specific properties
        this.acceleration = 0.08 + currentLevel * 0.005; // How quickly it turns towards player
        this.maxSpeed = min(MAX_ENEMY_SPEED_KAMIKAZE, 3.0 + currentLevel * 0.2); // Faster than basic
        this.vel = p5.Vector.random2D().mult(this.maxSpeed * 0.5); // Start with some initial velocity

        // Colors
        this.bodyColor = color(0, 90, 70); // Dark Red
        this.spikeColor = color(0, 100, 100); // Bright Red
        this.trailColor = color(0, 90, 80, 50); // Semi-transparent red trail
        this.explosionColor = color(15, 100, 100); // Orangey-red explosion
        this.hitColor = this.spikeColor;
    }

    update() {
        // Homing behavior
        if (ship && gameState === GAME_STATE.PLAYING) {
             let direction = p5.Vector.sub(ship.pos, this.pos); // Vector towards player
             direction.normalize();
             direction.mult(this.acceleration); // Scale by acceleration rate
             this.vel.add(direction); // Add acceleration to velocity
             this.vel.limit(this.maxSpeed); // Cap speed
        }

        this.pos.add(this.vel); // Apply velocity

         // Add trail particles
         if (frameCount % 4 === 0) {
             particles.push(new Particle(this.pos.x, this.pos.y, this.trailColor, this.size * 0.3, 0.5, 0.4));
         }
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        // Rotate to face the direction of velocity
        rotate(this.vel.heading() + PI / 2);

        // Draw Kamikaze shape (e.g., pointy)
        fill(this.bodyColor);
        noStroke();
        triangle(0, -this.size * 0.8, -this.size * 0.5, this.size * 0.5, this.size * 0.5, this.size * 0.5);

        // Spikes
        fill(this.spikeColor);
        triangle(-this.size * 0.5, this.size * 0.5, -this.size * 0.6, this.size * 0.7, -this.size * 0.3, this.size * 0.6);
        triangle(this.size * 0.5, this.size * 0.5, this.size * 0.6, this.size * 0.7, this.size * 0.3, this.size * 0.6);
        triangle(0, -this.size * 0.8, -this.size * 0.1, -this.size * 0.9, this.size * 0.1, -this.size * 0.9); // Top spike

        pop();
    }

    getExplosionColor() { return this.explosionColor; }
    getHitColor() { return this.hitColor; }
}


// ==================
// TurretEnemy Class
// ==================
class TurretEnemy extends BaseEnemy {
    constructor(x, y) {
        super(x, y, 35, 3, 50, 10); // size, health (more), points, money

        // Set initial position if not provided (tend to spawn near sides)
        if (x === undefined || y === undefined) {
            let edge = random(1) < 0.5 ? -1 : 1; // Left (-1) or Right (1)
            this.pos.x = (edge < 0) ? -this.size : width + this.size;
            this.pos.y = random(height * 0.1, height * 0.7); // Spawn in a vertical band
            this.vel.set(edge * random(-0.4, -0.1), random(-0.1, 0.1)); // Very slow drift inwards/vertically
        } else {
             this.vel.set(random(-0.2, 0.2), random(-0.2, 0.2)); // If pos provided, drift slowly randomly
        }


        // Turret specific properties
        this.bulletSpeed = 2.5 + currentLevel * 0.05; // Slower bullets than basic
        this.fireMode = floor(random(3)); // 0: Burst, 1: Spiral, 2: Spread Shot
        this.shootCooldown = random(180, 300); // Longer cooldown between patterns
        this.shootTimer = this.shootCooldown;
        this.patternTimer = 0; // Timer within a pattern
        this.patternAngle = random(TWO_PI); // Angle for spiral/spread
        this.burstCount = 0; // Bullets left in current burst

        // Colors
        this.baseColor = color(260, 50, 60); // Purpleish base
        this.barrelColor = color(260, 60, 80); // Lighter purple barrel
        this.lightColor = color(120, 80, 100); // Green indicator light
        this.explosionColor = color(260, 70, 90); // Purple explosion
        this.hitColor = this.barrelColor;
    }

    update() {
        super.update(); // Apply slow drift velocity

        // Keep turret mostly within horizontal bounds (prevent drifting too far off)
        if (this.pos.x < this.size * 2 && this.vel.x < 0) this.vel.x *= -0.5;
        if (this.pos.x > width - this.size * 2 && this.vel.x > 0) this.vel.x *= -0.5;
         // Bounce gently off top/bottom edges if drifting vertically
         if ((this.pos.y < this.size && this.vel.y < 0) || (this.pos.y > height - this.size && this.vel.y > 0)) {
             this.vel.y *= -0.5;
         }


        // Shooting Logic
        this.shootTimer--;
        if (this.shootTimer <= 0 && ship && gameState === GAME_STATE.PLAYING) {
            this.startShootingPattern();
            this.shootCooldown = random(max(120, 240 - currentLevel * 8), max(180, 360 - currentLevel * 12)); // Cooldown between patterns
            this.shootTimer = this.shootCooldown;
        }

        // Handle active shooting pattern
        this.updateShootingPattern();
    }

    startShootingPattern() {
         // Reset pattern state based on chosen fire mode
         this.fireMode = floor(random(3)); // Choose a new pattern
         this.patternTimer = 0;
         this.patternAngle = atan2(ship.pos.y - this.pos.y, ship.pos.x - this.pos.x); // Initial angle towards player

         switch (this.fireMode) {
             case 0: // Burst Fire
                 this.burstCount = 3 + floor(currentLevel / 4); // 3-6 shots per burst
                 this.patternTimer = 10; // Delay between shots in burst
                 break;
             case 1: // Spiral Fire
                 this.burstCount = 10 + currentLevel; // Number of shots in spiral
                 this.patternTimer = 5; // Delay between shots
                 break;
            case 2: // Spread Shot
                 this.burstCount = 3 + floor(currentLevel / 3); // 3-7 projectiles per spread
                 this.patternTimer = 0; // Fire all at once
                 break;
         }
    }

    updateShootingPattern() {
         if (this.burstCount > 0) {
             this.patternTimer--;
             if (this.patternTimer <= 0) {
                 switch (this.fireMode) {
                     case 0: // Burst Fire (single shot towards player)
                         let angleToPlayer = atan2(ship.pos.y - this.pos.y, ship.pos.x - this.pos.x);
                         enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y, angleToPlayer, this.bulletSpeed));
                         this.patternTimer = 10; // Reset delay for next shot in burst
                         this.burstCount--;
                         break;
                     case 1: // Spiral Fire
                         enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y, this.patternAngle, this.bulletSpeed * 0.8)); // Slightly slower spiral bullets
                         this.patternAngle += PI / (6 + currentLevel * 0.5); // Increment angle, tighter spiral at higher levels
                         this.patternTimer = 5; // Reset delay
                         this.burstCount--;
                         break;
                    case 2: // Spread Shot (fire all at once)
                         let spreadArc = PI / 4 + (currentLevel * PI / 30); // Wider spread at higher levels
                         for(let i = 0; i < this.burstCount; i++) {
                              let angle = this.patternAngle + map(i, 0, this.burstCount - 1, -spreadArc / 2, spreadArc / 2);
                              enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y, angle, this.bulletSpeed));
                         }
                         this.burstCount = 0; // Fired all shots
                         break;
                 }
                 /* TODO: Play turret shoot sound */
             }
         }
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);

        // Base (e.g., octagon)
        fill(this.baseColor);
        stroke(0, 0, 40);
        strokeWeight(2);
        beginShape();
        for (let i = 0; i < 8; i++) {
            let angle = map(i, 0, 8, 0, TWO_PI);
            vertex(cos(angle) * this.size / 2, sin(angle) * this.size / 2);
        }
        endShape(CLOSE);

        // Barrel (rotates towards player or based on pattern)
        let aimAngle = PI / 2; // Default down
        if (ship) {
            aimAngle = atan2(ship.pos.y - this.pos.y, ship.pos.x - this.pos.x);
        }
        rotate(aimAngle);
        fill(this.barrelColor);
        stroke(0, 0, 20);
        strokeWeight(1.5);
        rect(-this.size * 0.1, 0, this.size * 0.2, this.size * 0.6); // Simple rectangle barrel

        // Indicator light pulses when about to fire
        let lightPulse = 1.0;
        if (this.shootTimer < 60 || this.burstCount > 0) { // Pulse faster when preparing/firing
            lightPulse = map(sin(frameCount * 0.3), -1, 1, 0.5, 1.5);
        }
        fill(this.lightColor);
        noStroke();
        ellipse(0, this.size * 0.1, 6 * lightPulse, 6 * lightPulse); // Pulsing light on barrel

        pop();
    }

    getExplosionColor() { return this.explosionColor; }
    getHitColor() { return this.hitColor; }
}


// ==================
// SwarmerEnemy Class
// ==================
class SwarmerEnemy extends BaseEnemy {
    constructor(x, y) {
        super(x, y, 15, 1, 5, 1); // size, health, points, money

        // Set initial position if not provided
         if (x === undefined || y === undefined) {
            this._setDefaultSpawnPosition(); // Usually spawned in groups, so position is often passed
         }

        // Swarmer specific properties
        this.maxSpeed = min(MAX_ENEMY_SPEED_SWARMER, 1.5 + currentLevel * 0.1);
        this.vel = p5.Vector.random2D().mult(this.maxSpeed); // Start with random direction
        this.turnForce = 0.03 + random(0.02); // How quickly they change direction
        this.phaseOffset = random(TWO_PI); // For sine wave movement

        // Colors
        this.bodyColor = color(90, 70, 80); // Greenish
        this.wingColor = color(90, 50, 60, 80); // Semi-transparent wings
        this.explosionColor = color(90, 90, 90); // Greenish explosion
        this.hitColor = color(90, 100, 100); // Bright green hit
    }

    update() {
        // Simple wavy movement + slight homing towards general player area
        let targetY = height * 0.7; // Tend towards lower part of screen
        let targetX = width / 2;
        if(ship) { // Aim generally towards player X
            targetX = ship.pos.x + random(-width*0.2, width*0.2);
             targetY = ship.pos.y + random(50, 150); // Aim slightly below player
        }

        let desired = createVector(targetX - this.pos.x, targetY - this.pos.y);
        desired.normalize();
        desired.mult(this.maxSpeed);

        // Add sine wave perpendicular to desired direction for wavy motion
        let wave = createVector(desired.y, -desired.x); // Perpendicular vector
        wave.normalize();
        wave.mult(sin(frameCount * 0.05 + this.phaseOffset) * this.maxSpeed * 0.5); // Scale wave magnitude
        desired.add(wave); // Add wave to desired velocity

        // Calculate steering force
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.turnForce); // Limit turning force
        this.vel.add(steer);
        this.vel.limit(this.maxSpeed); // Limit overall speed

        this.pos.add(this.vel); // Apply velocity
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading() + PI / 2); // Point in direction of movement

        // Simple insect-like shape
        fill(this.bodyColor);
        noStroke();
        ellipse(0, 0, this.size * 0.6, this.size); // Main body ellipse

        // Wings (pulsing alpha/size slightly)
        let wingPulse = map(sin(frameCount * 0.2 + this.phaseOffset), -1, 1, 0.8, 1.2);
        fill(this.wingColor);
        triangle(-this.size * 0.3, -this.size * 0.1, -this.size * 0.8 * wingPulse, -this.size * 0.4 * wingPulse, -this.size * 0.5 * wingPulse, this.size * 0.3 * wingPulse); // Left wing
        triangle(this.size * 0.3, -this.size * 0.1, this.size * 0.8 * wingPulse, -this.size * 0.4 * wingPulse, this.size * 0.5 * wingPulse, this.size * 0.3 * wingPulse); // Right wing

        pop();
    }

     getExplosionColor() { return this.explosionColor; }
     getHitColor() { return this.hitColor; }
}


// ==================
// EnemyBullet Class
// ==================
class EnemyBullet { constructor(x, y, angle, speed) { this.pos = createVector(x, y); this.vel = p5.Vector.fromAngle(angle); this.vel.mult(speed); this.size = 7; this.color = color(0, 90, 100); // Bright red
} update() { this.pos.add(this.vel); } draw() { // Add a slight glow effect
noStroke(); fill(0, 80, 100, 50); // Fainter red glow
ellipse(this.pos.x, this.pos.y, this.size * 1.8, this.size * 1.8); // Main bullet orb
fill(this.color); ellipse(this.pos.x, this.pos.y, this.size, this.size); } hitsShip(ship) { // Circle collision check against ship/shield
let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y); let targetRadius = ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5); return d < this.size * 0.6 + targetRadius; // Use bullet radius + ship/shield radius
} isOffscreen() { let margin = this.size * 3; return (this.pos.y > height + margin || this.pos.y < -margin || this.pos.x < -margin || this.pos.x > width + margin); } }


// ==================
// Nebula Class
// ==================
class Nebula { constructor() { this.numEllipses = floor(random(10, 20)); // Number of ellipses making up the nebula
this.ellipses = []; this.rotation = random(TWO_PI); this.rotationSpeed = random(-0.0004, 0.0004); // Very slow rotation
this.baseAlpha = random(3, 8); // Base transparency
let overallWidth = random(width * 0.6, width * 1.4); // Nebula size relative to screen
let overallHeight = random(height * 0.4, height * 0.7); // Spawn position off-screen left or right
if (random(1) < 0.5) { this.pos = createVector(-overallWidth / 2, random(height)); this.vel = createVector(random(0.04, 0.12), random(-0.015, 0.015)); // Slow drift right
} else { this.pos = createVector(width + overallWidth / 2, random(height)); this.vel = createVector(random(-0.12, -0.04), random(-0.015, 0.015)); // Slow drift left
} // Color gradient for nebula
let h1 = random(240, 330); // Purple/Pink/Blue hues
let h2 = (h1 + random(-50, 50)) % 360; this.color1 = color(h1, random(40, 75), random(15, 45)); // Darker, desaturated colors
this.color2 = color(h2, random(40, 75), random(15, 45)); // Create individual ellipses within the nebula bounds
for (let i = 0; i < this.numEllipses; i++) { this.ellipses.push({ pos: createVector(random(-overallWidth * 0.45, overallWidth * 0.45), random(-overallHeight * 0.45, overallHeight * 0.45)), w: random(overallWidth * 0.15, overallWidth * 0.7), // Varying sizes
h: random(overallHeight * 0.15, overallHeight * 0.7), alpha: this.baseAlpha * random(0.6, 1.4) // Varying transparency
}); } } update() { this.pos.add(this.vel); // Apply drift
this.rotation += this.rotationSpeed; // Apply slow rotation
} draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); noStroke(); for (let el of this.ellipses) { // Interpolate color based on horizontal position within nebula
let inter = map(el.pos.x, -width * 0.45, width * 0.45, 0, 1); let c = lerpColor(this.color1, this.color2, inter); // Draw each ellipse with its color and alpha
fill(hue(c), saturation(c), brightness(c), el.alpha * random(0.9, 1.1)); // Slight alpha flicker
ellipse(el.pos.x, el.pos.y, el.w, el.h); } pop(); } isOffscreen() { // Check if the entire nebula structure is offscreen
let maxDimension = max(this.ellipses.reduce((maxR, el) => max(maxR, el.pos.mag() + max(el.w, el.h) / 2), 0), width * 0.7); // Estimate max radius
let margin = maxDimension; return (this.pos.x < -margin || this.pos.x > width + margin || this.pos.y < -margin || this.pos.y > height + margin); } }
