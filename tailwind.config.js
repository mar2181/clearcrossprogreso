/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1A5CB0',
          green: '#3A8B2F',
          navy: '#1A3A6B',
          'blue-light': '#D6E8F7',
          'green-light': '#E6F4E1',
        },
        neutral: {
          dark: '#2C2C2A',
          mid: '#5F5E5A',
          light: '#F5F5F0',
        },
        amber: '#BA7517',
        error: '#E24B4A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
