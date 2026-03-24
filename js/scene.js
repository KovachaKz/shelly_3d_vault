import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MODEL_SETS } from './config.js';
import { loadModel, updateMaterial, updateTransform } from './model.js';
import { state } from './state.js';

export function initViewer() {
  const params = new URLSearchParams(window.location.search);
  const modelUrl = decodeURIComponent(params.get('model') || MODEL_SETS['Wall Display Stand'].variants.Default);
  const modelSet = decodeURIComponent(params.get('modelSet') || 'Wall Display Stand');
  state.currentModelSet = MODEL_SETS[modelSet] ? modelSet : 'Wall Display Stand';

  state.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  state.camera.position.set(4, 2, 4);

  state.scene = new THREE.Scene();
  state.scene.background = new THREE.Color(0xa0a0a0);
  state.scene.fog = new THREE.Fog(0xa0a0a0, 4, 20);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
  hemi.position.set(0, 20, 0);
  state.scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 3);
  dir.position.set(0, 20, 10);
  state.scene.add(dir);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshPhongMaterial({ color: 0xbbbbbb, depthWrite: false })
  );
  ground.rotation.x = -Math.PI / 2;
  state.scene.add(ground);

  state.scene.add(new THREE.GridHelper(500, 500, 0x000000, 0x000000));

  state.renderer = new THREE.WebGLRenderer({ antialias: true });
  state.renderer.setPixelRatio(window.devicePixelRatio);
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(state.renderer.domElement);

  state.controls = new OrbitControls(state.camera, state.renderer.domElement);
  state.controls.target.set(0, 0.5, 0);
  state.controls.update();

  state.gui = new GUI();
  document.body.appendChild(state.gui.domElement);

  state.transformParams = {
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    positionX: 0,
    positionY: 0,
    positionZ: 0
  };

  const rotationFolder = state.gui.addFolder('Rotation');
  rotationFolder.add(state.transformParams, 'rotationX', -Math.PI, Math.PI).onChange(updateTransform);
  rotationFolder.add(state.transformParams, 'rotationY', -Math.PI, Math.PI).onChange(updateTransform);
  rotationFolder.add(state.transformParams, 'rotationZ', -Math.PI, Math.PI).onChange(updateTransform);

  const positionFolder = state.gui.addFolder('Position');
  positionFolder.add(state.transformParams, 'positionX', -5, 5).onChange(updateTransform);
  positionFolder.add(state.transformParams, 'positionY', -5, 5).onChange(updateTransform);
  positionFolder.add(state.transformParams, 'positionZ', -5, 5).onChange(updateTransform);

  state.materialParams = { color: 0x5e5e5e, wireframe: false };
  const materialFolder = state.gui.addFolder('Material');
  materialFolder.addColor(state.materialParams, 'color').onChange(updateMaterial);
  materialFolder.add(state.materialParams, 'wireframe').onChange(updateMaterial);

  const variantParams = {
    variant: 'Default'
  };

  state.gui
    .add(variantParams, 'variant', Object.keys(MODEL_SETS[state.currentModelSet].variants))
    .name('Select Variant')
    .onChange((value) => loadModel(MODEL_SETS[state.currentModelSet].variants[value]));

  loadModel(modelUrl);

  window.addEventListener('resize', onWindowResize);
}

export function animate() {
  requestAnimationFrame(animate);
  state.controls?.update();
  state.renderer?.render(state.scene, state.camera);
}

function onWindowResize() {
  state.camera.aspect = window.innerWidth / window.innerHeight;
  state.camera.updateProjectionMatrix();
  state.renderer.setSize(window.innerWidth, window.innerHeight);
}
