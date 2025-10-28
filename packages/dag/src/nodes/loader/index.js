const modules = import.meta.glob('../*.js', { eager: true })
const allResourceIns = []

for (const path of Object.keys(modules)) {
  const Module = modules[path]
  const [key] = Object.keys(Module)
  allResourceIns.push(new Module[key]())
}

export { allResourceIns }
