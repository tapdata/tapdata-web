export function getOverflowTooltipContent(cell) {
  const input = cell.querySelector('input')
  const text = cell.querySelector('[data-tooltip-content]')
  const content = input?.value || text?.textContent || cell.textContent
  const element = input || text || cell
  let isOverflowing = element.scrollWidth > element.clientWidth

  if (input && !isOverflowing) {
    const style = window.getComputedStyle(input)
    const context = document.createElement('canvas').getContext('2d')
    if (context) {
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      const availableWidth =
        input.clientWidth -
        (Number.parseFloat(style.paddingLeft) || 0) -
        (Number.parseFloat(style.paddingRight) || 0)
      isOverflowing = context.measureText(input.value).width > availableWidth
    }
  }

  return content && isOverflowing ? content : ''
}
