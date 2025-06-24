import { CloseIcon } from '@tap/component/src/CloseIcon'
import i18n from '@tap/i18n'
import { copyToClipboard } from '@tap/shared'
import './index.scss'

function renderDialog(stack: string) {
  return (
    <div id="error-message-dialog">
      <div class="flex align-center mb-4">
        <ElIcon class="text-lg mr-2 color-danger">
          <ElIconCircleCloseFilled />
        </ElIcon>
        <span class="fs-6 fw-sub">
          {i18n.t('packages_business_error_details')}
        </span>
      </div>
      <div
        class="mt-3 position-relative rounded-xl overflow-hidden error-stack-pre-wrap"
        style="background: #fff2f0; border: 1px solid #ffccc7"
      >
        <div class="position-absolute end-0 top-0 px-2 pt-1 error-stack-actions">
          <ElButton
            onClick={() => {
              copyToClipboard(
                stack,
                document.querySelector('#error-message-dialog'),
              )
              ElMessage.success(i18n.t('public_message_copy_success'))
            }}
            icon={ElIconCopyDocument}
            text
            type="primary"
          >
            {i18n.t('public_button_copy')}
          </ElButton>
        </div>
        <pre
          class="m-0 p-4 pt-0 mt-6 font-color-dark"
          style="max-height: 60vh; font-size: 13px; overflow-x: auto;"
        >
          {stack}
        </pre>
      </div>
    </div>
  )
}

function renderMessage(message: string, stack: string) {
  return (
    <div>
      <div class="el-message__content">
        <span class="align-middle">{message}</span>
        <ElButton
          text
          type="primary"
          class="ml-1 align-middle"
          onClick={() => {
            ErrorMessage(stack, message)
          }}
        >
          {i18n.t('public_view_details')}
        </ElButton>
      </div>
    </div>
  )
}

export function ErrorMessage(stack: string, message: string) {
  if (import.meta.env.VITE_APP_KEYWORD) {
    stack = stack.replaceAll(/tapdata\s?/gi, import.meta.env.VUE_APP_KEYWORD)
  }

  ElMessageBox({
    title: '',
    showClose: true,
    closeIcon: CloseIcon,
    customClass: ' w-80 max-w-1000',
    message: renderDialog(stack),
    confirmButtonText: i18n.t('public_button_close'),
    ...(import.meta.env.VUE_APP_PLATFORM === 'DAAS'
      ? {}
      : {
          showCancelButton: true,
          cancelButtonText: i18n.t('public_button_close'),
          confirmButtonText: i18n.t('dfs_user_contactus_chuangjiangongdan'),
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              done()
              router.push({
                name: 'TicketSystem',
                query: {
                  form: encodeURIComponent(
                    JSON.stringify({
                      subject: message,
                      description: stack,
                    }),
                  ),
                },
              })
            } else {
              done()
            }
          },
        }),
  })
}

export function showErrorMessage(error: Record<string, any>) {
  let message =
    error?.message || error?.msg || i18n.t('public_message_request_error')
  let duration = 3000
  let showClose = false

  if (error?.stack) {
    if (import.meta.env.VUE_APP_KEYWORD) {
      error.stack = error.stack.replaceAll(
        /tapdata\s?/gi,
        import.meta.env.VUE_APP_KEYWORD,
      )
    }

    message = renderMessage(message, error.stack)
    duration = 4000
    showClose = true
  }

  ElMessage.error({
    message,
    duration,
    showClose,
  })
}
