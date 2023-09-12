<template>
  <div class="flex-fill p-4 bg-white rounded-4">
    <div class="bg-box pt-10 pl-10">
      <span class="fs-4 fw-bold font-color-dark">{{ $t('dfs_user_contactus_weinintigongzhuan') }}</span>
    </div>
    <div class="mt-6 fs-5 fw-bold font-color-dark">{{ $t('dfs_user_contactus_lianxifangshi') }}</div>
    <ul class="flex justify-content-between mt-6 fs-8">
      <li class="p-4 border rounded-2 flex-grow-1">
        <div class="fs-7 flex align-items-center">
          <VIcon size="20" class="mr-2 color-primary">consultation-fill</VIcon>
          <span>{{ $t('dfs_user_contactus_zaixianzixun') }}</span>
        </div>
        <ElButton type="primary" class="mt-2" size="mini" @click="openChat">{{
          $t('dfs_user_contactus_lijiduihua')
        }}</ElButton>
        <div class="mt-2 font-color-sslight">{{ $t('dfs_user_contactus_gongzuorijiejia') }}</div>
      </li>
      <li v-if="isEn" class="p-4 border rounded-2 ml-4 flex-grow-1">
        <div class="fs-7 flex align-items-center">
          <ElImage class="slack-image mr-2" :src="require('@/assets/image/slack.svg')" />
          <span>Slack</span>
        </div>
        <ElButton type="text" class="mt-2" size="mini">team@tapdata.io</ElButton>
        <div class="mt-2 font-color-sslight">{{ $t('dfs_user_contactus_weinintigongchan') }}</div>
      </li>
      <li class="p-4 border rounded-2 ml-4 flex-grow-1">
        <div class="fs-7 flex align-items-center">
          <VIcon size="20" class="mr-2 color-primary">email</VIcon>
          <span>{{ $t('dfs_user_contactus_youxiang') }}</span>
        </div>
        <ElButton type="text" class="mt-2" size="mini">team@tapdata.io</ElButton>
        <div class="mt-2 font-color-sslight">{{ $t('dfs_user_contactus_weinintigongchan') }}</div>
      </li>
      <li v-if="!isEn" class="p-4 border rounded-2 ml-4 flex-grow-1">
        <div class="fs-7 flex align-items-center">
          <VIcon size="20" class="mr-2">enterprise-wechat</VIcon>
          <span>{{ $t('dfs_user_contactus_qiyeweixin') }}</span>
        </div>
        <ElTooltip placement="top" effect="light" popper-class="contact-us-enterprise-wechat shadow p-0">
          <ElButton type="primary" class="mt-2" size="mini">{{ $t('tap_contact_us') }}</ElButton>
          <template #content>
            <div class="px-4 py-5 text-center rounded-4">
              <ElImage :src="require('@/assets/image/enterprise-wechat-code.png')" class="code-image mb-2"></ElImage>
              <div>{{ $t('dfs_user_contactus_saomatianjiake') }}</div>
            </div>
          </template>
        </ElTooltip>
        <div class="mt-2 font-color-sslight">{{ $t('dfs_user_contactus_weinintigongchan') }}</div>
      </li>
      <li v-if="!isEn" class="p-4 border rounded-2 ml-4 flex-grow-1">
        <div class="fs-7 flex align-items-center">
          <VIcon size="18" class="mr-2 color-primary">phone</VIcon>
          <span>{{ $t('dfs_user_contactus_dianhuazixun') }}</span>
        </div>
        <ElButton type="text" class="mt-2" size="mini">0755-26656080-3</ElButton>
        <div class="mt-2 font-color-sslight">{{ $t('dfs_user_contactus_gongzuorijiejia') }}</div>
      </li>
    </ul>
    <div class="mt-6 fs-5 fw-bold font-color-dark">{{ $t('dfs_user_contactus_gengduofuwu') }}</div>
    <ul class="flex justify-content-between mt-6">
      <li class="p-4 border rounded-2 flex-grow-1">
        <div class="font-color-dark">{{ $t('dfs_user_contactus_wodegongdan') }}</div>
        <div type="primary" class="mt-2 fs-8 font-color-sslight" size="mini">
          {{ $t('dfs_user_contactus_tijiaogongdanjie') }}
        </div>
        <ElLink type="primary" class="mt-2" @click="goTicketSystem">{{
          $t('dfs_user_contactus_chuangjiangongdan')
        }}</ElLink>
      </li>
      <li class="p-4 border rounded-2 ml-4 flex-grow-1">
        <div class="font-color-dark">{{ $t('workbench_guide_documentation') }}</div>
        <div type="primary" class="mt-2 fs-8 font-color-sslight" size="mini">
          {{ $t('dfs_user_contactus_tigongchanpinjie') }}
        </div>
        <ElLink type="primary" class="mt-2" @click="handleDocs">{{ $t('dfs_user_contactus_chakanwendang') }}</ElLink>
      </li>
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
    return {
      isEn: i18n.locale === 'en'
    }
  },

  created() {
    this.loadChat()
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
    },

    openChat() {
      window.$zoho.salesiq.chat.start?.()
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
.slack-image {
  width: 18px;
  height: 18px;
}
li {
  width: 30%;
}
</style>
