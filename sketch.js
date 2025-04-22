// --- Features ---
// - Start Menu with Options (Start Game, Skills, Settings, Cosmetics) // ADDED: Skills Menu
// - Settings Menu (Screen Shake, Background FX, Particle Density, Back)
// - Cosmetics Menu (Ship Color [Red, Blue, Green, Orange, Purple, Cyan, Yellow], Bullet Style [Rainbow, White, Plasma, Fire, Ice], Back) // ENHANCED: More Options
// - Skill Tree Menu (Permanent upgrades: Max Speed, Max Lives, Shield Regen, Base Weapon Dmg, Missile Dmg, Starting Money) using Tech Fragments // NEW FEATURE // ACCESSIBLE FROM PAUSE // INCREASED COSTS // MODIFIED: Resets on Game Over
// - Mobile Gameplay Settings Button (Positioned top-left within HUD) // MODIFIED: Position fixed
// - Level System based on Mission Objectives // NEW: Replaces point thresholds // MODIFIED: Level 3 & 5 Objectives Changed
// - Selectable Bullet Styles (Rainbow Trail, White Bolt, Plasma, Fire, Ice) // ENHANCED: More Options
// - Ship Upgrade System (Manual Purchase in Shop: Fire Rate, Spread Shot, Homing Missiles, Rear Gun) - Uses Money // ENHANCED (UI Style, Text Fit) // REMOVED: Laser Beam
// - Score/Power-up based Shield System (No longer from points) // ADDED: Passive Shield Regen from Skill Tree
// - Selectable Ship Colors (Red, Blue, Green, Orange, Purple, Cyan, Yellow) with corresponding details // ENHANCED: More Options
// - Dynamic Parallax Star Background (with occasional planet, galaxy, black hole, structures) // ENHANCED (Twinkle, Shooting Stars, Slower BH Effect, More Planet Detail, Rings, Moons, Cloud Rotation, Lightning)
// - Enhanced Engine Thrust Effect (More reactive, Color linked to Ship Color)
// - Asteroid Splitting
// - Player Lives (Max 3 + Skill Tree Bonus) // MODIFIED
// - Simple Explosion Particles (Asteroid destruction + Bullet impact) // ENHANCED (Variety, Count)
// - Score-based Difficulty Increase - Uses Levels + Time (Scales to Lvl 15) // Difficulty still scales per level number
// - Health Potions: Spawn randomly, restore 1 life on pickup (up to max). // ENHANCED (Visuals) // INCREASED SPAWN RATE // ADDED OBJECTIVE TRACKING
// - Multiple Enemy Types:
//   - Basic Enemy: Shoots straight. // MODIFIED: Appearance more 'evil'
//   - Kamikaze Enemy: Homes in on player, explodes on impact. // MODIFIED: Appearance more 'evil'
//   - Turret Enemy: Slow/Stationary, fires patterns (bursts/spirals). // MODIFIED: Appearance more 'evil'
//   - Swarmer Enemy: Small, appears in groups, simple movement. // MODIFIED: Appearance more 'evil'
//   - Laser Enemy: Charges and fires a continuous beam. // NEW ENEMY TYPE
// - Temporary Power-Ups (Temp Shield, Rapid Fire, EMP Burst, Score Multiplier, Drone, Invincibility) // ENHANCED (Visuals) // INCREASED SPAWN RATE & MAX COUNT // ADDED OBJECTIVE TRACKING
// - Visual Nebula Clouds in background // ENHANCED (Subtlety, Noise-based shapes)
// - Background Structures (Stations/Derelicts) // ENHANCED (Visual Detail, Variety, Lighting)
// - Pause Functionality (Press ESC during gameplay to Pause/Unpause, Tap Pause Button to access Skills/Settings) // ENHANCED (UI Style) // MODIFIED: ESC now Pauses/Resumes during Gameplay. Pause Menu added.
// - Upgrade Shop Screen between levels (Levels 1-14) // ENHANCED (UI Style)
// - Win Screen after completing Level 15 Objective // MODIFIED
// - Monospace Font & UI Color Palette // NEW UI FEATURE (ENHANCED)
// - Styled HUD with Icons & Panel // MODIFIED (Added Objective Display, Enhanced Style) // REMOVED: Laser level
// - Styled Buttons & Menu Panels // ENHANCED (UI Style, Text Fit Logic Added)
// - Combo System (Timer, Counter, Max Bonus, Visual Feedback) // NEW GAMEPLAY FEATURE (Enhanced Visuals)
// - New Weapon Systems & Upgrades: Homing Missiles, Rear Gun // NEW FEATURE // REMOVED: Laser Beam
// - Drone Companion Class & Logic // NEW FEATURE
// - Mobile UI Buttons for Missiles // NEW FEATURE (Enhanced Style) // REMOVED: Laser button
// - Removed Name Input and Leaderboard system.
// - Implemented separate Points (score) and Money (upgrades) systems.
// - Implemented Tech Fragments currency for Skill Tree. // MODIFIED: Resets on Game Over
// - Asteroids only spawn from Top, Left, and Right edges.
// - Ship movement changed to free keyboard control (Arrows/WASD).
// - MODIFIED: Hold Spacebar/Tap/Click to shoot (auto-fire respects cooldown).
// - MODIFIED: Background gradient color changes smoothly over time.
// - Added brief invulnerability after losing a life.
// - MODIFIED: Touch Controls: Tap/Hold *anywhere* on screen (non-UI button) to move towards touch AND shoot continuously.
// - Mobile Adjustments: Lower base asteroid spawn rate. // ENHANCED (UI Scaling/Layout)
// - Max shield charges reduced to 1.
// - Asteroids visuals enhanced (shading, craters, rotation, NO OUTLINE). // FURTHER ENHANCED
// - Added occasional background planet, subtle galaxy, black hole effect. // ADDED: Structures
// - Increased Ship Speed (MaxSpeed modified by Skill Tree) // MODIFIED
// - Increased Asteroid Spawn Rate Scaling & Max Asteroid Count per Level
// - Added screen shake on life loss. // MODIFIED (Duration ~1s)
// - Changed Title Color Order & Darkened Red
// - Removed automatic cheapest upgrade on level up.
// - Added simple sideways drift to enemy movement (Basic Enemy).
// - Added sound effect placeholder comments.
// - Added upgrade purchase particle effect.
// - Added distinct shop background.
// - REMOVED Auto-Fire Upgrade functionality entirely.
// - ENHANCED: Added particles for shield hits and pickup collection.
// - ENHANCED: Changed enemy bullet appearance.
// - MODIFIED: Reduced ship thrust value (base).
// - MODIFIED: Reduced black hole visual jitter ("slower" appearance).
// - MODIFIED: Reduced size of engine thrust visual effect.
// - MODIFIED: Adjusted UI element sizes and layout for mobile friendliness.
// - MODIFIED: Moved Rate/Spread level text to bottom-right corner.
// - REFACTORED: Enemy logic into separate classes extending BaseEnemy.
// - MODIFIED: Title position raised slightly
// - MODIFIED: HUD text size increased.
// - MODIFIED: Ship thrust increased for non-mobile (computer) controls.
// - REPLACED: Start Screen with Start Menu.
// - ADDED: Visual Settings Options (Screen Shake, Background FX, Particle Density).
// - ADDED: Previous Game State Tracking for Settings Menu return.
// - MODIFIED: Screen Shake duration decreased to ~1 second.
// - MODIFIED: Spaceship drawing logic uses simplified color selection.
// - MODIFIED: Added text fitting logic to button drawing functions.
// - REFACTORED: Cosmetics system simplified to direct color/style selection.
// - UI Enhancement: Refined color palette, button styles, panel appearance, text shadows, HUD layout for improved aesthetics and readability.
// --------------------------


// --- Game Objects & State ---
let ship;
let bullets = []; let homingMissiles = [];
let asteroids = []; let particles = []; let stars = []; let shootingStars = [];
let potions = []; let enemyShips = []; let enemyBullets = []; let powerUps = []; let nebulas = [];
let backgroundStructures = []; // NEW array for structures

// Game State Management
const GAME_STATE = { START_MENU: 0, SETTINGS_MENU: 1, COSMETICS_MENU: 2, SKILL_TREE: 3, PLAYING: 4, GAME_OVER: 5, UPGRADE_SHOP: 6, WIN_SCREEN: 7 }; // Enum order matters, added SKILL_TREE
let gameState = GAME_STATE.START_MENU;
let previousGameState = GAME_STATE.START_MENU; // Tracks where Settings/Cosmetics should return to
let skillTreeReturnState = GAME_STATE.START_MENU; // Tracks where Skill Tree should return to (Start Menu or Pause)
let isPaused = false;

// --- Menu Variables ---
let menuItems = ['Start Game', 'Skills', 'Settings', 'Cosmetics']; // Added Skills
let selectedMenuItem = 0; let startMenuButtons = [];

// --- Settings Variables and Menu Items ---
let settingsItems = [ { id: 'screenShake', label: 'Screen Shake', type: 'toggle' }, { id: 'backgroundFx', label: 'Background FX', type: 'toggle' }, { id: 'particleDensity', label: 'Particles', type: 'cycle', options: ['High', 'Medium', 'Low'] }, { id: 'back', label: 'Back', type: 'action' } ];
let selectedSettingsItem = 0; let settingsMenuButtons = [];
let settingScreenShakeEnabled = true; let settingBackgroundEffectsEnabled = true; let settingParticleDensity = 'High';

// --- Cosmetics Variables (Simplified) ---
const SHIP_COLORS = ['Blue', 'Red', 'Green', 'Orange', 'Purple', 'Cyan', 'Yellow']; // Available ship colors // ADDED MORE
const BULLET_STYLES = ['Rainbow', 'White', 'Plasma', 'Fire', 'Ice']; // Available bullet styles // ADDED MORE
let selectedShipColor = 'Blue'; // Current selection
let selectedBulletStyle = 'Rainbow'; // Current selection

// Simple color definitions (HSB format: [H, S, B]) // ADDED MORE DEFINITIONS
const COLOR_DEFINITIONS = {
    'Blue': { body: [210, 75, 85], cockpit: [180, 100, 100], wing: [220, 60, 70], detail1: [0, 0, 60], detail2: [0, 0, 90], engine1: [30, 100, 100], engine2: [0, 100, 100] },
    'Red': { body: [0, 80, 90], cockpit: [0, 0, 100], wing: [350, 70, 75], detail1: [0, 0, 40], detail2: [0, 0, 70], engine1: [15, 100, 100], engine2: [350, 90, 95] },
    'Green': { body: [130, 70, 70], cockpit: [150, 50, 100], wing: [120, 60, 55], detail1: [140, 30, 30], detail2: [140, 20, 60], engine1: [90, 100, 100], engine2: [110, 80, 90] },
    'Orange': { body: [30, 85, 95], cockpit: [45, 70, 100], wing: [20, 75, 80], detail1: [0, 0, 50], detail2: [0, 0, 80], engine1: [45, 100, 100], engine2: [15, 100, 100] },
    'Purple': { body: [280, 70, 75], cockpit: [260, 50, 100], wing: [290, 60, 60], detail1: [270, 30, 30], detail2: [270, 20, 60], engine1: [310, 90, 95], engine2: [290, 80, 90] },
    'Cyan': { body: [180, 70, 80], cockpit: [190, 40, 100], wing: [170, 65, 70], detail1: [180, 20, 40], detail2: [180, 15, 70], engine1: [200, 80, 100], engine2: [160, 70, 90] },
    'Yellow': { body: [55, 90, 100], cockpit: [60, 50, 100], wing: [50, 80, 85], detail1: [45, 40, 50], detail2: [45, 30, 80], engine1: [40, 100, 100], engine2: [65, 90, 95] }
};

// Cosmetics Menu Structure (Simplified)
let cosmeticsMenuItems = [ { id: 'shipColor', label: 'Ship Color', type: 'cycle', options: SHIP_COLORS }, { id: 'bulletStyle', label: 'Bullet Style', type: 'cycle', options: BULLET_STYLES }, { id: 'back', label: 'Back', type: 'action' } ];
let selectedCosmeticsMenuItem = 0; let cosmeticsMenuButtons = [];

// --- Skill Tree Variables ---
let techFragments = 0; // Currency - RESETS ON GAME OVER
let skillTreeData = { // Holds current level of each skill - RESETS ON GAME OVER
    'MAX_SPEED': 0,
    'MAX_LIVES': 0,
    'SHIELD_REGEN': 0,
    'WEAPON_DAMAGE': 0,
    'MISSILE_DAMAGE': 0,
    'STARTING_MONEY': 0
};
const SKILL_DEFINITIONS = { // INCREASED COSTS
    'MAX_SPEED': { label: "Engine Tuning", maxLevel: 5, costPerLevel: [10, 20, 35, 55, 80], effectPerLevel: 0.4, description: "+ Max Speed" },
    'MAX_LIVES': { label: "Reinforced Hull", maxLevel: 3, costPerLevel: [15, 30, 50], effectPerLevel: 1, description: "+ Max Lives" },
    'SHIELD_REGEN': { label: "Shield Capacitor", maxLevel: 4, costPerLevel: [12, 25, 40, 60], effectPerLevel: 0.0005, description: "+ Passive Shield Regen / sec" }, // Regen rate per frame
    'WEAPON_DAMAGE': { label: "Weapon Calibration", maxLevel: 5, costPerLevel: [12, 22, 35, 50, 75], effectPerLevel: 0.15, description: "+ Base Bullet Damage" },
    'MISSILE_DAMAGE': { label: "Explosives Expert", maxLevel: 5, costPerLevel: [15, 28, 45, 65, 90], effectPerLevel: 1, description: "+ Missile Damage" }, // Flat damage bonus per level
    'STARTING_MONEY': { label: "Initial Funding", maxLevel: 5, costPerLevel: [5, 10, 15, 20, 30], effectPerLevel: 25, description: "+ Starting Money" }
};
let skillTreeButtons = [];
let selectedSkillButton = null; // For showing description

// --- Pause Menu Variables ---
let pauseMenuItems = ['Resume', 'Skills', 'Settings', 'Main Menu'];
let pauseMenuButtons = [];
let selectedPauseMenuItem = 0;


// --- Base Ship Stats (for Skill Tree modification) ---
const BASE_MAX_SPEED = 9.5;
const BASE_MAX_LIVES = 3;
const BASE_BULLET_DAMAGE = 1;
const BASE_MISSILE_DAMAGE = [0, 3, 4, 5, 6]; // Original base damage per shop level
const BASE_STARTING_MONEY = 0;

// --- Mobile UI Button Variables ---
let mobileSettingsButton = { x: 0, y: 0, size: 0, padding: 5 }; // Position now calculated in drawHUD
let mobileMissileButton = { x: 0, y: 0, size: 0, padding: 5 }; // Position calculated in calculateMobileActionButtonsPosition

// Power-Up Types
const POWERUP_TYPES = { TEMP_SHIELD: 0, RAPID_FIRE: 1, EMP_BURST: 2, SCORE_MULT: 3, DRONE: 4, INVINCIBILITY: 5 };
const NUM_POWERUP_TYPES = 6;

// Enemy Types
const ENEMY_TYPES = { BASE: 0, KAMIKAZE: 1, TURRET: 2, SWARMER: 3, LASER: 4 }; // ADDED LASER

// Score, Level & Resources
let points = 0; // Score per game
let money = 0; // Currency per game for shop
let lives = 3; // Current lives, calculated at game start
let currentLevel = 1;
const MAX_LEVEL = 15; // Max level remains 15

// --- Mission Objectives ---
const OBJECTIVE_TYPE = { DESTROY_BASIC: 'destroy_basic', DESTROY_KAMIKAZE: 'destroy_kamikaze', DESTROY_TURRET: 'destroy_turret', DESTROY_SWARMER: 'destroy_swarmer', DESTROY_LASER: 'destroy_laser', DESTROY_ASTEROIDS: 'destroy_asteroids', SURVIVE_TIME: 'survive_time', SCORE_REACH: 'score_reach', COLLECT_POTIONS: 'collect_potions', COLLECT_POWERUPS: 'collect_powerups', PROTECT_FRIENDLY: 'protect_friendly' };
const LEVEL_OBJECTIVES = [
    null, // Level 0 doesn't exist
    { type: OBJECTIVE_TYPE.DESTROY_BASIC, target: 5, description: "Destroy Basic Fighters" }, // MODIFIED: Target changed from 8 to 5
    { type: OBJECTIVE_TYPE.DESTROY_ASTEROIDS, target: 20, description: "Destroy Asteroids" },
    { type: OBJECTIVE_TYPE.SCORE_REACH, target: 4000, description: "Reach 4000 Points"}, // MODIFIED: Level 3 objective
    { type: OBJECTIVE_TYPE.SURVIVE_TIME, target: 60 * 60, description: "Survive for 60 seconds" }, // 60 seconds * 60 fps
    { type: OBJECTIVE_TYPE.DESTROY_SWARMER, target: 15, description: "Destroy Swarmers"}, // MODIFIED: Target reduced from 40
    { type: OBJECTIVE_TYPE.COLLECT_POWERUPS, target: 3, description: "Collect Power-Ups" }, // EXAMPLE
    { type: OBJECTIVE_TYPE.SCORE_REACH, target: 8000, description: "Reach 8000 Points"},
    { type: OBJECTIVE_TYPE.DESTROY_LASER, target: 2, description: "Destroy Laser Emitters" },
    { type: OBJECTIVE_TYPE.COLLECT_POTIONS, target: 4, description: "Collect Health Potions" }, // EXAMPLE
    { type: OBJECTIVE_TYPE.SURVIVE_TIME, target: 90 * 60, description: "Survive for 90 seconds" },
    { type: OBJECTIVE_TYPE.DESTROY_KAMIKAZE, target: 15, description: "Destroy Kamikaze Ships" },
    { type: OBJECTIVE_TYPE.DESTROY_ASTEROIDS, target: 50, description: "Destroy Asteroids" },
    { type: OBJECTIVE_TYPE.DESTROY_TURRET, target: 6, description: "Destroy Turrets" },
    { type: OBJECTIVE_TYPE.SCORE_REACH, target: 25000, description: "Reach 25000 Points"},
    { type: OBJECTIVE_TYPE.SURVIVE_TIME, target: 120 * 60, description: "Survive the Final Wave (120s)" }, // Final Level
];

let currentObjective = {
    type: null,
    target: 0,
    progress: 0,
    description: "",
    startTime: 0 // For time-based objectives
};
let levelStartTime = 0; // Track start frame/time of the current level play session

// Game Settings & Thresholds
let baseAsteroidSpawnRate; let currentAsteroidSpawnRate; let baseEnemySpawnRate = 0.002;
let basicEnemyWeight = 10; let kamikazeWeight = 0; let turretWeight = 0; let swarmerWeight = 0; let laserWeight = 0; // Added laserWeight
let powerUpSpawnRate = 0.005; // INCREASED (was 0.0015)
let potionSpawnRate = 0.004; // INCREASED (was 0.001)
let nebulaSpawnRate = 0.0003; // Slightly reduced nebula spawn
let shootingStarSpawnRate = 0.001;
let structureSpawnRate = 0.00015; // Slightly reduced structure spawn
let initialAsteroids = 5; let minAsteroidSize = 15; /* SHIELD_POINTS_THRESHOLD REMOVED */ const MAX_SHIELD_CHARGES = 1; const SHAPE_CHANGE_POINTS_THRESHOLD = 100;
const MAX_ASTEROID_SPEED = 4.0; const MAX_ENEMY_SPEED_BASIC = 3.0; const MAX_ENEMY_SPEED_KAMIKAZE = 5.5; const MAX_ENEMY_SPEED_SWARMER = 2.5; const MAX_ENEMY_SPEED_LASER = 0.7; // Max speed for Laser enemy

// --- Input State ---
let spacebarHeld = false;
let isMobileShooting = false; // Flag for mobile continuous shooting

// --- UI & Messages ---
let infoMessage = ""; let infoMessageTimeout = 0; let shopButtons = []; let levelTransitionFlash = 0;
// UI Colors (Refined Palette)
let uiPanelColor, uiBorderColor, uiTextColor, uiHighlightColor, uiButtonColor, uiButtonHoverColor, uiButtonDisabledColor, uiButtonBorderColor, uiTextShadowColor, uiSpecialButtonColor, uiSpecialButtonHoverColor, uiSpecialButtonBorderColor, uiProgressBarColor, uiProgressBarBgColor;
const BUTTON_TEXT_PADDING = 12;

// --- Background ---
let currentTopColor, currentBottomColor;
let targetTopColor, targetBottomColor;
let previousTopColor, previousBottomColor;
let isTransitioning = false;
let transitionProgress = 0;
const TRANSITION_DURATION = 90; // Frames for color transition (1.5 seconds at 60fps)
const BACKGROUND_CHANGE_INTERVAL = 1200; // Frames between triggering new color changes (20 seconds)
let isMobile = false;


// --- Background Scenery Variables ---
const PLANET_TYPE = { ROCKY: 0, GAS: 1, ICE: 2, LAVA: 3, RINGED: 4, STORMY: 5 };
let planetVisible = false;
let planetData = { // Store planet data in an object
    pos: null, vel: null, size: 0,
    baseColor: null, detailColor1: null, detailColor2: null, cloudColor: null,
    noiseSeed: 0, rotation: 0, cloudRotationSpeed: 0,
    type: PLANET_TYPE.ROCKY, hasRings: false, ringColor: null,
    numMoons: 0, moonData: [], // Array of {dist, speed, phase, size, color}
    lightningTimer: 0, lightningCooldown: 120, lightningDuration: 5
};
let lastPlanetAppearanceTime = -Infinity; const PLANET_MIN_INTERVAL = 25000; const PLANET_MAX_INTERVAL = 50000; // Slightly reduced interval

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
    loadGameData(); // Load persistent data (fragments, skills) FIRST
    createStarfield(200);
    textAlign(CENTER, CENTER);
    textFont('monospace');

    // Refined UI Color Palette
    uiPanelColor = color(225, 65, 18, 92);              // Darker, slightly desaturated blue-grey panel
    uiBorderColor = color(190, 85, 95, 95);             // Bright cyan border
    uiTextColor = color(0, 0, 95);                      // White text
    uiHighlightColor = color(60, 90, 100);              // Bright yellow highlight
    uiButtonColor = color(210, 70, 60);                 // Standard button blue
    uiButtonHoverColor = color(205, 85, 75);            // Brighter blue on hover
    uiButtonDisabledColor = color(220, 20, 35, 85);     // Very desaturated, darker blue-grey disabled
    uiButtonBorderColor = color(200, 90, 85);           // Standard button border cyan
    uiTextShadowColor = color(0, 0, 5, 50);             // Subtle dark shadow
    uiSpecialButtonColor = color(120, 65, 65);          // Greenish for 'Next Level' / 'Back'
    uiSpecialButtonHoverColor = color(115, 75, 75);     // Brighter green hover
    uiSpecialButtonBorderColor = color(110, 85, 90);    // Green border
    uiProgressBarColor = color(120, 80, 80);            // Green progress bar fill
    uiProgressBarBgColor = color(0, 0, 30, 80);         // Dark background for progress bar

    // Initialize background colors
    currentTopColor = color(260, 80, 10); currentBottomColor = color(240, 70, 25);
    previousTopColor = currentTopColor; // Initialize previous colors
    previousBottomColor = currentBottomColor;
    targetTopColor = currentTopColor;   // Initial target is the same
    targetBottomColor = currentBottomColor;
    isTransitioning = false;
    transitionProgress = 0;


    setDifficultyForLevel(currentLevel); // Still sets spawn rates etc.
    setupMenuButtons();
    setupSettingsMenuButtons();
    setupCosmeticsMenuButtons();
    setupSkillTreeButtons(); // Setup skill tree buttons
    setupPauseMenuButtons(); // Setup pause menu buttons
    // calculateMobileSettingsButtonPosition(); // Position now calculated in drawHUD
    calculateMobileActionButtonsPosition();
    // loadObjectiveForLevel(currentLevel); // Load initial objective (will be done in resetGame/startGame)
}


// ==================
// Helper Functions
// ==================
function spawnInitialAsteroids() { asteroids = []; for (let i = 0; i < initialAsteroids; i++) { let startPos; let shipX = ship ? ship.pos.x : width / 2; let shipY = ship ? ship.pos.y : height - 50; do { startPos = createVector(random(width), random(height * 0.7)); } while (ship && dist(startPos.x, startPos.y, shipX, shipY) < 150); asteroids.push(new Asteroid(startPos.x, startPos.y)); } }
function createParticles(x, y, count, particleColor, particleSize = null, speedMult = 1, lifespanMult = 1) { let densityMultiplier = 1.0; if (settingParticleDensity === 'Medium') { densityMultiplier = 0.5; } else if (settingParticleDensity === 'Low') { densityMultiplier = 0.2; } let actualCount = floor(count * densityMultiplier); if (actualCount < 1 && count > 0 && densityMultiplier > 0.01) actualCount = 1; if (actualCount <= 0) return; let baseHue = hue(particleColor); let baseSat = saturation(particleColor); let baseBri = brightness(particleColor); for (let i = 0; i < actualCount; i++) { let pColor = color( (baseHue + random(-15, 15)) % 360, baseSat * random(0.7, 1.1), baseBri * random(0.8, 1.2), 100 ); particles.push(new Particle(x, y, pColor, particleSize, speedMult, lifespanMult)); } }
function createStarfield(numStars) { stars = []; for (let i = 0; i < numStars; i++) { stars.push(new Star()); } }
function setDifficultyForLevel(level) {
    let effectiveLevel = min(level, MAX_LEVEL); let mobileFactor = isMobile ? 0.7 : 1.0;
    baseAsteroidSpawnRate = (0.009 + (effectiveLevel - 1) * 0.0015) * mobileFactor;
    currentAsteroidSpawnRate = baseAsteroidSpawnRate;
    baseEnemySpawnRate = (0.002 + (effectiveLevel - 1) * 0.0006) * mobileFactor;
    basicEnemyWeight = 10;
    kamikazeWeight = (effectiveLevel >= 2) ? 3 + effectiveLevel : 0;
    turretWeight = (effectiveLevel >= 5) ? 2 + floor(effectiveLevel / 2) : 0;
    swarmerWeight = (effectiveLevel >= 3) ? 4 + effectiveLevel : 0;
    laserWeight = (effectiveLevel >= 7) ? 1 + floor(effectiveLevel / 3.5) : 0; // Laser enemies start appearing
}

// --- Objective Loading ---
function loadObjectiveForLevel(level) {
    if (level > 0 && level < LEVEL_OBJECTIVES.length) {
        let objectiveData = LEVEL_OBJECTIVES[level];
        currentObjective.type = objectiveData.type;
        currentObjective.target = objectiveData.target;
        currentObjective.progress = 0;
        currentObjective.description = objectiveData.description;
        currentObjective.startTime = frameCount; // Reset start time for time-based objectives
    } else {
        // Default or error handling if level objective is missing
        currentObjective.type = null;
        currentObjective.target = 1;
        currentObjective.progress = 0;
        currentObjective.description = "ERROR: Objective Missing";
        currentObjective.startTime = frameCount;
        console.error("Missing objective definition for level:", level);
    }
    levelStartTime = frameCount; // Track when level gameplay started
}


function setupShopButtons() {
    shopButtons = [];
    let buttonWidth = isMobile ? 190 : 240; let buttonHeight = isMobile ? 45 : 55;

    // Define available upgrade button IDs
    let availableButtonIds = ['fireRate', 'spreadShot', 'rearGun'];
    if (!isMobile) {
        availableButtonIds.push('homingMissiles'); // Add missiles only for non-mobile
    }

    let numButtons = availableButtonIds.length;
    let totalButtonHeight = numButtons * buttonHeight + (numButtons - 1) * (isMobile ? 10 : 15);
    let startX = width / 2 - buttonWidth / 2;
    let startY = height / 2 - totalButtonHeight / 2 - (isMobile ? 30 : 40);
    let spacing = buttonHeight + (isMobile ? 10 : 15);
    let nextLevelSpacing = isMobile ? 25 : 30;

    // Create buttons for available upgrades
    for (let i = 0; i < numButtons; i++) {
        let buttonId = availableButtonIds[i];
        let buttonY = startY + i * spacing;
        shopButtons.push({ id: buttonId, x: startX, y: buttonY, w: buttonWidth, h: buttonHeight });
    }

    // Add the 'Next Level' button below the upgrade buttons
    let nextLevelY = startY + numButtons * spacing + nextLevelSpacing;
    shopButtons.push({ id: 'nextLevel', x: startX, y: nextLevelY, w: buttonWidth, h: buttonHeight });
}
function setupMenuButtons() { startMenuButtons = []; let buttonWidth = isMobile ? 180 : 220; let buttonHeight = isMobile ? 40 : 50; let startY = height / 2 - buttonHeight * (menuItems.length / 2.0); let spacing = isMobile ? 55 : 65; for (let i = 0; i < menuItems.length; i++) { startMenuButtons.push({ id: menuItems[i], index: i, x: width / 2 - buttonWidth / 2, y: startY + i * spacing - buttonHeight/2, w: buttonWidth, h: buttonHeight }); } }
function setupSettingsMenuButtons() { settingsMenuButtons = []; let buttonWidth = isMobile ? 200 : 260; let buttonHeight = isMobile ? 38 : 45; let startY = height * 0.35; let spacing = isMobile ? 50 : 60; for (let i = 0; i < settingsItems.length; i++) { settingsMenuButtons.push({ id: settingsItems[i].id, index: i, x: width / 2 - buttonWidth / 2, y: startY + i * spacing, w: buttonWidth, h: buttonHeight }); } }
function setupCosmeticsMenuButtons() { cosmeticsMenuButtons = []; let buttonWidth = isMobile ? 200 : 260; let buttonHeight = isMobile ? 38 : 45; let startY = height * 0.35; let spacing = isMobile ? 50 : 60; for (let i = 0; i < cosmeticsMenuItems.length; i++) { cosmeticsMenuButtons.push({ id: cosmeticsMenuItems[i].id, index: i, x: width / 2 - buttonWidth / 2, y: startY + i * spacing, w: buttonWidth, h: buttonHeight }); } }
function setupSkillTreeButtons() {
    skillTreeButtons = [];
    let buttonWidth = isMobile ? 150 : 180;
    let buttonHeight = isMobile ? 35 : 40;
    let cols = isMobile ? 2 : 3;
    let rows = ceil(Object.keys(SKILL_DEFINITIONS).length / cols);
    let gridW = cols * buttonWidth + (cols - 1) * (isMobile ? 15 : 20);
    let gridH = rows * buttonHeight + (rows - 1) * (isMobile ? 15 : 20);
    let startX = width / 2 - gridW / 2;
    let startY = height * 0.3; // Adjusted start Y
    let xSpacing = buttonWidth + (isMobile ? 15 : 20);
    let ySpacing = buttonHeight + (isMobile ? 15 : 20);
    let backButtonYOffset = isMobile ? 30 : 40;

    let i = 0;
    for (const skillId in SKILL_DEFINITIONS) {
        let col = i % cols;
        let row = floor(i / cols);
        let btnX = startX + col * xSpacing;
        let btnY = startY + row * ySpacing;
        skillTreeButtons.push({ id: skillId, x: btnX, y: btnY, w: buttonWidth, h: buttonHeight });
        i++;
    }

    // Add Back Button
    let backButtonWidth = isMobile ? 120 : 150;
    let backButtonHeight = isMobile ? 35 : 40;
    let backButtonX = width / 2 - backButtonWidth / 2;
    let backButtonY = startY + gridH + backButtonYOffset;
    skillTreeButtons.push({ id: 'back', x: backButtonX, y: backButtonY, w: backButtonWidth, h: backButtonHeight });
}
function setupPauseMenuButtons() {
    pauseMenuButtons = [];
    let buttonWidth = isMobile ? 160 : 200;
    let buttonHeight = isMobile ? 38 : 45;
    let startY = height / 2 - buttonHeight * (pauseMenuItems.length / 2.0);
    let spacing = buttonHeight + (isMobile ? 15 : 20);

    for (let i = 0; i < pauseMenuItems.length; i++) {
        pauseMenuButtons.push({
            id: pauseMenuItems[i],
            index: i,
            x: width / 2 - buttonWidth / 2,
            y: startY + i * spacing - buttonHeight / 2,
            w: buttonWidth,
            h: buttonHeight
        });
    }
}
// function calculateMobileSettingsButtonPosition() { // REMOVED - calculated directly in drawHUD
//     mobileSettingsButton.size = isMobile ? 35 : 45;
//     mobileSettingsButton.padding = 10;
//     mobileSettingsButton.x = mobileSettingsButton.padding;
//     mobileSettingsButton.y = height - mobileSettingsButton.size - mobileSettingsButton.padding;
// }
function calculateMobileActionButtonsPosition() { let buttonSize = isMobile ? 50 : 60; let padding = 15; mobileMissileButton.size = buttonSize; mobileMissileButton.padding = padding; mobileMissileButton.x = width - buttonSize - padding; mobileMissileButton.y = height - buttonSize - padding; }

// Enhanced Text Drawing with Shadow
function drawShadowedText(label, x, y, size, textColor, shadowColor) {
    textSize(size);
    fill(shadowColor);
    text(label, x + 1, y + 1); // Draw shadow slightly offset
    fill(textColor);
    text(label, x, y); // Draw main text
}

function drawButtonText(label, button, defaultSize, textColor = uiTextColor, shadowColor = uiTextShadowColor) {
    let currentTextSize = defaultSize; textSize(currentTextSize); let tw = textWidth(label);
    while (tw > button.w - BUTTON_TEXT_PADDING && currentTextSize > 8) { currentTextSize--; textSize(currentTextSize); tw = textWidth(label); }
    // Draw shadow first
    fill(shadowColor);
    text(label, button.x + button.w / 2 + 1, button.y + button.h / 2 + 1);
    // Draw text
    fill(textColor);
    text(label, button.x + button.w / 2, button.y + button.h / 2);
}


// Helper function to draw a hexagon centered at (x, y) with radius r
function drawHexagon(x, y, r) {
    beginShape();
    for (let i = 0; i < 6; i++) {
        let angle = TWO_PI / 6 * i + PI / 6; // Add offset for flat top/bottom
        vertex(x + cos(angle) * r, y + sin(angle) * r);
    }
    endShape(CLOSE);
}

// --- Persistence Functions ---
function saveGameData() {
    try {
        let dataToSave = {
            techFragments: techFragments,
            skillTreeData: skillTreeData
        };
        localStorage.setItem('spaceChaseSaveData', JSON.stringify(dataToSave));
        // console.log("Game data saved.");
    } catch (e) {
        console.error("Error saving game data to localStorage:", e);
    }
}

function loadGameData() {
    try {
        let savedDataString = localStorage.getItem('spaceChaseSaveData');
        if (savedDataString) {
            let savedData = JSON.parse(savedDataString);
            techFragments = savedData.techFragments || 0;
            // Carefully merge skill tree data to handle potential new skills added later
            if (savedData.skillTreeData) {
                 for (const skillId in skillTreeData) { // Use default skillTreeData keys
                     if (savedData.skillTreeData.hasOwnProperty(skillId)) {
                         skillTreeData[skillId] = savedData.skillTreeData[skillId];
                     }
                 }
            }
            // console.log("Game data loaded:", skillTreeData, techFragments);
        } else {
             resetSkillTreeAndFragments(); // Reset if no save data found
             // console.log("No save data found, resetting skills and fragments.");
        }
    } catch (e) {
        console.error("Error loading game data from localStorage:", e);
        resetSkillTreeAndFragments(); // Reset on error
    }
}

// --- Skill Tree Reset Function ---
function resetSkillTreeAndFragments() {
    techFragments = 0;
    skillTreeData = {
        'MAX_SPEED': 0,
        'MAX_LIVES': 0,
        'SHIELD_REGEN': 0,
        'WEAPON_DAMAGE': 0,
        'MISSILE_DAMAGE': 0,
        'STARTING_MONEY': 0
    };
    // console.log("Skill Tree and Tech Fragments Reset.");
}


// ==================
// p5.js Draw Loop
// ==================
function draw() {
    // --- Background Color Transition Logic ---
    if (frameCount > 0 && frameCount % BACKGROUND_CHANGE_INTERVAL === 0 && !isTransitioning) {
        // Time to start a new transition
        previousTopColor = currentTopColor;
        previousBottomColor = currentBottomColor;

        let topH = random(180, 300);
        let bottomH = (topH + random(20, 60)) % 360;
        targetTopColor = color(topH, random(70, 90), random(10, 20));
        targetBottomColor = color(bottomH, random(60, 85), random(25, 40));

        isTransitioning = true;
        transitionProgress = 0;
    }

    if (isTransitioning) {
        transitionProgress += 1.0 / TRANSITION_DURATION;
        transitionProgress = min(transitionProgress, 1.0); // Clamp

        currentTopColor = lerpColor(previousTopColor, targetTopColor, transitionProgress);
        currentBottomColor = lerpColor(previousBottomColor, targetBottomColor, transitionProgress);

        if (transitionProgress >= 1.0) {
            isTransitioning = false;
        }
    }
    // --- End Background Color Transition Logic ---


    // Spawn Planet Logic
    if (settingBackgroundEffectsEnabled && gameState !== GAME_STATE.START_MENU && gameState !== GAME_STATE.SETTINGS_MENU && gameState !== GAME_STATE.COSMETICS_MENU && gameState !== GAME_STATE.SKILL_TREE ) { // Don't update during skill tree either
         let currentTime = millis();
         if (!planetVisible && currentTime - lastPlanetAppearanceTime > random(PLANET_MIN_INTERVAL, PLANET_MAX_INTERVAL)) {
             spawnPlanet();
             lastPlanetAppearanceTime = currentTime;
         }
         if (planetVisible) {
             planetData.pos.add(planetData.vel);
             planetData.rotation += planetData.cloudRotationSpeed * 0.01; // Slow base rotation for clouds if needed
             if (planetData.type === PLANET_TYPE.STORMY) {
                 planetData.lightningTimer--;
             }
             // Check if planet is offscreen
             let buffer = planetData.size * (planetData.hasRings ? 1.8 : 0.8); // Larger buffer if rings
             if (planetData.pos.x < -buffer || planetData.pos.x > width + buffer || planetData.pos.y < -buffer || planetData.pos.y > height + buffer) {
                 planetVisible = false;
             }
         }
     } else {
         planetVisible = false; // Hide planet if background effects off or in menus
     }

    if (settingBackgroundEffectsEnabled && gameState === GAME_STATE.PLAYING && !isPaused && random(1) < shootingStarSpawnRate) { shootingStars.push(new ShootingStar()); }
     if (settingBackgroundEffectsEnabled && gameState === GAME_STATE.PLAYING && !isPaused && random(1) < structureSpawnRate && backgroundStructures.length < 1) { backgroundStructures.push(new BackgroundStructure()); }


    // Drawing
    drawBackgroundAndStars(); // Draws stars, nebulas, structures, planet etc.
    push();
    if (screenShakeDuration > 0 && settingScreenShakeEnabled) { screenShakeDuration--; translate(random(-screenShakeIntensity, screenShakeIntensity), random(-screenShakeIntensity, screenShakeIntensity)); } else { screenShakeDuration = 0; screenShakeIntensity = 0; }

    // Game State Logic & Drawing
    switch (gameState) {
         case GAME_STATE.START_MENU: displayStartMenu(); break;
         case GAME_STATE.SETTINGS_MENU: displaySettingsMenu(); break;
         case GAME_STATE.COSMETICS_MENU: displayCosmeticsMenu(); break;
         case GAME_STATE.SKILL_TREE: displaySkillTree(); break; // NEW
         case GAME_STATE.PLAYING: runGameLogic(); if (isPaused) { displayPauseMenu(); } break; // Show pause menu when paused
         case GAME_STATE.UPGRADE_SHOP: displayUpgradeShop(); break;
         case GAME_STATE.GAME_OVER: runGameLogic(); displayGameOver(); break;
         case GAME_STATE.WIN_SCREEN: runGameLogic(); displayWinScreen(); break;
     }

    // Overlays
    if (infoMessageTimeout > 0) { displayInfoMessage(); if ((gameState === GAME_STATE.PLAYING && !isPaused) || gameState === GAME_STATE.UPGRADE_SHOP || gameState === GAME_STATE.START_MENU || gameState === GAME_STATE.COSMETICS_MENU || gameState === GAME_STATE.SKILL_TREE) { infoMessageTimeout--; } }
    if (levelTransitionFlash > 0) { fill(0, 0, 100, levelTransitionFlash * 10); rect(0, 0, width, height); levelTransitionFlash--; }
    pop();
}


// --- Screen Display Functions ---
function displayStartMenu() {
    // Title remains the same
    let titleText = "Space-Chase"; let titleSize = isMobile ? 56 : 72; textSize(titleSize); textAlign(CENTER, CENTER); let totalWidth = textWidth(titleText); let startX = width / 2 - totalWidth / 2; let currentX = startX;
    let titleY = height / 4; // Raised position
    for (let i = 0; i < titleText.length; i++) { let char = titleText[i]; let charWidth = textWidth(char); let yOffset = sin(frameCount * 0.1 + i * 0.7) * (isMobile ? 7 : 10); drawShadowedText(char, currentX + charWidth / 2, titleY + yOffset, titleSize, color((frameCount * 4 + i * 25) % 360, 95, 100), color(0, 0, 0, 50)); currentX += charWidth; } // Used shadowed text for title

    // Draw Buttons
    let menuTextSize = isMobile ? 24 : 30; // Default size
    textAlign(CENTER, CENTER);
    for (let i = 0; i < startMenuButtons.length; i++) {
        let button = startMenuButtons[i];
        let label = button.id;
        let hover = !isMobile && (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h);
        let selected = (i === selectedMenuItem);
        drawStyledUiButton(button, label, menuTextSize, hover, selected, false); // Use the new button drawing function
    }
    cursor(ARROW);
}
function displaySettingsMenu() {
    drawPanelBackground(width * (isMobile ? 0.85 : 0.7), height * 0.7);
    drawShadowedText("Settings", width / 2, height * 0.2, isMobile ? 36 : 48, uiTextColor, uiTextShadowColor);

    let menuTextSize = isMobile ? 18 : 22; // Default size
    textAlign(CENTER, CENTER);
    for (let i = 0; i < settingsMenuButtons.length; i++) {
        let button = settingsMenuButtons[i];
        let setting = settingsItems[i];
        let label = setting.label;
        let currentValue = '';
        if (setting.type === 'toggle') { let stateVariable = (setting.id === 'screenShake') ? settingScreenShakeEnabled : settingBackgroundEffectsEnabled; currentValue = stateVariable ? ': ON' : ': OFF'; }
        else if (setting.type === 'cycle') { currentValue = ': ' + settingParticleDensity; }
        let fullLabel = label + currentValue;
        let hover = !isMobile && (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h);
        let selected = (i === selectedSettingsItem);
        let isSpecial = (setting.id === 'back');
        drawStyledUiButton(button, fullLabel, menuTextSize, hover, selected, isSpecial);
    }
    cursor(ARROW);
}
function displayCosmeticsMenu() {
    drawPanelBackground(width * (isMobile ? 0.85 : 0.7), height * 0.7);
    drawShadowedText("Cosmetics", width / 2, height * 0.2, isMobile ? 36 : 48, uiTextColor, uiTextShadowColor);

    let menuTextSize = isMobile ? 18 : 22; // Default size
    textAlign(CENTER, CENTER);
    for (let i = 0; i < cosmeticsMenuButtons.length; i++) {
        let button = cosmeticsMenuButtons[i];
        let setting = cosmeticsMenuItems[i];
        let label = setting.label;
        let currentValue = '';
        if (setting.id === 'shipColor') { currentValue = `: ${selectedShipColor}`; }
        else if (setting.id === 'bulletStyle') { currentValue = `: ${selectedBulletStyle}`; }
        let fullLabel = label + currentValue;
        let hover = !isMobile && (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h);
        let selected = (i === selectedCosmeticsMenuItem);
        let isSpecial = (setting.id === 'back');
        drawStyledUiButton(button, fullLabel, menuTextSize, hover, selected, isSpecial);
    }
    // Tiny Ship Preview (remains simple)
    let previewY = height * 0.2 + (isMobile ? 60 : 80); let previewSize = isMobile ? 40 : 50;
    let currentPalette = COLOR_DEFINITIONS[selectedShipColor];
    if (currentPalette) { push(); translate(width / 2, previewY); fill(currentPalette.body[0], currentPalette.body[1], currentPalette.body[2]); rect(-previewSize / 2, -previewSize / 4, previewSize, previewSize / 2); fill(currentPalette.wing[0], currentPalette.wing[1], currentPalette.wing[2]); triangle(-previewSize / 2, 0, -previewSize * 0.7, previewSize * 0.3, -previewSize * 0.3, previewSize * 0.1); triangle(previewSize / 2, 0, previewSize * 0.7, previewSize * 0.3, previewSize * 0.3, previewSize * 0.1); pop(); }
    cursor(ARROW);
}
function displaySkillTree() {
    drawPanelBackground(width * (isMobile ? 0.95 : 0.8), height * (isMobile ? 0.85 : 0.8));
    drawShadowedText("Skill Tree", width / 2, height * 0.12, isMobile ? 36 : 48, uiTextColor, uiTextShadowColor);
    // Tech Fragment Display (Enhanced)
    textAlign(CENTER, TOP);
    let tfTextSize = isMobile ? 20 : 26;
    drawShadowedText(`Tech Fragments: ${techFragments}`, width / 2, height * 0.12 + (isMobile ? 50 : 65), tfTextSize, uiHighlightColor, uiTextShadowColor);

    let buttonTextSize = isMobile ? 11 : 13;
    textAlign(CENTER, CENTER);
    selectedSkillButton = null; // Reset selected button description check

    // Check hover for description display
    for (let button of skillTreeButtons) {
        if (button.id !== 'back' && !isMobile && mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h) {
             selectedSkillButton = button.id;
             break;
        }
    }

    // Draw Buttons
    for (let button of skillTreeButtons) {
        let hover = !isMobile && (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h);

        if (button.id === 'back') {
            drawStyledUiButton(button, "Back", buttonTextSize + 2, hover, false, true); // Use styled button (special type)
        } else {
            // Draw Skill Button
            let skillId = button.id;
            let skillDef = SKILL_DEFINITIONS[skillId];
            let currentLevel = skillTreeData[skillId];
            let isMaxed = currentLevel >= skillDef.maxLevel;
            let cost = isMaxed ? "MAX" : skillDef.costPerLevel[currentLevel];
            let canAfford = !isMaxed && techFragments >= cost;

            let label = `${skillDef.label} ${currentLevel}/${skillDef.maxLevel}`;
            let costText = isMaxed ? "(MAX)" : `(${cost} TF)`;
            let fullLabel = label + "\n" + costText; // Combine label and cost for the button function

            let isDisabled = isMaxed || (!isMaxed && !canAfford);
            let textColor = uiTextColor;
            if(isMaxed) textColor = color(0,0,60);
            else if (!canAfford) textColor = color(0,0,85);

            drawStyledUiButton(button, fullLabel, buttonTextSize, hover, false, false, isDisabled, textColor); // Use the new button func
        }
    }

     // Draw Skill Description Tooltip (Enhanced Background)
     if(selectedSkillButton) {
        let skillDef = SKILL_DEFINITIONS[selectedSkillButton];
        let currentLevel = skillTreeData[selectedSkillButton];
        let desc = skillDef.description;
        let effect = "";
        if (skillDef.effectPerLevel) {
             if (selectedSkillButton === 'SHIELD_REGEN') {
                effect = ` (+${(skillDef.effectPerLevel * currentLevel * 60).toFixed(2)}/s)`; // Show per second
            } else if (selectedSkillButton === 'WEAPON_DAMAGE') {
                 effect = ` (+${(skillDef.effectPerLevel * currentLevel * 100).toFixed(0)}%)`;
            }
             else {
                effect = ` (+${(skillDef.effectPerLevel * currentLevel).toFixed(1)})`;
            }
        }

        let fullDesc = desc + effect;
        let tooltipTextSize = isMobile? 12 : 14;
        textSize(tooltipTextSize);
        textAlign(CENTER, BOTTOM);
        let descWidth = textWidth(fullDesc);
        let boxWidth = descWidth + 20;
        let boxHeight = tooltipTextSize + 10;
        let boxX = mouseX - boxWidth / 2; // Position near mouse
        let boxY = mouseY - boxHeight - 10; // Position above mouse
        boxX = constrain(boxX, 10, width - boxWidth - 10);
        boxY = constrain(boxY, 10, height - boxHeight - 10);

        // Draw panel for tooltip
        fill(uiPanelColor);
        stroke(uiBorderColor);
        strokeWeight(1.5);
        rect(boxX, boxY, boxWidth, boxHeight, 5); // Use panel color and border

        // Draw text with shadow
        noStroke();
        drawShadowedText(fullDesc, boxX + boxWidth / 2, boxY + boxHeight - 5, tooltipTextSize, uiTextColor, uiTextShadowColor);
    }
    cursor(ARROW);
}
function displayPauseMenu() {
    drawPanelBackground(width * 0.5, height * 0.6); // Adjust size as needed
    drawShadowedText("PAUSED", width / 2, height * 0.3, isMobile ? 48 : 56, uiTextColor, uiTextShadowColor);

    let menuTextSize = isMobile ? 20 : 24;
    textAlign(CENTER, CENTER);
    for (let i = 0; i < pauseMenuButtons.length; i++) {
        let button = pauseMenuButtons[i];
        let label = button.id;
        let hover = !isMobile && (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h);
        let selected = (i === selectedPauseMenuItem); // Use keyboard selection highlight
        let isSpecial = (label === 'Main Menu'); // Different color for Main Menu button
        drawStyledUiButton(button, label, menuTextSize, hover, selected, isSpecial);
    }
    cursor(ARROW);
}
function displayUpgradeShop() {
    drawPanelBackground(width * (isMobile ? 0.95 : 0.8), height * (isMobile ? 0.85 : 0.85));
    drawShadowedText(`Level ${currentLevel} Complete!`, width / 2, height * 0.1, isMobile ? 36 : 48, uiTextColor, uiTextShadowColor);
    drawShadowedText("Upgrade Shop", width / 2, height * 0.1 + (isMobile ? 50 : 65), isMobile ? 26 : 32, uiTextColor, uiTextShadowColor);
    drawShadowedText(`Money: $${money}`, width / 2, height * 0.1 + (isMobile ? 90 : 115), isMobile ? 20 : 26, uiHighlightColor, uiTextShadowColor);

    textAlign(CENTER, CENTER);
    for (let button of shopButtons) {
        drawUpgradeShopButton(button); // Use specific function for shop button formatting
    }
}
function displayGameOver() {
    drawPanelBackground(width * (isMobile ? 0.8 : 0.6), height * 0.5);
    drawShadowedText("GAME OVER", width / 2, height / 3, isMobile ? 52 : 68, color(0, 80, 100), uiTextShadowColor);
    drawShadowedText("Final Points: " + points, width / 2, height / 3 + (isMobile ? 60 : 75), isMobile ? 26 : 34, uiTextColor, uiTextShadowColor);

    // Inform user about skill reset
     drawShadowedText(`Skill Tree Progress Reset`, width / 2, height / 3 + (isMobile ? 95 : 115), isMobile ? 16 : 20, uiHighlightColor, uiTextShadowColor);

    textAlign(CENTER, CENTER);
    let restartInstruction = isMobile ? "Tap Screen for Menu" : "Click or Press Enter for Menu";
    let pulse = map(sin(frameCount * 0.1), -1, 1, 85, 100);
    drawShadowedText(restartInstruction, width / 2, height * 0.7, isMobile ? 18 : 22, color(0, 0, pulse), uiTextShadowColor);
    cursor(ARROW);
}
function displayWinScreen() {
    drawPanelBackground(width * (isMobile ? 0.85 : 0.7), height * 0.6);
    // Rainbow Win Text
    let winTextSize = isMobile ? 58 : 72; textSize(winTextSize); textAlign(CENTER, CENTER); let winY = height / 3; let winText = "YOU WIN!"; let totalWinWidth = textWidth(winText); let startWinX = width / 2 - totalWinWidth / 2; let currentWinX = startWinX; for (let i = 0; i < winText.length; i++) { let char = winText[i]; let charWidth = textWidth(char); let h = (frameCount * 4 + i * 30) % 360; drawShadowedText(char, currentWinX + charWidth / 2, winY, winTextSize, color(h, 95, 100), uiTextShadowColor); currentWinX += charWidth; }

    drawShadowedText("Final Points: " + points, width / 2, winY + (isMobile ? 65 : 80), isMobile ? 26 : 34, uiTextColor, uiTextShadowColor);

    // Award Tech Fragments on Win based on score
    let fragmentsEarned = floor(points / 300) + 10; // Example: 1 per 300 points + 10 bonus for winning
    if (fragmentsEarned > 0) {
        // Note: fragments are awarded *before* this screen potentially shows
        drawShadowedText(`+${fragmentsEarned} Tech Fragments!`, width / 2, winY + (isMobile ? 100 : 120), isMobile ? 16 : 20, uiHighlightColor, uiTextShadowColor);
    }

    textAlign(CENTER, CENTER);
    let restartInstruction = isMobile ? "Tap Screen for Menu" : "Click or Press Enter for Menu";
    let pulse = map(sin(frameCount * 0.1), -1, 1, 85, 100);
    drawShadowedText(restartInstruction, width / 2, height * 0.7, isMobile ? 18 : 22, color(0, 0, pulse), uiTextShadowColor);
    cursor(ARROW);
}

// Enhanced Panel Background Drawing
function drawPanelBackground(panelWidth, panelHeight) {
    let panelX = width / 2 - panelWidth / 2;
    let panelY = height / 2 - panelHeight / 2;
    // Outer border
    fill(uiPanelColor);
    stroke(uiBorderColor);
    strokeWeight(2.5); // Slightly thicker main border
    rect(panelX, panelY, panelWidth, panelHeight, 10);
    // Inner subtle border/highlight
    noFill();
    strokeWeight(1);
    stroke(0, 0, 100, 15); // Subtle white highlight inside top/left
    line(panelX + 2, panelY + 2, panelX + panelWidth - 2, panelY + 2);
    line(panelX + 2, panelY + 2, panelX + 2, panelY + panelHeight - 2);
    stroke(0, 0, 0, 25); // Subtle dark shadow inside bottom/right
    line(panelX + 2, panelY + panelHeight - 2, panelX + panelWidth - 2, panelY + panelHeight - 2);
    line(panelX + panelWidth - 2, panelY + 2, panelX + panelWidth - 2, panelY + panelHeight - 2);
    noStroke();
}

// Enhanced Generic UI Button Drawing Function
function drawStyledUiButton(button, label, defaultTextSize, hover, selected, isSpecial = false, isDisabled = false, customTextColor = null) {
    let buttonCol, borderCol, textCol;
    let shadowCol = uiTextShadowColor;
    let cornerRadius = 8;
    let baseStrokeWeight = 1.5;
    let hoverStrokeWeight = 2.5;

    // Determine colors based on state
    if (isDisabled) {
        buttonCol = uiButtonDisabledColor;
        borderCol = color(hue(uiButtonDisabledColor), saturation(uiButtonDisabledColor) * 0.8, brightness(uiButtonDisabledColor) * 0.8);
        textCol = customTextColor || color(0, 0, 60);
        shadowCol = color(0, 0, 10, 30);
    } else if (isSpecial) {
        buttonCol = hover || selected ? uiSpecialButtonHoverColor : uiSpecialButtonColor;
        borderCol = hover || selected ? color(hue(uiSpecialButtonHoverColor), saturation(uiSpecialButtonHoverColor)*1.1, brightness(uiSpecialButtonHoverColor)*1.1) : uiSpecialButtonBorderColor;
        textCol = customTextColor || uiTextColor;
    } else {
        buttonCol = hover || selected ? uiButtonHoverColor : uiButtonColor;
        borderCol = hover || selected ? color(hue(uiButtonHoverColor), saturation(uiButtonHoverColor)*1.1, brightness(uiButtonHoverColor)*1.1) : uiButtonBorderColor;
        textCol = customTextColor || uiTextColor;
    }

    // Draw Button Body
    fill(buttonCol);
    stroke(borderCol);
    strokeWeight(selected || hover ? hoverStrokeWeight : baseStrokeWeight);
    rect(button.x, button.y, button.w, button.h, cornerRadius);

    // Subtle Inner Bevel/Highlight (Optional, adds polish)
    noFill();
    strokeWeight(1);
    // Top/Left highlight
    stroke(0, 0, 100, isDisabled ? 5 : 20);
    line(button.x + 2, button.y + 2, button.x + button.w - 2, button.y + 2);
    line(button.x + 2, button.y + 2, button.x + 2, button.y + button.h - 2);
    // Bottom/Right shadow
    stroke(0, 0, 0, isDisabled ? 15 : 35);
    line(button.x + 2, button.y + button.h - 2, button.x + button.w - 2, button.y + button.h - 2);
    line(button.x + button.w - 2, button.y + 2, button.x + button.w - 2, button.y + button.h - 2);
    noStroke();

    // Draw Text (uses helper for fitting and shadow)
    drawButtonText(label, button, defaultTextSize, textCol, shadowCol);
}


// Specific function for Upgrade Shop buttons to handle complex label formatting
function drawUpgradeShopButton(button) {
    let cost = "?"; let label = ""; let isMaxed = false; let canAfford = false; let currentLevelText = ""; let isUpgradeButton = false;
    let baseTextColor = uiTextColor;

    switch (button.id) {
        case 'fireRate': cost = ship.getUpgradeCost('fireRate'); isMaxed = (cost === "MAX"); if (!isMaxed) canAfford = (money >= cost); currentLevelText = `Lvl ${ship.fireRateLevel}/${ship.maxUpgradeLevel}`; label = `Fire Rate ${currentLevelText}`; isUpgradeButton = true; break;
        case 'spreadShot': cost = ship.getUpgradeCost('spreadShot'); isMaxed = (cost === "MAX"); if (!isMaxed) canAfford = (money >= cost); currentLevelText = `Lvl ${ship.spreadShotLevel}/${ship.maxUpgradeLevel}`; label = `Spread Shot ${currentLevelText}`; isUpgradeButton = true; break;
        case 'rearGun': cost = ship.getUpgradeCost('rearGun'); isMaxed = (cost === "MAX"); if (!isMaxed) canAfford = (money >= cost); currentLevelText = `Lvl ${ship.rearGunLevel}/${ship.maxRearGunLevel}`; label = `Rear Gun ${currentLevelText}`; isUpgradeButton = true; break;
        case 'homingMissiles': cost = ship.getUpgradeCost('homingMissiles'); isMaxed = (cost === "MAX"); if (!isMaxed) canAfford = (money >= cost); currentLevelText = `Lvl ${ship.homingMissilesLevel}/${ship.maxMissileLevel}`; label = `Missiles ${currentLevelText}`; isUpgradeButton = true; break;
        case 'nextLevel': label = `Start Level ${currentLevel + 1}`; isMaxed = false; canAfford = true; break;
    }

    let fullLabel = label;
    if (button.id !== 'nextLevel') {
        if (isMaxed) { fullLabel += "\n(MAX)"; }
        else { fullLabel += `\n($${cost})`; }
    }

    let hover = !isMobile && (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h);
    let isDisabled = (isUpgradeButton && (isMaxed || !canAfford));
    let isSpecial = (button.id === 'nextLevel');
    let defaultTextSize = isUpgradeButton ? (isMobile ? 13 : 15) : (isMobile ? 15 : 17);

    // Adjust text color for disabled state
    if (isMaxed) baseTextColor = color(0, 0, 60);
    else if (!canAfford) baseTextColor = color(0, 0, 85);

    drawStyledUiButton(button, fullLabel, defaultTextSize, hover, false, isSpecial, isDisabled, baseTextColor);
}


// --- Main Game Logic ---
function runGameLogic() {
    if (isPaused) { /* Only draw, no updates */ return; }
    if (!ship) return;

    // Updates
    ship.update(); if (ship.droneActive) ship.drone.update();
    for (let i = bullets.length - 1; i >= 0; i--) { bullets[i].update(); if (bullets[i].isOffscreen()) { bullets.splice(i, 1); } }
    for (let i = homingMissiles.length - 1; i >= 0; i--) { homingMissiles[i].update(); if (homingMissiles[i].isOffscreen() || homingMissiles[i].lifespan <= 0) { homingMissiles.splice(i, 1); } }
    for (let i = particles.length - 1; i >= 0; i--) { particles[i].update(); if (particles[i].isDead()) { particles.splice(i, 1); } }
    for (let i = enemyShips.length - 1; i >= 0; i--) { enemyShips[i].update(); if (enemyShips[i].isOffscreen()) { enemyShips.splice(i, 1); } }
    for (let i = enemyBullets.length - 1; i >= 0; i--) { enemyBullets[i].update(); if (enemyBullets[i].isOffscreen()) { enemyBullets.splice(i, 1); } }
    for (let i = asteroids.length - 1; i >= 0; i--) { if (!asteroids[i]) continue; asteroids[i].update(); }
    // Update potions/powerups/structures (moved updates here, draw below)
    for (let i = potions.length - 1; i >= 0; i--) { potions[i].update(); if (potions[i].isOffscreen()) { potions.splice(i,1); }}
    for (let i = powerUps.length - 1; i >= 0; i--) { powerUps[i].update(); if (powerUps[i].isOffscreen()) { powerUps.splice(i,1); }}
    for (let i = backgroundStructures.length - 1; i >= 0; i--) { backgroundStructures[i].update(); if (backgroundStructures[i].isOffscreen()) { backgroundStructures.splice(i,1); }}


    // Drawing (in correct order - background elements drawn in drawBackgroundAndStars)
    ship.draw(); if (ship.droneActive) ship.drone.draw();
    for (let b of bullets) b.draw();
    for (let m of homingMissiles) m.draw();
    for (let p of particles) p.draw();
    for (let a of asteroids) a.draw();
    for (let e of enemyShips) e.draw(); // Includes laser drawing logic
    for (let eb of enemyBullets) eb.draw();
    for (let pt of potions) pt.draw();
    for (let pu of powerUps) pu.draw();


    handleCollisions(); // Handle collisions BEFORE pickup checks
    handlePotions(); // Handle potion pickup logic AFTER collisions
    handlePowerUps(); // Handle power-up pickup logic AFTER collisions

    // Combo System Update
    if (comboTimer > 0) { comboTimer--; if (comboTimer <= 0) { if (maxComboReached >= 3) { let bonusPoints = maxComboReached * 5; let bonusMoney = floor(maxComboReached / 3); points += bonusPoints; money += bonusMoney; infoMessage = `Combo Bonus: +${bonusPoints} PTS, +$${bonusMoney}! (Max: x${maxComboReached})`; infoMessageTimeout = 120; } comboCounter = 0; maxComboReached = 0; showComboText = false; comboTextTimeout = 0; } }
    if (comboTextTimeout > 0) { comboTextTimeout--; if (comboTextTimeout <= 0) { showComboText = false; } }

    // Update Objective Progress (Time and Score based)
    if (currentObjective.type === OBJECTIVE_TYPE.SURVIVE_TIME) {
        currentObjective.progress = frameCount - levelStartTime; // Track frames elapsed in level
    } else if (currentObjective.type === OBJECTIVE_TYPE.SCORE_REACH) {
        currentObjective.progress = points; // Track current score
    }
    // Note: Collection/Destruction objectives updated in their respective handlers (handleCollisions, handlePotions, handlePowerUps)


     // Check for Objective Completion
    let objectiveComplete = false;
    if (currentObjective.type === OBJECTIVE_TYPE.SURVIVE_TIME) {
        objectiveComplete = currentObjective.progress >= currentObjective.target;
    } else if (currentObjective.type) { // For all other countable objectives
        objectiveComplete = currentObjective.progress >= currentObjective.target;
    }

     if (objectiveComplete && gameState === GAME_STATE.PLAYING) {
        if (currentLevel === MAX_LEVEL) {
            // --- WIN GAME ---
            let fragmentsEarned = floor(points / 300) + 10; // Award fragments on win
             if (fragmentsEarned > 0) techFragments += fragmentsEarned;
             gameState = GAME_STATE.WIN_SCREEN;
             saveGameData(); // Save after awarding fragments
             infoMessage = ""; infoMessageTimeout = 0; cursor(ARROW);
             bullets = []; homingMissiles = []; asteroids = []; particles = []; enemyShips = []; enemyBullets = []; powerUps = []; potions = []; backgroundStructures = []; comboCounter = 0; comboTimer = 0; maxComboReached = 0; showComboText = false; comboTextTimeout = 0;
            return;
        } else {
             // --- LEVEL COMPLETE ---
             let fragmentsEarned = 1 + floor(currentLevel / 3); // Award TF based on level
             techFragments += fragmentsEarned;
             points += 100 * currentLevel; money += 25 * currentLevel; // Bonus for completion
             gameState = GAME_STATE.UPGRADE_SHOP;
             infoMessage = `Level Complete! +${fragmentsEarned} TF`; infoMessageTimeout = 180;
             saveGameData(); // Save after earning fragments
             setupShopButtons(); cursor(ARROW);
             // Clear transient objects for the shop
             bullets = []; homingMissiles = []; enemyShips = []; enemyBullets = []; powerUps = []; potions = [];
             // Keep background structures between levels? Or clear? Let's clear them for now.
             // backgroundStructures = [];
             // Reset combo for next level
             comboCounter = 0; comboTimer = 0; maxComboReached = 0; showComboText = false; comboTextTimeout = 0;
             return; // Exit runGameLogic early as we are transitioning state
        }
    }


    // Spawning Logic (if still playing)
    if (gameState === GAME_STATE.PLAYING) {
        let timeFactor = floor((frameCount - levelStartTime) / 1800) * 0.0005; // Time factor based on level duration
        currentAsteroidSpawnRate = baseAsteroidSpawnRate + timeFactor;
        let currentTotalEnemySpawnRate = baseEnemySpawnRate + timeFactor * 0.5;
        let maxAsteroidsAllowed = min(40, 15 + currentLevel * 3);
        let maxEnemiesAllowed = min(15, 5 + currentLevel * 2);
        let maxPotionsAllowed = 2;
        let maxPowerUpsAllowed = 2; // INCREASED (was 1)
        let maxNebulasAllowed = 3;
        let maxStructuresAllowed = 1; // Max 1 background structure at a time

        // Spawn Asteroids
        if (random(1) < currentAsteroidSpawnRate && asteroids.length < maxAsteroidsAllowed) { asteroids.push(new Asteroid()); }

        // Spawn Enemies
        if (random(1) < currentTotalEnemySpawnRate && enemyShips.length < maxEnemiesAllowed) {
            let totalWeight = basicEnemyWeight + kamikazeWeight + turretWeight + swarmerWeight + laserWeight; // Added laserWeight
            let typeRoll = random(totalWeight);

            if (typeRoll < laserWeight && currentLevel >= 7) { // Check laser first if available
                enemyShips.push(new LaserEnemy());
            } else if (typeRoll < laserWeight + swarmerWeight && currentLevel >= 3) {
                 let swarmCount = floor(random(5, 10)); let spawnX = random(width * 0.2, width * 0.8); let spawnY = -20; for (let i = 0; i < swarmCount; i++) { if (enemyShips.length < maxEnemiesAllowed) { let offsetPos = createVector(spawnX + random(-50, 50), spawnY + random(-30, 30)); enemyShips.push(new SwarmerEnemy(offsetPos.x, offsetPos.y)); } else break; }
            } else if (typeRoll < laserWeight + swarmerWeight + turretWeight && currentLevel >= 5) {
                enemyShips.push(new TurretEnemy());
            } else if (typeRoll < laserWeight + swarmerWeight + turretWeight + kamikazeWeight && currentLevel >= 2) {
                enemyShips.push(new KamikazeEnemy());
            } else {
                enemyShips.push(new BasicEnemy());
            }
        }
        // Spawn Pickups & Background FX
        if (random(1) < potionSpawnRate && potions.length < maxPotionsAllowed) { potions.push(new HealthPotion()); }
        if (random(1) < powerUpSpawnRate && powerUps.length < maxPowerUpsAllowed) { let type = floor(random(NUM_POWERUP_TYPES)); powerUps.push(new PowerUp(type)); }
        if (settingBackgroundEffectsEnabled && random(1) < nebulaSpawnRate && nebulas.length < maxNebulasAllowed) { nebulas.push(new Nebula()); }
        if (settingBackgroundEffectsEnabled && random(1) < structureSpawnRate && backgroundStructures.length < maxStructuresAllowed) { backgroundStructures.push(new BackgroundStructure()); }
    }

    // Display HUD and Combo Text at the end
    if (gameState === GAME_STATE.PLAYING) { displayHUD(); displayComboText(); }
}


// --- Collision and Pickup Handling ---
function handlePowerUps() {
    if (gameState !== GAME_STATE.PLAYING || isPaused) return; // No powerup logic if not playing
    if (!ship) return;
    for (let i = powerUps.length - 1; i >= 0; i--) {
        // Updates and Offscreen checks are now in the main loop
        if (powerUps[i].hitsShip(ship)) {
            let powerUpType = powerUps[i].type;
            let pickupPos = powerUps[i].pos.copy();
            let pickupColor = powerUps[i].color;
            powerUps.splice(i, 1); // Remove FIRST
            createParticles(pickupPos.x, pickupPos.y, 25, pickupColor, 4, 1.8, 0.8);

            // Objective Progress Check *before* applying effect
            if (currentObjective.type === OBJECTIVE_TYPE.COLLECT_POWERUPS) {
                 currentObjective.progress++;
            }

            switch (powerUpType) {
                case POWERUP_TYPES.TEMP_SHIELD: ship.tempShieldActive = true; infoMessage = "TEMPORARY SHIELD!"; createParticles(ship.pos.x, ship.pos.y, 20, color(45, 90, 100)); break;
                case POWERUP_TYPES.RAPID_FIRE: ship.rapidFireTimer = 300; infoMessage = "RAPID FIRE!"; createParticles(ship.pos.x, ship.pos.y, 20, color(120, 90, 100)); break;
                case POWERUP_TYPES.EMP_BURST: infoMessage = "EMP BURST!"; createParticles(ship.pos.x, ship.pos.y, 60, color(210, 100, 100), 12, 3.5, 1.2);
                     // Clear Asteroids with particles & check objective
                     for (let k = asteroids.length - 1; k >= 0; k--) {
                         createParticles(asteroids[k].pos.x, asteroids[k].pos.y, floor(asteroids[k].size / 3), asteroids[k].color, 3, 1.5);
                         // Objective progress for destroyed asteroids
                         if (currentObjective.type === OBJECTIVE_TYPE.DESTROY_ASTEROIDS) { currentObjective.progress++; }
                         asteroids.splice(k, 1);
                     }
                     // Clear Enemies with particles & check objective
                     for (let k = enemyShips.length - 1; k >= 0; k--) {
                         let enemy = enemyShips[k];
                         createParticles(enemy.pos.x, enemy.pos.y, 20, enemy.getExplosionColor());
                         // Give reduced rewards for EMP'd enemies
                         points += floor((enemy.pointsValue || 0) * 0.3);
                         money += floor((enemy.moneyValue || 0) * 0.3);
                         // Fractional Objective Progress for destroyed enemies
                         if (enemy instanceof BasicEnemy && currentObjective.type === OBJECTIVE_TYPE.DESTROY_BASIC) { currentObjective.progress += 0.5; }
                         else if (enemy instanceof KamikazeEnemy && currentObjective.type === OBJECTIVE_TYPE.DESTROY_KAMIKAZE) { currentObjective.progress += 0.5; }
                         else if (enemy instanceof TurretEnemy && currentObjective.type === OBJECTIVE_TYPE.DESTROY_TURRET) { currentObjective.progress += 0.5; }
                         else if (enemy instanceof SwarmerEnemy && currentObjective.type === OBJECTIVE_TYPE.DESTROY_SWARMER) { currentObjective.progress += 0.5; }
                         else if (enemy instanceof LaserEnemy && currentObjective.type === OBJECTIVE_TYPE.DESTROY_LASER) { currentObjective.progress += 0.5; }
                         enemyShips.splice(k, 1);
                     }
                     enemyBullets = []; // Clear enemy bullets
                     break;
                 case POWERUP_TYPES.SCORE_MULT: ship.scoreMultiplierTimer = 600; ship.scoreMultiplierValue = 2; infoMessage = `SCORE x${ship.scoreMultiplierValue}!`; createParticles(ship.pos.x, ship.pos.y, 30, color(60, 100, 100)); break;
                 case POWERUP_TYPES.DRONE: if (!ship.droneActive) { ship.droneActive = true; ship.drone = new Drone(ship); infoMessage = "DRONE ACTIVATED!"; createParticles(ship.pos.x, ship.pos.y, 30, color(180, 50, 100)); } else { infoMessage = "DRONE ALREADY ACTIVE!"; } break;
                 case POWERUP_TYPES.INVINCIBILITY: ship.invincibilityTimer = 480; infoMessage = "INVINCIBLE!"; createParticles(ship.pos.x, ship.pos.y, 40, color(0, 0, 100)); ship.tempShieldActive = false; ship.shieldCharges = 0; break;
             }
             infoMessageTimeout = 120;
        }
        // Offscreen check is now in the main loop
    }
}
function handleCollisions() {
    if (gameState !== GAME_STATE.PLAYING || !ship || isPaused) return;

    // --- Helper for destroying an enemy and granting rewards/objective progress ---
    const destroyEnemy = (enemy, index, projectileType) => {
        let basePoints = enemy.pointsValue;
        let baseMoney = enemy.moneyValue;
        if (projectileType === 'HomingMissile') { basePoints *= 1.1; }
        let pointsToAdd = basePoints;
        if (ship.scoreMultiplierTimer > 0) { pointsToAdd *= ship.scoreMultiplierValue; }
        points += floor(pointsToAdd);
        money += floor(baseMoney);

        // Combo Update
        comboCounter++; comboTimer = COMBO_TIMEOUT_DURATION; maxComboReached = max(maxComboReached, comboCounter); if (comboCounter >= 2) { showComboText = true; comboTextTimeout = 60; }

        // Objective Progress
        if (enemy instanceof BasicEnemy && currentObjective.type === OBJECTIVE_TYPE.DESTROY_BASIC) { currentObjective.progress++; }
        else if (enemy instanceof KamikazeEnemy && currentObjective.type === OBJECTIVE_TYPE.DESTROY_KAMIKAZE) { currentObjective.progress++; }
        else if (enemy instanceof TurretEnemy && currentObjective.type === OBJECTIVE_TYPE.DESTROY_TURRET) { currentObjective.progress++; }
        else if (enemy instanceof SwarmerEnemy && currentObjective.type === OBJECTIVE_TYPE.DESTROY_SWARMER) { currentObjective.progress++; }
        else if (enemy instanceof LaserEnemy && currentObjective.type === OBJECTIVE_TYPE.DESTROY_LASER) { currentObjective.progress++; }
        // Add other enemy types here if needed

        // Visuals & Removal
        createParticles(enemy.pos.x, enemy.pos.y, floor(enemy.size * 1.2), enemy.getExplosionColor(), enemy.size * 0.2, 1.3, 1.0);
        enemyShips.splice(index, 1);
    };

    // --- Asteroid Collisions ---
    for (let i = asteroids.length - 1; i >= 0; i--) { if (!asteroids[i]) continue; let asteroidHit = false; for (let j = bullets.length - 1; j >= 0; j--) { if (asteroids[i] && bullets[j] && asteroids[i].hits(bullets[j])) { createParticles(bullets[j].pos.x, bullets[j].pos.y, floor(random(3, 6)), color(60, 40, 100), 2, 0.8, 0.7); bullets.splice(j, 1); asteroidHit = true; break; } } if (!asteroidHit) { for (let j = homingMissiles.length - 1; j >= 0; j--) { if (asteroids[i] && homingMissiles[j] && asteroids[i].hits(homingMissiles[j])) { createParticles(homingMissiles[j].pos.x, homingMissiles[j].pos.y, 15, homingMissiles[j].color, 5, 1.8, 1.0); homingMissiles.splice(j, 1); asteroidHit = true; break; } } } if (asteroidHit) {
        // Rewards
        let asteroidSizeValue = asteroids[i].size; let pointsToAdd = floor(map(asteroidSizeValue, minAsteroidSize, 80, 5, 15)); if (ship.scoreMultiplierTimer > 0) { pointsToAdd *= ship.scoreMultiplierValue; } points += pointsToAdd; money += 2;

         // Combo
         comboCounter++; comboTimer = COMBO_TIMEOUT_DURATION; maxComboReached = max(maxComboReached, comboCounter); if (comboCounter >= 2) { showComboText = true; comboTextTimeout = 60; }

         // Objective Progress
         if (currentObjective.type === OBJECTIVE_TYPE.DESTROY_ASTEROIDS) { currentObjective.progress++; }

         // Ship Shape Evolution (kept separate from level progression)
         let oldShapeLevel = floor(points / SHAPE_CHANGE_POINTS_THRESHOLD);
         let newShapeLevel = floor(points / SHAPE_CHANGE_POINTS_THRESHOLD);
         if (newShapeLevel > oldShapeLevel) { ship.changeShape(newShapeLevel); infoMessage = "SHIP SHAPE EVOLVED!"; infoMessageTimeout = 120; }

         // Visuals & Removal/Splitting
         let asteroidPos = asteroids[i].pos.copy(); let asteroidColor = asteroids[i].color; createParticles(asteroidPos.x, asteroidPos.y, floor(asteroidSizeValue / 2.5), asteroidColor, null, 1.2, 1.1); let sizeBeforeSplice = asteroids[i].size; asteroids.splice(i, 1); if (sizeBeforeSplice > minAsteroidSize * 2) { let newSize = sizeBeforeSplice * 0.6; let splitSpeedMultiplier = random(0.8, 2.0); let vel1 = p5.Vector.random2D().mult(splitSpeedMultiplier); let vel2 = p5.Vector.random2D().mult(splitSpeedMultiplier); asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel1)); asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel2)); }
        // --- Level completion check moved to main loop ---
        } }

    // --- Enemy Projectile Hits ---
    for (let i = enemyShips.length - 1; i >= 0; i--) { let enemy = enemyShips[i]; if (!enemy) continue; let enemyDestroyed = false; for (let j = bullets.length - 1; j >= 0; j--) { if (bullets[j] && enemy.hits(bullets[j])) { let damage = bullets[j].damage; // Get damage from bullet
        createParticles(bullets[j].pos.x, bullets[j].pos.y, 5, color(0,0,100), 2); bullets.splice(j, 1); if (enemy.takeDamage(damage)) { destroyEnemy(enemy, i, 'Bullet'); enemyDestroyed = true; } else { createParticles(enemy.pos.x, enemy.pos.y, 3, enemy.getHitColor(), 2); } break; } } if (enemyDestroyed) continue; for (let j = homingMissiles.length - 1; j >= 0; j--) { if (homingMissiles[j] && enemy.hits(homingMissiles[j])) { createParticles(homingMissiles[j].pos.x, homingMissiles[j].pos.y, 20, homingMissiles[j].color, 6, 2.0, 1.2); let missileDamage = homingMissiles[j].damage; // Get damage from missile
            homingMissiles.splice(j, 1); if (enemy.takeDamage(missileDamage)) { destroyEnemy(enemy, i, 'HomingMissile'); enemyDestroyed = true; } else { createParticles(enemy.pos.x, enemy.pos.y, 8, enemy.getHitColor(), 4); } break; } } if (enemyDestroyed) continue; }

    // --- Player Collisions ---
    if (ship.invulnerableTimer <= 0 && ship.invincibilityTimer <= 0) {
        const takeDamage = (sourceObject, sourceArray, index) => {
            if (ship.invincibilityTimer > 0 || ship.invulnerableTimer > 0) return false;
            let isLaserHit = sourceObject instanceof LaserEnemy; // Check if the source is a laser enemy (beam hit)

            // Apply laser hit cooldown check
            if (isLaserHit && ship.laserHitCooldown > 0) return false;

            let gameOver = false;
            if (comboCounter > 0) { if (maxComboReached >= 3) { let bonusPoints = maxComboReached * 5; let bonusMoney = floor(maxComboReached / 3); points += bonusPoints; money += bonusMoney; infoMessage = `Combo Broken! Bonus: +${bonusPoints} PTS, +$${bonusMoney} (Max: x${maxComboReached})`; infoMessageTimeout = 120; } comboCounter = 0; comboTimer = 0; maxComboReached = 0; showComboText = false; comboTextTimeout = 0; }

            // Reset shield regen timer on any hit
            ship.shieldRegenTimer = ship.shieldRegenDelay;

            if (ship.tempShieldActive) {
                ship.tempShieldActive = false; createParticles(ship.pos.x, ship.pos.y, 40, color(45, 100, 100), 5, 2.0); infoMessage = "TEMPORARY SHIELD LOST!"; infoMessageTimeout = 90;
                if (sourceObject instanceof EnemyBullet && sourceArray && index !== undefined && sourceArray.includes(sourceObject)) { createParticles(sourceObject.pos.x, sourceObject.pos.y, 5, color(45,90,100)); sourceArray.splice(index, 1); }
            } else if (ship.shieldCharges >= 1) { // Check if fully charged or more
                 ship.loseShield(); createParticles(ship.pos.x, ship.pos.y, 35, color(180, 80, 100), 4, 1.8);
                 if (sourceObject instanceof EnemyBullet && sourceArray && index !== undefined && sourceArray.includes(sourceObject)) { createParticles(sourceObject.pos.x, sourceObject.pos.y, 5, color(180,80,100)); sourceArray.splice(index, 1); }
            } else if (ship.shieldCharges > 0) { // Handle fractional shield charge from regen
                 ship.shieldCharges = 0; // Deplete fractional charge
                 createParticles(ship.pos.x, ship.pos.y, 20, color(180, 60, 80), 3, 1.5); // Smaller effect
                 if (sourceObject instanceof EnemyBullet && sourceArray && index !== undefined && sourceArray.includes(sourceObject)) { createParticles(sourceObject.pos.x, sourceObject.pos.y, 3, color(180,60,80)); sourceArray.splice(index, 1); }
            } else {
                lives--; createParticles(ship.pos.x, ship.pos.y, 40, color(0, 90, 100), 5, 2.2);
                if (settingScreenShakeEnabled) { screenShakeIntensity = 7; screenShakeDuration = 60; }
                if (lives <= 0) {
                     // --- RESET SKILL TREE ON GAME OVER ---
                     resetSkillTreeAndFragments(); // Reset skills and fragments
                     saveGameData(); // Save the reset state

                     gameState = GAME_STATE.GAME_OVER;
                     infoMessage = ""; infoMessageTimeout = 0; cursor(ARROW);
                     gameOver = true;
                } else { ship.setInvulnerable(); }

                // Apply laser hit cooldown
                if (isLaserHit) { ship.laserHitCooldown = 15; } // ~1/4 second cooldown

                // Remove the source object *if applicable* (not for laser beams, powerups, or potions)
                if (sourceObject && sourceArray && index !== undefined && sourceArray.includes(sourceObject) && !(sourceObject instanceof HealthPotion) && !(sourceObject instanceof PowerUp)) {
                     let explosionColor = (sourceObject.getExplosionColor) ? sourceObject.getExplosionColor() : (sourceObject.color || color(0,0,50));
                     let particleCount = sourceObject.size ? floor(sourceObject.size * 1.2) : 20;
                     if (sourceObject instanceof EnemyBullet) { particleCount = 8; }
                     createParticles(sourceObject.pos.x, sourceObject.pos.y, particleCount, explosionColor, sourceObject.size * 0.2);
                     if (sourceObject instanceof KamikazeEnemy) { // Extra particles for kamikaze
                         createParticles(sourceObject.pos.x, sourceObject.pos.y, floor(sourceObject.size * 1.5), sourceObject.getExplosionColor(), sourceObject.size * 0.3, 1.5, 1.2);
                     }
                     sourceArray.splice(index, 1);
                 }
            }
            return gameOver;
        };
        // Asteroid Hits
        for (let i = asteroids.length - 1; i >= 0; i--) { if (asteroids[i] && asteroids[i].hitsShip(ship)) { if (takeDamage(asteroids[i], asteroids, i)) return; break; } }
        // Enemy Body Hits
        if (gameState === GAME_STATE.PLAYING) { for (let i = enemyShips.length - 1; i >= 0; i--) { let enemy = enemyShips[i]; if (enemy && !(enemy instanceof LaserEnemy) && enemy.hitsShip(ship)) { // Exclude laser enemy body
            if (takeDamage(enemy, enemyShips, i)) return; break; } } }
        // Enemy Bullet Hits
        if (gameState === GAME_STATE.PLAYING) { for (let i = enemyBullets.length - 1; i >= 0; i--) { if (enemyBullets[i] && enemyBullets[i].hitsShip(ship)) { if (takeDamage(enemyBullets[i], enemyBullets, i)) return; break; } } }
        // Enemy Laser Beam Hits
         if (gameState === GAME_STATE.PLAYING) { for (let i = enemyShips.length - 1; i >= 0; i--) { let enemy = enemyShips[i]; if (enemy && enemy instanceof LaserEnemy && enemy.isFiring && enemy.checkLaserHit(ship)) { if (takeDamage(enemy, null, null)) return; // Don't remove enemy on laser hit
             break; // Only take damage from one laser per frame check
             } } }
    }
}
function handlePotions() {
    if (gameState !== GAME_STATE.PLAYING || isPaused) return;
    if (!ship) return;
    for (let i = potions.length - 1; i >= 0; i--) {
        // Updates and Offscreen check moved to main loop
        if (potions[i].hitsShip(ship)) {
            createParticles(potions[i].pos.x, potions[i].pos.y, 20, color(0, 80, 100), 4, 1.5);
            // Remove FIRST
            potions.splice(i, 1);

             // Objective Progress Check *before* applying effect
             if (currentObjective.type === OBJECTIVE_TYPE.COLLECT_POTIONS) {
                 currentObjective.progress++;
             }

            let max_lives_current = BASE_MAX_LIVES + (skillTreeData['MAX_LIVES'] || 0); // Calculate current max lives
            if (lives < max_lives_current) {
                lives++;
                infoMessage = "+1 LIFE!";
                infoMessageTimeout = 90;
            } else {
                let pointsToAdd = 25;
                if(ship.scoreMultiplierTimer > 0) { pointsToAdd *= ship.scoreMultiplierValue; }
                points += pointsToAdd;
                infoMessage = `+${pointsToAdd} POINTS (MAX LIVES)!`;
                infoMessageTimeout = 90;
            }
        }
        // Offscreen check moved to main loop
    }
}


// --- Background Drawing Functions ---
function drawBackgroundAndStars() {
    // Gradient Background
    for(let y=0; y < height; y++){
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(currentTopColor, currentBottomColor, inter);
        stroke(c);
        line(0, y, width, y);
    }
    noStroke();

    if (settingBackgroundEffectsEnabled) {
        // Draw deep background elements first
        drawGalaxy();
        drawBlackHole();

        // Draw structures behind nebulas and planets
        for (let i = backgroundStructures.length - 1; i >= 0; i--) {
            // Update moved to main loop
            backgroundStructures[i].draw();
            // Offscreen check moved to main loop
        }

        // Draw Nebulas
        for (let i = nebulas.length - 1; i >= 0; i--) {
            if ((gameState === GAME_STATE.PLAYING || gameState === GAME_STATE.UPGRADE_SHOP || gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN_SCREEN) && !isPaused) nebulas[i].update(); // Update only during gameplay/shop/end screens
            nebulas[i].draw();
            if (nebulas[i].isOffscreen()) {
                nebulas.splice(i, 1);
            }
        }

        // Draw Planet (if visible)
        if (planetVisible) {
            drawPlanet();
        }

        // Draw Stars and Shooting Stars on top
        for (let i = shootingStars.length - 1; i >= 0; i--) {
             if (!(gameState === GAME_STATE.PLAYING && isPaused)) shootingStars[i].update(); // Update unless paused in gameplay
            shootingStars[i].draw();
            if (shootingStars[i].isDone()) {
                shootingStars.splice(i, 1);
            }
        }
        for (let star of stars) {
             if (!(gameState === GAME_STATE.PLAYING && isPaused)) star.update(); // Update unless paused in gameplay
            star.draw();
        }
    } else { // Simplified background if FX disabled
        fill(0, 0, 80, 70);
        noStroke();
        for (let star of stars) {
            ellipse(star.x, star.y, 1.5, 1.5);
            if (!(gameState === GAME_STATE.PLAYING && isPaused)) {
                star.y += star.speed * 0.5;
                if (star.y > height + 2) {
                    star.y = -2; star.x = random(width);
                }
            }
        }
    }
}
function drawBlackHole() { push(); let bhX = width * 0.8; let bhY = height * 0.2; let bhSize = width * 0.05; fill(0); noStroke(); ellipse(bhX, bhY, bhSize * 1.1, bhSize * 1.1); let ringCount = 7; let maxRingSize = bhSize * 3.5; let minRingSize = bhSize * 1.2; noFill(); let slowVariation = sin(frameCount * 0.01); for (let i = 0; i < ringCount; i++) { let sizeFactor = lerp(0.95, 1.05, (sin(frameCount * 0.02 + i * 0.5) + 1) / 2); let size = lerp(minRingSize, maxRingSize, i / (ringCount - 1)) * sizeFactor; let hue = lerp(0, 60, i / (ringCount - 1)) + sin(frameCount * 0.03 + i) * 5; let alpha = map(i, 0, ringCount - 1, 50, 3); let sw = map(i, 0, ringCount - 1, 1.5, 5); strokeWeight(sw); stroke(hue, 90, 90, alpha); ellipse(bhX, bhY, size, size); } pop(); }
function drawGalaxy() { push(); let centerX = width / 2; let centerY = height / 2; let baseHue1 = 270; let baseHue2 = 200; let alphaVal = 2.5; let angle = frameCount * 0.0003; translate(centerX, centerY); rotate(angle); translate(-centerX, -centerY); noStroke(); fill(baseHue1, 50, 60, alphaVal); ellipse(centerX - width * 0.1, centerY - height * 0.1, width * 1.3, height * 0.35); fill(baseHue2, 60, 70, alphaVal); ellipse(centerX + width * 0.15, centerY + height * 0.05, width * 1.2, height * 0.45); fill((baseHue1 + baseHue2) / 2, 55, 65, alphaVal * 0.9); ellipse(centerX, centerY, width * 1.0, height * 0.55); pop(); }

function spawnPlanet() {
    planetVisible = true;
    planetData.size = random(width * 0.2, width * 0.5);
    let edge = floor(random(4));
    if (edge === 0) planetData.pos = createVector(random(width), -planetData.size / 2);
    else if (edge === 1) planetData.pos = createVector(width + planetData.size / 2, random(height));
    else if (edge === 2) planetData.pos = createVector(random(width), height + planetData.size / 2);
    else planetData.pos = createVector(-planetData.size / 2, random(height));

    let targetPos = createVector(random(width * 0.2, width * 0.8), random(height * 0.2, height * 0.8));
    planetData.vel = p5.Vector.sub(targetPos, planetData.pos);
    planetData.vel.normalize();
    planetData.vel.mult(random(0.1, 0.3));

    let baseH = random(360);
    planetData.noiseSeed = random(1000);
    planetData.rotation = random(TWO_PI);
    planetData.cloudRotationSpeed = random(-0.001, 0.001);

    // Determine Planet Type and Features
    let typeRoll = random(1);
    if (typeRoll < 0.1) planetData.type = PLANET_TYPE.STORMY;
    else if (typeRoll < 0.2) planetData.type = PLANET_TYPE.LAVA;
    else if (typeRoll < 0.35) planetData.type = PLANET_TYPE.GAS;
    else if (typeRoll < 0.5) planetData.type = PLANET_TYPE.ICE;
    else planetData.type = PLANET_TYPE.ROCKY;

    planetData.hasRings = (planetData.type === PLANET_TYPE.GAS || random() < 0.15); // Gas giants more likely to have rings
    planetData.numMoons = (planetData.type === PLANET_TYPE.GAS || planetData.type === PLANET_TYPE.ROCKY) ? floor(random(0, 4)) : 0; // Gas/Rocky can have moons

    // Assign Colors based on Type
    switch(planetData.type) {
        case PLANET_TYPE.GAS:
             baseH = random(20, 50); // Oranges/Yellows/Browns
             planetData.baseColor = color(baseH, random(60, 85), random(60, 80));
             planetData.detailColor1 = color((baseH + random(10, 30)) % 360, random(50, 70), random(70, 90));
             planetData.detailColor2 = color((baseH - random(10, 30) + 360) % 360, random(40, 60), random(50, 70));
             planetData.cloudColor = color(baseH, 20, 95, 35); // Wispy light clouds
             break;
        case PLANET_TYPE.ICE:
             baseH = random(180, 220); // Blues/Cyans
             planetData.baseColor = color(baseH, random(20, 50), random(85, 95));
             planetData.detailColor1 = color(baseH, random(30, 60), random(70, 85));
             planetData.detailColor2 = color(0, 0, 100, 30); // White/icy details
             planetData.cloudColor = color(0, 0, 100, 20); // Thin icy clouds
             break;
        case PLANET_TYPE.LAVA:
             baseH = random(-10, 25); // Reds/Oranges
             planetData.baseColor = color(baseH, random(80, 100), random(40, 60));
             planetData.detailColor1 = color(baseH + random(5, 15), 100, random(80, 100)); // Bright lava flows
             planetData.detailColor2 = color(0, 0, random(10, 30)); // Dark rock
             planetData.cloudColor = color(20, 50, 30, 40); // Dark ash clouds
             break;
        case PLANET_TYPE.STORMY:
             baseH = random(240, 280); // Dark Blues/Purples
             planetData.baseColor = color(baseH, random(50, 70), random(30, 50));
             planetData.detailColor1 = color(baseH + random(-10, 10), random(60, 80), random(40, 60));
             planetData.detailColor2 = color(0, 0, 70, 50); // Grey storm clouds
             planetData.cloudColor = color(0, 0, 80, 60); // Thick grey clouds
             planetData.lightningTimer = 0;
             break;
        case PLANET_TYPE.RINGED: // Same as rocky but ensure rings
             planetData.hasRings = true;
             // fall through to rocky
        case PLANET_TYPE.ROCKY:
        default:
             baseH = random(360); // Any color possible
             planetData.baseColor = color(baseH, random(40, 70), random(50, 80));
             planetData.detailColor1 = color((baseH + random(20, 50)) % 360, random(50, 70), random(60, 90));
             planetData.detailColor2 = color((baseH + random(180, 220)) % 360, random(30, 60), random(40, 70));
             planetData.cloudColor = color(0, 0, 100, 30); // Standard white clouds
             break;
    }

    // Ring Color
    if(planetData.hasRings) {
        let ringH = hue(planetData.baseColor) + random(-30, 30);
        planetData.ringColor = color(ringH, random(10, 30), random(60, 80), 40); // Low saturation, fairly bright, translucent
    }

    // Moon Data
    planetData.moonData = [];
    for(let i=0; i<planetData.numMoons; i++) {
        planetData.moonData.push({
            dist: planetData.size * random(0.8, 1.5),
            speed: random(0.005, 0.015) * (random() < 0.5 ? 1 : -1),
            phase: random(TWO_PI),
            size: planetData.size * random(0.05, 0.15),
            color: color(random(0,360), 0, random(50, 80)) // Greyish moons
        });
    }
}


function drawPlanet() {
    push();
    translate(planetData.pos.x, planetData.pos.y);

    // Draw Rings (behind planet)
    if (planetData.hasRings) {
        noFill();
        strokeWeight(planetData.size * 0.03);
        stroke(hue(planetData.ringColor), saturation(planetData.ringColor), brightness(planetData.ringColor), alpha(planetData.ringColor) * 0.5);
        ellipse(0, 0, planetData.size * 1.6, planetData.size * 0.4); // Outer ring
        strokeWeight(planetData.size * 0.05);
         stroke(hue(planetData.ringColor), saturation(planetData.ringColor), brightness(planetData.ringColor), alpha(planetData.ringColor));
        ellipse(0, 0, planetData.size * 1.3, planetData.size * 0.3); // Inner brighter ring
        noStroke();
    }

     // Draw Moons (behind planet)
     for(let moon of planetData.moonData) {
        let angle = frameCount * moon.speed + moon.phase;
        let moonX = cos(angle) * moon.dist;
        let moonY = sin(angle) * moon.dist * 0.3; // Flatten orbit slightly
        if (sin(angle) < 0) { // Only draw if "behind" the planet based on simple y-check
            fill(moon.color);
            ellipse(moonX, moonY, moon.size, moon.size);
        }
    }


    // Draw Planet Body
    noStroke();
    fill(planetData.baseColor);
    ellipse(0, 0, planetData.size, planetData.size);

    // Detail Layers (Landmass/Features) - Use planet rotation
    let detailScale = 0.01;
    let detailLayers = 3;
    for (let layer = 0; layer < detailLayers; layer++) {
        let layerColor = (layer === 0) ? planetData.detailColor1 : lerpColor(planetData.detailColor2, planetData.baseColor, layer / detailLayers);
        let layerAlpha = map(layer, 0, detailLayers - 1, 80, 40);
        fill(hue(layerColor), saturation(layerColor), brightness(layerColor), layerAlpha);
        beginShape();
        for (let angle = 0; angle < TWO_PI; angle += PI / 60) {
            // Apply planet rotation to the noise lookup angle
            let rotatedAngle = angle + planetData.rotation;
            let xoff = map(cos(rotatedAngle), -1, 1, 0, 3 + layer);
            let yoff = map(sin(rotatedAngle), -1, 1, 0, 3 + layer);
            let noiseVal = noise(planetData.noiseSeed + xoff * detailScale, planetData.noiseSeed + 100 + yoff * detailScale);
            let radius = planetData.size / 2 * (0.9 - layer * 0.1) * (1 + map(noiseVal, 0, 1, -0.15, 0.15));
            let x = radius * cos(angle); // Vertex position uses original angle
            let y = radius * sin(angle);
            vertex(x, y);
        }
        endShape(CLOSE);
    }

    // Cloud Layers - Use faster cloud rotation
    let cloudLayers = 4;
    let cloudBaseRotation = frameCount * planetData.cloudRotationSpeed * 50; // Faster rotation for clouds
    for (let i = 0; i < cloudLayers; i++) {
        let cloudAlpha = map(i, 0, cloudLayers - 1, 60, 25);
        fill(hue(planetData.cloudColor), saturation(planetData.cloudColor), brightness(planetData.cloudColor), alpha(planetData.cloudColor) * cloudAlpha/100);
        let cloudAngleOffset = cloudBaseRotation * (i + 1) * (i % 2 === 0 ? 1 : -1.2);
        let cloudSize = planetData.size * (0.8 - i * 0.1);
        let startAngle = cloudAngleOffset + i * PI / 5 + noise(planetData.noiseSeed + 300 + i) * PI;
        let endAngle = startAngle + PI * (0.4 + noise(planetData.noiseSeed + 400 + i) * 0.8);
        // Use arc for cloud bands
        noStroke();
        arc(0, 0, cloudSize, cloudSize, startAngle, endAngle, OPEN);
    }

    // Lightning for Stormy planets
    if(planetData.type === PLANET_TYPE.STORMY) {
        if (planetData.lightningTimer <= 0 && random() < 0.02) { // Chance to flash
            planetData.lightningTimer = planetData.lightningDuration;
        }
        if (planetData.lightningTimer > 0) {
            strokeWeight(random(1, 3));
            stroke(0, 0, 100, 90); // Bright white
            let startAngle = random(TWO_PI);
            let endAngle = startAngle + random(-PI/6, PI/6);
            let startRad = random(planetData.size * 0.3, planetData.size * 0.45);
            let endRad = random(planetData.size * 0.4, planetData.size * 0.5);
            line(cos(startAngle)*startRad, sin(startAngle)*startRad, cos(endAngle)*endRad, sin(endAngle)*endRad);
            noStroke();
        }
    }


    // Atmosphere Glow
    let glowColor = lerpColor(planetData.baseColor, color(hue(planetData.baseColor), 10, 100), 0.5);
    noFill();
    for(let i=0; i<5; i++) {
        strokeWeight(planetData.size * 0.02 * i + 1);
        stroke(hue(glowColor), saturation(glowColor), brightness(glowColor), 15 - i*2.5);
        ellipse(0, 0, planetData.size * (1.0 + i * 0.03), planetData.size * (1.0 + i * 0.03));
    }
    noStroke();

    // Draw Moons (in front)
    for(let moon of planetData.moonData) {
        let angle = frameCount * moon.speed + moon.phase;
        let moonX = cos(angle) * moon.dist;
        let moonY = sin(angle) * moon.dist * 0.3; // Flatten orbit slightly
         if (sin(angle) >= 0) { // Only draw if "in front" of the planet
            fill(moon.color);
            ellipse(moonX, moonY, moon.size, moon.size);
        }
    }

    pop();
}

// --- HUD & Info Messages ---
function displayHUD() {
    let hudH = isMobile ? 65 : 80; // Increased height for objective bar
    let topMargin = 5; let sideMargin = 15; let iconSize = isMobile ? 18 : 22; let textSizeVal = isMobile ? 17 : 21;
    let objectiveTextSize = isMobile ? 12 : 14;
    let spacing = isMobile ? 10 : 15; let bottomMargin = 10;
    let progressBarHeight = isMobile ? 6 : 8;
    let progressBarYOffset = isMobile ? 2 : 3;

    // Draw HUD Panel Background
    fill(uiPanelColor); stroke(uiBorderColor); strokeWeight(2.0);
    rect(0, 0, width, hudH);
    // Add inner highlight/shadow lines for depth
    strokeWeight(1);
    stroke(0, 0, 100, 15); line(1, 1, width - 1, 1); line(1, 1, 1, hudH - 1);
    stroke(0, 0, 0, 25); line(1, hudH - 1, width - 1, hudH - 1); line(width - 1, 1, width - 1, hudH - 1);
    noStroke();

    // --- Mobile Buttons (Calculate positions here, within HUD) ---
    if (isMobile && gameState === GAME_STATE.PLAYING && !isPaused && ship) {
        // Settings Button Calculation & Drawing (Top Left)
        mobileSettingsButton.size = isMobile ? 35 : 45; // Size based on mobile/desktop
        mobileSettingsButton.padding = 8; // Padding from edge of HUD
        mobileSettingsButton.x = mobileSettingsButton.padding;
        mobileSettingsButton.y = hudH / 2 - mobileSettingsButton.size / 2; // Vertically center in HUD

        let setBtn = mobileSettingsButton;
        fill(uiPanelColor); stroke(uiBorderColor); strokeWeight(1.5); rect(setBtn.x, setBtn.y, setBtn.size, setBtn.size, 5);
        drawShadowedText('⚙️', setBtn.x + setBtn.size / 2, setBtn.y + setBtn.size / 2, setBtn.size * 0.6, uiTextColor, uiTextShadowColor);

        // Missile Button (Keep at Bottom Right) - Recalculate each frame for resilience
        calculateMobileActionButtonsPosition();
        if (ship.homingMissilesLevel > 0) {
            let misBtn = mobileMissileButton;
            fill(uiPanelColor); stroke(uiBorderColor); strokeWeight(1.5); rect(misBtn.x, misBtn.y, misBtn.size, misBtn.size, 5);
            // Draw icon and count separately for better control
            textAlign(CENTER, CENTER);
            drawShadowedText('🚀', misBtn.x + misBtn.size / 2, misBtn.y + misBtn.size * 0.45, misBtn.size * 0.5, uiTextColor, uiTextShadowColor); // Icon higher
            drawShadowedText(ship.currentMissiles, misBtn.x + misBtn.size / 2, misBtn.y + misBtn.size * 0.78, misBtn.size * 0.3, uiTextColor, uiTextShadowColor); // Count lower
        }
    }

    // --- Top Row: Standard Info (Centered vertically better) ---
    textAlign(LEFT, CENTER);
    // Adjust starting X if mobile settings button is present
    let currentX = isMobile ? mobileSettingsButton.x + mobileSettingsButton.size + spacing : sideMargin;
    let firstRowY = hudH * 0.35;

    // Helper to draw HUD text with icon and shadow
    const drawHudItem = (icon, value, valueColor) => {
        // Ensure enough space before drawing next item, especially on mobile
        if (currentX + textWidth(icon) + spacing*0.3 + textWidth(value) + spacing*0.5 > width - sideMargin) {
            return; // Prevent drawing off-screen
        }
        drawShadowedText(icon, currentX, firstRowY, textSizeVal, uiTextColor, uiTextShadowColor);
        currentX += textWidth(icon) + spacing * 0.3; // Space between icon and value
        drawShadowedText(value, currentX, firstRowY, textSizeVal, valueColor, uiTextShadowColor);
        currentX += textWidth(value) + spacing * 1.5; // Space after item
    };

    drawHudItem('LV', `${currentLevel}`, uiTextColor);
    drawHudItem('P', `${points}`, uiTextColor);
    drawHudItem('$', `${money}`, uiHighlightColor);
    drawHudItem('♥', `${lives}`, color(0, 80, 100));

    // Shield Text (including fractional display)
    let shieldText = `${floor(ship.shieldCharges)}`;
    if (ship.shieldRegenRate > 0 && ship.shieldCharges > 0 && ship.shieldCharges < MAX_SHIELD_CHARGES) {
        shieldText += ` (${(ship.shieldCharges * 100).toFixed(0)}%)`;
    }
    drawHudItem('🛡', shieldText, color(180, 70, 100));

    if (ship && ship.homingMissilesLevel > 0) {
        // Only show missile count if NOT on mobile (button shows it)
        if (!isMobile) {
            drawHudItem('🚀', `${ship.currentMissiles}`, color(30, 80, 100));
        }
    }
    // Optional: Add other statuses like Rapid Fire Timer, Score Multiplier Timer etc.

    // --- Bottom Row: Objective Progress Bar & Text ---
    let secondRowY = hudH * 0.75; // Position text above the bar
    let barY = hudH - progressBarHeight - progressBarYOffset;
    let barWidth = width - sideMargin * 2;

    // Draw Progress Bar Background
    fill(uiProgressBarBgColor);
    noStroke();
    rect(sideMargin, barY, barWidth, progressBarHeight, progressBarHeight / 2);

    // Draw Progress Bar Fill
    let progressRatio = 0;
    if (currentObjective.target > 0 && currentObjective.type) {
        progressRatio = constrain(currentObjective.progress / currentObjective.target, 0, 1);
    }
    if (progressRatio > 0) {
        fill(uiProgressBarColor);
        rect(sideMargin, barY, barWidth * progressRatio, progressBarHeight, progressBarHeight / 2);
    }

    // Draw Objective Text (Above Bar)
    textAlign(CENTER, BOTTOM); // Align text to the bottom, centered horizontally
    let objectiveStr = `${currentObjective.description || 'No Objective'}`;
    if (currentObjective.type && currentObjective.target > 0) {
        let progressDisplay;
        if (currentObjective.type === OBJECTIVE_TYPE.SURVIVE_TIME) {
            let secondsElapsed = floor(max(0, currentObjective.progress) / 60);
            let targetSeconds = floor(currentObjective.target / 60);
            progressDisplay = `${secondsElapsed} / ${targetSeconds}s`;
        } else if (currentObjective.type === OBJECTIVE_TYPE.SCORE_REACH) {
             progressDisplay = `${currentObjective.progress} / ${currentObjective.target} Pts`;
        } else {
            progressDisplay = `${floor(currentObjective.progress)} / ${currentObjective.target}`;
        }
        objectiveStr += ` (${progressDisplay})`;
    }
    drawShadowedText(objectiveStr, width / 2, secondRowY, objectiveTextSize, uiTextColor, uiTextShadowColor);


    // Upgrade Levels Text (Bottom Right - improved readability)
    textAlign(RIGHT, BOTTOM);
    let upgradesText = `RATE:${ship.fireRateLevel} SPRD:${ship.spreadShotLevel}`;
    if (ship.rearGunLevel > 0) upgradesText += ` REAR:${ship.rearGunLevel}`;
    if (!isMobile && ship.homingMissilesLevel > 0) upgradesText += ` MSL:${ship.homingMissilesLevel}`;
    // Avoid overlapping missile button on mobile
    let upgradesY = isMobile ? mobileMissileButton.y - mobileMissileButton.padding : height - bottomMargin;
    drawShadowedText(upgradesText, width - sideMargin, upgradesY, textSizeVal * 0.8, uiTextColor, uiTextShadowColor);

}

function displayInfoMessage() {
    let msgSize = isMobile ? 15 : 18;
    textAlign(CENTER, CENTER);
    let msgWidth = textWidth(infoMessage); // Use textSize set by drawShadowedText
    let padding = BUTTON_TEXT_PADDING;
    let boxW = msgWidth + padding * 2;
    let boxH = msgSize + padding;
    let boxX = width / 2 - boxW / 2;
    boxX = constrain(boxX, padding, width - boxW - padding);
    let boxY = height - boxH - (isMobile? 15 : 30);

    // Draw panel background
    fill(uiPanelColor); stroke(uiBorderColor); strokeWeight(1.5); rect(boxX, boxY, boxW, boxH, 5);
    // Inner highlight/shadow
    noFill(); strokeWeight(1);
    stroke(0, 0, 100, 15); line(boxX + 1, boxY + 1, boxX + boxW - 1, boxY + 1); line(boxX + 1, boxY + 1, boxX + 1, boxY + boxH - 1);
    stroke(0, 0, 0, 25); line(boxX + 1, boxY + boxH - 1, boxX + boxW - 1, boxY + boxH - 1); line(boxX + boxW - 1, boxY + 1, boxX + boxW - 1, boxY + boxH - 1);

    // Draw text
    noStroke();
    drawShadowedText(infoMessage, boxX + boxW / 2, boxY + boxH / 2, msgSize, uiTextColor, uiTextShadowColor);
}

function displayComboText() {
    if (showComboText && comboCounter >= 2) {
        let comboSize = isMobile ? 28 : 36;
        let comboY = height * 0.25;
        let alpha = map(comboTextTimeout, 0, 60, 0, 100);
        push();
        textAlign(CENTER, CENTER);
        textSize(comboSize);
        let scaleFactor = 1.0 + sin(map(comboTextTimeout, 60, 0, 0, PI)) * 0.12; // Slightly larger pop
        translate(width / 2, comboY);
        scale(scaleFactor);

        // Draw thicker shadow/outline
        fill(0, 0, 0, alpha * 0.7); // Darker shadow
        text(`COMBO x${comboCounter}!`, 0 + 2, 0 + 2);
        text(`COMBO x${comboCounter}!`, 0 - 2, 0 + 2);
        text(`COMBO x${comboCounter}!`, 0 + 2, 0 - 2);
        text(`COMBO x${comboCounter}!`, 0 - 2, 0 - 2);

        // Draw main text
        fill(uiHighlightColor); // Use highlight color
        text(`COMBO x${comboCounter}!`, 0, 0);

        pop();
    }
}

// --- Game State Control ---
function resetGame() {
    // Skill Tree & Fragments are NOT reset here, only on game over or initial load w/o save data.
    ship = new Ship(); // Creates ship with base stats + skill tree bonuses
    bullets = []; homingMissiles = []; particles = []; asteroids = []; potions = []; enemyShips = []; enemyBullets = []; powerUps = []; nebulas = []; shootingStars = []; backgroundStructures = [];
    points = 0;
    money = BASE_STARTING_MONEY + skillTreeData.STARTING_MONEY * SKILL_DEFINITIONS.STARTING_MONEY.effectPerLevel; // Starting money from skill tree
    lives = BASE_MAX_LIVES + skillTreeData.MAX_LIVES * SKILL_DEFINITIONS.MAX_LIVES.effectPerLevel; // Lives from skill tree
    currentLevel = 1;
    setDifficultyForLevel(currentLevel);
    loadObjectiveForLevel(currentLevel); // Load objective for level 1
    lastPlanetAppearanceTime = -Infinity; planetVisible = false; infoMessage = ""; infoMessageTimeout = 0;
    screenShakeDuration = 0; screenShakeIntensity = 0; isPaused = false; levelTransitionFlash = 0;
    comboCounter = 0; comboTimer = 0; maxComboReached = 0; showComboText = false; comboTextTimeout = 0;
    spacebarHeld = false; isMobileShooting = false; // Reset input flags
    cursor(); spawnInitialAsteroids();
}
function startGame() { resetGame(); gameState = GAME_STATE.PLAYING; }
function startNextLevel() {
    if (gameState !== GAME_STATE.UPGRADE_SHOP) return;

    // Award Tech Fragments handled when objective met in runGameLogic

    currentLevel++;
    setDifficultyForLevel(currentLevel);
    loadObjectiveForLevel(currentLevel); // Load the next level's objective
    ship.resetPositionForNewLevel(); if (ship.homingMissilesLevel > 0) { ship.currentMissiles = ship.maxMissiles; }
    asteroids = []; bullets = []; homingMissiles = []; enemyShips = []; enemyBullets = []; powerUps = []; potions = [];
    // Keep background structures? Resetting them might look better.
    backgroundStructures = [];
    // frameCount reset happens automatically in p5, levelStartTime is set in loadObjectiveForLevel
    // Info message now set when completing the level
    levelTransitionFlash = 15;
    spawnInitialAsteroids(); gameState = GAME_STATE.PLAYING; cursor();
}
function selectMenuItem(index) {
    switch (menuItems[index]) {
        case 'Start Game': startGame(); break;
        case 'Skills':
            previousGameState = GAME_STATE.START_MENU; // Remember we came from start menu
            skillTreeReturnState = GAME_STATE.START_MENU; // Set return state
            gameState = GAME_STATE.SKILL_TREE;
            setupSkillTreeButtons();
            break;
        case 'Settings': previousGameState = gameState; gameState = GAME_STATE.SETTINGS_MENU; selectedSettingsItem = 0; break;
        case 'Cosmetics': previousGameState = gameState; gameState = GAME_STATE.COSMETICS_MENU; selectedCosmeticsMenuItem = 0; break;
    }
}
function selectSettingsItemAction(index) { let setting = settingsItems[index]; switch (setting.id) { case 'screenShake': settingScreenShakeEnabled = !settingScreenShakeEnabled; break; case 'backgroundFx': settingBackgroundEffectsEnabled = !settingBackgroundEffectsEnabled; if (!settingBackgroundEffectsEnabled) { nebulas = []; shootingStars = []; planetVisible = false; backgroundStructures = []; } break; case 'particleDensity': let currentDensityIndex = setting.options.indexOf(settingParticleDensity); let nextDensityIndex = (currentDensityIndex + 1) % setting.options.length; settingParticleDensity = setting.options[nextDensityIndex]; break; case 'back': gameState = previousGameState; if(previousGameState === GAME_STATE.PLAYING && isPaused) { /* Remain paused */ cursor(ARROW); } else if (previousGameState === GAME_STATE.PLAYING && !isPaused) { /* If returning to active play */ cursor(); } selectedMenuItem = 0; setupPauseMenuButtons(); break; } } // Setup pause menu buttons on return
function selectCosmeticsItemAction(index) {
    let setting = cosmeticsMenuItems[index];
    if (setting.id === 'back') { gameState = previousGameState; if(previousGameState === GAME_STATE.PLAYING && isPaused) { /* Remain paused */ cursor(ARROW); } else if (previousGameState === GAME_STATE.PLAYING && !isPaused) { /* If returning to active play */ cursor(); } selectedMenuItem = 0; return; }
    if (setting.type === 'cycle') {
        if (setting.id === 'shipColor') { let currentIndex = SHIP_COLORS.indexOf(selectedShipColor); let nextIndex = (currentIndex + 1) % SHIP_COLORS.length; selectedShipColor = SHIP_COLORS[nextIndex]; if (ship) { ship.setColors(); } }
        else if (setting.id === 'bulletStyle') { let currentIndex = BULLET_STYLES.indexOf(selectedBulletStyle); let nextIndex = (currentIndex + 1) % BULLET_STYLES.length; selectedBulletStyle = BULLET_STYLES[nextIndex]; }
    }
}
function handleSkillTreeButtonPress(skillId) {
    if (skillId === 'back') {
        gameState = skillTreeReturnState; // Return to where we came from
        if (gameState === GAME_STATE.PLAYING) {
             // If returning to pause menu, re-setup pause buttons and stay paused
             setupPauseMenuButtons();
             isPaused = true;
             cursor(ARROW);
        } else {
             // Returning to Start Menu
            selectedMenuItem = 0; // Reset menu selection
             cursor(ARROW);
        }
        return;
    }

    let skillDef = SKILL_DEFINITIONS[skillId];
    let currentLevel = skillTreeData[skillId];

    if (currentLevel < skillDef.maxLevel) {
        let cost = skillDef.costPerLevel[currentLevel];
        if (techFragments >= cost) {
            techFragments -= cost;
            skillTreeData[skillId]++;
            // console.log(`Upgraded ${skillId} to level ${skillTreeData[skillId]}`);
            saveGameData(); // Save after purchase
             // Add particle effect on button
             let button = skillTreeButtons.find(b => b.id === skillId);
             if(button) {
                 createParticles(button.x + button.w / 2, button.y + button.h / 2, 25, color(120, 70, 100), 5, 1.5, 0.7);
             }
        } else {
            infoMessage = "Not enough Tech Fragments!";
            infoMessageTimeout = 60;
        }
    } else {
        infoMessage = "Skill Maxed Out!";
        infoMessageTimeout = 60;
    }
}
function handlePauseMenuSelection(index) {
     let selection = pauseMenuItems[index];
     switch(selection) {
         case 'Resume':
             isPaused = false;
             cursor();
             break;
         case 'Skills':
             skillTreeReturnState = GAME_STATE.PLAYING; // Set return to paused gameplay
             previousGameState = GAME_STATE.PLAYING; // Technically redundant here, but safe
             gameState = GAME_STATE.SKILL_TREE;
             setupSkillTreeButtons();
             // isPaused remains true
             break;
         case 'Settings':
             previousGameState = GAME_STATE.PLAYING; // Remember we were playing (and paused)
             gameState = GAME_STATE.SETTINGS_MENU;
             selectedSettingsItem = 0;
             // isPaused remains true
             break;
         case 'Main Menu':
             isPaused = false;
             gameState = GAME_STATE.START_MENU;
             selectedMenuItem = 0;
             cursor(ARROW);
             break;
     }
}

// --- Input Handling ---
function mousePressed() {
    // Mobile Settings Button Check (only if mobile and playing and not paused)
    if (isMobile && gameState === GAME_STATE.PLAYING && !isPaused) {
        let setBtn = mobileSettingsButton; // Use the values calculated in displayHUD
        if (mouseX > setBtn.x && mouseX < setBtn.x + setBtn.size && mouseY > setBtn.y && mouseY < setBtn.y + setBtn.size) {
            isPaused = true;
            selectedPauseMenuItem = 0; // Default selection
            setupPauseMenuButtons();
            isMobileShooting = false; // Stop shooting when pausing
            cursor(ARROW);
            return; // Prevent further processing for this touch
        }
    }

    // Handle other game states or non-mobile clicks
    switch (gameState) {
        case GAME_STATE.START_MENU: for (let i = 0; i < startMenuButtons.length; i++) { let button = startMenuButtons[i]; if (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h) { selectedMenuItem = i; selectMenuItem(i); return; } } break;
        case GAME_STATE.SETTINGS_MENU: for (let i = 0; i < settingsMenuButtons.length; i++) { let button = settingsMenuButtons[i]; if (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h) { selectedSettingsItem = i; selectSettingsItemAction(i); return; } } break;
        case GAME_STATE.COSMETICS_MENU: for (let i = 0; i < cosmeticsMenuButtons.length; i++) { let button = cosmeticsMenuButtons[i]; if (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h) { selectedCosmeticsMenuItem = i; selectCosmeticsItemAction(i); return; } } break;
        case GAME_STATE.SKILL_TREE: for (let button of skillTreeButtons) { if (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h) { handleSkillTreeButtonPress(button.id); return; } } break;
        case GAME_STATE.PLAYING:
             if (isPaused) { // Handle pause menu clicks
                 for (let i = 0; i < pauseMenuButtons.length; i++) {
                     let button = pauseMenuButtons[i];
                     if (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h) {
                         selectedPauseMenuItem = i;
                         handlePauseMenuSelection(i);
                         return;
                     }
                 }
                 // If mobile and clicked outside buttons while paused, resume (optional)
                 // if (isMobile) {
                 //    isPaused = false;
                 //    cursor();
                 // }
             } else if (!isPaused && ship && !isMobile) {
                 // Desktop shooting handled by spacebar hold
             }
             break;
        case GAME_STATE.UPGRADE_SHOP: for (let button of shopButtons) { if (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h) { handleShopButtonPress(button.id); break; } } break;
        case GAME_STATE.GAME_OVER: case GAME_STATE.WIN_SCREEN: previousGameState = gameState; gameState = GAME_STATE.START_MENU; selectedMenuItem = 0; break;
    }
}
function mouseReleased() {
     // No action needed on mouse release for current logic
}

function keyPressed() {
    if (keyCode === ESCAPE) {
        if (gameState === GAME_STATE.PLAYING) {
            // Toggle pause state
            isPaused = !isPaused;
            if (isPaused) {
                 selectedPauseMenuItem = 0; // Reset pause selection
                 setupPauseMenuButtons();
                 cursor(ARROW); // Show cursor when paused
                 isMobileShooting = false; // Stop shooting if paused via ESC
            } else {
                 cursor(); // Hide cursor when playing
            }
        } else if (gameState === GAME_STATE.SETTINGS_MENU) {
            // Execute the 'Back' action for settings
            selectSettingsItemAction(settingsItems.findIndex(item => item.id === 'back'));
        } else if (gameState === GAME_STATE.COSMETICS_MENU) {
            // Execute the 'Back' action for cosmetics
            selectCosmeticsItemAction(cosmeticsMenuItems.findIndex(item => item.id === 'back'));
        } else if (gameState === GAME_STATE.UPGRADE_SHOP) {
             // Go directly to the main menu from the shop
             gameState = GAME_STATE.START_MENU;
             selectedMenuItem = 0;
             isPaused = false; // Ensure not paused
             cursor(ARROW); // Show cursor for menu
        } else if (gameState === GAME_STATE.SKILL_TREE) {
            // Back action for skill tree
             handleSkillTreeButtonPress('back');
        }
    }
    // --- Other Key Presses ---
     else if (gameState === GAME_STATE.START_MENU) {
        if (keyCode === UP_ARROW) { selectedMenuItem = (selectedMenuItem - 1 + menuItems.length) % menuItems.length; }
        else if (keyCode === DOWN_ARROW) { selectedMenuItem = (selectedMenuItem + 1) % menuItems.length; }
        else if (keyCode === ENTER || keyCode === RETURN) { selectMenuItem(selectedMenuItem); }
    }
     else if (gameState === GAME_STATE.PLAYING && isPaused) { // Pause Menu Navigation
         if (keyCode === UP_ARROW) { selectedPauseMenuItem = (selectedPauseMenuItem - 1 + pauseMenuItems.length) % pauseMenuItems.length; }
         else if (keyCode === DOWN_ARROW) { selectedPauseMenuItem = (selectedPauseMenuItem + 1) % pauseMenuItems.length; }
         else if (keyCode === ENTER || keyCode === RETURN) { handlePauseMenuSelection(selectedPauseMenuItem); }
     }
    else if (gameState === GAME_STATE.SETTINGS_MENU) {
        if (keyCode === UP_ARROW) { selectedSettingsItem = (selectedSettingsItem - 1 + settingsItems.length) % settingsItems.length; }
        else if (keyCode === DOWN_ARROW) { selectedSettingsItem = (selectedSettingsItem + 1) % settingsItems.length; }
        else if (keyCode === ENTER || keyCode === RETURN) { selectSettingsItemAction(selectedSettingsItem); }
    }
    else if (gameState === GAME_STATE.COSMETICS_MENU) {
        if (keyCode === UP_ARROW) { selectedCosmeticsMenuItem = (selectedCosmeticsMenuItem - 1 + cosmeticsMenuItems.length) % cosmeticsMenuItems.length; }
        else if (keyCode === DOWN_ARROW) { selectedCosmeticsMenuItem = (selectedCosmeticsMenuItem + 1) % cosmeticsMenuItems.length; }
        else if (keyCode === ENTER || keyCode === RETURN) { selectCosmeticsItemAction(selectedCosmeticsMenuItem); }
    }
    else if (gameState === GAME_STATE.PLAYING && !isPaused && ship) {
        if (keyCode === 32) { if (!spacebarHeld) { spacebarHeld = true; } return false; } // Spacebar shooting
        if (keyCode === 77) { ship.fireMissile(); return false; } // M for Missile
        // Arrow/WASD movement is handled by keyIsDown in ship.update()
    }
    else if (gameState === GAME_STATE.UPGRADE_SHOP) {
        if (keyCode === ENTER || keyCode === RETURN) { handleShopButtonPress('nextLevel'); }
    }
    else if (gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN_SCREEN) {
        if (keyCode === ENTER || keyCode === RETURN) {
            previousGameState = gameState;
            gameState = GAME_STATE.START_MENU;
            selectedMenuItem = 0;
        }
    }
    // No keyboard navigation needed for Skill Tree currently
}

function keyReleased() { if (keyCode === 32) { spacebarHeld = false; } }

function touchStarted() {
    if (!isMobile || touches.length === 0) return false; // Only handle touch on mobile

    let uiButtonTapped = false; // Track if a specific UI button (Settings, Missile, Pause Menu items) was tapped

    // Iterate through touches to check for UI button taps first
    for (let i = 0; i < touches.length; i++) {
        let touchX = touches[i].x;
        let touchY = touches[i].y;
        // Use the dynamically calculated/stored button positions
        let setBtn = mobileSettingsButton; // Positions calculated in drawHUD
        let misBtn = mobileMissileButton; // Positions calculated in calculateMobileActionButtonsPosition

        if (gameState === GAME_STATE.PLAYING && !isPaused && ship) {
            // Check Settings Button -> Pause the game
            if (touchX > setBtn.x && touchX < setBtn.x + setBtn.size && touchY > setBtn.y && touchY < setBtn.y + setBtn.size) {
                 isPaused = true;
                 selectedPauseMenuItem = 0; // Reset pause selection
                 setupPauseMenuButtons();
                 cursor(ARROW);
                 uiButtonTapped = true;
                 isMobileShooting = false; // Stop shooting if pausing via button
                 break; // Exit loop, settings button takes priority
            }
            // Check Missile Button
            else if (ship.homingMissilesLevel > 0 && touchX > misBtn.x && touchX < misBtn.x + misBtn.size && touchY > misBtn.y && touchY < misBtn.y + misBtn.size) {
                ship.fireMissile();
                uiButtonTapped = true;
                // Don't break, allow touch to also control movement/shooting if desired,
                // but mark that a button was hit so we don't trigger default actions below.
            }
        } else if (gameState === GAME_STATE.PLAYING && isPaused) {
             // Handle Pause Menu taps
             for (let j = 0; j < pauseMenuButtons.length; j++) {
                 let button = pauseMenuButtons[j];
                 if (touchX > button.x && touchX < button.x + button.w && touchY > button.y && touchY < button.y + button.h) {
                     selectedPauseMenuItem = j;
                     handlePauseMenuSelection(j);
                     uiButtonTapped = true;
                     break; // Exit button loop for this touch
                 }
             }
             if (uiButtonTapped) break; // Exit touch loop if a pause button was hit
        }
    }

    // Handle Menu/Other State Button Taps (only need to check first touch if not in gameplay)
    let touchX = touches[0].x;
    let touchY = touches[0].y;
     if (!uiButtonTapped && !(gameState === GAME_STATE.PLAYING)) { // Only process these if a gameplay button wasn't tapped AND not in gameplay
         if (gameState === GAME_STATE.START_MENU) { for (let j = 0; j < startMenuButtons.length; j++) { let button = startMenuButtons[j]; if (touchX > button.x && touchX < button.x + button.w && touchY > button.y && touchY < button.y + button.h) { selectedMenuItem = j; selectMenuItem(j); uiButtonTapped = true; break; } } }
         else if (gameState === GAME_STATE.SETTINGS_MENU) { for (let j = 0; j < settingsMenuButtons.length; j++) { let button = settingsMenuButtons[j]; if (touchX > button.x && touchX < button.x + button.w && touchY > button.y && touchY < button.y + button.h) { selectedSettingsItem = j; selectSettingsItemAction(j); uiButtonTapped = true; break; } } }
         else if (gameState === GAME_STATE.COSMETICS_MENU) { for (let j = 0; j < cosmeticsMenuButtons.length; j++) { let button = cosmeticsMenuButtons[j]; if (touchX > button.x && touchX < button.x + button.w && touchY > button.y && touchY < button.y + button.h) { selectedCosmeticsMenuItem = j; selectCosmeticsItemAction(j); uiButtonTapped = true; break; } } }
         else if (gameState === GAME_STATE.SKILL_TREE) { for (let button of skillTreeButtons) { if (touchX > button.x && touchX < button.x + button.w && touchY > button.y && touchY < button.y + button.h) { handleSkillTreeButtonPress(button.id); uiButtonTapped = true; break;} } }
         else if (gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN_SCREEN) { previousGameState = gameState; gameState = GAME_STATE.START_MENU; selectedMenuItem = 0; uiButtonTapped = true; }
         else if (gameState === GAME_STATE.UPGRADE_SHOP) { for (let button of shopButtons) { if (touchX > button.x && touchX < button.x + button.w && touchY > button.y && touchY < button.y + button.h) { handleShopButtonPress(button.id); uiButtonTapped = true; break; } } }
     }


    // If no UI element was hit during *active* gameplay, start mobile shooting/movement control
    if (gameState === GAME_STATE.PLAYING && !isPaused && !uiButtonTapped) {
        isMobileShooting = true;
    }

    return false; // Prevent default touch actions (like scrolling)
}


function touchEnded() {
    if (isMobile && touches.length === 0) { // Check if *all* touches have ended
        isMobileShooting = false; // Stop shooting when no fingers are touching
    }
    return false; // Prevent default touch actions
}
function handleShopButtonPress(buttonId) { if (gameState !== GAME_STATE.UPGRADE_SHOP || !ship) return; if (buttonId === 'nextLevel') { startNextLevel(); } else { let success = ship.attemptUpgrade(buttonId); if (success) { let button = shopButtons.find(b => b.id === buttonId); if(button) { createParticles(button.x + button.w / 2, button.y + button.h / 2, 20, color(120, 80, 100), 6, 2.0, 0.8); if (buttonId === 'homingMissiles') { ship.currentMissiles = ship.maxMissiles; } } } else { let cost = ship.getUpgradeCost(buttonId); if (cost !== "MAX" && money < cost) { infoMessage = "Not enough money!"; infoMessageTimeout = 60; } else if (cost === "MAX") { infoMessage = "Upgrade Maxed Out!"; infoMessageTimeout = 60; } } } }
function windowResized() { resizeCanvas(windowWidth, windowHeight); createStarfield(200); if (gameState === GAME_STATE.START_MENU) { setupMenuButtons(); } if (gameState === GAME_STATE.SETTINGS_MENU) { setupSettingsMenuButtons(); } if (gameState === GAME_STATE.COSMETICS_MENU) { setupCosmeticsMenuButtons(); } if (gameState === GAME_STATE.SKILL_TREE) { setupSkillTreeButtons(); } if (gameState === GAME_STATE.UPGRADE_SHOP) { setupShopButtons(); } if(gameState === GAME_STATE.PLAYING && isPaused) {setupPauseMenuButtons();} // calculateMobileSettingsButtonPosition(); // REMOVED - calculated in drawHUD
 calculateMobileActionButtonsPosition(); }


// ======================================================================
// ========================== CLASS DEFINITIONS =========================
// ======================================================================

// Ship Class
class Ship {
    constructor() {
        this.pos = createVector(width / 2, height - 50); this.vel = createVector(0, 0);
        this.thrust = 0.38; this.touchThrustMultiplier = 1.15; this.friction = 0.975;
        this.size = 30;
        this.bodyColor = null; this.cockpitColor = null; this.wingColor = null; this.detailColor1 = null; this.detailColor2 = null; this.engineColor1 = null; this.engineColor2 = null;
        this.setColors(); // Apply colors based on global selection
        this.shapeState = 0; this.shootCooldown = 0; this.baseShootDelay = 15; this.shootDelayPerLevel = 2;
        this.shieldCharges = 0; this.shieldVisualRadius = this.size * 1.3; this.invulnerableTimer = 0; this.invulnerabilityDuration = 120; this.hoverOffset = 0; this.rapidFireTimer = 0; this.tempShieldActive = false;
        this.fireRateLevel = 0; this.spreadShotLevel = 0; this.maxUpgradeLevel = 5;
        this.rearGunLevel = 0; this.maxRearGunLevel = 3; this.rearGunDelayFactor = [0, 1.5, 1.2, 1.0];
        this.homingMissilesLevel = 0; this.maxMissileLevel = 4; this.missileCapacity = [0, 2, 3, 4, 5];
        this.missileRegenTime = [0, 480, 420, 360, 300]; this.maxMissiles = 0; this.currentMissiles = 0; this.missileRegenTimer = 0; this.missileCooldown = 0; this.missileColor = color(30, 90, 100);
        this.baseUpgradeCost = 30; this.costMultiplier = 2.0; this.specialCostMultiplier = 2.5;
        this.scoreMultiplierTimer = 0; this.scoreMultiplierValue = 1; this.droneActive = false; this.drone = null; this.invincibilityTimer = 0;
        this.laserHitCooldown = 0;

        // Apply Skill Tree Bonuses (Important: skillTreeData should be loaded before creating Ship)
        this.maxSpeed = BASE_MAX_SPEED + (skillTreeData['MAX_SPEED'] || 0) * SKILL_DEFINITIONS.MAX_SPEED.effectPerLevel;
        this.bulletDamageMultiplier = 1 + (skillTreeData['WEAPON_DAMAGE'] || 0) * SKILL_DEFINITIONS.WEAPON_DAMAGE.effectPerLevel;
        this.missileDamageBonus = (skillTreeData['MISSILE_DAMAGE'] || 0) * SKILL_DEFINITIONS.MISSILE_DAMAGE.effectPerLevel;
        this.shieldRegenRate = (skillTreeData['SHIELD_REGEN'] || 0) * SKILL_DEFINITIONS.SHIELD_REGEN.effectPerLevel; // Regen per frame
        this.shieldRegenTimer = 0; // Timer for shield regen cooldown
        this.shieldRegenDelay = 180; // Frames after last hit before regen starts
    }
    setColors() {
        let colors = COLOR_DEFINITIONS[selectedShipColor] || COLOR_DEFINITIONS['Blue'];
        this.bodyColor = color(colors.body[0], colors.body[1], colors.body[2]); this.cockpitColor = color(colors.cockpit[0], colors.cockpit[1], colors.cockpit[2]); this.wingColor = color(colors.wing[0], colors.wing[1], colors.wing[2]); this.detailColor1 = color(colors.detail1[0], colors.detail1[1], colors.detail1[2]); this.detailColor2 = color(colors.detail2[0], colors.detail2[1], colors.detail2[2]); this.engineColor1 = color(colors.engine1[0], colors.engine1[1], colors.engine1[2]); this.engineColor2 = color(colors.engine2[0], colors.engine2[1], colors.engine2[2]);
    }
    gainShields(amount) {
        let currentCharges = this.shieldCharges;
        this.shieldCharges = min(this.shieldCharges + amount, MAX_SHIELD_CHARGES);
        this.shieldRegenTimer = 0; // Reset regen timer on gain
        return this.shieldCharges - currentCharges;
    }
    loseShield() {
        if (this.shieldCharges > 0) {
            this.shieldCharges = 0; // Fully deplete shield on hit, even fractional
            this.shieldRegenTimer = this.shieldRegenDelay; // Start cooldown after losing shield
        }
    }
    setInvulnerable() { this.invulnerableTimer = this.invulnerabilityDuration; this.shieldRegenTimer = this.shieldRegenDelay; /* Start shield regen delay on taking damage */ }
    changeShape(level) { this.shapeState = min(1, floor(level / 2)); } // Shape change based on points (kept for visual flair)
    get currentShootDelay() { if (this.rapidFireTimer > 0) { return 2; } else { return max(3, this.baseShootDelay - (this.fireRateLevel * this.shootDelayPerLevel)); } }
    getUpgradeCost(upgradeType) { let level, maxLevel, multiplier = this.costMultiplier; switch (upgradeType) { case 'fireRate': level = this.fireRateLevel; maxLevel = this.maxUpgradeLevel; break; case 'spreadShot': level = this.spreadShotLevel; maxLevel = this.maxUpgradeLevel; break; case 'rearGun': level = this.rearGunLevel; maxLevel = this.maxRearGunLevel; multiplier = this.costMultiplier * 0.8; break; case 'homingMissiles': level = this.homingMissilesLevel; maxLevel = this.maxMissileLevel; multiplier = this.specialCostMultiplier; break; default: return Infinity; } if (level >= maxLevel) return "MAX"; return floor(this.baseUpgradeCost * pow(multiplier, level)); }
    attemptUpgrade(upgradeType) {
        // Prevent missile upgrade on mobile, even if somehow attempted
        if (isMobile && upgradeType === 'homingMissiles') return false;

        let cost = this.getUpgradeCost(upgradeType);
        if (typeof cost !== 'number' || money < cost) return false;
        money -= cost;
        switch (upgradeType) {
            case 'fireRate': this.fireRateLevel++; break;
            case 'spreadShot': this.spreadShotLevel++; break;
            case 'rearGun': this.rearGunLevel++; break;
            case 'homingMissiles':
                this.homingMissilesLevel++;
                this.maxMissiles = this.missileCapacity[this.homingMissilesLevel];
                // Give full missiles on first purchase
                if (this.homingMissilesLevel === 1) {
                    this.currentMissiles = this.maxMissiles;
                }
                break;
            default: money += cost; return false; // Refund if unknown upgrade
        }
        return true;
    }
    resetPositionForNewLevel() { this.pos.set(width / 2, height - 50); this.vel.set(0, 0); this.invulnerableTimer = 60; this.rapidFireTimer = 0; this.tempShieldActive = false; this.missileCooldown = 0; this.scoreMultiplierTimer = 0; this.scoreMultiplierValue = 1; this.droneActive = false; this.drone = null; this.invincibilityTimer = 0; this.laserHitCooldown = 0; this.shieldRegenTimer = 0; }
    update() {
        if (this.invulnerableTimer > 0) { this.invulnerableTimer--; } if (this.rapidFireTimer > 0) { this.rapidFireTimer--; } if (this.shootCooldown > 0) { this.shootCooldown--; } if (this.missileCooldown > 0) { this.missileCooldown--; } if (this.laserHitCooldown > 0) { this.laserHitCooldown--; } // Decrement laser hit cooldown
        if (this.scoreMultiplierTimer > 0) { this.scoreMultiplierTimer--; if(this.scoreMultiplierTimer <= 0) this.scoreMultiplierValue = 1;} if (this.invincibilityTimer > 0) { this.invincibilityTimer--; }
        if (this.droneActive && this.drone && this.drone.isExpired()) { this.droneActive = false; this.drone = null; infoMessage = "Drone Deactivated"; infoMessageTimeout = 90; createParticles(this.pos.x, this.pos.y, 15, color(180, 50, 80), 4, 1.5, 0.8); }
        if (this.homingMissilesLevel > 0 && this.currentMissiles < this.maxMissiles) { this.missileRegenTimer--; if (this.missileRegenTimer <= 0) { this.currentMissiles++; this.missileRegenTimer = this.missileRegenTime[this.homingMissilesLevel]; } } else if (this.homingMissilesLevel > 0) { this.missileRegenTimer = this.missileRegenTime[this.homingMissilesLevel]; }
        this.hoverOffset = sin(frameCount * 0.05) * 2;

         // Shield Regen Logic
         if (this.shieldRegenRate > 0 && this.shieldCharges < MAX_SHIELD_CHARGES && !this.tempShieldActive && this.invulnerableTimer <= 0 && this.invincibilityTimer <=0) {
             if (this.shieldRegenTimer > 0) {
                 this.shieldRegenTimer--;
             } else {
                 // Regen shield fractionally
                 this.shieldCharges += this.shieldRegenRate;
                 this.shieldCharges = min(this.shieldCharges, MAX_SHIELD_CHARGES); // Cap at max
             }
         } else if (this.shieldRegenTimer > 0 && (this.tempShieldActive || this.invulnerableTimer > 0 || this.invincibilityTimer > 0)) {
            // Keep shield regen timer paused if temp shield/invincibility active
             this.shieldRegenTimer = this.shieldRegenDelay;
         } else if (this.shieldRegenTimer > 0) {
             this.shieldRegenTimer--; // Countdown normally if no protective effects active
         }


        // --- Player Input & Movement ---
        let acceleration = createVector(0, 0);
        let applyThrustParticles = false;

        // Determine if movement input is active (keyboard OR touch)
        let movingUp = keyIsDown(UP_ARROW) || keyIsDown(87);
        let movingDown = keyIsDown(DOWN_ARROW) || keyIsDown(83);
        let movingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65);
        let movingRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68);
        let keyboardMoving = movingUp || movingDown || movingLeft || movingRight;
        let touchMoving = isMobile && touches.length > 0 && isMobileShooting; // Touch controls movement ONLY when isMobileShooting is true

        if (touchMoving) {
             // Mobile touch always controls movement when shooting is active
             let touchPos = createVector(touches[0].x, touches[0].y); // Use first touch for movement target
             let direction = p5.Vector.sub(touchPos, this.pos);
             // Adjust deadzone or sensitivity as needed
             if (direction.magSq() > (this.size * 0.2) * (this.size * 0.2)) {
                 let targetVel = direction.copy().normalize().mult(this.maxSpeed * this.touchThrustMultiplier);
                 this.vel.lerp(targetVel, 0.15); // Smoother touch movement
                 applyThrustParticles = this.vel.magSq() > 0.1;
             } else {
                 this.vel.mult(this.friction * 0.95); // Stronger friction if touch is near center (braking)
             }
        } else if (keyboardMoving) {
             // Keyboard movement (only if not touch-moving)
             let currentThrust = this.thrust;
             if (!isMobile) { currentThrust *= 1.5; } // Boost for non-mobile
             if (movingUp) { acceleration.y -= currentThrust; applyThrustParticles = true; }
             if (movingDown) { acceleration.y += currentThrust; } // No thrust particles when reversing/braking
             if (movingLeft) { acceleration.x -= currentThrust; applyThrustParticles = true;}
             if (movingRight) { acceleration.x += currentThrust; applyThrustParticles = true;}
             this.vel.add(acceleration);
             this.vel.mult(this.friction);
        } else {
             // No movement input, apply friction
             this.vel.mult(this.friction);
             if (this.vel.magSq() < 0.01) this.vel.set(0, 0); // Stop completely if slow enough
        }

        // Thrust particles based on actual movement or keyboard input
        if (applyThrustParticles && frameCount % 3 === 0) {
            let thrustColor = lerpColor(this.engineColor1, this.engineColor2, random(0.3, 0.7));
            createParticles(this.pos.x, this.pos.y + this.size * 0.6, 1, thrustColor, 3, 1.5, 0.5);
        }

        this.vel.limit(this.maxSpeed); this.pos.add(this.vel); let margin = this.size * 0.7; this.pos.x = constrain(this.pos.x, margin, width - margin); this.pos.y = constrain(this.pos.y, margin, height - margin);

        // --- Handle Auto-Fire ---
        if (gameState === GAME_STATE.PLAYING && !isPaused) {
            // Shoot if spacebar held OR if mobile shooting flag is true (set by touchStarted)
            if ((!isMobile && spacebarHeld) || (isMobile && isMobileShooting)) {
                this.shoot();
            }
        }
    }
    shoot() {
        if (this.shootCooldown <= 0) {
            let originY = this.pos.y - this.size * 0.7 + this.hoverOffset; let originPoints = [createVector(this.pos.x, originY)]; let numShots = 1; let spreadAngle = 0;
            if (this.spreadShotLevel >= 1 && this.spreadShotLevel <= 2) { let offset = this.size * 0.15; originPoints = [ createVector(this.pos.x - offset, originY + 5), createVector(this.pos.x, originY), createVector(this.pos.x + offset, originY + 5) ]; numShots = 3; spreadAngle = PI / 20; }
            else if (this.spreadShotLevel >= 3 && this.spreadShotLevel <= 4) { let offset = this.size * 0.2; originPoints = [ createVector(this.pos.x - offset, originY + 5), createVector(this.pos.x, originY), createVector(this.pos.x + offset, originY + 5) ]; numShots = 3; spreadAngle = PI / 15; }
            else if (this.spreadShotLevel >= this.maxUpgradeLevel) { let offset1 = this.size * 0.25; let offset2 = this.size * 0.1; originPoints = [ createVector(this.pos.x - offset1, originY + 8), createVector(this.pos.x - offset2, originY + 3), createVector(this.pos.x, originY), createVector(this.pos.x + offset2, originY + 3), createVector(this.pos.x + offset1, originY + 8) ]; numShots = 5; spreadAngle = PI / 12; }

            // Apply base damage multiplier from skills
            let dmgMult = this.bulletDamageMultiplier;

            for (let i = 0; i < numShots; i++) { let angle = 0; if (numShots > 1) { angle = map(i, 0, numShots - 1, -spreadAngle, spreadAngle); } let origin = originPoints[i] || originPoints[0]; bullets.push(new Bullet(origin.x, origin.y, angle, dmgMult)); }
            this.fireRearGun(dmgMult); let rearGunFactor = (this.rearGunLevel > 0) ? this.rearGunDelayFactor[this.rearGunLevel] : 1.0; this.shootCooldown = this.currentShootDelay * rearGunFactor;
        }
    }
    fireMissile() {
        if (this.homingMissilesLevel > 0 && this.currentMissiles > 0 && this.missileCooldown <= 0) {
            let originY = this.pos.y + this.hoverOffset; let originXOffset = this.size * 0.4; let side = (this.currentMissiles % 2 === 0) ? -1 : 1;
            // Apply base damage + skill bonus
            let missileDamage = BASE_MISSILE_DAMAGE[this.homingMissilesLevel] + this.missileDamageBonus;
            homingMissiles.push(new HomingMissile(this.pos.x + originXOffset * side, originY, missileDamage, this.missileColor));
            this.currentMissiles--; this.missileCooldown = 20;
            createParticles(this.pos.x + originXOffset * side, originY, 10, this.missileColor, 3, 1.8, 0.6);
        }
    }
    fireRearGun(dmgMult) { // Pass base damage multiplier
         if (this.rearGunLevel > 0) { let originY = this.pos.y + this.size * 0.6 + this.hoverOffset; let numRearShots = this.rearGunLevel; let rearSpread = PI / 18; for (let i = 0; i < numRearShots; i++) { let angle = PI; if (numRearShots > 1) { angle += map(i, 0, numRearShots - 1, -rearSpread, rearSpread); } bullets.push(new Bullet(this.pos.x, originY, angle, dmgMult)); } }
    }
    draw() {
        let showInvulnerableEffect = this.invulnerableTimer > 0 || this.invincibilityTimer > 0; let drawShip = !showInvulnerableEffect || (showInvulnerableEffect && frameCount % 10 < 5);
        if (drawShip) {
            push(); translate(this.pos.x, this.pos.y + this.hoverOffset);
            if (this.invincibilityTimer > 0) { let invincibilityAlpha = map(sin(frameCount * 0.5), -1, 1, 40, 90); let invincibilityColor = color(0, 0, 100); fill(invincibilityColor, invincibilityAlpha); noStroke(); ellipse(0, 0, this.shieldVisualRadius * 2.5, this.shieldVisualRadius * 2.5); strokeWeight(3); stroke(invincibilityColor, invincibilityAlpha + 20); noFill(); ellipse(0, 0, this.shieldVisualRadius * 2.5, this.shieldVisualRadius * 2.5); }
            else if (this.tempShieldActive) { let tempShieldAlpha = map(sin(frameCount * 0.3), -1, 1, 60, 100); let tempShieldHue = 45; fill(tempShieldHue, 90, 100, tempShieldAlpha); noStroke(); ellipse(0, 0, this.shieldVisualRadius * 2.3, this.shieldVisualRadius * 2.3); strokeWeight(2.5); stroke(tempShieldHue, 100, 100, tempShieldAlpha + 25); noFill(); ellipse(0, 0, this.shieldVisualRadius * 2.3, this.shieldVisualRadius * 2.3); }
            else if (this.shieldCharges > 0) {
                 // Use fractional shield value for visual representation if regen is active
                 let shieldFraction = min(1, this.shieldCharges / MAX_SHIELD_CHARGES); // Fraction of max shield charge
                 let shieldAlpha = map(sin(frameCount * 0.2), -1, 1, 50, 90) * shieldFraction;
                 let shieldBrightness = 100 * shieldFraction;
                 let shieldRadius = this.shieldVisualRadius * 2.1 * shieldFraction;
                 let shieldHue = 180;
                 fill(shieldHue, 80, shieldBrightness, shieldAlpha);
                 noStroke();
                 ellipse(0, 0, shieldRadius, shieldRadius);
                 strokeWeight(2);
                 stroke(shieldHue, 90, shieldBrightness, shieldAlpha + 35);
                 noFill();
                 ellipse(0, 0, shieldRadius, shieldRadius);
             }
            let enginePulseFactor = 1.0 + this.vel.mag() * 0.04; let pulseSpeed = (this.rapidFireTimer > 0) ? 0.5 : 0.25; let enginePulse = map(sin(frameCount * pulseSpeed), -1, 1, 0.8, 1.3) * enginePulseFactor; let engineSize = this.size * 0.55 * enginePulse; let engineBrightness = map(sin(frameCount * 0.35), -1, 1, 85, 100); noStroke(); let engineY = this.size * 0.6; for (let i = engineSize * 1.2; i > 0; i -= 3) { let alpha = map(i, 0, engineSize * 1.2, 0, 30); fill(hue(this.engineColor2), saturation(this.engineColor2), engineBrightness, alpha); ellipse(0, engineY, i * 0.8, i * 1.2); } fill(hue(this.engineColor1), saturation(this.engineColor1), 100); ellipse(0, engineY, engineSize * 0.5, engineSize * 1.0);
            let s = this.size; let bodyW = s * 0.5; let wingW = s * (this.shapeState === 0 ? 1.1 : 1.3); let wingH = s * 0.8; let noseL = s * 0.8; strokeWeight(1.5); stroke(this.detailColor1); fill(this.wingColor); triangle(-bodyW / 2, s * 0.1, -wingW / 2, s * 0.5, -bodyW * 0.7, s * 0.6); triangle( bodyW / 2, s * 0.1, wingW / 2, s * 0.5, bodyW * 0.7, s * 0.6); fill(hue(this.wingColor), saturation(this.wingColor), brightness(this.wingColor)*1.2); triangle(-bodyW / 2, s * 0.1, -wingW / 2, s * 0.5, -wingW * 0.4, s * 0.0); triangle( bodyW / 2, s * 0.1, wingW / 2, s * 0.5, wingW * 0.4, s * 0.0); fill(this.bodyColor); quad( 0, -noseL, bodyW / 2, s * 0.1, 0, s * 0.4, -bodyW / 2, s * 0.1 ); if (this.shapeState === 1) { fill(this.wingColor); triangle(0, s*0.4, -s*0.2, s*0.7, s*0.2, s*0.7); quad(-bodyW*0.7, s*0.6, -bodyW*0.6, s*0.8, -wingW*0.4, s*0.7, -wingW/2, s*0.5); quad( bodyW*0.7, s*0.6,  bodyW*0.6, s*0.8,  wingW*0.4, s*0.7,  wingW/2, s*0.5); }
            let cockpitY = -s * 0.15; let cockpitW = s * 0.4; let cockpitH = s * 0.6; fill(this.cockpitColor); ellipse(0, cockpitY, cockpitW, cockpitH); noStroke(); fill(0, 0, 100, 50); ellipse(0, cockpitY - cockpitH * 0.1, cockpitW * 0.7, cockpitH * 0.4); strokeWeight(1); stroke(this.detailColor2); line(0, -noseL * 0.8, 0, cockpitY + cockpitH / 2); line(-bodyW / 2, s * 0.1, -wingW * 0.4, s * 0.0); line( bodyW / 2, s * 0.1, wingW * 0.4, s * 0.0); if (this.shapeState === 1) { line(-bodyW*0.3, s*0.0, -bodyW*0.4, s*0.3); line( bodyW*0.3, s*0.0,  bodyW*0.4, s*0.3); }
            pop();
        }
    }
}

// Projectile Classes
class Bullet {
    constructor(x, y, angle = 0, damageMultiplier = 1) { // Accept damage multiplier
        this.pos = createVector(x, y); this.speed = 17; this.size = 5.5;
        this.style = selectedBulletStyle; // Use global selection
        this.damage = BASE_BULLET_DAMAGE * damageMultiplier; // Apply damage multiplier

        // Initialize color/trail properties
        this.hue = 0; this.sat = 0; this.bri = 100; this.trailLength = 0;

        if (this.style === 'Rainbow') {
            this.hue = frameCount % 360; this.sat = 90; this.bri = 100; this.trailLength = 5;
        } else if (this.style === 'White') {
            this.hue = 0; this.sat = 0; this.bri = 100; this.trailLength = 7;
        } else if (this.style === 'Plasma') {
            this.hue = 150; this.sat = 100; this.bri = 90; this.trailLength = 6;
        } else if (this.style === 'Fire') {
            this.hue = 15; this.sat = 100; this.bri = 100; this.trailLength = 8;
        } else if (this.style === 'Ice') {
            this.hue = 200; this.sat = 30; this.bri = 100; this.trailLength = 4;
        } else { // Default to White if style is unknown
             this.hue = 0; this.sat = 0; this.bri = 100; this.trailLength = 7;
        }

        let baseAngle = -PI / 2;
        // Special case for rear gun angle (passed as PI)
        if (angle === PI) { baseAngle = PI/2; angle=0;}
        this.vel = p5.Vector.fromAngle(baseAngle + angle);
        this.vel.mult(this.speed);
        this.trail = [];
    }
    update() {
        this.trail.unshift(this.pos.copy()); if (this.trail.length > this.trailLength) { this.trail.pop(); }
        this.pos.add(this.vel);
        if (this.style === 'Rainbow') {
            this.hue = (this.hue + 5) % 360;
        } else if (this.style === 'Fire') {
             this.hue = (this.hue + random(-2, 2) + 360) % 360; // Slight hue variation for flicker
             this.hue = lerp(this.hue, 15, 0.1); // Pull back towards base orange/red
        }
    }
    draw() { noStroke(); for (let i = 0; i < this.trail.length; i++) { let trailPos = this.trail[i]; let alpha = map(i, 0, this.trail.length - 1, 50, 0); let trailSize = map(i, 0, this.trail.length - 1, this.size, this.size * 0.5); fill(this.hue, this.sat, this.bri, alpha); ellipse(trailPos.x, trailPos.y, trailSize, trailSize * 2.0); } fill(this.hue, this.sat * 1.05, this.bri); stroke(0, 0, 100); strokeWeight(1); ellipse(this.pos.x, this.pos.y, this.size, this.size * 2.5); }
    isOffscreen() { let margin = this.size * 5; return (this.pos.y < -margin || this.pos.y > height + margin || this.pos.x < -margin || this.pos.x > width + margin); }
}
class HomingMissile { constructor(x, y, damage, color) { // Damage is now passed directly
    this.pos = createVector(x, y); this.vel = createVector(random(-1, 1), -random(4, 6)); this.acc = createVector(0, 0); this.maxSpeed = 8 + (ship?.homingMissilesLevel || 1) * 0.5; this.maxForce = 0.25 + (ship?.homingMissilesLevel || 1) * 0.05; this.size = 10; this.damage = damage; // Use passed damage
    this.color = color; this.target = null; this.lifespan = 180; this.trail = []; this.trailLength = 8; } findTarget() { let closestDist = Infinity; let closestEnemy = null; for (let enemy of enemyShips) { let d = p5.Vector.dist(this.pos, enemy.pos); if (d < closestDist && d < width / 2) { closestDist = d; closestEnemy = enemy; } } this.target = closestEnemy; } seek() { if (!this.target || !enemyShips.includes(this.target)) { this.findTarget(); if (!this.target) { this.acc.mult(0); this.lifespan -= 2; return; } } let desired = p5.Vector.sub(this.target.pos, this.pos); desired.setMag(this.maxSpeed); let steer = p5.Vector.sub(desired, this.vel); steer.limit(this.maxForce); this.acc.add(steer); } update() { this.lifespan--; if (frameCount % 5 === 0 || !this.target) { this.findTarget(); } this.seek(); this.vel.add(this.acc); this.vel.limit(this.maxSpeed); this.pos.add(this.vel); this.acc.mult(0); this.trail.unshift(this.pos.copy()); if (this.trail.length > this.trailLength) { this.trail.pop(); } } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.vel.heading() + PI / 2); noFill(); beginShape(); for (let i = 0; i < this.trail.length; i++) { let trailPos = this.trail[i]; let alpha = map(i, 0, this.trail.length - 1, 60, 0); stroke(hue(this.color), saturation(this.color) * 0.8, brightness(this.color) * 0.9, alpha); strokeWeight(map(i, 0, this.trail.length - 1, this.size * 0.6, 1)); let relativePos = p5.Vector.sub(trailPos, this.pos); relativePos.rotate(-(this.vel.heading() + PI / 2)); vertex(relativePos.x, relativePos.y); } endShape(); fill(this.color); noStroke(); triangle(0, -this.size * 0.8, -this.size * 0.4, this.size * 0.5, this.size * 0.4, this.size * 0.5); fill(hue(this.color), saturation(this.color) * 0.7, brightness(this.color) * 0.7); rect(-this.size * 0.4, this.size * 0.2, this.size * 0.2, this.size * 0.5); rect(this.size * 0.2, this.size * 0.2, this.size * 0.2, this.size * 0.5); pop(); } isOffscreen() { let margin = this.size * 2; return (this.pos.y < -margin || this.pos.y > height + margin || this.pos.x < -margin || this.pos.x > width + margin); } hits(target) { let d = dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y); return d < this.size / 2 + target.size / 2; } }

// Asteroid Class
class Asteroid { constructor(x, y, size, vel) { this.size = size || random(30, 85); this.pos = createVector(); let isInitialPlacement = (x !== undefined && y !== undefined); if (isInitialPlacement) { this.pos.x = x; this.pos.y = y; } else { let edge = floor(random(3)); if (edge === 0) { this.pos.x = random(width); this.pos.y = -this.size / 2; } else if (edge === 1) { this.pos.x = width + this.size / 2; this.pos.y = random(height * 0.7); } else { this.pos.x = -this.size / 2; this.pos.y = random(height * 0.7); } } if (vel) { this.vel = vel; } else { let baseSpeedMin = 0.6 + (currentLevel - 1) * 0.1; let baseSpeedMax = 1.8 + (currentLevel - 1) * 0.2; this.speed = min(MAX_ASTEROID_SPEED, random(baseSpeedMin, baseSpeedMax)); this.speed *= (this.size > 50 ? 0.9 : 1.1); this.speed *= random(0.9, 1.1); let direction; if (isInitialPlacement) { direction = p5.Vector.random2D(); } else { let targetX = width / 2 + random(-width * 0.25, width * 0.25); let targetY = height / 2 + random(-height * 0.25, height * 0.25); direction = createVector(targetX - this.pos.x, targetY - this.pos.y); direction.normalize(); direction.rotate(random(-PI / 12, PI / 12)); } this.vel = direction; this.vel.mult(this.speed); } this.color = color(random(20, 50), random(30, 70), random(35, 65)); this.rotation = random(TWO_PI); this.rotationSpeed = random(-0.04, 0.04); this.rotationAccel = 0.0001; this.vertices = []; let numVertices = floor(random(9, 18)); for (let i = 0; i < numVertices; i++) { let angleOffset = map(i, 0, numVertices, 0, TWO_PI); let r = this.size / 2 + random(-this.size * 0.45, this.size * 0.35); let v = p5.Vector.fromAngle(angleOffset); v.mult(r); this.vertices.push(v); } this.craters = []; let numCraters = floor(random(2, 7)); for (let i = 0; i < numCraters; i++) { let angle = random(TWO_PI); let radius = random(this.size * 0.1, this.size * 0.4); let craterSize = random(this.size * 0.1, this.size * 0.3); let craterPos = p5.Vector.fromAngle(angle).mult(radius); this.craters.push({ pos: craterPos, size: craterSize }); } } update() { this.pos.add(this.vel); this.rotationSpeed += random(-this.rotationAccel, this.rotationAccel); this.rotationSpeed = constrain(this.rotationSpeed, -0.06, 0.06); this.rotation += this.rotationSpeed; let buffer = this.size; if (this.pos.x < -buffer) this.pos.x = width + buffer; if (this.pos.x > width + buffer) this.pos.x = -buffer; if (this.pos.y < -buffer) this.pos.y = height + buffer; if (this.pos.y > height + buffer) this.pos.y = -buffer; } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); noStroke(); let mainBri = brightness(this.color); let mainSat = saturation(this.color); let mainHue = hue(this.color); let gradSteps = 10; let bodyRadius = this.size / 2; for (let i = 0; i < gradSteps; i++) { let inter = i / gradSteps; let y = lerp(-bodyRadius, bodyRadius, inter); let h = lerp(0, bodyRadius * 2, inter); let w = sqrt(max(0, bodyRadius*bodyRadius - y*y)) * 2; let bri = lerp(mainBri * 1.4, mainBri * 0.5, inter); fill(mainHue, mainSat, bri); ellipse(0, y, w*0.95, h / gradSteps * 1.2); } beginShape(); for (let v of this.vertices) { vertex(v.x, v.y); } endShape(CLOSE); let craterBaseColor = color(mainHue, mainSat * 0.8, mainBri * 0.5, 90); let craterHighlightColor = color(mainHue, mainSat * 0.6, mainBri * 1.1, 70); for (let crater of this.craters) { fill(craterBaseColor); ellipse(crater.pos.x, crater.pos.y, crater.size, crater.size * random(0.7, 1.3)); fill(craterHighlightColor); ellipse(crater.pos.x + crater.size * 0.1, crater.pos.y + crater.size * 0.1, crater.size * 0.6, crater.size * 0.6 * random(0.7, 1.3)); } strokeWeight(0.5); stroke(mainHue, mainSat * 0.9, mainBri * 0.8, 25); let numLines = 5; for (let i = 0; i < numLines; i++) { let yLine = map(i, 0, numLines -1, -bodyRadius * 0.7, bodyRadius * 0.7); let xLine = sqrt(max(0, bodyRadius*bodyRadius - yLine*yLine)) * 0.7; line(-xLine, yLine, xLine, yLine); } pop(); } hits(projectile) { let d = dist(this.pos.x, this.pos.y, projectile.pos.x, projectile.pos.y); return d < this.size / 2 + projectile.size / 2; } hitsShip(ship) { let targetX = ship.pos.x; let targetY = ship.pos.y; let targetRadius = ship.invincibilityTimer > 0 ? ship.shieldVisualRadius * 1.2 : ( ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5) ); let d = dist(this.pos.x, this.pos.y, targetX, targetY); return d < this.size / 2 * 0.9 + targetRadius; } }
// Particle Class
class Particle { constructor(x, y, particleColor, size = null, speedMult = 1, lifespanMult = 1) { this.pos = createVector(x, y); this.vel = p5.Vector.random2D(); this.vel.mult(random(1.5, 6) * speedMult); this.lifespan = 100 * lifespanMult * random(0.8, 1.5); this.maxLifespan = this.lifespan; this.baseHue = hue(particleColor); this.baseSat = saturation(particleColor); this.baseBri = brightness(particleColor); this.size = size !== null ? size * random(0.8, 1.2) : random(2, 7); this.drag = random(0.95, 0.99); } update() { this.pos.add(this.vel); this.lifespan -= 2.5; this.vel.mult(this.drag); } draw() { noStroke(); let currentAlpha = map(this.lifespan, 0, this.maxLifespan, 0, 100); fill(this.baseHue, this.baseSat, this.baseBri, currentAlpha); ellipse(this.pos.x, this.pos.y, this.size * (this.lifespan / this.maxLifespan)); } isDead() { return this.lifespan <= 0; } }
// Star Class
class Star { constructor() { this.x = random(width); this.y = random(height); this.layer = floor(random(4)); this.size = map(this.layer, 0, 3, 0.4, 2.8); this.speed = map(this.layer, 0, 3, 0.05, 0.6); this.baseBrightness = random(50, 95); this.twinkleSpeed = random(0.03, 0.08); this.twinkleRange = random(0.6, 1.4); this.twinkleOffset = random(TWO_PI); } update() { this.y += this.speed; if (this.y > height + this.size) { this.y = -this.size; this.x = random(width); } } draw() { let twinkleFactor = map(sin(frameCount * this.twinkleSpeed + this.twinkleOffset), -1, 1, 1.0 - this.twinkleRange / 2, 1.0 + this.twinkleRange / 2); let currentBrightness = constrain(this.baseBrightness * twinkleFactor, 30, 100); fill(0, 0, currentBrightness, 90); noStroke(); ellipse(this.x, this.y, this.size, this.size); } }
// ShootingStar Class
class ShootingStar { constructor() { this.startX = random(width); this.startY = random(-50, -10); this.pos = createVector(this.startX, this.startY); let angle = random(PI * 0.3, PI * 0.7); this.speed = random(15, 30); this.vel = p5.Vector.fromAngle(angle).mult(this.speed); this.len = random(50, 150); this.brightness = random(80, 100); this.lifespan = 100; } update() { this.pos.add(this.vel); this.lifespan -= 2; } draw() { if (this.lifespan <= 0) return; let alpha = map(this.lifespan, 0, 100, 0, 100); let tailPos = p5.Vector.sub(this.pos, this.vel.copy().setMag(this.len)); strokeWeight(random(1.5, 3)); stroke(0, 0, this.brightness, alpha); line(this.pos.x, this.pos.y, tailPos.x, tailPos.y); } isDone() { return this.lifespan <= 0 || this.pos.y > height + this.len || this.pos.x < -this.len || this.pos.x > width + this.len; } }
// HealthPotion Class (Enhanced Visuals)
class HealthPotion {
    constructor(x, y) {
        this.pos = createVector(x || random(width * 0.1, width * 0.9), y || -30);
        this.vel = createVector(0, random(0.5, 1.5));
        this.size = 20; // Base size reference
        this.rotation = 0;
        this.rotationSpeed = random(-0.015, 0.015);
        this.pulseOffset = random(TWO_PI);
    }
    update() {
        this.pos.add(this.vel);
        this.rotation += this.rotationSpeed;
    }
    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);

        let pulseFactor = map(sin(frameCount * 0.15 + this.pulseOffset), -1, 1, 0.95, 1.05);
        let s = this.size * pulseFactor; // Base size influenced by pulse

        // Dimensions based on s
        let bodyHeight = s * 0.7;
        let bodyWidth = s * 0.6;
        let neckHeight = s * 0.3;
        let neckWidth = s * 0.25;
        let lipHeight = s * 0.08;
        let lipWidth = neckWidth * 1.4;
        let stopperHeight = s * 0.2;
        let stopperWidth = neckWidth * 1.1;

        let bodyBottomY = s * 0.4;
        let neckBottomY = -s * 0.3; // Where neck meets body
        let neckTopY = neckBottomY - neckHeight;

        // --- Glow ---
        let glowAlpha = map(pulseFactor, 0.95, 1.05, 35, 75);
        noStroke();
        for (let i = 3; i > 0; i--) {
            fill(0, 90, 100, glowAlpha / (i * 2)); // Red glow
            ellipse(0, 0, s * (1 + i * 0.25), s * (1 + i * 0.25));
        }

        // --- Liquid ---
        fill(0, 85, 90); // Red liquid color
        noStroke();
        // Draw main body liquid shape (approximate)
        ellipse(0, neckBottomY - bodyHeight*0.3, bodyWidth, bodyHeight * 0.7); // Main bulb
        rect(-neckWidth / 2, neckBottomY, neckWidth, bodyHeight * 0.3); // Connect neck to bulb


        // --- Bottle Glass ---
        strokeWeight(1.5);
        stroke(0, 0, 65, 90); // Glass outline color
        fill(0, 0, 100, 18); // Transparent white fill

        // Body (Ellipse/Arc)
        arc(0, neckBottomY - bodyHeight*0.3, bodyWidth, bodyHeight*0.7, 0, PI, CHORD); // Bottom curve

        // Neck & Lip
        line(-bodyWidth/2, neckBottomY, -neckWidth/2, neckBottomY); // Left shoulder
        line(bodyWidth/2, neckBottomY, neckWidth/2, neckBottomY); // Right shoulder
        line(-neckWidth / 2, neckBottomY, -neckWidth / 2, neckTopY); // Left neck
        line(neckWidth / 2, neckBottomY, neckWidth / 2, neckTopY); // Right neck
        noFill(); // Outline only for lip
        ellipse(0, neckTopY, lipWidth, lipHeight * 2); // Use ellipse for lip

        // --- Stopper ---
        fill(40, 40, 30); // Cork color
        stroke(40, 40, 15);
        strokeWeight(1);
        // Rounded top stopper
        arc(0, neckTopY - stopperHeight*0.6, stopperWidth, stopperHeight*0.8, PI, TWO_PI); // Top arc
        rect(-stopperWidth/2, neckTopY - stopperHeight*0.6, stopperWidth, stopperHeight*0.6); // Body


        // --- Highlight ---
        noStroke();
        fill(0, 0, 100, 35);
        // Simple curved highlight on body
        beginShape();
        vertex(-bodyWidth * 0.15, neckBottomY - bodyHeight * 0.05);
        bezierVertex(-bodyWidth * 0.35, neckBottomY - bodyHeight * 0.3,
                     -bodyWidth * 0.3, bodyBottomY * 0.4,
                     -bodyWidth * 0.1, bodyBottomY * 0.6);
        bezierVertex(-bodyWidth * 0.05, bodyBottomY * 0.3,
                      bodyWidth * 0.0, neckBottomY - bodyHeight * 0.4,
                     -bodyWidth * 0.15, neckBottomY - bodyHeight * 0.05);
        endShape(CLOSE);

        pop();
    }
    hitsShip(ship) { let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y); let shipRadius = ship.invincibilityTimer > 0 ? ship.shieldVisualRadius * 1.2 : ( ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5) ); return d < this.size * 0.7 + shipRadius; }
    isOffscreen() { let margin = this.size * 2; return (this.pos.y > height + margin); }
}
// PowerUp Class (Enhanced Visuals)
class PowerUp {
    constructor(type) {
        this.type = type;
        this.pos = createVector(random(width * 0.1, width * 0.9), -30);
        this.vel = createVector(0, random(0.8, 1.8));
        this.size = 22;
        this.pulseOffset = random(TWO_PI);
        this.rotation = random(TWO_PI);
        this.rotationSpeed = random(-0.02, 0.02);
        this.icon = '?';
        this.color = color(0, 0, 100);
        switch (this.type) { case POWERUP_TYPES.TEMP_SHIELD: this.icon = 'S'; this.color = color(45, 90, 100); break; case POWERUP_TYPES.RAPID_FIRE: this.icon = 'R'; this.color = color(120, 90, 100); break; case POWERUP_TYPES.EMP_BURST: this.icon = 'E'; this.color = color(210, 90, 100); break; case POWERUP_TYPES.SCORE_MULT: this.icon = 'x2'; this.color = color(60, 100, 100); break; case POWERUP_TYPES.DRONE: this.icon = 'D'; this.color = color(180, 50, 100); break; case POWERUP_TYPES.INVINCIBILITY: this.icon = 'I'; this.color = color(300, 80, 100); break; }
    }
    update() {
        this.pos.add(this.vel);
        this.rotation += this.rotationSpeed;
    }
    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);

        let pulse = map(sin(frameCount * 0.2 + this.pulseOffset), -1, 1, 0.9, 1.1);
        let currentSize = this.size * pulse;
        let iconSize = currentSize * (this.icon === 'x2' ? 0.6 : 0.75); // Adjusted icon size
        let currentBrightness = brightness(this.color); // Use base brightness

        // --- Outer Glow ---
        let glowAlpha = map(pulse, 0.9, 1.1, 40, 90);
        noStroke();
        let glowRadius = currentSize * 0.6; // Base radius for hexagon
        for (let i = 3; i > 0; i--) {
            let sizeFactor = 1 + i * 0.3;
            fill(hue(this.color), saturation(this.color), currentBrightness, glowAlpha / (i * 2));
            drawHexagon(0, 0, glowRadius * sizeFactor); // Use hexagon for glow too
        }

        // --- Main Hexagon Body ---
        strokeWeight(2);
        stroke(hue(this.color), saturation(this.color) * 1.1, currentBrightness * 1.1, 95); // Brighter stroke
        fill(hue(this.color), saturation(this.color) * 0.8, currentBrightness * 0.7); // Slightly desaturated/darker fill
        drawHexagon(0, 0, glowRadius);

        // --- Inner Detail / Icon Background ---
        let innerRadius = glowRadius * 0.6; // Smaller inner hex
        fill(hue(this.color), saturation(this.color) * 0.5, currentBrightness * 0.5, 80); // Darker inner area
        noStroke();
        drawHexagon(0, 0, innerRadius);

        // --- Icon ---
        // Use shadowed text for the icon
        drawShadowedText(this.icon, 0, currentSize * 0.03, iconSize, color(0,0,100), color(0,0,0, 50));

        pop();
    }
    hitsShip(ship) { let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y); let shipRadius = ship.invincibilityTimer > 0 ? ship.shieldVisualRadius * 1.2 : ( ship.tempShieldActive ? ship.shieldVisualRadius*1.1 : (ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5) ); return d < this.size * 0.7 + shipRadius; }
    isOffscreen() { let margin = this.size * 2; return (this.pos.y > height + margin); }
}
// Drone Class
class Drone { constructor(playerShip) { this.ship = playerShip; this.offset = createVector(this.ship.size * 1.8, 0); this.pos = p5.Vector.add(this.ship.pos, this.offset); this.vel = createVector(); this.size = 15; this.color = color(180, 60, 95); this.wingColor = color(180, 40, 70); this.shootCooldown = 0; this.shootDelay = 35; this.lifespan = 900; this.rotation = 0; this.targetAngle = 0; this.lerpFactor = 0.1; } update() { this.lifespan--; let targetPos = p5.Vector.add(this.ship.pos, this.offset.copy().rotate(this.rotation)); this.pos.lerp(targetPos, this.lerpFactor); this.rotation += 0.02; this.shootCooldown--; if (this.shootCooldown <= 0 && !isPaused && gameState === GAME_STATE.PLAYING) { this.shoot(); this.shootCooldown = this.shootDelay; } } shoot() { bullets.push(new Bullet(this.pos.x, this.pos.y, 0, this.ship.bulletDamageMultiplier)); createParticles(this.pos.x, this.pos.y, 2, this.color, 2, 1.2, 0.4); } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.rotation * 2); let s = this.size; fill(this.color); stroke(0, 0, 20); strokeWeight(1); ellipse(0, 0, s, s * 1.2); fill(this.wingColor); triangle(-s * 0.4, -s * 0.2, -s * 1.1, -s * 0.5, -s * 0.8, s * 0.4); triangle(s * 0.4, -s * 0.2, s * 1.1, -s * 0.5, s * 0.8, s * 0.4); fill(0, 0, 100); ellipse(0, -s * 0.3, s * 0.3, s * 0.3); pop(); } isExpired() { return this.lifespan <= 0; } }

// Enemy Classes
class BaseEnemy { constructor(x, y, size, health, pointsValue, moneyValue) { this.pos = createVector(x, y); this.vel = createVector(); this.size = size; this.health = health; this.maxHealth = health; this.pointsValue = pointsValue; this.moneyValue = moneyValue; this.hitColor = color(0, 0, 80); this.explosionColor = color(30, 80, 90); } update() { this.pos.add(this.vel); } draw() { push(); translate(this.pos.x, this.pos.y); fill(300, 80, 50); rectMode(CENTER); rect(0, 0, this.size, this.size); pop(); } hits(projectile) { let d = dist(this.pos.x, this.pos.y, projectile.pos.x, projectile.pos.y); return d < this.size / 2 + projectile.size / 2; } hitsShip(playerShip) { let d = dist(this.pos.x, this.pos.y, playerShip.pos.x, playerShip.pos.y); let targetRadius; if (playerShip.invincibilityTimer > 0) targetRadius = playerShip.shieldVisualRadius * 1.2; else if (playerShip.tempShieldActive) targetRadius = playerShip.shieldVisualRadius * 1.1; else if (playerShip.shieldCharges > 0) targetRadius = playerShip.shieldVisualRadius; else targetRadius = playerShip.size * 0.5; return d < this.size * 0.45 + targetRadius; } isOffscreen() { let margin = this.size * 2; return (this.pos.y > height + margin || this.pos.y < -margin || this.pos.x < -margin || this.pos.x > width + margin); } takeDamage(amount) { this.health -= amount; return this.health <= 0; } getExplosionColor() { return this.explosionColor; } getHitColor() { return this.hitColor; } _setDefaultSpawnPosition() { let edge = floor(random(3)); if (edge === 0) { this.pos.x = random(width); this.pos.y = -this.size / 2; } else if (edge === 1) { this.pos.x = width + this.size / 2; this.pos.y = random(height * 0.6); } else { this.pos.x = -this.size / 2; this.pos.y = random(height * 0.6); } } }
class BasicEnemy extends BaseEnemy { constructor(x, y) { super(x, y, 30, 1, 20, 5); if (x === undefined || y === undefined) { this._setDefaultSpawnPosition(); } this.shootCooldown = random(120, 240); this.shootTimer = this.shootCooldown; this.bulletSpeed = 3.5 + currentLevel * 0.1; if (this.pos.y < 0) { this.vel.set(random(-0.5, 0.5), random(0.8, 1.5)); } else if (this.pos.x > width) { this.vel.set(random(-1.5, -0.8), random(-0.5, 0.5)); } else { this.vel.set(random(0.8, 1.5), random(-0.5, 0.5)); } let speedScale = min(MAX_ENEMY_SPEED_BASIC, 1.0 + (currentLevel - 1) * 0.1); this.vel.mult(speedScale); this.vel.x += random(-0.25, 0.25) * speedScale; this.bodyColor = color(0, 0, 15); this.accentColor = color(0, 90, 75); this.glowColor = color(0, 100, 100, 70); this.explosionColor = color(340, 90, 90); this.hitColor = this.accentColor; } update() { super.update(); this.shootTimer--; if (this.shootTimer <= 0 && ship && gameState === GAME_STATE.PLAYING && !isPaused) { this.shoot(); this.shootCooldown = random(max(40, 120 - currentLevel * 5), max(80, 240 - currentLevel * 10)); this.shootTimer = this.shootCooldown; } } shoot() { let aimAngle = PI / 2; enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y + this.size * 0.4, aimAngle, this.bulletSpeed)); } draw() { push(); translate(this.pos.x, this.pos.y); let s = this.size; fill(this.bodyColor); stroke(this.accentColor); strokeWeight(2); beginShape(); vertex(0, -s * 0.7); vertex(s * 0.6, s * 0.1); vertex(s * 0.3, s * 0.5); vertex(-s * 0.3, s * 0.5); vertex(-s * 0.6, s * 0.1); endShape(CLOSE); noStroke(); let glowPulse = map(sin(frameCount * 0.15), -1, 1, 0.8, 1.2); fill(hue(this.glowColor), saturation(this.glowColor), brightness(this.glowColor), alpha(this.glowColor) * glowPulse); ellipse(0, -s * 0.1, s * 0.25 * glowPulse, s * 0.35 * glowPulse); fill(this.accentColor); triangle(s * 0.3, s * 0.5, s * 0.4, s * 0.7, s * 0.2, s * 0.6); triangle(-s * 0.3, s * 0.5, -s * 0.4, s * 0.7, -s * 0.2, s * 0.6); pop(); } getExplosionColor() { return this.explosionColor; } getHitColor() { return this.hitColor; } }
class KamikazeEnemy extends BaseEnemy { constructor(x, y) { super(x, y, 24, 1, 15, 3); if (x === undefined || y === undefined) { this._setDefaultSpawnPosition(); this.pos.y = constrain(this.pos.y, -this.size, height * 0.6); } this.acceleration = 0.09 + currentLevel * 0.006; this.maxSpeed = min(MAX_ENEMY_SPEED_KAMIKAZE, 3.5 + currentLevel * 0.22); this.vel = p5.Vector.random2D().mult(this.maxSpeed * 0.5); this.bodyColor = color(0, 100, 65); this.spikeColor = color(25, 100, 100); this.trailColor = color(0, 90, 80, 40); this.explosionColor = color(20, 100, 100); this.hitColor = this.spikeColor; this.glowIntensity = 0; } update() { if (ship && gameState === GAME_STATE.PLAYING && !isPaused) { let direction = p5.Vector.sub(ship.pos, this.pos); let distanceSq = direction.magSq(); direction.normalize(); direction.mult(this.acceleration); this.vel.add(direction); this.vel.limit(this.maxSpeed); this.glowIntensity = map(sqrt(distanceSq), 200, 50, 0, 1, true); } else { this.glowIntensity = 0; } this.pos.add(this.vel); if (frameCount % 4 === 0) { createParticles(this.pos.x, this.pos.y, 1, this.trailColor, this.size * 0.25, 0.5, 0.3); } } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.vel.heading() + PI / 2); let s = this.size; if (this.glowIntensity > 0) { let glowPulse = map(sin(frameCount * 0.25), -1, 1, 0.7, 1.3); let glowSize = s * 1.8 * glowPulse * this.glowIntensity; noStroke(); fill(0, 100, 90, 30 * this.glowIntensity * glowPulse); ellipse(0, 0, glowSize, glowSize); } fill(this.bodyColor); stroke(0,0,10); strokeWeight(1); triangle(0, -s * 0.9, -s * 0.45, s * 0.55, s * 0.45, s * 0.55); fill(this.spikeColor); noStroke(); triangle(-s * 0.45, s * 0.55, -s * 0.65, s * 0.8, -s * 0.35, s * 0.7); triangle(s * 0.45, s * 0.55, s * 0.65, s * 0.8, s * 0.35, s * 0.7); triangle(0, -s * 0.9, -s * 0.15, -s * 1.1, s * 0.15, -s * 1.1); pop(); } getExplosionColor() { return this.explosionColor; } getHitColor() { return this.hitColor; } }
class TurretEnemy extends BaseEnemy { constructor(x, y) { super(x, y, 38, 3, 50, 10); if (x === undefined || y === undefined) { let edge = random(1) < 0.5 ? -1 : 1; this.pos.x = (edge < 0) ? -this.size : width + this.size; this.pos.y = random(height * 0.1, height * 0.7); this.vel.set(edge * random(-0.3, -0.05), random(-0.05, 0.05)); } else { this.vel.set(random(-0.1, 0.1), random(-0.1, 0.1)); } this.bulletSpeed = 2.5 + currentLevel * 0.05; this.fireMode = floor(random(3)); this.shootCooldown = random(180, 300); this.shootTimer = this.shootCooldown; this.patternTimer = 0; this.patternAngle = random(TWO_PI); this.burstCount = 0; this.baseColor = color(270, 60, 35); this.barrelColor = color(0, 0, 25); this.lightColor = color(330, 100, 100); this.glowColor = color(270, 70, 60, 40); this.explosionColor = color(280, 80, 95); this.hitColor = color(270, 70, 70); } update() { super.update(); if (this.pos.x < this.size * 1.5 && this.vel.x < 0) this.vel.x *= -0.2; if (this.pos.x > width - this.size * 1.5 && this.vel.x > 0) this.vel.x *= -0.2; if ((this.pos.y < this.size && this.vel.y < 0) || (this.pos.y > height - this.size && this.vel.y > 0)) { this.vel.y *= 0.5; } this.shootTimer--; if (this.shootTimer <= 0 && ship && gameState === GAME_STATE.PLAYING && !isPaused) { this.startShootingPattern(); this.shootCooldown = random(max(100, 220 - currentLevel * 7), max(160, 340 - currentLevel * 10)); this.shootTimer = this.shootCooldown; } this.updateShootingPattern(); } startShootingPattern() { this.fireMode = floor(random(3)); this.patternTimer = 0; this.patternAngle = ship ? atan2(ship.pos.y - this.pos.y, ship.pos.x - this.pos.x) : random(TWO_PI); switch (this.fireMode) { case 0: this.burstCount = 3 + floor(currentLevel / 4); this.patternTimer = 8; break; case 1: this.burstCount = 12 + currentLevel; this.patternTimer = 4; break; case 2: this.burstCount = 4 + floor(currentLevel / 3); this.patternTimer = 0; break; } } updateShootingPattern() { if (this.burstCount > 0) { this.patternTimer--; if (this.patternTimer <= 0 && ship && !isPaused) { switch (this.fireMode) { case 0: let angleToPlayer = atan2(ship.pos.y - this.pos.y, ship.pos.x - this.pos.x); enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y, angleToPlayer, this.bulletSpeed * 1.1)); this.patternTimer = 8; this.burstCount--; break; case 1: enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y, this.patternAngle, this.bulletSpeed * 0.9)); this.patternAngle += PI / (5 + currentLevel * 0.4); this.patternTimer = 4; this.burstCount--; break; case 2: let spreadArc = PI / 3.5 + (currentLevel * PI / 25); for(let i = 0; i < this.burstCount; i++) { let angle = this.patternAngle + map(i, 0, this.burstCount - 1, -spreadArc / 2, spreadArc / 2); enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y, angle, this.bulletSpeed * 1.05)); } this.burstCount = 0; break; } } } } draw() { push(); translate(this.pos.x, this.pos.y); let s = this.size; fill(this.baseColor); stroke(0, 0, 10); strokeWeight(2); beginShape(); let sides = 6; for (let i = 0; i < sides; i++) { let angle = map(i, 0, sides, 0, TWO_PI) + PI / sides; let radius = s/2 * (i%2 === 0 ? 1.0 : 0.85); vertex(cos(angle) * radius, sin(angle) * radius); } endShape(CLOSE); let aimAngle = ship ? atan2(ship.pos.y - this.pos.y, ship.pos.x - this.pos.x) : PI/2; rotate(aimAngle - PI/2); fill(this.barrelColor); stroke(0, 0, 5); strokeWeight(1.5); rect(-s * 0.15, -s * 0.5, s * 0.3, s * 0.7); let lightPulse = 1.0; let auraAlpha = 0; if (this.shootTimer < 60 || this.burstCount > 0) { lightPulse = map(sin(frameCount * 0.4), -1, 1, 0.6, 1.6); auraAlpha = map(lightPulse, 0.6, 1.6, 30, 80); } else { auraAlpha = map(sin(frameCount * 0.1), -1, 1, 10, 35); } noStroke(); fill(hue(this.glowColor), saturation(this.glowColor), brightness(this.glowColor), alpha(this.glowColor) * (auraAlpha/40)); ellipse(0, 0, s * 1.5 * lightPulse, s * 1.5 * lightPulse ); fill(this.lightColor); noStroke(); ellipse(0, s * 0.05, s * 0.2 * lightPulse, s * 0.2 * lightPulse); pop(); } getExplosionColor() { return this.explosionColor; } getHitColor() { return this.hitColor; } }
class SwarmerEnemy extends BaseEnemy { constructor(x, y) { super(x, y, 16, 1, 5, 1); if (x === undefined || y === undefined) { this._setDefaultSpawnPosition(); } this.maxSpeed = min(MAX_ENEMY_SPEED_SWARMER, 1.6 + currentLevel * 0.12); this.vel = p5.Vector.random2D().mult(this.maxSpeed); this.turnForce = 0.035 + random(0.025); this.phaseOffset = random(TWO_PI); this.bodyColor = color(130, 80, 45); this.wingColor = color(130, 60, 30, 75); this.eyeColor = color(0, 100, 90); this.explosionColor = color(140, 95, 95); this.hitColor = color(130, 100, 100); } update() { let targetY = height * 0.7; let targetX = width / 2; if(ship && !isPaused) { targetX = ship.pos.x + random(-width*0.3, width*0.3); targetY = ship.pos.y + random(30, 180); } let desired = createVector(targetX - this.pos.x, targetY - this.pos.y); desired.normalize(); desired.mult(this.maxSpeed); let wave = createVector(desired.y, -desired.x); wave.normalize(); wave.mult(sin(frameCount * 0.07 + this.phaseOffset) * this.maxSpeed * 0.65); desired.add(wave); let steer = p5.Vector.sub(desired, this.vel); steer.limit(this.turnForce); this.vel.add(steer); this.vel.limit(this.maxSpeed); this.pos.add(this.vel); } draw() { push(); translate(this.pos.x, this.pos.y); rotate(this.vel.heading() + PI / 2); let s = this.size; let wingPulse = map(sin(frameCount * 0.25 + this.phaseOffset), -1, 1, 0.7, 1.3); fill(this.wingColor); noStroke(); triangle(-s * 0.3, -s * 0.1, -s * 0.9 * wingPulse, -s * 0.5 * wingPulse, -s * 0.6 * wingPulse, s * 0.4 * wingPulse); triangle(s * 0.3, -s * 0.1, s * 0.9 * wingPulse, -s * 0.5 * wingPulse, s * 0.6 * wingPulse, s * 0.4 * wingPulse); fill(this.bodyColor); stroke(0,0,15); strokeWeight(0.5); ellipse(0, 0, s * 0.7, s); fill(this.eyeColor); noStroke(); ellipse(0, -s * 0.25, s * 0.15, s * 0.15); pop(); } getExplosionColor() { return this.explosionColor; } getHitColor() { return this.hitColor; } }
// NEW: LaserEnemy Class
class LaserEnemy extends BaseEnemy {
    constructor(x, y) {
        super(x, y, 35, 4, 60, 12); // Size, Health, Points, Money
        this.chargeTime = 100 + random(40); // Frames to charge
        this.fireDuration = 150 + random(60); // Frames laser is active
        this.cooldownTime = 180 + random(100); // Frames before next charge

        this.laserState = 'idle'; // idle, charging, firing, cooldown
        this.chargeTimer = 0;
        this.fireTimer = 0;
        this.cooldownTimer = this.cooldownTime / 2; // Start with partial cooldown

        this.laserTargetPos = null; // Stores target position when firing starts
        this.laserWidth = 10;
        this.isFiring = false;

        // Appearance
        this.bodyColor = color(0, 0, 60);
        this.accentColor = color(0, 0, 85);
        this.chargeColor = color(0, 100, 100); // Red
        this.laserColorInner = color(15, 100, 100, 95); // Bright orange/red
        this.laserColorOuter = color(0, 100, 100, 40); // Red glow

        this.explosionColor = color(10, 90, 95);
        this.hitColor = color(0, 0, 90);

        // Movement
        if (x === undefined || y === undefined) {
            this.pos.x = random(width * 0.1, width * 0.9);
            this.pos.y = random(height * 0.05, height * 0.2);
            this.vel.set(random(-MAX_ENEMY_SPEED_LASER, MAX_ENEMY_SPEED_LASER) * (random() < 0.5 ? 1 : -1), 0);
        } else {
             this.vel.set(random(-MAX_ENEMY_SPEED_LASER*0.5, MAX_ENEMY_SPEED_LASER*0.5), random(-0.1, 0.1));
        }
    }

    update() {
        // Movement
        this.pos.add(this.vel);
        if ((this.pos.x < this.size / 2 && this.vel.x < 0) || (this.pos.x > width - this.size / 2 && this.vel.x > 0)) {
            this.vel.x *= -1; // Bounce off sides
        }
         this.pos.y += sin(frameCount * 0.02 + this.pos.x * 0.01) * 0.15; // Slow vertical drift
         this.pos.y = constrain(this.pos.y, this.size/2, height * 0.3); // Keep in upper area


        // Laser State Machine
        switch (this.laserState) {
            case 'idle':
                if (this.cooldownTimer > 0) {
                    this.cooldownTimer--;
                } else if (ship && !isPaused && gameState === GAME_STATE.PLAYING) {
                    this.laserState = 'charging';
                    this.chargeTimer = this.chargeTime;
                    // play charge sound
                }
                break;

            case 'charging':
                this.chargeTimer--;
                if (this.chargeTimer <= 0 && ship) {
                    this.laserState = 'firing';
                    this.fireTimer = this.fireDuration;
                    this.laserTargetPos = ship.pos.copy(); // Aim at player's current position
                    this.isFiring = true;
                    // play fire start sound
                }
                break;

            case 'firing':
                this.fireTimer--;
                if (this.fireTimer <= 0) {
                    this.laserState = 'cooldown';
                    this.cooldownTimer = this.cooldownTime;
                    this.isFiring = false;
                    this.laserTargetPos = null;
                    // play fire end sound
                }
                // Add laser particles/effects maybe?
                if (this.isFiring && frameCount % 5 === 0) {
                     createParticles(this.pos.x, this.pos.y, 1, this.laserColorInner, 4, 0.5, 0.3);
                }
                break;

            case 'cooldown':
                this.cooldownTimer--;
                if (this.cooldownTimer <= 0) {
                    this.laserState = 'idle';
                }
                break;
        }
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);

        // Draw Body (Diamond shape)
        let s = this.size;
        fill(this.bodyColor);
        stroke(this.accentColor);
        strokeWeight(2);
        beginShape();
        vertex(0, -s / 2); // Top
        vertex(s / 2, 0);   // Right
        vertex(0, s / 2);   // Bottom
        vertex(-s / 2, 0);  // Left
        endShape(CLOSE);

        // Draw Charge / Firing Indicator
        let chargeRatio = 0;
        if (this.laserState === 'charging') {
             chargeRatio = 1.0 - (this.chargeTimer / this.chargeTime);
             let chargeSize = s * 0.4 * chargeRatio;
             let chargeAlpha = map(chargeRatio, 0, 1, 50, 100);
             let chargeBri = map(sin(frameCount * 0.3 + chargeRatio * PI), -1, 1, 80, 100);
             fill(hue(this.chargeColor), saturation(this.chargeColor), chargeBri, chargeAlpha);
             noStroke();
             ellipse(0, 0, chargeSize, chargeSize);
        } else if (this.laserState === 'firing') {
             chargeRatio = 1.0; // Full glow when firing
             let firePulse = map(sin(frameCount * 0.5), -1, 1, 0.8, 1.0);
             let chargeSize = s * 0.4 * firePulse;
             fill(hue(this.chargeColor), 90, 100, 90);
             noStroke();
             ellipse(0, 0, chargeSize, chargeSize);
        }


        pop(); // End body translate/rotate

         // Draw Laser Beam (if firing) - Draw outside the push/pop to use world coordinates
         if (this.isFiring && this.laserTargetPos) {
            let laserAngle = atan2(this.laserTargetPos.y - this.pos.y, this.laserTargetPos.x - this.pos.x);
            let beamLength = dist(this.pos.x, this.pos.y, this.laserTargetPos.x, this.laserTargetPos.y) + height; // Extend well past target point visually
            let endX = this.pos.x + cos(laserAngle) * beamLength;
            let endY = this.pos.y + sin(laserAngle) * beamLength;

            // Outer Glow
            let outerWidth = this.laserWidth * map(sin(frameCount * 0.4), -1, 1, 2.0, 3.5);
            strokeWeight(outerWidth);
            stroke(hue(this.laserColorOuter), saturation(this.laserColorOuter), brightness(this.laserColorOuter), alpha(this.laserColorOuter) * random(0.8, 1.2));
            line(this.pos.x, this.pos.y, endX, endY);

            // Inner Beam
            let innerWidth = this.laserWidth * map(sin(frameCount * 0.5 + PI/2), -1, 1, 0.8, 1.2);
            strokeWeight(innerWidth);
            stroke(hue(this.laserColorInner), saturation(this.laserColorInner), brightness(this.laserColorInner), alpha(this.laserColorInner));
             line(this.pos.x, this.pos.y, endX, endY);
        }
    }

    // Check collision between ship and laser beam (Line Segment vs Circle)
    checkLaserHit(playerShip) {
        if (!this.isFiring || !this.laserTargetPos) return false;

        let p1 = this.pos; // Start of laser
        // Calculate a far-off end point for the beam for collision detection
        let laserAngle = atan2(this.laserTargetPos.y - this.pos.y, this.laserTargetPos.x - this.pos.x);
        let beamLength = width * 2; // Assume a very long beam for collision
        let p2 = createVector(this.pos.x + cos(laserAngle) * beamLength, this.pos.y + sin(laserAngle) * beamLength);

        let c = playerShip.pos; // Center of ship
        let r = playerShip.size * 0.5; // Radius of ship's core hitbox

        // Use p5.Vector functions for cleaner math
        let laserVec = p5.Vector.sub(p2, p1);
        let pointVec = p5.Vector.sub(c, p1);
        let laserLenSq = laserVec.magSq();

        // Project pointVec onto laserVec
        let dot = pointVec.dot(laserVec);
        let t = dot / laserLenSq; // Projection parameter

        let closestPoint;
         // Clamp t to the segment [0, 1] because the laser beam is effectively a ray starting at p1
        t = constrain(t, 0, Infinity); // We only care if the closest point is *along* the ray starting from p1

        closestPoint = p5.Vector.add(p1, laserVec.mult(t)); // Closest point on the *infinite line*


        // Now check distance from ship center to this closest point
        let distToClosest = p5.Vector.dist(c, closestPoint);
        let hitRadius = r + this.laserWidth / 2; // Consider laser width

        // Finally, ensure the closest point lies *beyond* the start point of the laser (t >= 0)
        // Since we constrained t >= 0, this check is implicit if distToClosest < hitRadius
        return distToClosest < hitRadius;
    }


    getExplosionColor() { return this.explosionColor; }
    getHitColor() { return this.hitColor; }
}


class EnemyBullet { constructor(x, y, angle, speed) { this.pos = createVector(x, y); this.vel = p5.Vector.fromAngle(angle); this.vel.mult(speed); this.size = 7; this.color = color(0, 90, 100); } update() { this.pos.add(this.vel); } draw() { noStroke(); fill(hue(this.color), saturation(this.color)*0.8, brightness(this.color), 50); ellipse(this.pos.x, this.pos.y, this.size * 1.8, this.size * 1.8); fill(this.color); ellipse(this.pos.x, this.pos.y, this.size, this.size); } hitsShip(ship) { let d = dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y); let targetRadius; if (ship.invincibilityTimer > 0) targetRadius = ship.shieldVisualRadius * 1.2; else if (ship.tempShieldActive) targetRadius = ship.shieldVisualRadius * 1.1; else if (ship.shieldCharges > 0) targetRadius = ship.shieldVisualRadius; else targetRadius = ship.size * 0.5; return d < this.size * 0.6 + targetRadius; } isOffscreen() { let margin = this.size * 3; return (this.pos.y > height + margin || this.pos.y < -margin || this.pos.x < -margin || this.pos.x > width + margin); } }

// ENHANCED Nebula Class
class Nebula {
    constructor() {
        this.noiseSeedX = random(1000);
        this.noiseSeedY = random(1000);
        this.noiseScale = random(0.003, 0.008); // Controls the 'waviness'
        this.numLayers = floor(random(3, 6));
        this.rotation = random(TWO_PI);
        this.rotationSpeed = random(-0.0004, 0.0004);
        this.baseAlpha = random(2, 6); // More subtle
        this.overallWidth = random(width * 0.8, width * 1.8);
        this.overallHeight = random(height * 0.5, height * 1.0);

        if (random(1) < 0.5) {
            this.pos = createVector(random(-this.overallWidth * 0.3, -this.overallWidth * 0.1), random(height));
            this.vel = createVector(random(0.05, 0.15), random(-0.015, 0.015));
        } else {
            this.pos = createVector(random(width + this.overallWidth * 0.1, width + this.overallWidth * 0.3), random(height));
            this.vel = createVector(random(-0.15, -0.05), random(-0.015, 0.015));
        }

        let h1 = random(240, 330);
        let h2 = (h1 + random(-60, 60) + 360) % 360;
        this.color1 = color(h1, random(40, 70), random(10, 35)); // Darker base colors
        this.color2 = color(h2, random(40, 70), random(10, 35));
        this.timeOffset = random(1000); // For noise animation
    }
    update() {
        this.pos.add(this.vel);
        this.rotation += this.rotationSpeed;
    }
    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);
        noStroke();

        let currentTime = frameCount * 0.005 + this.timeOffset; // Slow animation over time

        for (let layer = 0; layer < this.numLayers; layer++) {
            let layerAlpha = this.baseAlpha * map(layer, 0, this.numLayers - 1, 1.0, 0.4);
            let layerScale = map(layer, 0, this.numLayers - 1, 1.0, 0.6);
            let layerColor = lerpColor(this.color1, this.color2, layer / (this.numLayers - 1));
            fill(hue(layerColor), saturation(layerColor), brightness(layerColor), layerAlpha);

            beginShape();
            let points = 80; // Number of vertices for the shape
            for (let i = 0; i < points; i++) {
                let angle = map(i, 0, points, 0, TWO_PI);
                // Use noise to displace the radius
                let xOff = map(cos(angle), -1, 1, 0, 5 * layerScale);
                let yOff = map(sin(angle), -1, 1, 0, 5 * layerScale);
                let noiseFactor = noise(this.noiseSeedX + xOff * this.noiseScale, this.noiseSeedY + yOff * this.noiseScale, currentTime + layer * 0.1);
                let radius = (this.overallWidth / 2) * layerScale * (0.6 + noiseFactor * 0.8); // Base radius + noise displacement
                let x = cos(angle) * radius;
                let y = sin(angle) * radius * (this.overallHeight / this.overallWidth); // Maintain aspect ratio
                vertex(x, y);
            }
            endShape(CLOSE);
        }
        pop();
    }
     isOffscreen() {
        // Use a simpler bounding box check for offscreen calculation
        let margin = max(this.overallWidth, this.overallHeight) * 1.1; // Generous margin based on dimensions
        return (this.pos.x + margin < 0 || this.pos.x - margin > width || this.pos.y + margin < 0 || this.pos.y - margin > height);
    }
}


// ENHANCED BackgroundStructure Class
class BackgroundStructure {
    constructor() {
        this.type = random() < 0.4 ? 'Derelict' : 'Station'; // More stations
        this.size = random(width * 0.15, width * 0.4);
        this.rotation = random(TWO_PI);
        this.rotationSpeed = random(-0.0005, 0.0005);
        this.noiseSeed = random(1000); // For detail generation

        // Spawn off-screen
        let edge = floor(random(4));
        if (edge === 0) this.pos = createVector(random(width), -this.size); // Top
        else if (edge === 1) this.pos = createVector(width + this.size, random(height * 0.8)); // Right (avoid bottom corner)
        else if (edge === 2) this.pos = createVector(random(width), height + this.size); // Bottom
        else this.pos = createVector(-this.size, random(height * 0.8)); // Left (avoid bottom corner)

        // Very slow drift towards opposite side
        let targetPos = createVector(width - this.pos.x + random(-width*0.2, width*0.2), height - this.pos.y + random(-height*0.2, height*0.2)); // Add some randomness to target
        this.vel = p5.Vector.sub(targetPos, this.pos).normalize().mult(random(0.05, 0.15));

        // Colors & Details based on type
        this.components = [];
        this.lights = [];
        this.initializeStructure();

        this.lightTimer = floor(random(120)); // Offset light blinking cycle
    }

    initializeStructure() {
        this.components = [];
        this.lights = [];
        let s = this.size;
        let baseColor, detailColor, lightColor;

        if (this.type === 'Station') {
            baseColor = color(0, 0, 65);
            detailColor = color(0, 0, 80);
            lightColor = color(180, 50, 100); // Cyan lights
            let highlightColor = color(0, 0, 85);

            // Central Core (maybe cylindrical)
            this.components.push({ type: 'rect', x: 0, y: 0, w: s * 0.4, h: s * 0.6, c: baseColor, rot: 0 });
            this.components.push({ type: 'rect', x: 0, y: 0, w: s * 0.6, h: s * 0.4, c: baseColor, rot: 0 }); // Cross shape
            this.components.push({ type: 'ellipse', x: 0, y: 0, w: s * 0.3, h: s * 0.3, c: detailColor });

            // Arms/Modules
            let numArms = floor(random(3, 7));
            for (let i = 0; i < numArms; i++) {
                let armAngle = TWO_PI / numArms * i + random(-PI/8, PI/8);
                let armLength = s * random(0.4, 0.8);
                let armWidth = s * random(0.1, 0.2);
                let armX = cos(armAngle) * (s * 0.3 + armLength / 2);
                let armY = sin(armAngle) * (s * 0.3 + armLength / 2);
                this.components.push({ type: 'rect', x: armX, y: armY, w: armWidth, h: armLength, c: baseColor, rot: armAngle });
                // Add details to arms
                let detailX = cos(armAngle) * (s * 0.3 + armLength * 0.8);
                let detailY = sin(armAngle) * (s * 0.3 + armLength * 0.8);
                this.components.push({ type: 'ellipse', x: detailX, y: detailY, w: armWidth * 1.1, h: armWidth * 1.1, c: detailColor });
                // Antenna
                if (random() < 0.3) {
                    let antLength = s * random(0.1, 0.3);
                    let antX1 = detailX;
                    let antY1 = detailY;
                    let antX2 = detailX + cos(armAngle + random(-PI/6, PI/6)) * antLength;
                    let antY2 = detailY + sin(armAngle + random(-PI/6, PI/6)) * antLength;
                    this.components.push({ type: 'line', x1: antX1, y1: antY1, x2: antX2, y2: antY2, c: highlightColor, weight: 1 });
                }
                // Lights on arms
                if(random() < 0.6){
                     this.lights.push({x: detailX + random(-armWidth/2, armWidth/2), y: detailY + random(-armWidth/2, armWidth/2), size: s*0.015, color: lightColor, blinkRate: random(30,90)});
                }
            }
             // Central Lights
            for(let i=0; i< 5; i++){
                 this.lights.push({x: random(-s*0.1, s*0.1), y: random(-s*0.1, s*0.1), size: s*0.01, color: color(60, 70, 100), blinkRate: 120}); // Yellowish central lights
            }


        } else { // Derelict
            baseColor = color(30, 30, 40);
            detailColor = color(20, 40, 25);
            lightColor = color(0, 80, 60); // Dim red lights
            let damageColor = color(15, 60, 30); // Rust/damage color

            // Base structure (more fragmented)
            let numFragments = floor(random(5, 12));
            for (let i = 0; i < numFragments; i++) {
                let fragAngle = random(TWO_PI);
                let fragDist = random(s * 0.1, s * 0.5);
                let fragX = cos(fragAngle) * fragDist;
                let fragY = sin(fragAngle) * fragDist;
                let fragW = s * random(0.1, 0.4);
                let fragH = s * random(0.1, 0.4);
                let fragRot = random(TWO_PI);
                this.components.push({ type: 'rect', x: fragX, y: fragY, w: fragW, h: fragH, c: baseColor, rot: fragRot });
                 // Add damage/detail panels
                if(random() < 0.5){
                    this.components.push({ type: 'rect', x: fragX + random(-fragW/3, fragW/3), y: fragY + random(-fragH/3, fragH/3), w: fragW * random(0.3, 0.7), h: fragH * random(0.3, 0.7), c: detailColor, rot: fragRot + random(-0.2, 0.2) });
                }
                 if(random() < 0.3){
                     this.components.push({ type: 'rect', x: fragX + random(-fragW/3, fragW/3), y: fragY + random(-fragH/3, fragH/3), w: fragW * random(0.1, 0.4), h: fragH * random(0.1, 0.4), c: damageColor, rot: fragRot + random(-0.3, 0.3) });
                }
                // Add broken lines/antennas
                if (random() < 0.2) {
                     let lineAngle = random(TWO_PI);
                     let lineLength = s * random(0.05, 0.2);
                     let lineX1 = fragX;
                     let lineY1 = fragY;
                     let lineX2 = fragX + cos(lineAngle) * lineLength;
                     let lineY2 = fragY + sin(lineAngle) * lineLength;
                     this.components.push({type: 'line', x1: lineX1, y1: lineY1, x2: lineX2, y2: lineY2, c: detailColor, weight: random(0.5, 1.5) });
                }
                 // Add sparse, flickering lights
                if(random() < 0.15){
                     this.lights.push({x: fragX, y: fragY, size: s*0.01, color: lightColor, blinkRate: random(80, 150), flicker: true});
                }
            }
        }
    }

    update() {
        this.pos.add(this.vel);
        this.rotation += this.rotationSpeed;
        this.lightTimer = (this.lightTimer + 1) % 180; // Longer cycle for variety
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);
        rectMode(CENTER);
        ellipseMode(CENTER);

        // Draw components
        for (let comp of this.components) {
            push();
            translate(comp.x, comp.y);
            rotate(comp.rot || 0); // Apply individual rotation if specified
            fill(comp.c);
            if (comp.type === 'rect') {
                 noStroke();
                rect(0, 0, comp.w, comp.h);
                // Simple shading
                fill(0, 0, 0, 15);
                rect(0 + comp.w * 0.1, 0 + comp.h * 0.1, comp.w * 0.8, comp.h * 0.8);
                 fill(0, 0, 100, 10);
                rect(0 - comp.w * 0.1, 0 - comp.h * 0.1, comp.w * 0.8, comp.h * 0.8);
            } else if (comp.type === 'ellipse') {
                 noStroke();
                ellipse(0, 0, comp.w, comp.h);
                // Simple shading
                fill(0, 0, 0, 15);
                ellipse(comp.w * 0.05, comp.h * 0.05, comp.w * 0.8, comp.h * 0.8);
                 fill(0, 0, 100, 10);
                ellipse(-comp.w * 0.05, -comp.h * 0.05, comp.w * 0.8, comp.h * 0.8);
            } else if (comp.type === 'line') {
                stroke(comp.c);
                strokeWeight(comp.weight || 1);
                line(0, 0, comp.x2 - comp.x1, comp.y2 - comp.y1); // Draw relative to component center
                noStroke();
            }
            pop();
        }

        // Draw lights
        noStroke();
        for(let light of this.lights){
            let blinkPhase = (this.lightTimer % light.blinkRate) / light.blinkRate; // 0 to 1
            let lightOn = false;
            if(light.flicker){
                lightOn = blinkPhase < 0.3 && random() < 0.7; // Flicker effect
            } else {
                lightOn = blinkPhase < 0.5; // Standard blink
            }

            if(lightOn){
                fill(light.color);
                ellipse(light.x, light.y, light.size, light.size);
            }
        }

        pop();
    }

    isOffscreen() {
        let margin = this.size * 1.5; // Generous margin
        return (this.pos.x < -margin || this.pos.x > width + margin || this.pos.y < -margin || this.pos.y > height + margin);
    }
}
