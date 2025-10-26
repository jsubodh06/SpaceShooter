const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas for any screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Player
let player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 50,
    height: 50,
    speed: 6
};

let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;

// Input states
let leftPressed = false;
let rightPressed = false;

// --- KEYBOARD CONTROLS ---
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") leftPressed = true;
    if (e.key === "ArrowRight") rightPressed = true;
    if (e.key === " " || e.key === "ArrowUp") shootBullet();
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") leftPressed = false;
    if (e.key === "ArrowRight") rightPressed = false;
});

// --- TOUCH CONTROLS ---
let leftTouch = false;
let rightTouch = false;

// Create on-screen buttons
function createTouchControls() {
    const controls = document.createElement("div");
    controls.style.position = "fixed";
    controls.style.bottom = "20px";
    controls.style.left = "0";
    controls.style.width = "100%";
    controls.style.display = "flex";
    controls.style.justifyContent = "space-around";
    controls.style.zIndex = "10";
    controls.style.userSelect = "none";

    const btnStyle = `
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 20px 30px;
        font-size: 22px;
        border-radius: 10px;
        border: 2px solid white;
        touch-action: none;
    `;

    const leftBtn = document.createElement("button");
    leftBtn.innerText = "⟵";
    leftBtn.style.cssText = btnStyle;
    leftBtn.addEventListener("touchstart", () => (leftTouch = true));
    leftBtn.addEventListener("touchend", () => (leftTouch = false));

    const fireBtn = document.createElement("button");
    fireBtn.innerText = "🔥";
    fireBtn.style.cssText = btnStyle;
    fireBtn.addEventListener("touchstart", shootBullet);

    const rightBtn = document.createElement("button");
    rightBtn.innerText = "⟶";
    rightBtn.style.cssText = btnStyle;
    rightBtn.addEventListener("touchstart", () => (rightTouch = true));
    rightBtn.addEventListener("touchend", () => (rightTouch = false));

    controls.appendChild(leftBtn);
    controls.appendChild(fireBtn);
    controls.appendChild(rightBtn);
    document.body.appendChild(controls);
}

// Only create buttons if on mobile
if (/Mobi|Android/i.test(navigator.userAgent)) {
    createTouchControls();
}

function shootBullet() {
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y
    });
}

function drawPlayer() {
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullets() {
    ctx.fillStyle = "yellow";
    bullets.forEach((bullet, index) => {
        bullet.y -= 7;
        ctx.fillRect(bullet.x, bullet.y, 5, 10);
        if (bullet.y < 0) bullets.splice(index, 1);
    });
}

function createEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 1 + Math.random() * 1.5
    });
}

function drawEnemies() {
    ctx.fillStyle = "red";
    enemies.forEach((enemy, eIndex) => {
        enemy.y += enemy.speed;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        if (enemy.y > canvas.height) gameOver = true;

        bullets.forEach((bullet, bIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + 5 > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + 10 > enemy.y
            ) {
                score++;
                enemies.splice(eIndex, 1);
                bullets.splice(bIndex, 1);
            }
        });
    });
}

function showScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
}

function showGameOver() {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER!", canvas.width / 2 - 130, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Refresh to restart", canvas.width / 2 - 90, canvas.height / 2 + 40);
}

function gameLoop() {
    if (gameOver) {
        showGameOver();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawBullets();
    drawEnemies();
    showScore();

    // Desktop movement
    if (leftPressed && player.x > 0) player.x -= player.speed;
    if (rightPressed && player.x < canvas.width - player.width) player.x += player.speed;

    // Touch movement
    if (leftTouch && player.x > 0) player.x -= player.speed;
    if (rightTouch && player.x < canvas.width - player.width) player.x += player.speed;

    requestAnimationFrame(gameLoop);
}

setInterval(createEnemy, 1200);
gameLoop();
