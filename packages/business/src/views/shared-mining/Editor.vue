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
    <ElForm
      v-loading="loading"
      ref="form"
      label-position="left"
      label-width="150px"
      :model="editForm"
      :rules="rulesEdit"
      class="my-n6"
    >
      <ElFormItem size="mini" :label="$t('packages_business_shared_form_edit_name')" prop="name">
        <ElInput clearable v-model="editForm.name"></ElInput>
      </ElFormItem>
      <ElFormItem size="mini" :label="$t('packages_business_shared_form_setting_log_time')">
        <ElSelect v-model="editForm.storageTime" :placeholder="$t('public_select_placeholder')">
          <ElOption v-for="op in logSaveList" :key="op" :label="op + $t('public_time_d')" :value="op"> </ElOption>
        </ElSelect>
      </ElFormItem>
      <ElFormItem size="mini" :label="$t('packages_business_shared_list_edit_title_start_time')">
        <div v-for="(item, index) in editForm.syncPoints" :key="index">
          <ElSelect v-model="item.pointType" :placeholder="$t('public_select_placeholder')">
            <ElOption v-for="op in pointTypeOptions" :key="op.value" :label="op.label" :value="op.value"></ElOption>
          </ElSelect>
          <ElDatePicker
            v-if="item.pointType !== 'current'"
            v-model="item.dateTime"
            :picker-options="getPickerOptions(item.dateTime, item)"
            popperClass="hide-current__dateTime"
            type="datetime"
            format="yyyy-MM-dd HH:mm:ss"
            valueFormat="timestamp"
            class="ml-4"
          ></ElDatePicker>
        </div>
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
      editForm: {
        id: '',
        name: '',
        storageTime: 3,
        syncPoints: []
      },
      rulesEdit: {
        name: [{ required: true, message: this.$t('packages_business_shared_cdc_name'), trigger: 'blur' }]
      },
      logSaveList: [1, 2, 3, 4, 5, 6, 7],
      pointTypeOptions: [
        {
          label: this.$t('public_time_user_specified_time'),
          value: 'localTZ'
        },
        {
          label: this.$t('public_time_current'),
          value: 'current'
        }
      ]
    }
  },
  methods: {
    init() {
      this.editForm = {
        id: '',
        name: '',
        storageTime: 3,
        syncPoints: []
      }
      this.loadData()
    },

    loadData() {
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
    },

    getPickerOptions(val, item) {
      if (item.pointType === 'connTZ')
        return {
          disabledDate: null,
          selectableRange: null
        }
      const now = Date.now()
      const formatMap = {
        date: 'YYYY-MM-DD',
        time: 'HH:mm:ss',
        startTime: '00:00:00',
        endTime: '23:59:59'
      }

      const pickDate = dayjs(val).format(formatMap.date)
      const nowDate = dayjs(now).format(formatMap.date)
      const nowTime = dayjs(now).format(formatMap.time)
      if (val > now) {
        item.dateTime = now
      }
      let op = {
        disabledDate: time => {
          return new Date(time).getTime() > now
        }
      }
      if (pickDate === nowDate) {
        op.selectableRange = `${formatMap.startTime} - ${nowTime}`
      } else {
        op.selectableRange = `${formatMap.startTime} - ${formatMap.endTime}`
      }
      return op
    }
  }
}
</script>
