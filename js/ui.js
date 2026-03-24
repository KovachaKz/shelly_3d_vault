import { state } from './state.js';
import { capitalize, getFileName } from './config.js';

export function setupErrorActions(retryHandler) {
    document.getElementById('viewer-error-retry').addEventListener('click', () => {
        hideError();

        if (state.currentModelUrl) {
            retryHandler(state.currentModelUrl);
        }
    });

    window.addEventListener('viewer-load-error', (event) => {
        showError(event.detail?.message || 'The selected 3D file could not be loaded.');
    });
}

export function setupVariantSelector(variantsMap, onChange) {
    const select = document.getElementById('variant-select');
    const variants = Object.keys(variantsMap[state.currentModelSet]);

    select.innerHTML = '';

    variants.forEach((variantName) => {
        const option = document.createElement('option');
        option.value = variantName;
        option.textContent = variantName;
        select.appendChild(option);
    });

    if (!variants.includes(state.currentVariant)) {
        state.currentVariant = variants[0];
    }

    select.value = state.currentVariant;

    select.addEventListener('change', (event) => {
        onChange(event.target.value);
    });
}

export function setupInfoPanelActions(downloadHandler, copyHandler) {
    document.getElementById('btn-download-current').addEventListener('click', downloadHandler);
    document.getElementById('btn-copy-link').addEventListener('click', copyHandler);
}

export function showLoading(message = 'Preparing 3D preview...') {
    state.isLoading = true;
    document.getElementById('viewer-loading-text').textContent = message;
    document.getElementById('viewer-loading').classList.remove('is-hidden');
}

export function hideLoading() {
    state.isLoading = false;
    document.getElementById('viewer-loading').classList.add('is-hidden');
}

export function showError(message = 'The selected 3D file could not be loaded.') {
    hideLoading();
    document.getElementById('viewer-error-text').textContent = message;
    document.getElementById('viewer-error').classList.remove('is-hidden');
    setInfoStatus('Load failed.');
}

export function hideError() {
    document.getElementById('viewer-error').classList.add('is-hidden');
}

export function clearActiveButtons() {
    document.querySelectorAll('.viewer-side-panel:not(.viewer-view-panel):not(.viewer-material-panel) .panel-btn').forEach((btn) => {
        btn.classList.remove('panel-btn--active');
    });
}

export function clearViewPresetButtons() {
    document.querySelectorAll('.viewer-view-panel .panel-btn').forEach((btn) => {
        btn.classList.remove('panel-btn--active');
    });
}

export function clearMaterialPresetButtons() {
    document.querySelectorAll('.viewer-material-panel .panel-btn').forEach((btn) => {
        btn.classList.remove('panel-btn--active');
    });
}

export function markActiveViewPreset(preset) {
    clearViewPresetButtons();

    const map = {
        front: 'btn-view-front',
        top: 'btn-view-top',
        left: 'btn-view-left',
        iso: 'btn-view-iso'
    };

    const button = document.getElementById(map[preset]);
    if (button) button.classList.add('panel-btn--active');
}

export function markActiveMaterialPreset(preset) {
    clearMaterialPresetButtons();

    const map = {
        matte: 'btn-material-matte',
        plastic: 'btn-material-plastic',
        metal: 'btn-material-metal',
        wireframe: 'btn-material-wireframe'
    };

    const button = document.getElementById(map[preset]);
    if (button) button.classList.add('panel-btn--active');
}

export function updateInfoPanel() {
    document.getElementById('info-model-set').textContent = state.currentModelSet || '-';
    document.getElementById('info-variant').textContent = state.currentVariant || '-';
    document.getElementById('info-material').textContent = capitalize(state.currentMaterialPreset || '-');
    document.getElementById('info-file').textContent = getFileName(state.currentModelUrl || '');
}

export function setInfoStatus(message) {
    document.getElementById('viewer-info-status').textContent = message;
}