<template>
  <ElButton type="text" :loading="loading" @click="getProgress">
    <template v-if="loading">
      <span>{{ progress }}</span>
    </template>
    <template v-else>
      <slot>
        <span>重新加载</span>
        <VIcon class="ml-1" size="9">icon_table_selector_load</VIcon>
      </slot>
    </template>
    <!--    <span>{{ $t('packages_form_button_reload') }}</span>-->
    <!--    <VIcon class="ml-1" size="9">icon_table_selector_load</VIcon>-->
    <!--    <span>{{ loading ? progress : title }}</span>-->
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

  mounted() {
    this.getProgress()
  },

  methods: {
    getProgress() {
      if (!this.connectionId) return
      this.loading = true
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
