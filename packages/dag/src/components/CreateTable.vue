<template>
  <ElDialog
    width="30%"
    append-to-body
    :title="dialog.title"
    :close-on-click-modal="false"
    :visible.sync="dialog.visible"
    @close="closeDialogForm"
  >
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" @submit.native.prevent>
      <el-form-item prop="newTable">
        <el-input
          v-model="ruleForm.newTable"
          :placeholder="dialog.placeholder"
          maxlength="50"
          show-word-limit
          @keypress.enter.native="confirm"
        ></el-input>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialogForm">{{ $t('packages_dag_button_cancel') }}</el-button>
      <el-button type="primary" @click="confirm" @>{{ $t('packages_dag_button_confirm') }}</el-button>
    </span>
  </ElDialog>
</template>

<script>
export default {
  name: 'CreateTable',

  props: {
    dialog: Object
  },

  data() {
    return {
      flag: null,
      ruleForm: {
        newTable: ''
      },
      rules: {
        newTable: [
          { required: true, trigger: 'blur' }
          // {
          //
          //   pattern: /^[a-zA-Z][0-9a-zA-Z_.-]*$/,
          //   trigger: 'blur',
          //   message:
          //     this.dialog.type === 'table' ? this.$t('packages_dag_dialog_tableValidateTip') : this.$t('packages_dag_dialog_collectionValidateTip')
          // }
        ]
      }
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
      this.$refs['ruleForm'].validate(valid => {
        if (valid) {
          flag = true
        } else {
          flag = false
        }
      })
      return flag
    },
    confirm() {
      let flag = this.validateForm()
      let first = this.ruleForm.newTable.split('.')[0] == 'system' ? true : false
      if (flag) {
        if (this.dialog.type === 'collection' && first) {
          this.$message.error(this.$t('packages_dag_dialog_collectionValidateTip'))
        } else {
          this.dialog.visible = false
          this.$emit('handleTable', this.ruleForm.newTable)
        }
      }
    }
  }
}
</script>
