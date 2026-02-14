const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let cookieRadius = 90;
let rotation = 0;

let balls = [];
let maxBalls = 1200;

let totalBalls = 0;
let ballsPerClick = 1;
let multiplier = 1;
let autoClickers = 0;
let prestige = 0;

let frenzyMultiplier = 1;
let frenzyActive = false;
let frenzyEndTime = 0;
let frenzyType = "";

let costBPC = 100;
let costMulti = 500;
let costAuto = 1500;

let lastTotalBalls = 0;
let bps = 0;

// AUTO CLICK SYSTEM
let autoInterval = 10000; // starts at 10 seconds
let minAutoInterval = 1500;
let lastAutoTime = Date.now();

const cookieImg = new Image();
cookieImg.src = "eli.png";

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
});

function randomColor() {
    return `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`;
}

class Ball {
    constructor(speedBoost = 1, sizeBoost = 1) {
        this.x = centerX;
        this.y = centerY;
        this.radius = (Math.random() * 7 + 4) * sizeBoost;

        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 5 + 3) * speedBoost;

        this.speedX = Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed;
        this.color = randomColor();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.shadowBlur = 25;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function emit(amount, speedBoost = 1, sizeBoost = 1) {
    for (let i = 0; i < amount; i++) {
        if (balls.length < maxBalls) {
            balls.push(new Ball(speedBoost, sizeBoost));
        }
    }
    totalBalls += amount;
}

function triggerFrenzy(type) {
    frenzyActive = true;
    frenzyEndTime = Date.now() + 5000;
    frenzyType = type;

    frenzyMultiplier = (type === "super") ? 10 : 2;
}

canvas.addEventListener("click", (e) => {
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    if (Math.sqrt(dx * dx + dy * dy) <= cookieRadius) {

        if (!frenzyActive) {
            if (Math.floor(Math.random() * 100000) === 0) {
                triggerFrenzy("super");
            } else if (Math.floor(Math.random() * 500) === 0) {
                triggerFrenzy("normal");
            }
        }

        let speedBoost = frenzyActive ? frenzyMultiplier : 1;

        emit(
            Math.floor(ballsPerClick * multiplier * frenzyMultiplier * (1 + prestige * 0.5)),
            speedBoost
        );
    }
});

function prestigeExplosion() {
    emit(400 + prestige * 150, 4 + prestige, 2);
}


function animate() {

    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Frenzy timer
    if (frenzyActive && Date.now() > frenzyEndTime) {
        frenzyActive = false;
        frenzyMultiplier = 1;
        frenzyType = "";
    }

    // Auto click timer
    if (autoClickers > 0 && Date.now() - lastAutoTime > autoInterval) {
        lastAutoTime = Date.now();
        emit(
            Math.floor(ballsPerClick * multiplier * frenzyMultiplier),
            frenzyActive ? frenzyMultiplier : 1
        );

    
    }

    balls.forEach((b, i) => {
        b.update();
        b.draw();

        if (
            b.x < -300 || b.x > canvas.width + 300 ||
            b.y < -300 || b.y > canvas.height + 300
        ) {
            balls.splice(i, 1);
        }
    });

    // Rotating cookie
    rotation += 0.02;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    if (cookieImg.complete) {
        ctx.drawImage(cookieImg, -cookieRadius, -cookieRadius, cookieRadius*2, cookieRadius*2);
    } else {
        ctx.fillStyle = "#654321";
        ctx.beginPath();
        ctx.arc(0, 0, cookieRadius, 0, Math.PI*2);
        ctx.fill();
    }

    ctx.restore();

    //  FRENZY TEXT
    if (frenzyActive) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = frenzyType === "super" ? "#ff00ff" : "#00ffff";
        ctx.font = "bold 120px Arial";
        ctx.textAlign = "center";
        ctx.shadowBlur = 40;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fillText(
            frenzyType === "super" ? "GIANT STEPPER x10" : "BIG STEPPER x2",
            canvas.width / 2,
            canvas.height / 2 - 150
        );
        ctx.restore();
    }

    updateUI();
    requestAnimationFrame(animate);
}

function updateUI() {
    document.getElementById("totalBalls").textContent = Math.floor(totalBalls);
    document.getElementById("bpc").textContent = ballsPerClick;
    document.getElementById("multi").textContent = multiplier.toFixed(2);
    document.getElementById("autoCount").textContent = autoClickers;
    document.getElementById("prestigeLevel").textContent = prestige;
    document.getElementById("bps").textContent = bps;

    document.getElementById("upgradeBPC").textContent = `+1 Beatrice/Click (${costBPC})`;
    document.getElementById("upgradeMulti").textContent = `Multiplier +0.5 (${costMulti})`;
    document.getElementById("upgradeAuto").textContent =
        `Auto Beatrice (${costAuto}) | Interval: ${(autoInterval/1000).toFixed(1)}s`;
}

document.getElementById("upgradeBPC").onclick = () => {
    if (totalBalls >= costBPC) {
        totalBalls -= costBPC;
        ballsPerClick++;
        costBPC = Math.floor(costBPC * 1.8);
    }
};

document.getElementById("upgradeMulti").onclick = () => {
    if (totalBalls >= costMulti) {
        totalBalls -= costMulti;
        multiplier += 0.5;
        costMulti = Math.floor(costMulti * 2);
    }
};

document.getElementById("upgradeAuto").onclick = () => {
    if (totalBalls >= costAuto) {
        totalBalls -= costAuto;
        autoClickers++;

        // reduce interval gradually
        autoInterval = Math.max(minAutoInterval, autoInterval - 800);

        costAuto = Math.floor(costAuto * 2.2);
    }
};

document.getElementById("prestigeBtn").onclick = () => {
    if (totalBalls >= 50000) {
        prestige++;
        prestigeExplosion();
        totalBalls = 0;
        ballsPerClick = 1;
        multiplier = 1;
        autoClickers = 0;
        autoInterval = 10000;
    }
};

setInterval(() => {
    bps = totalBalls - lastTotalBalls;
    lastTotalBalls = totalBalls;
}, 1000);

animate();
