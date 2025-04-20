// ==================
// Ship Class (MODIFIED for speed)
// ==================
class Ship {
  constructor() {
    this.pos = createVector(width / 2, height - 50);
    this.vel = createVector(0, 0);
    // --- MODIFIED: Increased thrust for faster acceleration ---
    this.thrust = 0.38; // Was 0.3
    this.touchThrustMultiplier = 1.1;
    this.friction = 0.98; // Controls how quickly the ship slows down
    // --- MODIFIED: Increased maxSpeed for higher top speed ---
    this.maxSpeed = 9; // Was 7
    this.size = 30;
    this.cockpitColor = color(180, 100, 100);
    this.engineColor1 = color(30, 100, 100);
    this.engineColor2 = color(0, 100, 100);
    this.finColor = color(220, 60, 70);
    this.detailColor = color(0, 0, 60);
    this.shapeState = 0;
    this.shootCooldown = 0;
    this.baseShootDelay = 15;
    this.shootDelayPerLevel = 2;
    this.shieldCharges = 0;
    this.shieldVisualRadius = this.size * 1.1;
    this.invulnerableTimer = 0;
    this.invulnerabilityDuration = 120; // Frames (2 seconds at 60fps)
    this.maxLevel = 5; // Max upgrade level for fire rate/spread
    this.fireRateLevel = 0;
    this.spreadShotLevel = 0;
    this.autoFireLevel = 0; // 0 = off, 1 = on
    this.maxAutoFireLevel = 1;
    this.baseUpgradeCost = 30;
    this.costMultiplier = 2.0;
    this.autoFireCost = 50;
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
      this.fireRateLevel = 0;
      this.spreadShotLevel = 0;
      this.autoFireLevel = 0;
   }

  resetPosition() {
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
