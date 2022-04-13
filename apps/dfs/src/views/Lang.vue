<template>
  <div style="width: 800px">
    <ElForm>
      <ElFormItem label="Includes List: a,b,c">
        <ElInput v-model="inc" type="textarea" placeholder="for example: a,b,c" autosize></ElInput>
        <VButton @click="saveIncludes">save</VButton>
      </ElFormItem>
      <ElFormItem label="Equal List: a,b,c">
        <ElInput v-model="equal" type="textarea" placeholder="for example: a,b,c" autosize></ElInput>
        <VButton @click="saveEqual">save</VButton>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script>
export default {
  name: 'Lang',
  data() {
    return {
      inc: '',
      equal: ''
    }
  },
  mounted() {
    this.inc = localStorage.getItem('includesLang') ?? ''
    this.equal = localStorage.getItem('equalLang') ?? ''
  },
  methods: {
    saveIncludes() {
      localStorage.setItem('includesLang', this.inc)
      this.$message.success('success, please refresh page!')
    },
    saveEqual() {
      localStorage.setItem('equalLang', this.equal)
      this.$message.success('success, please refresh page!')
    }
  }
}
</script>

<style scoped></style>
