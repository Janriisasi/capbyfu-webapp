/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#0A1614',
        'primary-gray': '#C5C5C5',
        'primary-light': '#F1F1F1',
        'primary-black': '#010101',
      },
      fontFamily: {
        'sans': ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}