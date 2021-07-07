<template>
  <div class="link-message">
    <div class="box">
      {{ fromData }}
      %%%%%%%%
      {{ toData }}
      <!-- lazy -->
      <!-- :lazyFn="lazyFn" -->
      <el-button size="medium" @click="addChecked()">添加字段</el-button>
      <tree-transfer
        ref="wl-tree-transfer"
        filter
        draggable
        high-light
        check-strictly
        :title="title"
        :to_data="toData"
        :from_data="fromData"
        :filterNode="filterNode"
        :defaultProps="defaultProps"
        :defaultCheckedKeys="defaultCheckedKeys"
        :defaultExpandedKeys="[2, 3]"
        @right-check-change="rightCheckChange"
        @left-check-change="leftCheckChange"
        @remove-btn="remove"
        @add-btn="add"
        node_key="key"
      >
        <template #content-right="{ node, data }">
          <img :src="getImgByType(data.type) || getImgByType('Default')" />
          <span class="field-name" :title="data.name">{{ data.name }}</span>

          <span class="box" :title="$t('dataFlow.edit')">
            <i class="icon-margin-right-5 iconfont icon-bianji2"></i>
          </span>
          <span class="box"> 删除 </span>
        </template>
      </tree-transfer>
    </div>
    <el-dialog
      width="600px"
      custom-class="create-dialog"
      :close-on-click-modal="false"
      :visible.sync="createDialogVisible"
    >
      <el-form ref="form" :model="createForm" class="dataRule-form">
        <el-form-item label="名称">
          <el-input v-model="createForm.name"></el-input>
        </el-form-item>
        <el-form-item label="限定修饰符">
          <el-radio-group v-model="createForm.label">
            <el-radio label="required"> Required </el-radio>
            <el-radio label="optional"> Optional </el-radio>
            <el-radio label="repeated"> Repeated </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false" size="small">{{
          $t('message.cancel')
        }}</el-button>
        <el-button type="primary" @click="createMessage()" size="small">{{
          $t('message.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import treeTransfer from 'el-tree-transfer'
export default {
  name: 'Message',
  props: {
    fieldsData: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      // mode: "transfer", // transfer addressList
      defaultProps: {
        label: 'name',
        children: 'children'
        /* disabled(data) {
          return data.id === 2;
        }, */
      },
      title: ['字段名', '消息体'],
      fromData: [], // 穿梭框 - 源数据 - 树形
      toData: [], // 穿梭框 - 目标数据 - 树形
      fromArray: [],
      toArray: [],
      defaultCheckedKeys: [], // 左侧默认选中数据
      rightCheckedKeys: null, //右侧选中数据

      createDialogVisible: false,
      createForm: {
        name: '',
        label: 'required'
      }
    }
  },
  created() {
    this.fromData = this.fieldsData.map(item => {
      return {
        pid: 0,
        name: item.label,
        key: item.key,
        type: item.javaType
      }
    })
    console.log('3333', this.fromData)
  },
  components: { treeTransfer },
  methods: {
    // 获取图片
    getImgByType(type) {
      return require(`@/assets/images/types/${type.toLowerCase()}.png`)
    },
    // 获取选中
    getChecked() {
      const checkeds = this.$refs['wl-tree-transfer'].getChecked()
      console.log('获取选中：', checkeds)
    },
    // 设置选中
    setChecked() {
      this.$refs['wl-tree-transfer'].setChecked([3], [2])
    },
    // 添加选中
    addChecked() {
      this.createDialogVisible = true
      this.createForm = {
        name: '',
        pid: 0,
        message: true,
        label: 'required',
        type: 'Login'
      }
    },
    // 清除选中
    clearChecked() {
      this.$refs['wl-tree-transfer'].clearChecked()
    },
    // 自定义筛选函数
    filterNode(value, data, where) {
      console.log(value, data, where)
      if (!value) return true
      return data[this.defaultProps.label].indexOf(value) !== -1
    },
    // 懒加载回调
    lazyFn(node, resolve) {
      setTimeout(() => {
        resolve([
          {
            id: 71272,
            pid: 7127,
            name: 'debug22',
            // disabled: true,
            children: []
          },
          {
            id: 71273,
            pid: 7127,
            name: 'debug11',
            children: []
          }
        ])
      }, 500)
    },
    // 切换模式 现有树形穿梭框模式transfer 和通讯录模式addressList
    changeMode() {
      if (this.mode == 'transfer') {
        this.mode = 'addressList'
      } else {
        this.mode = 'transfer'
      }
    },
    // 添加按钮
    add(fromData, toData, obj) {
      // 树形穿梭框模式transfer时，返回参数为左侧树移动后数据、右侧树移动后数据、移动的{keys,nodes,halfKeys,halfNodes}对象
      // 通讯录模式addressList时，返回参数为右侧收件人列表、右侧抄送人列表、右侧密送人列表
      console.log('fromData:', fromData)
      console.log('toData:', toData)
      console.log('obj:', obj)
      if (this.rightCheckedKeys) {
        // let children = []
        obj.nodes.forEach(item => {
          this.rightCheckedKeys.children.push(item)
          toData.forEach((el, index) => {
            if (item.name === el.name) {
              toData.splice(index, 1)
            }
          })
        })
        // this.rightCheckedKeys = null
      }
      debugger
    },
    // 移除按钮
    remove(fromData, toData, obj) {
      // 树形穿梭框模式transfer时，返回参数为左侧树移动后数据、右侧树移动后数据、移动的{keys,nodes,halfKeys,halfNodes}对象
      // 通讯录模式addressList时，返回参数为右侧收件人列表、右侧抄送人列表、右侧密送人列表
      if (this.rightCheckedKeys.message) {
        console.log('该节点不撤回')
      }
      console.log('fromData:', fromData)
      console.log('toData:', toData)
      console.log('obj:', obj)
    },
    // 左侧源数据选中事件
    leftCheckChange(nodeObj, treeObj, checkAll) {
      console.log(nodeObj)
      console.log(treeObj)
      console.log(checkAll)
    },
    // 右侧目标数据选中事件
    rightCheckChange(nodeObj, treeObj, checkAll) {
      if (nodeObj.message) {
        this.rightCheckedKeys = nodeObj
        // 选中信息体是否有children
        if (!this.rightCheckedKeys.children) {
          this.$set(this.rightCheckedKeys, 'children', [])
        }
      }
      console.log('right', nodeObj)
      console.log('right', treeObj)
      console.log('right', checkAll)
    },
    // 自定义节点 仅树形结构支持
    renderContent(h, { node, data, store }) {
      return (
        <span class="custom-tree-node">
          <span>{node.label}</span>
          <span>
            <el-button
              size="mini"
              type="text"
              on-click={() => this.append(data)}
            >
              Append
            </el-button>
            <el-button
              size="mini"
              type="text"
              on-click={() => this.remove(node, data)}
            >
              Delete
            </el-button>
          </span>
        </span>
      )
    },
    // 标题自定义区点击事件
    handleTitleRight() {
      alert('标题自定义区点击事件')
    },
    // 创建消息体
    createMessage() {
      this.createDialogVisible = false
      this.toData.push(this.createForm)
      this.$refs.form.resetFields()
    }
  }
}
</script>
<style lang="scss">
.link-message {
  height: 100%;
  .box,
  .transfer {
    height: 100% !important;
    .el-tree-node__content {
      .custom-tree-node {
        font-size: 12px;
        .field-name {
          display: inline-block;
          width: 100px;
          padding-left: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>
