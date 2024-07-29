<template>
  <div class="flex flex-column h-100 page-container min-h-0">
    <div class="page-header" :class="headerClass">
      <ElBreadcrumb class="breadcrumb" v-if="breadcrumbData.length > 1" separator-class="el-icon-arrow-right">
        <ElBreadcrumbItem v-for="item in breadcrumbData" :key="item.name" :to="item.to">
          {{ item.name }}
        </ElBreadcrumbItem>
      </ElBreadcrumb>
      <div class="flex align-items-center px-4 bg-white rounded-lg" v-else>
        <span class="fs-5 py-4 font-color-dark mr-3">{{ $t($route.meta.title) }}</span>
        <slot name="left-actions"></slot>
        <template v-if="$route.meta.desc">
          <ElDivider class="mx-4" direction="vertical"></ElDivider>
          <Desciption class="flex align-items-center fs-7 font-color-sslight" :desc="$route.meta.desc"></Desciption>
        </template>

        <div class="flex-1"></div>
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="page-content" :class="contentClass">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import i18n from '@tap/i18n'
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
const breadcrumbData = ref([])
const isHidden = ref(false)

const props = defineProps({
  contentMode: {
    type: String,
    default: 'table', // full/auto/table
  },
})

const contentClass = computed(() => {
  const map = {
    table: 'pb-6 flex-1 min-h-0',
  }
  return map[props.contentMode]
  // return props.contentMode === 'full' ? 'overflow-hidden bg-white shadow-card' : ''
})

const headerClass = isDaas ? 'border-bottom' : 'bg-white rounded-lg mb-4'

const Desciption = {
  props: {
    desc: [String, Function],
  },
  render(h) {
    if (this.desc) {
      if (Object.prototype.toString.call(this.desc) === '[object Function]') {
        return h('span', { class: 'flex align-items-center' }, [this.desc(h, this.$t.bind(this))])
      } else {
        return h('span', this.$t(this.desc))
      }
    }
    return null
  },
}

const getBreadcrumb = () => {
  let matched = route.matched.slice(1)
  let data = []
  let _isHidden = false
  if (matched.length) {
    matched.forEach((route) => {
      _isHidden = route.meta?.hideTitle
      let to = {
        name: null,
      }
      if (route.meta?.doNotJump) {
        to = null
      }
      !_isHidden &&
        data.push({
          name: i18n.t(route.meta?.title),
          to,
        })
    })
  }
  isHidden.value = Boolean(_isHidden)
  breadcrumbData.value = data

  console.log('breadcrumbData', breadcrumbData)
}

watch(() => route.name, getBreadcrumb)

getBreadcrumb()
</script>

<!--<script>
export default {
  components: {
    Desciption: {
      props: {
        desc: [String, Function],
      },
      render(h) {
        if (this.desc) {
          if (Object.prototype.toString.call(this.desc) === '[object Function]') {
            return h('span', { class: 'flex align-items-center' }, [this.desc(h, this.$t.bind(this))])
          } else {
            return h('span', this.$t(this.desc))
          }
        }
        return null
      },
    },
  },
  data() {
    return {
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      breadcrumbData: [],
      isHidden: false,
    }
  },
  computed: {
    headerClass() {
      return this.isDaas ? 'border-bottom' : 'bg-white rounded-lg mb-4'
    },
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
      if (matched.length) {
        matched.forEach((route) => {
          isHidden = route.meta?.hideTitle
          let to = {
            name:
              route.name === this.$route.name
                ? null
                : ['settingCenter', 'notification'].includes(route.name)
                  ? 'layout'
                  : route.name,
          }
          if (route.meta?.doNotJump) {
            to = null
          }
          !isHidden &&
            data.push({
              name: this.$t(route.meta?.title),
              to,
            })
        })
      }
      this.isHidden = !!isHidden
      this.breadcrumbData = data
    },
  },
}
</script>-->
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
