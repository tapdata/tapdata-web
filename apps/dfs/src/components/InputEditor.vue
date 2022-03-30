<template>
  <div class="input-editor">
    <div class="input-editor__value">{{ txt }}</div>
    <ElInput v-model="txt"></ElInput>
    <ElButton type="text">修改</ElButton>
    <ElButton type="text">保存</ElButton>
  </div>
</template>

<script>
export default {
  name: 'InputEditor',
  data() {
    return {
      txt: '',
      inputText: ''
    }
  }
}
</script>

<style scoped></style>
