<template>
  <!-- 头部导航 -->
  <ElHeader class="dfs-header">
    <div class="dfs-header__body">
      <ElLink class="logo" @click="command('workbench')">
        <img src="../../assets/image/logoFull.png" alt="" />
      </ElLink>
      <div class="dfs-header__button button-bar pr-4 fs-7">
        <!--				<div class="mr-6 pointer" @click="command('toCommunity')">社区</div>-->
        <div class="mr-6 pointer" @click="command('source-center')">
          文档中心
        </div>
        <div class="flex align-center mr-6 pointer" @click="command('contact-us')">
          <VIcon class="mr-2" size="17">send</VIcon>
          <span>联系我们</span>
        </div>
        <!--				<ElButton class="btn-create" type="primary" size="mini" :loading="btnLoading" @click="command('create')">-->
        <!--					<i class="el-icon-plus"></i>-->
        <!--					<span>创建</span>-->
        <!--				</ElButton>-->
        <!-- <div class="agent-status" @click="handleCluster">
          <i class="status-color" :style="{ backgroundColor: agentVisible ? '#88E368' : '#F56C6C' }"></i>
          <span>{{ agentVisible ? 'Agent 正常' : 'Agent 异常' }}</span>
        </div> -->
        <!-- <ElDropdown class="btn" placement="bottom" @command="command">
          <i class="iconfont td-icon-shangchuan-copy"></i>
          <ElDropdownMenu slot="dropdown">
            <ElDropdownItem command="download"> 下载 Agent </ElDropdownItem>
            <ElDropdownItem command="fastdownload"> 快速下载 Agent </ElDropdownItem>
            <ElDropdownItem>操作引导</ElDropdownItem>
          </ElDropdownMenu>
        </ElDropdown> -->
        <!--				<ElDropdown class="btn" placement="bottom" @command="command">-->
        <!--					<i class="el-icon-question"></i>-->
        <!--					<ElDropdownMenu slot="dropdown">-->
        <!--						<ElDropdownItem command="help"> 帮助 </ElDropdownItem>-->
        <!--						<ElDropdownItem command="question"> 用户支持 </ElDropdownItem>-->
        <!--					</ElDropdownMenu>-->
        <!--				</ElDropdown>-->
        <!-- <ElDropdown class="btn" placement="bottom" @command="command">
          <i class="el-icon-s-tools"></i>
          <ElDropdownMenu slot="dropdown">
            <ElDropdownItem command="settings"> 系统设置 </ElDropdownItem>
            <ElDropdownItem command="setting"> 通知设置 </ElDropdownItem>
          </ElDropdownMenu>
        </ElDropdown> -->
        <!-- <ElDropdown
          v-if="$window.getSettingByKey('SHOW_LANGUAGE')"
          class="btn"
          placement="bottom"
          @command="changeLanguage"
        >
          <i
            class="iconfont"
            :class="{
              'icon-zhongwen1': lang === 'sc',
              'icon-yingwen1': lang === 'en',
              'icon-fanti': lang === 'tc'
            }"
            style="font-size: 18px"
          ></i>
          <ElDropdownMenu slot="dropdown">
            <ElDropdownItem v-for="(value, key) in languages" :key="key" :command="key">
              {{ value }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </ElDropdown> -->
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
      <!-- 新手指引 -->
      <NoviceGuide v-model="guideVisible" ref="noviceGuide"></NoviceGuide>
    </div>
  </ElHeader>
</template>
<script>
import HeaderCustomerService from './HeaderCustomerService'
// import AgentFail from './AgentFail';
import NoviceGuide from '../../views/GuidePage/NoviceGuide'
// import ws from '../../plugins/ws.js';
import VIcon from '@/components/VIcon'

export default {
  components: { HeaderCustomerService, NoviceGuide, VIcon },
  data() {
    return {
      user: window.__USER_INFO__ || {},
      isShowCustomerService: false,
      // agentVisible: false,
      guideVisible: false, // 指引窗
      isClose: false,
      btnLoading: false
    }
  },
  // created() {
  // 	this.handleWS();
  // 	this.handleAgentData();
  // },
  methods: {
    // // 第一次获取Agent数据
    // handleAgentData() {
    // 	this.$axios.get('tm/api/clusterStates').then(res => {
    // 		if (res && res.data && res.data.length) {
    // 			this.agentVisible = res.data[0].status === 'running' ? true : false;
    // 		}
    // 	});
    // },
    // 获取Agent长链接数据
    // handleWS() {
    // 	let parmas = {
    // 		user_id: this.user.userId,
    // 		type: 'watch',
    // 		collection: 'clusterState'
    // 	};
    // 	this.$nextTick(() => {
    // 		ws.send(parmas);
    // 	});
    // },
    // // 跳转集群列表
    // handleCluster() {
    // 	this.$router.push({ name: 'Instance' });
    // },
    showGuide(key) {
      this.command('create', key)
    },
    createTask() {
      this.$refs.noviceGuide?.goCreateTask?.()
    },
    command(command, key) {
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
        // case 'download':
        // 	downloadUrl = this.$router.resolve({ name: 'AgentDownload' });
        // 	window.open(downloadUrl.href, '_blank');
        // 	break;
        // case 'fastdownload':
        // 	downloadUrl = this.$router.resolve({ name: 'FastDownload' });
        // 	window.open(downloadUrl.href, '_blank');
        // 	break;
        case 'signOut':
          this.$confirm('您确定要退出登录吗？', '退出登录', {
            type: 'warning'
          }).then(res => {
            if (res) {
              location.href = './logout'
            }
          })
          break
        case 'create':
          //判断是否有实例
          this.guideVisible = true // 显示指引窗
          if (key) {
            this.$refs.noviceGuide?.nextFnc?.(key)
          }
          break
        case 'toCommunity':
          window.open('https://ask.tapdata.net/', '_blank')
          break
        case 'source-center':
          window.open('https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_readme', '_blank')
          break
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.dfs-header {
  position: absolute;
  top: 0;
  left: 0;
  //display: flex;
  //align-items: center;
  //justify-content: space-between;
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
</style>
