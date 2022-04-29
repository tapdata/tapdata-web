export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '160px'
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
        label: vm.$t('connection_form_connection_type'),
        options: [
          {
            label: vm.$t('connection_form_source'),
            tip: vm.$t('connection_form_source_tip'),
            value: 'source'
          },
          {
            label: vm.$t('connection_form_target'),
            tip: vm.$t('connection_form_target_tip'),
            value: 'target'
          }
        ],
        require: true,
        isVertical: false,
        button: true,
        outerTip: true,
        customClass: 'large-item'
      },
      {
        type: 'input',
        field: 'database_uri',
        label: vm.$t('dataForm.form.databaseUri'),
        domType: 'textarea',
        required: true,
        show: true
      },
      {
        type: 'radio',
        field: 'ssl',
        label: vm.$t('dataForm.form.ssl'),
        options: [
          {
            label: vm.$t('dataForm.form.options.sslTSL'),
            tip: vm.$t('dataForm.form.options.sslTSLTip'),
            value: true
          },
          {
            label: vm.$t('dataForm.form.options.sslTop'),
            tip: vm.$t('dataForm.form.options.sslTopTips'),
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
        ],
        isVertical: false,
        button: true,
        outerTip: true,
        customClass: 'large-item'
      },
      {
        type: 'file',
        field: 'sslKey',
        fileNameField: 'sslKeyFile',
        label: vm.$t('dataForm.form.sslKey'),
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
            validator: (rule, value, callback) => {
              let ssl = vm.model.ssl
              if (ssl && (!value || !value.trim())) {
                callback(new Error(vm.$t('dataForm.error.noneSslKey')))
              } else {
                callback()
              }
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'sslPass',
        label: vm.$t('dataForm.form.sslPass'),
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
        label: vm.$t('dataForm.form.sslValidate'),
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
        field: 'sslCA',
        fileNameField: 'sslCAFile',
        label: vm.$t('dataForm.form.sslCA'),
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
                callback(new Error(vm.$t('dataForm.error.noneSslCA')))
              } else {
                callback()
              }
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'prefix',
        label: vm.$t('dataForm.form.gridfs.gridfs_prefix')
      },
      {
        type: 'select',
        field: 'gridfsReadMode',
        label: vm.$t('dataForm.form.gridfs.gridfs_mode'),
        options: [
          {
            label: vm.$t('dataForm.form.gridfs.gridfs_data'),
            value: 'data'
          },
          {
            label: vm.$t('dataForm.form.gridfs.gridfs_binary'),
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
        label: vm.$t('dataForm.form.gridfs.include_filename'),
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
        label: vm.$t('dataForm.form.gridfs.exclude_filename'),
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
        label: vm.$t('dataForm.form.gridfs.file_schema'),
        tip: vm.$t('connection_form_hana_file_schema_tip'),
        show: false,
        required: true,
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
        label: vm.$t('dataForm.form.gridfs.file_type'),
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
        label: vm.$t('dataForm.form.gridfs.separator'),
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
        label: vm.$t('dataForm.form.gridfs.json_type'),
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
        label: vm.$t('dataForm.form.gridfs.xpath') + '(/RootTag/Students/Student)*',
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
        label: vm.$t('dataForm.form.gridfs.gridfs_tag_filter') + '（tag1,tag2）',
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
        label: vm.$t('dataForm.form.gridfs.gridfs_upload_chunk_size'),
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
        label: vm.$t('dataForm.form.gridfs.file_upload_mode'),
        options: [
          {
            label: vm.$t('dataForm.form.gridfs.file_upload_stream'),
            value: 'stream'
          },
          {
            label: vm.$t('dataForm.form.gridfs.file_upload_memory'),
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
      },
      {
        type: 'select',
        field: 'accessNodeType',
        label: vm.$t('connection_form_access_node'),
        clearable: false,
        options: [
          {
            label: vm.$t('connection_form_automatic'),
            value: 'AUTOMATIC_PLATFORM_ALLOCATION'
          },
          {
            label: vm.$t('connection_form_manual'),
            value: 'MANUALLY_SPECIFIED_BY_THE_USER'
          }
        ],
        tips: vm.$t('connection_form_access_node_tip')
      },
      {
        type: 'slot',
        slot: 'accessNodeProcessId',
        show: false,
        filterable: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'accessNodeType',
                value: 'MANUALLY_SPECIFIED_BY_THE_USER'
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
