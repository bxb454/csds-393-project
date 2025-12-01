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
        targets: [
          { src: "public/manifest.json", dest: "." },
          { src: "public/content-script.js", dest: "." }
        ]
      }) as unknown as any
    ],
    build: {
      outDir: "build",
      rollupOptions: {
        input: {
          main: "./index.html",
          themesandbox: "./theme-sandbox.html",
          background: "./src/background.ts"
        },
        output: {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'background') {
              return '[name].js';
            }
            return 'assets/[name]-[hash].js';
          }
        }
      }
    },
    define: {
      "import.meta.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY)
    },
    test: {
      coverage: {
        provider: "v8",
      },
      environment: "jsdom",
      globals: true,
      setupFiles: []
    }
  };
});