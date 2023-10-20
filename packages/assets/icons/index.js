export function getIcon(icon, dir = 'node') {
  try {
    return require(`./${dir}/${icon}.svg`)
  } catch (e) {
    console.log('getIcon', e)
    return null
  }
}

export function importIcon() {
  import.meta.glob(['./svg/*.svg', './colorSvg/*.svg'], { eager: true })
}
