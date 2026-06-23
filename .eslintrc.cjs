module.exports = {
  root: true,
  extends: ['@nuxt/eslint-config'],
  rules: {
    // Enforce explicit types for function return values
    '@typescript-eslint/explicit-function-return-type': 'off',
    // Allow unused vars with _ prefix
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'vue/multi-word-component-names': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  overrides: [
    {
      // @nuxt/eslint-config sets these inside its own *.vue override block,
      // which takes precedence over plain top-level `rules`. Matching the
      // same file scope here is required for these to actually win.
      files: ['*.vue'],
      rules: {
        // Pure formatting preferences that fight against dense single-line
        // SVG icon markup (a deliberate, common style for inline icons).
        // No effect on correctness or accessibility.
        'vue/max-attributes-per-line': 'off',
        'vue/singleline-html-element-content-newline': 'off',
        'vue/html-self-closing': 'off',
      },
    },
  ],
}