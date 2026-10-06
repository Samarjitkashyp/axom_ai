/** @type {import('tailwindcss').Config} */
// AXOMAI-REBRAND: colours and font of the Axomai Browser site.
const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: colors.emerald,
        purple: colors.emerald,
        violet: colors.emerald,
        fuchsia: colors.amber,
        pink: colors.amber,
        indigo: colors.teal,
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Plus Jakarta Sans"', 'ui-serif', 'Georgia', 'serif'],
        assamese: ['"Noto Sans Bengali"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
