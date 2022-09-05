import i18n from '@tap/i18n'
import { defineComponent, ref } from 'vue-demi'
import { metadataInstancesApi } from '@tap/api'
import { OverflowTooltip } from '@tap/component'
import './style.scss'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { RecycleScroller } from 'vue-virtual-scroller'
import { useField } from '@formily/vue'
import { observer } from '@formily/reactive-vue'

export const TableListCard = observer(
  defineComponent({
    props: ['connectionId', 'value'],
    setup(props, { emit }) {
      const fieldRef = useField()
      const loading = ref(false)
      const list = ref([])
      const loadData = () => {
        loading.value = true
        metadataInstancesApi
          .getSourceTables(props.connectionId)
          .then(data => {
            list.value = data
            if (!data?.length) {
              fieldRef.value.setRequired(true)
            } else {
              fieldRef.value.setRequired(false)
            }
            if (data?.join(',') !== props.value?.join(',')) {
              emit('change', data)
              fieldRef.value.validate()
            }
          })
          .finally(() => (loading.value = false))
      }
      loadData()
      return () => {
        return (
          <ElCard class="table-list-card" shadow="never">
            <div slot="header" class="clearfix">
              <span>{i18n.t('packages_form_field_mapping_list_biaoming')}</span>
              {!loading.value && <span class="font-color-light float-end">{list.value.length}</span>}
            </div>
            <RecycleScroller
              v-loading={loading.value}
              class="h-100 p-2 flex-1"
              items={list.value}
              itemSize={32}
              buffer={50}
              scopedSlots={{
                default: ({ item: name }) => (
                  <OverflowTooltip
                    class="w-100 text-truncate source table-list-item font-color-light rounded-2 px-2"
                    text={name}
                    key={name}
                    placement="right"
                    open-delay={400}
                  />
                )
              }}
            />
          </ElCard>
        )
      }
    }
  })
)
