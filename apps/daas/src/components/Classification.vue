<template>
  <div class="classification" :class="{ expand: isExpand }">
    <!-- <el-button class="btn-query" size="mini" type="text">
      <i class="iconfont icon-fangdajing" @click="searchFalg = !searchFalg"></i>
    </el-button> -->
    <ElButton type="text" class="btn-expand no-expand toggle" size="mini" @click="toggle()" v-if="!isExpand">
      <i class="iconfont icon-zhankai2"></i>
    </ElButton>
    <div class="classification-header" v-else>
      <ElButton type="text" class="btn-expand" size="mini" @click="toggle()">
        <i class="iconfont icon-zhankai2"></i>
      </ElButton>
      <ElButton class="btn-addIcon" size="mini" type="text" v-readonlybtn="authority" @click="showDialog()">
        <!-- <i class="iconfont icon-jia" v-readonlybtn="authority" @click="showDialog()"></i> -->
        {{ $t('button_button') }}
      </ElButton>
      <div class="title">
        <span>{{ types[0] === 'user' ? $t('classification.userTitle') : $t('classification.title') }}</span>
      </div>
      <!-- v-if="searchFalg" -->
      <div class="search-box">
        <el-input class="search" size="mini" v-model="filterText">
          <span slot="suffix" class="el-input__icon h-100 ml-1">
            <VIcon size="14">search</VIcon>
          </span>
        </el-input>
      </div>
    </div>
    <div class="tree-block" v-if="isExpand">
      <el-tree
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
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span class="iconfont icon-Folder-closed icon-folder"></span>
          <!-- <span class="table-label" v-if="types[0] === 'user'">{{ data.name }}</span> -->
          <span class="table-label">{{ data.value }}</span>
          <el-dropdown class="btn-menu" size="mini" @command="handleRowCommand($event, node)" v-readonlybtn="authority">
            <el-button type="text"><i class="iconfont icon-gengduo3 task-list-icon"></i></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="add">
                {{ $t('classification.addChildernNode') }}
              </el-dropdown-item>
              <el-dropdown-item command="edit">{{ $t('classification.editNode') }}</el-dropdown-item>
              <el-dropdown-item command="delete">{{ $t('classification.deleteNode') }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </span>
      </el-tree>
      <el-button
        v-if="treeData && treeData.length === 0 && isExpand"
        type="text"
        v-readonlybtn="authority"
        @click="showDialog()"
        class="create"
      >
        {{ types[0] === 'user' ? $t('classification.creatUserGroup') : $t('classification.creatDataClassification') }}
      </el-button>
    </div>
    <el-dialog :visible.sync="dialogConfig.visible" width="30%" :close-on-click-modal="false">
      <span slot="title" style="font-size: 14px">{{ dialogConfig.title }}</span>
      <el-input
        size="mini"
        v-model="dialogConfig.label"
        :placeholder="$t('classification.nodeName')"
        maxlength="50"
        show-word-limit
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="hideDialog()">{{ $t('button_cancel') }}</el-button>
        <el-button size="mini" type="primary" @click="dialogSubmit()">
          {{ $t('button_confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import factory from '../api/factory'
import VIcon from '@/components/VIcon'

const MetadataDefinitions = factory('MetadataDefinitions')
const UserGroupModel = factory('UserGroup')

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
      isExpand: false,
      filterText: '',
      treeData: [],
      default_expanded: false,
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
      this.emitCheckedNodes()
    },
    emitCheckedNodes() {
      let checkedNodes = this.$refs.tree.getCheckedKeys() || []
      this.$emit('nodeChecked', checkedNodes)
    },
    getData(cb) {
      let where = {}
      if (this.types.length) {
        where.item_type = {
          $in: this.types
        }
      }
      // if (!parseInt(this.$cookie.get('isAdmin'))) where.user_id = { regexp: `^${this.$cookie.get('user_id')}$` }
      let filter = {
        where
      }
      if (this.types[0] === 'user') {
        UserGroupModel.get({
          filter: JSON.stringify({
            limit: 999
          })
        }).then(res => {
          if (res.data) {
            let treeData = []
            if (res.data?.items?.length) {
              treeData = res.data.items.map(item => ({
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
          }
        })
      } else {
        MetadataDefinitions.get({
          filter: JSON.stringify(filter)
        }).then(res => {
          if (res.data?.items) {
            this.treeData = this.formatData(res.data?.items || [])
            cb && cb(res.data?.items || [])
          }
        })
      }
    },
    getDataAll(cb) {
      // let params = {
      //   filter: {}
      // }
      if (this.types[0] === 'user') {
        UserGroupModel.get({
          filter: JSON.stringify({
            limit: 999
          })
        }).then(res => {
          if (res.data) {
            let treeData = []
            if (res.data?.items?.length) {
              treeData = res.data.items.map(item => ({
                value: item.name,
                id: item.id,
                gid: item.gid,
                parent_id: item.parent_id,
                last_updated: item.last_updated,
                user_id: item.user_id
              }))
            }
            // this.treeData = this.formatData(res.data);
            cb && cb(treeData)
          }
        })
      } else {
        MetadataDefinitions.get().then(res => {
          if (res.data?.items) {
            // this.treeData = this.formatData(res.data);
            cb && cb(res.data?.items || [])
          }
        })
      }
    },
    //格式化分类数据
    formatData(items) {
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
              ? this.$t('classification.addChildernNode')
              : this.$t('classification.addNode')
            : this.$t('classification.editNode')
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
      let itemType = config.itemType
      let method = 'post'

      if (!value || value.trim() === '') {
        this.$message.error(this.$t('classification.nodeName'))
        return
      }

      if (this.types[0] === 'user') {
        let nameExist = await this.checkName(value)
        if (nameExist) {
          return this.$message.error(this.$t('classification.nameExist'))
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
        UserGroupModel[method](params)
          .then(res => {
            let self = this
            if (res.data) {
              self.getData(() => {
                this.$nextTick(() => {
                  this.emitCheckedNodes()
                })
              })
              self.hideDialog()
            }
          })
          .catch(e => {
            this.$message.error('MetadataInstances error' + e)
          })
      } else {
        let params = {
          item_type: itemType,
          value
        }
        if (config.type === 'edit') {
          method = 'changeById'
          params.id = id
        } else if (id) {
          params.parent_id = id
        }
        MetadataDefinitions[method](params)
          .then(res => {
            let self = this
            if (res.data) {
              self.getData(() => {
                this.$nextTick(() => {
                  this.emitCheckedNodes()
                })
              })
              self.hideDialog()
            }
          })
          .catch(e => {
            if (e.data?.code === 'MetadataDefinition.Value.Exist') {
              this.$message.error(this.$t('classification_name_already_exists'))
            } else {
              this.$message.error('MetadataInstances error' + e)
            }
          })
      }
    },
    deleteNode(id) {
      let that = this
      this.$confirm(this.$t('classification.deteleMessage'), {
        confirmButtonText: this.$t('message.delete'),
        cancelButtonText: this.$t('message.cancel'),
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
          UserGroupModel.delete(params)
            .then(() => {
              let self = this
              self.getData()
            })
            .catch(() => {
              this.$message.info(this.$t('message.deleteFail'))
            })
        } else {
          MetadataDefinitions.delete(id)
            .then(() => {
              let self = this
              self.getData()
            })
            .catch(() => {
              this.$message.info(this.$t('message.deleteFail'))
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
    .icon-zhankai2 {
      // &:hover {
      //   color: map-get($color, lprimary);
      // }
    }
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
    padding: 20px 0;
    // border-right: 1px solid map-get($borderColor, light);
    width: 214px;
    .btn-expand {
      position: absolute;
      top: 0;
      left: 19px;
      transform: rotate(180deg);
      .icon-zhankai2 {
        font-size: 16px;
        // color: map-get($color, primary);
        &:hover {
          // color: map-get($color, lprimary);
        }
      }
    }

    .btn-addIcon {
      position: absolute;
      top: 2px;
      right: 12px;
      font-size: 12px;
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
    font-size: 12px;
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
    font-size: 12px;
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
      font-size: 12px;
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
    font-size: 12px;
    // color: map-get($color, primary);
    cursor: pointer;
  }
}
</style>
<style lang="scss">
.classification-header {
  .el-input .el-input__inner {
    height: 24px;
    line-height: 24px;
  }
  .el-input__suffix {
    top: 2px;
  }
}
.classification-tree {
  padding-bottom: 50px;
  .el-tree-node__content {
    height: 26px;
    overflow: hidden;
  }
}
</style>
