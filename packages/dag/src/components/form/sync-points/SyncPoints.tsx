import { observer } from '@formily/reactive-vue'
import { getPickerOptionsBeforeTime } from '@tap/business/src/shared/util'
import { FormItem } from '@tap/form'
import { useI18n } from '@tap/i18n'
import { computed, defineComponent, reactive } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { useStore } from 'vuex'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

function handleChangeType(type: string, item: any) {
  item.isStreamOffset = type === 'streamOffset'
}

/** 渲染 pointType 后面的附加输入（streamOffset 输入框 / localTZ 日期选择器） */
function renderExtraInput(
  item: { pointType: string; streamOffsetString?: string; dateTime?: number },
  disabled: boolean,
  showStreamOffset: boolean,
) {
  if (showStreamOffset && item.pointType === 'streamOffset') {
    return (
      <ElInput
        v-model={item.streamOffsetString}
        class="flex-1"
        disabled={disabled}
      />
    )
  }
  if (item.pointType === 'localTZ') {
    return (
      <ElDatePicker
        v-model={item.dateTime}
        class="flex-1"
        disabled={disabled}
        type="datetime"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="x"
        popper-class="setting-panel__dateTimePicker"
        picker-options={getPickerOptionsBeforeTime(item.dateTime, Date.now())}
      />
    )
  }
  return null
}

export const SyncPoints = observer(
  defineComponent({
    name: 'SyncPoints',
    props: {
      value: {
        type: Array as () => any[],
        default: () => [],
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    setup(props) {
      const store = useStore()
      const { t } = useI18n()

      const hasCapability = (node: any, capabilityId: string) =>
        store.getters['dataflow/hasCapability'](node, capabilityId)
      const nodeById = (id: string) => store.getters['dataflow/nodeById'](id)

      const items = computed(() => {
        return props.value?.filter((item: any) => !!item.nodeId) || []
      })

      function checkStreamOffset(nodeId: string) {
        return hasCapability(nodeById(nodeId), 'get_stream_offset_function')
      }

      // ---- 批量修改弹窗 ----
      const batchDialog = reactive({
        visible: false,
        pointType: 'current' as string,
        dateTime: '' as string,
        streamOffsetString: '' as string,
        isStreamOffset: false,
      })

      const hasStreamOffsetItem = () =>
        items.value.filter(
          (item: any) =>
            !item.hiddenPointType && checkStreamOffset(item.nodeId),
        ).length > 1

      function openBatchDialog() {
        batchDialog.pointType = 'current'
        batchDialog.dateTime = ''
        batchDialog.streamOffsetString = ''
        batchDialog.isStreamOffset = false
        batchDialog.visible = true
      }

      function applyBatch() {
        items.value.forEach((item: any) => {
          if (item.hiddenPointType) return
          // streamOffset 类型只应用给支持该能力的节点
          if (
            batchDialog.pointType === 'streamOffset' &&
            !checkStreamOffset(item.nodeId)
          )
            return

          item.pointType = batchDialog.pointType
          item.isStreamOffset = batchDialog.pointType === 'streamOffset'
          if (batchDialog.pointType === 'localTZ') {
            item.dateTime = batchDialog.dateTime
          }
          if (
            batchDialog.pointType === 'streamOffset' &&
            checkStreamOffset(item.nodeId)
          ) {
            item.streamOffsetString = batchDialog.streamOffsetString
          }
        })
        batchDialog.visible = false
      }

      // ---- 渲染 ----
      const renderLabel = () => (
        <div class="inline-flex align-center">
          <span class="mr-2">{t('packages_dag_task_setting_sync_point')}</span>
          {!props.disabled && items.value.length > 1 && (
            <el-button
              text
              type="primary"
              tag="a"
              onClick={openBatchDialog}
              class="position-absolute end-0 translate-middle-y top-50"
            >
              {t('packages_dag_batch_edit')}
            </el-button>
          )}
        </div>
      )

      const renderPointTypeSelect = (
        item: any,
        disabled: boolean,
        showStreamOffset: boolean,
      ) => (
        <ElSelect
          v-model={item.pointType}
          disabled={disabled}
          class="flex-1"
          onChange={(val: string) => handleChangeType(val, item)}
        >
          <ElOption
            label={t('public_time_user_specified_time')}
            value="localTZ"
          />
          <ElOption label={t('public_time_current')} value="current" />
          {showStreamOffset && (
            <ElOption
              label={t('packages_dag_stream_offset')}
              value="streamOffset"
            />
          )}
        </ElSelect>
      )

      return () => (
        <>
          <FormItem
            label={renderLabel()}
            labelStyle="position: relative;"
            tooltip={t('packages_dag_task_setting_syncPoint_tip')}
          >
            <RecycleScroller
              keyField="nodeId"
              class="scroller"
              items={items.value}
              itemSize={64}
              style={{ maxHeight: '300px' }}
              buffer={64}
            >
              {{
                default: ({ item }: { item: any }) => {
                  const showStream = checkStreamOffset(item.nodeId)
                  return (
                    <>
                      <span class="ellipsis">
                        {item.connectionName}({item.nodeName})
                      </span>
                      <div class="flex align-center gap-3">
                        {renderPointTypeSelect(
                          item,
                          props.disabled || item.hiddenPointType,
                          showStream,
                        )}
                        {renderExtraInput(item, props.disabled, showStream)}
                      </div>
                    </>
                  )
                },
              }}
            </RecycleScroller>
            {!props.value.length && <ElEmpty />}
          </FormItem>

          {/* 批量修改弹窗 */}
          <ElDialog
            v-model={batchDialog.visible}
            title={t('packages_dag_batch_edit')}
            width="480px"
            append-to-body
          >
            {{
              default: () => (
                <div class="flex align-center gap-3">
                  {renderPointTypeSelect(
                    batchDialog,
                    false,
                    hasStreamOffsetItem(),
                  )}
                  {renderExtraInput(batchDialog, false, hasStreamOffsetItem())}
                </div>
              ),
              footer: () => (
                <span class="dialog-footer">
                  <ElButton onClick={() => (batchDialog.visible = false)}>
                    {t('public_button_cancel')}
                  </ElButton>
                  <ElButton type="primary" onClick={applyBatch}>
                    {t('public_button_save')}
                  </ElButton>
                </span>
              ),
            }}
          </ElDialog>
        </>
      )
    },
  }),
)
