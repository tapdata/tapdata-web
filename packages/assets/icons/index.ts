export function getIcon(icon) {
  try {
    return new URL(`./node/${icon}.svg`, import.meta.url).href
  } catch (error) {
    console.log('getIcon', error)
    return null
  }
}

export function importIcon() {
  import.meta.glob(['./svg/*.svg', './colorSvg/*.svg'], { eager: false })
}
