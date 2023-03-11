<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex justify-content-between p-4">
      <span class="fs-6">MDM / CURATED MODELS</span>
      <div class="operation">
        <VIcon size="16" class="icon-color ml-3">search-outline</VIcon>
        <ElDropdown trigger="click" @command="handleCommand">
          <VIcon size="16" class="icon-color ml-3 rotate-90">more</VIcon>
          <ElDropdownMenu slot="dropdown">
            <ElDropdownItem command="config"> Configure FDM </ElDropdownItem>
          </ElDropdownMenu>
        </ElDropdown>
      </div>
    </div>
    <div class="flex flex-column flex-1 min-h-0">
      <ClassificationTree
        ref="classify"
        class="p-3 flex-1 overflow-auto"
        show-view-details
        @view-details="handleViewDetails"
      ></ClassificationTree>
    </div>
    <TablePreview ref="tablePreview"></TablePreview>
  </div>
</template>

<script>
import ClassificationTree from '../../components/ClassificationTree'
import TablePreview from './TablePreview'
export default {
  name: 'MDM',

  components: { ClassificationTree, TablePreview },

  data() {
    return {}
  },

  methods: {
    handleViewDetails(data) {
      console.log('handleViewDetails', data) // eslint-disable-line
      this.$refs.tablePreview.open({
        id: data.id,
        category: data.category,
        type: data.type
      })
    },

    handleCommand(command) {
      switch (command) {
        case 'config':
          this.$emit('show-settings')
          break
      }
    }
  }
}
</script>

<style scoped></style>
