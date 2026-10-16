import { observer } from '@formily/reactive-vue'
import { getOverflowTooltipContent } from '@tap/component/src/base/virtual-list/tooltip-content.mjs'
import { getTooltipPosition } from '@tap/component/src/base/virtual-list/tooltip-position.mjs'
import { FormItem, useField, useForm } from '@tap/form'
import i18n from '@tap/i18n'
import {
  computed,
  defineComponent,
  nextTick,
  reactive,
  ref,
  Teleport,
} from 'vue'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'
import { useDataflowStore } from '../../../stores/dataflow.store'
import { convertSchemaToTreeData } from './util'
import './index.scss'

export const FieldRename = observer(
  defineComponent({
    props: ['loading', 'disabled', 'getFields', 'value'],
    setup(props) {
      const dataflowStore = useDataflowStore()
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
      const transformLoading = computed(() => {
        return dataflowStore.transformLoading
      })
      const searchFiledName = ref('')
      const renameDrafts = reactive(new Map())
      const overflowTooltip = ref(null)
      const tooltipCell = ref(null)
      const tooltipContent = ref('')
      const tooltipPosition = ref({
        top: '0px',
        left: '0px',
        visibility: 'hidden',
      })
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
        const ops = fieldModel.value.filter(
          (v) => v.field === field && v.op === 'RENAME',
        )
        return ops && ops.length > 0
      }

      const isReset = (field) => {
        const ops = fieldModel.value.filter(
          (v) => v.field === field && v.op === 'RENAME' && v.reset,
        )
        return ops && ops.length > 0
      }
      const firstReset = (field) => {
        const ops = fieldModel.value.filter(
          (v) => v.field === field && v.op === 'RENAME' && v.firstReset,
        )
        return ops && ops.length > 0
      }
      const checkOps = (fields) => {
        //查找是否有被删除的字段且operation有操作
        if (fieldModel.value?.length > 0 && fields?.length > 0) {
          for (let i = 0; i < fieldModel.value.length; i++) {
            const item = fieldModel.value[i]

            if (!item) return fields

            const targetIndex = fields.findIndex(
              (n) => n.previousFieldName === item.field,
            )

            if (targetIndex === -1) {
              continue
            }

            if (item.op === 'RENAME') {
              const name = fields[targetIndex].field_name
              const newName = name.split('.')
              newName[newName.length - 1] = item.operand
              const newNameStr = newName.join('.')
              fields[targetIndex].field_name = newNameStr

              // change children field name
              fields.forEach((field) => {
                if (field?.field_name?.startsWith(`${name}.`)) {
                  field.field_name =
                    newNameStr + field.field_name.slice(name.length)
                }
              })
            }
          }
        }
        return fields
      }

      const handleRename = (node, data, first) => {
        const existsName = handleExistsName(node, data)
        if (existsName) {
          data.field_name = data.field
          return
        }
        const ops = fieldModel.value.filter(
          (v) => v.field === data.previousFieldName && v.op === 'RENAME',
        )
        if (data.field_name === data.field) {
          const index = fieldModel.value.findIndex(
            (v) => v.field === data.previousFieldName && v.op === 'RENAME',
          )
          if (index !== -1) fieldModel.value.splice(index, 1)
          return
        }
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
            reset: !!form.values.fieldsNameTransform,
            firstReset: first || false,
          }
          fieldModel.value.push(op)
        } else {
          op = ops[0]
          op.operand = data.field_name
          op.field_name = data.field_name
          op.reset = false
        }
      }
      const handleExistsName = (node, data) => {
        // 改名前查找同级中是否重名，若有则return且还原改动并提示
        let exist = false
        if (node && node.parent && node.parent.childNodes) {
          const parentNode = node.parent.childNodes.filter(
            (v) => data.field_name === v.data.field_name,
          )
          if (parentNode && parentNode.length === 2) {
            ElMessage.error(
              data.field_name + i18n.t('packages_form_message_exists_name'),
            )
            exist = true
          }
        }
        return exist
      }
      const handleReset = (node, data) => {
        if (
          form.values.fieldsNameTransform &&
          !firstReset(data.previousFieldName)
        ) {
          //所有字段批量修改过，撤回既是保持原来字段名 且第一次重置
          handleRename(node, data, true)
          return
        }
        const fieldName = data.previousFieldName
        fieldModel.setValue(
          fieldModel.value.filter(
            (operation) =>
              operation.op !== 'RENAME' ||
              (operation.field !== fieldName &&
                !operation.field.startsWith(`${fieldName}.`)),
          ),
        )
        for (const draftFieldName of renameDrafts.keys()) {
          if (
            draftFieldName === fieldName ||
            draftFieldName.startsWith(`${fieldName}.`)
          ) {
            renameDrafts.delete(draftFieldName)
          }
        }
      }
      const getParentFieldName = (node) => {
        let fieldName =
          node.data && node.data.field_name ? node.data.field_name : ''
        if (node.level > 1 && node.parent && node.parent.data) {
          const parentFieldName = getParentFieldName(node.parent)
          if (parentFieldName) fieldName = `${parentFieldName}.${fieldName}`
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
        renameDrafts.clear()
        form.setValuesIn('fieldsNameTransform', '')
      }

      const handleTooltipEnter = (event) => {
        if (props.disabled) {
          handleTooltipLeave()
          return
        }

        const cell = event.currentTarget
        const content = getOverflowTooltipContent(cell)
        if (!content) {
          handleTooltipLeave()
          return
        }

        tooltipCell.value = cell
        tooltipPosition.value = {
          ...tooltipPosition.value,
          visibility: 'hidden',
        }
        tooltipContent.value = content
        nextTick(() => {
          if (tooltipCell.value !== cell || !overflowTooltip.value) return

          tooltipPosition.value = getTooltipPosition(
            cell.getBoundingClientRect(),
            overflowTooltip.value.getBoundingClientRect(),
            { width: window.innerWidth, height: window.innerHeight },
          )
        })
      }

      const handleTooltipLeave = () => {
        tooltipCell.value = null
        tooltipContent.value = ''
      }

      const filterTree = (items, search) => {
        if (!search) return items
        return items.reduce((matches, item) => {
          const children = filterTree(item.children || [], search)
          const ownText = `${item.field || ''} ${item.field_name || ''} ${item.previousFieldName || ''}`.toLowerCase()
          if (ownText.includes(search) || children.length) {
            matches.push({ ...item, children })
          }
          return matches
        }, [])
      }

      loadFields()
      useAfterTaskSaved(formRef.value.values.$inputs, loadFields)

      return () => {
        let fields = (options.value || []).map((field) => ({ ...field }))
        fields = convertSchemaToTreeData(fields) || [] //将模型转换成tree
        fields = checkOps(fields) || []
        const search = searchFiledName.value.trim()
        fields = filterTree(fields, search.toLowerCase())

        //初始化
        const formValues = form.values
        const fieldsNameTransforms = formValues?.fieldsNameTransform || ''

        return (
          <div
            class="field-processors-tree-warp bg-body"
            v-loading={props.loading}
          >
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
                    {i18n.t(
                      'packages_form_field_rename_index_mubiaoziduanming',
                    )}
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
                      <span class="flex-1 ellipsis pl-6 font-color-light">
                        {data.field}
                      </span>
                      <span class="flex-1 ellipsis color-primary">
                        <span class="text__inner">{data.operand}</span>
                      </span>
                      <span class="field-ops mr-4">
                        <ElButton
                          disabled={props.disabled || transformLoading.value}
                          text
                          class="ml-5"
                          onClick={() =>
                            removeInvalidOperation(data.field, index)
                          }
                        >
                          <VIcon size="16">delete</VIcon>
                        </ElButton>
                      </span>
                    </div>
                  )
                })}
              </FormItem.BaseItem>
            )}
            <FormItem.BaseItem
              label={i18n.t(
                'packages_form_field_processor_filed_name_daxiaoxie',
              )}
            >
              <ElSelect
                modelValue={capitalized.value}
                disabled={props.disabled || transformLoading.value}
                onChange={(val) => {
                  changeCapitalized(val)
                }}
              >
                <ElOption
                  value=""
                  label={i18n.t('packages_form_field_processor_index_bubian')}
                />
                <ElOption
                  value="toUpperCase"
                  label={i18n.t('packages_form_field_processor_index_daxie')}
                />
                <ElOption
                  value="toLowerCase"
                  label={i18n.t('packages_form_field_processor_index_xiaoxie')}
                />
                <ElOption
                  value="toCamelCase"
                  label={i18n.t(
                    'packages_form_field_processor_index_snake_to_camel',
                  )}
                />
                <ElOption
                  value="toSnakeCase"
                  label={i18n.t(
                    'packages_form_field_processor_index_camel_to_snake',
                  )}
                />
              </ElSelect>
            </FormItem.BaseItem>

            <div class="field-rename-search-row flex p-2 px-0">
              <ElInput
                class="field-rename-search"
                placeholder={i18n.t(
                  'packages_form_field_mapping_list_qingshuruziduan',
                )}
                modelValue={searchFiledName.value}
                onInput={(val) => {
                  handleTooltipLeave()
                  searchFiledName.value = val
                }}
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
            </div>

            <div class="field-rename-table bg-light dark:bg-white/5 rounded-xl p-1 pt-0">
              <div class="field-tree-header flex align-center gap-2 pr-2 py-1 fs-7 font-color-light">
                <span class="field-rename-index-column flex align-center justify-content-center" />
                <span class="field-rename-name-column text inline-block">
                  {i18n.t('packages_form_dag_dialog_field_mapping_field')}
                </span>
                <span class="field-rename-target-column text inline-block">
                  {i18n.t('packages_form_field_processor_index_xinziduanming')}
                </span>
                <span class="field-rename-action-column flex align-center justify-content-center">
                  <ElTooltip
                    content={i18n.t('public_button_reset')}
                    placement="top"
                    enterable={false}
                    hideAfter={0}
                    disabled={props.disabled || transformLoading.value || (!fieldModel.value.length && !fieldsNameTransforms)}
                  >
                    <ElButton
                      text
                      type="primary"
                      class="field-rename-reset-button"
                      aria-label={i18n.t('public_button_reset')}
                      disabled={props.disabled || transformLoading.value || (!fieldModel.value.length && !fieldsNameTransforms)}
                      onClick={() => handleAllReset()}
                    >
                      <i-lucide-rotate-ccw class="field-rename-reset-icon" />
                    </ElButton>
                  </ElTooltip>
                </span>
              </div>
              <ElTree
                data={fields}
                node-key="id"
                default-expand-all={true}
                // show-checkbox={true}
                expand-on-click-node={false}
                indent={0}
                class={[
                  'field-rename-tree rounded-xl',
                  { 'is-disabled': props.disabled },
                ]}
                style="border: 1px solid #f2f4f7; --btn-space: 0"
                onScroll={handleTooltipLeave}
              >
                {{
                  default: ({ node, data }) => (
                    <span class="field-tree-node field-rename-row flex align-center gap-2 pr-2">
                      <span class="field-rename-index-column font-color-light text-center flex align-center justify-content-center">
                        {data.fieldIndex}
                      </span>
                      <span
                        class="field-rename-name-column field-rename-source text__inner inline-block"
                        onMouseenter={handleTooltipEnter}
                        onMouseleave={handleTooltipLeave}
                      >
                        <span
                          class="field-rename-tooltip-text"
                          data-tooltip-content
                        >
                          {data.field}
                        </span>
                        {data.primary_key_position > 0 ? (
                          <VIcon size="12" class="text-warning">
                            key
                          </VIcon>
                        ) : (
                          ''
                        )}
                      </span>
                      <span
                        class="field-rename-target-column tree-field-input-wrap inline-block"
                        onMouseenter={handleTooltipEnter}
                        onMouseleave={handleTooltipLeave}
                      >
                        {data.level === 1 && !data.children?.length ? (
                          props.disabled ? (
                            <span class="field-rename-readonly-name">
                              {data.field_name}
                            </span>
                          ) : (
                            <ElInput
                              class={[
                                'tree-field-input field-rename-input',
                                {
                                  'tree-field-input-primary':
                                    data.field_name !== data.field,
                                },
                              ]}
                              modelValue={
                                renameDrafts.get(data.previousFieldName) ??
                                data.field_name
                              }
                              disabled={transformLoading.value}
                              onInput={(value) =>
                                renameDrafts.set(data.previousFieldName, value)
                              }
                              onChange={(value) => {
                                const val = value?.trim()
                                if (val) {
                                  data.field_name = val
                                  handleRename(node, data)
                                }
                                renameDrafts.delete(data.previousFieldName)
                              }}
                              onKeydown={(event) => {
                                if (event.key === 'Enter') event.target.blur()
                              }}
                            />
                          )
                        ) : (
                          <span
                            class="field-rename-readonly-name field-rename-tooltip-text"
                            data-tooltip-content
                          >
                            {data.field_name}
                          </span>
                        )}
                      </span>
                      <span class="field-rename-action-column flex align-center justify-content-center">
                        <ElTooltip
                          content={i18n.t('public_button_reset')}
                          placement="top"
                          enterable={false}
                          hideAfter={0}
                          disabled={
                            (fieldsNameTransforms === '' &&
                              !isRename(data.previousFieldName)) ||
                            isReset(data.previousFieldName) ||
                            props.disabled ||
                            transformLoading.value
                          }
                        >
                          <ElButton
                            text
                            type="primary"
                            class="field-rename-reset-button"
                            aria-label={i18n.t('public_button_reset')}
                            disabled={
                              (fieldsNameTransforms === '' &&
                                !isRename(data.previousFieldName)) ||
                              isReset(data.previousFieldName) ||
                              props.disabled ||
                              transformLoading.value
                            }
                            onClick={() => handleReset(node, data)}
                          >
                            <i-lucide-undo-2 class="field-rename-reset-icon" />
                          </ElButton>
                        </ElTooltip>
                      </span>
                    </span>
                  ),
                }}
              </ElTree>
              <Teleport to="body">
                {!props.disabled && tooltipContent.value && (
                  <div
                    ref={overflowTooltip}
                    class="field-rename-tooltip"
                    style={tooltipPosition.value}
                    role="tooltip"
                  >
                    {tooltipContent.value}
                  </div>
                )}
              </Teleport>
            </div>
          </div>
        )
      }
    },
  }),
)

export default FieldRename
