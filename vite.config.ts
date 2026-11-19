import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/resolve.ts"],
    outDir: "runtime",
    clean: false,
    platform: "node",
    target: "node22.22",
    format: "esm",
    fixedExtension: true,
    dts: false,
  },
});
