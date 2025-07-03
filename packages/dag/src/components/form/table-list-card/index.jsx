import { observer } from '@formily/reactive-vue'
import { metadataInstancesApi } from '@tap/api'
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { VEmpty } from '@tap/component/src/base/v-empty'

import i18n from '@tap/i18n'
import { debounce } from 'lodash-es'
import { defineComponent, ref, watch } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { getPrimaryKeyTablesByType } from '../../../util'

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import './style.scss'

export const TableListCard = observer(
  defineComponent({
    props: [
      'connectionId',
      'value',
      'title',
      'params',
      'reloadTime',
      'filterType',
      'hasPartition',
    ],
    setup(props) {
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

        const fn = props.hasPartition
          ? metadataInstancesApi.pagePartitionTables(params)
          : metadataInstancesApi.pageTables(params)

        fn.then((data) => {
          const map = {}
          const items = data?.items || []
          items.forEach((t) => {
            if (t.uniqueIndexCounts || t.primaryKeyCounts) {
              map[t.tableName] = t
            }
          })
          tableMap.value = map
          list.value = getPrimaryKeyTablesByType(
            items.map((t) => t.tableName) || [],
            props.filterType,
            tableMap.value,
          ).map((tableName) => ({ tableName }))
          total.value = data?.total || 0
        }).finally(() => (loading.value = false))
      }
      loadData()

      watch(() => [props.params, props.reloadTime], debounce(loadData, 300))
      watch(
        () => props.filterType,
        () => {
          list.value = getPrimaryKeyTablesByType(
            list.value.map((t) => t.tableName) || [],
            props.filterType,
            tableMap.value,
          ).map((tableName) => ({ tableName }))
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
              key-field="tableName"
              itemSize={32}
              buffer={50}
            >
              {{
                default: ({ item: { tableName: name } }) => (
                  <OverflowTooltip
                    class="w-100 text-truncate source table-list-item font-color-light rounded-lg px-2"
                    text={name}
                    key={name}
                    placement="right"
                    open-delay={400}
                  >
                    <span>
                      <span class="align-middle">{name}</span>
                      {tableMap.value[name]?.tableComment && (
                        <span class="font-color-sslight align-middle">{`(${tableMap.value[name].tableComment})`}</span>
                      )}
                      {!!tableMap.value[name]?.primaryKeyCounts && (
                        <VIcon size="12" class="text-warning align-middle ml-1">
                          key
                        </VIcon>
                      )}
                      {!!tableMap.value[name]?.uniqueIndexCounts && (
                        <VIcon size="14" class="align-middle ml-1">
                          fingerprint
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
              <VEmpty
                description={i18n.t(
                  'packages_dag_table_list_card_index_zanshimeiyoupi',
                )}
              ></VEmpty>
            </div>
          )
        }

        return (
          <ElCard class="table-list-card" shadow="never">
            {{
              header: () => (
                <div class="clearfix">
                  <span>
                    {props.title ||
                      i18n.t('packages_form_field_mapping_list_biaoming')}
                  </span>
                  {!loading.value && (
                    <span class="font-color-light float-end">
                      {list.value.length}
                    </span>
                  )}
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
