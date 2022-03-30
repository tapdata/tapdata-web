import { connect, mapProps, useForm } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'
import VIcon from 'web-core/components/VIcon'
import './fieldProessor.scss'

export const FieldValue = connect(
  observer(
    defineComponent({
      props: ['loading', 'options'],

      setup() {
        const formRef = useForm()
        const form = formRef.value
        return {
          databaseType: form.values.databaseType,
          scripts: form.values.scripts,
          form
        }
      },

      data() {
        return {
          nodeKey: '',
          originalFields: [],
          checkAll: false,
          scriptDialog: {
            open: false,
            script: '//Enter you code at here',
            fieldName: '',
            fn: function () {}
          },
          /*字段处理器支持功能类型*/
          SCRIPT_TPL: {
            tableName: '',
            field: '',
            scriptType: 'js',
            script: '',
            id: ''
          }
        }
      },
      watch: {
        scripts: {
          deep: true,
          handler(v) {
            this.form.setValuesIn('scripts', v)
            this.$emit('change', v)
            console.log('scripts', v) // eslint-disable-line
          }
        }
      },

      render() {
        // eslint-disable-next-line no-console
        console.log('🚗 FieldProcessor', this.loading, this.options)
        let fields = this.options?.[0] || []
        this.originalFields = JSON.parse(JSON.stringify(fields))
        // eslint-disable-next-line
        console.log('FieldProcess.mergeOutputSchema', fields)
        return (
          <div class="field-processor-tree-warp bg-body pt-2 pb-5">
            <div class="field-processor-operation flex">
              <ElCheckbox class="check-all mr-4" v-model={this.checkAll} onChange={() => this.handleCheckAllChange()} />
              <span class="field-name inline-block">字段名称</span>
              <span class="field-desc inline-block">字段赋值</span>
              <span class="field-ops inline-block">
                <VIcon class="clickable ml-5" small onClick={() => this.handleAllReset()}>
                  revoke
                </VIcon>
              </span>
            </div>
            <div className="field-processor-tree-warp">
              <ElTree
                ref="tree"
                data={fields}
                node-key="id"
                default-expand-all={true}
                show-checkbox={true}
                class="field-processor-tree"
                scopedSlots={{
                  default: ({ node, data }) => (
                    <span
                      class="tree-node flex flex-1 justify-content-center align-items flex-row"
                      slot-scope="{ node, data }"
                    >
                      <span>{data.field_name}</span>
                      <span class="e-desc">{data.desc}</span>
                      <span class="e-ops">
                        <ElButton type="text" class="ml-5" onClick={() => this.handleScript(node, data)}>
                          <VIcon>js</VIcon>
                        </ElButton>
                      </span>
                    </span>
                  )
                }}
              />
            </div>
            <ElDialog
              title={'字段赋值(' + this.scriptDialog.tableName + '[' + this.scriptDialog.fieldName + '])'}
              visible={this.scriptDialog.open}
              append-to-body
              custom-class="scriptDialog"
              close-on-click-modal={false}
            >
              <ElForm>
                <ElFormItem>
                  <ElInput
                    placeholder="$t('editor.cell.processor.field.form.expression')"
                    v-model={this.scriptDialog.script}
                    size="mini"
                  >
                    <template slot="prepend">var result = </template>
                  </ElInput>
                </ElFormItem>
              </ElForm>
              <div class="example">
                <div>示例:</div>
                <div>var result = "a" + "b" // 字符串拼接, result的结果为 "ab"</div>
                <div>var result = 1 + 2 // 数字计算, result 的结果为 3</div>
                <div>var result = fn("1") // 调用自定义函数或内置函数, result的结果为 fn 函数的返回值</div>
                <div>
                  var result = record.isTrue ? true : false // 三元表达式,
                  result的值根据判断表达式（record.isTrue）的结果为 true 或 false
                </div>
              </div>
              <div slot="footer" class="dialog-footer">
                <ElButton size="mini" onClick={() => (this.scriptDialog.open = false)}>
                  取消
                </ElButton>
                <ElButton type="primary" size="mini" onClick={() => this.scriptDialog.fn()}>
                  确认
                </ElButton>
              </div>
            </ElDialog>
          </div>
        )
      },
      methods: {
        isScript(id) {
          let scripts = this.scripts.filter(v => v.id === id)
          return scripts && scripts.length > 0
        },
        /*rename
         * @node 当前tree
         * @data 当前数据*/
        getNativeData(id) {
          let fields = this.originalFields || []
          let field = null
          let fn = function (fields) {
            if (!fields) {
              return
            }
            for (let i = 0; i < fields.length; i++) {
              let f = fields[i]
              if (f.id === id) {
                field = f
                break
              } else if (f.children) {
                fn(f.children)
              }
            }
          }
          fn(fields)
          return field
        },
        getParentFieldName(node) {
          let fieldName = node.data && node.data.field_name ? node.data.field_name : ''
          if (node.level > 1 && node.parent && node.parent.data) {
            let parentFieldName = this.getParentFieldName(node.parent)
            if (parentFieldName) fieldName = parentFieldName + '.' + fieldName
          }
          return fieldName
        },
        /**
         *
         * @param node
         * @param data
         */
        handleScript(node, data) {
          let self = this

          let fieldName = (self.scriptDialog.fieldName = self.getParentFieldName(node))
          let tableName = (self.scriptDialog.tableName = data.table_name)
          let id = data.id

          let idx = self.scripts.findIndex(script => script.id === id)
          let script
          if (idx !== -1) {
            script = self.scripts[idx]
          } else {
            script = JSON.parse(JSON.stringify(this.SCRIPT_TPL))
            Object.assign(script, {
              field: fieldName,
              type: data.type,
              primary_key_position: data.primary_key_position,
              color: data.color,
              label: data.field_name,
              field_name: data.field_name,
              tableName,
              id
            })
          }
          self.scriptDialog.script = script.script
          self.scriptDialog.open = true
          self.$nextTick(() => {
            self.scriptDialog.open = true
          })

          self.scriptDialog.fn = function () {
            script.script = self.scriptDialog.script

            if (idx === -1) {
              self.scripts.push(script)
            }

            console.log('fieldProcessor.handleScript', node, data, script, self.scripts) //eslint-disable-line
            self.$nextTick(() => {
              self.scriptDialog.open = false
            })
            self.scriptDialog.fn = function () {}
            self.scriptDialog.script = ''
          }
        },
        delScript(operations, scripts, id) {
          let fieldIds = []
          if (operations) {
            fieldIds = operations.map(field => field.id)
          }
          if (scripts) {
            for (let i = 0; i < scripts.length; i++) {
              if (!fieldIds.includes(scripts[i].id)) {
                scripts.splice(i, 1)
                i--
              } else if (id === scripts[i].id) {
                scripts.splice(i, 1)
                i--
              }
            }
          }
          return scripts
        },
        handleAllReset() {
          let ids = this.$refs.tree.getCheckedNodes(false, true)
          if (ids && ids.length > 0) {
            ids.map(id => {
              let node = this.$refs.tree.getNode(id)
              if (node) {
                this.handleReset(node, node.data)
              }
            })
          }
        },
        handleCheckAllChange() {
          let fields = this.options?.[0] || []
          if (!this.checkAll) {
            this.$refs.tree.setCheckedNodes(fields)
            this.checkAll = true
          } else {
            this.$refs.tree.setCheckedKeys([])
            this.checkAll = false
          }
        }
      }
    })
  ),
  mapProps({ dataSource: 'options', loading: true })
)

export default FieldValue
