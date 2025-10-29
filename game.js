/* Balloon Shooter — Carnival
   - Responsive canvas (full browser)
   - Keyboard + Pointer (mobile) controls
   - Auto-fire while holding fire button/space
   - Colored balloons, pop animation, simple WebAudio sounds
   - Lives, Game Over, Restart
   - Difficulty ramps over time
*/

/* ---------- Config ---------- */
const STARTING_LIVES = 3;
const INITIAL_BALLOON_SPEED = 1.6;
const INITIAL_SPAWN_MS = 1400;
const FIRE_INTERVAL_MS = 170;
const DIFFICULTY_RAMP_SECONDS = 20; // every X seconds make it harder

/* ---------- Elements ---------- */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayScore = document.getElementById('overlayScore');
const restartBtn = document.getElementById('restartBtn');

const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const fireBtn = document.getElementById('fireBtn');

/* ---------- State ---------- */
let width = 0, height = 0;
let score = 0;
let lives = STARTING_LIVES;
let gameOver = false;

let player = null;
let bullets = [];
let balloons = [];
let particles = []; // for pop animation

let leftPressed = false;
let rightPressed = false;
let shooting = false;

let fireTimer = null;
let spawnTimer = null;
let difficultyTimer = null;

let balloonSpeed = INITIAL_BALLOON_SPEED;
let spawnInterval = INITIAL_SPAWN_MS;

/* ---------- Audio (simple) ---------- */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(freq=650, time=0.06, type='sine', gain=0.12) {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + time);
}
function playPop() {
    // short noise burst using oscillator frequency sweep (simulates pop)
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(700, audioCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.08);
    g.gain.value = 0.14;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.09);
}

/* ---------- Responsive setup ---------- */
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Player anchored to bottom center
    const pw = Math.max(48, Math.min(100, Math.floor(width * 0.12)));
    const ph = Math.floor(pw * 0.35);
    player.width = pw;
    player.height = ph;
    player.x = (width - player.width) / 2;
    player.y = height - player.height - Math.max(24, Math.floor(height*0.06));
}
window.addEventListener('resize', resize);

/* ---------- Initialize / Reset ---------- */
function initState() {
    score = 0;
    lives = STARTING_LIVES;
    balloonSpeed = INITIAL_BALLOON_SPEED;
    spawnInterval = INITIAL_SPAWN_MS;
    gameOver = false;
    bullets = [];
    balloons = [];
    particles = [];
    leftPressed = false;
    rightPressed = false;
    shooting = false;

    // player basic shape
    player = {
        x: 0,
        y: 0,
        width: 80,
        height: 28,
        speed: Math.max(5, Math.round(window.innerWidth * 0.0065))
    };

    scoreEl.textContent = score;
    livesEl.textContent = lives;
    overlay.classList.add('hidden');

    // start timers
    startSpawning();
    startShootingTimer();
    startDifficultyTimer();

    resize();
}

/* ---------- Spawning ---------- */
function spawnBalloon() {
    const size = Math.max(28, Math.min(64, 30 + Math.random() * 28));
    const x = Math.random() * (width - size);
    const color = pickBalloonColor();
    balloons.push({
        x, y: -size - 4, size,
        speed: balloonSpeed + Math.random() * 0.9,
        color
    });
}
function startSpawning() {
    if (spawnTimer) clearInterval(spawnTimer);
    spawnTimer = setInterval(spawnBalloon, spawnInterval);
}
function stopSpawning() {
    if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
}

/* ---------- Difficulty ramp ---------- */
function rampDifficulty() {
    // every DIFFICULTY_RAMP_SECONDS increase speed and spawn rate a bit
    balloonSpeed += 0.18;
    spawnInterval = Math.max(550, Math.round(spawnInterval * 0.92));
    startSpawning();
}
function startDifficultyTimer() {
    if (difficultyTimer) clearInterval(difficultyTimer);
    difficultyTimer = setInterval(rampDifficulty, DIFFICULTY_RAMP_SECONDS * 1000);
}
function stopDifficultyTimer() {
    if (difficultyTimer) { clearInterval(difficultyTimer); difficultyTimer = null; }
}

/* ---------- Shooting ---------- */
function startShootingTimer() {
    if (fireTimer) clearInterval(fireTimer);
    fireTimer = setInterval(() => {
        if (!gameOver && shooting) {
            bullets.push({
                x: player.x + player.width/2 - 5,
                y: player.y - 8,
                w: 10, h: 18
            });
            playBeep(900, 0.04, 'sine', 0.06);
        }
    }, FIRE_INTERVAL_MS);
}
function stopShootingTimer() {
    if (fireTimer) { clearInterval(fireTimer); fireTimer = null; }
}

/* ---------- Controls (pointer events good for desktop + mobile) ---------- */
function bindControl(btn, onFn, offFn) {
    // pointer events handle mouse/touch/stylus
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); onFn(); });
    btn.addEventListener('pointerup', (e) => { e.preventDefault(); offFn(); });
    btn.addEventListener('pointercancel', offFn);
    btn.addEventListener('pointerleave', offFn);
    // also keyboard focus click fallback
    btn.addEventListener('click', (e) => { e.preventDefault(); onFn(); setTimeout(offFn, 150); });
}
bindControl(leftBtn, () => leftPressed = true, () => leftPressed = false);
bindControl(rightBtn, () => rightPressed = true, () => rightPressed = false);
bindControl(fireBtn, () => shooting = true, () => shooting = false);

/* Keyboard */
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') leftPressed = true;
    if (e.key === 'ArrowRight') rightPressed = true;
    if (e.key === ' ' || e.key === 'ArrowUp') shooting = true;
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') leftPressed = false;
    if (e.key === 'ArrowRight') rightPressed = false;
    if (e.key === ' ' || e.key === 'ArrowUp') shooting = false;
});

/* ---------- Balloon Colors ---------- */
function pickBalloonColor() {
    const colors = ['#ff6b6b','#ffb86b','#fff56b','#6bff8f','#6bd8ff','#b36bff','#ff6bd3'];
    return colors[Math.floor(Math.random() * colors.length)];
}

/* ---------- Pop particle effect ---------- */
function createPop(x, y, color) {
    playPop();
    for (let i=0;i<16;i++){
        const speed = 1 + Math.random()*3;
        const angle = Math.random() * Math.PI * 2;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 30 + Math.random()*18,
            color
        });
    }
}

/* ---------- Collisions & Updates ---------- */
function rectCircleCollide(rect, circle) {
    // simple AABB approx using circle bounding
    const dx = (rect.x + rect.w/2) - (circle.x + circle.size/2);
    const dy = (rect.y + rect.h/2) - (circle.y + circle.size/2);
    const dist = Math.hypot(dx, dy);
    return dist < (circle.size/2 + Math.max(rect.w, rect.h)/2 * 0.8);
}

function update() {
    if (gameOver) return;

    // player movement
    if (leftPressed) player.x -= player.speed;
    if (rightPressed) player.x += player.speed;
    // clamp
    player.x = Math.max(6, Math.min(width - player.width - 6, player.x));

    // update bullets
    for (let i = bullets.length -1; i >= 0; i--) {
        bullets[i].y -= 12;
        if (bullets[i].y + bullets[i].h < 0) bullets.splice(i,1);
    }

    // update balloons
    for (let i = balloons.length -1; i >= 0; i--) {
        const b = balloons[i];
        b.y += b.speed;
        // missed
        if (b.y - b.size > height) {
            balloons.splice(i,1);
            lives--;
            livesEl.textContent = lives;
            if (lives <= 0) doGameOver();
            continue;
        }

        // check collisions with bullets
        for (let j = bullets.length -1; j >= 0; j--) {
            if (rectCircleCollide({x: bullets[j].x, y: bullets[j].y, w: bullets[j].w, h: bullets[j].h}, b)) {
                // pop
                createPop(b.x + b.size/2, b.y + b.size/2, b.color);
                balloons.splice(i,1);
                bullets.splice(j,1);
                score += 1;
                scoreEl.textContent = score;
                break;
            }
        }
    }

    // update particles
    for (let i = particles.length -1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.life -= 1;
        if (p.life <= 0) particles.splice(i,1);
    }
}

/* ---------- Drawing ---------- */
function drawPlayerGraphic() {
    // draw a friendly cannon / launcher
    const x = player.x, y = player.y, w = player.width, h = player.height;
    // barrel
    ctx.fillStyle = "#352f3b";
    ctx.fillRect(x + w/2 - 6, y - h*0.9, 12, h*0.9);
    // body
    ctx.fillStyle = "#00b4d8";
    roundRect(ctx, x, y, w, h, 8, true, false);
    // wheels/stand
    ctx.fillStyle = "#073b4c";
    ctx.beginPath();
    ctx.arc(x + w*0.15, y + h + 6, 8, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w*0.85, y + h + 6, 8, 0, Math.PI*2);
    ctx.fill();
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (typeof r === 'undefined') r = 5;
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

function draw() {
    // sky background gradient + subtle ground
    const g = ctx.createLinearGradient(0,0,0,height);
    g.addColorStop(0, '#87CEEB');
    g.addColorStop(0.8, '#bfe9ff');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,width,height);

    // faint clouds (simple)
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i=0;i<3;i++){
        const cx = (i * 0.33 + 0.15) * width;
        ctx.beginPath();
        ctx.ellipse(cx, height * 0.12 + Math.sin(Date.now()/500 + i)*6, width*0.12, height*0.05, 0, 0, Math.PI*2);
        ctx.fill();
    }

    // draw balloons
    balloons.forEach(b => {
        // string
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(b.x + b.size/2, b.y + b.size);
        ctx.lineTo(b.x + b.size/2, b.y + b.size + 18);
        ctx.stroke();

        // balloon (shadow+color)
        ctx.beginPath();
        const cx = b.x + b.size/2, cy = b.y + b.size/2;
        // glow
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.beginPath();
        ctx.ellipse(cx - b.size*0.14, cy - b.size*0.18, b.size*0.36, b.size*0.28, 0, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.ellipse(cx, cy, b.size/2, b.size/2.2, 0, 0, Math.PI*2);
        ctx.fill();

        // highlight
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.beginPath();
        ctx.ellipse(cx - b.size*0.18, cy - b.size*0.26, b.size*0.12, b.size*0.07, 0, 0, Math.PI*2);
        ctx.fill();
    });

    // player
    drawPlayerGraphic();

    // bullets
    ctx.fillStyle = '#FFF176';
    bullets.forEach(b => {
        roundRect(ctx, b.x, b.y, b.w, b.h, 4, true, false);
    });

    // particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / 45);
        ctx.fillRect(p.x, p.y, 4, 4);
        ctx.globalAlpha = 1;
    });

    // HUD text handled by DOM (score/lives)
}

/* ---------- Game Over ---------- */
function doGameOver() {
    gameOver = true;
    stopSpawning();
    stopShootingTimer();
    stopDifficultyTimer();
    overlayTitle.textContent = 'GAME OVER';
    overlayScore.textContent = 'Score: ' + score;
    overlay.classList.remove('hidden');
}

/* ---------- Utility ---------- */
function startTimersAndLoops() {
    startShootingTimer();
    startSpawning();
    startDifficultyTimer();
}
function stopAllTimers() {
    stopShootingTimer();
    stopSpawning();
    stopDifficultyTimer();
}

/* ---------- Restart ---------- */
restartBtn.addEventListener('click', () => {
    restartGame();
});

function restartGame() {
    stopAllTimers();
    initState();
}

/* ---------- Main loop ---------- */
function mainLoop() {
    update();
    draw();
    if (!gameOver) requestAnimationFrame(mainLoop);
}
function runGame() {
    initState();
    mainLoop();
}

/* ---------- Start the game ---------- */
runGame();
