import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // "@": ".",
      // "@components": "src/components",
      // "@hooks": "src/hooks",
      // "@lib": "src/lib",
      // "@types": "src/types",
    },
  },
});
