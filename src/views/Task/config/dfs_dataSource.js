export default function () {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '100px',
      labelColon: true,
      size: 'small'
    },
    items: [
      {
        type: 'select',
        field: 'source_filter_databaseType',
        label: '源端类型',
        options: [],
        required: true
      },
      {
        type: 'select',
        field: 'source_connectionId',
        label: '源端连接',
        loading: false,
        filterable: true,
        options: [],
        required: true
      },
      {
        type: 'select',
        field: 'target_filter_databaseType',
        label: '目标端类型',
        options: [],
        required: true
      },
      {
        type: 'select',
        field: 'target_connectionId',
        label: '目标端连接',
        loading: false,
        filterable: true,
        options: [],
        required: true
      }
    ]
  }
}
