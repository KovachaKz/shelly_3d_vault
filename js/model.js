import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { state } from './state.js';
import { DEFAULT_SCALE, MATERIAL_PRESETS, getViewerDefaults } from './config.js';
import {
    hideError,
    hideLoading,
    markActiveMaterialPreset,
    markActiveViewPreset,
    setInfoStatus,
    updateInfoPanel
} from './ui.js';

const stlLoader = new STLLoader();

export function createMaterialFromPreset(presetName) {
    const preset = MATERIAL_PRESETS[presetName] || MATERIAL_PRESETS.matte;

    return new THREE.MeshStandardMaterial({
        color: preset.color,
        roughness: preset.roughness,
        metalness: preset.metalness,
        wireframe: preset.wireframe
    });
}

export function applyMaterialPreset(presetName) {
    if (!state.mesh) return;

    const newMaterial = createMaterialFromPreset(presetName);

    if (state.material) {
        state.material.dispose();
    }

    state.material = newMaterial;
    state.mesh.material = newMaterial;
}

export function resetModelTransform(mesh) {
    const defaults = getViewerDefaults(state.currentModelSet);
    const rotation = defaults.rotation || { x: -90, y: 0, z: 0 };
    const scale = defaults.scale ?? DEFAULT_SCALE;

    mesh.position.set(0, 0, 0);
    mesh.rotation.set(
        THREE.MathUtils.degToRad(rotation.x ?? -90),
        THREE.MathUtils.degToRad(rotation.y ?? 0),
        THREE.MathUtils.degToRad(rotation.z ?? 0)
    );
    mesh.scale.set(scale, scale, scale);

    if (state.transformControls) {
        state.transformControls.attach(mesh);

        if (!state.activeTransformMode) {
            state.transformControls.detach();
            state.transformControls.enabled = false;
            state.transformControls.visible = false;
        }
    }
}

export function removeCurrentMesh() {
    if (!state.mesh) return;

    if (state.transformControls) {
        state.transformControls.detach();
        state.transformControls.enabled = false;
        state.transformControls.visible = false;
    }

    state.scene.remove(state.mesh);
    state.mesh.geometry.dispose();

    if (state.material) {
        state.material.dispose();
    }

    state.mesh = null;
    state.material = null;
}

export function setViewPreset(preset, updateState = true) {
    if (!state.mesh) return;

    const boundingBox = new THREE.Box3().setFromObject(state.mesh);
    const size = boundingBox.getSize(new THREE.Vector3());
    const center = boundingBox.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = THREE.MathUtils.degToRad(state.camera.fov);
    const distance = Math.max(maxDim / (2 * Math.tan(fov / 2)), 2);

    switch (preset) {
        case 'front':
            state.camera.position.set(center.x, center.y, center.z + distance * 1.8);
            break;
        case 'top':
            state.camera.position.set(center.x, center.y + distance * 1.8, center.z);
            break;
        case 'left':
            state.camera.position.set(center.x - distance * 1.8, center.y, center.z);
            break;
        case 'iso':
        default:
            state.camera.position.set(
                center.x,
                center.y + distance * 0.55,
                center.z + distance * 1.55
            );
            preset = 'iso';
            break;
    }

    state.camera.lookAt(center);
    state.controls.target.copy(center);
    state.controls.update();

    if (updateState) {
        state.currentViewPreset = preset;
    }

    markActiveViewPreset(preset);
}

export function applyModelDefaults(modelSet) {
    const defaults = getViewerDefaults(modelSet);

    state.currentViewPreset = defaults.preferredView || 'iso';
    state.currentMaterialPreset = defaults.materialPreset || 'matte';

    markActiveViewPreset(state.currentViewPreset);
    markActiveMaterialPreset(state.currentMaterialPreset);
}

export function loadModel(modelUrl, showLoading) {
    state.currentModelUrl = modelUrl;
    hideError();
    showLoading('Loading 3D model...');
    setInfoStatus('Loading current model...');

    removeCurrentMesh();

    stlLoader.load(
        modelUrl,
        (geometry) => {
            geometry.computeVertexNormals();

            state.mesh = new THREE.Mesh(
                geometry,
                createMaterialFromPreset(state.currentMaterialPreset)
            );

            state.material = state.mesh.material;
            resetModelTransform(state.mesh);
            state.mesh.castShadow = true;
            state.mesh.receiveShadow = true;

            state.scene.add(state.mesh);
            setViewPreset(state.currentViewPreset, false);
            markActiveMaterialPreset(state.currentMaterialPreset);
            updateInfoPanel();

            if (state.activeTransformMode) {
                state.transformControls.attach(state.mesh);
                state.transformControls.setMode(state.activeTransformMode);
                state.transformControls.enabled = true;
                state.transformControls.visible = true;
            } else {
                state.transformControls.detach();
                state.transformControls.enabled = false;
                state.transformControls.visible = false;
            }

            hideLoading();
            setInfoStatus('Model loaded.');
        },
        undefined,
        (error) => {
            console.error('Failed to load STL model:', modelUrl, error);
            hideLoading();
            throwViewerError(`The model file could not be loaded: ${modelUrl}`);
        }
    );
}

function throwViewerError(message) {
    const event = new CustomEvent('viewer-load-error', { detail: { message } });
    window.dispatchEvent(event);
}