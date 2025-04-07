import { h } from '@vue/composition-api'
import { MessageBox, Message } from 'element-ui'
import { VIcon } from '@tap/component'
import i18n from '@tap/i18n'
import './index.scss'
import { copyToClipboard } from '@tap/shared'

function renderDialog(h, stack) {
  return (
    <div id="error-message-dialog">
      <div class="flex align-center mb-4">
        <i class="text-lg mr-2 el-message__icon el-icon-error"></i>
        <span class="el-dialog__title">{i18n.t('packages_business_error_details')}</span>
      </div>
      <div
        class="mt-3 position-relative rounded-lg overflow-hidden error-stack-pre-wrap"
        style="background: #fff2f0; border: 1px solid #ffccc7"
      >
        <div class="position-absolute end-0 top-0 px-2 pt-1 error-stack-actions">
          <el-button
            onClick={() => {
              copyToClipboard(stack, document.getElementById('error-message-dialog'))
              Message.success(i18n.t('public_message_copy_success'))
            }}
            type="text"
            class="px-1 py-0.5 font-color-dark"
          >
            <VIcon class="mr-1">copy</VIcon>
            <span class="">{i18n.t('public_button_copy')}</span>
          </el-button>
        </div>
        <pre class="m-0 p-4 pt-0 mt-6 font-color-dark" style="max-height: 60vh; font-size: 13px; overflow-x: auto;">
          {stack}
        </pre>
      </div>
    </div>
  )
}

function renderMessage(message, stack) {
  return h('div', null, [
    h(
      'div',
      {
        class: 'el-message__content'
      },
      [
        h('span', null, message),
        h(
          'el-button',
          {
            class: 'px-1 py-0.5',
            on: {
              click: () => {
                ErrorMessage(stack, message)
              }
            },
            props: {
              type: 'text',
              size: 'mini'
            }
          },
          [i18n.t('public_view_details')]
        )
      ]
    )
  ])
}

export function ErrorMessage(stack, message) {
  if (process.env.VUE_APP_KEYWORD) {
    stack = stack.replace(/tapdata\s?/gi, process.env.VUE_APP_KEYWORD)
  }

  MessageBox({
    title: '',
    showClose: true,
    customClass: 'message-dialog w-80 max-w-1000 rounded-lg',
    message: renderDialog(h, stack),
    confirmButtonText: i18n.t('public_button_close'),
    ...(process.env.VUE_APP_PLATFORM === 'DAAS'
      ? {}
      : {
          showCancelButton: true,
          cancelButtonText: i18n.t('public_button_close'),
          confirmButtonText: i18n.t('dfs_user_contactus_chuangjiangongdan'),
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              done()
              window.App.$router.push({
                name: 'TicketSystem',
                query: {
                  form: encodeURIComponent(
                    JSON.stringify({
                      subject: message,
                      description: stack
                    })
                  )
                }
              })
            } else {
              done()
            }
          }
        })
  })
}

export function showErrorMessage(error) {
  let message = error?.message || error?.msg || i18n.t('public_message_request_error')
  let duration = 3000
  let showClose = false

  if (error?.stack) {
    if (process.env.VUE_APP_KEYWORD) {
      error.stack = error.stack.replace(/tapdata\s?/gi, process.env.VUE_APP_KEYWORD)
    }

    message = renderMessage(message, error.stack)
    duration = 4000
    showClose = true
  }

  Message.error({
    message,
    duration,
    showClose
  })
}
