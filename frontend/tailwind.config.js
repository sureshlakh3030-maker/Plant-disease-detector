/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff7f1',
          100: '#deeee2',
          200: '#c2dfc9',
          300: '#9bc9a7',
          400: '#6eaa7f',
          500: '#3e8055',
          600: '#2d6843',
          700: '#245337',
          800: '#1f432f',
          900: '#183725',
          950: '#0d2116',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
