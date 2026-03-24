import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { state } from './state.js';

const loader = new STLLoader();

export function loadModel(modelUrl) {
  if (state.object) {
    state.scene.remove(state.object);
  }

  loader.load(modelUrl, (geometry) => {
    state.material = new THREE.MeshPhongMaterial({
      color: state.materialParams.color,
      wireframe: state.materialParams.wireframe
    });

    state.object = new THREE.Mesh(geometry, state.material);
    state.object.scale.set(0.05, 0.05, 0.05);
    state.scene.add(state.object);

    const bbox = new THREE.Box3().setFromObject(state.object);
    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = state.camera.fov * (Math.PI / 180);
    const distance = maxDim / (2 * Math.tan(fov / 2));

    state.camera.position.set(center.x, center.y + distance, center.z + distance * 1.5);
    state.camera.lookAt(center);
    state.controls.target.copy(center);
    state.controls.update();
  });
}

export function updateTransform() {
  if (!state.object) return;
  state.object.rotation.set(
    state.transformParams.rotationX,
    state.transformParams.rotationY,
    state.transformParams.rotationZ
  );
  state.object.position.set(
    state.transformParams.positionX,
    state.transformParams.positionY,
    state.transformParams.positionZ
  );
}

export function updateMaterial() {
  if (!state.material) return;
  state.material.color.set(state.materialParams.color);
  state.material.wireframe = state.materialParams.wireframe;
}
