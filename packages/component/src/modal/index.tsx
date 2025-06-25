import i18n from '@tap/i18n'
import { ElMessageBox, type ElMessageBoxOptions } from 'element-plus'
import { isFunction, isObject } from 'lodash-es'
import { isVNode, type AppContext, type VNode } from 'vue'
import { CloseIcon } from '../CloseIcon'

export const TypeComponentsMap = {
  primary: IconMingcuteInformationFill,
  success: IconMingcuteCheckCircleFill,
  warning: IconMingcuteWarningFill,
  error: IconMingcuteCloseCircleFill,
  info: IconMingcuteInformationFill,
}

const TYPES = ['confirm', 'success', 'warning', 'error', 'info']

const renderContent = (options) => {
  const IconComponent = options.icon ?? TypeComponentsMap[options.type]

  return (
    <div class="modal-confirm-body flex gap-4">
      <ElIcon
        size={24}
        class={`el-message-box__status el-message-box-icon--${options.type}`}
      >
        <IconComponent />
      </ElIcon>
      <div class="modal-confirm-paragraph flex flex-column gap-2 lh-base">
        {options.title && (
          <div class="modal-confirm-title fs-6 fw-sub">
            {isFunction(options.title) ? options.title() : options.title}
          </div>
        )}
        {options.dangerouslyUseHTMLString ? (
          <div
            class="modal-confirm-content"
            style={!options.title && 'margin-top: 1px'}
            innerHTML={options.message}
          />
        ) : (
          <div
            class="modal-confirm-content"
            style={!options.title && 'margin-top: 1px'}
          >
            {isFunction(options.message) ? options.message() : options.message}
          </div>
        )}
      </div>
    </div>
  )
}

const createModal = (type: string) => {
  return (
    title: string | VNode | (() => VNode) | ElMessageBoxOptions,
    message: string | VNode,
    options?: ElMessageBoxOptions,
    appContext?: AppContext | null,
  ) => {
    let titleOrOpts: string | VNode | (() => VNode) = ''
    let messageOrOpts: string | VNode | (() => VNode) = ''

    type = type === 'info' ? 'primary' : type

    const TYPE_MAP = {
      confirm: 'warning',
      info: 'primary',
    }

    if (isVNode(title)) {
      titleOrOpts = title
    } else if (isVNode(message)) {
      titleOrOpts = title as string
      messageOrOpts = message
    } else if (isObject(title)) {
      options = title as ElMessageBoxOptions
    } else if (isObject(message)) {
      options = message as ElMessageBoxOptions
      titleOrOpts = title
      messageOrOpts = options.message
    } else {
      titleOrOpts = title as string
      messageOrOpts = message as string
    }

    const opts = Object.assign(
      {
        title: titleOrOpts,
        message: messageOrOpts,
        showClose: false,
        closeOnClickModal: false,
        showCancelButton: type === 'confirm',
        confirmButtonText: i18n.t('public_button_confirm'),
        cancelButtonText: i18n.t(
          type === 'confirm' ? 'public_button_cancel' : 'public_button_ok',
        ),
        type: TYPE_MAP[type] || type,
        appContext,
        closeIcon: CloseIcon,
      },
      options,
    )

    return ElMessageBox(
      Object.assign({}, opts, {
        type: undefined,
        title: '',
        message: renderContent(opts),
      }),
    ).catch(() => false)
  }
}

const Modal = TYPES.reduce(
  (acc, type) => {
    acc[type] = createModal(type)
    return acc
  },
  {} as Record<
    string,
    (
      title: string | VNode | (() => VNode) | ElMessageBoxOptions,
      message?: string | VNode,
      options?: ElMessageBoxOptions,
      appContext?: AppContext | null,
    ) => Promise<any>
  >,
)

export { Modal }
