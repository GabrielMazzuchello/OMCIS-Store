import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // 1. ADICIONE ESTA LINHA
  base: "/OMCIS-Store/",
});
