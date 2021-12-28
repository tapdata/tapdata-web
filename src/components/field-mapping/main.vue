<template>
  <FieldMappingDialog
    ref="fieldMappingDom"
    v-loading="loadingMetadata"
    :typeMappingMethod="getTypeMapping"
    :readOnly="readOnly"
    :remoteMethod="intiFieldMappingTableData"
    :fieldMappingNavData="fieldMappingNavData"
    :fieldProcessMethod="updateFieldProcess"
    :updateMetadata="updateMetadata"
    :hiddenFieldProcess="false"
    :field_process="field_process"
    :transform="transform"
    @row-click="saveOperations"
    @update-nav="updateFieldMappingNavData"
  ></FieldMappingDialog>
</template>

<script>
import FieldMappingDialog from '@/components/field-mapping/field-mapping-dialog'
export default {
  name: 'FieldMappings',
  props: ['readOnly', 'transform', 'isFirst', 'getDataFlow'],
  components: { FieldMappingDialog },
  data() {
    return {
      fieldMappingNavData: null,
      fieldMappingTableData: '',
      hiddenFieldMapping: false,
      loadingMetadata: false,
      field_process: [],
      dataFlow: [],
      stageId: ''
    }
  },
  methods: {
    /*
     * 模型推演
     * 新建任务，首次全部恢复默认
     * 过滤条件：当前目标节点 stageId
     * 触发父组件：首次条件
     * */
    getMetaData(taskData) {
      if (!taskData) return
      this.dataFlow = taskData
      this.stageId = this.transform?.stageId || this.dataFlow?.stages[1]?.id //数据库迁移操作放在目标节点上
      let dataFlowId = taskData?.id || ''
      this.field_process = this.transform?.field_process || this.dataFlow?.stages[0]?.field_process
      if (this.isFirst && !dataFlowId) {
        taskData['rollback'] = 'all'
      } else {
        delete taskData['rollback']
        delete taskData['rollbackTable'] //确保不会有恢复默认
      }
      this.loadingMetadata = true
      if (taskData?.metadataMappings?.length > 0) {
        this.fieldMappingNavData = taskData.metadataMappings
        this.loadingMetadata = false
        if (this.$refs.fieldMappingDom) {
          this.$emit('update-first', false) //新建任务 第一次需要恢复默认
          this.$refs.fieldMappingDom.updateView(this.fieldMappingNavData) //左侧导航栏有数据再请求列表数据
        }
      } else {
        let promise = this.$axios.post('tm/api/DataFlows/metadata', taskData)
        promise.then(data => {
          this.fieldMappingNavData = data
          this.loadingMetadata = false
          if (this.$refs.fieldMappingDom) {
            this.$emit('update-first', false) //新建任务 第一次需要恢复默认
            this.$refs.fieldMappingDom.updateView(data) //左侧导航栏有数据再请求列表数据
          }
        })
        promise.catch(() => {
          this.loadingMetadata = false
          this.$message.error('接口请求失败')
        })
      }
    },
    /*
     * 子模块-恢复默认操作
     * 对应清空字段处理器
     * 更新父组件 fromData 字段处理器
     * 触发模型重新推演
     * */
    async updateFieldProcess(rollback, rollbackTable, id) {
      if (!this.dataFlow) return
      if (rollback === 'all') {
        this.dataFlow['rollback'] = rollback
        //删除整个字段处理器
        this.field_process = []
        //清空表改名 字段改名
        this.clearTransform()
      } else if (rollbackTable) {
        this.dataFlow['rollback'] = rollback
        this.dataFlow['rollbackTable'] = rollbackTable
        if (this.field_process?.length > 0) {
          for (let i = 0; i < this.field_process.length; i++) {
            // 删除操作
            let ops = this.field_process[i]
            if (ops.table_id === id) {
              this.field_process.splice(i, 1)
            }
          }
        }
        let result = this.$refs.fieldMappingDom.returnForm()
        this.updateAutoTransform('', result)
      }
      this.$emit('returnFieldMapping', this.field_process)
      //迁移任务需要同步字段处理器
      this.dataFlow = this.updateAutoFieldProcess(this.dataFlow)
      let promise = await this.$axios.post('tm/api/DataFlows/metadata', this.dataFlow)
      return promise
    },
    updateAutoFieldProcess(data) {
      if (data.stages[0]) {
        data['stages'][0].field_process = this.field_process
      }
      return data
    },
    //获取左边导航数据 - 表
    async updateMetadata(type, data) {
      //将表改名 字段改名 放在setting里面
      this.updateAutoTransform(type, data)
      let promise = await this.$axios.post('tm/api/DataFlows/metadata', this.dataFlow)
      return promise
    },
    //更新左边导航
    updateFieldMappingNavData(data) {
      this.fieldMappingNavData = data
    },
    //清空表改名 字段改名
    clearTransform() {
      for (let i = 0; i < this.dataFlow.stages.length; i++) {
        if (this.dataFlow.stages[i]?.id === this.stageId) {
          this.dataFlow['stages'][i].fieldsNameTransform = ''
          this.dataFlow['stages'][i].tableNameTransform = ''
          this.dataFlow['stages'][i].table_suffix = ''
          this.dataFlow['stages'][i].table_prefix = ''
        }
      }
    },
    updateAutoTransform(type, data) {
      for (let i = 0; i < this.dataFlow.stages.length; i++) {
        if (this.dataFlow.stages[i].id === this.stageId) {
          this.dataFlow['stages'][i].fieldsNameTransform = data.fieldsNameTransform
          this.dataFlow['stages'][i].tableNameTransform = data.tableNameTransform
          this.dataFlow['stages'][i].table_prefix = data.table_prefix
          this.dataFlow['stages'][i].table_suffix = data.table_suffix
        }
      }
    },
    checkTransform() {
      let result = ''
      for (let i = 0; i < this.dataFlow.stages.length; i++) {
        if (this.dataFlow.stages[i].id === this.stageId) {
          if (this.dataFlow['stages'][i].fieldsNameTransform !== '') {
            result = this.dataFlow['stages'][i].fieldsNameTransform
          }
        }
      }
      return result
    },
    /*
     * 初始化右边table数据
     * 请求参数：QualifiedName 分别获取源表字段、目标表字段
     * 过滤：不支持嵌套字段
     * 数据组合：目标字段表示 "t_"标识 (is_deleted 目标表数据)
     * 数据匹配：同步任务没有字段处理器，有字段处理器（改名），优先original_field_name || field
     * */
    async intiFieldMappingTableData(row) {
      let source = await this.$axios.get(
        'tm/api/MetadataInstances/originalData?qualified_name=' + encodeURIComponent(row.sourceQualifiedName)
      )
      source = source && source.length > 0 ? source[0].fields : []
      let target = await this.$axios.get(
        'tm/api/MetadataInstances/originalData?isTarget=true&qualified_name=' + encodeURIComponent(row.sinkQulifiedName)
      )
      // 初始化所有字段都映射 只取顶级字段
      source = source.filter(field => field.field_name.indexOf('.') === -1)
      target = target && target.length > 0 ? target[0].fields : []
      if (source?.length > 0 && target?.length === 0) {
        this.$message.error(this.$t('task_mapping_dialog_target_no_fields') + '(' + row.sinkQulifiedName + ')')
        return {
          data: [],
          target: []
        }
      }
      //是否有字段处理器
      let operations = this.getFieldOperations(row)
      if (operations?.length > 0) {
        source.forEach(item => {
          let original_field_name = item.original_field_name || item.field_name
          let ops = operations.filter(op => op.original_field_name === original_field_name && op.op === 'RENAME')
          if (!ops || ops?.length === 0) {
            item.temporary_field_name = item.field_name
            return
          }
          ops = ops[0]
          item.temporary_field_name = ops.operand
        })
      } else {
        source.forEach(item => {
          item.temporary_field_name = item.field_name
        })
      }
      //是否有批量字段改名操作
      let fieldsNameTransform = this.checkTransform()
      if (fieldsNameTransform !== '') {
        source.forEach(item => {
          if (fieldsNameTransform === 'toUpperCase') {
            item.temporary_field_name = item.temporary_field_name.toUpperCase() || item.field_name.toUpperCase()
          } else if (fieldsNameTransform === 'toLowerCase') {
            item.temporary_field_name = item.temporary_field_name.toLowerCase() || item.field_name.toLowerCase()
          }
        })
      }
      //源表 目标表数据组合
      let fieldMappingTableData = []
      source.forEach(item => {
        target.forEach(field => {
          //先检查是否被改过名
          let node = {
            t_id: field.id,
            t_field_name: field.field_name,
            t_data_type: field.data_type,
            t_scale: field.scale,
            t_precision: field.precision,
            is_deleted: field.is_deleted, //目标决定这个字段是被删除？
            t_isPrecisionEdit: true, //默认不能编辑
            t_isScaleEdit: true //默认不能编辑
          }
          //检查当前name个数
          if (item.temporary_field_name === field.field_name) {
            fieldMappingTableData.push(Object.assign({}, item, node))
          }
        })
      })
      return {
        data: fieldMappingTableData,
        target: target
      }
    },
    //获取字段操作记录
    getFieldOperations(row) {
      let operations = []
      if (!this.field_process || this.field_process.length === 0) return
      let field_process = this.field_process.filter(process => process.table_id === row.sourceTableId)
      if (field_process.length > 0) {
        operations = field_process[0].operations ? JSON.parse(JSON.stringify(field_process[0].operations)) : []
      }
      return operations || []
    },
    //获取typeMapping
    async getTypeMapping(row) {
      let data = await this.$axios.get('tm/api/TypeMappings/dataType?databaseType=' + row.sinkDbType)
      return data
    },
    //保存字段映射操作
    saveOperations(row, operations, target) {
      if (!target || target?.length === 0) return
      let where = {
        qualified_name: row.sinkQulifiedName
      }
      let data = {
        fields: target
      }
      if (typeof where === 'object') where = JSON.stringify(where)
      this.axios.post('tm/api/MetadataInstances/update?where=' + encodeURIComponent(where), data)
      this.saveFileOperations(row, operations) //保存字段处理器
      this.transferData = this.$refs.fieldMappingDom.returnData()
      this.$emit('row-click', this.field_process)
    },
    //保存数据
    returnData(hiddenMsg) {
      return this.$refs.fieldMappingDom.returnData(hiddenMsg)
    },
    //保存数据当前节点的字段处理器
    saveFileOperations(row, operations) {
      if (operations?.length === 0) return
      let field_process = {
        table_id: row.sourceTableId, //存源表名 兼容旧版字段处理器
        table_name: row.sourceObjectName,
        operations: operations
      }
      if (this.field_process && this.field_process.length > 0) {
        for (let i = 0; i < this.field_process.length; i++) {
          if (this.field_process[i].table_id === row?.sourceTableId) {
            this.field_process[i].operations = operations
          } else {
            this.field_process = this.field_process || []
            this.field_process.push(field_process)
          }
        }
      } else {
        this.field_process = this.field_process || []
        this.field_process.push(field_process)
      }
      return this.field_process
    }
  }
}
</script>

<style scoped></style>
