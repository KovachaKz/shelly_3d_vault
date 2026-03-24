import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
import { STLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/STLLoader.js';
import { MODEL_SET_ORDER, MODEL_SETS } from './config.js';

const list = document.getElementById('model-list');

MODEL_SET_ORDER.forEach((setName) => {
  const set = MODEL_SETS[setName];
  const files = Object.values(set.variants);

  const card = document.createElement('div');
  card.className = 'model-item';

  card.innerHTML = `
    <div class="preview-container"><canvas width="240" height="180"></canvas></div>
    <div class="item-content">
      <p>${setName}</p>
      <div class="item-actions">
        <button data-action="view">View Model</button>
        <button data-action="download">Download STL</button>
      </div>
    </div>
  `;

  const canvas = card.querySelector('canvas');
  loadPreview(canvas, set.preview);

  card.querySelector('[data-action="view"]').addEventListener('click', () => {
    const model = encodeURIComponent(set.variants.Default || files[0]);
    const modelSet = encodeURIComponent(setName);
    window.location.href = `viewer.html?model=${model}&modelSet=${modelSet}`;
  });

  card.querySelector('[data-action="download"]').addEventListener('click', () => {
    downloadFiles(files);
  });

  list.appendChild(card);
});

function loadPreview(canvas, modelUrl) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
  camera.position.z = 1.5;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(canvas.width, canvas.height, false);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  scene.add(light);

  const loader = new STLLoader();
  loader.load(modelUrl, (geometry) => {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0x5e5e5e }));
    mesh.scale.set(0.05, 0.05, 0.05);
    scene.add(mesh);

    const animate = () => {
      requestAnimationFrame(animate);
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();
  });
}

async function downloadFiles(urls) {
  const zip = new JSZip();
  const folder = zip.folder('models');

  for (const url of urls) {
    const response = await fetch(url);
    const blob = await response.blob();
    folder.file(url.split('/').pop(), blob);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'models.zip');
}
