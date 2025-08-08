import { observer } from '@formily/reactive-vue'
import { metadataInstancesApi } from '@tap/api'

import { IconButton } from '@tap/component/src/icon-button'
import { connect, mapProps, useForm } from '@tap/form'
import i18n from '@tap/i18n'
import { cloneDeep } from 'lodash-es'
import { defineComponent, ref } from 'vue'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'
import { convertSchemaToTreeData, uuid } from '../field-rename/util'
import '../field-rename/index.scss'

export const FieldAddDel = connect(
  observer(
    defineComponent({
      props: ['disabled'],
      setup() {
        const formRef = useForm()
        const form = formRef.value
        const options = ref([])
        const loading = ref(false)

        const loadSchema = async () => {
          loading.value = true
          try {
            const data = await metadataInstancesApi.nodeSchema(
              formRef.value.values.id,
            )
            options.value = data?.[0]?.fields || []
          } catch {
            options.value = []
          }
          loading.value = false
        }

        loadSchema()

        useAfterTaskSaved(formRef.value.values.$inputs, loadSchema)

        return {
          loading,
          options,
          loadSchema,
          databaseType: form.values.databaseType,
          operations: form.values.operations || [],
          deleteAllFields: form.values.deleteAllFields || false,
          form,
        }
      },

      data() {
        return {
          nodeKey: '',
          originalFields: [],
          checkAll: false,
          deleteAllFieldsData: false,
          fields: [],
          searchFiledName: '',
          /*字段处理器支持功能类型*/
          REMOVE_OPS_TPL: {
            id: '',
            op: 'REMOVE',
            field: '',
          },
          CREATE_OPS_TPL: {
            op: 'CREATE',
            field: '',
            tableName: '',
            data_type: 'String',
            id: '',

            action: '',
            triggerFieldId: '',
          },
        }
      },

      render() {
        // eslint-disable-next-line no-console
        console.log('🚗 FieldProcessor', this.loading, this.options)
        let fields = JSON.parse(JSON.stringify(this.options || []))
        //读取op 配置
        fields = convertSchemaToTreeData(fields) || [] //将模型转换成tree
        fields = fields.sort((a, b) => a.columnPosition - b.columnPosition)
        //fields = this.checkOps(fields)
        this.originalFields = JSON.parse(JSON.stringify(fields))
        fields = this.checkOps(fields) || []
        this.searchFiledName = this.searchFiledName.trim().toString() //去空格
        if (this.searchFiledName !== '') {
          fields = fields.filter((v) => {
            const str = v.label.toLowerCase()
            return str.includes(this.searchFiledName.toLowerCase())
          })
        }
        this.fields = fields
        console.log('fields', fields)
        //初始化
        const formValues = { ...this.form.values }
        this.deleteAllFieldsData = formValues?.deleteAllFields || false
        return (
          <div
            class="field-processors-tree-warp bg-body mt-2"
            v-loading={this.loading}
          >
            <ElInput
              class="mb-3"
              placeholder={i18n.t(
                'packages_form_field_mapping_list_qingshuruziduan',
              )}
              v-model={this.searchFiledName}
              clearable
            >
              {{
                prefix: () => (
                  <ElIcon>
                    <ElIconSearch />
                  </ElIcon>
                ),
              }}
            </ElInput>
            <div class="border rounded-4 overflow-hidden">
              <div class="field-processor-operation flex">
                <span class="flex-1 text inline-block ml-6">
                  {i18n.t('packages_form_field_add_del_index_ziduanmingcheng')}
                </span>
                <span class="flex align-center gap-2 px-2">
                  <IconButton
                    sm
                    disabled={fields.length === 0 || this.disabled}
                    onClick={() => this.handleCreate()}
                  >
                    add
                  </IconButton>
                  <IconButton
                    sm
                    disabled={this.disabled || this.deleteAllFieldsData}
                    onClick={() => this.handleAllDelete()}
                  >
                    delete
                  </IconButton>
                  <IconButton
                    sm
                    disabled={this.disabled}
                    onClick={() => this.handleAllReset()}
                  >
                    revoke
                  </IconButton>
                </span>
              </div>
              <div class="field-processors-tree-warp">
                {/*TODO 目前的虚拟树不支持拖拽，等拖拽实现后，替换成虚拟树*/}
                <ElTree
                  ref="tree"
                  height="calc(100vh - 240px)"
                  data={fields}
                  node-key="id"
                  draggable
                  allow-drag={this.checkAllowDrag}
                  allow-drop={this.checkAllowDrop}
                  onNodeDrop={this.handleSaveDrop}
                  default-expand-all={true}
                  expand-on-click-node={false}
                  class="field-processor-tree"
                >
                  {{
                    default: ({ node, data }) => (
                      <span
                        class={[
                          'tree-node',
                          'flex flex-1',
                          'justify-content-center',
                          'align-center',
                          'flex-row',
                          'overflow-hidden',
                        ]}
                      >
                        {node.level === 1 && (
                          <el-dropdown
                            placement="top-start"
                            onCommand={(val) => this.handleCommand(val, node)}
                          >
                            {{
                              default: () => (
                                <span class="el-dropdown-link">
                                  <VIcon class="color-primary mt-n1 mr-2">
                                    drag
                                  </VIcon>
                                </span>
                              ),
                              dropdown: () => (
                                <el-dropdown-menu>
                                  <el-dropdown-item command="top">
                                    {i18n.t(
                                      'packages_dag_field_add_del_index_zhiding',
                                    )}
                                  </el-dropdown-item>
                                  <el-dropdown-item command="prev">
                                    {i18n.t(
                                      'packages_dag_field_add_del_index_shangyi',
                                    )}
                                  </el-dropdown-item>
                                  <el-dropdown-item command="next">
                                    {i18n.t(
                                      'packages_dag_field_add_del_index_xiayi',
                                    )}
                                  </el-dropdown-item>
                                  <el-dropdown-item command="bottom">
                                    {i18n.t(
                                      'packages_dag_field_add_del_index_zhidi',
                                    )}
                                  </el-dropdown-item>
                                </el-dropdown-menu>
                              ),
                            }}
                          </el-dropdown>
                        )}

                        <span
                          class={['inline-block', 'flex-1', 'text-truncate']}
                        >
                          {this.isCreate(data.field) ? (
                            <span
                              class={[
                                (data.is_deleted ||
                                  this.isRemove(data.previousFieldName)) &&
                                !this.isRest(data.previousFieldName)
                                  ? 'active__delete'
                                  : '',
                              ]}
                            >
                              {data.level === 1 ? (
                                <ElInput
                                  id="renameInput"
                                  class={[
                                    'tree-field-input',
                                    'text__inner',
                                    {
                                      'tree-field-input-primary': this.isCreate(
                                        data.previousFieldName,
                                      ),
                                    },
                                  ]}
                                  v-model={data.field_name}
                                  onChange={(val) =>
                                    this.handleRename(node, data)
                                  }
                                  onBlur={() => this.closeInput(node.data)}
                                  onKeydown={() => this.handleKeyDown()}
                                />
                              ) : (
                                <span class="text__inner">
                                  {data.previousFieldName}
                                </span>
                              )}
                            </span>
                          ) : (
                            //不是新建字段
                            <span
                              class={[
                                (data.is_deleted ||
                                  this.isRemove(data.previousFieldName)) &&
                                !this.isRest(data.previousFieldName)
                                  ? 'active__delete'
                                  : '',
                              ]}
                            >
                              {data.previousFieldName}
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
                        <span class="flex align-center gap-2 px-2">
                          <IconButton
                            sm
                            disabled={
                              ((this.isRemove(data.previousFieldName) ||
                                data.is_deleted) &&
                                !this.isRest(data.previousFieldName)) ||
                              this.disabled
                            }
                            onClick={() => this.handleDelete(node, data)}
                          >
                            delete
                          </IconButton>
                          <IconButton
                            sm
                            disabled={
                              (!this.isRemove(data.previousFieldName) &&
                                !data.is_deleted) ||
                              this.isRest(data.previousFieldName) ||
                              this.disabled
                            }
                            onClick={() => this.handleReset(node, data)}
                          >
                            revoke
                          </IconButton>
                        </span>
                      </span>
                    ),
                  }}
                </ElTree>
              </div>
            </div>
          </div>
        )
      },
      methods: {
        isRemove(field) {
          const ops = this.operations.filter(
            (v) =>
              v.field === field && v.op === 'REMOVE' && v.operand === 'true',
          )
          return ops && ops.length > 0
        },
        isRest(field) {
          //撤回删除
          const ops = this.operations.filter(
            (v) =>
              v.field === field && v.op === 'REMOVE' && v.operand === 'false',
          )
          return ops && ops.length > 0
        },
        isCreate(field) {
          const ops = this.operations.filter(
            (v) => v.field === field && v.op === 'CREATE',
          )
          return ops && ops.length > 0
        },
        checkOps(fields) {
          // FIXME: 后续需要优化
          console.log('checkOps', this.operations?.length) // eslint-disable-line
          if (this.operations?.length > 0) {
            for (let i = 0; i < this.operations.length; i++) {
              const index = fields.findIndex(
                (t) => t.previousFieldName === this.operations[i]?.field,
              )
              if (this.operations[i]?.op === 'CREATE' && index === -1) {
                const newField = {
                  id: this.operations[i].id,
                  level: 1,
                  label: this.operations[i].field,
                  field_name: this.operations[i].field,
                  table_name:
                    this.operations[i].tableName ||
                    this.operations[i].table_name,
                  original_field_name:
                    this.operations[i].field || this.operations[i].field_name,
                  data_type: this.operations[i].data_type,
                  // data_type: 'STRING',
                  primary_key_position: 0,
                  dataType: 2,
                  is_nullable: true,
                  columnSize: 0,
                  autoincrement: false,
                  previousFieldName: this.operations[i].field,
                }
                fields.unshift(newField)
              }
            }
          }
          return fields
        },
        handleInput(val) {
          this.searchFiledName = val
        },
        getNativeData(id) {
          const fields = this.originalFields || []
          let field = null
          const fn = function (fields) {
            if (!fields) {
              return
            }
            for (const f of fields) {
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
          data.showInput = true //打开loading
          //将输入框自动获取焦点
          this.$nextTick(() => {
            document.querySelector('#renameInput').focus()
          })
        },
        closeInput(data) {
          data.showInput = false //打开loading
        },
        handleKeyDown(e) {
          if (e.keyCode === 13) {
            data['showInput'] = false //eslint-disable-line
          }
        },
        handleRename(node, data) {
          // FIXME: 重命名
          const existsName = this.handleExistsName(data.field_name)

          if (existsName) {
            data.field_name = data.previousFieldName
            this.updateFieldsAfter()
            return
          }

          const createOps = this.operations.filter(
            (v) => v.field === data.previousFieldName && v.op === 'CREATE',
          )

          if (createOps && createOps.length > 0) {
            const op = createOps[0]
            op.field = data.field_name
            data.previousFieldName = data.field_name
            this.updateFieldsAfter()
          }
          this.$emit('change', this.operations)
        },
        handleReset(node, data) {
          if (this.deleteAllFieldsData) {
            //所有字段被删除，撤回既是不删除字段
            this.handleDelete(node, data, true)
            return
          }
          console.log('fieldProcessor.handleReset', node, data) //eslint-disable-line
          const parentId = node.parent.data.previousFieldName
          const operations = [...this.operations]
          const indexId = operations.filter(
            (v) => v.op === 'REMOVE' && v.field === data.previousFieldName,
          )
          if (parentId && indexId.length !== 0) {
            return
          }
          const self = this
          const fn = function (node, data) {
            for (let i = 0; i < node.childNodes.length; i++) {
              const childNode = node.childNodes[i]
              fn(childNode, childNode.data)
            }
            for (let i = 0; i < operations.length; i++) {
              if (operations[i].field === data.previousFieldName) {
                const ops = operations[i]
                if (ops.op === 'REMOVE') {
                  operations.splice(i, 1)
                  i--
                  continue
                }
                if (ops.op === 'CREATE') {
                  operations.splice(i, 1)
                  i--
                  self.$refs.tree.remove(node)
                  continue
                }
              }
            }
          }
          fn(node, data)
          this.operations = operations
          this.$emit('change', this.operations)
        },
        getParentFieldName(node) {
          let fieldName =
            node.data && node.data.previousFieldName
              ? node.data.previousFieldName
              : ''
          if (node.level > 1 && node.parent && node.parent.data) {
            const parentFieldName = this.getParentFieldName(node.parent)
            if (parentFieldName) fieldName = `${parentFieldName}.${fieldName}`
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
          const node = this.$refs.tree.getNode(this.fields[0]?.id || '')
          const existsName = this.handleExistsName()
          if (existsName) return
          console.log('fieldProcessor.handleCreate') //eslint-disable-line
          const fieldId = uuid()
          const newFieldOperation = Object.assign(
            JSON.parse(JSON.stringify(this.CREATE_OPS_TPL)),
            {
              field: 'newFieldName',
              label: 'newFieldName',
              tableName: this.fields[0]?.tableName || '',
              data_type: 'String',
              id: fieldId,
              action: 'create_sibling',
              triggerFieldId: '',
              level: 1,
            },
          )
          this.operations.push(newFieldOperation)
          this.$emit('change', this.operations)
          const newNodeData = {
            id: fieldId,
            label: 'newFieldName',
            type: 'String',
            primary_key_position: 0,
            tableName: this.fields[0]?.tableName || '',
            previousFieldName: 'newFieldName',
            level: 1,
          }
          this.$refs.tree.insertAfter(newNodeData, node)
        },
        handleExistsName(name) {
          // 改名前查找同级中是否重名，若有则return且还原改动并提示
          name = name || 'newFieldName'
          let exist = false
          const parentNode = this.fields.filter((v) => name === v.field_name)
          if (
            (parentNode && parentNode.length >= 1 && name === 'newFieldName') ||
            (parentNode && parentNode.length > 1 && name !== 'newFieldName')
          ) {
            this.$message.error(
              name + this.$t('packages_form_message_exists_name'),
            )
            exist = true
          }
          return exist
        },
        handleDelete(node, data, isReset = false) {
          console.log('fieldProcessor.handleDelete', node, data) // eslint-disable-line
          const operations = [...this.operations]
          const createOpsIndex = this.operations.findIndex(
            (v) => v.field === data.previousFieldName && v.op === 'CREATE',
          )
          if (createOpsIndex !== -1) {
            const fieldName = `${this.operations[createOpsIndex].field}.`
            operations.splice(createOpsIndex, 1)

            for (let i = 0; i < this.operations.length; i++) {
              const op = this.operations[i]
              const opFieldName = op.field
              if (
                opFieldName.indexOf(fieldName) === 0 &&
                opFieldName.length === fieldName.length
              ) {
                operations.splice(i, 1)
                i--
              }
            }
            this.$refs.tree.remove(node)
            this.updateFieldsAfter()
          } else {
            const originalField = this.getNativeData(data.id)
            const self = this
            const fn = function (field) {
              const ops = operations.filter(
                (v) => v.op === 'REMOVE' && v.field === field.field,
              )
              const op = Object.assign(
                JSON.parse(JSON.stringify(self.REMOVE_OPS_TPL)),
                {
                  id: field.id,
                  field: field.previousFieldName,
                  operand: String(!self.deleteAllFieldsData),
                  table_name: field.table_name,
                  type: field.data_type,
                  primary_key_position: field.primary_key_position,
                  color: field.color,
                  label: field.field_name,
                },
              )
              if (ops.length !== 0) {
                const index = operations.findIndex(
                  (v) =>
                    v.op === 'REMOVE' && v.field === field.previousFieldName,
                )
                if (index !== -1) {
                  operations.splice(index, 1)
                }
                op.operand = isReset ? 'false' : 'true'
              }
              operations.push(op)
              if (field.children) {
                field.children.forEach(fn)
              }
            }
            if (originalField) fn(originalField)
          }
          this.operations = operations
          this.$emit('change', this.operations)
          console.log('fieldProcessor.handleDelete', this.operations) // eslint-disable-line
        },
        handleAllDelete() {
          //清掉所有operations
          this.operations = []
          this.$emit('change', this.operations)
          this.form.setValuesIn('deleteAllFields', true)
        },
        handleAllReset() {
          //清掉所有operations
          this.operations = []
          this.$emit('change', this.operations)
          this.form.setValuesIn('deleteAllFields', false)
        },
        checkAllowDrag(node) {
          return node.level === 1
        },
        checkAllowDrop(draggingNode, dropNode, type) {
          return dropNode.level === 1 && type !== 'inner'
        },
        handleSaveDrop() {
          this.fields.forEach((el, i) => {
            el.columnPosition = i + 1
          })

          this.updateFieldsAfter()
        },
        handleCommand(val, node) {
          const index = this.fields.findIndex(
            (t) => t.field_name === node.data.field_name,
          )
          this.$refs.tree.remove(node)
          if (val === 'top') {
            const getNode = this.$refs.tree.getNode(this.fields[0]?.id)
            this.$refs.tree.insertBefore(node.data, getNode)
          } else if (val === 'bottom') {
            const getNode = this.$refs.tree.getNode(
              this.fields.slice(-1)?.[0].id,
            )
            this.$refs.tree.insertAfter(node.data, getNode)
          } else if (val === 'prev') {
            const getNode = this.$refs.tree.getNode(this.fields[index - 1]?.id)
            this.$refs.tree.insertBefore(node.data, getNode)
          } else {
            const getNode = this.$refs.tree.getNode(this.fields[index]?.id)
            this.$refs.tree.insertAfter(node.data, getNode)
          }

          this.handleSaveDrop()
        },
        updateFieldsAfter() {
          const fieldsAfter = cloneDeep(this.fields).map((t, i) => {
            return {
              columnPosition: t.columnPosition,
              field_name: t.field_name,
            }
          })
          this.form.setValuesIn('fieldsAfter', fieldsAfter)
        },
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
      },
    }),
  ),
  mapProps({ dataSource: 'options', loading: true }),
)

export default FieldAddDel
