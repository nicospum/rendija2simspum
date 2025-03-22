/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#00B8D4',
        'secondary': '#6A1B9A',
        'bg-dark': '#050A1C',
        'panel-dark': '#1A1A2E',
        'text-light': '#F0F0F0'
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
} 