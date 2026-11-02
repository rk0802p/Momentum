// -------------------------------------------------------------
// MOMENTUM Spatial 3D Mapping Engine
// Section 4.3 of Technical Specification
// -------------------------------------------------------------

export interface SpatialMappingConfig {
  daySpacing: number;     // S_d
  verticalScale: number;  // S_t
  depthLayerSpacing?: number;
}

export const DEFAULT_SPATIAL_CONFIG: SpatialMappingConfig = {
  daySpacing: 12.0,
  verticalScale: 24.0,
  depthLayerSpacing: 1.5
};

/**
 * Calculates 3D coordinates for a temporal moment in FLOW.
 * x: progression across days
 * y: time of day (0 at bottom, S_t at top or vice versa)
 * z: visual layer / priority depth
 */
export function timeToSpatialPosition(
  dayOffset: number,
  fractionalHour: number,
  layer = 0,
  config: SpatialMappingConfig = DEFAULT_SPATIAL_CONFIG
): [x: number, y: number, z: number] {
  const x = dayOffset * config.daySpacing;
  // Center day vertically around 0
  const y = (fractionalHour / 24 - 0.5) * config.verticalScale;
  const z = layer * (config.depthLayerSpacing ?? 1.5);
  return [x, y, z];
}

/**
 * Calculates 3D bounding geometry attributes for an event in FLOW.
 */
export function eventToSpatialBox(
  dayOffset: number,
  startHour: number,
  endHour: number,
  config: SpatialMappingConfig = DEFAULT_SPATIAL_CONFIG
): {
  position: [number, number, number];
  dimensions: [number, number, number];
} {
  const durationHours = Math.max(0.1, endHour - startHour);
  const midHour = startHour + durationHours / 2;
  const [x, y, z] = timeToSpatialPosition(dayOffset, midHour, 0, config);
  const height = (durationHours / 24) * config.verticalScale;
  const width = config.daySpacing * 0.75;
  const depth = 0.4;

  return {
    position: [x, y, z],
    dimensions: [width, height, depth]
  };
}
