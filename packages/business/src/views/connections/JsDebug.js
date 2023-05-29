import { computed, defineComponent, ref, watch, reactive } from '@vue/composition-api'
import { createForm, observer, Form, SchemaField, HighlightCode, FormItem } from '@tap/form'
import i18n from '@tap/i18n'
import resize from '@tap/component/src/directives/resize'
import { VEmpty, VCodeEditor, VirtualSelect } from '@tap/component'
import { proxyApi, taskApi } from '@tap/api'
import './style.scss'

// 自定义数据源调试
export const JsDebug = observer(
  defineComponent({
    props: {
      getForm: Function,
      schema: Object,
      visible: Boolean,
      pdkOptions: Object,
      connectionId: String
    },
    directives: {
      resize
    },
    setup(props, { emit, root, refs }) {
      const logList = ref([])
      const logLoading = ref(false)
      const connForm = props.getForm()
      const form = createForm({
        values: connForm.values
      })
      const params = reactive({
        connectType: '',
        input: '',
        rows: 1
      })

      const fullscreen = ref(true)
      const running = ref(false)
      const paramsLoading = ref(false)
      const runningText = ref('')
      const inputRef = ref('')
      const outputRef = ref('')

      const formSchema = computed(() => {
        return {
          type: 'object',
          properties: {
            '__TAPDATA.connection_type': {
              type: 'string'
            },
            syncType: { type: 'string' },
            ...props.schema
          }
        }
      })

      const onTabChange = current => {
        if (current == '0') {
          refs.beforeJson.editor.resize(true)
          refs.afterJson.editor.resize(true)

          setTimeout(() => {
            refs.beforeJson.editor.resize(true)
            refs.afterJson.editor.resize(true)
          }, 300)
        }
      }

      const handleRun = async () => {
        const { pdkHash } = props.pdkOptions || {}
        running.value = true
        proxyApi
          .command({
            pdkHash,
            type: 'connection',
            connectionConfig: connForm.values,
            command: 'TryRun',
            argMap: {
              before: JSON.parse(inputRef.value),
              logSize: 100
            }
          })
          .then((data = {}) => {
            outputRef.value = JSON.stringify(data.after, null, 2)
            logList.value = data.logs || []
          })
          .finally(() => {
            running.value = false
          })
      }

      const handleGetParams = async () => {
        paramsLoading.value = true
        proxyApi
          .callHistory({
            connectionId: 'source#' + props.connectionId,
            dataSize: params.rows
          })
          .then(data => {
            inputRef.value = JSON.stringify(data, null, 2)
          })
          .finally(() => {
            paramsLoading.value = false
          })
      }

      watch(
        () => props.visible,
        show => {
          if (show) {
            handleGetParams()
          }
        }
      )

      return () => {
        const jsonView = (
          <div class="flex json-view-wrap h-100" v-loading={running.value} element-loading-text={runningText.value}>
            <div class="json-view flex-1 mr-4 border rounded-2 overflow-hidden">
              <div class="json-view-header">{i18n.t('packages_form_js_processor_index_tiaoshishuru')}</div>
              <VCodeEditor
                ref="beforeJson"
                class="py-0 json-view-editor flex-1"
                value={inputRef.value}
                lang="json"
                options={{ highlightActiveLine: false, highlightGutterLine: false }}
                theme="chrome"
                onInput={val => (inputRef.value = val)}
              ></VCodeEditor>
            </div>
            <div class="json-view flex-1 border rounded-2 overflow-hidden">
              <div class="json-view-header">{i18n.t('packages_form_js_processor_index_jieguoshuchu')}</div>
              <VCodeEditor
                ref="afterJson"
                class="py-0 json-view-editor flex-1"
                value={outputRef.value}
                lang="json"
                options={{ readOnly: true, highlightActiveLine: false, highlightGutterLine: false }}
                theme="chrome"
              ></VCodeEditor>
            </div>
          </div>
        )

        const content = (
          <div
            class={[
              'connection-js-debug-editor',
              {
                fullscreen: fullscreen.value
              }
            ]}
          >
            <div class="flex border-bottom justify-content-end align-center px-4 py-2">
              <div>
                <VIcon
                  onClick={() => {
                    emit('update:visible', false)
                  }}
                  size="18"
                  class="color-primary"
                >
                  close
                </VIcon>
              </div>
            </div>

            <div class="flex flex-fill overflow-hidden">
              <div class="flex-fill overflow-y-auto border-end position-relative left-editor-box">
                <ElButton
                  class="run-button"
                  disabled={props.disabled}
                  loading={running.value}
                  onClick={handleRun}
                  type="primary"
                  size="small"
                >
                  {i18n.t('packages_form_js_processor_index_shiyunxing')}
                </ElButton>
                <Form layout="vertical" feedbackLayout="terse" class="form-wrap" form={form}>
                  <SchemaField schema={formSchema.value} />
                </Form>
              </div>
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
                class="flex border-start"
                style="width: 55vw;"
              >
                <ElTabs onInput={() => onTabChange} class="w-100 flex flex-column">
                  <ElTabPane label={i18n.t('packages_dag_js_processor_index_duibi')}>
                    <div class="ml-4 mb-2">
                      <ElButton
                        class="mr-3"
                        disabled={props.disabled}
                        loading={paramsLoading.value}
                        onClick={handleGetParams}
                        type="primary"
                        size="small"
                      >
                        获取调试数据
                      </ElButton>
                      <span class="mr-3">{i18n.t('packages_form_js_processor_index_shujuhangshu')}</span>
                      <ElInputNumber
                        disabled={props.disabled}
                        style="width: 100px;"
                        value={params.rows}
                        min={1}
                        max={10}
                        onInput={val => {
                          params.rows = val
                        }}
                        controls-position="right"
                      ></ElInputNumber>
                      <span class="ml-3 font-color-sslight">使用HttpReceiver最新接收到的数据用于调试</span>
                    </div>
                    {fullscreen.value && jsonView}
                  </ElTabPane>
                  <ElTabPane label={i18n.t('public_time_output')}>
                    <div class="connection-js-debug-editor-console-panel h-100 overflow-auto">
                      <div class="js-log-list">
                        {logList.value.length
                          ? logList.value.map(item => {
                              if (/^[{[].*[\]}]$/.test(item.message)) {
                                let code
                                try {
                                  code = JSON.stringify(JSON.parse(item.message), null, 2)
                                } catch (e) {
                                  const message = item.message.replace(/^[{[](.*)[\]}]$/, '$1').split(', ')
                                  code = `${item.message.charAt(0)}\n${message
                                    .map(line => `  ${line}`)
                                    .join('\n')}\n${item.message.charAt(item.message.length - 1)}`
                                }

                                return (
                                  <details class="js-log-list-item p-2">
                                    <summary class="text-truncate px-2">{item.message}</summary>
                                    <HighlightCode class="m-0" language="json" code={code}></HighlightCode>
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
                          class={['justify-content-center align-center m-0 p-2', logLoading.value ? 'flex' : 'none']}
                        >
                          <svg viewBox="25 25 50 50" class="circular">
                            <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
                          </svg>
                          <span class="ml-1 font-color-light">{i18n.t('packages_dag_loading')}</span>
                        </div>
                      </div>
                    </div>
                  </ElTabPane>
                </ElTabs>
              </div>
            </div>
          </div>
        )
        return props.visible && <div class="connection-js-debug font-color-light">{content}</div>
      }
    }
  })
)
