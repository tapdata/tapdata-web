export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '160px'
    },
    defaultModel: {
      connection_type: 'source',
      file_upload_mode: 'stream',
      overwriteSetting: 'discard',
      file_source_protocol: 'localFile',
      vc_mode: 'overwrite',
      ftp_passive: true,
      fileDefaultCharset: 'UTF8'
    },
    items: [
      {
        type: 'radio',
        field: 'connection_type',
        label: vm.$t('connection_form_connection_type'),
        options: [
          // {
          // 	label: vm.$t('connection_form_source_and_target'),
          // 	tip: vm.$t('connection_form_source_and_target_tip'),
          // 	value: 'source_and_target'
          // },
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
        required: true,
        isVertical: false,
        button: true,
        outerTip: true,
        customClass: 'large-item'
      },
      {
        type: 'radio',
        field: 'file_source_protocol',
        label: vm.$t('dataForm.form.file.agreementType'),
        options: [
          {
            label: vm.$t('dataForm.form.file.agentLocationFile'),
            tip: vm.$t('dataForm.form.file.agentLocationFileTip'),
            value: 'localFile'
          },
          {
            label: 'FTP',
            tip: vm.$t('dataForm.form.file.ftpTip'),
            value: 'ftp'
          },
          {
            label: vm.$t('dataForm.form.file.shared'),
            tip: vm.$t('dataForm.form.file.sharedTip'),
            value: 'smb'
          }
        ],
        required: true,
        isVertical: false,
        button: true,
        outerTip: true,
        customClass: 'large-item'
      },
      {
        type: 'select',
        field: 'fileDefaultCharset',
        label: vm.$t('dataForm.form.file.encodingFormat'),
        options: [
          { label: 'UTF8', value: 'UTF8' },
          { label: 'GBK', value: 'GBK' },
          { label: 'UTF16', value: 'UTF16' },
          { label: 'ASCII', value: 'ASCII' }
        ],
        show: true
      },
      {
        type: 'input',
        field: 'database_host',
        label: vm.$t('dataForm.form.file.fileAddr'),
        required: true,
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'file_source_protocol',
                value: 'ftp'
              }
            ],
            triggerConfig: {
              show: true
            }
          },
          {
            triggerOptions: [
              {
                field: 'file_source_protocol',
                value: 'smb'
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
        field: 'database_port',
        label: vm.$t('dataForm.form.file.filePort'),
        required: true,
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'file_source_protocol',
                value: 'ftp'
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
        field: 'database_username',
        label: vm.$t('dataForm.form.file.creatAccount'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'file_source_protocol',
                value: 'ftp'
              }
            ],
            triggerConfig: {
              show: true
            }
          },
          {
            triggerOptions: [
              {
                field: 'file_source_protocol',
                value: 'smb'
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
        field: 'plain_password',
        label: vm.$t('dataForm.form.file.password'),
        domType: 'password',
        showPassword: true,
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'file_source_protocol',
                value: 'ftp'
              }
            ],
            triggerConfig: {
              show: true
            }
          },
          {
            triggerOptions: [
              {
                field: 'file_source_protocol',
                value: 'smb'
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ]
      },

      {
        type: 'radio',
        field: 'ftp_passive',
        label: vm.$t('dataForm.form.file.connectionMethod'),
        show: false,
        isVertical: false,
        button: true,
        outerTip: true,
        customClass: 'large-item',
        options: [
          {
            label: vm.$t('dataForm.form.file.activeConnectionMode'),
            tip: vm.$t('dataForm.form.file.activeConnectionModeTip'),
            value: false
          },
          {
            label: vm.$t('dataForm.form.file.passiveConnectionMode'),
            tip: vm.$t('dataForm.form.file.passiveConnectionModeTip'),
            value: true
          }
        ],
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'file_source_protocol',
                value: 'ftp'
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
        field: 'connection_timeout_seconds',
        label: vm.$t('dataForm.form.file.connecitonTimeout'),
        show: false,
        rules: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value || !/^\d+$/.test(value)) {
                callback(new Error(vm.$t('dataForm.form.file.input_number')))
              } else if (!value || !(parseInt(value) > 0 && parseInt(value) <= 5256000)) {
                callback(new Error(vm.$t('dataForm.form.file.greaterZero_less5256000')))
              } else {
                callback()
              }
            }
          }
        ],
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'file_source_protocol',
                value: 'ftp'
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
        field: 'data_timeout_seconds', // 传输超时时间
        label: vm.$t('dataForm.form.file.transmissionTimeout'),
        show: false,
        rules: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value || !/^\d+$/.test(value)) {
                callback(new Error(vm.$t('dataForm.form.file.input_number')))
              } else if (!value || !(parseInt(value) > 0 && parseInt(value) <= 5256000)) {
                callback(new Error(vm.$t('dataForm.form.file.greaterZero_less5256000')))
              } else {
                callback()
              }
            }
          }
        ],
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'file_source_protocol',
                value: 'ftp'
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
        field: 'vc_mode', // 版本管理
        label: vm.$t('dataForm.form.file.versionManagement'),
        show: false,
        options: [
          { label: 'Overwrite', value: 'overwrite' },
          { label: 'Increment Version', value: 'increment_version' }
        ],
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
      // 本地文件目标
      {
        type: 'input',
        field: 'file_upload_chunk_size', // 文件上传文件块大小
        label: vm.$t('dataForm.form.file.file_upload_chunk_size'),
        show: false,
        required: true,
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
        field: 'file_upload_mode', // 文件上传模式
        label: vm.$t('dataForm.form.file.file_upload_mode'),
        show: false,
        options: [
          {
            label: vm.$t('dataForm.form.file.file_upload_stream'),
            value: 'stream'
          },
          {
            label: vm.$t('dataForm.form.file.file_upload_memory'),
            value: 'memory'
          }
        ],
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
        field: 'overwriteSetting', // 当同名文件存在时
        label: vm.$t('dataForm.form.file.overwriteText'),
        show: false,
        options: [
          { label: vm.$t('dataForm.form.file.overwrite'), value: 'overwrite' },
          { label: vm.$t('dataForm.form.file.discard'), value: 'discard' }
        ],
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
        type: 'switch',
        field: 'extendSourcePath', // 继承目录结构
        label: vm.$t('dataForm.form.file.extend_source_path'),
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
        type: 'input',
        field: 'outputPath', // 文件输出绝对路径
        label: vm.$t('dataForm.form.file.file_output_path'),
        required: true,
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
        tips: vm.$t('connection_form_access_node_tip'),
        required: true
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
