export function installAllPlugins(app) {
  const files = require.context('.', true, /\.ts$/)
  files.keys().forEach(key => {
    if (typeof files(key).install === 'function') {
      if (key !== './index.js') files(key).install(app)
    }
  })
}