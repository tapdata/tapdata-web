<template>
  <!-- 头部导航 -->
  <ElHeader class="dfs-header">
    <div class="dfs-header__body">
      <ElLink class="logo" @click="command('workbench')">
        <img src="../../assets/image/logoFull.png" alt="" />
      </ElLink>
      <div class="dfs-header__button button-bar pr-4 fs-7">
        <div v-if="domain === 'demo.cloud.tapdata.net' && lang !== 'en'" class="marquee-container cursor-pointer">
          <div class="marquee-box">
            <span>{{ $t('dfs_data_dashboard_Marquee') }}</span>
          </div>
        </div>
        <div v-if="domain === 'demo.cloud.tapdata.net' && lang === 'en'" class="block">
          <p class="words">{{ $t('dfs_data_dashboard_Marquee') }}</p>
        </div>
        <div class="command-item mr-6" @click="command('op')">
          <span class="cursor-pointer">{{ $t('dfs_data_server_apply_for_version') }}</span>
        </div>
        <div class="command-item mr-6" @click="command('v2')">
          <VIcon class="mr-2" size="17">navigation_general</VIcon>
          <span class="cursor-pointer">{{ $t('header_upgrade') }}</span>
        </div>
        <div class="command-item mr-6 flex align-items-center" @click="command('support')">
          <VIcon class="mr-2" size="17">question</VIcon>
          <span>{{ $t('header_technical_support') }}</span>
        </div>
        <div class="command-item mr-6 flex align-items-center" @click="command('handbook')">
          <VIcon class="mr-2" size="17">send</VIcon>
          <span>{{ $t('header_manual') }}</span>
        </div>
        <NotificationPopover class="command-item mr-2 flex align-items-center"></NotificationPopover>
        <ElDropdown class="mr-2" placement="bottom" @command="changeLanguage">
          <span class="cursor-pointer command-item icon-btn">
            <VIcon size="20">{{ 'language-' + lang }}</VIcon>
          </span>
          <ElDropdownMenu slot="dropdown" class="no-triangle">
            <ElDropdownItem v-for="(value, key) in languages" :key="key" :command="key">
              {{ value }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </ElDropdown>
        <ElDropdown class="command-item menu-user" placement="bottom" @command="command">
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
            <span class="ml-2 current">{{ paidPlansCode || $t('dfs_the_header_header_jichuban') }}</span>
          </div>

          <ElDropdownMenu slot="dropdown">
            <!-- <ElDropdownItem command="account"> 个人设置 </ElDropdownItem> -->
            <ElDropdownItem command="userCenter" :disabled="$disabledReadonlyUserBtn()">{{
              $t('the_header_Header_yongHuZhongXin')
            }}</ElDropdownItem>
            <ElDropdownItem command="home"> {{ $t('header_official_website') }} </ElDropdownItem>
            <ElDropdownItem command="signOut" :disabled="$disabledReadonlyUserBtn()">
              {{ $t('header_sign_out') }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </ElDropdown>
      </div>
    </div>
  </ElHeader>
</template>
<script>
import { VIcon } from '@tap/component'
import { langMenu, getCurrentLanguage, setCurrentLanguage } from '@tap/i18n/src/shared/util'

import NotificationPopover from '@/views/workbench/NotificationPopover'

export default {
  components: { VIcon, NotificationPopover },
  data() {
    return {
      user: window.__USER_INFO__ || {},
      USER_CENTER: window.__config__.USER_CENTER,
      lang: '',
      languages: langMenu,
      paidPlansCode: '',
      domain: document.domain
    }
  },
  created() {
    this.lang = getCurrentLanguage()
    this.getPaidPlan()
    setCurrentLanguage(this.lang, this.$i18n)
  },
  methods: {
    command(command) {
      // let downloadUrl = '';
      switch (command) {
        case 'workbench':
          this.$router.push({ name: 'Workbench' })
          break
        case 'help':
          window.open('https://docs.tapdata.io/', '_blank')
          break
        case 'contact-us':
          window.open('https://cloud.tapdata.net/contact.html', '_blank')
          break
        case 'home':
          window.open('https://tapdata.net/', '_blank')
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
        case 'signOut':
          this.$confirm(this.$t('header_log_out_tip'), this.$t('header_log_out_title'), {
            type: 'warning',
            confirmButtonText: this.$t('button_confirm'),
            cancelButtonText: this.$t('button_cancel')
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
          window.open('https://docs.tapdata.io/cloud/what-is-tapdata-cloud', '_blank')
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
    //用户是否是付费用户
    getPaidPlan() {
      this.$axios.get('api/tcm/user/paidPlan').then(data => {
        this.paidPlansCode = data?.paidPlans?.[0].name
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.dfs-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 68px !important;
  padding: 0 7px;
  background: rgba(54, 54, 54, 1);
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
    margin-left: 12px;
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
      color: rgba(255, 255, 255, 0.45);
      &:hover {
        color: #fff;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        &.icon {
          color: #fff;
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
  height: 68px !important;
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
  width: 420px;
  height: 40px;
  line-height: 40px;
  .marquee-box {
    position: absolute;
    width: 420px;
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
