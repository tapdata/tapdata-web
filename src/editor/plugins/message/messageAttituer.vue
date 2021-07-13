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
      <div class="box box-content">
        <!-- lazy -->
        <!-- :lazyFn="lazyFn" -->
        <div class="btn-line mb-3">
          <el-button size="mini" :type="draggable ? 'primary' : 'default'" @click="handleDraggable">是否拖拽</el-button>
          <el-button size="mini" @click="addChecked">添加字段</el-button>
        </div>

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
        :title="createForm.openType === 'edit' ? '编辑' : '新增'"
        width="600px"
        custom-class="create-dialog"
        :close-on-click-modal="false"
        :visible.sync="createDialogVisible"
      >
        <el-form ref="form" :model="createForm" class="dataRule-form" @submit.native.prevent>
          <el-form-item label="名称">
            <el-input size="mini" v-model="createForm.name"></el-input>
          </el-form-item>
          <el-form-item label="类型">
            <el-input v-if="createForm.message" size="mini" v-model="createForm.type"></el-input>
            <el-select v-else v-model="createForm.type" size="mini">
              <el-option
                v-for="(item, index) in typeOptions"
                :key="index"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="限定修饰符">
            <el-radio-group v-model="createForm.label">
              <el-radio label="required"> Required </el-radio>
              <el-radio label="optional"> Optional </el-radio>
              <el-radio label="repeated"> Repeated </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        {{ createForm }}
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
import _ from 'lodash'
import treeTransfer from 'el-tree-transfer'

export default {
  name: 'message',
  components: { treeTransfer },
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
        pbProcessorConfig: {
          mapping: {},
          schema: {}
        }
      },
      typeOptions: [
        { label: 'bool', value: 'bool' },
        { label: 'double', value: 'double' },
        { label: 'float', value: 'float' },
        { label: 'int32', value: 'int32' },
        { label: 'int64', value: 'int64' },
        { label: 'unit32', value: 'unit32' },
        { label: 'unit64', value: 'unit64' },
        { label: 'sint32', value: 'sint32' },
        { label: 'sint64', value: 'sint64' },
        { label: 'fixed32', value: 'fixed32' },
        { label: 'fixed64', value: 'fixed64' },
        { label: 'sfixed32', value: 'sfixed32' },
        { label: 'sfixed64', value: 'sfixed64' },
        { label: 'string', value: 'string' },
        { label: 'bytes', value: 'bytes' },
        { label: 'enum', value: 'enum' }
      ]
    }
  },
  mounted() {
    this.$nextTick(() => {
      let treeTrans = this.$refs['wl-tree-transfer']
      let $transferCenter = treeTrans.$el?.getElementsByClassName('transfer-center')
      let $transferBtns = $transferCenter?.[0].getElementsByClassName('el-button')
      this.$btnRight = $transferBtns?.[1]
    })
  },
  watch: {
    model: {
      deep: true,
      handler() {
        let data = this.getData()
        console.log('$emit-data', data)
        this.$emit('dataChanged', data)
      }
    },
    toData: {
      deep: true,
      handler() {
        this.model.pbProcessorConfig = this.formatToData()
      }
    }
  },
  // methods: {
  //   setData(data) {
  //     if (data) {
  //       _.merge(this.model, data)
  //     }
  //   },
  //   getData() {
  //     // return JSON.parse(JSON.stringify(this.model));
  //     return _.cloneDeep(this.model)
  //   },
  //
  //   setDisabled(disabled) {
  //     this.disabled = disabled
  //   }
  // }
  methods: {
    setData(data, cell) {
      let _this = this
      if (data) {
        _.merge(this.model, data)
      }
      console.log('setData', this.model, data)
      this.cell = cell
      if (cell && cell.getOutputSchema()) {
        let sourceSchema = cell.getOutputSchema() || null,
          sourceField = sourceSchema ? sourceSchema.fields : []
        // targetSchema = targetCell ? targetCell.getSchema() : null,
        if (sourceField.length) {
          _this.fieldsData = sourceSchema.fields.map(field => {
            let obj = {
              pid: 0,
              label: 'required',
              name: field.field_name,
              key: field.field_name,
              type: field.javaType,
              disabled: this.disabled,
              children: []
            }
            if (obj.type === 'Date') {
              obj.type = 'string'
            }
            obj.type = obj.type.toLowerCase()
            return obj
          })
        }
        console.log('_this.fieldsData', _this.fieldsData)
      }
      // toData
      if (this.model.pbProcessorConfig?.schema) {
        let result = this.transToData({ ...this.model.pbProcessorConfig?.schema })?.children ?? []
        console.log('setData result', result)
        let genTree = this.genTree({ ...this.model.pbProcessorConfig?.schema })
        console.log('genTree', genTree)
        // this.toData = result
        // TODO 删除右侧已存在的key
        this.toData = genTree
        let getRightFields = this.getRightFields(this.toData)
        let getRightFieldsKeys = getRightFields.map(item => item.key)
        console.log('getRightFields', getRightFields, getRightFieldsKeys)
        // 过滤下 fromdata
        this.fromData = _this.fieldsData.filter(item => !getRightFieldsKeys.includes(item.key))
      } else {
        // 过滤下 fromdata
        this.fromData = _this.fieldsData
      }
    },
    getRightFields(data, result = []) {
      data.forEach(el => {
        if (!el.message) {
          result.push(el)
        }
        if (el.children?.length) {
          this.getRightFields(el.children, result)
        }
      })
      return result
    },
    getData() {
      let result = _.cloneDeep(this.model)
      result.name = result.name || 'Message'
      console.log('result', result)
      return result
    },
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
      if (this.mode === 'transfer') {
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
    },
    findFieldInTree(data = [], result = []) {
      data.forEach(el => {
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
      let result = []
      this.findFieldInTree(fromData, result)
      console.log('result', result)
      this.fromData = result
      console.log('fromData:', fromData)
      console.log('toData:', toData)
      console.log('obj:', obj)
    },
    // 左侧源数据选中事件
    leftCheckChange(nodeObj, treeObj, checkAll) {
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
    },
    // 自定义节点 仅树形结构支持
    renderContent(h, { node, data }) {
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
      if (this.createForm.openType === 'add') {
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
        let children = parent.data?.children || []
        let getIndex = children?.findIndex(d => {
          return d.key === data.key
        })

        console.log('删除')
        // 自定义字段
        if (data.message) {
          // let result = []
          let getRightFields = this.getRightFields(data.children)
          console.log('getRightFields', getRightFields)
          // this.fromData = [...this.fromData, ...result]
          // let getIndex = children?.findIndex(d => {
          //   return d.key === data.key
          // })
          this.fromData = [...this.fromData, ...getRightFields]
          !!getIndex && children.splice(getIndex, 1)
        } else {
          // 系统字段
          // let getIndex = children?.findIndex(d => {
          //   return d.key === data.key
          // })
          console.log('index', getIndex)
          this.fromData.push(data)
          children.splice(getIndex, 1)
        }
      })
    },

    // 是否拖拽
    handleDraggable() {
      this.draggable = !this.draggable
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
          propertyIndex++
          obj.propertyList.push({
            label: el.label,
            key: el.key,
            name: el.name,
            number: propertyIndex,
            type: el.type
          })
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
      return tree
    },
    genTree(schema) {
      schema.nestedList?.forEach(item => {
        let target = schema.propertyList.find(_item => _item.key === item.name)
        target.children = this.genTree(item) ?? []
        target.message = true
      })
      return schema.propertyList
    },
    transToData(tree) {
      let obj = {}
      obj.name = tree.name
      obj.key = tree.key || tree.name
      obj.type = tree.type
      obj.disabled = false
      obj.label = tree.label || tree.name
      obj.pid = ''
      obj.children = []
      //nestedList propertyList
      // 系统字段 + 自定义字段
      if (tree.propertyList?.length) {
        tree.propertyList.forEach(el => {
          let findOne = tree.nestedList.find(item => {
            return (item.key && item.key === el.key) || (!item.key && item.name === el.key)
          })
          let nodeObj = {
            name: el.name,
            key: el.key || el.name,
            type: el.type,
            disabled: false,
            label: el.label,
            pid: tree.key,
            children: [],
            message: !!findOne
          }
          if (findOne) {
            let result = this.transToData(findOne, nodeObj)
            nodeObj.children.push(result)
            obj.children.push(nodeObj)
          } else {
            obj.children.push(nodeObj)
          }
        })
      }
      return obj
    },
    formatToData() {
      let { toData } = this
      let tree = this.formatMappingTree({
        key: 'pbProcessorConfig',
        name: 'pbProcessorConfig',
        message: true,
        pid: -1,
        children: [...toData]
      })
      let getMapping = this.getMapping({ ...tree })
      let getSchema = this.getSchema({ ...tree })
      let transToData = this.transToData({ ...getSchema })
      console.log('getMapping', getMapping)
      console.log('getSchema', getSchema)
      console.log('transToData', transToData)
      return {
        mapping: getMapping,
        schema: getSchema
      }
    }
  }
}
</script>

<style lang="scss">
.link-message {
  height: 100%;
  .nodeBody {
    height: 100%;
    display: flex;
    flex-direction: column;
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
  .box-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}
</style>
