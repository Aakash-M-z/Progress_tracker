/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'pulse-custom': 'pulse 2s infinite',
        'glow': 'glow 2s infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      colors: {
        primary: {
          50: '#F9F7F0',
          100: '#EBE0C4',
          200: '#D6BD80', // Soft Gold
          300: '#C7A350', // Muted Gold
          400: '#B88A21', // Classic Gold
          500: '#A37517', // Deep Gold - PRIMARY
          600: '#8A6012',
          700: '#69480D',
          800: '#473108',
          900: '#241804',
        },
        gold: {
          50: '#FCFBF7',
          100: '#F5EED9',
          200: '#EBD6A7',
          300: '#DDBA73',
          400: '#CF9E42',
          500: '#C28416', // Vibrant Gold
          600: '#A36B0E',
          700: '#7D5109',
          800: '#523405',
          900: '#291A02',
        },
        'rich-black': {
          DEFAULT: '#050505',
          50: '#1a1a1a',
          100: '#141414',
          200: '#0f0f0f',
          300: '#0a0a0a',
          400: '#080808',
          500: '#050505', // True Black
          600: '#030303',
          700: '#020202',
          800: '#010101',
          900: '#000000',
        }
      }
    },
  },
  plugins: [],
}