import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Em desenvolvimento, o Vite roda em :5173 e repassa /api para o FastAPI em :8000.
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: { "/api": "http://localhost:8000" },
  },
  test: {
    environment: "node",
  },
});
