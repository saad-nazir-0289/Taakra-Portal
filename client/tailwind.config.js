/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'rgba(15, 23, 42, 0.85)',
          light: 'rgba(30, 58, 138, 0.4)',
          border: 'rgba(30, 58, 138, 0.8)',
        },
      },
      backgroundImage: {
        'app-gradient': 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 50%, #1e293b 100%)',
        'hero-overlay': 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 58, 138, 0.5) 100%)',
      },
    },
  },
  plugins: [],
};
