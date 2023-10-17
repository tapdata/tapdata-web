<template>
  <Header ref="header"></Header>
</template>

<script>
import Header from './Header'
export default {
  name: 'TheHeader',
  components: { Header },
  methods: {
    showGuide(key) {
      this.$nextTick(() => {
        this.$refs.header?.showGuide?.(key)
      })
    },
    createTask() {
      this.$refs.header?.createTask?.()
    },
    getUser() {
      this.$refs.header?.getUser?.()
    }
  }
}
</script>
