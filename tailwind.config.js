/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        blush: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
        },
      },
      backgroundImage: {
        'julia-gradient': 'linear-gradient(135deg, #f9a8d4 0%, #c084fc 50%, #818cf8 100%)',
      },
      boxShadow: {
        rose: '0 4px 24px 0 rgba(244,114,182,0.12)',
        'rose-md': '0 8px 32px 0 rgba(244,114,182,0.18)',
      },
    },
  },
  plugins: [],
}
