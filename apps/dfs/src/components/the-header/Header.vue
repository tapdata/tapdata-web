<template>
  <!-- 头部导航 -->
  <ElHeader class="dfs-header" :class="{ isMockUser: mockUserId }">
    <div class="dfs-header__body">
      <ElLink class="logo" @click="command('workbench')">
        <img src="../../assets/image/logo.svg" alt="" />
      </ElLink>
      <div class="dfs-header__button button-bar pr-4 fs-7">
        <!--付费专业版-->
        <div class="vip-btn mr-4 cursor-pointer" @click="openUpgrade">
          <VIcon size="17">icon-vip</VIcon>&nbsp;{{ $t('packages_component_src_upgradefee_dingyuezhuanyeban') }}
        </div>
        <!--有奖问卷-->
        <div v-if="showQuestionnaire" class="command-item mr-6 position-relative" @click="goQuestionnaire">
          <span class="cursor-pointer"> {{ $t('dfs_the_header_header_prize_questionnaire') }} </span>
          <VIcon class="position-absolute discount-hot-icon">hot-o</VIcon>
        </div>
        <!--我的工单-->
        <div class="command-item mr-6" @click="goTicketSystem">
          <VIcon size="17">workorder</VIcon>
          <span class="cursor-pointer"> {{ $t('dfs_the_header_header_wodegongdan') }}</span>
        </div>
        <!---demo环境-->
        <div v-if="domain === 'demo.cloud.tapdata.net' && lang !== 'en'" class="marquee-container cursor-pointer">
          <div class="marquee-box">
            <span>{{ $t('dfs_data_dashboard_Marquee') }}</span>
          </div>
        </div>
        <div v-if="domain === 'demo.cloud.tapdata.net' && lang === 'en'" class="block">
          <p class="words">{{ $t('dfs_data_dashboard_Marquee') }}</p>
        </div>

        <div class="command-item mr-6" v-for="item in topBarLinks" @click="handleGo(item)">
          <VIcon v-if="item.icon" class="mr-2" size="17">{{ item.icon }}</VIcon>
          <span class="cursor-pointer">{{ $t(item.text) }}</span>
        </div>

        <NotificationPopover class="command-item mr-2 flex align-items-center"></NotificationPopover>
        <ElDropdown
          class="mr-2"
          placement="bottom"
          :show-timeout="0"
          @command="changeLanguage"
          v-if="!onlyEnglishLanguage"
        >
          <span class="cursor-pointer command-item icon-btn">
            <VIcon size="20">{{ 'language-' + lang }}</VIcon>
          </span>
          <ElDropdownMenu slot="dropdown" class="no-triangle">
            <ElDropdownItem v-for="(value, key) in languages" :key="key" :command="key">
              {{ value }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </ElDropdown>
        <ElDropdown class="command-item menu-user" placement="bottom" :show-timeout="0" @command="command">
          <div class="username flex align-items-center">
            <img
              v-if="user.avatar"
              :src="user.avatar"
              alt=""
              class="mr-2"
              style="width: 30px; height: 30px; border-radius: 50%"
            />
            <VIcon v-else class="mr-2" size="20">account</VIcon>
            <span>{{ user.username || user.nickname || user.phone || user.email }}</span>
          </div>

          <ElDropdownMenu slot="dropdown">
            <!-- <ElDropdownItem command="account"> 个人设置 </ElDropdownItem> -->
            <ElDropdownItem command="userCenter" :disabled="$disabledReadonlyUserBtn()">{{
              $t('the_header_Header_yongHuZhongXin')
            }}</ElDropdownItem>
            <ElDropdownItem command="order">{{ $t('dfs_the_header_header_dingyuezhongxin') }}</ElDropdownItem>
            <ElDropdownItem command="home"> {{ $t('header_official_website') }} </ElDropdownItem>
            <ElDropdownItem command="signOut" :disabled="$disabledReadonlyUserBtn()">
              {{ $t('header_sign_out') }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </ElDropdown>
      </div>
      <!--付费-->
      <UpgradeFee :visible.sync="openUpgradeFee"></UpgradeFee>
    </div>
  </ElHeader>
</template>
<script>
import { VIcon, UpgradeFee } from '@tap/component'
import { langMenu, getCurrentLanguage, setCurrentLanguage } from '@tap/i18n/src/shared/util'
import { daysdifference, extractTimeFromObjectId } from '../../util'

import NotificationPopover from '@/views/workbench/NotificationPopover'
import Cookie from '@tap/shared/src/cookie'

export default {
  inject: ['buried'],
  components: { VIcon, NotificationPopover, UpgradeFee },
  data() {
    return {
      user: window.__USER_INFO__ || {},
      USER_CENTER: window.__config__.USER_CENTER,
      topBarLinks: window.__config__?.topBarLinks,
      officialWebsiteAddress: window.__config__?.officialWebsiteAddress || 'https://tapdata.net',
      lang: '',
      languages: langMenu,
      domain: document.domain,
      onlyEnglishLanguage: false,
      configMock: window.__configMock__,
      mockUserId: null,
      openUpgradeFee: false,
      isFeeUser: true,
      //用户注册时间
      registrationTime: '',
      showQuestionnaire: false
    }
  },
  created() {
    this.lang = getCurrentLanguage()
    setCurrentLanguage(this.lang, this.$i18n)
    if (window.__config__?.onlyEnglishLanguage) {
      this.onlyEnglishLanguage = true
      //默认只有英文则当前浏览器语言设置为英文
      this.lang = 'en'
      setCurrentLanguage(this.lang, this.$i18n)
    }
    if (window.__configMock__) {
      this.mockUserId = window.__configMock__?.mockUserId || false
    }
    this.getAgentCount()
    //如果没有配置topBarLinks 给默认值
    if (!window.__config__?.topBarLinks) {
      this.topBarLinks = [
        {
          text: 'header_technical_support', //技术支持
          link: 'https://desk.zoho.com.cn/portal/tapdata/zh/community/topic/welcome-to-community',
          icon: 'question',
          type: 'support'
        },
        {
          text: 'header_manual', //使用手册
          link: 'https://docs.tapdata.net/cloud/what-is-tapdata-cloud',
          icon: 'send',
          type: 'handbook'
        }
      ]
    }
    //获取用户注册时间
    if (this.user?.id) {
      this.registrationTime = extractTimeFromObjectId(this.user?.id)
      //注册时间7天大于的用户
      this.showQuestionnaire = daysdifference(this.registrationTime) > 7
    }
  },
  methods: {
    command(command) {
      // let downloadUrl = '';
      switch (command) {
        case 'workbench':
          this.$router.push({ name: 'dataConsole' })
          break
        case 'help':
          window.open('https://docs.tapdata.io/', '_blank')
          break
        case 'contact-us':
          window.open('https://cloud.tapdata.net/contact.html', '_blank')
          break
        case 'home':
          window.open(this.officialWebsiteAddress, '_blank')
          break
        case 'v2':
          window.open('https://cloud.tapdata.net/console/#/workbench/', '_blank')
          break
        case 'op':
          window.open('https://tapdata.net/tapdata-on-prem/demo.html', '_blank')
          break
        case 'userCenter':
          // window.open(this.USER_CENTER || 'https://tapdata.authing.cn/u', '_blank')
          this.$router.push({
            name: 'userCenter'
          })
          break
        case 'order':
          this.$router.push({
            name: 'order'
          })
          break
        case 'signOut':
          this.$confirm(this.$t('header_log_out_tip'), this.$t('header_log_out_title'), {
            type: 'warning',
            confirmButtonText: this.$t('public_button_confirm'),
            cancelButtonText: this.$t('public_button_cancel')
          }).then(res => {
            if (res) {
              this.clearCookie()
              location.href = './logout'
            }
          })
          break
        case 'toCommunity':
          window.open('https://ask.tapdata.net/', '_blank')
          break
        case 'source-center':
          window.open('https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_readme', '_blank')
          break
        case 'handbook':
          window.open('https://docs.tapdata.net/cloud/what-is-tapdata-cloud', '_blank')
          break
        case 'support':
          window.open('https://desk.zoho.com.cn/portal/tapdata/zh/community/topic/welcome-to-community', '_blank')
          break
      }
    },
    // 中英文切换
    changeLanguage(lang) {
      this.lang = lang
      setCurrentLanguage(this.lang, this.$i18n)
      location.reload()
    },
    clearCookie() {
      let keys = document.cookie.match(/[^ =;]+(?==)/g)
      if (keys) {
        for (let i = keys.length; i--; ) {
          document.cookie = keys[i] + '=0;path=/;domain=' + document.domain + ';expires=' + new Date(0).toUTCString()
        }
      }
    },

    //处理跳转
    handleGo(item) {
      window.open(item.link, '_blank')
    },
    //
    goTicketSystem() {
      this.$router.push({
        name: 'TicketSystem'
      })
    },
    //判断是否是付费用户
    getAgentCount() {
      this.$axios.get('api/tcm/agent/agentCount').then(data => {
        this.isFeeUser = data?.subscriptionAgentCount > 0
      })
    },
    openUpgrade() {
      this.openUpgradeFee = true
    },
    goQuestionnaire() {
      window.open('https://tapdata.feishu.cn/share/base/form/shrcnImdl8BDtEOxki50Up9OJTg', '_blank')
    }
  }
}
</script>
<style lang="scss" scoped>
.isMockUser {
  background: red !important;
}
.discount-hot-icon {
  color: #ff7d00;
  right: -12px;
  top: -12px;
  font-size: 24px;
}
.dfs-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 52px !important;
  padding: 0 7px;
  background: map-get($color, submenu);
  box-sizing: border-box;
  .current {
    font-weight: 400;
    font-size: 10px;
    line-height: 14px;
    border: 1px solid rgba(255, 255, 255, 0.45);
    border-radius: 2px;
    padding: 4px;
  }
  .pointer {
    cursor: pointer;
  }
  .logo {
    display: block;
    width: 177px;
    height: 30px;
    margin-left: -12px;
    img {
      display: block;
      height: 100%;
      width: 100%;
      object-fit: contain;
    }
  }
  .button-bar {
    display: flex;
    align-items: center;
    .command-item {
      padding: 4px 8px;
      cursor: pointer;
      color: map-get($fontColor, light);
      &:hover {
        color: map-get($color, primary);
        background-color: map-get($color, white);
        border-radius: 4px;
        &.icon {
          color: map-get($color, primary);
        }
      }
    }
    .agent-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-right: 5px;
      padding: 0 15px 0 10px;
      height: 24px;
      line-height: 24px;
      color: #fff;
      font-size: 12px;
      border-radius: 20px;
      cursor: pointer;
      background-color: rgba(255, 255, 255, 0.1);
      i.status-color {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-right: 5px;
        vertical-align: middle;
        border-radius: 50%;
      }
    }
    .btn-create {
      margin-right: 20px;
    }
    .btn {
      margin-left: 8px;
      color: #999;
      cursor: pointer;
      i {
        display: inline-block;
        line-height: 28px;
        text-align: center;
        height: 28px;
        width: 28px;
        font-size: 18px;
      }
      &:hover {
        color: #fff;
      }
    }
    .menu-user {
      .menu-button {
        color: rgba(204, 204, 204, 1);
        background: rgba(85, 85, 85, 1);
        border: none;
      }
    }
    .img {
      width: 17px;
      height: 17px;
    }
  }
}
.dfs-header__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 52px !important;
}
.dfs-header__dialog {
  .fixed-novice-guide-dialog {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    padding-top: 30vh;
    overflow: auto;
    transform: scale(0);
    transition: transform 0.5s;
    transform-origin: top right;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 3004;
    box-sizing: border-box;
    &.active {
      transform: scale(1);
    }
    .guide-mark {
      img {
        width: 67px;
        height: 67px;
      }
    }
    .guide-operation {
      img {
        width: 195px;
        height: 56px;
        cursor: pointer;
      }
    }
    .no-show-checkbox {
      top: 30px;
      right: 0;
    }
  }
}
.marquee-container {
  width: 400px;
  height: 40px;
  line-height: 40px;
  .marquee-box {
    position: absolute;
    width: 400px;
    height: 40px;
    span {
      position: absolute;
      right: 0;
      font-weight: 400;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      line-height: 38px;
      animation: marquee 10s linear infinite;
    }
  }
}

.block {
  width: 170px;
  white-space: nowrap;
  overflow: hidden;
}
.words {
  position: relative;
  width: fit-content;
  animation: move 20s linear infinite;
  padding-left: 10px;
  color: rgba(255, 255, 255, 0.7);
}
.words::after {
  position: absolute;
  right: -100%;
  content: attr(text);
}
.vip-btn {
  color: map-get($color, white);
  padding: 4px 8px;
  background: linear-gradient(93.39deg, #2c65ff 10.45%, #702cff 98.21%);
  border-radius: 4px;
}

@keyframes move {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
@keyframes marquee {
  /* 开始状态 */
  0% {
  }
  25% {
    transform: translateX(-30px);
  }
  50% {
    transform: translateX(-60px);
  }
  75% {
    transform: translateX(-90px);
  }
  /* 结束状态 */
  100% {
    transform: translateX(-120px);
  }
}
</style>
