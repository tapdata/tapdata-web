<template>
  <div>
    <RecycleScroller
      key-field="nodeId"
      class="scroller"
      :items="items"
      :item-size="64"
      style="max-height: 300px"
      :buffer="64"
    >
      <template #default="{ item, index, active }">
        <span class="ellipsis">{{ item.connectionName }}({{ item.nodeName }})</span>
        <div class="flex align-center gap-3">
          <ElSelect v-model="item.pointType" :disabled="disabled || item.hiddenPointType">
            <ElOption :label="$t('public_time_user_specified_time')" value="localTZ" />
            <ElOption :label="$t('public_time_current')" value="current" />
          </ElSelect>

          <ElDatePicker
            v-if="item.pointType === 'localTZ'"
            v-model="item.dateTime"
            :disabled="disabled"
            type="datetime"
            align="right"
            format="YYYY-MM-DD HH:mm:ss"
            valueFormat="timestamp"
            popperClass="setting-panel__dateTimePicker"
            :pickerOptions="getPickerOptionsBeforeTime(item.dateTime, Date.now())"
          ></ElDatePicker>
        </div>
      </template>
    </RecycleScroller>
    <VEmpty v-if="!value.length" small></VEmpty>
  </div>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { observer } from '@formily/reactive-vue'
import { VEmpty } from '@tap/component'
import { getPickerOptionsBeforeTime } from '@tap/business/src/shared/util'

export default observer({
  name: 'SyncPoints',
  props: {
    value: Array,
    disabled: Boolean
  },
  data() {
    return {
      getPickerOptionsBeforeTime
    }
  },
  components: {
    RecycleScroller,
    VEmpty
  },
  computed: {
    items() {
      return this.value?.filter(item => !!item.nodeId) || []
    }
  }
})
</script>

<style scoped lang="scss"></style>
