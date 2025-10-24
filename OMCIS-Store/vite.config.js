import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ADICIONE ESTA LINHA:
  base: "/OMCIS-Store/",
  // Troque 'NOME-DO-SEU-REPOSITORIO' pelo nome exato do seu repo no GitHub
});
