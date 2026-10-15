export function getTooltipPosition(cell, tooltip, viewport) {
  const gap = 6
  const margin = 12
  const left = Math.max(
    margin,
    Math.min(
      cell.left + (cell.width - tooltip.width) / 2,
      viewport.width - tooltip.width - margin,
    ),
  )
  const above = cell.bottom + gap + tooltip.height > viewport.height - margin

  return {
    left: `${left}px`,
    top: `${above ? cell.top - tooltip.height - gap : cell.bottom + gap}px`,
    visibility: 'visible',
  }
}
