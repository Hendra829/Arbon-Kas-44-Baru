import globals from "globals";
import js from "@eslint/js";

export default [
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "*.min.js",
      "*.min.css",
      ".vscode/**",
      ".idea/**"
    ]
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
        Chart: "readonly",
        Papa: "readonly",
        jsPDF: "readonly",
        PptxGenJS: "readonly",
        bootstrap: "readonly"
      }
    },
    rules: {
      // Best Practices
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      "no-alert": "warn",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      
      // Code Quality
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-with": "error",
      "no-new-func": "error",
      
      // Security
      "no-script-url": "error",
      "no-new-wrappers": "error",
      
      // Style
      "semi": ["error", "always"],
      "quotes": ["error", "single", { "avoidEscape": true }],
      "indent": ["error", 4, { "SwitchCase": 1 }],
      "comma-dangle": ["error", "never"],
      "no-trailing-spaces": "error",
      "eol-last": ["error", "always"],
      "no-multiple-empty-lines": ["error", { "max": 2 }],
      
      // Modern JavaScript
      "prefer-template": "warn",
      "prefer-destructuring": ["warn", {
        "array": false,
        "object": true
      }],
      "object-shorthand": ["warn", "always"],
      "arrow-spacing": "error",
      "no-duplicate-imports": "error"
    }
  }
];
