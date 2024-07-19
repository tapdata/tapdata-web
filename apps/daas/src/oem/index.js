const requireContext = require.context('./', true, /\.js$/)

const AllInstall = requireContext.keys().map(fileName => {
  if (fileName === './index.js') return

  return requireContext(fileName)
})

export function installOEM(router, i18n) {
  AllInstall.forEach(Module => {
    Module?.install?.(router, i18n)
  })
}
