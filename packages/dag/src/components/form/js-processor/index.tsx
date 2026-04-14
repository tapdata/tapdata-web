import { observe } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import { SchemaExpressionScopeSymbol } from '@formily/vue'
import {
  getNodeSchema,
  getNodeSchemaPage,
} from '@tap/api/src/core/metadata-instances'
import {
  getJsMockData,
  getNodeTableInfo,
  testRunJsRpc,
} from '@tap/api/src/core/task'
import VCodeEditor from '@tap/component/src/base/VCodeEditor.vue'
import VIcon from '@tap/component/src/base/VIcon.vue'

import { FormItem, JsEditor, useForm } from '@tap/form'

import { useI18n } from '@tap/i18n'
import {
  computed,
  defineComponent,
  inject,
  nextTick,
  onBeforeUnmount,
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

      // Mock test run state
      const mockMode = ref(false)
      const mockInput = ref('')
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

      const mockInputValid = computed(() => {
        if (!mockInput.value.trim()) return null
        try {
          const parsed = JSON.parse(mockInput.value)
          return Array.isArray(parsed)
        } catch {
          return false
        }
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

      const addMockLog = (level: string, content: string) => {
        const now = new Date()
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
        mockLogs.value.push({ time, level, content })
      }

      const handleMockRun = async () => {
        if (mockInputValid.value !== true) {
          ElMessage.warning(t('packages_form_js_processor_mock_json_invalid'))
          return
        }
        mockRunning.value = true
        mockOutput.value = ''
        mockOutputError.value = ''
        const startTime = Date.now()
        addMockLog('info', t('packages_form_js_processor_mock_log_start'))
        try {
          const result = await testRunJsRpc({
            ...params,
            version: Date.now(),
            script: props.value,
            jsType: form.values.jsType ?? 1,
            mockData: JSON.parse(mockInput.value),
          })
          const elapsed = Date.now() - startTime
          const after = result?.after
          mockOutput.value = after ? JSON.stringify(after, null, 2) : ''
          addMockLog(
            'success',
            t('packages_form_js_processor_mock_log_success', { val1: elapsed }),
          )
          if (result?.logs?.length) {
            result.logs.forEach((log: any) => {
              addMockLog('info', log.message || log.errorStack || '')
            })
          }
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
      }

      const handleGetSample = async () => {
        gettingSample.value = true
        addMockLog(
          'info',
          t('packages_form_js_processor_mock_log_getting_sample'),
        )
        try {
          const data = await getJsMockData({
            ...params,
          })
          if (data && Array.isArray(data)) {
            mockInput.value = JSON.stringify(data, null, 2)
            addMockLog(
              'success',
              t('packages_form_js_processor_mock_log_sample_count', {
                val1: data.length,
              }),
            )
          } else if (data) {
            mockInput.value = JSON.stringify([data], null, 2)
            addMockLog(
              'success',
              t('packages_form_js_processor_mock_log_sample_count', {
                val1: 1,
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
          const data = await getJsMockData({
            ...params,
            sql: sqlText.value,
          })
          sqlPreviewData.value = Array.isArray(data) ? data : data ? [data] : []
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
          mockInput.value = JSON.stringify(sqlPreviewData.value, null, 2)
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

      // 加载模型字段
      loadFields()
      // 模型自动改变
      useAfterTaskSaved(formRef.value.values.$inputs, loadFields)

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
                    >
                      <VIcon class="mr-1" size="14">
                        play
                      </VIcon>
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
                        <div class="mock-test-run-panel-header">
                          <div class="mock-test-run-panel-header__left">
                            <span class="panel-title">
                              <VIcon size="14">download</VIcon>
                              {t('packages_form_js_processor_mock_input')}
                            </span>
                          </div>
                          <div
                            class="mock-test-run-panel-header__right"
                            style="--btn-space: 0;"
                          >
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
                        </div>
                        <div class="mock-panel-body">
                          <VCodeEditor
                            class="mock-input-editor h-100 py-0"
                            value={mockInput.value}
                            onChange={(val) => {
                              mockInput.value = val
                            }}
                            lang="json"
                            theme="chrome"
                            options={{
                              highlightActiveLine: true,
                              highlightGutterLine: true,
                            }}
                          />
                          {mockInputValid.value !== null && (
                            <div
                              class={[
                                'json-status-bar',
                                mockInputValid.value ? 'valid' : 'invalid',
                              ]}
                            >
                              <VIcon size="12">
                                {mockInputValid.value
                                  ? 'check-circle'
                                  : 'warning'}
                              </VIcon>
                              {mockInputValid.value
                                ? t(
                                    'packages_form_js_processor_mock_json_valid',
                                  )
                                : t(
                                    'packages_form_js_processor_mock_json_invalid',
                                  )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Output panel */}
                      <div class="mock-test-run-output-panel">
                        <div class="mock-test-run-panel-header">
                          <div class="mock-test-run-panel-header__left">
                            <span class="panel-title">
                              <VIcon size="14">upload</VIcon>
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
                              class="mock-output-editor h-100"
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
                            <VIcon size="14">list</VIcon>
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
