import { Notification, MessageBox } from 'element-plus'
import i18n from '@tap/i18n'
import { buried } from '@/plugins/buried'
import './index.scss'
import { tipManager } from '../storage'

function renderUpgrade(h) {
  return (
    <div>
      <div class="flex align-center gap-1 mb-5">
        <el-image class="flex-shrink-0" src={require('@/assets/image/version-rocket.svg')}></el-image>
        <span class="el-dialog__title">{i18n.t('dfs_service_upgrade_notice')}</span>
      </div>
      {i18n.locale === 'en' ? (
        <div class="lh-base">
          <p>Dear User,</p>
          <p>
            To further enhance your experience, we plan to upgrade the TapData Cloud service. The upgrade schedule is as
            follows:
          </p>

          <div class="p-3 bg-subtle rounded-lg mt-4">
            <p class="fw-sub font-color-dark">Upgrade Time:</p>
            <p class="text-primary">July 25, 2024 (Thursday), 20:00 - 22:00</p>

            <p class="fw-sub font-color-dark mt-2">Impact Notice:</p>
            <p>
              Under normal circumstances, this upgrade will not affect the operation of tasks. If a task error occurs,
              you can try restarting the task. If you encounter service access issues during the upgrade, please try
              refreshing the page. If the problem persists, please contact our technical support team for assistance.
            </p>

            <p class="fw-sub font-color-dark mt-2">Contact Information:</p>
            <p>
              Technical Support Email:
              <a class="text-primary" href="mailto:team@tapdata.io">
                team@tapdata.io
              </a>
            </p>
            <p>Thank you for your understanding and support of TapData Cloud!</p>
          </div>
        </div>
      ) : (
        <div class="lh-base">
          <p>尊敬的用户：</p>
          <p>为了进一步提升您的使用体验，我们计划对 TapData Cloud 进行服务升级。具体升级时间安排如下：</p>

          <div class="p-3 bg-subtle rounded-lg mt-4">
            <p class="fw-sub font-color-dark">升级时间：</p>
            <p class="text-primary">2024年7月25日 20:00 - 22:00</p>

            <p class="fw-sub font-color-dark mt-3">影响说明：</p>
            <p>
              正常情况下，此次升级不会影响任务的正常运行。如遇任务出错，您可以尝试重新启动任务。若在升级期间遇到访问服务异常的情况，请尝试刷新页面重试。如问题仍未解决，敬请随时联系我们的技术支持团队获取协助。
            </p>

            <p class="fw-sub font-color-dark mt-3">联系方式：</p>
            <p>
              技术支持邮箱：
              <a class="text-primary" href="mailto:team@tapdata.io">
                team@tapdata.io
              </a>
            </p>
            <p>技术支持热线：0755-26656080</p>
            <p>感谢您对 TapData Cloud 的理解与支持！</p>
          </div>
        </div>
      )}
    </div>
  )
}

export function UpgradeNotice(Vue) {
  if (!tipManager.shouldShowTip('serviceUpgrade')) return

  let ins
  const h = Vue.$createElement // 防止 [Vue warn]: `createElement()` has been called outside of render function.
  const message = (
    <div class="flex align-items-start gap-2 ml-n3 mr-n2">
      <el-image class="flex-shrink-0" src={require('@/assets/image/version-rocket.svg')}></el-image>
      <div class="flex flex-column align-items-start gap-2 text-start">
        <span class="text-primary fs-6 fw-sub lh-base">{i18n.t('dfs_service_upgrade_notice')}</span>
        <span class="text-prewrap">{i18n.t('dfs_service_upgrade_notice_content')}</span>
        <el-button
          class="ml-auto"
          type="primary"
          size="mini"
          onClick={() => {
            buried('service_upgrade_notice_view')
            UpgradeDialog(Vue)
            ins?.close()
          }}
        >
          {i18n.t('public_button_check')}
        </el-button>
      </div>
    </div>
  )

  ins = Notification({
    customClass: 'version-upgrade-notification',
    title: '',
    message,
    duration: 0,
    position: 'bottom-right',
    onClose: () => {
      buried('service_upgrade_notice_close')
      tipManager.showTip('serviceUpgrade')
    }
  })
}

export function UpgradeDialog(Vue) {
  MessageBox({
    title: '',
    showClose: true,
    customClass: 'service-upgrade-dialog rounded-lg',
    message: renderUpgrade(Vue.$createElement),
    confirmButtonText: i18n.t('public_button_close')
  })
}
