import { on, off, appendHtml } from '@/utils/dom'

const EVENT = {
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    stop: 'mouseup',
  },
  touch: {
    start: 'touchstart',
    move: 'touchmove',
    stop: 'touchend',
  },
}

export default {
  mounted(el, binding) {
    // 事件名
    let eventsFor = EVENT.mouse
    let $drag
    const {
      item,
      onStart,
      onMove,
      onStop,
      onDrop,
      box = [],
      domHtml,
      container,
    } = binding.value
    const [t = 0, r = 0, b = 0, l = 0] = box

    const handleStart = (el._handleStart = (event) => {
      if (event.type === 'touchstart') {
        eventsFor = EVENT.touch
      } else {
        eventsFor = EVENT.mouse
      }
      el._eventsFor = eventsFor
      if (event.button === 0) {
        onStart?.(item)
        on(document.documentElement, eventsFor.move, handleMove)
        on(document.documentElement, eventsFor.stop, handleStop)
      }
    })

    const handleMove = (el._handleMove = (event) => {
      event.preventDefault()
      if (!$drag) {
        $drag = appendHtml(document.body, domHtml.replace(/\n/g, '').trim())
        document.body.classList.add('cursor-grabbing')
      }

      const { width, height } = $drag.getBoundingClientRect()

      let posX =
        (event.touches ? event.touches[0].pageX : event.pageX) - width / 2
      let posY =
        (event.touches ? event.touches[0].pageY : event.pageY) - height / 2

      posX = Math.max(posX, l)
      posX = Math.min(posX, document.documentElement.clientWidth - width - r)
      posY = Math.max(posY, t)
      posY = Math.min(posY, document.documentElement.clientHeight - height - b)

      $drag.style.position = 'absolute'
      $drag.style.left = posX + 'px'
      $drag.style.top = posY + 'px'
      onMove?.(item, $drag)
    })

    const handleStop = (el._handleStop = (event) => {
      let posX = event.touches ? event.touches[0].pageX : event.pageX
      let posY = event.touches ? event.touches[0].pageY : event.pageY

      document.body.classList.remove('cursor-grabbing')
      onStop?.(item, [posX, posY])

      if ($drag) {
        const { width, height } = $drag.getBoundingClientRect()
        $drag.remove()
        $drag = null

        if (container) {
          const $con = document.querySelector(container)
          if ($con) {
            const bound = $con.getBoundingClientRect()
            if (
              posX > bound.left &&
              posX < bound.right &&
              posY > bound.top &&
              posY < bound.bottom
            ) {
              onDrop?.(item, [posX - width / 2, posY - height / 2], {
                width,
                height,
              })
            }
          }
        }
      }

      off(document.documentElement, eventsFor.move, handleMove)
      off(document.documentElement, eventsFor.stop, handleStop)
    })

    on(el, 'mousedown', handleStart)
    on(el, 'touchstart', handleStart)
  },

  unMounted(el) {
    const { _eventsFor } = el
    off(el, 'mousedown', el._handleStart)
    off(el, 'touchstart', el._handleStart)
    if (!_eventsFor) return
    off(el, _eventsFor.move, el._handleMove)
    off(el, _eventsFor.stop, el._handleStop)

    delete el._eventsFor
    delete el._handleStart
    delete el._handleMove
    delete el._handleStop
  },
}
