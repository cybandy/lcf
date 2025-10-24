// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt().overrideRules({
  // Your custom configs here
  'vue/html-self-closing': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  'vue/no-multiple-template-root': 'off',
  '@stylistic/comma-dangle': 'off',
  '@stylistic/semi': 'off',
  '@stylistic/quote-props': 'off',
  '@stylistic/quotes': 'off',
  '@stylistic/no-trailing-spaces': 'off',
  'nuxt/nuxt-config-keys-order': 'off',
});
