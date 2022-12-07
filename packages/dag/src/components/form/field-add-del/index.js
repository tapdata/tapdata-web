import i18n from '@tap/i18n'
import { connect, mapProps, useForm } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from '@vue/composition-api'
import { VIcon } from '@tap/component'
import { convertSchemaToTreeData, uuid } from '../field-rename/util'
import '../field-rename/index.scss'
// import de from 'element-ui/src/locale/lang/de'

export const FieldAddDel = connect(
  observer(
    defineComponent({
      props: ['loading', 'options', 'disabled'],
      setup() {
        const formRef = useForm()
        const form = formRef.value
        return {
          databaseType: form.values.databaseType,
          operations: form.values.operations || [],
          deleteAllFields: form.values.deleteAllFields || false,
          form
        }
      },

      data() {
        return {
          nodeKey: '',
          originalFields: [],
          checkAll: false,
          deleteAllFieldsData: false,
          fields: [],
          /*字段处理器支持功能类型*/
          REMOVE_OPS_TPL: {
            id: '',
            op: 'REMOVE',
            field: ''
          },
          CREATE_OPS_TPL: {
            op: 'CREATE',
            field: '',
            tableName: '',
            data_type: 'String',
            id: '',

            action: '',
            triggerFieldId: ''
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
        }
      },

      render() {
        // eslint-disable-next-line no-console
        console.log('🚗 FieldProcessor', this.loading, this.options)
        let fields = JSON.parse(JSON.stringify(this.options || []))
        //读取op 配置
        fields = convertSchemaToTreeData(fields) || [] //将模型转换成tree
        //fields = this.checkOps(fields)
        this.originalFields = JSON.parse(JSON.stringify(fields))
        fields = this.checkOps(fields) || []
        this.fields = fields
        //初始化
        let formValues = { ...this.form.values }
        this.deleteAllFieldsData = formValues?.deleteAllFields || false

        return (
          <div class="field-processors-tree-warp bg-body pt-2 pb-5" v-loading={this.loading}>
            <div class="field-processor-operation flex">
              {/*<ElCheckbox class="check-all" v-model={this.checkAll} onChange={() => this.handleCheckAllChange()} />*/}
              <span class="flex-1 text inline-block ml-6">
                {i18n.t('packages_form_field_add_del_index_ziduanmingcheng')}
              </span>
              <span class="field-ops inline-block ml-10">
                <VIcon
                  class={[
                    this.deleteAllFieldsData ? 'active__delete' : '',
                    this.disabled ? 'disable__btn' : 'clickable',
                    'ml-5'
                  ]}
                  size="12"
                  disabled={this.disabled}
                  onClick={() => this.handleAllDelete()}
                >
                  delete
                </VIcon>
                <VIcon
                  class={[this.disabled ? 'disable__btn' : 'clickable', 'ml-5']}
                  size="12"
                  disabled={fields.length === 0 || this.disabled}
                  onClick={() => this.handleCreate()}
                >
                  add
                </VIcon>
                <VIcon
                  class={[this.disabled ? 'disable__btn' : 'clickable', 'ml-5']}
                  size="12"
                  disabled={this.disabled}
                  onClick={() => this.handleAllReset()}
                >
                  revoke
                </VIcon>
              </span>
            </div>
            <div className="field-processors-tree-warp">
              <ElTree
                ref="tree"
                data={fields}
                node-key="id"
                default-expand-all={true}
                //show-checkbox={true}
                expand-on-click-node={false}
                class="field-processor-tree"
                scopedSlots={{
                  default: ({ node, data }) => (
                    <span
                      class={['tree-node', 'flex flex-1', 'justify-content-center', 'align-items', 'flex-row']}
                      slot-scope="{ node, data }"
                    >
                      <span class={['inline-block', 'flex-1']}>
                        {this.isCreate(data.id) ? (
                          <span
                            class={[
                              (data.is_deleted || this.isRemove(data.id)) && !this.isRest(data.id)
                                ? 'active__delete'
                                : ''
                            ]}
                          >
                            {data.level === 1 ? (
                              <ElInput
                                id="renameInput"
                                class={[
                                  'tree-field-input',
                                  'text__inner',
                                  {
                                    'tree-field-input-primary': this.isCreate(data.id)
                                  }
                                ]}
                                v-model={data.field_name}
                                onChange={() => this.handleRename(node, data)}
                                onBlur={() => this.closeInput(node.data)}
                                onKeydown={() => this.handleKeyDown()}
                              />
                            ) : (
                              <span class="text__inner">{data.field_name}</span>
                            )}
                          </span>
                        ) : (
                          //不是新建字段
                          <span
                            class={[
                              (data.is_deleted || this.isRemove(data.id)) && !this.isRest(data.id)
                                ? 'active__delete'
                                : ''
                            ]}
                          >
                            {data.field_name}
                            {data.primary_key_position > 0 ? (
                              <VIcon size="12" class="text-warning ml-1">
                                key
                              </VIcon>
                            ) : (
                              ''
                            )}
                          </span>
                        )}
                      </span>
                      <span class="e-ops">
                        <ElButton
                          type="text"
                          class="ml-5"
                          disabled={
                            ((this.isRemove(data.id) || data.is_deleted) && !this.isRest(data.id)) || this.disabled
                          }
                          onClick={() => this.handleDelete(node, data)}
                        >
                          <VIcon> delete</VIcon>
                        </ElButton>
                        <ElButton
                          type="text"
                          class="ml-5"
                          disabled={
                            (!this.isRemove(data.id) && !data.is_deleted) || this.isRest(data.id) || this.disabled
                          }
                          onClick={() => this.handleReset(node, data)}
                        >
                          <VIcon size="12">revoke</VIcon>
                        </ElButton>
                      </span>
                    </span>
                  )
                }}
              />
            </div>
          </div>
        )
      },
      methods: {
        isRemove(id) {
          let ops = this.operations.filter(v => v.id === id && v.op === 'REMOVE' && v.operand)
          return ops && ops.length > 0
        },
        isRest(id) {
          //撤回删除
          let ops = this.operations.filter(v => v.id === id && v.op === 'REMOVE' && !v.operand)
          return ops && ops.length > 0
        },
        isCreate(id) {
          let ops = this.operations.filter(v => v.id === id && v.op === 'CREATE')
          return ops && ops.length > 0
        },
        checkOps(fields) {
          if (this.operations?.length > 0) {
            for (let i = 0; i < this.operations.length; i++) {
              let index = fields.findIndex(t => t.id === this.operations[i]?.id)
              if (this.operations[i]?.op === 'CREATE' && index === -1) {
                let newField = {
                  id: this.operations[i].id,
                  level: 1,
                  label: this.operations[i].field,
                  field_name: this.operations[i].field,
                  table_name: this.operations[i].tableName || this.operations[i].table_name,
                  original_field_name: this.operations[i].field || this.operations[i].field_name,
                  data_type: this.operations[i].data_type,
                  // data_type: 'STRING',
                  primary_key_position: 0,
                  dataType: 2,
                  is_nullable: true,
                  columnSize: 0,
                  autoincrement: false
                }
                fields.unshift(newField)
              }
            }
          }
          return fields
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
        showInput(data) {
          this.$set(data, 'showInput', true) //打开loading
          //将输入框自动获取焦点
          this.$nextTick(() => {
            document.getElementById('renameInput').focus()
          })
        },
        closeInput(data) {
          this.$set(data, 'showInput', false) //打开loading
        },
        handleKeyDown(e) {
          if (e.keyCode === 13) {
            this.$set(data, 'showInput', false) //eslint-disable-line
          }
        },
        handleRename(node, data) {
          let nativeData = this.getNativeData(data.id) //查找初始schema
          let existsName = this.handleExistsName(data.field_name)
          if (existsName) {
            data.field_name = nativeData.field_name
            return
          }
          let createOps = this.operations.filter(v => v.id === data.id && v.op === 'CREATE')
          if (createOps && createOps.length > 0) {
            let op = createOps[0]
            op.field = data.field_name
          }
        },
        handleReset(node, data) {
          if (this.deleteAllFieldsData) {
            //所有字段被删除，撤回既是不删除字段
            this.handleDelete(node, data)
            return
          }
          console.log('fieldProcessor.handleReset', node, data) //eslint-disable-line
          let parentId = node.parent.data.id
          let indexId = this.operations.filter(v => v.op === 'REMOVE' && v.id === parentId)
          if (parentId && indexId.length !== 0) {
            return
          }
          let self = this
          let fn = function (node, data) {
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
              }
            }
          }
          fn(node, data)
          this.$forceUpdate()
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
        handleCreate() {
          let node = this.$refs.tree.getNode(this.fields[0]?.id || '')
          let existsName = this.handleExistsName()
          if (existsName) return
          console.log('fieldProcessor.handleCreate') //eslint-disable-line
          let fieldId = uuid()
          let newFieldOperation = Object.assign(JSON.parse(JSON.stringify(this.CREATE_OPS_TPL)), {
            field: 'newFieldName',
            label: 'newFieldName',
            tableName: this.fields[0]?.tableName || '',
            data_type: 'String',
            id: fieldId,
            action: 'create_sibling',
            triggerFieldId: '',
            level: 1
          })
          this.operations.push(newFieldOperation)

          let newNodeData = {
            id: fieldId,
            label: 'newFieldName',
            type: 'String',
            primary_key_position: 0,
            tableName: this.fields[0]?.tableName || '',
            field_name: 'newFieldName',
            level: 1
          }
          this.$refs.tree.insertAfter(newNodeData, node)
        },
        handleExistsName(name) {
          // 改名前查找同级中是否重名，若有则return且还原改动并提示
          name = name || 'newFieldName'
          let exist = false
          let parentNode = this.fields.filter(v => name === v.field_name)
          if (
            (parentNode && parentNode.length >= 1 && name === 'newFieldName') ||
            (parentNode && parentNode.length > 1 && name !== 'newFieldName')
          ) {
            this.$message.error(name + this.$t('packages_form_message_exists_name'))
            exist = true
          }
          return exist
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
            this.operations = this.operations || []
            let self = this
            let fn = function (field) {
              let ops = self.operations.filter(v => v.op === 'REMOVE' && v.id === field.id)
              let op = Object.assign(JSON.parse(JSON.stringify(self.REMOVE_OPS_TPL)), {
                id: field.id,
                field: field.original_field_name,
                operand: !self.deleteAllFieldsData,
                table_name: field.table_name,
                type: field.data_type,
                primary_key_position: field.primary_key_position,
                color: field.color,
                label: field.field_name,
                field_name: field.field_name
              })
              if (ops.length !== 0) {
                let index = self.operations.findIndex(v => v.op === 'REMOVE' && v.id === field.id)
                if (index > -1) {
                  self.operations.splice(index, 1)
                }
                op.operand = true
              }
              self.operations.push(op)
              if (field.children) {
                field.children.forEach(fn)
              }
            }
            if (originalField) fn(originalField)
          }
          this.$forceUpdate()
          console.log('fieldProcessor.handleDelete', this.operations) // eslint-disable-line
        },
        handleAllDelete() {
          //清掉所有operations
          this.operations.splice(0)
          this.form.setValuesIn('deleteAllFields', true)
        },
        handleAllReset() {
          //清掉所有operations
          this.operations.splice(0)
          this.form.setValuesIn('deleteAllFields', false)
        }
        // handleCheckAllChange() {
        //   if (this.checkAll) {
        //     this.$nextTick(() => {
        //       this.$refs.tree.setCheckedNodes(this.fields)
        //     })
        //   } else {
        //     this.$nextTick(() => {
        //       this.$refs.tree.setCheckedKeys([])
        //     })
        //   }
        // }
      }
    })
  ),
  mapProps({ dataSource: 'options', loading: true })
)

export default FieldAddDel
