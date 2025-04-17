<script>
import { GitBook } from '@tap/component'
import axios from 'axios'

export default {
  components: { GitBook },
  props: {
    visible: Boolean,
    path: {
      type: String,
      default: 'data-inspect',
    },
  },
  data() {
    return {
      loading: false,
      mdContent: '',
    }
  },
  methods: {
    handleOpen() {
      this.loading = true
      axios
        .get(
          `static/docs/${this.path || 'data-inspect'}/${this.$i18n.locale?.toLowerCase() || 'en'}.md`.toLowerCase(),
          {
            responseType: 'blob',
            headers: {
              Accept: 'application/json',
              'Cache-Control': 'no-cache',
            },
          },
        )
        .then((res) => {
          this.mdContent = res.data
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>

<template>
  <ElDrawer
    append-to-body
    :modal="false"
    :title="$t('packages_dag_api_docs')"
    :size="680"
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    @open="handleOpen"
  >
    <div v-loading="loading">
      <GitBook :value="mdContent" class="" />
    </div>
  </ElDrawer>
</template>

<style lang="scss" scoped></style>
