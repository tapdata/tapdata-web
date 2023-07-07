<script>
import { VIcon } from '@tap/component'

export default {
  name: 'Account',
  components: { VIcon },
  data() {
    return {
      form: {
        countryCount: '86',
        code: '',
        phone: ''
      }
    }
  }
}
</script>

<template>
  <div class="account">
    <VIcon size="450px" style="width: 450px; height: 235px">guide-top-header</VIcon>
    <header>1、为了账号安全和数据任务状态能快速通知到您，请您绑定手机号。</header>
    <el-form>
      <el-form-item label="手机号">
        <el-input v-model="form.phone"></el-input>
      </el-form-item>
      <el-form-item label="短信验证码">
        <el-input v-model="form.phone"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss"></style>
