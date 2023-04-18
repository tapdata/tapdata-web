<template>
  <ElDialog
    :title="taskId ? $t('public_button_edit') : $t('public_button_create')"
    :visible="visible"
    :append-to-body="true"
    width="800px"
    top="10vh"
    custom-class="connection-dialog ldp-conection-dialog flex flex-column"
    @close="handleClose"
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
      <ElFormItem size="mini" :label="$t('packages_business_application_list_yingyongmingcheng')" prop="value">
        <ElInput v-model="editForm.value" clearable></ElInput>
      </ElFormItem>
      <ElFormItem size="mini" :label="$t('packages_business_application_editor_yingyongmiaoshu')" prop="desc">
        <ElInput v-model="editForm.desc" type="textarea"></ElInput>
      </ElFormItem>
    </ElForm>
    <span class="dialog-footer" slot="footer">
      <ElButton @click="handleClose" size="mini">{{ $t('public_button_cancel') }}</ElButton>
      <ElButton size="mini" type="primary" :loading="saveLoading" @click="handleSave">{{
        $t('public_button_save')
      }}</ElButton>
    </span>
  </ElDialog>
</template>

<script>
import i18n from '@tap/i18n'
import { appApi } from '@tap/api'

export default {
  name: 'Editor',

  data() {
    return {
      visible: false,
      taskId: '',
      loading: false,
      saveLoading: false,
      editForm: {},
      rulesEdit: {
        value: [
          {
            required: true,
            message: i18n.t('packages_business_application_delete_yingyongmingchengbu'),
            trigger: 'blur'
          }
        ]
      }
    }
  },

  methods: {
    init() {
      this.editForm = {
        id: '',
        value: '',
        desc: ''
      }
      this.taskId && this.loadData(this.taskId)
    },

    loadData(id) {
      this.loading = true
      appApi
        .detail(id)
        .then((task = {}) => {
          const { id, value, desc } = task
          this.editForm = {
            id,
            value,
            desc
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    open(id) {
      this.taskId = id
      this.init()
      this.visible = true
    },

    handleClose() {
      this.visible = false
    },

    handleSave() {
      this.$refs.form?.validate(valid => {
        if (valid) {
          this.saveLoading = true
          ;(this.taskId ? appApi.updateById(this.taskId, this.editForm) : appApi.post(this.editForm))
            .then(() => {
              this.$emit('success', ...arguments)
              this.$message.success(this.$t('public_message_save_ok'))
              this.init()
              this.handleClose()
            })
            .finally(() => {
              this.saveLoading = false
            })
        }
      })
    }
  }
}
</script>
