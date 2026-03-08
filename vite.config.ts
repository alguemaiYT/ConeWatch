import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      overlay: false,
    },
    warmup: {
      clientFiles: ["./src/main.tsx", "./src/App.tsx"],
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
  plugins: [react(), splitVendorChunkPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (
            id.includes("/react/") ||
            id.includes("react-dom") ||
            id.includes("react-router-dom")
          ) {
            return "vendor-react";
          }

          if (
            id.includes("@radix-ui") ||
            id.includes("lucide-react") ||
            id.includes("framer-motion")
          ) {
            return "vendor-ui";
          }

          if (id.includes("@tanstack/react-query")) {
            return "vendor-query";
          }

          return "vendor-misc";
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "@tanstack/react-query"],
  },
}));
