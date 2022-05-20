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
        <ElPopover placement="top-start" width="400" min-width="0" trigger="click">
          <div class="flex justify-content-between text-center">
            <div>
              <img style="width: 120px; height: 120px" src="../../../public/images/wx_user_support.png" alt="" />
              <div>{{ $t('header_scan_code') }}</div>
              <div>{{ $t('header_join_group') }}</div>
            </div>
            <div>
              <img style="width: 120px; height: 120px" src="../../../public/images/wx_code.png" alt="" />
              <div>{{ $t('header_scan_code_title1') }}</div>
              <div>{{ $t('header_scan_code_desc1') }}</div>
            </div>
          </div>
          <div class="command-item mr-6" slot="reference">
            <VIcon class="mr-2" size="17">question</VIcon>
            <span>{{ $t('header_question') }}</span>
          </div>
        </ElPopover>
        <div class="command-item mr-6" @click="command('handbook')">
          <VIcon class="mr-2" size="17">send</VIcon>
          <span>{{ $t('header_manual') }}</span>
        </div>
        <!--        <div class="command-item mr-6" @click="command('feedback')">-->
        <!--          <VIcon class="v-icon mr-2" size="17">feedback</VIcon>-->
        <!--          <span>{{ $t('header_feedback') }}</span>-->
        <!--        </div>-->
        <!--        <div class="mr-6 pointer" @click="command('source-center')">文档中心</div>-->
        <!--        <div class="flex align-items-center mr-6 pointer" @click="command('contact-us')">-->
        <!--          <VIcon class="mr-2" size="17">send</VIcon>-->
        <!--          <span>联系我们</span>-->
        <!--        </div>-->
        <NotificationPopover class="command-item mr-6"></NotificationPopover>
        <ElDropdown v-if="false" placement="bottom" class="mr-6" @command="changeLanguage">
          <span class="cursor-pointer command-item langs-btn">{{ languagesItems[lang] }}</span>
          <ElDropdownMenu slot="dropdown" class="no-triangle">
            <ElDropdownItem v-for="(value, key) in languagesItems" :key="key" :command="key">
              {{ value }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </ElDropdown>
        <ElDropdown class="command-item menu-user" placement="bottom" @command="command">
          <!--					<ElButton class="menu-button" size="mini">-->
          <!--						{{ user.username }}-->
          <!--					</ElButton>-->
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
            <ElDropdownItem command="userCenter">{{ $t('the_header_Header_yongHuZhongXin') }}</ElDropdownItem>
            <ElDropdownItem command="home"> {{ $t('header_official_website') }} </ElDropdownItem>
            <ElDropdownItem command="signOut"> {{ $t('header_sign_out') }} </ElDropdownItem>
          </ElDropdownMenu>
        </ElDropdown>
      </div>
    </div>
  </ElHeader>
</template>
<script>
import Cookie from '@daas/shared/src/cookie'
import NotificationPopover from '@/views/workbench/NotificationPopover'
// import ws from '../../plugins/ws.js';
import VIcon from '@/components/VIcon'
// i18n需要的格式
const langMap = {
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'en-US': 'en'
}
export default {
  components: { VIcon, NotificationPopover },
  data() {
    return {
      user: window.__USER_INFO__ || {},
      USER_CENTER: window.__config__.USER_CENTER,
      lang: '',
      languagesItems: {
        'zh-CN': '中文 (简)',
        'zh-TW': '中文 (繁)',
        'en-US': 'English'
      }
    }
  },
  created() {
    this.setLang()
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
          window.open('https://cloud.tapdata.net/', '_blank')
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
              localStorage.removeItem('tapdata_localize_lang') // 清除国际化
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
      Cookie.set('lang', lang)
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
    getLangKey(value, obj) {
      if (!value) {
        return
      }
      let res = obj || langMap
      for (let key in res) {
        if (res[key] === value) {
          return key
        }
      }
    },
    setLang() {
      let getItem = localStorage.getItem('tapdata_localize_lang')
      if (getItem) {
        this.lang = getItem
        Cookie.set('lang', getItem)
        return
      }
      let lang = Cookie.get('_authing_lang') || navigator.language || navigator.browserLanguage || 'zh-CN'
      this.changeLanguage(lang)
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
.langs-btn {
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
