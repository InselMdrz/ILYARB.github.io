const pages = document.querySelectorAll('.page');
const dots = document.querySelectorAll('.dot');
let current = 0;

function nextPage() {
    goTo(current + 1);
}

function prevPage() {
    goTo(current - 1);
}

function goTo(index) {
    if (index < 0 || index >= pages.length || index === current) return;
    pages[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index;
    pages[current].classList.add('active');
    dots[current].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pages[current].classList.contains('finale-page')) {
        startFireworks();
        setTimeout(() => launchConfetti(30), 900);
    } else {
        stopFireworks();
    }
}

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goTo(index));
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextPage();
    if (e.key === 'ArrowLeft') prevPage();
});

function buildStars() {
    const container = document.getElementById('stars');
    const count = 60;
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        container.appendChild(star);
    }
}
buildStars();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fwColors = ['#FBBF24', '#FB7185', '#F8FAFC', '#93C5FD'];

let fwCanvas, fwCtx, fwRAF = null, fwRunning = false, fwLastLaunch = 0;
let rockets = [];
let sparks = [];

function setupFireworks() {
    fwCanvas = document.getElementById('fireworks-canvas');
    if (!fwCanvas) return;
    fwCtx = fwCanvas.getContext('2d');
    resizeFireworks();
    window.addEventListener('resize', resizeFireworks);
}

function resizeFireworks() {
    if (!fwCanvas) return;
    const ratio = window.devicePixelRatio || 1;
    fwCanvas.width = fwCanvas.clientWidth * ratio;
    fwCanvas.height = fwCanvas.clientHeight * ratio;
    fwCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function startFireworks() {
    if (reduceMotion || fwRunning || !fwCtx) return;
    fwRunning = true;
    fwLastLaunch = 0;
    rockets = [];
    sparks = [];
    fwRAF = requestAnimationFrame(fireworksStep);
}

function stopFireworks() {
    fwRunning = false;
    if (fwRAF) cancelAnimationFrame(fwRAF);
    rockets = [];
    sparks = [];
    if (fwCtx) fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
}

function fireworksStep(time) {
    if (!fwRunning) return;
    const w = fwCanvas.clientWidth;
    const h = fwCanvas.clientHeight;

    fwCtx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    fwCtx.fillRect(0, 0, w, h);

    if (time - fwLastLaunch > 700 + Math.random() * 650 && rockets.length < 4) {
        rockets.push({
            x: w * (0.18 + Math.random() * 0.64),
            y: h,
            targetY: h * (0.18 + Math.random() * 0.32),
            vy: -(6 + Math.random() * 2.5),
            color: fwColors[Math.floor(Math.random() * fwColors.length)]
        });
        fwLastLaunch = time;
    }

    rockets.forEach((r) => {
        r.y += r.vy;
        fwCtx.beginPath();
        fwCtx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        fwCtx.fillStyle = r.color;
        fwCtx.fill();
    });
    rockets = rockets.filter((r) => {
        if (r.y > r.targetY) return true;
        burst(r.x, r.y, r.color);
        return false;
    });

    sparks.forEach((p) => {
        p.vy += 0.045;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.014;

        fwCtx.globalAlpha = Math.max(p.life, 0);
        fwCtx.beginPath();
        fwCtx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        fwCtx.fillStyle = p.color;
        fwCtx.fill();
        fwCtx.globalAlpha = 1;
    });
    sparks = sparks.filter((p) => p.life > 0);

    fwRAF = requestAnimationFrame(fireworksStep);
}

function burst(x, y, color) {
    const count = 34 + Math.floor(Math.random() * 12);
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const speed = 1.5 + Math.random() * 2.5;
        sparks.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color,
            life: 1
        });
    }
}

setupFireworks();

function celebrate() {
    launchConfetti(80);
}

function launchConfetti(pieceCount = 80) {
    const colors = ['#FBBF24', '#FB7185', '#F8FAFC', '#1E3A8A'];

    for (let i = 0; i < pieceCount; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}vw`;
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = `${2.5 + Math.random() * 2}s`;
        piece.style.animationDelay = `${Math.random() * 0.6}s`;
        document.body.appendChild(piece);

        setTimeout(() => piece.remove(), 5000);
    }
}
