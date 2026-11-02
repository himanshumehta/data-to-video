import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Port resolution:
//   VITE_PORT env var wins — a launcher can set this after picking a
//   free port so multiple galleries can run in parallel.
//   Falls back to 5173 when VITE_PORT is unset (e.g. plain `npm run gallery`).
const port = Number(process.env.VITE_PORT) || 5173;

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  publicDir: path.resolve(__dirname, "../../public"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".."),
    },
  },
  server: {
    port,
    // strictPort: when Python has already picked a free port, we want Vite to
    // fail loudly if that port has since been taken rather than silently drift
    // to another port (which would break the browser URL we printed).
    strictPort: true,
  },
});
