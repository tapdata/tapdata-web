<template>
  <ElButton type="text" :loading="loading" @click="loadSchema">
    <template v-if="loading">
      <span>{{ progress }}</span>
    </template>
    <template v-else>
      <slot>
        <span>{{ $t('packages_business_components_stagebutton_chongxinjiazai') }}</span>
        <VIcon class="ml-1" size="9">icon_table_selector_load</VIcon>
      </slot>
    </template>
  </ElButton>
</template>

<script>
import i18n from '@tap/i18n'

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
      destroyStatus: false,
      title: i18n.t('packages_business_components_stagebutton_chongxinjiazai'),
      progress: '0%'
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
    this.destroyStatus = true
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
          this.progress = '0%'
          this.getProgress()
          this.startByConnection(data, true, false)
        })
    },

    getProgress(check = false) {
      if (this.destroyStatus) return
      if (!this.connectionId) return
      if (!check) {
        this.loading = true
      }
      connectionsApi.getNoSchema(this.connectionId).then(res => {
        if (res.loadFieldsStatus === 'loading') {
          this.progress = (Math.round((res.loadCount / res.tableCount) * 10000) / 100 || 0) + '%'
          setTimeout(this.getProgress, 1000)
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
          !check && this.$emit('complete')
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
