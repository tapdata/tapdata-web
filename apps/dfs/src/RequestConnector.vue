<template>
  <ElContainer class="layout-wrap">
    <!-- 头部导航 -->
    <ElHeader class="layout-header dfs-header" :class="{ isMockUser: mockUserId }">
      <div class="dfs-header__body">
        <ElLink class="logo" href="/">
          <img src="./assets/image/logo.svg" alt="" />
        </ElLink>
        <div class="dfs-header__button button-bar pr-4 fs-7 flex gap-4 align-center">
          <div class="command-item menu-user rounded-4">
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
          </div>
        </div>
      </div>
    </ElHeader>
    <ElContainer direction="vertical" class="layout-main position-relative">
      <ElMain class="main rounded-lg">
        <div class="g-panel-container flex-fill overflow-x-hidden"></div>
      </ElMain>
    </ElContainer>
  </ElContainer>
</template>

<script>
import { PageHeader } from '@tap/business'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'RequestConnector',
  data() {
    return {
      mockUserId: null
    }
  },
  computed: {
    ...mapGetters(['isDomesticStation']),
    ...mapState(['user'])
  }
}
</script>

<style lang="scss" scoped>
.layout-menu {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 90%;
}
.layout-main {
  padding: 0 16px 16px 16px;
}
.layout-wrap {
  height: 100%;
  padding-top: 52px;
  word-wrap: break-word;
  word-break: break-word;
  background: map-get($color, submenu);
  .left-aside {
    // border-right: 1px map-get($borderColor, aside) solid;
    background: map-get($color, submenu);
    .el-menu {
      background-color: map-get($color, submenu);
    }
    ::v-deep {
      .el-menu-item,
      .el-submenu__title {
        height: 50px;
        line-height: 50px;
        .v-icon {
          color: map-get($iconFillColor, normal);
        }
        &.is-active,
        &:hover {
          background-color: map-get($color, white);
          color: map-get($color, primary);
          border-radius: 8px;
        }
        &.is-active,
        &:hover {
          ::v-deep .v-icon {
            color: map-get($color, primary);
          }
        }

        .submenu-item {
          padding-left: 12px;
        }
      }
    }

    .product-name {
      padding-left: 20px;
      font-size: 14px;
      font-weight: 700;
      line-height: 60px;
      color: map-get($fontColor, normal);
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
      ::v-deep {
        .el-breadcrumb__inner {
          color: #000;
        }
      }
    }
    ::v-deep {
      .el-breadcrumb__separator {
        color: map-get($fontColor, sub);
      }
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
</style>
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
