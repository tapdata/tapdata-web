import { computed, defineComponent, ref, watch, reactive } from '@vue/composition-api'
import { createForm, observer, Form, SchemaField, HighlightCode, FormItem } from '@tap/form'
import i18n from '@tap/i18n'
import resize from '@tap/component/src/directives/resize'
import { VEmpty, VCodeEditor } from '@tap/component'
import { proxyApi } from '@tap/api'
import './style.scss'

// 自定义数据源调试
export const ConnectionDebug = observer(
  defineComponent({
    props: {
      getForm: Function,
      schema: Object,
      visible: Boolean,
      pdkOptions: Object
    },
    directives: {
      resize
    },
    setup(props, { emit, root }) {
      const logList = ref([])
      const logLoading = ref(false)
      const connForm = props.getForm()
      const form = createForm({
        values: connForm.values
      })
      const params = reactive({
        connectType: '',
        timeout: 10,
        input: JSON.stringify(
          [
            {
              op: 'i',
              table: 'a',
              after: {
                A: 1
              }
            },
            {
              op: 'u',
              table: 'a',
              before: {
                A: 1
              },
              after: {
                A: 2
              }
            },
            {
              op: 'd',
              table: 'a',
              before: {
                A: 1
              }
            }
          ],
          null,
          2
        )
      })
      let asSource = ref(false)
      let asTarget = ref(false)
      let connectionType
      const LEVEL2CLS = {
        INFO: 'font-color-dark',
        ERROR: 'color-danger',
        WARN: 'color-warning'
      }

      watch(
        () => props.visible,
        show => {
          if (show) {
            connectionType = connForm.values.__TAPDATA.connection_type
            params.connectType = connectionType
            asSource.value = connectionType === 'source'
            asTarget.value = connectionType === 'target'

            if (connectionType === 'source_and_target') {
              params.connectType = 'source'
              asSource.value = asTarget.value = true
            }

            form.values.__TAPDATA.connection_type = params.connectType
          } else {
            connForm.values.__TAPDATA.connection_type = connectionType
          }
        }
      )

      const filterProperties = properties => {
        const whiteList = [
          'targetScripTitle',
          'targetScript',
          'historyScript',
          'customBeforeOpr',
          'customBeforeScript',
          'customAfterOpr',
          'customAfterScript',
          'cdcScript'
        ]
        return whiteList.reduce((prev, current) => {
          let field = (prev[current] = {
            ...properties[current]
          })
          field.title = field.title?.trim()

          if (field['x-component'] === 'Switch') {
            let props = field['x-decorator-props'] || {}
            props.layout = 'horizontal'
            props.feedbackLayout = 'none'
            field['x-decorator-props'] = props
          }

          return prev
        }, {})
      }

      const formSchema = computed(() => {
        return {
          type: 'object',
          properties: {
            '__TAPDATA.connection_type': {
              type: 'string'
            },
            syncType: { type: 'string' },
            ...filterProperties(props.schema.properties)
          }
        }
      })
      const handleRun = async () => {
        form.validate().then(
          async () => {
            let inputArg
            try {
              inputArg = JSON.parse(params.input)
            } catch (e) {
              root.$message.error(i18n.t('packages_business_connection_debug_input_arg_error'))
              return
            }

            logLoading.value = true
            let query = {
              connectionId: props.pdkOptions.id,
              type: params.connectType,
              pdkHash: props.pdkOptions.pdkHash,
              pdkType: props.pdkOptions.pdkType,
              connectionConfig: {
                ...connForm.values
              },
              nodeConfig: {},
              command: 'testRun',
              action: connForm.values.syncType,
              argMap: {
                input: inputArg,
                timeout: params.timeout
              },
              time: 0
            }

            try {
              let result = await proxyApi.command(query)
              logList.value = result
            } catch (e) {
              console.error(e) // eslint-disable-line
            }

            logLoading.value = false
          },
          () => {
            root.$message.error(i18n.t('packages_business_connection_debug_form_error'))
          }
        )
      }

      return () => {
        if (props.visible) {
          console.log('formSchema', formSchema.value) // eslint-disable-line
        }
        return (
          props.visible && (
            <div class="fixed-top fixed-bottom flex flex-column bg-white font-color-light">
              <div class="flex align-center border-bottom px-4 py-2">
                <FormItem.BaseItem
                  label={i18n.t('packages_business_connection_debug_as')}
                  layout="horizontal"
                  feedbackLayout="none"
                >
                  <ElRadioGroup
                    value={params.connectType}
                    onInput={val => {
                      params.connectType = val
                      form.values.__TAPDATA.connection_type = val
                    }}
                  >
                    {asSource.value && (
                      <ElRadioButton label="source">{i18n.t('public_connection_type_source')}</ElRadioButton>
                    )}
                    {asTarget.value && (
                      <ElRadioButton label="target">{i18n.t('public_connection_type_target')}</ElRadioButton>
                    )}
                  </ElRadioGroup>
                </FormItem.BaseItem>
                <FormItem.BaseItem
                  class="ml-4"
                  label={i18n.t('packages_business_more_than')}
                  addonAfter={i18n.t('packages_business_more_than_after')}
                  layout="horizontal"
                  feedbackLayout="none"
                >
                  <ElInputNumber
                    style="width: 100px;"
                    value={params.timeout}
                    min={5}
                    max={60}
                    onInput={val => {
                      params.timeout = val
                    }}
                    controls-position="right"
                  ></ElInputNumber>
                </FormItem.BaseItem>
                <ElButton loading={logLoading.value} class="mx-4" onClick={handleRun} type="primary" size="small">
                  {i18n.t('packages_form_js_processor_index_shiyunxing')}
                </ElButton>

                <div class="flex-grow-1"></div>
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
              <div class="flex-1 flex w-100 min-h-0">
                <div class="flex-1 overflow-y-auto p-4 border-end">
                  <Form layout="vertical" feedbackLayout="terse" class-name="form-wrap" form={form}>
                    {params.connectType === 'target' && (
                      <FormItem.BaseItem label={i18n.t('packages_business_connection_debug_input_arg')}>
                        <VCodeEditor
                          class="border rounded-2 p-0"
                          theme="one_dark"
                          value={params.input}
                          lang="json"
                          height={200}
                          options={{ printMargin: false, wrap: 'free' }}
                          onInput={v => {
                            params.input = v
                          }}
                        />
                      </FormItem.BaseItem>
                    )}
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
                  class="overflow-y-auto"
                  style="width: 40vw;"
                >
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
                            <div
                              class={[
                                'js-log-list-item text-prewrap text-break p-2',
                                LEVEL2CLS[item.level] || 'font-color-dark'
                              ]}
                            >
                              {item.errorStack || item.message}
                            </div>
                          )
                        })
                      : !logLoading.value && <VEmpty large></VEmpty>}
                    <div class={['justify-content-center align-center m-0 p-2', logLoading.value ? 'flex' : 'none']}>
                      <svg viewBox="25 25 50 50" class="circular">
                        <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
                      </svg>
                      <span class="ml-1 font-color-light">{i18n.t('packages_dag_loading')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )
      }
    }
  })
)
