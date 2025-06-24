import type { App } from 'vue'

export function installAllPlugins(app: App) {
  const modules = import.meta.glob(['./*.ts', '!**/index.ts'], { eager: true })

  for (const path of Object.keys(modules)) {
    const module = modules[path] as { install: (app: App) => void }
    if (typeof module.install === 'function') {
      module.install(app)
    }
  }
}
