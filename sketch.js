// ================= FLOOR =================
let floorY3;

// ================= BLOB =================
let blob3 = {
  x: 80,
  y: 0,

  r: 26,
  points: 48,
  wobble: 10,
  wobbleFreq: 1.2,

  t: 0,
  tSpeed: 0.02,

  vx: 0,
  vy: 0,

  accel: 0.7,
  maxRun: 5.2,
  gravity: 0.45,
  jumpV: -13.5,

  onGround: false,

  frictionAir: 0.995,
  frictionGround: 0.92,
};

// ================= PLATFORMS =================
let platforms = [];

// ================= PARTICLES =================
let joyParticles = [];

function setup() {
  createCanvas(640, 360);
  floorY3 = height - 36;

  noStroke();
  textFont("sans-serif");
  textSize(14);

  platforms = [
    { x: 0, y: floorY3, w: width, h: height - floorY3 },
    { x: 120, y: floorY3 - 70, w: 120, h: 12 },
    { x: 300, y: floorY3 - 120, w: 90, h: 12 },
    { x: 440, y: floorY3 - 180, w: 130, h: 12 },
    { x: 520, y: floorY3 - 70, w: 90, h: 12 },
  ];

  blob3.y = floorY3 - blob3.r - 1;
}

function draw() {
  drawJoySky();

  // Platforms (soft & playful)
  fill(180, 220, 255);
  for (const p of platforms) {
    rect(p.x, p.y, p.w, p.h, 10);
  }

  // ================= MOVEMENT INPUT =================
  let move = 0;
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) move -= 1;
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) move += 1;
  blob3.vx += blob3.accel * move;

  blob3.vx *= blob3.onGround ? blob3.frictionGround : blob3.frictionAir;
  blob3.vx = constrain(blob3.vx, -blob3.maxRun, blob3.maxRun);

  blob3.vy += blob3.gravity;

  let box = {
    x: blob3.x - blob3.r,
    y: blob3.y - blob3.r,
    w: blob3.r * 2,
    h: blob3.r * 2,
  };

  // Horizontal collisions
  box.x += blob3.vx;
  for (const s of platforms) {
    if (overlap(box, s)) {
      if (blob3.vx > 0) box.x = s.x - box.w;
      else if (blob3.vx < 0) box.x = s.x + s.w;
      blob3.vx = 0;
    }
  }

  // Vertical collisions
  box.y += blob3.vy;
  blob3.onGround = false;

  for (const s of platforms) {
    if (overlap(box, s)) {
      if (blob3.vy > 0) {
        box.y = s.y - box.h;

        // Joyful bounce
        if (blob3.vy > 2) {
          blob3.vy *= -0.25;
        } else {
          blob3.vy = 0;
          blob3.onGround = true;
        }
      } else if (blob3.vy < 0) {
        box.y = s.y + s.h;
        blob3.vy = 0;
      }
    }
  }

  blob3.x = box.x + box.w / 2;
  blob3.y = box.y + box.h / 2;
  blob3.x = constrain(blob3.x, blob3.r, width - blob3.r);

  blob3.t += blob3.tSpeed;

  drawHappyBlob(blob3);
  updateJoyParticles();

  fill(0);
  text("Move: A/D or ←/→   Jump: Space/W/↑", 10, 18);
}

// ================= SKY =================
function drawJoySky() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(255, 230, 255), color(200, 240, 255), inter);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();

  for (let i = 0; i < 6; i++) {
    let bx = (frameCount * 0.3 + i * 120) % width;
    let by = 60 + sin(frameCount * 0.02 + i) * 20;
    fill(255, 255, 255, 120);
    ellipse(bx, by, 30, 30);
  }
}

// ================= BLOB DRAW =================
function drawHappyBlob(b) {
  push();

  let stretch = map(abs(b.vy), 0, 10, 1, 1.25);
  let squash = 1 / stretch;

  translate(b.x, b.y);
  scale(stretch, squash);

  // 🎨 COLOR CHANGE WHEN JUMPING
  if (!b.onGround)
    fill(255, 230, 80); // yellow in air
  else fill(255, 180, 220); // pink on ground

  beginShape();
  for (let i = 0; i < b.points; i++) {
    const a = (i / b.points) * TAU;
    const n = noise(
      cos(a) * b.wobbleFreq + 100,
      sin(a) * b.wobbleFreq + 100,
      b.t,
    );
    const r = b.r + map(n, 0, 1, -b.wobble, b.wobble);
    vertex(cos(a) * r, sin(a) * r);
  }
  endShape(CLOSE);

  // Face
  scale(1 / stretch, 1 / squash);
  fill(0);
  ellipse(-8, -5, 4, 6);
  ellipse(8, -5, 4, 6);
  noFill();
  stroke(0);
  strokeWeight(2);
  arc(0, 4, 16, 10, 0, PI);
  noStroke();

  pop();
}

// ================= PARTICLES =================
function spawnJoyParticles(x, y) {
  for (let i = 0; i < 8; i++) {
    joyParticles.push({
      x: x,
      y: y,
      vx: random(-2, 2),
      vy: random(-3, -1),
      life: 40,
    });
  }
}

function updateJoyParticles() {
  for (let p of joyParticles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life--;
    fill(255, 220, 120, p.life * 6);
    ellipse(p.x, p.y, 6, 6);
  }
  joyParticles = joyParticles.filter((p) => p.life > 0);
}

// ================= COLLISION =================
function overlap(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

// ================= JUMP =================
function keyPressed() {
  if (
    (key === " " || key === "W" || key === "w" || keyCode === UP_ARROW) &&
    blob3.onGround
  ) {
    blob3.vy = blob3.jumpV;
    blob3.onGround = false;
    spawnJoyParticles(blob3.x, blob3.y);
  }
}
