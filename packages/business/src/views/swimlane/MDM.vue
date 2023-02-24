<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex justify-content-between p-4">
      <span class="fs-6">MDM / CURATED MODELS</span>
      <div class="operation">
        <VIcon size="16" class="icon-color ml-3">search-outline</VIcon>
        <VIcon size="16" class="icon-color ml-3 rotate-90">more</VIcon>
      </div>
    </div>
    <div class="flex flex-column flex-1 min-h-0">
      <ClassificationTree ref="classify" class="p-3 flex-1 overflow-auto"></ClassificationTree>
    </div>
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
