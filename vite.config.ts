import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: "dist/renderer",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@tiptap") || id.includes("prosemirror")) return "editor";
          if (id.includes("react")) return "react";
          if (id.includes("lucide-react")) return "icons";
          // Mermaid 是动态导入；交由 Rollup 保留动态 chunk，避免被 vendor 合并进首屏。
          return undefined;
        }
      }
    }
  }
});
