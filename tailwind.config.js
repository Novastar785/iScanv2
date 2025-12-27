/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTA: Ajustamos las rutas para que coincidan con tu estructura
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "primary": "#d97706",
        "primary-light": "#f59e0b",
        "background-light": "#fdfaf6",
        "background-dark": "#3e2723",
        "surface-dark": "#5d4037",
        "surface-glass": "rgba(93, 64, 55, 0.4)",
        "text-light": "#fdfaf6",
        "text-dark": "#3e2723",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"]
      },
      backgroundImage: {
        'shimmer': 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: { // NativeWind might not support all complex shadows directly, but we add them for reference or web support
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2), inset 1px 0 0 0 rgba(255, 255, 255, 0.1)',
        'cut-glass': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.3), 0 10px 20px -5px rgba(0,0,0,0.4)',
      }
    },
  },
  plugins: [],
}