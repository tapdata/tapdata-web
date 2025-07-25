<script>
import mockSourceIcon from '@tap/assets/icons/connections/mock-source.svg'
import mockTargetIcon from '@tap/assets/icons/connections/mock-target.svg'
import mongodbIcon from '@tap/assets/icons/connections/mongodb.svg'
import mysqlIcon from '@tap/assets/icons/connections/mysql.svg'

import Cookie from '@tap/shared/src/cookie'
import { $on } from '@tap/shared/src/event'
import { mapGetters, mapState } from 'vuex'

export default {
  inject: ['checkAgent', 'buried'],
  data() {
    return {
      continueUse: '',
      suggestion: '',
      sourceList: [
        {
          type: 'mysql',
          icon: mysqlIcon,
        },
        {
          type: 'dummy',
          icon: mockSourceIcon,
        },
        {
          type: 'mongodb',
          icon: mongodbIcon,
        },
      ],
      targetList: [
        {
          type: 'mysql',
          icon: mysqlIcon,
        },
        {
          type: 'dummy',
          icon: mockTargetIcon,
        },
        {
          type: 'mongodb',
          icon: mongodbIcon,
        },
      ],
    }
  },

  computed: {
    ...mapGetters(['isDomesticStation']),
    ...mapState(['user']),
  },

  created() {
    if (!this.$store.state.config?.disabledOnlineChat) {
      this.loadChat()
    }

    $on(this.$root, 'select-connection-type', this.selectConnectionType)
    $on(this.$root, 'show-guide', this.showGuide)
    $on(this.$root, 'get-user', this.getUser)
  },
  mounted() {
    //获取cookie 是否用户有操作过 稍后部署 且缓存是当前用户 不在弹窗
    const user = window.__USER_INFO__
    this.userInfo = user
    //检查是云市场用户授权码有效期
    // if (user?.enableLicense) {
    //   this.checkLicense(user)
    // }
    const isCurrentUser = Cookie.get('deployLaterUser') === user?.userId
    if (Cookie.get('deployLater') == 1 && isCurrentUser) return
  },
  methods: {
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

    loadChat() {
      const $zoho = $zoho || {}
      const { isDomesticStation } = this
      $zoho.salesiq = $zoho.salesiq || {
        widgetcode: isDomesticStation
          ? '39c2c81d902fdf4fbcc9b55f1268168c6d58fe89b1de70d9adcb5c4c13d6ff4d604d73c57c92b8946ff9b4782f00d83f'
          : 'siqc6975654b695513072e7c944c1b63ce0561c932c06ea37e561e3a2f7fe5ae1f7',
        values: {},
        ready() {},
      }
      window.$zoho = $zoho
      const d = document
      const s = d.createElement('script')
      s.type = 'text/javascript'
      s.id = 'zsiqscript'
      s.defer = true
      s.src = isDomesticStation
        ? 'https://salesiq.zoho.com.cn/widget'
        : 'https://salesiq.zohopublic.com/widget'
      const t = d.querySelectorAll('script')[0]
      t.parentNode.insertBefore(s, t)
      this.hideCustomTip()

      $zoho.salesiq.ready = function () {
        const user = window.__USER_INFO__
        $zoho.salesiq.visitor.contactnumber(user.telephone)
        $zoho.salesiq.visitor.info({
          tapdata_username: user.nickname || user.username,
          tapdata_phone: user.telephone,
          tapdata_email: user.email,
        })

        $zoho.salesiq.addEventListener('load', function () {
          const siqiframe = document.querySelector('#siqiframe')

          if (siqiframe) {
            const style = document.createElement('style')
            style.type = 'text/css'
            style.innerHTML = `.botactions em { white-space: nowrap; }`
            siqiframe.contentWindow.document
              .querySelectorAll('head')
              .item(0)
              .append(style)
          }
        })
      }
    },

    handleCreateTask() {
      const { expand } = this.$store.state.guide

      Object.assign(expand, {
        continueUse: this.continueUse,
        suggestion: this.suggestion,
      })

      this.$axios.post('api/tcm/user_guide', {
        expand,
      })

      this.$router.replace({
        name: 'MigrateForm',
        query: {
          guide: true,
        },
      })
    },

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
          this.$confirm(
            this.$t('header_log_out_title'),
            this.$t('header_log_out_tip'),
          ).then((res) => {
            if (res) {
              this.clearCookie()
              location.href = './logout'
            }
          })
          break
      }
    },

    clearCookie() {
      const keys = document.cookie.match(/[^ =;]+(?==)/g)
      if (keys) {
        for (let i = keys.length; i--; ) {
          document.cookie = `${keys[i]}=0;path=/;domain=${
            document.domain
          };expires=${new Date(0).toUTCString()}`
        }
      }
    },
  },
}
</script>

<template>
  <ElContainer
    :class="['layout-wrap', $i18n && $i18n.locale]"
    class="position-relative"
  >
    <ElHeader class="layout-header bg-transparent z-10 dfs-header">
      <div class="dfs-header__body flex">
        <ElLink class="logo ml-2">
          <img src="../../assets/image/logo.svg" alt="logo" />
        </ElLink>
        <div
          class="dfs-header__button button-bar pr-4 fs-7 flex gap-4 align-center"
        >
          <ElDropdown
            class="command-item menu-user rounded-4"
            placement="bottom"
            :show-timeout="0"
            @command="command"
          >
            <div class="username flex align-items-center">
              <img
                v-if="user.avatar"
                :src="user.avatar"
                alt=""
                class="mr-2"
                style="width: 30px; height: 30px; border-radius: 50%"
              />
              <VIcon v-else class="mr-2" size="20">account</VIcon>
              <span>{{
                user.username || user.nickname || user.phone || user.email
              }}</span>
            </div>

            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem command="signOut">
                  {{ $t('header_sign_out') }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </div>
      </div>
    </ElHeader>

    <ElContainer direction="vertical" class="layout-main p-0">
      <ElMain class="main rounded-lg p-4 pb-0 mb-4">
        <RouterView />
      </ElMain>
    </ElContainer>
  </ElContainer>
</template>

<style lang="scss" scoped>
.layout-main {
  padding: 0 16px 16px 16px;
}

.layout-wrap {
  height: 100%;
  padding-top: 52px;
  word-wrap: break-word;
  word-break: break-word;
  background: var(--color-submenu);

  .left-aside {
    // border-right: 1px var(--border-aside) solid;
    background: var(--color-submenu);

    .el-menu {
      background-color: var(--color-submenu);
    }

    :deep(.el-menu-item),
    :deep(.el-submenu__title) {
      height: 50px;
      line-height: 50px;

      .v-icon {
        color: var(--icon-n2);
      }

      &.is-active,
      &:hover {
        background-color: var(--color-white);
        color: var(--color-primary);
        border-radius: 8px;
      }

      &.is-active,
      &:hover {
        :deep(.v-icon) {
          color: var(--color-primary);
        }
      }

      .submenu-item {
        padding-left: 12px;
      }
    }

    .product-name {
      padding-left: 20px;
      font-size: 14px;
      font-weight: 700;
      line-height: 60px;
      color: var(--text-normal);
    }
  }

  .header {
    display: flex;
    align-items: center;
    font-size: 14px;
  }

  .main {
    display: flex;
    flex-direction: column;
    flex-basis: 0%;
    margin: 0;
    padding: 0;
    //background: rgba(239, 241, 244, 1);
  }

  .breadcrumb {
    padding: 24px 0 24px 24px;
    //height: 40px;
    box-sizing: border-box;

    &.one-breadcrumb {
      font-size: 18px;

      :deep(.el-breadcrumb__inner) {
        color: #000;
      }
    }

    :deep(.el-breadcrumb__separator) {
      color: var(--text-light);
    }
  }

  .btn-back {
    padding: 0;
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .el-menu-item.is-active .agent-warning-icon {
    display: none;
  }
}

.dfs-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 52px !important;
  padding: 0 7px;
  background: var(--color-submenu);
  box-sizing: border-box;
  .logo {
    display: block;
    width: auto;
    height: 30px;
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
      color: var(--text-light);
      &:hover {
        color: var(--color-primary);
        background-color: var(--color-white);
        border-radius: 4px;
        &.icon {
          color: var(--color-primary);
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
</style>

<style>
.zsiqfanim,
.zsiqfanim *,
.siqanim,
.siqanim * {
  pointer-events: all;
}

.driver-popover {
  max-width: 520px;
}

.replication-driver-popover {
  .driver-popover-footer {
    margin-top: 8px;
  }
}
</style>
