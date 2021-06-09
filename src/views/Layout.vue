<template>
  <ElContainer :class="['layout-wrap']">
    <TheHeader ref="theHeader"></TheHeader>
    <ElAside class="left-aside" width="200px">
      <ElMenu :default-active="activeMenu" @select="menuTrigger">
        <ElMenuItem v-for="m in menus" :key="m.name" :index="m.path">
          <span class="mr-4" slot v-if="m.meta.icon"
            ><VIcon class="v-icon" size="12">{{ m.meta.icon }}</VIcon></span
          >
          <span slot="title">{{ m.meta.title }}</span>
        </ElMenuItem>
      </ElMenu>
    </ElAside>
    <ElContainer direction="vertical">
      <ElHeader class="header">
        <ElButton
          class="btn-back"
          style="margin-right: 10px;"
          size="mini"
          icon="iconfont td-icon-fanhui"
          v-if="breadcrumbData.length > 1"
          @click="back()"
        ></ElButton>
        <ElBreadcrumb class="breadcrumb">
          <ElBreadcrumbItem
            v-for="item in breadcrumbData"
            :key="item.name"
            :to="item.to"
          >
            {{ item.name }}
          </ElBreadcrumbItem>
        </ElBreadcrumb>
      </ElHeader>
      <ElMain class="main">
        <RouterView
          @show-guide="showGuide"
          @create-task="createTask"
        ></RouterView>
      </ElMain>
    </ElContainer>
  </ElContainer>
</template>

<script>
import TheHeader from '@/components/TheHeader'
import VIcon from '@/components/VIcon'
export default {
  components: {
    TheHeader,
    VIcon
  },
  data() {
    return {
      activeMenu: '',
      menus: [],
      dfsMenus: ['Workbench', 'Instance', 'Connection', 'Dataflow'],
      breadcrumbData: [],
      regionCount: {}
    }
  },
  created() {
    this.activeMenu = this.$route.path
    let menus = this.$router.options.routes
      .find(r => r.path === '/')
      .children?.filter(item => !item.hidden)
    if (this.$PLATFORM === 'dfs') {
      this.menus = this.dfsMenus.map(name => {
        return menus.find(item => item.name === name)
      })
    } else {
      this.menus = menus
    }
    this.getBreadcrumb(this.$route)
    this.getRegionCount()
  },
  computed: {
    regionMap() {
      return window.__REGION__.regionMap
    }
  },
  watch: {
    $route(route) {
      this.activeMenu = route.path
      this.getBreadcrumb(route)
    }
  },
  methods: {
    showGuide(key) {
      this.$refs.theHeader?.showGuide?.(key)
    },
    createTask() {
      this.$refs.theHeader?.createTask?.()
    },
    menuTrigger(path) {
      if (this.$route.path === path) {
        return
      }
      this.$router.push(path)
    },
    getBreadcrumb(route) {
      let matched = route.matched.slice(1)
      let data = []
      if (matched.length) {
        data = matched.map(route => {
          return {
            name: route.meta.title,
            to: {
              name: route.name === this.$route.name ? null : route.name
            }
          }
        })
      }
      this.breadcrumbData = data
    },
    getRegionCount() {
      let arr = []
      for (const key in this.regionMap) {
        arr.push({
          label: this.regionMap[key],
          value: key
        })
      }
      this.regionCount = arr
    },
    regionChange(v) {
      this.$router.replace({
        name: this.$route.name,
        query: {
          region: v
        }
      })
    },
    back() {
      this.$router.back()
    }
  }
}
</script>

<style lang="scss" scoped>
.layout-wrap {
  height: 100%;
  padding-top: 68px;
  .left-aside {
    border-right: 1px solid #f2f4f6;
    background: #fff;
    .el-menu-item {
      ::v-deep .v-icon {
        color: #888;
      }
      &.is-active {
        ::v-deep .v-icon {
          color: map-get($color, primary);
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
    background: #fff;
  }
  .main {
    display: flex;
    flex-direction: column;
    flex-basis: 0%;
  }
  .breadcrumb {
    line-height: 60px;
  }
  .btn-back {
    padding: 0;
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
}
</style>
