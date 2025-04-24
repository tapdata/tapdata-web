<template>
  <BaseFormItem label="选择数据源" :colon="false" layout="vertical" labelAlign="left">
    <div class="flex align-center h-8 px-3 border rounded-4 gap-3">
      <DatabaseIcon :pdk-hash="pdkHash" :size="20"></DatabaseIcon>
      <span>{{ connectorName }}</span>
      <div class="flex-grow-1"></div>
      <el-button text type="primary" @click="openDialog"> 更换 </el-button>

      <SceneDialog :visible.sync="visible" selector-type="source_and_target" @selected="onSelected"></SceneDialog>
    </div>
  </BaseFormItem>
</template>

<script>
import { DatabaseIcon, SceneDialog } from '@tap/business'
import { FormItem } from '@tap/form'

export default {
  name: 'ConnectorFormItem',
  components: { SceneDialog, BaseFormItem: FormItem.BaseItem, DatabaseIcon },
  props: {
    pdkHash: String,
    connectorName: String
  },
  data() {
    return {
      visible: false
    }
  },
  methods: {
    openDialog() {
      this.visible = true
    },
    onSelected() {}
  }
}
</script>

<style scoped lang="scss"></style>
