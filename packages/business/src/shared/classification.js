export const makeDragNodeImage = ($icon, nodeName, size = 1, parent = document.body) => {
  const dragImage = document.createElement('div')

  if (!nodeName) return dragImage
  dragImage.classList.add('drag-node-image')
  dragImage.style.position = 'absolute'
  dragImage.style.zIndex = '-100'
  dragImage.style.opacity = '1'
  parent.appendChild(dragImage)
  const container = document.createElement('div')
  container.className = 'drag-preview-container'

  if ($icon) {
    const icon = $icon.cloneNode(true)
    icon.className = 'drag-preview-icon'
    container.appendChild(icon)
  }

  const text = document.createElement('div')
  text.className = 'drag-preview-name ellipsis'
  text.innerHTML = nodeName
  container.appendChild(text)
  dragImage.appendChild(container)

  if (size > 1) {
    let layer = document.createElement('div')
    layer.className = 'drag-preview-layerEffect'
    let dot = document.createElement('div')
    dot.className = size > 9 ? 'drag-preview-dot expand' : 'drag-preview-dot'
    dot.innerHTML = size
    dragImage.appendChild(layer)
    dragImage.appendChild(dot)
  }

  return dragImage
}
