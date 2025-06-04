import { pluginImport, sxzz } from '@sxzz/eslint-config'
export default sxzz(
  // Features: it'll detect installed dependency and enable necessary features automatically
  {
    prettier: true,
    markdown: true,
    vue: true, // auto detection
    unocss: false, // auto detection

    rules: {
      'import/no-default-export': 'off',
    },
  },
  [
    /* your custom config */
    {
      plugins: {
        import: pluginImport,
      },
      files: ['**/*.vue'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      rules: {
        'unicorn/filename-case': 'off',
      },
    },
  ],
)
