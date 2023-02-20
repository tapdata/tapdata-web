export function getIcon(icon, dir = 'node') {
  return require(`./${dir}/${icon}.svg`)
}
