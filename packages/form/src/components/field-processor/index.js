import { connect, mapProps, useForm } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'
import VIcon from 'web-core/components/VIcon'
import { uuid, handleOperation } from './util'
import './fieldProessor.scss'
// import de from 'element-ui/src/locale/lang/de'

export const FieldProcess = connect(
  observer(
    defineComponent({
      props: ['loading', 'options'],

      setup() {
        const formRef = useForm()
        const form = formRef.value
        return {
          databaseType: form.values.databaseType,
          operations: form.values.operations,
          scripts: form.values.scripts,
          form
        }
      },

      data() {
        return {
          nodeKey: '',
          selectList: [
            {
              label: 'String',
              value: 'String'
            },
            {
              label: 'Date',
              value: 'Date'
            },
            {
              label: 'Double',
              value: 'Double'
            },
            {
              label: 'Float',
              value: 'Float'
            },
            {
              label: 'BigDecimal',
              value: 'BigDecimal'
            },
            {
              label: 'Long',
              value: 'Long'
            },
            {
              label: 'Map',
              value: 'Map'
            },
            {
              label: 'Array',
              value: 'Array'
            }
          ],
          originalFields: [],
          checkAll: false,
          scriptDialog: {
            open: false,
            script: '//Enter you code at here',
            fieldName: '',
            fn: function () {}
          },
          /*字段处理器支持功能类型*/
          REMOVE_OPS_TPL: {
            id: '',
            op: 'REMOVE',
            field: ''
          },
          RENAME_OPS_TPL: {
            id: '',
            op: 'RENAME',
            field: '',
            operand: ''
          },
          CONVERT_OPS_TPL: {
            id: '',
            op: 'CONVERT',
            field: '',
            operand: '',
            originalDataType: ''
          },
          CREATE_OPS_TPL: {
            op: 'CREATE',
            field: '',
            tableName: '',
            java_type: 'String',
            id: '',

            action: '',
            triggerFieldId: ''
          },
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
        operations: {
          deep: true,
          handler(v) {
            this.$emit('change', v)
            console.log('operations', v) // eslint-disable-line
          }
        },

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
        let fields = this.options || []
        this.originalFields = JSON.parse(JSON.stringify(fields))
        // apply operations to schema
        //查找是否有被删除的字段且operation有操作
        let temporary = handleOperation(fields, this.operations)
        temporary.map(item => {
          let targetIndex = fields.findIndex(n => n.id === item.id)
          if (targetIndex === -1 && item.op !== 'CREATE') {
            // data.operations.splice(index,1); //删除找不到id的数据
            return
          }
          if (item.op === 'CONVERT') {
            fields[targetIndex].java_type = item.operand
          } else if (item.op === 'RENAME') {
            const name = fields[targetIndex].field_name
            let newName = name.split('.')
            newName[newName.length - 1] = item.operand
            const newNameStr = newName.join('.')
            fields[targetIndex].field_name = newNameStr

            // change children field name
            fields.forEach(field => {
              if (field.field_name.startsWith(name + '.')) {
                field.field_name = newNameStr + field.field_name.substring(name.length)
              }
            })
          } else if (item.op === 'CREATE') {
            let triggerFieldId = item.triggerFieldId
            let newField = {
              id: item.id,
              field_name: item.field || item.field_name,
              table_name: item.tableName || item.table_name,
              original_field_name: item.field || item.field_name,
              java_type: item.java_type,
              data_type: 'STRING',
              primary_key_position: 0,
              dataType: 2,
              is_nullable: true,
              columnSize: 0,
              autoincrement: false
            }
            if (triggerFieldId) {
              let triggerFieldIndex = fields.findIndex(f => f.id === triggerFieldId)
              fields.splice(triggerFieldIndex + 1, 0, newField)
            } else fields.push(newField)
          }
        })
        // eslint-disable-next-line
        console.log('FieldProcess.mergeOutputSchema', fields)
        return (
          <div class="field-processor-tree-warp bg-body pt-2 pb-5">
            <div class="field-processor-operation flex">
              <ElCheckbox class="check-all mr-4" v-model={this.checkAll} onChange={() => this.handleCheckAllChange()} />
              <span class="field-name inline-block">字段名称</span>
              <span class="field-desc inline-block">字段描述</span>
              <span class="field-type inline-block">类型</span>
              <span class="field-ops inline-block">
                <VIcon class="clickable ml-5" small onClick={() => this.handleAllToUpperCase()}>
                  toUpperCase
                </VIcon>
                <VIcon class="clickable ml-5" small onClick={() => this.handleAllToLowerCase()}>
                  toLowerCase
                </VIcon>
                <VIcon class="clickable ml-5" small onClick={() => this.handleAllDelete()}>
                  delete
                </VIcon>
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
                      <span
                        class={[
                          'tree-field-input-wrap',
                          'item',
                          'inline-block',
                          'e-label',
                          this.isRename(data.id) ? 'active__name' : '',
                          this.isCreate(data.id) ? 'active__name' : ''
                        ]}
                      >
                        <ElInput
                          class="tree-field-input"
                          v-model={data.field_name}
                          disabled={this.isRemove(data.id)}
                          onChange={() => this.handleRename(node, data)}
                        />
                        <VIcon class="title-input-icon" size="14">
                          edit-outline
                        </VIcon>
                      </span>
                      <span class="e-desc">{data.desc}</span>
                      <ElSelect
                        v-model={data.java_type}
                        size="mini"
                        disabled={this.isRemove(data.id)}
                        class={[this.isConvertDataType(data.id) ? 'active__type' : '', 'e-select']}
                        onChange={() => this.handleDataType(node, data)}
                      >
                        {this.selectList.map(op => (
                          <ElOption label={op.label} value={op.value} key={op.value} />
                        ))}
                      </ElSelect>
                      <span class="e-ops">
                        <ElButton
                          type="text"
                          class="ml-5"
                          disabled={this.isRemove(data.id)}
                          onClick={() => this.handleScript(node, data)}
                        >
                          <VIcon>js</VIcon>
                        </ElButton>
                        <ElButton
                          type="text"
                          class="ml-5"
                          disabled={this.isRemove(data.id)}
                          onClick={() => this.handleDelete(node, data)}
                        >
                          <VIcon> delete</VIcon>
                        </ElButton>
                        <ElButton type="text" class="ml-5" onClick={() => this.handleReset(node, data)}>
                          <VIcon>revoke</VIcon>
                        </ElButton>
                        <ElButton
                          type="text"
                          class="ml-5"
                          disabled={this.isRemove(data.id)}
                          onClick={() => this.handleCreate('create_sibling', node, data)}
                        >
                          <VIcon>add</VIcon>
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
        isRemove(id) {
          let ops = this.operations.filter(v => v.id === id && v.op === 'REMOVE')
          return ops && ops.length > 0
        },
        isRename(id) {
          let ops = this.operations.filter(v => v.id === id && v.op === 'RENAME')
          return ops && ops.length > 0
        },
        isConvertDataType(id) {
          let ops = this.operations.filter(v => v.id === id && v.op === 'CONVERT')
          return ops && ops.length > 0
        },
        isScript(id) {
          let scripts = this.scripts.filter(v => v.id === id)
          return scripts && scripts.length > 0
        },
        isCreate(id) {
          let ops = this.operations.filter(v => v.id === id && v.op === 'CREATE')
          return ops && ops.length > 0
        },
        /*rename
         * @node 当前tree
         * @data 当前数据*/
        handleRename(node, data) {
          console.log('fieldProcessor.handleRename', node, data) //eslint-disable-line
          let nativeData = this.getNativeData(data.id) //查找初始schema
          //该字段若是已被删除 不可再重命名
          if (!data || data.field_name === '') {
            data.field_name = nativeData.field_name
            this.$message.error(this.$t('message.exists_name'))
            return
          }
          let removes = this.operations.filter(v => v.id === data.id && v.op === 'REMOVE')
          if (removes.length > 0) {
            data.field_name = nativeData.field_name
            return
          }
          let existsName = this.handleExistsName(node, data)
          if (existsName) {
            data.field_name = nativeData.field_name
            return
          }
          let createOps = this.operations.filter(v => v.id === data.id && v.op === 'CREATE')
          if (createOps && createOps.length > 0) {
            let op = createOps[0]
            let level = op.level
            let fieldNames = (op.field || op.field_name).split('.')
            fieldNames[level] = data.field_name
            op.field = fieldNames.join('.')
            //同步对js 改名操作
            if (this.scripts && this.scripts.length && this.scripts.length > 0) {
              for (let i = 0; i < this.scripts.length; i++) {
                if (op.id === this.scripts[i].id) {
                  this.scripts[i].field = op.field
                  this.scripts[i].label = op.field
                }
              }
            }
          } else {
            //eslint-disable-next-line
            console.log(
              'fieldProcessor.handlerRename(node,data,nativeData,operations',
              node,
              data,
              nativeData,
              this.operations
            )
            let ops = this.operations.filter(v => v.id === data.id && v.op === 'RENAME')
            let op
            if (ops.length === 0) {
              op = Object.assign(JSON.parse(JSON.stringify(this.RENAME_OPS_TPL)), {
                id: data.id,
                field: nativeData.original_field_name,
                operand: data.field_name,
                table_name: data.table_name,
                type: data.type,
                primary_key_position: data.primary_key_position,
                color: data.color,
                label: data.field_name,
                field_name: data.field_name
              })
              this.operations.push(op)
            } else {
              op = ops[0]
              op.operand = data.field_name
              op.label = data.field_name
              op.field_name = data.field_name
            }
            //删除 相同字段名称
            if (this.scripts && this.operations.length && this.operations.length > 0) {
              for (let i = 0; i < this.operations.length; i++) {
                let originalFieldName = this.operations[i].field
                if (originalFieldName.indexOf('.') >= 0) {
                  originalFieldName = originalFieldName.split('.')
                  originalFieldName = originalFieldName[originalFieldName.length - 1]
                }
                if (originalFieldName === this.operations[i].operand && this.operations[i].op === 'RENAME') {
                  this.operations.splice(i, 1)
                  i--
                }
              }
            }
          }
          console.log(this.operations) //eslint-disable-line
        },
        handleExistsName(node, data) {
          // 改名前查找同级中是否重名，若有则return且还原改动并提示
          let exist = false
          if (node && node.parent && node.parent.childNodes) {
            let parentNode = node.parent.childNodes.filter(v => data.field_name === v.data.field_name)
            if (parentNode && parentNode.length === 2) {
              this.$message.error(data.field_name + this.$t('message.exists_name'))
              exist = true
            }
          }
          return exist
        },
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
        handleDataType(node, data) {
          console.log('fieldProcessor.handleDataType', node, data) //eslint-disable-line
          let createOps = this.operations.filter(v => v.id === data.id && v.op === 'CREATE')
          if (createOps && createOps.length > 0) {
            let op = createOps[0]
            op.java_type = data.java_type
          } else {
            let nativeData = this.getNativeData(data.id)
            let ops = this.operations.filter(v => v.id === data.id && v.op === 'CONVERT')
            let op
            if (ops.length === 0) {
              op = Object.assign(JSON.parse(JSON.stringify(this.CONVERT_OPS_TPL)), {
                id: data.id,
                field: nativeData.original_field_name,
                operand: data.java_type,
                originalDataType: nativeData.original_java_type,
                table_name: data.table_name,
                type: data.java_type,
                primary_key_position: data.primary_key_position,
                color: data.color,
                label: data.field_name,
                field_name: data.field_name
              })
              this.operations.push(op)
            } else {
              op = ops[0]
              op.type = data.java_type
              op.operand = data.java_type
              op.originalDataType = nativeData.original_java_type
            }
          }
        },
        handleReset(node, data) {
          console.log('fieldProcessor.handleReset', node, data) //eslint-disable-line
          let parentId = node.parent.data.id
          let dataLabel = JSON.parse(JSON.stringify(data.field_name))
          let indexId = this.operations.filter(v => v.op === 'REMOVE' && v.id === parentId)
          if (parentId && indexId.length !== 0) {
            return
          }
          let self = this
          let fn = function (node, data) {
            let nativeData = self.getNativeData(data.id)
            for (let i = 0; i < node.childNodes.length; i++) {
              let childNode = node.childNodes[i]
              fn(childNode, childNode.data)
            }
            for (let i = 0; i < self.operations.length; i++) {
              if (self.operations[i].id === data.id) {
                let ops = self.operations[i]
                if (ops.op === 'REMOVE') {
                  self.operations.splice(i, 1)
                  i--
                  continue
                }
                if (ops.op === 'CREATE') {
                  self.operations.splice(i, 1)
                  i--
                  self.$refs.tree.remove(node)
                  continue
                }
                if (ops.op === 'RENAME') {
                  let existsName = self.handleExistsName(node, data)
                  if (existsName) {
                    return
                  }
                  if (nativeData) node.data.field_name = nativeData.original_field_name
                  self.operations.splice(i, 1)
                  i--
                  continue
                }
                if (ops.op === 'CONVERT') {
                  if (nativeData) node.data.type = nativeData.type
                  self.operations.splice(i, 1)
                  i--
                  continue
                }
              }
            }
          }
          fn(node, data)
          let existsName = this.handleExistsName(node, data)
          if (existsName) {
            data.field_name = dataLabel
          }
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
         * @param action create_sibling | create_child
         * @param node
         * @param data
         */
        handleCreate(action, node, data) {
          console.log('fieldProcessor.handleCreate', action, node, data) //eslint-disable-line
          let parentFieldName = ''
          let level = node.level
          if (action === 'create_sibling') {
            parentFieldName = this.getParentFieldName(node.parent)
            let parentNode = node.parent.childNodes.filter(v => v.data.field_name === 'newFieldName')
            if (parentNode && parentNode.length > 0) {
              this.$message.error('newFieldName ' + this.$t('message.exists_name'))
              return
            }
          } else if (action === 'create_child') {
            parentFieldName = this.getParentFieldName(node)
            level++
            let parentNode = node.childNodes.filter(v => v.data.field_name === 'newFieldName')
            if (parentNode && parentNode.length > 0) {
              this.$message.error('newFieldName ' + this.$t('message.exists_name'))
              return
            }
          }

          let fieldId = uuid()
          let newFieldOperation = Object.assign(JSON.parse(JSON.stringify(this.CREATE_OPS_TPL)), {
            field: parentFieldName ? parentFieldName + '.newFieldName' : 'newFieldName',
            tableName: data.table_name,
            java_type: 'String',
            id: fieldId,
            action: action,
            triggerFieldId: node.data.id,
            level: level - 1
          })
          this.operations.push(newFieldOperation)

          let newNodeData = {
            id: fieldId,
            label: 'newFieldName',
            type: 'String',
            color: data.color,
            primary_key_position: 0,
            table_name: data.table_name,
            field_name: 'newFieldName'
          }
          if (action === 'create_sibling') {
            let parentNode = node.parent
            let parentData = parentNode.data

            this.$refs.tree.insertAfter(newNodeData, node)
            if (!['Array', 'Map'].includes(parentData.type)) parentData.type = 'Map'
          } else if (action === 'create_child') {
            this.$refs.tree.append(newNodeData, node)
            if (!['Array', 'Map'].includes(data.type)) data.type = 'Map'
            this.handleDataType(node, data)
          }
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
        handleDelete(node, data) {
          console.log('fieldProcessor.handleDelete', node, data) // eslint-disable-line
          let createOpsIndex = this.operations.findIndex(v => v.id === data.id && v.op === 'CREATE')
          if (createOpsIndex >= 0) {
            let fieldName = this.operations[createOpsIndex].field_name + '.'
            this.operations.splice(createOpsIndex, 1)

            for (let i = 0; i < this.operations.length; i++) {
              let op = this.operations[i]
              let opFieldName = op.field || op.field_name
              if (opFieldName.indexOf(fieldName) === 0 && opFieldName.length === fieldName.length) {
                this.operations.splice(i, 1)
                i--
              }
            }
            this.$refs.tree.remove(node)
          } else {
            let originalField = this.getNativeData(data.id)
            let self = this
            let fn = function (field) {
              for (let i = 0; i < self.operations.length; i++) {
                // 删除所有的rename的操作
                let ops = self.operations[i]
                if (ops.id === field.id && ops.op === 'RENAME') {
                  data.field_name = originalField.field_name
                  self.operations.splice(i, 1)
                }
              }
              for (let i = 0; i < self.operations.length; i++) {
                // 删除所有的类型改变的操作
                let ops = self.operations[i]
                if (ops.id === field.id && ops.op === 'CONVERT') {
                  data.type = originalField.type
                  self.operations.splice(i, 1)
                }
              }
              let ops = self.operations.filter(v => v.op === 'REMOVE' && v.id === field.id)
              let op
              if (ops.length === 0) {
                op = Object.assign(JSON.parse(JSON.stringify(self.REMOVE_OPS_TPL)), {
                  id: field.id,
                  field: field.original_field_name,
                  operand: true,
                  table_name: field.table_name,
                  type: field.type,
                  primary_key_position: field.primary_key_position,
                  color: field.color,
                  label: field.label,
                  field_name: field.label
                })
                self.operations.push(op)
              }

              if (field.children) {
                field.children.forEach(fn)
              }
            }
            if (originalField) fn(originalField)
          }
          //删除 对应字段js脚本处理
          this.scripts = this.delScript(this.operations, this.scripts, data.id)
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
        handleAllDelete() {
          let ids = this.$refs.tree.getCheckedNodes()
          if (ids && ids.length > 0) {
            ids.map(id => {
              let node = this.$refs.tree.getNode(id)
              this.handleDelete(node, node.data)
            })
          }
        },
        handleAllToUpperCase() {
          let ids = this.$refs.tree.getCheckedNodes()
          if (ids && ids.length > 0) {
            ids.map(id => {
              let node = this.$refs.tree.getNode(id)
              node.data.field_name = node.data.field_name.toUpperCase()
              this.handleRename(node, node.data)
            })
          }
        },
        handleAllToLowerCase() {
          let ids = this.$refs.tree.getCheckedNodes()
          if (ids && ids.length > 0) {
            ids.map(id => {
              let node = this.$refs.tree.getNode(id)
              node.data.field_name = node.data.field_name.toLowerCase()
              this.handleRename(node, node.data)
            })
          }
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
          let fields = this.options || []
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

export default FieldProcess
