import { action, define, observable } from '@formily/reactive'

export const ScreenType = {
  PC: 'PC',
  Responsive: 'Responsive',
  Mobile: 'Mobile',
}

export class Screen {
  type
  scale = 1
  width
  height
  engine
  background = ''
  flip = false
  constructor(engine) {
    this.engine = engine
    this.type = engine.props.defaultScreenType
    this.makeObservable()
  }

  makeObservable() {
    define(this, {
      type: observable.ref,
      scale: observable.ref,
      width: observable.ref,
      height: observable.ref,
      flip: observable.ref,
      background: observable.ref,
      setType: action,
      setScale: action,
      setSize: action,
      resetSize: action,
      setBackground: action,
      setFlip: action,
    })
  }

  setType(type) {
    this.type = type
  }

  setScale(scale) {
    this.scale = scale
  }

  setSize(width, height) {
    if (width) {
      this.width = width
    }
    if (height) {
      this.height = height
    }
  }

  resetSize() {
    this.width = '100%'
    this.height = '100%'
  }

  setBackground(background) {
    this.background = background
  }

  setFlip(flip) {
    this.flip = flip
  }
}
