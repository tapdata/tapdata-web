<script>
import VIcon from './base/VIcon.vue'
import { metadataDefinitionsApi, userGroupsApi } from '@tap/api'
import { mapMutations, mapState, mapGetters } from 'vuex'
import { IconButton } from './icon-button'

export default {
  components: { IconButton, VIcon },
  props: {
    visible: Boolean,
    types: {
      type: Array,
      default: () => {
        return []
      },
    },
    authority: {
      type: String,
    },
    title: {
      type: String,
    },
    viewPage: {
      type: String,
    },
    dragState: Object,
  },
  data() {
    return {
      searchFalg: false,
      filterText: '',
      treeData: [],
      default_expanded: false,
      props: {
        key: 'id',
        label: 'value',
      },
      isActive: true,

      dialogConfig: {
        type: 'add',
        id: '',
        gid: '',
        label: '',
        title: '',
        visible: false,
      },

      nodeName: '',
      parent_id: '',

      showSearch: false,
    }
  },
  computed: {
    ...mapState('classification', ['connections', 'migrate', 'sync']),
    ...mapGetters('classification', ['stateConnections', 'stateMigrate', 'stateSync']),

    comTitle() {
      return (
        this.title ||
        (this.types[0] === 'user' ? this.$t('packages_component_classification_userTitle') : this.$t('public_tags'))
      )
    },

    isExpand: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      },
    },
  },
  mounted() {
    this.getData()
    //是否 默认打开/是否有选择tag
    switch (this.viewPage) {
      case 'connections':
        this.isExpand = this.connections?.panelFlag
        break
      case 'migrate':
        this.isExpand = this.migrate?.panelFlag
        break
      case 'sync':
        this.isExpand = this.sync?.panelFlag
        break
    }
  },
  updated() {
    switch (this.viewPage) {
      case 'connections':
        if (!this.isExpand) return
        this.$nextTick(() => {
          this.$refs.tree?.setCheckedKeys(this.connections?.classification)
          this.$emit('nodeChecked', this.connections?.classification)
        })
        break
      case 'migrate':
        if (!this.isExpand) return
        this.$nextTick(() => {
          this.$refs.tree?.setCheckedKeys(this.migrate?.classification)
          this.$emit('nodeChecked', this.migrate?.classification)
        })
        break
      case 'sync':
        if (!this.isExpand) return
        this.$nextTick(() => {
          this.$refs.tree?.setCheckedKeys(this.sync?.classification)
          this.$emit('nodeChecked', this.sync?.classification)
        })
        break
    }
  },
  watch: {
    types(_new, _old) {
      if (_new.toString() !== _old.toString()) {
        this.clear()
        this.getData()
      }
    },
    filterText(val) {
      this.$refs.tree.filter(val)
    },
  },
  methods: {
    ...mapMutations('classification', ['setTag', 'setPanelFlag']),
    toggle() {
      const _isExpand = !this.isExpand
      this.isExpand = _isExpand
      this.setPanelFlag({
        panelFlag: _isExpand,
        type: this.viewPage,
      })
    },
    clear() {
      this.$refs.tree && this.$refs.tree.setCheckedNodes([])
    },
    checkHandler(data, { checkedKeys }) {
      let checked = checkedKeys.includes(data.id)
      let setChecked = (arr) => {
        if (arr && arr.length) {
          arr.forEach((node) => {
            this.$refs.tree.setChecked(node, checked, true)
            setChecked(node.children)
          })
        }
      }
      setChecked(data.children)
      this.emitCheckedNodes()
    },
    nodeClickHandler(data, node) {
      let checkedNodes = this.$refs.tree.getCheckedKeys() || []

      if (checkedNodes.includes(data.id)) {
        this.$refs.tree?.setChecked(data.id, false)
      } else {
        this.$refs.tree?.setCheckedKeys([data.id], true)
      }

      this.emitCheckedNodes()
    },
    emitCheckedNodes() {
      let checkedNodes = this.$refs.tree.getCheckedKeys() || []
      this.$emit('nodeChecked', checkedNodes)
      this.setTag({
        value: checkedNodes,
        type: this.viewPage,
      })
    },
    getData(cb) {
      const type = this.types[0]
      if (type === 'user') {
        userGroupsApi
          .get({
            filter: JSON.stringify({
              limit: 999,
            }),
          })
          .then((data) => {
            let treeData = []
            let items = data?.items || []
            if (items.length) {
              treeData = items.map((item) => ({
                value: item.name,
                name: item.name,
                id: item.id,
                gid: item.gid,
                parent_id: item.parent_id,
                last_updated: item.last_updated,
                user_id: item.user_id,
              }))
            }
            this.treeData = this.formatData(treeData)

            cb && cb(treeData)
          })
      } else {
        metadataDefinitionsApi.getTags(type).then((data) => {
          let items = data?.items || []
          this.treeData = this.formatData(items)
          cb && cb(items)
        })
      }
    },
    getDataAll(cb) {
      if (this.types[0] === 'user') {
        userGroupsApi
          .get({
            filter: JSON.stringify({
              limit: 999,
            }),
          })
          .then((data) => {
            let items = data?.items || []
            let treeData = []
            if (items?.length) {
              treeData = items.map((item) => ({
                value: item.name,
                id: item.id,
                gid: item.gid,
                parent_id: item.parent_id,
                last_updated: item.last_updated,
                user_id: item.user_id,
              }))
            }
            cb && cb(treeData)
          })
      } else {
        metadataDefinitionsApi.childAccount().then((data) => {
          cb && cb(data?.items || [])
        })
      }
    },
    //格式化分类数据
    formatData(items) {
      if (items && items.length) {
        let map = {}
        let nodes = []
        //遍历第一次， 先把所有子类按照id分成若干数组
        items.forEach((it) => {
          if (it.parent_id) {
            let children = map[it.parent_id] || []
            children.push(it)
            map[it.parent_id] = children
          } else {
            nodes.push(it)
          }
        })
        //接着从没有子类的数据开始递归，将之前分好的数组分配给每一个类目
        let checkChildren = (nodes) => {
          return nodes.map((it) => {
            let children = map[it.id]
            if (children) {
              it.children = checkChildren(children)
            }
            return it
          })
        }
        return checkChildren(nodes)
      }
    },
    filterNode(value, data) {
      if (!value) return true
      return data.value.indexOf(value) !== -1
    },
    handleDefault_expanded() {
      let self = this
      let treeList = this.treeData
      for (let i = 0; i < treeList.length; i++) {
        self.$refs.tree.store.nodesMap[treeList[i].id].expanded = false
      }
    },
    handleRowCommand(command, node) {
      switch (command) {
        case 'add':
        case 'edit':
          this.showDialog(node, command)
          break
        case 'delete':
          this.deleteNode(node.key)
      }
    },
    showDialog(node, dialogType) {
      let type = dialogType || 'add'
      let itemType = this.types
      if (node && node.data && node.data.item_type) {
        itemType = node.data.item_type
      }
      this.dialogConfig = {
        itemType: itemType,
        visible: true,
        type,
        id: node ? node.key : '',
        gid: node?.data?.gid || '',
        label: type === 'edit' ? node.label : '',
        title:
          type === 'add'
            ? node
              ? this.$t('packages_component_classification_addChildernNode')
              : this.$t('packages_component_classification_addNode')
            : this.$t('public_button_edit'),
      }
    },
    hideDialog() {
      this.dialogConfig = {
        visible: false,
      }
    },
    async dialogSubmit() {
      let config = this.dialogConfig
      let value = config.label
      let id = config.id
      let gid = config.gid
      let itemType = config.itemType
      let method = 'post'

      if (!value || value.trim() === '') {
        this.$message.error(this.$t('packages_component_classification_nodeName'))
        return
      }

      if (this.types[0] === 'user') {
        let nameExist = await this.checkName(value)
        if (nameExist) {
          return this.$message.error(this.$t('packages_component_classification_nameExist'))
        }
        let params = {
          name: value,
        }
        if (config.type === 'edit') {
          method = 'patch'
          params.id = id
        } else if (id) {
          params.parent_id = id
          params.parent_gid = gid
        }
        userGroupsApi[method](params).then(() => {
          let self = this
          self.getData(() => {
            this.$nextTick(() => {
              this.emitCheckedNodes()
            })
          })
          self.hideDialog()
        })
      } else {
        let params = {
          item_type: itemType,
          value,
        }
        if (config.type === 'edit') {
          method = 'changeById'
          params.id = id
        } else if (id) {
          params.parent_id = id
        }
        metadataDefinitionsApi[method](params).then(() => {
          let self = this
          self.getData(() => {
            this.$nextTick(() => {
              this.emitCheckedNodes()
            })
          })
          self.hideDialog()
        })
      }
    },
    deleteNode(id) {
      let that = this
      this.$confirm(this.$t('packages_component_classification_deteleMessage'), {
        confirmButtonText: this.$t('public_button_delete'),
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        if (that.types[0] === 'user') {
          let params = {
            id: id,
            headers: {
              gid: id,
            },
          }
          userGroupsApi.delete(params).then(() => {
            let self = this
            self.getData()
          })
        } else {
          metadataDefinitionsApi.delete(id).then(() => {
            let self = this
            self.getData()
          })
        }
      })
    },
    checkName(value) {
      return new Promise((resolve) => {
        if (this.types[0] === 'user') {
          this.getDataAll((items) => {
            resolve(items.find((it) => it.name === value))
          })
        } else {
          this.getDataAll((items) => {
            resolve(items.find((it) => it.value === value))
          })
        }
      })
    },
    findParentNodeByClassName(el, cls) {
      let parent = el.parentNode
      while (parent && !parent.classList.contains(cls)) {
        parent = parent.parentNode
      }
      return parent
    },
    handleTreeDragEnter(ev, data) {
      ev.preventDefault()

      if (data.readOnly || !this.dragState.isDragging) return

      const dropNode = this.findParentNodeByClassName(ev.currentTarget, 'el-tree-node')
      dropNode.classList.add('is-drop-inner')
    },

    handleTreeDragOver(ev) {
      ev.preventDefault()
    },

    handleTreeDragLeave(ev, data) {
      ev.preventDefault()

      if (data.readOnly) return

      if (!ev.currentTarget.contains(ev.relatedTarget)) {
        const dropNode = this.findParentNodeByClassName(ev.currentTarget, 'el-tree-node')
        dropNode.classList.remove('is-drop-inner')
      }
    },

    async handleTreeDrop(ev, data) {
      const { draggingObjects } = this.dragState
      const dropNode = this.findParentNodeByClassName(ev.currentTarget, 'el-tree-node')

      if (!draggingObjects?.length || !dropNode) return
      dropNode.classList.remove('is-drop-inner')

      const id = draggingObjects
        .filter((item) => {
          return item.listtags?.length ? item.listtags.every((tag) => tag.id !== data.id) : true
        })
        .map((item) => item.id)

      let tableName
      switch (this.viewPage) {
        case 'connections':
          tableName = 'Connections'
          break
        case 'migrate':
        case 'sync':
          tableName = 'Task'
          break
      }

      if (!tableName) {
        console.warn('tableName not found')
        return
      }

      if (id.length) {
        await metadataDefinitionsApi.batchPushListtags(tableName, {
          id,
          listtags: [
            {
              id: data.id,
              value: data.value,
            },
          ],
        })
        this.$message.success(this.$t('public_message_operation_success'))
        this.$emit('drop-in-tag')
      } else {
        this.$message.info(this.$t('packages_component_data_already_exists'))
      }
    },

    openSearch() {
      this.showSearch = !this.showSearch
      this.filterText = ''

      if (this.showSearch) {
        this.$nextTick(() => {
          this.$refs.searchInput.focus()
        })
      }
    },
  },
}
</script>

<template>
  <div class="classification py-0 px-2 bg-light rounded-xl" v-show="visible">
    <div class="classification-header">
      <div class="h-32 flex align-center mt-2 gap-1" style="--btn-space: 0">
        <el-button text @click="toggle">
          <template #icon>
            <VIcon class="rotate-180">expand-list</VIcon>
          </template>
        </el-button>
        <div class="fs-6 flex-1">
          <span>{{ comTitle }}</span>
        </div>
        <el-button text @click="openSearch" :class="{ 'is-active': showSearch }">
          <template #icon>
            <VIcon size="18">magnify</VIcon>
          </template>
        </el-button>
        <el-button text  v-readonlybtn="authority" @click="showDialog()">
          <template #icon>
            <VIcon>add</VIcon>
          </template>
        </el-button>
      </div>
      <div v-if="showSearch" class="my-2">
        <ElInput v-model="filterText" clearable ref="searchInput">
          <template #prefix>
            <VIcon size="14">magnify</VIcon>
          </template>
        </ElInput>
      </div>
    </div>

    <div v-if="visible" class="overflow-auto">
      <ElTree
        v-if="treeData && treeData.length > 0"
        check-strictly
        show-checkbox
        class="classification-tree bg-transparent"
        ref="tree"
        node-key="id"
        highlight-current
        :props="props"
        :expand-on-click-node="false"
        :data="treeData"
        :filter-node-method="filterNode"
        :render-after-expand="false"
        :indent="8"
        :check-on-click-node="false"
        :check-on-click-leaf="false"
        @node-click="nodeClickHandler"
        @check="checkHandler"
      >
        <template v-slot="{ node, data }">
          <span
            class="custom-tree-node"
            @dragenter.stop="handleTreeDragEnter($event, data, node)"
            @dragover.stop="handleTreeDragOver($event, data, node)"
            @dragleave.stop="handleTreeDragLeave($event, data, node)"
            @drop.stop="handleTreeDrop($event, data, node)"
          >
            <VIcon size="16" class="color-primary mr-1">folder-fill</VIcon>
            <span class="table-label">{{ data.value }}</span>
            <ElDropdown
              class="btn-menu flex align-center"
              @command="handleRowCommand($event, node)"
              v-readonlybtn="authority"
            >
              <IconButton @click.stop sm>more</IconButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="add">
                    {{ $t('packages_component_classification_addChildernNode') }}
                  </ElDropdownItem>
                  <ElDropdownItem command="edit">{{ $t('public_button_edit') }}</ElDropdownItem>
                  <ElDropdownItem command="delete">{{ $t('public_button_delete') }}</ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </span>
        </template>
      </ElTree>
      <div class="text-center">
        <ElButton
          v-if="treeData && treeData.length === 0 && visible"
          text
          v-readonlybtn="authority"
          @click="showDialog()"
          class="create"
          >{{ $t('packages_component_src_classification_chuangjianfenlei') }}</ElButton
        >
      </div>
    </div>
    <ElDialog v-model="dialogConfig.visible" width="30%" :close-on-click-modal="false">
      <template #header="{ titleClass }">
        <span :class="titleClass">{{ dialogConfig.title }}</span>
      </template>
      <ElInput
        v-model="dialogConfig.label"
        :placeholder="$t('packages_component_classification_nodeName')"
        maxlength="50"
        show-word-limit
      />
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

<style lang="scss" scoped>
.classification {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 213px;
  user-select: none;
  box-sizing: border-box;
  border-top: none;
  background: var(--color-white);
  .btn-expand {
    // padding: 2px 3px;
    // color: var(--text-light);
    transform: rotate(0);
    box-sizing: border-box;
    // background: #eff1f4;
    border: 0;
  }
  .no-expand {
    position: absolute;
    left: 4px;
    top: 4px;
  }
  .toggle {
    margin-top: 18px;
    // color: var(--color-lprimary);
    z-index: 2;
  }
  &.expand {
    height: 100%;
    //width: 100%;
    padding: 20px 0;
    // border-right: 1px solid var(--border-light);
    width: 214px;
    .btn-expand {
      position: absolute;
      top: 0;
      left: 19px;
      transform: rotate(180deg);
      .icon {
        font-size: 16px;
      }
    }

    .btn-addIcon {
      position: absolute;
      right: 12px;
      font-size: var(--font-base-title);
      .iconfont.icon-jia {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        color: var(--text-light);
        font-size: 16px;
        // background-color: var(--color-white);
        // border: 1px solid #dedee4;
        height: 66%;
        // padding: 0 4px;
        // padding-right: 6px;
        // padding-left: 5px;
        margin-top: 0px;
        border-top-width: 1px;
        border-radius: 3px;
        cursor: pointer;
        &:hover {
          color: var(--color-primary);
        }
      }
    }
    .btn-query {
      position: absolute;
      right: 54px;
      .icon-fangdajing {
        font-size: 16px;
        color: var(--text-light);
        &:hover {
          color: var(--color-primary);
        }
      }
    }
  }

  .h-32 {
    height: 32px;
  }

  /*头部样式*/
  .classification-header {
    position: relative;
    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px 0 46px;
      color: var(--text-light);
      // background-color: #eff1f4;
    }
  }
  .tree-block {
    position: relative;
    width: 100%;
    flex: 1;
    padding: 0 10px;
    overflow: auto;
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    font-size: var(--font-base-title);
    padding-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 26px;
    .icon-folder {
      margin-right: 5px;
      font-size: 12px;
      color: var(--color-primary);
      // color: var(--color-lprimary);
    }
    .table-label {
      flex: 1;
      font-size: var(--font-base-title);
      vertical-align: middle;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 120px;
    }

    .btn-menu button:not([aria-expanded='true']) {
      visibility: hidden;
    }
    &:hover .btn-menu button {
      visibility: visible;
    }
  }
  .create {
    padding: 5px 10px;
    font-size: var(--font-base-title);
    // color: var(--color-primary);
    cursor: pointer;
  }

  :deep(.classification-tree) {
    --el-tree-node-hover-bg-color: var(--fill-hover);
    .el-tree-node__content {
      height: 32px;
      overflow: hidden;
    }
  }
}
</style>