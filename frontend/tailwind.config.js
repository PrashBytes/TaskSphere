/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d8eeff',
          500: '#0f6cbd',
          600: '#0b5a9e',
          700: '#084476'
        }
      },
      boxShadow: {
        panel: '0 16px 40px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
