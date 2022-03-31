import { connect, mapProps, useForm } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'
import VIcon from 'web-core/components/VIcon'
import { convertSchemaToTreeData, uuid } from '../field-rename/util'
import '../field-rename/fieldProessor.scss'
// import de from 'element-ui/src/locale/lang/de'

export const FieldAddDel = connect(
  observer(
    defineComponent({
      props: ['loading', 'options'],

      setup() {
        const formRef = useForm()
        const form = formRef.value
        return {
          databaseType: form.values.databaseType,
          operations: form.values.operations || [],
          form
        }
      },

      data() {
        return {
          nodeKey: '',
          originalFields: [],
          checkAll: false,
          firstId: '',
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
            java_type: 'String',
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
        let fields = this.options?.[0] || []
        this.originalFields = JSON.parse(JSON.stringify(fields))
        fields = convertSchemaToTreeData(fields) || [] //将模型转换成tree
        this.fields = fields
        this.firstId = fields[0]?.id || ''
        return (
          <div class="field-processor-tree-warp bg-body pt-2 pb-5">
            <div class="field-processor-operation flex">
              <ElCheckbox class="check-all mr-4" v-model={this.checkAll} onChange={() => this.handleCheckAllChange()} />
              <span class="field-name inline-block">字段名称</span>
              <span class="field-ops inline-block">
                <VIcon class="clickable ml-5" small onClick={() => this.handleAllDelete()}>
                  delete
                </VIcon>
                <VIcon class="clickable ml-5" small onClick={() => this.handleAllReset()}>
                  revoke
                </VIcon>
                <VIcon class="clickable ml-5" small disabled={fields.length === 0} onClick={() => this.handleCreate()}>
                  add
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
                expand-on-click-node={false}
                class="field-processor-tree"
                scopedSlots={{
                  default: ({ node, data }) => (
                    <span
                      class={['tree-node', 'flex flex-1', 'justify-content-center', 'align-items', 'flex-row']}
                      slot-scope="{ node, data }"
                    >
                      <span
                        class={[
                          'inline-block',
                          'field-name',
                          this.isCreate(data.id) ? 'active__name' : '',
                          this.isRemove(data.id) ? 'active__delete' : ''
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
                      <span class="e-ops">
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
          let ops = this.operations.filter(v => v.id === id && v.op === 'REMOVE')
          return ops && ops.length > 0
        },
        isCreate(id) {
          let ops = this.operations.filter(v => v.id === id && v.op === 'CREATE')
          return ops && ops.length > 0
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
        handleCreate() {
          console.log('fieldProcessor.handleCreate') //eslint-disable-line
          let fieldId = uuid()
          let newFieldOperation = Object.assign(JSON.parse(JSON.stringify(this.CREATE_OPS_TPL)), {
            field: 'newFieldName',
            tableName: '',
            java_type: 'String',
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
            table_name: '',
            field_name: 'newFieldName'
          }
          let node = this.$refs.tree.getNode(this.firstId)
          let existsName = this.handleExistsName(node)
          if (existsName) return
          this.$refs.tree.insertBefore(newNodeData, node)
        },
        handleExistsName(node) {
          // 改名前查找同级中是否重名，若有则return且还原改动并提示
          let exist = false
          if (node && node.parent && node.parent.childNodes) {
            let parentNode = node.parent.childNodes.filter(v => 'newFieldName' === v.data.field_name)
            if (parentNode && parentNode.length === 1) {
              this.$message.error('newFieldName' + this.$t('message.exists_name'))
              exist = true
            }
          }
          return exist
        },
        handleDelete(node, data) {
          console.log('fieldProcessor.handleDelete', node, data) // eslint-disable-line
          let originalField = this.getNativeData(data.id)
          let self = this
          self.operations = self.operations || []
          let fn = function (field) {
            let ops = self.operations.filter(v => v.op === 'REMOVE' && v.id === field.id)
            let op
            if (ops.length === 0) {
              op = Object.assign(JSON.parse(JSON.stringify(self.REMOVE_OPS_TPL)), {
                id: field.id,
                field: field.original_field_name,
                operand: true,
                table_name: field.table_name,
                type: field.java_type,
                primary_key_position: field.primary_key_position,
                color: field.color,
                label: field.field_name,
                field_name: field.field_name
              })
              self.operations.push(op)
            }

            if (field.children) {
              field.children.forEach(fn)
            }
          }
          if (originalField) fn(originalField)
          console.log('fieldProcessor.handleDelete', self.operations) // eslint-disable-line
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
          if (!this.checkAll) {
            this.$refs.tree.setCheckedNodes(this.fields)
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

export default FieldAddDel
