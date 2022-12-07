<template>
  <el-table
    highlight-current-row
    ref="table"
    height="100%"
    :data="list"
    :element-loading-text="$t('dataFlow.dataLoading')"
    @row-click="rowClickHandler"
  >
    <ElTableColumn :label="$t('dataVerification.sourceTable')">
      <template slot-scope="scope">
        <span>{{ scope.row.source ? scope.row.source.table : '' }}</span>
        <div class="font-color-slight">
          {{ scope.row.source ? scope.row.source.connectionName : '' }}
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn :label="$t('dataVerification.targetTable')">
      <template slot-scope="scope">
        <span>{{ scope.row.target ? scope.row.target.table : 0 }}</span>
        <div class="font-color-slight">
          {{ scope.row.target ? scope.row.target.connectionName : 0 }}
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn v-if="$route.name === 'VerifyDiffDetails'" :label="$t('dataVerification.sourceRows')">
      <template slot-scope="scope">
        <span>{{ scope.row.source_total || 0 }}</span>
        <!--        <div>-->
        <!--          {{ scope.row.target_total || 0 }}-->
        <!--        </div>-->
      </template>
    </ElTableColumn>
    <ElTableColumn v-else :label="$t('dataVerification.sourceRows')">
      <template slot-scope="scope">
        <span>{{ scope.row.source_total || 0 }}</span>
        <!--        <div>-->
        <!--          {{ scope.row.firstTargetTotal || 0 }}-->
        <!--        </div>-->
      </template>
    </ElTableColumn>
    <ElTableColumn prop="progress" :label="$t('dataVerification.verifyProgress')" width="120px">
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
          <div v-if="scope.row.result === 'failed' && scope.row.countResultText">
            <span class="error">
              <i class="verify-icon el-icon-error color-danger"></i>
              <span>{{ scope.row.countResultText }}</span>
            </span>
          </div>
          <div v-if="scope.row.result === 'failed' && scope.row.contentResultText">
            <span class="error">
              <i class="verify-icon el-icon-error color-danger"></i>
              <span>{{ scope.row.contentResultText }}</span>
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
  computed: {
    list() {
      let list = this.data.map(item => {
        if (item.result === 'failed') {
          let countResultText = ''
          let contentResultText = ''
          let diffCount = item.target_total - item.source_total
          let diffCountNum = Math.abs(diffCount)
          if (diffCount > 0) {
            countResultText = this.$t('verify_result_count_more', [diffCountNum])
          }
          if (diffCount < 0) {
            countResultText = this.$t('verify_result_count_less', [diffCountNum])
          }
          if (this.type !== 'row_count') {
            let diffContentNum = item.source_only + item.target_only + item.row_failed
            if (diffContentNum !== 0) {
              contentResultText = this.$t('verify_result_content_diff', [diffContentNum])
            }
          }
          item.countResultText = countResultText
          item.contentResultText = contentResultText
        }
        return item
      })
      return list
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
