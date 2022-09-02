<template>
  <el-dialog
    :title="$t('dataFlow_batchSortOperation')"
    :visible="dialogVisible"
    width="600px"
    class="SelectClassify-dialog"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <div>
      <el-tag
        size="mini"
        class="SelectClassify-tag"
        closable
        v-for="item in tagList"
        v-bind:key="item.value"
        @close="handleCloseTag(item)"
        >{{ item.value }}</el-tag
      >
    </div>
    <div>
      <el-tag size="mini" type="info" class="SelectClassify-tag" v-for="item in oldTagList" v-bind:key="item.value">{{
        item.value
      }}</el-tag>
      <el-button size="mini" @click="handleClearOldTag" round v-if="Object.keys(oldTagList).length > 0"
        >Clear</el-button
      >
    </div>
    <el-tree
      node-key="id"
      :props="props"
      :expand-on-click-node="false"
      :data="treeData"
      :filter-node-method="filterNode"
      ref="tree"
      check-strictly
      @node-click="handleCheckChange"
      class="SelectClassify-tree"
    >
      <span class="custom-tree-node" slot-scope="{ data }">
        <span>
          <span class="iconfont icon-Folder-closed filter-icon"></span>
          <span class="table-label">{{ data.value }}</span>
        </span>
      </span>
    </el-tree>
    <span slot="footer" class="dialog-footer">
      <el-button class="message-button-cancel" @click="handleCancel" size="mini">{{ $t('button_cancel') }}</el-button>
      <el-button type="primary" @click="handleAdd" size="mini">{{ $t('button_save') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Cookie from '@tap/shared/src/cookie'
import { metadataDefinitionsApi, userGroupsApi } from '@tap/api'

export default {
  name: 'SelectClassify',
  props: {
    types: {
      value: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      default_expanded: false,
      props: {
        children: 'children',
        label: 'label',
        isLeaf: 'leaf'
      },
      treeData: [],
      tagList: [],
      oldTagList: []
    }
  },
  methods: {
    show(tagList) {
      this.dialogVisible = true
      this.oldTagList = JSON.parse(JSON.stringify(tagList))
      this.getData()
    },
    getData(cb) {
      let where = {}
      if (this.types.length) {
        where.or = this.types.map(t => ({ item_type: t }))
      }

      if (!parseInt(Cookie.get('isAdmin'))) where.user_id = { regexp: `^${Cookie.get('user_id')}$` }

      let filter = {
        where
      }

      if (this.types[0] === 'user') {
        userGroupsApi
          .get({
            filter: JSON.stringify({
              limit: 999
            })
          })
          .then(data => {
            let items = data?.items || []
            let treeData = items.map(item => ({
              value: item.name,
              id: item.id,
              gid: item.gid,
              parent_id: item.parent_id,
              last_updated: item.last_updated,
              user_id: item.user_id
            }))
            this.treeData = this.formatData(treeData)
            cb && cb(data)
          })
      } else {
        metadataDefinitionsApi
          .get({
            filter: JSON.stringify(filter)
          })
          .then(data => {
            let items = data?.items || []
            this.treeData = this.formatData(items)
            cb && cb(items)
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
      return data.label.indexOf(value) !== -1
    },
    handleClose() {
      this.tagList = []
      this.oldTagList = []
      this.dialogVisible = false
    },
    handleClearOldTag() {
      this.oldTagList = ''
    },
    handleCheckChange(data) {
      this.oldTagList = []
      if (this.tagList.length > 0 && data.id === this.tagList[0].id) {
        this.tagList = []
      } else {
        this.tagList = []
        let node = {
          id: data.id,
          value: data.value,
          gid: data.gid
        }
        this.tagList.push(node)
      }
    },
    handleCloseTag(data) {
      let checkList = this.$refs.tree.getCheckedKeys()
      if (checkList.length > 0) {
        checkList.map((k, index) => {
          if (k === data.id) {
            checkList.splice(index, 1)
          }
        })
        this.$refs.tree.setCheckedKeys(checkList)
      }
      this.tagList.map((k, index) => {
        if (k.id === data.id) {
          this.tagList.splice(index, 1)
        }
      })
    },
    handleCancel() {
      this.handleClose()
    },
    handleAdd() {
      if (Object.keys(this.oldTagList).length !== 0) {
        this.handleClose()
        return
      }
      if (this.tagList && this.tagList.length === 0) {
        this.tagList = []
      }
      this.$emit('operationsClassify', this.tagList)
      this.handleClose()
    }
  }
}
</script>

<style scoped lang="scss">
.filter-icon {
  padding-right: 10px;
  font-size: 12px;
  color: map-get($color, primary);
}

.SelectClassify-tree {
  max-height: 500px;
  overflow-y: auto;
  .el-dialog__body {
    padding: 0 0 0 20px;
  }
}
.SelectClassify-tag {
  margin-right: 5px;
  margin-top: 5px;
  margin-bottom: 10px;
}
</style>
<style lang="scss">
.SelectClassify-dialog {
  .el-dialog__body {
    padding: 0 0 0 20px;
  }
}
</style>
