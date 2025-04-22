
// --- Features ---
// - Start Menu with Options (Start Game, Settings, Cosmetics) // NEW MENU ITEM
// - Settings Menu (Screen Shake, Background FX, Particle Density, Back)
// - Cosmetics Menu (Ship Palette, Engine Trail, Bullet Style, Back) // NEW MENU
// - Mobile Gameplay Settings Button // MODIFIED (Positioned bottom-left)
// - Level System based on Points (Up to Level 15)
// - Rainbow Bullets (Hue Cycling) // ENHANCED (Trail Effect, Style Options) // MODIFIED
// - Ship Upgrade System (Manual Purchase in Shop: Fire Rate, Spread Shot, Homing Missiles, Laser Beam, Rear Gun) - Uses Money // ENHANCED (UI Style) // MODIFIED: Button text size // REMOVED: Charge Shot
// - Score-based Shield System (Gain shield charge every 50 points, max 1) - Uses Points
// - Redesigned Spaceship Look (Score-based color/shape, added details, Palette Swaps) // FURTHER ENHANCED // MODIFIED
// - Dynamic Parallax Star Background (with occasional planet, galaxy, black hole) // ENHANCED (Twinkle, Shooting Stars, Slower BH Effect, More Planet Detail)
// - Enhanced Engine Thrust Effect (More reactive, Color Options) // ENHANCED (Particles, Reduced Thrust Value, Smaller Visual) // MODIFIED
// - Asteroid Splitting
// - Player Lives (Max 3)
// - Simple Explosion Particles (Asteroid destruction + Bullet impact) // ENHANCED (Variety, Count)
// - Score-based Difficulty Increase - Uses Levels + Time // MODIFIED (Scales to Lvl 15)
// - Health Potions: Spawn randomly, restore 1 life on pickup (up to max). // ENHANCED (Visual Pulse)
// - ADDED: Multiple Enemy Types:
//   - Basic Enemy: Shoots straight. // MODIFIED: Appearance more 'evil'
//   - Kamikaze Enemy: Homes in on player, explodes on impact. // MODIFIED: Appearance more 'evil'
//   - Turret Enemy: Slow/Stationary, fires patterns (bursts/spirals). // MODIFIED: Appearance more 'evil'
//   - Swarmer Enemy: Small, appears in groups, simple movement. // MODIFIED: Appearance more 'evil'
// - Temporary Power-Ups (Temp Shield, Rapid Fire, EMP Burst, Score Multiplier, Drone, Invincibility) // ENHANCED (Visual Pulse) // NEW POWERUPS ADDED
// - Visual Nebula Clouds in background // ENHANCED (Subtlety)
// - ADDED: Pause Functionality (Press ESC during gameplay) // ENHANCED (UI Style)
// - ADDED: Upgrade Shop Screen between levels (Levels 1-14) // ENHANCED (UI Style)
// - ADDED: Win Screen after completing Level 15 // ENHANCED (UI Style)
// - ADDED: Monospace Font & UI Color Palette // NEW UI FEATURE
// - ADDED: Styled HUD with Icons & Panel // MODIFIED (Moved Upgrade Levels & Shield Position, Added Missile Count, Score Multiplier Indicator)
// - ADDED: Styled Buttons & Menu Panels // NEW UI FEATURE
// - ADDED: Combo System (Timer, Counter, Max Bonus, Visual Feedback) // NEW GAMEPLAY FEATURE
// - ADDED: New Weapon Systems & Upgrades: Homing Missiles, Laser Beam, Rear Gun // NEW FEATURE // REMOVED: Charge Shot
// - ADDED: Drone Companion Class & Logic // NEW FEATURE
// - ADDED: Mobile UI Buttons for Missiles & Laser // NEW FEATURE
// - ADDED: Cosmetic Unlocks (Ship Palettes, Engine Trails, Bullet Styles) tied to Levels // NEW FEATURE
// --- Modifications ---
// - Removed Name Input and Leaderboard system.
// - Implemented separate Points (milestones) and Money (upgrades) systems.
// - Asteroids only spawn from Top, Left, and Right edges.
// - Ship movement changed to free keyboard control (Arrows/WASD).
// - MODIFIED: Hold Spacebar/Tap/Click to shoot (auto-fire respects cooldown). // REMOVED: Charge Shot mechanic
// - Background gradient color changes every 20 seconds.
// - Added brief invulnerability after losing a life.
// - Added Touch Controls: Tap to shoot, dedicated buttons for missile/laser.
// - Mobile Adjustments: Lower base asteroid spawn rate. // ENHANCED (UI Scaling/Layout)
// - Max shield charges reduced to 1.
// - Asteroids visuals enhanced (shading, craters, rotation, NO OUTLINE). // FURTHER ENHANCED
// - Added occasional background planet, subtle galaxy, black hole effect.
// - Increased Ship Speed (MaxSpeed unchanged, acceleration reduced)
// - Increased Asteroid Spawn Rate Scaling & Max Asteroid Count per Level
// - Added screen shake on life loss. // MODIFIED (Duration ~2s)
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
// - REPLACED: Start Screen with Start Menu.
// - ADDED: Visual Settings Options (Screen Shake, Background FX, Particle Density).
// - ADDED: Previous Game State Tracking for Settings Menu return.
// - MODIFIED: Screen Shake duration increased to ~2 seconds.
// - MODIFIED: Spaceship drawing logic for a more detailed look.
// --------------------------


// --- Game Objects & State ---
let ship;
let bullets = []; let homingMissiles = []; let laserBeams = [];
let asteroids = []; let particles = []; let stars = []; let shootingStars = [];
let potions = []; let enemyShips = []; let enemyBullets = []; let powerUps = []; let nebulas = [];

// Game State Management
const GAME_STATE = { START_MENU: 0, SETTINGS_MENU: 1, COSMETICS_MENU: 2, PLAYING: 3, GAME_OVER: 4, UPGRADE_SHOP: 5, WIN_SCREEN: 6 }; // Added COSMETICS_MENU
let gameState = GAME_STATE.START_MENU;
let previousGameState = GAME_STATE.START_MENU;
let isPaused = false;

// --- Menu Variables ---
let menuItems = ['Start Game', 'Settings', 'Cosmetics']; // Added Cosmetics
let selectedMenuItem = 0; let startMenuButtons = [];

// --- Settings Variables and Menu Items ---
let settingsItems = [ { id: 'screenShake', label: 'Screen Shake', type: 'toggle' }, { id: 'backgroundFx', label: 'Background FX', type: 'toggle' }, { id: 'particleDensity', label: 'Particles', type: 'cycle', options: ['High', 'Medium', 'Low'] }, { id: 'back', label: 'Back', type: 'action' } ];
let selectedSettingsItem = 0; let settingsMenuButtons = [];
let settingScreenShakeEnabled = true; let settingBackgroundEffectsEnabled = true; let settingParticleDensity = 'High';

// --- Cosmetics Variables and Menu Items ---
const cosmetics = {
    palettes: {
        'default': { name: "Default Blue", body: [210, 75, 85], cockpit: [180, 100, 100], wing: [220, 60, 70], detail1: [0, 0, 60], detail2: [0, 0, 90], unlockLevel: 1 },
        'crimson': { name: "Crimson Red", body: [0, 80, 90], cockpit: [0, 0, 100], wing: [350, 70, 75], detail1: [0, 0, 40], detail2: [0, 0, 70], unlockLevel: 5 },
        'emerald': { name: "Emerald Green", body: [130, 70, 70], cockpit: [150, 50, 100], wing: [120, 60, 55], detail1: [140, 30, 30], detail2: [140, 20, 60], unlockLevel: 10 },
        'golden': { name: "Golden Sun", body: [45, 90, 95], cockpit: [60, 100, 100], wing: [35, 80, 80], detail1: [30, 50, 50], detail2: [40, 40, 75], unlockLevel: 15 },
    },
    engineTrails: {
        'default': { name: "Standard Flame", color1: [30, 100, 100], color2: [0, 100, 100], unlockLevel: 1 },
        'plasma': { name: "Plasma Blue", color1: [180, 100, 100], color2: [200, 80, 90], unlockLevel: 7 },
        'warp': { name: "Warp Purple", color1: [270, 100, 100], color2: [300, 80, 90], unlockLevel: 12 },
    },
    bulletStyles: {
        'rainbow': { name: "Rainbow Trail", type: 'rainbow', unlockLevel: 1 },
        'plasma': { name: "Plasma Bolt", type: 'fixed', hue: 180, sat: 95, bri: 100, unlockLevel: 4 },
        'laser': { name: "Laser Red", type: 'fixed', hue: 0, sat: 95, bri: 100, unlockLevel: 9 },
    }
};
let unlockedCosmetics = { palettes: {'default': true}, engineTrails: {'default': true}, bulletStyles: {'rainbow': true} }; // Initialize defaults
let selectedCosmetics = { palette: 'default', engineTrail: 'default', bulletStyle: 'rainbow' };
let cosmeticsItems = [ { id: 'palette', label: 'Ship Palette', type: 'cycle', category: 'palettes' }, { id: 'engineTrail', label: 'Engine Trail', type: 'cycle', category: 'engineTrails' }, { id: 'bulletStyle', label: 'Bullet Style', type: 'cycle', category: 'bulletStyles' }, { id: 'back', label: 'Back', type: 'action' } ];
let selectedCosmeticsItem = 0; let cosmeticsMenuButtons = [];

// --- Mobile UI Button Variables ---
let mobileSettingsButton = { x: 0, y: 0, size: 0, padding: 5 };
let mobileMissileButton = { x: 0, y: 0, size: 0, padding: 5 }; // ADDED
let mobileLaserButton = { x: 0, y: 0, size: 0, padding: 5 }; // ADDED

// Power-Up Types
const POWERUP_TYPES = { TEMP_SHIELD: 0, RAPID_FIRE: 1, EMP_BURST: 2, SCORE_MULT: 3, DRONE: 4, INVINCIBILITY: 5 };
const NUM_POWERUP_TYPES = 6;

// Enemy Types
const ENEMY_TYPES = { BASE: 0, KAMIKAZE: 1, TURRET: 2, SWARMER: 3 };

// Score, Level & Resources
let points = 0; let money = 0; let lives = 3; const MAX_LIVES = 3; let currentLevel = 1;
const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 5000, 7500, 10500, 14000, 18000, 22500, 27500, 33000, 39000, 45500, 52500, 60000]; const MAX_LEVEL = 15;

// Game Settings & Thresholds
let baseAsteroidSpawnRate; let currentAsteroidSpawnRate; let baseEnemySpawnRate = 0.002; let basicEnemyWeight = 10; let kamikazeWeight = 0; let turretWeight = 0; let swarmerWeight = 0;
let powerUpSpawnRate = 0.0015; let potionSpawnRate = 0.001; let nebulaSpawnRate = 0.0005; let shootingStarSpawnRate = 0.001;
let initialAsteroids = 5; let minAsteroidSize = 15; const SHIELD_POINTS_THRESHOLD = 50; const MAX_SHIELD_CHARGES = 1; const SHAPE_CHANGE_POINTS_THRESHOLD = 100;
const MAX_ASTEROID_SPEED = 4.0; const MAX_ENEMY_SPEED_BASIC = 3.0; const MAX_ENEMY_SPEED_KAMIKAZE = 5.5; const MAX_ENEMY_SPEED_SWARMER = 2.5;

let spacebarHeld = false; // Keep for key press/release differentiation if needed elsewhere

// --- UI & Messages ---
let infoMessage = ""; let infoMessageTimeout = 0; let shopButtons = []; let levelTransitionFlash = 0;
let uiPanelColor, uiBorderColor, uiTextColor, uiHighlightColor, uiButtonColor, uiButtonHoverColor, uiButtonDisabledColor, uiButtonBorderColor;

// --- Background ---
let currentTopColor, currentBottomColor; const BACKGROUND_CHANGE_INTERVAL = 1200; let isMobile = false;

// --- Background Scenery Variables ---
let planetVisible = false; let planetPos, planetVel, planetSize, planetBaseColor, planetDetailColor1, planetDetailColor2, planetCloudColor, planetNoiseSeed;
let lastPlanetAppearanceTime = -Infinity; const PLANET_MIN_INTERVAL = 30000; const PLANET_MAX_INTERVAL = 60000;

// --- Screen Shake Variables ---
let screenShakeIntensity = 0; let screenShakeDuration = 0;

// --- Combo System Variables ---
let comboCounter = 0; let comboTimer = 0; let maxComboReached = 0; const COMBO_TIMEOUT_DURATION = 180; let showComboText = false; let comboTextTimeout = 0;

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

    uiPanelColor = color(220, 50, 20, 85); uiBorderColor = color(180, 70, 80, 90); uiTextColor = color(0, 0, 95); uiHighlightColor = color(60, 80, 100);
    uiButtonColor = color(200, 60, 50); uiButtonHoverColor = color(200, 70, 60); uiButtonDisabledColor = color(0, 0, 30); uiButtonBorderColor = color(200, 70, 90);
    currentTopColor = color(260, 80, 10); currentBottomColor = color(240, 70, 25);
    setDifficultyForLevel(currentLevel);
    initializeCosmetics(); // Set initial unlocked cosmetics
    setupMenuButtons();
    setupSettingsMenuButtons();
    setupCosmeticsMenuButtons(); // Setup cosmetics menu
    calculateMobileSettingsButtonPosition();
    calculateMobileActionButtonsPosition(); // ADDED
}


// ==================
// Helper Functions
// ==================
function spawnInitialAsteroids() { asteroids = []; for (let i = 0; i < initialAsteroids; i++) { let startPos; let shipX = ship ? ship.pos.x : width / 2; let shipY = ship ? ship.pos.y : height - 50; do { startPos = createVector(random(width), random(height * 0.7)); } while (ship && dist(startPos.x, startPos.y, shipX, shipY) < 150); asteroids.push(new Asteroid(startPos.x, startPos.y)); } }
function createParticles(x, y, count, particleColor, particleSize = null, speedMult = 1, lifespanMult = 1) { let densityMultiplier = 1.0; if (settingParticleDensity === 'Medium') { densityMultiplier = 0.5; } else if (settingParticleDensity === 'Low') { densityMultiplier = 0.2; } let actualCount = floor(count * densityMultiplier); if (actualCount < 1 && count > 0 && densityMultiplier > 0.01) actualCount = 1; if (actualCount <= 0) return; let baseHue = hue(particleColor); let baseSat = saturation(particleColor); let baseBri = brightness(particleColor); for (let i = 0; i < actualCount; i++) { let pColor = color( (baseHue + random(-15, 15)) % 360, baseSat * random(0.7, 1.1), baseBri * random(0.8, 1.2), 100 ); particles.push(new Particle(x, y, pColor, particleSize, speedMult, lifespanMult)); } }
function createStarfield(numStars) { stars = []; for (let i = 0; i < numStars; i++) { stars.push(new Star()); } }
function setDifficultyForLevel(level) { let effectiveLevel = min(level, MAX_LEVEL); let mobileFactor = isMobile ? 0.7 : 1.0; baseAsteroidSpawnRate = (0.009 + (effectiveLevel - 1) * 0.0015) * mobileFactor; currentAsteroidSpawnRate = baseAsteroidSpawnRate; baseEnemySpawnRate = (0.002 + (effectiveLevel - 1) * 0.0006) * mobileFactor; basicEnemyWeight = 10; kamikazeWeight = (effectiveLevel >= 2) ? 3 + effectiveLevel : 0; turretWeight = (effectiveLevel >= 5) ? 2 + floor(effectiveLevel / 2) : 0; swarmerWeight = (effectiveLevel >= 3) ? 4 + effectiveLevel : 0; }
function initializeCosmetics() { // Set initial selected and ensure defaults are unlocked
    selectedCosmetics = { palette: 'default', engineTrail: 'default', bulletStyle: 'rainbow' };
    unlockedCosmetics = { palettes: {'default': true}, engineTrails: {'default': true}, bulletStyles: {'rainbow': true} };
    // Pre-unlock based on starting level if needed (though usually starts at 1)
    checkAndUnlockCosmetics(currentLevel);
}
function checkAndUnlockCosmetics(level) {
    let newlyUnlocked = [];
    for (const type in cosmetics) { // palettes, engineTrails, bulletStyles
        for (const key in cosmetics[type]) {
            const cosmetic = cosmetics[type][key];
            if (level >= cosmetic.unlockLevel && !unlockedCosmetics[type][key]) {
                unlockedCosmetics[type][key] = true;
                newlyUnlocked.push(cosmetic.name);
            }
        }
    }
    if (newlyUnlocked.length > 0) {
        infoMessage = `Cosmetics Unlocked: ${newlyUnlocked.join(', ')}!`;
        infoMessageTimeout = 150;
    }
}
// MODIFIED: setupShopButtons adjusted after removing Charge Shot
function setupShopButtons() {
    shopButtons = [];
    let buttonWidth = isMobile ? 190 : 240;
    let buttonHeight = isMobile ? 45 : 55;
    let startX = width / 2 - buttonWidth / 2;
    let startY = height / 2 - (isMobile ? 175 : 210); // Adjust starting Y if needed
    let spacing = isMobile ? 55 : 65;
    let nextLevelSpacing = isMobile ? 25 : 30;

    shopButtons.push({ id: 'fireRate', x: startX, y: startY, w: buttonWidth, h: buttonHeight });
    shopButtons.push({ id: 'spreadShot', x: startX, y: startY + spacing, w: buttonWidth, h: buttonHeight });
    shopButtons.push({ id: 'rearGun', x: startX, y: startY + spacing * 2, w: buttonWidth, h: buttonHeight });
    shopButtons.push({ id: 'homingMissiles', x: startX, y: startY + spacing * 3, w: buttonWidth, h: buttonHeight });
    shopButtons.push({ id: 'laserBeam', x: startX, y: startY + spacing * 4, w: buttonWidth, h: buttonHeight });
    shopButtons.push({ id: 'nextLevel', x: startX, y: startY + spacing * 5 + nextLevelSpacing, w: buttonWidth, h: buttonHeight });
}
function setupMenuButtons() { startMenuButtons = []; let buttonWidth = isMobile ? 180 : 220; let buttonHeight = isMobile ? 40 : 50; let startY = height / 2 - buttonHeight * 1.5; let spacing = isMobile ? 55 : 65; for (let i = 0; i < menuItems.length; i++) { startMenuButtons.push({ id: menuItems[i], index: i, x: width / 2 - buttonWidth / 2, y: startY + i * spacing, w: buttonWidth, h: buttonHeight }); } }
function setupSettingsMenuButtons() { settingsMenuButtons = []; let buttonWidth = isMobile ? 200 : 260; let buttonHeight = isMobile ? 38 : 45; let startY = height * 0.35; let spacing = isMobile ? 50 : 60; for (let i = 0; i < settingsItems.length; i++) { settingsMenuButtons.push({ id: settingsItems[i].id, index: i, x: width / 2 - buttonWidth / 2, y: startY + i * spacing, w: buttonWidth, h: buttonHeight }); } }
// Setup cosmetics menu buttons
function setupCosmeticsMenuButtons() { cosmeticsMenuButtons = []; let buttonWidth = isMobile ? 200 : 260; let buttonHeight = isMobile ? 38 : 45; let startY = height * 0.35; let spacing = isMobile ? 50 : 60; for (let i = 0; i < cosmeticsItems.length; i++) { cosmeticsMenuButtons.push({ id: cosmeticsItems[i].id, index: i, x: width / 2 - buttonWidth / 2, y: startY + i * spacing, w: buttonWidth, h: buttonHeight }); } }
function calculateMobileSettingsButtonPosition() { mobileSettingsButton.size = isMobile ? 35 : 45; mobileSettingsButton.padding = 10; mobileSettingsButton.x = mobileSettingsButton.padding; mobileSettingsButton.y = height - mobileSettingsButton.size - mobileSettingsButton.padding; }
function calculateMobileActionButtonsPosition() { let buttonSize = isMobile ? 50 : 60; let padding = 15; mobileMissileButton.size = buttonSize; mobileMissileButton.padding = padding; mobileMissileButton.x = width - buttonSize - padding; mobileMissileButton.y = height - buttonSize - padding; mobileLaserButton.size = buttonSize; mobileLaserButton.padding = padding; mobileLaserButton.x = width - buttonSize * 2 - padding * 2; mobileLaserButton.y = height - buttonSize - padding; }

// ==================
// p5.js Draw Loop
// ==================
function draw() {
    // Background Updates
    if (frameCount > 0 && frameCount % BACKGROUND_CHANGE_INTERVAL === 0) { let topH = random(180, 300); let bottomH = (topH + random(20, 60)) % 360; currentTopColor = color(topH, random(70, 90), random(10, 20)); currentBottomColor = color(bottomH, random(60, 85), random(25, 40)); }
    if (settingBackgroundEffectsEnabled && gameState !== GAME_STATE.START_MENU && gameState !== GAME_STATE.SETTINGS_MENU && gameState !== GAME_STATE.COSMETICS_MENU) { let currentTime = millis(); if (!planetVisible && currentTime - lastPlanetAppearanceTime > random(PLANET_MIN_INTERVAL, PLANET_MAX_INTERVAL)) { planetVisible = true; planetSize = random(width * 0.2, width * 0.5); let edge = floor(random(4)); if (edge === 0) planetPos = createVector(random(width), -planetSize / 2); else if (edge === 1) planetPos = createVector(width + planetSize / 2, random(height)); else if (edge === 2) planetPos = createVector(random(width), height + planetSize / 2); else planetPos = createVector(-planetSize / 2, random(height)); let targetPos = createVector(random(width * 0.2, width * 0.8), random(height * 0.2, height * 0.8)); planetVel = p5.Vector.sub(targetPos, planetPos); planetVel.normalize(); planetVel.mult(random(0.1, 0.3)); let baseH = random(360); planetBaseColor = color(baseH, random(40, 70), random(50, 80)); planetDetailColor1 = color((baseH + random(20, 50)) % 360, random(50, 70), random(60, 90)); planetDetailColor2 = color((baseH + random(180, 220)) % 360, random(30, 60), random(40, 70)); planetCloudColor = color(0, 0, 100, 30); planetNoiseSeed = random(1000); lastPlanetAppearanceTime = currentTime; } if (planetVisible) { planetPos.add(planetVel); let buffer = planetSize * 0.6; if (planetPos.x < -buffer || planetPos.x > width + buffer || planetPos.y < -buffer || planetPos.y > height + buffer) { planetVisible = false; } } } else { planetVisible = false; }
    if (settingBackgroundEffectsEnabled && gameState === GAME_STATE.PLAYING && !isPaused && random(1) < shootingStarSpawnRate) { shootingStars.push(new ShootingStar()); }

    // Drawing
    drawBackgroundAndStars();
    push();
    if (screenShakeDuration > 0 && settingScreenShakeEnabled) { screenShakeDuration--; translate(random(-screenShakeIntensity, screenShakeIntensity), random(-screenShakeIntensity, screenShakeIntensity)); } else { screenShakeDuration = 0; screenShakeIntensity = 0; }

    // Game State Logic & Drawing
    switch (gameState) { case GAME_STATE.START_MENU: displayStartMenu(); break; case GAME_STATE.SETTINGS_MENU: displaySettingsMenu(); break; case GAME_STATE.COSMETICS_MENU: displayCosmeticsMenu(); break; // Added cosmetics menu display
        case GAME_STATE.PLAYING: runGameLogic(); if (isPaused) { displayPauseScreen(); } break; case GAME_STATE.UPGRADE_SHOP: displayUpgradeShop(); break; case GAME_STATE.GAME_OVER: runGameLogic(); displayGameOver(); break; case GAME_STATE.WIN_SCREEN: runGameLogic(); displayWinScreen(); break; }

    // Overlays
    if (infoMessageTimeout > 0) { displayInfoMessage(); if ((gameState === GAME_STATE.PLAYING && !isPaused) || gameState === GAME_STATE.UPGRADE_SHOP || gameState === GAME_STATE.START_MENU || gameState === GAME_STATE.COSMETICS_MENU) { infoMessageTimeout--; } }
    if (levelTransitionFlash > 0) { fill(0, 0, 100, levelTransitionFlash * 10); rect(0, 0, width, height); levelTransitionFlash--; }
    pop();
}


// --- Screen Display Functions ---
function displayStartMenu() { let titleText = "Space-Chase"; let titleSize = isMobile ? 56 : 72; textSize(titleSize); textAlign(CENTER, CENTER); let totalWidth = textWidth(titleText); let startX = width / 2 - totalWidth / 2; let currentX = startX; let titleY = height / 3.5; for (let i = 0; i < titleText.length; i++) { let char = titleText[i]; let charWidth = textWidth(char); let yOffset = sin(frameCount * 0.1 + i * 0.7) * (isMobile ? 7 : 10); fill(0, 0, 0, 50); text(char, currentX + charWidth / 2 + (isMobile ? 3 : 4), titleY + yOffset + (isMobile ? 3 : 4)); let h = (frameCount * 4 + i * 25) % 360; fill(h, 95, 100); text(char, currentX + charWidth / 2, titleY + yOffset); currentX += charWidth; } let menuTextSize = isMobile ? 24 : 30; textSize(menuTextSize); textAlign(CENTER, CENTER); for (let i = 0; i < startMenuButtons.length; i++) { let button = startMenuButtons[i]; let label = button.id; let hover = !isMobile && (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h); let selected = (i === selectedMenuItem); let buttonCol = uiButtonColor; let textCol = uiTextColor; let borderCol = uiButtonBorderColor; if (selected || hover) { buttonCol = uiButtonHoverColor; borderCol = color(hue(uiButtonHoverColor), 80, 100); } fill(buttonCol); stroke(borderCol); strokeWeight(selected ? 2.5 : 1.5); rect(button.x, button.y, button.w, button.h, 8); noFill(); strokeWeight(1); stroke(0, 0, 100, 20); line(button.x + 2, button.y + 2, button.x + button.w - 2, button.y + 2); line(button.x + 2, button.y + 2, button.x + 2, button.y + button.h - 2); stroke(0, 0, 0, 30); line(button.x + 2, button.y + button.h - 2, button.x + button.w - 2, button.y + button.h - 2); line(button.x + button.w - 2, button.y + 2, button.x + button.w - 2, button.y + button.h - 2); fill(textCol); noStroke(); text(label, button.x + button.w / 2, button.y + button.h / 2); } cursor(ARROW); }
function displaySettingsMenu() { drawPanelBackground(width * (isMobile ? 0.85 : 0.7), height * 0.7); fill(uiTextColor); textSize(isMobile ? 36 : 48); textAlign(CENTER, TOP); text("Settings", width / 2, height * 0.2); let menuTextSize = isMobile ? 18 : 22; textSize(menuTextSize); textAlign(CENTER, CENTER); for (let i = 0; i < settingsMenuButtons.length; i++) { let button = settingsMenuButtons[i]; let setting = settingsItems[i]; let label = setting.label; let currentValue = ''; if (setting.type === 'toggle') { let stateVariable = (setting.id === 'screenShake') ? settingScreenShakeEnabled : settingBackgroundEffectsEnabled; currentValue = stateVariable ? ': ON' : ': OFF'; } else if (setting.type === 'cycle') { currentValue = ': ' + settingParticleDensity; } let fullLabel = label + currentValue; let hover = !isMobile && (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h); let selected = (i === selectedSettingsItem); let buttonCol = uiButtonColor; let textCol = uiTextColor; let borderCol = uiButtonBorderColor; if (setting.id === 'back') { buttonCol = color(90, 70, 60); borderCol = color(90, 80, 85); if (selected || hover) { buttonCol = color(90, 75, 70); } } else { if (selected || hover) { buttonCol = uiButtonHoverColor; borderCol = color(hue(uiButtonHoverColor), 80, 100); } } fill(buttonCol); stroke(borderCol); strokeWeight(selected ? 2.5 : 1.5); rect(button.x, button.y, button.w, button.h, 8); noFill(); strokeWeight(1); stroke(0, 0, 100, 20); line(button.x + 2, button.y + 2, button.x + button.w - 2, button.y + 2); line(button.x + 2, button.y + 2, button.x + 2, button.y + button.h - 2); stroke(0, 0, 0, 30); line(button.x + 2, button.y + button.h - 2, button.x + button.w - 2, button.y + button.h - 2); line(button.x + button.w - 2, button.y + 2, button.x + button.w - 2, button.y + button.h - 2); fill(textCol); noStroke(); text(fullLabel, button.x + button.w / 2, button.y + button.h / 2); } cursor(ARROW); }
// New function to display cosmetics menu
function displayCosmeticsMenu() {
    drawPanelBackground(width * (isMobile ? 0.85 : 0.7), height * 0.7);
    fill(uiTextColor); textSize(isMobile ? 36 : 48); textAlign(CENTER, TOP); text("Cosmetics", width / 2, height * 0.2);
    let menuTextSize = isMobile ? 18 : 22; textSize(menuTextSize); textAlign(CENTER, CENTER);
    for (let i = 0; i < cosmeticsMenuButtons.length; i++) {
        let button = cosmeticsMenuButtons[i]; let setting = cosmeticsItems[i]; let label = setting.label; let currentValue = '';
        if (setting.type === 'cycle') { let category = setting.category; // e.g., 'palettes', 'engineTrails'
            let selectedKey = selectedCosmetics[category.slice(0,-1)]; // e.g., 'palette'
            currentValue = `: ${cosmetics[category][selectedKey]?.name || 'Default'}`; }
        let fullLabel = label + currentValue;
        let hover = !isMobile && (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h); let selected = (i === selectedCosmeticsItem); let buttonCol = uiButtonColor; let textCol = uiTextColor; let borderCol = uiButtonBorderColor;
        if (setting.id === 'back') { buttonCol = color(90, 70, 60); borderCol = color(90, 80, 85); if (selected || hover) { buttonCol = color(90, 75, 70); } } else { if (selected || hover) { buttonCol = uiButtonHoverColor; borderCol = color(hue(uiButtonHoverColor), 80, 100); } }
        fill(buttonCol); stroke(borderCol); strokeWeight(selected ? 2.5 : 1.5); rect(button.x, button.y, button.w, button.h, 8); noFill(); strokeWeight(1); stroke(0, 0, 100, 20); line(button.x + 2, button.y + 2, button.x + button.w - 2, button.y + 2); line(button.x + 2, button.y + 2, button.x + 2, button.y + button.h - 2); stroke(0, 0, 0, 30); line(button.x + 2, button.y + button.h - 2, button.x + button.w - 2, button.y + button.h - 2); line(button.x + button.w - 2, button.y + 2, button.x + button.w - 2, button.y + button.h - 2); fill(textCol); noStroke(); text(fullLabel, button.x + button.w / 2, button.y + button.h / 2);
    }
    // Tiny Ship Preview (Optional - Simple rectangle color preview for now)
    let previewY = height * 0.2 + (isMobile ? 60 : 80);
    let previewSize = isMobile ? 40 : 50;
    let currentPalette = cosmetics.palettes[selectedCosmetics.palette];
    if (currentPalette) {
        push();
        translate(width / 2, previewY);
        fill(currentPalette.body[0], currentPalette.body[1], currentPalette.body[2]);
        rect(-previewSize / 2, -previewSize / 4, previewSize, previewSize / 2); // Body Preview
        fill(currentPalette.wing[0], currentPalette.wing[1], currentPalette.wing[2]);
        triangle(-previewSize / 2, 0, -previewSize * 0.7, previewSize * 0.3, -previewSize * 0.3, previewSize * 0.1); // Left Wing Preview
        triangle(previewSize / 2, 0, previewSize * 0.7, previewSize * 0.3, previewSize * 0.3, previewSize * 0.1); // Right Wing Preview
        pop();
    }
    cursor(ARROW);
}
function displayPauseScreen() { drawPanelBackground(width * 0.6, height * 0.4); fill(uiTextColor); textSize(isMobile ? 54 : 64); textAlign(CENTER, CENTER); text("PAUSED", width / 2, height / 2 - 30); textSize(isMobile ? 18 : 22); text(isMobile ? "Tap Settings Button (⚙️) to Resume/Adjust" : "Press ESC to Resume", width / 2, height / 2 + 40); }
function displayUpgradeShop() { drawPanelBackground(width * (isMobile ? 0.95 : 0.8), height * (isMobile ? 0.85 : 0.85)); fill(uiTextColor); textSize(isMobile ? 36 : 48); textAlign(CENTER, TOP); text(`Level ${currentLevel} Complete!`, width / 2, height * 0.1); textSize(isMobile ? 26 : 32); text("Upgrade Shop", width / 2, height * 0.1 + (isMobile ? 50 : 65)); textSize(isMobile ? 20 : 26); textAlign(CENTER, TOP); fill(uiHighlightColor); text(`Money: $${money}`, width / 2, height * 0.1 + (isMobile ? 90 : 115)); textSize(isMobile ? 15 : 17); textAlign(CENTER, CENTER); for (let button of shopButtons) { drawStyledButton(button); } }
function displayGameOver() { drawPanelBackground(width * (isMobile ? 0.8 : 0.6), height * 0.5); fill(color(0, 80, 100)); textSize(isMobile ? 52 : 68); textAlign(CENTER, CENTER); text("GAME OVER", width / 2, height / 3); fill(uiTextColor); textSize(isMobile ? 26 : 34); text("Final Points: " + points, width / 2, height / 3 + (isMobile ? 60 : 75)); textAlign(CENTER, CENTER); textSize(isMobile ? 18 : 22); let pulse = map(sin(frameCount * 0.1), -1, 1, 70, 100); fill(0, 0, pulse); let restartInstruction = isMobile ? "Tap Screen for Menu" : "Click or Press Enter for Menu"; text(restartInstruction, width / 2, height * 0.7); cursor(ARROW); }
function displayWinScreen() { drawPanelBackground(width * (isMobile ? 0.85 : 0.7), height * 0.6); let winTextSize = isMobile ? 58 : 72; textSize(winTextSize); textAlign(CENTER, CENTER); let winY = height / 3; let winText = "YOU WIN!"; let totalWinWidth = textWidth(winText); let startWinX = width / 2 - totalWinWidth / 2; let currentWinX = startWinX; for (let i = 0; i < winText.length; i++) { let char = winText[i]; let charWidth = textWidth(char); let h = (frameCount * 4 + i * 30) % 360; fill(h, 95, 100); text(char, currentWinX + charWidth / 2, winY); currentWinX += charWidth; } fill(uiTextColor); textSize(isMobile ? 26 : 34); text("Final Points: " + points, width / 2, winY + (isMobile ? 65 : 80)); textAlign(CENTER, CENTER); textSize(isMobile ? 18 : 22); let pulse = map(sin(frameCount * 0.1), -1, 1, 70, 100); fill(0, 0, pulse); let restartInstruction = isMobile ? "Tap Screen for Menu" : "Click or Press Enter for Menu"; text(restartInstruction, width / 2, height * 0.7); cursor(ARROW); }
function drawPanelBackground(panelWidth, panelHeight) { let panelX = width / 2 - panelWidth / 2; let panelY = height / 2 - panelHeight / 2; fill(uiPanelColor); stroke(uiBorderColor); strokeWeight(2); rect(panelX, panelY, panelWidth, panelHeight, 10); }
// MODIFIED: drawStyledButton logic for removed Charge Shot
function drawStyledButton(button) {
    let cost = "?"; let label = ""; let isMaxed = false; let canAfford = false; let currentLevelText = ""; let isUpgradeButton = false;
    switch (button.id) {
        case 'fireRate':
            cost = ship.getUpgradeCost('fireRate'); isMaxed = (cost === "MAX"); if (!isMaxed) canAfford = (money >= cost);
            currentLevelText = `Lvl ${ship.fireRateLevel}/${ship.maxUpgradeLevel}`; label = `Fire Rate ${currentLevelText}`; isUpgradeButton = true; break;
        case 'spreadShot':
            cost = ship.getUpgradeCost('spreadShot'); isMaxed = (cost === "MAX"); if (!isMaxed) canAfford = (money >= cost);
            currentLevelText = `Lvl ${ship.spreadShotLevel}/${ship.maxUpgradeLevel}`; label = `Spread Shot ${currentLevelText}`; isUpgradeButton = true; break;
        case 'rearGun':
             cost = ship.getUpgradeCost('rearGun'); isMaxed = (cost === "MAX"); if (!isMaxed) canAfford = (money >= cost);
             currentLevelText = `Lvl ${ship.rearGunLevel}/${ship.maxRearGunLevel}`; label = `Rear Gun ${currentLevelText}`; isUpgradeButton = true; break;
        case 'homingMissiles':
            cost = ship.getUpgradeCost('homingMissiles'); isMaxed = (cost === "MAX"); if (!isMaxed) canAfford = (money >= cost);
            currentLevelText = `Lvl ${ship.homingMissilesLevel}/${ship.maxMissileLevel}`; label = `Missiles ${currentLevelText}`; isUpgradeButton = true; break;
        case 'laserBeam':
            cost = ship.getUpgradeCost('laserBeam'); isMaxed = (cost === "MAX"); if (!isMaxed) canAfford = (money >= cost);
            currentLevelText = `Lvl ${ship.laserBeamLevel}/${ship.maxLaserLevel}`; label = `Laser Beam ${currentLevelText}`; isUpgradeButton = true; break;
        case 'nextLevel':
            label = `Start Level ${currentLevel + 1}`; isMaxed = false; canAfford = true; break;
    }

    let buttonCol; let textCol = uiTextColor; let borderCol = uiButtonBorderColor;
    let hover = !isMobile && (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h);

    if (button.id !== 'nextLevel') {
        if (isMaxed) { buttonCol = uiButtonDisabledColor; textCol = color(0, 0, 60); label += " (MAX)"; borderCol = color(0, 0, 40); }
        else if (!canAfford) { buttonCol = color(0, 75, 50, 80); textCol = color(0, 0, 85); label += ` ($${cost})`; borderCol = color(0, 80, 70); }
        else { buttonCol = hover ? uiButtonHoverColor : uiButtonColor; label += ` ($${cost})`; borderCol = uiButtonBorderColor; }
    } else { buttonCol = hover ? color(90, 75, 70) : color(90, 70, 60); borderCol = color(90, 80, 85); }

    fill(buttonCol); stroke(borderCol); strokeWeight(hover ? 2.5 : 1.5); rect(button.x, button.y, button.w, button.h, 6);
    noFill(); strokeWeight(1); stroke(0, 0, 100, 20); line(button.x + 2, button.y + 2, button.x + button.w - 2, button.y + 2); line(button.x + 2, button.y + 2, button.x + 2, button.y + button.h - 2); stroke(0, 0, 0, 30); line(button.x + 2, button.y + button.h - 2, button.x + button.w - 2, button.y + button.h - 2); line(button.x + button.w - 2, button.y + 2, button.x + button.w - 2, button.y + button.h - 2);

    if (isUpgradeButton) { textSize(isMobile ? 13 : 15); } else { textSize(isMobile ? 15 : 17); }
    fill(textCol); noStroke(); textAlign(CENTER, CENTER); text(label, button.x + button.w / 2, button.y + button.h / 2);
}


// --- Main Game Logic ---
function runGameLogic() {
    if (isPaused) {
        if (ship) ship.draw();
        if (ship && ship.droneActive) ship.drone.draw();
        for (let b of bullets) b.draw();
        for (let m of homingMissiles) m.draw();
        for (let l of laserBeams) l.draw();
        for (let p of particles) p.draw();
        for (let a of asteroids) a.draw();
        for (let e of enemyShips) e.draw();
        for (let eb of enemyBullets) eb.draw();
        for (let pt of potions) pt.draw();
        for (let pu of powerUps) pu.draw();
        displayHUD();
        return;
    }

    if (!ship) return;

    // --- Update Game Objects ---
    ship.update();
    if (ship.droneActive) ship.drone.update();
    ship.draw();
    if (ship.droneActive) ship.drone.draw();

    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) { bullets[i].update(); bullets[i].draw(); if (bullets[i].isOffscreen()) { bullets.splice(i, 1); } }
    // Homing Missiles
    for (let i = homingMissiles.length - 1; i >= 0; i--) { homingMissiles[i].update(); homingMissiles[i].draw(); if (homingMissiles[i].isOffscreen() || homingMissiles[i].lifespan <= 0) { homingMissiles.splice(i, 1); } }
    // Laser Beams
    for (let i = laserBeams.length - 1; i >= 0; i--) { laserBeams[i].update(); laserBeams[i].draw(); if (laserBeams[i].isDead()) { laserBeams.splice(i, 1); } }
    // Particles
    for (let i = particles.length - 1; i >= 0; i--) { particles[i].update(); particles[i].draw(); if (particles[i].isDead()) { particles.splice(i, 1); } }
    // Enemy Ships
    for (let i = enemyShips.length - 1; i >= 0; i--) { enemyShips[i].update(); enemyShips[i].draw(); if (enemyShips[i].isOffscreen()) { enemyShips.splice(i, 1); } }
    // Enemy Bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) { enemyBullets[i].update(); enemyBullets[i].draw(); if (enemyBullets[i].isOffscreen()) { enemyBullets.splice(i, 1); } }
    // Asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) { if (!asteroids[i]) continue; asteroids[i].update(); asteroids[i].draw(); }

    // --- Special Weapon Logic ---
    // Laser Damage
    if (ship.laserActive) {
        let laserDamage = 0.05 + ship.laserBeamLevel * 0.02;
        let laserWidth = 5 + ship.laserBeamLevel * 1.5;
        let laserOrigin = createVector(ship.pos.x, ship.pos.y - ship.size * 0.7 + ship.hoverOffset); // Adjusted for hover
        let laserEnd = createVector(laserOrigin.x, -50); // Approximate end point off-screen

        for (let i = enemyShips.length - 1; i >= 0; i--) {
             let enemy = enemyShips[i];
             if (!enemy) continue;

             // Simplified Check: Project enemy position onto laser line segment
             let lineVec = p5.Vector.sub(laserEnd, laserOrigin);
             let pointVec = p5.Vector.sub(enemy.pos, laserOrigin);
             let lineLenSq = lineVec.magSq();
             let dot = pointVec.dot(lineVec);
             let t = constrain(dot / lineLenSq, 0, 1); // Project onto the segment
             let closestPoint = p5.Vector.add(laserOrigin, lineVec.mult(t));
             let distSq = p5.Vector.dist(enemy.pos, closestPoint);

             if (distSq < (enemy.size / 2 + laserWidth / 2)) { // Collision detected
                 if (enemy.takeDamage(laserDamage)) { // Apply damage
                     let pointsToAdd = enemy.pointsValue; let moneyToAdd = enemy.moneyValue;
                     if(ship.scoreMultiplierTimer > 0) { pointsToAdd *= ship.scoreMultiplierValue; }
                     points += floor(pointsToAdd); money += floor(moneyToAdd);
                     comboCounter++; comboTimer = COMBO_TIMEOUT_DURATION; maxComboReached = max(maxComboReached, comboCounter);
                     if (comboCounter >= 2) { showComboText = true; comboTextTimeout = 60; }
                     createParticles(enemy.pos.x, enemy.pos.y, floor(enemy.size * 1.2), enemy.getExplosionColor(), enemy.size * 0.2, 1.3, 1.0);
                     enemyShips.splice(i, 1);
                     checkAndUnlockCosmetics(currentLevel); // Check unlocks on enemy kill too
                 } else {
                     if(frameCount % 5 === 0) { createParticles(enemy.pos.x + random(-enemy.size/2, enemy.size/2), enemy.pos.y + random(-enemy.size/2, enemy.size/2), 1, ship.laserColor, 2, 0.5, 0.3); }
                 }
             }
        }
    }

    // --- Handle Pickups & Collisions ---
    handlePotions();
    handleCollisions(); // Handles bullet/missile collisions and player collisions
    handlePowerUps();

    // --- Update Combo System ---
    if (comboTimer > 0) { comboTimer--; if (comboTimer <= 0) { if (maxComboReached >= 3) { let bonusPoints = maxComboReached * 5; let bonusMoney = floor(maxComboReached / 3); points += bonusPoints; money += bonusMoney; infoMessage = `Combo Bonus: +${bonusPoints} PTS, +$${bonusMoney}! (Max: x${maxComboReached})`; infoMessageTimeout = 120; } comboCounter = 0; maxComboReached = 0; showComboText = false; comboTextTimeout = 0; } }
    if (comboTextTimeout > 0) { comboTextTimeout--; if (comboTextTimeout <= 0) { showComboText = false; } }

    // --- Spawning Logic ---
    if (gameState === GAME_STATE.PLAYING) { // Only spawn during active play
         let timeFactor = floor(frameCount / 1800) * 0.0005; // Slight increase over time
         currentAsteroidSpawnRate = baseAsteroidSpawnRate + timeFactor;
         let currentTotalEnemySpawnRate = baseEnemySpawnRate + timeFactor * 0.5;
         let maxAsteroidsAllowed = min(40, 15 + currentLevel * 3);
         let maxEnemiesAllowed = min(15, 5 + currentLevel * 2);
         let maxPotionsAllowed = 2; let maxPowerUpsAllowed = 1; let maxNebulasAllowed = 3;
         // Asteroids
         if (random(1) < currentAsteroidSpawnRate && asteroids.length < maxAsteroidsAllowed) { asteroids.push(new Asteroid()); }
         // Enemies
         if (random(1) < currentTotalEnemySpawnRate && enemyShips.length < maxEnemiesAllowed) {
              let totalWeight = basicEnemyWeight + kamikazeWeight + turretWeight + swarmerWeight; let typeRoll = random(totalWeight);
              if (typeRoll < swarmerWeight && currentLevel >= 3) { let swarmCount = floor(random(5, 10)); let spawnX = random(width * 0.2, width * 0.8); let spawnY = -20; for (let i = 0; i < swarmCount; i++) { if (enemyShips.length < maxEnemiesAllowed) { let offsetPos = createVector(spawnX + random(-50, 50), spawnY + random(-30, 30)); enemyShips.push(new SwarmerEnemy(offsetPos.x, offsetPos.y)); } else break; } }
              else if (typeRoll < swarmerWeight + turretWeight && currentLevel >= 5) { enemyShips.push(new TurretEnemy()); }
              else if (typeRoll < swarmerWeight + turretWeight + kamikazeWeight && currentLevel >= 2) { enemyShips.push(new KamikazeEnemy()); }
              else { enemyShips.push(new BasicEnemy()); }
         }
         // Potions
         if (random(1) < potionSpawnRate && potions.length < maxPotionsAllowed) { potions.push(new HealthPotion()); }
         // Power-Ups
         if (random(1) < powerUpSpawnRate && powerUps.length < maxPowerUpsAllowed) { let type = floor(random(NUM_POWERUP_TYPES)); powerUps.push(new PowerUp(type)); }
        // Background Nebulas
        if (settingBackgroundEffectsEnabled && random(1) < nebulaSpawnRate && nebulas.length < maxNebulasAllowed) { nebulas.push(new Nebula()); }
    }

    // --- Display HUD & Combo ---
    if (gameState === GAME_STATE.PLAYING) { // Ensure HUD only shows in play state
        displayHUD();
        displayComboText();
    }
}

// --- Collision and Pickup Handling ---
function handlePowerUps() {
    if (gameState !== GAME_STATE.PLAYING || isPaused) { for (let i = powerUps.length - 1; i >= 0; i--) { powerUps[i].draw(); } return; }
    if (!ship) return;
    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].update(); powerUps[i].draw();
        if (powerUps[i].hitsShip(ship)) {
            let powerUpType = powerUps[i].type; let pickupPos = powerUps[i].pos.copy(); let pickupColor = powerUps[i].color;
            powerUps.splice(i, 1); createParticles(pickupPos.x, pickupPos.y, 25, pickupColor, 4, 1.8, 0.8);
            switch (powerUpType) {
                case POWERUP_TYPES.TEMP_SHIELD: ship.tempShieldActive = true; infoMessage = "TEMPORARY SHIELD!"; createParticles(ship.pos.x, ship.pos.y, 20, color(45, 90, 100)); break;
                case POWERUP_TYPES.RAPID_FIRE: ship.rapidFireTimer = 300; infoMessage = "RAPID FIRE!"; createParticles(ship.pos.x, ship.pos.y, 20, color(120, 90, 100)); break;
                case POWERUP_TYPES.EMP_BURST: infoMessage = "EMP BURST!"; createParticles(ship.pos.x, ship.pos.y, 60, color(210, 100, 100), 12, 3.5, 1.2); for (let k = asteroids.length - 1; k >= 0; k--) { createParticles(asteroids[k].pos.x, asteroids[k].pos.y, 15, asteroids[k].color, 3, 1.5); } asteroids = []; for (let k = enemyShips.length - 1; k >= 0; k--) { createParticles(enemyShips[k].pos.x, enemyShips[k].pos.y, 20, enemyShips[k].getExplosionColor()); } enemyShips = []; enemyBullets = []; break;
                case POWERUP_TYPES.SCORE_MULT: ship.scoreMultiplierTimer = 600; ship.scoreMultiplierValue = 2; infoMessage = `SCORE x${ship.scoreMultiplierValue}!`; createParticles(ship.pos.x, ship.pos.y, 30, color(60, 100, 100)); break;
                case POWERUP_TYPES.DRONE: if (!ship.droneActive) { ship.droneActive = true; ship.drone = new Drone(ship); infoMessage = "DRONE ACTIVATED!"; createParticles(ship.pos.x, ship.pos.y, 30, color(180, 50, 100)); } else { infoMessage = "DRONE ALREADY ACTIVE!"; } break;
                case POWERUP_TYPES.INVINCIBILITY: ship.invincibilityTimer = 480; infoMessage = "INVINCIBLE!"; createParticles(ship.pos.x, ship.pos.y, 40, color(0, 0, 100)); ship.tempShieldActive = false; ship.shieldCharges = 0; break;
            }
            infoMessageTimeout = 120;
        } else if (powerUps[i].isOffscreen()) { powerUps.splice(i, 1); }
    }
}
function handleCollisions() {
    if (gameState !== GAME_STATE.PLAYING || !ship || isPaused) return;

    const destroyEnemy = (enemy, index, projectileType) => {
        let basePoints = enemy.pointsValue; let baseMoney = enemy.moneyValue;
        if (projectileType === 'HomingMissile') { basePoints *= 1.1; }
        let pointsToAdd = basePoints; if (ship.scoreMultiplierTimer > 0) { pointsToAdd *= ship.scoreMultiplierValue; }
        points += floor(pointsToAdd); money += floor(baseMoney);
        comboCounter++; comboTimer = COMBO_TIMEOUT_DURATION; maxComboReached = max(maxComboReached, comboCounter);
        if (comboCounter >= 2) { showComboText = true; comboTextTimeout = 60; }
        createParticles(enemy.pos.x, enemy.pos.y, floor(enemy.size * 1.2), enemy.getExplosionColor(), enemy.size * 0.2, 1.3, 1.0);
        enemyShips.splice(index, 1);
        checkAndUnlockCosmetics(currentLevel); // Check unlocks on enemy kill
    };

    // --- Asteroid Collisions ---
    for (let i = asteroids.length - 1; i >= 0; i--) {
        if (!asteroids[i]) continue; let asteroidHit = false;
        // Check Bullets vs Asteroid
        for (let j = bullets.length - 1; j >= 0; j--) { if (asteroids[i] && bullets[j] && asteroids[i].hits(bullets[j])) { createParticles(bullets[j].pos.x, bullets[j].pos.y, floor(random(3, 6)), color(60, 40, 100), 2, 0.8, 0.7); bullets.splice(j, 1); asteroidHit = true; break; } }
        // Check Missiles vs Asteroid
        if (!asteroidHit) { for (let j = homingMissiles.length - 1; j >= 0; j--) { if (asteroids[i] && homingMissiles[j] && asteroids[i].hits(homingMissiles[j])) { createParticles(homingMissiles[j].pos.x, homingMissiles[j].pos.y, 15, homingMissiles[j].color, 5, 1.8, 1.0); homingMissiles.splice(j, 1); asteroidHit = true; break; } } }
        // Process Asteroid Destruction if hit
        if (asteroidHit) {
            let oldPoints = points; let asteroidSizeValue = asteroids[i].size;
            let pointsToAdd = floor(map(asteroidSizeValue, minAsteroidSize, 80, 5, 15)); if (ship.scoreMultiplierTimer > 0) { pointsToAdd *= ship.scoreMultiplierValue; }
            points += pointsToAdd; money += 2;
            comboCounter++; comboTimer = COMBO_TIMEOUT_DURATION; maxComboReached = max(maxComboReached, comboCounter); if (comboCounter >= 2) { showComboText = true; comboTextTimeout = 60; }
            let shieldsToAdd = floor(points / SHIELD_POINTS_THRESHOLD) - floor(oldPoints / SHIELD_POINTS_THRESHOLD); if (shieldsToAdd > 0 && ship.shieldCharges < MAX_SHIELD_CHARGES) { let actualAdded = ship.gainShields(shieldsToAdd); if (actualAdded > 0) { infoMessage = `+${actualAdded} SHIELD CHARGE(S)!`; infoMessageTimeout = 90; } }
            let oldShapeLevel = floor(oldPoints / SHAPE_CHANGE_POINTS_THRESHOLD); let newShapeLevel = floor(points / SHAPE_CHANGE_POINTS_THRESHOLD); if (newShapeLevel > oldShapeLevel) { ship.changeShape(newShapeLevel); infoMessage = "SHIP SHAPE EVOLVED!"; infoMessageTimeout = 120; }
            let asteroidPos = asteroids[i].pos.copy(); let asteroidColor = asteroids[i].color; asteroids.splice(i, 1);
            createParticles(asteroidPos.x, asteroidPos.y, floor(asteroidSizeValue / 2.5), asteroidColor, null, 1.2, 1.1);
            if (asteroidSizeValue > minAsteroidSize * 2) { let newSize = asteroidSizeValue * 0.6; let splitSpeedMultiplier = random(0.8, 2.0); let vel1 = p5.Vector.random2D().mult(splitSpeedMultiplier); let vel2 = p5.Vector.random2D().mult(splitSpeedMultiplier); asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel1)); asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel2)); }

            // --- Level Up Check ---
            if (currentLevel < MAX_LEVEL && points >= LEVEL_THRESHOLDS[currentLevel]) {
                points += 100 * currentLevel; money += 25 * currentLevel;
                gameState = GAME_STATE.UPGRADE_SHOP; infoMessage = `Level ${currentLevel} Cleared!`; infoMessageTimeout = 180;
                checkAndUnlockCosmetics(currentLevel + 1); // Check unlocks for NEXT level entering shop
                setupShopButtons(); cursor(ARROW);
                bullets = []; homingMissiles = []; laserBeams = []; enemyShips = []; enemyBullets = []; powerUps = []; potions = [];
                comboCounter = 0; comboTimer = 0; maxComboReached = 0; showComboText = false; comboTextTimeout = 0;
                return;
            }
            // --- Win Condition Check ---
            else if (currentLevel === MAX_LEVEL && points >= LEVEL_THRESHOLDS[currentLevel]) {
                 checkAndUnlockCosmetics(MAX_LEVEL); // Final unlock check on win
                 gameState = GAME_STATE.WIN_SCREEN; infoMessage = ""; infoMessageTimeout = 0; cursor(ARROW);
                 bullets = []; homingMissiles = []; laserBeams = []; asteroids = []; particles = []; enemyShips = []; enemyBullets = []; powerUps = []; potions = [];
                 comboCounter = 0; comboTimer = 0; maxComboReached = 0; showComboText = false; comboTextTimeout = 0;
                 return;
            }
        } // End if asteroidHit
    } // End Asteroid loop

    // --- Enemy Collisions ---
    for (let i = enemyShips.length - 1; i >= 0; i--) {
        let enemy = enemyShips[i]; if (!enemy) continue; let enemyDestroyed = false;
        // Check Bullets vs Enemy
        for (let j = bullets.length - 1; j >= 0; j--) { if (bullets[j] && enemy.hits(bullets[j])) { createParticles(bullets[j].pos.x, bullets[j].pos.y, 5, color(0,0,100), 2); bullets.splice(j, 1); if (enemy.takeDamage(1)) { destroyEnemy(enemy, i, 'Bullet'); enemyDestroyed = true; } else { createParticles(enemy.pos.x, enemy.pos.y, 3, enemy.getHitColor(), 2); } break; } }
        if (enemyDestroyed) continue;
        // Check Missiles vs Enemy
        for (let j = homingMissiles.length - 1; j >= 0; j--) { if (homingMissiles[j] && enemy.hits(homingMissiles[j])) { createParticles(homingMissiles[j].pos.x, homingMissiles[j].pos.y, 20, homingMissiles[j].color, 6, 2.0, 1.2); let missileDamage = homingMissiles[j].damage || 3; homingMissiles.splice(j, 1); if (enemy.takeDamage(missileDamage)) { destroyEnemy(enemy, i, 'HomingMissile'); enemyDestroyed = true; } else { createParticles(enemy.pos.x, enemy.pos.y, 8, enemy.getHitColor(), 4); } break; } }
        if (enemyDestroyed) continue;
    } // End Enemy loop

    // --- Player Collisions (with Asteroids, Enemies, Enemy Bullets) ---
    if (ship.invulnerableTimer <= 0 && ship.invincibilityTimer <= 0) {
        const takeDamage = (sourceObject, sourceArray, index) => {
            if (ship.invincibilityTimer > 0 || ship.invulnerableTimer > 0) return false;
            let gameOver = false;
            if (comboCounter > 0) { if (maxComboReached >= 3) { let bonusPoints = maxComboReached * 5; let bonusMoney = floor(maxComboReached / 3); points += bonusPoints; money += bonusMoney; infoMessage = `Combo Broken! Bonus: +${bonusPoints} PTS, +$${bonusMoney} (Max: x${maxComboReached})`; infoMessageTimeout = 120; } comboCounter = 0; comboTimer = 0; maxComboReached = 0; showComboText = false; comboTextTimeout = 0; }
            if (ship.tempShieldActive) { ship.tempShieldActive = false; createParticles(ship.pos.x, ship.pos.y, 40, color(45, 100, 100), 5, 2.0); infoMessage = "TEMPORARY SHIELD LOST!"; infoMessageTimeout = 90; if (sourceObject instanceof EnemyBullet && sourceArray && index !== undefined) { createParticles(sourceObject.pos.x, sourceObject.pos.y, 5, color(45,90,100)); sourceArray.splice(index, 1); } }
            else if (ship.shieldCharges > 0) { ship.loseShield(); createParticles(ship.pos.x, ship.pos.y, 35, color(180, 80, 100), 4, 1.8); if (sourceObject instanceof EnemyBullet && sourceArray && index !== undefined) { createParticles(sourceObject.pos.x, sourceObject.pos.y, 5, color(180,80,100)); sourceArray.splice(index, 1); } }
            else { lives--; createParticles(ship.pos.x, ship.pos.y, 40, color(0, 90, 100), 5, 2.2); if (settingScreenShakeEnabled) { screenShakeIntensity = 7; screenShakeDuration = 120; } if (lives <= 0) { gameState = GAME_STATE.GAME_OVER; infoMessage = ""; infoMessageTimeout = 0; cursor(ARROW); gameOver = true; } else { ship.setInvulnerable(); } if (sourceObject && sourceArray && index !== undefined && sourceArray.includes(sourceObject)) { let explosionColor = (sourceObject.getExplosionColor) ? sourceObject.getExplosionColor() : (sourceObject.color || color(0,0,50)); let particleCount = sourceObject.size ? floor(sourceObject.size * 1.2) : 20; if (sourceObject instanceof EnemyBullet) { particleCount = 8; } createParticles(sourceObject.pos.x, sourceObject.pos.y, particleCount, explosionColor, sourceObject.size * 0.2); if (sourceObject instanceof KamikazeEnemy) { createParticles(sourceObject.pos.x, sourceObject.pos.y, floor(sourceObject.size * 1.5), sourceObject.getExplosionColor(), sourceObject.size * 0.3, 1.5, 1.2); } sourceArray.splice(index, 1); } }
            return gameOver;
        };
        // Check Asteroids vs Player
        for (let i = asteroids.length - 1; i >= 0; i--) { if (asteroids[i] && asteroids[i].hitsShip(ship)) { if (takeDamage(asteroids[i], asteroids, i)) return; break; } }
        // Check Enemies vs Player
        if (gameState === GAME_STATE.PLAYING) { for (let i = enemyShips.length - 1; i >= 0; i--) { let enemy = enemyShips[i]; if (enemy && enemy.hitsShip(ship)) { if (takeDamage(enemy, enemyShips, i)) return; break; } } }
        // Check Enemy Bullets vs Player
        if (gameState === GAME_STATE.PLAYING) { for (let i = enemyBullets.length - 1; i >= 0; i--) { if (enemyBullets[i] && enemyBullets[i].hitsShip(ship)) { if (takeDamage(enemyBullets[i], enemyBullets, i)) return; break; } } }
    } // End player collision check
}
function handlePotions() {
    if (gameState !== GAME_STATE.PLAYING || isPaused) { for (let i = potions.length - 1; i >= 0; i--) { potions[i].draw(); } return; }
    if (!ship) return;
    for (let i = potions.length - 1; i >= 0; i--) {
        potions[i].update(); potions[i].draw();
        if (potions[i].hitsShip(ship)) { createParticles(potions[i].pos.x, potions[i].pos.y, 20, color(0, 80, 100), 4, 1.5); if (lives < MAX_LIVES) { lives++; infoMessage = "+1 LIFE!"; infoMessageTimeout = 90; } else { let pointsToAdd = 25; if(ship.scoreMultiplierTimer > 0) { pointsToAdd *= ship.scoreMultiplierValue; } points += pointsToAdd; infoMessage = `+${pointsToAdd} POINTS (MAX LIVES)!`; infoMessageTimeout = 90; } potions.splice(i, 1); }
        else if (potions[i].isOffscreen()) { potions.splice(i, 1); }
    }
}

// --- Background Drawing Functions ---
function drawBackgroundAndStars() {
    for(let y=0; y < height; y++){ let inter = map(y, 0, height, 0, 1); let c = lerpColor(currentTopColor, currentBottomColor, inter); stroke(c); line(0, y, width, y); } noStroke();
    if (settingBackgroundEffectsEnabled) {
         for (let i = nebulas.length - 1; i >= 0; i--) { if (gameState === GAME_STATE.PLAYING && !isPaused) nebulas[i].update(); nebulas[i].draw(); if (nebulas[i].isOffscreen()) { nebulas.splice(i, 1); } }
         drawBlackHole(); drawGalaxy(); if (planetVisible) { drawPlanet(); }
         for (let i = shootingStars.length - 1; i >= 0; i--) { if (!(gameState === GAME_STATE.PLAYING && isPaused)) shootingStars[i].update(); shootingStars[i].draw(); if (shootingStars[i].isDone()) { shootingStars.splice(i, 1); } }
         for (let star of stars) { if (!(gameState === GAME_STATE.PLAYING && isPaused)) star.update(); star.draw(); }
    } else { fill(0, 0, 80, 70); noStroke(); for (let star of stars) { ellipse(star.x, star.y, 1.5, 1.5); if (!(gameState === GAME_STATE.PLAYING && isPaused)) { star.y += star.speed * 0.5; if (star.y > height + 2) { star.y = -2; star.x = random(width); } } } }
}
function drawBlackHole() { push(); let bhX = width * 0.8; let bhY = height * 0.2; let bhSize = width * 0.05; fill(0); noStroke(); ellipse(bhX, bhY, bhSize * 1.1, bhSize * 1.1); let ringCount = 7; let maxRingSize = bhSize * 3.5; let minRingSize = bhSize * 1.2; noFill(); let slowVariation = sin(frameCount * 0.01); for (let i = 0; i < ringCount; i++) { let sizeFactor = lerp(0.95, 1.05, (sin(frameCount * 0.02 + i * 0.5) + 1) / 2); let size = lerp(minRingSize, maxRingSize, i / (ringCount - 1)) * sizeFactor; let hue = lerp(0, 60, i / (ringCount - 1)) + sin(frameCount * 0.03 + i) * 5; let alpha = map(i, 0, ringCount - 1, 50, 3); let sw = map(i, 0, ringCount - 1, 1.5, 5); strokeWeight(sw); stroke(hue, 90, 90, alpha); ellipse(bhX, bhY, size, size); } pop(); }
function drawGalaxy() { push(); let centerX = width / 2; let centerY = height / 2; let baseHue1 = 270; let baseHue2 = 200; let alphaVal = 2.5; let angle = frameCount * 0.0003; translate(centerX, centerY); rotate(angle); translate(-centerX, -centerY); noStroke(); fill(baseHue1, 50, 60, alphaVal); ellipse(centerX - width * 0.1, centerY - height * 0.1, width * 1.3, height * 0.35); fill(baseHue2, 60, 70, alphaVal); ellipse(centerX + width * 0.15, centerY + height * 0.05, width * 1.2, height * 0.45); fill((baseHue1 + baseHue2) / 2, 55, 65, alphaVal * 0.9); ellipse(centerX, centerY, width * 1.0, height * 0.55); pop(); }
function drawPlanet() { push(); translate(planetPos.x, planetPos.y); noStroke(); fill(planetBaseColor); ellipse(0, 0, planetSize, planetSize); let detailScale = 0.01; let detailLayers = 3; for (let layer = 0; layer < detailLayers; layer++) { let layerColor = (layer === 0) ? planetDetailColor1 : lerpColor(planetDetailColor2, planetBaseColor, layer / detailLayers); let layerAlpha = map(layer, 0, detailLayers - 1, 80, 40); fill(hue(layerColor), saturation(layerColor), brightness(layerColor), layerAlpha); beginShape(); for (let angle = 0; angle < TWO_PI; angle += PI / 60) { let xoff = map(cos(angle), -1, 1, 0, 3 + layer); let yoff = map(sin(angle), -1, 1, 0, 3 + layer); let noiseVal = noise(planetNoiseSeed + xoff * detailScale, planetNoiseSeed + 100 + yoff * detailScale, frameCount * 0.001 * (layer + 1)); let radius = planetSize / 2 * (0.9 - layer * 0.1) * (1 + map(noiseVal, 0, 1, -0.15, 0.15)); let x = radius * cos(angle); let y = radius * sin(angle); vertex(x, y); } endShape(CLOSE); } let cloudLayers = 4; let cloudOffsetSpeed = 0.005; for (let i = 0; i < cloudLayers; i++) { let cloudAlpha = map(i, 0, cloudLayers - 1, 60, 25); fill(0, 0, 100, cloudAlpha); let cloudAngleOffset = frameCount * cloudOffsetSpeed * (i + 1) * (i % 2 === 0 ? 1 : -1.2); let cloudSize = planetSize * (0.8 - i * 0.1); let startAngle = cloudAngleOffset + i * PI / 5 + noise(planetNoiseSeed + 300 + i, frameCount * 0.002) * PI; let endAngle = startAngle + PI * (0.4 + noise(planetNoiseSeed + 400 + i, frameCount * 0.0025) * 0.8); arc(0, 0, cloudSize, cloudSize, startAngle, endAngle, OPEN); arc(0, 0, cloudSize * 0.95, cloudSize * 0.95, startAngle + PI*0.1, endAngle + PI*0.1, OPEN); } let glowColor = lerpColor(planetBaseColor, color(hue(planetBaseColor), 10, 100), 0.5); noFill(); for(let i=0; i<5; i++) { strokeWeight(planetSize * 0.02 * i + 1); stroke(hue(glowColor), saturation(glowColor), brightness(glowColor), 15 - i*2.5); ellipse(0, 0, planetSize * (1.0 + i * 0.03), planetSize * (1.0 + i * 0.03)); } pop(); }

// --- HUD & Info Messages ---
function displayHUD() {
    let hudH = isMobile ? 45 : 60; let topMargin = 5; let sideMargin = 10; let iconSize = isMobile ? 16 : 20; let textSizeVal = isMobile ? 18 : 22; let spacing = isMobile ? 8 : 12; let bottomMargin = 10;
    fill(uiPanelColor); stroke(uiBorderColor); strokeWeight(1.5); rect(0, 0, width, hudH);
    textSize(textSizeVal); textAlign(LEFT, CENTER); let currentX = sideMargin;
    fill(uiTextColor); text(`LEVEL: ${currentLevel}`, currentX, hudH / 2); currentX += textWidth(`LEVEL: ${currentLevel}`) + spacing * 2;
    text(`PTS: ${points}`, currentX, hudH / 2); currentX += textWidth(`PTS: ${points}`) + spacing * 2;
    fill(uiHighlightColor); text(`$: ${money}`, currentX, hudH / 2); currentX += textWidth(`$: ${money}`) + spacing * 2;
    fill(color(0, 80, 100)); text(`♥: ${lives}`, currentX, hudH / 2); currentX += textWidth(`♥: ${lives}`) + spacing * 2;
    fill(color(180, 70, 100)); text(`🛡: ${ship.shieldCharges}`, currentX, hudH / 2); currentX += textWidth(`🛡: ${ship.shieldCharges}`) + spacing * 1.5;
    if (ship && ship.homingMissilesLevel > 0) { fill(color(30, 80, 100)); text(`🚀: ${ship.currentMissiles}`, currentX, hudH / 2); currentX += textWidth(`🚀: ${ship.currentMissiles}`) + spacing * 1.5; }
    if (ship && ship.scoreMultiplierTimer > 0) { let multColor = color(60, 100, 100); let alpha = map(sin(frameCount*0.2), -1, 1, 70, 100); fill(hue(multColor), saturation(multColor), brightness(multColor), alpha); let indicatorText = `x${ship.scoreMultiplierValue}`; text(indicatorText, currentX, hudH / 2); noFill(); stroke(hue(multColor), saturation(multColor), brightness(multColor), alpha * 0.5); strokeWeight(1.5); ellipse(currentX + textWidth(indicatorText)/2, hudH/2, iconSize*1.2, iconSize*1.2); currentX += textWidth(indicatorText) + spacing * 1.5; }

    textAlign(RIGHT, BOTTOM); fill(uiTextColor); textSize(textSizeVal * 0.8);
    let upgradesText = `RATE:${ship.fireRateLevel} SPRD:${ship.spreadShotLevel}`;
    if (ship.rearGunLevel > 0) upgradesText += ` REAR:${ship.rearGunLevel}`; if (ship.laserBeamLevel > 0) upgradesText += ` LASR:${ship.laserBeamLevel}`;
    text(upgradesText, width - sideMargin, height - bottomMargin);

    if (isMobile && gameState === GAME_STATE.PLAYING && !isPaused && ship) {
        let setBtn = mobileSettingsButton; fill(uiPanelColor); stroke(uiBorderColor); strokeWeight(1.5); rect(setBtn.x, setBtn.y, setBtn.size, setBtn.size, 5); push(); translate(setBtn.x + setBtn.size / 2, setBtn.y + setBtn.size / 2); noFill(); stroke(uiTextColor); strokeWeight(2); ellipse(0, 0, setBtn.size * 0.5, setBtn.size * 0.5); for (let i = 0; i < 6; i++) { rotate(PI / 3); rect(-setBtn.size * 0.1, -setBtn.size * 0.4, setBtn.size * 0.2, setBtn.size * 0.2); } pop();
        if (ship.homingMissilesLevel > 0) { let btn = mobileMissileButton; let btnColor = uiButtonColor; let textColor = uiTextColor; let borderColor = uiButtonBorderColor; let icon = '🚀'; let subText = `${ship.currentMissiles}`; let isDisabled = ship.currentMissiles <= 0 || ship.missileCooldown > 0; if (isDisabled) { btnColor = uiButtonDisabledColor; textColor = color(0, 0, 60); borderColor = color(0, 0, 40); if (ship.missileCooldown > 0) { subText = `${ceil(ship.missileCooldown / 60)}`; } } fill(btnColor); stroke(borderColor); strokeWeight(1.5); rect(btn.x, btn.y, btn.size, btn.size, 8); textSize(btn.size * 0.5); fill(textColor); noStroke(); text(icon, btn.x + btn.size / 2, btn.y + btn.size * 0.45); textSize(btn.size * 0.25); fill(textColor); text(subText, btn.x + btn.size / 2, btn.y + btn.size * 0.8); }
        if (ship.laserBeamLevel > 0) { let btn = mobileLaserButton; let btnColor = uiButtonColor; let textColor = uiTextColor; let borderColor = uiButtonBorderColor; let icon = '⚡'; let subText = ``; let isDisabled = ship.laserActive || ship.laserCooldown > 0; if (isDisabled) { btnColor = uiButtonDisabledColor; textColor = color(0, 0, 60); borderColor = color(0, 0, 40); if (ship.laserActive) { subText = `${ceil(ship.laserDuration / 60)}`; btnColor = color(0, 80, 70); } else if (ship.laserCooldown > 0) { subText = `${ceil(ship.laserCooldown / 60)}`; } } fill(btnColor); stroke(borderColor); strokeWeight(1.5); rect(btn.x, btn.y, btn.size, btn.size, 8); textSize(btn.size * 0.5); fill(textColor); noStroke(); text(icon, btn.x + btn.size / 2, btn.y + btn.size * 0.45); if(subText !== '') { textSize(btn.size * 0.25); fill(textColor); text(subText, btn.x + btn.size / 2, btn.y + btn.size * 0.8); } }
    }
}
function displayInfoMessage() {
    let msgSize = isMobile ? 15 : 18; textSize(msgSize); textAlign(CENTER, CENTER);
    let msgWidth = textWidth(infoMessage); let padding = 10; let boxH = msgSize + padding;
    let boxY = height - boxH - (isMobile? 15 : 30);
    fill(uiPanelColor); stroke(uiBorderColor); strokeWeight(1.5); rect(width/2 - msgWidth/2 - padding, boxY, msgWidth + padding*2, boxH, 5);
    fill(uiTextColor); noStroke(); text(infoMessage, width / 2, boxY + boxH / 2);
}
function displayComboText() { if (showComboText && comboCounter >= 2) { let comboSize = isMobile ? 28 : 36; let comboY = height * 0.25; let alpha = map(comboTextTimeout, 0, 60, 0, 100); push(); textAlign(CENTER, CENTER); textSize(comboSize); let scaleFactor = 1.0 + sin(map(comboTextTimeout, 60, 0, 0, PI)) * 0.08; translate(width / 2, comboY); scale(scaleFactor); stroke(0, 0, 0, alpha * 0.8); strokeWeight(4); fill(uiHighlightColor); text(`COMBO x${comboCounter}!`, 0, 0); noStroke(); fill(255); pop(); } }

// --- Game State Control ---
function resetGame() {
    ship = new Ship(); // Uses selected cosmetics now
    bullets = []; homingMissiles = []; laserBeams = [];
    particles = []; asteroids = []; potions = []; enemyShips = []; enemyBullets = []; powerUps = []; nebulas = []; shootingStars = [];
    points = 0; money = 0; lives = 3; currentLevel = 1;
    setDifficultyForLevel(currentLevel);
    lastPlanetAppearanceTime = -Infinity; planetVisible = false;
    frameCount = 0; infoMessage = ""; infoMessageTimeout = 0;
    screenShakeDuration = 0; screenShakeIntensity = 0;
    isPaused = false; levelTransitionFlash = 0;
    comboCounter = 0; comboTimer = 0; maxComboReached = 0; showComboText = false; comboTextTimeout = 0;
    spacebarHeld = false;
    cursor(); // Reset cursor
    spawnInitialAsteroids();
    checkAndUnlockCosmetics(currentLevel); // Ensure level 1 cosmetics are marked unlocked
}
function startGame() { resetGame(); gameState = GAME_STATE.PLAYING; }
function startNextLevel() {
    if (gameState !== GAME_STATE.UPGRADE_SHOP) return;
    currentLevel++;
    checkAndUnlockCosmetics(currentLevel); // Check unlocks for the level being started
    setDifficultyForLevel(currentLevel);
    ship.resetPositionForNewLevel();
    if (ship.homingMissilesLevel > 0) { ship.currentMissiles = ship.maxMissiles; }
    asteroids = []; bullets = []; homingMissiles = []; laserBeams = []; enemyShips = []; enemyBullets = []; powerUps = []; potions = [];
    frameCount = 0; infoMessage = `Starting Level ${currentLevel}`; infoMessageTimeout = 90;
    levelTransitionFlash = 15;
    spawnInitialAsteroids();
    gameState = GAME_STATE.PLAYING;
    cursor();
}
function selectMenuItem(index) {
    switch (menuItems[index]) {
        case 'Start Game': startGame(); break;
        case 'Settings': previousGameState = gameState; gameState = GAME_STATE.SETTINGS_MENU; selectedSettingsItem = 0; break;
        case 'Cosmetics': previousGameState = gameState; gameState = GAME_STATE.COSMETICS_MENU; selectedCosmeticsItem = 0; break; // Added
    }
}
function selectSettingsItemAction(index) { let setting = settingsItems[index]; switch (setting.id) { case 'screenShake': settingScreenShakeEnabled = !settingScreenShakeEnabled; break; case 'backgroundFx': settingBackgroundEffectsEnabled = !settingBackgroundEffectsEnabled; if (!settingBackgroundEffectsEnabled) { nebulas = []; shootingStars = []; planetVisible = false; } break; case 'particleDensity': let currentDensityIndex = setting.options.indexOf(settingParticleDensity); let nextDensityIndex = (currentDensityIndex + 1) % setting.options.length; settingParticleDensity = setting.options[nextDensityIndex]; break; case 'back': gameState = previousGameState; if(previousGameState === GAME_STATE.PLAYING) { isPaused = false; cursor();} selectedMenuItem = 0; break; } }
// Function to handle actions in the cosmetics menu
function selectCosmeticsItemAction(index) {
    let setting = cosmeticsItems[index];
    if (setting.id === 'back') {
        gameState = previousGameState;
        if(previousGameState === GAME_STATE.PLAYING) { isPaused = false; cursor(); }
        selectedMenuItem = 0;
        return;
    }
    if (setting.type === 'cycle') {
        let category = setting.category; // e.g., 'palettes'
        let selectedKey = selectedCosmetics[category.slice(0,-1)]; // e.g., 'palette'
        let unlockedKeys = Object.keys(unlockedCosmetics[category]);
        let currentIndex = unlockedKeys.indexOf(selectedKey);
        if (currentIndex === -1) currentIndex = 0; // Fallback if somehow invalid
        let nextIndex = (currentIndex + 1) % unlockedKeys.length;
        selectedCosmetics[category.slice(0,-1)] = unlockedKeys[nextIndex];
        if (ship) { ship.applyCosmetics(); } // Apply immediately if ship exists (e.g., if accessed via pause)
    }
}

// --- Input Handling ---
function mousePressed() {
    let btn = mobileSettingsButton;
    if (gameState === GAME_STATE.PLAYING && !isPaused && isMobile && mouseX > btn.x && mouseX < btn.x + btn.size + btn.padding*2 && mouseY > btn.y && mouseY < btn.y + btn.size + btn.padding*2) { isPaused = true; previousGameState = gameState; gameState = GAME_STATE.SETTINGS_MENU; selectedSettingsItem = 0; cursor(ARROW); return; }

    switch (gameState) {
        case GAME_STATE.START_MENU: for (let i = 0; i < startMenuButtons.length; i++) { let button = startMenuButtons[i]; if (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h) { selectedMenuItem = i; selectMenuItem(i); return; } } break;
        case GAME_STATE.SETTINGS_MENU: for (let i = 0; i < settingsMenuButtons.length; i++) { let button = settingsMenuButtons[i]; if (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h) { selectedSettingsItem = i; selectSettingsItemAction(i); return; } } break;
        case GAME_STATE.COSMETICS_MENU: for (let i = 0; i < cosmeticsMenuButtons.length; i++) { let button = cosmeticsMenuButtons[i]; if (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h) { selectedCosmeticsItem = i; selectCosmeticsItemAction(i); return; } } break; // Added cosmetics menu handling
        case GAME_STATE.PLAYING: if (!isPaused && ship) { let hitMobileUI = false; if (isMobile) { let misBtn = mobileMissileButton; let lasBtn = mobileLaserButton; if (mouseX > btn.x && mouseX < btn.x + btn.size + btn.padding*2 && mouseY > btn.y && mouseY < btn.y + btn.size + btn.padding*2) hitMobileUI = true; if (!hitMobileUI && ship.homingMissilesLevel > 0 && mouseX > misBtn.x && mouseX < misBtn.x + misBtn.size && mouseY > misBtn.y && mouseY < misBtn.y + misBtn.size) hitMobileUI = true; if (!hitMobileUI && ship.laserBeamLevel > 0 && mouseX > lasBtn.x && mouseX < lasBtn.x + lasBtn.size && mouseY > lasBtn.y && mouseY < lasBtn.y + lasBtn.size) hitMobileUI = true; } if (!hitMobileUI) { ship.shoot(); } } break;
        case GAME_STATE.UPGRADE_SHOP: for (let button of shopButtons) { if (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h) { handleShopButtonPress(button.id); break; } } break;
        case GAME_STATE.GAME_OVER: case GAME_STATE.WIN_SCREEN: previousGameState = gameState; gameState = GAME_STATE.START_MENU; selectedMenuItem = 0; initializeCosmetics(); break; // Reset cosmetics on returning to menu
    }
}
function mouseReleased() { /* No action needed */ }
function keyPressed() {
    if (keyCode === ESCAPE) {
        if (gameState === GAME_STATE.PLAYING) { isPaused = !isPaused; if (isPaused) {cursor(ARROW); previousGameState = gameState;} else {cursor();} }
        else if (gameState === GAME_STATE.SETTINGS_MENU) { selectSettingsItemAction(settingsItems.findIndex(item => item.id === 'back')); }
        else if (gameState === GAME_STATE.COSMETICS_MENU) { selectCosmeticsItemAction(cosmeticsItems.findIndex(item => item.id === 'back')); } // Added cosmetics menu escape
    }
    else if (gameState === GAME_STATE.START_MENU) { if (keyCode === UP_ARROW) { selectedMenuItem = (selectedMenuItem - 1 + menuItems.length) % menuItems.length; } else if (keyCode === DOWN_ARROW) { selectedMenuItem = (selectedMenuItem + 1) % menuItems.length; } else if (keyCode === ENTER || keyCode === RETURN) { selectMenuItem(selectedMenuItem); } }
    else if (gameState === GAME_STATE.SETTINGS_MENU) { if (keyCode === UP_ARROW) { selectedSettingsItem = (selectedSettingsItem - 1 + settingsItems.length) % settingsItems.length; } else if (keyCode === DOWN_ARROW) { selectedSettingsItem = (selectedSettingsItem + 1) % settingsItems.length; } else if (keyCode === ENTER || keyCode === RETURN) { selectSettingsItemAction(selectedSettingsItem); } }
    else if (gameState === GAME_STATE.COSMETICS_MENU) { if (keyCode === UP_ARROW) { selectedCosmeticsItem = (selectedCosmeticsItem - 1 + cosmeticsItems.length) % cosmeticsItems.length; } else if (keyCode === DOWN_ARROW) { selectedCosmeticsItem = (selectedCosmeticsItem + 1) % cosmeticsItems.length; } else if (keyCode === ENTER || keyCode === RETURN) { selectCosmeticsItemAction(selectedCosmeticsItem); } } // Added cosmetics menu navigation
    else if (gameState === GAME_STATE.PLAYING && !isPaused && ship) { if (keyCode === 32) { if (!spacebarHeld) { spacebarHeld = true; } return false; } if (keyCode === 77) { ship.fireMissile(); return false; } if (keyCode === 76) { ship.fireLaser(); return false; } }
    else if (gameState === GAME_STATE.UPGRADE_SHOP) { if (keyCode === ENTER || keyCode === RETURN) { handleShopButtonPress('nextLevel'); } }
    else if (gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN_SCREEN) { if (keyCode === ENTER || keyCode === RETURN) { previousGameState = gameState; gameState = GAME_STATE.START_MENU; selectedMenuItem = 0; initializeCosmetics(); } } // Reset cosmetics
}
function keyReleased() { if (keyCode === 32) { spacebarHeld = false; } } // Just reset flag
function touchStarted() {
    if (touches.length === 0) return false;
    let touchX = touches[0].x; let touchY = touches[0].y;
    let setBtn = mobileSettingsButton; let misBtn = mobileMissileButton; let lasBtn = mobileLaserButton;

    if (gameState === GAME_STATE.PLAYING && !isPaused && isMobile && ship) { if (touchX > setBtn.x && touchX < setBtn.x + setBtn.size + setBtn.padding*2 && touchY > setBtn.y && touchY < setBtn.y + setBtn.size + setBtn.padding*2) { isPaused = true; previousGameState = gameState; gameState = GAME_STATE.SETTINGS_MENU; selectedSettingsItem = 0; cursor(ARROW); return false; } if (ship.homingMissilesLevel > 0 && touchX > misBtn.x && touchX < misBtn.x + misBtn.size && touchY > misBtn.y && touchY < misBtn.y + misBtn.size) { ship.fireMissile(); return false; } if (ship.laserBeamLevel > 0 && touchX > lasBtn.x && touchX < lasBtn.x + lasBtn.size && touchY > lasBtn.y && touchY < lasBtn.y + lasBtn.size) { ship.fireLaser(); return false; } }
    else if (gameState === GAME_STATE.START_MENU) { for (let i = 0; i < startMenuButtons.length; i++) { let button = startMenuButtons[i]; if (touchX > button.x && touchX < button.x + button.w && touchY > button.y && touchY < button.y + button.h) { selectedMenuItem = i; selectMenuItem(i); return false; } } return false; }
    else if (gameState === GAME_STATE.SETTINGS_MENU) { for (let i = 0; i < settingsMenuButtons.length; i++) { let button = settingsMenuButtons[i]; if (touchX > button.x && touchX < button.x + button.w && touchY > button.y && touchY < button.y + button.h) { selectedSettingsItem = i; selectSettingsItemAction(i); return false; } } return false; }
    else if (gameState === GAME_STATE.COSMETICS_MENU) { for (let i = 0; i < cosmeticsMenuButtons.length; i++) { let button = cosmeticsMenuButtons[i]; if (touchX > button.x && touchX < button.x + button.w && touchY > button.y && touchY < button.y + button.h) { selectedCosmeticsItem = i; selectCosmeticsItemAction(i); return false; } } return false; } // Added cosmetics touch
    else if (gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN_SCREEN) { previousGameState = gameState; gameState = GAME_STATE.START_MENU; selectedMenuItem = 0; initializeCosmetics(); return false; } // Reset cosmetics
    else if (gameState === GAME_STATE.UPGRADE_SHOP) { for (let button of shopButtons) { if (touchX > button.x && touchX < button.x + button.w && touchY > button.y && touchY < button.y + button.h) { handleShopButtonPress(button.id); return false; } } return false; }
    else if (gameState === GAME_STATE.PLAYING && !isPaused && ship) { let hitUI = false; if (isMobile) { if (touchX > setBtn.x && touchX < setBtn.x + setBtn.size + setBtn.padding*2 && touchY > setBtn.y && touchY < setBtn.y + setBtn.size + setBtn.padding*2) hitUI = true; if (!hitUI && ship.homingMissilesLevel > 0 && touchX > misBtn.x && touchX < misBtn.x + misBtn.size && touchY > misBtn.y && touchY < misBtn.y + misBtn.size) hitUI = true; if (!hitUI && ship.laserBeamLevel > 0 && touchX > lasBtn.x && touchX < lasBtn.x + lasBtn.size && touchY > lasBtn.y && touchY < lasBtn.y + lasBtn.size) hitUI = true; } if (!hitUI) { ship.shoot(); } return false; }
    return false;
}
function touchEnded() { /* No action needed */ return false; }
function handleShopButtonPress(buttonId) { if (gameState !== GAME_STATE.UPGRADE_SHOP || !ship) return; if (buttonId === 'nextLevel') { startNextLevel(); } else { let success = ship.attemptUpgrade(buttonId); if (success) { let button = shopButtons.find(b => b.id === buttonId); if(button) { createParticles(button.x + button.w / 2, button.y + button.h / 2, 20, color(120, 80, 100), 6, 2.0, 0.8); if (buttonId === 'homingMissiles') { ship.currentMissiles = ship.maxMissiles; } } } else { let cost = ship.getUpgradeCost(buttonId); if (cost !== "MAX" && money < cost) { infoMessage = "Not enough money!"; infoMessageTimeout = 60; } else if (cost === "MAX") { infoMessage = "Upgrade Maxed Out!"; infoMessageTimeout = 60; } } } }
function windowResized() { resizeCanvas(windowWidth, windowHeight); createStarfield(200); if (gameState === GAME_STATE.START_MENU) { setupMenuButtons(); } if (gameState === GAME_STATE.SETTINGS_MENU) { setupSettingsMenuButtons(); } if (gameState === GAME_STATE.COSMETICS_MENU) { setupCosmeticsMenuButtons(); } // Added resize for cosmetics menu
    if (gameState === GAME_STATE.UPGRADE_SHOP) { setupShopButtons(); } calculateMobileSettingsButtonPosition(); calculateMobileActionButtonsPosition(); }


// ======================================================================
// ========================== CLASS DEFINITIONS =========================
// ======================================================================

// Ship Class
// MODIFIED: Apply cosmetic colors in constructor and draw, applyCosmetics method added
class Ship {
    constructor() {
        this.pos = createVector(width / 2, height - 50);
        this.vel = createVector(0, 0);
        this.thrust = 0.38;
        this.touchThrustMultiplier = 1.15;
        this.friction = 0.975;
        this.maxSpeed = 9.5;
        this.size = 30;

        // Cosmetic Color Placeholders - set by applyCosmetics
        this.bodyColor = null; this.cockpitColor = null; this.wingColor = null;
        this.detailColor1 = null; this.detailColor2 = null;
        this.engineColor1 = null; this.engineColor2 = null;
        this.applyCosmetics(); // Apply initially selected cosmetics

        this.shapeState = 0;
        this.shootCooldown = 0;
        this.baseShootDelay = 15;
        this.shootDelayPerLevel = 2;
        this.shieldCharges = 0;
        this.shieldVisualRadius = this.size * 1.3;
        this.invulnerableTimer = 0;
        this.invulnerabilityDuration = 120;
        this.hoverOffset = 0;
        this.rapidFireTimer = 0;
        this.tempShieldActive = false;
        this.fireRateLevel = 0;
        this.spreadShotLevel = 0;
        this.maxUpgradeLevel = 5;
        this.rearGunLevel = 0; this.maxRearGunLevel = 3; this.rearGunDelayFactor = [0, 1.5, 1.2, 1.0];
        this.homingMissilesLevel = 0; this.maxMissileLevel = 4; this.missileCapacity = [0, 2, 3, 4, 5]; this.missileDamage = [0, 3, 4, 5, 6]; this.missileRegenTime = [0, 480, 420, 360, 300]; this.maxMissiles = 0; this.currentMissiles = 0; this.missileRegenTimer = 0; this.missileCooldown = 0; this.missileColor = color(30, 90, 100);
        this.laserBeamLevel = 0; this.maxLaserLevel = 3; this.laserDamageFactor = [0, 1.0, 1.5, 2.0]; this.laserDurationTime = [0, 120, 150, 180]; this.laserCooldownTime = [0, 400, 350, 300]; this.laserActive = false; this.laserDuration = 0; this.laserCooldown = 0; this.laserColor = color(0, 90, 100);
        this.baseUpgradeCost = 30; this.costMultiplier = 2.0; this.specialCostMultiplier = 2.5;
        this.scoreMultiplierTimer = 0; this.scoreMultiplierValue = 1;
        this.droneActive = false; this.drone = null;
        this.invincibilityTimer = 0;
    }

    applyCosmetics() {
        let palette = cosmetics.palettes[selectedCosmetics.palette];
        if (!palette) palette = cosmetics.palettes['default']; // Fallback
        this.bodyColor = color(palette.body[0], palette.body[1], palette.body[2]);
        this.cockpitColor = color(palette.cockpit[0], palette.cockpit[1], palette.cockpit[2]);
        this.wingColor = color(palette.wing[0], palette.wing[1], palette.wing[2]);
        this.detailColor1 = color(palette.detail1[0], palette.detail1[1], palette.detail1[2]);
        this.detailColor2 = color(palette.detail2[0], palette.detail2[1], palette.detail2[2]);

        let trail = cosmetics.engineTrails[selectedCosmetics.engineTrail];
        if (!trail) trail = cosmetics.engineTrails['default']; // Fallback
        this.engineColor1 = color(trail.color1[0], trail.color1[1], trail.color1[2]);
        this.engineColor2 = color(trail.color2[0], trail.color2[1], trail.color2[2]);
        // Bullet style is applied in the Bullet class itself based on global selectedCosmetics.bulletStyle
    }

    gainShields(amount) { let currentCharges = this.shieldCharges; this.shieldCharges = min(this.shieldCharges + amount, MAX_SHIELD_CHARGES); return this.shieldCharges - currentCharges; }
    loseShield() { if (this.shieldCharges > 0) { this.shieldCharges--; } }
    setInvulnerable() { this.invulnerableTimer = this.invulnerabilityDuration; }
    changeShape(level) { this.shapeState = min(1, floor(level / 2)); }
    get currentShootDelay() { if (this.rapidFireTimer > 0) { return 2; } else { return max(3, this.baseShootDelay - (this.fireRateLevel * this.shootDelayPerLevel)); } }

    getUpgradeCost(upgradeType) {
        let level, maxLevel, multiplier = this.costMultiplier;
        switch (upgradeType) { case 'fireRate': level = this.fireRateLevel; maxLevel = this.maxUpgradeLevel; break; case 'spreadShot': level = this.spreadShotLevel; maxLevel = this.maxUpgradeLevel; break; case 'rearGun': level = this.rearGunLevel; maxLevel = this.maxRearGunLevel; multiplier = this.costMultiplier * 0.8; break; case 'homingMissiles': level = this.homingMissilesLevel; maxLevel = this.maxMissileLevel; multiplier = this.specialCostMultiplier; break; case 'laserBeam': level = this.laserBeamLevel; maxLevel = this.maxLaserLevel; multiplier = this.specialCostMultiplier; break; default: return Infinity; }
        if (level >= maxLevel) return "MAX";
        return floor(this.baseUpgradeCost * pow(multiplier, level));
    }

    attemptUpgrade(upgradeType) {
        let cost = this.getUpgradeCost(upgradeType); if (typeof cost !== 'number' || money < cost) return false; money -= cost;
        switch (upgradeType) { case 'fireRate': this.fireRateLevel++; break; case 'spreadShot': this.spreadShotLevel++; break; case 'rearGun': this.rearGunLevel++; break; case 'homingMissiles': this.homingMissilesLevel++; this.maxMissiles = this.missileCapacity[this.homingMissilesLevel]; break; case 'laserBeam': this.laserBeamLevel++; break; default: money += cost; return false; }
        return true;
    }

    resetPositionForNewLevel() { this.pos.set(width / 2, height - 50); this.vel.set(0, 0); this.invulnerableTimer = 60; this.rapidFireTimer = 0; this.tempShieldActive = false; this.laserActive = false; this.laserDuration = 0; this.laserCooldown = 0; this.missileCooldown = 0; this.scoreMultiplierTimer = 0; this.scoreMultiplierValue = 1; this.droneActive = false; this.drone = null; this.invincibilityTimer = 0; }

    update() {
        // Timers
        if (this.invulnerableTimer > 0) { this.invulnerableTimer--; } if (this.rapidFireTimer > 0) { this.rapidFireTimer--; } if (this.shootCooldown > 0) { this.shootCooldown--; } if (this.missileCooldown > 0) { this.missileCooldown--; } if (this.laserCooldown > 0) { this.laserCooldown--; } if (this.scoreMultiplierTimer > 0) { this.scoreMultiplierTimer--; if(this.scoreMultiplierTimer <= 0) this.scoreMultiplierValue = 1;} if (this.invincibilityTimer > 0) { this.invincibilityTimer--; }
        // Drone
        if (this.droneActive && this.drone && this.drone.isExpired()) { this.droneActive = false; this.drone = null; infoMessage = "Drone Deactivated"; infoMessageTimeout = 90; createParticles(this.pos.x, this.pos.y, 15, color(180, 50, 80), 4, 1.5, 0.8); }
        // Laser
        if (this.laserActive) { this.laserDuration--; if (this.laserDuration <= 0) { this.laserActive = false; this.laserCooldown = this.laserCooldownTime[this.laserBeamLevel]; laserBeams = []; } }
        // Missile Regen
        if (this.homingMissilesLevel > 0 && this.currentMissiles < this.maxMissiles) { this.missileRegenTimer--; if (this.missileRegenTimer <= 0) { this.currentMissiles++; this.missileRegenTimer = this.missileRegenTime[this.homingMissilesLevel]; } } else if (this.homingMissilesLevel > 0) { this.missileRegenTimer = this.missileRegenTime[this.homingMissilesLevel]; }

        // --- Player Input & Movement ---
        this.hoverOffset = sin(frameCount * 0.05) * 2;
        let isTouching = isMobile && touches.length > 0; let acceleration = createVector(0, 0); let applyThrustParticles = false;
        if (isTouching) { let touchPos = createVector(touches[0].x, touches[0].y); let direction = p5.Vector.sub(touchPos, this.pos); if (direction.magSq() > (this.size * 0.5) * (this.size * 0.5)) { let targetVel = direction.copy().normalize().mult(this.maxSpeed * this.touchThrustMultiplier); this.vel.lerp(targetVel, 0.15); applyThrustParticles = this.vel.magSq() > 0.1; } else { this.vel.mult(this.friction); } }
        else { let currentThrust = this.thrust; if (!isMobile) { currentThrust *= 1.5; } let movingUp = keyIsDown(UP_ARROW) || keyIsDown(87); let movingDown = keyIsDown(DOWN_ARROW) || keyIsDown(83); let movingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65); let movingRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68); if (movingUp) { acceleration.y -= currentThrust; applyThrustParticles = true;} if (movingDown) { acceleration.y += currentThrust; } if (movingLeft) { acceleration.x -= currentThrust; applyThrustParticles = true;} if (movingRight) { acceleration.x += currentThrust; applyThrustParticles = true;} this.vel.add(acceleration); this.vel.mult(this.friction); }
        if (applyThrustParticles && frameCount % 3 === 0) { // Use cosmetic engine colors
            let thrustColor = lerpColor(this.engineColor1, this.engineColor2, random(0.3, 0.7)); createParticles(this.pos.x, this.pos.y + this.size * 0.6, 1, thrustColor, 3, 1.5, 0.5); }

        this.vel.limit(this.maxSpeed); this.pos.add(this.vel);
        let margin = this.size * 0.7; this.pos.x = constrain(this.pos.x, margin, width - margin); this.pos.y = constrain(this.pos.y, margin, height - margin);
        // Auto-Fire
        if (!isMobile && keyIsDown(32) && gameState === GAME_STATE.PLAYING && !isPaused && !this.laserActive) { this.shoot(); }
    }

    shoot() {
        if (this.shootCooldown <= 0 && !this.laserActive) {
            let originY = this.pos.y - this.size * 0.7 + this.hoverOffset;
            let originPoints = [createVector(this.pos.x, originY)]; let numShots = 1; let spreadAngle = 0;
            if (this.spreadShotLevel >= 1 && this.spreadShotLevel <= 2) { let offset = this.size * 0.15; originPoints = [ createVector(this.pos.x - offset, originY + 5), createVector(this.pos.x, originY), createVector(this.pos.x + offset, originY + 5) ]; numShots = 3; spreadAngle = PI / 20; }
            else if (this.spreadShotLevel >= 3 && this.spreadShotLevel <= 4) { let offset = this.size * 0.2; originPoints = [ createVector(this.pos.x - offset, originY + 5), createVector(this.pos.x, originY), createVector(this.pos.x + offset, originY + 5) ]; numShots = 3; spreadAngle = PI / 15; }
            else if (this.spreadShotLevel >= this.maxUpgradeLevel) { let offset1 = this.size * 0.25; let offset2 = this.size * 0.1; originPoints = [ createVector(this.pos.x - offset1, originY + 8), createVector(this.pos.x - offset2, originY + 3), createVector(this.pos.x, originY), createVector(this.pos.x + offset2, originY + 3), createVector(this.pos.x + offset1, originY + 8) ]; numShots = 5; spreadAngle = PI / 12; }
            for (let i = 0; i < numShots; i++) { let angle = 0; if (numShots > 1) { angle = map(i, 0, numShots - 1, -spreadAngle, spreadAngle); } let origin = originPoints[i] || originPoints[0]; bullets.push(new Bullet(origin.x, origin.y, angle)); }
            this.fireRearGun();
            let rearGunFactor = (this.rearGunLevel > 0) ? this.rearGunDelayFactor[this.rearGunLevel] : 1.0; this.shootCooldown = this.currentShootDelay * rearGunFactor;
        }
    }

    fireMissile() {
         if (this.homingMissilesLevel > 0 && this.currentMissiles > 0 && this.missileCooldown <= 0 && !this.laserActive) { let originY = this.pos.y + this.hoverOffset; let originXOffset = this.size * 0.4; let side = (this.currentMissiles % 2 === 0) ? -1 : 1; homingMissiles.push(new HomingMissile(this.pos.x + originXOffset * side, originY, this.missileDamage[this.homingMissilesLevel], this.missileColor)); this.currentMissiles--; this.missileCooldown = 20; createParticles(this.pos.x + originXOffset * side, originY, 10, this.missileColor, 3, 1.8, 0.6); }
    }

    fireLaser() {
         if (this.laserBeamLevel > 0 && !this.laserActive && this.laserCooldown <= 0) { this.laserActive = true; this.laserDuration = this.laserDurationTime[this.laserBeamLevel]; laserBeams.push(new LaserBeam(this, this.laserColor, 5 + this.laserBeamLevel * 1.5)); createParticles(this.pos.x, this.pos.y - this.size*0.7, 30, this.laserColor, 5, 1.0, 0.5); }
    }

    fireRearGun() { if (this.rearGunLevel > 0) { let originY = this.pos.y + this.size * 0.6 + this.hoverOffset; let numRearShots = this.rearGunLevel; let rearSpread = PI / 18; for (let i = 0; i < numRearShots; i++) { let angle = PI / 2; if (numRearShots > 1) { angle += map(i, 0, numRearShots - 1, -rearSpread, rearSpread); } bullets.push(new Bullet(this.pos.x, originY, angle)); } } }

    draw() {
        let showInvulnerableEffect = this.invulnerableTimer > 0 || this.invincibilityTimer > 0;
        let drawShip = !showInvulnerableEffect || (showInvulnerableEffect && frameCount % 10 < 5);

        if (drawShip) {
            push(); translate(this.pos.x, this.pos.y + this.hoverOffset);
            // Draw Shield Effects (unchanged)
            if (this.invincibilityTimer > 0) { let invincibilityAlpha = map(sin(frameCount * 0.5), -1, 1, 40, 90); let invincibilityColor = color(0, 0, 100); fill(invincibilityColor, invincibilityAlpha); noStroke(); ellipse(0, 0, this.shieldVisualRadius * 2.5, this.shieldVisualRadius * 2.5); strokeWeight(3); stroke(invincibilityColor, invincibilityAlpha + 20); noFill(); ellipse(0, 0, this.shieldVisualRadius * 2.5, this.shieldVisualRadius * 2.5); }
            else if (this.tempShieldActive) { let tempShieldAlpha = map(sin(frameCount * 0.3), -1, 1, 60, 100); let tempShieldHue = 45; fill(tempShieldHue, 90, 100, tempShieldAlpha); noStroke(); ellipse(0, 0, this.shieldVisualRadius * 2.3, this.shieldVisualRadius * 2.3); strokeWeight(2.5); stroke(tempShieldHue, 100, 100, tempShieldAlpha + 25); noFill(); ellipse(0, 0, this.shieldVisualRadius * 2.3, this.shieldVisualRadius * 2.3); }
            else if (this.shieldCharges > 0) { let shieldAlpha = map(sin(frameCount * 0.2), -1, 1, 50, 90); let shieldHue = 180; fill(shieldHue, 80, 100, shieldAlpha); noStroke(); ellipse(0, 0, this.shieldVisualRadius * 2.1, this.shieldVisualRadius * 2.1); strokeWeight(2); stroke(shieldHue, 90, 100, shieldAlpha + 35); noFill(); ellipse(0, 0, this.shieldVisualRadius * 2.1, this.shieldVisualRadius * 2.1); }

            // Draw Engine Glow (Uses cosmetic colors)
            let enginePulseFactor = 1.0 + this.vel.mag() * 0.04; let pulseSpeed = (this.rapidFireTimer > 0) ? 0.5 : 0.25; let enginePulse = map(sin(frameCount * pulseSpeed), -1, 1, 0.8, 1.3) * enginePulseFactor; let engineSize = this.size * 0.55 * enginePulse; let engineBrightness = map(sin(frameCount * 0.35), -1, 1, 85, 100); noStroke();
            // Use this.engineColor1 and this.engineColor2 (already p5.Color objects)
            let engineY = this.size * 0.6;
            for (let i = engineSize * 1.2; i > 0; i -= 3) { let alpha = map(i, 0, engineSize * 1.2, 0, 30); fill(hue(this.engineColor2), saturation(this.engineColor2), engineBrightness, alpha); ellipse(0, engineY, i * 0.8, i * 1.2); }
            fill(hue(this.engineColor1), saturation(this.engineColor1), 100); ellipse(0, engineY, engineSize * 0.5, engineSize * 1.0);

            // Draw Ship Body (Uses cosmetic colors)
            let s = this.size; let bodyW = s * 0.5; let wingW = s * (this.shapeState === 0 ? 1.1 : 1.3); let wingH = s * 0.8; let noseL = s * 0.8;
            // Use this.bodyColor, this.wingColor, this.detailColor1, this.detailColor2
            strokeWeight(1.5); stroke(this.detailColor1); fill(this.wingColor); triangle(-bodyW / 2, s * 0.1, -wingW / 2, s * 0.5, -bodyW * 0.7, s * 0.6); triangle( bodyW / 2, s * 0.1, wingW / 2, s * 0.5, bodyW * 0.7, s * 0.6);
            // Brighter wing highlight
            fill(hue(this.wingColor), saturation(this.wingColor), brightness(this.wingColor)*1.2); triangle(-bodyW / 2, s * 0.1, -wingW / 2, s * 0.5, -wingW * 0.4, s * 0.0); triangle( bodyW / 2, s * 0.1, wingW / 2, s * 0.5, wingW * 0.4, s * 0.0);
            // Main body
            fill(this.bodyColor); quad( 0, -noseL, bodyW / 2, s * 0.1, 0, s * 0.4, -bodyW / 2, s * 0.1 );
            // Shape state additions
            if (this.shapeState === 1) { fill(this.wingColor); triangle(0, s*0.4, -s*0.2, s*0.7, s*0.2, s*0.7); quad(-bodyW*0.7, s*0.6, -bodyW*0.6, s*0.8, -wingW*0.4, s*0.7, -wingW/2, s*0.5); quad( bodyW*0.7, s*0.6,  bodyW*0.6, s*0.8,  wingW*0.4, s*0.7,  wingW/2, s*0.5); }
            // Cockpit
            let cockpitY = -s * 0.15; let cockpitW = s * 0.4; let cockpitH = s * 0.6; fill(this.cockpitColor); ellipse(0, cockpitY, cockpitW, cockpitH); noStroke(); fill(0, 0, 100, 50); ellipse(0, cockpitY - cockpitH * 0.1, cockpitW * 0.7, cockpitH * 0.4);
            // Detail lines
            strokeWeight(1); stroke(this.detailColor2); line(0, -noseL * 0.8, 0, cockpitY + cockpitH / 2); line(-bodyW / 2, s * 0.1, -wingW * 0.4, s * 0.0); line( bodyW / 2, s * 0.1, wingW * 0.4, s * 0.0); if (this.shapeState === 1) { line(-bodyW*0.3, s*0.0, -bodyW*0.4, s*0.3); line( bodyW*0.3, s*0.0,  bodyW*0.4, s*0.3); }

            pop();
        }
    }
}


// Projectile Classes
// MODIFIED: Bullet uses selectedCosmetics.bulletStyle
class Bullet {
    constructor(x, y, angle = 0) {
        this.pos = createVector(x, y); this.speed = 17; this.size = 5.5;
        this.style = cosmetics.bulletStyles[selectedCosmetics.bulletStyle] || cosmetics.bulletStyles['rainbow'];
        this.hue = (this.style.type === 'fixed') ? this.style.hue : frameCount % 360;
        this.sat = (this.style.type === 'fixed') ? this.style.sat : 90;
        this.bri = (this.style.type === 'fixed') ? this.style.bri : 100;
        let baseAngle = -PI / 2; this.vel = p5.Vector.fromAngle(baseAngle + angle); this.vel.mult(this.speed);
        this.trail = []; this.trailLength = (this.style.type === 'rainbow') ? 5 : 8; // Longer trail for fixed colors?
    }
    update() { this.trail.unshift(this.pos.copy()); if (this.trail.length > this.trailLength) { this.trail.pop(); } this.pos.add(this.vel); if (this.style.type === 'rainbow') { this.hue = (this.hue + 5) % 360; } } // Only cycle hue for rainbow
    draw() { noStroke(); for (let i = 0; i < this.trail.length; i++) { let trailPos = this.trail[i]; let alpha = map(i, 0, this.trail.length - 1, 50, 0); let trailSize = map(i, 0, this.trail.length - 1, this.size, this.size * 0.5); fill(this.hue, this.sat, this.bri, alpha); ellipse(trailPos.x, trailPos.y, trailSize, trailSize * 2.0); } fill(this.hue, this.sat * 1.05, this.bri); // Slightly adjust main bullet color
        stroke(0, 0, 100); strokeWeight(1); ellipse(this.pos.x, this.pos.y, this.size, this.size * 2.5); }
    isOffscreen() { let margin = this.size * 5; return (this.pos.y < -margin || this.pos.y > height + margin || this.pos.x < -margin || this.pos.x > width + margin); }
}
class HomingMissile { constructor(x, y, damage, color) { this.pos = createVector(x, y); this.vel = createVector(random(-1, 1), -random(4, 6)); this.acc = createVector(0, 0); this.maxSpeed = 8 + (ship?.homingMissilesLevel || 1) * 0.5; this.maxForce = 0.25 + (ship?.homingMissilesLevel || 1) * 0.05; this.size = 10; this.damage = damage; this.color = color; this.target = null; this.lifespan = 180; this.trail = []; this.trailLength = 8; } findTarget() { let closestDist = Infinity; let closestEnemy = null; for (let enemy of enemyShips) { let d = p5.Vector.dist(this.pos, enemy.pos); if (d < closestDist && d < width / 2) { closestDist = d; closestEnemy = enemy; } } this.target = closestEnemy; } seek() { if (!this.target || !enemyShips.includes(this.target)) { this.findTarget(); if (!this.target) { this.acc.mult(0); this.lifespan -= 2; return; } } let desired = p5.Vector.sub(this.target.pos, this.pos); desired.setMag(this.maxSpeed); let steer = p5.Vector.sub(desired, this.vel); steer.limit(this.maxForce); this.acc.add(steer); } update() { this.lifespan--; if (frameCount % 5 === 0 || !this.target) { this.findTarget(); } this.seek(); this.vel.add(this.acc); this.vel.limit(this.maxSpeed); this.pos.add(this.vel); this.acc.mult(0); this.trail.unshift(this.pos.copy()); if (this.trail.length > this.trailLength) { this.trail.pop(); } } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.vel.heading() + PI / 2); noFill(); beginShape(); for (let i = 0; i < this.trail.length; i++) { let trailPos = this.trail[i]; let alpha = map(i, 0, this.trail.length - 1, 60, 0); stroke(hue(this.color), saturation(this.color) * 0.8, brightness(this.color) * 0.9, alpha); strokeWeight(map(i, 0, this.trail.length - 1, this.size * 0.6, 1)); let relativePos = p5.Vector.sub(trailPos, this.pos); relativePos.rotate(-(this.vel.heading() + PI / 2)); vertex(relativePos.x, relativePos.y); } endShape(); fill(this.color); noStroke(); triangle(0, -this.size * 0.8, -this.size * 0.4, this.size * 0.5, this.size * 0.4, this.size * 0.5); fill(hue(this.color), saturation(this.color) * 0.7, brightness(this.color) * 0.7); rect(-this.size * 0.4, this.size * 0.2, this.size * 0.2, this.size * 0.5); rect(this.size * 0.2, this.size * 0.2, this.size * 0.2, this.size * 0.5); pop(); } isOffscreen() { let margin = this.size * 2; return (this.pos.y < -margin || this.pos.y > height + margin || this.pos.x < -margin || this.pos.x > width + margin); } hits(target) { let d = dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y); return d < this.size / 2 + target.size / 2; } }
class LaserBeam { constructor(sourceShip, color, width) { this.ship = sourceShip; this.color = color; this.width = width; this.lifespan = 2; } update() { this.lifespan--; this.width = 5 + (this.ship?.laserBeamLevel || 1) * 1.5; } draw() { if (!this.ship || !this.ship.laserActive) return; let startPos = createVector(this.ship.pos.x, this.ship.pos.y - this.ship.size * 0.7 + this.ship.hoverOffset); let endPos = createVector(startPos.x, -50); push(); let coreWidth = this.width * 0.5; let glowWidth = this.width * 1.8; let steps = 4; for (let i = steps; i > 0; i--) { let w = lerp(coreWidth, glowWidth, i/steps); let alpha = lerp(10, 50, i/steps) * (this.ship.laserDuration / this.ship.laserDurationTime[this.ship.laserBeamLevel]); stroke(hue(this.color), saturation(this.color), 100, alpha * random(0.8, 1.2)); strokeWeight(w); line(startPos.x + random(-1,1), startPos.y, endPos.x + random(-1,1), endPos.y); } strokeWeight(coreWidth); stroke(0, 0, 100, 90 * (this.ship.laserDuration / this.ship.laserDurationTime[this.ship.laserBeamLevel])); line(startPos.x, startPos.y, endPos.x, endPos.y); pop(); } isDead() { return this.lifespan <= 0 || !this.ship || !this.ship.laserActive; } }

// Asteroid Class (Unchanged)
class Asteroid { constructor(x, y, size, vel) { this.size = size || random(30, 85); this.pos = createVector(); let isInitialPlacement = (x !== undefined && y !== undefined); if (isInitialPlacement) { this.pos.x = x; this.pos.y = y; } else { let edge = floor(random(3)); if (edge === 0) { this.pos.x = random(width); this.pos.y = -this.size / 2; } else if (edge === 1) { this.pos.x = width + this.size / 2; this.pos.y = random(height * 0.7); } else { this.pos.x = -this.size / 2; this.pos.y = random(height * 0.7); } } if (vel) { this.vel = vel; } else { let baseSpeedMin = 0.6 + (currentLevel - 1) * 0.1; let baseSpeedMax = 1.8 + (currentLevel - 1) * 0.2; this.speed = min(MAX_ASTEROID_SPEED, random(baseSpeedMin, baseSpeedMax)); this.speed *= (this.size > 50 ? 0.9 : 1.1); this.speed *= random(0.9, 1.1); let direction; if (isInitialPlacement) { direction = p5.Vector.random2D(); } else { let targetX = width / 2 + random(-width * 0.25, width * 0.25); let targetY = height / 2 + random(-height * 0.25, height * 0.25); direction = createVector(targetX - this.pos.x, targetY - this.pos.y); direction.normalize(); direction.rotate(random(-PI / 12, PI / 12)); } this.vel = direction; this.vel.mult(this.speed); } this.color = color(random(20, 50), random(30, 70), random(35, 65)); this.rotation = random(TWO_PI); this.rotationSpeed = random(-0.04, 0.04); this.rotationAccel = 0.0001; this.vertices = []; let numVertices = floor(random(9, 18)); for (let i = 0; i < numVertices; i++) { let angleOffset = map(i, 0, numVertices, 0, TWO_PI); let r = this.size / 2 + random(-this.size * 0.45, this.size * 0.35); let v = p5.Vector.fromAngle(angleOffset); v.mult(r); this.vertices.push(v); } this.craters = []; let numCraters = floor(random(2, 7)); for (let i = 0; i < numCraters; i++) { let angle = random(TWO_PI); let radius = random(this.size * 0.1, this.size * 0.4); let craterSize = random(this.size * 0.1, this.size * 0.3); let craterPos = p5.Vector.fromAngle(angle).mult(radius); this.craters.push({ pos: craterPos, size: craterSize }); } } update() { this.pos.add(this.vel); this.rotationSpeed += random(-this.rotationAccel, this.rotationAccel); this.rotationSpeed = constrain(this.rotationSpeed, -0.06, 0.06); this.rotation += this.rotationSpeed; let buffer = this.size; if (this.pos.x < -buffer) this.pos.x = width + buffer; if (this.pos.x > width + buffer) this.pos.x = -buffer; if (this.pos.y < -buffer) this.pos.y = height + buffer; if (this.pos.y > height + buffer) this.pos.y = -buffer; } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); noStroke(); let mainBri = brightness(this.color); let mainSat = saturation(this.color); let mainHue = hue(this.color); let gradSteps = 10; let bodyRadius = this.size / 2; for (let i = 0; i < gradSteps; i++) { let inter = i / gradSteps; let y = lerp(-bodyRadius, bodyRadius, inter); let h = lerp(0, bodyRadius * 2, inter); let w = sqrt(max(0, bodyRadius*bodyRadius - y*y)) * 2; let bri = lerp(mainBri * 1.4, mainBri * 0.5, inter); fill(mainHue, mainSat, bri); ellipse(0, y, w*0.95, h / gradSteps * 1.2); } beginShape(); for (let v of this.vertices) { vertex(v.x, v.y); } endShape(CLOSE); let craterBaseColor = color(mainHue, mainSat * 0.8, mainBri * 0.5, 90); let craterHighlightColor = color(mainHue, mainSat * 0.6, mainBri * 1.1, 70); for (let crater of this.craters) { fill(craterBaseColor); ellipse(crater.pos.x, crater.pos.y, crater.size, crater.size * random(0.7, 1.3)); fill(craterHighlightColor); ellipse(crater.pos.x + crater.size * 0.1, crater.pos.y + crater.size * 0.1, crater.size * 0.6, crater.size * 0.6 * random(0.7, 1.3)); } strokeWeight(0.5); stroke(mainHue, mainSat * 0.9, mainBri * 0.8, 25); let numLines = 5; for (let i = 0; i < numLines; i++) { let yLine = map(i, 0, numLines -1, -bodyRadius * 0.7, bodyRadius * 0.7); let xLine = sqrt(max(0, bodyRadius*bodyRadius - yLine*yLine)) * 0.7; line(-xLine, yLine, xLine, yLine); } pop(); } hits(projectile) { let d = dist(this.pos.x, this.pos.y, projectile.pos.x, projectile.pos.y); return d < this.size / 2 + projectile.size / 2; } hitsShip(ship) { let targetX = ship.pos.x; let targetY = ship.pos.y; let targetRadius = ship.invincibilityTimer > 0 ? ship.shieldVisualRadius * 1.2 : ( ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5) ); let d = dist(this.pos.x, this.pos.y, targetX, targetY); return d < this.size / 2 * 0.9 + targetRadius; } }
// Particle Class (Unchanged)
class Particle { constructor(x, y, particleColor, size = null, speedMult = 1, lifespanMult = 1) { this.pos = createVector(x, y); this.vel = p5.Vector.random2D(); this.vel.mult(random(1.5, 6) * speedMult); this.lifespan = 100 * lifespanMult * random(0.8, 1.5); this.maxLifespan = this.lifespan; this.baseHue = hue(particleColor); this.baseSat = saturation(particleColor); this.baseBri = brightness(particleColor); this.size = size !== null ? size * random(0.8, 1.2) : random(2, 7); this.drag = random(0.95, 0.99); } update() { this.pos.add(this.vel); this.lifespan -= 2.5; this.vel.mult(this.drag); } draw() { noStroke(); let currentAlpha = map(this.lifespan, 0, this.maxLifespan, 0, 100); fill(this.baseHue, this.baseSat, this.baseBri, currentAlpha); ellipse(this.pos.x, this.pos.y, this.size * (this.lifespan / this.maxLifespan)); } isDead() { return this.lifespan <= 0; } }
// Star Class (Unchanged)
class Star { constructor() { this.x = random(width); this.y = random(height); this.layer = floor(random(4)); this.size = map(this.layer, 0, 3, 0.4, 2.8); this.speed = map(this.layer, 0, 3, 0.05, 0.6); this.baseBrightness = random(50, 95); this.twinkleSpeed = random(0.03, 0.08); this.twinkleRange = random(0.6, 1.4); this.twinkleOffset = random(TWO_PI); } update() { this.y += this.speed; if (this.y > height + this.size) { this.y = -this.size; this.x = random(width); } } draw() { let twinkleFactor = map(sin(frameCount * this.twinkleSpeed + this.twinkleOffset), -1, 1, 1.0 - this.twinkleRange / 2, 1.0 + this.twinkleRange / 2); let currentBrightness = constrain(this.baseBrightness * twinkleFactor, 30, 100); fill(0, 0, currentBrightness, 90); noStroke(); ellipse(this.x, this.y, this.size, this.size); } }
// ShootingStar Class (Unchanged)
class ShootingStar { constructor() { this.startX = random(width); this.startY = random(-50, -10); this.pos = createVector(this.startX, this.startY); let angle = random(PI * 0.3, PI * 0.7); this.speed = random(15, 30); this.vel = p5.Vector.fromAngle(angle).mult(this.speed); this.len = random(50, 150); this.brightness = random(80, 100); this.lifespan = 100; } update() { this.pos.add(this.vel); this.lifespan -= 2; } draw() { if (this.lifespan <= 0) return; let alpha = map(this.lifespan, 0, 100, 0, 100); let tailPos = p5.Vector.sub(this.pos, this.vel.copy().setMag(this.len)); strokeWeight(random(1.5, 3)); stroke(0, 0, this.brightness, alpha); line(this.pos.x, this.pos.y, tailPos.x, tailPos.y); } isDone() { return this.lifespan <= 0 || this.pos.y > height + this.len || this.pos.x < -this.len || this.pos.x > width + this.len; } }
// HealthPotion Class (Unchanged)
class HealthPotion { constructor(x, y) { this.pos = createVector(x || random(width * 0.1, width * 0.9), y || -30); this.vel = createVector(0, random(0.5, 1.5)); this.size = 20; this.bodyWidth = this.size * 0.6; this.bodyHeight = this.size * 0.8; this.neckWidth = this.size * 0.3; this.neckHeight = this.size * 0.4; this.rotation = 0; this.rotationSpeed = random(-0.015, 0.015); this.pulseOffset = random(TWO_PI); } update() { this.pos.add(this.vel); this.rotation += this.rotationSpeed; } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); let pulseFactor = map(sin(frameCount * 0.15 + this.pulseOffset), -1, 1, 0.8, 1.2); let glowAlpha = map(pulseFactor, 0.8, 1.2, 20, 60); fill(0, 90, 100, glowAlpha); noStroke(); ellipse(0, 0, this.size * 1.5 * pulseFactor, this.size * 1.5 * pulseFactor); fill(0, 85, 90); noStroke(); rect(-this.bodyWidth / 2, -this.bodyHeight / 2, this.bodyWidth, this.bodyHeight, 3); rect(-this.neckWidth / 2, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth, this.neckHeight); ellipse(0, -this.bodyHeight / 2 - this.neckHeight, this.neckWidth * 1.2, this.neckWidth * 0.4); fill(0, 0, 100); rectMode(CENTER); rect(0, 0, this.bodyWidth * 0.5, this.bodyWidth * 0.15); rect(0, 0, this.bodyWidth * 0.15, this.bodyWidth * 0.5); rectMode(CORNER); pop(); } hitsShip(ship) { let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y); let shipRadius = ship.invincibilityTimer > 0 ? ship.shieldVisualRadius * 1.2 : ( ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5) ); return d < this.size * 0.7 + shipRadius; } isOffscreen() { let margin = this.size * 2; return (this.pos.y > height + margin); } }
// PowerUp Class (Unchanged)
class PowerUp { constructor(type) { this.type = type; this.pos = createVector(random(width * 0.1, width * 0.9), -30); this.vel = createVector(0, random(0.8, 1.8)); this.size = 22; this.pulseOffset = random(TWO_PI); this.rotation = random(TWO_PI); this.rotationSpeed = random(-0.02, 0.02); this.icon = '?'; this.color = color(0, 0, 100); switch (this.type) { case POWERUP_TYPES.TEMP_SHIELD: this.icon = 'S'; this.color = color(45, 90, 100); break; case POWERUP_TYPES.RAPID_FIRE: this.icon = 'R'; this.color = color(120, 90, 100); break; case POWERUP_TYPES.EMP_BURST: this.icon = 'E'; this.color = color(210, 90, 100); break; case POWERUP_TYPES.SCORE_MULT: this.icon = 'x2'; this.color = color(60, 100, 100); break; case POWERUP_TYPES.DRONE: this.icon = 'D'; this.color = color(180, 50, 100); break; case POWERUP_TYPES.INVINCIBILITY: this.icon = 'I'; this.color = color(300, 80, 100); break; } } update() { this.pos.add(this.vel); this.rotation += this.rotationSpeed; } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); let pulse = map(sin(frameCount * 0.2 + this.pulseOffset), -1, 1, 0.9, 1.2); let currentSize = this.size * pulse; let currentBrightness = brightness(this.color) * pulse; let glowAlpha = map(pulse, 0.9, 1.2, 30, 80); fill(hue(this.color), saturation(this.color) * 0.8, currentBrightness * 0.8, glowAlpha); noStroke(); ellipse(0, 0, currentSize * 1.5, currentSize * 1.5); fill(hue(this.color), saturation(this.color), currentBrightness); stroke(0, 0, 100, 80); strokeWeight(2); ellipse(0, 0, currentSize, currentSize); fill(0, 0, 100); noStroke(); textSize(currentSize * (this.icon === 'x2' ? 0.6 : 0.8) ); textAlign(CENTER, CENTER); text(this.icon, 0, currentSize * 0.05); pop(); } hitsShip(ship) { let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y); let shipRadius = ship.invincibilityTimer > 0 ? ship.shieldVisualRadius * 1.2 : ( ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5) ); return d < this.size * 0.7 + shipRadius; } isOffscreen() { let margin = this.size * 2; return (this.pos.y > height + margin); } }
// Drone Class (Unchanged)
class Drone { constructor(playerShip) { this.ship = playerShip; this.offset = createVector(this.ship.size * 1.8, 0); this.pos = p5.Vector.add(this.ship.pos, this.offset); this.vel = createVector(); this.size = 15; this.color = color(180, 60, 95); this.wingColor = color(180, 40, 70); this.shootCooldown = 0; this.shootDelay = 35; this.lifespan = 900; this.rotation = 0; this.targetAngle = 0; this.lerpFactor = 0.1; } update() { this.lifespan--; let targetPos = p5.Vector.add(this.ship.pos, this.offset.copy().rotate(this.rotation)); this.pos.lerp(targetPos, this.lerpFactor); this.rotation += 0.02; this.shootCooldown--; if (this.shootCooldown <= 0 && !isPaused && gameState === GAME_STATE.PLAYING) { this.shoot(); this.shootCooldown = this.shootDelay; } } shoot() { bullets.push(new Bullet(this.pos.x, this.pos.y, 0)); createParticles(this.pos.x, this.pos.y, 2, this.color, 2, 1.2, 0.4); } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation * 2); let s = this.size; fill(this.color); stroke(0, 0, 20); strokeWeight(1); ellipse(0, 0, s, s * 1.2); fill(this.wingColor); triangle(-s * 0.4, -s * 0.2, -s * 1.1, -s * 0.5, -s * 0.8, s * 0.4); triangle(s * 0.4, -s * 0.2, s * 1.1, -s * 0.5, s * 0.8, s * 0.4); fill(0, 0, 100); ellipse(0, -s * 0.3, s * 0.3, s * 0.3); pop(); } isExpired() { return this.lifespan <= 0; } }
// Enemy Classes (Unchanged)
class BaseEnemy { constructor(x, y, size, health, pointsValue, moneyValue) { this.pos = createVector(x, y); this.vel = createVector(); this.size = size; this.health = health; this.maxHealth = health; this.pointsValue = pointsValue; this.moneyValue = moneyValue; this.hitColor = color(0, 0, 80); this.explosionColor = color(30, 80, 90); } update() { this.pos.add(this.vel); } draw() { push(); translate(this.pos.x, this.pos.y); fill(300, 80, 50); rectMode(CENTER); rect(0, 0, this.size, this.size); pop(); } hits(projectile) { let d = dist(this.pos.x, this.pos.y, projectile.pos.x, projectile.pos.y); return d < this.size / 2 + projectile.size / 2; } hitsShip(playerShip) { let d = dist(this.pos.x, this.pos.y, playerShip.pos.x, playerShip.pos.y); let targetRadius; if (playerShip.invincibilityTimer > 0) targetRadius = playerShip.shieldVisualRadius * 1.2; else if (playerShip.tempShieldActive) targetRadius = playerShip.shieldVisualRadius * 1.1; else if (playerShip.shieldCharges > 0) targetRadius = playerShip.shieldVisualRadius; else targetRadius = playerShip.size * 0.5; return d < this.size * 0.45 + targetRadius; } isOffscreen() { let margin = this.size * 2; return (this.pos.y > height + margin || this.pos.y < -margin || this.pos.x < -margin || this.pos.x > width + margin); } takeDamage(amount) { this.health -= amount; return this.health <= 0; } getExplosionColor() { return this.explosionColor; } getHitColor() { return this.hitColor; } _setDefaultSpawnPosition() { let edge = floor(random(3)); if (edge === 0) { this.pos.x = random(width); this.pos.y = -this.size / 2; } else if (edge === 1) { this.pos.x = width + this.size / 2; this.pos.y = random(height * 0.6); } else { this.pos.x = -this.size / 2; this.pos.y = random(height * 0.6); } } }
class BasicEnemy extends BaseEnemy { constructor(x, y) { super(x, y, 30, 1, 20, 5); if (x === undefined || y === undefined) { this._setDefaultSpawnPosition(); } this.shootCooldown = random(120, 240); this.shootTimer = this.shootCooldown; this.bulletSpeed = 3.5 + currentLevel * 0.1; if (this.pos.y < 0) { this.vel.set(random(-0.5, 0.5), random(0.8, 1.5)); } else if (this.pos.x > width) { this.vel.set(random(-1.5, -0.8), random(-0.5, 0.5)); } else { this.vel.set(random(0.8, 1.5), random(-0.5, 0.5)); } let speedScale = min(MAX_ENEMY_SPEED_BASIC, 1.0 + (currentLevel - 1) * 0.1); this.vel.mult(speedScale); this.vel.x += random(-0.25, 0.25) * speedScale; this.bodyColor = color(0, 0, 15); this.accentColor = color(0, 90, 75); this.glowColor = color(0, 100, 100, 70); this.explosionColor = color(340, 90, 90); this.hitColor = this.accentColor; } update() { super.update(); this.shootTimer--; if (this.shootTimer <= 0 && ship && gameState === GAME_STATE.PLAYING && !isPaused) { this.shoot(); this.shootCooldown = random(max(40, 120 - currentLevel * 5), max(80, 240 - currentLevel * 10)); this.shootTimer = this.shootCooldown; } } shoot() { let aimAngle = PI / 2; enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y + this.size * 0.4, aimAngle, this.bulletSpeed)); } draw() { push(); translate(this.pos.x, this.pos.y); let s = this.size; fill(this.bodyColor); stroke(this.accentColor); strokeWeight(2); beginShape(); vertex(0, -s * 0.7); vertex(s * 0.6, s * 0.1); vertex(s * 0.3, s * 0.5); vertex(-s * 0.3, s * 0.5); vertex(-s * 0.6, s * 0.1); endShape(CLOSE); noStroke(); let glowPulse = map(sin(frameCount * 0.15), -1, 1, 0.8, 1.2); fill(hue(this.glowColor), saturation(this.glowColor), brightness(this.glowColor), alpha(this.glowColor) * glowPulse); ellipse(0, -s * 0.1, s * 0.25 * glowPulse, s * 0.35 * glowPulse); fill(this.accentColor); triangle(s * 0.3, s * 0.5, s * 0.4, s * 0.7, s * 0.2, s * 0.6); triangle(-s * 0.3, s * 0.5, -s * 0.4, s * 0.7, -s * 0.2, s * 0.6); pop(); } getExplosionColor() { return this.explosionColor; } getHitColor() { return this.hitColor; } }
class KamikazeEnemy extends BaseEnemy { constructor(x, y) { super(x, y, 24, 1, 15, 3); if (x === undefined || y === undefined) { this._setDefaultSpawnPosition(); this.pos.y = constrain(this.pos.y, -this.size, height * 0.6); } this.acceleration = 0.09 + currentLevel * 0.006; this.maxSpeed = min(MAX_ENEMY_SPEED_KAMIKAZE, 3.5 + currentLevel * 0.22); this.vel = p5.Vector.random2D().mult(this.maxSpeed * 0.5); this.bodyColor = color(0, 100, 65); this.spikeColor = color(25, 100, 100); this.trailColor = color(0, 90, 80, 40); this.explosionColor = color(20, 100, 100); this.hitColor = this.spikeColor; this.glowIntensity = 0; } update() { if (ship && gameState === GAME_STATE.PLAYING && !isPaused) { let direction = p5.Vector.sub(ship.pos, this.pos); let distanceSq = direction.magSq(); direction.normalize(); direction.mult(this.acceleration); this.vel.add(direction); this.vel.limit(this.maxSpeed); this.glowIntensity = map(sqrt(distanceSq), 200, 50, 0, 1, true); } else { this.glowIntensity = 0; } this.pos.add(this.vel); if (frameCount % 4 === 0) { createParticles(this.pos.x, this.pos.y, 1, this.trailColor, this.size * 0.25, 0.5, 0.3); } } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.vel.heading() + PI / 2); let s = this.size; if (this.glowIntensity > 0) { let glowPulse = map(sin(frameCount * 0.25), -1, 1, 0.7, 1.3); let glowSize = s * 1.8 * glowPulse * this.glowIntensity; noStroke(); fill(0, 100, 90, 30 * this.glowIntensity * glowPulse); ellipse(0, 0, glowSize, glowSize); } fill(this.bodyColor); stroke(0,0,10); strokeWeight(1); triangle(0, -s * 0.9, -s * 0.45, s * 0.55, s * 0.45, s * 0.55); fill(this.spikeColor); noStroke(); triangle(-s * 0.45, s * 0.55, -s * 0.65, s * 0.8, -s * 0.35, s * 0.7); triangle(s * 0.45, s * 0.55, s * 0.65, s * 0.8, s * 0.35, s * 0.7); triangle(0, -s * 0.9, -s * 0.15, -s * 1.1, s * 0.15, -s * 1.1); pop(); } getExplosionColor() { return this.explosionColor; } getHitColor() { return this.hitColor; } }
class TurretEnemy extends BaseEnemy { constructor(x, y) { super(x, y, 38, 3, 50, 10); if (x === undefined || y === undefined) { let edge = random(1) < 0.5 ? -1 : 1; this.pos.x = (edge < 0) ? -this.size : width + this.size; this.pos.y = random(height * 0.1, height * 0.7); this.vel.set(edge * random(-0.3, -0.05), random(-0.05, 0.05)); } else { this.vel.set(random(-0.1, 0.1), random(-0.1, 0.1)); } this.bulletSpeed = 2.5 + currentLevel * 0.05; this.fireMode = floor(random(3)); this.shootCooldown = random(180, 300); this.shootTimer = this.shootCooldown; this.patternTimer = 0; this.patternAngle = random(TWO_PI); this.burstCount = 0; this.baseColor = color(270, 60, 35); this.barrelColor = color(0, 0, 25); this.lightColor = color(330, 100, 100); this.glowColor = color(270, 70, 60, 40); this.explosionColor = color(280, 80, 95); this.hitColor = color(270, 70, 70); } update() { super.update(); if (this.pos.x < this.size * 1.5 && this.vel.x < 0) this.vel.x *= -0.2; if (this.pos.x > width - this.size * 1.5 && this.vel.x > 0) this.vel.x *= -0.2; if ((this.pos.y < this.size && this.vel.y < 0) || (this.pos.y > height - this.size && this.vel.y > 0)) { this.vel.y *= 0.5; } this.shootTimer--; if (this.shootTimer <= 0 && ship && gameState === GAME_STATE.PLAYING && !isPaused) { this.startShootingPattern(); this.shootCooldown = random(max(100, 220 - currentLevel * 7), max(160, 340 - currentLevel * 10)); this.shootTimer = this.shootCooldown; } this.updateShootingPattern(); } startShootingPattern() { this.fireMode = floor(random(3)); this.patternTimer = 0; this.patternAngle = ship ? atan2(ship.pos.y - this.pos.y, ship.pos.x - this.pos.x) : random(TWO_PI); switch (this.fireMode) { case 0: this.burstCount = 3 + floor(currentLevel / 4); this.patternTimer = 8; break; case 1: this.burstCount = 12 + currentLevel; this.patternTimer = 4; break; case 2: this.burstCount = 4 + floor(currentLevel / 3); this.patternTimer = 0; break; } } updateShootingPattern() { if (this.burstCount > 0) { this.patternTimer--; if (this.patternTimer <= 0 && ship && !isPaused) { switch (this.fireMode) { case 0: let angleToPlayer = atan2(ship.pos.y - this.pos.y, ship.pos.x - this.pos.x); enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y, angleToPlayer, this.bulletSpeed * 1.1)); this.patternTimer = 8; this.burstCount--; break; case 1: enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y, this.patternAngle, this.bulletSpeed * 0.9)); this.patternAngle += PI / (5 + currentLevel * 0.4); this.patternTimer = 4; this.burstCount--; break; case 2: let spreadArc = PI / 3.5 + (currentLevel * PI / 25); for(let i = 0; i < this.burstCount; i++) { let angle = this.patternAngle + map(i, 0, this.burstCount - 1, -spreadArc / 2, spreadArc / 2); enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y, angle, this.bulletSpeed * 1.05)); } this.burstCount = 0; break; } } } } draw() { push(); translate(this.pos.x, this.pos.y); let s = this.size; fill(this.baseColor); stroke(0, 0, 10); strokeWeight(2); beginShape(); let sides = 6; for (let i = 0; i < sides; i++) { let angle = map(i, 0, sides, 0, TWO_PI) + PI / sides; let radius = s/2 * (i%2 === 0 ? 1.0 : 0.85); vertex(cos(angle) * radius, sin(angle) * radius); } endShape(CLOSE); let aimAngle = ship ? atan2(ship.pos.y - this.pos.y, ship.pos.x - this.pos.x) : PI/2; rotate(aimAngle - PI/2); fill(this.barrelColor); stroke(0, 0, 5); strokeWeight(1.5); rect(-s * 0.15, -s * 0.5, s * 0.3, s * 0.7); let lightPulse = 1.0; let auraAlpha = 0; if (this.shootTimer < 60 || this.burstCount > 0) { lightPulse = map(sin(frameCount * 0.4), -1, 1, 0.6, 1.6); auraAlpha = map(lightPulse, 0.6, 1.6, 30, 80); } else { auraAlpha = map(sin(frameCount * 0.1), -1, 1, 10, 35); } noStroke(); fill(hue(this.glowColor), saturation(this.glowColor), brightness(this.glowColor), alpha(this.glowColor) * (auraAlpha/40)); ellipse(0, 0, s * 1.5 * lightPulse, s * 1.5 * lightPulse ); fill(this.lightColor); noStroke(); ellipse(0, s * 0.05, s * 0.2 * lightPulse, s * 0.2 * lightPulse); pop(); } getExplosionColor() { return this.explosionColor; } getHitColor() { return this.hitColor; } }
class SwarmerEnemy extends BaseEnemy { constructor(x, y) { super(x, y, 16, 1, 5, 1); if (x === undefined || y === undefined) { this._setDefaultSpawnPosition(); } this.maxSpeed = min(MAX_ENEMY_SPEED_SWARMER, 1.6 + currentLevel * 0.12); this.vel = p5.Vector.random2D().mult(this.maxSpeed); this.turnForce = 0.035 + random(0.025); this.phaseOffset = random(TWO_PI); this.bodyColor = color(130, 80, 45); this.wingColor = color(130, 60, 30, 75); this.eyeColor = color(0, 100, 90); this.explosionColor = color(140, 95, 95); this.hitColor = color(130, 100, 100); } update() { let targetY = height * 0.7; let targetX = width / 2; if(ship && !isPaused) { targetX = ship.pos.x + random(-width*0.3, width*0.3); targetY = ship.pos.y + random(30, 180); } let desired = createVector(targetX - this.pos.x, targetY - this.pos.y); desired.normalize(); desired.mult(this.maxSpeed); let wave = createVector(desired.y, -desired.x); wave.normalize(); wave.mult(sin(frameCount * 0.07 + this.phaseOffset) * this.maxSpeed * 0.65); desired.add(wave); let steer = p5.Vector.sub(desired, this.vel); steer.limit(this.turnForce); this.vel.add(steer); this.vel.limit(this.maxSpeed); this.pos.add(this.vel); } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.vel.heading() + PI / 2); let s = this.size; let wingPulse = map(sin(frameCount * 0.25 + this.phaseOffset), -1, 1, 0.7, 1.3); fill(this.wingColor); noStroke(); triangle(-s * 0.3, -s * 0.1, -s * 0.9 * wingPulse, -s * 0.5 * wingPulse, -s * 0.6 * wingPulse, s * 0.4 * wingPulse); triangle(s * 0.3, -s * 0.1, s * 0.9 * wingPulse, -s * 0.5 * wingPulse, s * 0.6 * wingPulse, s * 0.4 * wingPulse); fill(this.bodyColor); stroke(0,0,15); strokeWeight(0.5); ellipse(0, 0, s * 0.7, s); fill(this.eyeColor); noStroke(); ellipse(0, -s * 0.25, s * 0.15, s * 0.15); pop(); } getExplosionColor() { return this.explosionColor; } getHitColor() { return this.hitColor; } }
class EnemyBullet { constructor(x, y, angle, speed) { this.pos = createVector(x, y); this.vel = p5.Vector.fromAngle(angle); this.vel.mult(speed); this.size = 7; this.color = color(0, 90, 100); } update() { this.pos.add(this.vel); } draw() { noStroke(); fill(hue(this.color), saturation(this.color)*0.8, brightness(this.color), 50); ellipse(this.pos.x, this.pos.y, this.size * 1.8, this.size * 1.8); fill(this.color); ellipse(this.pos.x, this.pos.y, this.size, this.size); } hitsShip(ship) { let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y); let targetRadius; if (ship.invincibilityTimer > 0) targetRadius = ship.shieldVisualRadius * 1.2; else if (ship.tempShieldActive) targetRadius = ship.shieldVisualRadius * 1.1; else if (ship.shieldCharges > 0) targetRadius = ship.shieldVisualRadius; else targetRadius = ship.size * 0.5; return d < this.size * 0.6 + targetRadius; } isOffscreen() { let margin = this.size * 3; return (this.pos.y > height + margin || this.pos.y < -margin || this.pos.x < -margin || this.pos.x > width + margin); } }
// Nebula Class (Unchanged)
class Nebula { constructor() { this.numEllipses = floor(random(10, 20)); this.ellipses = []; this.rotation = random(TWO_PI); this.rotationSpeed = random(-0.0004, 0.0004); this.baseAlpha = random(3, 8); let overallWidth = random(width * 0.6, width * 1.4); let overallHeight = random(height * 0.4, height * 0.7); if (random(1) < 0.5) { this.pos = createVector(-overallWidth / 2, random(height)); this.vel = createVector(random(0.04, 0.12), random(-0.015, 0.015)); } else { this.pos = createVector(width + overallWidth / 2, random(height)); this.vel = createVector(random(-0.12, -0.04), random(-0.015, 0.015)); } let h1 = random(240, 330); let h2 = (h1 + random(-50, 50)) % 360; this.color1 = color(h1, random(40, 75), random(15, 45)); this.color2 = color(h2, random(40, 75), random(15, 45)); for (let i = 0; i < this.numEllipses; i++) { this.ellipses.push({ pos: createVector(random(-overallWidth * 0.45, overallWidth * 0.45), random(-overallHeight * 0.45, overallHeight * 0.45)), w: random(overallWidth * 0.15, overallWidth * 0.7), h: random(overallHeight * 0.15, overallHeight * 0.7), alpha: this.baseAlpha * random(0.6, 1.4) }); } } update() { this.pos.add(this.vel); this.rotation += this.rotationSpeed; } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); noStroke(); for (let el of this.ellipses) { let inter = map(el.pos.x, -width * 0.45, width * 0.45, 0, 1); let c = lerpColor(this.color1, this.color2, inter); fill(hue(c), saturation(c), brightness(c), el.alpha * random(0.9, 1.1)); ellipse(el.pos.x, el.pos.y, el.w, el.h); } pop(); } isOffscreen() { let maxDimension = max(this.ellipses.reduce((maxR, el) => max(maxR, el.pos.mag() + max(el.w, el.h) / 2), 0), width * 0.7); let margin = maxDimension; return (this.pos.x < -margin || this.pos.x > width + margin || this.pos.y < -margin || this.pos.y > height + margin); } }
