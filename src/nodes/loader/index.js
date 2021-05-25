const nodeContext = require.context('@/nodes/', false, /\.js$/)
const comContext = require.context('@/nodes/components', false, /\.vue$/)

const requireAllNode = requireContext => {
  return requireContext.keys().map(name => {
    let pkg = requireContext(name)
    let ins = new pkg.default()
    return {
      name: ins.name,
      icon: ins.icon,
      group: ins.group,
      __class: pkg.default
    }
  })
}

const requireAllCom = requireContext => {
  return requireContext.keys().reduce((obj, name) => {
    const com = requireContext(name).default
    obj[com.name] = com
    console.log('requireAllCom', com.name, com)
    return obj
  }, {})
}

export const nodeTypes = requireAllNode(nodeContext)
export const nodeComs = requireAllCom(comContext)

console.log('nodeComs', nodeComs)
