import myclupConfig from "@myclup/config-eslint";

export default [
  ...myclupConfig,
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/.expo/**",
      "**/coverage/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
    ],
  },
];
