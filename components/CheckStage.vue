<template>
  <el-dialog
    width="770px"
    class="check-stage-dialog"
    append-to-body
    :visible.sync="visible"
    :show-close="false"
    title="新增同步链路设置"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div>检测到当前任务有以下新增链路，请设置同步方式（默认全量 + 增量）</div>
    <el-table :data="data" style="width: 100%" class="test-block">
      <el-table-column type="index">序号</el-table-column>
      <el-table-column label="源表名">
        <template slot-scope="scope">
          {{ scope.row.stages ? scope.row.stages[0].tableName : '' }}
        </template>
      </el-table-column>
      <el-table-column label="源表名">
        <template slot-scope="scope">
          {{ scope.row.stages ? scope.row.stages[scope.row.stages.length - 1].tableName:'' }}
        </template>
      </el-table-column>
      <el-table-column prop="syncType" label="目标表名">
        <template slot-scope="scope">
          <el-radio-group v-model="scope.row.syncType">
            <el-radio label="initial_sync+cdc">全量+增量</el-radio>
            <el-radio label="cdc">仅增量</el-radio>
          </el-radio-group>
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" type="primary" @click="Save()">{{ $t('dataForm.close') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'CheckStage',
  props: ['visible', 'data'],
  methods: {
    Save() {
      this.$emit('complete', this.data)
    }
  }
}
</script>

<style scoped></style>
