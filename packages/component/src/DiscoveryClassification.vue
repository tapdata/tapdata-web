<template>
  <div class="classification" :class="{ expand: isExpand }">
    <div class="classification-header pl-0">
      <ElButton class="btn-addIcon" size="mini" type="text" @click="showDialog()">
        <VIcon size="12">add</VIcon>
      </ElButton>
      <div class="title">
        <span>{{ $t('packages_component_src_discoveryclassification_suoyoumulu') }}</span>
      </div>
      <!-- v-if="searchFalg" -->
      <div class="search-box">
        <ElInput size="mini" v-model="filterText">
          <span slot="suffix" class="el-input__icon h-100 ml-1">
            <VIcon size="14">search</VIcon>
          </span>
        </ElInput>
      </div>
    </div>
    <div class="tree-block pr-3" v-if="isExpand" v-loading="loadingTree">
      <ElTree
        v-if="treeData && treeData.length > 0"
        class="classification-tree"
        ref="tree"
        node-key="id"
        highlight-current
        :props="props"
        :data="treeData"
        draggable
        :default-expanded-keys="expandedKeys"
        :filter-node-method="filterNode"
        :render-after-expand="false"
        :expand-on-click-node="false"
        :allow-drag="checkAllowDrag"
        :allow-drop="checkAllowDrop"
        @node-click="nodeClickHandler"
        @check="checkHandler"
        @node-drag-start="handleDragStart"
        @node-drag-over="handleDragOver"
        @node-drop="handleDrop"
      >
        <span
          class="custom-tree-node"
          slot-scope="{ node, data }"
          @dragover.stop="handleTreeDragOver"
          @drop.stop="handleTreeDrop"
        >
          <!-- <span class="table-label" v-if="types[0] === 'user'">{{ data.name }}</span> -->
          <!--<el-tooltip :content="`${data.value} (${data.objCount})`" placement="bottom-start" :open-delay="400">
            <span class="table-label"
              >{{ data.value }}<span class="count-label mr-2 ml-2">({{ data.objCount }})</span></span
            >
          </el-tooltip>-->
          <VIcon v-if="!node.isLeaf" class="tree-item-icon mr-1" size="24">folder</VIcon>
          <span class="table-label"
            >{{ data.value }}<span class="count-label mr-2 ml-2">({{ data.objCount }})</span></span
          >
          <span class="btn-menu" v-if="!data.readOnly">
            <ElButton class="mr-2" type="text" @click="showDialog(node, 'add')"
              ><VIcon size="12" class="color-primary">add</VIcon></ElButton
            >
            <ElDropdown size="mini" @command="handleRowCommand($event, node)">
              <ElButton type="text"><VIcon size="16" class="color-primary">more-circle</VIcon></ElButton>
              <ElDropdownMenu slot="dropdown">
                <ElDropdownItem command="edit">{{ $t('packages_component_classification_editNode') }}</ElDropdownItem>
                <ElDropdownItem command="delete">{{
                  $t('packages_component_classification_deleteNode')
                }}</ElDropdownItem>
              </ElDropdownMenu>
            </ElDropdown>
          </span>
        </span>
      </ElTree>
      <ElButton v-if="treeData && treeData.length === 0 && isExpand" type="text" @click="showDialog()" class="create">
        {{
          types[0] === 'user'
            ? $t('packages_component_classification_creatUserGroup')
            : $t('packages_component_classification_creatDataClassification')
        }}
      </ElButton>
    </div>
    <ElDialog :visible.sync="dialogConfig.visible" width="30%" :close-on-click-modal="false">
      <span slot="title" style="font-size: 14px">{{ dialogConfig.title }}</span>
      <ElForm ref="form" :model="dialogConfig" label-width="80px">
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
        <ElButton size="mini" @click="hideDialog()">{{ $t('packages_component_button_cancel') }}</ElButton>
        <ElButton size="mini" type="primary" @click="dialogSubmit()">
          {{ $t('packages_component_button_confirm') }}
        </ElButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
import i18n from '@tap/i18n'

import { VIcon } from '@tap/component'
import { metadataDefinitionsApi, userGroupsApi } from '@tap/api'
import Cookie from '@tap/shared/src/cookie'

export default {
  components: { VIcon },
  props: {
    types: {
      type: Array,
      default: () => {
        return []
      }
    },
    authority: {
      type: String
    }
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
        label: 'value'
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
      title: ''
    }
  },
  mounted() {
    this.getData()
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
    }
  },
  methods: {
    toggle() {
      this.isExpand = !this.isExpand
    },
    clear() {
      this.$refs.tree && this.$refs.tree.setCheckedNodes([])
    },
    checkHandler(data, { checkedKeys }) {
      let checked = checkedKeys.includes(data.id)
      let setChecked = arr => {
        if (arr && arr.length) {
          arr.forEach(node => {
            this.$refs.tree.setChecked(node, checked, true)
            setChecked(node.children)
          })
        }
      }
      setChecked(data.children)
      this.emitCheckedNodes()
    },
    nodeClickHandler(data, node) {
      this.clear()
      node.checked = !node.checked
      this.emitCheckedNodes(node)
    },
    emitCheckedNodes(node) {
      if (!node) return
      this.$emit('nodeChecked', node?.data)
      //将当前选中的目录缓存
      this.$store.commit('catalogueKey', node?.data)
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
      if (this.types[0] === 'user') {
        userGroupsApi
          .get({
            filter: JSON.stringify({
              limit: 999
            })
          })
          .then(data => {
            let treeData = []
            let items = data?.items || []
            if (items.length) {
              treeData = items.map(item => ({
                value: item.name,
                name: item.name,
                id: item.id,
                gid: item.gid,
                parent_id: item.parent_id,
                last_updated: item.last_updated,
                user_id: item.user_id
              }))
            }
            this.treeData = this.formatData(treeData)

            cb && cb(treeData)
          })
      } else {
        this.loadingTree = true
        metadataDefinitionsApi
          .get({
            filter: JSON.stringify(filter)
          })
          .then(data => {
            let items = data?.items || []
            this.treeData = this.formatData(items)
            cb && cb(items)
            //默认选中第一个
            this.$nextTick(() => {
              let data = this.$store.state.catalogueKey
              if (!data) {
                this.$store.commit('catalogueKey', this.treeData?.[0])
                this.$emit('nodeChecked', this.treeData?.[0])
              } else {
                this.$emit('nodeChecked', data)
              }
              let key = data?.id || this.treeData?.[0]?.id
              this.$refs.tree.setCurrentKey(key)
              this.expandedKeys = [key]
            })
          })
          .finally(() => {
            this.loadingTree = false
          })
      }
    },
    getDataAll(cb) {
      if (this.types[0] === 'user') {
        userGroupsApi
          .get({
            filter: JSON.stringify({
              limit: 999
            })
          })
          .then(data => {
            let items = data?.items || []
            let treeData = []
            if (items?.length) {
              treeData = items.map(item => ({
                value: item.name,
                id: item.id,
                gid: item.gid,
                parent_id: item.parent_id,
                last_updated: item.last_updated,
                user_id: item.user_id
              }))
            }
            cb && cb(treeData)
          })
      } else {
        metadataDefinitionsApi.get().then(data => {
          cb && cb(data?.items || [])
        })
      }
    },
    //格式化分类数据
    formatData(items) {
      const userId = Cookie.get('user_id')
      if (items && items.length) {
        let map = {}
        let nodes = []
        //遍历第一次， 先把所有子类按照id分成若干数组
        items.forEach(it => {
          if (it.parent_id) {
            let children = map[it.parent_id] || []
            children.push(it)
            map[it.parent_id] = children
          } else {
            //默认目录国际化
            if (it?.item_type && it?.item_type.findIndex(t => t === 'default') > -1) {
              it.value = i18n.t('packages_component_src_discoveryclassification_morenmuluji')
              if (it?.userName && it?.user_id !== userId) {
                it.value += `| ${it.userName}`
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
            : this.$t('packages_component_classification_editNode')
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
        confirmButtonText: this.$t('packages_component_message_delete'),
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
            resolve(items.find(it => it.value === value))
          })
        }
      })
    },

    checkAllowDrag(node) {
      return !node.data.readOnly
    },

    checkAllowDrop(draggingNode, dropNode, type) {
      return type === 'inner' && !dropNode.data.readOnly
    },

    makeDragNodeImage($icon, node, parent = document.body) {
      const div = document.createElement('div')

      if (!node) return div
      div.classList.add('drag-node-image')
      div.style.position = 'absolute'
      div.style.zIndex = '-100'
      div.style.opacity = '1'
      parent.appendChild(div)
      const container = document.createElement('div')
      container.className = 'drag-preview-container'
      if ($icon) {
        const icon = $icon.cloneNode(true)
        icon.className = 'drag-preview--icon'
        container.appendChild(icon)
      }
      const text = document.createElement('div')
      text.className = 'drag-preview-name ellipsis'
      text.innerHTML = node.data.value
      container.appendChild(text)
      div.appendChild(container)

      return div
    },

    handleDragStart(draggingNode, ev) {
      this.draggingNode = draggingNode
      this.draggingNodeImage = this.makeDragNodeImage(
        ev.currentTarget.querySelector('.tree-item-icon'),
        draggingNode,
        this.$el
      )
      let { dataTransfer } = ev
      dataTransfer.setDragImage(this.draggingNodeImage, 0, 0)
    },

    handleDragOver() {
      console.log('handleDragOver', arguments) // eslint-disable-line
    },

    handleDragEnd() {
      this.$el.removeChild(this.draggingNodeImage)
      this.draggingNode = null
      this.draggingNodeImage = null
    },

    handleDrop(draggingNode, dropNode, dropType, ev) {
      console.log('handleDrop', ...arguments) // eslint-disable-line
      // return
      metadataDefinitionsApi
        .changeById({
          id: draggingNode.data.id,
          parent_id: dropNode.data.id
        })
        .then(() => {
          this.$message.success('操作成功')
          draggingNode.data.parent_id = dropNode.data.id
          // this.getData()
        })
        .catch(err => {
          this.$message.error(err.message)
        })
    },

    handleTreeDragOver(ev) {
      ev.preventDefault()
      console.log('treeDragOver', ev) // eslint-disable-line
    },

    handleTreeDrop(ev) {
      console.log('treeDrop', ev) // eslint-disable-line
    }
  }
}
</script>

<style scoped lang="scss">
.classification {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 20px;
  // height: 22px;
  user-select: none;
  box-sizing: border-box;
  border-top: none;
  background: map-get($bgColor, white);
  border-radius: 3px;
  // overflow: hidden;
  // box-shadow: 0px -2px 10px 0px rgba(0, 0, 0, 0.1);
  .btn-expand {
    // padding: 2px 3px;
    // color: map-get($fontColor, light);
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
    // color: map-get($color, lprimary);
    z-index: 2;
  }
  &.expand {
    height: 100%;
    //width: 100%;
    padding: 12px 0 20px 0;
    // border-right: 1px solid map-get($borderColor, light);
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
      color: map-get($fontColor, light);
      .iconfont.icon-jia {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        color: map-get($fontColor, light);
        font-size: 16px;
        height: 66%;
        margin-top: 0px;
        border-top-width: 1px;
        border-radius: 3px;
        cursor: pointer;
        &:hover {
          color: map-get($color, primary);
        }
      }
    }
    .btn-query {
      position: absolute;
      right: 54px;
      .icon-fangdajing {
        font-size: 16px;
        color: map-get($fontColor, light);
        &:hover {
          color: map-get($color, primary);
        }
      }
    }
  }

  /*头部样式*/
  .classification-header {
    position: relative;
    padding: 0 12px;
    // background: map-get($bgColor, normal);
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
      color: map-get($fontColor, dark);
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
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    font-size: 14px;
    padding-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 32px;
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
      max-width: 120px;
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
      display: block;
    }
  }
  .create {
    padding: 5px 10px;
    font-size: 12px;
    // color: map-get($color, primary);
    cursor: pointer;
  }

  ::v-deep {
    .classification-tree {
      padding-bottom: 50px;
      .el-tree-node {
        &__content {
          height: 32px;
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
    }
  }
}
</style>
