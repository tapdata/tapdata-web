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
            <ElDropdownItem command="home"> 官网 </ElDropdownItem>
            <ElDropdownItem command="guide"> 新手引导 </ElDropdownItem>
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

      <el-dialog
        class="novice-guide-dialog"
        :show-close="false"
        :close-on-click-modal="false"
        :visible.sync="guideVisible"
        width="50%"
        top="30vh"
      >
        <div class="guide-dialog__content text-center">
          <div class="guide-mark">
            <img src="../../../public/images/guide/guide_mark.png" alt="" />
          </div>
          <div class="mt-5 fs-3 text-white">
            <span>Hi，欢迎使用</span>
            <span class="color-primary">Tapdata</span>
            <span class="ml-1">Cloud</span>
          </div>
          <div class="mt-3 fs-6 text-white">我们为您准备了详细的新手引导教程，方便您更快上手哦～</div>
          <div class="guide-operation flex justify-center mt-4">
            <img src="../../../public/images/guide/guid_no.png" alt="" @click="closeGuideDialog" />
            <img class="ml-9" src="../../../public/images/guide/guid_yes.png" alt="" @click="toGuidePage" />
          </div>
        </div>
      </el-dialog>
    </div>
  </ElHeader>
</template>
<script>
import HeaderCustomerService from './HeaderCustomerService'
// import AgentFail from './AgentFail';
// import ws from '../../plugins/ws.js';
import VIcon from '@/components/VIcon'

export default {
  components: { HeaderCustomerService, VIcon },
  data() {
    return {
      user: window.__USER_INFO__ || {},
      isShowCustomerService: false,
      guideVisible: false, // 新手指引模态窗
      isClose: false,
      btnLoading: false
    }
  },
  methods: {
    createTask() {
      this.$refs.noviceGuide?.goCreateTask?.()
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
        case 'signOut':
          this.$confirm('您确定要退出登录吗？', '退出登录', {
            type: 'warning'
          }).then(res => {
            if (res) {
              location.href = './logout'
            }
          })
          break
        // case 'create':
        //   //判断是否有实例
        //   this.guideVisible = true // 显示指引窗
        //   if (key) {
        //     this.$refs.noviceGuide?.nextFnc?.(key)
        //   }
        //   break
        case 'toCommunity':
          window.open('https://ask.tapdata.net/', '_blank')
          break
        case 'source-center':
          window.open('https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_readme', '_blank')
          break
        case 'guide':
          // TODO 新手指引
          this.guideVisible = true
          break
      }
    },
    closeGuideDialog() {
      this.guideVisible = false
    },
    toGuidePage() {
      this.closeGuideDialog()
      this.$router.push({
        name: 'NoviceGuide'
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
  .novice-guide-dialog {
    ::v-deep {
      .el-dialog {
        background-color: unset;
        border: none;
        box-shadow: unset;
      }
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
  }
}
</style>
