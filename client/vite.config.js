import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Konfigurasi Utama Vite untuk Client React + Tailwind CSS v4
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true, // Otomatis membuka browser saat 'npm run dev' dijalankan
  },
});
