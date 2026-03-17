const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreValue = document.getElementById("scoreValue");
const testPopupBtn = document.getElementById("testPopupBtn");
const testScoreBtn = document.getElementById("testScoreBtn");

let score = 0;

/* --------------------------------------------------
   Funny popup
-------------------------------------------------- */
let funnyPopup = null;
let funnyPopupImg = null;
let funnyPopupTimeout = null;

function initFunnyPopup() {
    if (funnyPopup) return;

    funnyPopup = document.createElement("div");
    funnyPopup.className = "funny-popup";
    funnyPopup.id = "funnyPopup";

    funnyPopupImg = document.createElement("img");
    funnyPopupImg.src = "funny-popup.jpg";
    funnyPopupImg.alt = "Funny popup";

    funnyPopupImg.onload = function () {
        console.log("Funny popup image loaded:", funnyPopupImg.src);
    };

    funnyPopupImg.onerror = function () {
        console.error("Failed to load image:", funnyPopupImg.src);
    };

    funnyPopup.appendChild(funnyPopupImg);
    document.body.appendChild(funnyPopup);
}

function showFunnyPopup() {
    if (!funnyPopup) {
        initFunnyPopup();
    }

    funnyPopup.classList.add("show");

    clearTimeout(funnyPopupTimeout);
    funnyPopupTimeout = setTimeout(() => {
        funnyPopup.classList.remove("show");
    }, 900);
}

/* --------------------------------------------------
   Score
-------------------------------------------------- */
function updateScore() {
    scoreValue.textContent = String(score);
}

function onScore() {
    score += 1;
    updateScore();
    showFunnyPopup();
}

/* --------------------------------------------------
   Demo scene
-------------------------------------------------- */
const ball = {
    x: 180,
    y: 500,
    r: 16,
    vx: 0,
    vy: 0
};

const hoop = {
    x: 180,
    y: 170,
    width: 90,
    rimY: 170
};

let gravity = 0.45;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let scoredThisShot = false;

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);

    if (ball.x > canvas.width || ball.y > canvas.height) {
        resetBall();
    }

    hoop.x = canvas.width * 0.5;
    hoop.y = 170;
    hoop.rimY = hoop.y;
}

function resetBall() {
    ball.x = canvas.width * 0.5;
    ball.y = canvas.height - 110;
    ball.vx = 0;
    ball.vy = 0;
    scoredThisShot = false;
}

function drawBackground() {
    ctx.fillStyle = "#7ec8ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#d7f1ff";
    ctx.fillRect(0, canvas.height * 0.72, canvas.width, canvas.height * 0.28);
}

function drawHoop() {
    const rimLeft = hoop.x - hoop.width / 2;
    const rimRight = hoop.x + hoop.width / 2;

    // Backboard
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(hoop.x + hoop.width / 2 + 8, hoop.y - 55, 10, 80);

    // Rim
    ctx.strokeStyle = "#ff5a2f";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(rimLeft, hoop.rimY);
    ctx.lineTo(rimRight, hoop.rimY);
    ctx.stroke();

    // Net
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    for (let i = 0; i <= 6; i++) {
        const x = rimLeft + (hoop.width / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, hoop.rimY);
        ctx.lineTo(hoop.x, hoop.rimY + 38);
        ctx.stroke();
    }
}

function drawBall() {
    ctx.fillStyle = "#ff8c2b";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#7a3e12";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ball.x - ball.r + 2, ball.y);
    ctx.lineTo(ball.x + ball.r - 2, ball.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y - ball.r + 2);
    ctx.lineTo(ball.x, ball.y + ball.r - 2);
    ctx.stroke();
}

function drawAimLine(currentX, currentY) {
    if (!isDragging) return;

    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
}

function updateBall() {
    ball.vy += gravity;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall bounce
    if (ball.x - ball.r < 0) {
        ball.x = ball.r;
        ball.vx *= -0.82;
    }

    if (ball.x + ball.r > canvas.width) {
        ball.x = canvas.width - ball.r;
        ball.vx *= -0.82;
    }

    // Floor bounce
    if (ball.y + ball.r > canvas.height) {
        ball.y = canvas.height - ball.r;
        ball.vy *= -0.72;
        ball.vx *= 0.98;

        if (Math.abs(ball.vy) < 1.3) {
            ball.vy = 0;
        }
    }

    checkScore();
}

function checkScore() {
    const rimLeft = hoop.x - hoop.width / 2;
    const rimRight = hoop.x + hoop.width / 2;

    const ballCenterInsideRim = ball.x > rimLeft && ball.x < rimRight;
    const ballMovingDown = ball.vy > 0;
    const ballPassedRimLine = ball.y > hoop.rimY && ball.y < hoop.rimY + 26;

    if (!scoredThisShot && ballCenterInsideRim && ballMovingDown && ballPassedRimLine) {
        scoredThisShot = true;
        onScore();
    }

    // Reset score flag when ball is far below again for next shot
    if (ball.y > hoop.rimY + 120 && Math.abs(ball.vy) < 0.5) {
        scoredThisShot = false;
    }
}

function render(currentPointerX = ball.x, currentPointerY = ball.y) {
    drawBackground();
    drawHoop();
    drawBall();
    drawAimLine(currentPointerX, currentPointerY);
}

function gameLoop() {
    updateBall();
    render();
    requestAnimationFrame(gameLoop);
}

/* --------------------------------------------------
   Input
-------------------------------------------------- */
function getPointerPosition(event) {
    const rect = canvas.getBoundingClientRect();

    let clientX;
    let clientY;

    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else if (event.changedTouches && event.changedTouches.length > 0) {
        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    return {
        x: ((clientX - rect.left) / rect.width) * canvas.width,
        y: ((clientY - rect.top) / rect.height) * canvas.height
    };
}

let lastPointerX = 0;
let lastPointerY = 0;

function pointerDown(event) {
    const pos = getPointerPosition(event);
    const dx = pos.x - ball.x;
    const dy = pos.y - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= ball.r + 30) {
        isDragging = true;
        dragStartX = pos.x;
        dragStartY = pos.y;
        lastPointerX = pos.x;
        lastPointerY = pos.y;
    }
}

function pointerMove(event) {
    if (!isDragging) return;
    const pos = getPointerPosition(event);
    lastPointerX = pos.x;
    lastPointerY = pos.y;
    render(lastPointerX, lastPointerY);
}

function pointerUp(event) {
    if (!isDragging) return;

    const pos = getPointerPosition(event);
    isDragging = false;

    const powerX = dragStartX - pos.x;
    const powerY = dragStartY - pos.y;

    ball.vx = powerX * 0.12;
    ball.vy = powerY * 0.12;

    // Safety so upward throws feel stronger on mobile
    if (ball.vy > -5) {
        ball.vy = -5;
    }
}

/* --------------------------------------------------
   Init
-------------------------------------------------- */
function setupEvents() {
    canvas.addEventListener("mousedown", pointerDown);
    canvas.addEventListener("mousemove", pointerMove);
    canvas.addEventListener("mouseup", pointerUp);

    canvas.addEventListener("touchstart", pointerDown, { passive: true });
    canvas.addEventListener("touchmove", pointerMove, { passive: true });
    canvas.addEventListener("touchend", pointerUp, { passive: true });

    window.addEventListener("resize", resizeCanvas);

    testPopupBtn.addEventListener("click", showFunnyPopup);
    testScoreBtn.addEventListener("click", onScore);

    window.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() === "p") {
            showFunnyPopup();
        }

        if (event.key.toLowerCase() === "r") {
            resetBall();
        }
    });
}

function init() {
    resizeCanvas();
    initFunnyPopup();
    updateScore();
    resetBall();
    setupEvents();
    render();
    requestAnimationFrame(gameLoop);

    // Startup test: popup after 1 second
    setTimeout(() => {
        showFunnyPopup();
    }, 1000);
}

window.addEventListener("load", init);
