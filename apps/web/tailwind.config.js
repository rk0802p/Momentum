/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0C0F',
        surface: {
          DEFAULT: '#121419',
          raised: '#1A1D23',
          hover: '#22262E'
        },
        border: {
          DEFAULT: '#292D35',
          subtle: '#1E2128'
        },
        text: {
          primary: '#F1F0EB',
          secondary: '#92969F',
          muted: '#5F636E'
        },
        accent: {
          DEFAULT: '#D6A66D',
          glow: 'rgba(214, 166, 109, 0.25)',
          muted: 'rgba(214, 166, 109, 0.15)'
        },
        completed: {
          DEFAULT: '#729D89',
          glow: 'rgba(114, 157, 137, 0.25)'
        },
        future: {
          DEFAULT: '#829AB9',
          glow: 'rgba(130, 154, 185, 0.25)'
        },
        warning: {
          DEFAULT: '#D88B75',
          glow: 'rgba(216, 139, 117, 0.25)'
        },
        neutral: {
          DEFAULT: '#777E8B',
          glow: 'rgba(119, 126, 139, 0.2)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Geist Mono', 'IBM Plex Mono', 'JetBrains Mono', 'Menlo', 'monospace']
      },
      boxShadow: {
        glow: '0 0 20px -5px rgba(214, 166, 109, 0.3)',
        'glow-accent': '0 0 30px -4px rgba(214, 166, 109, 0.4)',
        'glow-warning': '0 0 25px -4px rgba(216, 139, 117, 0.35)',
        'glow-completed': '0 0 25px -4px rgba(114, 157, 137, 0.35)',
      }
    },
  },
  plugins: [],
};
