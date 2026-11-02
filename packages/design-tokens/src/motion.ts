export const motionTokens = {
  durations: {
    hover: 140, // 100-160ms
    selection: 200, // 180-250ms
    inspector: 240, // 180-280ms
    transition: 650, // 500-900ms
    camera: 800 // 600-1000ms
  },
  easings: {
    standard: [0.16, 1, 0.3, 1], // cinematic smooth ease-out
    gentle: [0.33, 1, 0.68, 1],
    spring: { stiffness: 350, damping: 30 }
  }
} as const;
