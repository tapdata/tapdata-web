const modules = import.meta.glob(['./*/*.js', '!./index.js'], { eager: true })

export function installOEM(router, i18n) {
  Object.entries(modules).forEach(([, module]) => {
    if (typeof module.install === 'function') {
      module.install(router, i18n)
    }
  })
}
