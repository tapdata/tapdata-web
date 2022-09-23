import i18n from '@tap/i18n'
import { defineComponent, ref, reactive, onUnmounted } from 'vue-demi'
import { FormItem, JsEditor } from '../index'
import { VCodeEditor, VirtualSelect } from '@tap/component'
import { taskApi } from '@tap/api'
import { useForm } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { observe } from '@formily/reactive'
import { HighlightCode } from '../highlight-code'
import './style.scss'

export const JsProcessor = observer(
  defineComponent({
    props: ['value', 'disabled'],
    setup(props, { emit, root, attrs }) {
      const { taskId } = root.$store.state.dataflow
      const formRef = useForm()
      const form = formRef.value
      const tableLoading = ref(false)
      const running = ref(false)
      const runningText = ref('')
      const dialogVisible = ref(false)
      const codeExample = `// 增加一个字段，如果字段已存在则不操作
TapModelDeclare.addField(tapTable, 'fieldName', 'TapString')
// 移除一个已存在字段
TapModelDeclare.removeField(tapTable, 'fieldName')
// 更新一个已存在的字段
TapModelDeclare.updateField(tapTable, 'fieldName', 'TapString')
// 更新字段，如果不存在则新增
TapModelDeclare.upsertField(tapTable, 'fieldName', 'TapString')
// 设置字段为主键
TapModelDeclare.setPk(tapTable, 'fieldName')
// 取消主键
TapModelDeclare.unsetPk(tapTable, 'fieldName')
// 增加索引
TapModelDeclare.addIndex(tapTable, 'indexName', [{'filedName':'fieldName1', 'order': 'asc'}])
// 移除索引
TapModelDeclare.removeIndex(tapTable, 'indexName')
`

      let queryTimes = 0
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

      const resetQuery = () => {
        queryTimes = 0
        running.value = false
        runningText.value = ''
      }

      const handleAutoQuery = () => {
        running.value = true
        queryTimes++
        clearTimeout(timer)
        if (queryTimes > 5) {
          runningText.value = i18n.t('packages_form_js_processor_index_rengzaipinmingjia')
        }

        if (queryTimes > 10) {
          resetQuery()
          root.$message.error(i18n.t('packages_form_js_processor_index_qingqiuchaoshiqing'))
          return
        }
        handleQuery()
          .then(isOver => {
            if (!isOver) {
              timer = setTimeout(() => {
                handleAutoQuery()
              }, 2000)
            } else {
              resetQuery()
            }
          })
          .catch(resetQuery)
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
        const editorProps = { ...attrs }
        editorProps.options.readOnly = props.disabled
        return (
          <div class="js-processor font-color-light">
            <FormItem.BaseItem asterisk label={i18n.t('packages_form_js_processor_index_jiaoben')}>
              <JsEditor
                value={props.value}
                onChange={val => {
                  emit('change', val)
                }}
                height={350}
                options={editorProps.options}
                includeBeforeAndAfter={editorProps.includeBeforeAndAfter}
                before={editorProps.before}
                beforeRegexp={editorProps.beforeRegexp}
                afterRegexp={editorProps.afterRegexp}
                after={editorProps.after}
              />
            </FormItem.BaseItem>

            <el-collapse class="declare-collapse my-4 mx-n4 formily-element-form-collapse inset">
              <el-collapse-item name="1">
                <template slot="title">
                  <span class="font-color-light fw-normal">
                    {i18n.t('packages_form_js_processor_index_moxingshengming')}
                  </span>
                  <el-tooltip content="显式声明来定义和修改模型" placement="top">
                    <i class="ml-1 font-color-sslight header-icon el-icon-info"></i>
                  </el-tooltip>
                  <div class="flex-grow-1"></div>
                  <el-link
                    onClick={event => (event.stopPropagation(), (dialogVisible.value = true))}
                    type="primary"
                    class="mx-4"
                  >
                    使用帮助
                  </el-link>
                </template>
                <FormItem.BaseItem feedbackLayout="none">
                  <JsEditor
                    value={form.values.declareScript}
                    onChange={val => {
                      form.setValuesIn('declareScript', val)
                    }}
                    height={240}
                    options={editorProps.options}
                    before="function declare(schemaApplyResultList) {"
                    after={`  return schemaApplyResultList\n}`}
                    handleAddCompleter={editorProps.handleAddCompleter}
                  />
                </FormItem.BaseItem>
              </el-collapse-item>
            </el-collapse>

            <el-dialog
              title="模型声明"
              visible={dialogVisible.value}
              on={{
                'update:visible': v => (dialogVisible.value = v)
              }}
              append-to-body
              width="800"
            >
              <div class="">
                <div class="fs-6 mb-4">TapType</div>
                <HighlightCode
                  class="m-0"
                  code="type TapType = 'TapNumber' | 'TapString' | 'TapBoolean' | 'TapBinary' | 'TapDate' | 'TapDateTime' | 'TapTime' | 'TapYear' | 'TapRaw' | 'TapArray' | 'TapMap'"
                ></HighlightCode>
                <div class="fs-6 my-4">示例代码</div>
                <HighlightCode class="m-0" code={codeExample}></HighlightCode>
              </div>
              <span slot="footer" class="dialog-footer">
                <el-button type="primary" onClick={() => (dialogVisible.value = false)}>
                  确 定
                </el-button>
              </span>
            </el-dialog>

            <div class="flex align-center">
              <FormItem.BaseItem
                asterisk
                class="flex-1 mr-4"
                label={i18n.t('packages_form_js_processor_index_xuanzebiao')}
                layout="horizontal"
                feedbackLayout="none"
              >
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
                <FormItem.BaseItem
                  label={i18n.t('packages_form_js_processor_index_shujuhangshu')}
                  layout="horizontal"
                  feedbackLayout="none"
                >
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
                  {i18n.t('packages_form_js_processor_index_shiyunxing')}
                </ElButton>
              </div>
            </div>

            <div class="flex" v-loading={running.value} element-loading-text={runningText.value}>
              <FormItem.BaseItem class="flex-1 mr-4" label={i18n.t('packages_form_js_processor_index_tiaoshishuru')}>
                <VCodeEditor
                  class="border rounded-2 py-0"
                  value={inputRef.value}
                  lang="json"
                  options={{ readOnly: true }}
                  theme="chrome"
                  style="height: calc((100vh - 120px);"
                ></VCodeEditor>
              </FormItem.BaseItem>

              <FormItem.BaseItem class="flex-1" label={i18n.t('packages_form_js_processor_index_jieguoshuchu')}>
                <VCodeEditor
                  class="border rounded-2 py-0"
                  value={outputRef.value}
                  lang="json"
                  options={{ readOnly: true }}
                  theme="chrome"
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
