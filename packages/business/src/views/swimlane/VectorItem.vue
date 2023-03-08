<template>
  <div class="vector-item flex align-items-center px-4 cursor-pointer" @click="$emit('vector')">
    <VIcon size="30" class="color-primary">vector</VIcon>
  </div>
</template>

<script>
export default {
  name: 'VectorItem'
}
</script>

<style lang="scss" scoped>
.vector-item {
  background: #f2f2f2;
  border-top: 1px solid #e1e3e9;
  border-left: 1px solid #e1e3e9;
}
</style>
