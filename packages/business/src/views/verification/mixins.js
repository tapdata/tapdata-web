import { inspectDetailsApi } from '@tap/api'
import { downloadBlob } from '@tap/shared'
import i18n from '@tap/i18n'

export default {
  data() {
    return {
      downloading: false
    }
  },
  methods: {
    rowClick(row) {
      this.taskId = row.taskId
      this.$refs.resultView?.fetch(1)
    },
    getResultData({ current, size }) {
      let taskId = this.taskId
      let task = this.inspect.tasks?.find(item => item.taskId === taskId)
      if (task) {
        let showAdvancedVerification = task.showAdvancedVerification
        const sourceSortColumn = task.source?.sortColumn?.split(',')
        const targetSortColumn = task.target?.sortColumn?.split(',')
        const inspectMethod = this.inspect.inspectMethod
        let statsInfo = this.tableData.find(item => item.taskId === this.taskId)
        let where = {
          taskId,
          inspect_id: this.inspect.id,
          inspectResultId: this.resultInfo.id
        }
        let filter = {
          where,
          order: 'createTime DESC',
          limit: showAdvancedVerification ? 1 : size,
          skip: (current - 1) * (showAdvancedVerification ? 1 : size)
        }
        return inspectDetailsApi
          .get({
            filter: JSON.stringify(filter)
          })
          .then(data => {
            let resultList = []
            let items = data?.items || []
            if (showAdvancedVerification) {
              resultList = items
            } else {
              resultList = this.handleOtherVerify(items)
            }
            return {
              showAdvancedVerification, // 是否高级校验
              total: data.total || 0, // 总条数
              statsInfo, // 结果信息
              resultList, // 结果详情
              sourceSortColumn, // 源索引字段
              targetSortColumn, // 目标索引字段
              inspectMethod
            }
          })
      }
      return Promise.reject()
    },
    handleOtherVerify(data) {
      if (data.length === 0) {
        return
      }
      const findOne = this.tableData.find(t => t.taskId === this.taskId)
      const sourceColumns = findOne.source?.columns || []
      const targetColumns = findOne.target?.columns || []
      data.map(item => {
        let source = item.source || {}
        let target = item.target || {}
        let sourceKeys = Object.keys(source)
        let targetKeys = Object.keys(target)
        let key = Array.from(new Set([...sourceKeys, ...targetKeys])) //找出所有的key的并集
        let message = item.message || ''
        let diffFields = []
        let diffFiledIndexs = []
        if (message.includes('Different fields')) {
          diffFields = message.split(':')[1].split(',')
        } else if (message.includes('Different index')) {
          diffFiledIndexs = message.split(':')[1].split(',')
        }
        if (diffFiledIndexs.length) {
          this.handleLoadIndexField(item, diffFiledIndexs, sourceColumns, targetColumns)
        } else {
          key.forEach(i => {
            let sourceValue = ''
            let targetValue = ''
            if (sourceKeys.filter(v => i === v)) {
              sourceValue = source[i]
            } else {
              sourceValue = ''
            }
            if (targetKeys.filter(v => i === v)) {
              targetValue = target[i]
            } else {
              targetValue = ''
            }
            let isDiff = diffFields.length ? diffFields.includes(i) : sourceValue !== targetValue
            let node = {
              type: item.type,
              red: isDiff,
              source: {
                key: i,
                value: sourceValue
              },
              target: {
                key: i,
                value: targetValue
              }
            }
            item['details'] = item['details'] || []
            item['details'].push(node)
          })
        }
      })
      return data
    },
    toDiffHistory() {
      let url = ''
      let route = this.$router.resolve({
        name: 'VerifyDiffHistory',
        params: {
          id: this.resultInfo.firstCheckId,
          inspectId: this.resultInfo.inspect_id
        }
      })
      url = route.href
      window.open(url, '_blank')
    },

    async downloadDetails() {
      this.downloading = true

      const blobData = await inspectDetailsApi.export(this.resultInfo.id).finally(() => {
        this.downloading = false
      })

      if (blobData.data.type === 'application/json') {
        this.$message.error(this.$t('packages_business_connections_test_xiazaishibai'))
        return
      }

      downloadBlob(blobData)
    },

    handleLoadIndexField(item, indexArr, sourceColumns, targetColumns) {
      sourceColumns.forEach((el, i) => {
        let node = {
          type: item.type,
          red: indexArr.includes(i + ''),
          source: {
            key: el,
            value: item.source[el]
          },
          target: {
            key: targetColumns[i],
            value: item.target[targetColumns[i]]
          }
        }
        item['details'] = item['details'] || []
        item['details'].push(node)
      })
    }
  }
}
