<template>
  <div class="joint-table" :class="{ error: !!jointErrorMessage }">
    <div class="joint-table-header">
      <div>
        <span>{{ $t('packages_business_verification_verifyCondition') }}</span>
        <span v-if="!list.length" class="ml-4 color-danger">{{
          $t('packages_business_verification_message_error_joint_table_not_set')
        }}</span>
        <span class="color-danger ml-6">{{ jointErrorMessage }}</span>
      </div>
      <div>
        <ElLink
          v-if="!isCountOrHash && list.some(t => !t.source.sortColumn || !t.target.sortColumn)"
          type="primary"
          :disabled="!list.length"
          class="mr-4"
          @click="handleClearIndexEmpty"
          >{{ $t('packages_business_components_conditionbox_yijianqingchusuo') }}
        </ElLink>
        <ElLink type="primary" :disabled="!list.length" @click="handleClear"
          >{{ $t('packages_business_verification_clear') }}
        </ElLink>
      </div>
    </div>
    <DynamicScroller
      :items="list"
      :min-item-size="30"
      id="data-verification-form"
      ref="virtualScroller"
      key-field="id"
      class="joint-table-main scroller px-2 py-1 h-100"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :data-index="index"
          :size-dependencies="[item.id, item.source, item.target]"
        >
          <div class="joint-table-item" :key="item.id + index">
            <div class="joint-table-setting overflow-hidden">
              <div class="flex justify-content-between">
                <div class="cond-item__title flex align-items-center">
                  <span class="font-color-main fs-7">{{
                    $t('packages_business_components_conditionbox_jianyantiaojian')
                  }}</span>
                  <span class="ml-1">{{ index + 1 }}</span>
                </div>
                <div class="flex align-items-center">
                  <ElButton type="text" @click.stop="removeItem(index)">{{ $t('public_button_delete') }}</ElButton>
                </div>
              </div>
              <div class="setting-item mt-4" :key="'connection' + item.id">
                <label class="item-label"
                  >{{ $t('packages_business_components_conditionbox_daijiaoyanlianjie') }}:</label
                >
                <AsyncSelect
                  v-model="item.source.connectionId"
                  :method="getConnectionsListMethod"
                  itemQuery="name"
                  itemValue="id"
                  filterable
                  class="item-select"
                  :key="'sourceConnectionId' + item.id"
                  @change="handleChangeConnection(arguments[0], item.source, arguments[1])"
                >
                </AsyncSelect>
                <span class="item-icon fs-6">
                  <i class="el-icon-arrow-right"></i>
                </span>
                <AsyncSelect
                  v-model="item.target.connectionId"
                  :method="getConnectionsListMethod"
                  itemQuery="name"
                  itemValue="id"
                  filterable
                  class="item-select"
                  :key="'targetConnectionId' + item.id"
                  @change="handleChangeConnection(arguments[0], item.target, arguments[1])"
                >
                </AsyncSelect>
              </div>
              <div class="setting-item mt-4" :key="'table' + item.id">
                <label class="item-label">{{ $t('packages_business_components_conditionbox_laiyuanbiao') }}:</label>
                <AsyncSelect
                  v-model="item.source.table"
                  :method="getTableListMethod"
                  :params="{
                    connectionId: item.source.connectionId,
                    nodeId: item.source.nodeId
                  }"
                  itemQuery="name"
                  itemType="string"
                  lazy
                  filterable
                  class="item-select"
                  :key="'sourceTable' + item.id"
                  @change="handleChangeTable(arguments[0], item, index, 'source')"
                >
                </AsyncSelect>
                <span class="item-icon">{{ $t('packages_business_components_conditionbox_mubiaobiao') }}:</span>
                <AsyncSelect
                  v-model="item.target.table"
                  :method="getTableListMethod"
                  :params="{
                    connectionId: item.target.connectionId,
                    nodeId: item.target.nodeId
                  }"
                  itemQuery="name"
                  itemType="string"
                  lazy
                  filterable
                  class="item-select"
                  :key="'targetTable' + item.id"
                  @change="handleChangeTable(arguments[0], item, index, 'target')"
                >
                </AsyncSelect>
              </div>
              <div class="setting-item mt-4" :key="'SchemaToForm' + item.id + index + inspectMethod">
                <SchemaToForm
                  :ref="`schemaToForm_${item.id}`"
                  :value.sync="item"
                  :schema="formSchema"
                  :scope="schemaScope"
                  :colon="true"
                  class="w-100"
                  label-width="130"
                />
              </div>
              <template v-if="!isCountOrHash">
                <div class="setting-item mt-4">
                  <label class="item-label">{{ $t('packages_business_verification_indexField') }}: </label>
                  <FieldSelectWrap
                    v-model="item.source.sortColumn"
                    :options="item.source.fields"
                    :key="`item-source-sortColumn` + item.id"
                    class="flex-1"
                    @focus="handleFocus(item.source)"
                  ></FieldSelectWrap>
                  <!-- <MultiSelection
                  v-model="item.source.sortColumn"
                  class="item-select"
                  :class="{ 'empty-data': !item.source.sortColumn }"
                  :options="item.source.fields"
                  :id="'item-source-' + index"
                  :key="`item-source-sortColumn` + item.id"
                  @focus="handleFocus(item.source)"
                ></MultiSelection> -->
                  <span class="item-icon"></span>
                  <FieldSelectWrap
                    v-model="item.target.sortColumn"
                    :options="item.source.fields"
                    :key="`item-target-sortColumn` + item.id"
                    class="flex-1"
                    @focus="handleFocus(item.target)"
                  ></FieldSelectWrap>
                  <!-- <MultiSelection
                  v-model="item.target.sortColumn"
                  class="item-select"
                  :class="{ 'empty-data': !item.target.sortColumn }"
                  :options="item.target.fields"
                  :key="`item-target-sortColumn` + item.id"
                  @focus="handleFocus(item.target)"
                ></MultiSelection> -->
                </div>

                <div class="setting-item mt-4">
                  <label class="item-label">{{ $t('packages_business_custom_collate') }}: </label>
                  <div class="flex-1">
                    <div class="flex gap-3 align-center">
                      <ElSwitch
                        v-model="item.source.enableCustomCollate"
                        @change="toggleCollate(item.source, $event)"
                      />

                      <ElButton type="text" @click="schemaScope.openApiDrawer('inspect-collate')">
                        <VIcon>question-circle</VIcon>
                        {{ $t('public_view_docs') }}
                      </ElButton>
                    </div>

                    <div v-if="item.source.enableCustomCollate">
                      <CollateMap
                        v-model="item.source.collate"
                        :sort-column="item.source.sortColumn"
                        :fields="item.source.fields"
                      />
                    </div>
                  </div>
                  <span class="item-icon"></span>
                  <div class="flex-1">
                    <div class="flex gap-3 align-center">
                      <ElSwitch
                        v-model="item.target.enableCustomCollate"
                        @change="toggleCollate(item.target, $event)"
                      />

                      <ElButton type="text" @click="schemaScope.openApiDrawer('inspect-collate')">
                        <VIcon>question-circle</VIcon>
                        {{ $t('public_view_docs') }}
                      </ElButton>
                    </div>

                    <div v-if="item.target.enableCustomCollate">
                      <CollateMap
                        v-model="item.target.collate"
                        :sort-column="item.target.sortColumn"
                        :fields="item.target.fields"
                      />
                    </div>
                  </div>
                  <!-- <MultiSelection
                  v-model="item.target.sortColumn"
                  class="item-select"
                  :class="{ 'empty-data': !item.target.sortColumn }"
                  :options="item.target.fields"
                  :key="`item-target-sortColumn` + item.id"
                  @focus="handleFocus(item.target)"
                ></MultiSelection> -->
                </div>
              </template>

              <div v-if="inspectMethod === 'field'" class="setting-item align-items-center mt-4">
                <label class="item-label">{{ $t('packages_business_components_fieldbox_daijiaoyanmoxing') }}:</label>
                <ElRadioGroup
                  v-model="item.modeType"
                  :disabled="getModeTypeDisabled(item)"
                  @change="handleChangeModeType(arguments[0], item, index)"
                >
                  <ElRadio label="all">{{ $t('packages_business_components_fieldbox_quanziduan') }}</ElRadio>
                  <ElRadio label="custom">{{ $t('packages_business_connections_databaseform_zidingyi') }}</ElRadio>
                </ElRadioGroup>
                <ElLink
                  v-if="item.modeType === 'custom'"
                  type="primary"
                  class="ml-4"
                  @click="handleCustomFields(item, index)"
                >
                  {{ $t('packages_business_components_conditionbox_chakanzidingyi') }}
                  ({{ item.source.columns ? item.source.columns.length : 0 }})
                </ElLink>
              </div>
              <div v-show="inspectMethod === 'field'" class="setting-item mt-4">
                <ElCheckbox v-model="item.showAdvancedVerification" @change="handleChangeAdvanced(item, arguments[0])"
                  >{{ $t('packages_business_verification_advanceVerify') }}
                </ElCheckbox>
              </div>
              <div class="setting-item mt-4" v-if="item.showAdvancedVerification && inspectMethod === 'field'">
                <label class="item-label">{{ $t('packages_business_verification_JSVerifyLogic') }}: </label>
                <ElButton v-if="!item.webScript || item.webScript === ''" @click="addScript(index)"
                  >{{ $t('packages_business_verification_addJS') }}
                </ElButton>
                <template v-else>
                  <ElLink type="primary" class="ml-4" @click="editScript(index)">{{ $t('public_button_edit') }}</ElLink>
                  <ElLink type="primary" class="ml-4" @click="removeScript(index)"
                    >{{ $t('public_button_delete') }}
                  </ElLink>
                </template>
              </div>
              <div
                class="setting-item mt-4"
                v-if="inspectMethod === 'field' && item.showAdvancedVerification && item.webScript"
              >
                <pre class="item-script">{{ item.webScript }}</pre>
              </div>
            </div>
          </div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
    <div class="joint-table-footer">
      <ElButton size="mini" @click="addItem">{{ $t('packages_business_verification_addTable') }}</ElButton>
      <ElButton
        v-if="taskId"
        type="primary"
        size="mini"
        :disabled="!!list.length"
        :loading="autoAddTableLoading"
        @click="autoAddTable"
        >{{ $t('packages_business_verification_button_auto_add_table') }}
      </ElButton>

      <template v-if="!isCountOrHash">
        <el-divider class="mx-3" direction="vertical"></el-divider>
        <div class="inline-flex align-items-center">
          <span class="fs-7">{{ $t('packages_business_auto_fill_join_fields') }}</span>
          <el-tooltip class="color-primary" effect="dark" placement="top">
            <template #content>
              <div>{{ $t('packages_business_auto_fill_join_tooltip_title') }}</div>
              <div>{{ $t('packages_business_auto_fill_join_tooltip_primary') }}</div>
              <div>{{ $t('packages_business_auto_fill_join_tooltip_notnull') }}</div>
              <div>{{ $t('packages_business_auto_fill_join_tooltip_all') }}</div>
            </template>
            <i class="el-icon-question"></i>
          </el-tooltip>
          <el-switch class="ml-3" v-model="autoSuggestJoinFields" />
        </div>
      </template>
    </div>
    <ElDialog
      width="60%"
      :title="$t('packages_business_verification_JSVerifyLogic')"
      :visible.sync="dialogAddScriptVisible"
      :before-close="handleAddScriptClose"
    >
      <div class="js-wrap">
        <div class="jsBox">
          <div class="js-fixText"><span style="color: #0000ff">function </span><span> validate(sourceRow){</span></div>
          <VCodeEditor v-model="webScript" height="500" class="js-editor"></VCodeEditor>
          <div class="js-fixText">}</div>
        </div>
        <GitBook
          v-resize.left="{
            minWidth: 350,
            maxWidth: 500
          }"
          :value="doc"
          class="example ml-4 color-primary"
        ></GitBook>
      </div>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="handleAddScriptClose">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton type="primary" size="mini" @click="submitScript">{{ $t('public_button_confirm') }}</ElButton>
      </span>
    </ElDialog>
    <FieldDialog ref="fieldDialog" @save="handleChangeFields"></FieldDialog>

    <DocsDrawer :visible="showDoc" :path="docPath" @update:visible="showDoc = $event"></DocsDrawer>
  </div>
</template>

<script>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { merge, cloneDeep, uniqBy, isEmpty, debounce, isString } from 'lodash'
import { action } from '@formily/reactive'

import i18n from '@tap/i18n'
import { AsyncSelect, SchemaToForm, HighlightCode } from '@tap/form'
import { connectionsApi, metadataInstancesApi } from '@tap/api'
import { uuid } from '@tap/shared'
import { CONNECTION_STATUS_MAP } from '@tap/business/src/shared'
import { GitBook, VCodeEditor } from '@tap/component'
import resize from '@tap/component/src/directives/resize'

import { TABLE_PARAMS, META_INSTANCE_FIELDS, DATA_NODE_TYPES } from './const'
import { inspectMethod as inspectMethodMap } from '../const'
import MultiSelection from '../MultiSelection'
import FieldDialog from './FieldDialog'
import DocsDrawer from './DocsDrawer.vue'
import FieldSelectWrap from './FieldSelectWrap.vue'
import CollateMap from './CollateMap.vue'

export default {
  name: 'ConditionBox',

  directives: {
    resize
  },

  components: {
    DocsDrawer,
    AsyncSelect,
    DynamicScroller,
    DynamicScrollerItem,
    VCodeEditor,
    GitBook,
    MultiSelection,
    FieldDialog,
    SchemaToForm,
    HighlightCode,
    FieldSelectWrap,
    CollateMap
  },

  props: {
    taskId: String,
    isDB: Boolean,
    inspectMethod: String,
    data: {
      type: Array,
      default: () => []
    },
    allStages: {
      type: Array,
      default: () => []
    },
    edges: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      showDoc: false,
      docPath: '',
      list: [],
      jointErrorMessage: '',
      fieldsMap: {},
      capabilitiesMap: {},
      autoAddTableLoading: false,
      dynamicSchemaMap: {},
      dialogAddScriptVisible: false,
      formIndex: '',
      webScript: '',
      jsEngineName: 'graal.js',
      doc: '',
      schemaData: null,
      schemaScope: {
        $supportFilterFunction:
          this.inspectMethod === 'row_count'
            ? 'count_by_partition_filter_function'
            : 'query_by_advance_filter_function',
        useAsyncDataSource: (service, fieldName = 'dataSource', ...serviceParams) => {
          return field => {
            field.loading = true
            service({ field }, ...serviceParams).then(
              action.bound(data => {
                if (fieldName === 'value') {
                  field.setValue(data)
                } else field[fieldName] = data
                field.loading = false
              })
            )
          }
        },
        async loadTableFieldList(obj, item) {
          try {
            if (!item.connectionId || !item.table) return []
            let fields = item.fields
            if (!fields?.length) {
              const params = {
                where: {
                  meta_type: 'table',
                  sourceType: 'SOURCE',
                  original_name: item.table,
                  'source._id': item.connectionId
                },
                limit: 1
              }
              const data = await metadataInstancesApi.tapTables({
                filter: JSON.stringify(params)
              })
              fields = Object.values(data.items[0]?.nameFieldMap || {}).map(t => {
                return {
                  id: t.id,
                  label: t.fieldName || t.field_name,
                  value: t.fieldName || t.field_name,
                  field_name: t.fieldName || t.field_name,
                  primary_key_position: t.primaryKey,
                  data_type: t.dataType || t.data_type,
                  primaryKey: t.primaryKey,
                  unique: t.unique,
                  type: t.dataType || t.data_type,
                  tapType: JSON.stringify(t.tapType)
                }
              })
            }
            const result = fields
            if (result.length) {
              item.fields = result
            }

            return result
          } catch (e) {
            return []
          }
        },
        openApiDrawer: path => {
          this.docPath = isString(path) ? path : ''
          this.showDoc = true
        }
      },
      formSchema: {
        type: 'object',
        properties: {
          nameWrap: {
            type: 'void',
            'x-component': 'FormGrid',
            'x-component-props': {
              minColumns: 2,
              maxColumns: 2,
              columnGap: 16
            },
            properties: {
              source: {
                type: 'object',
                'x-component': 'FormGrid.GridColumn',
                properties: {
                  databaseType: {
                    type: 'string',
                    'x-display': 'hidden'
                  },
                  nodeSchema: {
                    type: 'array',
                    'x-display': 'hidden',
                    'x-reactions': [
                      `{{useAsyncDataSource(loadTableFieldList, 'value', $values.source)}}`,
                      {
                        target: 'source.conditions.*.key',
                        fulfill: {
                          state: {
                            loading: '{{$self.loading}}',
                            dataSource: '{{$self.value}}'
                          }
                        }
                      }
                    ]
                  },
                  enableCustomCommand: {
                    title: i18n.t('packages_business_components_conditionbox_laiyuanbiaoshuju'),
                    type: 'boolean',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      className: 'item-control-horizontal',
                      layout: 'horizontal',
                      tooltip: i18n.t('packages_business_components_conditionbox_enableCustomCommand_tip')
                    },
                    'x-component': 'Switch',
                    default: false,
                    'x-reactions': [
                      {
                        fulfill: {
                          state: {
                            visible: `{{$values.source.capabilities && $values.source.capabilities.some(item => item.id === 'execute_command_function')}}`
                          }
                        }
                      }
                    ]
                  },
                  customCommand: {
                    type: 'object',
                    properties: {
                      command: {
                        title: ' ',
                        'x-decorator-props': {
                          colon: false
                        },
                        type: 'string',
                        default: 'executeQuery',
                        'x-decorator': 'FormItem',
                        'x-component': 'Radio.Group',
                        enum: [
                          { label: i18n.t('public_query'), value: 'executeQuery' },
                          { label: i18n.t('public_aggregate'), value: 'aggregate' }
                        ],
                        'x-reactions': {
                          dependencies: ['source.databaseType'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0].toLowerCase().includes("mongo")?"visible":"hidden"}}'
                            }
                          }
                        }
                      },
                      params: {
                        type: 'object',
                        properties: {
                          mongoQuery: {
                            title: ' ',
                            'x-decorator-props': {
                              colon: false
                            },
                            type: 'void',
                            'x-reactions': {
                              dependencies: ['source.customCommand.command', 'source.databaseType'],
                              fulfill: {
                                state: {
                                  visible: '{{$deps[1].toLowerCase().includes("mongo") && $deps[0]==="executeQuery"}}'
                                }
                              }
                            },
                            properties: {
                              op: {
                                type: 'string',
                                default: 'find'
                              },
                              collection: {
                                type: 'string',
                                'x-reactions': {
                                  fulfill: {
                                    state: {
                                      value: '{{$values.tableName}}'
                                    }
                                  }
                                }
                              },
                              filter: {
                                title: ' ',
                                'x-decorator-props': {
                                  colon: false,
                                  feedbackLayout: 'none'
                                },
                                type: 'string',
                                'x-decorator': 'FormItem',
                                'x-component': 'JsonEditor',
                                'x-component-props': {
                                  options: { showPrintMargin: false, useWrapMode: true }
                                }
                              },
                              descWrap: {
                                type: 'void',
                                title: ' ',
                                'x-decorator': 'FormItem',
                                'x-decorator-props': {
                                  colon: false,
                                  feedbackLayout: 'none'
                                },
                                'x-component': 'div',
                                'x-component-props': {
                                  class: 'flex align-center gap-2'
                                },
                                properties: {
                                  desc: {
                                    type: 'void',
                                    'x-component': 'div',
                                    'x-component-props': {
                                      style: {
                                        color: '#909399'
                                      }
                                    },
                                    'x-content': i18n.t('packages_dag_nodes_table_jinzhichiqu')
                                  },
                                  link: {
                                    type: 'void',
                                    'x-component': 'Link',
                                    'x-component-props': {
                                      type: 'primary',
                                      onClick: '{{openApiDrawer}}'
                                    },
                                    'x-content': i18n.t('packages_business_view_more_apis')
                                  }
                                }
                              }
                            }
                          },
                          mongoAgg: {
                            title: ' ',
                            'x-decorator-props': {
                              colon: false
                            },
                            type: 'void',
                            'x-reactions': {
                              dependencies: ['source.customCommand.command', 'source.databaseType'],
                              fulfill: {
                                state: {
                                  visible: '{{$deps[1].toLowerCase().includes("mongo") && $deps[0]==="aggregate"}}'
                                }
                              }
                            },
                            properties: {
                              collection: {
                                type: 'string',
                                'x-reactions': {
                                  dependencies: ['source.tableName'],
                                  fulfill: {
                                    state: {
                                      value: '{{$deps[0]}}'
                                    }
                                  }
                                }
                              },
                              pipeline: {
                                type: 'string',
                                title: ' ',
                                'x-decorator-props': {
                                  colon: false,
                                  feedbackLayout: 'none'
                                },
                                'x-decorator': 'FormItem',
                                'x-component': 'JsonEditor',
                                'x-component-props': {
                                  options: { showPrintMargin: false, useWrapMode: true }
                                }
                              },
                              descWrap: {
                                type: 'void',
                                title: ' ',
                                'x-decorator': 'FormItem',
                                'x-decorator-props': {
                                  colon: false,
                                  feedbackLayout: 'none'
                                },
                                'x-component': 'div',
                                'x-component-props': {
                                  class: 'flex align-center gap-2'
                                },
                                properties: {
                                  desc: {
                                    type: 'void',
                                    'x-component': 'div',
                                    'x-component-props': {
                                      style: {
                                        color: '#909399'
                                      }
                                    },
                                    'x-content': i18n.t('packages_dag_nodes_table_shiligro')
                                  },
                                  link: {
                                    type: 'void',
                                    'x-component': 'Link',
                                    'x-component-props': {
                                      type: 'primary',
                                      onClick: '{{openApiDrawer}}'
                                    },
                                    'x-content': i18n.t('packages_business_view_more_apis')
                                  }
                                }
                              }
                            }
                          },
                          sql: {
                            title: ' ',
                            'x-decorator-props': {
                              colon: false
                            },
                            type: 'string',
                            'x-decorator': 'FormItem',
                            'x-component': 'SqlEditor',
                            'x-component-props': {
                              options: { showPrintMargin: false, useWrapMode: true }
                            },
                            'x-reactions': {
                              dependencies: ['source.enableCustomCommand', 'source.databaseType'],
                              fulfill: {
                                state: {
                                  visible: '{{!!$deps[0] && !$deps[1].toLowerCase().includes("mongo")}}'
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    'x-reactions': [
                      {
                        dependencies: ['source.enableCustomCommand'],
                        fulfill: {
                          state: {
                            visible: `{{$deps[0]}}`
                          }
                        }
                      }
                    ]
                  }
                }
              },
              target: {
                type: 'object',
                'x-component': 'FormGrid.GridColumn',
                properties: {
                  databaseType: {
                    type: 'string',
                    'x-display': 'hidden'
                  },
                  nodeSchema: {
                    type: 'array',
                    'x-display': 'hidden',
                    'x-reactions': [
                      `{{useAsyncDataSource(loadTableFieldList, 'value', $values.target)}}`,
                      {
                        target: 'target.conditions.*.key',
                        fulfill: {
                          state: {
                            loading: '{{$self.loading}}',
                            dataSource: '{{$self.value}}'
                          }
                        }
                      }
                    ]
                  },
                  enableCustomCommand: {
                    title: i18n.t('packages_business_components_conditionbox_mubiaobiaoshuju'),
                    type: 'boolean',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      className: 'item-control-horizontal',
                      layout: 'horizontal',
                      labelWrap: true,
                      tooltip: i18n.t('packages_business_components_conditionbox_enableCustomCommand_tip')
                    },
                    'x-component': 'Switch',
                    default: false,
                    'x-reactions': [
                      {
                        fulfill: {
                          state: {
                            visible: `{{$values.target.capabilities && $values.target.capabilities.some(item => item.id === 'execute_command_function')}}`
                          }
                        }
                      }
                    ]
                  },
                  customCommand: {
                    type: 'object',
                    properties: {
                      command: {
                        title: ' ',
                        'x-decorator-props': {
                          colon: false
                        },
                        type: 'string',
                        default: 'executeQuery',
                        'x-decorator': 'FormItem',
                        'x-component': 'Radio.Group',
                        enum: [
                          { label: i18n.t('public_query'), value: 'executeQuery' },
                          { label: i18n.t('public_aggregate'), value: 'aggregate' }
                        ],
                        'x-reactions': {
                          dependencies: ['target.databaseType'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0].toLowerCase().includes("mongo")?"visible":"hidden"}}'
                            }
                          }
                        }
                      },
                      params: {
                        type: 'object',
                        properties: {
                          mongoQuery: {
                            title: ' ',
                            'x-decorator-props': {
                              colon: false
                            },
                            type: 'void',
                            'x-reactions': {
                              dependencies: ['target.customCommand.command', 'target.databaseType'],
                              fulfill: {
                                state: {
                                  visible: '{{$deps[1].toLowerCase().includes("mongo") && $deps[0]==="executeQuery"}}'
                                }
                              }
                            },
                            properties: {
                              op: {
                                type: 'string',
                                default: 'find'
                              },
                              collection: {
                                type: 'string',
                                'x-reactions': {
                                  fulfill: {
                                    state: {
                                      value: '{{$values.tableName}}'
                                    }
                                  }
                                }
                              },
                              filter: {
                                title: ' ',
                                'x-decorator-props': {
                                  colon: false,
                                  feedbackLayout: 'none'
                                },
                                type: 'string',
                                'x-decorator': 'FormItem',
                                'x-component': 'JsonEditor',
                                'x-component-props': {
                                  options: { showPrintMargin: false, useWrapMode: true }
                                }
                              },
                              descWrap: {
                                type: 'void',
                                title: ' ',
                                'x-decorator': 'FormItem',
                                'x-decorator-props': {
                                  colon: false,
                                  feedbackLayout: 'none'
                                },
                                'x-component': 'div',
                                'x-component-props': {
                                  class: 'flex align-center gap-2'
                                },
                                properties: {
                                  desc: {
                                    type: 'void',
                                    'x-component': 'div',
                                    'x-component-props': {
                                      style: {
                                        color: '#909399'
                                      }
                                    },
                                    'x-content': i18n.t('packages_dag_nodes_table_jinzhichiqu')
                                  },
                                  link: {
                                    type: 'void',
                                    'x-component': 'Link',
                                    'x-component-props': {
                                      type: 'primary',
                                      onClick: '{{openApiDrawer}}'
                                    },
                                    'x-content': i18n.t('packages_business_view_more_apis')
                                  }
                                }
                              }
                            }
                          },
                          mongoAgg: {
                            title: ' ',
                            'x-decorator-props': {
                              colon: false
                            },
                            type: 'void',
                            'x-reactions': {
                              dependencies: ['target.customCommand.command', 'target.databaseType'],
                              fulfill: {
                                state: {
                                  visible: '{{$deps[1].toLowerCase().includes("mongo") && $deps[0]==="aggregate"}}'
                                }
                              }
                            },
                            properties: {
                              collection: {
                                type: 'string',
                                'x-reactions': {
                                  dependencies: ['target.tableName'],
                                  fulfill: {
                                    state: {
                                      value: '{{$deps[0]}}'
                                    }
                                  }
                                }
                              },
                              pipeline: {
                                title: ' ',
                                'x-decorator-props': {
                                  colon: false,
                                  feedbackLayout: 'none'
                                },
                                type: 'string',
                                'x-decorator': 'FormItem',
                                'x-component': 'JsonEditor',
                                'x-component-props': {
                                  options: { showPrintMargin: false, useWrapMode: true }
                                }
                              },
                              descWrap: {
                                type: 'void',
                                title: ' ',
                                'x-decorator': 'FormItem',
                                'x-decorator-props': {
                                  colon: false,
                                  feedbackLayout: 'none'
                                },
                                'x-component': 'div',
                                'x-component-props': {
                                  class: 'flex align-center gap-2'
                                },
                                properties: {
                                  desc: {
                                    type: 'void',
                                    'x-component': 'div',
                                    'x-component-props': {
                                      style: {
                                        color: '#909399'
                                      }
                                    },
                                    'x-content': i18n.t('packages_dag_nodes_table_shiligro')
                                  },
                                  link: {
                                    type: 'void',
                                    'x-component': 'Link',
                                    'x-component-props': {
                                      type: 'primary',
                                      onClick: '{{openApiDrawer}}'
                                    },
                                    'x-content': i18n.t('packages_business_view_more_apis')
                                  }
                                }
                              }
                            }
                          },
                          sql: {
                            title: ' ',
                            'x-decorator-props': {
                              colon: false
                            },
                            type: 'string',
                            'x-decorator': 'FormItem',
                            'x-component': 'SqlEditor',
                            'x-component-props': {
                              options: { showPrintMargin: false, useWrapMode: true }
                            },
                            'x-reactions': {
                              dependencies: ['target.enableCustomCommand', 'target.databaseType'],
                              fulfill: {
                                state: {
                                  visible: '{{!!$deps[0] && !$deps[1].toLowerCase().includes("mongo")}}'
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    'x-reactions': [
                      {
                        dependencies: ['target.enableCustomCommand'],
                        fulfill: {
                          state: {
                            visible: `{{$deps[0]}}`
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      autoSuggestJoinFields: true
    }
  },

  computed: {
    flowStages() {
      let types = this.isDB ? ['database'] : ['table']
      return this.allStages.filter(stg => types.includes(stg.type))
    },
    isCountOrHash() {
      return this.inspectMethod === 'row_count' || this.inspectMethod === 'hash'
    }
  },

  watch: {
    taskId(v1, v2) {
      if (v1 !== v2) {
        this.clearList()
      }
    },

    data: {
      deep: true,
      handler() {
        this.loadList()
      }
    },

    list: {
      deep: true,
      handler() {
        this.debounceValidate()
      }
    }
  },

  created() {
    this.loadDoc()
  },

  methods: {
    async getConnectionsListMethod(filter) {
      if (this.taskId) {
        return this.getConnectionsInTask(filter)
      }
      try {
        const _filter = {
          where: {
            createType: {
              $ne: 'System'
            }
          },
          fields: {
            name: 1,
            id: 1,
            database_type: 1,
            connection_type: 1,
            status: 1,
            accessNodeType: 1,
            accessNodeProcessId: 1,
            accessNodeProcessIdList: 1,
            pdkType: 1,
            pdkHash: 1,
            capabilities: 1
          },
          order: ['status DESC', 'name ASC']
        }
        let result = await connectionsApi.get({
          filter: JSON.stringify(merge(filter, _filter))
        })

        result.items = result.items.map(item => {
          const findDynamicSchema = item.capabilities.find(t => t.id === 'dynamic_schema')
          if (findDynamicSchema) {
            this.dynamicSchemaMap[item.id] = true
          }
          const connectionId = item.id
          const connectionName = item.name
          const databaseType = item.database_type
          return {
            id: connectionId,
            name: connectionName,
            label: `${connectionName} ${
              item.status ? `(${CONNECTION_STATUS_MAP[item.status]?.text || item.status})` : ''
            }`,
            value: connectionId,
            databaseType: databaseType,
            attrs: { connectionId, connectionName, databaseType }
          }
        })

        return result
      } catch (e) {
        return { items: [], total: 0 }
      }
    },

    async getTableListMethod(filter = {}) {
      const { connectionId, nodeId } = filter
      if (!connectionId) {
        return { items: [], total: 0 }
      }
      if (this.taskId) {
        return this.getTablesInTask(nodeId, connectionId, filter)
      }
      try {
        const size = filter.size || 20
        const page = filter.page || 1
        let params = {
          where: {
            meta_type: 'table',
            sourceType: 'SOURCE',
            is_deleted: false,
            'source.id': connectionId
          },
          skip: (page - 1) * size,
          limit: size,
          order: 'createTime DESC'
        }
        const keyword = filter.where?.name?.like
        if (keyword) {
          params.where.name = filter.where.name
        }
        const res = await metadataInstancesApi.tapTables({
          filter: JSON.stringify(params)
        })
        let result = {}
        result.items = res.items.map(t => t.name)
        result.total = res.total
        res.items.forEach(el => {
          // 缓存起来
          this.setFieldsByItem(
            [nodeId, connectionId, el.name],
            Object.values(el.nameFieldMap || {}).map(t => {
              const { id, fieldName, primaryKeyPosition, fieldType, data_type, primaryKey, unique } = t
              return {
                id,
                field_name: fieldName,
                primary_key_position: primaryKeyPosition,
                fieldType,
                data_type,
                primaryKey,
                unique,
                type: t.data_type,
                tapType: JSON.stringify(t.tapType)
              }
            })
          )
        })
        return result
      } catch (e) {
        return { items: [], total: 0 }
      }
    },

    async getConnectionsInTask(filter = {}) {
      const keyword = filter.where?.name?.like
      let arr
      if (keyword) {
        arr = this.flowStages.filter(t => t.attrs?.connectionName.includes(filter.where?.name?.like))
      } else {
        arr = this.flowStages
      }
      const result = uniqBy(
        arr.map(t => {
          const nodeId = t.id
          const nodeName = t.name
          const connectionId = t.connectionId
          const connectionName = t.attrs?.connectionName
          const databaseType = t.databaseType
          const findDynamicSchema = t.attrs?.capabilities.find(t => t.id === 'dynamic_schema')
          if (findDynamicSchema) {
            this.dynamicSchemaMap[t.connectionId] = true
          }
          return {
            attrs: { nodeId, nodeName, connectionId, connectionName, databaseType },
            name: `${nodeName} / ${connectionName}`,
            value: connectionId,
            id: connectionId,
            label: `${nodeName} / ${connectionName}`,
            databaseType: databaseType
          }
        }),
        'value'
      )

      return { items: result, total: result.length }
    },

    async getTablesInTask(nodeId, connectionId, filter = {}) {
      if (!this.flowStages?.length || !this.taskId) {
        return { items: [], total: 0 }
      }
      const { isDB } = this

      const findNode = this.flowStages.find(t => t.id === nodeId)
      if (!findNode) {
        return { items: [], total: 0 }
      }

      let params = {
        nodeId,
        fields: ['original_name', 'fields', 'qualified_name'],
        page: filter?.page || 1,
        pageSize: filter?.size || 20
      }
      const keyword = filter.where?.name?.like
      if (keyword) {
        params.tableFilter = keyword
      }

      let res = await metadataInstancesApi.nodeSchemaPage(params)

      const tableList = res.items?.map(t => t.name) || []
      const total = res.total
      res.items.forEach(el => {
        this.setFieldsByItem(
          [nodeId, connectionId, el.name],
          el.fields.map(t => {
            const { id, field_name, primary_key_position, data_type, primaryKey, unique } = t
            return { id, field_name, primary_key_position, data_type, primaryKey, unique }
          })
        )
      })
      let tableNames = tableList
      if (isDB) {
        if (!findNode.outputLanes.length) {
          const { tablePrefix, tableSuffix, tableNameTransform } = findNode
          tableNames = tableNames.map(t => {
            let name = (tablePrefix || '') + t + (tableSuffix || '')
            return tableNameTransform ? name[tableNameTransform]() : name
          })
        }
        return { items: tableNames, total: total }
      }
      if (keyword) {
        tableNames = tableNames.filter(t => t.toLowerCase().includes(keyword.toLowerCase()))
      }
      return { items: tableNames, total: tableNames.length }
    },

    /**
     * @desc 获取连线信息
     * @param1 value 节点id
     * @param2 data 整个连线数据
     * @param3 flag true连线下游、false连线上游
     * */
    getLinkData(value, data = [], flag = false) {
      const f = data.find(t => t[flag ? 'source' : 'target'] === value)
      return f ? this.getLinkData(f[!flag ? 'source' : 'target'], data, flag) : value
    },

    // 获取一条线上的源节点和目标节点
    getMatchNodeList() {
      const edgesList = cloneDeep(this.edges)
      let result = uniqBy(
        edgesList.map(t => {
          const source = this.getLinkData(t.source, edgesList)
          const target = this.getLinkData(t.target, edgesList, true)
          const key = source + '_' + target
          return {
            source,
            target,
            key
          }
        }),
        'key'
      )

      return result.map(re => {
        const el = this.flowStages.find(t => t.id === re.source)
        const targetNode = this.flowStages.find(t => t.id === re.target)
        let updateConditionFieldMap = {}
        let tableNames = []
        let tableNameRelation = {}
        let objectNames = []
        if (targetNode.type === 'database') {
          tableNames = el.tableNames
          updateConditionFieldMap = targetNode.updateConditionFieldMap || {}
          tableNameRelation = targetNode.syncObjects?.[0]?.tableNameRelation || []
          objectNames = targetNode.syncObjects?.[0]?.objectNames || []
        } else if (targetNode.type === 'table') {
          tableNames = [el.tableName, targetNode.tableName] // 加上源表名，否则源和目标表名不一致时，源表关联字段不会自动填充
          updateConditionFieldMap[targetNode.tableName] = targetNode.updateConditionFields || []
          tableNameRelation[el.tableName] = targetNode.tableName
        }

        return {
          source: el.id,
          sourceName: el.name,
          target: targetNode.id,
          targetName: targetNode.name,
          sourceConnectionId: el.connectionId,
          sourceConnectionName: el.attrs?.connectionName,
          targetConnectionId: targetNode.connectionId,
          targetConnectionName: targetNode.attrs?.connectionName,
          sourceDatabaseType: el.databaseType,
          targetDatabaseType: targetNode.databaseType,
          updateConditionFieldMap,
          tableNames,
          objectNames,
          tableName: targetNode.tableName,
          tableNameRelation
        }
      })
    },

    handleClear() {
      this.$confirm(
        i18n.t('packages_business_components_conditionbox_shifouqingkongsuo'),
        i18n.t('public_message_title_prompt'),
        {
          type: 'warning'
        }
      ).then(res => {
        if (!res) {
          return
        }
        this.clearList()
      })
    },

    handleClearIndexEmpty() {
      this.$confirm(
        i18n.t('packages_business_components_conditionbox_shifouquerenqing'),
        i18n.t('public_message_title_prompt'),
        {
          type: 'warning'
        }
      ).then(res => {
        if (!res) {
          return
        }
        this.list = this.list.filter(t => t.source.sortColumn && t.target.sortColumn)
      })
    },

    clearList() {
      this.list = []
      this.validate()
    },

    getItemOptions() {
      return {
        id: uuid(),
        source: Object.assign({}, TABLE_PARAMS),
        target: Object.assign({}, TABLE_PARAMS),
        showAdvancedVerification: false,
        script: '', //后台使用 需要拼接function头尾
        webScript: '', //前端使用 用于页面展示
        jsEngineName: 'graal.js',
        modeType: 'all' // 待校验模型的类型
      }
    },

    addItem() {
      this.list.push(this.getItemOptions())
    },

    async autoAddTable() {
      if (!this.taskId || this.list.length) return
      this.autoAddTableLoading = true
      this.updateAutoAddTableLoading()
      let connectionIds = []
      let tableNames = []
      const matchNodeList = this.getMatchNodeList()
      matchNodeList.forEach(m => {
        connectionIds.push(m.sourceConnectionId)
        connectionIds.push(m.targetConnectionId)
        tableNames.push(...m.tableNames)
        tableNames.push(...m.objectNames)
      })
      // 加载数据源的Capabilities
      const capabilitiesMap = this.getMatchCapabilitiesMap()
      if (!matchNodeList.length) {
        this.autoAddTableLoading = false
        this.updateAutoAddTableLoading()
        if (this.allStages.length > this.flowStages.length)
          return this.$message.error(i18n.t('packages_business_components_conditionbox_cunzaichulijiedian_wufazidong'))
        return this.$message.error(i18n.t('packages_business_components_conditionbox_suoxuanrenwuque'))
      }
      let where = {
        meta_type: {
          inq: DATA_NODE_TYPES
        },
        'source.id': {
          inq: Array.from(new Set(connectionIds))
        },
        original_name: {
          inq: Array.from(new Set(tableNames))
        },
        taskId: this.taskId
      }
      // this.autoAddTableLoading = true
      // this.updateAutoAddTableLoading()
      metadataInstancesApi
        .findInspect({
          where,
          fields: META_INSTANCE_FIELDS
        })
        .then(data => {
          let list = []
          matchNodeList.forEach(m => {
            const {
              source,
              target,
              sourceName,
              targetName,
              sourceConnectionId,
              targetConnectionId,
              sourceConnectionName,
              targetConnectionName,
              sourceDatabaseType,
              targetDatabaseType,
              updateConditionFieldMap,
              tableNameRelation
            } = m

            const sourceTableList = Object.keys(tableNameRelation)
            sourceTableList.forEach(ge => {
              let item = this.getItemOptions()
              // 填充source
              item.source.nodeId = source
              item.source.nodeName = sourceName
              item.source.databaseType = sourceDatabaseType
              item.source.connectionId = sourceConnectionId
              item.source.connectionName = sourceConnectionName
              item.source.currentLabel = `${sourceName} / ${sourceConnectionName}`
              item.source.table = ge // findTable.original_name
              item.source.capabilities = capabilitiesMap[sourceConnectionId]
              // 填充target
              item.target.nodeId = target
              item.target.nodeName = targetName
              item.target.databaseType = targetDatabaseType
              item.target.connectionId = targetConnectionId
              item.target.connectionName = targetConnectionName
              item.target.currentLabel = `${targetName} / ${targetConnectionName}`
              item.target.table = tableNameRelation[ge] // findTargetTable.original_name
              item.target.capabilities = capabilitiesMap[targetConnectionId]

              const updateList = cloneDeep(updateConditionFieldMap[tableNameRelation[ge]] || [])
              let findTable = data.find(t => t.source.id === sourceConnectionId && t.original_name === ge)
              let findTargetTable = data.find(
                t => t.source.id === targetConnectionId && t.original_name === tableNameRelation[ge]
              )

              if (findTable) {
                let sourceSortColumn = updateList.length
                  ? updateList.join(',')
                  : findTable.sortColumns?.join(',') || this.getPrimaryKeyFieldStr(findTable.fields)

                if (updateList.length && findTargetTable?.fields?.length) {
                  const fieldMap = findTargetTable?.fields?.reduce((acc, t) => {
                    acc[t.field_name] = t.original_field_name
                    return acc
                  }, {})

                  sourceSortColumn = updateList
                    .reduce((acc, t) => {
                      fieldMap[t] && acc.push(fieldMap[t])
                      return acc
                    }, [])
                    .join(',')
                }

                item.source.fields = findTable.fields.map(t => {
                  t.isPrimaryKey = t.primary_key_position > 0
                  return t
                })
                item.source.sortColumn = sourceSortColumn

                const key = [source || '', sourceConnectionId, item.source.table].join()
                this.fieldsMap[key] = item.source.fields
              }

              if (findTargetTable) {
                const targetSortColumn = updateList.length
                  ? updateList.join(',')
                  : findTargetTable.sortColumns?.join(',') || this.getPrimaryKeyFieldStr(findTargetTable.fields)

                item.target.fields = findTargetTable.fields.map(t => {
                  t.isPrimaryKey = t.primary_key_position > 0
                  return t
                })

                item.target.sortColumn = targetSortColumn
                const key = [target || '', targetConnectionId, item.target.table].join()
                this.fieldsMap[key] = item.target.fields
              }

              if (this.autoSuggestJoinFields && !item.source.sortColumn && !item.target.sortColumn) {
                let sourceFields = item.source.fields.filter(t => !t.is_nullable)
                let targetFields = item.target.fields.filter(t => !t.is_nullable)

                sourceFields = sourceFields.length ? sourceFields : item.source.fields
                targetFields = targetFields.length ? targetFields : item.target.fields

                item.source.sortColumn = sourceFields.map(t => t.field_name).join(',')
                item.target.sortColumn = targetFields.map(t => t.field_name).join(',')
              }

              list.push(item)
            })
          })
          if (!list.length) {
            return this.$message.error(i18n.t('packages_business_components_conditionbox_suoxuanrenwuque'))
          }
          this.list = list

          // 显示提示
          this.validate()
        })
        .finally(() => {
          this.autoAddTableLoading = false
          this.updateAutoAddTableLoading()
        })
    },

    removeItem(index) {
      this.list.splice(index, 1)
    },

    loadList() {
      let data = cloneDeep(this.data)
      data.forEach(el => {
        el.modeType = el.source.columns ? 'custom' : 'all'
      })
      this.list = data
    },

    getList() {
      let list = cloneDeep(this.list)
      if (this.taskId) {
        list.forEach(el => {
          if (el.modeType === 'all') {
            el.source.columns = null
            el.target.columns = null
          }
        })
      }
      return list
    },

    async handleChangeConnection(val, item, opt = {}) {
      item.currentLabel = ''
      item.table = '' // 重选连接，清空表
      item.sortColumn = '' // 重选连接，清空表
      item.databaseType = opt.databaseType
      item.capabilities = await this.getConnectionCapabilities(opt.attrs?.connectionId)
      if (!this.taskId) {
        item.connectionName = opt.attrs?.connectionName
        item.currentLabel = item.connectionName
        return
      }
      const { nodeId, nodeName, connectionName } = opt.attrs || {}
      item.nodeId = nodeId
      item.nodeName = nodeName
      item.connectionName = connectionName
      item.currentLabel = `${nodeName} / ${connectionName}`
    },

    getReverseNodeInfo(data = {}) {
      const {
        source,
        target,
        sourceName,
        targetName,
        sourceConnectionId,
        targetConnectionId,
        sourceConnectionName,
        targetConnectionName,
        sourceDatabaseType,
        targetDatabaseType,
        updateConditionFieldMap,
        tableNames,
        tableName
      } = data
      return {
        source: target,
        target: source,
        sourceName: targetName,
        targetName: sourceName,
        sourceConnectionId: targetConnectionId,
        targetConnectionId: sourceConnectionId,
        sourceConnectionName: targetConnectionName,
        targetConnectionName: sourceConnectionName,
        sourceDatabaseType: targetDatabaseType,
        targetDatabaseType: sourceDatabaseType,
        updateConditionFieldMap,
        tableNames,
        tableName
      }
    },

    handleChangeTable(val, item, index, type) {
      const fields = this.getFieldsByItem(item, type)
      item[type].fields = fields
      item[type].sortColumn = this.getPrimaryKeyFieldStr(fields)

      if (item.modeType === 'custom') {
        item.source.columns = []
        item.target.columns = []
      }

      // 绑定任务，则自动填充目标信息
      if (!this.taskId) {
        return
      }

      // 获取连线信息
      const matchNodeList = this.getMatchNodeList()
      let matchNode = matchNodeList.find(t => [t.source, t.target].includes(item[type].nodeId))
      if (!matchNode) {
        return
      }

      if (matchNode.target === item[type].nodeId) {
        matchNode = this.getReverseNodeInfo(matchNode)
      }
      const {
        target,
        targetName,
        targetConnectionId,
        targetConnectionName,
        sourceDatabaseType,
        targetDatabaseType,
        updateConditionFieldMap,
        tableName,
        tableNameRelation = {}
      } = matchNode

      // 自动填充索引字段
      let updateList = updateConditionFieldMap[val] || {}
      item[type].sortColumn = updateList.length ? updateList.join(',') : this.getPrimaryKeyFieldStr(fields)

      if (type === 'target') {
        item.target.databaseType = targetDatabaseType
        return
      }
      // 自动填充目标连接和表
      item.source.databaseType = sourceDatabaseType

      item.target.nodeId = target
      item.target.nodeName = targetName
      item.target.connectionId = targetConnectionId
      item.target.connectionName = targetConnectionName
      item.target.currentLabel = `${targetName} / ${targetConnectionName}`
      item.target.table = tableName ? tableName : tableNameRelation[val]

      // 加载数据源的Capabilities
      const capabilitiesMap = this.getMatchCapabilitiesMap()
      item.target.capabilities = capabilitiesMap[targetConnectionId]

      const key = [target || '', targetConnectionId, item.target.table].join()
      if (this.fieldsMap[key]) {
        item.target.fields = this.fieldsMap[key]
        // 设置主键
        item.target.sortColumn = updateList.length
          ? updateList.join(',')
          : this.getPrimaryKeyFieldStr(item.target.fields)
        return
      }

      // 加载目标的字段
      const params = {
        nodeId: target,
        tableFilter: item.target.table,
        page: 1,
        pageSize: 1
      }
      metadataInstancesApi.nodeSchemaPage(params).then(data => {
        item.target.fields =
          data.items?.[0]?.fields.map(t => {
            const { id, field_name, primary_key_position, primaryKey, unique } = t
            return { id, field_name, primary_key_position, primaryKey, unique }
          }) || []
        // 设置主键
        item.target.sortColumn = updateList.length
          ? updateList.join(',')
          : this.getPrimaryKeyFieldStr(item.target.fields)

        this.fieldsMap[key] = item.target.fields
      })
    },

    handleChangeAdvanced(item, val) {
      Object.assign(item.target, {
        targeFilterFalg: false,
        where: ''
      })
      item.showAdvancedVerification = val
    },

    addScript(index) {
      this.formIndex = index
      this.webScript = ''
      this.jsEngineName = 'graal.js'
      this.dialogAddScriptVisible = true
    },

    handleAddScriptClose() {
      this.webScript = ''
      this.formIndex = ''
      this.jsEngineName = 'graal.js'
      this.dialogAddScriptVisible = false
    },

    submitScript() {
      let task = this.list
      let formIndex = this.formIndex
      task[formIndex].webScript = this.webScript
      task[formIndex].jsEngineName = this.jsEngineName
      this.jsEngineName = ''
      this.webScript = ''
      this.formIndex = ''
      this.dialogAddScriptVisible = false
    },

    editScript(index) {
      this.formIndex = index
      let task = this.list
      let script = JSON.parse(JSON.stringify(task[this.formIndex].webScript))
      this.jsEngineName = JSON.parse(JSON.stringify(task[this.formIndex].jsEngineName || 'nashorn'))
      this.webScript = script
      this.dialogAddScriptVisible = true
    },

    removeScript(index) {
      this.$confirm(
        this.$t('packages_business_verification_message_confirm_delete_script'),
        this.$t('public_button_delete'),
        {
          type: 'warning'
        }
      ).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.list[index].webScript = ''
      })
    },

    setFieldsByItem(item = [], data = []) {
      const key = item.filter(t => t).join()
      this.fieldsMap[key] = data
    },

    getFieldsByItem(item, type = 'source') {
      const { nodeId, connectionId, table } = item[type] || {}
      return this.fieldsMap[[nodeId || '', connectionId, table].filter(t => t).join()] || []
    },

    getPrimaryKeyFieldStr(data = []) {
      let sortField = list => {
        return (
          list?.sort((a, b) => {
            return a.field_name > b.field_name ? -1 : 1
          }) || []
        )
      }
      return sortField(data)
        .filter(f => !!f.primaryKey)
        .map(t => t.field_name)
        .join(',')
    },

    debounceValidate: debounce(function () {
      this.validate()
    }, 200),

    async validate() {
      let tasks = this.getList()

      if (!tasks.length) {
        this.updateErrorMsg('')
        return
      }

      let index = 0
      let message = ''
      // const formDom = document.getElementById('data-verification-form')

      // 检查是否选择表
      const haveTableArr = tasks.filter(c => c.source.table && c.target.table)
      const noTableArr = tasks.filter(c => !c.source.table || !c.target.table)

      if (!haveTableArr.length) {
        message = this.$t('packages_business_verification_form_validate_table_is_empty')
        this.updateErrorMsg(message, 'error')
        return message
      }

      if (noTableArr.length) {
        message = this.$t('packages_business_verification_form_validate_table_is_empty1')
        noTableArr.forEach((el, elIndex) => {
          if (elIndex <= SHOW_COUNT) {
            message += (elIndex > 0 ? ', ' : '') + `${el.source.connectionName}`
            message += (elIndex > 0 ? ', ' : '') + `${el.target.connectionName}`
          }
        })
        if (noTableArr.length > SHOW_COUNT) {
          message += ` ...`
        }
        this.updateErrorMsg(message, 'warn')
        return
      }

      // 检查
      const SHOW_COUNT = 20
      if (['field', 'jointField'].includes(this.inspectMethod)) {
        // 检查数据源的能力
        message = this.validateCapabilities(tasks, 'query_by_advance_filter_function')
        if (message) return message

        // 索引字段为空
        const haveIndexFieldArr = tasks.filter(c => c.source.sortColumn && c.target.sortColumn)
        const noIndexFieldArr = tasks.filter(c => !c.source.sortColumn || !c.target.sortColumn)

        if (!haveIndexFieldArr.length) {
          message = this.$t('packages_business_verification_form_condition_is_empty')
          this.updateErrorMsg(message, 'error')
          return message
        }

        if (noIndexFieldArr.length) {
          message = this.$t('packages_business_verification_form_index_field_is_empty')
          noIndexFieldArr.forEach((el, elIndex) => {
            if (elIndex <= SHOW_COUNT) {
              message += (elIndex > 0 ? ', ' : '') + `${el.source.table}`
              // message += `${el.target.table} `
            }
          })
          if (noIndexFieldArr.length > SHOW_COUNT) {
            message += ` ...` // (${noIndexFieldArr.length - SHOW_COUNT})
          }
          this.updateErrorMsg(message, 'warn')
          return
        }

        // 判断表字段校验时，索引字段是否个数一致
        const countNotArr = tasks.filter(
          c => c.source.sortColumn.split(',').length !== c.target.sortColumn.split(',').length
        )
        if (countNotArr.length) {
          //校验条件{val}中源表与目标表的索引字段个数不相等
          // this.$nextTick(() => {
          //   let item = document.getElementById('item-source-' + (index - 1))
          //   item.querySelector('input').focus()
          // })
          message = this.$t('packages_business_verification_form_index_field_count_is_not_equal')
          countNotArr.forEach((el, elIndex) => {
            if (elIndex <= SHOW_COUNT) {
              message += `${el.source.table} `
              message += `${el.target.table} `
            }
          })
          if (countNotArr.length > SHOW_COUNT) {
            message += `...${countNotArr.length - SHOW_COUNT}`
          }
          // this.jointErrorMessage = message
          this.updateErrorMsg(message, 'warn')
          return
        }

        // 判断过滤设置是否填写完整
        let schemaToFormFlag = false
        for (let i = 0; i < tasks.length; i++) {
          await this.$refs[`schemaToForm_${tasks[i].id}`]?.validate().catch(() => {
            index = i + 1
            schemaToFormFlag = true
          })
        }
        if (schemaToFormFlag) {
          message = this.$t(
            'packages_business_verification_message_error_joint_table_target_or_source_filter_not_set',
            {
              val: index
            }
          )
          this.updateErrorMsg(message, 'error')
          return message
        }

        // 开启高级校验后，JS校验逻辑不能为空
        if (
          this.inspectMethod === 'field' &&
          tasks.some((c, i) => {
            index = i + 1
            return c.showAdvancedVerification && !c.webScript
          })
        ) {
          message = this.$t('packages_business_verification_message_error_script_no_enter')
          this.updateErrorMsg(message, 'error')
          return message
        }
      } else if (this.inspectMethod === 'row_count') {
        // 检查数据源的能力
        message = this.validateCapabilities(tasks, 'batch_count_function')
        if (message) return message
      } else if (this.inspectMethod === 'hash') {
        message = this.validateCapabilities(tasks, 'query_hash_by_advance_filter_function')
        if (message) return message
      }

      this.updateErrorMsg('')
    },

    validateCapabilities(tasks, capability) {
      const noSupportList = new Set()
      tasks.forEach(item => {
        if (!item.source.capabilities?.find(c => c.id === capability)) {
          noSupportList.add(item.source.databaseType)
        }

        if (!item.target.capabilities?.find(c => c.id === capability)) {
          noSupportList.add(item.target.databaseType)
        }
      })

      let message = ''

      if (noSupportList.size) {
        message = this.$t('packages_business_not_support_validation', {
          connection: [...noSupportList].join(', '),
          method: inspectMethodMap[this.inspectMethod]
        })
        this.updateErrorMsg(message, 'error')
        this.$message.error(message)
      }

      return message
    },

    loadDoc() {
      if (this.$i18n.locale === 'en') {
        this.doc = `##### Advanced Verification Instructions
**The first step** The function input parameter is the source table data, you can call the **built-in function** according to the source table data to query the target data<br>
**Step 2** Custom verification logic<br>
**Step 3** The function returns the result<br>

- **result**: whether the verification is passed (passed: verification passed, failed: verification failed), if no or other characters are filled in, the verification fails, required <br>
- **message**: verification exception information, it is recommended to return if verification fails, optional<br>
- **data**: current verification target data, it is recommended to return if verification fails, optional<br>


Full Example: This is an example MongoDB query
\`\`\`\`javascript
function validate(sourceRow){
    // step 1
    var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
    // step 2
    if(sourceRow.USER_ID === targetRow[0].USER_ID){
        // step 3
        return {result: 'passed',message: "",data: ""}
    }else{
        return {result: 'failed', message: "Inconsistent records", data: targetRow}
    }
}
\`\`\`\``
      } else if (this.$i18n.locale === 'zh-TW') {
        this.doc = `##### 高級校驗說明
**第一步** 函數入參為源表數據，可以根據源表數據調用**內置函數**查詢出目標數據<br>
**第二步** 自定義校驗邏輯<br>
**第三步** 函數返回結果<br>

- **result**：是否通過校驗（passed：校驗通過，failed：校驗失敗），如果不填或填其它字符則校驗失敗，必填項<br>
- **message**：校驗異常信息，建議校驗失敗返回，選填項<br>
- **data**：當前校驗目標數據，建議校驗失敗返回，選填項<br>


完整示例：此為MongoDB查詢示例
\`\`\`javascript
function validate(sourceRow){
    // 第1步
    var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
    // 第2步
    if(sourceRow.USER_ID === targetRow[0].USER_ID){
        // 第3步
        return {result: 'passed',message: "",data: ""}
    }else{
        return {result: 'failed',message: "記錄不一致",data: targetRow}
    }
}
\`\`\``
      } else {
        this.doc = `##### 高级校验说明
**第一步** 函数入参为源表数据，可以根据源表数据调用**内置函数**查询出目标数据<br>
**第二步** 自定义校验逻辑<br>
**第三步** 函数返回结果<br>

- **result**：是否通过校验（passed：校验通过，failed：校验失败），如果不填或填其它字符则校验失败，必填项<br>
- **message**：校验异常信息，建议校验失败返回，选填项<br>
- **data**：当前校验目标数据，建议校验失败返回，选填项<br>


完整示例：此为MongoDB查询示例
\`\`\`javascript
function validate(sourceRow){
    // 第1步
    var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
    // 第2步
    if(sourceRow.USER_ID === targetRow[0].USER_ID){
        // 第3步
        return {result: 'passed',message: "",data: ""}
    }else{
        return {result: 'failed',message: "记录不一致",data: targetRow}
    }
}
\`\`\`
`
      }
    },

    getModeTypeDisabled(item) {
      return !(item.source.connectionId && item.source.table && item.target.connectionId && item.target.table)
    },

    handleCustomFields(item, index) {
      this.$refs.fieldDialog.open(item, index, {
        source: this.dynamicSchemaMap[item.source.connectionId],
        target: this.dynamicSchemaMap[item.target.connectionId]
      })
    },

    handleChangeModeType(val, item, index) {
      if (val !== 'custom') {
        item.source.columns = null
        item.target.columns = null
      } else {
        this.handleCustomFields(item, index)
      }

      item.modeType = val // 防止 SchemaToForm 回流
    },

    handleChangeFields(data = [], index) {
      let item = this.list[index]
      item.source.columns = data.map(t => t.source)
      item.target.columns = data.map(t => t.target)
      // 设置modeType
      this.$refs[`schemaToForm_${item.id}`].form.setValuesIn('modeType', 'custom')
    },

    handleFocus(opt = {}) {
      if (opt.fields?.length) {
        return
      }
      const connectionId = opt.connectionId
      const params = {
        where: {
          meta_type: 'table',
          sourceType: 'SOURCE',
          original_name: opt.table,
          'source._id': connectionId
        },
        limit: 1
      }
      metadataInstancesApi
        .tapTables({
          filter: JSON.stringify(params)
        })
        .then((data = {}) => {
          if (isEmpty(data.items[0]?.nameFieldMap)) {
            return
          }
          opt.fields = Object.values(data.items[0]?.nameFieldMap || {}).map(t => {
            return {
              id: t.id,
              label: t.fieldName,
              value: t.fieldName,
              field_name: t.fieldName,
              primary_key_position: t.primaryKey,
              data_type: t.dataType,
              primaryKey: t.primaryKey,
              unique: t.unique,
              type: t.dataType,
              tapType: JSON.stringify(t.tapType)
            }
          })
        })
    },

    async getCapabilities(connectionIds = []) {
      if (!connectionIds.length) return
      const data = await Promise.all(
        connectionIds.map(async id => {
          return {
            id,
            capabilities: await this.getConnectionCapabilities(id)
          }
        })
      )

      return data.reduce((cur, pre) => {
        cur[pre.id] = pre.capabilities
        return cur
      }, {})
    },

    // 获取匹配节点的Capabilities
    getMatchCapabilitiesMap() {
      const list = cloneDeep(this.allStages)
      return list.reduce((cur, pre) => {
        cur[pre.connectionId] = pre.attrs?.capabilities
        return cur
      }, {})
    },

    async getConnectionCapabilities(id) {
      const data = await connectionsApi.getNoSchema(id)
      return data?.capabilities || []
    },

    updateErrorMsg(msg, level = '') {
      this.$emit('update:jointErrorMessage', msg)
      this.$emit('update:errorMessageLevel', level)
    },

    updateAutoAddTableLoading() {
      this.$emit('update:autoAddTableLoading', this.autoAddTableLoading)
    },

    toggleCollate(item, value) {
      if (value) {
        const fields = Object.keys(item.collate || {})
        if (fields.length || !item.sortColumn) return

        const sortColumn = item.sortColumn.split(',')

        this.$set(
          item,
          'collate',
          sortColumn.reduce((acc, key) => {
            acc[key] = ''
            return acc
          }, {})
        )
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.joint-table {
  border-radius: 4px;
  border: 1px solid #e8e8e8;

  &.error {
    border-color: map-get($color, danger);
  }
}

.joint-table-header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  background: map-get($bgColor, normal);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.joint-table-footer {
  padding: 16px 24px;
}

.joint-table-main {
  max-height: 500px;
  overflow-y: auto;

  .joint-table-item {
    padding: 16px 24px;
    display: flex;
    border-bottom: 1px solid map-get($borderColor, light);
  }

  .joint-table-setting {
    flex: 1;
    background-color: map-get($bgColor, white);
  }

  .setting-item {
    display: flex;
    margin-bottom: 0;

    .el-form-item__content {
      display: flex;
      align-items: center;
      line-height: 1;
    }

    .item-label {
      width: 120px;
      line-height: 32px;
      text-align: left;
      color: map-get($fontColor, light);
    }

    .item-icon {
      margin: 0 10px;
      width: 120px;
      line-height: 32px;
      color: map-get($fontColor, light);
      text-align: center;
    }

    .item-time-picker,
    .item-input,
    .item-select,
    .item-filter {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-filter-body {
      padding: 16px;
      background: map-get($fontColor, normal);
      border-radius: 2px;
      color: map-get($fontColor, slight);

      .filter-example-label {
        margin-top: 8px;
        color: #bfd0ff;
        line-height: 17px;
      }

      .filter-example {
        margin-top: 8px;
        padding: 8px;
        line-height: 30px;
        background: #262838;
        color: #82b290;
      }
    }

    .item-value-text {
      flex: 1;
      line-height: 32px;
      padding: 0 16px;
    }

    .item-script {
      margin: 0;
      padding: 16px 24px;
      width: 100%;
      max-height: 130px;
      overflow: auto;
      border-radius: 5px;
      border-left: 5px solid map-get($color, primary);
      background: #eff1f4;
      font-size: 12px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
      line-height: 17px;
    }
  }
}

.FieldList {
  height: 280px;
}

.empty-data {
  ::v-deep {
    .el-select {
      .el-input__inner {
        border-color: #d44d4d;
      }
    }
  }
}

.scheme-to-form {
  ::v-deep {
    .formily-element-form-item-layout-horizontal .formily-element-form-item-control-content-component > .el-switch {
      height: 32px;
      line-height: 32px;
    }
  }
}
</style>

<style lang="scss">
.condition-js-doc-content {
  color: rgb(48, 54, 63);
  font-size: 16px;
  font-weight: 400;
  -webkit-font-smoothing: subpixel-antialiased;
  line-height: 1.5;
  overflow-wrap: break-word;
  hyphens: auto;

  p {
    margin-block-start: 12px;
    margin-block-end: 24px;
    text-align: justify;
  }

  > :first-child,
  section > :first-child,
  td > :first-child {
    margin-block-start: 0px !important;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    position: relative;
    margin-block-start: 24px;
    margin-block-end: 12px;
    font-weight: 600;
    margin: 0px;
  }

  h1 + h2,
  h2 + h3,
  h3 + h4,
  h4 + h5,
  h5 + h6 {
    margin-block-start: 12px;
  }

  h1,
  h2,
  h3 {
    letter-spacing: 0.05em;
  }

  h2 {
    font-size: 24px;
    line-height: 36px;
  }

  h3 {
    font-size: 20px;
    line-height: 36px;
  }

  h4 {
    font-size: 18px;
    line-height: 24px;
  }

  ul {
    list-style-type: disc;
  }

  ul,
  ol {
    padding-inline-start: 32px;
  }

  ul,
  ol,
  dl {
    margin-block-start: 12px;
    margin-block-end: 24px;
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  li {
    line-height: 1.8;
    list-style-type: unset;
  }
}
</style>
