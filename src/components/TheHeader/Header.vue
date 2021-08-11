<template>
  <!-- 头部导航 -->
  <ElHeader class="dfs-header">
    <div class="dfs-header__body">
      <ElLink class="logo" @click="command('workbench')">
        <img src="../../assets/image/logoFull.png" alt="" />
      </ElLink>
      <div class="dfs-header__button button-bar pr-4 fs-7">
        <!--				<div class="mr-6 pointer" @click="command('toCommunity')">社区</div>-->
        <div class="mr-6 pointer" @click="command('source-center')">文档中心</div>
        <div class="flex align-center mr-6 pointer" @click="command('contact-us')">
          <VIcon class="mr-2" size="17">send</VIcon>
          <span>联系我们</span>
        </div>
        <NotificationPopover class="mr-6"></NotificationPopover>
        <ElDropdown class="menu-user" placement="bottom" @command="command">
          <!--					<el-button class="menu-button" size="mini">-->
          <!--						{{ user.username }}-->
          <!--					</el-button>-->
          <div class="username flex align-center">
            <VIcon class="mr-2" size="17">account</VIcon>
            <span>{{ user.username || user.nickname || user.phone || user.email }}</span>
          </div>

          <ElDropdownMenu slot="dropdown">
            <!-- <ElDropdownItem command="account"> 个人设置 </ElDropdownItem> -->
            <!--            <ElDropdownItem command="userCenter"> 用户中心 </ElDropdownItem>-->
            <ElDropdownItem command="home"> 官网 </ElDropdownItem>
            <ElDropdownItem command="signOut"> 退出登录 </ElDropdownItem>
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
            <span>Hi，欢迎使用</span>
            <span class="color-primary">Tapdata</span>
            <span class="ml-1">Cloud</span>
          </div>
          <div class="mt-3 fs-6 text-white position-relative inline-block">
            我们为您准备了详细的新手引导教程，方便您更快上手哦～
            <el-checkbox v-model="noShow" class="no-show-checkbox text-white position-absolute">不再提醒</el-checkbox>
          </div>
          <div class="guide-operation flex justify-center mt-8">
            <img src="../../../public/images/guide/guid_no.png" alt="" @click="leaveGuide" />
            <img class="ml-9" src="../../../public/images/guide/guid_yes.png" alt="" @click="toGuidePage" />
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
      VUE_APP_USER_CENTER: process.env.VUE_APP_USER_CENTER
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
          window.open(this.VUE_APP_USER_CENTER || 'https://tapdata.authing.cn/u', '_blank')
          break
        case 'signOut':
          this.$confirm('您确定要退出登录吗？', '退出登录', {
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
      }
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
      &:hover {
        color: map-get($color, primary);
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
