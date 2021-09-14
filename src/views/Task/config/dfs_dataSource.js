export default function () {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '100px',
      itemStyle: {
        // 'padding-bottom': '32px',
        // 'box-sizing': 'border-box'
      },
      size: 'small'
    },
    items: [
      {
        type: 'select',
        field: 'source_databaseType',
        label: '源端类型',
        labelColon: true,
        options: [],
        required: true
      },
      {
        type: 'select',
        field: 'source_connectionId',
        label: '源端连接',
        labelColon: true,
        loading: false,
        options: [],
        required: true
      },
      {
        type: 'select',
        field: 'target_databaseType',
        label: '目标端类型',
        labelColon: true,
        options: [],
        required: true
      },
      {
        type: 'select',
        field: 'target_connectionId',
        label: '目标端连接',
        labelColon: true,
        loading: false,
        options: [],
        required: true
      }
    ]
  }
}
