import { FormItem, HighlightCode, JsEditor } from '@tap/form'
import i18n from '@tap/i18n'
import { defineComponent, ref } from 'vue'
import './style.scss'

export const JsDeclare = defineComponent({
  props: {
    value: String,
    param: {
      type: String,
      default: 'tapTable',
    },
    disabled: Boolean,
  },
  emits: ['change'],
  setup(props, { attrs, emit }) {
    const before = `function declare(${props.param}) {`
    const after = `  return ${props.param}\n}`
    const dialogVisible = ref(false)
    const codeExample = i18n.t('packages_dag_js_declare_index_zengjiayigezi', {
      val1: props.param,
      val2: props.param,
      val3: props.param,
      val4: props.param,
      val5: props.param,
      val6: props.param,
      val7: props.param,
      val8: props.param,
    })
    return () => {
      const editorProps = { ...attrs }
      editorProps.options.readOnly = props.disabled

      return (
        <el-collapse
          expand-icon-position="left"
          class="js-declare-collapse my-4 mx-n4 formily-element-plus-form-collapse inset"
        >
          <el-collapse-item>
            {{
              title: () => (
                <div class="flex align-items-center">
                  <span class="font-color-light fw-normal">
                    {i18n.t('packages_form_js_processor_index_moxingshengming')}
                  </span>
                  <el-tooltip
                    content={i18n.t(
                      'packages_dag_js_declare_index_xianshishengminglai',
                    )}
                    placement="top"
                  >
                    <i class="ml-1 font-color-sslight header-icon el-icon-info"></i>
                  </el-tooltip>
                  <div class="flex-grow-1"></div>
                  <el-button
                    text
                    onClick={(event) => (
                      event.stopPropagation(), (dialogVisible.value = true)
                    )}
                    type="primary"
                    class="mx-4"
                  >
                    {i18n.t('packages_dag_js_declare_index_shiyongbangzhu')}
                  </el-button>

                  <el-dialog
                    title={i18n.t(
                      'packages_dag_nodes_javascript_moxingshengming',
                    )}
                    v-model={dialogVisible.value}
                    append-to-body
                    width="800"
                  >
                    {{
                      default: () => (
                        <>
                          <div class="mb-4">TapType</div>
                          <HighlightCode
                            class="m-0"
                            code="type TapType = 'TapNumber' | 'TapString' | 'TapBoolean' | 'TapBinary' | 'TapDate' | 'TapDateTime' | 'TapTime' | 'TapYear' | 'TapRaw' | 'TapArray' | 'TapMap'"
                          ></HighlightCode>
                          <div class="my-4">
                            {i18n.t('packages_dag_js_declare_index_shilidaima')}
                          </div>
                          <HighlightCode
                            class="m-0"
                            code={codeExample}
                          ></HighlightCode>
                        </>
                      ),
                      footer: () => (
                        <el-button
                          type="primary"
                          onClick={() => (dialogVisible.value = false)}
                        >
                          {i18n.t('packages_dag_js_declare_index_queding')}
                        </el-button>
                      ),
                    }}
                  </el-dialog>
                </div>
              ),
              default: () => (
                <FormItem.BaseItem feedbackLayout="none" class="pb-4">
                  <JsEditor
                    height={editorProps.height}
                    before={before}
                    after={after}
                    value={props.value}
                    onChange={(val) => {
                      emit('change', val)
                    }}
                    options={editorProps.options}
                    includeBeforeAndAfter={editorProps.includeBeforeAndAfter}
                    handleAddCompleter={editorProps.handleAddCompleter}
                  />
                </FormItem.BaseItem>
              ),
            }}
          </el-collapse-item>
        </el-collapse>
      )
    }
  },
})
