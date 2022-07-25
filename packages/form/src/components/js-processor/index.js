import { defineComponent, ref, reactive } from 'vue-demi'
import { FormLayout, FormItem, JsEditor } from '../index'
import { VCodeEditor, VirtualSelect } from '@tap/component'
import { taskApi } from '@tap/api'
import { useForm } from '@formily/vue'

export const JsProcessor = defineComponent({
  props: ['value'],
  setup(props, { emit, root }) {
    const { taskId } = root.$store.state.dataflow
    const formRef = useForm()
    const form = formRef.value
    const tableLoading = ref(false)
    const running = ref(false)
    const params = reactive({
      taskId,
      jsNodeId: form.values.id,
      tableName: '',
      rows: 1
    })
    const tableList = ref([])

    const loadTable = () => {
      tableLoading.value = true
      taskApi
        .getNodeTableInfo({
          taskId,
          nodeId: form.values.id,
          page: 1,
          pageSize: 10000
        })
        .then(({ items }) => {
          tableList.value = items.map(item => ({
            label: item.previousTableName,
            value: item.previousTableName
          }))
          params.tableName = tableList.value[0]?.value
        })
        .finally(() => {
          tableLoading.value = false
        })
    }

    loadTable()

    const inputRef = ref('')
    const outputRef = ref('')

    let timer

    const handleQuery = () => {
      return taskApi
        .getRunJsResult({
          taskId,
          jsNodeId: form.values.id
        })
        .then(res => {
          inputRef.value = JSON.stringify(res.before, null, 2)
          outputRef.value = JSON.stringify(res.after, null, 2)
          return res.over
        })
    }

    const handleAutoQuery = () => {
      running.value = true
      clearTimeout(timer)
      handleQuery().then(isOver => {
        if (!isOver) {
          timer = setTimeout(() => {
            handleAutoQuery()
          }, 2000)
        } else {
          running.value = false
        }
      })
    }

    const handleRun = () => {
      taskApi.testRunJs(params).then(() => {
        handleAutoQuery()
      })
    }

    return () => {
      return (
        <div class="js-processor">
          <FormItem.BaseItem label="脚本">
            <JsEditor
              value={props.value}
              onChange={val => {
                emit('change', val)
              }}
              height={350}
              options={{ showPrintMargin: false, useWrapMode: true }}
            ></JsEditor>
          </FormItem.BaseItem>

          <div class="flex align-center mb-2">
            <div class="flex align-center mr-4 text-nowrap">
              <span class="mr-2">选择表</span>
              <VirtualSelect
                value={params.tableName}
                filterable
                class="form-input"
                item-size={50}
                items={tableList.value}
                loading={tableLoading.value}
                onInput={val => {
                  params.tableName = val
                }}
              />
            </div>
            <div class="flex align-center text-nowrap">
              <span class="mr-2">数据行数</span>
              <ElInputNumber
                value={params.rows}
                onInput={val => {
                  params.rows = val
                }}
                class="mx-4"
                controls-position="right"
              ></ElInputNumber>
            </div>
            <ElButton loading={running.value || tableLoading.value} onClick={handleRun} type="primary" size="small">
              试运行
            </ElButton>
          </div>

          <div class="flex align-center mb-2">
            <div class="flex align-center flex-1 mr-4">
              <div>调试输入</div>
            </div>
            <div class="flex-1">结果输出</div>
          </div>
          <div class="flex align-center" v-loading={running.value}>
            <div class="flex-1 mr-4">
              <VCodeEditor value={inputRef.value} lang="json" height={450}></VCodeEditor>
            </div>
            <div class="flex-1">
              <VCodeEditor value={outputRef.value} lang="json" height={450}></VCodeEditor>
            </div>
          </div>
        </div>
      )
    }
  }
})
