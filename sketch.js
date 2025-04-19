// --- Features ---
// - Rainbow Bullets (Hue Cycling)
// - Ship Upgrade System (Fire Rate, Spread Shot) via Keyboard ('1', '2')
// - Score-based Shield System (Gain shield charge every 25 points)
// - Redesigned Spaceship Look
// - Dynamic Parallax Star Background
// - Enhanced Engine Thrust Effect
// - Asteroid Splitting
// - Player Lives
// - Simple Explosion Particles
// - Score-based Difficulty Increase
// --- Modifications ---
// - Upgrade costs reduced.
// - Asteroids only spawn from Top, Left, and Right edges.
// - Asteroid speed reduced.
// - Ship movement changed to free keyboard control (Arrows/WASD).
// - Added Spacebar as an alternative shooting key.
// - Score per asteroid hit increased to 2 points.
// - Background gradient color changes every 10 seconds.
// --------------------------

let ship;
let bullets = [];
let asteroids = [];
let particles = [];
let stars = [];
let score = 0;
let baseAsteroidSpawnRate = 0.01; // Initial chance of spawning an asteroid per frame
let currentAsteroidSpawnRate = baseAsteroidSpawnRate; // Dynamic spawn rate
let isGameOver = false;
let lives = 3;
let initialAsteroids = 5; // Asteroids at the start of the game
let minAsteroidSize = 15; // Smallest size before an asteroid is destroyed instead of splitting
const SHIELD_SCORE_THRESHOLD = 25; // How many points needed to gain one shield charge

// --- Upgrade System Variables ---
let upgradeMessage = ""; // Message displayed after upgrade attempt
let upgradeMessageTimeout = 0; // Countdown timer for how long the message shows

// --- NEW: Background Color Variables ---
let currentTopColor;
let currentBottomColor;
const BACKGROUND_CHANGE_INTERVAL = 600; // Change background every 600 frames (10 seconds at 60fps)


// ==================
// p5.js Setup Function
// Runs once at the beginning
// ==================
function setup() {
  createCanvas(windowWidth, windowHeight); // Create canvas filling the window
  colorMode(HSB, 360, 100, 100, 100); // Use HSB color mode
  ship = new Ship(); // Create the player's ship object
  spawnInitialAsteroids(); // Create the first wave of asteroids
  createStarfield(200); // Create the background starfield
  textAlign(CENTER, CENTER); // Set default text alignment
  textSize(20); // Set default text size

  // --- NEW: Initialize background colors ---
  currentTopColor = color(260, 80, 10); // Initial dark blue/purple top
  currentBottomColor = color(240, 70, 25); // Initial slightly lighter blue bottom
}

// ==================
// Helper Functions
// ==================

// Creates the initial set of asteroids at the start of the game
function spawnInitialAsteroids() {
    asteroids = []; // Clear any existing asteroids
    for (let i = 0; i < initialAsteroids; i++) {
        let startPos;
        // Ensure ship exists before accessing its properties (safety check)
        let shipX = ship ? ship.pos.x : width / 2; // Use ship.pos.x now
        let shipY = ship ? ship.pos.y : height - 50; // Use ship.pos.y now
        // Find a spawn position that isn't too close to the player's starting area
        do {
             // Initial asteroids spawn higher up the screen
             startPos = createVector(random(width), random(height * 0.7));
        } while (dist(startPos.x, startPos.y, shipX, shipY) < 150); // Keep distance > 150 pixels
        // Create asteroid using constructor that takes position (gets random velocity)
        asteroids.push(new Asteroid(startPos.x, startPos.y));
    }
}

// Creates particles (for explosions, shield hits, etc.)
function createParticles(x, y, count, particleColor) {
    let baseHue = hue(particleColor);
    let baseSat = saturation(particleColor);
    let baseBri = brightness(particleColor);
    for (let i = 0; i < count; i++) {
        // Create particles with slight color variations
        let pColor = color(
            baseHue + random(-10, 10), // Slight hue shift
            baseSat * random(0.8, 1.0), // Slight saturation variation
            baseBri * random(0.9, 1.0), // Slight brightness variation
            100 // Start fully opaque
        );
        particles.push(new Particle(x, y, pColor));
    }
}

// Creates the star objects for the parallax background
function createStarfield(numStars) {
    stars = []; // Clear existing stars
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }
}

// ==================
// p5.js Draw Loop
// Runs continuously (typically 60 times per second)
// ==================
function draw() {
  // --- NEW: Check for background color change ---
  // Check frameCount, ensuring it's not the very first frame (frameCount=0)
  if (frameCount > 0 && frameCount % BACKGROUND_CHANGE_INTERVAL === 0) {
      // Generate new random HSB colors within space-like ranges
      let topH = random(180, 300); // Blues, purples, magentas for top
      let bottomH = (topH + random(20, 60)) % 360; // Related but different hue for bottom
      currentTopColor = color(topH, random(70, 90), random(10, 20)); // Darker top
      currentBottomColor = color(bottomH, random(60, 85), random(25, 40)); // Slightly lighter bottom
  }

  // Draw the background using current colors
  drawBackgroundAndStars();

  // If game is over, display game over screen and stop main game loop
  if (isGameOver) {
    displayGameOver();
    return; // Skip the rest of the draw function
  }

  // --- Update & Draw Active Game Elements ---
  ship.update(); // Update ship position, velocity, cooldowns, etc.
  ship.draw();   // Draw the ship (includes shield visual if active)

  // Update and draw bullets (iterate backwards for safe removal)
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].draw();
    // Remove bullets that go off-screen
    if (bullets[i].isOffscreen()) {
      bullets.splice(i, 1); // Remove 1 element at index i
    }
  }

  // Update and draw particles (iterate backwards for safe removal)
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    // Remove particles whose lifespan is over
    if (particles[i].isDead()) {
      particles.splice(i, 1); // Remove 1 element at index i
    }
  }

  // Update, draw asteroids, and handle collisions
  handleAsteroidsAndCollisions();

  // --- Spawn New Asteroids Periodically ---
  // Increase spawn rate slightly based on score
  currentAsteroidSpawnRate = baseAsteroidSpawnRate + (score * 0.0001);
  // Spawn a new asteroid based on the current rate (if asteroid count is below limit)
  if (random(1) < currentAsteroidSpawnRate && asteroids.length < 25) {
    // Call constructor WITHOUT coordinates for edge spawning (Top, Left, Right only)
    asteroids.push(new Asteroid());
  }

  // --- Display Heads-Up Display (Score, Lives, Shields, Upgrades) ---
  displayHUD();

  // --- Display Temporary Messages (Upgrades, Shield Gain) ---
  if (upgradeMessageTimeout > 0) {
      displayUpgradeMessage();
      upgradeMessageTimeout--; // Decrease message timer
  }
}

// ==================
// Collision Handling Function
// Manages interactions between bullets, asteroids, and the ship
// ==================
function handleAsteroidsAndCollisions() {
    // Iterate backwards through asteroids for safe removal during collision checks
    for (let i = asteroids.length - 1; i >= 0; i--) {
        // Safety check: ensure asteroid exists before processing
        if (!asteroids[i]) continue;

        asteroids[i].update(); // Move and rotate asteroid
        asteroids[i].draw();   // Draw asteroid

        // --- Bullet vs Asteroid Collision Check ---
        let asteroidHitByBullet = false;
        // Iterate backwards through bullets
        for (let j = bullets.length - 1; j >= 0; j--) {
            // Ensure both asteroid and bullet exist before checking
            if (asteroids[i] && bullets[j] && asteroids[i].hits(bullets[j])) {
                // --- Score and Shield Gain Logic ---
                let oldScore = score;
                score += 2; // MODIFIED: Increment score by 2
                // Check if score crossed a shield threshold
                let shieldsToAdd = floor(score / SHIELD_SCORE_THRESHOLD) - floor(oldScore / SHIELD_SCORE_THRESHOLD);
                if (shieldsToAdd > 0) {
                    ship.gainShields(shieldsToAdd); // Add shield charge(s)
                    // Display feedback message
                    upgradeMessage = `+${shieldsToAdd} SHIELD CHARGE(S)!`;
                    upgradeMessageTimeout = 90; // Show message for 1.5 seconds
                }
                // --- End Score/Shield Logic ---

                // Store asteroid properties before removing it (for particles/splitting)
                let currentAsteroid = asteroids[i];
                let asteroidPos = currentAsteroid.pos.copy();
                let asteroidSize = currentAsteroid.size;
                let asteroidColor = currentAsteroid.color;

                // Remove the hit asteroid and the bullet
                asteroids.splice(i, 1);
                bullets.splice(j, 1);
                asteroidHitByBullet = true; // Mark asteroid as hit

                // Create explosion particles
                createParticles(asteroidPos.x, asteroidPos.y, floor(asteroidSize / 3), asteroidColor);

                // Split asteroid into smaller pieces if it was large enough
                if (asteroidSize > minAsteroidSize * 2) {
                    let newSize = asteroidSize * 0.6; // Size of new pieces
                    // --- Slower split piece speed ---
                    let splitSpeedMultiplier = random(0.8, 2.0); // Reduced speed range for split pieces
                    let vel1 = p5.Vector.random2D().mult(splitSpeedMultiplier); // Random direction, adjusted speed
                    let vel2 = p5.Vector.random2D().mult(splitSpeedMultiplier); // Random direction, adjusted speed
                    // Create two new asteroids at the position of the destroyed one
                    asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel1));
                    asteroids.push(new Asteroid(asteroidPos.x, asteroidPos.y, newSize, vel2));
                }
                break; // Exit the bullet loop for this asteroid (it's gone)
            }
        }

        // If asteroid was hit by a bullet, skip the ship collision check for it
        if (asteroidHitByBullet) continue;

        // --- Ship vs Asteroid Collision Check ---
        // Check again if asteroid still exists (important for safety)
        if (asteroids[i] && asteroids[i].hitsShip(ship)) {
            // --- Shield Check ---
            if (ship.shieldCharges > 0) {
                // Shield Absorbs Hit
                ship.loseShield(); // Use one shield charge
                // Create shield impact particles (blue/cyan)
                createParticles(ship.pos.x, ship.pos.y, 25, color(180, 80, 100)); // Use ship.pos
                // Asteroid still explodes
                createParticles(asteroids[i].pos.x, asteroids[i].pos.y, floor(asteroids[i].size / 3), asteroids[i].color);
                asteroids.splice(i, 1); // Destroy the asteroid
                // Player does NOT lose a life
            } else {
                // --- No Shield: Player Loses Life ---
                lives--; // Decrement lives
                // Create ship explosion particles (red/orange)
                createParticles(ship.pos.x, ship.pos.y, 30, color(0, 80, 100)); // Use ship.pos

                // Check for Game Over
                if (lives <= 0) {
                    isGameOver = true;
                } else {
                    // Respawn ship
                    ship.resetPosition();
                    // Destroy the asteroid that hit the ship
                    createParticles(asteroids[i].pos.x, asteroids[i].pos.y, floor(asteroids[i].size / 3), asteroids[i].color);
                    asteroids.splice(i, 1);
                    // Consider adding brief invulnerability after respawn here
                }
            }
             // --- End Shield Check ---
        } // End Ship vs Asteroid Check
    } // End Asteroid Loop
}

// ==================
// Background Drawing Function
// Draws the gradient background and stars using current colors
// ==================
function drawBackgroundAndStars() {
    // --- MODIFIED: Use global color variables ---
    // Draw gradient line by line using currentTopColor and currentBottomColor
    for(let y=0; y < height; y++){
        let inter = map(y, 0, height, 0, 1); // Interpolation factor
        // Lerp between the current global colors
        let c = lerpColor(currentTopColor, currentBottomColor, inter);
        stroke(c); // Set line color
        line(0, y, width, y); // Draw horizontal line
    }
    noStroke(); // Reset stroke setting

    // Draw parallax stars
    for (let star of stars) {
        star.update(); // Move star
        star.draw();   // Draw star
    }
}

// ==================
// Display Functions
// Handle drawing text elements like HUD, messages, game over screen
// ==================

// Draws the main Heads-Up Display (Score, Lives, Shields, Upgrade Info)
function displayHUD() {
  fill(0, 0, 100, 80); // Set text color (white with some transparency)
  noStroke();
  textSize(18); // Set HUD text size
  textAlign(LEFT, TOP); // Align text to top-left
  // Display Score, Lives, Shields
  text("Score: " + score, 15, 15);
  text("Lives: " + lives, 15, 40);
  text("Shields: " + ship.shieldCharges, 15, 65);

  // Display Upgrade Information (aligned to top-right)
  textAlign(RIGHT, TOP);
  let fireRateCost = ship.getUpgradeCost('fireRate');
  let spreadShotCost = ship.getUpgradeCost('spreadShot');

  // Set color based on availability (Green if affordable, Grey if maxed)
  fill(ship.fireRateLevel < ship.maxLevel ? color(120, 70, 90) : color(0, 0, 50));
  text(`[1] Rate (${ship.fireRateLevel}/${ship.maxLevel}): ${fireRateCost} pts`, width - 15, 15);

  fill(ship.spreadShotLevel < ship.maxLevel ? color(120, 70, 90) : color(0, 0, 50));
  text(`[2] Spread (${ship.spreadShotLevel}/${ship.maxLevel}): ${spreadShotCost} pts`, width - 15, 40);
}

// Displays temporary messages (like upgrade status or shield gain) at the bottom center
function displayUpgradeMessage() {
    fill(0, 0, 100); // White text
    textSize(16);
    textAlign(CENTER, BOTTOM); // Align to bottom-center
    text(upgradeMessage, width / 2, height - 20); // Position message
}

// Displays the Game Over screen
function displayGameOver() {
    // Keep drawing the background using the *last active* colors
    drawBackgroundAndStars();

    // Draw a semi-transparent overlay to dim the background
    fill(0, 0, 0, 50); // Black with 50% alpha
    rect(0, 0, width, height);

    // Display "GAME OVER" text (large, red)
    fill(0, 90, 100); // Red color
    textSize(60);
    textAlign(CENTER, CENTER); // Center align text
    text("GAME OVER", width / 2, height / 2 - 50);

    // Display Final Score (white)
    fill(0, 0, 100); // White color
    textSize(30);
    text("Final Score: " + score, width / 2, height / 2 + 10);

    // Display "Click to Restart" prompt (pulsing white)
    textSize(22);
    let pulse = map(sin(frameCount * 0.1), -1, 1, 60, 100); // Calculate pulsing brightness
    fill(0, 0, pulse); // Apply pulsing brightness
    text("Click to Restart", width / 2, height / 2 + 60);

    cursor(ARROW); // Show the default mouse cursor on game over screen
}

// Resets the game state to start a new game
function resetGame() {
    ship = new Ship(); // Create a new ship (resets upgrades, shields, position, velocity)
    bullets = [];      // Clear bullets array
    particles = [];    // Clear particles array
    asteroids = [];    // Clear asteroids array
    score = 0;         // Reset score
    lives = 3;         // Reset lives
    currentAsteroidSpawnRate = baseAsteroidSpawnRate; // Reset spawn rate
    isGameOver = false; // Set game state back to active
    spawnInitialAsteroids(); // Spawn the starting asteroids
    createStarfield(200); // Re-create the starfield
    // Reset background colors to initial state
    currentTopColor = color(260, 80, 10);
    currentBottomColor = color(240, 70, 25);
    frameCount = 0; // Reset frameCount to restart background timer accurately
    // cursor(ARROW); // Ensure cursor is visible if needed, or use noCursor() if preferred
}


// ==================
// Input Handling Functions
// Respond to mouse clicks, key presses, window resizing
// ==================

// Called automatically when the mouse button is pressed
function mousePressed() {
  // If the game is over, clicking restarts the game
  if (isGameOver) {
     resetGame();
  } else {
    // If the game is active, clicking fires the ship's weapon
    ship.shoot();
  }
}

// Called automatically when a key on the keyboard is pressed
function keyPressed() {
    // Ignore key presses if the game is over
    if (isGameOver) return;

    // Handle upgrade keys ('1' and '2')
    if (key === '1') {
        ship.attemptUpgrade('fireRate'); // Attempt to upgrade fire rate
    } else if (key === '2') {
        ship.attemptUpgrade('spreadShot'); // Attempt to upgrade spread shot
    }
    // --- MODIFIED: Add Spacebar shooting ---
    else if (keyCode === 32) { // 32 is the keyCode for SPACEBAR
        ship.shoot(); // Call the same shoot function as mousePressed
        // Optional: Prevent default browser behavior for spacebar (e.g., scrolling)
        // return false; // Uncomment if spacebar causes unwanted page scrolling
    }
    // Add more key bindings here for other actions or upgrades (e.g., '3')
    // Note: Movement is handled by keyIsDown() in Ship.update()
}


// Called automatically when the browser window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Adjust canvas size
  createStarfield(200); // Re-create starfield for new dimensions
  // If the ship exists, reset its position (which accounts for new height)
  if (ship) {
      ship.resetPosition(); // Reposition the ship correctly
  }
}


// ==================
// Ship Class
// Defines the player's spaceship object
// ==================
class Ship {
  constructor() {
    // --- NEW: Use p5.Vector for position and velocity ---
    this.pos = createVector(width / 2, height - 50); // Start position vector
    this.vel = createVector(0, 0); // Initial velocity vector (starts stationary)
    this.thrust = 0.3; // Acceleration force when moving
    this.friction = 0.98; // Slowdown factor (closer to 1 = less friction)
    this.maxSpeed = 7; // Maximum speed limit

    // Appearance
    this.size = 30;          // Reference size for drawing and collision
    this.color = color(200, 80, 95);        // Main body color (cyan-ish)
    this.cockpitColor = color(180, 100, 100); // Cockpit color (bright blue)
    this.engineColor1 = color(30, 100, 100);  // Inner engine flame color (orange)
    this.engineColor2 = color(0, 100, 100);   // Outer engine glow color (red)

    // Weapon and Cooldown
    this.shootCooldown = 0; // Timer preventing continuous firing

    // Shield System
    this.shieldCharges = 0; // Number of hits the shield can take
    this.shieldVisualRadius = this.size * 1.1; // Increased radius for shield visual/collision

    // Upgrade System Properties
    this.maxLevel = 5;        // Maximum level for upgrades
    this.fireRateLevel = 0;   // Current level for fire rate
    this.spreadShotLevel = 0; // Current level for spread shot

    // Fire Rate Calculation
    this.baseShootDelay = 15;    // Cooldown frames at level 0
    this.shootDelayPerLevel = 2; // Cooldown reduction per level

    // Upgrade Cost Calculation (Cheaper costs applied)
    this.baseUpgradeCost = 30;   // Cost of level 1 upgrade
    this.costMultiplier = 2.0;   // Cost increases by this factor each level
  }

  // --- Shield Methods ---
  gainShields(amount) {
      this.shieldCharges += amount;
  }

  loseShield() {
      if (this.shieldCharges > 0) {
          this.shieldCharges--; // Decrease shield count
      }
  }

  // --- Upgrade Methods ---
  get currentShootDelay() {
      return max(3, this.baseShootDelay - (this.fireRateLevel * this.shootDelayPerLevel));
  }

  getUpgradeCost(upgradeType) {
      let level;
      if (upgradeType === 'fireRate') level = this.fireRateLevel;
      else if (upgradeType === 'spreadShot') level = this.spreadShotLevel;
      else return Infinity;
      if (level >= this.maxLevel) return "MAX";
      return floor(this.baseUpgradeCost * pow(this.costMultiplier, level));
  }

  attemptUpgrade(upgradeType) {
      let cost = this.getUpgradeCost(upgradeType);
      let currentLevel;
      let upgradeName = upgradeType.replace(/([A-Z])/g, ' $1').toUpperCase();
      if (upgradeType === 'fireRate') currentLevel = this.fireRateLevel;
      else if (upgradeType === 'spreadShot') currentLevel = this.spreadShotLevel;
      else return;
      if (currentLevel < this.maxLevel && typeof cost === 'number' && score >= cost) {
          score -= cost;
          if (upgradeType === 'fireRate') this.fireRateLevel++;
          else if (upgradeType === 'spreadShot') this.spreadShotLevel++;
          upgradeMessage = `${upgradeName} UPGRADED! (Level ${currentLevel + 1})`;
      } else if (currentLevel >= this.maxLevel) {
          upgradeMessage = `${upgradeName} MAX LEVEL!`;
      } else if (typeof cost === 'number') {
          upgradeMessage = `NEED ${cost} PTS FOR ${upgradeName}!`;
      } else {
           upgradeMessage = `CANNOT UPGRADE ${upgradeName}`;
      }
      upgradeMessageTimeout = 120;
  }

  resetUpgrades() {
      this.fireRateLevel = 0;
      this.spreadShotLevel = 0;
  }

  // --- General Ship Methods ---
  // Reset ship's position and velocity
  resetPosition() {
      this.pos.set(width / 2, height - 50); // Reset position to center bottom
      this.vel.set(0, 0); // Reset velocity to zero
  }

  // Update ship's state each frame (handles movement)
  update() {
    // --- Keyboard Movement ---
    // Check which movement keys are currently held down
    let movingUp = keyIsDown(UP_ARROW) || keyIsDown(87);    // 87 is 'W'
    let movingDown = keyIsDown(DOWN_ARROW) || keyIsDown(83);  // 83 is 'S'
    let movingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65);   // 65 is 'A'
    let movingRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68); // 68 is 'D'

    // Apply thrust based on key presses
    if (movingUp) {
        this.vel.y -= this.thrust;
    }
    if (movingDown) {
        this.vel.y += this.thrust;
    }
    if (movingLeft) {
        this.vel.x -= this.thrust;
    }
    if (movingRight) {
        this.vel.x += this.thrust;
    }

    // Apply friction to slow the ship down gradually
    this.vel.mult(this.friction);

    // Limit maximum speed
    this.vel.limit(this.maxSpeed);

    // Update position based on velocity
    this.pos.add(this.vel);

    // --- Screen Constraints ---
    // Prevent ship from going off-screen (adjust margins based on size)
    let margin = this.size * 0.7; // Use approx half size as margin
    this.pos.x = constrain(this.pos.x, margin, width - margin);
    this.pos.y = constrain(this.pos.y, margin, height - margin);

    // --- Shooting Cooldown ---
    if (this.shootCooldown > 0) {
        this.shootCooldown--;
    }
  }

  // Fire bullets from the ship
  shoot() {
      if (this.shootCooldown <= 0) {
          let bulletX = this.pos.x; // Use ship.pos.x
          let bulletY = this.pos.y - this.size * 0.6; // Use ship.pos.y

          let numShots = 1;
          let spreadAngle = 0;
          if (this.spreadShotLevel >= 1 && this.spreadShotLevel <= 2) {
              numShots = 3; spreadAngle = PI / 20;
          } else if (this.spreadShotLevel >= 3 && this.spreadShotLevel <= 4) {
              numShots = 3; spreadAngle = PI / 15;
          } else if (this.spreadShotLevel >= this.maxLevel) {
              numShots = 5; spreadAngle = PI / 12;
          }

          for (let i = 0; i < numShots; i++) {
              let angle = 0;
              if (numShots > 1) {
                  angle = map(i, 0, numShots - 1, -spreadAngle, spreadAngle);
              }
              bullets.push(new Bullet(bulletX, bulletY, angle));
          }
          this.shootCooldown = this.currentShootDelay;
      }
  }

  // Draw the ship and its effects (shield, engine)
  draw() {
    push(); // Isolate drawing state
    translate(this.pos.x, this.pos.y); // Move origin to ship's position (using this.pos)

    // --- Draw Shield Visual ---
    if (this.shieldCharges > 0) {
        let shieldAlpha = map(sin(frameCount * 0.15), -1, 1, 40, 80);
        let shieldHue = 180;
        fill(shieldHue, 80, 100, shieldAlpha);
        noStroke();
        ellipse(0, 0, this.shieldVisualRadius * 2, this.shieldVisualRadius * 2); // Adjusted radius usage
        strokeWeight(1.5);
        stroke(shieldHue, 90, 100, shieldAlpha + 30);
        noFill();
        ellipse(0, 0, this.shieldVisualRadius * 2, this.shieldVisualRadius * 2); // Adjusted radius usage
    }

    // --- Draw Engine Glow ---
    // Engine visual effect remains relative to the ship's orientation (points "down")
    // Determine pulse based on vertical velocity or general activity? Let's keep it simple for now.
    let enginePulseFactor = 1.0 + abs(this.vel.y) * 0.1; // Pulse slightly based on vertical speed
    let enginePulse = map(sin(frameCount * 0.2), -1, 1, 0.8, 1.2) * enginePulseFactor;
    let engineSize = this.size * 0.5 * enginePulse;
    let engineBrightness = map(sin(frameCount * 0.3), -1, 1, 80, 100);
    noStroke();
    for (let i = engineSize * 1.5; i > 0; i -= 3) {
        let alpha = map(i, 0, engineSize * 1.5, 0, 30);
        fill(hue(this.engineColor2), 100, engineBrightness, alpha);
        ellipse(0, this.size * 0.5, i, i * 1.5); // Positioned below center
    }
    fill(hue(this.engineColor1), 100, 100);
    ellipse(0, this.size * 0.5, engineSize * 0.6, engineSize * 1.2); // Positioned below center

    // --- Draw Ship Body ---
    stroke(0, 0, 80);
    strokeWeight(1.5);
    fill(this.color);
    beginShape();
    vertex(0, -this.size * 0.7);
    bezierVertex( this.size * 0.5, -this.size * 0.4, this.size * 0.6,  this.size * 0.1, this.size * 0.7,  this.size * 0.4);
    bezierVertex( this.size * 0.4,  this.size * 0.5, -this.size * 0.4,  this.size * 0.5, -this.size * 0.7,  this.size * 0.4);
    bezierVertex(-this.size * 0.6,  this.size * 0.1, -this.size * 0.5, -this.size * 0.4, 0, -this.size * 0.7);
    endShape(CLOSE);

    // --- Draw Cockpit ---
    fill(this.cockpitColor);
    noStroke();
    ellipse(0, -this.size * 0.15, this.size * 0.4, this.size * 0.5);
    fill(0, 0, 100, 50);
    ellipse(0, -this.size * 0.2, this.size * 0.2, this.size * 0.25);

    pop(); // Restore original drawing state
  }
}

// ==================
// Bullet Class
// Defines the projectiles fired by the ship
// ==================
class Bullet {
  constructor(x, y, angle = 0) { // Takes position and optional spread angle
    this.pos = createVector(x, y); // Position stored as a p5.Vector
    this.speed = 16;              // Speed of the bullet
    this.size = 5;                // Radius used for drawing/collision
    this.startHue = frameCount % 360; // Initial hue based on frame fired (for rainbow effect)
    this.hue = this.startHue;      // Current hue, cycles over time
    let baseAngle = -PI / 2;       // Base angle pointing straight up
    // Calculate velocity vector based on base angle + spread angle
    this.vel = p5.Vector.fromAngle(baseAngle + angle);
    this.vel.mult(this.speed);     // Apply speed to the velocity vector
  }

  // Update bullet state each frame
  update() {
    this.pos.add(this.vel);       // Move bullet according to its velocity
    this.hue = (this.hue + 4) % 360; // Cycle hue value (wraps around at 360)
  }

  // Draw the bullet
  draw() {
    fill(this.hue, 90, 100);     // Use cycling hue, high saturation/brightness
    stroke(0, 0, 100);           // White outline for better visibility
    strokeWeight(1);
    // Draw as an elongated ellipse
    ellipse(this.pos.x, this.pos.y, this.size, this.size * 2.5);
  }

  // Check if the bullet is far off-screen
  isOffscreen() {
    let margin = this.size * 3; // Define a margin around the screen
    return (this.pos.y < -margin || this.pos.y > height + margin ||
            this.pos.x < -margin || this.pos.x > width + margin);
  }
}

// ==================
// Asteroid Class
// Defines the asteroid objects
// ==================
class Asteroid {
  constructor(x, y, size, vel) { // Can be called with position, size, velocity (for splits) or without (for edge spawns)
    // Determine size: use provided size or generate a random one
    this.size = size || random(30, 80);
    this.pos = createVector(); // Position vector
    // Flag to check if coordinates were provided (true for initial/split asteroids)
    let isInitialPlacement = (x !== undefined && y !== undefined);

    // --- Set initial position ---
    if (isInitialPlacement) {
      // Use the provided x, y coordinates
      this.pos.x = x; this.pos.y = y;
    } else {
      // No coordinates provided: Spawn from Top, Left, or Right edge
      let edge = floor(random(3)); // Randomly select edge (0=Top, 1=Right, 2=Left)

      if (edge === 0) { // Top Edge
        this.pos.x = random(width); // Random x along top edge
        this.pos.y = -this.size / 2; // Start just above the screen
      } else if (edge === 1) { // Right Edge
        this.pos.x = width + this.size / 2; // Start just off the right edge
        this.pos.y = random(height * 0.7); // Random y in the upper 70% of screen height
      } else { // Left Edge (edge === 2)
        this.pos.x = -this.size / 2; // Start just off the left edge
        this.pos.y = random(height * 0.7); // Random y in the upper 70% of screen height
      }
    }

    // --- Set velocity ---
    if (vel) {
      // Use the provided velocity vector (used for split asteroids)
      this.vel = vel;
    } else {
      // Calculate velocity for new/initial asteroids
       // --- Slower asteroid speed ---
       this.speed = random(0.6, 1.8) * (this.size > 50 ? 0.9 : 1.1); // Reduced speed range and adjusted multiplier

       if (isInitialPlacement) {
           // Initial asteroids (placed manually at start) get a fully random direction
           this.vel = p5.Vector.random2D();
       } else {
           // Edge-spawned asteroids head generally towards the center region
           let targetX = width / 2 + random(-width * 0.25, width * 0.25); // Target x near center
           let targetY = height / 2 + random(-height * 0.25, height * 0.25); // Target y near center
           // Calculate direction vector from spawn point to target point
           let direction = createVector(targetX - this.pos.x, targetY - this.pos.y);
           direction.normalize(); // Convert to unit vector (length 1)
           direction.rotate(random(-PI / 12, PI / 12)); // Add slight random deviation to angle
           this.vel = direction; // Assign the calculated direction vector
       }
       this.vel.mult(this.speed); // Apply the calculated speed to the direction vector
    }

    // --- Visual properties ---
    this.color = color(random(20, 50), random(30, 70), random(30, 60)); // Dusty brown/grey color range
    this.rotation = random(TWO_PI); // Random initial rotation angle
    this.rotationSpeed = random(-0.025, 0.025); // Random slow spin speed and direction

    // --- Create vertices for irregular shape ---
    this.vertices = []; // Array to hold vertex points relative to center
    let numVertices = floor(random(7, 15)); // Random number of vertices for the shape
    for (let i = 0; i < numVertices; i++) {
      // Calculate angle for this vertex
      let angleOffset = map(i, 0, numVertices, 0, TWO_PI);
      // Calculate random radius for this vertex (base radius +/- variation)
      let r = this.size / 2 + random(-this.size * 0.35, this.size * 0.25); // Adjust range for jaggedness
      // Convert polar coordinates (angle, radius) to Cartesian (x, y) vector relative to center
      let v = p5.Vector.fromAngle(angleOffset + this.rotation); // Use initial rotation for consistency
      v.mult(r); // Apply the random radius
      this.vertices.push(v); // Add the vertex vector to the list
    }
  } // End of constructor

  // Update asteroid state each frame
  update() {
    this.pos.add(this.vel); // Move asteroid based on its velocity
    this.rotation += this.rotationSpeed; // Apply rotation

    // Implement screen wrap-around behavior
    let buffer = this.size; // Use a buffer slightly larger than radius for smoother wrapping
    if (this.pos.x < -buffer) this.pos.x = width + buffer;  // Wrap left to right
    if (this.pos.x > width + buffer) this.pos.x = -buffer; // Wrap right to left
    if (this.pos.y < -buffer) this.pos.y = height + buffer; // Wrap top to bottom
    if (this.pos.y > height + buffer) this.pos.y = -buffer; // Wrap bottom to top
  }

  // Draw the asteroid
  draw() {
    push(); // Isolate transformations and styles
    translate(this.pos.x, this.pos.y); // Move origin to asteroid's center
    rotate(this.rotation); // Apply current rotation

    // Style the asteroid
    fill(this.color); // Fill with its color
    // Set outline color (darker version of fill color)
    stroke(hue(this.color), saturation(this.color) * 0.5, brightness(this.color) * 1.5);
    strokeWeight(2); // Outline thickness

    // Draw the irregular shape using the pre-calculated vertices
    beginShape();
    for (let v of this.vertices) {
      vertex(v.x, v.y); // Add each vertex to the shape
    }
    endShape(CLOSE); // Close the shape by connecting the last vertex to the first

    pop(); // Restore previous drawing state
  }

  // Check collision with a bullet (approximated as circle-circle collision)
  hits(bullet) {
    // Calculate distance between centers
    let d = dist(this.pos.x, this.pos.y, bullet.pos.x, bullet.pos.y);
    // Collision occurs if distance is less than sum of their radii
    return d < this.size / 2 + bullet.size / 2; // Use half sizes (radii)
  }

  // Check collision with the ship (uses shield radius if active, else ship radius)
  hitsShip(ship) {
    let targetX = ship.pos.x; // Use ship.pos.x
    let targetY = ship.pos.y; // Use ship.pos.y
    // Determine the collision radius to use (shield or ship body)
    let targetRadius = ship.shieldCharges > 0 ? ship.shieldVisualRadius : ship.size * 0.5;
    // Calculate distance between centers
    let d = dist(this.pos.x, this.pos.y, targetX, targetY);
    // Collision occurs if distance is less than sum of radii
    return d < this.size / 2 + targetRadius;
  }
} // End of Asteroid class

// ==================
// Particle Class
// Defines small particles used for effects like explosions
// ==================
class Particle {
  constructor(x, y, particleColor) { // Takes starting position and color
    this.pos = createVector(x, y); // Position vector
    this.vel = p5.Vector.random2D(); // Random initial direction vector (length 1)
    this.vel.mult(random(1.5, 5)); // Apply random initial speed
    this.lifespan = 100; // Initial alpha value, decreases over time to fade out
    // Store base color components for easy access
    this.baseHue = hue(particleColor);
    this.baseSat = saturation(particleColor);
    this.baseBri = brightness(particleColor);
    this.size = random(2, 6); // Random particle size
  }

  // Update particle state each frame
  update() {
    this.pos.add(this.vel); // Move particle
    this.lifespan -= 3;    // Decrease lifespan (controls fade out speed)
    this.vel.mult(0.97);   // Apply friction/drag to slow down velocity
  }

  // Draw the particle
  draw() {
    noStroke(); // No outline for particles
    // Set fill color using base HSB and current lifespan as alpha
    fill(this.baseHue, this.baseSat, this.baseBri, this.lifespan);
    ellipse(this.pos.x, this.pos.y, this.size); // Draw as a small circle
  }

  // Check if the particle has faded out completely
  isDead() {
    return this.lifespan <= 0;
  }
}

// ==================
// Star Class
// Defines stars used in the parallax background effect
// ==================
class Star {
    constructor() {
        this.x = random(width); // Random initial x position
        this.y = random(height); // Random initial y position
        // Assign star to one of 3 layers (0=distant, 1=middle, 2=near)
        this.layer = floor(random(3));
        // Determine size and speed based on layer (distant stars are smaller/slower)
        this.size = map(this.layer, 0, 2, 0.5, 2.5); // Map layer (0-2) to size (0.5-2.5)
        this.speed = map(this.layer, 0, 2, 0.1, 0.5); // Map layer (0-2) to speed (0.1-0.5)
        this.brightness = random(60, 100); // Random brightness for a twinkling effect
    }

    // Update star state each frame
    update() {
        // Move star vertically downwards based on its layer's speed
        this.y += this.speed;
        // If star moves off the bottom edge, wrap it around to the top
        if (this.y > height + this.size) {
            this.y = -this.size; // Reset y position to just above the top edge
            this.x = random(width); // Choose a new random x position for variety
        }
    }

    // Draw the star
    draw() {
        // Use HSB color (0, 0, brightness) for white/grey stars
        fill(0, 0, this.brightness);
        noStroke(); // No outline for stars
        ellipse(this.x, this.y, this.size); // Draw as a small circle
    }
}
