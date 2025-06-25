<script>
export default {
  name: 'CreateTable',
  props: {
    dialog: Object,
  },
  emits: ['handleTable'],
  data() {
    return {
      flag: null,
      ruleForm: {
        newTable: '',
      },
      rules: {
        newTable: [
          { required: true, trigger: 'blur' },
          // {
          //
          //   pattern: /^[a-zA-Z][0-9a-zA-Z_.-]*$/,
          //   trigger: 'blur',
          //   message:
          //     this.dialog.type === 'table' ? this.$t('packages_dag_dialog_tableValidateTip') : this.$t('packages_dag_dialog_collectionValidateTip')
          // }
        ],
      },
    }
  },
  methods: {
    closeDialogForm() {
      // 父组件关闭弹窗，子组件清除验证
      this.dialog.visible = false
      this.ruleForm.newTable = ''
      this.$refs.ruleForm.clearValidate()
    },
    // 子组件校验，传递到父组件
    validateForm() {
      let flag = null
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          flag = true
        } else {
          flag = false
        }
      })
      return flag
    },
    confirm() {
      const flag = this.validateForm()
      const first =
        this.ruleForm.newTable.split('.')[0] == 'system' ? true : false
      if (flag) {
        if (this.dialog.type === 'collection' && first) {
          this.$message.error(
            this.$t('packages_dag_dialog_collectionValidateTip'),
          )
        } else {
          this.dialog.visible = false
          this.$emit('handleTable', this.ruleForm.newTable)
        }
      }
    },
  },
}
</script>

<template>
  <ElDialog
    v-model="dialog.visible"
    width="30%"
    append-to-body
    :title="dialog.title"
    :close-on-click-modal="false"
    @close="closeDialogForm"
  >
    <el-form ref="ruleForm" :model="ruleForm" :rules="rules" @submit.prevent>
      <el-form-item prop="newTable">
        <el-input
          v-model="ruleForm.newTable"
          :placeholder="dialog.placeholder"
          maxlength="50"
          show-word-limit
          @keypress.enter="confirm"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialogForm">{{
          $t('public_button_cancel')
        }}</el-button>
        <el-button type="primary" @click="confirm">{{
          $t('public_button_confirm')
        }}</el-button>
      </span>
    </template>
  </ElDialog>
</template>
