module.exports = {
  semi: false,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,

  overrides: [
    {
      files: '*.js.hbs',
      options: {
        parser: 'babel',
      },
    },
    {
      files: '*.json.hbs',
      options: { parser: 'json' },
    },
  ],
}
