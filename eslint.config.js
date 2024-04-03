// eslint.config.js

import globals from "globals";
import standard from 'eslint-config-standard';

export default [
  {
    files: [ "**/*.js", "**/*.ts", "**/*.tsx" ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        myCustomGlobal: "readonly",
      },
    },
    // 'extends': ['eslint:recommended', 'google'],
    // 'extends': ['google'],
    plugins: {
      standard,
    },
    'rules': {
      // MDM they don't call me [Michael 4k] for nothing.
      // I have to save SOME lint dignity.  Is this too much to ask?
      // NOTE first param is 0 (off), 1 (warn) or 2 (error).
      'max-len': [ 1, { 'code': 150 }],
      'require-jsdoc': 'off',
      // to match es
      'object-curly-spacing': [ 'error', 'always', { objectsInObjects: false, arraysInObjects: false }],
      'space-in-parens': [ 'error', 'always' ],
      'array-bracket-spacing': [ 'error', 'always', { objectsInArrays: false, arraysInArrays: false }],
      'computed-property-spacing': [ 'error', 'always' ],
      'max-len': [ 'error', { code: 190, tabWidth: 2 }],
      'object-curly-newline': [ 'error', { ObjectExpression: { consistent: true }}],
      'no-nested-ternary': 'off',
      'no-underscore-dangle': [ 'error', { allow: [ '_id' ]}],
      'arrow-parens': [ 'error', 'as-needed' ],
      'comma-dangle': [ 'error', 'always-multiline' ],
      'no-unused-vars': [ 'error', { args: 'none', ignoreRestSiblings: true }],
      'no-console': [ 'off', { allow: [ 'warn', 'error' ]}],
      'import/prefer-default-export': [ 'off' ],
      // 'react/jsx-one-expression-per-line': ['warn'],
      'class-methods-use-this': [ 'off' ],
      'react/destructuring-assignment': [ 'off' ],
      // 'jsx-a11y/label-has-for': ['off'],
      // 'jsx-a11y/label-has-associated-control': ['error', {}],
      // 'no-param-reassign': [ 'error', { props: false }],
      // 'react/forbid-prop-types': ['warn', { forbid: ['object', 'array'], checkContextTypes: true, checkChildContextTypes: true }],
      'no-return-assign': [ 'off' ],
      'no-return-await': [ 'off' ],
      'template-curly-spacing': 'off',
      indent: [ 'error', 2, {
        ignoredNodes: [ 'TemplateLiteral' ],
        SwitchCase: 1,
      }],
      // 'react/jsx-props-no-spreading': ['off'],
      // 'react-hooks/rules-of-hooks': 'error',
      // 'react-hooks/exhaustive-deps': 'warn',
      // 'react/jsx-curly-newline': 'off',
      // 'import/no-unresolved': 'error',
      // 'import/named': 'error',
      // 'import/default': 'error',
      // 'import/no-self-import': 'error',
      'no-use-before-define': [ 'error', { functions: false }],
    },
  },
];
