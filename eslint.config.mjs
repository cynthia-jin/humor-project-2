import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Supabase rows aren't typed (no generated types); admin code uses
      // `any` for row callbacks throughout. Don't error on it.
      "@typescript-eslint/no-explicit-any": "off",
      // Internal admin tool — plain <img> is fine, next/image is overkill.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
