/** @type {import('tailwindcss').Config} */

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#f0f5fa',
          100: '#dbe5ef',
          200: '#b9cce0',
          300: '#8ea9ca',
          400: '#5e83b0',
          500: '#3d6497',
          600: '#2d4f7c',
          700: '#1e3a5f',
          800: '#182f4d',
          900: '#12233b',
        },
        accent: {
          50: '#fbf6e8',
          100: '#f5e9c4',
          200: '#edd794',
          300: '#e4c364',
          400: '#d4a84b',
          500: '#c29038',
          600: '#a67430',
          700: '#855a2c',
          800: '#6c4a2a',
          900: '#5a3f28',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 12px -4px rgba(0, 0, 0, 0.08), 0 1px 3px -1px rgba(0, 0, 0, 0.05)',
        nav: '0 -2px 10px -2px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
