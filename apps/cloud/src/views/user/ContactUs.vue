<script>
import { openUrl } from '@tap/shared'
import { mapGetters } from 'vuex'

import wechatCodeImg from '@/assets/image/enterprise-wechat-code.png'
import slackImg from '@/assets/image/slack.svg'

export default {
  name: 'Center',
  inject: ['buried'],

  data() {
    return {
      slackImg,
      wechatCodeImg,
    }
  },

  computed: {
    ...mapGetters(['isDomesticStation']),
  },

  methods: {
    goTicketSystem() {
      this.$router.push({
        name: 'TicketSystem',
      })
    },

    hideCustomTip() {
      setTimeout(() => {
        const tDom = document.querySelector('#titlediv')
        if (tDom) {
          tDom.style.display = 'none'
        } else {
          this.hideCustomTip()
        }
      }, 5000)
    },

    handleDocs() {
      const url = this.isDomesticStation
        ? 'https://docs.tapdata.net'
        : 'https://docs.tapdata.io'
      openUrl(url)
    },

    openChat() {
      window.$zoho.salesiq.chat.start?.()
    },

    goSlack() {
      window.open(this.$store.state.config.slackLink, '_blank')
    },
  },
}
</script>

<template>
  <div class="flex-fill p-4 bg-white rounded-lg">
    <div class="bg-box pt-10 pl-10 rounded-lg">
      <span class="fs-4 fw-bold font-color-dark">{{
        $t('dfs_user_contactus_weinintigongzhuan')
      }}</span>
    </div>
    <div class="mt-6 fs-5 fw-bold font-color-dark">
      {{ $t('dfs_user_contactus_lianxifangshi') }}
    </div>
    <ul class="flex justify-content-between mt-6 fs-8">
      <li class="p-4 border rounded-lg flex-grow-1">
        <div class="fs-6 font-color-dark flex align-items-center">
          <VIcon size="20" class="mr-2 color-primary">consultation-fill</VIcon>
          <span>{{ $t('dfs_user_contactus_zaixianzixun') }}</span>
        </div>
        <ElButton type="primary" class="mt-2" @click="openChat">{{
          $t('dfs_user_contactus_lijiduihua')
        }}</ElButton>
        <!--        <div class="mt-2 font-color-sslight">{{ $t('dfs_user_contactus_gongzuorijiejia') }}</div>-->
      </li>
      <li
        v-if="!isDomesticStation"
        class="p-4 border rounded-lg ml-4 flex-grow-1"
      >
        <div class="fs-6 flex align-items-center">
          <ElImage class="slack-image mr-2" :src="slackImg" />
          <span>Slack</span>
        </div>
        <ElButton text class="mt-2" @click="goSlack">Join Slack</ElButton>
        <div class="mt-2 font-color-sslight">
          {{ $t('dfs_user_contactus_weinintigongchan') }}
        </div>
      </li>
      <li class="p-4 border rounded-lg ml-4 flex-grow-1">
        <div class="fs-6 flex align-items-center">
          <VIcon size="20" class="mr-2 color-primary">email-fill</VIcon>
          <span>{{ $t('dfs_user_contactus_youxiang') }}</span>
        </div>
        <ElButton text class="mt-2">team@tapdata.io</ElButton>
        <div class="mt-2 font-color-sslight">
          {{ $t('dfs_user_contactus_weinintigongchan') }}
        </div>
      </li>
      <li
        v-if="isDomesticStation"
        class="p-4 border rounded-lg ml-4 flex-grow-1"
      >
        <div class="fs-6 flex align-items-center">
          <VIcon size="20" class="mr-2">enterprise-wechat</VIcon>
          <span>{{ $t('dfs_user_contactus_qiyeweixin') }}</span>
        </div>
        <ElTooltip
          placement="top"
          effect="light"
          popper-class="contact-us-enterprise-wechat shadow p-0"
        >
          <ElButton type="primary" class="mt-2">{{
            $t('tap_contact_us')
          }}</ElButton>
          <template #content>
            <div class="px-4 py-5 text-center rounded-lg">
              <ElImage :src="wechatCodeImg" class="code-image mb-2" />
              <div>{{ $t('dfs_user_contactus_saomatianjiake') }}</div>
            </div>
          </template>
        </ElTooltip>
        <div class="mt-2 font-color-sslight">
          {{ $t('dfs_user_contactus_weinintigongchan') }}
        </div>
      </li>
      <li
        v-if="isDomesticStation"
        class="p-4 border rounded-lg ml-4 flex-grow-1"
      >
        <div class="fs-6 flex align-items-center">
          <VIcon size="18" class="mr-2 color-primary">phone</VIcon>
          <span>{{ $t('dfs_user_contactus_dianhuazixun') }}</span>
        </div>
        <ElButton text class="mt-2">0755-26656080</ElButton>
        <!--        <div class="mt-2 font-color-sslight">{{ $t('dfs_user_contactus_gongzuorijiejia') }}</div>-->
      </li>
    </ul>
    <div class="mt-6 fs-5 fw-bold font-color-dark">
      {{ $t('dfs_user_contactus_gengduofuwu') }}
    </div>
    <ul class="flex justify-content-between mt-6">
      <li class="p-4 border rounded-lg flex-grow-1">
        <div class="fs-6 font-color-dark">
          {{ $t('dfs_user_contactus_wodegongdan') }}
        </div>
        <div type="primary" class="mt-2 fs-8 font-color-sslight">
          {{ $t('dfs_user_contactus_tijiaogongdanjie') }}
        </div>
        <ElLink type="primary" class="mt-2" @click="goTicketSystem">{{
          $t('dfs_user_contactus_chuangjiangongdan')
        }}</ElLink>
      </li>
      <li class="p-4 border rounded-lg ml-4 flex-grow-1">
        <div class="fs-6 font-color-dark">
          {{ $t('workbench_guide_documentation') }}
        </div>
        <div type="primary" class="mt-2 fs-8 font-color-sslight">
          {{ $t('dfs_user_contactus_tigongchanpinjie') }}
        </div>
        <ElLink type="primary" class="mt-2" @click="handleDocs">{{
          $t('dfs_user_contactus_chakanwendang')
        }}</ElLink>
      </li>
    </ul>
  </div>
</template>

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
  background: #f1fbfe url('../../assets/image/contact-us-bg.png') right center
    no-repeat;
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
