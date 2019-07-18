module.exports = {
  'env': {
    'commonjs': true,
    'es6': true,
    'node': true
  },
  'extends': 'standard',
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly'
  },
  'parserOptions': {
    'ecmaVersion': 2018
  },
  'rules': {
    // enable additional rules
       "indent": ["error", 4],
       "linebreak-style": ["error", "unix"],
       "quotes": ["error", "double"],
       "semi": ["error", "always"],

       // override default options for rules from base configurations
       "comma-dangle": ["error", "always-multiline"],
       "no-cond-assign": ["error", "always"],

       // disable rules from base configurations
       "no-console": "off",
  }
}
