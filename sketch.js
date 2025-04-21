// --- Game Configuration ---
const GRAVITY = 0.6;
const JUMP_FORCE = -13;
const DOUBLE_JUMP_FORCE = -12;
const JUMP_BOOST_FACTOR = 1.3;
const VARIABLE_JUMP_CUTOFF = -4;
const MAX_FALL_SPEED = 12;
const MOVE_SPEED = 5.5;
const BOOST_SPEED_MULTIPLIER = 1.8;
const BOOST_DURATION = 300;
const INVINCIBILITY_DURATION = 480;
const JUMP_BOOST_DURATION = 420;
const FRICTION = 0.85;
const PLAYER_SIZE = 40;
const PILL_SIZE = 22;
const ENEMY_SIZE = 40;
const SHOOTING_ENEMY_SIZE = 35;
const SPIKY_ENEMY_SIZE = 38;
const POWERUP_SIZE = 22;
const GROUND_HEIGHT = 40;
const JUMP_COOLDOWN = 8;
const MAX_LEVELS = 12;

// --- NEW: Upgrade Configuration ---
const BASE_MAX_HEALTH = 3;
const HEALTH_INCREASE_PER_LEVEL = 1;
const SPEED_INCREASE_PER_LEVEL = 0.7;
const JUMP_FORCE_INCREASE_PER_LEVEL = -0.8; // Negative increase for negative force

const upgradeMaxLevels = {
    health: 3, // Max health = BASE + 3*INCREASE = 6
    speed: 4,  // Max speed = BASE + 4*INCREASE = 5.5 + 2.8 = 8.3
    jump: 3    // Max jump = BASE + 3*INCREASE = -13 + (-2.4) = -15.4
};

// --- Game State ---
let player;
let platforms = [];
let collectiblePills = [];
let enemies = [];
let powerUps = [];
let enemyBullets = [];
let particles = [];
let stars = [];
let terminal;
let score = 0; // Acts as Currency now
let currentLevel = 1;
let cameraX = 0;
let levelWidth = 3500;
let levelHeight = 600;
let backgroundShift = 0;
let gameState = 'playing'; // 'playing', 'upgrade', 'gameOver', 'win'
let upgradeMenu; // Object to hold upgrade menu state/buttons

// --- NEW: Upgrade State ---
let upgradeLevels = { health: 0, speed: 0, jump: 0 };

// --- Touch Controls State ---
let isTouchingLeft = false;
let isTouchingRight = false;
let touchStartX = null;

// --- Color Palette ---
// ... (Colors remain the same) ...
let bgColorTop, bgColorBottom;
let playerColor, playerOutlineColor, playerGlowColor;
let platformColorMain, platformHighlightColor;
let pillColor1, pillColor2, pillShineColor;
let enemyColor, enemyPulseColor;
let shootingEnemyColor, shootingEnemyChargeColor;
let spikyEnemyColor, spikyEnemySpikeColor;
let powerUpSpeedColor, powerUpInvincibilityColor, powerUpJumpColor, powerUpOutlineColor;
let terminalColor, terminalScreenColor, terminalHighlightColor;
let particleColor;
let enemyBulletColor;
let touchOverlayColor;
let scoreColor, scoreOutlineColor;
let levelTextColor, levelTextOutlineColor;
let healthColor, healthBgColor, healthOutlineColor; // Health UI colors
let menuBgColor, menuTextColor, menuButtonColor, menuButtonHoverColor, menuButtonDisabledColor; // Menu colors


// --- Screen Shake ---
let screenShakeIntensity = 0;
let screenShakeDuration = 0;

// --- Player Effects ---
let speedBoostTimer = 0;
let invincibilityTimer = 0;
let jumpBoostTimer = 0;
let playerTrail = [];
const TRAIL_LENGTH = 12;

// --- Setup ---
function setup() {
    createCanvas(windowWidth, windowHeight);
    // Define colors
    bgColorTop = color(15, 15, 35); bgColorBottom = color(30, 30, 60);
    playerColor = color(0, 220, 220); playerOutlineColor = color(230, 255, 255); playerGlowColor = color(0, 255, 255, 80);
    platformColorMain = color(180, 180, 200); platformHighlightColor = color(230, 230, 240);
    pillColor1 = color(80, 230, 80); pillColor2 = color(255, 255, 100); pillShineColor = color(255, 255, 255, 200);
    enemyColor = color(240, 0, 90); enemyPulseColor = color(255, 50, 120);
    shootingEnemyColor = color(230, 90, 0); shootingEnemyChargeColor = color(255, 150, 0);
    spikyEnemyColor = color(150, 50, 200); spikyEnemySpikeColor = color(200, 150, 255);
    powerUpSpeedColor = color(0, 255, 255, 220); powerUpInvincibilityColor = color(255, 255, 255);
    powerUpJumpColor = color(100, 255, 100, 220);
    powerUpOutlineColor = color(255, 223, 0);
    terminalColor = color(0, 200, 0); terminalScreenColor = color(0, 50, 0, 220); terminalHighlightColor = color(100, 255, 100);
    particleColor = color(255, 255, 255, 180); enemyBulletColor = color(255, 20, 20);
    touchOverlayColor = color(255, 255, 255, 35); scoreColor = color(255, 255, 255); scoreOutlineColor = color(0, 0, 0, 150);
    levelTextColor = color(220, 220, 255); levelTextOutlineColor = color(0, 0, 0, 150);
    healthColor = color(255, 50, 50); healthBgColor = color(50, 50, 50, 150); healthOutlineColor = color(255, 255, 255, 180);
    menuBgColor = color(20, 20, 40, 230); menuTextColor = color(230, 230, 255);
    menuButtonColor = color(80, 80, 150, 200); menuButtonHoverColor = color(120, 120, 200, 220); menuButtonDisabledColor = color(60, 60, 80, 150);


    levelHeight = height - GROUND_HEIGHT;
    player = new Player(100, levelHeight - PLAYER_SIZE * 2);
    player.applyUpgrades(); // Apply initial (level 0) upgrades
    createStarfield(180);
    createLevel(currentLevel);
    upgradeMenu = new UpgradeMenu(); // Initialize the menu object
}

// --- Main Draw Loop ---
function draw() {
    // Background and Parallax are drawn regardless of state
    drawAnimatedBackground();
    handleTouchInput(); // Keep handling touch to update state even in menu
    drawParallaxBackground();

    // State-dependent drawing
    switch (gameState) {
        case 'playing':
            drawGame();
            break;
        case 'upgrade':
            drawGame(); // Draw the paused game behind the menu
            upgradeMenu.display();
            break;
        case 'gameOver':
            drawGame(); // Draw the final game state
            drawGameOverScreen();
            break;
        case 'win':
            drawGame(); // Draw the final game state
            drawWinScreen();
            break;
    }

    // Draw UI on top (Score, Level, Health) - Except maybe full screen win/lose
    if (gameState === 'playing' || gameState === 'upgrade') {
        drawUI();
    }
}

// --- Draw Game Elements (Called when playing or paused for upgrade) ---
function drawGame() {
    // --- Camera Translation ---
    let targetCameraX = player.pos.x - width / 3;
    targetCameraX = constrain(targetCameraX, 0, levelWidth - width);
    cameraX = lerp(cameraX, targetCameraX, 0.1);

    // Apply Screen Shake & Camera Translation
    push();
    applyScreenShake();
    translate(-cameraX, 0);

    // Update and Draw Game Elements (Only update if 'playing')
    let shouldUpdate = (gameState === 'playing');

    for (let p of platforms) { if (shouldUpdate && typeof p.update === 'function') p.update(); p.display(); }
    for (let i = particles.length - 1; i >= 0; i--) { if (shouldUpdate) particles[i].update(); particles[i].display(); if (particles[i].isDead()) particles.splice(i, 1); }
    for (let i = collectiblePills.length - 1; i >= 0; i--) { collectiblePills[i].display(); if (shouldUpdate && player.collidesWith(collectiblePills[i])) { score += 10; collectiblePills.splice(i, 1); /* playSound('collect'); */ } }
    for (let i = powerUps.length - 1; i >= 0; i--) { powerUps[i].display(); if (shouldUpdate && player.collidesWith(powerUps[i])) { activatePowerUp(powerUps[i].type); powerUps.splice(i, 1); /* playSound('powerup'); */ } }
    for (let i = enemies.length - 1; i >= 0; i--) { if (shouldUpdate) enemies[i].update(platforms, height - GROUND_HEIGHT, player.pos); enemies[i].display(); if (shouldUpdate) handleEnemyCollisions(i); }
    for (let i = enemyBullets.length - 1; i >= 0; i--) { if (shouldUpdate) enemyBullets[i].update(); enemyBullets[i].display(); if (shouldUpdate) handleEnemyBulletCollisions(i); }
    if (terminal) { terminal.display(); if (shouldUpdate) handleTerminalCollision(); }

    // Update Player State (Only if 'playing')
    if (shouldUpdate) {
        updatePowerUpTimers();
        player.handleInput();
        player.update(platforms, height);
    }
    player.display(); // Always display player
    drawPlayerTrail(); // Always display trail

    pop(); // End camera and screen shake transformations
}


// --- Player Class ---
class Player {
    constructor(x, y) {
        this.pos = createVector(x, y); this.vel = createVector(0, 0); this.acc = createVector(0, 0);
        this.size = PLAYER_SIZE; this.isGrounded = false; this.jumpHeld = false; this.canVariableJump = false;
        // Base stats are set by constants, effective stats are calculated
        this.effectiveMoveSpeed = MOVE_SPEED;
        this.effectiveJumpForce = JUMP_FORCE;
        this.effectiveDoubleJumpForce = DOUBLE_JUMP_FORCE;
        this.boostActive = false; this.invincibilityTimer = 0;
        this.jumpBoostTimer = 0;
        this.jumpsAvailable = 2; this.jumpCooldownTimer = 0; this.squash = 1; this.stretch = 1;
        this.landTimer = 0; this.jumpTimer = 0;
        // Health
        this.maxHealth = BASE_MAX_HEALTH;
        this.currentHealth = this.maxHealth;
        this.isInvulnerable = false; // Short invulnerability after getting hit
        this.invulnerableTimer = 0;
        this.invulnerableDuration = 90; // 1.5 seconds
    }

    // Call this after upgrades are purchased or game starts
    applyUpgrades() {
        this.maxHealth = BASE_MAX_HEALTH + upgradeLevels.health * HEALTH_INCREASE_PER_LEVEL;
        // Heal player to new max if they have less health, but don't exceed new max
        this.currentHealth = min(this.currentHealth, this.maxHealth);

        this.effectiveMoveSpeed = MOVE_SPEED + upgradeLevels.speed * SPEED_INCREASE_PER_LEVEL;
        this.effectiveJumpForce = JUMP_FORCE + upgradeLevels.jump * JUMP_FORCE_INCREASE_PER_LEVEL;
        // Scale double jump proportionally, maybe slightly less increase
        this.effectiveDoubleJumpForce = DOUBLE_JUMP_FORCE + upgradeLevels.jump * JUMP_FORCE_INCREASE_PER_LEVEL * 0.9;
         console.log("Upgrades Applied:", "HP:", this.maxHealth, "Speed:", this.effectiveMoveSpeed, "Jump:", this.effectiveJumpForce);
    }

    applyForce(force) { this.acc.add(force); }

    handleInput() {
        let currentSpeed = this.boostActive ? this.effectiveMoveSpeed * BOOST_SPEED_MULTIPLIER : this.effectiveMoveSpeed;
        let moveRequest = 0;
        if (keyIsDown(LEFT_ARROW) || keyIsDown(65) || isTouchingLeft) moveRequest = -1;
        else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68) || isTouchingRight) moveRequest = 1;
        if (moveRequest !== 0) this.vel.x = moveRequest * currentSpeed; // Use effective speed
        else { this.vel.x *= FRICTION; if (abs(this.vel.x) < 0.1) this.vel.x = 0; }
        this.jumpHeld = keyIsDown(UP_ARROW) || keyIsDown(87) || keyIsDown(32);
        if (!this.jumpHeld && this.canVariableJump && this.vel.y < VARIABLE_JUMP_CUTOFF) { this.vel.y = VARIABLE_JUMP_CUTOFF; this.canVariableJump = false; }
    }

    jump() {
        if (this.jumpsAvailable > 0 && this.jumpCooldownTimer <= 0) {
            // Use effective jump forces
            let baseForce = (this.jumpsAvailable === 2) ? this.effectiveJumpForce : this.effectiveDoubleJumpForce;
            let finalForce = (this.jumpBoostTimer > 0) ? baseForce * JUMP_BOOST_FACTOR : baseForce;

            this.vel.y = finalForce;
            this.isGrounded = false; this.canVariableJump = true;
            this.jumpTimer = 10; this.jumpsAvailable--; this.jumpCooldownTimer = JUMP_COOLDOWN;
            let particleCount = (this.jumpsAvailable === 0) ? 15 : 10;
            let particleSpeed = (this.jumpsAvailable === 0) ? 1.3 : 0.9;
            if (this.jumpBoostTimer > 0) { particleCount += 5; particleSpeed *= 1.2; }
            createParticles(this.pos.x, this.pos.y + this.size / 2, particleCount, particleColor, particleSpeed, 50);
            // playSound('jump');
        }
    }

    update(platforms, canvasHeight) {
        let wasGrounded = this.isGrounded;
        if (this.jumpCooldownTimer > 0) this.jumpCooldownTimer--;
        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer--;
            this.isInvulnerable = (this.invulnerableTimer > 0);
        }

        this.applyForce(createVector(0, GRAVITY));
        this.vel.add(this.acc);
        this.vel.y = constrain(this.vel.y, -Infinity, MAX_FALL_SPEED);
        this.acc.mult(0);
        let nextPos = p5.Vector.add(this.pos, this.vel);
        this.isGrounded = false; let landingPlatform = null;
        // Platform Collision (Vertical / Landing)
        for (let p of platforms) { if (nextPos.x + this.size / 2 > p.x && nextPos.x - this.size / 2 < p.x + p.w && nextPos.y + this.size / 2 >= p.y && this.pos.y + this.size / 2 <= p.y + 1) { this.isGrounded = true; this.vel.y = 0; this.pos.y = p.y - this.size / 2; nextPos.y = this.pos.y; this.canVariableJump = false; this.jumpsAvailable = 2; if (p instanceof MovingPlatform) landingPlatform = p; break; } }
        // Platform Collision (Horizontal / Ceiling)
        if (!this.isGrounded) { for (let p of platforms) { if (nextPos.y + this.size / 2 > p.y && nextPos.y - this.size / 2 < p.y + p.h && nextPos.x + this.size / 2 > p.x && nextPos.x - this.size / 2 < p.x + p.w) { if (this.vel.y < 0 && nextPos.y - this.size/2 <= p.y + p.h && this.pos.y - this.size/2 >= p.y + p.h) { this.vel.y = 0; this.pos.y = p.y + p.h + this.size/2; nextPos.y = this.pos.y; this.canVariableJump = false; } else if (this.vel.y >= 0) { if (this.vel.x > 0 && this.pos.x + this.size / 2 <= p.x) { this.vel.x = 0; this.pos.x = p.x - this.size / 2 - 0.1; nextPos.x = this.pos.x; } else if (this.vel.x < 0 && this.pos.x - this.size / 2 >= p.x + p.w) { this.vel.x = 0; this.pos.x = p.x + p.w + this.size / 2 + 0.1; nextPos.x = this.pos.x; } } } } }
        // Boundary Check (Absolute Bottom) - Lethal Pitfall!
        const absoluteGroundY = canvasHeight + this.size; // A bit below screen
        if (nextPos.y >= absoluteGroundY) {
             this.takeDamage(this.maxHealth); // Instant death for falling in pit
             return; // Stop update processing after death
        }

        // Apply Moving Platform Velocity
        if (this.isGrounded && landingPlatform) this.pos.x += landingPlatform.speed * landingPlatform.direction;
        // Update final position
        this.pos.x += this.vel.x; this.pos.y = nextPos.y;
        // Landing Animation Trigger
        if (this.isGrounded && !wasGrounded && this.vel.y >= 0) { this.landTimer = 10; createParticles(this.pos.x, this.pos.y + this.size / 2, 8, particleColor, 0.7, 30); /* playSound('land'); */ }
        // Update Animation Timers
        if (this.landTimer > 0) this.landTimer--; if (this.jumpTimer > 0) this.jumpTimer--;
        // Player Trail Update
        if (this.boostActive) { playerTrail.push(this.pos.copy()); if (playerTrail.length > TRAIL_LENGTH) playerTrail.shift(); } else { if (playerTrail.length > 0) playerTrail.shift(); }
    }

    display() {
        // Flash slightly if temporarily invulnerable after hit
        if (this.isInvulnerable && frameCount % 10 < 5) {
             // Optionally return to skip drawing entirely for a stronger flash
        }
        // Flash more intensely if game invincibility power-up is active
        if (invincibilityTimer > 0 && frameCount % 8 < 4) return;

        push();
        translate(this.pos.x, this.pos.y);
        let targetSquash = 1.0, targetStretch = 1.0;
        if (this.landTimer > 0) { targetSquash = lerp(1.0, 1.3, this.landTimer / 10); targetStretch = lerp(1.0, 0.7, this.landTimer / 10); }
        else if (this.jumpTimer > 0) { targetSquash = lerp(1.0, 0.8, this.jumpTimer / 10); targetStretch = lerp(1.0, 1.2, this.jumpTimer / 10); }
        else if (!this.isGrounded) { targetStretch = 1.05; targetSquash = 0.95; }
        this.squash = lerp(this.squash, targetSquash, 0.25); this.stretch = lerp(this.stretch, targetStretch, 0.25);

        let glowSize = 0; let currentGlowColor = playerGlowColor;
        if (this.boostActive) glowSize = 15;
        if (invincibilityTimer > 0) { glowSize = 25 + sin(frameCount * 0.3) * 5; currentGlowColor = color(255, 255, 150, 120); }
        if (this.jumpBoostTimer > 0) { glowSize = max(glowSize, 20 + sin(frameCount * 0.25) * 4); let jumpGlow = color(100, 255, 100, 100); currentGlowColor = (invincibilityTimer > 0) ? lerpColor(currentGlowColor, jumpGlow, 0.5) : jumpGlow; }
        if (this.isInvulnerable) { // Add subtle glow for post-hit invulnerability
            glowSize = max(glowSize, 10 + sin(frameCount * 0.4) * 3);
            let hitGlow = color(255, 100, 100, 90);
             currentGlowColor = (invincibilityTimer > 0 || this.jumpBoostTimer > 0) ? lerpColor(currentGlowColor, hitGlow, 0.3) : hitGlow;
        }

        if (glowSize > 0) { drawingContext.shadowBlur = glowSize; drawingContext.shadowColor = currentGlowColor.toString(); }

        scale(this.squash, this.stretch); strokeWeight(1.5); stroke(playerOutlineColor); fill(playerColor); ellipse(0, 0, this.size, this.size);
        drawingContext.shadowBlur = 0;
        let eyeXOffset = constrain(this.vel.x * 0.8, -this.size * 0.15, this.size * 0.15); let eyeYOffset = -this.size * 0.1;
        fill(255); noStroke(); ellipse(eyeXOffset, eyeYOffset, this.size * 0.25, this.size * 0.3);
        fill(0); ellipse(eyeXOffset + constrain(this.vel.x * 0.5, -this.size * 0.05, this.size * 0.05), eyeYOffset + this.size * 0.03, this.size * 0.1);
        pop();
    }

    collidesWith(item) {
        // ... (collision logic mostly same, check item exists) ...
        if (!item) return false; if (item instanceof Platform) return false;
        else if (item instanceof CollectiblePill || item instanceof Terminal || item instanceof PowerUp || item instanceof EnemyBullet) {
            let itemX = item.pos ? item.pos.x : item.x; let itemY = item.pos ? item.pos.y : item.y;
            let itemW = item.size || item.w || 0; let itemH = item.size || item.h || 0;
            let itemIsCircle = (item instanceof CollectiblePill || item instanceof EnemyBullet || item instanceof PowerUp) || (!item.w || !item.h || item.w === item.h);
            if (itemIsCircle) { let d = dist(this.pos.x, this.pos.y, itemX, itemY); return d < this.size / 2 + (item.size || itemW) / 2; }
            else { let closestX = constrain(this.pos.x, item.x, item.x + item.w); let closestY = constrain(this.pos.y, item.y, item.y + item.h); let dSq = pow(this.pos.x - closestX, 2) + pow(this.pos.y - closestY, 2); return dSq < pow(this.size / 2, 2); }
        } return false;
    }

    collidesWithEnemy(enemy) {
        // ... (collision logic same) ...
        let playerBottom = this.pos.y + this.size * this.stretch / 2; let playerTop = this.pos.y - this.size * this.stretch / 2;
        let playerLeft = this.pos.x - this.size * this.squash / 2; let playerRight = this.pos.x + this.size * this.squash / 2;
        let enemyTop = enemy.pos.y - enemy.size / 2; let enemyBottom = enemy.pos.y + enemy.size / 2;
        let enemyLeft = enemy.pos.x - enemy.size / 2; let enemyRight = enemy.pos.x + enemy.size / 2;
        if (playerRight < enemyLeft || playerLeft > enemyRight || playerBottom < enemyTop || playerTop > enemyBottom) return null;
        let vThreshold = 8;
        if ( this.vel.y >= 0 && playerBottom >= enemyTop && playerBottom <= enemyTop + vThreshold + abs(this.vel.y * 0.5) && playerRight > enemyLeft + 5 && playerLeft < enemyRight - 5 ) {
            if (enemy instanceof SpikyEnemy) return 'side'; else return 'stomp';
        } else { return 'side'; }
    }

    takeDamage(amount) {
        if (this.isInvulnerable || invincibilityTimer > 0) return; // Can't take damage if already invulnerable

        this.currentHealth -= amount;
        this.isInvulnerable = true;
        this.invulnerableTimer = this.invulnerableDuration;
        triggerScreenShake(6, 15);
        createParticles(this.pos.x, this.pos.y, 15, playerColor, 1.2, 30);
        /* playSound('hurt'); */

        if (this.currentHealth <= 0) {
            this.die();
        }
    }

    die() {
        console.log("Player Died!");
        // Option 1: Reset Level (Lose progress on level, keep upgrades/score)
        // this.resetLevelState();

        // Option 2: Game Over (Reset everything)
        gameState = 'gameOver';
        // Potentially save high score here if score != currency
    }

    // Resets player state for the *start* of a level or after death (if not game over)
    resetLevelState() {
        this.pos.set(100, levelHeight - PLAYER_SIZE * 2);
        this.vel.set(0, 0);
        this.acc.set(0, 0);
        this.isGrounded = false;
        this.canVariableJump = false;
        this.squash = 1; this.stretch = 1;
        this.landTimer = 0; this.jumpTimer = 0;
        this.boostActive = false; speedBoostTimer = 0;
        this.invincibilityTimer = 0; invincibilityTimer = 0; // Reset power-up invincibility
        this.jumpBoostTimer = 0;
        playerTrail = [];
        this.jumpsAvailable = 2;
        this.jumpCooldownTimer = 0;
        this.currentHealth = this.maxHealth; // Restore health fully
        this.isInvulnerable = false; // Not invulnerable on reset
        this.invulnerableTimer = 0;
        cameraX = 0; // Reset camera too
    }

    // Resets everything for a brand new game
    fullReset() {
        this.resetLevelState(); // Start with level state
        upgradeLevels = { health: 0, speed: 0, jump: 0 }; // Reset upgrades
        score = 0; // Reset score/currency
        this.applyUpgrades(); // Apply base stats
    }
}

// --- Platform, MovingPlatform, CollectiblePill Classes ---
// ... (Remain the same as before) ...
class Platform { constructor(x, y, w, h) { this.x = x; this.y = y; this.w = w; this.h = h; } display() { push(); fill(platformColorMain); noStroke(); rect(this.x, this.y, this.w, this.h, 3); fill(platformHighlightColor); rect(this.x, this.y, this.w, 4, 3); pop(); } }
class MovingPlatform extends Platform { constructor(x, y, w, h, range, speed, moveHorizontal = true) { super(x, y, w, h); this.startX = x; this.startY = y; this.range = range; this.speed = speed; this.direction = 1; this.moveHorizontal = moveHorizontal; } update() { if (this.moveHorizontal) { this.x += this.speed * this.direction; if (abs(this.x - this.startX) >= this.range / 2) { this.direction *= -1; this.x = constrain(this.x, this.startX - this.range / 2, this.startX + this.range / 2); } } else { this.y += this.speed * this.direction; if (abs(this.y - this.startY) >= this.range / 2) { this.direction *= -1; this.y = constrain(this.y, this.startY - this.range / 2, this.startY + this.range / 2); } } } }
class CollectiblePill { constructor(x, y) { this.pos = createVector(x,y); this.size = PILL_SIZE; this.pillHeight = this.size; this.pillWidth = this.size * 0.6; this.bobOffset = random(TWO_PI); this.bobSpeed = 0.05; this.bobAmount = 3; this.shineOffset = random(TWO_PI); this.shineSpeed = 0.08; } display() { let bob = sin(frameCount * this.bobSpeed + this.bobOffset) * this.bobAmount; let shinePos = sin(frameCount * this.shineSpeed + this.shineOffset) * (this.pillHeight * 0.3); push(); translate(this.pos.x, this.pos.y + bob); rectMode(CENTER); noStroke(); fill(pillColor1); arc(0, -this.pillHeight / 2, this.pillWidth, this.pillWidth, PI, TWO_PI); rect(0, -this.pillHeight / 4, this.pillWidth, this.pillHeight / 2); fill(pillColor2); arc(0, this.pillHeight / 2, this.pillWidth, this.pillWidth, 0, PI); rect(0, this.pillHeight / 4, this.pillWidth, this.pillHeight / 2); fill(pillShineColor); ellipse(0, shinePos - this.pillHeight * 0.1, this.pillWidth * 0.3, this.pillHeight * 0.15); rectMode(CORNER); pop(); } }


// --- Enemy Classes (Enemy, ShootingEnemy, SpikyEnemy) ---
// ... (Remain the same as before) ...
class Enemy { constructor(x, y, range) { this.pos = createVector(x, y); this.vel = createVector(random([-1, 1]), 0); this.speed = 1; this.size = ENEMY_SIZE; this.w = this.size; this.h = this.size; this.startX = x; this.patrolRange = range; this.isGrounded = false; this.pulseOffset = random(TWO_PI); this.pulseSpeed = 0.06; } update(platforms, groundY, playerPos) { this.pos.x += this.vel.x * this.speed; if (abs(this.pos.x - this.startX) >= this.patrolRange / 2) { this.vel.x *= -1; this.pos.x = constrain(this.pos.x, this.startX - this.patrolRange / 2, this.startX + this.patrolRange / 2); } this.pos.y += GRAVITY * 1.5; this.isGrounded = false; for (let p of platforms) { if (this.pos.x + this.size / 2 > p.x && this.pos.x - this.size / 2 < p.x + p.w && this.pos.y + this.size / 2 >= p.y && this.pos.y + this.size/2 < p.y + 15) { this.isGrounded = true; this.pos.y = p.y - this.size / 2; this.vel.y = 0; break; } } if (!this.isGrounded && this.pos.y + this.size / 2 >= groundY) { this.isGrounded = true; this.pos.y = groundY - this.size / 2; this.vel.y = 0; } } display() { let pulseFactor = map(sin(frameCount * this.pulseSpeed + this.pulseOffset), -1, 1, 0.95, 1.05); let currentEnemyColor = lerpColor(enemyColor, enemyPulseColor, (pulseFactor - 0.95) / 0.1); push(); translate(this.pos.x, this.pos.y); scale(pulseFactor); stroke(0, 150); strokeWeight(1); fill(currentEnemyColor); triangle( -this.size/2, this.size/2, this.size/2, this.size/2, 0, -this.size/2 ); fill(255); noStroke(); ellipse(0, -this.size * 0.1, this.size * 0.2); fill(0); ellipse(constrain(this.vel.x * 2, -this.size * 0.04, this.size * 0.04), -this.size * 0.08, this.size * 0.08); pop(); } }
class ShootingEnemy extends Enemy { constructor(x, y, range) { super(x, y, range); this.size = SHOOTING_ENEMY_SIZE; this.w = this.size; this.h = this.size; this.speed = 0.5; this.shootCooldown = 120; this.shootTimer = random(20, this.shootCooldown); this.chargeDuration = 30; this.chargeTimer = 0; } update(platforms, groundY, playerPos) { super.update(platforms, groundY, playerPos); if (this.chargeTimer > 0) { this.chargeTimer--; } else { this.shootTimer--; if (this.shootTimer <= 0 && abs(playerPos.x - this.pos.x) < width * 0.7 && abs(playerPos.y - this.pos.y) < height * 0.8) { this.chargeTimer = this.chargeDuration; this.shootTimer = this.shootCooldown + random(-15, 15); /* playSound('enemyCharge'); */ } } if (this.chargeTimer === 1) { this.shoot(playerPos); } } shoot(playerPos) { let angleToPlayer = atan2(playerPos.y - this.pos.y, playerPos.x - this.pos.x); let bulletX = this.pos.x + cos(angleToPlayer) * this.size / 2; let bulletY = this.pos.y + sin(angleToPlayer) * this.size / 2; enemyBullets.push(new EnemyBullet(bulletX, bulletY, angleToPlayer, 4.5)); /* playSound('enemyShoot'); */ } display() { let currentShootingColor = shootingEnemyColor; let chargeScale = 1.0; if (this.chargeTimer > 0) { let chargeProgress = 1.0 - (this.chargeTimer / this.chargeDuration); currentShootingColor = lerpColor(shootingEnemyColor, shootingEnemyChargeColor, chargeProgress); chargeScale = lerp(1.0, 1.15, sin(chargeProgress * PI)); } push(); translate(this.pos.x, this.pos.y); scale(chargeScale); stroke(0, 150); strokeWeight(1); fill(currentShootingColor); rectMode(CENTER); rect(0, 0, this.size, this.size, 4); fill(lerpColor(color(50), color(255,0,0), chargeScale - 1.0)); rect(0, this.size * 0.4, this.size * 0.3, this.size * 0.4); rectMode(CORNER); pop(); } }
class SpikyEnemy extends Enemy { constructor(x, y, range) { super(x, y, range); this.size = SPIKY_ENEMY_SIZE; this.w = this.size; this.h = this.size; this.speed = 0.8; this.spikeCount = 8; this.spikeLength = this.size * 0.4; this.rotation = random(TWO_PI); this.rotationSpeed = this.vel.x * 0.02; } update(platforms, groundY, playerPos) { super.update(platforms, groundY, playerPos); this.rotationSpeed = this.vel.x * 0.02; } display() { this.rotation += this.rotationSpeed; push(); translate(this.pos.x, this.pos.y); rotate(this.rotation); fill(spikyEnemySpikeColor); stroke(spikyEnemyColor); strokeWeight(1); for (let i = 0; i < this.spikeCount; i++) { let angle = TWO_PI / this.spikeCount * i; let x2 = cos(angle) * (this.size * 0.5 + this.spikeLength); let y2 = sin(angle) * (this.size * 0.5 + this.spikeLength); let angleOffset = PI / this.spikeCount * 0.7; let x3 = cos(angle - angleOffset) * this.size * 0.45; let y3 = sin(angle - angleOffset) * this.size * 0.45; let x4 = cos(angle + angleOffset) * this.size * 0.45; let y4 = sin(angle + angleOffset) * this.size * 0.45; triangle(x3, y3, x2, y2, x4, y4); } fill(spikyEnemyColor); stroke(0, 150); strokeWeight(1.5); ellipse(0, 0, this.size * 0.9, this.size * 0.9); push(); rotate(-this.rotation); fill(255); noStroke(); ellipse(0, -this.size * 0.1, this.size * 0.3); fill(255, 0, 0); let pupilXOffset = constrain(this.vel.x * 3, -this.size * 0.06, this.size * 0.06); ellipse(pupilXOffset, -this.size * 0.08, this.size * 0.15); pop(); pop(); } }


// --- EnemyBullet, PowerUp, Terminal, Particle Classes ---
// ... (Remain the same as before) ...
class EnemyBullet { constructor(x, y, angle, speed) { this.pos = createVector(x, y); this.vel = p5.Vector.fromAngle(angle).mult(speed); this.size = 9; this.w = this.size; this.h = this.size; this.trail = []; this.trailLength = 5; } update() { this.trail.push(this.pos.copy()); if (this.trail.length > this.trailLength) this.trail.shift(); this.pos.add(this.vel); } display() { for(let i = 0; i < this.trail.length; i++) { let alpha = map(i, 0, this.trail.length - 1, 0, 100); let trailSize = map(i, 0, this.trail.length - 1, 1, this.size * 0.8); fill(255, 50 + i * 10, 50 + i * 10, alpha); noStroke(); ellipse(this.trail[i].x, this.trail[i].y, trailSize); } fill(enemyBulletColor); stroke(255, 150, 150); strokeWeight(1); ellipse(this.pos.x, this.pos.y, this.size, this.size); } isOffScreen() { return (this.pos.y > height + 50 || this.pos.y < -50 || this.pos.x < cameraX - 50 || this.pos.x > cameraX + width + 50); } }
class PowerUp { constructor(x, y, type = 'speed') { this.pos = createVector(x, y); this.type = type; this.size = POWERUP_SIZE; this.w = this.size; this.h = this.size; this.angle = 0; this.rotationSpeed = (type === 'invincibility' ? 0.05 : (type === 'jump' ? 0.04 : 0.03)); this.pulseOffset = random(TWO_PI); this.pulseSpeed = 0.15; this.bobOffset = random(TWO_PI); this.bobSpeed = 0.06; this.bobAmount = 4; } display() { this.angle += this.rotationSpeed; let pulse = 1.0 + sin(frameCount * this.pulseSpeed + this.pulseOffset) * 0.1; let bob = sin(frameCount * this.bobSpeed + this.bobOffset) * this.bobAmount; push(); translate(this.pos.x, this.pos.y + bob); rotate(this.angle); scale(pulse); strokeWeight(1.5); if (this.type === 'speed') { stroke(200, 255, 255); fill(powerUpSpeedColor); beginShape(); vertex(0, -this.size / 2); vertex(this.size / 2, 0); vertex(0, this.size / 2); vertex(-this.size / 2, 0); endShape(CLOSE); fill(255, 255, 255, 200); noStroke(); ellipse(0, 0, this.size * 0.3); } else if (this.type === 'invincibility') { let starSize = this.size * 1.1; fill(powerUpInvincibilityColor); stroke(powerUpOutlineColor); beginShape(); for (let i = 0; i < 5; i++) { let a1 = TWO_PI * i / 5 - HALF_PI; vertex(cos(a1) * starSize / 2, sin(a1) * starSize / 2); let a2 = a1 + TWO_PI / 10; vertex(cos(a2) * starSize / 4, sin(a2) * starSize / 4); } endShape(CLOSE); fill(255, 255, 150, 150 + sin(frameCount*0.2 + this.pulseOffset)*50); noStroke(); ellipse(0,0, starSize * 0.3); } else if (this.type === 'jump') { stroke(50, 200, 50); fill(powerUpJumpColor); rectMode(CENTER); rect(0, this.size * 0.1, this.size * 0.6, this.size * 0.2, 2); rect(0, -this.size * 0.1, this.size * 0.4, this.size * 0.2, 2); rect(0, -this.size * 0.3, this.size * 0.2, this.size * 0.2, 2); fill(255); noStroke(); triangle(0, -this.size*0.5, -this.size*0.15, -this.size*0.35, this.size*0.15, -this.size*0.35); rectMode(CORNER); } pop(); } }
class Terminal { constructor(x, y) { this.x = x; this.y = y; this.w = 50; this.h = 80; this.hue = 100; this.lightY = 0; this.lightDir = 1; this.pulseOffset = random(PI); } display() { this.hue = (this.hue + 0.4) % 360; this.lightY += this.lightDir * 0.6; if (this.lightY > this.h - 12 || this.lightY < 0) this.lightDir *= -1; let pulse = 0.8 + sin(frameCount * 0.05 + this.pulseOffset) * 0.2; push(); colorMode(HSB, 360, 100, 100, 1.0); drawingContext.shadowBlur = 15 * pulse; drawingContext.shadowColor = color(this.hue, 90, 100, 0.5).toString(); fill(this.hue, 80, 60); stroke(this.hue, 90, 90); strokeWeight(2); rect(this.x, this.y, this.w, this.h, 5); drawingContext.shadowBlur = 0; fill(terminalScreenColor); noStroke(); rect(this.x + 8, this.y + 8, this.w - 16, this.h - 16, 3); fill(terminalHighlightColor); rect(this.x + 8, this.y + 8 + this.lightY, this.w - 16, 4); stroke(terminalHighlightColor, 0.3); strokeWeight(0.5); for(let i = 0; i < 5; i++) { let ly = this.y + 15 + i * 10; line(this.x + 12, ly, this.x + this.w - 12, ly + random(-1, 1)); } pop(); colorMode(RGB); } }
class Particle { constructor(x, y, pColor, speedMult = 1, life = 40, sizeMin = 2, sizeMax = 5) { this.pos = createVector(x, y); this.vel = p5.Vector.random2D().mult(random(1.5, 4) * speedMult); this.lifespan = random(life * 0.8, life * 1.2); this.maxLife = this.lifespan; this.color = pColor; this.size = random(sizeMin, sizeMax); this.drag = random(0.92, 0.98); } update() { this.pos.add(this.vel); this.lifespan--; this.vel.mult(this.drag); this.vel.y += GRAVITY * 0.05; } display() { noStroke(); let lifeRatio = this.lifespan / this.maxLife; let currentAlpha = alpha(this.color) * lifeRatio; fill(red(this.color), green(this.color), blue(this.color), currentAlpha); ellipse(this.pos.x, this.pos.y, this.size * lifeRatio); } isDead() { return this.lifespan <= 0; } }


// --- Level Creation ---
function createLevel(levelNumber) {
    console.log(`Creating Level ${levelNumber}`);
    platforms = []; collectiblePills = []; enemies = []; powerUps = []; enemyBullets = []; particles = []; terminal = null; // Clear terminal initially

    const groundY = height - GROUND_HEIGHT;

    // Reset player state for the new level BUT keep upgrades
    if (player) {
        player.resetLevelState(); // Resets pos, vel, health, etc.
        // player.applyUpgrades(); // Re-apply upgrades to ensure stats are correct (optional here, done in constructor/reset)
    } else {
         // Should only happen on initial load, player is created in setup
         player = new Player(100, groundY - PLAYER_SIZE * 2);
         player.applyUpgrades();
    }


    // --- Level Definitions ---
    switch (levelNumber) {
        case 1:
             levelWidth = 3500;
             platforms.push(new Platform(0, groundY, levelWidth, GROUND_HEIGHT * 3));
             platforms.push(new Platform(300, groundY - 110, 150, 20));
             platforms.push(new Platform(550, groundY - 210, 200, 20));
             platforms.push(new Platform(950, groundY - 140, 100, 20));
             platforms.push(new Platform(1400, groundY - 180, 150, 20));
             platforms.push(new Platform(1700, groundY - 160, 100, 20));
             platforms.push(new Platform(1850, groundY - 310, 100, 20)); // High platform
             platforms.push(new MovingPlatform(750, groundY - 160, 120, 20, 200, 1.5, true));
             platforms.push(new Platform(2100, groundY - 210, 250, 20));
             platforms.push(new Platform(2600, groundY - 110, 150, 20));
             platforms.push(new Platform(2850, groundY - 250, 120, 20));
             collectiblePills.push(new CollectiblePill(350, groundY - 150)); collectiblePills.push(new CollectiblePill(600, groundY - 250)); collectiblePills.push(new CollectiblePill(1000, groundY - 180)); collectiblePills.push(new CollectiblePill(1450, groundY - 220)); collectiblePills.push(new CollectiblePill(1900, groundY - 350)); collectiblePills.push(new CollectiblePill(2200, groundY - 250)); collectiblePills.push(new CollectiblePill(2650, groundY - 150)); collectiblePills.push(new CollectiblePill(2900, groundY - 290));
             powerUps.push(new PowerUp(1750, groundY - 200, 'speed')); powerUps.push(new PowerUp(980, groundY - 180, 'invincibility')); powerUps.push(new PowerUp(2150, groundY - 250, 'jump'));
             enemies.push(new Enemy(550, groundY - ENEMY_SIZE / 2, 150)); enemies.push(new SpikyEnemy(1200, groundY - SPIKY_ENEMY_SIZE / 2, 100)); enemies.push(new Enemy(1500, groundY - 40, 200)); enemies.push(new ShootingEnemy(2225, groundY - 210 - SHOOTING_ENEMY_SIZE / 2, 0)); enemies.push(new SpikyEnemy(2700, groundY - 110 - SPIKY_ENEMY_SIZE / 2, 100));
             break;
        case 2:
            levelWidth = 4500;
             platforms.push(new Platform(0, groundY, levelWidth, GROUND_HEIGHT * 3));
             platforms.push(new Platform(250, groundY - 100, 120, 20)); platforms.push(new Platform(500, groundY - 150, 100, 20)); platforms.push(new MovingPlatform(700, groundY - 200, 100, 20, 150, 1.8, false)); platforms.push(new Platform(1000, groundY - 120, 200, 20)); platforms.push(new Platform(1300, groundY - 220, 100, 20)); platforms.push(new Platform(1600, groundY - 100, 80, 20)); platforms.push(new Platform(1850, groundY - 180, 150, 20)); platforms.push(new Platform(2200, groundY - 250, 100, 20)); platforms.push(new MovingPlatform(2500, groundY - 150, 120, 20, 300, 2.0, true)); platforms.push(new Platform(3000, groundY - 300, 100, 20)); platforms.push(new Platform(3300, groundY - 200, 150, 20)); platforms.push(new Platform(3700, groundY - 120, 200, 20));
             collectiblePills.push(new CollectiblePill(300, groundY - 140)); collectiblePills.push(new CollectiblePill(550, groundY - 190)); collectiblePills.push(new CollectiblePill(750, groundY - 240)); collectiblePills.push(new CollectiblePill(1050, groundY - 160)); collectiblePills.push(new CollectiblePill(1350, groundY - 260)); collectiblePills.push(new CollectiblePill(1900, groundY - 220)); collectiblePills.push(new CollectiblePill(2250, groundY - 290)); collectiblePills.push(new CollectiblePill(3050, groundY - 340)); collectiblePills.push(new CollectiblePill(3400, groundY - 240)); collectiblePills.push(new CollectiblePill(3800, groundY - 160)); collectiblePills.push(new CollectiblePill(4100, groundY - 50));
             powerUps.push(new PowerUp(1640, groundY - 140, 'speed')); powerUps.push(new PowerUp(2800, groundY - 50, 'invincibility')); powerUps.push(new PowerUp(520, groundY - 190, 'jump'));
             enemies.push(new Enemy(400, groundY - ENEMY_SIZE / 2, 100)); enemies.push(new ShootingEnemy(1050, groundY - 120 - SHOOTING_ENEMY_SIZE / 2, 100)); enemies.push(new SpikyEnemy(1400, groundY - SPIKY_ENEMY_SIZE / 2, 120)); enemies.push(new Enemy(1700, groundY - ENEMY_SIZE / 2, 150)); enemies.push(new Enemy(2300, groundY - ENEMY_SIZE / 2, 200)); enemies.push(new SpikyEnemy(3100, groundY - SPIKY_ENEMY_SIZE / 2, 100)); enemies.push(new ShootingEnemy(3350, groundY - 200 - SHOOTING_ENEMY_SIZE / 2, 100)); enemies.push(new Enemy(3900, groundY - ENEMY_SIZE / 2, 100));
             break;
        // --- Cases 3-12 ---
        // ... (Level definitions remain the same as the previous response) ...
        // ... Make sure the 'return;' is removed from the end of Level 9 case if added previously...
         case 3: // Focus: Verticality, Spiky Enemies
            levelWidth = 3800;
            platforms.push(new Platform(0, groundY, levelWidth, GROUND_HEIGHT * 3));
            platforms.push(new Platform(200, groundY - 80, 100, 20));
            platforms.push(new MovingPlatform(450, groundY - 150, 100, 20, 200, 1.2, false)); // Vertical mover
            platforms.push(new Platform(650, groundY - 350, 80, 20)); // High platform near mover
            platforms.push(new Platform(900, groundY - 120, 150, 20));
            platforms.push(new Platform(1200, groundY - 200, 100, 20));
            platforms.push(new Platform(1500, groundY - 150, 200, 20));
            platforms.push(new Platform(1900, groundY - 250, 120, 20));
            platforms.push(new Platform(2200, groundY - 180, 100, 20));
            platforms.push(new MovingPlatform(2500, groundY - 100, 100, 20, 250, 1.7, true)); // Horizontal mover
            platforms.push(new Platform(2900, groundY - 280, 150, 20));
            platforms.push(new Platform(3200, groundY - 150, 100, 20));
            collectiblePills.push(new CollectiblePill(250, groundY - 120)); collectiblePills.push(new CollectiblePill(450, groundY - 100)); collectiblePills.push(new CollectiblePill(690, groundY - 390)); collectiblePills.push(new CollectiblePill(950, groundY - 160)); collectiblePills.push(new CollectiblePill(1250, groundY - 240)); collectiblePills.push(new CollectiblePill(1600, groundY - 190)); collectiblePills.push(new CollectiblePill(1950, groundY - 290)); collectiblePills.push(new CollectiblePill(2250, groundY - 220)); collectiblePills.push(new CollectiblePill(2950, groundY - 320)); collectiblePills.push(new CollectiblePill(3250, groundY - 190));
            powerUps.push(new PowerUp(1550, groundY - 190, 'jump')); powerUps.push(new PowerUp(3000, groundY - 320, 'speed'));
            enemies.push(new SpikyEnemy(800, groundY - SPIKY_ENEMY_SIZE / 2, 150)); enemies.push(new Enemy(1100, groundY - ENEMY_SIZE / 2, 100)); enemies.push(new SpikyEnemy(1550, groundY - 150 - SPIKY_ENEMY_SIZE / 2, 120)); enemies.push(new Enemy(2100, groundY - ENEMY_SIZE / 2, 100)); enemies.push(new ShootingEnemy(2975, groundY - 280 - SHOOTING_ENEMY_SIZE / 2, 0)); enemies.push(new SpikyEnemy(3400, groundY - SPIKY_ENEMY_SIZE / 2, 100));
            break;
        case 4: // Focus: Shooting Enemies, Dodging
            levelWidth = 4200;
            platforms.push(new Platform(0, groundY, levelWidth, GROUND_HEIGHT * 3));
            platforms.push(new Platform(300, groundY - 120, 200, 20)); platforms.push(new Platform(650, groundY - 180, 150, 20)); platforms.push(new Platform(900, groundY - 100, 80, 20)); platforms.push(new Platform(1150, groundY - 250, 100, 20)); platforms.push(new Platform(1400, groundY - 150, 120, 20)); platforms.push(new MovingPlatform(1700, groundY - 220, 100, 20, 200, 1.0, true)); platforms.push(new Platform(2100, groundY - 100, 150, 20)); platforms.push(new Platform(2400, groundY - 300, 100, 20)); platforms.push(new Platform(2700, groundY - 180, 180, 20)); platforms.push(new Platform(3100, groundY - 120, 100, 20)); platforms.push(new MovingPlatform(3400, groundY - 250, 120, 20, 150, 2.2, false)); platforms.push(new Platform(3800, groundY - 160, 150, 20));
            collectiblePills.push(new CollectiblePill(350, groundY - 160)); collectiblePills.push(new CollectiblePill(700, groundY - 220)); collectiblePills.push(new CollectiblePill(940, groundY - 140)); collectiblePills.push(new CollectiblePill(1200, groundY - 290)); collectiblePills.push(new CollectiblePill(1450, groundY - 190)); collectiblePills.push(new CollectiblePill(2150, groundY - 140)); collectiblePills.push(new CollectiblePill(2450, groundY - 340)); collectiblePills.push(new CollectiblePill(2800, groundY - 220)); collectiblePills.push(new CollectiblePill(3150, groundY - 160)); collectiblePills.push(new CollectiblePill(3850, groundY - 200));
            powerUps.push(new PowerUp(1800, groundY - 260, 'invincibility')); powerUps.push(new PowerUp(3150, groundY - 160, 'jump'));
            enemies.push(new ShootingEnemy(680, groundY - 180 - SHOOTING_ENEMY_SIZE / 2, 50)); enemies.push(new Enemy(900, groundY - ENEMY_SIZE / 2, 100)); enemies.push(new ShootingEnemy(1175, groundY - 250 - SHOOTING_ENEMY_SIZE / 2, 0)); enemies.push(new SpikyEnemy(1500, groundY - SPIKY_ENEMY_SIZE / 2, 100)); enemies.push(new ShootingEnemy(2150, groundY - 100 - SHOOTING_ENEMY_SIZE / 2, 80)); enemies.push(new Enemy(2750, groundY - 180 - ENEMY_SIZE / 2, 100)); enemies.push(new ShootingEnemy(3850, groundY - 160 - SHOOTING_ENEMY_SIZE/2, 50));
            break;
        case 5: // Focus: Enemy Combinations, Moving Platform Challenges
            levelWidth = 4000;
            platforms.push(new Platform(0, groundY, levelWidth, GROUND_HEIGHT * 3));
            platforms.push(new Platform(250, groundY - 100, 100, 20)); platforms.push(new MovingPlatform(500, groundY - 150, 120, 20, 300, 2.0, true)); platforms.push(new Platform(900, groundY - 220, 80, 20)); platforms.push(new Platform(1150, groundY - 160, 150, 20)); platforms.push(new Platform(1500, groundY - 280, 100, 20)); platforms.push(new Platform(1800, groundY - 120, 100, 20)); platforms.push(new MovingPlatform(2100, groundY - 200, 80, 20, 150, 1.5, false)); platforms.push(new Platform(2400, groundY - 100, 120, 20)); platforms.push(new Platform(2700, groundY - 190, 150, 20)); platforms.push(new MovingPlatform(3100, groundY - 150, 100, 20, 400, 1.8, true)); platforms.push(new Platform(3700, groundY - 250, 100, 20));
            collectiblePills.push(new CollectiblePill(300, groundY - 140)); collectiblePills.push(new CollectiblePill(550, groundY - 190)); collectiblePills.push(new CollectiblePill(940, groundY - 260)); collectiblePills.push(new CollectiblePill(1200, groundY - 200)); collectiblePills.push(new CollectiblePill(1550, groundY - 320)); collectiblePills.push(new CollectiblePill(1850, groundY - 160)); collectiblePills.push(new CollectiblePill(2450, groundY - 140)); collectiblePills.push(new CollectiblePill(2750, groundY - 230)); collectiblePills.push(new CollectiblePill(3750, groundY - 290));
            powerUps.push(new PowerUp(1225, groundY - 200, 'speed')); powerUps.push(new PowerUp(2100, groundY - 70, 'jump')); powerUps.push(new PowerUp(3300, groundY - 100, 'invincibility'));
            enemies.push(new Enemy(350, groundY - ENEMY_SIZE / 2, 80)); enemies.push(new ShootingEnemy(800, groundY - SHOOTING_ENEMY_SIZE / 2, 150)); enemies.push(new SpikyEnemy(1175, groundY - 160 - SPIKY_ENEMY_SIZE / 2, 80)); enemies.push(new ShootingEnemy(1525, groundY - 280 - SHOOTING_ENEMY_SIZE / 2, 0)); enemies.push(new Enemy(1900, groundY - ENEMY_SIZE / 2, 120)); enemies.push(new SpikyEnemy(2460, groundY - 100 - SPIKY_ENEMY_SIZE / 2, 60)); enemies.push(new ShootingEnemy(2800, groundY - 190 - SHOOTING_ENEMY_SIZE/2, 50)); enemies.push(new Enemy(3750, groundY - 250 - ENEMY_SIZE / 2, 50));
            break;
       case 6: // Focus: Faster pace, more gaps
            levelWidth = 4800;
            platforms.push(new Platform(0, groundY, 200, GROUND_HEIGHT * 3)); platforms.push(new Platform(400, groundY - 100, 150, 20)); platforms.push(new Platform(700, groundY - 180, 100, 20)); platforms.push(new Platform(1100, groundY - 150, 120, 20)); platforms.push(new MovingPlatform(1400, groundY - 220, 100, 20, 250, 2.5, true)); platforms.push(new Platform(1850, groundY - 120, 80, 20)); platforms.push(new Platform(2100, groundY - 280, 100, 20)); platforms.push(new Platform(2400, groundY - 100, 100, 20)); platforms.push(new MovingPlatform(2800, groundY - 160, 100, 20, 150, 1.8, false)); platforms.push(new Platform(3100, groundY - 320, 100, 20)); platforms.push(new Platform(3500, groundY - 140, 150, 20)); platforms.push(new Platform(3800, groundY - 200, 100, 20)); platforms.push(new MovingPlatform(4100, groundY - 100, 120, 20, 300, 2.2, true)); platforms.push(new Platform(4600, groundY - 180, 100, 20)); platforms.push(new Platform(4700, groundY, levelWidth-4700, GROUND_HEIGHT * 3));
            collectiblePills.push(new CollectiblePill(450, groundY - 140)); collectiblePills.push(new CollectiblePill(750, groundY - 220)); collectiblePills.push(new CollectiblePill(1150, groundY - 190)); collectiblePills.push(new CollectiblePill(1900, groundY - 160)); collectiblePills.push(new CollectiblePill(2150, groundY - 320)); collectiblePills.push(new CollectiblePill(3150, groundY - 360)); collectiblePills.push(new CollectiblePill(3550, groundY - 180)); collectiblePills.push(new CollectiblePill(3850, groundY - 240)); collectiblePills.push(new CollectiblePill(4650, groundY - 220));
            powerUps.push(new PowerUp(800, groundY - 250, 'jump')); powerUps.push(new PowerUp(2500, groundY - 50, 'speed')); powerUps.push(new PowerUp(4200, groundY - 50, 'invincibility'));
            enemies.push(new Enemy(500, groundY - ENEMY_SIZE / 2, 100)); enemies.push(new SpikyEnemy(1160, groundY - 150 - SPIKY_ENEMY_SIZE / 2, 60)); enemies.push(new ShootingEnemy(1600, groundY - SHOOTING_ENEMY_SIZE / 2, 200)); enemies.push(new Enemy(2000, groundY - ENEMY_SIZE / 2, 100)); enemies.push(new ShootingEnemy(2450, groundY - 100 - SHOOTING_ENEMY_SIZE / 2, 0)); enemies.push(new SpikyEnemy(3550, groundY - 140 - SPIKY_ENEMY_SIZE / 2, 80)); enemies.push(new Enemy(3900, groundY - ENEMY_SIZE / 2, 120)); enemies.push(new ShootingEnemy(4650, groundY - 180 - SHOOTING_ENEMY_SIZE / 2, 0));
            break;
        case 7: // Focus: Platform Gauntlet, Precise Jumping
            levelWidth = 4500;
            platforms.push(new Platform(0, groundY, levelWidth, GROUND_HEIGHT * 3));
            platforms.push(new Platform(250, groundY - 100, 80, 20)); platforms.push(new Platform(450, groundY - 150, 70, 20)); platforms.push(new MovingPlatform(650, groundY - 120, 60, 20, 100, 1.0, false)); platforms.push(new Platform(850, groundY - 180, 70, 20)); platforms.push(new Platform(1050, groundY - 240, 60, 20)); platforms.push(new MovingPlatform(1300, groundY - 200, 80, 20, 200, 2.0, true)); platforms.push(new Platform(1650, groundY - 260, 70, 20)); platforms.push(new Platform(1850, groundY - 180, 80, 20)); platforms.push(new Platform(2100, groundY - 140, 150, 20)); platforms.push(new Platform(2400, groundY - 220, 70, 20)); platforms.push(new MovingPlatform(2650, groundY - 280, 60, 20, 120, 1.5, false)); platforms.push(new Platform(2900, groundY - 200, 70, 20)); platforms.push(new MovingPlatform(3200, groundY - 150, 80, 20, 300, 2.2, true)); platforms.push(new Platform(3700, groundY - 250, 100, 20)); platforms.push(new Platform(4000, groundY - 180, 120, 20));
            collectiblePills.push(new CollectiblePill(290, groundY - 140)); collectiblePills.push(new CollectiblePill(485, groundY - 190)); collectiblePills.push(new CollectiblePill(885, groundY - 220)); collectiblePills.push(new CollectiblePill(1080, groundY - 280)); collectiblePills.push(new CollectiblePill(1685, groundY - 300)); collectiblePills.push(new CollectiblePill(1890, groundY - 220)); collectiblePills.push(new CollectiblePill(2175, groundY - 180)); collectiblePills.push(new CollectiblePill(2435, groundY - 260)); collectiblePills.push(new CollectiblePill(2935, groundY - 240)); collectiblePills.push(new CollectiblePill(3750, groundY - 290)); collectiblePills.push(new CollectiblePill(4060, groundY - 220));
            powerUps.push(new PowerUp(1400, groundY - 260, 'jump')); powerUps.push(new PowerUp(3000, groundY - 100, 'invincibility'));
            enemies.push(new ShootingEnemy(550, groundY - SHOOTING_ENEMY_SIZE / 2, 100)); enemies.push(new SpikyEnemy(950, groundY - SPIKY_ENEMY_SIZE / 2, 100)); enemies.push(new Enemy(1750, groundY - ENEMY_SIZE / 2, 100)); enemies.push(new ShootingEnemy(2150, groundY - 140 - SHOOTING_ENEMY_SIZE / 2, 50)); enemies.push(new SpikyEnemy(3000, groundY - SPIKY_ENEMY_SIZE / 2, 150)); enemies.push(new Enemy(3800, groundY - ENEMY_SIZE / 2, 100)); enemies.push(new ShootingEnemy(4200, groundY - SHOOTING_ENEMY_SIZE / 2, 100));
            break;
        case 8: // Focus: High Density, Mixed Threats
            levelWidth = 5000;
            platforms.push(new Platform(0, groundY, levelWidth, GROUND_HEIGHT * 3));
            platforms.push(new Platform(200, groundY - 100, 150, 20)); platforms.push(new Platform(450, groundY - 180, 100, 20)); platforms.push(new Platform(650, groundY - 120, 80, 20)); platforms.push(new MovingPlatform(850, groundY - 200, 100, 20, 200, 1.8, true)); platforms.push(new Platform(1200, groundY - 150, 120, 20)); platforms.push(new Platform(1450, groundY - 250, 100, 20)); platforms.push(new Platform(1700, groundY - 100, 80, 20)); platforms.push(new Platform(1950, groundY - 180, 100, 20)); platforms.push(new MovingPlatform(2200, groundY - 240, 80, 20, 150, 1.2, false)); platforms.push(new Platform(2500, groundY - 160, 150, 20)); platforms.push(new Platform(2800, groundY - 300, 100, 20)); platforms.push(new Platform(3100, groundY - 120, 120, 20)); platforms.push(new Platform(3400, groundY - 220, 100, 20)); platforms.push(new MovingPlatform(3700, groundY - 180, 100, 20, 300, 2.0, true)); platforms.push(new Platform(4200, groundY - 140, 150, 20)); platforms.push(new Platform(4500, groundY - 280, 100, 20));
            for (let i=0; i < 20; i++) collectiblePills.push(new CollectiblePill(300 + i * 200, groundY - 150 - random(100)));
            powerUps.push(new PowerUp(500, groundY - 220, 'invincibility')); powerUps.push(new PowerUp(1300, groundY - 190, 'speed')); powerUps.push(new PowerUp(2000, groundY - 220, 'jump')); powerUps.push(new PowerUp(2900, groundY - 340, 'invincibility')); powerUps.push(new PowerUp(3500, groundY - 260, 'speed')); powerUps.push(new PowerUp(4300, groundY - 180, 'jump'));
            enemies.push(new Enemy(300, groundY - ENEMY_SIZE / 2, 100)); enemies.push(new SpikyEnemy(500, groundY - 180 - SPIKY_ENEMY_SIZE / 2, 50)); enemies.push(new ShootingEnemy(700, groundY - 120 - SHOOTING_ENEMY_SIZE / 2, 0)); enemies.push(new Enemy(1000, groundY - ENEMY_SIZE / 2, 150)); enemies.push(new SpikyEnemy(1250, groundY - 150 - SPIKY_ENEMY_SIZE / 2, 60)); enemies.push(new ShootingEnemy(1500, groundY - 250 - SHOOTING_ENEMY_SIZE / 2, 0)); enemies.push(new Enemy(1750, groundY - 100 - ENEMY_SIZE / 2, 0)); enemies.push(new SpikyEnemy(2000, groundY - 180 - SPIKY_ENEMY_SIZE / 2, 50)); enemies.push(new Enemy(2300, groundY - ENEMY_SIZE / 2, 100)); enemies.push(new ShootingEnemy(2550, groundY - 160 - SHOOTING_ENEMY_SIZE / 2, 80)); enemies.push(new SpikyEnemy(3150, groundY - 120 - SPIKY_ENEMY_SIZE / 2, 60)); enemies.push(new Enemy(3450, groundY - 220 - ENEMY_SIZE / 2, 50)); enemies.push(new ShootingEnemy(3800, groundY - SHOOTING_ENEMY_SIZE / 2, 200)); enemies.push(new SpikyEnemy(4250, groundY - 140 - SPIKY_ENEMY_SIZE / 2, 80)); enemies.push(new Enemy(4600, groundY - ENEMY_SIZE/2, 150));
            break;
        case 9: // Focus: Vertical Maze
             levelWidth = 3500;
             platforms.push(new Platform(0, groundY, 150, GROUND_HEIGHT * 3)); platforms.push(new Platform(300, groundY - 120, 100, 20)); platforms.push(new MovingPlatform(550, groundY - 200, 80, 20, 150, 1.0, true)); platforms.push(new Platform(800, groundY - 280, 100, 20)); platforms.push(new MovingPlatform(1050, groundY - 350, 80, 20, 100, 1.2, false)); platforms.push(new Platform(800, groundY - 450, 100, 20)); platforms.push(new Platform(550, groundY - 520, 100, 20)); platforms.push(new Platform(1200, groundY - 400, 100, 20)); platforms.push(new Platform(1450, groundY - 320, 80, 20)); platforms.push(new MovingPlatform(1700, groundY - 250, 100, 20, 200, 1.5, true)); platforms.push(new Platform(2000, groundY - 180, 100, 20)); platforms.push(new Platform(2300, groundY - 260, 80, 20)); platforms.push(new MovingPlatform(2600, groundY - 350, 100, 20, 120, 1.8, false)); platforms.push(new Platform(2800, groundY - 480, 100, 20)); platforms.push(new Platform(3100, groundY - 550, 150, 20)); platforms.push(new Platform(levelWidth-100, groundY, 100, GROUND_HEIGHT * 3));
             collectiblePills.push(new CollectiblePill(350, groundY - 160)); collectiblePills.push(new CollectiblePill(850, groundY - 320)); collectiblePills.push(new CollectiblePill(850, groundY - 490)); collectiblePills.push(new CollectiblePill(600, groundY - 560)); collectiblePills.push(new CollectiblePill(1250, groundY - 440)); collectiblePills.push(new CollectiblePill(1500, groundY - 360)); collectiblePills.push(new CollectiblePill(2050, groundY - 220)); collectiblePills.push(new CollectiblePill(2340, groundY - 300)); collectiblePills.push(new CollectiblePill(2850, groundY - 520)); collectiblePills.push(new CollectiblePill(3175, groundY - 590));
             powerUps.push(new PowerUp(900, groundY - 500, 'jump')); powerUps.push(new PowerUp(1800, groundY - 100, 'speed')); powerUps.push(new PowerUp(2650, groundY - 200, 'invincibility'));
             enemies.push(new ShootingEnemy(400, groundY - 120 - SHOOTING_ENEMY_SIZE/2, 0)); enemies.push(new SpikyEnemy(900, groundY - 280 - SPIKY_ENEMY_SIZE/2, 0)); enemies.push(new Enemy(600, groundY - 520 - ENEMY_SIZE/2, 50)); enemies.push(new ShootingEnemy(1300, groundY - 400 - SHOOTING_ENEMY_SIZE/2, 0)); enemies.push(new SpikyEnemy(1900, groundY - 180 - SPIKY_ENEMY_SIZE/2, 50)); enemies.push(new Enemy(2900, groundY - 480 - ENEMY_SIZE/2, 50));
             // Custom terminal for this level
             terminal = new Terminal(3150, groundY - 550 - 80); // Place on highest platform
             break; // Break normally now
        case 10: // Focus: Long Movers, Enemy Waves
             levelWidth = 5500;
             platforms.push(new Platform(0, groundY, levelWidth, GROUND_HEIGHT * 3));
             platforms.push(new MovingPlatform(300, groundY - 150, 200, 20, 800, 1.5, true)); platforms.push(new Platform(1300, groundY - 250, 150, 20)); platforms.push(new MovingPlatform(1600, groundY - 180, 150, 20, 1000, 2.0, true)); platforms.push(new Platform(2800, groundY - 300, 100, 20)); platforms.push(new MovingPlatform(3000, groundY - 220, 200, 20, 1200, 1.8, true)); platforms.push(new Platform(4400, groundY - 160, 150, 20));
             for (let x = 400; x < 1100; x+= 100) collectiblePills.push(new CollectiblePill(x, groundY - 200)); collectiblePills.push(new CollectiblePill(1375, groundY - 290)); for (let x = 1700; x < 2600; x+= 150) collectiblePills.push(new CollectiblePill(x, groundY - 230)); collectiblePills.push(new CollectiblePill(2850, groundY - 340)); for (let x = 3100; x < 4200; x+= 120) collectiblePills.push(new CollectiblePill(x, groundY - 270)); collectiblePills.push(new CollectiblePill(4475, groundY - 200));
            powerUps.push(new PowerUp(1375, groundY - 290, 'invincibility')); powerUps.push(new PowerUp(2850, groundY - 340, 'jump')); powerUps.push(new PowerUp(4475, groundY - 200, 'speed'));
            enemies.push(new ShootingEnemy(800, groundY - SHOOTING_ENEMY_SIZE / 2, 300)); enemies.push(new SpikyEnemy(1375, groundY - 250 - SPIKY_ENEMY_SIZE/2, 0)); enemies.push(new ShootingEnemy(2200, groundY - SHOOTING_ENEMY_SIZE / 2, 500)); enemies.push(new Enemy(2900, groundY - ENEMY_SIZE / 2, 150)); enemies.push(new SpikyEnemy(3600, groundY - SPIKY_ENEMY_SIZE / 2, 600)); enemies.push(new ShootingEnemy(4500, groundY - 160-SHOOTING_ENEMY_SIZE/2, 80));
            break;
        case 11: // Focus: Skill Test - Mix of everything learned
             levelWidth = 6000;
             platforms.push(new Platform(0, groundY, levelWidth, GROUND_HEIGHT * 3));
             platforms.push(new Platform(250, groundY - 100, 100, 20)); platforms.push(new Platform(500, groundY - 160, 80, 20)); platforms.push(new MovingPlatform(750, groundY - 120, 80, 20, 150, 1.2, false)); platforms.push(new Platform(1000, groundY - 220, 100, 20)); enemies.push(new Enemy(300, groundY - ENEMY_SIZE/2, 80)); enemies.push(new SpikyEnemy(600, groundY - SPIKY_ENEMY_SIZE/2, 100));
             platforms.push(new Platform(1300, groundY - 150, 200, 20)); platforms.push(new Platform(1600, groundY - 250, 80, 20)); platforms.push(new Platform(1900, groundY - 180, 150, 20)); enemies.push(new ShootingEnemy(1400, groundY - 150 - SHOOTING_ENEMY_SIZE/2, 50)); enemies.push(new ShootingEnemy(1975, groundY - 180 - SHOOTING_ENEMY_SIZE/2, 50));
             platforms.push(new MovingPlatform(2200, groundY - 200, 100, 20, 300, 2.0, true)); platforms.push(new Platform(2700, groundY - 140, 120, 20)); platforms.push(new MovingPlatform(3000, groundY - 250, 80, 20, 180, 1.5, false)); platforms.push(new Platform(3300, groundY - 350, 100, 20)); enemies.push(new SpikyEnemy(2760, groundY - 140 - SPIKY_ENEMY_SIZE/2, 60)); enemies.push(new SpikyEnemy(3100, groundY - SPIKY_ENEMY_SIZE/2, 150));
             platforms.push(new Platform(3600, groundY - 180, 150, 20)); platforms.push(new Platform(3900, groundY - 280, 100, 20)); platforms.push(new Platform(4200, groundY - 150, 120, 20)); platforms.push(new MovingPlatform(4500, groundY - 220, 100, 20, 400, 2.2, true)); platforms.push(new Platform(5100, groundY - 300, 100, 20)); enemies.push(new Enemy(3650, groundY-180-ENEMY_SIZE/2, 80)); enemies.push(new ShootingEnemy(4000, groundY-280-SHOOTING_ENEMY_SIZE/2, 0)); enemies.push(new SpikyEnemy(4250, groundY-150-SPIKY_ENEMY_SIZE/2, 60)); enemies.push(new Enemy(4800, groundY - ENEMY_SIZE/2, 200)); enemies.push(new ShootingEnemy(5150, groundY-300-SHOOTING_ENEMY_SIZE/2, 0));
             for (let i=0; i < 15; i++) collectiblePills.push(new CollectiblePill(400 + i * 350, groundY - 100 - random(200)));
             powerUps.push(new PowerUp(900, groundY - 260, 'jump')); powerUps.push(new PowerUp(1700, groundY - 300, 'invincibility')); powerUps.push(new PowerUp(2800, groundY - 80, 'speed')); powerUps.push(new PowerUp(4000, groundY - 320, 'jump')); powerUps.push(new PowerUp(4700, groundY - 100, 'invincibility'));
             break;
         case 12: // Final Challenge: Boss Rush Arena
             levelWidth = 2500;
             platforms.push(new Platform(0, groundY, levelWidth, GROUND_HEIGHT * 3));
             platforms.push(new Platform(300, groundY - 120, 200, 20)); platforms.push(new Platform(levelWidth - 300 - 200, groundY - 120, 200, 20)); platforms.push(new Platform(800, groundY - 240, 150, 20)); platforms.push(new Platform(levelWidth - 800 - 150, groundY - 240, 150, 20)); platforms.push(new MovingPlatform(levelWidth/2 - 75, groundY - 350, 150, 20, 400, 1.8, true));
             collectiblePills.push(new CollectiblePill(levelWidth/2, groundY - 400)); collectiblePills.push(new CollectiblePill(400, groundY - 160)); collectiblePills.push(new CollectiblePill(levelWidth-400, groundY - 160));
             powerUps.push(new PowerUp(100, groundY - 50, 'speed')); powerUps.push(new PowerUp(levelWidth-100, groundY - 50, 'jump')); powerUps.push(new PowerUp(levelWidth/2, groundY - 80, 'invincibility'));
             enemies.push(new Enemy(200, groundY - ENEMY_SIZE/2, 100)); enemies.push(new Enemy(levelWidth - 200, groundY - ENEMY_SIZE/2, 100)); enemies.push(new SpikyEnemy(600, groundY - SPIKY_ENEMY_SIZE/2, 150)); enemies.push(new SpikyEnemy(levelWidth - 600, groundY - SPIKY_ENEMY_SIZE/2, 150)); enemies.push(new ShootingEnemy(350, groundY - 120 - SHOOTING_ENEMY_SIZE/2, 0)); enemies.push(new ShootingEnemy(levelWidth - 350, groundY - 120 - SHOOTING_ENEMY_SIZE/2, 0)); enemies.push(new SpikyEnemy(875, groundY - 240 - SPIKY_ENEMY_SIZE/2, 0)); enemies.push(new SpikyEnemy(levelWidth - 875, groundY - 240 - SPIKY_ENEMY_SIZE/2, 0)); enemies.push(new ShootingEnemy(levelWidth/2, groundY - SHOOTING_ENEMY_SIZE/2, 200));
             break;

        default:
            console.warn(`Level ${levelNumber} not defined, loading Level 1.`);
            currentLevel = 1; // Reset level number if invalid
            createLevel(1); // Load level 1
            return; // Exit function early
    }

    // Place terminal if not defined by special level case (like 9)
    if (!terminal) {
         terminal = new Terminal(levelWidth - 150, groundY - 80);
    }

    // Ensure camera is reset after level load
    cameraX = 0;
    // Make sure game is in playing state
    // gameState = 'playing'; // This should be set by the upgrade menu 'continue' button
}


// --- Input Handling ---
function touchStarted() {
    touchStartX = touchX; // Store start position

    if (gameState === 'playing') {
        if (touchX > width / 3 && touchX < width * 2 / 3) {
            if (player.jumpCooldownTimer <= 0) player.jump();
        } else if (touchX < width / 3) {
            isTouchingLeft = true; isTouchingRight = false;
        } else if (touchX > width * 2 / 3) {
            isTouchingRight = true; isTouchingLeft = false;
        }
    } else if (gameState === 'upgrade') {
        upgradeMenu.handleClick(touchX, touchY);
    } else if (gameState === 'gameOver' || gameState === 'win') {
        // Click anywhere to restart
        restartGame();
    }

    return false; // Prevent default browser actions
}

function touchEnded() {
    // Only update movement flags if the game is playing
    if (gameState === 'playing') {
        let stillTouchingLeft = false;
        let stillTouchingRight = false;
        for (let i = 0; i < touches.length; i++) {
            if (touches[i].x < width / 3) stillTouchingLeft = true;
            else if (touches[i].x > width * 2 / 3) stillTouchingRight = true;
        }
        isTouchingLeft = stillTouchingLeft;
        isTouchingRight = stillTouchingRight;
    }
    touchStartX = null;
    return false;
}

function mousePressed() {
     if (gameState === 'upgrade') {
        upgradeMenu.handleClick(mouseX, mouseY);
    } else if (gameState === 'gameOver' || gameState === 'win') {
        // Click anywhere to restart
        restartGame();
    }
    // Prevent default browser actions if desired, although less critical for mouse
    // return false;
}


function keyPressed() {
     if (gameState === 'playing') {
         if ((keyCode === UP_ARROW || keyCode === 87 || keyCode === 32) && player.jumpCooldownTimer <= 0) {
             player.jump();
         }
     } else if (gameState === 'gameOver' || gameState === 'win') {
         if (keyCode === ENTER || keyCode === 32) { // Restart on Enter or Space
             restartGame();
         }
     } else if (gameState === 'upgrade') {
         if (keyCode === ENTER || keyCode === 32) { // Continue on Enter or Space
              upgradeMenu.continueGame();
         }
         // Optional: Add number keys (1, 2, 3) to buy upgrades
         if (keyCode === 49) { // '1'
             upgradeMenu.buyUpgrade('health');
         } else if (keyCode === 50) { // '2'
             upgradeMenu.buyUpgrade('speed');
         } else if (keyCode === 51) { // '3'
             upgradeMenu.buyUpgrade('jump');
         }
     }

     // Prevent browser scrolling with arrow keys/space
     if ([32, 37, 38, 39, 40].includes(keyCode)) {
         // return false; // Doesn't work reliably in p5.js keyPressed, often needs event listener
     }
}

// --- Utility Functions ---
function windowResized() {
     resizeCanvas(windowWidth, windowHeight);
     levelHeight = height - GROUND_HEIGHT;
     // Re-initialize menu buttons based on new screen size
     if (upgradeMenu) {
         upgradeMenu.initializeButtons();
     }
     // No need to recreate level on resize if game is paused/in menu
     if (gameState === 'playing' && player) {
         // Maybe just recenter camera or player? Full level reload can be jarring.
         // For simplicity, let's stick to reloading, but be aware of implications.
         createLevel(currentLevel);
     }
}

// ... (drawGrid, drawAnimatedBackground, drawParallaxBackground, createStarfield) ...
// ... (createParticles, triggerScreenShake, applyScreenShake, drawPlayerTrail, playSound) ...
function drawGrid() { /* ... */ }
function drawAnimatedBackground() { /* ... */ backgroundShift += 0.0005; let shiftAmount = sin(backgroundShift) * 0.1; let topColor = lerpColor(bgColorTop, bgColorBottom, 0.1 + shiftAmount); let bottomColor = lerpColor(bgColorTop, bgColorBottom, 0.9 + shiftAmount); noStroke(); for(let y=0; y < height; y++){ let inter = map(y, 0, height, 0, 1); let c = lerpColor(topColor, bottomColor, inter); fill(c); rect(0, y, width, 1); } }
function drawParallaxBackground() { /* ... */ noStroke(); for (let star of stars) { let starX = star.originX + (width/2 - player.pos.x) * star.parallaxFactor; let wrappedLevelWidth = levelWidth / (1 - star.parallaxFactor); starX = (starX % wrappedLevelWidth + wrappedLevelWidth) % wrappedLevelWidth; starX = starX - ( (width/2 - player.pos.x) * star.parallaxFactor - (cameraX * star.parallaxFactor) ); let twinkle = star.baseTwinkle + sin(frameCount * star.twinkleSpeed + star.twinkleOffset) * star.twinkleAmount; let starAlpha = constrain(star.alpha * twinkle, 0, 200); let starSize = constrain(star.size * twinkle, 0, star.size * 1.5); fill(255, 255, 255, starAlpha); ellipse(starX, star.y, starSize, starSize); } }
function createStarfield(numStars) { /* ... */ stars = []; for (let i = 0; i < numStars; i++) { let size = random(0.5, 2.8); stars.push({ originX: random(levelWidth*2), y: random(height), size: size, alpha: random(80, 180), parallaxFactor: map(size, 0.5, 2.8, 0.08, 0.4), baseTwinkle: random(0.8, 1.0), twinkleAmount: random(0.1, 0.5), twinkleSpeed: random(0.03, 0.08), twinkleOffset: random(TWO_PI) }); } stars.sort((a, b) => a.parallaxFactor - b.parallaxFactor); }
function createParticles(x, y, count, pColor, speedMult = 1, life = 40, sizeMin = 2, sizeMax = 5) { for (let i = 0; i < count; i++) particles.push(new Particle(x, y, pColor, speedMult, life, sizeMin, sizeMax)); }
function triggerScreenShake(intensity, duration) { screenShakeIntensity = max(screenShakeIntensity, intensity); screenShakeDuration = max(screenShakeDuration, duration); }
function applyScreenShake() { if (screenShakeDuration > 0) { translate(random(-screenShakeIntensity, screenShakeIntensity), random(-screenShakeIntensity, screenShakeIntensity)); screenShakeDuration--; if (screenShakeDuration <= 0) screenShakeIntensity = 0; } }
function drawPlayerTrail() { /* ... */ for (let i = 0; i < playerTrail.length; i++) { let pos = playerTrail[i]; let alpha = map(i, 0, playerTrail.length - 1, 0, 60); let size = map(i, 0, playerTrail.length - 1, player.size * 0.2, player.size * 0.8); fill(0, 255, 255, alpha); noStroke(); ellipse(pos.x, pos.y, size, size); } }
function playSound(soundName) { console.log(`Playing sound: ${soundName}`); }

function updatePowerUpTimers() {
    if (speedBoostTimer > 0) speedBoostTimer--;
    if (invincibilityTimer > 0) invincibilityTimer--;
    if (player.jumpBoostTimer > 0) player.jumpBoostTimer--;
    player.boostActive = (speedBoostTimer > 0);
    // player.invincibilityTimer = invincibilityTimer; // This refers to power-up, player has own .isInvulnerable
}

function activatePowerUp(type) {
    if (type === 'speed') { speedBoostTimer = BOOST_DURATION; }
    else if (type === 'invincibility') { invincibilityTimer = INVINCIBILITY_DURATION; }
    else if (type === 'jump') { player.jumpBoostTimer = JUMP_BOOST_DURATION; }
    // Optional: Heal player slightly on powerup collect?
    // player.currentHealth = min(player.maxHealth, player.currentHealth + 1);
}

// --- Collision Handling (Modified for Health) ---
function handleEnemyCollisions(index) {
    let enemy = enemies[index];
    if (!enemy || !player) return;
    let collisionType = player.collidesWithEnemy(enemy);

    if (collisionType) {
        if (invincibilityTimer > 0) { // Power-up Invincibility
            score += (enemy instanceof SpikyEnemy ? 40 : (enemy instanceof ShootingEnemy ? 30 : 25));
            triggerScreenShake(4, 12);
            createParticles(enemy.pos.x, enemy.pos.y, 25, enemy.constructor === ShootingEnemy ? shootingEnemyColor : (enemy instanceof SpikyEnemy ? spikyEnemyColor : enemyColor), 2.0, 50, 3, 7);
            enemies.splice(index, 1);
        } else if (collisionType === 'stomp') { // Stomp
            score += (enemy instanceof ShootingEnemy ? 60 : 50);
            triggerScreenShake(3, 10);
            createParticles(enemy.pos.x, enemy.pos.y, 20, enemy.constructor === ShootingEnemy ? shootingEnemyColor : enemyColor, 1.5, 40, 2, 6);
            enemies.splice(index, 1);
            player.vel.y = player.effectiveJumpForce * 0.6; // Bounce using effective jump force
            player.jumpsAvailable = min(player.jumpsAvailable + 1, 2);
            player.canVariableJump = true;
        } else if (collisionType === 'side') { // Damage
            player.takeDamage(1); // Take 1 damage from side collision
            // Don't reset level here, takeDamage handles death check
        }
    }
}

function handleEnemyBulletCollisions(index) {
    let bullet = enemyBullets[index];
    if (!bullet || !player) return;
    if (bullet.isOffScreen()) {
        enemyBullets.splice(index, 1);
    } else if (player.collidesWith(bullet)) {
        if (invincibilityTimer <= 0) { // Check power-up invincibility
            player.takeDamage(1); // Take 1 damage from bullet
            enemyBullets.splice(index, 1); // Remove bullet after hit
        } else {
             score += 5; // Score for blocking
             createParticles(bullet.pos.x, bullet.pos.y, 8, enemyBulletColor, 1.2, 25, 1, 4);
             enemyBullets.splice(index, 1);
         }
    }
}

// --- Level Progression (Modified for Upgrades) ---
function handleTerminalCollision() {
    if (player.collidesWith(terminal)) {
        /* playSound('win_level'); */
        if (currentLevel === MAX_LEVELS) {
            // Final level completed
            gameState = 'win';
            console.log("YOU WIN! Final Score: " + score);
        } else {
            // Go to upgrade screen
            currentLevel++;
            gameState = 'upgrade';
            upgradeMenu.prepareMenu(); // Update costs etc.
        }
        // Clear level elements immediately? Or wait until 'continue' from upgrade?
        // Let's clear them when createLevel is called via the menu.
    }
}

// --- Restart Game ---
function restartGame() {
    console.log("Restarting game...");
    currentLevel = 1;
    score = 0; // Reset score/currency
    upgradeLevels = { health: 0, speed: 0, jump: 0 }; // Reset upgrades
    if (player) {
        player.fullReset(); // Resets player state and applies base upgrades
    }
    createLevel(currentLevel); // Create the first level
    gameState = 'playing'; // Set state back to playing
    // Ensure timers are reset
    speedBoostTimer = 0;
    invincibilityTimer = 0;
    if (player) player.jumpBoostTimer = 0;
}

// --- UI Drawing ---
function drawUI() {
    push();
    resetMatrix(); // Draw UI in screen space

    // --- Score (Currency) & Level ---
    textSize(28); textAlign(CENTER, TOP); fill(scoreOutlineColor); text(`Score: ${score}`, width / 2 + 2, 22); fill(scoreColor); text(`Score: ${score}`, width / 2, 20);
    textSize(20); textAlign(LEFT, TOP); fill(levelTextOutlineColor); text(`Level: ${currentLevel} / ${MAX_LEVELS}`, 22, 22); fill(levelTextColor); text(`Level: ${currentLevel} / ${MAX_LEVELS}`, 20, 20);

    // --- Health Hearts ---
    let heartSize = 25;
    let heartSpacing = 8;
    let startX = 20;
    let startY = height - 45; // Positioned at bottom left
    for (let i = 0; i < player.maxHealth; i++) {
        // Background/Empty Heart
        fill(healthBgColor);
        stroke(healthOutlineColor);
        strokeWeight(1.5);
        ellipse(startX + i * (heartSize + heartSpacing) + heartSize / 2, startY + heartSize / 2, heartSize, heartSize); // Simple circle hearts

        // Filled Heart Portion
        if (i < player.currentHealth) {
            noStroke();
            fill(healthColor);
            ellipse(startX + i * (heartSize + heartSpacing) + heartSize / 2, startY + heartSize / 2, heartSize * 0.85, heartSize * 0.85); // Inner filled circle
        }
    }

    // --- Power-up Timers ---
    let timerY = 55; textSize(18); textAlign(LEFT, TOP);
    if (speedBoostTimer > 0) { fill(0, 0, 0, 100); text(`Boost: ${ceil(speedBoostTimer / 60)}s`, 21, timerY + 1); fill(0, 255, 255, 220); text(`Boost: ${ceil(speedBoostTimer / 60)}s`, 20, timerY); timerY += 25; }
    if (invincibilityTimer > 0) { fill(0, 0, 0, 100); text(`Invincible: ${ceil(invincibilityTimer / 60)}s`, 21, timerY + 1); fill(255, 255, 100, 220); text(`Invincible: ${ceil(invincibilityTimer / 60)}s`, 20, timerY); timerY += 25; }
    if (player.jumpBoostTimer > 0) { fill(0, 0, 0, 100); text(`Jump Boost: ${ceil(player.jumpBoostTimer / 60)}s`, 21, timerY + 1); fill(100, 255, 100, 220); text(`Jump Boost: ${ceil(player.jumpBoostTimer / 60)}s`, 20, timerY); }

    // --- Touch Controls Overlay --- (Drawn only when playing)
    if (gameState === 'playing') {
        noStroke();
        if (touches.length > 0) {
            if (isTouchingLeft) fill(touchOverlayColor); else noFill(); rect(0, 0, width / 3, height);
            if (isTouchingRight) fill(touchOverlayColor); else noFill(); rect(width * 2 / 3, 0, width / 3, height);
        }
        // Instructions Text
        fill(255, 255, 255, 90); textSize(14); textAlign(CENTER, BOTTOM);
        text("◀ Move", width / 6, height - 20); text("Jump", width / 2, height - 20); text("Move ▶", width * 5 / 6, height - 20);
    }

    pop(); // Restore previous drawing state
}

// --- Touch Input State Update ---
function handleTouchInput() {
     // This logic needs to correctly determine touch state even if game state is not 'playing'
     // for movement flags, but the actual movement happens only in 'playing' state's handleInput.
     let currentlyTouchingLeft = false;
     let currentlyTouchingRight = false;
     for (let i = 0; i < touches.length; i++) {
         let t = touches[i];
         if (t.x < width / 3) currentlyTouchingLeft = true;
         else if (t.x > width * 2 / 3) currentlyTouchingRight = true;
     }
     // Update the state regardless of gameState, Player.handleInput will decide whether to use them
     isTouchingLeft = currentlyTouchingLeft;
     isTouchingRight = currentlyTouchingRight;
}

// --- Upgrade Menu Class ---
class UpgradeMenu {
    constructor() {
        this.buttons = [];
        this.upgradeCosts = { // Define costs per level [level 1 cost, level 2 cost, ...]
             health: [100, 250, 500],
             speed: [80, 200, 400, 700],
             jump: [120, 300, 600]
        };
        this.initializeButtons();
    }

    initializeButtons() {
        this.buttons = [];
        let btnWidth = 200;
        let btnHeight = 80;
        let spacing = 40;
        let startY = height / 2 - btnHeight * 1.5 - spacing;
        let centerX = width / 2;

        // Health Button
        this.buttons.push({
            x: centerX - btnWidth / 2, y: startY, w: btnWidth, h: btnHeight,
            id: 'health', text: 'Max Health'
        });
        // Speed Button
        this.buttons.push({
            x: centerX - btnWidth / 2, y: startY + btnHeight + spacing, w: btnWidth, h: btnHeight,
            id: 'speed', text: 'Move Speed'
        });
        // Jump Button
        this.buttons.push({
            x: centerX - btnWidth / 2, y: startY + (btnHeight + spacing) * 2, w: btnWidth, h: btnHeight,
            id: 'jump', text: 'Jump Force'
        });
        // Continue Button
        this.buttons.push({
            x: centerX - 100, y: height - 100, w: 200, h: 50,
            id: 'continue', text: 'Continue'
        });
    }

    prepareMenu() {
        // Could add logic here if costs needed dynamic updates
        console.log("Preparing upgrade menu for level", currentLevel);
    }

    getCost(upgradeId) {
        let currentLvl = upgradeLevels[upgradeId];
        if (currentLvl >= upgradeMaxLevels[upgradeId]) return Infinity; // Max level reached
        if (currentLvl < this.upgradeCosts[upgradeId].length) {
            return this.upgradeCosts[upgradeId][currentLvl];
        }
        return Infinity; // Should not happen if maxLevels is set correctly
    }

    buyUpgrade(upgradeId) {
        if (gameState !== 'upgrade') return;

        let cost = this.getCost(upgradeId);
        let currentLvl = upgradeLevels[upgradeId];
        let maxLvl = upgradeMaxLevels[upgradeId];

        if (currentLvl < maxLvl && score >= cost) {
            score -= cost;
            upgradeLevels[upgradeId]++;
            console.log(`Upgraded ${upgradeId} to level ${upgradeLevels[upgradeId]} for ${cost}. Current score: ${score}`);
            player.applyUpgrades(); // Apply immediately to update stats (like max health shown)
            /* playSound('upgrade_buy'); */
        } else if (currentLvl >= maxLvl) {
            console.log(`${upgradeId} is already at max level.`);
            /* playSound('upgrade_fail'); */
        } else {
            console.log(`Not enough score for ${upgradeId}. Need ${cost}, have ${score}.`);
            /* playSound('upgrade_fail'); */
        }
    }

     continueGame() {
        if (gameState !== 'upgrade') return;
        console.log("Continuing to level", currentLevel);
        gameState = 'playing';
        createLevel(currentLevel); // Load the next level layout
        // loop(); // Resume loop if noLoop() was used
    }

    handleClick(mx, my) {
        for (let btn of this.buttons) {
            if (mx > btn.x && mx < btn.x + btn.w && my > btn.y && my < btn.y + btn.h) {
                if (btn.id === 'continue') {
                     this.continueGame();
                } else {
                    this.buyUpgrade(btn.id);
                }
                break; // Only handle one button click
            }
        }
    }

    display() {
        push();
        resetMatrix(); // Draw in screen space

        // Semi-transparent background
        fill(menuBgColor);
        noStroke();
        rect(0, 0, width, height);

        // Title
        fill(menuTextColor);
        textSize(48);
        textAlign(CENTER, CENTER);
        text('Upgrades', width / 2, 80);

        // Current Score
        textSize(24);
        text(`Score: ${score}`, width / 2, 140);


        // Draw Buttons
        for (let btn of this.buttons) {
            let isHover = (mouseX > btn.x && mouseX < btn.x + btn.w && mouseY > btn.y && mouseY < btn.y + btn.h);
            let cost = Infinity;
            let currentLvl = 0;
            let maxLvl = 0;
            let isMaxed = false;
            let canAfford = false;

            if (btn.id !== 'continue') {
                 cost = this.getCost(btn.id);
                 currentLvl = upgradeLevels[btn.id];
                 maxLvl = upgradeMaxLevels[btn.id];
                 isMaxed = (currentLvl >= maxLvl);
                 canAfford = (score >= cost);
            }

            // Button Color
            if (btn.id === 'continue') {
                 fill(isHover ? menuButtonHoverColor : menuButtonColor);
            } else if (isMaxed) {
                 fill(menuButtonDisabledColor); // Grey out if maxed
            } else if (isHover && canAfford) {
                 fill(menuButtonHoverColor);
            } else if (isHover && !canAfford) {
                 fill(lerpColor(menuButtonDisabledColor, menuButtonHoverColor, 0.3)); // Slight hover if cannot afford
            } else if (canAfford) {
                 fill(menuButtonColor);
            } else {
                 fill(menuButtonDisabledColor); // Grey out if cannot afford
            }

            stroke(menuTextColor);
            strokeWeight(1);
            rect(btn.x, btn.y, btn.w, btn.h, 8);

            // Button Text
            fill(menuTextColor);
            noStroke();
            textAlign(CENTER, CENTER);

            if (btn.id === 'continue') {
                textSize(24);
                text(btn.text, btn.x + btn.w / 2, btn.y + btn.h / 2);
            } else {
                // Upgrade Buttons Text
                textSize(18);
                text(btn.text, btn.x + btn.w / 2, btn.y + btn.h * 0.3); // Title higher up

                textSize(14);
                if (isMaxed) {
                    text(`Level: ${currentLvl}/${maxLvl} (MAX)`, btn.x + btn.w / 2, btn.y + btn.h * 0.6);
                    text("-", btn.x + btn.w / 2, btn.y + btn.h * 0.8); // Cost line
                } else {
                     text(`Level: ${currentLvl}/${maxLvl}`, btn.x + btn.w / 2, btn.y + btn.h * 0.6);
                     // Set text color based on affordability for cost
                     if (canAfford) { fill(menuTextColor); } else { fill(255, 80, 80); } // Red if cannot afford
                     text(`Cost: ${cost}`, btn.x + btn.w / 2, btn.y + btn.h * 0.8);
                }
            }
        }
        pop();
    }
}

// --- Game Over / Win Screens ---
function drawGameOverScreen() {
    push();
    resetMatrix();
    fill(0, 0, 0, 180); // Dark overlay
    rect(0, 0, width, height);

    fill(255, 50, 50);
    textSize(64);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2 - 40);

    fill(220);
    textSize(24);
    text(`Final Score: ${score}`, width / 2, height / 2 + 30);
    textSize(18);
    text("Click or Press Enter/Space to Restart", width / 2, height / 2 + 80);
    pop();
}

function drawWinScreen() {
     push();
    resetMatrix();
    fill(50, 50, 200, 180); // Blueish overlay
    rect(0, 0, width, height);

    fill(255, 255, 100);
    textSize(64);
    textAlign(CENTER, CENTER);
    text("YOU WIN!", width / 2, height / 2 - 40);

    fill(220);
    textSize(24);
    text(`Final Score: ${score}`, width / 2, height / 2 + 30);
     textSize(18);
    text("Click or Press Enter/Space to Restart", width / 2, height / 2 + 80);
    pop();
}
