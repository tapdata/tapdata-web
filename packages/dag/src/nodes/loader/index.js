const nodeContext = require.context('../', false, /\.js$/)

const requireAllIns = (requireContext) => {
  return requireContext.keys().map((name) => {
    let Module = requireContext(name)
    return new Module[Object.keys(Module)[0]]()
  }, {})
}

export const allResourceIns = requireAllIns(nodeContext)
