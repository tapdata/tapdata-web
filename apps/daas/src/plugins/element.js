import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/theme-chalk/src/message.scss'

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

export const install = (app) => {
  // app.use(ElementPlus, { i18n: i18n.global.t })
  app.use(ElLoading)
  app.use(ElMessage)
  app.use(ElMessageBox)
}

// TODO 可能需要重写适配
/*
window.$vueApp.config.globalProperties.$message = Message

window.$vueApp.config.globalProperties.$msgbox = MessageBox
window.$vueApp.config.globalProperties.$alert = MessageBox.alert

window.$vueApp.config.globalProperties.$prompt = MessageBox.prompt
window.$vueApp.config.globalProperties.$loading = Loading.service
window.$vueApp.config.globalProperties.$notify = Notification
window.loading = Loading.service
window.$vueApp.use(Loading.directive)*/
