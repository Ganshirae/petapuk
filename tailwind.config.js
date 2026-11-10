/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          dark: '#134118',
          forest: '#134118',
          emerald: '#288132',
          hover: '#0E3212',
          light: '#E4EEE8',
          border: '#B9E9B0',
          bright: '#90FF4B',
          soft: '#BEFB98',
          pale: '#E4EEE8',
          pink: '#FF66A3',
          gray: '#E5E5E5',
          ink: '#090909'
        },
        slate: {
          50: '#F7FAF7',
          100: '#EFF4EF',
          200: '#E5E5E5',
          300: '#CFD8D0',
          400: '#9CAA9E',
          500: '#6C7A6E',
          600: '#4F5C51',
          700: '#3A463C',
          800: '#26302A',
          900: '#141C17',
          950: '#0A0F0B'
        },
        amber: {
          warning: '#9A6508',
          light: '#FFF8E6',
          border: '#F5DFA5'
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        accent: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['Poppins', 'ui-monospace', 'Menlo', 'monospace']
      },
      borderRadius: {
        'gov': '14px',
        'subtle': '10px',
        'card': '20px'
      }
    },
  },
  plugins: [],
}
