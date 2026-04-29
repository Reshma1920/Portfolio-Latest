/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'collab-line-draw': {
          to: { strokeDashoffset: '0' },
        },
        'collab-node-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'collab-line-draw':
          'collab-line-draw 1.15s cubic-bezier(0.33, 1, 0.68, 1) forwards',
        'collab-node-in':
          'collab-node-in 0.7s cubic-bezier(0.33, 1, 0.68, 1) forwards',
      },
      colors: {
        background: '#FFFFFF',
        foreground: '#000000',
        muted: '#6F6F6F',
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        dmSans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
