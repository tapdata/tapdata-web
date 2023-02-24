export const getLeftmostTopNode = (nodes) => {
  return nodes.reduce((leftmostTop, node) => {
    if (
      node.position[0] > leftmostTop.position[0] ||
      node.position[1] > leftmostTop.position[1]
    ) {
      return leftmostTop
    }

    return node
  })
}

export const getDataflowCorners = (nodes) => {
  const [left, top] = nodes[0].attrs.position
  return nodes.reduce(
    (accu, node) => {
      const [left, top] = node.attrs.position
      if (left < accu.minX) {
        accu.minX = left
      }
      if (top < accu.minY) {
        accu.minY = top
      }
      if (left > accu.maxX) {
        accu.maxX = left
      }
      if (top > accu.maxY) {
        accu.maxY = top
      }

      return accu
    },
    {
      minX: left,
      minY: top,
      maxX: left,
      maxY: top,
    }
  )
}

export const scaleSmaller = ({ scale, offset: [xOffset, yOffset] }) => {
  scale /= 1.25
  xOffset /= 1.25
  yOffset /= 1.25
  xOffset += window.innerWidth / 10
  yOffset += window.innerHeight / 10

  return {
    scale,
    offset: [xOffset, yOffset],
  }
}

export const scaleBigger = ({ scale, offset: [xOffset, yOffset] }) => {
  scale *= 1.25
  xOffset -= window.innerWidth / 10
  yOffset -= window.innerHeight / 10
  xOffset *= 1.25
  yOffset *= 1.25

  return {
    scale,
    offset: [xOffset, yOffset],
  }
}

export const scaleReset = (config) => {
  if (config.scale > 1) {
    // zoomed in
    while (config.scale > 1) {
      config = scaleSmaller(config)
    }
  } else {
    while (config.scale < 1) {
      config = scaleBigger(config)
    }
  }

  config.scale = 1

  return config
}
