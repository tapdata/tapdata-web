import { sxzz } from '@sxzz/eslint-config'
export default sxzz(
  // Features: it'll detect installed dependency and enable necessary features automatically
  {
    prettier: true,
    markdown: true,
    vue: true, // auto detection
    unocss: false, // auto detection
  },
  [
    /* your custom config */
    {
      files: ['**/*.vue'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      rules: {
        'unicorn/filename-case': 'off',
        '@eslint-community/eslint-comments/no-unlimited-disable': 'off', // 允许 eslint-disable 不指定规则
      },
    },
  ],
)
