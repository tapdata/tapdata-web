import { observer } from '@formily/reactive-vue'
import { IconButton, VIcon } from '@tap/component'
import { useField, useForm } from '@tap/form'
import i18n from '@tap/i18n'
import { defineComponent, ref } from 'vue'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'
import { convertSchemaToTreeData } from '../field-rename/util'
import '../field-rename/index.scss'
// import de from 'element-ui/src/locale/lang/de'

export const FieldModType = observer(
  defineComponent({
    props: ['loading', 'disabled', 'getFields'],

    setup(props) {
      const formRef = useForm()
      const form = formRef.value
      const fieldRef = useField()

      let fieldMap = {}
      const options = ref([])
      const invalidOperations = ref([])
      const loadFields = async () => {
        if (!form?.values?.$inputs?.length) {
          fieldMap = {}
          options.value = []
          invalidOperations.value = []
          return
        }

        const fields = await props.getFields(form?.values.id)
        options.value = fields.filter((item) => !item.is_deleted)
        fieldMap = options.value.reduce((map, field) => {
          map[field.previousFieldName] = true
          return map
        }, {})
        invalidOperations.value = fieldRef.value.value.filter((op) => {
          return !fieldMap[op.field]
        })
      }

      loadFields()
      useAfterTaskSaved(formRef.value.values.$inputs, loadFields)

      return {
        options,
        databaseType: form.values.databaseType,
        operations: form.values.operations,
        form,
      }
    },

    data() {
      return {
        nodeKey: '',
        searchFiledName: '',
        selectList: [
          {
            label: 'String',
            value: 'String',
          },
          {
            label: 'Date',
            value: 'Date',
          },
          {
            label: 'Double',
            value: 'Double',
          },
          {
            label: 'Float',
            value: 'Float',
          },
          {
            label: 'BigDecimal',
            value: 'BigDecimal',
          },
          {
            label: 'Long',
            value: 'Long',
          },
          {
            label: 'Map',
            value: 'Map',
          },
          {
            label: 'Array',
            value: 'Array',
          },
        ],
        originalFields: [],
        checkAll: false,
        /*字段处理器支持功能类型*/
        CONVERT_OPS_TPL: {
          id: '',
          op: 'CONVERT',
          field: '',
          operand: '',
          originalDataType: '',
        },
      }
    },
    watch: {
      operations: {
        deep: true,
        handler(v) {
          this.$emit('change', v)
        },
      },
    },

    render() {
      let fields = this.options || []
      fields = fields.filter((item) => !item.is_deleted)
      fields = convertSchemaToTreeData(fields) || [] //将模型转换成tree
      fields = this.checkOps(fields)
      this.searchFiledName = this.searchFiledName.trim().toString() //去空格
      if (this.searchFiledName !== '') {
        fields = fields.filter((v) => {
          const str = v.label.toLowerCase()
          return str.includes(this.searchFiledName.toLowerCase())
        })
      }
      this.fields = fields
      this.originalFields = JSON.parse(JSON.stringify(fields))
      return (
        <div
          class="field-processors-tree-warp bg-body pt-2 pb-5"
          v-loading={this.loading}
        >
          <ElInput
            class="mb-3"
            placeholder={i18n.t(
              'packages_form_field_mapping_list_qingshuruziduan',
            )}
            v-model={this.searchFiledName}
            prefix-icon={ElIconSearch}
          ></ElInput>
          <div class="field-processor-operation flex">
            <span class="flex-1 text inline-block  ml-6">
              {i18n.t('packages_form_field_add_del_index_ziduanmingcheng')}
            </span>
            <span class="flex-1 text inline-block  ml-10">
              {i18n.t('packages_form_field_mod_type_index_yuanziduanleixing')}
            </span>
            <span class="flex-1 text inline-block pl-11">
              {i18n.t('packages_form_field_mod_type_index_mubiaoziduanlei')}
            </span>
            <span class="flex align-center gap-2 px-2">
              <IconButton
                sm
                disabled={this.disabled}
                onClick={() => this.handleAllReset()}
              >
                revoke
              </IconButton>
            </span>
          </div>
          <div className="field-processors-tree-warp">
            <ElTree
              ref="tree"
              data={fields}
              node-key="id"
              default-expand-all={true}
              expand-on-click-node={false}
              class="field-processor-tree"
            >
              {{
                default: ({ node, data }) => (
                  <span
                    class="tree-node flex flex-1 justify-content-center align-items flex-row"
                    slot-scope="{ node, data }"
                  >
                    <span class="flex-1 inline-block ellipsis">
                      {data.field_name}
                      {data.primary_key_position > 0 ? (
                        <VIcon size="12" class="text-warning ml-1">
                          key
                        </VIcon>
                      ) : (
                        ''
                      )}
                    </span>
                    <span class="flex-1 inline-block">{data.type}</span>
                    <ElSelect
                      v-model={data.data_type}
                      class="flex-1 inline-block"
                      disabled={this.disabled}
                      onChange={() => this.handleDataType(node, data)}
                    >
                      {this.selectList.map((op) => (
                        <ElOption
                          label={op.label}
                          value={op.value}
                          key={op.value}
                        />
                      ))}
                    </ElSelect>
                    <span class="flex align-center gap-2 px-2">
                      <IconButton
                        sm
                        disabled={
                          !this.isConvertDataType(data.previousFieldName) ||
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
      )
    },
    methods: {
      isConvertDataType(field) {
        const ops = this.operations.filter(
          (v) => v.field === field && v.op === 'CONVERT',
        )
        return ops && ops.length > 0
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
      checkOps(fields) {
        if (this.operations?.length > 0 && fields?.length > 0) {
          for (let i = 0; i < this.operations.length; i++) {
            if (this.operations[i]?.op === 'CONVERT') {
              const targetIndex = fields.findIndex(
                (n) => n.field === this.operations[i].field,
              )
              if (targetIndex === -1) {
                continue
              }
              fields[targetIndex].data_type = this.operations[i].operand
            }
          }
        }
        return fields
      },
      handleInput(val) {
        this.searchFiledName = val
      },
      handleDataType(node, data) {
        console.log('fieldProcessor.handleDataType', node, data) //eslint-disable-line
        const nativeData = this.getNativeData(data.id)
        const ops = this.operations.filter(
          (v) =>
            v.field ===
              data.previousFieldName /*|| data?.oldIdList.findIndex(t => t === v.id) > -1*/ &&
            v.op === 'CONVERT',
        )
        let op
        if (ops.length === 0) {
          op = Object.assign(JSON.parse(JSON.stringify(this.CONVERT_OPS_TPL)), {
            id: data.id,
            field: data.previousFieldName,
            operand: data.data_type,
            originalDataType: data.previousDataType,
            table_name: data.table_name,
            type: data.type,
            primary_key_position: data.primary_key_position,
            color: data.color,
            label: data.field_name,
            field_name: data.field_name,
          })
          this.operations.push(op)
        } else {
          op = ops[0]
          op.data_type = data.data_type
          op.operand = data.data_type
          op.originalDataType = data.previousDataType
        }
      },
      handleReset(node, data) {
        console.log('fieldProcessor.handleReset', node, data) //eslint-disable-line
        const self = this
        const fn = function (node, data) {
          const nativeData = self.getNativeData(data.id)
          for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes[i]
            fn(childNode, childNode.data)
          }
          for (let i = 0; i < self.operations.length; i++) {
            if (self.operations[i].field === data.field) {
              const ops = self.operations[i]
              if (ops.op === 'CONVERT') {
                if (nativeData) node.data.data_type = data.previousDataType
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
        let fieldName =
          node.data && node.data.field_name ? node.data.field_name : ''
        if (node.level > 1 && node.parent && node.parent.data) {
          const parentFieldName = this.getParentFieldName(node.parent)
          if (parentFieldName) fieldName = `${parentFieldName}.${fieldName}`
        }
        return fieldName
      },
      handleAllReset() {
        this.operations.splice(0)
      },
    },
  }),
)

export default FieldModType
