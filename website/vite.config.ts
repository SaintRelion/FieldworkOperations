import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    const env = loadEnv(mode, process.cwd(), "VITE_FIREBASE_");
    const required = ["VITE_FIREBASE_API_KEY", "VITE_FIREBASE_AUTH_DOMAIN", "VITE_FIREBASE_PROJECT_ID", "VITE_FIREBASE_APP_ID"];
    const missing = required.filter((key) => !env[key]);
    if (missing.length) throw new Error(`Missing Firebase build configuration: ${missing.join(", ")}`);
  }

  return {
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["fieldwork-icon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Fieldwork Operations",
        short_name: "Fieldwork Ops",
        description: "Internship attendance, fieldwork records, and accomplishments.",
        theme_color: "#09111f",
        background_color: "#f4f1ea",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/fieldwork-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/fieldwork-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/fieldwork-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "osm-tiles",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0", // bind to all network interfaces
    port: 5173,
    strictPort: true, // fail if port is in use
    allowedHosts: true, // allow requests from any hostname (for tunnels / LAN / ngrok)
    // hmr: {
    //   host: "silent-views-cross.loca.lt", // or tunnel domain for external access
    //   protocol: "wss", // websocket protocol
    // },
  },
  };
});
