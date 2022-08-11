module.exports = {
  '/api/measurement/queryTransmitTotal': {
    data: {
      inputTotal: '@integer(0, 1000)',
      outputTotal: '@integer(0, 1000)',
      insertedTotal: '@integer(0, 1000)',
      updatedTotal: '@integer(0, 1000)',
      deletedTotal: '@integer(0, 1000)'
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/measurement/query/v2': {
    code: 'ok',
    msg: 'ok',
    data: {
      interval: 5000,
      'time|120': ['@integer(1659044028561, 1659944028561)'],
      samples: {
        totalData: [
          {
            inputInsertTotal: '@integer(0, 10000)',
            inputUpdateTotal: '@integer(0, 10000)',
            inputDeleteTotal: '@integer(0, 10000)',
            inputDdlTotal: '@integer(0, 10000)',
            inputOthersTotal: '@integer(0, 10000)',
            outputInsertTotal: '@integer(0, 10000)',
            outputUpdateTotal: '@integer(0, 10000)',
            outputDeleteTotal: '@integer(0, 10000)',
            outputDdlTotal: '@integer(0, 10000)',
            outputOthersTotal: '@integer(0, 10000)',
            tableTotal: '@integer(0, 10000)',
            createTableTotal: '@integer(0, 10000)',
            snapshotTableTotal: '@integer(0, 10000)',
            initialCompleteTime: 1657707577896, // 全量完成时间
            sourceConnection: 'sourceConnection', // 增量信息:源连接、目标连接、增量时间点
            targetConnection: 'targetConnection',
            snapshotDoneAt: 1657707577896,
            snapshotRowTotal: '@integer(0, 10000)',
            snapshotInsertRowTotal: '@integer(0, 10000)',
            outputQps: '@integer(0, 10000)'
          }
        ],
        barChartData: [
          {
            inputInsertTotal: '@integer(0, 10000)',
            inputUpdateTotal: '@integer(0, 10000)',
            inputDeleteTotal: '@integer(0, 10000)',
            inputDdlTotal: '@integer(0, 10000)',
            inputOthersTotal: '@integer(0, 10000)',
            outputInsertTotal: '@integer(0, 10000)',
            outputUpdateTotal: '@integer(0, 10000)',
            outputDeleteTotal: '@integer(0, 10000)',
            outputDdlTotal: '@integer(0, 10000)',
            outputOthersTotal: '@integer(0, 10000)'
          }
        ],
        lineChartData: [
          {
            'inputQps|120': ['@integer(0, 10000)'],
            'outputQps|120': ['@integer(0, 10000)'],
            'timeCostAvg|120': ['@integer(0, 10000)']
          }
        ],
        dagData: [
          {
            inputInsertTotal: '@integer(0, 10000)',
            inputUpdateTotal: '@integer(0, 10000)',
            inputDeleteTotal: '@integer(0, 10000)',
            inputDdlTotal: '@integer(0, 10000)',
            inputOthersTotal: '@integer(0, 10000)',
            outputInsertTotal: '@integer(0, 10000)',
            outputUpdateTotal: '@integer(0, 10000)',
            outputDeleteTotal: '@integer(0, 10000)',
            outputDdlTotal: '@integer(0, 10000)',
            outputOthersTotal: '@integer(0, 10000)',
            qps: '@integer(0, 10000)',
            timeCostAvg: '@integer(0, 10000)',
            currentEventTimestamp: '@integer(0, 10000)',
            tcpPing: '@integer(0, 10000)',
            connectPing: '@integer(0, 10000)',
            inputTotal: '@integer(0, 10000)',
            outputTotal: '@integer(0, 10000)',
            inputQps: '@integer(0, 10000)',
            outputQps: '@integer(0, 10000)',
            snapshotRowTotal: '@integer(0, 10000)',
            snapshotInsertRowTotal: '@integer(0, 10000)',
            tags: {
              nodeType: 'table_rename_processor',
              type: 'node',
              nodeId: '3a619752-50c5-4128-ac10-75a6fa14c672',
              subTaskId: '62e38b65290b4b01b05cec8b',
              taskId: '62e38b26290b4b01b05ce5cf'
            }
          },
          {
            insertTotal: '@integer(0, 10000)',
            updateTotal: '@integer(0, 10000)',
            deleteTotal: '@integer(0, 10000)',
            ddlTotal: '@integer(0, 10000)',
            othersTotal: '@integer(0, 10000)',
            qps: '@integer(0, 10000)',
            timeCostAvg: '@integer(0, 10000)',
            currentEventTimestamp: '@integer(0, 10000)',
            tcpPing: '@integer(0, 10000)',
            connectPing: '@integer(0, 10000)',
            inputTotal: '@integer(0, 10000)',
            outputTotal: '@integer(0, 10000)',
            inputQps: '@integer(0, 10000)',
            outputQps: '@integer(0, 10000)',
            tags: {
              nodeType: 'database',
              type: 'node',
              nodeId: '96f22ecc-6eb4-4f08-bc2a-2eab35ee9989',
              subTaskId: '62e38b65290b4b01b05cec8b',
              taskId: '62e38b26290b4b01b05ce5cf'
            }
          },
          {
            insertTotal: '@integer(0, 10000)',
            updateTotal: '@integer(0, 10000)',
            deleteTotal: '@integer(0, 10000)',
            ddlTotal: '@integer(0, 10000)',
            othersTotal: '@integer(0, 10000)',
            qps: '@integer(0, 10000)',
            timeCostAvg: '@integer(0, 10000)',
            currentEventTimestamp: '@integer(0, 10000)',
            tcpPing: '@integer(0, 10000)',
            connectPing: '@integer(0, 10000)',
            inputTotal: '@integer(0, 10000)',
            outputTotal: '@integer(0, 10000)',
            inputQps: '@integer(0, 10000)',
            outputQps: '@integer(0, 10000)',
            tags: {
              nodeType: 'database',
              type: 'node',
              nodeId: '439e6178-9f39-498b-8a4d-5c5d4f5b014c',
              subTaskId: '62e38b65290b4b01b05cec8b',
              taskId: '62e38b26290b4b01b05ce5cf'
            }
          }
        ]
      }
    }
  },
  '/api/measurement/batch': {
    reqId: 'b98b57c4-a37c-4a2a-b9f3-ed1de4b328d6',
    ts: 1659944327696,
    code: 'ok',
    data: {
      quota: {
        code: 'ok',
        data: {
          interval: 5000,
          'time|120': ['@integer(1659044028561, 1659944028561)'],
          samples: {
            totalData: [
              {
                inputInsertTotal: '@integer(0, 10000)',
                inputUpdateTotal: '@integer(0, 10000)',
                inputDeleteTotal: '@integer(0, 10000)',
                inputDdlTotal: '@integer(0, 10000)',
                inputOthersTotal: '@integer(0, 10000)',
                outputInsertTotal: '@integer(0, 10000)',
                outputUpdateTotal: '@integer(0, 10000)',
                outputDeleteTotal: '@integer(0, 10000)',
                outputDdlTotal: '@integer(0, 10000)',
                outputOthersTotal: '@integer(0, 10000)',
                tableTotal: '@integer(0, 10000)',
                createTableTotal: '@integer(0, 10000)',
                snapshotTableTotal: '@integer(0, 10000)',
                initialCompleteTime: 1657707577896, // 全量完成时间
                sourceConnection: 'sourceConnection', // 增量信息:源连接、目标连接、增量时间点
                targetConnection: 'targetConnection',
                snapshotDoneAt: 1657707577896,
                snapshotRowTotal: '@integer(0, 10000)',
                snapshotInsertRowTotal: '@integer(0, 10000)',
                outputQps: '@integer(0, 10000)'
              }
            ],
            barChartData: [
              {
                inputInsertTotal: '@integer(0, 10000)',
                inputUpdateTotal: '@integer(0, 10000)',
                inputDeleteTotal: '@integer(0, 10000)',
                inputDdlTotal: '@integer(0, 10000)',
                inputOthersTotal: '@integer(0, 10000)',
                outputInsertTotal: '@integer(0, 10000)',
                outputUpdateTotal: '@integer(0, 10000)',
                outputDeleteTotal: '@integer(0, 10000)',
                outputDdlTotal: '@integer(0, 10000)',
                outputOthersTotal: '@integer(0, 10000)'
              }
            ],
            lineChartData: [
              {
                'inputQps|120': ['@integer(0, 10000)'],
                'outputQps|120': ['@integer(0, 10000)'],
                'timeCostAvg|120': ['@integer(0, 10000)']
              }
            ],
            dagData: [
              {
                inputInsertTotal: '@integer(0, 10000)',
                inputUpdateTotal: '@integer(0, 10000)',
                inputDeleteTotal: '@integer(0, 10000)',
                inputDdlTotal: '@integer(0, 10000)',
                inputOthersTotal: '@integer(0, 10000)',
                outputInsertTotal: '@integer(0, 10000)',
                outputUpdateTotal: '@integer(0, 10000)',
                outputDeleteTotal: '@integer(0, 10000)',
                outputDdlTotal: '@integer(0, 10000)',
                outputOthersTotal: '@integer(0, 10000)',
                qps: '@integer(0, 10000)',
                timeCostAvg: '@integer(0, 10000)',
                currentEventTimestamp: '@integer(0, 10000)',
                tcpPing: '@integer(0, 10000)',
                connectPing: '@integer(0, 10000)',
                inputTotal: '@integer(0, 10000)',
                outputTotal: '@integer(0, 10000)',
                inputQps: '@integer(0, 10000)',
                outputQps: '@integer(0, 10000)',
                snapshotRowTotal: '@integer(0, 10000)',
                snapshotInsertRowTotal: '@integer(0, 10000)',
                tags: {
                  nodeType: 'table_rename_processor',
                  type: 'node',
                  nodeId: '3a619752-50c5-4128-ac10-75a6fa14c672',
                  subTaskId: '62e38b65290b4b01b05cec8b',
                  taskId: '62e38b26290b4b01b05ce5cf'
                }
              },
              {
                insertTotal: '@integer(0, 10000)',
                updateTotal: '@integer(0, 10000)',
                deleteTotal: '@integer(0, 10000)',
                ddlTotal: '@integer(0, 10000)',
                othersTotal: '@integer(0, 10000)',
                qps: '@integer(0, 10000)',
                timeCostAvg: '@integer(0, 10000)',
                currentEventTimestamp: '@integer(0, 10000)',
                tcpPing: '@integer(0, 10000)',
                connectPing: '@integer(0, 10000)',
                inputTotal: '@integer(0, 10000)',
                outputTotal: '@integer(0, 10000)',
                inputQps: '@integer(0, 10000)',
                outputQps: '@integer(0, 10000)',
                tags: {
                  nodeType: 'database',
                  type: 'node',
                  nodeId: '96f22ecc-6eb4-4f08-bc2a-2eab35ee9989',
                  subTaskId: '62e38b65290b4b01b05cec8b',
                  taskId: '62e38b26290b4b01b05ce5cf'
                }
              },
              {
                insertTotal: '@integer(0, 10000)',
                updateTotal: '@integer(0, 10000)',
                deleteTotal: '@integer(0, 10000)',
                ddlTotal: '@integer(0, 10000)',
                othersTotal: '@integer(0, 10000)',
                qps: '@integer(0, 10000)',
                timeCostAvg: '@integer(0, 10000)',
                currentEventTimestamp: '@integer(0, 10000)',
                tcpPing: '@integer(0, 10000)',
                connectPing: '@integer(0, 10000)',
                inputTotal: '@integer(0, 10000)',
                outputTotal: '@integer(0, 10000)',
                inputQps: '@integer(0, 10000)',
                outputQps: '@integer(0, 10000)',
                tags: {
                  nodeType: 'database',
                  type: 'node',
                  nodeId: '439e6178-9f39-498b-8a4d-5c5d4f5b014c',
                  subTaskId: '62e38b65290b4b01b05cec8b',
                  taskId: '62e38b26290b4b01b05ce5cf'
                }
              }
            ]
          }
        }
      },
      logs: {
        reqId: '93',
        ts: 95,
        code: 'ok',
        data: {
          total: '@integer(0, 100)',
          'items|20': [
            {
              id: '@id',
              logTags: ['fugiat sed do est'],
              errorStack: 'nisi id nostrud est',
              'message|20-100': 'ab cd',
              'level|1': ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'],
              timestamp: '@integer(1659044028561, 1659944028561)'
            }
          ]
        }
      }
    }
  },
  '/api/measurement/query': {
    data: {
      samples: [
        {
          'inputQps|20': ['@integer(0, 100)'],
          'outputQps|20': ['@integer(0, 100)'],
          'transmitionTime|20': ['@integer(100, 1000)'],
          'time|20': ['@time(yyyy-MM-dd HH:mm:ss)']
        },
        {
          replicateLag: ['@integer(0, 10)'],
          time: ['@time(yyyy-MM-dd HH:mm:ss)']
        },
        {
          'outputEvents|2': ['@integer(0, 1000)'], // 总输出
          'inputEvents|2': ['@integer(0, 1000)'], // 总输入
          'insertCount|2': ['@integer(0, 1000)'], // 总插入
          'updateCount|2': ['@integer(0, 1000)'], // 总更新
          'deleteCount|2': ['@integer(0, 1000)'] // 总删除
        }
      ],
      statistics: [
        {
          initialTime: '@time(yyyy-MM-dd HH:mm:ss)', //全量同步完成时间
          initialTotal: '@integer(0, 1000)', // 全量数量
          initialWrite: '@integer(0, 1000)', // 已完成数据
          cdcTime: '@time(yyyy-MM-dd HH:mm:ss)', // 增量时间点
          outputEvents: '@integer(0, 1000)', // 总输出
          inputEvents: '@integer(0, 1000)', // 总输入
          insertCount: '@integer(0, 1000)', // 总插入
          updateCount: '@integer(0, 1000)', // 总更新
          deleteCount: '@integer(0, 1000)' // 总删除
        }
      ]
    },
    code: 'ok',
    msg: 'ok'
  }
}
