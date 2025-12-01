import { defineConfig } from 'vite';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    build: {
      outDir: "build-content", // Build to temporary directory
      emptyOutDir: true,
      lib: {
        entry: "./src/content-script.ts",
        name: "ContentScript",
        fileName: () => "content-script.js",
        formats: ['iife']
      },
      rollupOptions: {
        output: {
          entryFileNames: 'content-script.js',
          inlineDynamicImports: true
        }
      }
    },
    define: {
      "import.meta.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "import.meta.env.VITE_GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY)
    }
  };
});9