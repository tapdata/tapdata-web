import { observe } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import { SchemaExpressionScopeSymbol } from '@formily/vue'
import {
  getNodeSchema,
  getNodeSchemaPage,
} from '@tap/api/src/core/metadata-instances'
import { queryMonitoringLogs } from '@tap/api/src/core/monitoring-logs'
import {
  getJsMockData,
  getNodeTableInfo,
  getRunJsResult,
  testRunJs,
  testRunJsRpc,
} from '@tap/api/src/core/task'
import VCodeEditor from '@tap/component/src/base/VCodeEditor.vue'
import VIcon from '@tap/component/src/base/VIcon.vue'

import { FormItem, HighlightCode, JsEditor, useForm } from '@tap/form'

import { useI18n } from '@tap/i18n'
import Time from '@tap/shared/src/time'
import {
  computed,
  defineComponent,
  inject,
  nextTick,
  onBeforeUnmount,
  onUnmounted,
  reactive,
  ref,
} from 'vue'
import { useStore } from 'vuex'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'
import { useDataflowStore } from '../../../stores/dataflow.store'
import BaseNodeIcon from '../../BaseNodeIcon.vue'
import { JsDeclare } from '../js-declare'
import AiCodeDialog from './AiCodeDialog.vue'
import './style.scss'

export const JsProcessor = observer(
  defineComponent({
    props: ['value', 'disabled', 'isStandard'],
    setup(props, { emit, attrs }) {
      const dataflowStore = useDataflowStore()
      const { t, locale } = useI18n()
      const store = useStore()
      const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
      const SchemaExpressionScopeContext = inject(SchemaExpressionScopeSymbol)
      const task = SchemaExpressionScopeContext!.value.$settings
      const findParentNode = SchemaExpressionScopeContext!.value.findParentNode
      const { id: taskId, syncType } = task
      const formRef = useForm()
      const form = formRef.value
      const tableLoading = ref(false)
      const showDoc = ref(false)
      const isMigrate = syncType === 'migrate'
      const aiDialogRef = ref(null)
      const docSrc = `${
        isDaas
          ? `${location.origin}/docs${locale.value === 'en' ? '/en' : ''}`
          : `https://docs.tapdata.${store.getters.isDomesticStation ? 'net' : 'io'}`
      }/appendix/${props.isStandard ? 'standard' : 'enhanced'}-js?from=cloud`

      const params = reactive({
        taskId,
        jsNodeId: form.values.id,
        tableName: '',
        rows: 1,
      })
      const tableList = ref([])

      const checkSqlCapability = () => {
        const sourceNode = findParentNode(form.values.id)
        return dataflowStore.hasCapability(
          sourceNode,
          'run_raw_command_function',
        )
      }

      const hasSqlCapability = ref(checkSqlCapability())

      const loadTable = () => {
        if (!formRef.value.values.$inputs.length) return
        tableLoading.value = true
        getNodeTableInfo({
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

      const dispose = observe(formRef.value.values.$inputs, () => {
        if (isMigrate) {
          loadTable()
        }

        hasSqlCapability.value = checkSqlCapability()
      })

      onBeforeUnmount(() => {
        dispose?.()
      })

      if (isMigrate) {
        loadTable()
      }

      const nodeId = form.values.id

      const inputRef = ref('')
      const outputRef = ref('')
      const running = ref(false)
      const runningText = ref('')
      const fullscreen = ref(false)
      const showJsonArea = ref(false)
      const beforeJsonRef = ref()
      const afterJsonRef = ref()

      let queryStart
      let queryTimes = 0
      let timer
      let outTimer
      let logTimer
      let version
      const logList = ref<any[]>([])
      const logLoading = ref(false)

      const queryLog = async () => {
        try {
          const logData = await queryMonitoringLogs({
            taskId: task.testTaskId,
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
              (item) =>
                !new RegExp(`(\\[${nodeId}]|${nodeId}\\))`).test(item.message),
            ) || []
        } catch (error) {
          console.error('Failed to query logs:', error)
          logList.value = []
        }
      }

      const handleQuery = async () => {
        const lastVersion = version
        const isOver = await getRunJsResult({
          version,
          taskId,
          jsNodeId: nodeId,
        }).then((res) => {
          // 版本号不一致
          if (lastVersion !== version) return true
          inputRef.value = res.before ? JSON.stringify(res.before, null, 2) : ''
          outputRef.value = res.after ? JSON.stringify(res.after, null, 2) : ''
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
          runningText.value = t(
            'packages_form_js_processor_index_rengzaipinmingjia',
          )
        }

        if (queryTimes > 40) {
          resetQuery()
          ElMessage.error(
            t('packages_form_js_processor_index_qingqiuchaoshiqing'),
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
                  resetQuery()
                }, 1000)
              }, 2000)
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
            result = await testRunJsRpc({
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
              (item) =>
                !new RegExp(`(\\[${nodeId}]|${nodeId}\\))`).test(item.message),
            ) || []
          resetQuery()
        } else {
          testRunJs({ ...params, version, script: props.value, jsType }).then(
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

      // Mock test run state
      const mockMode = ref(false)
      const eventType = ref<'insert' | 'update' | 'delete' | 'custom'>('insert')
      const afterData = ref('')
      const beforeData = ref('')
      const customEventData = ref('')
      const mockOutput = ref('')
      const mockOutputError = ref('')
      const mockLogs = ref<
        Array<{ time: string; level: string; content: string }>
      >([])
      const mockRunning = ref(false)
      const gettingSample = ref(false)
      const sqlDialogVisible = ref(false)
      const sqlText = ref('SELECT * FROM ')
      const sqlPreviewData = ref<any[]>([])
      const sqlPreviewLoading = ref(false)

      const validateJsonArray = (str: string): boolean | null => {
        if (!str.trim()) return null
        try {
          const parsed = JSON.parse(str)
          return Array.isArray(parsed)
        } catch {
          return false
        }
      }

      const afterDataValid = computed(() => validateJsonArray(afterData.value))
      const beforeDataValid = computed(() =>
        validateJsonArray(beforeData.value),
      )
      const customEventDataValid = computed(() =>
        validateJsonArray(customEventData.value),
      )

      const mockInputValid = computed(() => {
        const et = eventType.value
        if (et === 'custom') return customEventDataValid.value
        if (et === 'insert') return afterDataValid.value
        if (et === 'delete') return beforeDataValid.value
        // update: both must be valid
        if (afterDataValid.value === null && beforeDataValid.value === null)
          return null
        if (afterDataValid.value === false || beforeDataValid.value === false)
          return false
        return afterDataValid.value && beforeDataValid.value
      })

      const mockOutputCount = computed(() => {
        if (!mockOutput.value.trim()) return 0
        try {
          const parsed = JSON.parse(mockOutput.value)
          return Array.isArray(parsed) ? parsed.length : 1
        } catch {
          return 0
        }
      })

      const addMockLog = (
        level: string,
        content: string,
        timestamp?: number,
      ) => {
        const now = timestamp ? new Date(timestamp) : new Date()
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
        mockLogs.value.push({ time, level, content })
      }

      const buildTestRunInputEventJson = (): string => {
        const et = eventType.value

        if (et === 'custom') {
          return customEventData.value?.trim() || '[]'
        }

        const afterArr: any[] =
          et === 'insert' || et === 'update'
            ? afterData.value?.trim()
              ? JSON.parse(afterData.value)
              : []
            : []
        const beforeArr: any[] =
          et === 'update' || et === 'delete'
            ? beforeData.value?.trim()
              ? JSON.parse(beforeData.value)
              : []
            : []

        if (et === 'insert') {
          return JSON.stringify(afterArr.map((item: any) => ({ after: item })))
        } else if (et === 'update') {
          return JSON.stringify(
            afterArr.map((item: any, i: number) => ({
              before: beforeArr[i] ?? {},
              after: item,
            })),
          )
        } else {
          return JSON.stringify(
            beforeArr.map((item: any) => ({ before: item })),
          )
        }
      }

      const handleMockRun = async () => {
        if (mockInputValid.value === false) {
          ElMessage.warning(t('packages_form_js_processor_mock_json_invalid'))
          return
        }
        const { jsType } = form.values
        resetQuery()
        mockRunning.value = true
        mockOutput.value = ''
        mockOutputError.value = ''
        const startTime = Date.now()
        version = Time.now()
        queryStart = Time.now()
        addMockLog('info', t('packages_form_js_processor_mock_log_start'))

        const testRunInputEventJson = buildTestRunInputEventJson()

        if (jsType === 1) {
          try {
            const result = await testRunJsRpc({
              ...params,
              version,
              script: props.value,
              jsType,
              testRunInputEventJson,
            })
            const elapsed = Date.now() - startTime
            const after = result?.after
            mockOutput.value = after ? JSON.stringify(after, null, 2) : ''
            if (result?.logs?.length) {
              result.logs
                ?.filter(
                  (item) =>
                    !new RegExp(`(\\[${nodeId}]|${nodeId}\\))`).test(
                      item.message,
                    ),
                )
                .forEach((log: any) => {
                  addMockLog(
                    'info',
                    log.message || log.errorStack || '',
                    log.timestamp,
                  )
                })
            }
            addMockLog(
              'success',
              t('packages_form_js_processor_mock_log_success', {
                val1: elapsed,
              }),
            )
          } catch (error: any) {
            const elapsed = Date.now() - startTime
            const errMsg =
              error?.data?.data?.logs?.[0]?.errorStack ||
              error?.message ||
              t('packages_form_js_processor_mock_unknown_error')
            mockOutputError.value = errMsg
            addMockLog(
              'error',
              t('packages_form_js_processor_mock_log_fail', {
                val1: elapsed,
                val2: errMsg,
              }),
            )
          } finally {
            mockRunning.value = false
          }
        } else {
          testRunJs({
            ...params,
            version,
            script: props.value,
            jsType,
            testRunInputEventJson,
          }).then(
            () => {
              queryStart = Time.now()
              // 轮询 queryLog + getRunJsResult 直到 isOver
              const mockAutoQuery = async () => {
                queryTimes++
                clearTimeout(timer)
                if (queryTimes > 40) {
                  resetQuery()
                  mockRunning.value = false
                  ElMessage.error(
                    t('packages_form_js_processor_index_qingqiuchaoshiqing'),
                  )
                  return
                }

                try {
                  // 同时请求日志和结果
                  const [, result] = await Promise.all([
                    queryLog(),
                    getRunJsResult({
                      version,
                      taskId,
                      jsNodeId: nodeId,
                    }),
                  ])

                  // 追加新日志到 mock 面板
                  logList.value.forEach((item: any) => {
                    addMockLog('info', item.message || '', item.timestamp)
                  })

                  // 更新输出
                  mockOutput.value = result.after
                    ? JSON.stringify(result.after, null, 2)
                    : ''

                  if (result.over) {
                    const elapsed = Date.now() - startTime
                    addMockLog(
                      'success',
                      t('packages_form_js_processor_mock_log_success', {
                        val1: elapsed,
                      }),
                    )
                    resetQuery()
                    mockRunning.value = false
                  } else {
                    timer = setTimeout(mockAutoQuery, 500)
                  }
                } catch {
                  resetQuery()
                  mockRunning.value = false
                }
              }
              mockAutoQuery()
            },
            async () => {
              // 脚本执行出错
              await queryLog()
              logList.value.forEach((item: any) => {
                addMockLog('error', item.message || '', item.timestamp)
              })
              const elapsed = Date.now() - startTime
              addMockLog(
                'error',
                t('packages_form_js_processor_mock_log_fail', {
                  val1: elapsed,
                  val2: t('packages_form_js_processor_mock_unknown_error'),
                }),
              )
              resetQuery()
              mockRunning.value = false
            },
          )
        }
      }

      const fillSampleToEditor = (sampleData: any[]) => {
        if (sampleData.length > 0) {
          // Fill after/before arrays
          const afterArr = sampleData.map((item: any) => item?.after || item)
          afterData.value = JSON.stringify(afterArr, null, 2)
          beforeData.value = afterData.value

          // Build custom event data: each sample generates i/u/d events
          const customEvents: any[] = []
          for (const item of sampleData) {
            const afterObj = item?.after || item
            customEvents.push(
              { op: 'i', after: afterObj },
              { op: 'u', before: afterObj, after: afterObj },
              { op: 'd', before: afterObj },
            )
          }
          customEventData.value = JSON.stringify(customEvents, null, 2)
        }
      }

      const handleGetSample = async () => {
        gettingSample.value = true
        addMockLog(
          'info',
          t('packages_form_js_processor_mock_log_getting_sample'),
        )
        try {
          const res = await getJsMockData({
            ...params,
          })
          const sampleData = res?.sampleData
          if (
            sampleData &&
            Array.isArray(sampleData) &&
            sampleData.length > 0
          ) {
            fillSampleToEditor(sampleData)
            addMockLog(
              'success',
              t('packages_form_js_processor_mock_log_sample_count', {
                val1: sampleData.length,
              }),
            )
          } else {
            addMockLog(
              'warning',
              t('packages_form_js_processor_mock_log_sample_empty'),
            )
          }
        } catch (error: any) {
          addMockLog(
            'error',
            t('packages_form_js_processor_mock_log_sample_fail', {
              val1:
                error?.message ||
                t('packages_form_js_processor_mock_unknown_error'),
            }),
          )
          ElMessage.error(
            t('packages_form_js_processor_mock_log_sample_fail', {
              val1:
                error?.message ||
                t('packages_form_js_processor_mock_unknown_error'),
            }),
          )
        } finally {
          gettingSample.value = false
        }
      }

      const handleSqlPreview = async () => {
        sqlPreviewLoading.value = true
        try {
          const res = await getJsMockData({
            ...params,
            sql: sqlText.value,
          })
          const sampleData = res?.sampleData
          sqlPreviewData.value = Array.isArray(sampleData)
            ? sampleData
            : sampleData
              ? [sampleData]
              : []
        } catch (error: any) {
          ElMessage.error(
            error?.message ||
              t('packages_form_js_processor_mock_sql_query_fail'),
          )
          sqlPreviewData.value = []
        } finally {
          sqlPreviewLoading.value = false
        }
      }

      const handleUseSqlData = () => {
        if (sqlPreviewData.value.length) {
          fillSampleToEditor(sqlPreviewData.value)
          addMockLog(
            'info',
            t('packages_form_js_processor_mock_log_sql_import', {
              val1: sqlPreviewData.value.length,
            }),
          )
        }
        sqlDialogVisible.value = false
      }

      const toggleMockMode = () => {
        mockMode.value = !mockMode.value
        if (mockMode.value) {
          nextTick(() => {
            jsEditor?.resize?.(true)
          })
          // Auto-load sample data on first open if editors are empty
          if (!afterData.value && !beforeData.value && !customEventData.value) {
            handleGetSample()
          }
        }
      }

      const toggleDoc = (event) => {
        event.stopPropagation()
        showDoc.value = !showDoc.value
      }

      const handleOpenAiDialog = () => {
        aiDialogRef.value?.open()
      }

      const handleAiGenerate = (generatedCode: string) => {
        // Replace the current code with the AI generated code
        emit('change', generatedCode)
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
      const fieldData = ref([])
      const loadFields = async () => {
        let fields = []
        if (!formRef.value.values.$inputs.length) return
        if (form.values.type.includes('migrate')) {
          const result = await getNodeSchemaPage({
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
          const data = await getNodeSchema(nodeId)
          fields = data?.[0]?.fields || []
        }

        fieldData.value = fields
          .filter((item) => !item.is_deleted)
          .map((item) => {
            return {
              name: item.field_name,
              type: item.data_type,
              primaryKey: item.primaryKey,
              nullable: item.is_nullable,
              comment: item.comment,
            }
          })

        nodeFields =
          fieldData.value.map((f) => {
            return {
              value: f.name,
              score: 1000,
              meta: f.type,
            }
          }) || []
      }

      if (!dataflowStore.taskSaving) {
        loadFields()
      }
      // 模型自动改变
      useAfterTaskSaved(formRef.value.values.$inputs, loadFields)

      const renderTool = () => (
        <div class="flex align-center">
          {isMigrate && (
            <FormItem.BaseItem
              asterisk
              class="flex-1 mr-4"
              label={t('packages_form_js_processor_index_xuanzebiao')}
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
              label={t('packages_form_js_processor_index_shujuhangshu')}
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
              {t('packages_form_js_processor_index_shiyunxing')}
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
              {t('packages_form_js_processor_index_tiaoshishuru')}
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
              {t('packages_form_js_processor_index_jieguoshuchu')}
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
          ? t('packages_form_js_processor_index_tooltip1')
          : t('packages_form_js_processor_index_tooltip2')
        const label = (
          <div class="position-absolute flex justify-content-between w-100">
            <div class="flex align-center">
              <span class="formily-element-plus-form-item-asterisk">*</span>
              <span class="mr-1">
                {t('packages_form_js_processor_index_jiaoben')}
              </span>
              <ElTooltip content={tooltip} placement="top">
                <VIcon size="14" class="color-primary">
                  info
                </VIcon>
              </ElTooltip>
            </div>
            <div class="flex align-center" style="--btn-space: 4px;">
              <ElButton
                text
                tag="a"
                onClick={toggleMockMode}
                type="primary"
                icon={IconLucidePlay}
              >
                {t('packages_form_js_processor_mock_title')}
              </ElButton>
              <ElButton text tag="a" onClick={toggleDoc} type="primary">
                {t('packages_dag_api_docs')}
              </ElButton>
            </div>
          </div>
        )

        return (
          <div class="js-processor font-color-light">
            <AiCodeDialog
              ref={aiDialogRef}
              currentCode={props.value}
              fields={fieldData.value}
              onGenerate={handleAiGenerate}
            />
            <ElDrawer
              append-to-body
              modal-class="bg-transparent"
              title={t('packages_dag_api_docs')}
              size={680}
              v-model={showDoc.value}
              class="js-api-drawer"
            >
              <iframe src={docSrc} class="w-100 h-100 block" />
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
                {fullscreen.value && renderTool()}
                <div>
                  <ElLink class="mr-3" onClick={toggleDoc} type="primary">
                    {t('packages_dag_api_docs')}
                  </ElLink>
                  <ElLink
                    onClick={toggleFullscreen}
                    class="js-editor-fullscreen"
                    type="primary"
                  >
                    <VIcon class="mr-1">suoxiao</VIcon>{' '}
                    {t('packages_form_js_editor_exit_fullscreen')}
                  </ElLink>
                </div>
              </div>
              <div class="js-editor-form-item-wrap">
                <FormItem.BaseItem class="js-editor-form-item" label={label}>
                  <JsEditor
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
                  v-show={fullscreen.value}
                  class="js-processor-editor-console border-start"
                >
                  <ElTabs onInput={onTabChange} class="w-100 flex">
                    <ElTabPane label={t('public_time_output')}>
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
                                    <div class="js-log-list-item px-4 py-2">
                                      <HighlightCode
                                        code={code}
                                        language="json"
                                      />
                                    </div>
                                  )
                                }
                                return (
                                  <div class="js-log-list-item px-4 py-2">
                                    {item.message}
                                  </div>
                                )
                              })
                            : null}
                          <div
                            class="flex align-center px-4 py-2"
                            v-show={logLoading.value}
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
                              {t('packages_dag_loading')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </ElTabPane>
                    <ElTabPane
                      label={t('packages_dag_js_processor_index_duibi')}
                    >
                      {fullscreen.value && jsonView()}
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
            {renderTool()}
            {showJsonArea.value && (
              <div class="mt-4 json-view-area">{jsonView()}</div>
            )}

            {/* Mock Test Run Fullscreen */}
            {mockMode.value && (
              <div class="mock-test-run-fullscreen">
                {/* Toolbar */}
                <div class="mock-test-run-toolbar">
                  <div class="mock-test-run-toolbar__left">
                    <BaseNodeIcon node={form.values} class="mr-2" />
                    <span>{form.values.name}</span>
                  </div>
                  <div
                    class="mock-test-run-toolbar__right"
                    style="--btn-space: 0;"
                  >
                    <ElButton
                      type="primary"
                      loading={mockRunning.value}
                      onClick={handleMockRun}
                      disabled={props.disabled}
                      icon={IconLucidePlay}
                    >
                      {t('packages_form_js_processor_index_shiyunxing')}
                    </ElButton>
                    <ElButton onClick={toggleDoc}>
                      {t('packages_dag_api_docs')}
                    </ElButton>
                    <ElButton onClick={toggleMockMode}>
                      <VIcon class="mr-1" size="14">
                        suoxiao
                      </VIcon>
                      {t('packages_form_js_editor_exit_fullscreen')}
                    </ElButton>
                  </div>
                </div>

                {/* Body: left editor + right panels */}
                <div class="mock-test-run-body">
                  {/* Left: JS Editor */}
                  <div class="mock-test-run-editor-pane">
                    <div class="position-relative flex-1 overflow-hidden">
                      <JsEditor
                        value={props.value}
                        onChange={(val) => emit('change', val)}
                        onInit={onEditorInit}
                        height="100%"
                        showFullscreen={false}
                        options={editorProps.options}
                        includeBeforeAndAfter={
                          editorProps.includeBeforeAndAfter
                        }
                        before={editorProps.before}
                        beforeRegexp={editorProps.beforeRegexp}
                        afterRegexp={editorProps.afterRegexp}
                        after={editorProps.after}
                      />
                    </div>
                  </div>

                  {/* Right panels */}
                  <div class="mock-test-run-right-pane">
                    {/* Input / Output */}
                    <div class="mock-test-run-io-pane">
                      {/* Input panel */}
                      <div class="mock-test-run-input-panel">
                        <div
                          class="mock-test-run-panel-header gap-1"
                          style="--btn-space: 0;"
                        >
                          <div class="mock-test-run-panel-header__left">
                            <span class="panel-title">
                              <el-icon size="16">
                                <ILucideFileBraces />
                              </el-icon>
                              {t('packages_form_js_processor_mock_input')}
                            </span>
                          </div>
                          {isMigrate && (
                            <ElSelectV2
                              disabled={props.disabled}
                              v-model={params.tableName}
                              filterable
                              class="mx-1 flex-1"
                              item-size={34}
                              options={tableList.value}
                              loading={tableLoading.value}
                              style="width: 180px;"
                            >
                              {{
                                label: ({ value }) => (
                                  <>
                                    <span class="mr-2 font-color-light">
                                      {t('public_table')}
                                    </span>
                                    <span>{value}</span>
                                  </>
                                ),
                              }}
                            </ElSelectV2>
                          )}
                          {hasSqlCapability.value && (
                            <ElButton
                              text
                              type="primary"
                              onClick={() => {
                                sqlDialogVisible.value = true
                              }}
                            >
                              {t('packages_form_js_processor_mock_sql_query')}
                            </ElButton>
                          )}
                          <ElButton
                            text
                            type="primary"
                            loading={gettingSample.value}
                            onClick={handleGetSample}
                          >
                            {t('packages_form_js_processor_mock_get_sample')}
                          </ElButton>
                        </div>
                        <div class="mock-event-type-bar">
                          <ElSegmented
                            block
                            modelValue={eventType.value}
                            options={[
                              {
                                label: t(
                                  'packages_form_js_processor_mock_event_insert',
                                ),
                                value: 'insert',
                              },
                              {
                                label: t(
                                  'packages_form_js_processor_mock_event_update',
                                ),
                                value: 'update',
                              },
                              {
                                label: t(
                                  'packages_form_js_processor_mock_event_delete',
                                ),
                                value: 'delete',
                              },
                              {
                                label: t(
                                  'packages_form_js_processor_mock_event_custom',
                                ),
                                value: 'custom',
                              },
                            ]}
                            onChange={(
                              val: 'insert' | 'update' | 'delete' | 'custom',
                            ) => {
                              eventType.value = val
                            }}
                          />
                        </div>
                        <div class="mock-panel-body mock-panel-body--editors">
                          {/* Custom event editor */}
                          {eventType.value === 'custom' && (
                            <div class="mock-editor-section">
                              <div class="mock-editor-section-body">
                                <VCodeEditor
                                  class="mock-input-editor py-0"
                                  value={customEventData.value}
                                  onChange={(val: string) => {
                                    customEventData.value = val
                                  }}
                                  lang="json"
                                  theme="chrome"
                                  options={{
                                    printMargin: false,
                                    enableBasicAutocompletion: true,
                                    enableLiveAutocompletion: true,
                                    enableSnippets: true,
                                    fontSize: 12,
                                    showPrintMargin: false,
                                    wrap: false,
                                  }}
                                />
                                {customEventDataValid.value !== null &&
                                  (customEventDataValid.value ? (
                                    <div class="json-status-bar valid">
                                      <IMingcuteCheckCircleFill></IMingcuteCheckCircleFill>
                                      {t(
                                        'packages_form_js_processor_mock_json_valid',
                                      )}
                                    </div>
                                  ) : (
                                    <div class="json-status-bar invalid">
                                      <IMingcuteCloseCircleFill></IMingcuteCloseCircleFill>
                                      {t(
                                        'packages_form_js_processor_mock_json_invalid',
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                          {/* Before editor (update / delete) */}
                          {eventType.value !== 'custom' &&
                            (eventType.value === 'update' ||
                              eventType.value === 'delete') && (
                              <div class="mock-editor-section">
                                {eventType.value === 'update' && (
                                  <div class="mock-editor-section-label">
                                    {t(
                                      'packages_form_js_processor_mock_before_data',
                                    )}
                                  </div>
                                )}
                                <div class="mock-editor-section-body">
                                  <VCodeEditor
                                    class="mock-input-editor py-0"
                                    value={beforeData.value}
                                    onChange={(val: string) => {
                                      beforeData.value = val
                                    }}
                                    lang="json"
                                    theme="chrome"
                                    options={{
                                      printMargin: false,
                                      enableBasicAutocompletion: true,
                                      enableLiveAutocompletion: true,
                                      enableSnippets: true,
                                      fontSize: 12,
                                      showPrintMargin: false,
                                      wrap: false,
                                    }}
                                  />
                                  {beforeDataValid.value !== null &&
                                    (beforeDataValid.value ? (
                                      <div class="json-status-bar valid">
                                        <IMingcuteCheckCircleFill></IMingcuteCheckCircleFill>
                                        {t(
                                          'packages_form_js_processor_mock_json_valid',
                                        )}
                                      </div>
                                    ) : (
                                      <div class="json-status-bar invalid">
                                        <IMingcuteCloseCircleFill></IMingcuteCloseCircleFill>
                                        {t(
                                          'packages_form_js_processor_mock_json_invalid',
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          {/* After editor (insert / update) */}
                          {eventType.value !== 'custom' &&
                            (eventType.value === 'insert' ||
                              eventType.value === 'update') && (
                              <div class="mock-editor-section">
                                {eventType.value === 'update' && (
                                  <div class="mock-editor-section-label">
                                    {t(
                                      'packages_form_js_processor_mock_after_data',
                                    )}
                                  </div>
                                )}
                                <div class="mock-editor-section-body">
                                  <VCodeEditor
                                    class="mock-input-editor py-0"
                                    value={afterData.value}
                                    onChange={(val: string) => {
                                      afterData.value = val
                                    }}
                                    lang="json"
                                    theme="chrome"
                                    options={{
                                      printMargin: false,
                                      enableBasicAutocompletion: true,
                                      enableLiveAutocompletion: true,
                                      enableSnippets: true,
                                      fontSize: 12,
                                      showPrintMargin: false,
                                      wrap: false,
                                    }}
                                  />
                                  {afterDataValid.value !== null &&
                                    (afterDataValid.value ? (
                                      <div class="json-status-bar valid">
                                        <IMingcuteCheckCircleFill></IMingcuteCheckCircleFill>
                                        {t(
                                          'packages_form_js_processor_mock_json_valid',
                                        )}
                                      </div>
                                    ) : (
                                      <div class="json-status-bar invalid">
                                        <IMingcuteCloseCircleFill></IMingcuteCloseCircleFill>
                                        {t(
                                          'packages_form_js_processor_mock_json_invalid',
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Output panel */}
                      <div class="mock-test-run-output-panel">
                        <div class="mock-test-run-panel-header">
                          <div class="mock-test-run-panel-header__left">
                            <span class="panel-title">
                              <el-icon size="16">
                                <i-lucide-file-output></i-lucide-file-output>
                              </el-icon>
                              {t('packages_form_js_processor_mock_output')}
                            </span>
                            {mockOutputCount.value > 0 && (
                              <span class="panel-badge">
                                {t('packages_form_js_processor_mock_items', {
                                  val1: mockOutputCount.value,
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div class="mock-panel-body">
                          {mockOutput.value ? (
                            <VCodeEditor
                              class="mock-output-editor h-100 py-0"
                              value={mockOutput.value}
                              lang="json"
                              theme="chrome"
                              options={{
                                readOnly: true,
                                highlightActiveLine: false,
                                highlightGutterLine: false,
                              }}
                            />
                          ) : mockOutputError.value ? (
                            <div class="mock-error-output">
                              {mockOutputError.value}
                            </div>
                          ) : (
                            <div class="mock-empty-state">
                              <VIcon class="empty-icon" size="40">
                                file-blank
                              </VIcon>
                              <div class="empty-title">
                                {t('packages_form_js_processor_mock_no_output')}
                              </div>
                              <div class="empty-desc">
                                {t(
                                  'packages_form_js_processor_mock_no_output_tip',
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Log panel */}
                    <div class="mock-log-panel">
                      <div class="mock-test-run-panel-header">
                        <div class="mock-test-run-panel-header__left">
                          <span class="panel-title">
                            <el-icon size="16">
                              <i-lucide-terminal></i-lucide-terminal>
                            </el-icon>
                            {t('packages_form_js_processor_mock_log')}
                          </span>
                        </div>
                        <div class="mock-test-run-panel-header__right">
                          <ElButton
                            size="small"
                            text
                            onClick={() => {
                              mockLogs.value = []
                            }}
                          >
                            {t('packages_form_js_processor_mock_log_clear')}
                          </ElButton>
                        </div>
                      </div>
                      <div class="mock-log-list">
                        {mockLogs.value.length ? (
                          mockLogs.value.map((log, idx) => (
                            <div class="mock-log-item" key={idx}>
                              <span class="log-time">{log.time}</span>
                              <span class={['log-icon', log.level]}>
                                <VIcon size="12">
                                  {log.level === 'error'
                                    ? 'close-circle'
                                    : log.level === 'success'
                                      ? 'check-circle'
                                      : log.level === 'warning'
                                        ? 'warning'
                                        : 'info-circle'}
                                </VIcon>
                              </span>
                              <span class="log-content">{log.content}</span>
                            </div>
                          ))
                        ) : (
                          <div class="mock-empty-state" style="padding: 24px;">
                            <div class="empty-title">
                              {t('packages_form_js_processor_mock_no_log')}
                            </div>
                            <div class="empty-desc">
                              {t('packages_form_js_processor_mock_no_log_tip')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SQL Query Dialog */}
                <ElDialog
                  v-model={sqlDialogVisible.value}
                  title={t('packages_form_js_processor_mock_sql_dialog_title')}
                  width="640px"
                  class="mock-sql-dialog"
                  append-to-body
                >
                  {{
                    default: () => (
                      <>
                        <VCodeEditor
                          class="border rounded-xl py-0"
                          value={sqlText.value}
                          onChange={(val) => {
                            sqlText.value = val
                          }}
                          lang="sql"
                          theme="chrome"
                          height={120}
                          options={{ highlightActiveLine: true }}
                        />
                        {sqlPreviewData.value.length > 0 && (
                          <div class="sql-preview-table">
                            <ElTable
                              data={sqlPreviewData.value}
                              size="small"
                              maxHeight={260}
                            >
                              {Object.keys(sqlPreviewData.value[0] || {}).map(
                                (key) => (
                                  <ElTableColumn
                                    prop={key}
                                    label={key}
                                    key={key}
                                    minWidth={120}
                                  />
                                ),
                              )}
                            </ElTable>
                          </div>
                        )}
                      </>
                    ),
                    footer: () => (
                      <div class="flex justify-content-end gap-2">
                        <ElButton
                          onClick={handleSqlPreview}
                          loading={sqlPreviewLoading.value}
                        >
                          {t('packages_form_js_processor_mock_sql_preview')}
                        </ElButton>
                        <ElButton
                          type="primary"
                          onClick={handleUseSqlData}
                          disabled={!sqlPreviewData.value.length}
                        >
                          {t('packages_form_js_processor_mock_sql_use_data')}
                        </ElButton>
                      </div>
                    ),
                  }}
                </ElDialog>
              </div>
            )}
          </div>
        )
      }
    },
  }),
)
