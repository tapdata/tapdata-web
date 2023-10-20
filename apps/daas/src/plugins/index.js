export function installAllPlugins(app) {
  const modules = import.meta.glob('!**/index.js', { eager: true })

  for (const module of modules) {
    console.log('module', module)
    if (typeof module.install === 'function') {
      module.install(app)
    }
  }

  // const files = require.context('.', true, /\.ts$/)
  // files.keys().forEach(key => {
  //   if (typeof files(key).install === 'function') {
  //     if (key !== './index.js') files(key).install(app)
  //   }
  // })
}
