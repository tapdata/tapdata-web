// const nodeContext = require.context('../', false, /\.js$/)

// const requireAllIns = requireContext => {
//   return requireContext.keys().map(name => {
//     let Module = requireContext(name)
//     return new Module[Object.keys(Module)[0]]()
//   }, {})
// }

const modules = import.meta.glob('../*.js', { eager: true })
const allResourceIns = []

for (const path in modules) {
  allResourceIns.push(new modules[path][Object.keys(modules[path])[0]]())
}

export { allResourceIns }
