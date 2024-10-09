import { MessageBox } from 'element-ui'
import i18n from '@tap/i18n'
import './index.scss'

function renderUpgrade(h) {
  return (
    <div>
      <div class="flex align-center gap-1 mb-5">
        <span class="el-dialog__title">客户满意度问卷调研</span>
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
          <p style="text-indent: 2em">
            感谢您一直以来对 TapData Cloud
            的信任与支持！为了帮助我们更好地了解您的需求并持续改进服务，我们诚挚邀请您参与本次问卷调查。完成问卷的用户将有机会获得
            TapData Cloud 专属优惠券 或 免费流量包 作为感谢。
          </p>

          <el-image
            class="my-4 align-top rounded-lg cursor-p"
            src={require('@/assets/image/customer_survey.png')}
          ></el-image>

          <p class="text-end">TapData Cloud</p>
        </div>
      )}
    </div>
  )
}

export function CustomerSurvey(Vue) {
  MessageBox({
    title: '',
    showClose: false,
    customClass: 'customer-survey-dialog rounded-lg',
    message: renderUpgrade(Vue.$createElement),
    confirmButtonText: i18n.t('public_button_close')
  })
}
