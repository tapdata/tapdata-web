<template>
  <div class="notification-left-sidebar">
    <div class="title">{{ $t('account.setCenter') }}</div>
    <ul>
      <li
        v-for="item in settingList"
        :key="item.icon"
        @click="changeName(item)"
        :class="isActive === item.key ? 'active' : ''"
      >
        <i :class="['iconfont', item.icon]"></i>
        <span slot="title">{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'subNav.vue',
  data() {
    return {
      settingList: [
        {
          icon: 'icon-shezhi1',
          name: this.$t('account.systemSetting'),
          key: 'setting'
        },
        {
          icon: 'icon-lingdang',
          name: this.$t('notification.setting'),
          key: 'notification'
        },
        {
          icon: 'icon-gerenzhongxin',
          name: this.$t('account.accountSettings'),
          key: 'account'
        }
      ],
      isActive: 'notification'
    }
  },
  mounted() {
    this.isActive =
      this.$route.params && this.$route.params.type
        ? this.$route.params.type
        : 'notification'
  },
  methods: {
    changeName(data) {
      this.isActive = data.key
      switch (data.key) {
        case 'setting':
          this.$router.push({
            name: 'settings'
          })
          break
        case 'notification':
          this.$router.push({
            path: '/notification/setting'
          })
          break
        case 'account':
          this.$router.push({
            name: 'account'
          })
          break
      }
    }
  }
}
</script>

<style scoped lang="less">
.notification-left-sidebar {
  background: rgba(250, 250, 250, 1);
  border: 1px solid rgba(230, 230, 232, 1);
  width: 250px;
  .title {
    height: 14px;
    font-size: 14px;
    font-weight: bold;
    color: rgba(51, 51, 51, 1);
    line-height: 34px;
    margin: 30px 20px;
  }
  ul {
    li {
      height: 44px;
      line-height: 44px;
      padding-left: 20px;
      cursor: pointer;
      i {
        color: #666;
      }
    }
    .active {
      background: #eeeeee;
    }
    // &:hover {
    // 	background: #eeeeee;
    // }
  }
}
</style>
<style lang="less">
.notification-left-sidebar .el-menu-vertical-demo {
  .el-menu-item is-active {
    background-color: #eee;
  }
}
</style>
