/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}", // Ensures Tailwind scans your React files
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Plus Jakarta Sans', 'sans-serif'],
        },
        cursor: {
          'pointer': 'pointer',
        },
      },
    },
    plugins: [
      function({ addBase }) {
        addBase({
          'button, a, [role="button"], input[type="submit"], input[type="button"], select': {
            cursor: 'pointer',
          },
        })
      },
    ],
  };
  