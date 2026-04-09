/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        office: {
          carpet: '#8B7355',
          wall: '#D4C5A9',
          wood: '#6B4F3A',
          paper: '#F5F0E8',
          ink: '#2C2416',
          muted: '#7A6E5F',
        }
      },
      fontFamily: {
        typewriter: ['Courier Prime', 'Courier New', 'monospace'],
        display: ['Special Elite', 'cursive'],
      }
    },
  },
  plugins: [],
}
