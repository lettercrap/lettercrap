import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'lettercrap.min': 'src/lettercrap.ts',
  },
  clean: true,
  dts: true,
  minify: true,
  format: ['esm'],
});
