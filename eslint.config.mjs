// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  languageOptions: {
    ecmaVersion: 2024,
    parserOptions: {
      ecmaVersion: 2024,
    },
  },
  rules: {
    "vue/multi-word-component-names": "off",
    "no-console": "off",
    "no-undef": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "vue/no-unused-vars": "warn",
    "vue/no-unused-components": "warn",
    "vue/html-indent": ["error", 4],
    "@stylistic/indent": "off",
    "@stylistic/brace-style": "off",
    "@stylistic/operator-linebreak": "off",
    "@stylistic/arrow-parens": "off",
    "@stylistic/member-delimiter-style": "off",
    "@stylistic/indent-binary-ops": "off",
    "@stylistic/quotes": "off",
    "@stylistic/quote-props": "off",
  },
});
