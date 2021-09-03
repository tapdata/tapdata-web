<template>
  <el-dialog
    width="770px"
    class="check-stage-dialog"
    append-to-body
    :visible.sync="visible"
    :show-close="false"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-table :data="data" style="width: 100%" class="test-block">
      <el-table-column type="index">序号</el-table-column>
      <el-table-column :prop="stages[0].tableName" label="源表名">
        <template slot-scope="scope">
          {{ scope.row.stages[0].tableName }}
        </template>
      </el-table-column>
      <el-table-column label="源表名">
        <template slot-scope="scope">
          {{ scope.row.stages[-1].tableName }}
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
  mounted() {
    this.data = [
      {
        stages: [
          {
            id: '12345',
            tableName: 'source'
          },
          {
            id: '1234',
            tableName: 'target'
          }
        ],
        type: 'add',
        syncType: ''
      },
      {
        stages: [
          {
            id: '123456',
            tableName: 'source2'
          },
          {
            id: '12347',
            tableName: 'target2'
          }
        ],
        type: 'add',
        syncType: ''
      }
    ]
    this.data = this.initData(this.data)
  },
  methods: {
    /*
     * 只展示type类型为add
     * stages 过滤其他的处理器*/
    initData(initData) {
      console.log(initData)
      return initData.filter(v => v.type === 'add')
    },
    Save() {
      this.$emit('complete', this.data)
    }
  }
}
</script>

<style scoped></style>
