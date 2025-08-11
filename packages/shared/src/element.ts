import { Point } from './coordinate'

const InlineLayoutTagNames = new Set([
  'A',
  'ABBR',
  'ACRONYM',
  'AUDIO',
  'B',
  'BDI',
  'BDO',
  'BIG',
  'BR',
  'BUTTON',
  'CANVAS',
  'CITE',
  'CODE',
  'DATA',
  'DATALIST',
  'DEL',
  'DFN',
  'EM',
  'EMBED',
  'I',
  'IFRAME',
  'IMG',
  'INS',
  'KBD',
  'LABEL',
  'MAP',
  'MARK',
  'METER',
  'NOSCRIPT',
  'OBJECT',
  'OUTPUT',
  'PICTURE',
  'PROGRESS',
  'Q',
  'RUBY',
  'S',
  'SAMP',
  'SELECT',
  'SLOT',
  'SMALL',
  'STRONG',
  'SUB',
  'SUP',
  'SVG',
  'TEMPLATE',
  'TEXTAREA',
  'TIME',
  'U',
  'TT',
  'VAR',
  'VIDEO',
  'WBR',
  'INPUT',
  'SPAN',
])

export const calcElementOuterWidth = (
  innerWidth: number,
  style: CSSStyleDeclaration,
) => {
  return (
    innerWidth +
    Number.parseFloat(style.marginLeft) +
    Number.parseFloat(style.marginRight) +
    Number.parseFloat(style.paddingLeft) +
    Number.parseFloat(style.paddingRight) +
    Number.parseFloat(style.borderLeftWidth) +
    Number.parseFloat(style.borderRightWidth)
  )
}

export const calcElementLayout = (element: Element) => {
  if (!element) return 'vertical'
  const parent = element.parentElement
  if (!parent) return 'vertical'
  const tagName = element.tagName
  const parentTagName = parent.tagName
  const style = getComputedStyle(element)
  const parentStyle = getComputedStyle(parent)

  const isNotFullWidth = () => {
    const innerWidth = element.getBoundingClientRect().width
    const outerWidth = calcElementOuterWidth(innerWidth, style)
    const parentInnerWidth = parent.getBoundingClientRect().width
    return outerWidth.toFixed(0) < parentInnerWidth.toFixed(0)
  }
  if ((tagName === 'TH' || tagName === 'TD') && parentTagName === 'TR')
    return 'horizontal'
  if (parentStyle.display === 'flex' && parentStyle.flexDirection === 'row')
    return 'horizontal'
  if (parentStyle.display === 'grid' && isNotFullWidth()) {
    return 'horizontal'
  }
  if (InlineLayoutTagNames.has(tagName)) {
    if (style.display === 'block') {
      if (
        (style.float === 'left' || style.float === 'right') &&
        isNotFullWidth()
      ) {
        return 'horizontal'
      }
      return 'vertical'
    }
    return 'horizontal'
  }
}

export const calcElementTranslate = (element: HTMLElement) => {
  const transform = element?.style?.transform
  if (transform) {
    const [x, y] = transform
      .match(
        /translate(?:3d)?\(\s*([-\d.]+)[a-z]+[\s,]+([-\d.]+)(?:[a-z]+[\s,]+([-\d.]+)[a-z]+|[a-z]{2,})\s*\)/,
      )
      ?.slice(1, 3) ?? [0, 0]

    return new Point(Number(x), Number(y))
  } else {
    return new Point(Number(element.offsetLeft), Number(element.offsetTop))
  }
}

export const calcElementRotate = (element: HTMLElement) => {
  const transform = element?.style?.transform
  if (transform) {
    return Number(transform.match(/rotate\(\s*([-\d.]+)/)?.[1] ?? 0)
  } else {
    return 0
  }
}

export const calcElementScale = (element: HTMLElement) => {
  const transform = element?.style?.transform
  if (transform) {
    return Number(transform.match(/scale\(\s*([-\d.]+)/)?.[1] ?? 0)
  } else {
    return 0
  }
}

export function makePageTitle(title) {
  const base = import.meta.env.VUE_APP_PAGE_TITLE || 'Tapdata'
  return title ? `${title} - ${base}` : base
}

export function setPageTitle(title) {
  window.document.title = makePageTitle(title)
}

const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g
const MOZ_HACK_REGEXP = /^moz([A-Z])/
const camelCase = (name) => {
  return name
    .replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter
    })
    .replace(MOZ_HACK_REGEXP, 'Moz$1')
}

export const getStyle = (element, styleName) => {
  if (!element || !styleName) return null
  styleName = camelCase(styleName)
  if (styleName === 'float') {
    styleName = 'cssFloat'
  }
  try {
    const computed = document.defaultView.getComputedStyle(element, '')
    return element.style[styleName] || computed ? computed[styleName] : null
  } catch (e) {
    return element.style[styleName]
  }
}

export function checkEllipsisActive(dom) {
  const padding = (parseInt(getStyle(dom, 'paddingLeft'), 10) || 0) + (parseInt(getStyle(dom, 'paddingRight'), 10) || 0)
  const range = document.createRange()
  range.setStart(dom, 0)
  range.setEnd(dom, dom.childNodes.length)
  const rangeWidth = range.getBoundingClientRect().width

  return rangeWidth + padding > dom.offsetWidth || dom.scrollWidth > dom.offsetWidth
}
