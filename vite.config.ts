import { URL, fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const DEV_SERVER_PORT = 3001;
const DEFAULT_API_TARGET = "http://localhost:3000";

export default defineConfig(({ mode }) => {
  const apiTarget = loadEnv(mode, process.cwd(), "").VITE_API_PROXY_TARGET || DEFAULT_API_TARGET;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: DEV_SERVER_PORT,
      strictPort: true,
      open: false,
      proxy: {
        "/admin": { target: apiTarget, changeOrigin: true },
        "/auth": { target: apiTarget, changeOrigin: true },
      },
      watch: {
        ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/coverage/**"],
      },
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
          },
        },
      },
    },
  };
});
