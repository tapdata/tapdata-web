const modules = import.meta.glob(['./*/*.js', '!**/index.js'], { eager: true })

// const AllInstall = requireContext.keys().map((fileName) => {
//   if (fileName === './index.js') return
//
//   return requireContext(fileName)
// })

export function installOEM(router, i18n) {
  for (const path in modules) {
    if (typeof modules[path].install === 'function') {
      modules[path].install(router, i18n)
    }
  }
}
