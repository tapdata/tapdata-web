<template>
  <div class="field-mapping">
    <div><strong>表设置</strong>: 用户可以在此页面勾选源端每个表要同步的字</div>
    <div class="search">
      <div class="item">
        <span> 搜索表：</span>
        <el-input v-model="searchTable" size="mini" @blur="search('table')"></el-input>
      </div>
      <div class="item">
        <span> 搜索字段：</span>
        <el-input v-model="searchField" size="mini" @blur="search('field')"></el-input>
      </div>
    </div>
    <div class="task-form-body">
      <div class="nav">
        <ul>
          <li
            v-for="(item, index) in fieldMappingNavData"
            :class="{ active: position === index }"
            @click="select(item, index)"
          >
            <div class="imgBox">
              <img src="../assets/images/fieldMapping-table.png" alt="" />
            </div>
            <div class="contentBox">
              <div class="contentBox__source">{{ item.sourceObjectName }}</div>
              <div class="contentBox__target">{{ item.sinkObjectName }}</div>
              <div class="contentBox__select">
                {{ `已选中 ${position === index ? fieldCount : 0}/${item.sourceFieldCount}` }}
              </div>
            </div>
          </li>
        </ul>
      </div>
      <El-table
        class="connection-table table-border"
        height="100%"
        :data="fieldMappingTableData"
        :row-class-name="tableRowClassName"
        v-loading="loading"
      >
        <el-table-column type="index" width="55"> </el-table-column>
        <ElTableColumn show-overflow-tooltip label="源表名" prop="field_name" min-width="250"></ElTableColumn>
        <ElTableColumn label="源表类型" prop="data_type"></ElTableColumn>
        <ElTableColumn label="源表长度" prop="scale" width="80"></ElTableColumn>
        <ElTableColumn label="源表精度" prop="precision" width="80"></ElTableColumn>
        <ElTableColumn label="目标表名" width="190">
          <template slot-scope="scope">
            <div v-if="!scope.row.is_deleted" @click="edit(scope.row, 'field_name')">
              <span>{{ scope.row.t_field_name }}</span>
              <i class="icon el-icon-edit-outline"></i>
            </div>
            <div v-else>
              <span>{{ scope.row.t_field_name }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="目标表类型">
          <template slot-scope="scope">
            <div v-if="!scope.row.is_deleted" @click="edit(scope.row, 'data_type')">
              <span>{{ scope.row.t_data_type }}</span>
              <i class="icon el-icon-arrow-down"></i>
            </div>
            <div v-else>
              <span>{{ scope.row.t_data_type }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="目标表长度">
          <template slot-scope="scope">
            <div v-if="scope.row.t_scale && !scope.row.is_deleted" @click="edit(scope.row, 'scale')">
              <span>{{ scope.row.t_scale }}</span>
              <i class="icon el-icon-edit-outline"></i>
            </div>
            <div v-else>
              <span>{{ scope.row.t_scale }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="目标表精度">
          <template slot-scope="scope">
            <div v-if="scope.row.t_precision && !scope.row.is_deleted" @click="edit(scope.row, 'precision')">
              <span>{{ scope.row.t_precision }}</span>
              <i class="icon el-icon-edit-outline"></i>
            </div>
            <div v-else>
              <span>{{ scope.row.t_precision }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作">
          <template scope="scope">
            <ElLink type="primary" v-if="!scope.row.is_deleted" @click="del(scope.row.id, true)"> 删除 </ElLink>
            <ElLink type="primary" v-else @click="del(scope.row.t_id, false)"> 还原 </ElLink>
          </template>
        </ElTableColumn>
        <div class="connection-table__empty" slot="empty">
          <i class="el-icon-folder-opened"></i>
          <span class="ml-1">暂无数据</span>
        </div>
      </El-table>
    </div>
    <el-dialog
      :title="titleType[currentOperationType]"
      :visible.sync="dialogVisible"
      width="30%"
      append-to-body
      :close-on-click-modal="false"
      :before-close="handleClose"
    >
      <el-input
        v-model="editValueType[currentOperationType]"
        v-if="['field_name'].includes(currentOperationType)"
      ></el-input>
      <el-input-number
        v-model="editValueType[currentOperationType]"
        v-if="['precision', 'scale'].includes(currentOperationType)"
      ></el-input-number>
      <el-select v-model="editValueType[currentOperationType]" v-if="['data_type'].includes(currentOperationType)">
        <el-option :label="item" :value="item" v-for="(item, index) in typeMapping" :key="index"></el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose()">取 消</el-button>
        <el-button type="primary" @click="editSave()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'FieldMapping',
  props: {
    fieldMappingNavData: Array,
    field_process: Array,
    remoteMethod: Function,
    typeMappingMethod: Function
  },
  data() {
    return {
      selectRow: '',
      searchField: '',
      searchTable: '',
      loading: false,
      typeMapping: [],
      defaultFieldMappingNavData: '',
      defaultFieldMappingTableData: '',
      position: 0,
      fieldCount: '', //当前选中总数
      fieldMappingTableData: [],
      dialogVisible: false,
      re_field: '',
      currentOperationType: '',
      currentOperationData: '',
      target: [],
      editValueType: {
        field_name: '',
        data_type: '',
        precision: '',
        scale: ''
      },
      titleType: {
        field_name: '修改目标表名',
        data_type: '修改目标表类型',
        precision: '修改目标长度',
        scale: '修改目标表精度'
      },
      operations: [] //字段操作
    }
  },
  mounted() {
    this.defaultFieldMappingNavData = JSON.parse(JSON.stringify(this.fieldMappingNavData))
    this.defaultFieldMappingTableData = JSON.parse(JSON.stringify(this.fieldMappingTableData))
    this.selectRow = this.fieldMappingNavData[0]
    this.initTableData()
    this.initTypeMapping()
  },
  methods: {
    search(type) {
      if (type === 'table') {
        if (this.searchTable.trim()) {
          let data = []
          this.searchTable = this.searchTable.trim().toString() //去空格
          this.fieldMappingNavData.forEach(v => {
            if (v.sourceObjectName.indexOf(this.searchTable) > -1 || v.sinkObjectName.indexOf(this.searchTable) > -1) {
              data.push(v)
            }
          })
          this.fieldMappingNavData = data
        } else {
          this.fieldMappingNavData = this.defaultFieldMappingNavData
        }
      } else {
        if (this.searchField.trim()) {
          let data = []
          this.searchField = this.searchField.trim().toString() //去空格
          this.fieldMappingTableData.forEach(v => {
            if (v.field_name.indexOf(this.searchField) > -1 || v.t_field_name.indexOf(this.searchField) > -1) {
              data.push(v)
            }
          })
          this.fieldMappingTableData = data
        } else {
          this.fieldMappingTableData = this.defaultFieldMappingTableData
        }
      }
    },
    select(item, index) {
      this.position = '' //再次点击清空去一个样式
      this.$emit('row-click', this.selectRow, this.operations, this.target)
      this.selectRow = item
      this.position = index
      this.initTableData()
      this.initTypeMapping()
      if (this.field_process.length > 0) {
        this.getFieldProcess()
      }
    },
    //获取字段处理器
    getFieldProcess() {
      this.operations = ''
      let field_process = this.field_process.filter(process => process.table_id === this.selectRow.sourceQualifiedName)
      if (field_process.length > 0) {
        this.operations = field_process[0].operations ? JSON.parse(JSON.stringify(field_process[0].operations)) : []
      }
    },
    //初始化table数据
    initTableData() {
      this.loading = true
      this.$nextTick(() => {
        this.remoteMethod &&
          this.remoteMethod(this.selectRow)
            .then(({ data, target }) => {
              this.target = target
              this.fieldMappingTableData = data
              this.fieldCount = this.fieldMappingTableData.length
            })
            .finally(() => {
              this.loading = false
            })
      })
    },
    //更新table数据
    updateTableData(id, key, value) {
      this.fieldMappingTableData.forEach(field => {
        if (field.id === id) {
          field[key] = value
        }
      })
    },
    //初始化字段类型
    initTypeMapping() {
      this.$nextTick(() => {
        this.typeMappingMethod &&
          this.typeMappingMethod(this.selectRow).then(data => {
            this.typeMapping = data
          })
      })
    },
    //字段修改统一弹窗
    edit(row, type) {
      this.dialogVisible = true
      this.editValueType[type] = row[`t_${type}`]
      this.currentOperationType = type
      this.currentOperationData = row
      //修改类型
    },
    editSave() {
      //元数据-字段操作
      let id = this.currentOperationData.t_id
      let key = this.currentOperationType
      let value = this.editValueType[this.currentOperationType]
      //任务-字段处理器
      if (key === 'field_name') {
        let option = this.target.filter(v => v.id === id)
        if (option.length === 0) return
        option = option[0]
        if (value === option.field_name) {
          this.handleClose() //名字无改变
          return
        }
        let existsName = this.handleExistsName(value) //检查是否重名
        if (existsName) {
          return
        }
        this.fieldProcessRename(id, key, value)
      } else if (key === 'data_type') {
        this.fieldProcessConvert(id, key, value)
      }
      this.target.forEach(field => {
        if (field.id === id) {
          field[key] = value
        }
      })
      //触发页面重新渲染
      this.updateTableData(id, `t_${key}`, value)
      this.handleClose()
    },
    handleClose() {
      this.dialogVisible = false
      this.currentOperationType = ''
      this.currentOperationData = ''
      this.editValueType = {
        field_name: '',
        data_type: '',
        precision: '',
        scale: ''
      }
    },
    //字段删除
    del(id, value) {
      //任务-字段处理器
      if (value) {
        this.fieldProcessRemove(id)
      } else {
        this.fieldProcessCancelRemove(id)
      }
      //元数据-字段操作
      this.target.forEach(field => {
        if (field.id === id) {
          field.is_deleted = value
        }
      })
      //触发页面重新渲染
      this.updateTableData(id, 'is_deleted', value)
    },
    //目标任务 字段处理器
    //rename操作
    fieldProcessRename(id, key, value) {
      //字段名限制
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
        this.$message.error('以英文字母、下划线开头，仅支持英文、数字、下划线，限1~50字符')
        return
      }
      let option = this.target.filter(v => v.id === id)
      if (option.length === 0) return
      option = option[0]
      //rename类型
      let op = {
        op: 'RENAME',
        id: option.id,
        field: option.field_name,
        operand: value, //改过名的字段
        table_name: option.table_name,
        type: option.data_type,
        primary_key_position: option.primary_key_position,
        label: value,
        original_field_name: option.original_field_name
      }
      let ops = this.operations.filter(v => v.id === option.id && v.op === 'RENAME')
      if (ops.length === 0) {
        this.operations.push(op)
      } else {
        op = ops[0]
        op.operand = value
        op.label = value
      }
    },
    handleExistsName(value) {
      // 改名前查找同级中是否重名，若有则return且还原改动并提示
      let exist = false
      let filterData = this.target.filter(v => value === v.field_name)
      if (filterData.length > 0) {
        this.$message.error(value + this.$t('message.exists_name'))
        exist = true
      }
      return exist
    },
    //删除操作
    fieldProcessRemove(id) {
      this.restOperation(id) //先还原被操作
      for (let i = 0; i < this.operations.length; i++) {
        // 删除所有的rename convert的操作
        let ops = this.operations[i]
        if (ops.id === id && ['RENAME', 'CONVERT'].includes(ops.op)) {
          this.operations.splice(i, 1)
        }
      }
      //删除类型
      let option = this.target.filter(v => v.id === id)
      if (option.length === 0) return
      option = option[0]
      let op = {
        op: 'REMOVE',
        id: option.id,
        field: option.field_name,
        operand: true,
        table_name: option.table_name,
        type: option.data_type,
        primary_key_position: option.primary_key_position,
        label: option.field_name,
        original_field_name: option.original_field_name
      }
      this.operations.push(op)
      //更新当前选中行数
      this.fieldCount = this.fieldCount - 1
    },
    fieldProcessCancelRemove(id) {
      this.restOperation(id)
      for (let i = 0; i < this.operations.length; i++) {
        // 撤销删除操作
        let ops = this.operations[i]
        if (ops.id === id && ops.op === 'REMOVE') {
          this.operations.splice(i, 1)
        }
      }
      //更新当前选中行数
      this.fieldCount = this.fieldCount + 1
    },
    fieldProcessConvert(id, key, value) {
      let option = this.target.filter(v => v.id === id)
      if (option.length === 0) return
      option = option[0]
      //修改字段类型
      let op = {
        op: 'CONVERT',
        id: option.id,
        field: option.field_name,
        operand: value, //改过的字段类型
        originalDataType: option.data_type,
        table_name: option.table_name,
        type: option.data_type,
        primary_key_position: option.primary_key_position,
        original_field_name: option.original_field_name,
        label: option.value
      }
      let ops = this.operations.filter(v => v.id === option.id && v.op === 'CONVERT')
      if (ops.length === 0) {
        this.operations.push(op)
      } else {
        op = ops[0]
        op.operand = value
        op.label = value
      }
    },
    restOperation(id) {
      let opr = this.operations.filter(v => v.id === id && v.op === 'RENAME')
      if (opr.length > 0) {
        //元数据-字段操作
        this.target.forEach(field => {
          if (field.id === id) {
            field.field_name = opr[0].original_field_name
            this.updateTableData(id, 't_field_name', opr[0].original_field_name)
          }
        })
      }
      let opc = this.operations.filter(v => v.id === id && v.op === 'CONVERT')
      if (opc.length > 0) {
        //元数据-字段操作
        this.target.forEach(field => {
          if (field.id === id) {
            field.data_type = opc[0].originalDataType
            this.updateTableData(id, 't_data_type', opc[0].originalDataType)
          }
        })
      }
    },
    saveFileOperations() {
      let field_process = {
        table_id: this.selectRow.sourceQualifiedName,
        table_name: this.selectRow.sourceObjectName,
        operations: this.operations
      }
      if (this.field_process && this.field_process.length > 0) {
        let process = this.field_process.filter(fields => fields.table_id === this.selectRow.sourceQualifiedName)
        if (process.length > 0) {
          field_process = process[0]
          field_process.table_id = this.selectRow.sourceQualifiedName
          field_process.table_name = this.selectRow.sourceObjectName
          field_process.operations = this.operations
        } else this.field_process.push(field_process)
      } else this.field_process.push(field_process)
      return this.field_process
    },
    returnData() {
      return {
        row: this.selectRow,
        operations: this.operations,
        target: this.target
      }
    },
    //动态样式
    tableRowClassName({ row }) {
      if (row.is_deleted) {
        return 'delete-row'
      }
      return ''
    }
  }
}
</script>

<style lang="scss">
.field-mapping {
  .el-table .delete-row {
    background: #f2f2f2;
  }
  .el-table th {
    background: #f4f5f7;
  }
}
</style>
<style scoped lang="scss">
.field-mapping {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  overflow: hidden;
  .icon {
    color: #6dc5e8;
  }
  .search {
    display: flex;
    justify-content: flex-start;
    margin-top: 10px;
    .item {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-right: 20px;
      span {
        display: inline-block;
        width: 115px;
      }
    }
  }
  .task-form-body {
    display: flex;
    flex: 1;
    margin-top: 20px;
    height: 100%;
    .nav {
      width: 293px;
      border-top: 1px solid #f2f2f2;
      border-right: 1px solid #f2f2f2;
      overflow-y: auto;
      li {
        height: 93px;
        background: #ffffff;
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
        border-radius: 4px;
        border-bottom: 1px solid #f2f2f2;
        display: flex;
        padding-top: 16px;
        padding-left: 10px;
        &:hover {
          background: rgba(44, 101, 255, 0.05);
          cursor: pointer;
        }
        &.active {
          background: rgba(44, 101, 255, 0.05);
          cursor: pointer;
        }
        .imgBox {
          width: 34px;
          height: 50px;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .contentBox {
          margin-left: 16px;
        }
        .contentBox__source {
          font-size: 12px;
          font-weight: 400;
          color: #000000;
          line-height: 17px;
        }
        .contentBox__target {
          font-size: 12px;
          font-weight: 400;
          color: #ef9868;
          line-height: 17px;
          margin-top: 16px;
        }
        .contentBox__select {
          font-size: 12px;
          font-weight: 400;
          color: #000000;
          line-height: 17px;
          margin-top: 10px;
        }
      }
    }
  }
}
</style>
