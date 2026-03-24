export const MODEL_SETS = {
  'Wall Display Stand': {
    preview: 'models/wall_display_stand_flat_back.stl',
    variants: {
      Default: 'models/wall_display_stand_45.stl',
      'Flat Back': 'models/wall_display_stand_flat_back.stl',
      Fastener: 'models/wall_display_stand_fastener.stl',
      'Fastener High': 'models/wall_display_stand_fastener_high.stl'
    }
  },
  'TRV Replacement Part': {
    preview: 'models/shelly-trv.stl',
    variants: {
      Default: 'models/shelly-trv.stl'
    }
  },
  'BLU Door/Window Stand': {
    preview: 'models/sensor-up.stl',
    variants: {
      'Sensor Magnet': 'models/sensor-magnet.stl',
      'Sensor Up': 'models/sensor-up.stl',
      'Sensor Down': 'models/sensor-down.stl',
      'Sensor Left': 'models/sensor-left.stl',
      'Sensor Right': 'models/sensor-right.stl'
    }
  },
  Magnet: {
    preview: 'models/magnet.stl',
    variants: {
      Default: 'models/magnet.stl'
    }
  }
};

export const MODEL_SET_ORDER = Object.keys(MODEL_SETS);
