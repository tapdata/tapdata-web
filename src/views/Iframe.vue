<template>
  <section class="iframe-wrap" v-if="!$route.children">
    <iframe v-if="link" :ref="'frame'" :src="link" frameborder="0" style="width: 100%; height: 100%"></iframe>
  </section>
  <RouterView v-else></RouterView>
</template>

<script>
import { queryParams } from '../util'

let getLink = (params, link) => {
  if (params && Object.keys(params).length) {
    for (let key in params) {
      let value = params[key]
      link = link.replace(':' + key, value)
    }
  }
  return link
}
export default {
  data() {
    return {
      link: ''
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(route) {
        this.link = ''
        this.$nextTick(() => {
          this.link = getLink(route.params, route?.meta?.link) + queryParams(route.query, true)
        })
      }
    }
  },
  mounted() {
    this.initRouteChangeHandler()
  },
  methods: {
    initRouteChangeHandler() {
      let routes = this.$router.options.routes.find(r => r.path === '/').children.concat()
      routes.push(...this.$router.options.routes)
      let findRoute = (list, path) => {
        let result = null
        for (let i = 0; i < list.length; i++) {
          let route = list[i]
          if (route?.meta?.link === './tm/#' + path) {
            result = route
          } else if (route.children) {
            result = findRoute(route.children, path)
          }
          if (result) {
            break
          }
        }
        return result
      }
      this.$nextTick(() => {
        window.emitRouteChange = to => {
          if (to.matched.length) {
            let path = to.matched[to.matched.length - 1].path
            if (this.$route?.meta?.link === './tm/#' + path || this.link === './tm/#' + to.fullPath) {
              return
            }
            let route = findRoute(routes, path)
            if (route) {
              this.$router
                .push({
                  name: route.name,
                  params: to.params,
                  query: to.query
                })
                .catch(() => {})
              return true
              // this.link = './tm/#' + to.fullPath
            }
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.iframe-wrap {
  height: 100%;
}
</style>
