/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
        notosansjp: ['Noto Sans JP', 'sans-serif'],
        bungee: ['Bungee', 'cursive'],
        potta: ['Potta One', 'cursive'],
        dela: ['Dela Gothic One', 'cursive'],
        rocknroll: ['RocknRoll One', 'sans-serif'],
        dotgothic: ['DotGothic16', 'sans-serif'],
        hachinaru: ['Hachi Maru Pop', 'cursive'],
        kaisei: ['Kaisei Tokumin', 'serif'],
        kiwi: ['Kiwi Maru', 'serif'],
        reggae: ['Reggae One', 'cursive'],
        stick: ['Stick', 'sans-serif'],
        train: ['Train One', 'cursive'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
}
