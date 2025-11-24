<script>
import SceneDialog from '@tap/business/src/components/create-connection/SceneDialog.vue'
import { DatabaseIcon } from '@tap/business/src/components/DatabaseIcon'
import { FormItem } from '@tap/form'

export default {
  name: 'ConnectorFormItem',
  components: { SceneDialog, BaseFormItem: FormItem.BaseItem, DatabaseIcon },
  props: {
    pdkHash: String,
    connectorName: String,
  },
  data() {
    return {
      visible: false,
    }
  },
  methods: {
    openDialog() {
      this.visible = true
    },
    onSelected() {},
  },
}
</script>

<template>
  <BaseFormItem
    label="选择数据源"
    :colon="false"
    layout="vertical"
    label-align="left"
  >
    <div class="flex align-center h-8 px-3 border rounded-4 gap-3">
      <DatabaseIcon :pdk-hash="pdkHash" :size="20" />
      <span>{{ connectorName }}</span>
      <div class="flex-grow-1" />
      <el-button text type="primary" @click="openDialog"> 更换 </el-button>

      <SceneDialog
        v-model:visible="visible"
        selector-type="source_and_target"
        @selected="onSelected"
      />
    </div>
  </BaseFormItem>
</template>

<style scoped lang="scss"></style>
