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
        <div class="btn-line mb-3 text-rf">
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
          @node-drag-end="nodeDragEnd"
          @add-btn="add"
          node_key="key"
        >
          <template #content-right="{ node, data }">
            <div class="flex justify-between">
              <div class="transfer-item-content flex">
                <img :src="getImgByType(data.type, data.message)" />
                <span class="field-name" :title="data.name">{{ data.name }}</span>
              </div>
              <div class="transfer-btn">
                <span
                  :class="['box', { 'error-tip': !data.type }]"
                  :title="!data.type ? '请选择类型' : $t('dataFlow.edit')"
                  @click="handleEdit(node, data)"
                >
                  <i class="icon-margin-right-5 iconfont icon-bianji3"></i>
                </span>
                <span class="box" @click="handleDel(node, data)">
                  <i class="icon-margin-right-5 iconfont icon-shanchu"></i>
                </span>
              </div>
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
        <el-form ref="createForm" :model="createForm" :rules="rules" class="dataRule-form" @submit.native.prevent>
          <el-form-item label="名称" required prop="name">
            <el-input size="mini" v-model="createForm.name"></el-input>
          </el-form-item>
          <el-form-item label="类型" required prop="type">
            <el-input v-if="createForm.message" size="mini" v-model="createForm.type" style="width: 100%"></el-input>
            <el-select v-else v-model="createForm.type" size="mini" style="width: 100%">
              <el-option
                v-for="(item, index) in typeOptions"
                :key="index"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="限定修饰符">
            <el-radio-group v-model="createForm.label" :disabled="!!createForm.flagRepeated">
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
import _ from 'lodash'
import treeTransfer from 'el-tree-transfer'

export default {
  name: 'message',
  components: { treeTransfer },
  data() {
    const _this = this
    const validateName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('名称不能为空'))
      } else if (
        _this.createForm.key !== value &&
        this.getAllItemInTree([...this.fromData, ...this.toData], 'key').includes(value)
      ) {
        callback(new Error('名称已存在'))
      } else {
        callback()
      }
    }
    const validateType = (rule, value, callback) => {
      if (!value) {
        callback(new Error('类型不能为空'))
      } else {
        callback()
      }
    }
    return {
      // mode: "transfer", // transfer addressList
      $btnRight: null,
      defaultProps: {
        label: 'name',
        children: 'children'
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
        type: '',
        label: 'required'
      },
      rules: {
        name: [{ validator: validateName, trigger: 'blur' }],
        type: [{ validator: validateType, trigger: 'blur' }]
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
      ],
      suportTypeMap: {
        boolean: 'bool',
        bytes: 'bytes',
        double: 'double',
        float: 'float',
        int: 'int32',
        integer: 'int32',
        long: 'int64',
        short: 'int32',
        sint: 'sint32',
        string: 'string'
      },
      unitFlagRepeated: false // Unit的修饰符
    }
  },
  mounted() {
    this.$nextTick(() => {
      let treeTrans = this.$refs['wl-tree-transfer']
      let $transferCenter = treeTrans.$el?.getElementsByClassName('transfer-center')
      let $transferBtns = $transferCenter?.[0].getElementsByClassName('el-button')
      this.$btnRight = $transferBtns?.[1]
      this.$btnRight.style.visibility = 'hidden'
    })
  },
  methods: {
    setData(data, cell) {
      let _this = this
      if (data) {
        _.merge(this.model, data)
      }
      console.log('setData', this.model, data)
      this.cell = cell
      if (cell?.getOutputSchema()) {
        let sourceSchema = cell.getOutputSchema() || null,
          sourceField = sourceSchema ? sourceSchema.fields : []
        // targetSchema = targetCell ? targetCell.getSchema() : null,
        if (sourceField) {
          _this.fieldsData = sourceSchema.fields
            .filter(field => !!field.field_name)
            .map(field => {
              let obj = {
                pid: 0,
                label: 'required',
                name: field.field_name,
                key: field.field_name,
                type: field.javaType,
                disabled: this.disabled,
                // number: 0,
                // mapping: [],
                children: []
              }
              obj.type = obj.type.toLowerCase()
              obj.type = this.suportTypeMap[obj.type] ?? ''
              return obj
            })
        }
      }
      // toData
      if (this.model.pbProcessorConfig?.schema) {
        let genTree = this.genTree({ ...this.model.pbProcessorConfig?.schema })
        console.log('genTree', genTree)
        this.toData = genTree || []
        let getRightFields = this.getRightFields(this.toData)
        let getRightFieldsKeys = getRightFields.map(item => item.key)
        console.log('getRightFields', getRightFields, getRightFieldsKeys)
        // 过滤下 fromdata
        this.fromData = _this.fieldsData.filter(item => !getRightFieldsKeys.includes(item.key))
      } else {
        // 过滤下 fromdata
        this.fromData = [..._this.fieldsData]
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
      return result
    },
    setConfig() {
      this.model.pbProcessorConfig = this.formatToData()
      let data = this.getData()
      console.log('$emit-data', data)
      this.$emit('dataChanged', data)
    },
    // data数组，result返回的结果，field只存某个字段
    getAllItemInTree(data, field = '', result = []) {
      data.forEach(el => {
        if (field) {
          result.push(el[field])
        } else {
          result.push(el)
        }
        let children = el.children
        if (children?.length) {
          this.getAllItemInTree(children, field, result)
        }
      })
      return result
    },
    // 获取图片
    getImgByType(type, message = false) {
      let dType = type.toLowerCase()
      // if (dType === 'int32') {
      //   dType = 'integer'
      // }
      let { suportTypeMap } = this
      for (let key in suportTypeMap) {
        if (suportTypeMap[key] === dType) {
          dType = key
          break
        }
      }
      if (message) {
        dType = 'file'
      }
      let pngList = [
        'array',
        'bigdecimal',
        'boolean',
        'byte',
        'bytes',
        'date',
        'datetime',
        'Default',
        'double',
        'enum',
        'file',
        'fixed',
        'float',
        'int',
        'integer',
        'login',
        'long',
        'map',
        'null',
        'obj',
        'objects',
        'PK',
        'sfixed',
        'short',
        'sint',
        'string',
        'time',
        'uint',
        'Unrecognized',
        'unsupported'
      ]
      if (pngList.includes(dType)) {
        return require(`@/assets/images/types/${dType}.png`)
      } else {
        return require(`@/assets/images/types/Default.png`)
      }
    },
    // 自定义筛选函数
    filterNode(value, data, where) {
      if (!value) return true
      return data[this.defaultProps.label].indexOf(value) !== -1
    },
    // 添加按钮
    add(fromData, toData, obj) {
      console.log('add', fromData, toData, obj)
      let node = this.rightTreeObj?.node
      let checkedKeys = this.rightTreeObj?.checkedKeys
      // let node = rightTreeObj.node
      if (node && !node.children) {
        this.$set(node, 'children', [])
      }
      if (node?.message && !!checkedKeys.length && checkedKeys?.includes(node?.key)) {
        obj.nodes.forEach(item => {
          // item.pid = node.name
          item.pid = node.key
          item.disabled = false
          node.children.push(item)
          toData.forEach((el, index) => {
            if (item.name === el.name) {
              toData.splice(index, 1)
            }
          })
        })
        this.setFileLabel(obj.nodes, node)
      } else {
        this.setFileLabel(obj.nodes)
      }
      // 清空右侧选中
      this.leftTreeObj = null
      this.rightTreeObj = null
      this.setConfig()
    },
    setFileLabel(data, node) {
      let flagRepeated = false // 树形结构的源，需要锁定label的值
      let fieldsData = this.cell?.getOutputSchema()?.fields ?? []
      data.forEach(el => {
        if (el.key.includes('.')) {
          let pre = el.key.slice(0, el.key.lastIndexOf('.'))
          let findOne = fieldsData.find(item => item.field_name === pre)
          if (findOne?.javaType?.toLowerCase() === 'array') {
            flagRepeated = true
          }
        }
      })
      // 文件夹
      if (node) {
        this.$set(node, 'flagRepeated', flagRepeated)
        if (flagRepeated) {
          node.label = 'repeated'
        }
      } else {
        // 最外层的Unit
        this.unitFlagRepeated = flagRepeated
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
      let result = []
      this.findFieldInTree(fromData, result)
      this.fromData = result
    },
    nodeDragEnd() {
      this.setConfig()
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
        type: '',
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
        disabled: data.disabled,
        flagRepeated: data.flagRepeated
      }
      this.editData = node
      this.createForm.openType = 'edit'
    },
    // 创建消息体
    createMessage() {
      let _this = this
      _this.$refs['createForm'].validate(valid => {
        if (!valid) {
          return
        }
        _this.createDialogVisible = false
        // 新增
        if (_this.createForm.openType === 'add') {
          let rightTreeObj = _this.rightTreeObj
          let node = rightTreeObj?.node
          let checkedKeys = rightTreeObj?.checkedKeys
          _this.createForm.key = _this.createForm.name
          if (node?.message && !!checkedKeys.length && checkedKeys?.includes(node.key)) {
            if (!node.children) {
              _this.$set(node, 'children', [])
            }
            _this.createForm.pid = node.key || 0
            node.children.push({ ..._this.createForm })
          } else {
            _this.toData.push({ ..._this.createForm })
          }
        } else {
          // 编辑
          const parent = _this.editData.parent
          const children = parent.data.children || parent.data

          if (children.length) {
            children.forEach(item => {
              if (item.key === _this.createForm.key) {
                item.name = _this.createForm.name
                item.label = _this.createForm.label
                item.type = _this.createForm.type
              }
            })
          }
        }

        _this.$refs['createForm'].resetFields()

        _this.setConfig()
      })
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
        const parent = node.parent
        let children = parent.data instanceof Array ? parent.data : parent.data?.children || []
        let getIndex = children?.findIndex(d => {
          return d.key === data.key
        })
        // 自定义字段
        if (data.message) {
          let getRightFields = this.getRightFields(data.children)
          this.fromData = [...this.fromData, ...getRightFields]
          !!getIndex && children.splice(getIndex, 1)
        } else {
          // 系统字段
          this.fromData.push(data)
          children.splice(getIndex, 1)
        }
        // 更新数据
        this.setConfig()
      })
    },
    // 是否拖拽
    handleDraggable() {
      this.draggable = !this.draggable
    },
    getMapping(tree, result = {}) {
      if (tree.message) {
        if (tree.children?.length) {
          tree.children.forEach(el => {
            this.getMapping(el, result)
          })
        }
      } else {
        result[tree.mapping.join('#')] = tree.key
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
                  number: nestedIndex,
                  name: el.type
                })
              )
            } else {
              obj.nestedList.push({
                label: el.label,
                key: el.key,
                name: el.type,
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
        let target = schema.propertyList.find(_item => _item.key === item.name) ?? {}
        target.children = this.genTree(item) ?? []
        target.message = true
      })
      return schema?.propertyList?.map(item => {
        if (!item.children) {
          item.children = []
        }
        return item
      })
    },
    formatToData() {
      let { toData } = this
      let tree = this.formatMappingTree({
        key: 'Unit',
        name: 'Unit',
        message: true,
        pid: -1,
        children: [...toData],
        unitFlagRepeated: this.unitFlagRepeated
      })
      let getMapping = this.getMapping({ ...tree })
      let getSchema = this.getSchema({ ...tree })
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
        .transfer-item-content {
          flex: 1;
        }
        .field-name {
          display: inline-block;
          width: 100px;
          flex: 1;
          padding-left: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .transfer-btn {
          float: right;
          color: #666;
          width: 45px;
          .error-tip {
            color: orangered;
          }
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
