<template>
  <div class="link-message nodeStyle">
    <div class="nodeBody">
      <el-form class="e-form" label-position="top" label-width="130px" :model="model" :disabled="disabled" ref="form">
        <el-form-item :required="true" :label="$t('editor.cell.processor.script.form.name.label')" size="mini">
          <el-input
            v-model="model.name"
            class="form-item-width"
            :placeholder="$t('editor.cell.processor.script.form.name.placeholder')"
          ></el-input>
        </el-form-item>
      </el-form>
      <!-- <div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div> -->
      <div class="box">
        <!-- lazy -->
        <!-- :lazyFn="lazyFn" -->
        <el-button size="medium" @click="handleDraggable">是否拖拽</el-button>
        <el-button size="medium" @click="addChecked">添加字段</el-button>
        <tree-transfer
          ref="wl-tree-transfer"
          filter
          high-light
          check-strictly
          :title="title"
          :to_data="toData"
          :from_data="fromData"
          :filterNode="filterNode"
          :defaultProps="defaultProps"
          :draggable="draggable"
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

            <div class="transfer-btn">
              <span class="box" :title="$t('dataFlow.edit')" @click="handleEdit(node, data)">
                <i class="icon-margin-right-5 iconfont icon-bianji3"></i>
              </span>
              <span class="box" @click="handleDel(node, data)">
                <i class="icon-margin-right-5 iconfont icon-shanchu"></i>
              </span>
            </div>
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
          <el-button
            @click="
              createDialogVisible = false
              editData = null
            "
            size="small"
            >{{ $t('message.cancel') }}</el-button
          >
          <el-button type="primary" @click="createMessage()" size="small">{{ $t('message.confirm') }}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import treeTransfer from 'el-tree-transfer'
import _ from 'lodash'
export default {
  name: 'Message',
  data() {
    return {
      // mode: "transfer", // transfer addressList
      $btnRight: null,
      defaultProps: {
        label: 'name',
        children: 'children'
        /* disabled(data) {
          return data.id === 2;
        }, */
      },
      title: ['字段名', '消息体'],
      sourceData: [], // 源数据，不做修改
      fromData: [], // 穿梭框 - 源数据 - 树形
      toData: [], // 穿梭框 - 目标数据 - 树形
      fromArray: [],
      toArray: [],
      defaultCheckedKeys: [], // 左侧默认选中数据
      rightCheckedKeys: null, //右侧选中数据
      rightCheckAll: false,
      leftTreeObj: null, // 左树选中
      rightTreeObj: null, // 右树选中
      createDialogVisible: false,
      disabled: false,
      fieldsData: [],
      draggable: false, //拖拽
      editData: null, // 编辑数据
      createForm: {
        name: '',
        label: 'required'
      },
      model: {
        type: 'protobuf_convert_processor',
        name: '',
        Unit: null
      }
    }
  },
  created() {
    // this.fromData = this.fieldsData.map(item => {
    //   return {
    //     pid: 0,
    //     name: item.label,
    //     key: item.key,
    //     type: item.javaType,
    //     label: item.label
    //   }
    // })
    // this.sourceData = [...this.fromData]
    // console.log('3333', this.fromData)
    // console.log('STR', JSON.stringify(this.fromData))
  },
  mounted() {
    this.$nextTick(() => {
      let treeTrans = this.$refs['wl-tree-transfer']
      let $transferCenter = treeTrans.$el?.getElementsByClassName('transfer-center')
      let $transferBtns = $transferCenter?.[0].getElementsByClassName('el-button')
      this.$btnRight = $transferBtns?.[1]
    })
  },
  components: { treeTransfer },

  methods: {
    setData(data, cell) {
      let _this = this
      if (data) {
        _.merge(this.model, data)
      }
      this.cell = cell
      if (cell && cell.getOutputSchema()) {
        let sourceSchema = cell.getOutputSchema() || null,
          sourceField = sourceSchema ? sourceSchema.fields : []
        // targetSchema = targetCell ? targetCell.getSchema() : null,
        if (sourceField.length) {
          _this.fieldsData = sourceSchema.fields.map(field => ({
            pid: 0,
            label: 'required',
            name: field.field_name,
            key: field.field_name,
            type: field.javaType,
            disabled: this.disabled,
            children: []
          }))
        }
      }
      this.fromData = _this.fieldsData
    },
    getData() {
      // return JSON.parse(JSON.stringify(this.model));
      return _.cloneDeep(this.model)
    },

    // setDisabled(disabled) {
    //   this.disabled = disabled
    // },

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

    // 清除选中
    clearChecked() {
      this.$refs['wl-tree-transfer'].clearChecked()
    },
    // 自定义筛选函数
    filterNode(value, data, where) {
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
      let node = this.rightTreeObj?.node
      let checkedKeys = this.rightTreeObj?.checkedKeys
      // let node = rightTreeObj.node
      if (node?.message && !!checkedKeys.length && checkedKeys?.includes(node?.key)) {
        obj.nodes.forEach(item => {
          // item.pid = node.name
          item.pid = node.key
          if (!node.children) {
            // node.children = []
            // this.$set(this.rightCheckedKeys, 'children', [])
            this.$set(node, 'children', [])
          }
          node.children.push(item)
          toData.forEach((el, index) => {
            if (item.name === el.name) {
              toData.splice(index, 1)
            }
          })
        })
      }
      // if (this.rightCheckedKeys) {
      //   // let children = []
      //   obj.nodes.forEach(item => {
      //     item.pid = this.rightCheckedKeys.name
      //     this.rightCheckedKeys.children.push(item)
      //     toData.forEach((el, index) => {
      //       if (item.name === el.name) {
      //         toData.splice(index, 1)
      //       }
      //     })
      //   })
      //
      //   // this.rightCheckedKeys = null
      // }
      // debugger
    },
    findFieldInTree(tree = [], result = []) {
      tree.forEach(el => {
        if (!el.message) {
          result.push(el)
        }
        if (el.pid !== 0) {
          el.pid = 0
        }
        if (el.children?.length) {
          this.findFieldInTree(el.children, result)
        }
      })
    },
    // 移除按钮
    remove(fromData, toData, obj) {
      console.log('remove', fromData, toData, obj)
      console.log('arg', arguments)
      // 树形穿梭框模式transfer时，返回参数为左侧树移动后数据、右侧树移动后数据、移动的{keys,nodes,halfKeys,halfNodes}对象
      // 通讯录模式addressList时，返回参数为右侧收件人列表、右侧抄送人列表、右侧密送人列表
      // if (this.rightCheckedKeys.message) {
      //   console.log('该节点不撤回')
      // }
      let result = []
      this.findFieldInTree(fromData, result)
      console.log('result', result)
      this.fromData = result
      // if (this.rightTreeObj?.node?.message) {
      //   this.$confirm(this.$t('message.deleteMessageFieldConfirm'), this.$t('message.delete'), {
      //     type: 'warning'
      //   }).then(resFlag => {
      //     // 否，恢复
      //     if (!resFlag) {
      //       this.createMessage(true)
      //       return
      //     }
      //     // TODO 移到左侧
      //   })
      //   // console.log('该节点不撤回')
      //   // return false
      // }
      // if (this.rightCheckedKeys.message) {
      //   console.log('该节点不撤回')
      // }
      console.log('fromData:', fromData)
      console.log('toData:', toData)
      console.log('obj:', obj)
    },
    // 左侧源数据选中事件
    leftCheckChange(nodeObj, treeObj, checkAll) {
      // console.log(nodeObj)
      // console.log(treeObj)
      // console.log(checkAll)
      this.leftTreeObj = {
        node: nodeObj,
        checkAll: checkAll,
        ...treeObj
      }
      console.log('this.leftTreeObj', this.leftTreeObj)
    },
    // 右侧目标数据选中事件
    rightCheckChange(nodeObj, treeObj, checkAll) {
      this.rightTreeObj = {
        node: nodeObj,
        checkAll: checkAll,
        ...treeObj
      }
      console.log('this.rightTreeObj', this.rightTreeObj)
      let flag = false
      this.rightTreeObj.checkedNodes.forEach(el => {
        if (el.message) {
          flag = true
        }
      })
      // this.$btnRight.disabled = flag
      if (flag) {
        // this.$btnRight.disabled = true
        this.$btnRight.style.visibility = 'hidden'
      } else {
        // this.$btnRight.disabled = false
        this.$btnRight.style.visibility = 'inherit'
      }
      // if (nodeObj.message) {
      //   this.rightCheckedKeys = nodeObj
      //   // 选中信息体是否有children
      //   if (!this.rightCheckedKeys.children) {
      //     this.$set(this.rightCheckedKeys, 'children', [])
      //   }
      // } else {
      //   this.rightCheckedKeys = null
      // }
      // // rightCheck = checkAll
      // this.rightCheckAll = checkAll
      // console.log('right', nodeObj)
      // console.log('right', treeObj)
      // console.log('right', checkAll)
    },
    // 自定义节点 仅树形结构支持
    renderContent(h, { node, data, store }) {
      return (
        <span class="custom-tree-node">
          <span>{node.label}</span>
          <span>
            <el-button size="mini" type="text" on-click={() => this.append(data)}>
              Append
            </el-button>
            <el-button size="mini" type="text" on-click={() => this.remove(node, data)}>
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

    // 新增消息体
    addChecked() {
      this.createDialogVisible = true
      this.createForm = {
        name: '',
        key: '',
        pid: 0,
        message: true,
        label: 'required',
        type: 'Login',
        openType: 'add'
      }
    },
    // 编辑消息体数据
    handleEdit(node, data) {
      this.createDialogVisible = true
      this.createForm = {
        label: data.label,
        name: data.name,
        key: data.key,
        type: data.type,
        message: data.message || false,
        disabled: data.disabled
      }
      this.editData = node
      this.createForm.openType = 'edit'
    },
    // 创建消息体
    createMessage() {
      let _this = this
      this.createDialogVisible = false
      // 新增
      if (this.createForm.message) {
        console.log('新增message')
        let rightTreeObj = this.rightTreeObj
        let node = rightTreeObj?.node
        let checkedKeys = rightTreeObj?.checkedKeys
        this.createForm.key = this.createForm.name
        if (node?.message && !!checkedKeys.length && checkedKeys?.includes(node.key)) {
          if (!node.children) {
            this.$set(node, 'children', [])
          }
          this.createForm.pid = node.key || 0
          node.children.push({ ...this.createForm })
        } else {
          this.toData.push(this.createForm)
        }

        // if (this.rightCheckedKeys) {
        //   if (!this.rightCheckedKeys.children) {
        //     this.$set(this.rightCheckedKeys, 'children', [])
        //   }
        //   this.createForm.pid = this.rightCheckedKeys.name
        //   this.rightCheckedKeys.children.push(this.createForm)
        // } else {
        //   this.toData.push(this.createForm)
        // }
      } else {
        // 编辑
        console.log('编辑message')
        const parent = this.editData.parent
        const children = parent.data.children || parent.data

        if (children.length) {
          children.forEach(item => {
            if (item.key === _this.createForm.key) {
              item.name = _this.createForm.name
              item.label = _this.createForm.label
            }
          })
        }
      }

      this.$refs.form.resetFields()
    },
    // 删除消息体数据
    handleDel(node, data) {
      this.$confirm(this.$t('message.deleteMessageFieldConfirm'), this.$t('message.delete'), {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          this.createMessage(true)
          return
        }
        // TODO 删除
        const parent = node.parent
        const index = children.findIndex(d => d.key === data.key)
        let children = parent.data.children || parent.data
        // 自定义字段
        if (data.message) {
          let result = []
          this.findFieldInTree(children, result)
          this.fromData = [...this.fromData, ...result]
          children.splice(index, 1)
        } else {
          // 系统字段
          children.splice(index, 1)
        }
      })

      // const parent = node.parent
      // const children = parent.data.children || parent.data
      //
      // // 获取当前删除数据
      // let backchild = []
      // // 获取所有的叶子节点
      // function getLeaf(childrenData) {
      //   for (var i = 0; i < childrenData.length; i++) {
      //     let currentChild = childrenData[i].children || []
      //     if (currentChild.length == 0) {
      //       backchild.push(childrenData[i])
      //     } else {
      //       getLeaf(currentChild)
      //     }
      //   }
      //   return backchild
      // }
      // getLeaf(children)
      // console.log('backchild', backchild)
      //
      // const index = children.findIndex(d => d.key === data.key)
      // children.splice(index, 1)
      //
      // this.fromData = [...this.fromData, ...backchild]
    },

    // 是否拖拽
    handleDraggable() {
      this.draggable = true
    },
    getTreeMapping(tree, result = {}, pre = []) {
      pre.push(tree.key)
      if (tree.children?.length) {
        tree.children.forEach(el => {
          this.getTreeMapping(el, result, pre)
        })
      } else if (!tree.message) {
        result[pre.join('.')] = tree.key
      }
    },
    getMapping(tree, result = {}) {
      if (tree.message) {
        if (tree.children?.length) {
          tree.children.forEach(el => {
            this.getMapping(el, result)
          })
        }
      } else {
        result[tree.mapping.join('.')] = tree.key
      }
      return result
    },
    getSchema(node) {
      let obj = {}
      obj.name = node.key
      obj.label = node.label
      obj.type = node.type
      obj.nestedList = []
      obj.propertyList = []
      if (node.children?.length) {
        let nestedIndex = 0
        let propertyIndex = 0
        node.children.forEach(el => {
          if (el.message) {
            nestedIndex++
            if (el.children?.length) {
              obj.nestedList.push(
                Object.assign({}, this.getSchema(el), {
                  number: nestedIndex
                })
              )
            } else {
              obj.nestedList.push({
                label: el.label,
                key: el.key,
                name: el.name,
                number: nestedIndex,
                type: el.type
              })
            }
          } else {
            propertyIndex++
            obj.propertyList.push({
              label: el.label,
              key: el.key,
              name: el.name,
              number: propertyIndex,
              type: el.type
            })
          }
        })
      }
      return obj
    },
    formatMappingTree(tree, parent) {
      // 继承父节点的mapping
      if (parent) {
        tree.mapping = [...parent.mapping, tree.key]
      } else {
        tree.mapping = [tree.key]
      }
      if (tree.children?.length) {
        tree.children.forEach(el => {
          this.formatMappingTree(el, tree)
        })
      }
      console.log('formatMappingTree', tree)
      return tree
    },
    transToData(tree) {
      // disabled: false
      // key: "VREMARKS"
      // label: "required"
      // name: "VREMARKS"
      // pid: 0
      // type: "String"
      // children: Array(0)
      let obj = {}
      obj.name = tree.name
      obj.key = tree.key || tree.name
      obj.type = tree.type
      obj.disabled = false
      obj.label = tree.label
      obj.pid = ''
      obj.children = []
      //nestedList propertyList
      // 系统字段
      if (tree.propertyList?.length) {
        tree.propertyList.forEach(el => {
          obj.children.push({
            name: el.name,
            key: el.key || el.name,
            type: el.type,
            disabled: false,
            label: el.label,
            pid: tree.key,
            children: []
          })
        })
      }
      // 自定义字段
      if (tree.nestedList?.length) {
        tree.nestedList.forEach(el => {
          obj.children.push(
            Object.assign({}, this.transToData(el), {
              message: true,
              type: el.type,
              label: el.label,
              pid: tree.key
            })
          )
        })
      }
      return obj
    },
    formatToData() {
      // let { toData } = this
      // let tree = this.formatMappingTree({
      //   key: 'Unit',
      //   name: 'Unit',
      //   message: true,
      //   pid: -1,
      //   children: [...toData]
      // })
      // let getMapping = this.getMapping({ ...tree })
      // let getSchema = this.getSchema({ ...tree })
      // let transToData = this.transToData({ ...getSchema })
    }
  }
}
</script>

<style lang="scss">
.link-message {
  height: 100%;
  .nodeBody {
    height: 100%;
  }
  .box,
  .transfer {
    height: 100% !important;
    .el-tree-node__content {
      .custom-tree-node {
        width: 100%;
        font-size: 12px;
        .field-name {
          display: inline-block;
          width: 100px;
          padding-left: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .transfer-btn {
          float: right;
          color: #666;
        }
      }
    }
  }
}
</style>
