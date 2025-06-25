import {
  ElCollapseItem,
  ElDialog,
  ElDrawer,
  ElDropdown,
  ElLoading,
  ElMessage,
  ElMessageBox,
  ElNotification,
  ElSelect,
  ElSelectV2,
} from 'element-plus'
import { CloseBoldOutlined } from './CloseBoldOutlined'
import { CloseIcon } from './CloseIcon'
import { DownBoldOutlined } from './DownBoldOutlined'
import { Modal } from './modal'
import { RightBoldOutlined } from './RightBoldOutlined'
// import 'element-plus/theme-chalk/src/message.scss'
// import 'element-plus/theme-chalk/src/message-box.scss'
// import 'element-plus/theme-chalk/src/notification.scss'

export const installElement = (app) => {
  app.use(ElLoading)
  app.use(ElMessage)
  app.use(ElMessageBox)
  app.use(ElNotification)

  app.config.globalProperties.$confirm = Modal.confirm

  // 隐藏箭头后的offset
  const getDefault = () => {
    return {
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

  ElDialog.props.closeIcon.default = CloseIcon
  ElDrawer.props.closeIcon.default = CloseIcon
  ElSelect.props.popperOptions.default = getDefault
  ElSelect.props.suffixIcon.default = DownBoldOutlined
  ElSelectV2.props.popperOptions.default = getDefault
  ElSelectV2.props.clearIcon.default = CloseBoldOutlined
  ElSelectV2.props.suffixIcon.default = DownBoldOutlined
  ElDropdown.props.popperOptions.default = getDefault
  ElCollapseItem.props.icon.default = RightBoldOutlined
}
