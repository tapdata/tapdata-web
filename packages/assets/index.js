export * from './icons'

export function getConnectorImage(icon) {
  return new URL(`./images/connector/${icon}`, import.meta.url).href
}
