<script>
import { appApi } from '@tap/api'
import i18n from '@tap/i18n'

export default {
  name: 'Editor',
  emits: ['success'],
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
            message: i18n.t(
              'packages_business_application_delete_yingyongmingchengbu',
            ),
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    init() {
      this.editForm = {
        id: '',
        value: '',
        desc: '',
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
            desc,
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

    openEdit(app) {
      this.taskId = app.id
      this.editForm = {
        id: app.id,
        value: app.value,
        desc: app.desc,
      }
      this.visible = true
    },

    handleClose() {
      this.visible = false
    },

    handleSave() {
      this.$refs.form?.validate((valid) => {
        if (valid) {
          this.saveLoading = true
          ;(this.taskId
            ? appApi.updateById(this.taskId, this.editForm)
            : appApi.post(this.editForm)
          )
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
    },

    onClosed() {
      this.$refs.form?.resetFields()
    },
  },
}
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="
      taskId
        ? $t('public_button_edit')
        : $t('packages_business_application_list_chuangjianyingyong')
    "
    :append-to-body="true"
    width="600px"
    top="10vh"
    class="connection-dialog ldp-conection-dialog flex flex-column"
    @closed="onClosed"
  >
    <ElForm
      ref="form"
      v-loading="loading"
      label-position="top"
      :model="editForm"
      :rules="rulesEdit"
    >
      <ElFormItem
        :label="$t('packages_business_application_list_yingyongmingcheng')"
        prop="value"
      >
        <ElInput v-model="editForm.value" text maxlength="50" clearable />
      </ElFormItem>
      <ElFormItem
        :label="$t('packages_business_application_editor_yingyongmiaoshu')"
        prop="desc"
      >
        <ElInput v-model="editForm.desc" type="textarea" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleClose">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton type="primary" :loading="saveLoading" @click="handleSave">{{
          $t('public_button_save')
        }}</ElButton>
      </span>
    </template>
  </ElDialog>
</template>
