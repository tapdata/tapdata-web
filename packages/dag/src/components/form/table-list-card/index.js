import { debounce } from 'lodash'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { RecycleScroller } from 'vue-virtual-scroller'

import i18n from '@tap/i18n'
import { defineComponent, ref, watch } from '@vue/composition-api'
import { metadataInstancesApi } from '@tap/api'
import { OverflowTooltip } from '@tap/component'
import { observer } from '@formily/reactive-vue'

import './style.scss'

export const TableListCard = observer(
  defineComponent({
    props: ['connectionId', 'value', 'title', 'params'],
    setup(props, { emit }) {
      const loading = ref(false)
      const list = ref([])
      const loadData = () => {
        loading.value = true
        metadataInstancesApi
          .getSourceTables(props.connectionId)
          .then(data => {
            list.value = data
          })
          .finally(() => (loading.value = false))
      }
      loadData()

      watch(() => props.params, debounce(loadData, 300))
      return () => {
        return (
          <ElCard class="table-list-card" shadow="never">
            <div slot="header" class="clearfix">
              <span>{props.title || i18n.t('packages_form_field_mapping_list_biaoming')}</span>
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
