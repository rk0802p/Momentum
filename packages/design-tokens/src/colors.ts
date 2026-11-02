export const colors = {
  background: '#0B0C0F',
  surface: '#121419',
  surfaceRaised: '#1A1D23',
  border: '#292D35',
  textPrimary: '#F1F0EB',
  textSecondary: '#92969F',
  accent: '#D6A66D',
  completed: '#729D89',
  future: '#829AB9',
  warning: '#D88B75',
  neutral: '#777E8B',
  
  // Canonical category palette
  categories: {
    work: '#829AB9',
    learning: '#D6A66D',
    exercise: '#729D89',
    personal: '#A388EE',
    social: '#E09273',
    rest: '#5C6479',
    creative: '#E5C07B',
    deepWork: '#D6A66D'
  }
} as const;

export type ColorToken = keyof typeof colors;
