var SPEED = 0.001;
var container;
var camera, scene, renderer;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var objectLoader = new THREE.ObjectLoader();
var objects = [];

init();
animate();

function rand(v) {
  return (Math.random() - 0.5) * (2*v);
}

function load(modelPath) {
  objectLoader.setTexturePath(modelPath.split('/').slice(0, -1).join('/') + '/');
  objectLoader.load(modelPath, function(obj) {
    obj.traverse(function(c) {
      if ('material' in c && !c.material.map) {
        c.material = new THREE.MeshNormalMaterial();
        if (c.name == 'Plane') {
          c.visible = false;
        }
      }
    });
    var target_y = 0.5;
    var box = new THREE.Box3().setFromObject(obj);
    var size = box.getSize();
    var scale = target_y/size.y;
    obj.scale.set(0, 0, 0);
    obj.position.set(rand(3), rand(1), rand(2));
    new TWEEN.Tween(obj.scale).to({
      x: scale,
      y: scale,
      z: scale
    }, 2000)
    .easing(TWEEN.Easing.Elastic.Out).start();
    scene.add(obj);
    objects.push(obj);
  });
}

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 2000);
  camera.position.z = 4;
  scene = new THREE.Scene();
  var ambient = new THREE.AmbientLight(0x444444);
  scene.add(ambient);
  var directionalLight = new THREE.DirectionalLight(0xffeedd);
  directionalLight.position.set(0, 0, 1).normalize();
  scene.add(directionalLight);
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
  });
  renderer.setClearColor(0xffffff, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize() {
  windowHalfX = window.innerWidth/2;
  windowHalfY = window.innerHeight/2;
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate() {
  requestAnimationFrame(animate);
  render();
}
function render() {
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
  objects.map(obj => {
    obj.rotation.x -= SPEED * 2;
    obj.rotation.y -= SPEED;
    obj.rotation.z -= SPEED * 3;
  });
  TWEEN.update();
}

document.getElementById('input').addEventListener('keydown', function(ev) {
  var query = ev.target.value;
  if (ev.key == 'Enter') {
    ev.target.disabled = true;
    ev.target.className = 'loading';
    console.log(`searching for: ${query}`);
    fetch('/search', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify({
          'query': query
      })
    })
    .then(resp => resp.json())
    .then(data => {
      if (data.success) {
        var path = data.path;
        console.log(`loading: ${path}`);
        load(path);
      } else {
        console.log('failed to find anything');
      }
      ev.target.value = '';
      ev.target.className = '';
      ev.target.disabled = false;
    })
    .catch(err => {
      console.log(err);
    });
  }
});
