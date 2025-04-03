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
  ],
)
