const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ✅ Fullscreen responsive game
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ✅ Player
const player = {
    x: canvas.width / 2,
    y: canvas.height - 90,
    width: 70,
    height: 25,
    speed: 6
};

// Controls
let leftPressed = false;
let rightPressed = false;
let shooting = false;
let score = 0;

// Bullets
const bullets = [];
const bulletSpeed = 8;

// Balloons
const balloons = [];
const balloonSpeed = 2; // ✅ Slower speed
const balloonSpawnTime = 1500;

// Create balloons
setInterval(() => {
    balloons.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        size: 40
    });
}, balloonSpawnTime);

// Keyboard ✅ Long press
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") leftPressed = true;
    if (e.key === "ArrowRight") rightPressed = true;
    if (e.key === " ") shooting = true;
});
document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") leftPressed = false;
    if (e.key === "ArrowRight") rightPressed = false;
    if (e.key === " ") shooting = false;
});

// Touch Controls ✅ Long press mobile buttons
function bindMobile(buttonId, flag) {
    const btn = document.getElementById(buttonId);

    btn.addEventListener("mousedown", () => window[flag] = true);
    btn.addEventListener("mouseup", () => window[flag] = false);

    btn.addEventListener("touchstart", () => window[flag] = true);
    btn.addEventListener("touchend", () => window[flag] = false);
}

bindMobile("leftBtn", "leftPressed");
bindMobile("rightBtn", "rightPressed");
bindMobile("fireBtn", "shooting");

// ✅ Auto shooting when holding fire
setInterval(() => {
    if (shooting) {
        bullets.push({
            x: player.x + player.width / 2 - 3,
            y: player.y,
            width: 6,
            height: 14
        });
    }
}, 180);

// Collision
function isHit(bullet, balloon) {
    return bullet.x < balloon.x + balloon.size &&
           bullet.x + bullet.width > balloon.x &&
           bullet.y < balloon.y + balloon.size &&
           bullet.y + bullet.height > balloon.y;
}

// Game Update Loop
function update() {
    if (leftPressed) player.x -= player.speed;
    if (rightPressed) player.x += player.speed;

    // Stay inside screen
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

    // Bullets movement
    bullets.forEach((b, i) => {
        b.y -= bulletSpeed;
        if (b.y < 0) bullets.splice(i, 1);
    });

    // Balloons movement + hit check
    balloons.forEach((bl, i) => {
        bl.y += balloonSpeed;

        if (bl.y > canvas.height) balloons.splice(i, 1);

        bullets.forEach((b, j) => {
            if (isHit(b, bl)) {
                balloons.splice(i, 1);
                bullets.splice(j, 1);
                score++;
            }
        });
    });
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Bullets
    ctx.fillStyle = "yellow";
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    // Balloons
    ctx.fillStyle = "red";
    balloons.forEach(bl => {
        ctx.beginPath();
        ctx.arc(bl.x + 20, bl.y + 20, bl.size / 2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Score
    ctx.fillStyle = "white";
    ctx.font = "22px Arial";
    ctx.fillText("Score: " + score, 20, 40);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
