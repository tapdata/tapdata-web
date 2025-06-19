export function getIcon(icon, dir = 'node') {
  try {
    return new URL(`./${dir}/${icon}.svg`, import.meta.url).href
  } catch (e) {
    console.log('getIcon', e)
    return null
  }
}

export function importIcon() {
  import.meta.glob(['./svg/*.svg', './colorSvg/*.svg'], { eager: false })
}
