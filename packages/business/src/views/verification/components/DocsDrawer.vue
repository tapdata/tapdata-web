<template>
  <ElDrawer
    append-to-body
    :modal="false"
    :title="$t('packages_dag_api_docs')"
    :size="680"
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    @open="handleOpen"
  >
    <GitBook :value="mdContent" class=""></GitBook>
  </ElDrawer>
</template>

<script>
import axios from 'axios'
import { GitBook } from '@tap/component'

export default {
  props: {
    visible: Boolean
  },
  components: { GitBook },
  data() {
    return {
      mdContent: ''
    }
  },
  methods: {
    handleOpen() {
      if (!this.mdContent) {
        axios
          .get(`static/docs/data-inspect/${this.$i18n.locale || 'en'}.md`, {
            responseType: 'blob',
            headers: {
              Accept: 'application/json',
              'Cache-Control': 'no-cache'
            }
          })
          .then(res => {
            this.mdContent = res.data
          })
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
