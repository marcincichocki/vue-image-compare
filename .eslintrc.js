module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  globals: {},
  extends: 'plugin:vue/essential',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2017
  },
  rules: {
    indent: [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    quotes: [
      'error',
      'single'
    ],
    semi: [
      'error',
      'never'
    ],
    'no-console': 0
  }
};
