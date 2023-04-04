<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex align-center px-4">
      <span class="fs-6">{{ $t('packages_business_data_console_fdm') }}</span>
      <div class="flex-grow-1"></div>
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
            :allow-drop="() => false"
            :allow-drag="checkAllowDrag"
            @node-drag-start="handleDragStart"
            @node-drag-end="handleDragEnd"
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
            :allow-drop="() => false"
            :allow-drag="checkAllowDrag"
            @node-drag-start="handleDragStart"
            @node-drag-end="handleDragEnd"
            @node-expand="handleNodeExpand"
          ></VirtualTree>
          <div
            v-show="!treeData.length"
            class="flex justify-center align-center absolute-fill fs-7 font-color-light px-3"
          >
            <span class="text-center lh-base" v-html="$t('packages_business_fdm_empty_text')"></span>
          </div>
        </template>
      </div>

      <div
        class="drop-mask justify-center align-center absolute-fill font-color-dark fs-6"
        :class="{ flex: allowDrop }"
      >
        Clone To FDM
      </div>
    </div>

    <ElDialog :visible.sync="taskDialogConfig.visible" width="600" :close-on-click-modal="false">
      <span slot="title" class="font-color-dark fs-6 fw-sub">{{ $t('packages_business_create_clone_task') }}</span>
      <ElForm ref="form" :model="taskDialogConfig" label-width="180px" @submit.prevent :rules="formRules">
        <div class="pipeline-desc p-4 mb-4 text-preline rounded-4">
          <span>{{ $t('packages_business_fdm_create_task_dialog_desc_prefix') }}</span
          ><span v-if="taskDialogConfig.from" class="inline-flex align-center px-1 font-color-dark fw-sub"
            ><DatabaseIcon :item="taskDialogConfig.from" :key="taskDialogConfig.from.pdkType" :size="20" class="mr-1" />
            <span>{{ taskDialogConfig.from.name }}</span> </span
          ><span v-if="taskDialogConfig.tableName" class="inline-flex font-color-dark fw-sub"
            >/<span class="px-1">{{ taskDialogConfig.tableName }}</span> </span
          ><span>{{ $t('packages_business_fdm_create_task_dialog_desc_suffix') }}</span>
        </div>

        <ElFormItem :label="$t('packages_business_table_prefix')" prop="prefix">
          <ElInput
            size="small"
            v-model="taskDialogConfig.prefix"
            :maxlength="maxPrefixLength"
            class="inline-flex inline-flex-input"
          >
            <template slot="prepend">{{ fixedPrefix }}</template>
            <template slot="append">
              <span v-if="taskDialogConfig.tableName" :title="taskDialogConfig.tableName">
                _{{ taskDialogConfig.tableName }}
              </span>
              <span v-else> _&lt;original_table_name&gt; </span>
            </template>
          </ElInput>
        </ElFormItem>
      </ElForm>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="taskDialogConfig.visible = false">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton :loading="creating" size="mini" type="primary" @click="taskDialogSubmit">
          {{ $t('public_button_confirm') }}
        </ElButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
import { merge, debounce } from 'lodash'
import { connectionsApi, discoveryApi, ldpApi, taskApi } from '@tap/api'
import { VirtualTree, IconButton } from '@tap/component'
import { uuid } from '@tap/shared'
import { makeDragNodeImage, TASK_SETTINGS } from '../../shared'
import { DatabaseIcon } from '../../components'
import commonMix from './mixins/common'

export default {
  name: 'FDM',

  props: {
    dragState: Object,
    settings: Object,
    fdmConnection: Object,
    directory: Object,
    eventDriver: Object
  },

  components: { VirtualTree, IconButton, DatabaseIcon },

  mixins: [commonMix],

  data() {
    const validatePrefix = (rule, value, callback) => {
      value = value.trim()
      if (!value) {
        callback(new Error(this.$t('public_form_not_empty')))
      } else if (!/\w+/.test(value)) {
        callback(new Error(this.$t('packages_business_data_server_drawer_geshicuowu')))
      } else {
        callback()
      }
    }

    return {
      fixedPrefix: 'FDM_',
      maxPrefixLength: 10,
      keyword: '',
      taskDialogConfig: {
        from: null,
        to: null,
        visible: false,
        prefix: '',
        tableName: null
      },
      creating: false,
      expandedKeys: [],
      formRules: {
        prefix: [{ validator: validatePrefix, trigger: 'blur' }]
      },
      searchIng: false,
      search: '',
      enableSearch: false,
      filterTreeData: []
    }
  },

  computed: {
    allowDrop() {
      return (
        this.dragState.isDragging &&
        this.dragState.from === 'SOURCE' &&
        this.dragState.draggingObjects[0]?.data.LDP_TYPE === 'table'
      )
    },
    treeData() {
      return this.directory?.children || []
    },
    taskDesc() {
      if (!this.taskDialogConfig.from) return ''
      const { from, tableName } = this.taskDialogConfig
      return `This will clone ${
        tableName ? `Source Table: [${tableName}]` : `Source Database: [${from.name}]`
      } to FDM Layer.

所有的源表将统一存储到 FDM 库里,遵从以下的命名规范

${this.taskDialogConfig.prefix}<original_table_name>`
    }
  },

  created() {
    this.debouncedSearch = debounce(async search => {
      this.searchIng = true
      const result = await this.loadObjects(this.directory, false, search)
      const map = result.reduce((obj, item) => {
        let id = item.listtags[0].id
        let children = obj[id] || []
        children.push(item)
        obj[id] = children
        return obj
      }, {})

      const filterTree = node => {
        const { children } = node

        if (children?.length) {
          node.children = children.filter(child => {
            filterTree(child)
            return child.LDP_TYPE === 'folder' && (child.name.includes(search) || child.children.length)
            // if (child.LDP_TYPE === 'folder') {
            //   return child.name.includes(search) || map[child.id]
            // }
            // filterTree(child)
          })
        }

        if (map[node.id]) {
          node.children.push(...map[node.id])
        }

        // node.children = children.filter(child => {
        //   if (child.LDP_TYPE === 'folder') {
        //     return child.name.includes(search) || map[child.id]
        //   }
        //   filterTree(child)
        // })

        // if (!node.visible && children.length) {
        //   let allHidden = true
        //   allHidden = !children.some(child => child.visible)
        //
        //   node.visible = allHidden
        //   node.children = children.filter()
        // }
        //
        // return data.reduce((map, item) => {
        //   if (item.LDP_TYPE === 'folder') {
        //     let children = item.children.filter()
        //     map[item.id] = { ...item, children: [] }
        //
        //     if (item.children.length) {
        //       Object.assign(map, this.flattenTree(item.children))
        //     }
        //   }
        //   return map
        // }, {})
      }

      let root = { ...this.directory }
      filterTree(root)
      this.searchIng = false
      this.filterTreeData = root.children
      console.log('result', result, map, this.nodesMap) // eslint-disable-line
      console.log('filter', root) // eslint-disable-line
    }, 300)
  },

  mounted() {},

  unmounted() {
    this.debouncedSearch.cancel()
  },

  beforeDestroy() {
    this.eventDriver.off('source-drag-end')
  },

  methods: {
    openRoute(route, newTab = true) {
      if (newTab) {
        window.open(this.$router.resolve(route).href)
      } else {
        this.$router.push(route)
      }
    },

    renderContent(h, { node, data }) {
      let icon
      let className = ['custom-tree-node']

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

      return (
        <div
          class={className}
          onDblclick={() => {
            data.isObject && this.$emit('preview', data)
          }}
          onDrop={this.handleTreeNodeDrop}
        >
          <div class="tree-item-icon flex align-center mr-2">{icon && <VIcon size="18">{icon}</VIcon>}</div>
          <span class="table-label" title={data.name}>
            {data.name}
          </span>
          {data.isObject && (
            <IconButton
              class="btn-menu"
              sm
              onClick={() => {
                this.$emit('preview', data)
              }}
            >
              view-details
            </IconButton>
          )}
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
          return {
            id: item.id,
            name: item.name,
            label: item.name,
            value: item.id,
            databaseType: item.database_type,
            connectionType: item.connection_type,
            accessNodeProcessId: item.accessNodeProcessId
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
          this.$emit('show-settings')
          break
      }
    },

    showTaskDialog() {
      this.taskDialogConfig.prefix = this.getSmartPrefix(this.taskDialogConfig.from.name)
      this.taskDialogConfig.visible = true
    },

    async taskDialogSubmit() {
      this.$refs.form.validate(async valid => {
        if (!valid) return

        const { tableName, from } = this.taskDialogConfig
        let task = this.makeMigrateTask(from, tableName)

        this.creating = true
        try {
          const result = await ldpApi.createFDMTask(task)
          this.taskDialogConfig.visible = false
          this.setNodeExpand()
          const h = this.$createElement
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
        } catch (e) {
          console.log(e) // eslint-disable-line
        }
        this.creating = false
      })
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
            { source: tableReNameNode.id, target: target.id }
          ],
          nodes: [source, tableReNameNode, target]
        }
      }
    },

    getSourceNode(from, tableName) {
      let source = this.getDatabaseNode(from)

      Object.assign(
        source,
        tableName
          ? {
              migrateTableSelectType: 'custom',
              tableNames: [tableName]
            }
          : {
              migrateTableSelectType: 'expression',
              tableExpression: '.*'
            }
      )

      return source
    },

    getTaskName(from) {
      return `${from.name}_Clone_To_FDM_${uuid(4)}`
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
          capabilities: db.capabilities || []
        }
      }
    },

    getTableReNameNode() {
      return {
        id: uuid(),
        type: 'table_rename_processor',
        name: '表编辑',
        prefix: `${this.fixedPrefix}${this.taskDialogConfig.prefix}_`
      }
    },

    async handleNodeExpand(data, node) {
      // 十秒内加载过资源，不再继续加载
      if (node.loadTime && Date.now() - node.loadTime < 10000) return

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

    loadObjects(node, isCurrent = true, queryKey) {
      let where = {
        page: 1,
        pageSize: 10000,
        tagId: node.id,
        range: isCurrent ? 'current' : undefined,
        sourceType: 'table',
        queryKey,
        fields: {
          allTags: 1
        }
      }
      return discoveryApi.discoveryList(where).then(res => {
        return res.items.map(item =>
          Object.assign(item, {
            isLeaf: true,
            isObject: true,
            connectionId: item.sourceConId,
            LDP_TYPE: 'table'
          })
        )
      })
    },

    checkAllowDrag(node) {
      return node.data.LDP_TYPE === 'table'
    },

    handleDragStart(draggingNode, ev) {
      draggingNode = {
        ...draggingNode,
        parent: {
          data: this.fdmConnection
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
      this.dragState.from = 'FDM'
    },

    handleDragEnd() {
      this.$emit('node-drag-end')
    },

    setNodeExpand() {
      const target = this.treeData.find(item => item.linkId === this.taskDialogConfig.from.id)
      if (target) {
        setTimeout(() => {
          const node = this.$refs.tree.getNode(target.id)
          this.handleNodeExpand(node.data, node)
          this.expandedKeys = [target.id]
        }, 1000)
      } else {
        this.$emit('load-directory')
      }
      // this.taskDialogConfig.from
    },

    getSmartPrefix(connectionName) {
      let planA = connectionName.split('_').shift()
      let planB = connectionName.split('-').shift()

      return (planA.length < planB.length ? planA : planB).substr(0, 5)
    }
  }
}
</script>

<style lang="scss" scope>
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
