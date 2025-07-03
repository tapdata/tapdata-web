import { onFieldValueChange } from '@formily/core'
import { observer } from '@formily/reactive-vue'
import { RecursionField, SchemaExpressionScopeSymbol } from '@formily/vue'
import { taskApi } from '@tap/api'
import {
  components,
  createSchemaField,
  FormDialog,
  FormLayout,
  useForm,
  useFormLayout,
} from '@tap/form'
import i18n from '@tap/i18n'
import { configProviderContextKey, ElConfigProvider } from 'element-plus'
import { defineComponent, inject, provide, ref } from 'vue'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'
// import * as _components from '../index'
import {
  FieldRenameProcessor,
  TableListCard,
  TableRename,
  TableSelector,
} from '../index'
import './style.scss'

const { SchemaField } = createSchemaField({
  components: {
    ...components,
    TableRename,
    FieldRenameProcessor,
    TableSelector,
    TableListCard,
  },
})

const TableEditForm = defineComponent({
  props: {
    form: Object,
    scope: Object,
    layout: Object,
    configProvider: Object,
  },
  setup(props) {
    provide(configProviderContextKey, props.configProvider)

    const schema = {
      type: 'object',
      properties: {
        replaceBefore: { type: 'string', 'x-display': 'hidden' },
        replaceAfter: { type: 'string', 'x-display': 'hidden' },
        prefix: { type: 'string', 'x-display': 'hidden' },
        suffix: { type: 'string', 'x-display': 'hidden' },
        transferCase: { type: 'string', 'x-display': 'hidden' },
        tableNames: {
          type: 'array',
          'x-component': 'TableRename',
          'x-component-props': {
            findParentNodes: '{{findParentNodes}}',
            listStyle: {
              maxHeight: 'calc((100vh - 120px) * 0.618)',
            },
          },
        },
      },
    }

    return () => (
      <FormLayout {...props.layout}>
        <SchemaField schema={schema} scope={props.scope} />
      </FormLayout>
    )
  },
})

const FieldEditForm = defineComponent({
  props: {
    form: Object,
    scope: Object,
    layout: Object,
    configProvider: Object,
  },
  setup(props) {
    provide(configProviderContextKey, props.configProvider)

    const schema = {
      type: 'object',
      properties: {
        fieldsOperation: {
          type: 'object',
          default: {
            prefix: '',
            suffix: '',
            capitalized: '',
          },
        },
        fieldsMapping: {
          type: 'array',
          title: '',
          'x-decorator': 'FormItem',
          'x-component': 'FieldRenameProcessor',
          'x-component-props': {
            nodeId: '{{$values.id}}',
            class: 'field-processor-dialog',
          },
        },
      },
    }

    return () => (
      <ElConfigProvider>
        <FormLayout {...props.layout}>
          <SchemaField schema={schema} scope={props.scope} />
        </FormLayout>
      </ElConfigProvider>
    )
  },
})

const SourceDatabaseNode = observer(
  defineComponent({
    props: {
      value: Object,
    },
    setup() {
      const configProvider = inject(configProviderContextKey)
      const formRef = useForm()
      const SchemaExpressionScopeContext = inject(SchemaExpressionScopeSymbol)
      const form = formRef.value
      const typeEnum = ['custom', 'expression']

      const items = [
        {
          title: i18n.t('packages_dag_nodes_database_anbiaomingxuanze'),
        },
        {
          title: i18n.t('packages_dag_nodes_database_anzhengzebiaoda'),
        },
      ]

      const setActive = (index) => {
        form.values.dag.nodes[0].migrateTableSelectType = typeEnum[index]
      }

      const layoutRef = useFormLayout()

      const openTableEdit = () => {
        FormDialog(
          {
            title: i18n.t('packages_dag_src_migrationeditor_biaobianji'),
            customClass: 'schema-form-dialog',
            okText: i18n.t('public_button_confirm'),
            cancelText: i18n.t('public_button_cancel'),
          },
          () => (
            <TableEditForm
              scope={SchemaExpressionScopeContext.value}
              layout={layoutRef.value}
              configProvider={configProvider}
            ></TableEditForm>
          ),
        )
          .forOpen((payload, next) => {
            next({
              values: form.values.dag.nodes[1],
              effects() {
                onFieldValueChange('*', () => {
                  form.notify('dialog-form-values-change')
                })
              },
            })
          })
          .forConfirm((payload, next) => {
            next(payload)
          })
          .forCancel((payload, next) => {
            next(payload)
          })
          .open()
      }

      const openFieldEdit = () => {
        FormDialog(
          {
            title: i18n.t('packages_dag_src_migrationeditor_biaobianji'),
            customClass: 'schema-form-dialog',
            okText: i18n.t('public_button_confirm'),
            cancelText: i18n.t('public_button_cancel'),
          },
          () => (
            <FieldEditForm
              configProvider={configProvider}
              scope={SchemaExpressionScopeContext.value}
              layout={layoutRef.value}
            ></FieldEditForm>
          ),
        )
          .forOpen((payload, next) => {
            next({
              values: form.values.dag.nodes[2],
              effects() {
                onFieldValueChange('*', (field) => {
                  form.notify('dialog-form-values-change')
                })
              },
            })
          })
          .forConfirm((payload, next) => {
            next(payload)
          })
          .forCancel((payload, next) => {
            next(payload)
          })
          .open()
      }

      const RightExtra = () => {
        return (
          <div>
            <ElButton text type="primary" onClick={openTableEdit}>
              {i18n.t('packages_dag_src_migrationeditor_biaobianji')}
            </ElButton>
            <ElButton text type="primary" onClick={openFieldEdit}>
              {i18n.t('packages_dag_src_migrationeditor_ziduanbianji')}
            </ElButton>
          </div>
        )
      }

      const RightItem = (props, {}) => {
        return <span>{tableMap.value[props.row] || props.row}</span>
      }

      const loading = ref(false)
      const tableMap = ref({})
      const loadTable = (...args) => {
        const taskId = form.values.id
        if (taskId) {
          loading.value = true
          taskApi
            .getNodeTableInfo({
              taskId,
              nodeId: form.values.dag.nodes[1].id,
              page: 1,
              pageSize: 10000,
            })
            .then(({ items = [] }) => {
              const map = items.reduce((acc, item) => {
                acc[item.previousTableName] = item.sinkObjectName
                return acc
              }, {})
              tableMap.value = map
            })
            .finally(() => {
              loading.value = false
            })
        }
      }

      loadTable()

      useAfterTaskSaved([], loadTable)

      return () => {
        const active = typeEnum.indexOf(
          form.values.dag.nodes[0].migrateTableSelectType,
        )

        return (
          <div class="source-database-node p-4 rounded-lg">
            <ul class="tab-bar-list flex overflow-hidden">
              {items.map((item, index) => {
                const hasRadiusLeft = active + 1 !== index
                const hasRadiusRight = active - 1 !== index

                return (
                  <li
                    class={[
                      'position-relative px-4 flex align-center',
                      {
                        'tab-bar-list-item': true,
                        'tab-bar-list-item--active': index === active,
                        'hover-radius-left': !hasRadiusLeft,
                        'hover-radius-right': !hasRadiusRight,
                      },
                    ]}
                    onClick={() => {
                      setActive(index)
                    }}
                  >
                    {active + 1 !== index && (
                      <svg
                        width="9"
                        height="9"
                        xmlns="http://www.w3.org/2000/svg"
                        class="tab-bar-list-item__arc-angle--left tab-bar-list-item__arc-angle"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M0 0v9h9a9 9 0 01-9-9z"
                        ></path>
                      </svg>
                    )}
                    <span>{item.title}</span>
                    {active - 1 !== index && (
                      <svg
                        width="9"
                        height="9"
                        xmlns="http://www.w3.org/2000/svg"
                        class="tab-bar-list-item__arc-angle--right tab-bar-list-item__arc-angle"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M0 0v9h9a9 9 0 01-9-9z"
                        ></path>
                      </svg>
                    )}
                  </li>
                )
              })}
            </ul>
            <div
              class="tab-content p-4 bg-white"
              style={active > 0 ? 'border-top-left-radius: 8px' : ''}
            >
              <RecursionField
                schema={{
                  type: 'object',
                  properties: {
                    noPrimaryKeyTableSelectType: {
                      type: 'string',
                      title: i18n.t('packages_dag_nodes_database_biaoxianshi'),
                      'x-decorator': 'FormItem',
                      'x-component': 'Select',
                      default: 'All',
                      enum: [
                        {
                          label: i18n.t('public_select_option_all'),
                          value: 'All',
                        },
                        {
                          label: i18n.t(
                            'packages_dag_nodes_database_jinyouzhujianbiao',
                          ),
                          value: 'HasKeys',
                        },
                        {
                          label: i18n.t(
                            'packages_dag_nodes_database_jinwuzhujianbiao',
                          ),
                          value: 'NoKeys',
                        },
                      ],
                    },
                    tableNames: {
                      type: 'array',
                      default: [],
                      'x-decorator': 'FormItem',
                      'x-component': 'TableSelector',
                      'x-component-props': {
                        class: 'mt-4',
                        connectionId: '{{$values.dag.nodes[0].connectionId}}',
                        style: {
                          height: 'unset',
                          minHeight: 0,
                          maxHeight: 'calc((100vh - 220px) * 0.618)',
                        },
                        hideReload: true,
                        alwaysShowReload: true,
                        nodeId: '{{$values.id}}',
                        taskId: '{{$taskId}}',
                        filterType: `{{ $values.dag.nodes[0].noPrimaryKeyTableSelectType }}`,
                      },
                      'x-content': {
                        'right-extra': RightExtra,
                        'right-item': RightItem,
                      },
                      'x-reactions': {
                        dependencies: ['.migrateTableSelectType'],
                        fulfill: {
                          state: {
                            display:
                              '{{$deps[0] === "custom" ? "visible":"hidden"}}',
                          },
                          schema: {
                            required: '{{$deps[0] === "custom"}}',
                          },
                        },
                      },
                    },
                    tableExpression: {
                      type: 'string',
                      default: '.*',
                      required: true,
                      description: i18n.t(
                        'packages_dag_nodes_database_zhengzebiaodashi',
                      ),
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                      'x-component-props': {
                        rows: 1,
                      },
                      'x-reactions': {
                        dependencies: ['.migrateTableSelectType'],
                        fulfill: {
                          state: {
                            display:
                              '{{$deps[0] === "expression" ? "visible":"hidden"}}',
                          },
                        },
                      },
                    },
                    tableListCard: {
                      type: 'void',
                      'x-component': 'TableListCard',
                      'x-component-props': {
                        class: 'mt-4',
                        rows: 1,
                        title: i18n.t(
                          'packages_dag_nodes_database_pipeidaodebiao',
                        ),
                        connectionId: '{{$values.dag.nodes[0].connectionId}}',
                        params:
                          '{{ {regex: $values.dag.nodes[0].tableExpression,limit:0} }}',
                        filterType: `{{ $values.dag.nodes[0].noPrimaryKeyTableSelectType }}`,
                      },
                      'x-reactions': {
                        dependencies: ['.migrateTableSelectType'],
                        fulfill: {
                          state: {
                            display:
                              '{{$deps[0] === "expression" ? "visible":"hidden"}}',
                          },
                        },
                      },
                    },
                  },
                }}
              ></RecursionField>
            </div>
            <FormDialog.Portal></FormDialog.Portal>
          </div>
        )
      }
    },
  }),
)

export { SourceDatabaseNode }
