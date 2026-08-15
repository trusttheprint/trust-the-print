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
  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0.1, 11);

  const renderer = new THREE.WebGLRenderer({
    antialias:true,
    alpha:true,
    powerPreference:'high-performance'
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const world = new THREE.Group();
  scene.add(world);

  // Official logo recreated in 3D:
  // yellow L + three teal blocks + one coral block.
  const palette = {
    yellow:0xFFD21A,
    teal:0x0083A6,
    coral:0xFF6B4A,
    graphite:0x1B1F24
  };

  function mat(color){
    return new THREE.MeshStandardMaterial({
      color,
      roughness:.28,
      metalness:.08
    });
  }

  function box(w,h,d,color,x,y,z=0){
    const geo = new THREE.BoxGeometry(w,h,d);
    const mesh = new THREE.Mesh(geo, mat(color));
    mesh.position.set(x,y,z);
    mesh.userData.home = new THREE.Vector3(x,y,z);
    world.add(mesh);
    return mesh;
  }

  const parts = [];

  // The "L" is built out of two chunky blocks so it reads clearly in 3D.
  parts.push(box(2.45,.72,.72,palette.yellow, .15, 1.55));
  parts.push(box(.72,2.45,.72,palette.yellow,-.72,.68));

  // Official small squares
  parts.push(box(.86,.86,.72,palette.teal, 1.75, 1.50));
  parts.push(box(.86,.86,.72,palette.teal, .56, .30));
  parts.push(box(.86,.86,.72,palette.teal,-.72,-.88));
  parts.push(box(.86,.86,.72,palette.coral, 1.56,-.88));

  // Fine "print layers" behind the symbol
  const layerGroup = new THREE.Group();
  world.add(layerGroup);
  const layerMat = new THREE.MeshBasicMaterial({
    color:palette.teal, transparent:true, opacity:.20
  });
  for(let i=0;i<18;i++){
    const geo = new THREE.TorusGeometry(2.65 + i*.055, .018, 6, 90);
    const ring = new THREE.Mesh(geo, layerMat.clone());
    ring.rotation.x = Math.PI/2.25;
    ring.rotation.z = i*.055;
    ring.position.z = -1.25 - i*.035;
    ring.material.opacity = .22 - i*.007;
    layerGroup.add(ring);
  }

  // Little floating brand particles
  const particleGroup = new THREE.Group();
  world.add(particleGroup);
  const particleColors = [palette.yellow,palette.teal,palette.coral];
  for(let i=0;i<18;i++){
    const s = .08 + Math.random()*.13;
    const p = new THREE.Mesh(
      new THREE.BoxGeometry(s,s,s),
      new THREE.MeshStandardMaterial({color:particleColors[i%3],roughness:.35})
    );
    const a = Math.random()*Math.PI*2;
    const r = 3.3 + Math.random()*1.7;
    p.position.set(Math.cos(a)*r, Math.sin(a)*r*.65, (Math.random()-.5)*2);
    p.userData.phase = Math.random()*Math.PI*2;
    particleGroup.add(p);
  }

  const ambient = new THREE.AmbientLight(0xffffff, 2.2);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 3.8);
  key.position.set(4,5,8);
  scene.add(key);
  const tealLight = new THREE.PointLight(palette.teal, 15, 18);
  tealLight.position.set(-4,1,5);
  scene.add(tealLight);
  const yellowLight = new THREE.PointLight(palette.yellow, 14, 16);
  yellowLight.position.set(3,-3,5);
  scene.add(yellowLight);
  const coralLight = new THREE.PointLight(palette.coral, 8, 14);
  coralLight.position.set(5,2,1);
  scene.add(coralLight);

  world.position.set(innerWidth > 980 ? 3.0 : 0, .2, 0);
  world.rotation.set(-.12,-.18,.06);
  world.scale.setScalar(.92);

  // Start scattered, then assemble into the brand symbol.
  parts.forEach((mesh,i) => {
    mesh.userData.start = mesh.userData.home.clone().add(new THREE.Vector3(
      (Math.random()-.5)*9,
      (Math.random()-.5)*7,
      (Math.random()-.5)*5
    ));
    mesh.position.copy(mesh.userData.start);
    mesh.rotation.set(
      (Math.random()-.5)*2.2,
      (Math.random()-.5)*2.2,
      (Math.random()-.5)*2.2
    );
    mesh.userData.delay = i*.075;
  });

  const pointer = {x:0,y:0};
  const smooth = {x:0,y:0};
  addEventListener('pointermove', e => {
    pointer.x = (e.clientX/innerWidth-.5)*2;
    pointer.y = (e.clientY/innerHeight-.5)*2;
  }, {passive:true});

  function resize(){
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
    renderer.setSize(innerWidth,innerHeight);
    world.position.x = innerWidth > 980 ? 3.0 : 0;
  }
  addEventListener('resize',resize);

  const clock = new THREE.Clock();

  function easeOutBack(x){
    const c1=1.70158, c3=c1+1;
    return 1 + c3*Math.pow(x-1,3) + c1*Math.pow(x-1,2);
  }

  function animate(){
    const t = clock.getElapsedTime();
    const scroll = Math.min(scrollY/Math.max(innerHeight,1),2.2);

    smooth.x += (pointer.x-smooth.x)*.04;
    smooth.y += (pointer.y-smooth.y)*.04;

    // assemble during first ~1.4s
    parts.forEach((mesh,i) => {
      const local = Math.max(0,Math.min(1,(t-.12-mesh.userData.delay)/1.05));
      const k = easeOutBack(local);

      // on scroll the official logo separates back into "print layers"
      const explode = Math.min(scroll,1.15);
      const dir = mesh.userData.home.clone().normalize().multiplyScalar(explode*.65);

      const target = mesh.userData.start.clone().lerp(mesh.userData.home,k).add(dir);
      mesh.position.lerp(target,.16);

      mesh.rotation.x += (0 - mesh.rotation.x)*.10;
      mesh.rotation.y += (0 - mesh.rotation.y)*.10;
      mesh.rotation.z += (0 - mesh.rotation.z)*.10;
    });

    world.rotation.y += ((-.18 + smooth.x*.28) - world.rotation.y)*.045;
    world.rotation.x += ((-.12 - smooth.y*.13) - world.rotation.x)*.045;
    world.rotation.z = .06 + Math.sin(t*.55)*.025;

    layerGroup.rotation.z += .0015;
    layerGroup.rotation.y = Math.sin(t*.35)*.10;

    particleGroup.children.forEach((p,i) => {
      p.rotation.x += .006;
      p.rotation.y += .008;
      p.position.y += Math.sin(t*1.1 + p.userData.phase)*.0018;
    });

    // Keep the effect very visible in the hero; fade gradually after it.
    renderer.domElement.style.opacity = String(Math.max(.16, 1-scroll*.33));

    renderer.render(scene,camera);
    requestAnimationFrame(animate);
  }
  animate();
})();