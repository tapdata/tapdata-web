<template>
  <div v-show="!isHidden" class="page-header">
    <ElBreadcrumb class="breadcrumb" v-if="breadcrumbData.length > 1" :separator-icon="ArrowRight">
      <ElBreadcrumbItem v-for="(item, i) in breadcrumbData" :key="i" :to="item.to">
        {{ item.name }}
      </ElBreadcrumbItem>
    </ElBreadcrumb>
    <div class="bg-white flex align-items-center px-4" v-else>
      <span class="fs-5 py-4 font-color-dark">{{ $t($route.meta.title || '') }}</span>
      <ElDivider v-if="$route.meta.desc" class="mx-4" direction="vertical"></ElDivider>
      <Desciption
        class="flex align-items-center fs-7 font-color-sslight"
        :desc="$t($route.meta.desc || '')"
      ></Desciption>
    </div>
  </div>
</template>

<script>
import { plantRenderPara } from '../../utils/gogocodeTransfer'
import * as Vue from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
export default {
  components: {
    Desciption: {
      props: {
        desc: [String, Function],
      },
      render() {
        if (this.desc) {
          if (Object.prototype.toString.call(this.desc) === '[object Function]') {
            return Vue.h('span', plantRenderPara({ class: 'flex align-items-center' }), [
              this.desc(Vue.h, this.$t.bind(this)),
            ])
          } else {
            return Vue.h('span', this.desc)
          }
        }
        return null
      },
    },
  },
  data() {
    return {
      breadcrumbData: [],
      isHidden: false,
      ArrowRight,
    }
  },
  watch: {
    '$route.name'() {
      this.getBreadcrumb(this.$route)
    },
  },
  created() {
    this.getBreadcrumb(this.$route)
  },
  methods: {
    getBreadcrumb(route) {
      let matched = route.matched.slice(1)
      let data = []
      let isHidden = false

      matched = matched.filter((item) => !item.redirect)

      if (matched.length) {
        matched.forEach((route) => {
          isHidden = route.meta?.hideTitle
          if (/^\/.*\/$/.test(route.path)) {
            data.pop()
          }
          let to =
            route.name === this.$route.name
              ? null
              : {
                  name: ['settingCenter', 'notification'].includes(route.name) ? 'layout' : route.name,
                }
          if (route.meta?.doNotJump) {
            to = null
          }

          !isHidden &&
            data.push({
              name: this.$t(route.meta?.title || ''),
              to,
            })
        })
      }

      this.isHidden = !!isHidden
      this.breadcrumbData = data
      console.log('data', data)
    },
  },
}
</script>

<style lang="scss" scoped>
.breadcrumb {
  height: 50px;
  line-height: 50px;
  padding-left: 24px;
  .el-breadcrumb__item:last-child .el-breadcrumb__inner,
  .el-breadcrumb__item:last-child .el-breadcrumb__inner a,
  .el-breadcrumb__item:last-child .el-breadcrumb__inner a:hover,
  .el-breadcrumb__item:last-child .el-breadcrumb__inner:hover {
    color: map-get($fontColor, normal) !important;
  }
}
</style>
