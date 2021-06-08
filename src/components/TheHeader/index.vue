<template>
  <Header ref="dfsHeader"></Header>
</template>

<script>
import Header from './Header'
export default {
  name: 'TheHeader',
  components: { Header },
  data() {
    return {
      headerType: process.env.VUE_APP_HEADER,
      env: process.env.VUE_APP_ENV
    }
  },
  methods: {
    showGuide(key) {
      this.$nextTick(() => {
        this.$refs.dfsHeader?.showGuide?.(key)
      })
    },
    createTask() {
      this.$refs.dfsHeader?.createTask?.()
    }
  }
}
</script>
