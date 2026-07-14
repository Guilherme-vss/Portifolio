import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// Em desenvolvimento, o Vite roda em :5173 e repassa /api para a API .NET em :5080.
export default defineConfig({
  base: "./", // caminhos relativos: o build funciona em qualquer subpasta (ex.: demos no GitHub Pages)
  plugins: [svelte()],
  server: {
    proxy: { "/api": "http://localhost:5080" },
  },
  test: {
    environment: "node",
  },
});
