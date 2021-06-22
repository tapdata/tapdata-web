export default function (vm) {
  return {
    form: {
      labelPosition: 'right',
      labelWidth: '200px'
    },
    defaultModel: {
      connection_type: 'target'
    },
    items: [
      {
        type: 'radio',
        field: 'sync_type',
        label: '同步类型',
        options: [
          {
            label: '全量 + 增量同步',
            tip: '选择全量+增量同步模式，任务会在全量同步执行结束后自动进入增量同步状态。',
            value: 'initial_sync+cdc'
          },
          {
            label: '全量同步',
            tip: '全量同步也称初始化同步，即在任务启动时刻将源端数据快照读取，并同步至目标端；该同步有更新写入、删除重写两种模式。',
            value: 'initial_sync'
          },
          {
            label: '增量同步',
            tip: '增量同步是指从任务启动时刻对存储的源端变化的日志进行采集和分析，有序的将数据变化同步至目标端，支持增删改操作。',
            value: 'cdc'
          }
        ],
        required: true
      },
      {
        type: 'radio',
        field: 'distinctWriteType',
        label: '全量写入模式',
        options: [
          {
            label: '更新写入模式',
            tip: '更新写入模式会判断源端的每条数据在目标端是否存在，若存在则更新，不存在则新增。',
            value: 'intellect'
          },
          {
            label: '删除重写模式',
            tip: '删除重写模式会先将目标表的数据清空，再将源端数据全部同步至目标端，能保证源端和目标端的数据完全一致。',
            value: 'compel'
          }
        ],
        required: true
      },
      {
        type: 'input',
        field: 'readBatchSize',
        label: '每次读取数量',
        required: true,
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!value) {
                callback(new Error('每次读取数量不能为空，默认是1000'))
              } else if (!/^\d+$/.test(value)) {
                callback(new Error('每次读取数量只能为数字'))
              } else {
                callback()
              }
            }
          }
        ]
      },
      {
        type: 'switch',
        field: 'stopOnError',
        label: '遇到错误停止'
      },
      {
        type: 'switch',
        field: 'isOpenAutoDDL',
        label: '自动DDL',
        show: true
      },
      {
        type: 'switch',
        field: 'bidirectional',
        label: '是否双向',
        show: false
      },
      {
        type: 'slot',
        slot: 'needToCreateIndex'
      }
      // {
      //   type: 'slot',
      //   slot: 'syncPoints',
      //   label: '增量采集开始时刻'
      // }
    ]
  }
}
