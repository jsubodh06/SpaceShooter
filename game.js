const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Make canvas resize dynamically (for mobile screens)
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Player (spaceship)
let player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 50,
    height: 50,
    speed: 6
};

// Bullets array
let bullets = [];

// Enemies array
let enemies = [];

let score = 0;
let gameOver = false;

// Key holding state
let leftPressed = false;
let rightPressed = false;

// 🎮 Touch control areas
let touchX = null;
let isTouching = false;

// Handle keyboard input
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") leftPressed = true;
    if (e.key === "ArrowRight") rightPressed = true;

    // Shooting
    if (e.key === " " || e.key === "ArrowUp") shootBullet();
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") leftPressed = false;
    if (e.key === "ArrowRight") rightPressed = false;
});

// 🔫 Shoot function
function shootBullet() {
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y
    });
}

// 🖐 Touch controls for mobile
canvas.addEventListener("touchstart", (e) => {
    isTouching = true;
    const touch = e.touches[0];
    touchX = touch.clientX;

    // If tapped near top — shoot
    if (touch.clientY < canvas.height * 0.4) {
        shootBullet();
    }
});

canvas.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    touchX = touch.clientX;
});

canvas.addEventListener("touchend", () => {
    isTouching = false;
});

// Draw player
function drawPlayer() {
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Draw bullets
function drawBullets() {
    ctx.fillStyle = "yellow";
    bullets.forEach((bullet, index) => {
        bullet.y -= 7;
        ctx.fillRect(bullet.x, bullet.y, 5, 10);
        if (bullet.y < 0) bullets.splice(index, 1);
    });
}

// Create enemies
function createEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 1 + Math.random() * 1.5
    });
}

// Draw enemies
function drawEnemies() {
    ctx.fillStyle = "red";
    enemies.forEach((enemy, eIndex) => {
        enemy.y += enemy.speed;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // If enemy hits bottom = Game Over
        if (enemy.y > canvas.height) {
            gameOver = true;
        }

        // Collision with bullets
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

// Show score
function showScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
}

// Show game over
function showGameOver() {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER!", canvas.width / 2 - 130, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Refresh to restart", canvas.width / 2 - 90, canvas.height / 2 + 40);
}

// Main game loop
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

    // Move player
    if (leftPressed && player.x > 0) player.x -= player.speed;
    if (rightPressed && player.x < canvas.width - player.width) player.x += player.speed;

    // Move with touch
    if (isTouching && touchX !== null) {
        // Smoothly move toward touch position
        const dx = touchX - (player.x + player.width / 2);
        player.x += dx * 0.1;
        player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
    }

    requestAnimationFrame(gameLoop);
}

setInterval(createEnemy, 1200);
gameLoop();
