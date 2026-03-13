<script>
import { observer } from '@formily/reactive-vue'
import { getPickerOptionsBeforeTime } from '@tap/business/src/shared/util'
import { VEmpty } from '@tap/component/src/base/v-empty'
import { RecycleScroller } from 'vue-virtual-scroller'
import { mapGetters } from 'vuex'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export default observer({
  name: 'SyncPoints',
  props: {
    value: Array,
    disabled: Boolean,
  },
  data() {
    return {
      getPickerOptionsBeforeTime,
    }
  },
  components: {
    RecycleScroller,
    VEmpty,
  },
  computed: {
    ...mapGetters('dataflow', ['hasCapability', 'nodeById']),
    items() {
      return this.value?.filter((item) => !!item.nodeId) || []
    },
  },
  methods: {
    handleChangeType(type, item) {
      if (type === 'streamOffset') {
        item.isStreamOffset = true
      } else {
        item.isStreamOffset = false
      }
    },
    checkStreamOffset(nodeId) {
      return this.hasCapability(
        this.nodeById(nodeId),
        'get_stream_offset_function',
      )
    },
  },
})
</script>

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
        <span class="ellipsis"
          >{{ item.connectionName }}({{ item.nodeName }})</span
        >
        <div class="flex align-center gap-3">
          <ElSelect
            v-model="item.pointType"
            :disabled="disabled || item.hiddenPointType"
            @change="handleChangeType($event, item)"
          >
            <ElOption
              :label="$t('public_time_user_specified_time')"
              value="localTZ"
            />
            <ElOption :label="$t('public_time_current')" value="current" />
            <ElOption
              v-if="checkStreamOffset(item.nodeId)"
              :label="$t('packages_dag_stream_offset')"
              value="streamOffset"
            />
          </ElSelect>

          <ElInput
            v-if="
              checkStreamOffset(item.nodeId) &&
              item.pointType === 'streamOffset'
            "
            v-model="item.streamOffsetString"
            :disabled="disabled"
          />

          <ElDatePicker
            v-else-if="item.pointType === 'localTZ'"
            v-model="item.dateTime"
            :disabled="disabled"
            type="datetime"
            align="right"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="x"
            popper-class="setting-panel__dateTimePicker"
            :picker-options="
              getPickerOptionsBeforeTime(item.dateTime, Date.now())
            "
          />
        </div>
      </template>
    </RecycleScroller>
    <VEmpty v-if="!value.length" small />
  </div>
</template>

<style scoped lang="scss"></style>
