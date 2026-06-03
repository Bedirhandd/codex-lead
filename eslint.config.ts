import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/coverage/**",
      "packages/web-ui/build/**",
      "**/node_modules/**",
      "**/.svelte-kit/**",
      "**/*.tsbuildinfo",
      ".husky/_/**",
      ".project-memory/**",
      "AGENTS.md",
      "docs/**",
      "tmp/**",
    ],
  },
  {
    files: ["packages/**/*.ts"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      prettier,
    ],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: "./tsconfig.typecheck.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-confusing-void-expression": "off",
    },
  },
  {
    files: ["*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.disableTypeChecked,
      prettier,
    ],
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
    },
  },
);
