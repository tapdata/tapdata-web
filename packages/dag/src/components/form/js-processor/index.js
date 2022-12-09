import { defineComponent, ref, reactive, onUnmounted } from '@vue/composition-api'
import { useForm } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { observe } from '@formily/reactive'
import { groupBy } from 'lodash'

import i18n from '@tap/i18n'
import { FormItem, JsEditor, HighlightCode } from '@tap/form'
import { VCodeEditor, VirtualSelect } from '@tap/component'
import resize from '@tap/component/src/directives/resize'
import { javascriptFunctionsApi, taskApi, monitoringLogsApi } from '@tap/api'
import { JsDeclare } from '../js-declare'
import './style.scss'

export const JsProcessor = observer(
  defineComponent({
    props: ['value', 'disabled'],
    directives: {
      resize
    },
    setup(props, { emit, root, attrs }) {
      const { id: taskId, testTaskId, syncType } = root.$store.state.dataflow.taskInfo
      const formRef = useForm()
      const form = formRef.value
      const tableLoading = ref(false)
      const running = ref(false)
      const runningText = ref('')
      const fullscreen = ref(false)
      const showDoc = ref(false)
      const isMigrate = syncType === 'migrate'

      let queryStart
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

      const handleQuery = async () => {
        let lastVersion = version
        let isOver = await taskApi
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
        await monitoringLogsApi.query({
          taskId: testTaskId,
          type: 'testRun',
          order: 'asc',
          page: 1,
          pageSize: 50,
          start: queryStart,
          end: Date.now()
        })
        return isOver
      }

      const resetQuery = args => {
        console.log(args) // eslint-disable-line
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

        if (queryTimes > 20) {
          resetQuery()
          root.$message.error(i18n.t('packages_form_js_processor_index_qingqiuchaoshiqing'))
          return
        }
        handleQuery()
          .then(isOver => {
            if (!isOver) {
              timer = setTimeout(() => {
                handleAutoQuery()
              }, 500)
            } else {
              resetQuery()
            }
          })
          .catch(resetQuery)
      }

      const handleRun = () => {
        clearTimeout(timer)
        version = Date.now()
        taskApi.testRunJs({ ...params, version, script: props.value }).then(() => {
          queryStart = Date.now()
          handleAutoQuery()
        })
      }

      onUnmounted(() => {
        clearTimeout(timer)
      })

      const toggleFullscreen = () => {
        fullscreen.value = !fullscreen.value
      }

      const toggleDoc = event => {
        event.stopPropagation()
        showDoc.value = !showDoc.value
        console.log('toggleDoc', showDoc.value) // eslint-disable-line
      }

      let functionGroup = reactive([])
      const classDescMap = {
        DateUtil: '日期处理',
        idGen: 'ID生成器',
        networkUtil: '网络工具'
      }
      const loadFunction = async () => {
        const data = await javascriptFunctionsApi.get({
          filter: JSON.stringify({
            limit: 1000,
            where: {
              type: 'system'
            }
          })
        })
        const group = groupBy(data.items, 'className')
        const noClassFunction = group['']
        delete group['']
        functionGroup = group
        // console.log('loadFunction', groupBy(data.items, 'className')) // eslint-disable-line
      }

      loadFunction()

      return () => {
        const editorProps = { ...attrs }
        editorProps.options.readOnly = props.disabled

        const label = (
          <div class="position-absolute flex align-center w-100">
            <span class="formily-element-form-item-asterisk">*</span>
            <span class="flex-1">{i18n.t('packages_form_js_processor_index_jiaoben')}</span>
            <ElLink class="mr-3" onClick={toggleDoc} type="primary">
              API文档
            </ElLink>
            <ElLink onClick={toggleFullscreen} class="js-editor-fullscreen" type="primary">
              <VIcon class="mr-1">fangda</VIcon>
              {i18n.t('packages_form_js_editor_fullscreen')}
            </ElLink>
          </div>
        )

        const runTool = (
          <div class="flex align-center">
            {isMigrate && (
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
            )}
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
                class="ml-4"
                disabled={isMigrate && !params.tableName}
                loading={running.value || tableLoading.value}
                onClick={handleRun}
                type="primary"
                size="small"
              >
                {i18n.t('packages_form_js_processor_index_shiyunxing')}
              </ElButton>
            </div>
          </div>
        )

        const jsonView = (
          <div class="flex json-view-wrap" v-loading={running.value} element-loading-text={runningText.value}>
            <div class="json-view flex-1 mr-4 border rounded-2 overflow-hidden">
              <div class="json-view-header">{i18n.t('packages_form_js_processor_index_tiaoshishuru')}</div>
              <VCodeEditor
                class="py-0 json-view-editor"
                value={inputRef.value}
                lang="json"
                options={{ readOnly: true, highlightActiveLine: false, highlightGutterLine: false }}
                theme="chrome"
              ></VCodeEditor>
            </div>
            <div class="json-view flex-1 border rounded-2 overflow-hidden">
              <div class="json-view-header">{i18n.t('packages_form_js_processor_index_jieguoshuchu')}</div>
              <VCodeEditor
                class="py-0 json-view-editor"
                value={outputRef.value}
                lang="json"
                options={{ readOnly: true, highlightActiveLine: false, highlightGutterLine: false }}
                theme="chrome"
              ></VCodeEditor>
            </div>
          </div>
        )

        return (
          <div class="js-processor font-color-light">
            <ElDrawer
              append-to-body
              modal={false}
              title="API"
              visible={showDoc.value}
              on={{
                ['update:visible']: v => {
                  console.log('update:visible', v) // eslint-disable-line
                  showDoc.value = v
                }
              }}
            >
              <div class="px-4 js-doc-content">
                {Object.keys(functionGroup).map(className => {
                  return [
                    <h2>{className}</h2>,
                    classDescMap[className] && <p>{classDescMap[className]}</p>,
                    <h3>方法</h3>,
                    functionGroup[className].map(item => {
                      return [
                        <h4>{item.methodName}</h4>,
                        <ul>
                          <li>作用</li>
                          <li>用法</li>
                        </ul>,
                        <HighlightCode code={item.format}></HighlightCode>
                      ]
                    })
                  ]
                })}
              </div>
            </ElDrawer>
            <div
              class={[
                'js-processor-editor',
                {
                  fullscreen: fullscreen.value
                }
              ]}
            >
              <div class="js-processor-editor-toolbar border-bottom justify-content-between align-center px-4 py-2">
                {fullscreen && runTool}
                <div>
                  <ElLink class="mr-3" onClick={toggleDoc} type="primary">
                    API文档
                  </ElLink>
                  <ElLink onClick={toggleFullscreen} class="js-editor-fullscreen" type="primary">
                    <VIcon class="mr-1">suoxiao</VIcon> {i18n.t('packages_form_js_editor_exit_fullscreen')}
                  </ElLink>
                </div>
              </div>

              <div class="js-editor-form-item-wrap">
                <FormItem.BaseItem class="js-editor-form-item" label={label}>
                  <JsEditor
                    value={props.value}
                    onChange={val => {
                      emit('change', val)
                    }}
                    height={350}
                    showFullscreen={false}
                    options={editorProps.options}
                    includeBeforeAndAfter={editorProps.includeBeforeAndAfter}
                    before={editorProps.before}
                    beforeRegexp={editorProps.beforeRegexp}
                    afterRegexp={editorProps.afterRegexp}
                    after={editorProps.after}
                  />
                </FormItem.BaseItem>

                <div
                  {...{
                    directives: [
                      {
                        name: 'resize',
                        value: {
                          minWidth: 100
                        },
                        modifiers: {
                          left: true
                        }
                      }
                    ]
                  }}
                  class="js-processor-editor-console border-start"
                >
                  <ElTabs class="w-100 flex flex-column">
                    <ElTabPane label="输出">
                      <div class="js-processor-editor-console-panel px-3">// 暂未实现</div>
                    </ElTabPane>
                    <ElTabPane label="对比">{fullscreen.value && jsonView}</ElTabPane>
                  </ElTabs>
                </div>
              </div>
            </div>

            <JsDeclare
              value={form.values.declareScript}
              onChange={val => {
                form.setValuesIn('declareScript', val)
              }}
              height={240}
              options={editorProps.options}
              param="schemaApplyResultList"
              handleAddCompleter={editorProps.handleAddCompleter}
            />
            {runTool}
            <div class="mt-4">{jsonView}</div>
          </div>
        )
      }
    }
  })
)
