import { connect, mapProps, useForm } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'
import VIcon from 'web-core/components/VIcon'
import { convertSchemaToTreeData } from '../field-rename/util'
import '../field-rename/index.scss'
// import de from 'element-ui/src/locale/lang/de'

export const FieldModType = connect(
  observer(
    defineComponent({
      props: ['loading', 'options'],

      setup() {
        const formRef = useForm()
        const form = formRef.value
        return {
          databaseType: form.values.databaseType,
          operations: form.values.operations,
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
          /*字段处理器支持功能类型*/
          CONVERT_OPS_TPL: {
            id: '',
            op: 'CONVERT',
            field: '',
            operand: '',
            originalDataType: ''
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
        let fields = this.options || []
        fields = convertSchemaToTreeData(fields) || [] //将模型转换成tree
        fields = this.checkOps(fields)
        this.fields = fields
        this.originalFields = JSON.parse(JSON.stringify(fields))
        return (
          <div class="field-processors-tree-warp bg-body pt-2 pb-5" v-loading={this.loading}>
            <div class="field-processor-operation flex">
              <ElCheckbox class="check-all" v-model={this.checkAll} onChange={() => this.handleCheckAllChange()} />
              <span class="flex-1 text inline-block">字段名称</span>
              <span class="flex-1 text inline-block">源字段类型</span>
              <span class="field-type text inline-block">目标字段类型</span>
              <span class="field-ops inline-block ml-10">
                <VIcon class="clickable ml-5" size="12" small onClick={() => this.handleAllReset()}>
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
                show-checkbox={true}
                expand-on-click-node={false}
                class="field-processor-tree"
                scopedSlots={{
                  default: ({ node, data }) => (
                    <span
                      class="tree-node flex flex-1 justify-content-center align-items flex-row"
                      slot-scope="{ node, data }"
                    >
                      <span class="flex-1 inline-block">{data.field_name}</span>
                      <span class="flex-1 inline-block">{data.type}</span>
                      <ElSelect
                        v-model={data.java_type}
                        class="field-type inline-block"
                        size="mini"
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
                          disabled={!this.isConvertDataType(data.id)}
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
        isConvertDataType(id) {
          let ops = this.operations.filter(v => v.id === id && v.op === 'CONVERT')
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
        checkOps(fields) {
          if (this.operations?.length > 0 && fields?.length > 0) {
            for (let i = 0; i < this.operations.length; i++) {
              if (this.operations[i]?.op === 'CONVERT') {
                let targetIndex = fields.findIndex(n => n.id === this.operations[i].id)
                if (targetIndex === -1) return
                fields[targetIndex].java_type = this.operations[i].operand
              }
            }
          }
          return fields
        },
        handleDataType(node, data) {
          console.log('fieldProcessor.handleDataType', node, data) //eslint-disable-line
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
              type: data.type,
              primary_key_position: data.primary_key_position,
              color: data.color,
              label: data.field_name,
              field_name: data.field_name
            })
            this.operations.push(op)
          } else {
            op = ops[0]
            op.java_type = data.java_type
            op.operand = data.java_type
            op.originalDataType = nativeData.original_java_type
          }
        },
        handleReset(node, data) {
          console.log('fieldProcessor.handleReset', node, data) //eslint-disable-line
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
                if (ops.op === 'CONVERT') {
                  if (nativeData) node.data.java_type = nativeData.type
                  self.operations.splice(i, 1)
                  i--
                  continue
                }
              }
            }
          }
          fn(node, data)
          this.checkAll = false
        },
        getParentFieldName(node) {
          let fieldName = node.data && node.data.field_name ? node.data.field_name : ''
          if (node.level > 1 && node.parent && node.parent.data) {
            let parentFieldName = this.getParentFieldName(node.parent)
            if (parentFieldName) fieldName = parentFieldName + '.' + fieldName
          }
          return fieldName
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
          if (this.checkAll) {
            this.$nextTick(() => {
              this.$refs.tree.setCheckedNodes(this.fields)
            })
          } else {
            this.$nextTick(() => {
              this.$refs.tree.setCheckedKeys([])
            })
          }
        }
      }
    })
  ),
  mapProps({ dataSource: 'options', loading: true })
)

export default FieldModType
