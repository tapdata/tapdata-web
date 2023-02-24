<template>
  <div v-show="!isHidden">
    <ElBreadcrumb class="breadcrumb" v-if="breadcrumbData.length > 1" separator-class="el-icon-arrow-right">
      <ElBreadcrumbItem v-for="item in breadcrumbData" :key="item.name" :to="item.to">
        {{ item.name }}
      </ElBreadcrumbItem>
    </ElBreadcrumb>
    <div class="flex align-items-center" v-else>
      <span class="page-header-title font-color-dark">{{ $t($route.meta.title) }}</span>
      <Desciption
        class="flex align-items-center ml-4 fs-basic-16 font-color-light"
        :desc="$t($route.meta.desc)"
      ></Desciption>
    </div>
  </div>
</template>

<script>
import { plantRenderPara } from '../utils/gogocodeTransfer'
import * as Vue from 'vue'
export default {
  components: {
    Desciption: {
      props: {
        desc: [String, Function]
      },
      render() {
        if (this.desc) {
          if (Object.prototype.toString.call(this.desc) === '[object Function]') {
            return Vue.h('span', plantRenderPara({ class: 'flex align-items-center' }), [
              this.desc(Vue.h, this.$t.bind(this))
            ])
          } else {
            return Vue.h('span', this.desc)
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
.breadcrumb {
  height: 50px;
  line-height: 50px;
  margin-left: 24px;
  .el-breadcrumb__item:last-child .el-breadcrumb__inner,
  .el-breadcrumb__item:last-child .el-breadcrumb__inner a,
  .el-breadcrumb__item:last-child .el-breadcrumb__inner a:hover,
  .el-breadcrumb__item:last-child .el-breadcrumb__inner:hover {
    color: map-get($fontColor, normal) !important;
  }
}
</style>
