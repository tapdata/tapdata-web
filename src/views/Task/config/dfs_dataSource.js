export default function () {
  return {
    form: {
      labelPosition: 'right',
      labelWidth: '200px'
    },
    items: [
      {
        type: 'slot',
        slot: 'source'
      },
      {
        type: 'select',
        field: 'source_databaseType',
        label: '源端类型',
        options: [],
        required: true
      },
      {
        type: 'select',
        field: 'source_connectionId',
        label: '源端连接',
        loading: false,
        options: [],
        required: true
      },
      {
        type: 'slot',
        slot: 'target'
      },
      {
        type: 'select',
        field: 'target_databaseType',
        label: '目标端类型',
        options: [],
        required: true
      },
      {
        type: 'select',
        field: 'target_connectionId',
        label: '目标端连接',
        loading: false,
        options: [],
        required: true
      }
    ]
  }
}
