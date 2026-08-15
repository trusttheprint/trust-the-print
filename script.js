/* =========================================================
   TRUST THE PRINT — script.js
   Header, menu, reveals, Mini Me toggle, e cena 3D do hero.
   ========================================================= */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;

/* ---------- footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- header scroll state ---------- */
const header = document.getElementById('siteHeader');
const onScrollHeader = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 12);
};
onScrollHeader();
window.addEventListener('scroll', onScrollHeader, { passive: true });

/* ---------- mobile nav ---------- */
const hamburger = document.getElementById('hamburgerBtn');
const mainNav = document.getElementById('mainNav');
hamburger.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  hamburger.setAttribute('aria-expanded', String(isOpen));
  hamburger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mainNav.classList.remove('is-open');
  hamburger.setAttribute('aria-expanded', 'false');
}));

/* ---------- reveal on scroll ---------- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

/* ---------- Mini Me style toggle ---------- */
const btnPop = document.getElementById('btnPop');
const btnStylized = document.getElementById('btnStylized');
const figurePop = document.getElementById('figurePop');
const figureStylized = document.getElementById('figureStylized');
const previewTag = document.getElementById('previewTag');

function setMiniMeStyle(style) {
  const isPop = style === 'pop';
  btnPop.classList.toggle('is-active', isPop);
  btnStylized.classList.toggle('is-active', !isPop);
  btnPop.setAttribute('aria-pressed', String(isPop));
  btnStylized.setAttribute('aria-pressed', String(!isPop));
  figurePop.classList.toggle('is-active', isPop);
  figureStylized.classList.toggle('is-active', !isPop);
  previewTag.textContent = isPop ? 'Estilo POP' : 'Estilo STYLIZED';
}
btnPop.addEventListener('click', () => setMiniMeStyle('pop'));
btnStylized.addEventListener('click', () => setMiniMeStyle('stylized'));

/* =========================================================
   HERO 3D — Three.js
   O símbolo oficial da Trust the Print, construído em peças
   coloridas (Momentum Yellow / Build Teal / Print Coral)
   que entram dispersas, flutuam, e encaixam no lugar.
   Reage ao rato (parallax/tilt) e ao scroll (separação de layers).
   ========================================================= */
async function initHero3D() {
  const canvas = document.getElementById('heroCanvas');
  const stage = document.getElementById('hero3d');
  if (!canvas || !stage) return;

  // Testa suporte WebGL antes de carregar a biblioteca.
  const testCtx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!testCtx) {
    stage.innerHTML = '<img src="assets/logos/symbol.png" alt="Símbolo da Trust the Print" style="width:55%;margin:auto;display:block;">';
    return;
  }

  let THREE;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
  } catch (e) {
    stage.innerHTML = '<img src="assets/logos/symbol.png" alt="Símbolo da Trust the Print" style="width:55%;margin:auto;display:block;">';
    return;
  }

  const COLORS = {
    yellow: 0xFFD21A,
    teal: 0x0083A6,
    coral: 0xFF6B4A
  };

  /* ---- helpers de geometria (formas arredondadas, estilo "pixel cluster") ---- */
  function roundedRectShape(w, h, r) {
    const s = new THREE.Shape();
    s.moveTo(r, 0);
    s.lineTo(w - r, 0);
    s.absarc(w - r, r, r, -Math.PI / 2, 0, false);
    s.lineTo(w, h - r);
    s.absarc(w - r, h - r, r, 0, Math.PI / 2, false);
    s.lineTo(r, h);
    s.absarc(r, h - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(0, r);
    s.absarc(r, r, r, Math.PI, Math.PI * 1.5, false);
    return s;
  }

  // Peça em L (a peça "âncora" do símbolo) — retângulo com uma marca cortada.
  function lShape(w, h, notchW, notchH, r) {
    const s = new THREE.Shape();
    s.moveTo(r, 0);
    s.lineTo(w - notchW, 0);
    s.lineTo(w - notchW, notchH);
    s.lineTo(w, notchH);
    s.lineTo(w, h - r);
    s.absarc(w - r, h - r, r, 0, Math.PI / 2, false);
    s.lineTo(r, h);
    s.absarc(r, h - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(0, r);
    s.absarc(r, r, r, Math.PI, Math.PI * 1.5, false);
    return s;
  }

  function extrude(shape, depth, segments) {
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelSegments: 2,
      curveSegments: segments
    });
    geo.center();
    return geo;
  }

  const lowDetail = isTouch || window.innerWidth < 700;
  const segs = lowDetail ? 5 : 10;

  // Definição das peças: [geometria, cor, posição final, profundidade da camada]
  const pieceDefs = [
    { shape: lShape(1.78, 1.98, 0.86, 0.86, 0.16), color: COLORS.yellow, pos: [-0.78, 0.72, 0], depth: 0.5 },
    { shape: roundedRectShape(0.92, 0.92, 0.14), color: COLORS.teal, pos: [1.28, 1.34, 0], depth: 0.42 },
    { shape: roundedRectShape(0.95, 0.95, 0.14), color: COLORS.teal, pos: [0.1, 0.05, 0], depth: 0.58 },
    { shape: roundedRectShape(1.0, 1.0, 0.14), color: COLORS.teal, pos: [-1.12, -1.1, 0], depth: 0.46 },
    { shape: roundedRectShape(0.96, 1.0, 0.14), color: COLORS.coral, pos: [1.28, -1.1, 0], depth: 0.5 }
  ];

  /* ---- scene / camera / renderer ---- */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 9.4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowDetail, alpha: true });
  renderer.setClearColor(0x000000, 0);
  const dpr = Math.min(window.devicePixelRatio || 1, lowDetail ? 1.5 : 2);
  renderer.setPixelRatio(dpr);

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---- luz ---- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(4, 6, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x88d8e8, 0.35);
  fill.position.set(-6, -2, 4);
  scene.add(fill);
  const rim = new THREE.PointLight(0xffe08a, 0.5, 20);
  rim.position.set(-3, -4, 5);
  scene.add(rim);

  /* ---- grupo principal (permite tilt/parallax conjunto) ---- */
  const group = new THREE.Group();
  scene.add(group);

  const pieces = pieceDefs.map((def, i) => {
    const geo = extrude(def.shape, def.depth, segs);
    const mat = new THREE.MeshStandardMaterial({
      color: def.color,
      roughness: 0.55,
      metalness: 0.04
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.target = { pos: def.pos.slice(), rot: [0, 0, 0] };
    mesh.userData.baseZ = def.pos[2];
    mesh.userData.index = i;

    // estado disperso inicial: posição afastada + rotação aleatória
    const angle = Math.random() * Math.PI * 2;
    const radius = 4.6 + Math.random() * 2.4;
    mesh.position.set(
      def.pos[0] + Math.cos(angle) * radius,
      def.pos[1] + Math.sin(angle) * radius + 1.4,
      def.pos[2] + (Math.random() - 0.5) * 3
    );
    mesh.rotation.set(
      (Math.random() - 0.5) * 3.2,
      (Math.random() - 0.5) * 3.2,
      (Math.random() - 0.5) * 3.2
    );
    group.add(mesh);
    return mesh;
  });

  group.rotation.x = -0.18;
  group.rotation.y = 0.12;

  /* ---- easing ---- */
  function easeOutBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  const startTime = performance.now();
  const ASSEMBLE_DURATION = prefersReducedMotion ? 1 : 2200;
  const STAGGER = prefersReducedMotion ? 0 : 130;

  /* ---- interação com o rato (parallax / tilt) ---- */
  let targetTiltX = 0, targetTiltY = 0;
  let currentTiltX = 0, currentTiltY = 0;

  function handlePointer(clientX, clientY) {
    const rect = stage.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((clientY - rect.top) / rect.height) * 2 - 1;
    targetTiltY = nx * 0.32;
    targetTiltX = -ny * 0.22;
  }
  if (!isTouch) {
    window.addEventListener('mousemove', (e) => handlePointer(e.clientX, e.clientY));
  }
  window.addEventListener('mouseleave', () => { targetTiltX = 0; targetTiltY = 0; });

  /* ---- interação com o scroll (separação de layers) ---- */
  let scrollProgress = 0;
  function handleScroll() {
    const heroH = stage.closest('.hero').offsetHeight || 1;
    const p = window.scrollY / heroH;
    scrollProgress = Math.min(Math.max(p, 0), 1);
  }
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  /* ---- pausa a renderização quando o hero não está visível ---- */
  let isVisible = true;
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => { isVisible = entry.isIntersecting; });
    }, { threshold: 0.01 });
    heroObserver.observe(stage);
  }

  /* ---- loop de animação ---- */
  function tick(now) {
    requestAnimationFrame(tick);
    if (!isVisible) return;

    const elapsed = now - startTime;

    pieces.forEach((mesh, i) => {
      const localStart = i * STAGGER;
      const localT = Math.min(Math.max((elapsed - localStart) / ASSEMBLE_DURATION, 0), 1);
      const eased = easeOutBack(localT);
      const target = mesh.userData.target;

      if (localT < 1 || prefersReducedMotion) {
        // interpola das posições dispersas iniciais para o alvo (só necessário durante a entrada)
      }

      // posição base = interpolação para o alvo (usa easing tipo "encaixe")
      const tx = target.pos[0], ty = target.pos[1], tz = target.pos[2];
      if (localT < 1) {
        mesh.position.x += (tx - mesh.position.x) * Math.min(eased * 0.14 + 0.02, 1);
        mesh.position.y += (ty - mesh.position.y) * Math.min(eased * 0.14 + 0.02, 1);
        mesh.position.z += (tz - mesh.position.z) * Math.min(eased * 0.14 + 0.02, 1);
        mesh.rotation.x += (0 - mesh.rotation.x) * 0.09;
        mesh.rotation.y += (0 - mesh.rotation.y) * 0.09;
        mesh.rotation.z += (0 - mesh.rotation.z) * 0.09;
      } else {
        // assentado: bob idle subtil + separação de camadas no scroll
        const bob = prefersReducedMotion ? 0 : Math.sin(now * 0.0011 + i * 1.3) * 0.035;
        const sepZ = scrollProgress * (i + 1) * 0.85;
        const sepSpread = scrollProgress * 0.5;
        const dirX = Math.sign(tx) || 1;
        const dirY = Math.sign(ty) || 1;

        mesh.position.x += ((tx + dirX * sepSpread * 0.4) - mesh.position.x) * 0.12;
        mesh.position.y += ((ty + dirY * sepSpread * 0.4 + bob) - mesh.position.y) * 0.12;
        mesh.position.z += ((tz + sepZ) - mesh.position.z) * 0.12;
      }
    });

    // tilt suave do grupo (parallax ao rato)
    currentTiltX += (targetTiltX - currentTiltX) * 0.06;
    currentTiltY += (targetTiltY - currentTiltY) * 0.06;
    group.rotation.x = -0.18 + currentTiltX;
    group.rotation.y = 0.12 + currentTiltY;

    // desvanece suavemente ao aproximar-se do fim do hero
    const fadeOpacity = 1 - Math.min(scrollProgress * 1.35, 1);
    canvas.style.opacity = String(Math.max(fadeOpacity, 0));

    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);
}

initHero3D();
