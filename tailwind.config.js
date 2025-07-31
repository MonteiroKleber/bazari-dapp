/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B0000',        // Vermelho terroso
        accent: '#FFB300',         // Dourado queimado
        dark: '#1C1C1C',           // Preto fosco
        neutral: '#F5F1E0',        // Areia clara
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

