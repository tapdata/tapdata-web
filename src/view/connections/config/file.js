export default function(vm) {
	return {
		form: {
			labelPosition: 'right',
			labelWidth: '200px'
		},
		defaultModel: {
			connection_type: 'source_and_target',
			file_source_protocol: 'localFile',
			ftp_passive: true,
			fileDefaultCharset: 'UTF8'
		},
		items: [
			{
				type: 'radio',
				field: 'connection_type',
				label: vm.$t('dataForm.form.connectionType'),
				options: [
					{
						label: vm.$t('dataForm.form.options.sourceAndTarget'),
						tip: vm.$t('dataForm.form.options.sourceAndTargetTips'),
						value: 'source_and_target'
					},
					{
						label: vm.$t('dataForm.form.options.source'),
						tip: vm.$t('dataForm.form.options.sourceTips'),
						value: 'source'
					},
					{
						label: vm.$t('dataForm.form.options.target'),
						tip: vm.$t('dataForm.form.options.targetTips'),
						value: 'target'
					}
				],
				required: true
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
				required: true
			},
			{
				type: 'select',
				field: 'fileDefaultCharset',
				label: vm.$t('dataForm.form.file.encodingFormat'),
				//tips: vm.$t('dataForm.form.timeZoneTips'),
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
				field: 'database_username',
				label: vm.$t('dataForm.form.file.creatAccount'),
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
				field: 'database_password',
				label: vm.$t('dataForm.form.file.password'),
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
				type: 'radio',
				field: 'ftp_passive',
				label: vm.$t('dataForm.form.file.connectionMethod'),
				required: true,
				show: false,
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
								callback(new Error(vm.$t('dataForm.form.file.input_number')));
							} else if (!value || !(parseInt(value) > 0 && parseInt(value) <= 5256000)) {
								callback(new Error(vm.$t('dataForm.form.file.greaterZero_less5256000')));
							} else {
								callback();
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
				field: 'data_timeout_seconds',
				label: vm.$t('dataForm.form.file.transmissionTimeout'),
				show: false,
				rules: [
					{
						required: true,
						validator: (rule, value, callback) => {
							if (!value || !/^\d+$/.test(value)) {
								callback(new Error(vm.$t('dataForm.form.file.input_number')));
							} else if (!value || !(parseInt(value) > 0 && parseInt(value) <= 5256000)) {
								callback(new Error(vm.$t('dataForm.form.file.greaterZero_less5256000')));
							} else {
								callback();
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
				type: 'slot',
				slot: 'fileUrl'
			}
		]
	};
}
