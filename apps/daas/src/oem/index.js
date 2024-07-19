const requireContext = require.context('./', true, /\.js$/)

export function installOEM(router, i18n) {
  requireContext.keys().forEach(fileName => {
    if (fileName === './index.js') return

    let Module = requireContext(fileName)

    Module.install?.(router, i18n)
  })
}
