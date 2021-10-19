<template>
  <FieldMapping
    ref="fieldMappingDom"
    v-loading="loadingMetadata"
    :remoteMethod="intiFieldMappingTableData"
    :typeMappingMethod="getTypeMapping"
    :readOnly="readOnly"
    :fieldMappingNavData="fieldMappingNavData"
    :fieldProcessMethod="updateFieldProcess"
    :field_process="field_process"
    @row-click="saveOperations"
    @update-nav="updateFieldMappingNavData"
  ></FieldMapping>
</template>

<script>
export default {
  name: 'FieldMappings',
  props: ['field_process', 'readOnly'],
  data() {
    return {
      fieldMappingNavData: null,
      fieldMappingTableData: '',
      hiddenFieldMapping: false,
      loadingMetadata: false
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
      let id = taskData?.id || ''
      if (this.isFirst && !id) {
        taskData['rollback'] = 'all'
      } else {
        delete taskData['rollback']
        delete taskData['rollbackTable'] //确保不会有恢复默认
      }
      this.loadingMetadata = true
      let promise = this.$axios.post('tm/api/DataFlows/metadata', taskData)
      promise.then(data => {
        this.activeStep += 1
        this.isFirst = false
        this.fieldMappingNavData = data
        this.loadingMetadata = false
        if (this.$refs.fieldMappingDom) {
          this.$refs.fieldMappingDom.updateView(data) //左侧导航栏有数据再请求列表数据
        }
      })
      promise.catch(() => {
        this.loadingMetadata = false
        this.$message.error('模型推演失败')
      })
    },
    /*
     * 子模块-恢复默认操作
     * 对应清空字段处理器
     * 更新父组件 fromData 字段处理器
     * 触发模型重新推演
     * */
    async updateFieldProcess(rollback, rollbackTable, id) {
      let data = this.getDataFlowData()
      if (!data) return
      if (rollback === 'all') {
        data['rollback'] = rollback
        //删除整个字段处理器
        this.field_process = []
      } else if (rollbackTable) {
        data['rollback'] = rollback
        data['rollbackTable'] = rollbackTable
        for (let i = 0; i < this.field_process.length; i++) {
          // 删除操作
          let ops = this.field_process[i]
          if (ops.table_id === id) {
            this.field_process.splice(i, 1)
          }
        }
      }
      let result = this.updateAutoFieldProcess(data) //更新字段处理器
      let promise = await this.$axios.post('tm/api/DataFlows/metadata', result)
      return promise
    },
    //获取当前任务所有的节点
    getDataFlowData() {
      //手动同步更新字段处理器
      let data = this.daft()
      let result = this.updateAutoFieldProcess(data)
      return result
    },
    updateAutoFieldProcess(data) {
      if (data.stages[0]) {
        data['stages'][0].field_process = this.field_process
      }
      return data
    },
    //更新左边导航
    updateFieldMappingNavData(data) {
      this.fieldMappingNavData = data
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
        'tm/api/MetadataInstances/originalData?qualified_name=' + row.sourceQualifiedName
      )
      source = source && source.length > 0 ? source[0].fields : []
      let target = await this.$axios.get(
        'tm/api/MetadataInstances/originalData?isTarget=true&qualified_name=' + row.sinkQulifiedName
      )
      // 初始化所有字段都映射 只取顶级字段
      source = source.filter(field => field.field_name.indexOf('.') === -1)
      target = target && target.length > 0 ? target[0].fields : []
      //是否有字段处理器
      let operations = this.getFieldOperations(row)
      if (operations?.length > 0) {
        source.forEach(item => {
          let ops = operations.filter(op => op.original_field_name === item.field_name && op.op === 'RENAME')
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
    //判断是否改名
    handleFieldName(row, fieldName) {
      let operations = this.getFieldOperations(row)
      if (!operations) return
      let ops = operations.filter(op => op.operand === fieldName && op.op === 'RENAME')
      return ops
    },
    //获取typeMapping
    async getTypeMapping(row) {
      let data = await this.$axios.get('tm/api/typeMappings/dataType?databaseType=' + row.sinkDbType)
      return data
    },
    //保存字段处理器
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
      this.field_process = this.$refs.fieldMappingDom.saveFileOperations()
    }
  }
}
</script>

<style scoped></style>
