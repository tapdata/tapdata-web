export default function(vm) {
  const fileChange = (file, field) => {
    if (file) {
      let reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => {
        let text = reader.result
        vm.model[field] = text
      }
    } else {
      vm.model[field] = ''
    }
  }
  return {
    form: {
      labelPosition: 'right',
      labelWidth: '200px'
    },
    defaultModel: {
      connection_type: 'source',
      isUrl: true,
      ssl: false,
      sslValidate: false
    },
    items: [
      {
        type: 'radio',
        field: 'connection_type',
        label: vm.t('dataForm.form.connectionType'),
        options: [
          {
            label: vm.t('dataForm.form.options.source'),
            tip: vm.t('dataForm.form.options.sourceTips'),
            value: 'source'
          },
          {
            label: vm.t('dataForm.form.options.target'),
            tip: vm.t('dataForm.form.options.targetTips'),
            value: 'target'
          }
        ],
        required: true
      },
      {
        type: 'input',
        field: 'database_host',

        label: vm.t('dataForm.form.host'),
        placeholder: vm.t('dataForm.form.databaseHostPlaceholder'),
        rules: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value || !value.trim()) {
                callback(new Error(vm.t('dataForm.error.noneHost')))
              } else {
                callback()
              }
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'database_name',
        label: vm.t('dataForm.form.databaseName'),
        required: true
      },
      {
        type: 'input',
        field: 'database_username',
        label: vm.t('dataForm.form.userName')
      },
      {
        type: 'input',
        field: 'plain_password',
        label: vm.t('dataForm.form.password'),
        domType: 'password',
        showPassword: true
      },
      {
        type: 'input',
        field: 'additionalString',
        label: vm.t('dataForm.form.additionalString')
      },
      {
        type: 'radio',
        field: 'ssl',
        label: vm.t('dataForm.form.ssl'),
        options: [
          {
            label: vm.t('dataForm.form.options.sslTSL'),
            tip: vm.t('dataForm.form.options.sslTSLTip'),
            value: true
          },
          {
            label: vm.t('dataForm.form.options.sslTop'),
            tip: vm.t('dataForm.form.options.sslTopTips'),
            value: false
          }
        ],
        influences: [
          {
            field: 'sslKeyFile',
            byValue: false,
            value: ''
          },
          {
            field: 'sslPass',
            byValue: true,
            value: ''
          }
        ]
      },
      {
        type: 'file',
        field: 'sslKeyFile',
        label: vm.t('dataForm.form.sslKey'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'ssl',
                value: true
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ],
        rules: [
          {
            required: true,
            validator: (rule, v, callback) => {
              let value = vm.model.sslKey
              let ssl = vm.model.ssl
              if (ssl && (!value || !value.trim())) {
                if (v) {
                  callback()
                }
                callback(new Error(vm.t('dataForm.error.noneSslKey')))
              } else {
                callback()
              }
            }
          }
        ],
        on: {
          change(file) {
            fileChange(file, 'sslKey')
          }
        }
      },
      {
        type: 'input',
        field: 'sslPass',
        label: vm.t('dataForm.form.sslPass'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'ssl',
                value: true
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ]
      },
      {
        type: 'switch',
        field: 'sslValidate',
        label: vm.t('dataForm.form.sslValidate'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'ssl',
                value: true
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ],
        influences: [
          {
            field: 'sslCAFile',
            byValue: false,
            value: ''
          }
        ]
      },
      {
        type: 'file',
        field: 'sslCAFile',
        label: vm.t('dataForm.form.sslCA'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'ssl',
                value: true
              },
              {
                field: 'sslValidate',
                value: true
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ],
        rules: [
          {
            required: true,
            validator: (rule, v, callback) => {
              let ssl = vm.model.sslValidate
              if (ssl && !v) {
                callback(new Error(vm.t('dataForm.error.noneSslCA')))
              } else {
                callback()
              }
            }
          }
        ],
        on: {
          change(file) {
            fileChange(file, 'sslCA')
          }
        }
      },
      {
        type: 'input',
        field: 'prefix',
        label: vm.t('dataForm.form.gridfs.gridfs_prefix')
      },
      {
        type: 'select',
        field: 'gridfsReadMode',
        label: vm.t('dataForm.form.gridfs.gridfs_prefix'),
        options: [
          {
            label: vm.t('dataForm.form.gridfs.gridfs_data'),
            value: 'data'
          },
          {
            label: vm.t('dataForm.form.gridfs.gridfs_binary'),
            value: 'binary'
          }
        ],
        required: true,
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'connection_type',
                value: 'source'
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ],
        influences: [
          {
            field: 'seperate',
            byValue: true,
            value: ''
          },
          {
            field: 'json_type',
            byValue: true,
            value: ''
          },
          {
            field: 'data_content_xpath',
            byValue: true,
            value: ''
          }
        ]
      },
      {
        type: 'input',
        field: 'include_filename',
        label: vm.t('dataForm.form.gridfs.include_filename'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'connection_type',
                value: 'source'
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'exclude_filename',
        label: vm.t('dataForm.form.gridfs.exclude_filename'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'connection_type',
                value: 'source'
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'file_schema',
        label: vm.t('dataForm.form.gridfs.file_schema'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'gridfsReadMode',
                value: 'data'
              },
              {
                field: 'connection_type',
                value: 'source'
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ]
      },
      {
        type: 'select',
        field: 'file_type',
        label: vm.t('dataForm.form.gridfs.file_type'),
        options: [
          {
            label: 'CSV/TXT',
            value: 'csv'
          },
          {
            label: 'Excel',
            value: 'excel'
          },
          {
            label: 'JSON',
            value: 'json'
          },
          {
            label: 'XML',
            value: 'xml'
          }
        ],
        required: true,
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'gridfsReadMode',
                value: 'data'
              },
              {
                field: 'connection_type',
                value: 'source'
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'seperate',
        label: vm.t('dataForm.form.gridfs.separator'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'file_type',
                value: 'csv'
              },
              {
                field: 'connection_type',
                value: 'source'
              },
              {
                field: 'gridfsReadMode',
                value: 'data'
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ]
      },
      {
        type: 'select',
        field: 'json_type',
        label: vm.t('dataForm.form.gridfs.json_type'),
        options: [
          {
            label: 'ArrayBegin',
            value: 'arraybegin'
          },
          {
            label: 'ObjectBegin',
            value: 'objectbegin'
          }
        ],
        required: true,
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'file_type',
                value: 'json'
              },
              {
                field: 'connection_type',
                value: 'source'
              },
              {
                field: 'gridfsReadMode',
                value: 'data'
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'data_content_xpath',
        label: vm.t('dataForm.form.gridfs.xpath') + '(/RootTag/Students/Student)*',
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'file_type',
                value: 'xml'
              },
              {
                field: 'connection_type',
                value: 'source'
              },
              {
                field: 'gridfsReadMode',
                value: 'data'
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'tags_filter',
        label: vm.t('dataForm.form.gridfs.gridfs_tag_filter') + '（tag1,tag2）',
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'connection_type',
                value: 'source'
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'tags_filter',
        label: vm.t('dataForm.form.gridfs.gridfs_upload_chunk_size'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'connection_type',
                value: 'target'
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ]
      },
      {
        type: 'select',
        field: 'file_upload_mode',
        label: vm.t('dataForm.form.gridfs.file_upload_mode'),
        options: [
          {
            label: vm.t('dataForm.form.gridfs.file_upload_stream'),
            value: 'stream'
          },
          {
            label: vm.t('dataForm.form.gridfs.file_upload_memory'),
            value: 'memory'
          }
        ],
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'connection_type',
                value: 'target'
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ]
      }
    ]
  }
}
