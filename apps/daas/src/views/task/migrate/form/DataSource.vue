<template>
  <el-form
    ref="dataSourceModelForm"
    label-width="100px"
    label-position="left"
    status-icon
    :disabled="stateIsReadonly"
    :model="dataSourceData"
    :rules="rules"
  >
    <el-form-item label="源端类型" prop="source_filter_databaseType">
      <el-select v-model="dataSourceData.source_filter_databaseType" @change="getSourceConnection">
        <el-option v-for="item in allowSourceDatabaseTypes" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="源端连接" prop="source_connectionId">
      <el-select v-model="dataSourceData.source_connectionId">
        <el-option v-for="item in sourceData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="目标端类型" prop="target_filter_databaseType">
      <el-select v-model="dataSourceData.target_filter_databaseType" @change="getTargetConnection">
        <el-option v-for="item in allowTargetDatabaseTypes" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="目标端连接" prop="target_connectionId">
      <el-select v-model="dataSourceData.target_connectionId">
        <el-option v-for="item in targetData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'Source',
  props: ['dataSourceData'],
  data() {
    return {
      stateIsReadonly: this.$store.state.dataflow.stateIsReadonly,
      allowSourceDatabaseTypes: [],
      allowTargetDatabaseTypes: [],
      sourceData: [],
      targetData: [],
      rules: {
        source_filter_databaseType: [{ required: true, message: '请选择源端类型', trigger: 'change' }],
        source_connectionId: [{ required: true, message: '请选择源端连接', trigger: 'change' }],
        target_filter_databaseType: [{ required: true, message: '请选择目标端类型', trigger: 'change' }],
        target_connectionId: [{ required: true, message: '请选择目标端连接', trigger: 'change' }]
      }
    }
  },
  mounted() {
    this.allowDatabaseType()
    this.getConnection(this.getWhere('source'), 'source_connectionId', true)
    this.getConnection(this.getWhere('target'), 'target_connectionId', true)
  },
  methods: {
    //云版支持数据源
    allowDatabaseType() {
      let TYPEMAP = this.$const.TYPEMAP
      this.$api('connections')
        .getDataTypes()
        .then(res => {
          let data = res?.data || []
          //过滤不支持作为源的数据源
          let filterArrSource = ['redis', 'hazelcast_cloud_cluster', 'elasticsearch', 'clickhouse', 'dameng', 'tidb']
          data = data.filter(item => filterArrSource.indexOf(item) === -1)
          this.allowSourceDatabaseTypes = data.map(item => {
            return {
              label: TYPEMAP[item],
              value: item
            }
          })
          this.allowSourceDatabaseTypes.unshift({ label: '全部', value: 'all' })

          //过滤不支持作为目标的数据源
          let filterArr = ['adb_mysql']
          data = data.filter(item => filterArr.indexOf(item) === -1)
          this.allowTargetDatabaseTypes = data.map(item => {
            return {
              label: TYPEMAP[item],
              value: item
            }
          })
          this.allowTargetDatabaseTypes.unshift({ label: '全部', value: 'all' })
        })
    },
    getWhere(type) {
      let where = {}
      if (type === 'source' && this.dataSourceData.source_filter_databaseType !== 'all') {
        where = {
          database_type: { in: [this.dataSourceData.source_databaseType] }
        }
      } else if (type === 'target' && this.dataSourceData.target_filter_databaseType !== 'all') {
        where = {
          database_type: { in: [this.dataSourceData.target_databaseType] }
        }
      }
      return where
    },
    queryConnection(type) {
      return query => {
        const where = this.getWhere(type)
        where.name = { like: query, options: 'i' }
        this.getConnection(where, `${type}_connectionId`)
      }
    },
    getConnection(where, type) {
      let fields = {
        name: 1,
        id: 1,
        database_type: 1,
        connection_type: 1,
        status: 1,
        database_host: 1,
        database_port: 1,
        database_name: 1,
        database_uri: 1,
        mqType: 1
      }
      if (type === 'source_connectionId') {
        fields['database_username'] = 1
      }
      let filter = {
        where: where,
        fields: fields,
        order: ['status DESC', 'name ASC']
      }
      this.$api('connections')
        .getConnections(filter)
        .then(res => {
          let data = res?.data?.items || []
          let options = data.map(item => {
            return {
              id: item.database_host + item.database_port + item.database_name + item.database_uri,
              name: item.name,
              label: item.name,
              value: item.id,
              type: item.database_type,
              mqType: item.mqType || ''
            }
          })
          if (type === 'source_connectionId') {
            this.sourceData = options
          } else this.targetData = options
        })
    },
    getSourceConnection(val) {
      this.dataSourceData['source_databaseType'] = val
      this.dataSourceData.source_connectionId = ''
      this.getConnection(this.getWhere('source'), 'source_connectionId', true)
    },
    getTargetConnection(val) {
      this.dataSourceData['target_databaseType'] = val
      this.dataSourceData.target_connectionId = ''
      this.getConnection(this.getWhere('target'), 'target_connectionId', true)
    },
    save() {
      this.$refs.dataSourceModelForm.validate(valid => {
        if (valid) {
          let source = this.sourceData.filter(op => op.value === this.dataSourceData.source_connectionId)[0]
          let target = this.targetData.filter(op => op.value === this.dataSourceData.target_connectionId)[0]
          this.dataSourceData.source_connectionName = source.name
          this.dataSourceData.target_connectionName = target.name
          this.dataSourceData['source_databaseType'] = source.type
          this.dataSourceData['target_databaseType'] = target.type
          this.dataSourceData.mqType = target.mqType
          this.$emit('submit', true)
        }
      })
    }
  }
}
</script>

<style scoped></style>
