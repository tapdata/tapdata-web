<template>
  <div>
    <VirtualTree
      class="ldp-tree"
      ref="tree"
      node-key="id"
      highlight-current
      :data="treeData"
      :props="props"
      draggable
      :default-expanded-keys="expandedKeys"
      :filter-node-method="filterNode"
      :render-content="renderContent"
      :expand-on-click-node="false"
      :allow-drag="checkAllowDrag"
      :allow-drop="checkAllowDrop"
      @node-click="nodeClickHandler"
      @node-drag-start="handleDragStart"
      @node-drop="handleDrop"
      @node-expand="handleNodeExpand"
    />
    <ElDialog :visible.sync="dialogConfig.visible" width="30%" :close-on-click-modal="false">
      <span slot="title" style="font-size: 14px">{{ dialogConfig.title }}</span>
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
        <ElFormItem
          :label="$t('packages_component_src_discoveryclassification_mulufenlei')"
          v-if="dialogConfig.isParent"
        >
          <ElSelect v-model="dialogConfig.itemType" :disabled="dialogConfig.type === 'edit'">
            <el-option
              :label="$t('packages_component_src_discoveryclassification_ziyuanmulu')"
              value="resource"
            ></el-option>
            <!--            <el-option label="任务目录" value="task"></el-option>-->
          </ElSelect>
        </ElFormItem>
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

import { VIcon, VirtualTree } from '@tap/component'
import { metadataDefinitionsApi, userGroupsApi, discoveryApi } from '@tap/api'
import Cookie from '@tap/shared/src/cookie'

import { makeDragNodeImage } from '../shared/classification'
export default {
  name: 'ClassificationTree',

  props: {
    types: {
      type: Array,
      default: () => {
        return []
      }
    },
    dragState: {
      type: Object,
      default: () => ({})
    },
    showViewDetails: Boolean
  },

  components: { VirtualTree },

  data() {
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',

      searchFalg: false,
      isExpand: true,
      filterText: '',
      treeData: [],
      default_expanded: false,
      expandedKeys: [],
      loadingTree: false,
      props: {
        key: 'id',
        label: 'name'
      },
      isActive: true,

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

      nodeName: '',
      parent_id: '',
      title: '',
      iconMap: {
        table: 'table',
        defaultApi: 'apiServer_navbar'
      }
    }
  },
  mounted() {
    this.getData()
  },
  watch: {
    types(_new, _old) {
      if (_new.toString() !== _old.toString()) {
        this.getData()
      }
    },
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  methods: {
    renderContent(h, { node, data, store }) {
      let icon = 'folder-outline'

      if (data.isObject) {
        icon = this.iconMap[data.type]
      }

      if (data.objCount > 0) {
        node.isLeaf = false
      }

      return (
        <div
          class="custom-tree-node"
          on={{
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
          {data.isRoot ? (
            <span class="btn-menu">
              <VIcon
                size="14"
                class="color-primary mr-2"
                onClick={ev => {
                  ev.stopPropagation()
                  data.isRoot ? this.showDialog() : this.showDialog(node, 'add')
                }}
              >
                add
              </VIcon>
            </span>
          ) : !data.readOnly && !data.isObject ? (
            <span class="btn-menu">
              <VIcon
                size="14"
                class="color-primary mr-2"
                onClick={ev => {
                  ev.stopPropagation()
                  data.isRoot ? this.showDialog() : this.showDialog(node, 'add')
                }}
              >
                add
              </VIcon>
              <ElDropdown
                class="inline-flex"
                placement="bottom"
                trigger="click"
                onCommand={ev => this.handleRowCommand(ev, node)}
              >
                <VIcon
                  onClick={ev => {
                    ev.stopPropagation()
                  }}
                  size="16"
                  class="color-primary"
                >
                  more-circle
                </VIcon>
                <ElDropdownMenu slot="dropdown">
                  <ElDropdownItem command="edit">{this.$t('public_button_edit')}</ElDropdownItem>
                  <ElDropdownItem command="delete">{this.$t('public_button_delete')}</ElDropdownItem>
                </ElDropdownMenu>
              </ElDropdown>
            </span>
          ) : (
            data.isObject &&
            this.showViewDetails && (
              <span class="btn-menu">
                <VIcon
                  size="18"
                  onClick={() => {
                    this.$emit('view-details', data)
                  }}
                >
                  view-details
                </VIcon>
              </span>
            )
          )}
        </div>
      )
    },

    nodeClickHandler(data) {
      let { currentNode = {} } = this
      if (data.id === currentNode.id || data.isObject) return
      this.currentNode = data
      this.emitCheckedNodes(data)
    },

    emitCheckedNodes(node) {
      if (!node) return
      this.$emit('nodeChecked', node)
    },

    getData(cb) {
      let where = {}
      where.item_type = {
        $nin: ['database', 'dataflow', 'api']
      }
      let filter = {
        where,
        fields: {
          id: 1,
          item_type: 1,
          last_updated: 1,
          value: 1,
          objCount: 1,
          parent_id: 1,
          desc: 1,
          readOnly: 1,
          user_id: 1
        }
      }
      this.loadingTree = true
      metadataDefinitionsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let items = data?.items || []
          let treeData = this.formatData(items)

          this.treeData = [
            {
              name: '所有目录',
              isRoot: true,
              readOnly: true,
              children: treeData
            }
          ]

          /*this.treeData =
            this.isDaas && Cookie.get('isAdmin')
              ? [
                  {
                    name: '所有目录',
                    isRoot: true,
                    readOnly: true,
                    children: treeData
                  }
                ]
              : treeData*/

          cb && cb(items)
          //默认选中第一个
          this.$nextTick(() => {
            let key = treeData?.[0]?.id
            this.expandedKeys = [key]
            this.$refs.tree.setCurrentKey(key)
            this.emitCheckedNodes(treeData?.[0])
          })
        })
        .finally(() => {
          this.loadingTree = false
        })
    },
    getDataAll(cb) {
      metadataDefinitionsApi.get().then(data => {
        cb && cb(data?.items || [])
      })
    },
    //格式化分类数据
    formatData(items) {
      const userId = this.isDaas ? Cookie.get('user_id') : window.__USER_INFO__.userId
      if (items && items.length) {
        let map = {}
        let nodes = []

        //遍历第一次， 先把所有子类按照id分成若干数组
        items.forEach(it => {
          it.name = it.value
          it.isLeaf = it.objCount === 0
          if (it.parent_id) {
            let children = map[it.parent_id] || []
            children.push(it)
            map[it.parent_id] = children
          } else {
            //默认目录国际化
            if (it?.item_type && it?.item_type.findIndex(t => t === 'default') > -1) {
              it.name = i18n.t('packages_component_src_discoveryclassification_morenmuluji')
              if (it?.userName && it?.user_id !== userId) {
                it.name += `| ${it.userName}`
              }
            }
            nodes.push(it)
          }
        })
        //接着从没有子类的数据开始递归，将之前分好的数组分配给每一个类目
        let checkChildren = nodes => {
          return nodes.map(it => {
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
      return data.name.indexOf(value) !== -1
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
      let itemType = 'resource'
      if (node && node.data && node.data.item_type) {
        itemType = node.data.item_type?.join('')
      }
      this.dialogConfig = {
        itemType: itemType,
        visible: true,
        type,
        id: node ? node.key : '',
        gid: node?.data?.gid || '',
        label: type === 'edit' ? node.label : '',
        isParent: (type === 'add' && !node) || (type === 'edit' && node?.level === 1),
        desc: type === 'edit' ? node?.data?.desc : '',
        title:
          type === 'add'
            ? node
              ? this.$t('packages_component_classification_addChildernNode')
              : this.$t('packages_component_classification_addNode')
            : this.$t('public_button_edit')
      }
    },
    hideDialog() {
      this.dialogConfig = {
        visible: false
      }
    },
    async dialogSubmit() {
      let config = this.dialogConfig
      let value = config.label
      let id = config.id
      let gid = config.gid
      let itemType = [config.itemType]
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
          name: value
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
        metadataDefinitionsApi[method](params)
          .then(() => {
            let self = this
            self.getData(() => {
              this.$nextTick(() => {
                this.emitCheckedNodes()
              })
            })
            self.hideDialog()
          })
          .catch(err => {
            this.$message.error(err.message)
          })
      }
    },
    deleteNode(id) {
      let that = this
      this.$confirm(this.$t('packages_component_classification_deteleMessage'), {
        confirmButtonText: this.$t('public_button_delete'),
        cancelButtonText: this.$t('packages_component_message_cancel'),
        type: 'warning',
        closeOnClickModal: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        if (that.types[0] === 'user') {
          let params = {
            id: id,
            headers: {
              gid: id
            }
          }
          userGroupsApi.delete(params).then(() => {
            let self = this
            self.getData()
          })
        } else {
          metadataDefinitionsApi.delete(id).then(() => {
            let self = this
            //将当前选中的目录缓存
            this.$store.commit('catalogueKey', '')
            self.getData()
          })
        }
      })
    },
    checkName(value) {
      return new Promise(resolve => {
        if (this.types[0] === 'user') {
          this.getDataAll(items => {
            resolve(items.find(it => it.name === value))
          })
        } else {
          this.getDataAll(items => {
            resolve(items.find(it => it.name === value))
          })
        }
      })
    },

    checkAllowDrag(node) {
      return !node.data.readOnly
    },

    checkAllowDrop(draggingNode, dropNode, type) {
      return type === 'inner' && !dropNode.data.readOnly && !dropNode.data.isObject
    },

    handleDragStart(draggingNode, ev) {
      this.draggingNode = draggingNode
      this.draggingNodeImage = makeDragNodeImage(
        ev.currentTarget.querySelector('.tree-item-icon'),
        draggingNode.data.name
      )
      let { dataTransfer } = ev
      dataTransfer.setDragImage(this.draggingNodeImage, 0, 0)
    },

    handleDragEnd() {
      document.body.removeChild(this.draggingNodeImage)
      this.draggingNode = null
      this.draggingNodeImage = null
    },

    handleDrop(draggingNode, dropNode, dropType, ev) {
      console.log('handleDrop', ...arguments) // eslint-disable-line
      if (!draggingNode.data.isObject) {
        metadataDefinitionsApi
          .changeById({
            id: draggingNode.data.id,
            parent_id: dropNode.data.id || ''
          })
          .then(() => {
            this.$message.success('操作成功')
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

    handleTreeDragOver(ev) {
      ev.preventDefault()
    },

    handleTreeDragEnter(ev, data) {
      ev.preventDefault()

      if (data.readOnly || !this.dragState.isDragging) return

      const dropNode = this.findParentNodeByClassName(ev.currentTarget, 'el-tree-node')
      dropNode.classList.add('is-drop-inner')
    },

    handleTreeDragLeave(ev, data) {
      ev.preventDefault()

      if (data.readOnly) return

      if (!ev.currentTarget.contains(ev.relatedTarget)) {
        const dropNode = this.findParentNodeByClassName(ev.currentTarget, 'el-tree-node')
        dropNode.classList.remove('is-drop-inner')
      }
    },

    handleTreeDrop(ev, data) {
      if (data.readOnly) return

      const { draggingObjects } = this.dragState
      const dropNode = this.findParentNodeByClassName(ev.currentTarget, 'el-tree-node')

      if (!draggingObjects?.length || !dropNode) return

      dropNode.classList.remove('is-drop-inner')

      if (this.currentNode.readOnly) {
        this.bindTag(data, draggingObjects)
      } else {
        this.moveTag(this.currentNode.id, data.id, draggingObjects)
      }
    },

    bindTag(tag, objects) {
      discoveryApi
        .postTags({
          tagBindingParams: objects.map(t => {
            return {
              id: t.id,
              objCategory: t.category
            }
          }),
          tagIds: [tag.id]
        })
        .then(() => {
          this.getData()
          this.$message.success('操作成功')
        })
    },

    async moveTag(from, to, objects) {
      if (from === to) return

      const tagBindingParams = objects.map(t => {
        return {
          id: t.id,
          objCategory: t.category
        }
      })
      await discoveryApi.patchTags({
        tagBindingParams,
        tagIds: [from]
      })
      await discoveryApi.postTags({
        tagBindingParams,
        tagIds: [to],
        oldTagIds: [from]
      })
      objects.forEach(item => (item.parent_id = to))
      this.$message.success('操作成功')
    },

    loadNode(node, resolve) {
      console.log('loadNode', node, node.level) // eslint-disable-line
      if (node.level === 0) {
        return resolve([{ name: '所有目录' }])
      }
      setTimeout(() => {
        resolve()
      }, 2000)
    },

    async handleNodeExpand(data, node, el) {
      // 十秒内加载过资源，不再继续加载
      if (data.isRoot || (node.loadTime && Date.now() - node.loadTime < 10000)) return

      node.loadTime = Date.now()
      const objects = await this.loadObjects(data)
      console.log('handleNodeExpand', objects, data, node) // eslint-disable-line
      const childrenMap = data.children ? data.children.reduce((map, item) => ((map[item.id] = true), map), {}) : {}
      objects.forEach(item => {
        if (childrenMap[item.id]) return
        item.parent_id = data.id
        item.isObject = true
        this.$refs.tree.append(item, node)
      })
    },

    handleCurrentChange() {
      console.log('handleCurrentChange', ...arguments) // eslint-disable-line
    },

    loadObjects(node) {
      let where = {
        page: 1,
        pageSize: 10000,
        tagId: node.id,
        range: 'current',
        fields: {
          allTags: 1
        }
      }
      return discoveryApi.discoveryList(where).then(res => {
        let { total, items } = res
        return res.items
      })
    }
  }
}
</script>

<style lang="scss">
$nodeH: 28px;
.ldp-tree {
  &.el-tree.is-dragging.is-drop-not-allow .el-tree-node__content {
    cursor: default;
  }

  .el-tree-node {
    &__content {
      height: $nodeH;
      margin-bottom: 1px;
      overflow: hidden;
      border-radius: 4px;
    }

    &.is-current > .el-tree-node__content {
      background-color: #eef3ff;
    }

    &.is-drop-inner > .el-tree-node__content {
      background-color: #d0deff;
    }
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    font-size: 14px;
    padding-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: $nodeH;
    .icon-folder {
      margin-right: 5px;
      font-size: 12px;
      color: map-get($color, primary);
      // color: map-get($color, lprimary);
    }
    .table-label {
      flex: 1;
      vertical-align: middle;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 400;
      color: map-get($fontColor, normal);
    }
    .count-label {
      color: map-get($fontColor, sslight);
    }
    .btn-menu {
      display: none;
    }
    &:hover .btn-menu {
      display: flex;
    }
  }
}
.drag-node-image {
  $h: 36px;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  width: 240px;
  height: $h;
  z-index: 103;
  background-color: rgba(0, 0, 0, 0);
  .drag-preview-container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 104;
    pointer-events: none;
    display: flex;
    align-items: center;
    padding-left: 12px;
    padding-right: 12px;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    background-color: #fff;

    .drag-preview-icon {
      display: flex;
      align-items: center;
      margin-right: 8px;
    }
  }

  .drag-preview-layerEffect {
    position: absolute;
    z-index: 102;
    top: 3px;
    left: 3px;
    width: 100%;
    height: $h;
    border-radius: 4px;
    background-color: #fff;
  }

  .drag-preview-dot {
    position: absolute;
    right: -12px;
    top: -12px;
    background-color: map-get($color, danger);
    color: #fff;
    width: 24px;
    height: 24px;
    line-height: 24px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 50px;
    z-index: 104;
    text-align: center;

    &.expand {
      width: auto;
      padding: 0 7px;
      border-radius: 16px;
      right: -18px;
    }
  }
}
</style>

<style scoped lang="scss"></style>
