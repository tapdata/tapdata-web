<template>
  <div class="field-mapping" v-loading="loadingPage">
    <div v-if="!readOnly" class="field-mapping__desc" style="text-align: left">
      <strong>表设置</strong>:
      用户可以在此页面设置源库每个表要同步的字段，以及在目标库自动建表时对应的字段名称和字段类型
    </div>
    <div class="search">
      <div class="item">
        <span> 搜索表：</span>
        <el-input v-model="searchTable" size="mini" @change="search('table')"></el-input>
      </div>
      <div class="item">
        <span> 搜索字段：</span>
        <el-input v-model="searchField" size="mini" @change="search('field')"></el-input>
      </div>
      <div class="item" v-if="!readOnly">
        <el-button size="mini" @click="rollbackAll">全部恢复默认</el-button>
      </div>
    </div>
    <div class="task-form-body">
      <div class="nav">
        <ul>
          <li
            v-for="(item, index) in fieldMappingNavData"
            :key="index"
            :class="{ active: position === index }"
            @click.prevent="select(item, index)"
          >
            <div class="imgBox" v-if="item.invalid">
              <img src="../assets/images/fieldMapping-table-error.png" alt="" />
            </div>
            <div class="imgBox" v-else>
              <img src="../assets/images/fieldMapping-table.png" alt="" />
            </div>
            <div class="contentBox">
              <div class="contentBox__source">{{ item.sourceObjectName }}</div>
              <div class="contentBox__target">{{ item.sinkObjectName }}</div>
              <div class="contentBox__select">
                {{
                  `已选中 ${position === index ? fieldCount : item.sourceFieldCount - item.userDeletedNum}/${
                    item.sourceFieldCount
                  }`
                }}
                <el-button
                  v-if="!readOnly"
                  size="mini"
                  round
                  @click.stop="rollbackTable(item.sinkObjectName, item.sourceTableId)"
                  >恢复默认</el-button
                >
              </div>
            </div>
          </li>
        </ul>
      </div>
      <El-table
        class="field-mapping-table table-border"
        height="100%"
        border
        :data="fieldMappingTableData"
        :row-class-name="tableRowClassName"
        v-loading="loading"
      >
        <ElTableColumn show-overflow-tooltip label="源表字段名" prop="field_name" width="150">
          <template slot-scope="scope">
            <span v-if="scope.row.primary_key_position > 0" :show-overflow-tooltip="true"
              >{{ scope.row.field_name }}
              <VIcon size="12" class="color-darkorange">key</VIcon>
            </span>
            <span v-else class="item" :show-overflow-tooltip="true">{{ scope.row.field_name }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="源表类型" prop="data_type" width="150"></ElTableColumn>
        <ElTableColumn label="源表长度" prop="precision" width="150"></ElTableColumn>
        <ElTableColumn label="源表精度" prop="scale" width="100"></ElTableColumn>
        <ElTableColumn label="目标表字段名" width="260">
          <template slot-scope="scope">
            <div
              v-if="!scope.row.is_deleted && !hiddenFieldProcess && !readOnly"
              @click="edit(scope.row, 'field_name')"
            >
              <span :show-overflow-tooltip="true"
                >{{ scope.row.t_field_name }}<i class="icon el-icon-edit-outline"></i
              ></span>
            </div>
            <span v-else :show-overflow-tooltip="true">{{ scope.row.t_field_name }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="目标表类型">
          <template slot-scope="scope">
            <div v-if="!scope.row.is_deleted && !readOnly" @click="edit(scope.row, 'data_type')">
              <span>{{ scope.row.t_data_type }}</span>
              <i v-if="!scope.row.t_data_type" class="icon-error el-icon-warning"></i>
              <i class="icon el-icon-arrow-down"></i>
            </div>
            <div v-else>
              <span>{{ scope.row.t_data_type }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="目标表长度" width="150">
          <template slot-scope="scope">
            <div
              v-if="
                scope.row.t_precision !== null &&
                scope.row.t_precision !== undefined &&
                !scope.row.is_deleted &&
                scope.row.t_isPrecisionEdit &&
                !readOnly
              "
              @click="edit(scope.row, 'precision')"
            >
              <span>{{ scope.row.t_precision }}</span>
              <i class="icon el-icon-edit-outline"></i>
            </div>
            <div v-else>
              <span>{{ scope.row.t_precision }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="目标表精度" width="100">
          <template slot-scope="scope">
            <div
              v-if="
                scope.row.t_scale !== null &&
                scope.row.t_scale !== undefined &&
                !scope.row.is_deleted &&
                scope.row.t_isScaleEdit &&
                !readOnly
              "
              @click="edit(scope.row, 'scale')"
            >
              <span>{{ scope.row.t_scale }}</span>
              <i class="icon el-icon-edit-outline"></i>
            </div>
            <div v-else>
              <span>{{ scope.row.t_scale }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="80" v-if="!hiddenFieldProcess && !readOnly">
          <template slot-scope="scope">
            <ElLink type="primary" v-if="!scope.row.is_deleted" @click="del(scope.row.t_id, true)"> 删除 </ElLink>
            <ElLink type="primary" v-else @click="del(scope.row.t_id, false)"> 还原 </ElLink>
          </template>
        </ElTableColumn>
        <div class="field-mapping-table__empty" slot="empty">
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
      <div v-if="['precision', 'scale'].includes(currentOperationType)">
        <el-input-number v-model="editValueType[currentOperationType]"></el-input-number>
        <div class="field-mapping-data-type" v-if="currentTypeRules.length > 0">
          <div v-for="(item, index) in currentTypeRules" :key="item.dbType">
            <div
              v-if="
                item.maxPrecision && currentOperationType === 'precision' && item.minPrecision !== item.maxPrecision
              "
            >
              <div v-if="index === 0">长度范围</div>
              <div>
                {{ `[ ${item.minPrecision} , ${item.maxPrecision} ]` }}
              </div>
            </div>
            <div
              v-if="item.maxScale && currentOperationType === 'scale' && item.minScale !== item.maxScale"
              style="margin-top: 10px"
            >
              <div>精度范围</div>
              <div>
                {{ `[ ${item.minScale} , ${item.maxScale} ]` }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="['data_type'].includes(currentOperationType)">
        <el-select v-model="editValueType[currentOperationType]" filterable @change="initDataType">
          <el-option
            :label="item.dbType"
            :value="item.dbType"
            v-for="(item, index) in typeMapping"
            :key="index"
          ></el-option>
        </el-select>
        <div class="field-mapping-data-type" v-if="currentTypeRules.length > 0">
          <div v-for="(item, index) in currentTypeRules" :key="item.dbType">
            <div v-if="item.maxPrecision && item.minPrecision !== item.maxPrecision">
              <div v-if="index === 0">长度范围</div>
              <div>
                {{ `[ ${item.minPrecision} , ${item.maxPrecision} ]` }}
              </div>
            </div>
            <div v-if="item.maxScale && item.minScale !== item.maxScale" style="margin-top: 10px">
              <div>精度范围</div>
              <div>
                {{ `[ ${item.minScale} , ${item.maxScale} ]` }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose()">取 消</el-button>
        <el-button type="primary" @click="editSave()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import VIcon from '@/components/VIcon'
export default {
  name: 'FieldMapping',
  components: { VIcon },
  props: {
    fieldMappingNavData: Array,
    field_process: Array,
    remoteMethod: Function,
    typeMappingMethod: Function,
    fieldProcessMethod: Function,
    hiddenFieldProcess: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectRow: '',
      searchField: '',
      searchTable: '',
      loading: false,
      loadingPage: false,
      typeMapping: [],
      currentTypeRules: [],
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
        field_name: '修改目标字段名',
        data_type: '修改目标表字段类型',
        precision: '修改目标字段长度',
        scale: '修改目标表精度'
      },
      operations: [] //字段操作
    }
  },
  mounted() {
    if (this.fieldMappingNavData) {
      this.defaultFieldMappingNavData = JSON.parse(JSON.stringify(this.fieldMappingNavData))
      this.selectRow = this.fieldMappingNavData[0]
      this.fieldCount = this.selectRow.sourceFieldCount - this.selectRow.userDeletedNum || 0
    }
    this.updateView()
  },
  methods: {
    search(type) {
      if (type === 'table') {
        if (this.searchTable.trim()) {
          this.searchTable = this.searchTable.trim().toString() //去空格
          this.fieldMappingNavData = this.defaultFieldMappingNavData.filter(v => {
            let str = (v.sourceObjectName + '' + v.sinkObjectName).toLowerCase()
            return str.indexOf(this.searchTable.toLowerCase()) > -1
          })
        } else {
          this.fieldMappingNavData = this.defaultFieldMappingNavData
        }
      } else {
        if (this.searchField.trim()) {
          this.searchField = this.searchField.trim().toString() //去空格
          this.fieldMappingTableData = this.defaultFieldMappingTableData.filter(v => {
            let str = (v.field_name + '' + v.t_field_name).toLowerCase()
            return str.indexOf(this.searchField.toLowerCase()) > -1
          })
        } else {
          this.fieldMappingTableData = this.defaultFieldMappingTableData
        }
      }
    },
    select(item, index) {
      if (!this.readOnly) {
        let deleteLen = this.target.filter(v => !v.is_deleted)
        if (deleteLen.length === 0) {
          this.$message.error('当前表被删除了所有字段，不允许保存操作')
          return //所有字段被删除了 不可以保存任务
        }
        this.$emit('row-click', this.selectRow, this.operations, this.target)
      }
      this.position = '' //再次点击清空去一个样式
      this.searchField = ''
      this.fieldCount = 0
      this.selectRow = item
      this.fieldCount = item.sourceFieldCount - item.userDeletedNum || 0
      this.position = index
      this.updateView()
    },
    //页面刷新
    updateView(data) {
      if (data) {
        this.selectRow = data
        this.defaultFieldMappingNavData = JSON.parse(JSON.stringify(this.fieldMappingNavData))
        this.selectRow = this.fieldMappingNavData[0]
        this.fieldCount = this.selectRow.sourceFieldCount - this.selectRow.userDeletedNum || 0
      }
      this.initTableData()
      this.initTypeMapping()
      this.operations = []
      if (this.field_process?.length > 0) {
        this.getFieldProcess()
      }
    },
    //获取字段处理器
    getFieldProcess() {
      this.operations = []
      let field_process = this.field_process.filter(process => process.table_id === this.selectRow.sourceTableId)
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
              this.initShowEdit()
              this.defaultFieldMappingTableData = JSON.parse(JSON.stringify(this.fieldMappingTableData)) //保留一份原始数据 查询用
            })
            .finally(() => {
              this.loading = false
            })
      })
    },
    //更新左边被删除字段
    updateFieldCount(type) {
      let id = this.selectRow.sinkQulifiedName
      if (this.fieldMappingNavData) {
        for (let i = 0; i < this.fieldMappingNavData.length; i++) {
          if (this.fieldMappingNavData[i].sinkQulifiedName === id && type === 'remove') {
            this.fieldMappingNavData[i].userDeletedNum = this.fieldMappingNavData[i].userDeletedNum + 1
          } else if (this.fieldMappingNavData[i].sinkQulifiedName === id && type === 'add') {
            this.fieldMappingNavData[i].userDeletedNum = this.fieldMappingNavData[i].userDeletedNum - 1
          }
        }
      }
    },
    //更新table数据
    updateTableData(id, key, value) {
      this.fieldMappingTableData.forEach(field => {
        if (field.t_id === id) {
          //改目标表
          field[key] = value
        }
      })
    },
    //更新target 数据
    updateTarget(id, key, value) {
      this.target.forEach(field => {
        if (field.id === id) {
          field[key] = value
          field['source'] = 'manual'
          field['is_auto_allowed'] = false
        }
      })
      //触发页面重新渲染
      this.updateTableData(id, `t_${key}`, value)
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
    //初始化目标字段、长度是否可编辑
    initShowEdit() {
      let data = this.fieldMappingTableData
      if (this.fieldMappingTableData?.length === 0) return
      for (let i = 0; i < data.length; i++) {
        let rules = this.typeMapping.filter(v => v.dbType === data[i].t_data_type)
        if (rules?.length > 0) {
          rules = rules[0].rules
          if (!data[i].t_precision) {
            this.showPrecisionEdit(data[i].t_id, rules || [])
            this.influencesPrecision(data[i].t_id, rules || [])
          } else if (!data[i].t_scale) {
            this.showScaleEdit(data[i].t_id, rules || [])
            this.influencesScale(data[i].t_id, rules || [])
          } else if (!data[i].t_precision && !data[i].t_scale) {
            this.showPrecisionEdit(data[i].t_id, rules || [])
            this.showScaleEdit(data[i].t_id, rules || [])
            this.influences(data[i].t_id, rules || [])
          }
        }
      }
    },
    //恢复默认单表
    rollbackTable(name, id) {
      this.$confirm('您确认要恢复默认吗？', '提示', {
        type: 'warning'
      }).then(resFlag => {
        if (resFlag) {
          this.loadingPage = true
          this.$nextTick(() => {
            this.fieldProcessMethod &&
              this.fieldProcessMethod('table', name, id)
                .then(data => {
                  this.$emit('update-nav', data)
                  this.updateView()
                })
                .finally(() => {
                  this.loadingPage = false
                })
          })
        }
      })
    },
    //恢复默认全部
    rollbackAll() {
      this.$confirm('您确认要全部恢复默认吗？', '提示', {
        type: 'warning'
      }).then(resFlag => {
        if (resFlag) {
          this.$nextTick(() => {
            this.loadingPage = true
            this.fieldProcessMethod &&
              this.fieldProcessMethod('all')
                .then(data => {
                  this.$emit('update-nav', data)
                  this.updateView()
                })
                .finally(() => {
                  this.loadingPage = false
                })
          })
        }
      })
    },
    //字段修改统一弹窗
    edit(row, type) {
      this.dialogVisible = true
      this.editValueType[type] = row[`t_${type}`]
      this.currentOperationType = type
      this.currentOperationData = row
      //初始化
      this.initDataType(row[`t_data_type`])
    },
    editSave() {
      //元数据-字段操作
      let id = this.currentOperationData.t_id
      let key = this.currentOperationType
      let value = this.editValueType[this.currentOperationType]
      let verify = true
      //任务-字段处理器
      if (key === 'field_name') {
        let option = this.target.filter(v => v.id === id && !v.is_deleted)
        if (option.length === 0) return
        option = option[0]
        //字段名限制
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
          this.$message.error('以英文字母、下划线开头，仅支持英文、数字、下划线，限1~50字符')
          return
        }
        if (value === option.field_name && !option.is_deleted) {
          this.handleClose() //名字无改变
          return
        }
        let existsName = this.handleExistsName(value) //检查是否重名
        if (existsName) {
          return
        }
        this.fieldProcessRename(id, key, value)
      } else if (key === 'data_type') {
        let option = this.target.filter(v => v.id === id)
        if (option.length === 0) return
        option = option[0]
        if (value === option.data_type) {
          this.handleClose() //类型无改变
          return
        }
        //如果是改类型 需要手动修改字段的长度以及精度
        this.influences(id, this.currentTypeRules || [])
      } else if (key === 'precision') {
        let isPrecision = this.currentTypeRules.filter(v => v.minPrecision < v.maxPrecision)
        if (isPrecision.length === 0) {
          this.currentTypeRules.forEach(r => {
            if (r.minPrecision === r.maxPrecision && value !== r.maxPrecision) {
              this.$message.error('当前值不符合该字段范围')
              verify = false
            }
          })
        } else {
          this.currentTypeRules.forEach(r => {
            if (r.minPrecision < r.maxPrecision) {
              if (r.minPrecision > value || value > r.maxPrecision) {
                verify = false
                this.$message.error('当前值不符合该字段范围')
              }
            }
          })
        }
        if (!verify) {
          return
        }
      } else if (key === 'scale') {
        let isScale = this.currentTypeRules.filter(v => v.minScale < v.maxScale)
        if (isScale.length === 0) {
          this.currentTypeRules.forEach(r => {
            if (r.minScale === r.maxScale && value !== r.maxScale) {
              this.$message.error('当前值不符合该字段范围')
              verify = false
            }
          })
        } else {
          this.currentTypeRules.forEach(r => {
            if (r.minScale < r.maxScale) {
              if (r.minScale > value || value > r.maxScale) {
                verify = false
                this.$message.error('当前值不符合该字段范围')
              }
            }
          })
        }
      }
      if (!verify) {
        return
      }
      //触发target更新
      this.updateTarget(id, key, value)
      this.checkTable() //消除感叹号
      this.handleClose()
    },
    //改类型影响字段长度 精度
    influences(id, rules) {
      this.showScaleEdit(id, rules)
      this.showPrecisionEdit(id, rules)
      this.influencesScale(id, rules)
      this.influencesPrecision(id, rules)
    },
    influencesScale(id, rules) {
      rules.forEach(r => {
        if (r.minScale || r.minScale === 0) {
          this.updateTarget(id, 'scale', r.minScale < 0 ? 0 : r.minScale)
        } else {
          this.updateTarget(id, 'scale', null)
        }
      })
    },
    influencesPrecision(id, rules) {
      rules.forEach(r => {
        if (r.minPrecision || r.minPrecision === 0) {
          this.updateTarget(id, 'precision', r.minPrecision < 0 ? 0 : r.minPrecision)
        } else {
          this.updateTarget(id, 'precision', null)
        }
      })
    },
    showScaleEdit(id, data) {
      let isScale = data.filter(v => v.minScale < v.maxScale)
      if (isScale.length !== 0) {
        //固定值
        this.updateTarget(id, 'isScaleEdit', true)
      } else {
        this.updateTarget(id, 'isScaleEdit', false)
      }
    },
    showPrecisionEdit(id, data) {
      let isPrecision = data.filter(v => v.minPrecision < v.maxPrecision)
      if (isPrecision.length !== 0) {
        //固定值
        this.updateTarget(id, 'isPrecisionEdit', true)
      } else {
        this.updateTarget(id, 'isPrecisionEdit', false)
      }
    },
    initDataType(val) {
      let target = this.typeMapping.filter(type => type.dbType === val)
      if (target?.length > 0) {
        this.currentTypeRules = target[0]?.rules || []
      } else this.currentTypeRules = '' //清除上一个字段范围
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
          field['source'] = 'manual'
          field['is_auto_allowed'] = false
        }
      })
      //触发页面重新渲染
      this.updateTableData(id, 'is_deleted', value)
      this.checkTable() //消除感叹号
    },
    //目标任务 字段处理器
    //rename操作
    fieldProcessRename(id, key, value) {
      let option = this.target.filter(v => v.id === id)
      if (option.length === 0) return
      option = option[0]
      if (value === option.original_field_name || option.field) {
        this.restRename(id) //用户手动改为最原始的名字
        return
      }
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
      let filterData = this.target.filter(v => value === v.field_name && !v.is_deleted)
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
        if (ops.id === id && ['RENAME'].includes(ops.op)) {
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
      this.updateFieldCount('remove')
    },
    //还原
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
      this.updateFieldCount('add')
    },
    restRename(id) {
      for (let i = 0; i < this.operations.length; i++) {
        // 还原改名
        let ops = this.operations[i]
        if (ops.id === id && ops.op === 'RENAME') {
          this.operations.splice(i, 1)
        }
      }
    },
    restOperation(id) {
      let opr = this.operations.filter(v => v.id === id && v.op === 'RENAME')
      if (opr.length > 0) {
        //元数据-字段操作
        this.updateTarget(id, 't_field_name', opr[0].original_field_name || opr[0].field)
      }
    },
    saveFileOperations() {
      let field_process = {
        table_id: this.selectRow.sourceTableId, //存源表名 兼容旧版字段处理器
        table_name: this.selectRow.sourceObjectName,
        operations: this.operations
      }
      if (this.field_process && this.field_process.length > 0) {
        let process = this.field_process.filter(fields => fields.table_id === this.selectRow.sourceTableId)
        if (process.length > 0) {
          field_process = process[0]
          field_process.table_id = this.selectRow.sourceTableId
          field_process.table_name = this.selectRow.sourceObjectName
          field_process.operations = this.operations
        } else this.field_process.push(field_process)
      } else this.field_process.push(field_process)
      return this.field_process
    },
    returnData(hiddenMsg) {
      let result = this.checkTable()
      if (result.checkDataType || result.checkInvalid) {
        if (!hiddenMsg) {
          this.$message.error(
            `检测到您还有 ${result.count} 张表的字段类型设置存在问题，请在左侧表区域选择有问题的表进行处理`
          )
        }
        return {
          valid: false,
          row: '',
          operations: '',
          target: []
        }
      }
      return {
        valid: true,
        row: this.selectRow,
        operations: this.operations,
        target: this.target
      }
    },
    //保存校验
    checkTable() {
      //左边所有invalid 为false 右边所有目标字段有类型
      let checkDataType = false
      this.target.forEach(field => {
        if (!field.data_type && !field.is_deleted) {
          checkDataType = true
        }
      })
      //当前表 所有字段类型通过 将当前表的invalid 设置为false 校验通过
      this.fieldMappingNavData.forEach(table => {
        if (table.sinkObjectName === this.selectRow.sinkObjectName) {
          //当前表
          if (!checkDataType) {
            table.invalid = false
          } else table.invalid = true
        }
      })

      let checkInvalid = false
      let count = 0
      this.fieldMappingNavData.forEach(table => {
        if (table.invalid) {
          checkInvalid = true
          count += 1
        }
      })
      return {
        checkInvalid: checkInvalid,
        checkDataType: checkDataType,
        count: count
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
  .el-table .error-row {
    background: rgba(255, 0, 0, 0.3);
    color: #fff;
  }
  .el-table th {
    background: #f4f5f7;
  }
}
.field-mapping-data-type {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
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
  .icon-error {
    color: red;
  }
  .search {
    display: flex;
    justify-content: flex-start;
    margin-top: 10px;
    text-align: left;
    .item {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-right: 20px;
      span {
        display: inline-block;
        width: 115px;
        text-align: left;
      }
    }
  }
  .task-form-body {
    display: flex;
    flex: 1;
    margin-top: 20px;
    height: 0;
    .nav {
      width: 293px;
      border-top: 1px solid #f2f2f2;
      border-right: 1px solid #f2f2f2;
      overflow-y: auto;
      ul {
        padding-bottom: 100px;
      }
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
          border-left: 2px solid #2c65ff;
        }
        &.active {
          background: rgba(44, 101, 255, 0.05);
          border-left: 2px solid #2c65ff;
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
          width: 200px;
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
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      }
    }
    .color-darkorange {
      color: darkorange;
    }
  }
}
</style>
