<template>
  <!-- 头部导航 -->
  <ElHeader class="dfs-header">
    <div class="dfs-header__body">
      <ElLink class="logo" @click="command('workbench')">
        <img src="../../assets/image/logoFull.png" alt="" />
      </ElLink>
      <div class="dfs-header__button button-bar pr-4 fs-7">
        <!-- <div class="mr-6 pointer" @click="command('toCommunity')">
          <VIcon class="mr-2" size="17">shequ</VIcon>
          <span>社区</span>
        </div> -->
        <!--        <div class="mr-6 pointer" @click="command('questions')">问答支持</div>-->
        <el-popover placement="top-start" width="240" min-width="0" trigger="click">
          <div class="text-center">
            <img style="width: 120px; height: 120px" src="../../../public/images/wx_user_support.png" alt="" />
            <div>{{ $t('header_scan_code') }}</div>
            <div>{{ $t('header_join_group') }}</div>
          </div>
          <div class="mr-6 pointer" slot="reference">
            <VIcon class="mr-2" size="17">question</VIcon>
            <span>{{ $t('header_question') }}</span>
          </div>
        </el-popover>
        <div class="mr-6 pointer" @click="command('handbook')">
          <VIcon class="mr-2" size="17">send</VIcon>
          <span>{{ $t('header_manual') }}</span>
        </div>
        <div class="mr-6 pointer" @click="command('feedback')">
          <VIcon class="v-icon mr-2" size="17">feedback</VIcon>
          <span>{{ $t('header_feedback') }}</span>
        </div>
        <!--        <div class="mr-6 pointer" @click="command('source-center')">文档中心</div>-->
        <!--        <div class="flex align-items-center mr-6 pointer" @click="command('contact-us')">-->
        <!--          <VIcon class="mr-2" size="17">send</VIcon>-->
        <!--          <span>联系我们</span>-->
        <!--        </div>-->
        <NotificationPopover class="mr-6"></NotificationPopover>
        <ElDropdown class="btn" placement="bottom" @command="changeLanguage">
          <VIcon class="mr-6" size="17" v-if="lang === 'sc'">cn</VIcon>
          <VIcon class="mr-6" size="17" v-else>en</VIcon>
          <ElDropdownMenu slot="dropdown">
            <ElDropdownItem v-for="(value, key) in languages" :key="key" :command="key">
              {{ value }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </ElDropdown>
        <ElDropdown class="menu-user" placement="bottom" @command="command">
          <!--					<el-button class="menu-button" size="mini">-->
          <!--						{{ user.username }}-->
          <!--					</el-button>-->
          <div class="username flex align-items-center">
            <VIcon class="mr-2" size="17">account</VIcon>
            <span>{{ user.username || user.nickname || user.phone || user.email }}</span>
          </div>

          <ElDropdownMenu slot="dropdown">
            <!-- <ElDropdownItem command="account"> 个人设置 </ElDropdownItem> -->
            <!--            <ElDropdownItem command="userCenter"> 用户中心 </ElDropdownItem>-->
            <ElDropdownItem command="home"> {{ $t('header_official_website') }} </ElDropdownItem>
            <ElDropdownItem command="signOut"> {{ $t('header_sign_out') }} </ElDropdownItem>
          </ElDropdownMenu>
        </ElDropdown>
      </div>
    </div>
    <div class="dfs-header__dialog">
      <!-- 用户支持 -->
      <HeaderCustomerService v-model="isShowCustomerService"></HeaderCustomerService>
      <!-- agent断开弹窗 -->
      <!-- <AgentFail v-model="agentVisible" :isClose="isClose"></AgentFail> -->
      <div :class="['fixed-novice-guide-dialog', { active: guideVisible }]">
        <div class="guide-dialog__content text-center">
          <div class="guide-mark">
            <img src="../../../public/images/guide/guide_mark.png" alt="" />
          </div>
          <div class="mt-5 fs-3 text-white">
            <span>{{ $t('header_welcome') }}</span>
            <span class="color-primary">Tapdata</span>
            <span class="ml-1">Cloud</span>
          </div>
          <div class="mt-3 fs-6 text-white position-relative inline-block">
            {{ $t('header_tutorials_tip') }}
            <el-checkbox v-model="noShow" class="no-show-checkbox text-white position-absolute">{{
              $t('header_more_reminders')
            }}</el-checkbox>
          </div>
          <div class="guide-operation flex justify-content-center mt-8">
            <template v-if="lang === 'sc'">
              <img src="../../../public/images/guide/guid_no.png" alt="" @click="leaveGuide" />
              <img class="ml-9" src="../../../public/images/guide/guid_yes.png" alt="" @click="toGuidePage" />
            </template>
            <template v-else>
              <img src="../../../public/images/guide/en_guid_no.svg" alt="" @click="leaveGuide" />
              <img class="ml-9" src="../../../public/images/guide/en_guid_yes.svg" alt="" @click="toGuidePage" />
            </template>
          </div>
        </div>
      </div>
    </div>
  </ElHeader>
</template>
<script>
import HeaderCustomerService from './HeaderCustomerService'
// import AgentFail from './AgentFail';
import NotificationPopover from '@/views/Workbench/NotificationPopover'
// import ws from '../../plugins/ws.js';
import VIcon from '@/components/VIcon'
const langMap = {
  sc: 'zh-CN',
  tc: 'zh-TW',
  en: 'en'
}
export default {
  components: { HeaderCustomerService, VIcon, NotificationPopover },
  data() {
    return {
      user: window.__USER_INFO__ || {},
      isShowCustomerService: false,
      guideVisible: false, // 新手指引模态窗
      isClose: false,
      btnLoading: false,
      noShow: false, // 不再显示新手引导
      selfUser: {}, // self用户信息
      USER_CENTER: window.__config__.USER_CENTER,
      lang: localStorage.getItem('tapdata_localize_lang') || 'sc',
      languages: {
        sc: '中文',
        en: 'English'
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getTmUser()
    },
    getTmUser() {
      this.$axios.get('tm/api/users/self').then(data => {
        if (data) {
          let guideData = data?.guideData ?? {}
          this.selfUser = {
            id: data.id,
            guideData: guideData
          }
          this.noShow = !!guideData?.noShow
          // 不再显示
          if (
            !guideData?.noShow &&
            !guideData?.action &&
            (new Date().getTime() - (guideData?.updateTime ?? 0)) / 1000 / 3600 > 24
          ) {
            this.showGuide()
          }
        }
      })
    },
    showGuide() {
      this.command('guide')
    },
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
          window.open('https://cloud.tapdata.net/', '_blank')
          break
        case 'userCenter':
          window.open(this.USER_CENTER || 'https://tapdata.authing.cn/u', '_blank')
          break
        case 'signOut':
          this.$confirm(this.$t('header_log_out_tip'), this.$t('header_log_out_title'), {
            type: 'warning'
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
        case 'guide':
          this.guideVisible = true
          break
        case 'handbook':
          window.open('https://sourl.cn/sxuj82', '_blank')
          break
        case 'feedback':
          window.open('https://sourl.cn/bDjxdj', '_blank')
          break
      }
    },
    // 中英文切换
    changeLanguage(lang) {
      this.lang = lang
      this.$i18n.locale = langMap[lang]
      localStorage.setItem('tapdata_localize_lang', lang)
      location.reload()
      // window.__USER_LANG__ = lang
    },
    clearCookie() {
      let keys = document.cookie.match(/[^ =;]+(?==)/g)
      if (keys) {
        for (let i = keys.length; i--; ) {
          document.cookie = keys[i] + '=0;path=/;domain=' + document.domain + ';expires=' + new Date(0).toUTCString()
        }
      }
    },
    leaveGuide() {
      this.guideVisible = false
      this.updateUser()
    },
    toGuidePage() {
      this.guideVisible = false
      this.updateUser(true)
      if (this.$route.name !== 'NoviceGuide') {
        this.$router.push({
          name: 'NoviceGuide'
        })
      }
    },
    updateUser(action = false) {
      let selfUser = this.selfUser
      this.$axios.patch('tm/api/users/' + selfUser?.id, {
        guideData: {
          noShow: this.noShow,
          updateTime: new Date().getTime(),
          action: action || selfUser?.guideData?.action || false
        }
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
    color: rgba(255, 255, 255, 0.45);
    > div {
      .v-icon {
        color: #fff;
      }
      &:hover {
        color: map-get($color, primary);
        .v-icon {
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
    .username {
      cursor: pointer;
      color: rgba(255, 255, 255, 0.45);
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
</style>
