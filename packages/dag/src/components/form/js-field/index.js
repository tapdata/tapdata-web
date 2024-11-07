import { defineComponent, ref, onUnmounted } from '@vue/composition-api'
import { useForm, useField } from '@tap/form'
import { observer } from '@formily/reactive-vue'

import i18n from '@tap/i18n'
import { FormItem, JsEditor } from '@tap/form'
import { VIcon, GitBook } from '@tap/component'
import { metadataInstancesApi, pdkApi } from '@tap/api'
import './style.scss'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'

export const JsField = observer(
  defineComponent({
    props: {
      value: String,
      disabled: Boolean,
      tooltip: String,
      apiFileName: String,
      apiBtnText: {
        type: String,
        default: i18n.t('packages_dag_api_docs')
      }
    },
    setup(props, { emit, root, attrs, refs }) {
      const isDaas = process.env.VUE_APP_PLATFORM === 'DAAS'
      const { id: taskId, syncType } = root.$store.state.dataflow.taskInfo
      const formRef = useForm()
      const fieldRef = useField()
      const form = formRef.value
      const fullscreen = ref(false)
      const showDoc = ref(false)
      const {
        id: nodeId,
        attrs: { pdkHash }
      } = form.values
      // const pdkHash = form.values.attrs.pdkHash

      const toggleFullscreen = () => {
        fullscreen.value = !fullscreen.value
        setTimeout(() => {
          jsEditor.resize(true)
        }, 10)
      }

      const toggleDoc = event => {
        event.stopPropagation()
        showDoc.value = !showDoc.value
      }

      function getPrefix(line, index) {
        let prefix = ''
        let i = index - 1
        while (i >= 0 && /^[a-zA-Z0-9_]+$/.test(line.charAt(i))) {
          prefix = line.charAt(i) + prefix
          i--
        }
        return prefix
      }

      let jsEditor
      const onEditorInit = editor => {
        jsEditor = editor
        const idx = editor.completers?.findIndex(item => item.id === 'recordFields') || -1

        if (~idx) editor.completers.splice(idx, 1)

        editor.completers.push({
          id: 'recordFields',
          // 获取补全提示列表
          getCompletions: function (editor, session, pos, prefix, callback) {
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
          }
        })
        // 绑定 '.' 按键事件
        editor.keyBinding.addKeyboardHandler({
          handleKeyboard: function ({ editor }, hash, keyString, keyCode, event) {
            if (keyString === '.' && keyCode !== undefined) {
              setTimeout(() => {
                editor.execCommand('startAutocomplete')
              }, 10)
            }
          }
        })
      }

      let nodeFields = []
      const loadFields = async () => {
        let fields = []
        if (!formRef.value.values.$inputs.length) return
        if (form.values.type.includes('migrate')) {
          let result = await metadataInstancesApi.nodeSchemaPage({
            nodeId,
            fields: ['original_name', 'fields', 'qualified_name'],
            page: 1,
            pageSize: 1
          })
          fields = result.items[0]?.fields || []
        } else {
          const data = await metadataInstancesApi.nodeSchema(nodeId)
          fields = data?.[0]?.fields || []
        }

        nodeFields =
          fields
            .filter(item => !item.is_deleted)
            .map(f => {
              return {
                value: f.field_name,
                score: 1000,
                meta: f.data_type
              }
            }) || []
      }

      // 加载模型字段
      loadFields()
      // 模型自动改变
      useAfterTaskSaved(root, formRef.value.values.$inputs, loadFields)

      const loadingApi = ref(false)
      const showApi = ref(Boolean(pdkHash && props.apiFileName))
      const mdContentRef = ref('')
      const getApi = () => {
        loadingApi.value = true
        pdkApi
          .getStatics(pdkHash, props.apiFileName)
          .then(res => {
            mdContentRef.value = res?.data
          })
          .finally(() => (loadingApi.value = false))
      }

      showApi.value && getApi()

      return () => {
        const editorProps = { ...attrs }
        editorProps.options.readOnly = props.disabled
        const tooltip = props.tooltip
        const apiLink = showApi.value ? (
          <ElLink class="mr-3" onClick={toggleDoc} type="primary">
            {props.apiBtnText}
          </ElLink>
        ) : null
        const label = (
          <div class="position-absolute flex justify-content-between w-100">
            <div class="flex align-center">
              <span class="formily-element-form-item-asterisk">*</span>
              <span>{fieldRef.value.title}</span>
              {tooltip && (
                <ElTooltip content={tooltip} placement="top" class="ml-2">
                  <VIcon size="14" class="color-primary">
                    info
                  </VIcon>
                </ElTooltip>
              )}
            </div>
            <div class="flex align-center">
              {apiLink}
              <ElLink onClick={toggleFullscreen} class="js-editor-fullscreen" type="primary">
                <VIcon class="mr-1">fangda</VIcon>
                {i18n.t('packages_form_js_editor_fullscreen')}
              </ElLink>
            </div>
          </div>
        )

        return (
          <div class="js-processor font-color-light">
            {showApi.value && (
              <ElDrawer
                append-to-body
                modal={false}
                title={props.apiBtnText}
                size={680}
                visible={showDoc.value}
                on={{
                  ['update:visible']: v => {
                    showDoc.value = v
                  }
                }}
              >
                <GitBook v-loading={loadingApi.value} value={mdContentRef.value}></GitBook>
              </ElDrawer>
            )}

            <div
              class={[
                'js-processor-editor',
                {
                  fullscreen: fullscreen.value
                }
              ]}
            >
              <div class="js-processor-editor-toolbar border-bottom justify-content-between align-center px-4 py-2">
                <div class="js-editor-toolbar-title fs-6 fw-sub flex-1">{fieldRef.value.title}</div>
                {apiLink}
                <ElLink onClick={toggleFullscreen} class="js-editor-fullscreen" type="primary">
                  <VIcon class="mr-1">suoxiao</VIcon> {i18n.t('packages_form_js_editor_exit_fullscreen')}
                </ElLink>
              </div>

              <div class="js-editor-form-item-wrap overflow-hidden">
                <FormItem.BaseItem class="js-editor-form-item" label={label}>
                  <JsEditor
                    ref="jsEditor"
                    value={props.value}
                    onChange={val => {
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
              </div>
            </div>
          </div>
        )
      }
    }
  })
)
