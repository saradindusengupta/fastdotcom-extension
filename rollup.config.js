import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/speedtest-wrapper.js',
  output: {
    file: 'dist/speedtest-bundle.js',
    format: 'iife',
    name: 'CloudflareSpeedtest',
    sourcemap: false
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    terser({
      compress: {
        drop_console: false
      }
    })
  ]
};
