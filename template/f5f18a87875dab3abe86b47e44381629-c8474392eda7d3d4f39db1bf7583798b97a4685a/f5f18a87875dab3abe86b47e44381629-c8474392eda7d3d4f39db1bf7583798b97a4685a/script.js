/* ═══════════════════════════════════
           CURSOR
        ═══════════════════════════════════ */
const cursor = document.getElementById("cursor");
const cursorRing = document.getElementById("cursorTrail");
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;
document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = mx + "px";
  cursor.style.top = my + "px";
});
function animRing() {
  rx += (mx - rx) * 0.13;
  ry += (my - ry) * 0.13;
  cursorRing.style.left = rx + "px";
  cursorRing.style.top = ry + "px";
  requestAnimationFrame(animRing);
}
animRing();

/* ═══════════════════════════════════
           BG STARFIELD
        ═══════════════════════════════════ */
(function () {
  const c = document.getElementById("bg-stars");
  const ctx = c.getContext("2d");
  let W,
    H,
    stars = [];

  function resize() {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
    init();
  }

  function init() {
    stars = [];
    for (let i = 0; i < 220; i++) {
      const r = Math.random() * 1.5;
      const hue = Math.random() > 0.7 ? (Math.random() > 0.5 ? 200 : 290) : 270;
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r,
        speed: 0.02 + Math.random() * 0.06,
        alpha: Math.random(),
        dir: Math.random() > 0.5 ? 1 : -1,
        hue,
        sat: 60 + Math.random() * 40,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.twinkle += s.speed * s.dir;
      const a = 0.3 + 0.5 * Math.abs(Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue},${s.sat}%,80%,${a})`;
      ctx.fill();
      if (s.r > 1) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue},${s.sat}%,80%,${a * 0.12})`;
        ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
})();

/* ═══════════════════════════════════
           NAV INNER STARFIELD
        ═══════════════════════════════════ */
(function () {
  const navEl = document.getElementById("navCapsule");
  const c = document.getElementById("nav-stars");
  const ctx = c.getContext("2d");
  let stars = [];
  let W, H;

  function setup() {
    const rect = navEl.getBoundingClientRect();
    W = c.width = rect.width;
    H = c.height = rect.height;
    stars = [];
    for (let i = 0; i < 18; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.3 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.06,
        alpha: Math.random() * 0.4,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.025,
        hue: Math.random() > 0.5 ? 200 : 280,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.twinkle += s.speed;
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0) s.x = W;
      if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H;
      if (s.y > H) s.y = 0;
      const a = 0.08 + 0.22 * Math.abs(Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue},60%,90%,${a})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  setup();
  requestAnimationFrame(draw);
})();

/* ═══════════════════════════════════
           TOOLTIP
        ═══════════════════════════════════ */
const tooltip = document.getElementById("tooltip");
document.querySelectorAll("[data-label]").forEach((el) => {
  el.addEventListener("mouseenter", (e) => {
    tooltip.textContent = el.dataset.label;
    tooltip.classList.add("show");
  });
  el.addEventListener("mousemove", (e) => {
    tooltip.style.left = e.clientX + 16 + "px";
    tooltip.style.top = e.clientY - 36 + "px";
  });
  el.addEventListener("mouseleave", () => tooltip.classList.remove("show"));
});

/* ═══════════════════════════════════
           ACTIVE STATE TOGGLE
        ═══════════════════════════════════ */
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-item")
      .forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
  });
});
