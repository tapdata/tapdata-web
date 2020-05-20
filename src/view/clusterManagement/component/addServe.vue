<template>
  <el-form
    :model="ruleForm"
    :rules="rules"
    ref="ruleForm"
    label-width="100px"
    class="addServe"
  >
    <el-form-item
      label="name"
      prop="name"
      :rules="{
        required: true,
        message: $t('message.nullContent'),
        trigger: 'blur'
      }"
    >
      <el-input
        v-model="ruleForm.name"
        :placeholder="$t('message.placeholderMonServer')"
      ></el-input>
    </el-form-item>

    <el-form-item
      label="command"
      prop="command"
      :rules="{
        required: true,
        message: $t('message.nullContent'),
        trigger: 'blur'
      }"
    >
      <el-input
        v-model="ruleForm.command"
        :placeholder="$t('message.placeholderCommand')"
      ></el-input>
    </el-form-item>

    <el-form-item label="arguements" prop="arguements">
      <el-input
        v-model="ruleForm.arguments"
        placeholder="arguements"
      ></el-input>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: "AddServe",
  props: {
    data: Object,
    editItem: Object
  },
  data() {
    return {
      ruleForm: {
        id: this.editItem.id ? this.editItem.id : "",
        uuid: this.editItem.uuid ? this.editItem.uuid : "",
        name: this.editItem.name ? this.editItem.name : "",
        command: this.editItem.command ? this.editItem.command : "",
        arguments:
          this.editItem.arguments || this.editItem.arguments !== null
            ? this.editItem.arguments
            : ""
      },
      rules: {}
    };
  },
  watch: {
    editItem: function(newValue) {
      this.ruleForm = newValue;
    }
  },
  methods: {
    closeDialogForm() {
      // 父组件关闭弹窗，子组件清除验证
      this.$refs.ruleForm.clearValidate();
    },
    // 子组件校验，传递到父组件
    validateForm() {
      let flag = null;
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {
          flag = true;
        } else {
          flag = false;
        }
      });
      return flag;
    }
  }
};
</script>
