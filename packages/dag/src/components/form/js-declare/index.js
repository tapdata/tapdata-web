import { defineComponent, ref } from '@vue/composition-api'
import i18n from '@tap/i18n'
import { FormItem, HighlightCode, JsEditor } from '@tap/form'
import './style.scss'

export const JsDeclare = defineComponent({
  props: {
    value: String,
    param: {
      type: String,
      default: 'tapTable'
    },
    disabled: Boolean
  },
  setup(props, { attrs, emit }) {
    const before = `function declare(${props.param}) {`
    const after = `  return ${props.param}\n}`
    const dialogVisible = ref(false)
    const codeExample = `// 增加一个字段，如果字段已存在则不操作
TapModelDeclare.addField(${props.param}, 'fieldName', 'TapString')
// 移除一个已存在字段
TapModelDeclare.removeField(${props.param}, 'fieldName')
// 更新一个已存在的字段
TapModelDeclare.updateField(${props.param}, 'fieldName', 'TapString')
// 更新字段，如果不存在则新增
TapModelDeclare.upsertField(${props.param}, 'fieldName', 'TapString')
// 设置字段为主键
TapModelDeclare.setPk(${props.param}, 'fieldName')
// 取消主键
TapModelDeclare.unsetPk(${props.param}, 'fieldName')
// 增加索引
TapModelDeclare.addIndex(${props.param}, 'indexName', [{'filedName':'fieldName1', 'order': 'asc'}])
// 移除索引
TapModelDeclare.removeIndex(${props.param}, 'indexName')
`
    return () => {
      const editorProps = { ...attrs }
      editorProps.options.readOnly = props.disabled
      const newProps = {
        props: editorProps
      }
      return (
        <el-collapse class="js-declare-collapse my-4 mx-n4 formily-element-form-collapse inset">
          <el-collapse-item>
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
            </template>
            <FormItem.BaseItem feedbackLayout="none">
              <JsEditor
                height={editorProps.height}
                before={before}
                after={after}
                value={props.value}
                onChange={val => {
                  emit('change', val)
                }}
                options={editorProps.options}
                includeBeforeAndAfter={editorProps.includeBeforeAndAfter}
                handleAddCompleter={editorProps.handleAddCompleter}
              />
            </FormItem.BaseItem>
          </el-collapse-item>
        </el-collapse>
      )
    }
  }
})
