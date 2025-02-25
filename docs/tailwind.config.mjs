import starlightPlugin from '@astrojs/starlight-tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#edeeff',
          100: '#dee1ff',
          200: '#c3c7ff',
          300: '#9fa2ff',
          400: '#8079ff',
          500: '#6650fa',
          600: '#613cef',
          700: '#542ed4',
          800: '#4428ab',
          900: '#3a2986',
          950: '#23184e',
        },
        gray: {
          50: '#f6f7f9',
          100: '#edeef1',
          200: '#d6dae1',
          300: '#b3bbc6',
          400: '#8996a7',
          500: '#6a788d',
          600: '#556074',
          700: '#464f5e',
          800: '#3c4350',
          900: '#31363f',
          950: '#23272e',
        },
      },
      fontFamily: {
        heading: ['"Montserrat"'],
        sans: ['"Source Sans 3"'],
      },
    },
  },
  plugins: [starlightPlugin()],
};
