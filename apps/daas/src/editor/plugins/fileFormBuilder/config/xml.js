export default function (vm) {
  return {
    form: {
      labelPosition: 'top',
      labelWidth: '200px'
    },
    defaultModel: {
      connection_type: 'source_and_target',
      thin_type: 'SID',
      supportUpdatePk: false
    },
    items: [
      {
        type: 'select',
        field: 'fileFilter',
        label: vm.$t('editor.fileFormBuilder.fileFilter'),
        clearable: false,
        options: [
          {
            label: vm.$t('editor.fileFormBuilder.include'),
            value: 'include'
          },
          {
            label: vm.$t('editor.fileFormBuilder.exclude'),
            value: 'exclude'
          }
        ]
      },
      {
        type: 'input',
        field: 'include_filename',
        label: vm.$t('editor.fileFormBuilder.includeFilename'),
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'fileFilter',
                value: 'exclude'
              }
            ],
            triggerConfig: {
              show: false
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'exclude_filename',
        label: vm.$t('editor.fileFormBuilder.excludeFilename'),
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'fileFilter',
                value: 'include'
              }
            ],
            triggerConfig: {
              show: false
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'data_content_xpath',
        label: vm.$t('editor.fileFormBuilder.xpath'),
        required: true
      }
    ]
  }
}
