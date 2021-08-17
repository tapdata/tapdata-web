<template>
  <el-table
    highlight-current-row
    class="dv-table border mt-2"
    ref="table"
    height="100%"
    :data="data"
    :element-loading-text="$t('dataFlow.dataLoading')"
    @row-click="rowClickHandler"
  >
    <ElTableColumn width="45">
      <template slot-scope="scope">
        <ElRadio :value="current" :label="scope.row.taskId">
          <span></span>
        </ElRadio>
      </template>
    </ElTableColumn>
    <ElTableColumn :label="$t('dataVerification.sourceTable')">
      <template slot-scope="scope">
        <span>{{ scope.row.source ? scope.row.source.table : '' }}</span>
        <div style="color: #ccc">
          {{ scope.row.source ? scope.row.source.connectionName : '' }}
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn :label="$t('dataVerification.targetTable')">
      <template slot-scope="scope">
        <span>{{ scope.row.target ? scope.row.target.table : 0 }}</span>
        <div style="color: #ccc">
          {{ scope.row.target ? scope.row.target.connectionName : 0 }}
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn :label="$t('dataVerification.sourceRows')">
      <template slot-scope="scope">
        <span>{{ scope.row.firstSourceTotal || scope.row.source_total || 0 }}</span>
        <div>
          {{ scope.row.firstTargetTotal || scope.row.target_total || 0 }}
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="progress" :label="$t('dataVerification.verifyProgress')" width="80px">
      <template slot-scope="scope">
        <div>
          <span>{{
            `${Math.round(scope.row.progress * 10000) / 100 ? Math.round(scope.row.progress * 10000) / 100 : 0}%`
          }}</span>
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="status" :label="$t('dataVerification.verifyResult')">
      <template slot-scope="scope" v-if="['waiting', 'done'].includes(scope.row.status)">
        <div class="inspect-result-status">
          <div v-if="scope.row.result === 'failed'">
            <span class="error" v-if="scope.row.target_total - scope.row.source_total !== 0">
              <i class="verify-icon el-icon-error color-danger"></i>
              <span>
                {{
                  $t('dataVerification.rowConsistent') +
                  ' : ' +
                  Math.abs(scope.row.target_total - scope.row.source_total)
                }}
              </span>
            </span>
          </div>
          <div
            v-if="
              scope.row.source_only + scope.row.target_only + scope.row.row_failed !== 0 &&
              type !== 'row_count' &&
              scope.row.result === 'failed'
            "
          >
            <span class="error">
              <i class="verify-icon el-icon-error color-danger"></i>
              <span>
                {{ $t('dataVerification.contConsistent') + ' : ' }}
                {{ scope.row.source_only + scope.row.target_only + scope.row.row_failed }}
              </span>
            </span>
          </div>
          <span class="success" v-if="scope.row.result === 'passed'">
            <i class="verify-icon el-icon-success color-success"></i>
            <span>{{ $t('dataVerification.consistent') }}</span>
          </span>
        </div>
      </template>
    </ElTableColumn>
  </el-table>
</template>
<style lang="scss" scoped>
.verify-icon {
  margin: 0 4px;
  font-size: 14;
}
</style>
<script>
export default {
  props: {
    type: String,
    data: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      current: 0
    }
  },
  methods: {
    setCurrentRow(row) {
      this.current = row.taskId
      this.$refs.table.setCurrentRow(row)
    },
    rowClickHandler(row) {
      this.current = row.taskId
      this.$emit('row-click', row)
    }
  }
}
</script>
