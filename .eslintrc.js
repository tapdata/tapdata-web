module.exports = {
  root: true,
  env: {
    node: true
  },
  // extends: [
  //   'eslint:recommended',
  //   'plugin:@typescript-eslint/recommended',
  //   'plugin:vue/essential',
  //   '@vue/typescript',
  //   '@vue/prettier',
  //   'prettier/@typescript-eslint'
  // ],
  extends: ['plugin:vue/vue3-essential', 'eslint:recommended', '@vue/typescript/recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',

    'no-prototype-builtins': 'off',
    'getter-return': 'off',

    '@typescript-eslint/no-this-alias': 'off', // 不允许给this设置别名，例如 let self = this
    '@typescript-eslint/no-empty-function': 'off',

    'prefer-const': [
      'off', // 使用const代替let,暂时关闭
      {
        ignoreReadBeforeAssign: true //https://eslint.bootcss.com/docs/rules/prefer-const
      }
    ],

    'prettier/prettier': [
      'error',
      {
        // 使用space代替tab
        useTab: false,
        // 使用两个空格缩进
        tabWidth: 2,
        // 单引号
        singleQuote: true,
        // 取消尾分号
        semi: false,
        // 取消尾逗号
        trailingComma: 'none',
        // 统一换行符为\n
        endOfLine: 'lf',
        // 为了便于阅读，每一行建议不要使用超过80个字符
        printWidth: 120,
        // 箭头函数参数只有一个时省略括号
        arrowParens: 'avoid'
      }
    ]
  }
}
