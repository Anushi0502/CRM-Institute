/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#fcf8ef',
        ink: '#18353d',
        teal: '#1f766e',
        mint: '#b7ddd7',
        coral: '#f27b64',
        amber: '#f0b45b',
        plum: '#72507d',
        cloud: '#f6f1e7',
      },
      boxShadow: {
        float: '0 24px 70px rgba(24, 53, 61, 0.14)',
        soft: '0 12px 35px rgba(24, 53, 61, 0.08)',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
    },
  },
  plugins: [],
}
