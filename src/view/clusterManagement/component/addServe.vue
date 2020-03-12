<template>
  <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="addServe">
    <el-form-item label="name" prop="name">
      <el-input v-model="ruleForm.name" placeholder="请输入监控的服务名称"></el-input>
    </el-form-item>

    <el-form-item label="command" prop="command">
      <el-input v-model="ruleForm.command" placeholder="请输入command"></el-input>
    </el-form-item>

    <el-form-item label="arguements" prop="arguements">
      <el-input v-model="ruleForm.arguments" placeholder="arguements"></el-input>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: "AddServe",
  props: {
    data: Object
  },
  data(){
    return {
      ruleForm :{
        name: '',
        command: '',
        arguments: ''
      },
      rules:{
        name:[
          { required: true, message: '不能为空', trigger: 'blur' },
        ],
        command: [
          { required: true, message: '不能为空', trigger: 'blur' },
        ]
      }
    }
  },
  methods: {
    //子组件校验，传递到父组件
    validateForm () {
      let flag = null;
      this.$refs['ruleForm'].validate(valid => {
        if (valid) {
          flag = true;
        } else {
          flag = false;
        }
      });
      return flag;
    }
  }
}
</script>
