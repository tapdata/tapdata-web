<template>
  <ElButton type="text" :loading="loading" @click="loadSchema">
    <template v-if="loading">
      <span>{{ progress }}</span>
    </template>
    <template v-else>
      <slot>
        <span>重新加载</span>
        <VIcon class="ml-1" size="9">icon_table_selector_load</VIcon>
      </slot>
    </template>
  </ElButton>
</template>

<script>
import { connectionsApi } from '@tap/api'

export default {
  name: 'StageButton',

  props: {
    connectionId: String
  },

  data() {
    return {
      loading: false,
      title: '重新加载',
      progress: ''
    }
  },

  watch: {
    connectionId(v) {
      v && this.init()
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    init() {
      this.loading = false
      this.getProgress(true)
    },

    loadSchema() {
      connectionsApi
        .updateById(this.connectionId, {
          loadCount: 0,
          loadFieldsStatus: 'loading'
        })
        .then(() => {
          this.getProgress()
        })
    },

    getProgress(check = false) {
      if (!this.connectionId) return
      if (!check) {
        this.loading = true
      }
      this.progress = '0'
      connectionsApi.getNoSchema(this.connectionId).then(res => {
        if (res.loadFieldsStatus !== 'finished') {
          setTimeout(this.getProgress, 2000)
        } else {
          this.progress = 100 + '%'
          setTimeout(() => {
            this.$emit('complete')
            this.loading = false
          }, 1000)
        }
      })
    }
  }
}
</script>

<style scoped></style>
