import i18n from '@/i18n'
export default function () {
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
        type: 'select',
        field: 'region',
        label: i18n.t('task_instance_select_area'),
        options: [],
        loading: true,
        required: true
      },
      {
        type: 'select',
        field: 'zone',
        label: i18n.t('task_instance_choose_area'),
        loading: true,
        options: [],
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'region',
                value: ''
              }
            ],
            triggerConfig: {
              value: ''
            }
          }
        ],
        required: true
      }
    ]
  }
}
