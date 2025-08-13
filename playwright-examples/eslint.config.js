// eslint.config.js
import eslintPluginTs from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020,
      },
      globals: {
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',

        // Browser globals
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': eslintPluginTs,
    },
    rules: {
      ...eslintPluginTs.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
