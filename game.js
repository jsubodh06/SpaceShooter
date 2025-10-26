const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Player (spaceship)
let player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    width: 40,
    height: 40,
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

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") leftPressed = true;
    if (e.key === "ArrowRight") rightPressed = true;

    // Shooting
    if (e.key === " " || e.key === "ArrowUp") {
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y
        });
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") leftPressed = false;
    if (e.key === "ArrowRight") rightPressed = false;
});

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
        speed: 1 + Math.random() * 1.5 // slower enemies ✅
    });
}

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

function showScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 25);
}

function showGameOver() {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER!", 80, 280);
    ctx.font = "20px Arial";
    ctx.fillText("Refresh to restart", 110, 320);
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

    // Continuous movement ✅
    if (leftPressed && player.x > 0) {
        player.x -= player.speed;
    }
    if (rightPressed && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }

    requestAnimationFrame(gameLoop);
}

setInterval(createEnemy, 1200); // slower spawning ✅
gameLoop();
