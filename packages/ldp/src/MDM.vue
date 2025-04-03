<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex align-center px-4">
      <span class="fs-6">{{ $t('packages_business_data_console_mdm') }}</span>
      <div class="flex-grow-1"></div>
      <ElTooltip placement="top" :content="$t('packages_dag_build_materialized_view')">
        <IconButton :disabled="mdmNotExist" @click="openMaterializedDialog">materialized</IconButton>
      </ElTooltip>
      <IconButton :disabled="mdmNotExist" @click="showDialog(directory, 'add')">folder-plus</IconButton>
      <IconButton :disabled="mdmNotExist" :class="{ active: enableSearch }" @click="toggleEnableSearch"
        >search-outline</IconButton
      >
      <!--<ElDropdown trigger="click" @command="handleCommand">
            <IconButton class="ml-3">more</IconButton>
            <ElDropdownMenu slot="dropdown">
              <ElDropdownItem command="config"> Configure </ElDropdownItem>
            </ElDropdownMenu>
          </ElDropdown>-->
    </div>
    <div
      ref="treeWrap"
      class="flex flex-column flex-1 position-relative min-h-0 tree-wrap"
      @dragover.stop="handleDragOver"
      @dragenter.stop="handleDragEnter"
      @dragleave.stop="handleDragLeave"
      @drop.stop="handleDrop"
    >
      <div v-if="enableSearch" class="px-2 pt-2">
        <ElInput ref="search" v-model="search" clearable @keydown.stop @keyup.stop @click.stop @input="handleSearch">
          <template #prefix>
            <VIcon size="14" class="ml-1 h-100">search-outline</VIcon>
          </template>
        </ElInput>
      </div>

      <div class="flex-1 min-h-0 position-relative">
        <div
          v-if="search || searchIng"
          class="search-view position-absolute top-0 left-0 w-100 h-100 bg-white"
          v-loading="searchIng"
        >
          <ElTree
            class="ldp-tree h-100"
            ref="tree"
            node-key="id"
            :data="filterTreeData"
            draggable
            default-expand-all
            height="100%"
            wrapper-class-name="p-2"
            :render-content="renderContent"
            :render-after-expand="false"
            :expand-on-click-node="false"
            :allow-drop="checkAllowDrop"
            @node-drag-start="handleDragStart"
            @node-drag-end="handleDragEnd"
            @node-drop="handleSelfDrop"
            @node-expand="handleNodeExpand"
            @handle-scroll="handleScroll"
          ></ElTree>
        </div>
        <template v-else>
          <ElTree
            class="ldp-tree h-100"
            ref="tree"
            node-key="id"
            :data="treeData"
            draggable
            height="100%"
            wrapper-class-name="p-2"
            :empty-text="''"
            :default-expanded-keys="expandedKeys"
            :render-content="renderContent"
            :render-after-expand="false"
            :expand-on-click-node="false"
            :allow-drop="checkAllowDrop"
            @node-drag-start="handleDragStart"
            @node-drag-end="handleDragEnd"
            @node-drop="handleSelfDrop"
            @node-expand="handleNodeExpand"
            @handle-scroll="handleScroll"
          ></ElTree>
          <div
            v-if="!treeData.length"
            class="flex justify-center align-center absolute-fill fs-7 font-color-light px-3"
          >
            <span class="text-center lh-base" v-html="$t('packages_business_mdm_empty_text')"></span>
          </div>
        </template>
      </div>

      <div
        class="drop-mask justify-center align-center absolute-fill font-color-dark fs-6"
        :class="{ flex: allowDrop && !isDragSelf }"
      >
        Clone To MDM
      </div>
      <div
        v-if="mdmNotExist"
        class="drop-mask pe-auto flex justify-center align-center absolute-fill font-color-dark fs-6"
      >
        {{ $t('packages_ldp_connection_expired') }}
      </div>
    </div>

    <ElDialog v-model="taskDialogConfig.visible" :close-on-click-modal="false">
      <template #header>
        <span class="font-color-dark fs-6 fw-sub">{{ $t('packages_business_create_sync_task') }}</span>
      </template>
      <ElForm ref="form" :model="taskDialogConfig" label-width="180px" @submit.prevent :rules="formRules">
        <div class="pipeline-desc p-4 mb-4 text-preline rounded-4">
          {{ $t('packages_business_mdm_create_task_dialog_desc_prefix') }}
          <ul>
            <li>
              {{ $t('packages_business_fdm_create_task_dialog_desc_li1') }}
            </li>
            <li>
              {{ $t('packages_business_fdm_create_task_dialog_desc_li2') }}
            </li>
            <li>
              {{ $t('packages_business_fdm_create_task_dialog_desc_li3') }}
            </li>
          </ul>
          <div>
            {{ $t('packages_business_mdm_create_task_dialog_desc_suffix') }}
          </div>
          <div>
            {{ $t('packages_business_mdm_create_task_dialog_desc_table_name') }}
          </div>
        </div>
        <ElFormItem :label="$t('public_table_name')">
          <ElInput v-model="taskDialogConfig.newTableName">
            <template v-slot:prepend>{{ tablePrefix }}</template>
          </ElInput>
        </ElFormItem>
        <ElFormItem :label="$t('packages_dag_task_setting_sync_type')" prop="task.type">
          <ElRadioGroup v-model="taskDialogConfig.task.type">
            <ElTooltip
              :disabled="!taskDialogConfig.notSupportedCDC"
              :content="$t('packages_ldp_not_support_increments')"
            >
              <ElRadio label="initial_sync+cdc" :disabled="taskDialogConfig.notSupportedCDC">
                {{ $t('packages_dag_task_setting_initial_sync_cdc') }}
              </ElRadio>
            </ElTooltip>

            <ElRadio label="initial_sync">
              {{ $t('public_task_type_initial_sync') }}
            </ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <div class="flex align-center gap-3" v-if="taskDialogConfig.task.type === 'initial_sync'">
          <ElFormItem :label="$t('packages_dag_task_setting_crontabExpressionFlag')" prop="task.crontabExpressionType">
            <ElSelect
              v-model="taskDialogConfig.task.crontabExpressionType"
              @change="handleChangeCronType"
              class="flex-1"
            >
              <ElOption v-bind="opt" v-for="(opt, i) in cronOptions" :key="i"></ElOption>
            </ElSelect>
          </ElFormItem>
          <ElFormItem
            v-if="taskDialogConfig.task.crontabExpressionType === 'custom'"
            prop="task.crontabExpression"
            label-width="0"
          >
            <ElInput v-model="taskDialogConfig.task.crontabExpression"></ElInput>
          </ElFormItem>
        </div>
      </ElForm>
      <template v-slot:footer>
        <span class="dialog-footer">
          <ElButton @click="taskDialogConfig.visible = false">{{ $t('public_button_cancel') }}</ElButton>
          <ElButton :loading="creating" @click="taskDialogSubmit(false)">{{
            $t('packages_business_save_only')
          }}</ElButton>
          <ElButton :loading="creating" type="primary" @click="taskDialogSubmit(true)">
            {{ $t('packages_business_save_and_run_now') }}
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog v-model="dialogConfig.visible" width="30%" :close-on-click-modal="false">
      <template #header>
        <span class="fs-6 fw-sub">{{ dialogConfig.title }}</span>
      </template>
      <ElForm ref="form" :model="dialogConfig" label-width="90px" label-position="top">
        <ElFormItem :label="$t('packages_component_src_discoveryclassification_mulumingcheng')">
          <ElInput
            v-model="dialogConfig.label"
            :placeholder="$t('packages_component_classification_nodeName')"
            maxlength="50"
            show-word-limit
          ></ElInput>
        </ElFormItem>
        <!--<ElFormItem
              :label="$t('packages_component_src_discoveryclassification_mulufenlei')"
              v-if="dialogConfig.isParent"
            >
              <ElSelect v-model="dialogConfig.itemType" :disabled="dialogConfig.type === 'edit'">
                <el-option
                  :label="$t('packages_component_src_discoveryclassification_ziyuanmulu')"
                  value="resource"
                ></el-option>
                &lt;!&ndash;            <el-option label="任务目录" value="task"></el-option>&ndash;&gt;
              </ElSelect>
            </ElFormItem>-->
        <ElFormItem :label="$t('packages_component_src_discoveryclassification_mulumiaoshu')">
          <ElInput
            type="textarea"
            v-model="dialogConfig.desc"
            :placeholder="$t('packages_component_src_discoveryclassification_qingshurumulu')"
            maxlength="50"
            show-word-limit
          ></ElInput>
        </ElFormItem>
      </ElForm>
      <template v-slot:footer>
        <span class="dialog-footer">
          <ElButton @click="hideDialog()">{{ $t('public_button_cancel') }}</ElButton>
          <ElButton type="primary" @click="dialogSubmit()">
            {{ $t('public_button_confirm') }}
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog v-model="showMaterialized" width="480px" :close-on-click-modal="false" @opened="handleDialogOpened">
      <template #header>
        <span class="fs-6 fw-sub">{{ $t('packages_dag_build_materialized_view') }}</span>
      </template>
      <ElForm ref="form" label-width="90px" label-position="top" class="my-n6" @submit.prevent>
        <ElFormItem :label="$t('packages_dag_materialized_view_storage_table')">
          <ElInput ref="tableNameInput" v-model="materializedTableName">
            <template #prepend>{{ tablePrefix }}</template>
          </ElInput>
        </ElFormItem>
        <ElFormItem :label="$t('packages_ldp_mdm_create_method')">
          <ElRadioGroup v-model="createMethod">
            <ElRadio label="transformation">{{ $t('packages_ldp_mdm_create_method_transformation') }}</ElRadio>
            <ElRadio label="materialized">{{ $t('packages_ldp_mdm_create_method_materialized') }}</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template v-slot:footer>
        <span class="dialog-footer">
          <ElButton @click="showMaterialized = false">{{ $t('public_button_cancel') }}</ElButton>
          <ElButton type="primary" :disabled="!materializedTableName.trim()" @click="createMaterializedView">
            {{ $t('public_button_confirm') }}
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script lang="jsx">
import { h } from 'vue'
import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
import i18n from '@tap/i18n'

import { debounce } from 'lodash'
import { VirtualTree, IconButton } from '@tap/component'
import { CancelToken, discoveryApi, ldpApi, metadataDefinitionsApi, userGroupsApi } from '@tap/api'
import { uuid, generateId } from '@tap/shared'
import { makeDragNodeImage, TASK_SETTINGS, DatabaseIcon } from '@tap/business'
import commonMix from './mixins/common'

export default {
  name: 'MDM',
  props: {
    directory: Object,
    settings: Object,
    dragState: Object,
    mdmConnection: Object,
    mdmNotExist: Boolean,
    eventDriver: Object,
    loadingDirectory: Boolean,
    mapCatalog: {
      type: Function,
      require: true,
    },
  },
  components: { DatabaseIcon, VirtualTree, IconButton },
  mixins: [commonMix],
  data() {
    return {
      creating: false,
      taskDialogConfig: {
        from: null,
        to: null,
        visible: false,
        prefix: 'f_',
        tableName: null,
        newTableName: null,
        notSupportedCDC: false,
        task: {
          type: 'initial_sync+cdc',
          crontabExpressionFlag: false,
          crontabExpression: '',
          crontabExpressionType: 'once',
        },
      },
      expandedKeys: [],
      dialogConfig: {
        type: 'add',
        id: '',
        gid: '',
        label: '',
        title: '',
        itemType: 'resource',
        desc: '',
        visible: false,
      },
      searchIng: false,
      search: '',
      enableSearch: false,
      filterTreeData: [],
      tablePrefix: 'MDM_',
      showMaterialized: false,
      materializedTableName: '',
      createMethod: 'transformation',
    }
  },
  computed: {
    treeData() {
      return this.directory?.children || []
    },

    allowDrop() {
      return (
        !this.mdmNotExist &&
        this.dragState.isDragging &&
        ['SOURCE', 'FDM'].includes(this.dragState.from) &&
        this.dragState.draggingObjects[0]?.data.LDP_TYPE === 'table'
      )
    },

    isDragSelf() {
      return this.dragState.isDragging && this.dragState.from === 'MDM'
    },
  },
  watch: {
    loadingDirectory(v) {
      if (!v) {
        this.setNodeExpand()
      }
    },
  },
  created() {
    this.debouncedSearch = debounce(this.searchObject, 300)
  },
  mounted() {
    // this.setNodeExpand()
    if (!this.loadingDirectory) {
      this.$nextTick(() => {
        this.setNodeExpand()
      })
    }
  },
  methods: {
    renderContent(h, { node, data }) {
      let icon
      let actions
      data.SWIM_TYPE = 'mdm'

      if (!data.isObject) {
        actions = [
          <IconButton
            sm
            onClick={(ev) => {
              ev.stopPropagation()
              this.showDialog(data, 'add')
            }}
          >
            add
          </IconButton>,
          <ElDropdown placement="bottom" trigger="click" onCommand={(command) => this.handleMoreCommand(command, data)}>
            {{
              default: () => (
                <IconButton
                  onClick={(ev) => {
                    ev.stopPropagation()
                  }}
                  sm
                >
                  more
                </IconButton>
              ),
              dropdown: () => (
                <ElDropdownMenu>
                  <ElDropdownItem command="edit">{this.$t('public_button_edit')}</ElDropdownItem>
                  <ElDropdownItem command="delete">{this.$t('public_button_delete')}</ElDropdownItem>
                </ElDropdownMenu>
              ),
            }}
          </ElDropdown>,
        ]
      }

      if (data.LDP_TYPE === 'table') {
        node.isLeaf = true
        icon = 'table'
      } else {
        node.isLeaf = false
        icon = 'folder-o'
      }

      return (
        <div
          class="custom-tree-node grabbable flex justify-content-between"
          onClick={() => {
            data.isObject &&
              $emit(this, 'preview', data, this.mdmConnection, {
                onDelete: (tagId) => {
                  // this.setNodeExpand(tagId)
                  this.$refs.tree.remove(data.id)
                },
              })
          }}
          onDragenter={(ev) => {
            ev.stopPropagation()
            this.handleTreeDragEnter(ev, data, node)
          }}
          onDragover={(ev) => {
            ev.stopPropagation()
            this.handleTreeDragOver(ev, data, node)
          }}
          onDragleave={(ev) => {
            ev.stopPropagation()
            this.handleTreeDragLeave(ev, data, node)
          }}
          onDrop={(ev) => {
            ev.stopPropagation()
            this.handleTreeDrop(ev, data, node)
          }}
        >
          <div class="flex align-center flex-fill mr-2">
            <div class="flex-fill w-0 inline-flex align-items-center">
              <span
                id={data.isObject ? `ldp_mdm_table_${data.id}_${data.name}` : ''}
                class="inline-flex align-items-center overflow-hidden"
              >
                {icon && (
                  <VIcon size="18" class="tree-item-icon mr-2">
                    {icon}
                  </VIcon>
                )}
                <span title={data.name} class="table-label">
                  {data.name}
                </span>
              </span>
            </div>
          </div>
          <div>
            {data.comment && <span class="font-color-sslight">{`(${data.comment})`}</span>}
            {data.isObject ? (
              <ElTooltip content={i18n.t('packages_ldp_view_lineage')} placement="top">
                <VIcon
                  size="18"
                  class="lineage-icon"
                  onClick={(ev) => {
                    ev.stopPropagation()
                    this.handleFindLineage(data)
                  }}
                >
                  suyuan
                </VIcon>
              </ElTooltip>
            ) : (
              <div class="btn-menu">{actions}</div>
            )}
          </div>
        </div>
      )
    },

    handleCommand(command) {
      switch (command) {
        case 'config':
          $emit(this, 'show-settings')
          break
      }
    },

    handleDragOver(ev) {
      ev.preventDefault()
    },

    handleDragEnter(ev) {
      ev.preventDefault()

      if (!this.allowDrop) return

      const dropNode = this.findParentByClassName(ev.currentTarget, 'tree-wrap')
      dropNode.classList.add('is-drop')
    },

    handleDragLeave(ev) {
      ev.preventDefault()
      console.log('handleDragLeave') // eslint-disable-line
      if (!this.allowDrop) return
      if (!ev.currentTarget.contains(ev.relatedTarget)) {
        console.log('handleDragLeave✌️', ev) // eslint-disable-line
        this.removeDropEffect(ev, 'tree-wrap', 'is-drop')
      }
    },

    handleDrop(ev) {
      ev.preventDefault()

      this.removeDropEffect(ev, 'tree-wrap', 'is-drop')

      if (!this.allowDrop) return

      this.showTaskDialog()
    },

    findParentByClassName(parent, cls) {
      while (parent && !parent.classList.contains(cls)) {
        parent = parent.parentNode
      }
      return parent
    },

    showTaskDialog(tagId) {
      const {
        draggingObjects: [object],
      } = this.dragState

      this.taskDialogConfig.from = object.parent.data
      this.taskDialogConfig.tableName = object.data.name
      this.taskDialogConfig.newTableName = object.data.name.replace(/^FDM_/, '')
      this.taskDialogConfig.tagId = tagId
      this.taskDialogConfig.visible = true
      this.$refs.form?.resetFields()
      this.taskDialogConfig.task.crontabExpressionFlag = false
      this.taskDialogConfig.task.crontabExpression = ''

      const capbilitiesMap = this.taskDialogConfig.from.capabilities.reduce((map, item) => {
        map[item.id] = true
        return map
      }, {})

      if (
        !(
          capbilitiesMap['stream_read_function'] ||
          capbilitiesMap['raw_data_callback_filter_function'] ||
          capbilitiesMap['raw_data_callback_filter_function_v2'] ||
          (capbilitiesMap['query_by_advance_filter_function'] && capbilitiesMap['batch_read_function'])
        )
      ) {
        this.taskDialogConfig.notSupportedCDC = true
        this.taskDialogConfig.task.type = 'initial_sync'
      } else {
        this.taskDialogConfig.notSupportedCDC = false
      }
    },

    async taskDialogSubmit(start, confirmTable) {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return
        const { tableName, from, newTableName, tagId, task: settings } = this.taskDialogConfig
        let task = Object.assign(this.makeTask(from, tableName, this.tablePrefix + newTableName), settings)
        this.creating = true
        try {
          const result = await ldpApi.createMDMTask(task, {
            silenceMessage: true,
            params: { tagId, confirmTable, start },
          })
          this.taskDialogConfig.visible = false
          this.$message.success({
            message: h(
              'span',
              {
                class: 'color-primary fs-7 clickable',
                on: {
                  click: () => {
                    this.handleClickName(result)
                  },
                },
              },
              this.$t('packages_business_task_created_success'),
            ),
          })
          setTimeout(() => {
            this.setNodeExpand(tagId)
          }, 1000)
        } catch (response) {
          console.log(response) // eslint-disable-line
          const code = response?.data?.code
          const data = response?.data?.data
          if (code === 'Ldp.MdmTargetNoPrimaryKey' && data) {
            this.taskDialogConfig.visible = false
            this.$message.warning({
              duration: 6000,
              showClose: true,
              message: h(
                'span',
                {
                  class: 'color-primary fs-7 clickable',
                  on: {
                    click: () => {
                      this.handleClickName(data)
                    },
                  },
                },
                this.$t('packages_business_task_created_fail_no_primary_key'),
              ),
            })
            setTimeout(() => {
              this.setNodeExpand(tagId)
            }, 1000)
          } else if (code === 'Ldp.RepeatTableName') {
            this.$confirm('', i18n.t('packages_business_mdm_table_duplication_confirm'), {
              onlyTitle: true,
              type: 'warning',
              closeOnClickModal: false,
              zIndex: 999999,
            }).then((resFlag) => {
              if (!resFlag) {
                return
              }
              this.taskDialogSubmit(start, true)
            })
          } else if (code === 'Task.ListWarnMessage' && data) {
            const keys = Object.keys(data)
            const msg = data[keys[0]]?.[0]?.msg
            this.$message.error(msg || response.data.message || this.$t('public_message_save_fail'))
          } else {
            this.$message.error(response.data.message || this.$t('public_message_save_fail'))
          }
        }
        this.creating = false
      })
    },

    makeTask(from, tableName, newTableName) {
      let source = this.getTableNode(from, tableName)
      let target = this.getTableNode(this.mdmConnection, newTableName)
      return {
        ...TASK_SETTINGS,
        syncType: 'sync',
        name: this.getTaskName(from, tableName, newTableName),
        dag: {
          edges: [{ source: source.id, target: target.id }],
          nodes: [source, target],
        },
      }
    },

    getTableNode(db = {}, tableName) {
      return {
        id: uuid(),
        type: 'table',
        name: tableName,
        tableName,
        connectionId: db.id,
        databaseType: db.database_type,
        attrs: {
          connectionName: db.name,
          connectionType: db.connection_type,
          accessNodeProcessId: db.accessNodeProcessId,
          pdkType: db.pdkType,
          pdkHash: db.pdkHash,
          capabilities: db.capabilities || [],
          hasCreated: false,
        },
      }
    },

    getTaskName(from, tableName, newTableName) {
      return `${from.name}_Sync_${tableName}_To_MDM_${newTableName}_${generateId(6)}`
    },

    async handleNodeExpand(data, node, forceLoadTable) {
      // 十秒内加载过资源，不再继续加载
      if (!forceLoadTable && node.loadTime && Date.now() - node.loadTime < 10000) return

      node.loadTime = Date.now()
      node.loading = true
      let objects = await this.loadObjects(data)
      node.loading = false

      const childrenMap = data.children ? data.children.reduce((map, item) => ((map[item.id] = true), map), {}) : {}

      objects.forEach((item) => {
        if (childrenMap[item.id]) {
          delete childrenMap[item.id]
          return
        }
        item.parent_id = data.id
        item.isObject = true
        item.connectionId = item.sourceConId
        this.$refs.tree.append(item, node)
      })

      // 删除不存在的模型节点
      Object.entries(childrenMap).forEach(([key, item]) => {
        if (item.isObject) {
          this.$refs.tree.remove(key)
        }
      })
    },

    setNodeExpand(tagId, forceLoadTable) {
      if (!tagId || tagId === this.directory?.id) {
        this.directory?.id && this.handleNodeExpand(this.directory, this.$refs.tree.root, forceLoadTable)
      } else {
        const node = this.$refs.tree.getNode(tagId)
        this.handleNodeExpand(node.data, node, forceLoadTable)
        this.expandedKeys = [tagId]
      }
    },

    handleTreeDragOver(ev) {
      ev.preventDefault()
    },

    handleTreeDragEnter(ev, data) {
      ev.preventDefault()

      if (this.allowDrop && data.isObject) return
      if (!this.allowDrop && !this.isDragSelf) return

      const dropNode = this.findParentNodeByClassName(ev.currentTarget, 'el-tree-node')
      dropNode.classList.add('is-drop-inner')
    },

    handleTreeDragLeave(ev, data) {
      ev.preventDefault()
      if (!this.allowDrop && !this.isDragSelf) return
      if (!ev.currentTarget.contains(ev.relatedTarget)) {
        this.removeDropEffect(ev, 'el-tree-node')
        if (!ev.relatedTarget) {
          this.removeDropEffect(ev, 'tree-wrap', 'is-drop')
        }
      }
    },

    handleTreeDrop(ev, data) {
      ev.preventDefault()

      if (!this.allowDrop) return

      this.removeDropEffect(ev, 'el-tree-node')
      this.removeDropEffect(ev, 'tree-wrap', 'is-drop')

      this.showTaskDialog(!data.isObject ? data.id : undefined)
      console.log('handleTreeDrop') // eslint-disable-line
    },

    handleSelfDrop(draggingNode, dropNode, dropType, ev) {
      if (dropNode.data.isObject) return
      if (!draggingNode.data.isObject) {
        metadataDefinitionsApi
          .changeById({
            id: draggingNode.data.id,
            parent_id: dropNode.data.id || '',
          })
          .then(() => {
            this.$message.success(this.$t('public_message_operation_success'))
            draggingNode.data.parent_id = dropNode.data.id
            // this.getData()
          })
          .catch((err) => {
            this.$message.error(err.message)
          })
      } else {
        this.moveTag(draggingNode.data.parent_id, dropNode.data.id, [draggingNode.data])
      }
    },

    findParentNodeByClassName(el, cls) {
      let parent = el.parentNode
      while (parent && !parent.classList.contains(cls)) {
        parent = parent.parentNode
      }
      return parent
    },

    removeDropEffect(ev, cls = 'wrap__item', removeCls = 'is-drop-inner') {
      const dropNode = this.findParentByClassName(ev.currentTarget, cls)
      dropNode.classList.remove(removeCls)
    },

    handleDragStart(draggingNode, ev) {
      draggingNode = {
        ...draggingNode,
        parent: {
          data: this.mdmConnection,
        },
      }
      this.draggingNode = draggingNode
      this.draggingNodeImage = makeDragNodeImage(
        ev.currentTarget.querySelector('.tree-item-icon'),
        draggingNode.data.name,
      )
      ev.dataTransfer.setDragImage(this.draggingNodeImage, 4, 4)
      ev.dataTransfer.effectAllowed = 'copy'
      this.dragState.isDragging = true
      this.dragState.draggingObjects = [draggingNode]
      this.dragState.from = 'MDM'
    },

    handleDragEnd() {
      $emit(this, 'node-drag-end')
    },

    showDialog(data, dialogType) {
      let type = dialogType || 'add'
      let itemType = 'resource'
      if (data && data.item_type) {
        itemType = data.item_type?.join('')
      }
      this.dialogConfig = {
        itemType: itemType,
        visible: true,
        type,
        item: data,
        id: data ? data.id : '',
        gid: data?.gid || '',
        label: type === 'edit' ? data.name : '',
        isParent: true,
        desc: type === 'edit' ? data?.desc : '',
        title:
          type === 'add' ? this.$t('packages_component_classification_addChildernNode') : this.$t('public_button_edit'),
      }
    },
    hideDialog() {
      this.dialogConfig.visible = false
    },
    async dialogSubmit() {
      let config = this.dialogConfig
      let value = config.label
      let id = config.id
      let itemType = [config.itemType]
      let method = 'post'

      if (!value || value.trim() === '') {
        this.$message.error(this.$t('packages_component_classification_nodeName'))
        return
      }

      let params = {
        item_type: itemType,
        desc: config.desc,
        value,
      }

      if (config.type === 'edit') {
        method = 'changeById'
        params.id = id
        delete params.item_type
      } else if (id) {
        params.parent_id = id
      }

      try {
        const data = await metadataDefinitionsApi[method](params)
        this.hideDialog()
        this.$message.success(this.$t('public_message_operation_success'))
        if (data && config.type === 'add') {
          this.dialogConfig.item.children.push(this.mapCatalog(data))
        } else if (config.type === 'edit') {
          this.dialogConfig.item.name = params.value
          this.dialogConfig.item.desc = params.desc
        }
      } catch (err) {
        this.$message.error(err.message)
      }
    },

    checkAllowDrop(draggingNode, dropNode, type) {
      return type === 'inner' && this.isDragSelf && !dropNode.data.isObject
    },

    async moveTag(from, to, objects) {
      if (from === to) return

      const tagBindingParams = objects.map((t) => {
        return {
          id: t.id,
          objCategory: t.category,
        }
      })
      /*await discoveryApi.patchTags({
      tagBindingParams,
      tagIds: [from]
    })*/
      await discoveryApi.postTags({
        tagBindingParams,
        tagIds: [to],
        oldTagIds: [from],
      })
      objects.forEach((item) => (item.parent_id = to))
      this.$message.success(this.$t('public_message_operation_success'))
    },

    handleMoreCommand(command, data) {
      switch (command) {
        case 'add':
        case 'edit':
          this.showDialog(data, command)
          break
        case 'delete':
          this.deleteNode(data)
      }
    },

    deleteNode(data) {
      this.$confirm(
        this.$t('packages_business_catalog_delete_confirm_message'),
        `${this.$t('public_message_delete_confirm')}: ${data.name}?`,
        {
          confirmButtonText: this.$t('public_button_delete'),
          cancelButtonText: this.$t('packages_component_message_cancel'),
          type: 'warning',
          closeOnClickModal: false,
        },
      ).then((resFlag) => {
        if (!resFlag) {
          return
        }
        metadataDefinitionsApi.delete(data.id).then(() => {
          this.$refs.tree.remove(data.id)

          // 删除目录刷新上一级加载被删除目录下的表
          this.setNodeExpand(data.parent_id, true)
        })
      })
    },

    handleFindLineage(data) {
      const el = document.getElementById(`ldp_mdm_table_${data.id}_${data.name}`)
      $emit(this, 'find-parent', this.findParentByClassName(el, 'el-tree-node__content'), data)
    },

    handleScroll: debounce(function () {
      $emit(this, 'on-scroll')
    }, 200),

    openMaterializedDialog() {
      this.materializedTableName = ''
      this.showMaterialized = true
      this.createMethod = 'transformation'
    },

    createMaterializedView() {
      const tableName = this.materializedTableName.trim()

      if (!tableName) return

      this.$router.push({
        name: 'DataflowNew',
        query: {
          by: this.createMethod === 'transformation' ? 'transformation-materialized' : 'materialized-view',
          connectionId: this.mdmConnection.id,
          tableName: this.tablePrefix + tableName,
        },
      })
    },

    handleDialogOpened() {
      this.$nextTick(() => {
        this.$refs.tableNameInput.focus()
      })
    },
  },
  emits: ['preview', 'find-parent', 'show-settings', 'node-drag-end', 'handle-connection'],
}
</script>

<style lang="scss" scoped>
.ldp-tree {
  :deep(.el-tree-node__content) {
    .lineage-icon {
      color: map-get($color, info);
    }
    &:hover {
      .lineage-icon {
        color: map-get($color, primary);
      }
    }
  }
}
</style>
