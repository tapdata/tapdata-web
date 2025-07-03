import { observe } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import {
  javascriptFunctionsApi,
  metadataInstancesApi,
  monitoringLogsApi,
  taskApi,
} from '@tap/api'
import VCodeEditor from '@tap/component/src/base/VCodeEditor.vue'
import {  VEmpty } from '@tap/component/src/base/v-empty'
import resize from '@tap/component/src/directives/resize'

import { FormItem, HighlightCode, JsEditor, useForm } from '@tap/form'
import i18n from '@tap/i18n'
import Time from '@tap/shared/src/time'
import { groupBy } from 'lodash-es'
import { defineComponent, onUnmounted, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'
import { JsDeclare } from '../js-declare'
import './style.scss'

export const JsProcessor = observer(
  defineComponent({
    props: ['value', 'disabled', 'isStandard'],
    directives: {
      resize,
    },
    setup(props, { emit, attrs }) {
      const store = useStore()
      const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
      const { id: taskId, syncType } = store.state.dataflow.taskInfo
      const formRef = useForm()
      const form = formRef.value
      const tableLoading = ref(false)
      const running = ref(false)
      const runningText = ref('')
      const fullscreen = ref(false)
      const showDoc = ref(false)
      const isMigrate = syncType === 'migrate'
      const showJsonArea = ref(false)
      const docSrc = `${
        isDaas
          ? `${location.origin}/docs${i18n.locale === 'en' ? '/en' : ''}`
          : `https://docs.tapdata.${store.getters.isDomesticStation ? 'net' : 'io'}`
      }/appendix/${props.isStandard ? 'standard' : 'enhanced'}-js?from=cloud`
      const beforeJsonRef = ref()
      const afterJsonRef = ref()

      let queryStart
      let queryTimes = 0
      const params = reactive({
        taskId,
        jsNodeId: form.values.id,
        tableName: '',
        rows: 1,
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
            pageSize: 10000,
          })
          .then(({ items = [] }) => {
            tableList.value = items.map((item) => ({
              label: item.previousTableName,
              value: item.previousTableName,
            }))
            params.tableName = tableList.value[0]?.value
          })
          .finally(() => {
            tableLoading.value = false
          })
      }

      if (isMigrate) {
        observe(formRef.value.values.$inputs, () => {
          loadTable()
        })

        loadTable()
      }

      const inputRef = ref('')
      const outputRef = ref('')

      let timer
      let outTimer
      let logTimer
      let version
      const logList = ref([])
      const logLoading = ref(false)
      const nodeId = form.values.id

      const queryLog = async () => {
        try {
          const logData = await monitoringLogsApi.query({
            taskId: store.state.dataflow.taskInfo.testTaskId,
            type: 'testRun',
            order: 'asc',
            page: 1,
            pageSize: 50,
            start: queryStart,
            nodeId,
            end: Time.now(),
          })
          logList.value =
            logData?.items.filter(
              (item) => !new RegExp(`^.*\\[${nodeId}]`).test(item.message),
            ) || []
        } catch (error) {
          console.error('Failed to query logs:', error)
          logList.value = []
        }
      }

      const handleQuery = async () => {
        const lastVersion = version
        const isOver = await taskApi
          .getRunJsResult({
            version,
            taskId,
            jsNodeId: nodeId,
          })
          .then((res) => {
            // 版本号不一致
            if (lastVersion !== version) return true
            inputRef.value = res.before
              ? JSON.stringify(res.before, null, 2)
              : ''
            outputRef.value = res.after
              ? JSON.stringify(res.after, null, 2)
              : ''
            return res.over
          })

        if (isOver) running.value = false

        await queryLog()

        return isOver
      }

      const resetQuery = () => {
        queryTimes = 0
        running.value = false
        runningText.value = ''
        logLoading.value = false
        clearTimeout(timer)
        clearTimeout(logTimer)
        clearTimeout(outTimer)
      }

      const handleAutoQuery = () => {
        running.value = true
        queryTimes++
        clearTimeout(timer)
        if (queryTimes > 5) {
          runningText.value = i18n.t(
            'packages_form_js_processor_index_rengzaipinmingjia',
          )
        }

        if (queryTimes > 40) {
          resetQuery()
          ElMessage.error(
            i18n.t('packages_form_js_processor_index_qingqiuchaoshiqing'),
          )
          return
        }
        handleQuery()
          .then((isOver) => {
            if (!isOver) {
              timer = setTimeout(() => {
                handleAutoQuery()
              }, 500)
            } else {
              // 两秒后再去拿一次日志
              outTimer = setTimeout(() => {
                logTimer = setInterval(async () => {
                  await queryLog()
                  // 不继续轮询了
                  // if (logList.value.length) {
                  resetQuery()
                  // }
                }, 1000)
              }, 2000)

              /*if (!logList.value.length) {
                outTimer = setTimeout(() => {
                  logTimer = setInterval(async () => {
                    await queryLog()
                    if (logList.value.length) {
                      resetQuery()
                    }
                  }, 500)
                }, 1000)
              } else {
                resetQuery()
              }*/
            }
          })
          .catch(resetQuery)
      }

      const handleRun = async () => {
        const { jsType } = form.values
        resetQuery()
        running.value = true
        logLoading.value = true
        showJsonArea.value = true
        clearTimeout(timer)
        version = Time.now()
        queryStart = Time.now()

        if (!fullscreen.value) toggleFullscreen()

        if (jsType === 1) {
          let before, after, logs, result
          try {
            result = await taskApi.testRunJsRpc({
              ...params,
              version,
              script: props.value,
              jsType,
            })
          } catch (error) {
            console.log(error) // eslint-disable-line
            result = error?.data?.data
          }
          before = result?.before
          after = result?.after
          logs = result?.logs
          inputRef.value = before ? JSON.stringify(before, null, 2) : ''
          outputRef.value = after ? JSON.stringify(after, null, 2) : ''
          logList.value =
            logs?.filter(
              (item) => !new RegExp(`^.*\\[${nodeId}]`).test(item.message),
            ) || []
          resetQuery()
        } else {
          taskApi
            .testRunJs({ ...params, version, script: props.value, jsType })
            .then(
              () => {
                queryStart = Time.now()
                handleAutoQuery()
              },
              async () => {
                // 脚本执行出错
                await queryLog()
                resetQuery()
              },
            )
        }
      }

      onUnmounted(() => {
        clearTimeout(timer)
      })

      const toggleFullscreen = () => {
        fullscreen.value = !fullscreen.value
        setTimeout(() => {
          jsEditor.resize(true)
        }, 10)
      }

      const toggleDoc = (event) => {
        event.stopPropagation()
        showDoc.value = !showDoc.value
      }

      const functionGroup = ref({})
      const classDescMap = {
        DateUtil: i18n.t('packages_dag_js_processor_index_riqichuli'),
        idGen: i18n.t('packages_dag_js_processor_index_iDshengchengqi'),
        networkUtil: i18n.t('packages_dag_js_processor_index_wangluogongju'),
      }
      const loadFunction = async () => {
        const data = await javascriptFunctionsApi.get({
          filter: JSON.stringify({
            limit: 1000,
            where: {
              type: 'system',
              category: props.isStandard
                ? 'standard'
                : {
                    $in: ['enhanced', 'standard'],
                  },
            },
          }),
        })
        const group = groupBy(data.items, 'className')
        const noClassFunction = group['']
        delete group['']
        functionGroup.value = group
      }

      loadFunction()

      const onTabChange = (current) => {
        if (current == '1') {
          beforeJsonRef.value.editor.resize(true)
          afterJsonRef.value.editor.resize(true)

          setTimeout(() => {
            beforeJsonRef.value.editor.resize(true)
            afterJsonRef.value.editor.resize(true)
          }, 300)
        }
      }

      function getPrefix(line, index) {
        let prefix = ''
        let i = index - 1
        while (i >= 0 && /^\w+$/.test(line.charAt(i))) {
          prefix = line.charAt(i) + prefix
          i--
        }
        return prefix
      }

      let jsEditor
      const onEditorInit = (editor) => {
        jsEditor = editor
        const idx =
          editor.completers?.findIndex((item) => item.id === 'recordFields') ||
          -1

        if (~idx) editor.completers.splice(idx, 1)

        editor.completers.push({
          id: 'recordFields',
          // 获取补全提示列表
          getCompletions(editor, session, pos, prefix, callback) {
            // 判断当前行是否包含 '.'
            const line = session.getLine(pos.row)
            const index = pos.column - 1
            if (index >= 0 && line.charAt(index) === '.') {
              // 获取前缀
              const prefix = getPrefix(line, index)
              if (prefix === 'record') {
                callback(null, nodeFields)
              }
            }
          },
        })
        // 绑定 '.' 按键事件
        editor.keyBinding.addKeyboardHandler({
          handleKeyboard({ editor }, hash, keyString, keyCode, event) {
            if (keyString === '.' && keyCode !== undefined) {
              setTimeout(() => {
                editor.execCommand('startAutocomplete')
              }, 10)
            }
          },
        })
      }

      let nodeFields = []
      const loadFields = async () => {
        let fields = []
        if (!formRef.value.values.$inputs.length) return
        if (form.values.type.includes('migrate')) {
          const result = await metadataInstancesApi.nodeSchemaPage({
            nodeId,
            fields: [
              'original_name',
              'fields',
              'qualified_name',
              'name',
              'indices',
            ],
            page: 1,
            pageSize: 1,
          })
          fields = result.items[0]?.fields || []
        } else {
          const data = await metadataInstancesApi.nodeSchema(nodeId)
          fields = data?.[0]?.fields || []
        }

        nodeFields =
          fields
            .filter((item) => !item.is_deleted)
            .map((f) => {
              return {
                value: f.field_name,
                score: 1000,
                meta: f.data_type,
              }
            }) || []
      }

      // 加载模型字段
      loadFields()
      // 模型自动改变
      useAfterTaskSaved(formRef.value.values.$inputs, loadFields)

      const renderTool = () => (
        <div class="flex align-center">
          {isMigrate && (
            <FormItem.BaseItem
              asterisk
              class="flex-1 mr-4"
              label={i18n.t('packages_form_js_processor_index_xuanzebiao')}
              layout="horizontal"
              feedbackLayout="none"
            >
              <ElSelectV2
                disabled={props.disabled}
                v-model={params.tableName}
                filterable
                class="form-input"
                item-size={34}
                options={tableList.value}
                loading={tableLoading.value}
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
                disabled={props.disabled}
                style="width: 100px;"
                modelValue={params.rows}
                min={1}
                max={10}
                onInput={(val) => {
                  params.rows = val
                }}
                controls-position="right"
              ></ElInputNumber>
            </FormItem.BaseItem>
            <ElButton
              class="ml-4"
              disabled={props.disabled || (isMigrate && !params.tableName)}
              loading={running.value || tableLoading.value}
              onClick={handleRun}
              type="primary"
            >
              {i18n.t('packages_form_js_processor_index_shiyunxing')}
            </ElButton>
          </div>
        </div>
      )

      const jsonView = () => (
        <div
          class="flex json-view-wrap"
          v-loading={running.value}
          element-loading-text={runningText.value}
        >
          <div class="json-view flex-1 mr-4 border rounded-2 overflow-hidden">
            <div class="json-view-header">
              {i18n.t('packages_form_js_processor_index_tiaoshishuru')}
            </div>
            <VCodeEditor
              ref={beforeJsonRef}
              class="py-0 json-view-editor flex-1"
              value={inputRef.value}
              lang="json"
              options={{
                readOnly: true,
                highlightActiveLine: false,
                highlightGutterLine: false,
              }}
              theme="chrome"
            ></VCodeEditor>
          </div>
          <div class="json-view flex-1 border rounded-2 overflow-hidden">
            <div class="json-view-header">
              {i18n.t('packages_form_js_processor_index_jieguoshuchu')}
            </div>
            <VCodeEditor
              ref={afterJsonRef}
              class="py-0 json-view-editor flex-1"
              value={outputRef.value}
              lang="json"
              options={{
                readOnly: true,
                highlightActiveLine: false,
                highlightGutterLine: false,
              }}
              theme="chrome"
            ></VCodeEditor>
          </div>
        </div>
      )

      return () => {
        const editorProps = { ...attrs }
        editorProps.options.readOnly = props.disabled
        const tooltip = props.isStandard
          ? i18n.t('packages_form_js_processor_index_tooltip1')
          : i18n.t('packages_form_js_processor_index_tooltip2')
        const label = (
          <div class="position-absolute flex justify-content-between w-100">
            <div class="flex align-center">
              <span class="formily-element-plus-form-item-asterisk">*</span>
              <span>{i18n.t('packages_form_js_processor_index_jiaoben')}</span>
              <ElTooltip content={tooltip} placement="top" class="ml-2">
                <VIcon size="14" class="color-primary">
                  info
                </VIcon>
              </ElTooltip>
            </div>
            <div class="flex align-center" style="--btn-space: 4px;">
              <ElButton text tag="a" onClick={toggleDoc} type="primary">
                {i18n.t('packages_dag_api_docs')}
              </ElButton>
              <ElButton
                text
                tag="a"
                onClick={toggleFullscreen}
                class="js-editor-fullscreen"
                type="primary"
              >
                <VIcon class="mr-1">fangda</VIcon>
                {i18n.t('packages_form_js_editor_fullscreen')}
              </ElButton>
            </div>
          </div>
        )

        return (
          <div class="js-processor font-color-light">
            <ElDrawer
              append-to-body
              modal={false}
              title={i18n.t('packages_dag_api_docs')}
              size={680}
              v-model={showDoc.value}
              class="js-api-drawer"
            >
              <iframe ref="docsIframe" src={docSrc} class="w-100 h-100 block" />
            </ElDrawer>
            <div
              class={[
                'js-processor-editor',
                {
                  fullscreen: fullscreen.value,
                },
              ]}
            >
              <div class="js-processor-editor-toolbar border-bottom justify-content-between align-center px-4 py-2">
                <div
                  style={{ display: fullscreen.value ? 'contents' : 'none' }}
                >
                  {renderTool()}
                </div>
                <div style="--btn-space: 4px;">
                  <ElButton text type="primary" onClick={toggleDoc}>
                    {i18n.t('packages_dag_api_docs')}
                  </ElButton>
                  <ElButton
                    text
                    type="primary"
                    onClick={toggleFullscreen}
                    class="js-editor-fullscreen"
                  >
                    <VIcon class="mr-1">suoxiao</VIcon>{' '}
                    {i18n.t('packages_form_js_editor_exit_fullscreen')}
                  </ElButton>
                </div>
              </div>

              <div class="js-editor-form-item-wrap overflow-hidden">
                <FormItem.BaseItem class="js-editor-form-item" label={label}>
                  <JsEditor
                    ref="jsEditor"
                    value={props.value}
                    onChange={(val) => {
                      emit('change', val)
                    }}
                    onInit={onEditorInit}
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
                          minWidth: 100,
                        },
                        modifiers: {
                          left: true,
                        },
                      },
                    ],
                  }}
                  class="js-processor-editor-console border-start"
                >
                  <ElTabs
                    onInput={onTabChange}
                    class="w-100 flex"
                    style="--el-tabs-padding-left: 1rem;"
                  >
                    <ElTabPane label={i18n.t('public_time_output')}>
                      <div class="js-processor-editor-console-panel h-100 overflow-auto">
                        <div class="js-log-list">
                          {logList.value.length
                            ? logList.value.map((item) => {
                                if (/^[{[].*[\]}]$/.test(item.message)) {
                                  let code
                                  try {
                                    code = JSON.stringify(
                                      JSON.parse(item.message),
                                      null,
                                      2,
                                    )
                                  } catch {
                                    const message = item.message
                                      .replace(/^[{[](.*)[\]}]$/, '$1')
                                      .split(', ')
                                    code = `${item.message.charAt(0)}\n${message
                                      .map((line) => `  ${line}`)
                                      .join(
                                        '\n',
                                      )}\n${item.message.charAt(item.message.length - 1)}`
                                  }

                                  return (
                                    <details class="js-log-list-item p-2">
                                      <summary class="text-truncate px-2">
                                        {item.message}
                                      </summary>
                                      <HighlightCode
                                        class="m-0"
                                        language="json"
                                        code={code}
                                      ></HighlightCode>
                                    </details>
                                  )
                                }
                                return (
                                  <div class="js-log-list-item text-prewrap text-break p-2">
                                    {item.errorStack || item.message}
                                  </div>
                                )
                              })
                            : !logLoading.value && <VEmpty large></VEmpty>}
                          <div
                            class={[
                              'justify-content-center align-center m-0 p-2',
                              logLoading.value ? 'flex' : 'none',
                            ]}
                          >
                            <svg viewBox="25 25 50 50" class="circular">
                              <circle
                                cx="50"
                                cy="50"
                                r="20"
                                fill="none"
                                class="path"
                              ></circle>
                            </svg>
                            <span class="ml-1 font-color-light">
                              {i18n.t('packages_dag_loading')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </ElTabPane>
                    <ElTabPane
                      label={i18n.t('packages_dag_js_processor_index_duibi')}
                    >
                      <div
                        style={{
                          display: fullscreen.value ? 'contents' : 'none',
                        }}
                      >
                        {jsonView()}
                      </div>
                    </ElTabPane>
                  </ElTabs>
                </div>
              </div>
            </div>

            <JsDeclare
              value={form.values.declareScript}
              onChange={(val) => {
                form.setValuesIn('declareScript', val)
              }}
              height={240}
              options={editorProps.options}
              param={editorProps.param}
              handleAddCompleter={editorProps.handleAddCompleter}
            />
            <div class="pb-4">
              <div style={{ display: !fullscreen.value ? 'contents' : 'none' }}>
                {renderTool()}
              </div>
              {showJsonArea.value && (
                <div class="mt-4 json-view-area">{jsonView()}</div>
              )}
            </div>
          </div>
        )
      }
    },
  }),
)
