<template>
  <iframe
    src="./old/index.html#/"
    frameborder="0"
    style="display: block; height: 100%; width: 100%"
    @load="loadFrame"
  ></iframe>
</template>

<script>
import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
let count = 0
export default {
  created() {
    this.getUrl()
    window.updateFavMenu = () => {
      $emit(this.$root, 'updateMenu')
    }
  },
  watch: {
    $route() {
      this.getUrl()
    }
  },
  methods: {
    loadFrame() {
      if (!window.frames[0].window.location.href.includes('/old/')) {
        window.location.reload()
      }
    },
    getUrl() {
      let route = this.$route
      this.$nextTick(() => {
        let frame = window.frames[0]
        if (frame) {
          let router = frame.window.gRouter
          count += 1
          if (router) {
            router.replace({
              name: route.name,
              query: Object.assign(route.query, { isNext: count }),
              params: route.params
            })
          } else {
            setTimeout(this.getUrl, 500)
          }
        }
      })
    }
  },
  emits: ['updateMenu']
}
</script>
