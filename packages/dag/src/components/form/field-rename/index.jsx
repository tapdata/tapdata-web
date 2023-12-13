import i18n from '@tap/i18n'
import { connect, mapProps, useForm, useField, FormItem } from '@tap/form'
import { observer } from '@formily/reactive-vue'
import { defineComponent, ref, computed } from 'vue'
import { VIcon } from '@tap/component'
import { convertSchemaToTreeData } from './util'
import './index.scss'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'
import { useStore } from 'vuex'

export const FieldRename = observer(
  defineComponent({
    props: ['loading', 'disabled', 'getFields', 'value'],
    setup(props) {
      const store = useStore()
      const formRef = useForm()
      const fieldRef = useField()
      const fieldModel = fieldRef.value
      const form = formRef.value
      const options = ref([])
      const invalidOperations = ref([])
      let fieldMap = {}
      const RENAME_OPS_TPL = {
        id: '',
        op: 'RENAME',
        field: '',
        operand: '',
      }
      const loadFields = async () => {
        if (!form?.values?.$inputs?.length) {
          fieldMap = {}
          options.value = []
          invalidOperations.value = []
          return
        }

        let fields = await props.getFields(form?.values.id)
        options.value = fields.filter((item) => !item.is_deleted)
        fieldMap = options.value.reduce((map, field) => {
          map[field.previousFieldName] = true
          return map
        }, {})
        invalidOperations.value = fieldRef.value.value.filter((op) => {
          return !fieldMap[op.field]
        })
      }
      const transformLoading = computed(() => {
        return store.state.dataflow.transformLoading
      })
      const searchFiledName = ref('')
      const capitalized = ref('') // 字段名处理
      capitalized.value = form.values.fieldsNameTransform || ''

      // 删除所有无效的操作
      const removeAllInvalidOperations = () => {
        invalidOperations.value.splice(0)
        fieldModel.setValue(
          fieldModel.value.filter((op) => {
            return fieldMap[op.field]
          }),
        )
      }
      // 删除单个无效的操作
      const removeInvalidOperation = (field, i) => {
        invalidOperations.value.splice(i, 1)
        fieldModel.value.findIndex((op, index) => {
          if (op.field === field) {
            fieldModel.value.splice(index, 1)
            return true
          }
        })
      }

      const isRename = (field) => {
        let ops = fieldModel.value.filter((v) => v.field === field && v.op === 'RENAME')
        return ops && ops.length > 0
      }

      const isReset = (field) => {
        let ops = fieldModel.value.filter((v) => v.field === field && v.op === 'RENAME' && v.reset)
        return ops && ops.length > 0
      }
      const firstReset = (field) => {
        let ops = fieldModel.value.filter((v) => v.field === field && v.op === 'RENAME' && v.firstReset)
        return ops && ops.length > 0
      }
      const checkOps = (fields) => {
        //查找是否有被删除的字段且operation有操作
        if (fieldModel.value?.length > 0 && fields?.length > 0) {
          for (let i = 0; i < fieldModel.value.length; i++) {
            let item = fieldModel.value[i]

            if (!item) return fields

            let targetIndex = fields.findIndex((n) => n.previousFieldName === item.field)

            if (targetIndex === -1) {
              continue
            }

            if (item.op === 'RENAME') {
              const name = fields[targetIndex].field_name
              let newName = name.split('.')
              newName[newName.length - 1] = item.operand
              const newNameStr = newName.join('.')
              fields[targetIndex].field_name = newNameStr

              // change children field name
              fields.forEach((field) => {
                if (field?.field_name?.startsWith(name + '.')) {
                  field.field_name = newNameStr + field.field_name.substring(name.length)
                }
              })
            }
          }
        }
        return fields
      }

      const handleRename = (node, data, first) => {
        let existsName = handleExistsName(node, data)
        if (existsName) {
          data.field_name = data.previousFieldName
          return
        }
        //eslint-disable-next-line
        console.log('fieldProcessor.handlerRename(node,data,nativeData,operations', node, data, fieldModel.value)
        let ops = fieldModel.value.filter((v) => v.field === data.previousFieldName && v.op === 'RENAME')
        let op
        if (ops.length === 0) {
          op = {
            ...RENAME_OPS_TPL,
            id: data.id,
            field: data.previousFieldName,
            operand: data.field_name,
            table_name: data.table_name,
            type: data.type,
            primary_key_position: data.primary_key_position,
            field_name: data.field_name,
            reset: form.values.fieldsNameTransforms !== '',
            firstReset: first || false,
          }
          fieldModel.value.push(op)
        } else {
          op = ops[0]
          if (data.field_name === data.previousFieldName) {
            //再次改名跟原来名字一样 删除当前operation 记录
            let index = fieldModel.value.findIndex((v) => v.field === data.previousFieldName && v.op === 'RENAME')
            fieldModel.value.splice(index, 1)
          } else {
            op.operand = data.field_name
            op.field_name = data.field_name
            op.reset = false
          }
        }
        // this.$forceUpdate()
        console.log(fieldModel.value) //eslint-disable-line
      }
      const handleExistsName = (node, data) => {
        // 改名前查找同级中是否重名，若有则return且还原改动并提示
        let exist = false
        if (node && node.parent && node.parent.childNodes) {
          let parentNode = node.parent.childNodes.filter((v) => data.field_name === v.data.field_name)
          if (parentNode && parentNode.length === 2) {
            ElMessage.error(data.field_name + i18n.t('packages_form_message_exists_name'))
            exist = true
          }
        }
        return exist
      }
      const handleReset = (node, data) => {
        if (form.values.fieldsNameTransforms !== '' && !firstReset(data.previousFieldName)) {
          //所有字段批量修改过，撤回既是保持原来字段名 且第一次重置
          handleRename(node, data, true)
          return
        }
        console.log('fieldProcessor.handleReset', node, data) //eslint-disable-line
        let dataLabel = JSON.parse(JSON.stringify(data.field_name))
        let self = this
        let fn = function (node, data) {
          for (let i = 0; i < node.childNodes.length; i++) {
            let childNode = node.childNodes[i]
            fn(childNode, childNode.data)
          }
          for (let i = 0; i < self.operations.length; i++) {
            if (self.operations[i].field === data.previousFieldName) {
              let ops = self.operations[i]
              if (ops.op === 'RENAME') {
                let existsName = self.handleExistsName(node, data)
                if (existsName) {
                  return
                }
                node.data.field_name = node.data.previousFieldName
                self.operations.splice(i, 1)
                i--
                continue
              }
            }
          }
        }
        fn(node, data)
        let existsName = handleExistsName(node, data)
        if (existsName) {
          data.field_name = dataLabel
        }
      }
      const getParentFieldName = (node) => {
        let fieldName = node.data && node.data.field_name ? node.data.field_name : ''
        if (node.level > 1 && node.parent && node.parent.data) {
          let parentFieldName = getParentFieldName(node.parent)
          if (parentFieldName) fieldName = parentFieldName + '.' + fieldName
        }
        return fieldName
      }
      const changeCapitalized = (val) => {
        capitalized.value = val
        form.setValuesIn('fieldsNameTransform', val)
      }
      const handleAllReset = () => {
        //清掉所有operations 撤回不变
        fieldModel.value.splice(0)
        form.setValuesIn('fieldsNameTransform', '')
      }

      loadFields()
      useAfterTaskSaved(formRef.value.values.$inputs, loadFields)

      return () => {
        let fields = options.value || []
        fields = convertSchemaToTreeData(fields) || [] //将模型转换成tree
        fields = checkOps(fields) || []
        let search = searchFiledName.value.trim()

        if (search !== '') {
          fields = fields.filter((v) => {
            let str = v.label.toLowerCase()
            return str.indexOf(search.toLowerCase()) > -1
          })
        }

        //初始化
        let formValues = form.values
        let fieldsNameTransforms = formValues?.fieldsNameTransform || ''

        return (
          <div class="field-processors-tree-warp bg-body" v-loading={props.loading}>
            {fields.length > 0 && invalidOperations.value.length > 0 && (
              <FormItem.BaseItem
                label={
                  <span class="px-4 flex align-center">
                    <VIcon size={16} class="color-warning mr-1">
                      info
                    </VIcon>
                    {i18n.t('packages_dag_field_rename_index_yixiacaozuoyi')}
                  </span>
                }
                class="invalid-operations-wrap my-2 border rounded-4 overflow-hidden bg-subtle"
              >
                <div class="flex">
                  <span class="flex-1 text inline-block ml-6">
                    {i18n.t('packages_form_field_rename_index_yuanziduanming')}
                  </span>
                  <span class="flex-1 text inline-block">
                    {i18n.t('packages_form_field_rename_index_mubiaoziduanming')}
                  </span>
                  <span class="field-ops inline-block mr-4">
                    <ElButton
                      disabled={props.disabled || transformLoading.value}
                      text
                      onClick={() => removeAllInvalidOperations()}
                    >
                      <VIcon size="16">delete</VIcon>
                    </ElButton>
                  </span>
                </div>
                {invalidOperations.value.map((data, index) => {
                  return (
                    <div class="flex align-center">
                      <span class="flex-1 ellipsis pl-6 font-color-light">{data.field}</span>
                      <span class="flex-1  ellipsis color-primary">
                        <span class="text__inner">{data.operand}</span>
                      </span>
                      <span class="field-ops mr-4">
                        <ElButton
                          disabled={props.disabled || transformLoading.value}
                          text
                          class="ml-5"
                          onClick={() => removeInvalidOperation(data.field, index)}
                        >
                          <VIcon size="16">delete</VIcon>
                        </ElButton>
                      </span>
                    </div>
                  )
                })}
              </FormItem.BaseItem>
            )}
            <FormItem.BaseItem label={i18n.t('packages_form_field_processor_filed_name_daxiaoxie')}>
              <ElSelect
                value={capitalized.value}
                disabled={props.disabled || transformLoading.value}
                onChange={(val) => {
                  changeCapitalized(val)
                }}
                class="w-auto"
              >
                <ElOption value="" label={i18n.t('packages_form_field_processor_index_bubian')} />
                <ElOption value="toUpperCase" label={i18n.t('packages_form_field_processor_index_daxie')} />
                <ElOption value="toLowerCase" label={i18n.t('packages_form_field_processor_index_xiaoxie')} />
                <ElOption value="toCamelCase" label={i18n.t('packages_form_field_processor_index_snake_to_camel')} />
                <ElOption value="toSnakeCase" label={i18n.t('packages_form_field_processor_index_camel_to_snake')} />
              </ElSelect>
            </FormItem.BaseItem>

            <ElInput
              class="my-2"
              placeholder={i18n.t('packages_form_field_mapping_list_qingshuruziduan')}
              value={searchFiledName.value}
              onInput={(val) => {
                searchFiledName.value = val
              }}
              clearable
              prefix-icon="el-icon-search"
            />

            <div class="border rounded-4 overflow-hidden">
              <div class="field-processor-operation flex">
                <span class="flex-1 text inline-block ml-6">
                  {i18n.t('packages_form_field_rename_index_yuanziduanming')}
                </span>
                <span class="flex-1 text inline-block">
                  {i18n.t('packages_form_field_rename_index_mubiaoziduanming')}
                </span>
                <span class="field-ops  inline-block mr-4">
                  <VIcon
                    class={[props.disabled || transformLoading.value ? 'disable__btn' : 'clickable', 'ml-5']}
                    size="12"
                    disabled={props.disabled || transformLoading.value}
                    onClick={() => handleAllReset()}
                  >
                    revoke
                  </VIcon>
                </span>
              </div>
              <div class="field-processors-tree-warp">
                <ElTree
                  ref="tree"
                  data={fields}
                  node-key="id"
                  default-expand-all={true}
                  // show-checkbox={true}
                  expand-on-click-node={false}
                  class="field-processor-tree"
                >
                  {{
                    default: ({ node, data }) => (
                      <span class="tree-node flex flex-1 justify-content-center align-items flex-row overflow-hidden">
                        <span class="flex-1 text__inner inline-block ellipsis">
                          {data.field}
                          {data.primary_key_position > 0 ? (
                            <VIcon size="12" class="text-warning ml-1">
                              key
                            </VIcon>
                          ) : (
                            ''
                          )}
                        </span>
                        <span class={['tree-field-input-wrap', 'item', 'inline-block', 'e-label', 'ellipsis']}>
                          {data.level === 1 && !data.children?.length ? (
                            <div
                              class={[
                                'el-input el-input--small tree-field-input text__inner',
                                {
                                  'tree-field-input-primary': data.field_name !== data.previousFieldName,
                                  'is-disabled': props.disabled || transformLoading.value,
                                },
                              ]}
                            >
                              <input
                                disabled={props.disabled || transformLoading.value}
                                text
                                autocomplete="off"
                                class="el-input__inner"
                                value={data.field_name}
                                onChange={(event) => {
                                  const val = event.target.value?.trim()
                                  if (val) {
                                    data.field_name = val
                                    handleRename(node, data)
                                  } else {
                                    event.target.value = data.field_name
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <span class="text__inner">{data.field_name}</span>
                          )}
                        </span>
                        <span class="e-ops mr-4">
                          <ElButton
                            text
                            class="ml-5"
                            disabled={
                              (fieldsNameTransforms === '' && !isRename(data.previousFieldName)) ||
                              isReset(data.previousFieldName) ||
                              props.disabled ||
                              transformLoading.value
                            }
                            onClick={() => handleReset(node, data)}
                          >
                            <VIcon size="12">revoke</VIcon>
                          </ElButton>
                        </span>
                      </span>
                    ),
                  }}
                </ElTree>
              </div>
            </div>
          </div>
        )
      }
    },
  }),
)

export default FieldRename
