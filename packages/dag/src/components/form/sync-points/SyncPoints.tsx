import { FormItem } from '@tap/form'
import { defineComponent, computed, ref, reactive } from '@vue/composition-api'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { observer } from '@formily/reactive-vue'
import { VEmpty } from '@tap/component'
import { getPickerOptionsBeforeTime } from '@tap/business/src/shared/util'
import {
  Select as ElSelect,
  Option as ElOption,
  DatePicker as ElDatePicker,
  Dialog as ElDialog,
  Button as ElButton
} from 'element-ui'
import i18n from '@tap/i18n'

export default observer(
  defineComponent({
    name: 'SyncPoints',
    props: {
      value: {
        type: Array,
        default: () => []
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
    setup(props, { root }) {
      const items = computed(() => {
        return props.value?.filter((item: any) => !!item.nodeId) || []
      })

      // 批量修改弹窗状态
      const batchDialogVisible = ref(false)
      const batchForm = reactive({
        pointType: 'localTZ',
        dateTime: Date.now()
      })

      // 打开批量修改弹窗
      const openBatchDialog = () => {
        batchForm.pointType = 'localTZ'
        batchForm.dateTime = Date.now()
        batchDialogVisible.value = true
      }

      // 关闭批量修改弹窗
      const closeBatchDialog = () => {
        batchDialogVisible.value = false
      }

      // 应用批量修改
      const applyBatchEdit = () => {
        items.value.forEach((item: any) => {
          if (!item.hiddenPointType) {
            item.pointType = batchForm.pointType
            if (batchForm.pointType === 'localTZ') {
              item.dateTime = batchForm.dateTime
            }
          }
        })
        closeBatchDialog()
      }

      // 渲染同步点配置项（复用逻辑）
      const renderSyncPointConfig = (config: any, disabled: boolean, hiddenPointType?: boolean) => {
        return (
          <div class="flex align-center gap-3">
            <ElSelect
              value={config.pointType}
              onInput={(val: string) => (config.pointType = val)}
              disabled={disabled || hiddenPointType}
              class="flex-1"
            >
              <ElOption label={root.$t('public_time_user_specified_time')} value="localTZ" />
              <ElOption label={root.$t('public_time_current')} value="current" />
            </ElSelect>

            {config.pointType === 'localTZ' && (
              <ElDatePicker
                class="flex-1"
                value={config.dateTime}
                onInput={(val: number) => (config.dateTime = val)}
                disabled={disabled}
                type="datetime"
                align="right"
                format="yyyy-MM-dd HH:mm:ss"
                valueFormat="timestamp"
                popperClass="setting-panel__dateTimePicker"
                pickerOptions={getPickerOptionsBeforeTime(config.dateTime, Date.now())}
              />
            )}
          </div>
        )
      }

      const renderLabel = () => (
        <div class="inline-flex align-center">
          <span>{i18n.t('packages_dag_task_setting_sync_point')}</span>
          {!props.disabled && items.value.length > 1 && (
            <ElButton
              text
              type="primary"
              tag="a"
              onClick={openBatchDialog}
              class="position-absolute end-0 translate-middle-y top-50"
            >
              {i18n.t('packages_dag_batch_edit')}
            </ElButton>
          )}
        </div>
      )

      const renderItem = ({ item }: any) => {
        return [
          <span class="ellipsis">
            {item.connectionName}({item.nodeName})
          </span>,
          renderSyncPointConfig(item, props.disabled, item.hiddenPointType)
        ]
      }

      // 渲染批量修改弹窗
      const renderBatchDialog = () => (
        <ElDialog
          title={i18n.t('packages_dag_batch_edit')}
          visible={batchDialogVisible.value}
          width="600px"
          append-to-body
          close-on-click-modal={false}
          onClose={closeBatchDialog}
        >
          <div class="mb-4">
            <div class="mb-2 font-color-dark">{i18n.t('packages_dag_task_setting_sync_point')}</div>
            {renderSyncPointConfig(batchForm, false)}
          </div>
          <div slot="footer" class="dialog-footer">
            <ElButton onClick={closeBatchDialog}>{i18n.t('public_button_cancel')}</ElButton>
            <ElButton type="primary" onClick={applyBatchEdit}>
              {i18n.t('public_button_confirm')}
            </ElButton>
          </div>
        </ElDialog>
      )

      return () => (
        <div>
          <FormItem.BaseItem
            label={renderLabel()}
            props={{
              labelStyle: 'position: relative;',
              tooltip: i18n.t('packages_dag_task_setting_syncPoint_tip')
            }}
          >
            <RecycleScroller
              keyField="nodeId"
              class="scroller"
              items={items.value}
              itemSize={64}
              style="max-height: 300px"
              buffer={64}
              scopedSlots={{
                default: renderItem
              }}
            />
            {!props.value.length && <VEmpty small />}
          </FormItem.BaseItem>
          {renderBatchDialog()}
        </div>
      )
    }
  })
)
