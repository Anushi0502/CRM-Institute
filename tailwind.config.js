/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--crm-color-canvas) / <alpha-value>)',
        white: 'rgb(var(--crm-color-white) / <alpha-value>)',
        ink: 'rgb(var(--crm-color-ink) / <alpha-value>)',
        teal: 'rgb(var(--crm-color-teal) / <alpha-value>)',
        mint: 'rgb(var(--crm-color-mint) / <alpha-value>)',
        coral: 'rgb(var(--crm-color-coral) / <alpha-value>)',
        amber: {
          DEFAULT: 'rgb(var(--crm-color-amber) / <alpha-value>)',
          700: 'rgb(var(--crm-color-amber-700) / <alpha-value>)',
        },
        plum: 'rgb(var(--crm-color-plum) / <alpha-value>)',
        cloud: 'rgb(var(--crm-color-cloud) / <alpha-value>)',
        sky: {
          DEFAULT: 'rgb(var(--crm-color-sky) / <alpha-value>)',
          700: 'rgb(var(--crm-color-sky-700) / <alpha-value>)',
        },
        sun: 'rgb(var(--crm-color-sun) / <alpha-value>)',
        berry: 'rgb(var(--crm-color-berry) / <alpha-value>)',
        leaf: 'rgb(var(--crm-color-leaf) / <alpha-value>)',
        lilac: 'rgb(var(--crm-color-lilac) / <alpha-value>)',
      },
      boxShadow: {
        float: '0 24px 70px rgba(var(--crm-shadow-color), 0.22)',
        soft: '0 12px 35px rgba(var(--crm-shadow-color), 0.14)',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        kids: ['Baloo 2', 'cursive'],
      },
    },
  },
  plugins: [],
}
