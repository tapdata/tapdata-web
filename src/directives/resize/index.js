import { on, off, appendHtml } from '@/utils/dom'

const EVENT = {
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    stop: 'mouseup'
  },
  touch: {
    start: 'touchstart',
    move: 'touchmove',
    stop: 'touchend'
  }
}

function initEvent($el, position, options) {
  let $trigger = appendHtml($el, `<div class="resize-trigger --${position}"></div>`)
  const isHorizontal = position === 'left' || position === 'right'
  const num = position === 'left' || position === 'top' ? 1 : -1
  let initOffset, oldVal, xOry, attr, cls
  let eventsFor = EVENT.mouse

  if (isHorizontal) {
    xOry = 'pageX'
    attr = 'Width'
    cls = 'cursor-col-resize'
  } else {
    xOry = 'pageY'
    attr = 'Height'
    cls = 'cursor-row-resize'
  }

  const _attr = attr.toLowerCase()
  const max = options[`max${attr}`] || Infinity
  const min = options[`min${attr}`] || -Infinity
  const { onResize } = options

  const handleStart = event => {
    if (event.button !== 0) return
    if (event.type === 'touchstart') {
      eventsFor = EVENT.touch
    } else {
      eventsFor = EVENT.mouse
    }

    let page = event.touches ? event.touches[0] : event

    /*$overlay = appendHtml(
      document.body,
      `<div class="resizable-overlay ${
        isHorizontal ? 'x' : 'y'
      }-resizable-overlay"></div>`
    )*/

    initOffset = page[xOry]
    oldVal = $el[`offset${attr}`]
    document.body.classList.add(cls)

    on(window, eventsFor.move, handleMove)
    on(window, eventsFor.stop, handleStop)
  }

  const handleMove = event => {
    event.preventDefault()
    $trigger.classList.add('active')

    let page = event.touches ? event.touches[0] : event
    let offset = initOffset - page[xOry]
    let newVal = oldVal + offset * num // 正向或者负向移动
    newVal = Math.min(max, Math.max(min, newVal))

    onResize?.({
      isHorizontal,
      _attr,
      newVal
    })

    $el.style[_attr] = newVal + 'px'
  }

  const handleStop = () => {
    $trigger.classList.remove('active')
    document.body.classList.remove(cls)
    /*if ($overlay) {
      $overlay.remove()
      $overlay = null
    }*/

    off(window, eventsFor.move, handleMove)
    off(window, eventsFor.stop, handleStop)
  }

  on($trigger, 'mousedown', handleStart)
  on($trigger, 'touchstart', handleStart)
}

export default {
  inserted: function (el, binding) {
    // 事件名
    const options = binding.value
    const { left, right, top, bottom } = binding.modifiers

    el.style.position = 'relative'

    left && initEvent(el, 'left', options)
    right && initEvent(el, 'right', options)
    top && initEvent(el, 'top', options)
    bottom && initEvent(el, 'bottom', options)
  }
}
