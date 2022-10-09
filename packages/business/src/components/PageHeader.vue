<template>
  <div v-show="!isHidden">
    <ElBreadcrumb v-if="breadcrumbData.length > 1" separator-class="el-icon-arrow-right">
      <ElBreadcrumbItem v-for="item in breadcrumbData" :key="item.name" :to="item.to" disabled class="iskai">
        {{ item.name }}
      </ElBreadcrumbItem>
    </ElBreadcrumb>
    <div class="header" v-else>
      <span class="title fs-6">{{ $t($route.meta.title) }}</span>
      <Desciption class="desc ml-4" :desc="$route.meta.desc"></Desciption>
    </div>
  </div>
</template>

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
      breadcrumbData: [],
      isHidden: false
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
      let isHidden = false
      if (matched.length) {
        matched.forEach(route => {
          isHidden = route.meta?.hideTitle
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
      this.isHidden = !!isHidden
      this.breadcrumbData = data
    }
  }
}
</script>

<style lang="scss" scoped>
.main-view-header {
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
