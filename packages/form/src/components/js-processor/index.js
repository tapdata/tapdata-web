import { defineComponent, ref, reactive, onUnmounted } from 'vue-demi'
import { FormItem, JsEditor } from '../index'
import { VCodeEditor, VirtualSelect } from '@tap/component'
import { taskApi } from '@tap/api'
import { useForm } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { observe } from '@formily/reactive'

export const JsProcessor = observer(
  defineComponent({
    props: ['value', 'disabled'],
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
        if (!formRef.value.values.$inputs.length) return
        tableLoading.value = true
        taskApi
          .getNodeTableInfo({
            taskId,
            nodeId: form.values.id,
            page: 1,
            pageSize: 10000
          })
          .then(({ items = [] }) => {
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

      observe(formRef.value.values.$inputs, () => {
        loadTable()
      })

      loadTable()

      const inputRef = ref('')
      const outputRef = ref('')

      let timer
      let version

      const handleQuery = () => {
        let lastVersion = version
        return taskApi
          .getRunJsResult({
            version,
            taskId,
            jsNodeId: form.values.id
          })
          .then(res => {
            // 版本号不一致
            if (lastVersion !== version) return true
            inputRef.value = res.before ? JSON.stringify(res.before, null, 2) : ''
            outputRef.value = res.after ? JSON.stringify(res.after, null, 2) : ''
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
        clearTimeout(timer)
        version = Date.now()
        taskApi.testRunJs({ ...params, version, script: props.value }).then(handleAutoQuery)
      }

      onUnmounted(() => {
        clearTimeout(timer)
      })

      return () => {
        return (
          <div class="js-processor font-color-light">
            <FormItem.BaseItem asterisk label="脚本">
              <JsEditor
                value={props.value}
                onChange={val => {
                  emit('change', val)
                }}
                height={350}
                options={{ showPrintMargin: false, useWrapMode: true, readOnly: props.disabled }}
              ></JsEditor>
            </FormItem.BaseItem>

            <div class="flex align-center">
              <FormItem.BaseItem asterisk class="flex-1 mr-4" label="选择表" layout="horizontal" feedbackLayout="none">
                <VirtualSelect
                  value={params.tableName}
                  filterable
                  class="form-input"
                  item-size={34}
                  items={tableList.value}
                  loading={tableLoading.value}
                  onInput={val => {
                    params.tableName = val
                  }}
                />
              </FormItem.BaseItem>
              <div class="flex-1 flex justify-content-between">
                <FormItem.BaseItem label="数据行数" layout="horizontal" feedbackLayout="none">
                  <ElInputNumber
                    style="width: 100px;"
                    value={params.rows}
                    max={10}
                    onInput={val => {
                      params.rows = val
                    }}
                    controls-position="right"
                  ></ElInputNumber>
                </FormItem.BaseItem>
                <ElButton
                  disabled={!params.tableName}
                  loading={running.value || tableLoading.value}
                  onClick={handleRun}
                  type="primary"
                  size="small"
                >
                  试运行
                </ElButton>
              </div>
            </div>

            <div class="flex" v-loading={running.value}>
              <FormItem.BaseItem class="flex-1 mr-4" label="调试输入">
                <VCodeEditor
                  class="border rounded-2"
                  value={inputRef.value}
                  lang="json"
                  options={{ readOnly: true }}
                  style="height: calc((100vh - 120px);"
                ></VCodeEditor>
              </FormItem.BaseItem>

              <FormItem.BaseItem class="flex-1" label="结果输出">
                <VCodeEditor
                  class="border rounded-2"
                  value={outputRef.value}
                  lang="json"
                  options={{ readOnly: true }}
                  style="height: calc((100vh - 120px);"
                ></VCodeEditor>
              </FormItem.BaseItem>
            </div>
          </div>
        )
      }
    }
  })
)
