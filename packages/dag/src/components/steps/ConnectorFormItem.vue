<template>
  <BaseFormItem label="选择数据源" :colon="false" layout="vertical" labelAlign="left">
    <div class="flex align-center h-8 px-3 border rounded-4 gap-3">
      <DatabaseIcon :pdk-hash="pdkHash" :size="20"></DatabaseIcon>
      <span>{{ connectorName }}</span>
      <div class="flex-grow-1"></div>
      <el-button type="text"> 更换 </el-button>
    </div>
  </BaseFormItem>
</template>

<script>
import { DatabaseIcon } from '@tap/business'
import { FormItem } from '@tap/form'

export default {
  name: 'ConnectorFormItem',
  components: { BaseFormItem: FormItem.BaseItem, DatabaseIcon },
  props: {
    pdkHash: String,
    connectorName: String
  }
}
</script>

<style scoped lang="scss"></style>
