/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTA: Ajustamos las rutas para que coincidan con tu estructura
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}