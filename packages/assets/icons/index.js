export function getIcon(icon, dir = 'node') {
  try {
    return require(`./${dir}/${icon}.svg`)
  } catch (e) {
    console.log('getIcon', e)
    return null
  }
}

export function importIcon() {
  const req = require.context('./svg/', false, /\.svg$/)
  const colorSvg = require.context('./colorSvg/', false, /\.svg$/)
  const requireAll = requireContext => {
    return requireContext.keys().map(requireContext)
  }
  requireAll(req)
  requireAll(colorSvg)
}
