import { isFn } from '../types'
import type { Directive, Plugin } from 'vue'

type ClipboardDirective = Function | string | object | null | undefined
type ClipboardHTMLElement = HTMLElement & {
  _vClipboardText: Function
}

class Cache {
  #seed = 0
  #data = new Map()

  #id() {
    return Date.now().toString(26) + this.#seed++
  }

  add(value, id = this.#id()) {
    this.#data.set(id, value)

    return id
  }

  get(id) {
    return this.#data.get(id)
  }

  delete(id) {
    return this.#data.delete(id)
  }
}

const cache = new Cache()

const createTextarea = (value: string) => {
  const textarea = document.createElement('textarea')

  textarea.addEventListener('focusin', (event) => {
    event.stopPropagation()
  })

  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.cssText =
    'position:fixed; pointer-events:none; z-index:-9999; opacity:0;'

  return textarea
}

const asString = (value: any): string => {
  if (value == null) {
    console.warn('Clipboard input is empty')
    return ''
  }

  if (typeof value !== 'string') {
    try {
      return JSON.stringify(value)
    } catch (error) {
      console.warn('Failed to copy value to clipboard. Unknown type.', error)

      return ''
    }
  }

  return value
}

export const Clipboard = {
  /**
   * Requests Navigator API persmission to clipboard.
   */
  requestClipboardPermission() {
    return navigator.permissions.query({
      name: 'clipboard-write' as PermissionName,
    })
  },
  /**
   * Writes to cliboard using Navigator API.
   */
  async writeClipboard(value: string) {
    const permissions = await Clipboard.requestClipboardPermission()

    if (permissions.state === 'granted') {
      await navigator.clipboard.writeText(value)
      return true
    }

    return false
  },
  /**
   * Writes to clipboard using old-school execCommand('copy').
   */
  writeClipboardExecCommand(value: string) {
    const textarea = createTextarea(value)

    document.body.append(textarea)

    if (/ipad|ipod|iphone/i.test(navigator.userAgent)) {
      textarea.contentEditable = 'true'
      textarea.readOnly = true

      const range = document.createRange()

      range.selectNodeContents(textarea)

      const selection = window.getSelection()

      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
        textarea.setSelectionRange(0, 999999)
      }
    } else {
      textarea.select()
    }

    const result = document.execCommand('copy')
    textarea.remove()

    return result
  },
  /**
   * Maes an attempt to copy data to the clipboard.
   */
  async copy(input: any) {
    const data = typeof input === 'function' ? input() : input
    const value = asString(data)

    const copied = await Clipboard.writeClipboard(value)

    if (copied) {
      return true
    }

    return Clipboard.writeClipboardExecCommand(value)
  },
}

export const ClipboardPlugin: Plugin = {
  install(app) {
    app.config.globalProperties.$clipboard = Clipboard.copy

    app.directive('clipboard', {
      beforeMount: (el: ClipboardHTMLElement, binding) => {
        const { arg, value } = binding
        const isFnValue = isFn(value)

        if (arg === 'success' && isFnValue) {
          el.dataset.clipboardSuccess = cache.add(value)
          return
        }

        if (arg === 'error' && isFnValue) {
          el.dataset.clipboardError = cache.add(value)
          return
        }

        el._vClipboardText = !isFnValue ? () => value : (value as Function)

        const onClick = async (event: MouseEvent) => {
          const success = await Clipboard.copy(el._vClipboardText)
          const callbackId = success
            ? el.dataset.clipboardSuccess
            : el.dataset.clipboardError
          const callback = cache.get(callbackId)
          callback?.(value, event)
        }

        el.dataset.clipboardClick = cache.add(onClick)
        el.addEventListener('click', onClick)
      },

      updated(el: ClipboardHTMLElement, binding) {
        if (binding.arg !== 'success' && binding.arg !== 'error') {
          el._vClipboardText = !isFn(binding.value)
            ? () => binding.value
            : (binding.value as Function)
        }
      },

      unmounted: (el) => {
        const { clipboardClick, clipboardSuccess, clipboardError } = el.dataset

        for (const id of [clipboardSuccess, clipboardError]) {
          if (id) {
            cache.delete(id)
          }
        }

        if (clipboardClick) {
          const handler = cache.get(clipboardClick)

          if (handler) {
            el.removeEventListener('click', handler)
            cache.delete(clipboardClick)
          }
        }
      },
    } as Directive<HTMLElement, ClipboardDirective>)
  },
}
