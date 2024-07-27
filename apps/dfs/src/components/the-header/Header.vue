<template>
  <!-- 头部导航 -->
  <ElHeader class="dfs-header" :class="{ isMockUser: mockUserId }">
    <div class="dfs-header__body">
      <router-link :to="{ name: 'Home' }" class="logo">
        <img src="../../assets/image/logo.svg" alt="" />
      </router-link>
      <!--<ElLink class="logo" @click="command('workbench')">
        <img src="../../assets/image/logo.svg" alt="" />
      </ElLink>-->
      <div class="dfs-header__button button-bar pr-4 fs-7 flex gap-4 align-center">
        <!--付费专业版-->
        <div class="vip-btn rounded-4 cursor-pointer flex align-center gap-1" @click="setUpgradeFeeVisible(true)">
          <VIcon size="18">icon-vip</VIcon>&nbsp;{{ $t('packages_component_src_upgradefee_dingyuezhuanyeban') }}
        </div>
        <!--加入slack-->
        <div
          v-if="!isDomesticStation"
          class="command-item position-relative inline-flex align-items-center rounded-4"
          @click="goSlack"
        >
          <ElImage class="slack-logo" :src="require('@/assets/image/slack.svg')" />
          <span class="cursor-pointer ml-1">{{ $t('dfs_the_header_header_jiaruSla') }}</span>
        </div>
        <!--线下部署-->
        <div class="command-item cursor-pointer flex align-center gap-1 rounded-4" @click="goOfflineDeploy">
          <VIcon size="16">deploy</VIcon>
          <span> {{ $t('dfs_offline_deployment') }} </span>
        </div>
        <!--我的工单-->
        <div class="command-item flex align-center gap-1 rounded-4" @click="goTicketSystem">
          <VIcon size="16">workorder</VIcon>
          <span class="cursor-pointer"> {{ $t('dfs_the_header_header_wodegongdan') }}</span>
        </div>
        <!--联系我们-->
        <div class="command-item flex align-center gap-1 rounded-4" @click="goContactUs">
          <VIcon size="16">consultation</VIcon>
          <span class="cursor-pointer">{{ $t('tap_contact_us') }}</span>
        </div>
        <!---demo环境-->
        <div
          v-if="domain === 'demo.cloud.tapdata.net' && lang !== 'en'"
          class="marquee-container cursor-pointer rounded-4"
        >
          <div class="marquee-box">
            <span>{{ $t('dfs_data_dashboard_Marquee') }}</span>
          </div>
        </div>
        <div v-if="domain === 'demo.cloud.tapdata.net' && lang === 'en'" class="block">
          <p class="words">{{ $t('dfs_data_dashboard_Marquee') }}</p>
        </div>

        <div
          class="command-item flex align-center gap-2 rounded-4"
          v-for="(item, i) in topBarLinks"
          :key="i"
          @click="handleGo(item)"
        >
          <VIcon v-if="item.icon" size="16">{{ item.icon }}</VIcon>
          <span class="cursor-pointer">{{ $t(item.text) }}</span>
        </div>

        <NotificationPopover class="command-item flex align-items-center rounded-4"></NotificationPopover>
        <ElDropdown class="command-item menu-user rounded-4" placement="bottom" :show-timeout="0" @command="command">
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

          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem command="userCenter" :disabled="$disabledReadonlyUserBtn()"
                >{{ $t('the_header_Header_yongHuZhongXin') }}
              </ElDropdownItem>
              <ElDropdownItem command="order">{{ $t('dfs_the_header_header_dingyuezhongxin') }}</ElDropdownItem>
              <ElDropdownItem command="home">
                {{ $t('header_official_website') }}
              </ElDropdownItem>
              <ElDropdownItem command="signOut" :disabled="$disabledReadonlyUserBtn()">
                {{ $t('header_sign_out') }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
    </div>
  </ElHeader>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import { VIcon } from '@tap/component'
import { langMenu, getCurrentLanguage, setCurrentLanguage } from '@tap/i18n/src/shared/util'
import { daysdifference, extractTimeFromObjectId } from '../../util'

import NotificationPopover from '@/views/workbench/NotificationPopover'

export default {
  inject: ['buried'],
  components: { VIcon, NotificationPopover },
  data() {
    let officialWebsiteAddress
    let docUrl

    if (this.$store.getters.isDomesticStation) {
      officialWebsiteAddress = 'https://tapdata.net'
      docUrl = 'https://docs.tapdata.net/'
    } else {
      officialWebsiteAddress = 'https://tapdata.io'
      docUrl = 'https://docs.tapdata.io/'
    }

    return {
      topBarLinks: [
        {
          text: 'header_manual', //使用手册
          link: docUrl,
          icon: 'send',
          type: 'handbook'
        }
      ],
      officialWebsiteAddress,
      lang: '',
      languages: langMenu,
      domain: document.domain,
      mockUserId: null,
      openUpgradeFee: false,
      isFeeUser: true,
    }
  },

  computed: {
    ...mapGetters(['isDomesticStation']),
    ...mapState(['user']),
    onlyEnglishLanguage() {
      return this.$store.state.config.onlyEnglishLanguage
    },
  },

  created() {
    this.lang = getCurrentLanguage()

    this.loadUserMock()
    this.getAgentCount()
  },
  methods: {
    ...mapMutations(['setUpgradeFeeVisible']),

    command(command) {
      // let downloadUrl = '';
      switch (command) {
        case 'workbench':
          this.$router.push({ name: 'Home' })
          break
        case 'home':
          window.open(this.officialWebsiteAddress, '_blank')
          break
        case 'userCenter':
          this.$router.push({
            name: 'userCenter',
          })
          break
        case 'order':
          this.$router.push({
            name: 'order',
          })
          break
        case 'signOut':
          this.$confirm(this.$t('header_log_out_tip'), this.$t('header_log_out_title'), {
            type: 'warning',
            confirmButtonText: this.$t('public_button_confirm'),
            cancelButtonText: this.$t('public_button_cancel'),
          }).then((res) => {
            if (res) {
              this.clearCookie()
              location.href = './logout'
            }
          })
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
    // 我的工单
    goTicketSystem() {
      this.$router.push({
        name: 'TicketSystem',
      })
    },
    // 联系我们
    goContactUs() {
      this.$router.push({
        name: 'userContactUs',
      })
    },
    //判断是否是付费用户
    getAgentCount() {
      this.$axios.get('api/tcm/agent/agentCount').then((data) => {
        this.isFeeUser = data?.subscriptionAgentCount > 0
      })
    },
    openUpgrade() {
      this.openUpgradeFee = true
    },
    goSlack() {
      window.open(this.$store.state.config.slackLink, '_blank')
    },
    goOfflineDeploy() {
      window.open(
        this.isDomesticStation
          ? 'https://tapdata.net/tapdata-on-prem/demo.html'
          : 'https://tapdata.mike-x.com/lV5o0?m=QkkvTrNtVq6jvQpX',
        '_blank'
      )
    },

    loadUserMock() {
      const mockUserPromise = this.$axios
        .get('api/gw/user', {
          maxRedirects: 0
        })
        .then(data => {
          this.mockUserId = data?.mockUserId || false
          this.$store.commit('setIsMockUser', this.mockUserId)
          return this.mockUserId
        })

      this.$store.commit('setMockUserPromise', mockUserPromise)
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
  position: relative;
  color: #fff;
  padding: 4px 8px;
  background: linear-gradient(93.39deg, #2c65ff 10.45%, #702cff 98.21%);
}

.slack-logo {
  height: 14px;
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
  100% {
    transform: translateX(-120px);
  }
}
</style>
