import { observer } from '@formily/reactive-vue'
import { defineComponent, computed, ref, onMounted, watch, onBeforeUnmount } from 'vue'

import { VEmpty } from '@tap/component'
import i18n from '@tap/i18n'
import { AsyncSelect } from '@tap/form'
import { metadataInstancesApi, taskApi } from '@tap/api'

import './style.scss'
import { useStore } from 'vuex'

const useTableExist = (attrs, selectRef, connectionId) => {
  if (!attrs.allowCreate) {
    return {
      showNotExistsTip: ref(false),
      leftPosition: ref(''),
      handleCreated: () => {},
      handleChange: () => {},
    }
  }

  // 显示物理表不存在提示
  const showNotExistsTip = ref(false)
  // 检查物理表是否存在
  const checkTableExist = async (tableName) => {
    if (!tableName) return
    try {
      const data = await metadataInstancesApi.checkTableExist({
        connectionId,
        tableName,
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
  const handleCreated = (value) => {
    setTagPosition(value)
    clearTimeout(timer)
    timer = setTimeout(() => {
      showNotExistsTip.value = true
    }, 10)
  }
  const handleChange = () => {
    showNotExistsTip.value = false
  }
  const setTagPosition = (tableName) => {
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
  let baseLeftPosition
  let leftPosition = ref('')

  watch(() => attrs.value, handleChange)

  onMounted(() => {
    $input = selectRef.value.$el.querySelector('input')
    const { fontSize, fontFamily, fontWeight } = getComputedStyle($input)

    inputStyle = {
      fontSize,
      fontFamily,
      fontWeight,
      visibility: 'hidden',
    }

    // 8: .el-input__prefix-inner > :last-child {margin-right: 8px;}
    // 4: 间距
    baseLeftPosition = parseInt($input.offsetLeft) + 4

    checkTableExist(attrs.value)
  })

  return {
    showNotExistsTip,
    leftPosition,
    handleCreated,
    handleChange,
  }
}

export const TableSelect = observer(
  defineComponent({
    name: 'TableSelect',
    props: ['reloadTime', 'connectionId'],
    setup(props, { attrs }) {
      const select = ref(null)
      const store = useStore()
      const params = computed(() => {
        return {
          reloadTime: props.reloadTime,
          where: {
            'source.id': props.connectionId,
            taskId: store.state.dataflow.taskId,
          },
        }
      })

      const { showNotExistsTip, leftPosition, handleCreated } = useTableExist(attrs, select, props.connectionId)

      const loading = ref(false)

      const loadSelectData = () => {
        select.value.query = ''
        select.value.loadData()
      }

      const loadSchema = async (keys) => {
        // refs.select.blur()
        loading.value = true
        await taskApi
          .refreshSchema(store.state.dataflow.taskId, {
            nodeIds: store.state.dataflow.activeNodeId,
            keys,
          })
          .finally(() => {
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

      return () => {
        const scopedSlots = {
          'created-option': ({ value }) => (
            <span class="flex align-center gap-1">
              {value}
              <ElTag class="ml-1">{i18n.t('packages_dag_table_not_exist')}</ElTag>
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
            ),
        }

        if (showNotExistsTip.value) {
          scopedSlots.prefix = () => (
            <ElTag
              class="position-absolute translate-middle-y top-50 m-0 prefix-tag"
              style={{ left: leftPosition.value }}
            >
              {i18n.t('packages_dag_table_not_exist')}
            </ElTag>
          )
        }

        return (
          <AsyncSelect
            {...attrs}
            loading={loading.value}
            class="async-select"
            ref={select}
            onCreate={handleCreated}
            itemType={attrs.itemType || 'string'}
            itemQuery={attrs.itemQuery || 'original_name'}
            params={params.value}
          >
            {scopedSlots}
          </AsyncSelect>
        )
      }
    },
  }),
)

export default TableSelect
