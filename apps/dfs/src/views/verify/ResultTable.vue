<template>
  <ElTable
    highlight-current-row
    ref="table"
    height="100%"
    :data="list"
    :element-loading-text="$t('dataFlow_dataLoading')"
    @row-click="rowClickHandler"
    @selection-change="handleSelectionChange"
  >
    <ElTableColumn type="selection" width="55" :selectable="checkSelectableFnc"> </ElTableColumn>
    <ElTableColumn :label="$t('dataVerification_sourceTable')">
      <template slot-scope="scope">
        <span>{{ scope.row.source ? scope.row.source.table : '' }}</span>
        <div style="color: #ccc">
          {{ scope.row.source ? scope.row.source.connectionName : '' }}
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn :label="$t('dataVerification_targetTable')">
      <template slot-scope="scope">
        <span>{{ scope.row.target ? scope.row.target.table : 0 }}</span>
        <div style="color: #ccc">
          {{ scope.row.target ? scope.row.target.connectionName : 0 }}
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn :label="$t('dataVerification_sourceRows')" width="140px">
      <template slot-scope="scope">
        <span>{{ (firstCheckId ? scope.row.firstSourceTotal : scope.row.source_total) || 0 }}</span>
      </template>
    </ElTableColumn>
    <!--    <ElTableColumn v-if="$route.name === 'VerifyDiffDetails'" :label="$t('dataVerification_sourceRows')">-->
    <!--      <template slot-scope="scope">-->
    <!--        <span>{{ scope.row.firstSourceTotal || 0 }}</span>-->
    <!--      </template>-->
    <!--    </ElTableColumn>-->
    <!--    <ElTableColumn v-else :label="$t('dataVerification_sourceRows')">-->
    <!--      <template slot-scope="scope">-->
    <!--        <span>{{ scope.row.source_total || 0 }}</span>-->
    <!--      </template>-->
    <!--    </ElTableColumn>-->
    <ElTableColumn prop="progress" :label="$t('dataVerification_verifyProgress')" width="120px">
      <template slot-scope="scope">
        <div>
          <span>{{
            `${Math.round(scope.row.progress * 10000) / 100 ? Math.round(scope.row.progress * 10000) / 100 : 0}%`
          }}</span>
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="status" :label="$t('dataVerification_verifyResult')">
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
            <span>{{ $t('dataVerification_consistent') }}</span>
          </span>
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn v-if="$route.name !== 'VerifyResult'" prop="status" :label="$t('list_operation')" width="90px">
      <template slot-scope="scope">
        <ElButton type="text" :disabled="scope.row.result === 'passed'" @click.prevent.stop="verifyAgain(scope.row)">{{
          $t('verify_operation_verify_again')
        }}</ElButton>
      </template>
    </ElTableColumn>
  </ElTable>
</template>
<style lang="scss" scoped>
.verify-icon {
  margin: 0 4px;
  font-size: 14px;
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
    },
    firstCheckId: {
      type: String
    }
  },
  data() {
    return {
      current: 0,
      multipleSelection: []
    }
  },
  computed: {
    list() {
      let list = this.data.map(item => {
        if (item.result === 'failed') {
          let countResultText = ''
          let contentResultText = ''
          let diffCount = item.target_total - item.source_total
          // 差异校验
          if (this.$route.name === 'VerifyDiffDetails') {
            diffCount = item.firstTargetTotal - item.firstSourceTotal
          }
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
    },
    verifyAgainDisabled() {
      return !this.list.every(t => ['done', 'error'].includes(t.status))
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
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    getMultipleSelection() {
      return this.multipleSelection || []
    },
    verifyAgain(row) {
      this.$emit('verify-again', [row.taskId])
    },
    checkSelectableFnc(row) {
      return row.result !== 'passed'
    }
  }
}
</script>
