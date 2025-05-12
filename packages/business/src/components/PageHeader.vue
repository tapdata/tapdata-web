<script>
import { ArrowRight } from '@element-plus/icons-vue'
import { h } from 'vue'
import { plantRenderPara } from '../../utils/gogocodeTransfer'
export default {
  components: {
    Desciption: {
      props: {
        desc: [String, Function],
      },
      render() {
        if (this.desc) {
          if (
            Object.prototype.toString.call(this.desc) === '[object Function]'
          ) {
            return h(
              'span',
              plantRenderPara({ class: 'flex align-items-center' }),
              [this.desc(h, this.$t.bind(this))],
            )
          } else {
            return h('span', this.desc)
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
    '$route.name': function () {
      this.getBreadcrumb(this.$route)
    },
  },
  created() {
    this.getBreadcrumb(this.$route)
  },
  methods: {
    getBreadcrumb(route) {
      const matched = route.matched.slice(1)
      const data = []
      let isHidden = false

      // matched = matched.filter((item) => !item.redirect)

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
                  name: ['settingCenter', 'notification'].includes(route.name)
                    ? 'layout'
                    : route.name,
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

<template>
  <div v-show="!isHidden" class="page-header">
    <ElBreadcrumb
      v-if="breadcrumbData.length > 1"
      class="breadcrumb"
      :separator-icon="ArrowRight"
    >
      <ElBreadcrumbItem
        v-for="(item, i) in breadcrumbData"
        :key="i"
        :to="item.to"
      >
        {{ item.name }}
      </ElBreadcrumbItem>
    </ElBreadcrumb>
    <div v-else class="bg-white flex align-items-center px-4">
      <span class="fs-5 py-4 font-color-dark">{{
        $t($route.meta.title || '')
      }}</span>
      <ElDivider v-if="$route.meta.desc" class="mx-4" direction="vertical" />
      <Desciption
        class="flex align-items-center fs-7 font-color-sslight"
        :desc="$t($route.meta.desc || '')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.breadcrumb {
  height: 50px;
  line-height: 50px;
  padding-left: 24px;
  .el-breadcrumb__item:last-child .el-breadcrumb__inner,
  .el-breadcrumb__item:last-child .el-breadcrumb__inner a,
  .el-breadcrumb__item:last-child .el-breadcrumb__inner a:hover,
  .el-breadcrumb__item:last-child .el-breadcrumb__inner:hover {
    color: map.get($fontColor, normal) !important;
  }
}
</style>
