import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { state } from './state.js';

export function setupScene() {
    state.camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    state.camera.position.set(4, 2, 4);

    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x0f1318);
    state.scene.fog = new THREE.Fog(0x0f1318, 8, 30);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x223344, 2.8);
    hemiLight.position.set(0, 20, 0);
    state.scene.add(hemiLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.4);
    directionalLight.position.set(8, 18, 10);
    directionalLight.castShadow = true;
    state.scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x88aaff, 0.7);
    fillLight.position.set(-8, 8, -6);
    state.scene.add(fillLight);

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(500, 500),
        new THREE.ShadowMaterial({ opacity: 0.18 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.001;
    ground.receiveShadow = true;
    state.scene.add(ground);

    state.grid = new THREE.GridHelper(120, 120, 0x6e7b86, 0x34414b);
    state.grid.material.opacity = 0.52;
    state.grid.material.transparent = true;
    state.scene.add(state.grid);
}

export function setupRenderer() {
    state.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });

    state.renderer.setPixelRatio(window.devicePixelRatio);
    state.renderer.setSize(window.innerWidth, window.innerHeight);
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    state.renderer.setAnimationLoop(render);

    document.body.appendChild(state.renderer.domElement);
}

export function setupControls() {
    state.controls = new OrbitControls(state.camera, state.renderer.domElement);
    state.controls.enableDamping = true;
    state.controls.dampingFactor = 0.06;
    state.controls.target.set(0, 0.5, 0);
    state.controls.minDistance = 0.5;
    state.controls.maxDistance = 50;
    state.controls.update();
}

export function setupTransformControls() {
    state.transformControls = new TransformControls(
        state.camera,
        state.renderer.domElement
    );

    state.transformControls.enabled = false;
    state.transformControls.visible = false;
    state.transformControls.setSize(0.8);

    state.transformControls.addEventListener('dragging-changed', (event) => {
        state.controls.enabled = !event.value;
    });

    state.transformControls.addEventListener('objectChange', () => {
        if (!state.mesh) return;

        const boundingBox = new THREE.Box3().setFromObject(state.mesh);
        const center = boundingBox.getCenter(new THREE.Vector3());
        state.controls.target.copy(center);
    });

    const helper = state.transformControls.getHelper();
    helper.renderOrder = 999;
    state.scene.add(helper);
}

export function onWindowResize() {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
}

export function render() {
    state.controls.update();
    state.renderer.render(state.scene, state.camera);
}