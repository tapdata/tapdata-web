<template>
  <div class="main-view-header py-4 px-5">
    <ElBreadcrumb v-if="breadcrumbData.length > 1" separator-class="el-icon-arrow-right">
      <ElBreadcrumbItem v-for="item in breadcrumbData" :key="item.name" :to="item.to">
        {{ item.name }}
      </ElBreadcrumbItem>
    </ElBreadcrumb>
    <div class="header" v-else>
      <span class="title fs-6">{{ $t($route.meta.title) }}</span>
      <Desciption class="desc ml-4" :desc="$route.meta.desc"></Desciption>
    </div>
  </div>
</template>

<style scoped lang="scss">
.main-view-header {
  background: #eff1f4;
  .header {
    display: flex;
    align-items: center;
  }
  .title {
    color: map-get($fontColor, dark);
    line-height: 25px;
  }
  .desc {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: map-get($fontColor, light);
    line-height: 17px;
  }
  .desc-body {
    display: flex;
    align-items: center;
  }
}
</style>

<script>
export default {
  components: {
    Desciption: {
      props: {
        desc: [String, Function]
      },
      render(h) {
        if (this.desc) {
          if (Object.prototype.toString.call(this.desc) === '[object Function]') {
            return h('span', { class: 'desc-body' }, [this.desc(h, this.$t.bind(this))])
          } else {
            return h('span', this.desc)
          }
        }
        return null
      }
    }
  },
  data() {
    return {
      breadcrumbData: []
    }
  },
  watch: {
    '$route.name'() {
      this.getBreadcrumb(this.$route)
    }
  },
  created() {
    this.getBreadcrumb(this.$route)
  },
  methods: {
    getBreadcrumb(route) {
      let matched = route.matched.slice(1)
      let data = []
      if (matched.length) {
        matched.forEach(route => {
          if (/^\/.*\/$/.test(route.path)) {
            data.pop()
          }
          let to = {
            name:
              route.name === this.$route.name
                ? null
                : ['settingCenter', 'notification'].includes(route.name)
                ? 'layout'
                : route.name
          }
          if (route.meta?.doNotJump) {
            to = null
          }
          data.push({
            name: this.$t(route.meta?.title),
            to
          })
        })
      }
      this.breadcrumbData = data
    }
  }
}
</script>
