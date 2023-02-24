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
    props: ['connectionId', 'value', 'title', 'params', 'reloadTime'],
    setup(props, { emit }) {
      const loading = ref(false)
      const list = ref([])
      const total = ref(0)

      const loadData = () => {
        loading.value = true
        const params = {
          ...{ connectionId: props.connectionId },
          ...props.params,
        }
        metadataInstancesApi
          .pageTables(params)
          .then((data) => {
            list.value = data?.items || []
            total.value = data?.total || 0
          })
          .finally(() => (loading.value = false))
      }
      loadData()

      watch(() => [props.params, props.reloadTime], debounce(loadData, 300))
      return () => {
        let listDom
        if (total.value) {
          listDom = (
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
                ),
              }}
            />
          )
        } else {
          listDom = (
            <div className="flex-1 flex flex-column justify-center">
              <ElEmpty
                image-size={111}
                image={require('@tap/assets/images/img_empty.png')}
                description={i18n.t(
                  'packages_dag_table_list_card_index_zanshimeiyoupi'
                )}
              ></ElEmpty>
            </div>
          )
        }

        return (
          <ElCard class="table-list-card" shadow="never">
            <div slot="header" class="clearfix">
              <span>
                {props.title ||
                  i18n.t('packages_form_field_mapping_list_biaoming')}
              </span>
              {!loading.value && (
                <span class="font-color-light float-end">{total.value}</span>
              )}
            </div>
            {listDom}
          </ElCard>
        )
      }
    },
  })
)
