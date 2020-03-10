<template>
  <div class="addServe">
    <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
      <el-form-item label="name" prop="name">
        <el-input v-model.number="ruleForm.name"></el-input>
      </el-form-item>

      <el-form-item label="command" prop="command">
        <el-input v-model="ruleForm.command" ></el-input>
      </el-form-item>

      <el-form-item label="arguements" prop="arguements">
        <el-input v-model="ruleForm.arguements"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: "AddServe",
  data(){
    return {
      ruleForm :{
        name: '',
        command: '',
        arguements: ''
      }
    }
  }
}
</script>
