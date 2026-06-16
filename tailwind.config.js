/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ink': '#1a1a2e',
        'cinnabar': '#c23a30',
        'paper': '#f5f0e8',
        'lapis': '#2e5090',
        'element-wood': '#4a7c59',
        'element-fire': '#c23a30',
        'element-earth': '#8b6914',
        'element-metal': '#b8b8b8',
        'element-water': '#1e3a5f',
      },
      fontFamily: {
        'serif-zh': ['Noto Serif SC', 'serif'],
        'sans-zh': ['Noto Sans SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
