import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

// Plugin: strip UTF-16 LE BOM from any file Vite loads
function stripBomPlugin() {
  return {
    name: "strip-bom",
    enforce: "pre",
    transform(code) {
      if (code.charCodeAt(0) === 0xFEFF) {
        return { code: code.slice(1), map: null };
      }
    },
  };
}

export default defineConfig({
  plugins: [stripBomPlugin(), react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore", "firebase/storage"],
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});