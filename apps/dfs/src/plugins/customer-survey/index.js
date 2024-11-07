import { MessageBox } from 'element-ui'
import i18n from '@tap/i18n'
import './index.scss'
import { tipManager } from '../storage'
import { buried } from '../buried'

function renderUpgrade(h) {
  const openForm = url => {
    MessageBox.close()
    window.open(url, '_blank')
    tipManager.showTip('CustomerSurvey')
    buried('click-customer-survey')
  }

  const close = () => {
    tipManager.showTip('CustomerSurvey')
    MessageBox.close()
  }

  return i18n.locale === 'en' ? (
    <div>
      <div class="flex align-center gap-1 mb-5">
        <span class="el-dialog__title">Customer Satisfaction Questionnaire Survey</span>
      </div>
      <div class="lh-base">
        <p>Dear User,</p>
        <p style="text-indent: 2em">
          Thank you for your trust and support of TapData Cloud! To better understand your needs and continuously
          improve our services, we kindly invite you to participate in this survey. Upon completing the survey, you will
          have a chance to receive a{' '}
          <em class="highlight-text fw-sub">TapData Cloud exclusive discount coupon or free data package</em> as a token
          of our appreciation.
        </p>
        <el-image
          onClick={() => openForm('https://tapdata.mike-x.com/DRomO')}
          class="my-4 align-top rounded-lg cursor-p user-select-none user-drag-none"
          src={require('@/assets/image/customer_survey_en.png')}
        ></el-image>
        <div class="mt-2 flex align-center justify-content-end">
          <el-button onClick={close}>No longer prompting</el-button>
          <el-button onClick={() => openForm('https://tapdata.mike-x.com/DRomO')} type="primary">
            Confirm
          </el-button>
        </div>
      </div>
    </div>
  ) : (
    <div>
      <div class="flex align-center gap-1 mb-5">
        <span class="el-dialog__title">客户满意度问卷调研</span>
      </div>
      <div class="lh-base">
        <p>尊敬的用户：</p>
        <p style="text-indent: 2em">
          感谢您一直以来对 TapData Cloud
          的信任与支持！为了帮助我们更好地了解您的需求并持续改进服务，我们诚挚邀请您参与本次问卷调查。完成问卷的用户将有机会获得{' '}
          <em class="highlight-text fw-sub">TapData Cloud 专属优惠券 或 免费流量包</em> 作为感谢。
        </p>
        <el-image
          onClick={() => openForm('https://tapdata.mike-x.com/49ZAo')}
          class="my-4 align-top rounded-lg cursor-p user-select-none"
          src={require('@/assets/image/customer_survey.png')}
        ></el-image>
        <div class="mt-2 flex align-center justify-content-end">
          <el-button onClick={close}>不再提示</el-button>
          <el-button onClick={() => openForm('https://tapdata.mike-x.com/49ZAo')} type="primary">
            确认
          </el-button>
        </div>
      </div>
    </div>
  )
}

export function CustomerSurvey(Vue, needCheck) {
  if (needCheck && !tipManager.shouldShowTip('CustomerSurvey')) return

  MessageBox({
    title: '',
    showClose: true,
    closeOnClickModal: false,
    closeOnPressEscape: false,
    closeOnHashChange: false,
    customClass: 'customer-survey-dialog rounded-lg',
    message: renderUpgrade(Vue.$createElement),
    confirmButtonText: i18n.t('public_button_close')
  })
}
