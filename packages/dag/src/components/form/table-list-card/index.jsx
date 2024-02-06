import { debounce } from 'lodash'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { RecycleScroller } from 'vue-virtual-scroller'

import i18n from '@tap/i18n'
import { defineComponent, ref, watch } from 'vue'
import { metadataInstancesApi } from '@tap/api'
import { VEmpty, OverflowTooltip } from '@tap/component'
import { observer } from '@formily/reactive-vue'

import { getPrimaryKeyTablesByType } from '../../../util'
import './style.scss'

export const TableListCard = observer(
  defineComponent({
    props: ['connectionId', 'value', 'title', 'params', 'reloadTime', 'filterType'],
    setup(props, { emit }) {
      const loading = ref(false)
      const list = ref([])
      const total = ref(0)
      const tableMap = ref({})

      const loadData = () => {
        loading.value = true
        const params = {
          ...{ connectionId: props.connectionId },
          ...props.params,
        }
        metadataInstancesApi
          .pageTables(params)
          .then((data) => {
            let map = {}
            let items = data?.items || []
            items.forEach((t) => {
              if (t.tableComment || t.primaryKeyCounts) {
                map[t.tableName] = t
              }
            })
            tableMap.value = map
            list.value = Object.freeze(
              getPrimaryKeyTablesByType(items.map((t) => t.tableName) || [], props.filterType, tableMap.value),
            )
            total.value = data?.total || 0
          })
          .finally(() => (loading.value = false))
      }
      loadData()

      watch(() => [props.params, props.reloadTime], debounce(loadData, 300))
      watch(
        () => props.filterType,
        () => {
          list.value = Object.freeze(getPrimaryKeyTablesByType(list.value, props.filterType, tableMap.value))
        },
      )

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
            >
              {{
                default: ({ item: name }) => (
                  <OverflowTooltip
                    class="w-100 text-truncate source table-list-item font-color-light rounded-2 px-2"
                    text={name}
                    key={name}
                    placement="right"
                    open-delay={400}
                  >
                    <span>
                      <span>{name}</span>
                      {tableMap.value[name]?.tableComment && (
                        <span class="font-color-sslight">{`(${tableMap.value[name].tableComment})`}</span>
                      )}
                      {tableMap.value[name]?.primaryKeyCounts && (
                        <VIcon size="12" class="text-warning ml-1">
                          key
                        </VIcon>
                      )}
                    </span>
                  </OverflowTooltip>
                ),
              }}
            </RecycleScroller>
          )
        } else {
          listDom = (
            <div class="flex-1 flex flex-column justify-center">
              <VEmpty description={i18n.t('packages_dag_table_list_card_index_zanshimeiyoupi')}></VEmpty>
            </div>
          )
        }

        return (
          <ElCard class="table-list-card" shadow="never">
            {{
              header: () => (
                <div class="clearfix">
                  <span>{props.title || i18n.t('packages_form_field_mapping_list_biaoming')}</span>
                  {!loading.value && <span class="font-color-light float-end">{list.value.length}</span>}
                </div>
              ),
              default: () => listDom,
            }}
          </ElCard>
        )
      }
    },
  }),
)
