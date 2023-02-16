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
import { mapActions } from 'vuex'

import { connectionsApi, metadataInstancesApi } from '@tap/api'

export default {
  name: 'StageButton',

  props: {
    connectionId: String,
    taskId: String,
    nodeId: String
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

  beforeDestroy() {
    clearTimeout(this.timer)
  },

  methods: {
    ...mapActions('dataflow', ['updateDag']),

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
        .then(data => {
          this.getProgress()
          this.startByConnection(data, true, false)
        })
    },

    getProgress(check = false) {
      if (!this.connectionId) return
      if (!check) {
        this.loading = true
      }
      this.progress = '0'
      clearTimeout(this.timer)
      connectionsApi.getNoSchema(this.connectionId).then(res => {
        if (res.loadFieldsStatus === 'loading') {
          this.timer = setTimeout(this.getProgress, 1000)
        } else {
          this.progress = 100 + '%'
          const { taskId, nodeId } = this
          if (!check && taskId && nodeId) {
            metadataInstancesApi
              .logicSchema(taskId, {
                nodeId
              })
              .then(this.updateDag)
          }
          !check && this.$emit('complete') // 防止跟父组件的加载重复
          this.loading = false
        }
      })
    },

    startByConnection(connection, updateSchema, editTest) {
      let msg = {
        type: 'testConnection',
        data: connection
      }
      msg.data['updateSchema'] = false
      msg.data['editTest'] = false
      if (updateSchema) {
        msg.data['updateSchema'] = updateSchema
      }
      if (editTest) {
        msg.data['editTest'] = editTest
      }
      this.$ws.ready(() => {
        this.$ws.send(msg)
        this.$ws.once('401', () => {
          this.$ws.send(msg)
        })
      })
    }
  }
}
</script>

<style scoped></style>
