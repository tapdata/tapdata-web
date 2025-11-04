import { observer } from '@formily/reactive-vue'
import { connect, mapProps } from '@formily/vue'
import {
  checkTableExist,
  getPagePartitionTables,
} from '@tap/api/src/core/metadata-instances'
import { refreshTaskSchema } from '@tap/api/src/core/task'
import { VEmpty } from '@tap/component/src/base/v-empty'
import { InfiniteSelect } from '@tap/form/src/components/infinite-select'
import i18n from '@tap/i18n'

import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import { useStore } from 'vuex'
import './style.scss'

const useTableExist = (props, selectRef, connectionId) => {
  if (!props.allowCreate) {
    return {
      showNotExistsTip: ref(false),
      leftPosition: ref(''),
      handleCreated: () => {},
      handleChange: () => {},
    }
  }

  // tag 是否超出容器
  const isTagOverflow = ref(false)
  // 显示物理表不存在提示
  const showNotExistsTip = ref(false)
  // 检查物理表是否存在
  const handleCheckTableExist = async (tableName: string) => {
    if (!tableName) return
    try {
      const data = await checkTableExist({
        connectionId,
        tableName,
      })

      if (!data.exist) {
        setTagPosition(tableName)
      }

      showNotExistsTip.value = !data.exist
    } catch (error) {
      console.log(error) // eslint-disable-line
    }
  }

  let timer
  const handleCreated = (value) => {
    setTagPosition(value)
    clearTimeout(timer)
    timer = setTimeout(() => {
      showNotExistsTip.value = true
    }, 10)
  }

  const handleChange = (value, option, created) => {
    clearTimeout(timer)
    if (created) {
      setTagPosition(value)

      timer = setTimeout(() => {
        showNotExistsTip.value = true
      }, 10)
    } else {
      showNotExistsTip.value = false
    }
  }

  // 需要跟实际渲染的 tag 保持一致
  const getTagWidth = () => {
    const container = document.createElement('div')
    container.innerHTML = `<span class="el-tag el-tag--primary el-tag--light border-0"><span class="el-tag__content">${i18n.t('packages_dag_table_not_exist')}</span></span>`
    const tag = container.firstChild as HTMLElement
    document.body.append(tag)
    const width = tag.getBoundingClientRect().width
    tag.remove()
    return width
  }

  const setTagPosition = (tableName) => {
    if (!$input || !tableName) return

    const span = document.createElement('span')
    Object.assign(span.style, inputStyle)
    span.textContent = tableName
    document.body.append(span)
    const width = span.getBoundingClientRect().width
    span.remove()
    leftPosition.value = `${baseLeftPosition + width}px`

    isTagOverflow.value =
      getTagWidth() + baseLeftPosition + width >=
      selectRef.value.$el.querySelector('.el-select__selection').clientWidth
  }

  let $input
  let inputStyle
  let baseLeftPosition = 0
  let leftPosition = ref('')

  onMounted(() => {
    $input = selectRef.value.$el.querySelector('input')
    const { fontSize, fontFamily, fontWeight } = getComputedStyle($input)

    inputStyle = {
      fontSize,
      fontFamily,
      fontWeight,
      visibility: 'hidden',
    }

    // 12: el-select__wrapper 左内边距
    // 4: 间距
    baseLeftPosition = Number.parseInt($input.offsetLeft) + 12 + 4

    handleCheckTableExist(props.modelValue)
  })

  return {
    showNotExistsTip,
    leftPosition,
    handleCreated,
    handleChange,
    isTagOverflow,
  }
}

export const TableSelect = connect(
  observer(
    defineComponent({
      name: 'TableSelect',
      props: [
        'reloadTime',
        'connectionId',
        'modelValue',
        'allowCreate',
        'hasPartition',
        'syncPartitionTableEnable',
        'method',
      ],
      setup(props, { attrs }) {
        const select = ref(null)
        const store = useStore()
        const { taskId, activeNodeId } = store.state.dataflow
        const params = computed(() => {
          return {
            reloadTime: props.reloadTime,
            where: {
              'source.id': props.connectionId,
              taskId,
            },
          }
        })

        const {
          showNotExistsTip,
          leftPosition,
          handleCreated,
          handleChange,
          isTagOverflow,
        } = useTableExist(props, select, props.connectionId)

        const loading = ref(false)

        const loadSelectData = () => {
          select.value?.refresh?.()
        }

        const loadSchema = async (keys) => {
          loading.value = true
          await refreshTaskSchema(taskId, {
            nodeIds: activeNodeId,
            keys,
          }).finally(() => {
            loading.value = false
          })

          loadSelectData()
        }

        const unWatch = watch(
          () => store.state.dataflow.schemaRefreshing,
          (v) => {
            if (!v) {
              loadSelectData()
            }
          },
        )

        onBeforeUnmount(() => {
          unWatch()
        })

        const renderCreatedOption = (scope) => {
          return scope.value ? (
            <ElOption created value={scope.value}>
              <span class="flex align-center gap-2">
                {scope.value}
                <ElTag disable-transitions>
                  {i18n.t('packages_dag_table_not_exist')}
                </ElTag>
              </span>
            </ElOption>
          ) : null
        }

        let cacheTables = []

        watch(
          () => props.syncPartitionTableEnable,
          () => {
            cacheTables = []
            loadSelectData()
          },
        )

        const fetchMethod = async (filter, config) => {
          if (props.hasPartition) {
            if (cacheTables.length) {
              if (!filter.where?.value?.like)
                return {
                  items: cacheTables,
                  total: cacheTables.length,
                }

              const search = filter.where?.value?.like.toLowerCase()
              const filtered = cacheTables.filter((it) =>
                it.value.toLowerCase().includes(search),
              )
              return {
                items: filtered,
                total: filtered.length,
              }
            } else {
              const res = await getPagePartitionTables({
                connectionId: props.connectionId,
                limit: 0,
                syncPartitionTableEnable: props.syncPartitionTableEnable,
              })
              cacheTables = res.items.map((it) => ({
                label:
                  it.tableName +
                  (it.tableComment ? `(${it.tableComment})` : ''),
                value: it.tableName,
              }))
              return {
                items: cacheTables,
                total: cacheTables.length,
              }
            }
          } else {
            cacheTables = []

            return props.method(filter, config)
          }
        }

        return () => {
          const scopedSlots = {
            empty: ({ query }) =>
              query ? (
                <div class="pt-2">
                  <VEmpty small>
                    <span class="fs-7">
                      {i18n.t(
                        'packages_form_component_table_selector_error_not_exit',
                      )}
                      ,
                    </span>
                    <el-button
                      class="ml-1"
                      text
                      type="primary"
                      onClick={() => {
                        loadSchema(query)
                      }}
                    >
                      <span class="lh-1">
                        {i18n.t('packages_form_button_reload')}
                      </span>
                    </el-button>
                  </VEmpty>
                </div>
              ) : (
                <p class="el-select-dropdown__empty">
                  {i18n.t('public_data_no_data')}
                </p>
              ),
          }

          if (props.allowCreate) {
            scopedSlots['created-option'] = renderCreatedOption
          }

          if (showNotExistsTip.value) {
            scopedSlots.prefix = () => {
              return isTagOverflow.value ? (
                <ElTooltip
                  enterable={false}
                  hideAfter={0}
                  content={i18n.t('packages_dag_table_not_exist')}
                >
                  <ElIcon class="color-primary">
                    <ElIconInfoFilled />
                  </ElIcon>
                </ElTooltip>
              ) : (
                <ElTag
                  class="position-absolute translate-middle-y top-50 m-0 border-0 prefix-tag"
                  style={{ left: leftPosition.value }}
                >
                  {i18n.t('packages_dag_table_not_exist')}
                </ElTag>
              )
            }
          }

          return (
            <InfiniteSelect
              {...attrs}
              method={fetchMethod}
              modelValue={props.modelValue}
              loading={loading.value}
              class="table-select"
              ref={select}
              hasCreate={props.allowCreate}
              itemType={attrs.itemType || 'string'}
              itemQuery={attrs.itemQuery || 'original_name'}
              params={params.value}
              onSelect={handleChange}
            >
              {scopedSlots}
            </InfiniteSelect>
          )
        }
      },
    }),
  ),
  mapProps({ value: 'modelValue' }),
)

export default TableSelect
