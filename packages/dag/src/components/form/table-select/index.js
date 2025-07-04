import { observer } from '@formily/reactive-vue'
import { defineComponent, computed, ref, onMounted, watch, onBeforeUnmount } from '@vue/composition-api'

import { VEmpty } from '@tap/component'
import i18n from '@tap/i18n'
import { AsyncSelect } from '@tap/form'
import { metadataInstancesApi, taskApi } from '@tap/api'

import './style.scss'

const useTableExist = (attrs, refs, connectionId) => {
  if (!attrs.allowCreate) {
    return {
      showNotExistsTip: ref(false),
      leftPosition: ref(''),
      handleCreated: () => {},
      handleChange: () => {}
    }
  }

  // 显示物理表不存在提示
  const showNotExistsTip = ref(false)
  // 检查物理表是否存在
  const checkTableExist = async tableName => {
    if (!tableName) return
    try {
      const data = await metadataInstancesApi.checkTableExist({
        connectionId,
        tableName
      })

      if (!data.exist) {
        setTagPosition(tableName)
      }

      showNotExistsTip.value = !data.exist
    } catch (e) {
      console.log(e) // eslint-disable-line
    }
  }

  let timer
  const handleCreated = value => {
    setTagPosition(value)
    clearTimeout(timer)
    timer = setTimeout(() => {
      showNotExistsTip.value = true
    }, 10)
  }
  const handleChange = () => {
    showNotExistsTip.value = false
  }
  const setTagPosition = tableName => {
    if (!$input || !tableName) return

    const span = document.createElement('span')
    Object.assign(span.style, inputStyle)
    span.textContent = tableName
    document.body.appendChild(span)
    const width = span.getBoundingClientRect().width
    document.body.removeChild(span)
    leftPosition.value = `${baseLeftPosition + width}px`
  }

  let $input
  let inputStyle
  let baseLeftPosition = 0
  let leftPosition = ref('')

  watch(() => attrs.value, handleChange)

  onMounted(() => {
    $input = refs.select.$el.querySelector('input')
    const { fontSize, fontFamily, fontWeight, borderLeftWidth, paddingLeft } = getComputedStyle($input)
    inputStyle = {
      fontSize,
      fontFamily,
      fontWeight,
      visibility: 'hidden'
    }
    baseLeftPosition = parseInt(borderLeftWidth) + parseInt(paddingLeft)
    checkTableExist(attrs.value)
  })

  return {
    showNotExistsTip,
    leftPosition,
    handleCreated,
    handleChange
  }
}

export const TableSelect = observer(
  defineComponent({
    props: ['reloadTime', 'connectionId', 'hasPartition', 'syncPartitionTableEnable', 'method'],
    setup(props, { attrs, listeners, emit, root, refs }) {
      const { taskId, activeNodeId } = root.$store.state.dataflow

      const params = computed(() => {
        return {
          reloadTime: props.reloadTime,
          where: {
            'source.id': props.connectionId,
            taskId
          }
        }
      })

      const { showNotExistsTip, leftPosition, handleCreated, handleChange } = useTableExist(
        attrs,
        refs,
        props.connectionId
      )

      const loading = ref(false)

      const loadSelectData = () => {
        refs.select.query = ''
        refs.select.loadData()
      }

      let unWatch

      const loadSchema = async keys => {
        // refs.select.blur()
        unWatch?.()
        loading.value = true
        refs.select.setSoftFocus() // 设置输入框 focus，防止加载完输入框失焦，触发setSelect 导致输入框内容还原成搜索前的选项
        await taskApi
          .refreshSchema(taskId, {
            nodeIds: activeNodeId,
            keys
          })
          .finally(() => {
            loading.value = false
          })

        refs.select.loadData()

        setTimeout(() => {
          reWatch()
        }, 100)
      }

      const reWatch = () => {
        unWatch?.()
        unWatch = watch(
          () => root.$store.state.dataflow.schemaRefreshing,
          v => {
            if (!v) {
              loadSelectData()
            }
          }
        )
      }

      reWatch()

      let cacheTables = []

      watch(
        () => props.syncPartitionTableEnable,
        () => {
          cacheTables = []
          loadSelectData()
        }
      )

      const fetchMethod = async (filter, config) => {
        if (props.hasPartition) {
          if (cacheTables.length) {
            if (!filter.where?.value?.like)
              return {
                items: cacheTables,
                total: cacheTables.length
              }

            const search = filter.where?.value?.like.toLowerCase()
            const filtered = cacheTables.filter(it => it.value.toLowerCase().includes(search))
            return {
              items: filtered,
              total: filtered.length
            }
          } else {
            const res = await metadataInstancesApi.pagePartitionTables({
              connectionId: props.connectionId,
              limit: 0,
              syncPartitionTableEnable: props.syncPartitionTableEnable
            })
            cacheTables = res.items.map(it => ({
              label: it.tableName + (it.tableComment ? `(${it.tableComment})` : ''),
              value: it.tableName
            }))
            return {
              items: cacheTables,
              total: cacheTables.length
            }
          }
        } else {
          cacheTables = []

          return props.method(filter, config)
        }
      }

      onBeforeUnmount(() => {
        unWatch?.()
      })

      return () => {
        const scopedSlots = {
          'created-option': ({ value }) => (
            <span>
              {value}
              <ElTag class="ml-1" size="mini">
                {i18n.t('packages_dag_table_not_exist')}
              </ElTag>
            </span>
          ),
          empty: ({ query }) =>
            query ? (
              <div class="pt-2">
                <VEmpty small>
                  <span class="fs-7">{i18n.t('packages_form_component_table_selector_error_not_exit')},</span>
                  <el-button
                    class="ml-1"
                    size="mini"
                    type="text"
                    onClick={() => {
                      loadSchema(query)
                    }}
                  >
                    <span class="lh-1">{i18n.t('packages_form_button_reload')}</span>
                  </el-button>
                </VEmpty>
              </div>
            ) : (
              <p class="el-select-dropdown__empty">{i18n.t('public_data_no_data')}</p>
            )
        }

        if (showNotExistsTip.value) {
          scopedSlots.prefix = () => (
            <ElTag
              class="position-absolute translate-middle-y top-50 m-0 prefix-tag"
              style={{ left: leftPosition.value }}
              size="mini"
            >
              {i18n.t('packages_dag_table_not_exist')}
            </ElTag>
          )
        }

        return (
          <AsyncSelect
            method={fetchMethod}
            loading={loading.value}
            class="async-select"
            ref="select"
            attrs={attrs}
            on={listeners}
            onCreate={handleCreated}
            itemType={attrs.itemType || 'string'}
            itemQuery={attrs.itemQuery || 'original_name'}
            params={params.value}
            scopedSlots={scopedSlots}
          >
            <div slot="empty"></div>
          </AsyncSelect>
        )
      }
    }
  })
)

export default TableSelect
