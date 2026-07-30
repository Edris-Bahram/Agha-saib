(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    return;
  }
  if(typeof THREE === 'undefined'){
    console.warn('Three.js بارگذاری نشد؛ پس‌زمینهٔ سه‌بعدی غیرفعال است.');
    return;
  }

  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 13);

  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene.add(new THREE.AmbientLight(0x223344, 1.1));
  const lightSaffron = new THREE.PointLight(0xf0a13e, 55, 40);
  lightSaffron.position.set(6, 4, 8);
  scene.add(lightSaffron);
  const lightJade = new THREE.PointLight(0x3ea88f, 45, 40);
  lightJade.position.set(-6, -3, 6);
  scene.add(lightJade);

  function makeStarGeometry(points, innerRatio, depth){
    const shape = new THREE.Shape();
    const outerR = 1;
    const innerR = outerR * innerRatio;
    for(let i=0; i<points*2; i++){
      const r = (i % 2 === 0) ? outerR : innerR;
      const angle = (i / (points*2)) * Math.PI*2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if(i===0) shape.moveTo(x,y); else shape.lineTo(x,y);
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {depth, bevelEnabled:true, bevelThickness:0.04, bevelSize:0.03, bevelSegments:2, curveSegments:12});
  }

  const starGeo = makeStarGeometry(8, 0.5, 0.12);
  const matSaffron = new THREE.MeshStandardMaterial({color:0xf0a13e, metalness:0.35, roughness:0.4, emissive:0x3a2205, emissiveIntensity:0.4});
  const matJade = new THREE.MeshStandardMaterial({color:0x3ea88f, metalness:0.35, roughness:0.4, emissive:0x08251d, emissiveIntensity:0.4});
  const matGhost = new THREE.MeshStandardMaterial({color:0xf4efe2, metalness:0.2, roughness:0.6, transparent:true, opacity:0.18});

  const group = new THREE.Group();
  const STAR_COUNT = window.innerWidth < 700 ? 10 : 18;

  for(let i=0; i<STAR_COUNT; i++){
    const mat = i % 5 === 0 ? matSaffron : (i % 5 === 1 ? matJade : matGhost);
    const mesh = new THREE.Mesh(starGeo, mat);
    const radius = 4 + Math.random()*7;
    const angle = Math.random()*Math.PI*2;
    const height = (Math.random()-0.5) * 9;
    mesh.position.set(Math.cos(angle)*radius, height, Math.sin(angle)*radius - 4);
    const scale = 0.5 + Math.random()*1.1;
    mesh.scale.setScalar(scale);
    mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    mesh.userData.rotSpeed = (0.05 + Math.random()*0.12) * (Math.random()<0.5 ? -1 : 1);
    mesh.userData.orbitSpeed = 0.02 + Math.random()*0.03;
    mesh.userData.orbitRadius = radius;
    mesh.userData.orbitAngle = angle;
    mesh.userData.orbitHeight = height;
    group.add(mesh);
  }
  scene.add(group);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e)=>{
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  });

  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const t = clock.getElapsedTime();

    group.children.forEach(mesh=>{
      mesh.rotation.x += mesh.userData.rotSpeed * delta;
      mesh.rotation.y += mesh.userData.rotSpeed * 0.7 * delta;
      const ud = mesh.userData;
      ud.orbitAngle += ud.orbitSpeed * delta;
      mesh.position.x = Math.cos(ud.orbitAngle) * ud.orbitRadius;
      mesh.position.z = Math.sin(ud.orbitAngle) * ud.orbitRadius - 4;
    });

    group.rotation.y = t * 0.015;
    camera.position.x += (mouseX*1.5 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY*1.5 - camera.position.y) * 0.02;
    camera.lookAt(0,0,-2);

    lightSaffron.position.x = Math.sin(t*0.3) * 7;
    lightJade.position.x = -Math.sin(t*0.25) * 7;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  canvas.classList.remove('loading');
})();
