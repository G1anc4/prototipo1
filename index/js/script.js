/* script.js */
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle('active');
    menuBtn.textContent = mobileMenu.classList.contains('active') ? '✕' : '☰';
});

document.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    menuBtn.textContent = '☰';
});

const canvas = document.getElementById('burbujas');
const ctx = canvas.getContext('2d');
let burbujas = [];
let animationId;

function initBubbles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const bubbleCount = window.innerWidth < 768 ? 15 : 30;

    burbujas = Array.from({ length: bubbleCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * (window.innerWidth < 768 ? 6 : 8) + 2,
        speed: Math.random() * (window.innerWidth < 768 ? 0.8 : 1) + 0.3,
        opacity: Math.random() * (window.innerWidth < 768 ? 0.3 : 0.4) + 0.1
    }));
}

function drawBubbles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    burbujas.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity})`;
        ctx.fill();

        b.y -= b.speed;
        if (b.y < -b.radius) {
            b.y = canvas.height + b.radius;
            b.x = Math.random() * canvas.width;
        }
    });

    animationId = requestAnimationFrame(drawBubbles);
}

function handleResize() {
    cancelAnimationFrame(animationId);
    initBubbles();
    drawBubbles();
}

function init() {
    initBubbles();
    drawBubbles();

    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('load', init);
window.addEventListener('resize', handleResize);

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(animationId);
    } else {
        drawBubbles();
    }
});

window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationId);
});
