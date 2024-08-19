<template>
  <div>
    <ConnectorForm :pdk-hash="pdkHash" :pdk-id="pdkId" show-ip-tips>
      <template #header>
        <div class="title-prefix-bar mb-4">创建数据源连接</div>
      </template>
      <template #prepend>
        <ConnectorFormItem :pdk-hash="pdkHash" :connector-name="connectorName"></ConnectorFormItem>
      </template>
      <template #footer>
        <div>
          <el-button type="primary" @click="$emit('next')">{{ $t('public_button_next') }}</el-button>
        </div>
      </template>
    </ConnectorForm>
  </div>
</template>

<script>
import { ConnectorForm, DatabaseIcon } from '@tap/business'
import { FormItem } from '@tap/form'
import ConnectorFormItem from './ConnectorFormItem.vue'

export default {
  name: 'SourceStep',
  components: { ConnectorForm, BaseFormItem: FormItem.BaseItem, DatabaseIcon, ConnectorFormItem },
  data() {
    return {
      pdkHash: 'a5af410b12afca476edf4a650c133ddf135bf76542a67787ed6f7f7d53ba712',
      pdkId: 'mysql',
      connectorName: 'MySQL'
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
