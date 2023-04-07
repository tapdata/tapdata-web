<template>
  <ElDialog
    :title="title"
    :visible="visible"
    :append-to-body="true"
    width="800px"
    top="10vh"
    custom-class="connection-dialog ldp-conection-dialog flex flex-column"
    @close="handleClose"
    @open="handleOpen"
  >
    <ElForm v-loading="loading" ref="form" label-position="left" label-width="150px" :model="editForm" class="my-n6">
      <ElFormItem size="mini" label="应用名" prop="name" required>
        <ElInput v-model="editForm.name" clearable></ElInput>
      </ElFormItem>
      <ElFormItem size="mini" label="应用描述" prop="description" required>
        <ElInput v-model="editForm.description" type="textarea"></ElInput>
      </ElFormItem>
    </ElForm>
    <span class="dialog-footer" slot="footer">
      <ElButton @click="handleClose" size="mini">{{ $t('public_button_cancel') }}</ElButton>
      <ElButton size="mini" type="primary" @click="handleSave">{{ $t('public_button_save') }}</ElButton>
    </span>
  </ElDialog>
</template>

<script>
import i18n from '@tap/i18n'
import dayjs from 'dayjs'
import { logcollectorApi } from '@tap/api'

export default {
  name: 'Editor',
  props: {
    title: {
      type: String,
      default: () => {
        return i18n.t('packages_business_shared_list_edit_title')
      }
    },
    visible: {
      required: true,
      value: Boolean
    },
    taskId: {
      required: true,
      value: Boolean
    }
  },
  data() {
    return {
      loading: false,
      editForm: {}
    }
  },
  methods: {
    init() {
      this.editForm = {
        id: '',
        name: '',
        description: ''
      }
      this.taskId && this.loadData(this.taskId)
    },

    loadData(id) {
      this.loading = true
      logcollectorApi
        .getDetail(this.taskId)
        .then(task => {
          this.editForm.name = task.name
          this.editForm.storageTime = task.storageTime
          let syncPoints = task.syncPoints
          if (syncPoints) {
            this.editForm.syncPoints = syncPoints
          } else {
            const [connectionId, connectionName] = Object.entries(task.connections[0])[0]
            const sourceNodeIds = (task.dag?.edges || []).map(t => t.source)
            const sourceNodes = (task.dag?.nodes || [])
              .filter(node => sourceNodeIds.includes(node.id))
              .map(node => ({
                nodeId: node.id,
                nodeName: node.name,
                connectionId: connectionId,
                connectionName: connectionName
              }))
            const result = sourceNodes.map(item => {
              const point = {
                ...item,
                timeZone: this.systemTimeZone,
                pointType: 'current', // localTZ: 本地时区； connTZ：连接时区
                dateTime: ''
              }
              return point
            })
            this.editForm.syncPoints = result
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    handleOpen() {
      this.init()
    },

    handleClose() {
      this.$emit('visible', false)
      this.$emit('update:visible', false)
    },

    handleSave() {
      this.$refs.form?.validate(valid => {
        if (valid) {
          logcollectorApi.patchId(this.taskId, this.editForm).then(() => {
            this.$emit('success', ...arguments)
            this.$message.success(this.$t('packages_business_shared_cdc_setting_message_edit_save'))
            this.init()
            this.handleClose()
          })
        }
      })
    }
  }
}
</script>
