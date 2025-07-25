<script>
import {
  getConnectionNoSchema,
  metadataInstancesApi,
  updateConnectionById,
} from '@tap/api'
import i18n from '@tap/i18n'

import { mapActions } from 'vuex'

export default {
  name: 'StageButton',
  props: {
    connectionId: String,
    taskId: String,
    nodeId: String,
    label: {
      type: String,
      default: () => {
        return i18n.t('public_button_reload')
      },
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      destroyStatus: false,
      progress: '0%',
    }
  },
  watch: {
    connectionId(v) {
      v && this.init()
    },
  },
  mounted() {
    this.init()
  },
  beforeUnmount() {
    this.destroyStatus = true
    clearTimeout(this.timer)
  },
  methods: {
    ...mapActions('dataflow', ['updateDag']),

    init() {
      this.loading = false
      this.getProgress(true)
    },

    loadSchema() {
      if (this.disabled) return
      updateConnectionById(this.connectionId, {
        loadCount: 0,
        loadFieldsStatus: 'loading',
      }).then((data) => {
        this.progress = '0%'
        this.getProgress()
        this.$emit('start')
        this.startByConnection(data, true, false)
      })
    },

    getProgress(check = false) {
      if (this.disabled) return
      if (this.destroyStatus) return
      if (!this.connectionId) return
      if (!check) {
        this.loading = true
      }
      clearTimeout(this.timer)
      getConnectionNoSchema(this.connectionId).then((res) => {
        if (res.loadFieldsStatus === 'loading') {
          this.progress = `${
            Math.round((res.loadCount / res.tableCount) * 10000) / 100 || 0
          }%`
          this.timer = setTimeout(this.getProgress, 1000)
        } else {
          this.progress = `${100}%`
          const { taskId, nodeId } = this
          if (!check && taskId && nodeId) {
            metadataInstancesApi
              .deleteLogicSchema(taskId, {
                nodeId,
              })
              .then(this.updateDag)
          }
          !check && this.$emit('complete') // 防止跟父组件的加载重复
          this.loading = false
        }
      })
    },

    startByConnection(connection, updateSchema, editTest) {
      const msg = {
        type: 'testConnection',
        data: connection,
      }
      msg.data.updateSchema = false
      msg.data.editTest = false
      if (updateSchema) {
        msg.data.updateSchema = updateSchema
      }
      if (editTest) {
        msg.data.editTest = editTest
      }
      this.$ws.ready(() => {
        this.$ws.send(msg)
        this.$ws.once('401', () => {
          this.$ws.send(msg)
        })
      })
    },
  },
  emits: ['start', 'complete'],
}
</script>

<template>
  <ElButton
    text
    type="primary"
    :loading="loading"
    :disabled="disabled"
    @click="loadSchema"
  >
    <template v-if="loading">
      <span>{{ progress }}</span>
    </template>

    <slot v-if="!$slots.icon && !loading">
      <span>{{ label }}</span>
      <VIcon class="ml-1" size="9">icon_table_selector_load</VIcon>
    </slot>

    <template v-if="$slots.icon && !loading" #icon>
      <slot name="icon" />
    </template>
  </ElButton>
</template>
