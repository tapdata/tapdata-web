<template>
  <ElDialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :title="$t('packages_dag_inspect_detail_title')"
    width="80%"
    append-to-body
    custom-class="inspect-detail-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <template #title>
      <div class="flex align-items-center">
        <span>{{ $t('packages_dag_inspect_detail_title') }}</span>
        <VIcon class="text-muted ml-4 mr-1" :size="14">time</VIcon>
        <span class="text-muted fs-8">{{ $t('packages_dag_inspect_last_verify_time') }}: {{ pingTime }}</span>
      </div>
    </template>
    <div class="inspect-detail-container border-top">
      <div class="flex" style="min-height: 400px">
        <div class="inspection-result-list bg-light p-3 overflow-y-auto">
          <div class="flex flex-column gap-3">
            <div
              v-for="(row, index) in inspectList"
              :key="index"
              class="inspection-result-card p-3 bg-white rounded-lg shadow-sm"
              :class="{ 'border-primary': currentSelectedRow === row }"
              @click="handleRowClick(row)"
            >
              <div>
                <div class="flex align-items-center gap-2 fs-6 font-color-dark">
                  <VIcon :size="20">table</VIcon>
                  <div class="flex flex-column">
                    <span class="">{{ row.targetTable || '-' }}</span>
                    <div v-if="row.sourceTable !== row.targetTable" class="font-color-light position-relative">
                      <VIcon style="transform: translateY(-25%)">ArrowToTopRightLinear</VIcon>
                      <span class="fs-7">{{ row.sourceTable || '-' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex mt-2 gap-3">
                <ElTag v-if="row.countDiff > 0" class="rounded-4" size="small" type="danger">
                  {{
                    $t('packages_dag_inspect_diff_records_num', {
                      num: row.countDiff
                    })
                  }}
                </ElTag>

                <ElTag v-if="row.countMiss > 0" class="rounded-4" size="small" type="warning">
                  {{
                    $t('packages_dag_inspect_target_less_num', {
                      num: row.countMiss
                    })
                  }}
                </ElTag>

                <ElTag v-if="row.countMore > 0" class="rounded-4" size="small" type="success">
                  {{ $t('packages_dag_inspect_target_more_num', { num: row.countMore }) }}
                </ElTag>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white border-left flex-1 flex flex-column">
          <div class="flex gap-3 px-4 py-3 border-bottom">
            <span
              @click="onlyShowDiffFields = true"
              class="bg-subtle rounded-lg px-3 py-2 cursor-pointer"
              :class="{
                'active-primary': onlyShowDiffFields
              }"
              >{{ $t('packages_business_verification_details_jinxianshichayi') }}</span
            >

            <span
              @click="onlyShowDiffFields = false"
              class="bg-subtle rounded-lg px-3 py-2 cursor-pointer"
              :class="{
                'active-primary': !onlyShowDiffFields
              }"
              >{{ $t('packages_business_verification_details_xianshiwanzhengzi') }}</span
            >

            <!-- <span class="flex align-center gap-1 ml-auto">
              <VIcon :size="16">table</VIcon>
              <span>{{ currentSelectedRow.targetTable }}</span>
            </span> -->
          </div>
          <div class="overflow-y-auto p-4 min-height-0">
            <div class="flex flex-column gap-4">
              <div v-for="(row, index) in rowDiffList" :key="index" class="border rounded-lg overflow-hidden">
                <div class="flex align-items-center gap-2 p-3 bg-light">
                  <span class="bg-fill-hover rounded-lg px-2 py-1">行 ID: {{ row.id }}</span>
                  <div class="flex-1"></div>
                  <ElTag v-if="row.diffType === 'DIFF'" class="rounded-4" size="small" type="danger"> 差异 </ElTag>

                  <ElTag v-if="row.diffType === 'MISS'" class="rounded-4" size="small" type="warning"> 目标少 </ElTag>

                  <ElTag v-if="row.diffType === 'MORE'" class="rounded-4" size="small" type="success"> 目标多 </ElTag>
                </div>

                <table class="w-100 row-diff-table font-color-dark" v-if="row.diffType === 'DIFF'">
                  <thead class="bg-light border-bottom">
                    <tr>
                      <th class="text-start p-3 text-sm fw-sub text-muted-foreground w-1/4">字段</th>
                      <th class="text-start p-3 text-sm fw-sub w-[37.5%]">源表值</th>
                      <th class="text-start p-3 text-sm fw-sub text-destructive w-[37.5%]">目标表值</th>
                    </tr>
                  </thead>
                  <tbody v-if="onlyShowDiffFields">
                    <tr class="border-bottom hover:bg-light" v-for="field in row.diffFields" :key="field">
                      <td class="p-3 text-sm text-muted-foreground">
                        {{ row.diffFieldsMap[field] }}
                        <div v-if="row.diffFieldsMap[field] !== field" class="flex align-center font-color-sslight">
                          <VIcon style="transform: translateY(-25%)">ArrowToTopRightLinear</VIcon>
                          <span class="fs-7">{{ field }}</span>
                        </div>
                      </td>
                      <td class="p-3 text-sm font-medium">
                        <span>{{ row.source[field] }}</span>
                      </td>
                      <td class="p-3 text-sm font-medium color-danger">
                        <span>{{ row.target[row.diffFieldsMap[field]] }}</span>
                      </td>
                    </tr>
                  </tbody>
                  <tbody v-else>
                    <tr
                      class="border-bottom hover:bg-light"
                      v-for="(targetField, i) in row.targetFields"
                      :key="targetField"
                    >
                      <td class="p-3 text-sm text-muted-foreground">{{ targetField }}</td>
                      <td class="p-3 text-sm font-medium">
                        <span>{{ row.source[row.sourceFields[i]] }}</span>
                      </td>
                      <td
                        class="p-3 text-sm font-medium"
                        :class="{ 'color-danger': row.diffFieldsMap[row.sourceFields[i]] }"
                      >
                        <span>{{ row.target[targetField] }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div v-else class="font-color-dark border-top">
                  <div
                    v-for="(value, key) in row.source || row.target"
                    :key="key"
                    class="flex border-bottom last:border-0 hover:bg-light"
                  >
                    <div class="flex-1 p-3 text-sm text-muted-foreground">{{ key }}</div>
                    <div class="flex-1 p-3 text-sm font-medium">
                      <span>{{ value }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ElDialog>
</template>

<script>
import { inspectApi, inspectResultsApi } from '@tap/api'
import dayjs from 'dayjs'
import axios from 'axios'
import VIcon from '@tap/component/src/base/VIcon.vue'

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
    },
    pingTime: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      activeTab: 'details',
      inspectData: {},
      fieldDetails: [],
      inspectList: [],
      rowDiffList: [],
      loadingDetails: false,
      currentSelectedRow: null,
      onlyShowDiffFields: true
    }
  },

  watch: {
    visible(val) {
      if (val && this.inspectId) {
        this.fetchDiffList()
        // this.fetchInspectData()
      }
    }
    // inspectId(val) {
    //   if (val && this.visible) {
    //     this.fetchInspectData()
    //   }
    // }
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

    getTotalDiffCount(row) {
      return (row.countMiss || 0) + (row.countMore || 0) + (row.countDiff || 0)
    },

    handleClose() {
      this.$emit('update:visible', false)
      this.resetData()
    },

    resetData() {
      this.inspectData = {}
      this.fieldDetails = []
      this.activeTab = 'details'
      this.currentSelectedRow = null
    },

    async fetchDiffList() {
      // GET {{url}}/task-inspect-histories/67e4c244e6f5d172f002db2e/results/group-by-table?access_token={{token}}
      const data = await axios.get(`/api/task-inspect-histories/${this.inspectId}/results/group-by-table`)

      this.inspectList = data?.items || []

      // Select the first item by default if available
      if (this.inspectList.length > 0) {
        this.currentSelectedRow = this.inspectList[0]
        this.fetchTableDiff(this.inspectList[0].sourceTable)
      }
    },

    async fetchTableDiff(sourceTable) {
      if (!this.inspectId) return

      this.loadingDetails = true

      try {
        // Fetch inspect info from the HTTP API using filter
        const { items = [] } = await axios.get(`/api/task-inspect-histories/${this.inspectId}/results`, {
          params: {
            filter: JSON.stringify({
              where: { sourceTable }
            })
          }
        })

        this.rowDiffList = items.map(item => {
          if (item.diffType === 'DIFF') {
            return {
              ...item,
              diffFieldsMap: item.diffFields.reduce((acc, field) => {
                acc[field] = item.targetFields[item.sourceFields.indexOf(field)]
                return acc
              }, {})
            }
          }
          return item
        })
        // this.inspectList = inspectRes?.items || []
        // const inspect = inspectRes?.items?.[0] || {}
        // const inspectResult = inspect.InspectResult || {}

        // Set basic inspect data
        // this.inspectData = {
        //   ...inspect,
        //   sourceName: inspect.source?.name || '-',
        //   sourceConnectionName: inspect.source?.connectionName || '-',
        //   targetName: inspect.target?.name || '-',
        //   targetConnectionName: inspect.target?.connectionName || '-',
        //   verifyCount: 0,
        //   diffCount: 0,
        //   sourceTotal: 0,
        //   targetTotal: 0
        // }

        // // If we have a result ID, fetch the detailed result
        // if (inspectResult.id) {
        //   const resultRes = await inspectResultsApi.get({
        //     filter: JSON.stringify({
        //       where: {
        //         id: inspectResult.id
        //       }
        //     })
        //   })

        //   const result = resultRes?.items?.[0] || {}

        //   // Update inspect data with result information
        //   this.inspectData = {
        //     ...this.inspectData,
        //     ...result,
        //     verifyCount: result.verify_count || 0,
        //     diffCount: result.diff_count || 0,
        //     sourceTotal: result.source_total || 0,
        //     targetTotal: result.target_total || 0
        //   }

        //   // Get field details if available
        //   if (result.stats && result.stats.length > 0) {
        //     this.fieldDetails = this.processFieldDetails(result.stats)
        //   }
        // }
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
    },

    handleRowClick(row) {
      this.currentSelectedRow = row
      this.fetchTableDiff(row.sourceTable)
    }
  }
}
</script>

<style lang="scss">
.inspect-detail-dialog {
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .el-dialog__header {
    padding: 20px;
  }
  .el-dialog__body {
    padding: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}
</style>

<style lang="scss" scoped>
.inspect-detail-container {
  display: flex;
  flex-direction: column;
  min-height: 0;

  .row-diff-table {
    thead > tr > th {
      width: 37.5%;

      &:first-child {
        width: 25%;
      }
    }

    tbody > tr {
      &:last-child {
        border-bottom: none !important;
      }
    }
  }

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

  .inspection-result-list {
    width: 320px;
  }

  .inspection-result-header {
  }

  .inspection-result-count {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .inspection-result-actions {
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
  }

  .inspection-result-card {
    cursor: pointer;
    transition: background-color 0.2s;

    border: 1px solid transparent;

    &:hover {
      background-color: rgba(31, 35, 41, 0.08);
    }

    &.active {
      background-color: rgb(240, 244, 255) !important;
    }
  }

  .inspection-card-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    i {
      margin-right: 8px;
      color: #909399;
    }

    .card-title {
      flex: 1;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .diff-tag {
      margin-left: 8px;
    }
  }

  .inspection-card-content {
    padding-left: 24px;
  }

  .inspection-card-metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .inspection-card-metric {
    display: flex;
    flex-direction: column;

    .metric-label {
      font-size: 12px;
      color: #909399;
    }

    .metric-value {
      font-size: 14px;
      font-weight: 500;
    }
  }
}
</style>
