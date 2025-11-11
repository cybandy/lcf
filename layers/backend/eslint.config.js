import withNuxt from './.playground/.nuxt/eslint.config.mjs';

export default withNuxt().overrideRules({
  '@typescript-eslint/no-unused-vars': 'off',
});
