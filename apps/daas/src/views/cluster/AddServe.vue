<template>
  <section class="addServe-wrap">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="addServe">
      <el-form-item
        :label="$t('cluster_server_nickname') + ':'"
        prop="name"
        :rules="{
          required: true,
          message: $t('tips_rule_not_empty'),
          trigger: 'blur'
        }"
      >
        <el-input
          v-model:value="ruleForm.name"
          size="mini"
          :placeholder="$t('cluster_placeholder_mon_server')"
        ></el-input>
      </el-form-item>

      <el-form-item
        :label="$t('cluster_command') + ':'"
        prop="command"
        :rules="{
          required: true,
          message: $t('tips_rule_not_empty'),
          trigger: 'blur'
        }"
      >
        <el-input
          v-model:value="ruleForm.command"
          size="mini"
          :placeholder="$t('cluster_placeholder_command')"
        ></el-input>
      </el-form-item>

      <el-form-item label="arguements:" prop="arguements">
        <el-input v-model:value="ruleForm.arguments" size="mini" placeholder="arguements"></el-input>
      </el-form-item>
    </el-form>
  </section>
</template>

<script>
export default {
  name: 'AddServe',
  props: {
    data: Object,
    editItem: Object
  },
  data() {
    return {
      ruleForm: {
        id: this.editItem.id ? this.editItem.id : '',
        uuid: this.editItem.uuid ? this.editItem.uuid : '',
        name: this.editItem.name ? this.editItem.name : '',
        command: this.editItem.command ? this.editItem.command : '',
        arguments: this.editItem.arguments || this.editItem.arguments !== null ? this.editItem.arguments : ''
      },
      rules: {}
    }
  },
  watch: {
    editItem: function (newValue) {
      this.ruleForm = newValue
    }
  },
  methods: {
    closeDialogForm() {
      // 父组件关闭弹窗，子组件清除验证
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
    }
  }
}
</script>

<style lang="scss">
.addServe-wrap {
  .addServe {
    .el-form-item {
      margin-bottom: 15px;
    }
  }
}
</style>
