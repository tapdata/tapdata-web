import { t } from '@tap/i18n'
import { isFunction, isObject } from 'lodash-es'
import { h, isVNode, type AppContext, type Component, type VNode } from 'vue'
import { CloseIcon } from '../CloseIcon'
import type { ElMessageBoxOptions } from 'element-plus'

const TYPES = ['confirm', 'success', 'warning', 'error', 'info'] as const

// Derive the modal type from the TYPES array
type ModalTypeFromArray = (typeof TYPES)[number]

// Define the icon component type
type IconComponent = Component

// Define the modal types for TypeComponentsMap (subset of TYPES)
type ModalType = 'primary' | 'success' | 'warning' | 'error' | 'info'

export const TypeComponentsMap: Record<ModalType, IconComponent> = {
  primary: IconMingcuteInformationFill,
  success: IconMingcuteCheckCircleFill,
  warning: IconMingcuteWarningFill,
  error: IconMingcuteCloseCircleFill,
  info: IconMingcuteInformationFill,
}

// Extend ElMessageBoxOptions to include our custom type
interface ExtendedMessageBoxOptions extends ElMessageBoxOptions {
  type?: ModalType
}

const renderContent = (options: ExtendedMessageBoxOptions) => {
  const IconComponent =
    options.icon ??
    (options.type ? TypeComponentsMap[options.type] : TypeComponentsMap.primary)

  return (
    <div class="modal-confirm-body flex gap-4">
      <ElIcon
        size={24}
        class={`el-message-box__status el-message-box-icon--${options.type}`}
      >
        {IconComponent && h(IconComponent)}
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
            innerHTML={options.message as string}
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

// Define the function parameter types
type ModalTitle = string | VNode | (() => VNode) | ElMessageBoxOptions
type ModalMessage = string | VNode | undefined

const createModal = (type: string) => {
  return (
    title: ModalTitle,
    message?: ModalMessage,
    options?: ElMessageBoxOptions,
    appContext?: AppContext | null,
  ) => {
    let titleOrOpts: string | VNode | (() => VNode) = ''
    let messageOrOpts: string | VNode | (() => VNode) = ''

    type = type === 'info' ? 'primary' : type

    const TYPE_MAP: Record<string, string> = {
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
      messageOrOpts = options.message || ''
    } else {
      titleOrOpts = title as string
      messageOrOpts = (message as string) || ''
    }

    const opts: ExtendedMessageBoxOptions = Object.assign(
      {
        title: titleOrOpts,
        message: messageOrOpts,
        showClose: false,
        closeOnClickModal: false,
        showCancelButton: type === 'confirm',
        confirmButtonText: t('public_button_confirm'),
        cancelButtonText: t(
          type === 'confirm' ? 'public_button_cancel' : 'public_button_ok',
        ),
        type: (TYPE_MAP[type] || type) as ModalType,
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
    ModalTypeFromArray,
    (
      title: ModalTitle,
      message?: ModalMessage,
      options?: ElMessageBoxOptions,
      appContext?: AppContext | null,
    ) => Promise<any>
  >,
)

export { Modal }
