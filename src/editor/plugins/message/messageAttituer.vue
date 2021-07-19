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
        <div class="btn-line mb-3 text-rf">
          <el-button size="mini" :type="draggable ? 'primary' : 'default'" @click="handleDraggable">是否拖拽</el-button>
          <el-button size="mini" @click="addFieldDialog">添加字段</el-button>
        </div>
        <TreeTransfer
          ref="treeTransfer"
          class="tree-transfer"
          :left-data="leftData"
          :right-data="rightData"
          :left-title="leftTitle"
          :right-title="rightTitle"
          :node-key="nodeKey"
          :to-right-key="toRightKey"
          :draggableRight="draggableRight"
          :filter-node-method="filterNode"
          @change-left-data="changeLeftData"
          @change-right-data="changeRightData"
        >
          <template v-slot:right-tree="{ node, data }">
            <div class="transfer-item-content flex">
              <img :src="getImgByType(data.type, data.message)" alt="" />
              <span class="field-name ellipsis" :title="data.name">{{ data.name || '重名，请重新定义名称' }}</span>
            </div>
            <span class="pr-6">
              <span
                :class="['box', { 'error-tip': !data.type || !data.name }]"
                :title="!data.type ? '请选择类型' : $t('dataFlow.edit')"
                @click="editRight(node, data)"
              >
                <i class="icon-margin-right-5 iconfont icon-bianji3"></i>
              </span>
              <span class="box" @click="remove(node, data)">
                <i class="icon-margin-right-5 iconfont icon-shanchu"></i>
              </span>
            </span>
          </template>
        </TreeTransfer>
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
import TreeTransfer from './TreeTransfer'

export default {
  name: 'message',
  components: { TreeTransfer },
  data() {
    const _this = this
    const validateName = (rule, value, callback) => {
      let allNames = this.getAllItemInTree([...this.rightData], 'name')
      let allKeys = this.getAllItemInTree([...this.rightData], 'key')
      let allArr = [...allNames, ...allKeys]
      let nameSameToType = value === _this.createForm.type
      let keyArr = _this.createForm.key.split('.')
      let newKey = keyArr[keyArr.length - 1]
      if (!value) {
        callback(new Error('名称不能为空'))
      } else if (value.includes('.')) {
        callback(new Error('名称不允许使用特殊符号"."'))
      } else if (nameSameToType) {
        callback(new Error('名称不能和类型一样'))
      } else if (newKey !== value && allArr.includes(value)) {
        callback(new Error('名称已存在'))
      } else {
        callback()
      }
    }
    const validateType = (rule, value, callback) => {
      let allNames = this.getAllItemInTree([...this.rightData], 'name')
      let allKeys = this.getAllItemInTree([...this.rightData], 'key')
      let allArr = [...allNames, ...allKeys]
      let nameSameToType = value === _this.createForm.name
      let keyArr = _this.createForm.key.split('.')
      let newKey = keyArr[keyArr.length - 1]
      if (!value) {
        callback(new Error('类型不能为空'))
      } else if (value.includes('.')) {
        callback(new Error('类型不允许使用特殊符号"."'))
      } else if (nameSameToType) {
        callback(new Error('类型不能和名称一样'))
      } else if (newKey !== value && allArr.includes(value)) {
        callback(new Error('类型已存在'))
      } else {
        callback()
      }
    }
    return {
      leftTitle: '字段名',
      rightTitle: '消息体',
      sourceData: [], // 源数据，不做修改穿梭框 - 源数据 - 树形
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
      unitFlagRepeated: false, // Unit的修饰符
      fields: [], // 所有数据
      leftData: [],
      rightData: [],
      draggableRight: false,
      toRightKey: 'message',
      nodeKey: 'key'
    }
  },
  watch: {
    leftData: {
      deep: true,
      handler() {
        this.setConfig()
      }
    },
    rightData: {
      deep: true,
      handler() {
        this.setConfig()
      }
    }
  },
  methods: {
    setData(data, cell) {
      let _this = this
      if (data) {
        _.merge(this.model, data)
      }
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
      if (this.model.pbProcessorConfig?.schema) {
        let genTree = this.genTree({ ...this.model.pbProcessorConfig?.schema })
        this.rightData = genTree || []
        let getRightFields = this.getRightFields(this.rightData)
        let getRightFieldsKeys = getRightFields.map(item => item.key)
        this.leftData = _this.fieldsData.filter(item => !getRightFieldsKeys.includes(item.key))
      } else {
        // 过滤下 leftData
        this.leftData = [..._this.fieldsData]
      }
    },
    getRightFields(data = [], result = []) {
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
    changeLeftData(data) {
      this.leftData = data
    },
    changeRightData(data) {
      this.formatRightDataName(data)
      this.rightData = data
    },
    formatRightDataName(data = []) {
      data.forEach(el => {
        if (el.name.includes('.')) {
          let nameArr = el.name.split('.')
          el.name = nameArr[nameArr.length - 1]
        }
        if (el.children?.length) {
          this.formatRightDataName(el.children)
        }
      })
      return data
    },
    editRight(node, data) {
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
      this.editData = { node, data }
      this.createForm.openType = 'edit'
    },
    handleDraggable() {
      this.draggableRight = !this.draggableRight
    },
    // 添加字段弹窗
    addFieldDialog() {
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
    closeFieldDialog() {
      this.createDialogVisible = false
    },
    // 创建消息体
    createMessage() {
      let _this = this
      _this.$refs['createForm'].validate(valid => {
        if (!valid) {
          return
        }
        // 编辑
        if (_this.createForm.openType === 'edit') {
          _this.editField()
        } else {
          // 新增
          _this.addField()
        }

        _this.closeFieldDialog()
      })
    },
    addField() {
      let getCheckedNodesRight = this.$refs.treeTransfer.getCheckedNodesRight()
      this.createForm.key = this.createForm.name
      if (getCheckedNodesRight.length) {
        // 在指定节点添加字段
        this.$refs.treeTransfer.toRightNode({ ...this.createForm })
      } else {
        // 最外层添加字段
        this.rightData.push({ ...this.createForm })
      }
    },
    editField() {
      const data = this.editData.data
      for (let key in data) {
        data[key] = this.createForm[key]
      }
    },
    setConfig() {
      this.model.pbProcessorConfig = this.formatToData()
      let data = this.getData()
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
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    remove(node, data) {
      this.$confirm(this.$t('message.deleteMessageFieldConfirm'), this.$t('message.delete'), {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          this.createMessage(true)
          return
        }

        const parent = node.parent
        const children = parent.data.children || parent.data
        let result = []
        // 删除文件夹
        if ((this.toRightKey && data[this.toRightKey]) || this.toRightKey === '') {
          result = this.getLeftAllFields(data?.children)
        } else {
          // 删除字段
          result.push({
            ...data,
            ...{
              name: data.key
            }
          })
        }
        // 更新左树
        this.changeLeftData([...this.leftData, ...result])

        // 更新右树
        const index = children.findIndex(d => d[this.nodeKey] === data[this.nodeKey])
        children.splice(index, 1)
        this.changeRightData([...this.rightData])
      })
    },
    getLeftAllFields(data = [], result = []) {
      data.forEach(el => {
        if ((this.toRightKey && el[this.toRightKey]) || el?.children.length > 0) {
          this.getLeftAllFields(el?.children, result)
        } else {
          result.push({
            ...el,
            ...{
              name: el.key
            }
          })
        }
      })
      return result
    },
    getMapping(tree, result = {}) {
      if (tree.message) {
        if (tree.children?.length) {
          tree.children.forEach(el => {
            this.getMapping(el, result)
          })
        }
      } else {
        let lastArr = tree.mapping[tree.mapping.length - 1]?.split('.')
        let lastWord = lastArr[lastArr.length - 1]
        result[lastWord?.replace(/\./g, '#')] = tree.key
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
          let nameArr = el.name.split('.')
          let newName = nameArr[nameArr.length - 1]
          obj.propertyList.push({
            label: el.label,
            key: el.key,
            name: newName,
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
        let target = schema.propertyList.find(_item => _item.type === item.name) ?? {}
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
      let { rightData } = this
      let tree = this.formatMappingTree({
        key: 'Unit',
        name: 'Unit',
        message: true,
        pid: -1,
        children: [...rightData],
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
  .tree-transfer {
    flex: 1;
  }
  .box-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}
</style>
