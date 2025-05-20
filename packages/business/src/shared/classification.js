export const makeDragNodeImage = (
  $icon,
  nodeName,
  size = 1,
  parent = document.body,
) => {
  const dragImage = document.createElement('div')

  if (!nodeName) return dragImage
  dragImage.classList.add('drag-node-image')
  dragImage.style.position = 'absolute'
  dragImage.style.zIndex = '-100'
  dragImage.style.opacity = '1'
  parent.append(dragImage)
  const container = document.createElement('div')
  container.className = 'drag-preview-container shadow-sm'

  if ($icon) {
    const icon = $icon.cloneNode(true)
    icon.className = 'drag-preview-icon'
    container.append(icon)
  }

  const text = document.createElement('div')
  text.className = 'drag-preview-name ellipsis'
  text.innerHTML = nodeName
  container.append(text)
  dragImage.append(container)

  if (size > 1) {
    const layer = document.createElement('div')
    layer.className = 'drag-preview-layerEffect shadow-sm'
    const dot = document.createElement('div')
    dot.className = size > 9 ? 'drag-preview-dot expand' : 'drag-preview-dot'
    dot.innerHTML = size
    dragImage.append(layer)
    dragImage.append(dot)
  }

  return dragImage
}
