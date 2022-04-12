<template>
  <el-form
    ref="dataSourceModelForm"
    label-width="140px"
    label-position="left"
    :disabled="stateIsReadonly"
    :model="dataSourceData"
    :rules="rules"
  >
    <el-form-item :label="$t('task_form_source_type')" prop="source_filter_databaseType">
      <el-select
        v-model="dataSourceData.source_filter_databaseType"
        style="width: 300px"
        filterable
        clearable
        @change="getSourceConnection"
      >
        <el-option v-for="item in allowSourceDatabaseTypes" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('task_form_source_connection')" prop="source_connectionId">
      <el-select
        v-model="dataSourceData.source_connectionId"
        style="width: 300px"
        filterable
        clearable
        remote
        :clear="clearSourceMethod"
        :loading="loadingSource"
        :remote-method="remoteSourceMethod"
        @change="$emit('change')"
      >
        <el-option v-for="item in sourceData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('task_form_target_type')" prop="target_filter_databaseType">
      <el-select
        v-model="dataSourceData.target_filter_databaseType"
        style="width: 300px"
        filterable
        clearable
        @change="getTargetConnection"
      >
        <el-option v-for="item in allowTargetDatabaseTypes" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('task_form_target_connection')" prop="target_connectionId">
      <el-select
        v-model="dataSourceData.target_connectionId"
        style="width: 300px"
        filterable
        clearable
        remote
        :loading="loadingTarget"
        :clear="clearTargetMethod"
        :remote-method="remoteTargetMethod"
        @change="$emit('change')"
      >
        <el-option v-for="item in targetData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
import { verify } from '../../../connections/util'

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
        source_filter_databaseType: [
          { required: true, message: this.$t('task_form_source_type_check'), trigger: 'change' }
        ],
        source_connectionId: [
          { required: true, message: this.$t('task_form_source_connection_check'), trigger: 'change' }
        ],
        target_filter_databaseType: [
          { required: true, message: this.$t('task_form_target_type_check'), trigger: 'change' }
        ],
        target_connectionId: [
          { required: true, message: this.$t('task_form_target_connection_check'), trigger: 'change' }
        ]
      },
      loadingSource: false,
      loadingTarget: false
    }
  },
  mounted() {
    this.allowDatabaseType()
    this.getConnection(this.getWhere('source'), 'source_connectionId')
    this.getConnection(this.getWhere('target'), 'target_connectionId')
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
          let filterArrSource = [
            'redis',
            'hazelcast_cloud_cluster',
            'elasticsearch',
            'clickhouse',
            'dameng',
            'jira',
            'tcp_udp'
          ]
          //过滤不支持作为目标的数据源
          let filterArrTarget = ['adb_mysql', 'jira', 'tcp_udp']
          this.allowSourceDatabaseTypes = []
          this.allowTargetDatabaseTypes = []
          data.forEach(item => {
            if (filterArrSource.indexOf(item) === -1) {
              this.allowSourceDatabaseTypes.push({
                label: TYPEMAP[item],
                value: item
              })
            }
            if (filterArrTarget.indexOf(item) === -1) {
              this.allowTargetDatabaseTypes.push({
                label: TYPEMAP[item],
                value: item
              })
            }
          })
          this.allowSourceDatabaseTypes.unshift({ label: this.$t('query_build_all'), value: 'all' })
          this.allowTargetDatabaseTypes.unshift({ label: this.$t('query_build_all'), value: 'all' })
        })
    },
    getWhere(type) {
      let where = {}
      if (type === 'source') {
        if (this.dataSourceData.source_filter_databaseType !== 'all') {
          where = {
            database_type: { in: [this.dataSourceData.source_databaseType] },
            connection_type: { in: ['source', 'source_and_target'] }
          }
        } else {
          where = {
            connection_type: { in: ['source', 'source_and_target'] }
          }
        }
      } else if (type === 'target') {
        if (this.dataSourceData.target_filter_databaseType !== 'all') {
          where = {
            database_type: { in: [this.dataSourceData.target_databaseType] },
            connection_type: { in: ['target', 'source_and_target'] }
          }
        } else {
          where = {
            connection_type: { in: ['target', 'source_and_target'] }
          }
        }
      }
      return where
    },
    getConnection(where, type, keyword) {
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
        mqType: 1,
        shareCdcEnable: 1
      }
      if (type === 'source_connectionId') {
        fields['database_username'] = 1
        this.loadingSource = true
      } else {
        this.loadingTarget = true
      }
      if (keyword && keyword.trim()) {
        where.name = { like: verify(keyword), options: 'i' }
      }
      let filter = {
        where: where,
        fields: fields,
        order: ['status DESC', 'name ASC']
      }
      this.$api('connections')
        .listAll(filter)
        .then(res => {
          let data = res?.data || []
          let options = data.map(item => {
            return {
              id: item.database_host + item.database_port + item.database_name + item.database_uri,
              name: item.name,
              label: item.name,
              value: item.id,
              type: item.database_type,
              mqType: item.mqType || '',
              shareCdcEnable: item.shareCdcEnable || ''
            }
          })
          if (type === 'source_connectionId') {
            this.sourceData = options
          } else this.targetData = options
        })
        .finally(() => {
          if (type === 'source_connectionId') {
            this.loadingSource = false
          } else this.loadingTarget = false
        })
    },
    getSourceConnection(val) {
      this.dataSourceData['source_databaseType'] = val
      this.dataSourceData.source_connectionId = ''
      this.getConnection(this.getWhere('source'), 'source_connectionId')
    },
    getTargetConnection(val) {
      this.dataSourceData['target_databaseType'] = val
      this.dataSourceData.target_connectionId = ''
      this.getConnection(this.getWhere('target'), 'target_connectionId')
    },
    clearSourceMethod() {
      this.getConnection(this.getWhere('source'), 'source_connectionId')
    },
    clearTargetMethod() {
      this.getConnection(this.getWhere('target'), 'target_connectionId')
    },
    remoteSourceMethod(keyword) {
      this.getConnection(this.getWhere('source'), 'source_connectionId', keyword)
    },
    remoteTargetMethod(keyword) {
      this.getConnection(this.getWhere('target'), 'target_connectionId', keyword)
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
          this.dataSourceData.shareCdcEnable = source.shareCdcEnable
          this.$emit('submit', true)
        }
      })
    }
  }
}
</script>

<style scoped></style>
