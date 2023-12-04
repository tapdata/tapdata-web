import { ElLoading, ElMessage, ElMessageBox, ElDialog, ElSelect, ElDropdown } from 'element-plus'
import 'element-plus/theme-chalk/src/message.scss'
import { CloseIcon } from './CloseIcon'

// TODO 可能需要重写适配
/*const showMessage = Symbol('showMessage')

class MessageConstructor {
  constructor() {
    const types = ['success', 'warning', 'info', 'error']
    types.forEach(type => {
      this[type] = options => this[showMessage](type, options)
    })
  }

  [showMessage](type, options) {
    const domList = document.getElementsByClassName('el-message')

    if (!domList.length) {
      return _Message[type](options)
    } else {
      let canShow = true
      const message = typeof options === 'string' ? options : options.message
      for (const dom of domList) {
        if (message === dom.innerText) {
          console.log(i18n.t('dfs_plugins_element_chongfuxiaoxi'), dom) // eslint-disable-line
          canShow = false
          break
        }
      }
      if (canShow) {
        return _Message[type](options)
      }
    }
  }
}

export const Message = new MessageConstructor()*/

export const installElement = (app) => {
  app.use(ElLoading)
  app.use(ElMessage)
  app.use(ElMessageBox)

  ElDialog.props.closeIcon.default = CloseIcon

  // 隐藏箭头后的offset
  ElSelect.props.popperOptions.default = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 4],
        },
      },
    ],
  }
  // 隐藏箭头后的offset
  ElDropdown.props.popperOptions.default = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 4],
        },
      },
    ],
  }
}
