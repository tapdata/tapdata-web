import { Subscribable } from './subscribable'
import { isArr, isWindow } from './types'

const ATTACHED_SYMBOL = Symbol('ATTACHED_SYMBOL')
const EVENTS_SYMBOL = Symbol('__EVENTS_SYMBOL__')
const EVENTS_ONCE_SYMBOL = Symbol('EVENTS_ONCE_SYMBOL')
const EVENTS_BATCH_SYMBOL = Symbol('EVENTS_BATCH_SYMBOL')
const DRIVER_INSTANCES_SYMBOL = Symbol('DRIVER_INSTANCES_SYMBOL')

const isOnlyMode = (mode) =>
  mode === 'onlyOne' || mode === 'onlyChild' || mode === 'onlyParent'
/**
 * 事件驱动器基类
 */
export class EventDriver {
  engine

  container

  contentWindow

  context

  constructor(engine, context) {
    this.engine = engine
    this.context = context
  }

  dispatch(event) {
    return this.engine.dispatch(event, this.context)
  }

  subscribe(subscriber) {
    return this.engine.subscribe(subscriber)
  }

  subscribeTo(type, subscriber) {
    return this.engine.subscribeTo(type, subscriber)
  }

  subscribeWith(type, subscriber) {
    return this.engine.subscribeWith(type, subscriber)
  }

  attach() {
    console.error('attach must implement.')
  }

  detach() {
    console.error('attach must implement.')
  }

  eventTarget(type) {
    if (
      (type === 'resize' || type === 'scroll') &&
      this.container === this.contentWindow?.document
    ) {
      return this.contentWindow
    }
    return this.container
  }

  addEventListener(type, listener, options) {
    const target = this.eventTarget(type)
    if (isOnlyMode(options?.mode)) {
      target[EVENTS_ONCE_SYMBOL] = target[EVENTS_ONCE_SYMBOL] || {}
      const constructor = this.constructor
      constructor[EVENTS_ONCE_SYMBOL] = constructor[EVENTS_ONCE_SYMBOL] || {}
      const handler = target[EVENTS_ONCE_SYMBOL][type]
      const container = constructor[EVENTS_ONCE_SYMBOL][type]
      if (!handler) {
        if (container) {
          if (options.mode === 'onlyChild') {
            if (container.contains(target)) {
              container.removeEventListener(
                type,
                container[EVENTS_ONCE_SYMBOL][type],
                options,
              )
              delete container[EVENTS_ONCE_SYMBOL][type]
            }
          } else if (
            options.mode === 'onlyParent' &&
            container.contains(target)
          )
            return
        }
        target.addEventListener(type, listener, options)
        target[EVENTS_ONCE_SYMBOL][type] = listener
        constructor[EVENTS_ONCE_SYMBOL][type] = target
      }
    } else {
      target[EVENTS_SYMBOL] = target[EVENTS_SYMBOL] || {}
      target[EVENTS_SYMBOL][type] = target[EVENTS_SYMBOL][type] || new Map()
      if (!target[EVENTS_SYMBOL][type]?.get?.(listener)) {
        target.addEventListener(type, listener, options)
        target[EVENTS_SYMBOL][type]?.set?.(listener, true)
      }
    }
  }

  removeEventListener(type, listener, options) {
    const target = this.eventTarget(type)
    if (isOnlyMode(options?.mode)) {
      const constructor = this.constructor
      constructor[EVENTS_ONCE_SYMBOL] = constructor[EVENTS_ONCE_SYMBOL] || {}
      target[EVENTS_ONCE_SYMBOL] = target[EVENTS_ONCE_SYMBOL] || {}
      delete constructor[EVENTS_ONCE_SYMBOL][type]
      delete target[EVENTS_ONCE_SYMBOL][type]
      target.removeEventListener(type, listener, options)
    } else {
      target[EVENTS_SYMBOL] = target[EVENTS_SYMBOL] || {}
      target[EVENTS_SYMBOL][type] = target[EVENTS_SYMBOL][type] || new Map()
      target[EVENTS_SYMBOL][type]?.delete?.(listener)
      target.removeEventListener(type, listener, options)
    }
  }

  batchAddEventListener(type, listener, options) {
    this.engine[DRIVER_INSTANCES_SYMBOL] =
      this.engine[DRIVER_INSTANCES_SYMBOL] || []
    if (!this.engine[DRIVER_INSTANCES_SYMBOL].includes(this)) {
      this.engine[DRIVER_INSTANCES_SYMBOL].push(this)
    }
    this.engine[DRIVER_INSTANCES_SYMBOL].forEach((driver) => {
      const target = driver.eventTarget(type)
      target[EVENTS_BATCH_SYMBOL] = target[EVENTS_BATCH_SYMBOL] || {}
      if (!target[EVENTS_BATCH_SYMBOL][type]) {
        target.addEventListener(type, listener, options)
        target[EVENTS_BATCH_SYMBOL][type] = listener
      }
    })
  }

  batchRemoveEventListener(type, listener, options) {
    this.engine[DRIVER_INSTANCES_SYMBOL] =
      this.engine[DRIVER_INSTANCES_SYMBOL] || []
    this.engine[DRIVER_INSTANCES_SYMBOL].forEach((driver) => {
      const target = driver.eventTarget(type)
      target[EVENTS_BATCH_SYMBOL] = target[EVENTS_BATCH_SYMBOL] || {}
      target.removeEventListener(type, listener, options)
      delete target[EVENTS_BATCH_SYMBOL][type]
    })
  }
}
/**
 * 事件引擎
 */
export class Event extends Subscribable {
  #drivers = []
  #containers = []
  constructor(props) {
    super()
    if (isArr(props?.effects)) {
      props.effects.forEach((plugin) => {
        plugin(this)
      })
    }
    if (isArr(props?.drivers)) {
      this.#drivers = props.drivers
    }
  }

  subscribeTo(type, subscriber) {
    return this.subscribe((event) => {
      if (type && event instanceof type) {
        return subscriber(event)
      }
    })
  }

  subscribeWith(type, subscriber) {
    return this.subscribe((event) => {
      if (isArr(type)) {
        if (type.includes(event?.type)) {
          return subscriber(event)
        }
      } else if (type && event?.type === type) {
        return subscriber(event)
      }
    })
  }

  attachEvents(container, contentWindow, context) {
    if (!container) return
    if (isWindow(container)) {
      return this.attachEvents(container.document, container, context)
    }
    if (container[ATTACHED_SYMBOL]) return

    container[ATTACHED_SYMBOL] = this.#drivers.map((EventDriver) => {
      const driver = new EventDriver(this, context)
      driver.contentWindow = contentWindow
      driver.container = container
      driver.attach(container)
      return driver
    })
    if (!this.#containers.includes(container)) {
      this.#containers.push(container)
    }
  }

  detachEvents(container) {
    if (!container) {
      this.#containers.forEach((container) => {
        this.detachEvents(container)
      })
      return
    }
    if (isWindow(container)) {
      return this.detachEvents(container.document)
    }
    if (!container[ATTACHED_SYMBOL]) return
    container[ATTACHED_SYMBOL].forEach((driver) => {
      driver.detach(container)
    })

    this[DRIVER_INSTANCES_SYMBOL] = this[DRIVER_INSTANCES_SYMBOL] || []
    this[DRIVER_INSTANCES_SYMBOL] = this[DRIVER_INSTANCES_SYMBOL].reduce(
      (drivers, driver) => {
        if (driver.container === container) {
          driver.detach(container)
          return drivers
        }
        return drivers.concat(driver)
      },
      [],
    )
    this.#containers = this.#containers.filter((item) => item !== container)
    delete container[ATTACHED_SYMBOL]
    delete container[EVENTS_SYMBOL]
    delete container[EVENTS_ONCE_SYMBOL]
    delete container[EVENTS_BATCH_SYMBOL]
  }
}

const eventRegistryMap = new WeakMap()

function getRegistry(instance) {
  let events = eventRegistryMap.get(instance)
  if (!events) {
    eventRegistryMap.set(instance, (events = Object.create(null)))
  }
  return events
}

export function $on(instance, event, fn) {
  if (Array.isArray(event)) {
    event.forEach((e) => $on(instance, e, fn))
  } else {
    const events = getRegistry(instance)
    ;(events[event] || (events[event] = [])).push(fn)
  }
  return instance
}

export function $once(instance, event, fn) {
  const wrapped = (...args) => {
    $off(instance, event, wrapped)
    fn.call(instance, ...args)
  }
  wrapped.fn = fn
  $on(instance, event, wrapped)
  return instance
}

export function $off(instance, event, fn) {
  const vm = instance
  // all
  if (!event) {
    eventRegistryMap.set(instance, Object.create(null))
    return vm
  }
  // array of events
  if (Array.isArray(event)) {
    event.forEach((e) => $off(instance, e, fn))
    return vm
  }
  // specific event
  const events = getRegistry(instance)
  const cbs = events[event]
  if (!cbs) {
    return vm
  }
  if (!fn) {
    events[event] = undefined
    return vm
  }
  events[event] = cbs.filter((cb) => cb !== fn && cb.fn !== fn)
  return vm
}

export function $emit(instance, event, ...args) {
  instance && instance.$emit && instance.$emit(event, ...args)
  const cbs = getRegistry(instance)[event]
  if (cbs) {
    cbs.map((cb) => cb.apply(instance, args))
  }
  return instance
}
