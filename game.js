const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions dynamically based on the container
canvas.width = Math.min(360, window.innerWidth * 0.9);
canvas.height = canvas.width * (4 / 3);

let gunX = canvas.width / 2 - 15;
let bullets = [];
let balloons = [];
let gameSpeed = /Android|iPhone/i.test(navigator.userAgent) ? 1.6 : 1; // Adjust speed for mobile

// Balloon setup
function createBalloon() {
  let x = Math.random() * (canvas.width - 30);
  balloons.push({ x, y: canvas.height, radius: 15 });
}
setInterval(createBalloon, 1200);

// Controls
document.getElementById("leftBtn").addEventListener("click", () => {
  gunX = Math.max(0, gunX - 25); // Prevent going off-screen
});
document.getElementById("rightBtn").addEventListener("click", () => {
  gunX = Math.min(canvas.width - 30, gunX + 25); // Prevent going off-screen
});
document.getElementById("shootBtn").addEventListener("click", shoot);

function shoot() {
  bullets.push({ x: gunX + 15, y: canvas.height - 50 });
}

// Game Loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gun
  ctx.fillStyle = "black";
  ctx.fillRect(gunX, canvas.height - 40, 30, 40);

  // Bullets
  ctx.fillStyle = "red";
  bullets = bullets.filter((bullet) => bullet.y > 0); // Remove bullets off-screen
  bullets.forEach((bullet) => {
    bullet.y -= 6 * gameSpeed;
    ctx.fillRect(bullet.x, bullet.y, 5, 15);
  });

  // Balloons
  ctx.fillStyle = "pink";
  balloons = balloons.filter((balloon) => balloon.y > -30); // Remove balloons off-screen
  balloons.forEach((balloon, bIndex) => {
    balloon.y -= 1.5 * gameSpeed;
    ctx.beginPath();
    ctx.arc(balloon.x, balloon.y, balloon.radius, 0, Math.PI * 2);
    ctx.fill();

    bullets.forEach((bullet, bulletIndex) => {
      let dx = balloon.x - bullet.x;
      let dy = balloon.y - bullet.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < balloon.radius) {
        balloons.splice(bIndex, 1);
        bullets.splice(bulletIndex, 1);
      }
    });
  });

  requestAnimationFrame(update);
}
update();
