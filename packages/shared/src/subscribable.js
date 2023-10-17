import { isFn } from './types'

const UNSUBSCRIBE_ID_SYMBOL = Symbol('UNSUBSCRIBE_ID_SYMBOL')

export class Subscribable {
  #subscribers = {
    index: 0
  }

  dispatch(event, context) {
    let interrupted = false
    for (const key in this.#subscribers) {
      if (isFn(this.#subscribers[key])) {
        event['context'] = context
        if (this.#subscribers[key](event) === false) {
          interrupted = true
        }
      }
    }
    return interrupted ? false : true
  }

  subscribe(subscriber) {
    let id
    if (isFn(subscriber)) {
      id = this.#subscribers.index + 1
      this.#subscribers[id] = subscriber
      this.#subscribers.index++
    }

    const unsubscribe = () => {
      this.unsubscribe(id)
    }

    unsubscribe[UNSUBSCRIBE_ID_SYMBOL] = id

    return unsubscribe
  }

  unsubscribe = id => {
    if (id === undefined || id === null) {
      for (const key in this.#subscribers) {
        this.unsubscribe(key)
      }
      return
    }
    if (!isFn(id)) {
      delete this.#subscribers[id]
    } else {
      delete this.#subscribers[id[UNSUBSCRIBE_ID_SYMBOL]]
    }
  }
}
