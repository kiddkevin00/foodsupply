module.exports = {
  extends: ['airbnb', 'standard-react'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      globalReturn: false,
      impliedStrict: true,
      jsx: true,
      experimentalObjectRestSpread: true,
      allowImportExportEverywhere: true,
    }
  },
  env: {
    node: true,
    es6: true,
    browser: true,
  },
  root: true,
  rules: {
    'max-len': [2, { 'code': 100, ignoreStrings: true }],
    'keyword-spacing': [2, {
      overrides: {
        throw: { after: false, before: true }
      },
    }],
    'spaced-comment': 0,
    'padded-blocks': 0,
    'no-underscore-dangle': 0,
    'no-unused-expressions': 1,
    'no-unused-vars': 2,
    'no-use-before-define': [2, { functions: false, classes: true }],
    'no-restricted-syntax': [2, 'WithStatement'],
    'no-prototype-builtins': 1,
    'new-cap': [2, { capIsNew: false }],
    'react/jsx-filename-extension': 0,
    'react/jsx-curly-spacing': [2, 'always'],
    'react/jsx-boolean-value': [1, 'always'],
    'react/jsx-no-bind': [1],
    'jsx-quotes': [2, 'prefer-double'],
    'import/first': 0,
    'import/order': [2, { groups: ['index', 'sibling', 'parent', 'internal', 'external', 'builtin'] }],
    'import/no-extraneous-dependencies': [2, { devDependencies: true, optionalDependencies: false, peerDependencies: false }],
    'import/newline-after-import': [2, { 'count': 2 }],
    'arrow-parens': [2, 'always'],
    'newline-after-var': [2, 'always'],
    'no-multi-assign': 1,
    'global-require': 1,
  },
};
