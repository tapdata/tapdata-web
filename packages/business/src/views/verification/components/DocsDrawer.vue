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
    <div v-loading="loading">
      <GitBook :value="mdContent" class=""></GitBook>
    </div>
  </ElDrawer>
</template>

<script>
import axios from 'axios'
import { GitBook } from '@tap/component'

export default {
  props: {
    visible: Boolean,
    path: {
      type: String,
      default: 'data-inspect'
    }
  },
  components: { GitBook },
  data() {
    return {
      loading: false,
      mdContent: ''
    }
  },
  methods: {
    handleOpen() {
      this.loading = true
      axios
        .get(`static/docs/${this.path || 'data-inspect'}/${this.$i18n.locale || 'en'}.md`.toLowerCase(), {
          responseType: 'blob',
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache'
          }
        })
        .then(res => {
          this.mdContent = res.data
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped></style>
