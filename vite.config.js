import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import faroUploader from "@grafana/faro-rollup-plugin";

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-icons',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
          ],
          'vendor-recharts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-dates': ['date-fns', 'react-day-picker'],
          'vendor-faro': ['@grafana/faro-react', '@grafana/faro-web-sdk', '@grafana/faro-web-tracing'],
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority', 'lucide-react'],
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    faroUploader({
      appName: 'omniscience-ui',
      endpoint: 'https://faro-api-prod-eu-west-2.grafana.net/faro/api/v1',
      appId: '5146',
      stackId: '904432',
      verbose: true,
      apiKey: process.env.FARO_API_KEY,
      gzipContents: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    css: false,
  },
});
