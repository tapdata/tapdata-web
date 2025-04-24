export function installAllPlugins(app) {
  const modules = import.meta.glob(['./*.[jt]s', '!**/index.[jt]s'], {
    eager: true,
  })

  for (const path in modules) {
    if (typeof modules[path].install === 'function') {
      modules[path].install(app)
    }
  }
}
