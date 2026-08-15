(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Mini Me style switch
  const styleBtns = document.querySelectorAll(".style-btn");
  const preview = document.querySelector(".figure-preview");
  styleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      styleBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (preview) {
        preview.classList.toggle("stylized", btn.dataset.style === "stylized");
        preview.classList.toggle("pop", btn.dataset.style === "pop");
      }
    });
  });

  // 3D background — a layered sculptural form that responds to mouse + scroll.
  if (!window.THREE) return;

  const mount = document.getElementById("three-bg");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0.15, 10.5);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const teal = new THREE.Color("#0083A6");
  const yellow = new THREE.Color("#FFD21A");
  const coral = new THREE.Color("#FF6B4A");
  const graphite = new THREE.Color("#1B1F24");

  const layers = [];
  const total = 34;

  for (let i = 0; i < total; i++) {
    const t = i / (total - 1);
    const radius = 1.9 + Math.sin(t * Math.PI) * 0.55;
    const tube = 0.075 + 0.018 * Math.sin(t * Math.PI * 2);
    const geo = new THREE.TorusGeometry(radius, tube, 10, 90);

    let color = teal.clone();
    if (i % 11 === 2) color = yellow.clone();
    if (i % 13 === 8) color = coral.clone();

    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.36,
      metalness: 0.08,
      transparent: true,
      opacity: 0.92
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.rotation.z = t * 0.38 - 0.18;
    mesh.position.y = (i - total / 2) * 0.082;
    mesh.scale.setScalar(0.86 + Math.sin(t * Math.PI) * 0.18);
    group.add(mesh);
    layers.push(mesh);
  }

  const coreGeo = new THREE.IcosahedronGeometry(1.35, 2);
  const coreMat = new THREE.MeshStandardMaterial({
    color: graphite,
    roughness: 0.42,
    metalness: 0.12,
    flatShading: true
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.scale.set(1.2, 1.35, 1.2);
  group.add(core);

  const key = new THREE.DirectionalLight(0xffffff, 3.4);
  key.position.set(4, 5, 6);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x5ed8ff, 1.4);
  fill.position.set(-5, 1, 3);
  scene.add(fill);

  const warm = new THREE.PointLight(0xffd21a, 15, 14);
  warm.position.set(2, -3, 4);
  scene.add(warm);

  group.position.x = innerWidth > 950 ? 2.7 : 0;
  group.rotation.x = -0.18;
  group.rotation.z = 0.18;

  const mouse = {x:0, y:0};
  const smooth = {x:0, y:0};

  window.addEventListener("pointermove", e => {
    mouse.x = (e.clientX / innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / innerHeight - 0.5) * 2;
  }, {passive:true});

  function onResize(){
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    group.position.x = innerWidth > 950 ? 2.7 : 0;
  }
  addEventListener("resize", onResize);

  const clock = new THREE.Clock();

  function animate(){
    const time = clock.getElapsedTime();
    const scroll = Math.min(scrollY / Math.max(innerHeight, 1), 3);

    smooth.x += (mouse.x - smooth.x) * 0.035;
    smooth.y += (mouse.y - smooth.y) * 0.035;

    group.rotation.y += (smooth.x * 0.22 - group.rotation.y) * 0.035;
    group.rotation.x += ((-0.18 - smooth.y * 0.12) - group.rotation.x) * 0.035;
    group.rotation.z = 0.18 + Math.sin(time * 0.35) * 0.035;

    // Layers "explode" slightly as the visitor begins scrolling.
    const explode = Math.min(scroll, 1.05);
    layers.forEach((mesh, i) => {
      const baseY = (i - total / 2) * 0.082;
      const spread = (i - total / 2) * 0.018 * explode;
      mesh.position.y += ((baseY + spread) - mesh.position.y) * 0.05;
      mesh.rotation.z += 0.0008 * (i % 2 ? 1 : -1);
    });

    core.rotation.y = time * 0.12;
    core.rotation.x = time * 0.08;

    // Fade the 3D background slightly after the hero so content stays clean.
    const fade = Math.max(0.12, 1 - scroll * 0.34);
    renderer.domElement.style.opacity = fade.toFixed(3);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();
