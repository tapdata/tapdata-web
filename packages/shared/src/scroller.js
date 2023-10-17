import { createUniformSpeedAnimation, calcSpeedFactor } from './animation'
import { isFn, isWindow } from './types'

const MAX_SPEED = 50 // px/s

export const calcAutoScrollBasicInfo = (point, axis, viewport, maxSpeed = MAX_SPEED) => {
  const { left, right, top, bottom } = viewport
  const { x, y } = point

  let begin
  let end
  let pos
  let speedFactor
  if (axis === 'x') {
    begin = left
    end = right
    pos = x
  } else {
    begin = top
    end = bottom
    pos = y
  }

  const scrollerSize = end - begin

  const moveDistance = scrollerSize > 400 ? 100 : scrollerSize / 3
  if (end - pos < moveDistance) {
    return {
      direction: 'end',
      speedFactor,
      speed: maxSpeed * calcSpeedFactor(end - pos, moveDistance)
    }
  } else if (pos - begin < moveDistance) {
    return {
      direction: 'begin',
      speedFactor,
      speed: maxSpeed * calcSpeedFactor(pos - begin, moveDistance)
    }
  }

  return null
}

export const updateScrollValue = (element, axis, value, callback) => {
  if (element) {
    if (!isWindow(element)) {
      if (axis === 'x') {
        if (element.scrollLeft + value > element.scrollWidth) return
        element.scrollLeft += value
        if (isFn(callback)) {
          callback(element.scrollLeft)
        }
      } else {
        if (element.scrollTop + value > element.scrollHeight) return
        element.scrollTop += value
        if (isFn(callback)) {
          callback(element.scrollTop)
        }
      }
    } else {
      if (axis === 'x') {
        element.scrollBy(value, 0)
      } else {
        element.scrollBy(0, value)
      }
      if (isFn(callback)) {
        callback(value)
      }
    }
  }
}

export const scrollAnimate = (element, axis, direction, speed, callback) => {
  return createUniformSpeedAnimation(speed, delta => {
    updateScrollValue(element, axis, direction === 'begin' ? 0 - delta : delta, callback)
  })
}
