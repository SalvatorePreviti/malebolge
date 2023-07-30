module.exports = {
  extends: ["stylelint-config-standard"],
  rules: {
    "selector-class-pattern": null,
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      customSyntax: "postcss-styled-syntax",
    },
  ],
};
