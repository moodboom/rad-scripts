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
    plugins: {
      standard,
    },
    'rules': {
      'require-jsdoc': 'off',
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
      'class-methods-use-this': [ 'off' ],
      'no-return-assign': [ 'off' ],
      'no-return-await': [ 'off' ],
      'template-curly-spacing': 'off',
      indent: [ 'error', 2, {
        ignoredNodes: [ 'TemplateLiteral' ],
        SwitchCase: 1,
      }],
      'no-use-before-define': [ 'error', { functions: false }],
    },
  },
];
