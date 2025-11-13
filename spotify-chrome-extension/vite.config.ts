import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      viteStaticCopy({
        targets: [{ src: "public/manifest.json", dest: "." }]
      }) as unknown as any
    ],
    build: {
      outDir: "build",
      rollupOptions: {
        input: {
          main: "./index.html",
          themesandbox: "./src/theme-sandbox/theme-sandbox.html"
        }
      }
    },
    define: {
      "import.meta.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY)
    },
    test: {
      coverage: {
        //use v8 instead of istanbul as it is native with vite
        provider: "v8",
      },
      environment: "jsdom",
      globals: true,
      setupFiles: []
    },
  };
});