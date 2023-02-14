<template>
  <div class="flex flex-column flex-1 min-h-0">
    <div class="p-3 flex align-items-center">
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
    <ClassificationTree ref="classify" class="px-3 flex-1 overflow-auto"></ClassificationTree>
  </div>
</template>

<script>
import ClassificationTree from '../../components/ClassificationTree'
export default {
  name: 'MDM',

  components: { ClassificationTree },

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
