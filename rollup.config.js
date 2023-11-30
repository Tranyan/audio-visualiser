import { babel }  from "@rollup/plugin-babel";

const config = {
  input: "index.js",
  output: {
    file: "docs/dist/index.js",
    format: "iife",
    name: "transo",
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: "node_modules/**",
      babelHelpers: "bundled",
    }),
  ],
};
export default config