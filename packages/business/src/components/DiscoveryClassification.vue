<template>
  <div class="classification pt-3 h-100">
    <div class="classification-header pl-0">
      <!--<ElButton class="btn-addIcon"  text @click="showDialog()">
            <VIcon size="12">add</VIcon>
          </ElButton>
          <div class="title">
            <span>{{ $t('packages_component_src_discoveryclassification_suoyoumulu') }}</span>
          </div>-->
      <!-- v-if="searchFalg" -->
      <div class="search-box">
        <ElInput v-model="filterText">
          <template v-slot:suffix>
            <span class="el-input__icon h-100 ml-1">
              <VIcon size="14">search</VIcon>
            </span>
          </template>
        </ElInput>
      </div>
    </div>
    <div class="tree-block pr-3 min-h-0" v-if="isExpand" v-loading="loadingTree">
      <ElTree
        class="classification-tree pb-0"
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
      />
      <!--<ElButton v-if="treeData && treeData.length === 0 && isExpand" text @click="showDialog()" class="create">
            {{ $t('packages_component_classification_creatDataClassification') }}
          </ElButton>-->
    </div>
    <ElDialog v-model="dialogConfig.visible" width="30%" :close-on-click-modal="false">
      <template #header>
        <span style="font-size: 14px">{{ dialogConfig.title }}</span>
      </template>
      <ElForm ref="form" :model="dialogConfig" label-width="80px">
        <ElFormItem :label="$t('packages_component_src_discoveryclassification_mulumingcheng')">
          <ElInput
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
      <template v-slot:footer>
        <span class="dialog-footer">
          <ElButton @click="hideDialog()">{{ $t('packages_component_button_cancel') }}</ElButton>
          <ElButton type="primary" @click="dialogSubmit()">
            {{ $t('packages_component_button_confirm') }}
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script lang="jsx">
import { $on, $off, $once, $emit } from '../../utils/gogocodeTransfer'
import i18n from '@tap/i18n'

import { VIcon } from '@tap/component'
import { metadataDefinitionsApi, userGroupsApi, discoveryApi } from '@tap/api'
import Cookie from '@tap/shared/src/cookie'

import { makeDragNodeImage } from '../shared/classification'

export default {
  components: { VIcon },
  props: {
    types: {
      type: Array,
      default: () => {
        return []
      },
    },
    dragState: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      searchFalg: false,
      isExpand: true,
      filterText: '',
      treeData: [],
      default_expanded: false,
      expandedKeys: [],
      loadingTree: false,
      props: {
        key: 'id',
        label: 'name',
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
        visible: false,
      },

      nodeName: '',
      parent_id: '',
      title: '',
      iconMap: {
        table: 'table',
        defaultApi: 'apiServer_navbar',
      },
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
    },
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
          <div class="tree-item-icon flex align-center mr-2">{icon && <VIcon size="16">{icon}</VIcon>}</div>
          <span class="table-label">
            {data.name}
            {!data.isRoot && <span class="count-label mr-2 ml-2">({data.objCount})</span>}
          </span>
          {!data.readOnly && !data.isObject && (
            <span class="btn-menu">
              <VIcon
                size="14"
                class="color-primary mr-2"
                onClick={(ev) => {
                  ev.stopPropagation()
                  data.isRoot ? this.showDialog() : this.showDialog(node, 'add')
                }}
              >
                add
              </VIcon>
              {!data.isRoot && (
                <ElDropdown
                  class="inline-flex"
                  placement="bottom"
                  trigger="click"
                  onCommand={(ev) => this.handleRowCommand(ev, node)}
                >
                  {{
                    default: () => (
                      <VIcon
                        onClick={(ev) => {
                          ev.stopPropagation()
                        }}
                        size="16"
                        class="color-primary"
                      >
                        more-circle
                      </VIcon>
                    ),
                    dropdown: () => (
                      <ElDropdownMenu>
                        <ElDropdownItem command="edit">{this.$t('public_button_edit')}</ElDropdownItem>
                        <ElDropdownItem command="delete">{this.$t('public_button_delete')}</ElDropdownItem>
                      </ElDropdownMenu>
                    ),
                  }}
                </ElDropdown>
              )}
            </span>
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
      $emit(this, 'nodeChecked', node)
    },

    getData(cb) {
      let where = {}
      where.item_type = {
        $nin: ['database', 'dataflow', 'api', 'source', 'fdm', 'mdm', 'target'],
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
          user_id: 1,
        },
      }
      this.loadingTree = true
      metadataDefinitionsApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          let items = data?.items || []
          let treeData = this.formatData(items)
          this.treeData = [
            {
              name: i18n.t('packages_business_components_classificationtree_suoyoumulu'),
              isRoot: true,
              readOnly: true,
              children: treeData,
            },
          ]
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
      metadataDefinitionsApi.get().then((data) => {
        cb && cb(data?.items || [])
      })
    },
    //格式化分类数据
    formatData(items) {
      const userId = Cookie.get('user_id')
      if (items && items.length) {
        let map = {}
        let nodes = []

        //遍历第一次， 先把所有子类按照id分成若干数组
        items.forEach((it) => {
          it.name = it.value
          it.isLeaf = it.objCount === 0
          if (it.parent_id) {
            let children = map[it.parent_id] || []
            children.push(it)
            map[it.parent_id] = children
          } else {
            //默认目录国际化
            if (it?.item_type && it?.item_type.findIndex((t) => t === 'default') > -1) {
              it.name = i18n.t('packages_component_src_discoveryclassification_morenmuluji')
              if (it?.userName && it?.user_id !== userId) {
                it.name += `| ${it.userName}`
              }
            }
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
          .catch((err) => {
            this.$message.error(err.message)
          })
      }
    },
    deleteNode(id) {
      let that = this
      this.$confirm(this.$t('packages_component_classification_deteleMessage'), {
        confirmButtonText: this.$t('public_button_delete'),
        cancelButtonText: this.$t('public_button_cancel'),
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
            //将当前选中的目录缓存
            this.$store.commit('catalogueKey', '')
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
            resolve(items.find((it) => it.name === value))
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
        [draggingNode],
        this.$el,
      )
      let { dataTransfer } = ev
      dataTransfer.setDragImage(this.draggingNodeImage, 0, 0)
    },

    handleDragEnd() {
      this.$el.removeChild(this.draggingNodeImage)
      this.draggingNode = null
      this.draggingNodeImage = null
    },

    handleDrop(draggingNode, dropNode, dropType, ev) {
      console.log('handleDrop', ...arguments) // eslint-disable-line
      if (!draggingNode.data.isObject) {
        metadataDefinitionsApi
          .changeById({
            id: draggingNode.data.id,
            parent_id: dropNode.data.id || '',
          })
          .then(() => {
            this.$message.success(i18n.t('public_message_operation_success'))
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
          tagBindingParams: objects.map((t) => {
            return {
              id: t.id,
              objCategory: t.category,
            }
          }),
          tagIds: [tag.id],
        })
        .then(() => {
          this.getData()
          this.$message.success(this.$t('public_message_operation_success'))
        })
    },

    async moveTag(from, to, objects) {
      if (from === to) return

      const tagBindingParams = objects.map((t) => {
        return {
          id: t.id,
          objCategory: t.category,
        }
      })
      await discoveryApi.patchTags({
        tagBindingParams,
        tagIds: [from],
      })
      await discoveryApi.postTags({
        tagBindingParams,
        tagIds: [to],
      })
      objects.forEach((item) => (item.parent_id = to))
      this.$message.success(this.$t('public_message_operation_success'))
    },

    loadNode(node, resolve) {
      console.log('loadNode', node, node.level) // eslint-disable-line
      if (node.level === 0) {
        return resolve([
          {
            name: i18n.t('packages_business_components_classificationtree_suoyoumulu'),
          },
        ])
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
      objects.forEach((item) => {
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
      }
      return discoveryApi.discoveryList(where).then((res) => {
        let { total, items } = res
        return res.items
      })
    },
  },
  emits: ['nodeChecked'],
}
</script>

<style lang="scss" scoped>
$nodeH: 28px;
.classification {
  position: relative;
  display: flex;
  flex-direction: column; /*// height: 22px;*/
  user-select: none;
  box-sizing: border-box;
  border-top: none;
  background: var(--color-white);
  border-radius: 3px; /*// overflow: hidden;*/ /*// box-shadow: 0px -2px 10px 0px rgba(0, 0, 0, 0.1);*/
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
    left: 18px;
    top: 4px;
  }
  .toggle {
    margin-top: 16px;
    // color: var(--color-lprimary);
    z-index: 2;
  }
  &.expand {
    height: 100%;
    //width: 100%;
    padding: 12px 0 20px 0;
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
      top: 2px;
      right: 12px;
      font-size: 12px;
      color: var(--text-light);
      .iconfont.icon-jia {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        color: var(--text-light);
        font-size: 16px;
        height: 66%;
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

  /*头部样式*/
  .classification-header {
    position: relative;
    padding: 0 12px;
    // background: var(--bg-normal);
    // border-bottom: 1px solid #dedee4;
    font-size: 12px;
    line-height: 31px;
    display: flex;
    width: 214px;
    flex-direction: column;
    .title {
      display: flex;
      align-items: center;
      font-weight: 500;
      font-size: 14px;
      justify-content: space-between;
      color: var(--text-dark);
      // background-color: #eff1f4;
    }

    .search-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 3px;
    }
  }
  .tree-block {
    position: relative;
    width: 100%;
    flex: 1;
    //padding: 0 10px;
    overflow: auto;
  }

  .create {
    padding: 5px 10px;
    font-size: 12px;
    // color: var(--color-primary)
    cursor: pointer;
  }

  :deep(.classification-tree) {
    padding-bottom: 50px;
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
        color: var(--color-primary);
        // color: var(--color-lprimary);
      }
      .table-label {
        flex: 1;
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 400;
        color: var(--text-normal);
      }
      .count-label {
        color: var(--text-sslight);
      }
      .btn-menu {
        display: none;
      }
      &:hover .btn-menu {
        display: flex;
      }
    }
  }
}
</style>
