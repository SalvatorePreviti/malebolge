module.exports = {
  extends: ["stylelint-config-standard"],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      customSyntax: "postcss-styled-syntax",
    },
  ],
};
