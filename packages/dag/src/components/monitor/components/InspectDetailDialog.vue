<template>
  <ElDialog
    :visible.sync="visible"
    :title="$t('packages_dag_inspect_detail_title')"
    width="800px"
    custom-class="inspect-detail-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="inspect-detail-container">
      <!-- Last verification time -->
      <div class="last-verify-time mb-4">
        <span class="text-muted font-size-small"
          >{{ $t('packages_dag_inspect_last_verify_time') }}: {{ formatTime(inspectData.lastStartTime) }}</span
        >
      </div>

      <!-- Main content -->
      <div class="inspect-tables mb-4">
        <ElTable :data="[inspectData]" border size="small" style="width: 100%">
          <ElTableColumn :label="$t('packages_dag_inspect_source_table')" min-width="180">
            <template slot-scope="scope">
              <div>{{ scope.row.sourceName || '-' }}</div>
              <div class="text-muted font-size-small">{{ scope.row.sourceConnectionName || '-' }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('packages_dag_inspect_target_table')" min-width="180">
            <template slot-scope="scope">
              <div>{{ scope.row.targetName || '-' }}</div>
              <div class="text-muted font-size-small">{{ scope.row.targetConnectionName || '-' }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('packages_dag_inspect_count')" width="110" align="center">
            <template slot-scope="scope">
              {{ scope.row.verifyCount || '0' }}
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('packages_dag_inspect_result')" width="140" align="center">
            <template slot-scope="scope">
              <ElTag :type="getResultType(scope.row.result)" size="small">
                {{ getResultText(scope.row.result) }}
              </ElTag>
              <div v-if="scope.row.result === 'failed'" class="text-danger font-size-small mt-1">
                {{ $t('packages_dag_inspect_diff_count', { count: scope.row.diffCount || 0 }) }}
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <!-- Tabs for showing different aspects of the verification -->
      <ElTabs v-model="activeTab" class="inspect-detail-tabs">
        <ElTabPane :label="$t('packages_dag_inspect_detail_tab')" name="details">
          <div v-if="loadingDetails" class="text-center py-4">
            <ElLoading :text="$t('packages_dag_inspect_loading')" background="rgba(255, 255, 255, 0.7)"></ElLoading>
          </div>
          <div v-else>
            <!-- Field mapping details -->
            <ElTable :data="fieldDetails" border size="small" style="width: 100%">
              <ElTableColumn
                :label="$t('packages_dag_inspect_source_field')"
                prop="sourceField"
                min-width="120"
              ></ElTableColumn>
              <ElTableColumn
                :label="$t('packages_dag_inspect_value')"
                prop="sourceValue"
                min-width="120"
              ></ElTableColumn>
              <ElTableColumn
                :label="$t('packages_dag_inspect_target_field')"
                prop="targetField"
                min-width="120"
              ></ElTableColumn>
              <ElTableColumn
                :label="$t('packages_dag_inspect_value')"
                prop="targetValue"
                min-width="120"
              ></ElTableColumn>
            </ElTable>

            <div v-if="fieldDetails.length === 0" class="text-center py-4 text-muted">
              {{ $t('packages_dag_inspect_no_data') }}
            </div>
          </div>
        </ElTabPane>
        <ElTabPane
          :label="$t('packages_dag_inspect_summary_tab')"
          name="summary"
          v-if="inspectData.result === 'failed'"
        >
          <ElAlert
            type="warning"
            :title="$t('packages_dag_inspect_summary_title')"
            :description="$t('packages_dag_inspect_summary_desc', { count: inspectData.diffCount || 0 })"
            show-icon
            class="mb-3"
          />

          <ElCard shadow="never" class="mb-3">
            <div slot="header" class="d-flex align-items-center">
              <span>{{ $t('packages_dag_inspect_verification_summary') }}</span>
            </div>
            <ElDescriptions :column="2" border>
              <ElDescriptionsItem :label="$t('packages_dag_inspect_total_records')">{{
                inspectData.verifyCount || 0
              }}</ElDescriptionsItem>
              <ElDescriptionsItem :label="$t('packages_dag_inspect_diff_records')">{{
                inspectData.diffCount || 0
              }}</ElDescriptionsItem>
              <ElDescriptionsItem :label="$t('packages_dag_inspect_source_records')">{{
                inspectData.sourceTotal || 0
              }}</ElDescriptionsItem>
              <ElDescriptionsItem :label="$t('packages_dag_inspect_target_records')">{{
                inspectData.targetTotal || 0
              }}</ElDescriptionsItem>
            </ElDescriptions>
          </ElCard>
        </ElTabPane>
      </ElTabs>
    </div>

    <div slot="footer" class="dialog-footer">
      <ElButton @click="handleClose">{{ $t('public_button_close') }}</ElButton>
    </div>
  </ElDialog>
</template>

<script>
import { inspectApi, inspectResultsApi } from '@tap/api'
import dayjs from 'dayjs'

export default {
  name: 'InspectDetailDialog',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    inspectId: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      activeTab: 'details',
      inspectData: {},
      fieldDetails: [],
      loadingDetails: false
    }
  },

  watch: {
    visible(val) {
      if (val && this.inspectId) {
        this.fetchInspectData()
      }
    },
    inspectId(val) {
      if (val && this.visible) {
        this.fetchInspectData()
      }
    }
  },

  methods: {
    formatTime(time) {
      if (!time) return '-'
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },

    getResultType(result) {
      if (result === 'passed') return 'success'
      if (result === 'failed') return 'danger'
      return 'info'
    },

    getResultText(result) {
      if (result === 'passed') return this.$t('packages_dag_components_inspect_result_passed')
      if (result === 'failed') return this.$t('packages_dag_components_inspect_result_failed')
      return result
    },

    handleClose() {
      this.$emit('update:visible', false)
      this.resetData()
    },

    resetData() {
      this.inspectData = {}
      this.fieldDetails = []
      this.activeTab = 'details'
    },

    async fetchInspectData() {
      if (!this.inspectId) return

      this.loadingDetails = true

      try {
        // Fetch inspect info from the HTTP API using filter
        const inspectRes = await inspectApi.get({
          filter: JSON.stringify({
            where: {
              id: this.inspectId
            }
          })
        })

        const inspect = inspectRes?.items?.[0] || {}
        const inspectResult = inspect.InspectResult || {}

        // Set basic inspect data
        this.inspectData = {
          ...inspect,
          sourceName: inspect.source?.name || '-',
          sourceConnectionName: inspect.source?.connectionName || '-',
          targetName: inspect.target?.name || '-',
          targetConnectionName: inspect.target?.connectionName || '-',
          verifyCount: 0,
          diffCount: 0,
          sourceTotal: 0,
          targetTotal: 0
        }

        // If we have a result ID, fetch the detailed result
        if (inspectResult.id) {
          const resultRes = await inspectResultsApi.get({
            filter: JSON.stringify({
              where: {
                id: inspectResult.id
              }
            })
          })

          const result = resultRes?.items?.[0] || {}

          // Update inspect data with result information
          this.inspectData = {
            ...this.inspectData,
            ...result,
            verifyCount: result.verify_count || 0,
            diffCount: result.diff_count || 0,
            sourceTotal: result.source_total || 0,
            targetTotal: result.target_total || 0
          }

          // Get field details if available
          if (result.stats && result.stats.length > 0) {
            this.fieldDetails = this.processFieldDetails(result.stats)
          }
        }
      } catch (error) {
        console.error('Failed to fetch inspect details:', error)
        this.$message.error(this.$t('packages_dag_inspect_fetch_error'))
      } finally {
        this.loadingDetails = false
      }
    },

    processFieldDetails(stats) {
      const details = []

      if (!stats || !stats.length) return details

      // Process stats to extract field differences
      stats.forEach(stat => {
        if (stat.differences && Array.isArray(stat.differences)) {
          stat.differences.forEach(diff => {
            details.push({
              sourceField: diff.sourceField || diff.source_field || '-',
              sourceValue: JSON.stringify(diff.sourceValue || diff.source_value || '-'),
              targetField: diff.targetField || diff.target_field || '-',
              targetValue: JSON.stringify(diff.targetValue || diff.target_value || '-')
            })
          })
        } else if (stat.source_values && stat.target_values) {
          // Handle key-value format differences
          const sourceValues = stat.source_values || {}
          const targetValues = stat.target_values || {}

          // Combine all keys from both source and target
          const allKeys = [...new Set([...Object.keys(sourceValues), ...Object.keys(targetValues)])]

          allKeys.forEach(key => {
            if (sourceValues[key] !== targetValues[key]) {
              details.push({
                sourceField: key,
                sourceValue: JSON.stringify(sourceValues[key] || '-'),
                targetField: key,
                targetValue: JSON.stringify(targetValues[key] || '-')
              })
            }
          })
        }
      })

      return details
    }
  }
}
</script>

<style lang="scss" scoped>
.inspect-detail-dialog {
  &::v-deep .el-dialog__body {
    padding: 20px;
  }
}

.inspect-detail-container {
  .last-verify-time {
    text-align: right;
    color: #909399;
  }

  .text-muted {
    color: #909399;
  }

  .text-danger {
    color: #f56c6c;
  }

  .font-size-small {
    font-size: 12px;
  }

  .inspect-detail-tabs {
    &::v-deep .el-tabs__header {
      margin-bottom: 15px;
    }
  }
}
</style>
