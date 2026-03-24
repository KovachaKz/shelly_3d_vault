import { MODEL_DEFAULTS } from '/models.js';

export const DEFAULT_SCALE = 0.05;

export const MATERIAL_PRESETS = {
    matte: {
        color: 0xb8b8b8,
        roughness: 0.95,
        metalness: 0.02,
        wireframe: false
    },
    plastic: {
        color: 0xc9c9c9,
        roughness: 0.62,
        metalness: 0.08,
        wireframe: false
    },
    metal: {
        color: 0xbfc5cc,
        roughness: 0.28,
        metalness: 0.82,
        wireframe: false
    },
    wireframe: {
        color: 0xd5d5d5,
        roughness: 0.8,
        metalness: 0.05,
        wireframe: true
    }
};

export function getViewerDefaults(modelSet) {
    return MODEL_DEFAULTS?.[modelSet] || {
        scale: DEFAULT_SCALE,
        rotation: { x: -90, y: 0, z: 0 },
        preferredView: 'iso',
        materialPreset: 'matte'
    };
}

export function capitalize(value) {
    if (!value || typeof value !== 'string') return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getFileName(path) {
    if (!path) return '-';
    return path.split('/').pop() || path;
}