import { appendHtml, off, on } from '@tap/shared'
import Time from '@tap/shared/src/time'

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

export const mouseDrag = {
  mounted(el, binding) {
    // 事件名
    let eventsFor = EVENT.mouse
    let $drag, width, height
    const {
      item,
      onStart,
      onMove,
      onStop,
      onDrop,
      box = [],
      domHtml,
      getDragDom,
      container,
    } = binding.value
    const [t = 0, r = 0, b = 0, l = 0] = box
    const GlobalState = {
      onMouseDownAt: 0,
      startEvent: null,
    }

    const moveAt = (posX, posY) => {
      let left = posX - width / 2
      let top = posY - height / 2

      left = Math.max(left, l)
      left = Math.min(left, document.documentElement.clientWidth - width - r)
      top = Math.max(top, t)
      top = Math.min(top, document.documentElement.clientHeight - height - b)

      $drag.style.position = 'fixed'
      $drag.style.left = `${left}px`
      $drag.style.top = `${top}px`
      $drag.style.opacity = 1
    }

    const handleStart = (el._handleStart = (event) => {
      if (event.type === 'touchstart') {
        eventsFor = EVENT.touch
      } else {
        eventsFor = EVENT.mouse
      }
      el._eventsFor = eventsFor
      GlobalState.startEvent = event
      GlobalState.onMouseDownAt = Time.now()
      if (event.button === 0) {
        const ifCancel = onStart?.(item)
        if (ifCancel === false) return false
        on(document.documentElement, eventsFor.move, handleMove, {
          capture: false,
          passive: false,
        })
        on(document.documentElement, eventsFor.stop, handleStop)
      }
    })

    const handleMove = (el._handleMove = async (event) => {
      event.preventDefault()

      const distance = Math.hypot(
        event.pageX - GlobalState.startEvent.pageX,
        event.pageY - GlobalState.startEvent.pageY,
      )
      const timeDelta = Time.now() - GlobalState.onMouseDownAt

      if (distance < 4 || timeDelta < 10 || event === GlobalState.startEvent) {
        return
      }

      if (!$drag) {
        $drag = domHtml
          ? appendHtml(document.body, domHtml.replaceAll('\n', '').trim())
          : await getDragDom()
        document.body.classList.add('cursor-grabbing')
        const rect = $drag.getBoundingClientRect()
        width = rect.width
        height = rect.height
      }
      const posX = event.touches ? event.touches[0].pageX : event.pageX
      const posY = event.touches ? event.touches[0].pageY : event.pageY
      moveAt(posX, posY)
      onMove?.(item, [posX, posY], $drag)
    })

    const handleStop = (el._handleStop = (event) => {
      const posX = event.touches ? event.touches[0].pageX : event.pageX
      const posY = event.touches ? event.touches[0].pageY : event.pageY

      document.body.classList.remove('cursor-grabbing')
      onStop?.(item, [posX, posY])

      if ($drag) {
        // const { width, height } = $drag.getBoundingClientRect()
        const rect = $drag.getBoundingClientRect()
        domHtml && $drag.remove()
        $drag = null

        if (container) {
          const $con = document.querySelector(container)
          const $elemBelow = document.elementFromPoint(posX, posY)
          if ($con && $con.contains($elemBelow)) {
            onDrop?.(item, [posX, posY], rect)
          }
        }
      }

      off(document.documentElement, eventsFor.move, handleMove)
      off(document.documentElement, eventsFor.stop, handleStop)
    })

    on(el, eventsFor.start, handleStart)
  },

  unmounted(el) {
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
