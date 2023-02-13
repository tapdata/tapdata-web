<template>
  <div>
    <div class="p-4 flex align-items-center">
      <ElInput
        class="search-input flex-fill"
        v-model="keyword"
        prefix-icon="el-icon-search"
        size="mini"
        clearable
        style="width: 240px"
        @input="searchFnc"
      ></ElInput>
      <VIcon class="ml-2">filter</VIcon>
    </div>
    <div class="px-4">内容</div>
  </div>
</template>

<script>
export default {
  name: 'MDM',

  data() {
    return {
      keyword: ''
    }
  },

  methods: {
    searchFnc() {}
  }
}
</script>

<style scoped></style>
