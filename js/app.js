import { MODEL_LIBRARY, MODEL_VARIANTS } from '../../models.js';
import { state } from './state.js';
import { setupScene, setupRenderer, setupControls, setupTransformControls, onWindowResize } from './scene.js';
import { applyMaterialPreset, applyModelDefaults, loadModel, resetModelTransform, setViewPreset } from './model.js';
import {
    clearActiveButtons,
    hideError,
    markActiveMaterialPreset,
    setInfoStatus,
    setupErrorActions,
    setupInfoPanelActions,
    setupVariantSelector,
    showLoading,
    updateInfoPanel
} from './ui.js';

const DEFAULT_MODEL_SET = MODEL_LIBRARY[0].modelSet;

init();

function init() {
    const route = getRouteState();

    state.currentModelSet = route.modelSet;
    state.currentVariant = route.variant;
    state.currentModelUrl = route.modelUrl;

    applyModelDefaults(state.currentModelSet);

    setupScene();
    setupRenderer();
    setupControls();
    setupTransformControls();
    setupTransformPanel();
    setupViewPresetPanel();
    setupMaterialPanel();
    setupVariantSelector(MODEL_VARIANTS, handleVariantChange);
    setupErrorActions((url) => loadModel(url, showLoading));
    setupInfoPanelActions(downloadCurrentModel, copyCurrentLink);
    updateInfoPanel();

    loadModel(route.modelUrl, showLoading);

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
}

function getRouteState() {
    const params = new URLSearchParams(window.location.search);
    const requestedModelSet = decodeURIComponent(params.get('modelSet') || DEFAULT_MODEL_SET);

    if (!MODEL_VARIANTS[requestedModelSet]) {
        const fallbackSet = DEFAULT_MODEL_SET;
        const fallbackVariant = Object.keys(MODEL_VARIANTS[fallbackSet])[0];

        return {
            modelSet: fallbackSet,
            variant: fallbackVariant,
            modelUrl: MODEL_VARIANTS[fallbackSet][fallbackVariant]
        };
    }

    const variants = Object.keys(MODEL_VARIANTS[requestedModelSet]);
    const requestedVariant = decodeURIComponent(params.get('variant') || variants[0]);
    const safeVariant = variants.includes(requestedVariant) ? requestedVariant : variants[0];

    const requestedModel = params.get('model');
    const safeModelUrl = requestedModel
        ? decodeURIComponent(requestedModel)
        : MODEL_VARIANTS[requestedModelSet][safeVariant];

    return {
        modelSet: requestedModelSet,
        variant: safeVariant,
        modelUrl: safeModelUrl
    };
}

function handleVariantChange(variantName) {
    state.currentVariant = variantName;
    const modelUrl = MODEL_VARIANTS[state.currentModelSet][state.currentVariant];
    state.currentModelUrl = modelUrl;

    applyModelDefaults(state.currentModelSet);
    updateInfoPanel();
    loadModel(modelUrl, showLoading);
    updateViewerUrl();
}

function setupTransformPanel() {
    document.getElementById('btn-recenter').addEventListener('click', () => {
        clearActiveButtons();
        state.activeTransformMode = null;

        if (state.transformControls) {
            state.transformControls.enabled = false;
            state.transformControls.visible = false;
            state.transformControls.detach();
        }

        if (state.mesh) {
            resetModelTransform(state.mesh);
            applyMaterialPreset(state.currentMaterialPreset);
            setViewPreset(state.currentViewPreset);
        }
    });

    document.getElementById('btn-rotate').addEventListener('click', () => {
        activateTransformMode('rotate', document.getElementById('btn-rotate'));
    });

    document.getElementById('btn-move').addEventListener('click', () => {
        activateTransformMode('translate', document.getElementById('btn-move'));
    });

    document.getElementById('btn-scale').addEventListener('click', () => {
        activateTransformMode('scale', document.getElementById('btn-scale'));
    });
}

function setupViewPresetPanel() {
    document.getElementById('btn-view-front').addEventListener('click', () => setViewPreset('front'));
    document.getElementById('btn-view-top').addEventListener('click', () => setViewPreset('top'));
    document.getElementById('btn-view-left').addEventListener('click', () => setViewPreset('left'));
    document.getElementById('btn-view-iso').addEventListener('click', () => setViewPreset('iso'));
}

function setupMaterialPanel() {
    document.getElementById('btn-material-matte').addEventListener('click', () => setMaterialPreset('matte'));
    document.getElementById('btn-material-plastic').addEventListener('click', () => setMaterialPreset('plastic'));
    document.getElementById('btn-material-metal').addEventListener('click', () => setMaterialPreset('metal'));
    document.getElementById('btn-material-wireframe').addEventListener('click', () => setMaterialPreset('wireframe'));
}

function activateTransformMode(mode, buttonEl) {
    if (!state.mesh || !state.transformControls) return;

    clearActiveButtons();
    buttonEl.classList.add('panel-btn--active');
    state.activeTransformMode = mode;

    state.transformControls.attach(state.mesh);
    state.transformControls.setMode(mode);
    state.transformControls.enabled = true;
    state.transformControls.visible = true;
    state.transformControls.showX = true;
    state.transformControls.showY = true;
    state.transformControls.showZ = true;
}

function setMaterialPreset(presetName) {
    state.currentMaterialPreset = presetName;
    applyMaterialPreset(presetName);
    markActiveMaterialPreset(presetName);
    updateInfoPanel();
    setInfoStatus(`Material set to ${presetName.charAt(0).toUpperCase() + presetName.slice(1)}.`);
}

function updateViewerUrl() {
    const modelUrl = MODEL_VARIANTS[state.currentModelSet][state.currentVariant];
    const params = new URLSearchParams(window.location.search);

    params.set('modelSet', state.currentModelSet);
    params.set('variant', state.currentVariant);
    params.set('model', modelUrl);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
}

async function downloadCurrentModel() {
    if (!state.currentModelUrl) return;

    try {
        setInfoStatus('Downloading current file...');

        const response = await fetch(state.currentModelUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${state.currentModelUrl}`);
        }

        const blob = await response.blob();
        const fileName = state.currentModelUrl.split('/').pop() || 'model.stl';
        const objectUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(objectUrl);
        setInfoStatus('Download started.');
    } catch (error) {
        console.error(error);
        setInfoStatus('Download failed.');
    }
}

async function copyCurrentLink() {
    try {
        await navigator.clipboard.writeText(window.location.href);
        setInfoStatus('Link copied.');
    } catch (error) {
        console.error(error);
        setInfoStatus('Unable to copy link.');
    }
}

function onKeyDown(event) {
    if (!state.mesh) return;

    switch (event.key.toLowerCase()) {
        case 'g':
            if (state.transformControls) {
                activateTransformMode('translate', document.getElementById('btn-move'));
            }
            break;
        case 'r':
            if (state.transformControls) {
                activateTransformMode('rotate', document.getElementById('btn-rotate'));
            }
            break;
        case 's':
            if (state.transformControls) {
                activateTransformMode('scale', document.getElementById('btn-scale'));
            }
            break;
        case '1':
            setViewPreset('front');
            break;
        case '2':
            setViewPreset('left');
            break;
        case '3':
            setViewPreset('top');
            break;
        case '4':
            setViewPreset('iso');
            break;
        case 'm':
            setMaterialPreset('matte');
            break;
        case 'p':
            setMaterialPreset('plastic');
            break;
        case 'w':
            setMaterialPreset('wireframe');
            break;
        case 'escape':
            clearActiveButtons();
            state.activeTransformMode = null;

            if (state.transformControls) {
                state.transformControls.detach();
                state.transformControls.enabled = false;
                state.transformControls.visible = false;
            }
            break;
    }
}