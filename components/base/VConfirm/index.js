import msgboxVue from './main.vue'
import Vue from 'vue'
const MessageBoxConstructor = Vue.extend(msgboxVue)

let currentMsg, instance
const defaultCallback = action => {
  if (currentMsg) {
    let callback = currentMsg.callback
    if (typeof callback === 'function') {
      callback(action)
    }
    if (currentMsg.resolve) {
      if (action === 'confirm') {
        currentMsg.resolve(action)
      } else if (currentMsg.reject && action === 'cancel') {
        currentMsg.reject(action)
      }
      // 清除之前的内容
      let $el = instance?.$el
      $el.parentNode.removeChild($el)
      instance = null
    }
  }
}
const MessageBox = function (options, callback) {
  if (typeof options === 'string') {
    options = {
      message: options
    }
    if (typeof arguments[1] === 'string') {
      options.title = arguments[1]
    }
  } else if (options.callback && !callback) {
    callback = options.callback
  }
  if (typeof Promise !== 'undefined') {
    return new Promise((resolve, reject) => {
      currentMsg = {
        options: Object.assign({}, options),
        callback: callback,
        resolve: resolve,
        reject: reject
      }

      showNextMsg()
    })
  } else {
    currentMsg = {
      options: Object.assign({}, options),
      callback: callback
    }
    showNextMsg()
  }
}
const showNextMsg = () => {
  if (!instance) {
    instance = new MessageBoxConstructor({
      el: document.createElement('div')
    })
  }
  instance.action = ''
  let options = currentMsg.options
  for (let prop in options) {
    if (options[prop]) {
      instance[prop] = options[prop]
    }
  }
  if (options.callback === undefined) {
    instance.callback = defaultCallback
  }
  document.body.appendChild(instance.$el)

  Vue.nextTick(() => {
    instance.visible = true
  })
}

MessageBox.confirm = (message, title, options) => {
  if (typeof title === 'object') {
    options = title
    title = ''
  } else if (title === undefined) {
    title = ''
  }
  return MessageBox(
    Object.assign(
      {
        title: title,
        message: message,
        $type: 'confirm',
        showCancelButton: true
      },
      options
    )
  )
}

export default MessageBox
export { MessageBox }
