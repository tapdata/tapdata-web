export const makeDragNodeImage = ($icon, node, parent = document.body, nodeType = 'tree-item') => {
  const dragImage = document.createElement('div')

  if (!node?.length) return dragImage
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
  text.innerHTML = nodeType === 'tree-item' ? node[0].data.name : node[0].name
  container.appendChild(text)
  dragImage.appendChild(container)

  if (node.length > 1) {
    let layer = document.createElement('div')
    layer.className = 'drag-preview-layerEffect'
    let dot = document.createElement('div')
    dot.className = node.length > 9 ? 'drag-preview-dot expand' : 'drag-preview-dot'
    dot.innerHTML = node.length
    dragImage.appendChild(layer)
    dragImage.appendChild(dot)
  }

  return dragImage
}
