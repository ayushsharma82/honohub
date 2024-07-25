const { withNx } = require("@nx/rollup/with-nx");

module.exports = withNx(
  {
    main: "./src/index.ts",
    outputPath: "../../dist/packages/vite",
    tsConfig: "./tsconfig.lib.json",
    compiler: "swc",
    format: ["cjs", "esm"],
    assets: [{ input: "./packages/vite", output: ".", glob: "*.md" }],
  },
  {},
);
