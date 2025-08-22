import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/feedback": "http://localhost:50505",
      "/history": "http://localhost:50505",
      "/health": "http://localhost:50505",
    },
  },
});
