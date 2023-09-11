<template>
  <div class="flex-fill p-4 bg-white rounded-4">
    <div class="bg-box pt-10 pl-10">
      <span class="fs-4 fw-bold font-color-dark">为您提供专业的服务支持</span>
    </div>
    <div class="mt-6 fs-5 fw-bold font-color-dark">联系方式</div>
    <ul class="flex justify-content-between mt-6 fs-8">
      <li class="p-4 border rounded-2 flex-fill">
        <div class="fs-7">在线咨询</div>
        <ElButton type="primary" class="mt-2" size="mini" @click="loadChat">立即对话</ElButton>
        <div class="mt-2 font-color-sslight">工作日 09:00 - 20:00 节假日 09:00 - 18:00</div>
      </li>
      <li class="p-4 border rounded-2 ml-4 flex-fill">
        <div class="fs-7">邮箱</div>
        <ElButton type="text" class="mt-2" size="mini">team@tapdata.io</ElButton>
        <div class="mt-2 font-color-sslight">为您提供产品配置指导、问题排查等技术支持</div>
      </li>
      <li class="p-4 border rounded-2 ml-4 flex-fill">
        <div class="fs-7">企业微信</div>
        <ElTooltip placement="top" effect="light" popper-class="contact-us-enterprise-wechat shadow p-0">
          <ElButton type="primary" class="mt-2" size="mini">联系我们</ElButton>
          <template #content>
            <div class="px-4 py-5 text-center rounded-4">
              <ElImage :src="require('@/assets/image/enterprise-wechat-code.png')" class="code-image mb-2"></ElImage>
              <div>扫码添加客服微信</div>
            </div>
          </template>
        </ElTooltip>
        <!--        <ElButton type="primary" class="mt-2" size="mini">联系我们</ElButton>-->
        <div class="mt-2 font-color-sslight">为您提供产品配置指导、问题排查等技术支持</div>
      </li>
      <li class="p-4 border rounded-2 ml-4 flex-fill">
        <div class="fs-7">电话咨询</div>
        <ElButton type="text" class="mt-2" size="mini">0755-26656080-3</ElButton>
        <div class="mt-2 font-color-sslight">工作日 09:00 - 20:00 节假日 09:00 - 18:00</div>
      </li>
    </ul>
    <div class="mt-6 fs-5 fw-bold font-color-dark">更多服务</div>
    <ul class="flex justify-content-between mt-6">
      <li class="p-4 border rounded-2 flex-fill">
        <div class="font-color-dark">我的工单</div>
        <div type="primary" class="mt-2 fs-8" size="mini">提交工单解决问题</div>
        <ElLink type="primary" class="mt-2 font-color-sslight" @click="goTicketSystem">创建工单</ElLink>
      </li>
      <li class="p-4 border rounded-2 ml-4 flex-fill">
        <div class="font-color-dark">产品文档</div>
        <div type="primary" class="mt-2 fs-8" size="mini">提供产品介绍、使用指导、等</div>
        <ElLink type="primary" class="mt-2 font-color-sslight" @click="handleDocs">查看文档</ElLink>
      </li>
      <!--      <li class="p-4 border rounded-2 ml-4 flex-fill">-->
      <!--        <div class="font-color-dark">社区</div>-->
      <!--        <div type="primary" class="mt-2 fs-8" size="mini">提供云上技术学习、信息交流的平台</div>-->
      <!--        <ElLink type="primary" class="mt-2 font-color-sslight">进入社区</ElLink>-->
      <!--      </li>-->
    </ul>
  </div>
</template>

<script>
import i18n from '@/i18n'
import { downloadBlob, downloadJson, openUrl } from '@tap/shared'

export default {
  name: 'Center',
  inject: ['buried'],
  data() {
    return {}
  },
  methods: {
    goTicketSystem() {
      this.$router.push({
        name: 'TicketSystem'
      })
    },
    loadChat() {
      let $zoho = $zoho || {}
      const { isDomesticStation } = this
      $zoho.salesiq = $zoho.salesiq || {
        widgetcode: isDomesticStation
          ? '39c2c81d902fdf4fbcc9b55f1268168c6d58fe89b1de70d9adcb5c4c13d6ff4d604d73c57c92b8946ff9b4782f00d83f'
          : 'siqc6975654b695513072e7c944c1b63ce0561c932c06ea37e561e3a2f7fe5ae1f7',
        values: {},
        ready: function () {}
      }
      window.$zoho = $zoho
      let d = document
      let s = d.createElement('script')
      s.type = 'text/javascript'
      s.id = 'zsiqscript'
      s.defer = true
      s.src = isDomesticStation ? 'https://salesiq.zoho.com.cn/widget' : 'https://salesiq.zohopublic.com/widget'
      let t = d.getElementsByTagName('script')[0]
      t.parentNode.insertBefore(s, t)
      this.hideCustomTip()

      $zoho.salesiq.ready = function () {
        const user = window.__USER_INFO__
        $zoho.salesiq.visitor.contactnumber(user.telephone)
        $zoho.salesiq.visitor.info({
          tapdata_username: user.nickname || user.username,
          tapdata_phone: user.telephone,
          tapdata_email: user.email
        })

        $zoho.salesiq.onload = function () {
          let siqiframe = document.getElementById('siqiframe')

          if (siqiframe) {
            let style = document.createElement('style')
            style.type = 'text/css'
            style.innerHTML = `.botactions em { white-space: nowrap; }`
            siqiframe.contentWindow.document.getElementsByTagName('head').item(0).appendChild(style)
          }
        }
      }
    },
    hideCustomTip() {
      setTimeout(() => {
        let tDom = document.getElementById('titlediv')
        if (tDom) {
          tDom.style.display = 'none'
        } else {
          this.hideCustomTip()
        }
      }, 5000)
    },
    handleDocs() {
      openUrl('https://docs.tapdata.net/cloud/what-is-tapdata-cloud')
    }
  }
}
</script>

<style lang="scss">
.contact-us-enterprise-wechat {
  &.is-light {
    border-color: #fff;
    .popper__arrow {
      display: none;
    }
  }
}
</style>

<style lang="scss" scoped>
.bg-box {
  height: 120px;
  background: #f1fbfe url('../../assets/image/contact-us-bg.png') right center no-repeat;
}
.code-image {
  width: 92px;
  height: 92px;
}
</style>
