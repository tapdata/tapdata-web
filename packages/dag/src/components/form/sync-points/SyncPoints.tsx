import { getPickerOptionsBeforeTime } from '@tap/business/src/shared/util'
import { watch as reactiveWatch } from '@tap/form/src/shared/reactive'
import { useI18n } from '@tap/i18n'
import { computed, defineComponent, ref, type PropType } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { useDataflowStore } from '../../../stores/dataflow.store'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export const SyncPoints = defineComponent({
  name: 'SyncPoints',
  props: {
    value: {
      type: Array as PropType<any[]>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { t } = useI18n()
    const dataflowStore = useDataflowStore()

    const items = ref(props.value?.filter((item) => !!item.nodeId) || [])

    reactiveWatch(
      () => props.value,
      (v) => (items.value = v?.filter((item) => !!item.nodeId) || []),
    )

    const supportStreamOffsetNode = computed(() => {
      return dataflowStore.dag.nodes
        .filter((node: any) => node.$outputs.length && !node.$inputs.length)
        .reduce((map: Record<string, boolean>, item: any) => {
          map[item.id] = item?.attrs.capabilities?.some(
            (cap: any) => cap.id === 'get_stream_offset_function',
          )
          return map
        }, {})
    })

    function handleChangeType(type: string, item: any) {
      if (type === 'streamOffset') {
        item.isStreamOffset = true
      } else {
        item.isStreamOffset = false
      }
    }

    console.log('props.value', props.value)

    return () => (
      <div>
        <RecycleScroller
          key-field="nodeId"
          class="scroller"
          items={items.value}
          item-size={64}
          style={{ maxHeight: '300px' }}
          buffer={64}
        >
          {{
            default: ({ item }: { item: any }) => (
              <>
                <span class="ellipsis">
                  {item.connectionName}({item.nodeName})
                </span>
                <div class="flex align-center gap-3">
                  <ElSelect
                    v-model={item.pointType}
                    disabled={props.disabled || item.hiddenPointType}
                    onChange={(val: string) => handleChangeType(val, item)}
                  >
                    <ElOption
                      label={t('public_time_user_specified_time')}
                      value="localTZ"
                    />
                    <ElOption
                      label={t('public_time_current')}
                      value="current"
                    />
                    {supportStreamOffsetNode.value[item.nodeId] && (
                      <ElOption
                        label={t('packages_dag_stream_offset')}
                        value="streamOffset"
                      />
                    )}
                  </ElSelect>

                  {supportStreamOffsetNode.value[item.nodeId] &&
                  item.pointType === 'streamOffset' ? (
                    <ElInput
                      v-model={item.streamOffsetString}
                      disabled={props.disabled}
                    />
                  ) : item.pointType === 'localTZ' ? (
                    <ElDatePicker
                      v-model={item.dateTime}
                      disabled={props.disabled}
                      type="datetime"
                      align="right"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="x"
                      popper-class="setting-panel__dateTimePicker"
                      picker-options={getPickerOptionsBeforeTime(
                        item.dateTime,
                        Date.now(),
                      )}
                    />
                  ) : null}
                </div>
              </>
            ),
          }}
        </RecycleScroller>
        {!props.value.length && <ElEmpty small />}
      </div>
    )
  },
})
