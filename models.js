export const MODEL_LIBRARY = [
    {
        title: 'Wall Display Stand',
        description: 'Wall-mount display stand set with multiple back and fastener variants.',
        modelSet: 'Wall Display Stand',
        preview: 'models/wall_display_stand_flat_back.stl',
        variants: {
            'Default': 'models/wall_display_stand_45.stl',
            'Flat Back': 'models/wall_display_stand_flat_back.stl',
            'Fastener': 'models/wall_display_stand_fastener.stl',
            'Fastener High': 'models/wall_display_stand_fastener_high.stl'
        },
        viewerDefaults: {
            scale: 0.05,
            rotation: { x: -90, y: 0, z: 0 },
            preferredView: 'iso',
            materialPreset: 'matte'
        }
    },
    {
        title: 'TRV Replacement Part',
        description: 'Replacement STL model for the Shelly TRV accessory part.',
        modelSet: 'TRV Replacement Part',
        preview: 'models/shelly-trv.stl',
        variants: {
            'Default': 'models/shelly-trv.stl'
        },
        viewerDefaults: {
            scale: 0.05,
            rotation: { x: -90, y: 0, z: 0 },
            preferredView: 'iso',
            materialPreset: 'matte'
        }
    },
    {
        title: 'BLU Door/Window Stand',
        description: 'Stand and alignment variants for Shelly BLU Door/Window sensor mounting.',
        modelSet: 'BLU Door/Window Stand',
        preview: 'models/sensor-up.stl',
        variants: {
            'Sensor Magnet': 'models/sensor-magnet.stl',
            'Sensor Up': 'models/sensor-up.stl',
            'Sensor Down': 'models/sensor-down.stl',
            'Sensor Left': 'models/sensor-left.stl',
            'Sensor Right': 'models/sensor-right.stl'
        },
        viewerDefaults: {
            scale: 0.05,
            rotation: { x: -90, y: 0, z: 0 },
            preferredView: 'iso',
            materialPreset: 'matte'
        }
    }
];

export const MODEL_VARIANTS = Object.fromEntries(
    MODEL_LIBRARY.map((item) => [item.modelSet, item.variants])
);

export const MODEL_DEFAULTS = Object.fromEntries(
    MODEL_LIBRARY.map((item) => [item.modelSet, item.viewerDefaults || {}])
);