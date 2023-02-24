<template>
  <div class="classification" :class="{ expand: isExpand }">
    <ElButton
      type="text"
      class="btn-expand no-expand toggle"
      size="mini"
      @click="toggle()"
      v-if="!isExpand"
    >
      <VIcon size="16" class="icon">expand-list</VIcon>
    </ElButton>
    <div class="classification-header" v-else>
      <ElButton type="text" class="btn-expand" size="mini" @click="toggle()">
        <VIcon size="16" class="icon">expand-list</VIcon>
      </ElButton>
      <ElButton
        class="btn-addIcon"
        size="mini"
        type="text"
        :disabled="$disabledReadonlyUserBtn()"
        v-readonlybtn="authority"
        @click="showDialog()"
      >
        <VIcon size="16" class="icon">add-fill</VIcon>
      </ElButton>
      <div class="title">
        <span>{{ comTitle }}</span>
      </div>
      <div class="search-box">
        <ElInput class="search" size="mini" v-model:value="filterText">
          <template v-slot:suffix>
            <span class="el-input__icon h-100 ml-1">
              <VIcon size="14">search</VIcon>
            </span>
          </template>
        </ElInput>
      </div>
    </div>
    <div class="tree-block" v-if="isExpand">
      <ElTree
        v-if="treeData && treeData.length > 0"
        check-strictly
        show-checkbox
        class="classification-tree"
        ref="tree"
        node-key="id"
        highlight-current
        :props="props"
        :expand-on-click-node="false"
        :data="treeData"
        :filter-node-method="filterNode"
        :render-after-expand="false"
        @node-click="nodeClickHandler"
        @check="checkHandler"
      >
        <template v-slot="{ node, data }">
          <span class="custom-tree-node">
            <VIcon size="12" class="color-primary mr-1">folder-fill</VIcon>
            <!-- <span class="table-label" v-if="types[0] === 'user'">{{ data.name }}</span> -->
            <span class="table-label">{{ data.value }}</span>
            <ElDropdown
              class="btn-menu"
              size="mini"
              @command="handleRowCommand($event, node)"
              v-readonlybtn="authority"
            >
              <ElButton type="text" :disabled="$disabledReadonlyUserBtn()"
                ><VIcon size="16" class="color-primary"
                  >more-circle</VIcon
                ></ElButton
              >
              <template v-slot:dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="add">
                    {{
                      $t('packages_component_classification_addChildernNode')
                    }}
                  </ElDropdownItem>
                  <ElDropdownItem command="edit">{{
                    $t('packages_component_classification_editNode')
                  }}</ElDropdownItem>
                  <ElDropdownItem command="delete">{{
                    $t('packages_component_classification_deleteNode')
                  }}</ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </span>
        </template>
      </ElTree>
      <ElButton
        v-if="treeData && treeData.length === 0 && isExpand"
        type="text"
        v-readonlybtn="authority"
        @click="showDialog()"
        class="create"
        >{{
          $t('packages_component_src_classification_chuangjianfenlei')
        }}</ElButton
      >
    </div>
    <ElDialog
      v-model:visible="dialogConfig.visible"
      width="30%"
      :close-on-click-modal="false"
    >
      <template v-slot:title>
        <span style="font-size: 14px">{{ dialogConfig.title }}</span>
      </template>
      <ElInput
        size="mini"
        v-model:value="dialogConfig.label"
        :placeholder="$t('packages_component_classification_nodeName')"
        maxlength="50"
        show-word-limit
      ></ElInput>
      <template v-slot:footer>
        <span class="dialog-footer">
          <ElButton size="mini" @click="hideDialog()">{{
            $t('packages_component_button_cancel')
          }}</ElButton>
          <ElButton size="mini" type="primary" @click="dialogSubmit()">
            {{ $t('packages_component_button_confirm') }}
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from 'utils/gogocodeTransfer'
import { VIcon } from '@tap/component'
import { metadataDefinitionsApi, userGroupsApi } from '@tap/api'
import { mapMutations, mapState, mapGetters } from 'vuex'

export default {
  components: { VIcon },
  props: {
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
  },
  data() {
    return {
      searchFalg: false,
      isExpand: false,
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
    }
  },
  computed: {
    ...mapState('classification', ['connections', 'migrate', 'sync']),
    ...mapGetters('classification', [
      'stateConnections',
      'stateMigrate',
      'stateSync',
    ]),

    comTitle() {
      return (
        this.title ||
        (this.types[0] === 'user'
          ? this.$t('packages_component_classification_userTitle')
          : this.$t('packages_component_classification_title'))
      )
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
          $emit(this, 'nodeChecked', this.connections?.classification)
        })
        break
      case 'migrate':
        if (!this.isExpand) return
        this.$nextTick(() => {
          this.$refs.tree?.setCheckedKeys(this.migrate?.classification)
          $emit(this, 'nodeChecked', this.migrate?.classification)
        })
        break
      case 'sync':
        if (!this.isExpand) return
        this.$nextTick(() => {
          this.$refs.tree?.setCheckedKeys(this.sync?.classification)
          $emit(this, 'nodeChecked', this.sync?.classification)
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
      this.isExpand = !this.isExpand
      this.setPanelFlag({
        panelFlag: this.isExpand,
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
      this.clear()
      node.checked = !node.checked
      this.emitCheckedNodes()
    },
    emitCheckedNodes() {
      let checkedNodes = this.$refs.tree.getCheckedKeys() || []
      $emit(this, 'nodeChecked', checkedNodes)
      this.setTag({
        value: checkedNodes,
        type: this.viewPage,
      })
    },
    getData(cb) {
      let where = {}
      if (this.types.length) {
        where.item_type = {
          $in: this.types,
        }
      }
      let filter = {
        where,
      }
      if (this.types[0] === 'user') {
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
        metadataDefinitionsApi
          .get({
            filter: JSON.stringify(filter),
          })
          .then((data) => {
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
        metadataDefinitionsApi.get().then((data) => {
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
            : this.$t('packages_component_classification_editNode'),
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
        this.$message.error(
          this.$t('packages_component_classification_nodeName')
        )
        return
      }

      if (this.types[0] === 'user') {
        let nameExist = await this.checkName(value)
        if (nameExist) {
          return this.$message.error(
            this.$t('packages_component_classification_nameExist')
          )
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
      this.$confirm(
        this.$t('packages_component_classification_deteleMessage'),
        {
          confirmButtonText: this.$t('packages_component_message_delete'),
          cancelButtonText: this.$t('packages_component_message_cancel'),
          type: 'warning',
          closeOnClickModal: false,
        }
      ).then((resFlag) => {
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
  },
  emits: ['nodeChecked'],
}
</script>

<style lang="scss" scoped>
.classification {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 20px; /*// height: 22px;*/
  user-select: none;
  box-sizing: border-box;
  border-top: none;
  background: map-get($bgColor, white);
  border-radius: 3px; /*// overflow: hidden;*/ /*// box-shadow: 0px -2px 10px 0px rgba(0, 0, 0, 0.1);*/
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
    left: 4px;
    top: 4px;
  }
  .toggle {
    margin-top: 18px;
    // color: map-get($color, lprimary);
    z-index: 2;
  }
  &.expand {
    height: 100%;
    //width: 100%;
    padding: 20px 0;
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
      right: 12px;
      font-size: $fontBaseTitle;
      .iconfont.icon-jia {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        color: map-get($fontColor, light);
        font-size: 16px;
        // background-color: map-get($bgColor, white);
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
    font-size: $fontBaseTitle;
    line-height: 31px;
    display: flex;
    width: 214px;
    flex-direction: column;
    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px 0 46px;
      color: map-get($fontColor, light);
      // background-color: #eff1f4;
    }

    .search-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 3px;
      // .iconfont {
      // 	color: #c0c4cc;
      // 	font-size: 12px;
      // 	background-color: map-get($bgColor, white);
      // 	border: 1px solid #dedee4;
      // 	display: flex;
      // 	justify-content: center;
      // 	align-items: center;
      // 	height: 66%;
      // 	padding: 0 4px;
      // 	padding-right: 6px;
      // 	padding-left: 5px;
      // 	margin-top: 0px;
      // 	border-top-width: 1px;
      // 	border-radius: 3px;
      // 	cursor: pointer;
      // }
    }
    .search {
      margin-left: 7px;
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
    font-size: $fontBaseTitle;
    padding-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 26px;
    .icon-folder {
      margin-right: 5px;
      font-size: 12px;
      color: map-get($color, primary);
      // color: map-get($color, lprimary);
    }
    .table-label {
      flex: 1;
      font-size: $fontBaseTitle;
      vertical-align: middle;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 120px;
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
    font-size: $fontBaseTitle;
    // color: map-get($color, primary);
    cursor: pointer;
  }
}
</style>

<style lang="scss">
.classification-tree {
  padding-bottom: 50px;
  .el-tree-node__content {
    height: 26px;
    overflow: hidden;
  }
}
</style>
