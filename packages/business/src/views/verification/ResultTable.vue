<script>
import { $emit, $off, $on, $once } from '../../../utils/gogocodeTransfer'
import loadingImg from '@tap/assets/icons/loading.svg'

export default {
  props: {
    type: String,
    data: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  emits: ['row-click'],
  data() {
    return {
      current: 0,
      loadingImg
    }
  },
  computed: {
    list() {
      const list = this.data.map((item) => {
        if (item.result === 'failed') {
          let countResultText = ''
          let contentResultText = ''
          const diffCount = item.target_total - item.source_total
          const diffCountNum = Math.abs(diffCount)
          if (diffCount > 0) {
            countResultText = this.$t(
              'packages_business_verification_result_count_more',
              [diffCountNum],
            )
          }
          if (diffCount < 0) {
            countResultText = this.$t(
              'packages_business_verification_result_count_less',
              [diffCountNum],
            )
          }
          if (this.type !== 'row_count') {
            const diffContentNum =
              item.source_only + item.target_only + item.row_failed
            if (diffContentNum !== 0) {
              contentResultText = this.$t(
                'packages_business_verification_result_content_diff',
                [diffContentNum],
              )
            }
          }
          item.countResultText = countResultText
          item.contentResultText = contentResultText
        }
        return item
      })
      return list.sort((a, b) => {
        if (a.status === 'done') {
          return 1
        } else if (b.status === 'done') {
          return -1
        } else {
          return 0
        }
      })
    },
  },
  methods: {
    setCurrentRow(row) {
      this.current = row.taskId
      this.$refs.table.setCurrentRow(row)
    },
    rowClickHandler(row) {
      this.current = row.taskId
      $emit(this, 'row-click', row)
    },
  },
}
</script>

<template>
  <el-table
    ref="table"
    class="flex-1"
    highlight-current-row
    height="100%"
    :data="list"
    :element-loading-text="$t('packages_business_dataFlow_dataLoading')"
    @row-click="rowClickHandler"
  >
    <ElTableColumn :label="$t('packages_business_verification_sourceTable')">
      <template #default="scope">
        <span>{{ scope.row.source ? scope.row.source.table : '' }}</span>
        <div class="font-color-slight">
          {{ scope.row.source ? scope.row.source.connectionName : '' }}
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn :label="$t('packages_business_verification_targetTable')">
      <template #default="scope">
        <span>{{ scope.row.target ? scope.row.target.table : 0 }}</span>
        <div class="font-color-slight">
          {{ scope.row.target ? scope.row.target.connectionName : 0 }}
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn :label="$t('packages_business_verification_sourceRows')">
      <template #default="{ row }">
        <span>{{ type === 'hash' ? '-' : row.source_total || 0 }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn
      prop="progress"
      :label="$t('packages_business_verification_verifyProgress')"
      width="120px"
    >
      <template #default="{ row }">
        <div>
          <span v-if="!row.recovering">{{
            `${row.progress ? Math.floor(row.progress * 100) : 0}%`
          }}</span>
          <template v-else>
            <img
              style="width: 26px; vertical-align: middle"
              :src="loadingImg"
            />
            <span>{{ $t('packages_business_recovering') }}</span>
          </template>
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn
      prop="status"
      :label="$t('packages_business_verification_result_title')"
    >
      <template #default="{ row }">
        <div
          v-if="['waiting', 'done'].includes(row.status)"
          class="inspect-result-status"
        >
          <template v-if="row.result === 'failed'">
            <div v-if="type === 'hash'">
              <span class="error">
                <i class="verify-icon el-icon-error color-danger" />
                <span>{{
                  $t('packages_business_verification_inconsistent')
                }}</span>
              </span>
            </div>
            <template v-else>
              <div v-if="row.countResultText">
                <span class="error">
                  <el-icon class="verify-icon color-danger"
                    ><CircleCloseFilled
                  /></el-icon>
                  <span>{{ row.countResultText }}</span>
                </span>
              </div>
              <div v-if="row.contentResultText">
                <span class="error">
                  <el-icon class="verify-icon color-danger"
                    ><CircleCloseFilled
                  /></el-icon>
                  <span>{{ row.contentResultText }}</span>
                </span>
              </div>
            </template>
          </template>
          <span v-if="row.result === 'passed'" class="success">
            <el-icon class="verify-icon color-success"
              ><SuccessFilled
            /></el-icon>
            <span>{{ $t('packages_business_verification_consistent') }}</span>
          </span>
        </div>
        <span v-else />
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
