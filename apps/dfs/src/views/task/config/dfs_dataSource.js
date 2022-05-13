import i18n from '@/i18n'
export default function () {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '144px',
      labelColon: true,
      size: 'small'
    },
    items: [
      {
        type: 'select',
        field: 'source_filter_databaseType',
        label: i18n.t('task_form_source_type'),
        options: [],
        required: true
      },
      {
        type: 'select',
        field: 'source_connectionId',
        label: i18n.t('task_form_source_connection'),
        loading: false,
        filterable: true,
        options: [],
        required: true
      },
      {
        type: 'select',
        field: 'target_filter_databaseType',
        label: i18n.t('task_form_target_type'),
        loading: false,
        options: [],
        required: true
      },
      {
        type: 'select',
        field: 'target_connectionId',
        label: i18n.t('task_form_target_connection'),
        filterable: true,
        options: [],
        required: true
      }
    ]
  }
}
