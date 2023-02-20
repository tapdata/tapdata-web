<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex justify-content-between p-4">
      <span class="fs-6">FDM / CACHE</span>
      <div class="operation">
        <VIcon size="16" class="icon-color ml-3">search-outline</VIcon>
        <VIcon size="16" class="icon-color ml-3 rotate-90">more</VIcon>
      </div>
    </div>
    <div class="p-3"></div>
  </div>
</template>

<script>
export default {
  name: 'FDM',

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
