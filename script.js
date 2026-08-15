(() => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  document.querySelectorAll('.style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preview = document.getElementById('figure-preview');
      if (!preview) return;
      preview.classList.toggle('stylized', btn.dataset.style === 'stylized');
    });
  });

  if (!window.THREE) return;
  const mount = document.getElementById('three-bg');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.2, 10.5);

  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);
  mount.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const COLORS = [0xFFD21A, 0x0083A6, 0xFF6B4A, 0xFFFFFF];
  const layers = [];
  const total = 24;

  for (let i=0; i<total; i++) {
    const size = 2.6 - i * 0.07;
    const geo = new THREE.BoxGeometry(size, 0.12, size * 0.72);
    const mat = new THREE.MeshStandardMaterial({
      color: COLORS[i % COLORS.length],
      roughness: 0.28,
      metalness: 0.08,
      transparent: true,
      opacity: 0.94
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = (i - total/2) * 0.11;
    mesh.rotation.x = 0.35;
    mesh.rotation.y = i * 0.08;
    mesh.rotation.z = i * 0.03;
    group.add(mesh);
    layers.push(mesh);
  }

  const ringGeo = new THREE.TorusGeometry(2.45, 0.05, 12, 120);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x0083A6, transparent:true, opacity:0.28 });
  const ring1 = new THREE.Mesh(ringGeo, ringMat); ring1.rotation.x = Math.PI / 2.2; group.add(ring1);
  const ring2 = new THREE.Mesh(ringGeo, ringMat.clone()); ring2.scale.setScalar(0.76); ring2.rotation.set(Math.PI/2.6, 0.4, 0.2); group.add(ring2);

  const ambient = new THREE.AmbientLight(0xffffff, 1.8); scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 2.8); key.position.set(4,6,5); scene.add(key);
  const warm = new THREE.PointLight(0xFFD21A, 18, 18); warm.position.set(-2,-2,5); scene.add(warm);
  const coral = new THREE.PointLight(0xFF6B4A, 10, 16); coral.position.set(4,1,4); scene.add(coral);

  const mouse = {x:0, y:0};
  const smooth = {x:0, y:0};

  group.position.set(window.innerWidth > 900 ? 2.8 : 0, 0.3, 0);

  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, {passive:true});

  function resize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight);
    group.position.x = window.innerWidth > 900 ? 2.8 : 0;
  }
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  function animate(){
    const t = clock.getElapsedTime();
    const scroll = Math.min(window.scrollY / Math.max(window.innerHeight,1), 2.5);

    smooth.x += (mouse.x - smooth.x) * 0.04;
    smooth.y += (mouse.y - smooth.y) * 0.04;

    group.rotation.y += ((smooth.x * 0.35) - group.rotation.y) * 0.04;
    group.rotation.x += ((0.12 - smooth.y * 0.16) - group.rotation.x) * 0.04;
    group.rotation.z = Math.sin(t * 0.45) * 0.08;

    layers.forEach((mesh, i) => {
      const offset = (i - total/2) * 0.11;
      const spread = (i - total/2) * 0.035 * (0.4 + Math.sin(t * 0.8 + i * 0.2));
      mesh.position.y += ((offset + spread + scroll * 0.05) - mesh.position.y) * 0.06;
      mesh.rotation.y += 0.0025;
    });

    ring1.rotation.z += 0.003;
    ring2.rotation.z -= 0.0025;

    renderer.domElement.style.opacity = String(Math.max(0.18, 1 - scroll * 0.22));
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();