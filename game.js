const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Responsive canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    width: 60,
    height: 20,
    speed: 6
};

// Controls
let leftPressed = false;
let rightPressed = false;
let shooting = false;

// Bullets
let bullets = [];
const bulletSpeed = 8;

// Balloons
let balloons = [];
const balloonSpeed = 2; // slower falling speed
const balloonInterval = 1500; // spawn time

function createBalloon() {
    balloons.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        size: 40
    });
}
setInterval(createBalloon, balloonInterval);

// Keyboard controls
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

// Mobile button events
document.getElementById("leftBtn").addEventListener("mousedown", () => leftPressed = true);
document.getElementById("leftBtn").addEventListener("mouseup", () => leftPressed = false);

document.getElementById("rightBtn").addEventListener("mousedown", () => rightPressed = true);
document.getElementById("rightBtn").addEventListener("mouseup", () => rightPressed = false);

document.getElementById("fireBtn").addEventListener("mousedown", () => shooting = true);
document.getElementById("fireBtn").addEventListener("mouseup", () => shooting = false);

// Mobile touch support
["touchstart"].forEach(evt => {
    document.getElementById("leftBtn").addEventListener(evt, () => leftPressed = true);
    document.getElementById("rightBtn").addEventListener(evt, () => rightPressed = true);
    document.getElementById("fireBtn").addEventListener(evt, () => shooting = true);
});
["touchend"].forEach(evt => {
    document.getElementById("leftBtn").addEventListener(evt, () => leftPressed = false);
    document.getElementById("rightBtn").addEventListener(evt, () => rightPressed = false);
    document.getElementById("fireBtn").addEventListener(evt, () => shooting = false);
});

// Shoot continuously
setInterval(() => {
    if (shooting) {
        bullets.push({
            x: player.x + player.width / 2 - 3,
            y: player.y,
            width: 6,
            height: 12
        });
    }
}, 200);

// Collision detection
function isColliding(a, b) {
    return a.x < b.x + b.size &&
           a.x + a.width > b.x &&
           a.y < b.y + b.size &&
           a.y + a.height > b.y;
}

let score = 0;

// Game loop
function update() {
    // Movement
    if (leftPressed) player.x -= player.speed;
    if (rightPressed) player.x += player.speed;

    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

    // Bullets update
    bullets.forEach((b, i) => {
        b.y -= bulletSpeed;
        if (b.y < 0) bullets.splice(i, 1);
    });

    // Balloons update
    balloons.forEach((bl, i) => {
        bl.y += balloonSpeed;

        if (bl.y > canvas.height) {
            balloons.splice(i, 1);
        }

        bullets.forEach((b, j) => {
            if (isColliding(b, bl)) {
                balloons.splice(i, 1);
                bullets.splice(j, 1);
                score++;
            }
        });
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Bullets
    bullets.forEach(b => {
        ctx.fillRect(b.x, b.y, b.width, b.height);
    });

    // Balloons
    balloons.forEach(bl => {
        ctx.beginPath();
        ctx.arc(bl.x + 20, bl.y + 20, bl.size / 2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Score
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 40);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();
