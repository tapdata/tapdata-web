<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex align-center px-4">
      <span class="fs-6">{{ $t('packages_business_data_console_fdm') }}</span>
      <div class="flex-grow-1"></div>
      <IconButton :disabled="fdmNotExist" :class="{ active: enableSearch }" @click="toggleEnableSearch"
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

      <div v-if="!showParentLineage" class="flex-1 min-h-0 position-relative">
        <div
          v-if="showSearch"
          class="search-view position-absolute top-0 left-0 w-100 h-100 bg-white"
          v-loading="searchIng"
        >
          <VirtualTree
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
            :allow-drop="() => false"
            :allow-drag="checkAllowDrag"
            @node-drag-start="handleDragStart"
            @node-drag-end="handleDragEnd"
          ></VirtualTree>
        </div>
        <template v-else>
          <VirtualTree
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
            :allow-drop="() => false"
            :allow-drag="checkAllowDrag"
            @node-drag-start="handleDragStart"
            @node-drag-end="handleDragEnd"
            @node-expand="handleNodeExpand"
            @node-collapse="handeNodeCollapse"
          ></VirtualTree>
          <div
            v-if="!treeData.length"
            class="flex justify-center align-center absolute-fill fs-7 font-color-light px-3"
          >
            <span class="text-center lh-base" v-html="$t('packages_business_fdm_empty_text')"></span>
          </div>
        </template>
      </div>
      <div v-else class="flex-1 min-h-0 position-relative">
        <div class="search-view position-absolute top-0 left-0 w-100 h-100 bg-white">
          <VirtualTree
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
            :allow-drop="() => false"
            :allow-drag="checkAllowDrag"
            @node-drag-start="handleDragStart"
            @node-drag-end="handleDragEnd"
          ></VirtualTree>
        </div>
      </div>

      <div
        class="drop-mask justify-center align-center absolute-fill font-color-dark fs-6"
        :class="{ flex: allowDrop }"
      >
        Clone To FDM
      </div>

      <div
        v-if="fdmNotExist"
        class="drop-mask pe-auto flex justify-center align-center absolute-fill font-color-dark fs-6"
      >
        {{ $t('packages_ldp_connection_expired') }}
      </div>
    </div>
    <ElDialog v-model="taskDialogConfig.visible" width="600" :close-on-click-modal="false">
      <template #header>
        <span class="font-color-dark fs-6 fw-sub">{{ $t('packages_business_create_clone_task') }}</span>
      </template>
      <ElForm ref="form" :model="taskDialogConfig" label-width="180px" @submit.prevent :rules="formRules">
        <div class="pipeline-desc p-4 mb-4 text-preline rounded-4">
          <span>{{ $t('packages_business_fdm_create_task_dialog_desc_prefix') }}</span
          ><span v-if="taskDialogConfig.from" class="inline-flex align-center px-1 font-color-dark fw-sub align-top"
            ><DatabaseIcon :item="taskDialogConfig.from" :key="taskDialogConfig.from.pdkHash" :size="20" class="mr-1" />
            <span>{{ taskDialogConfig.from.name }}</span> </span
          ><span v-if="taskDialogConfig.tableName" class="inline-flex font-color-dark fw-sub"
            >/<span class="px-1">{{ taskDialogConfig.tableName }}</span> </span
          ><span>{{ $t('packages_business_fdm_create_task_dialog_desc_suffix') }}</span>
        </div>

        <ElFormItem :label="$t('packages_business_table_prefix')" prop="prefix">
          <ElInput v-model="taskDialogConfig.prefix" :maxlength="maxPrefixLength" class="inline-flex inline-flex-input">
            <template v-slot:prepend>{{ fixedPrefix }}</template>
            <template v-slot:append>
              <span v-if="taskDialogConfig.tableName" :title="taskDialogConfig.tableName">
                _{{ taskDialogConfig.tableName }}
              </span>
              <span v-else> _&lt;original_table_name&gt; </span>
            </template>
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
              v-model:value="taskDialogConfig.task.crontabExpressionType"
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
            <ElInput v-model:value="taskDialogConfig.task.crontabExpression"></ElInput>
          </ElFormItem>
        </div>
      </ElForm>
      <template v-slot:footer>
        <span class="dialog-footer">
          <ElButton @click="taskDialogConfig.visible = false">{{ $t('public_button_cancel') }}</ElButton>
          <ElButton :loading="creating" @click="taskDialogSubmit(false)">{{
            $t('packages_business_save_only')
          }}</ElButton>
          <ElButton
            :loading="creating || checkCanStartIng"
            :disabled="!taskDialogConfig.canStart"
            type="primary"
            @click="taskDialogSubmit(true)"
          >
            {{ $t('packages_business_save_and_run_now') }}
          </ElButton>
        </span>
      </template>
    </ElDialog>
    <ElDialog v-model="dialogConfig.visible" width="30%" :close-on-click-modal="false">
      <template #header>
        <span class="fs-6 fw-sub">{{ dialogConfig.title }}</span>
      </template>
      <ElForm ref="form" :model="dialogConfig" label-width="90px">
        <ElFormItem :label="$t('packages_component_src_discoveryclassification_mulumingcheng')">
          <ElInput
            v-model:value="dialogConfig.label"
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
            v-model:value="dialogConfig.desc"
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
  </div>
</template>

<script lang="jsx">
import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
import i18n from '@tap/i18n'

import { merge, debounce, cloneDeep } from 'lodash'
import { connectionsApi, ldpApi, metadataDefinitionsApi } from '@tap/api'
import { VirtualTree, IconButton, VExpandXTransition } from '@tap/component'
import { uuid, generateId } from '@tap/shared'
import { validateCron } from '@tap/form'
import { makeDragNodeImage, TASK_SETTINGS, DatabaseIcon, makeStatusAndDisabled } from '@tap/business'
import commonMix from './mixins/common'

export default {
  name: 'FDM',
  props: {
    dragState: Object,
    settings: Object,
    fdmConnection: Object,
    fdmNotExist: Boolean,
    directory: Object,
    eventDriver: Object,
    mapCatalog: Function,
    showParentLineage: Boolean,
  },
  components: { VirtualTree, IconButton, DatabaseIcon, VExpandXTransition },
  mixins: [commonMix],
  data() {
    return {
      fixedPrefix: 'FDM_',
      maxPrefixLength: 10,
      keyword: '',
      taskType: '',
      taskDialogConfig: {
        from: null,
        to: null,
        visible: false,
        prefix: '',
        tableName: null,
        canStart: false,
        notSupportedCDC: false,
        task: {
          type: 'initial_sync+cdc',
          crontabExpressionFlag: false,
          crontabExpression: '',
          crontabExpressionType: 'once',
        },
      },
      creating: false,
      expandedKeys: [],
      searchIng: false,
      search: '',
      enableSearch: false,
      filterTreeData: [],
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
      checkCanStartIng: false,
      startedTags: [],
      prefixMap: {},
    }
  },
  computed: {
    showSearch() {
      return this.search || this.searchIng
    },
    allowDrop() {
      return (
        !this.fdmNotExist &&
        this.dragState.isDragging &&
        this.dragState.from === 'SOURCE' &&
        this.dragState.draggingObjects[0]?.data.LDP_TYPE === 'table'
      )
    },
    treeData() {
      return this.directory?.children || []
    },
    treeMap() {
      return this.treeData.reduce((obj, item) => ((obj[item.id] = item), obj), {})
    },
  },
  watch: {
    loadingDirectory(v) {
      if (!v) {
        this.loadTask()
      }
    },
  },
  created() {
    this.debouncedSearch = debounce(this.searchObject, 300)
  },
  mounted() {
    if (!this.loadingDirectory) {
      this.$nextTick(() => {
        this.loadTask()
      })
    }
    this.autoUpdateObjects()
  },
  beforeUnmount() {
    this.eventDriver.off('source-drag-end')
    clearInterval(this.autoUpdateObjectsTimer)
  },
  methods: {
    autoUpdateObjects() {
      this.autoUpdateObjectsTimer = setInterval(() => {
        if (this.showSearch) return
        this.expandedKeys.forEach((id) => {
          this.updateObject(id)
        })
        this.loadTask()
      }, 5000)
    },

    async updateObject(id) {
      const node = this.$refs.tree.getNode(id)

      if (node) {
        node.loadTime = Date.now()
        let objects = await this.loadObjects(node.data)
        this.$refs.tree.updateKeyChildren(id, objects)
      }
    },

    openRoute(route, newTab = true) {
      if (newTab) {
        window.open(this.$router.resolve(route).href)
      } else {
        this.$router.push(route)
      }
    },

    renderContent(h, { node, data }) {
      let icon
      let className = ['custom-tree-node', 'overflow-visible', 'position-relative', 'min-width-0']

      if (data.isObject) {
        className.push('grabbable')
      }

      if (data.LDP_TYPE === 'table') {
        node.isLeaf = true
        icon = 'table'
      } else {
        node.isLeaf = false
        icon = 'folder-o'
      }

      let actions = []

      if (!data.isObject) {
        if (data.children.some((child) => child.isVirtual)) {
          actions.push(
            <IconButton
              sm
              disabled={node.loading}
              onClick={() => {
                this.startTagTask(data, node)
              }}
            >
              play-circle
            </IconButton>,
          )
        }
        actions.push(
          <ElDropdown
            class="inline-flex"
            placement="bottom"
            trigger="click"
            onCommand={(command) => this.handleMoreCommand(command, data)}
          >
            <IconButton
              onClick={(ev) => {
                ev.stopPropagation()
              }}
              sm
            >
              more
            </IconButton>
            <ElDropdownMenu slot="dropdown">
              <ElDropdownItem command="edit">{this.$t('public_button_edit')}</ElDropdownItem>
            </ElDropdownMenu>
          </ElDropdown>,
        )
      }

      data.SWIM_TYPE = 'fdm'

      return (
        <div
          class={className}
          onClick={() => {
            data.isObject && $emit(this, 'preview', data, this.fdmConnection)
          }}
          onDrop={this.handleTreeNodeDrop}
        >
          {data.isObject && data.isVirtual && <div class="table-status-dot rounded-circle position-absolute"></div>}
          <div
            class={[
              'w-0 flex-1 overflow-hidden flex align-center',
              {
                'opacity-50': data.isObject && data.isVirtual,
              },
            ]}
          >
            {!data.isObject && (
              <VExpandXTransition>
                {data.showProgress && (
                  <el-progress
                    class="mr-2"
                    color="#2c65ff"
                    width={16}
                    stroke-width={2}
                    type="circle"
                    percentage={50}
                    show-text={false}
                  ></el-progress>
                )}
              </VExpandXTransition>
            )}
            <span
              id={data.isObject ? `fdm_table_${data.connectionId}_${data.name}` : `connection_${data.id}`}
              class="inline-flex align-items-center overflow-hidden"
            >
              {icon && (
                <VIcon size="18" class="tree-item-icon mr-2">
                  {icon}
                </VIcon>
              )}
              <span class="table-label" title={data.name}>
                {data.name}
              </span>
            </span>
            {data.comment && <span class="font-color-sslight">{`(${data.comment})`}</span>}
            {!data.isObject && <div class="btn-menu ml-auto">{actions}</div>}
          </div>
        </div>
      )
    },

    async loadDatabases(filter) {
      try {
        const _filter = {
          where: {
            status: 'ready',
            database_type: 'MongoDB',
            connection_type: 'source_and_target',
            createType: {
              $ne: 'System',
            },
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
            capabilities: 1,
          },
          order: ['status DESC', 'name ASC'],
        }
        let result = await connectionsApi.get({
          filter: JSON.stringify(merge(filter, _filter)),
        })

        result.items = result.items.map((item) => {
          return {
            id: item.id,
            name: item.name,
            label: item.name,
            value: item.id,
            databaseType: item.database_type,
            connectionType: item.connection_type,
            accessNodeProcessId: item.accessNodeProcessId,
          }
        })

        return result
      } catch (e) {
        console.log('catch', e) // eslint-disable-line
        return { items: [], total: 0 }
      }
    },

    handleCommand(command) {
      switch (command) {
        case 'config':
          $emit(this, 'show-settings')
          break
      }
    },

    showTaskDialog() {
      const connectionId = this.taskDialogConfig.from?.id

      this.taskDialogConfig.prefix = this.getSmartPrefix(this.taskDialogConfig.from.name)
      this.taskDialogConfig.visible = true
      this.$refs.form?.resetFields()

      // 读取缓存
      if (this.prefixMap[connectionId]) {
        this.taskDialogConfig.prefix = this.prefixMap[connectionId]
      }

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
      // this.$refs.form?.clearValidate()

      this.checkCanStart()
    },

    async checkCanStart() {
      this.taskDialogConfig.canStart = false
      this.checkCanStartIng = true
      const tag = this.treeData.find((item) => item.linkId === this.taskDialogConfig.from.id)

      if (tag) {
        const task = this.tag2Task[tag.id]
        this.taskDialogConfig.task.type = task.type
        this.taskDialogConfig.task.crontabExpressionFlag = task.crontabExpressionFlag
        this.taskDialogConfig.task.crontabExpression = task.crontabExpression
        this.taskDialogConfig.canStart = await ldpApi.checkCanStartByTag(tag.id)
        // TODO: 这里不能点击保存，可以加个消息提示，或者常驻的 alert， 解释下原因
      } else {
        this.taskDialogConfig.canStart = true
      }

      this.checkCanStartIng = false
    },

    async taskDialogSubmit(start) {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return

        const { tableName, from = {}, task: settings, prefix } = this.taskDialogConfig
        let task = Object.assign(this.makeMigrateTask(from, tableName), settings)
        // 缓存表名前缀
        this.prefixMap[from.id] = prefix

        this.creating = true
        try {
          const result = await ldpApi.createFDMTask(task, {
            silenceMessage: true,
            params: { start },
          })
          this.taskDialogConfig.visible = false
          const h = this.$createElement
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
        } catch (error) {
          console.log(error) // eslint-disable-line
          let msg

          if (error?.data?.code === 'Task.ListWarnMessage' && error.data.data) {
            const keys = Object.keys(error.data.data)
            msg = error.data.data[keys[0]]?.[0]?.msg
          }

          this.$message.error(msg || error?.data?.message || this.$t('public_message_save_fail'))
        }

        await this.loadFDMDirectory()
        this.setNodeExpand()

        this.creating = false
      })
    },

    async loadFDMDirectory() {
      const { items } = await metadataDefinitionsApi.get({
        filter: JSON.stringify({
          where: {
            item_type: { $nin: ['database', 'dataflow', 'api'] },
            parent_id: this.directory.id,
          },
        }),
      })

      /*items.forEach(item => {
      item = this.mapCatalog(item)
      const children = this.treeMap[item.id]?.children
      if (children.length) {
        this.$refs.tree.remove()
        item.children = children
      }
      return item
    })*/

      this.directory.children = items.map((item) => {
        item = this.mapCatalog(item)
        const children = this.treeMap[item.id]?.children

        if (children?.length) {
          item.children = cloneDeep(children)
        }

        return item
      })
      await this.$nextTick()
      this.$refs.tree.$forceUpdate()
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

      if (!this.allowDrop) return
      if (!ev.currentTarget.contains(ev.relatedTarget)) {
        this.removeDropEffect(ev, 'tree-wrap', 'is-drop')
      }
    },

    handleDrop(ev) {
      ev.preventDefault()

      if (!this.allowDrop) return

      this.removeDropEffect(ev, 'tree-wrap', 'is-drop')

      const { draggingObjects } = this.dragState
      if (!draggingObjects.length) return
      const object = draggingObjects[0]

      if (object.data.type === 'connection') {
        this.taskDialogConfig.from = object.data
        this.taskDialogConfig.tableName = null
      } else if (object.data.type === 'table') {
        this.taskDialogConfig.from = object.parent.data
        this.taskDialogConfig.tableName = object.data.name
      }

      this.showTaskDialog()
    },

    removeDropEffect(ev, cls = 'wrap__item', removeCls = 'is-drop-inner') {
      const dropNode = this.findParentByClassName(ev.currentTarget, cls)
      dropNode.classList.remove(removeCls)
    },

    handleTreeNodeDrop(ev) {
      ev.stopPropagation()
      this.handleDrop(ev)
    },

    findParentByClassName(parent, cls) {
      while (parent && !parent.classList.contains(cls)) {
        parent = parent.parentNode
      }
      return parent
    },

    makeMigrateTask(from, tableName) {
      let source = this.getSourceNode(from, tableName)
      let target = this.getDatabaseNode(this.fdmConnection)
      let tableReNameNode = this.getTableReNameNode()
      return {
        ...TASK_SETTINGS,
        syncType: 'migrate',
        name: this.getTaskName(from),
        dag: {
          edges: [
            { source: source.id, target: tableReNameNode.id },
            { source: tableReNameNode.id, target: target.id },
          ],
          nodes: [source, tableReNameNode, target],
        },
      }
    },

    getSourceNode(from, tableName) {
      let source = this.getDatabaseNode(from)

      Object.assign(
        source,
        tableName
          ? {
              migrateTableSelectType: 'custom',
              tableNames: [tableName],
            }
          : {
              migrateTableSelectType: 'expression',
              tableExpression: '.*',
            },
      )

      return source
    },

    getTaskName(from) {
      return `${from.name}_Clone_To_FDM_${generateId(6)}`
    },

    getDatabaseNode(db) {
      return {
        id: uuid(),
        type: 'database',
        name: db.name,
        connectionId: db.id,
        databaseType: db.database_type,
        attrs: {
          connectionName: db.name,
          connectionType: db.connection_type,
          accessNodeProcessId: db.accessNodeProcessId,
          pdkType: db.pdkType,
          pdkHash: db.pdkHash,
          capabilities: db.capabilities || [],
        },
      }
    },

    getTableReNameNode() {
      return {
        id: uuid(),
        type: 'table_rename_processor',
        name: i18n.t('packages_business_swimlane_fdm_biaobianji'),
        prefix: `${this.fixedPrefix}${this.taskDialogConfig.prefix}_`,
      }
    },

    async handleNodeExpand(data, node, forceLoad) {
      this.setExpand(data.id, true)
      // 十秒内加载过资源，不再继续加载
      if (!forceLoad && node.loadTime && Date.now() - node.loadTime < 10000) return

      node.loadTime = Date.now()
      node.loading = true
      let objects = await this.loadObjects(data)
      node.loading = false
      // data.children = objects
      this.$refs.tree.updateKeyChildren(data.id, objects)
    },

    handeNodeCollapse(data) {
      this.setExpand(data.id, false)
    },

    checkAllowDrag(node) {
      return node.data.LDP_TYPE === 'table'
    },

    handleDragStart(draggingNode, ev) {
      draggingNode = {
        ...draggingNode,
        parent: {
          data: this.fdmConnection,
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
      this.dragState.from = 'FDM'
    },

    handleDragEnd() {
      $emit(this, 'node-drag-end')
    },

    setNodeExpand() {
      const target = this.treeData.find((item) => item.linkId === this.taskDialogConfig.from.id)
      if (target) {
        const node = this.$refs.tree.getNode(target.id)
        node && (node.loading = true)
        setTimeout(async () => {
          this.setExpand(target.id, true)
          let objects = await this.loadObjects(target)
          objects = objects.map((item) => {
            item.parent_id = target.id
            item.isObject = true
            item.connectionId = item.sourceConId
            return item
          })
          this.$refs.tree.updateKeyChildren(target.id, objects)
          node && (node.loading = false)
        }, 1000)
      } else {
        $emit(this, 'load-directory')
      }
      // this.taskDialogConfig.from
    },

    setExpand(id, isExpand) {
      const i = this.expandedKeys.indexOf(id)
      if (!isExpand) {
        if (~i) this.expandedKeys.splice(i, 1)
      } else {
        if (!~i) this.expandedKeys.push(id)
      }
    },

    getSmartPrefix(connectionName) {
      connectionName = connectionName.replace(/[\u4E00-\u9FA5\s]+/g, '').replace(/^[-_]+/, '')
      let planA = connectionName.split('_').shift()
      let planB = connectionName.split('-').shift()

      return (planA.length < planB.length ? planA : planB).substr(0, 5)
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
        })
      })
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

    async loadTask() {
      if (!this.treeData.length) return

      const map = await ldpApi.getTaskByTag(this.treeData.map((item) => item.id).join(','))
      const newMap = {}
      for (let tagId in map) {
        let task = map[tagId].find(
          (task) => !['deleting', 'delete_failed'].includes(task.status) && !task.is_deleted && task.fdmMain,
        )
        if (task) {
          task = makeStatusAndDisabled(task)
          newMap[tagId] = {
            id: task.id,
            name: task.name,
            type: task.type,
            crontabExpressionFlag: task.crontabExpressionFlag,
            crontabExpression: task.crontabExpression,
            status: task.status,
            disabledData: task.disabledData,
          }
        }
      }
      this.tag2Task = newMap
      this.checkStartedTag()
    },

    checkStartedTag() {
      this.startedTags = this.startedTags.filter((tagId) => {
        const task = this.tag2Task[tagId]
        const node = this.$refs.tree.getNode(tagId)
        if (node && task && ['running', 'complete', 'stop', 'error'].includes(task.status)) {
          this.handleNodeExpand(node.data, node, true)
          return false
        }
        return true
      })
    },

    async startTagTask(tag, node) {
      if (!this.startedTags.includes(tag.id)) this.startedTags.push(tag.id)

      node.loading = true
      node.expanded = false
      this.setExpand(tag.id, false)
      await ldpApi.batchStart(tag.id)
      this.$message.success(this.$t('public_message_operation_success'))
    },

    handleFindTreeDom(val = {}, getParent = false) {
      const el = document.getElementById(`fdm_table_${val.connectionId}_${val.table}`) // this.$refs[`table_${val.connectionId}_${val.table}`]
      return getParent ? el?.parentNode : el
    },

    async searchByKeywordList(val = []) {
      let searchExpandedKeys = []
      this.filterTreeData = val.map((t) => {
        searchExpandedKeys.push(t.connectionId)
        return {
          LDP_TYPE: 'connection',
          id: t.connectionId,
          name: t.connectionName,
          status: 'ready',
          isLeaf: false,
          level: 0,
          disabled: false,
          children: [
            {
              id: t.tableId,
              name: t.table,
              connectionId: t.connectionId,
              isLeaf: true,
              isObject: true,
              type: 'table',
              LDP_TYPE: 'table',
            },
          ],
        }
      })
      this.searchExpandedKeys = searchExpandedKeys
    },

    handleChangeCronType(val) {
      if (val === 'once') {
        this.taskDialogConfig.task.crontabExpressionFlag = false
      } else {
        this.taskDialogConfig.task.crontabExpressionFlag = true
        if (val !== 'custom') {
          this.taskDialogConfig.task.crontabExpression = val
        }
      }
    },
  },
  emits: ['preview', 'show-settings', 'node-drag-end', 'load-directory'],
}
</script>

<style lang="scss" scoped>
.form-item-inner {
  height: 32px;
}
.pipeline-desc {
  background-color: #f8f8fa;
  border-left: 4px solid map-get($color, primary);
  line-height: 22px;
  li {
    margin-left: 20px;
    padding-left: 4px;
    list-style-type: circle;
  }
}
.inline-flex-input {
  .el-input-group__prepend {
    flex-shrink: 0;
  }
  .el-input-group__append,
  .el-input-group__prepend {
    width: auto;
    line-height: 30px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  input {
    width: auto;
  }
}
</style>
