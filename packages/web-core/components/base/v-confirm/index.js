import msgboxVue from './Main.vue'
import Vue from 'vue'
const MessageBoxConstructor = Vue.extend(msgboxVue)

let currentMsg, instance

const defaults = {
  icon: '', // 图标
  iconColor: '',
  iconSize: 25,
  title: '', // 标题
  message: '', // 内容
  type: '', // 常用的几种提示类型： success、info、warning、error。不然需要自己传递 icon的属性
  iconClass: '', // 图标的类名
  titleClass: '', // 标题的类名
  messageClass: '', // 内容的类名
  showClose: true,
  center: false,
  customClass: '',
  showConfirmButton: true,
  showCancelButton: false,
  action: '',
  confirmButtonText: '',
  cancelButtonText: '',
  confirmButtonLoading: false,
  cancelButtonLoading: false,
  confirmButtonClass: '',
  confirmButtonDisabled: false,
  cancelButtonClass: '',
  dangerouslyUseHTMLString: false,
  distinguishCancelAndClose: false,
  width: '416px', // 需要完整的像素字符串
  beforeClose: null
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key)
}
function isVNode(node) {
  return node !== null && typeof node === 'object' && hasOwn(node, 'componentOptions')
}

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
    }
  }
}
const MessageBox = function (options, callback) {
  if (typeof options === 'string' || isVNode(options)) {
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
        options: Object.assign({}, defaults, options),
        callback: callback,
        resolve: resolve,
        reject: reject
      }
      showNextMsg()
    })
  } else {
    currentMsg = {
      options: Object.assign({}, defaults, options),
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
    if (window.hasOwnProperty.call(options, prop)) {
      instance[prop] = options[prop]
    }
  }
  if (isVNode(instance.message)) {
    instance.$slots.default = [instance.message]
    instance.message = ' '
  } else {
    delete instance.$slots.default
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
  if (title && typeof title === 'object') {
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
