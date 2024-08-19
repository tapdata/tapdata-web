<template>
  <div>
    <ConnectorForm :pdk-hash="pdkHash" :pdk-id="pdkId" show-ip-tips>
      <template #header>
        <div class="title-prefix-bar mb-4">创建数据源连接</div>
      </template>
      <template #prepend>
        <BaseFormItem label="选择数据源" :colon="false" layout="vertical" labelAlign="left">
          <div class="flex align-center h-8 px-3 border rounded-4 gap-3">
            <DatabaseIcon :pdk-hash="pdkHash" :size="20"></DatabaseIcon>
            <span>MongoDB</span>
            <div class="flex-grow-1"></div>
            <el-button type="text"> 更换 </el-button>
          </div>
        </BaseFormItem>
      </template>
    </ConnectorForm>
  </div>
</template>

<script>
import { ConnectorForm, DatabaseIcon } from '@tap/business'
import { FormItem } from '@tap/form'
export default {
  name: 'SourceStep',
  components: { ConnectorForm, BaseFormItem: FormItem.BaseItem, DatabaseIcon },
  data() {
    return {
      pdkHash: 'a5af410b12afca476edf4a650c133ddf135bf76542a67787ed6f7f7d53ba712',
      pdkId: 'mysql'
    }
  }
}
</script>

<style scoped lang="scss">
.connector-input {
  .el-input__inner {
    padding-left: 32px;
    padding-right: 40px;
  }
}
</style>
