<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex align-center px-4">
      <span class="fs-6">{{ $t('packages_business_data_console_mdm') }}</span>
      <div class="flex-grow-1"></div>
      <IconButton @click="showDialog(directory, 'add')">folder-plus</IconButton>
      <IconButton :class="{ active: enableSearch }" @click="toggleEnableSearch">search-outline</IconButton>
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
        <ElInput
          ref="search"
          v-model="search"
          size="mini"
          clearable
          @keydown.native.stop
          @keyup.native.stop
          @click.native.stop
          @input="handleSearch"
        >
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
          <VirtualTree
            class="ldp-tree h-100"
            ref="tree"
            node-key="id"
            highlight-current
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
          ></VirtualTree>
        </div>
        <template v-else>
          <VirtualTree
            class="ldp-tree h-100"
            ref="tree"
            node-key="id"
            highlight-current
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
          ></VirtualTree>
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
    </div>

    <ElDialog :visible.sync="taskDialogConfig.visible" width="600" :close-on-click-modal="false">
      <span slot="title" class="font-color-dark fs-6 fw-sub">{{ $t('packages_business_create_sync_task') }}</span>
      <ElForm ref="form" :model="taskDialogConfig" label-width="180px" @submit.prevent>
        <div class="pipeline-desc p-4 mb-4 text-preline rounded-4">
          {{ $t('packages_business_mdm_create_task_dialog_desc_prefix') }}
          <ul>
            <li>{{ $t('packages_business_fdm_create_task_dialog_desc_li1') }}</li>
            <li>{{ $t('packages_business_fdm_create_task_dialog_desc_li2') }}</li>
            <li>{{ $t('packages_business_fdm_create_task_dialog_desc_li3') }}</li>
          </ul>
          <div>
            {{ $t('packages_business_mdm_create_task_dialog_desc_suffix') }}
          </div>
          <div>{{ $t('packages_business_mdm_create_task_dialog_desc_table_name') }}</div>
        </div>
        <ElFormItem :label="$t('public_table_name')">
          <ElInput size="small" v-model="taskDialogConfig.newTableName"></ElInput>
        </ElFormItem>
      </ElForm>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="taskDialogConfig.visible = false">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton :loading="creating" size="mini" @click="taskDialogSubmit(false)">{{
          $t('packages_business_save_only')
        }}</ElButton>
        <ElButton :loading="creating" size="mini" type="primary" @click="taskDialogSubmit(true)">
          {{ $t('packages_business_save_and_run_now') }}
        </ElButton>
      </span>
    </ElDialog>

    <ElDialog :visible.sync="dialogConfig.visible" width="30%" :close-on-click-modal="false">
      <span slot="title" class="fs-6 fw-sub">{{ dialogConfig.title }}</span>
      <ElForm ref="form" :model="dialogConfig" label-width="90px">
        <ElFormItem :label="$t('packages_component_src_discoveryclassification_mulumingcheng')">
          <ElInput
            size="mini"
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
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="hideDialog()">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton size="mini" type="primary" @click="dialogSubmit()">
          {{ $t('public_button_confirm') }}
        </ElButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
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
    eventDriver: Object,
    loadingDirectory: Boolean,
    mapCatalog: {
      type: Function,
      require: true
    }
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
        newTableName: null
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
        visible: false
      },
      searchIng: false,
      search: '',
      enableSearch: false,
      filterTreeData: []
    }
  },

  computed: {
    treeData() {
      return this.directory?.children || []
    },

    allowDrop() {
      return (
        this.dragState.isDragging &&
        ['SOURCE', 'FDM'].includes(this.dragState.from) &&
        this.dragState.draggingObjects[0]?.data.LDP_TYPE === 'table'
      )
    },

    isDragSelf() {
      return this.dragState.isDragging && this.dragState.from === 'MDM'
    }
  },

  watch: {
    loadingDirectory(v) {
      if (!v) {
        this.setNodeExpand()
      }
    }
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
      if (data.LDP_TYPE === 'table') {
        node.isLeaf = true
        icon = 'table'
      } else {
        node.isLeaf = false
        icon = 'folder-o'
      }
      data.SWIM_TYPE = 'mdm'
      return (
        <div
          class="custom-tree-node grabbable"
          on={{
            dblclick: () => {
              data.isObject && this.$emit('preview', data, this.mdmConnection)
            },
            dragenter: ev => {
              ev.stopPropagation()
              this.handleTreeDragEnter(ev, data, node)
            },
            dragover: ev => {
              ev.stopPropagation()
              this.handleTreeDragOver(ev, data, node)
            },
            dragleave: ev => {
              ev.stopPropagation()
              this.handleTreeDragLeave(ev, data, node)
            },
            drop: ev => {
              ev.stopPropagation()
              this.handleTreeDrop(ev, data, node)
            }
          }}
        >
          <div class="tree-item-icon flex align-center mr-2">{icon && <VIcon size="18">{icon}</VIcon>}</div>
          <span class="table-label" title={data.name}>
            {data.name}
          </span>
          <div class="btn-menu">
            {!data.isObject ? (
              [
                <IconButton
                  sm
                  onClick={ev => {
                    ev.stopPropagation()
                    this.showDialog(data, 'add')
                  }}
                >
                  add
                </IconButton>,
                <ElDropdown
                  class="inline-flex"
                  placement="bottom"
                  trigger="click"
                  onCommand={command => this.handleMoreCommand(command, data)}
                >
                  <IconButton
                    onClick={ev => {
                      ev.stopPropagation()
                    }}
                    sm
                  >
                    more
                  </IconButton>
                  <ElDropdownMenu slot="dropdown">
                    <ElDropdownItem command="edit">{this.$t('public_button_edit')}</ElDropdownItem>
                    <ElDropdownItem command="delete">{this.$t('public_button_delete')}</ElDropdownItem>
                  </ElDropdownMenu>
                </ElDropdown>
              ]
            ) : (
              <IconButton
                sm
                onClick={() => {
                  this.$emit('preview', data, this.mdmConnection)
                }}
              >
                view-details
              </IconButton>
            )}
          </div>
        </div>
      )
    },

    handleCommand(command) {
      switch (command) {
        case 'config':
          this.$emit('show-settings')
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
        draggingObjects: [object]
      } = this.dragState
      this.taskDialogConfig.from = object.parent.data
      this.taskDialogConfig.tableName = object.data.name
      this.taskDialogConfig.newTableName = object.data.name
      this.taskDialogConfig.tagId = tagId
      this.taskDialogConfig.visible = true
    },

    async taskDialogSubmit(start, confirmTable) {
      const { tableName, from, newTableName, tagId } = this.taskDialogConfig
      let task = this.makeTask(from, tableName, newTableName)
      this.creating = true
      const h = this.$createElement
      try {
        const result = await ldpApi.createMDMTask(task, {
          silenceMessage: true,
          params: { tagId, confirmTable, start }
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
                }
              }
            },
            this.$t('packages_business_task_created_success')
          )
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
                  }
                }
              },
              this.$t('packages_business_task_created_fail_no_primary_key')
            )
          })
          setTimeout(() => {
            this.setNodeExpand(tagId)
          }, 1000)
        } else if (code === 'Ldp.RepeatTableName') {
          this.$confirm('', i18n.t('packages_business_mdm_table_duplication_confirm'), {
            onlyTitle: true,
            type: 'warning',
            closeOnClickModal: false,
            zIndex: 999999
          }).then(resFlag => {
            if (!resFlag) {
              return
            }
            this.taskDialogSubmit(start, true)
          })
        } else if (code === 'Task.ListWarnMessage' && data) {
          const keys = Object.keys(data)
          const msg = data[keys[0]]?.[0]?.msg
          this.$message.error(msg || response.data.message || this.$t('public_message_save_fail'))
        }
      }
      this.creating = false
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
          nodes: [source, target]
        }
      }
    },

    getTableNode(db, tableName) {
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
          capabilities: db.capabilities || []
        }
      }
    },

    getTaskName(from, tableName, newTableName) {
      return `${from.name}_Sync_${tableName}_To_MDM_${newTableName}_${generateId(6)}`
    },

    async handleNodeExpand(data, node, forceLoadTable) {
      // 十秒内加载过资源，不再继续加载
      if (!forceLoadTable && node.loadTime && Date.now() - node.loadTime < 10000) return

      node.loadTime = Date.now()

      let objects = await this.loadObjects(data)

      console.log('handleNodeExpand', objects, data, node) // eslint-disable-line
      const childrenMap = data.children ? data.children.reduce((map, item) => ((map[item.id] = true), map), {}) : {}
      objects.forEach(item => {
        if (childrenMap[item.id]) return
        item.parent_id = data.id
        item.isObject = true
        item.connectionId = item.sourceConId
        this.$refs.tree.append(item, node)
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
            parent_id: dropNode.data.id || ''
          })
          .then(() => {
            this.$message.success(this.$t('public_message_operation_success'))
            draggingNode.data.parent_id = dropNode.data.id
            // this.getData()
          })
          .catch(err => {
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
          data: this.mdmConnection
        }
      }
      this.draggingNode = draggingNode
      this.draggingNodeImage = makeDragNodeImage(
        ev.currentTarget.querySelector('.tree-item-icon'),
        draggingNode.data.name
      )
      ev.dataTransfer.setDragImage(this.draggingNodeImage, 4, 4)
      ev.dataTransfer.effectAllowed = 'copy'
      this.dragState.isDragging = true
      this.dragState.draggingObjects = [draggingNode]
      this.dragState.from = 'MDM'
    },

    handleDragEnd() {
      this.$emit('node-drag-end')
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
          type === 'add' ? this.$t('packages_component_classification_addChildernNode') : this.$t('public_button_edit')
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
        value
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

      const tagBindingParams = objects.map(t => {
        return {
          id: t.id,
          objCategory: t.category
        }
      })
      /*await discoveryApi.patchTags({
        tagBindingParams,
        tagIds: [from]
      })*/
      await discoveryApi.postTags({
        tagBindingParams,
        tagIds: [to],
        oldTagIds: [from]
      })
      objects.forEach(item => (item.parent_id = to))
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
          closeOnClickModal: false
        }
      ).then(resFlag => {
        if (!resFlag) {
          return
        }
        metadataDefinitionsApi.delete(data.id).then(() => {
          this.$refs.tree.remove(data.id)

          // 删除目录刷新上一级加载被删除目录下的表
          this.setNodeExpand(data.parent_id, true)
        })
      })
    }
  }
}
</script>