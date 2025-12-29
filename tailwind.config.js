/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTA: Ajustamos las rutas para que coincidan con tu estructura
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      "primary": "#f59e0b", // Amber 500
      "primary-light": "#fbbf24", // Amber 400
      "primary-dark": "#b45309", // Amber 700
      "background-light": "#fafaf9", // Stone 50
      "background-dark": "#0c0a09", // Stone 950 (Deep Coffee/Black)
      "surface-dark": "#1c1917", // Stone 900
      "surface-glass": "rgba(28, 25, 23, 0.7)", // Dark glass
      "text-light": "#e7e5e4", // Stone 200
      "text-dark": "#0c0a09", // Stone 950
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"]
      },
      backgroundImage: {
        'shimmer': 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 100%)',
        'milky-glass': 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(100, 116, 139, 0.1)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8), inset 1px 0 0 0 rgba(255, 255, 255, 0.5)',
        'cut-glass': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.05), 0 10px 20px -5px rgba(56, 189, 248, 0.15)',
        'milky-glow': 'inset 0 0 20px rgba(255,255,255,0.8), 0 8px 32px 0 rgba(56, 189, 248, 0.1)',
      }
    },
  },
  plugins: [],
}