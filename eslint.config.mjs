// eslint.config.js (or .mjs for ES Modules)
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';

export default tseslint.config(
  // Standard ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript ESLint recommended rules
  tseslint.configs.recommended,

  // You can add your custom rules here, for example:
  {
    files: ['**/*.{js,jsx,ts,tsx}'], // Apply these rules to JS/TS/JSX/TSX files
    rules: {
      // Example: disable 'react/no-unescaped-entities' if needed
      'react/no-unescaped-entities': 'off',
      // If you still want to manage unused vars, tseslint.configs.recommended includes it.
      // You might customize it here, e.g., to warn but ignore args starting with underscore:
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // You will lose @next/next/no-page-custom-font unless you manually add the plugin and rule
    },
  },
);