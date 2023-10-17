import { observable, define, action } from '@formily/reactive'
import { KeyCode } from '@tap/shared'
import { Shortcut } from './Shortcut'

const Modifiers = [
  ['metaKey', KeyCode.Meta],
  ['shiftKey', KeyCode.Shift],
  ['ctrlKey', KeyCode.Control],
  ['altKey', KeyCode.Alt]
]

export class Keyboard {
  engine
  shortcuts = []
  sequence = []
  keyDown = null
  modifiers = {}
  requestTimer = null

  constructor(engine) {
    this.engine = engine
    this.shortcuts = engine.props?.shortcuts || []
    this.makeObservable()
  }

  matchCodes(context) {
    for (let i = 0; i < this.shortcuts.length; i++) {
      const shortcut = this.shortcuts[i]
      if (shortcut.match(this.sequence, context)) {
        return true
      }
    }
    return false
  }

  preventCodes() {
    return this.shortcuts.some(shortcut => {
      return shortcut.preventCodes(this.sequence)
    })
  }

  includes(key) {
    return this.sequence.some(code => Shortcut.matchCode(code, key))
  }

  excludes(key) {
    this.sequence = this.sequence.filter(code => !Shortcut.matchCode(key, code))
  }

  addKeyCode(key) {
    if (!this.includes(key)) {
      this.sequence.push(key)
    }
  }

  removeKeyCode(key) {
    if (this.includes(key)) {
      this.excludes(key)
    }
  }

  isModifier(code) {
    return Modifiers.some(modifier => Shortcut.matchCode(modifier[1], code))
  }

  handleModifiers(event) {
    Modifiers.forEach(([key, code]) => {
      if (event[key]) {
        if (!this.includes(code)) {
          this.sequence = [code].concat(this.sequence)
        }
      }
    })
  }

  handleKeyboard(event, context) {
    if (event.eventType === 'keydown') {
      this.keyDown = event.data
      this.addKeyCode(this.keyDown)
      this.handleModifiers(event)
      if (this.matchCodes(context)) {
        this.sequence = []
      }
      this.requestClean()
      if (this.preventCodes()) {
        event.preventDefault()
        event.stopPropagation()
      }
    } else {
      this.keyDown = null
    }
  }

  isKeyDown(code) {
    return this.keyDown === code
  }

  requestClean() {
    clearTimeout(this.requestTimer)
    this.requestTimer = setTimeout(() => {
      this.keyDown = null
      this.sequence = []
      clearTimeout(this.requestTimer)
    }, 4000)
  }

  makeObservable() {
    define(this, {
      sequence: observable.shallow,
      keyDown: observable.ref,
      handleKeyboard: action
    })
  }
}
