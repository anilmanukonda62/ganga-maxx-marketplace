/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#edfcf4',
          100: '#d3f7e2',
          200: '#abedd0',
          300: '#73deb4',
          400: '#3bc492',
          500: '#1a7a4c', // Primary Ganga Maxx Green
          600: '#137a50',
          700: '#106242',
          800: '#114e37',
          900: '#0f412f',
          950: '#07251c',
        },
        darkbg: {
          900: '#0f172a', // deep navy bg
          800: '#1e293b', // card bg
          700: '#334155', // borders
          600: '#475569',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
