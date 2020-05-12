import enLocale from 'element-ui/lib/locale/lang/en';

const en = {
	...enLocale,
	message: {
		api: {
			get: {
				error: 'Load data failed.'
			}
		},
		exists_name: 'Name already exists',
		search: 'search',
		serviceCluMange: 'Service cluster management',
		statusLog: 'Status log',
		sourchName: 'Name',
		placeholderServer: 'Please enter a server name',
		filter: 'Filter',
		addServerMon: 'add server monitoring',
		startUp: 'start up',
		close: 'close',
		manageSys: 'manage system',
		restart: 'restart',
		syncGover: 'Syn gover',
		screen: 'Screen',
		delete: 'delete',
		cancle: 'cancle',
		cancel: 'Cancel',
		confirm: 'confirm',
		placeholderMonServer: 'Please enter the monitored service name',
		placeholderCommand: 'Please enter command',
		nullContent: 'Can not be empty',
		saveOK: 'Saved successfully',
		saveFail: 'Save failed',
		copyFail: 'Copy failed',
		copySuccess: 'Copy successfully',
		deleteOK: 'successfully deleted',
		deleteFail: 'failed to delete',
		selectTime: 'Select time',
		selectDate: 'Select date',
		server: 'server',
		serviceType: 'Service type',
		level: 'level',
		placeholderSelect: 'Please select',
		time: 'time',
		hostName: 'host name',
		ipAddress: 'ip address',
		uniqueEncode: 'unique encoding',
		logs: 'log',
		closeSever: 'close service',
		restartServer: 'restart service',
		deleteOrNot: 'delete or not',
		startupAfter_delete: 'Please delete after startup',
		startupAfter_add: 'Please add after startup',
		noData: 'NO DATA ',
		prompt: 'Prompt',
		resetMessage: 'This operation will reset the task state, will it reset?',
		deteleMessage: 'This operation will delete the task, will it delete it?',
		cancleReset: 'cancel reset',
		resetOk: 'Reset success',
		resetFailed: 'Reset Failed',
		operator: 'Operator',
    edit: 'edit'
	},
	dataFlow: {
    loadingError: 'Loading failed, please',
    dataLoading: 'Data is hard to load ...',
    loadLogTip: 'Run log is trying to load, it may take 5 ~ 10 seconds, please wait ...',
    noLogTip: 'No data',
    clickLoadTxt: 'Click to load',
		average: 'Average',
		current: 'Current',
		allNode: 'All Nodes',
		taskName: 'Flow Name',
		creatdor: 'Creator',
		creationTime: 'Create Time',
		state: 'State',
		executionTime: 'Lapsed Time',
		inputNumber: 'Input Total',
		outputNumber: 'Output Total',
		rowCount: 'Records',
		inputOutput: 'Throughput',
		transf: 'Transmission Time',
		dataScreening: 'Data Screening',
		second: "SEC",
		min: "MIN",
		hour: "HOUR",
		day: "DAY",
		input: 'Input',
		output: 'Output',
		totalInput: 'Total Input',
		totalOutput: 'Total Output',
		replicate: "Replicate Lag",
		throughputpop: 'The read speed from source node and the write speed to the target node, larger number is better',
		transtime_pop: 'The time lapsed from the data record is read from the source node until the data is written into target node',
		replicate_pop: 'The time gap between source node last update time and target node last update time',
		status: {
			running: 'Running',
			paused: 'Paused',
			draft: 'Draft',
			scheduled: 'Scheduled',
			stopping: 'Stopping',
			error: 'Error',
			force_stopping: 'Force Stopping',
		},
		searchPlaceholder: 'Task Name / Node Name / Library Table Name',
		dataRange: 'date range',
		startTime: 'Start time',
		endTime: 'End time',
		separator: "to",
		dataPlaceholder: "Select time range",
		taskStatus: 'Status',
		taskStatusPlaceholder: 'Please select a task status',
		updateTime: 'Update time',
		runningSpeed: 'Switch',
		operate: 'Operation',
		dataMap: 'Data Map',
		edit: 'Edit',
		copy: 'Copy',
		reset: 'Reset',
		detail: 'Running detail',
		select_source_connection: 'Source-side connection',
		select_sync_mode: 'Sync Mode',
		mapping: 'Association',
		select_target_connection: 'Target connection',
		sync_mode: 'Sync Mode',
		sync_type: 'Sync type',
		initial_sync: 'INITIAL SYNC',
		cdc: ' CDC ',
		send_email: 'Send Email',
		stopped: 'task stopped',
		error: 'task error',
		edited: 'task edited',
		started: 'task started',
		drop_target_before_start: 'Whether the target table is deleted before starting the task',
		run_custom_sql: 'Run custom SQL repeatedly',
		stop_on_error: 'Stop synchronization when an error is encountered',
		need_to_create_Index: 'Create target index automatically',
		is_schedule: 'Scheduled tasks regularly',
		cron_expression: 'Scheduling cron expression',
		data_quality_tag: 'Add data quality tag',
		notification_lag: 'Notification',
		isOpenAutoDDL: 'Automatically handle DDL operations',
		send_email_when_replication: 'Resend in a few seconds',
		send_email_at_most_one_replication: 'Cancel sending in more than seconds',
		read_cdc_interval: 'Incremental synchronization interval (ms)',
		read_batch_size: 'How many reads each time',
		mission: 'Description',
		yes: 'yes',
    no: 'no',
    selectGrpupFiled: 'Please select a grouping field',
    selectTargetField: 'Please select the target field',
    aggName: 'Sub-process name',
		nodeName: 'Node Name',
		aggFunction: 'Polymerization',
		aggExpression: 'Target',
		filterPredicate: 'Filter Predicate',
		groupByExpression: 'Group Field',
    aggregation: 'Aggregation',
    enterFilterTable: 'Please enter the filter table content',
    nameTip: 'Script editing of subsequent nodes needs to refer to the name of this sub-process for the specified data processing, so different sub-process names cannot be repeated. ',
		button: {
			setting: 'Setting',
			logs: 'Logs',
      preview: 'Data Trace',
      capture: 'Data Trace',
      stop_capture: 'Stop Trace',
			start: 'Start',
			stop: 'Stop',
			force_stop: 'Force Stop',
			reset: 'Reset',
			save: 'Save',
			reloadSchema:'reloadSchema'
		},
		save_before_running: 'Please save the task before running',
		reset_job: {
			msg: 'Reset Job?',
			tip: 'Tip',
		},
		stop_job: {
			msg: 'Stop jobs?',
			force_stop_msg: 'Force Stop jobs?',
			tip: 'Tip'
		},
    file_preview_fields: {
      file_name: "File Name",
      file_size_ondisk: "File Size(Byte)",
      file_modify_time_ondisk: "File Modify Time",
      file_create_time_ondisk: "File Create Time",
      file_path: "File Path"
    }
	},
	connection: {
		status: {
			testing: 'Testing',
			invalid: 'Invalid',
			ready: 'Ready',
		}
	},
	editor: {
		nodeSettings: "Node settings",
		choose: 'Select',
		newTxt: 'New',
		cell: {
			validate: {
				empty_name: 'Name is required.',

				none_setting: 'Settings cannot be none.',
				none_stage: 'Must have one stage.',
				none_data_node: 'At least 2 data node in graph',
				none_link_node: 'At least 1 link in graph',
				start_with_data_node: 'Must start with a data node',
				acyclic: 'The graph cannot have cyclic'
			},
			data_node: {
				database: {
					name: 'Database',
					tip: 'Any Database',
					defaultText: 'Database',

					none_database: 'Database is required.',
					tableSuffix: 'Please enter table suffix',
					tablePrefix: 'Please enter table prefix',
					form: {
						placeholder: 'Please select database',
						label: 'Database'
          },
          remove: 'Remove',
          Undo: 'Undo',
          bulkRemoval: 'Select All',
          bulkRevocation: 'Bulk revocation',
          queueCopied: 'Queue to be copied',
          tableRemoved: 'Table removed',
          enterName: 'Please enter the name / field name to search'
				},
				collection: {
					name: 'Collection',
					tip: 'MongoDB Collection',
					defaultText: 'Collection',

					none_database: 'Database is required.',
					none_collection: 'Collection is required.',
					none_pk: 'Primary key is required.',

					form: {
						database: {
							label: 'Database',
							placeholder: 'Please select MongoDB database'
						},
						collection: {
							label: 'Collection',
							placeholder: 'Please select collection'
						},
						pk: {
							label: 'Primary key',
							placeholder: 'Please enter primary key'
						},
						dropTable: {
							label: 'Existing data',
							placeholder: '',
							keep: 'Keep existing data',
							remove: 'Remove exists data at before sync'
						},
						filter: {
							label: 'Filter',
							placeholder: 'Mongo Query Filter Document',
							invalidJSON: 'Invalid JSON'
						}
					}
				},
				table: {
					name: 'Table',
					tip: 'RDBMS Table',
					defaultText: 'Table',

					none_database: 'Database is required.',
					none_table: 'Table is required.',
					none_pk: 'Primary key is required.',

					form: {
						database: {
							label: 'Database',
							placeholder: 'Please select RDBMS database'
						},
						table: {
							label: 'Table',
							placeholder: 'Please select table'
						},
						custom_sql: {
							label: 'Custom SQL',
							placeholder: 'Please input you custom sql'
						}
					}
				},
				file: {
					name: 'File',
					tip: 'File node',
					none_fileName: 'The file name cannot be empty',
					configurationFile: 'Configuration file',
					chooseFileName: 'Please select a file name'
				},
				gridfs: {
					name: 'GridFS',
					tip: 'GridFS node',
					chooseGridFsName: 'Please select GridFS',
          none_collection: 'Collection is required.',
          none_pk: 'Primary key is required.',
          gridFs_isNull: 'GridFS cannot be empty'
				},
				dummy: {
					name: 'Dummy',
					tip: 'Dummy node',
					chooseDummyName: 'Please select Dummy',
          none_collection: 'Collection is required.',
          none_pk: 'Primary key is required.',
					dummy_isNull: 'Dummy cannot be empty'
				},
				api: {
					name: 'API',
					tip: 'api node',
					chooseApiName: 'Please select API',
          none_collection: 'Collection is required.',
          none_pk: 'Primary key is required.',
					api_isNull: 'API cannot be empty'
				},
				es: {
					name: 'ES',
					tip: 'Elastic search node',
					configurationES: 'Configure Elastic search',
					chooseESName: 'Please select Elastic search',
					es_isNull: 'Elastic search cannot be empty'
        },
        custom: {
					tip: 'Custom node',
					name: 'Custom',
					none_fileName: 'Custom cannot be empty',
					chooseCustomName: 'Please select Custom'
				},
			},
			processor: {
				aggregate: {
					name: 'Aggregate',
					tip: 'Aggregate processor',
					defaultText: 'Aggregate',
					none_function: 'Aggregate function is required.',
          none_group: 'Group expression is required.',
          none_name: 'Sub-process name is required',
					none_aggregation_expression: 'Target field is required.',
					new_aggregate: 'Add new aggregate',
					none_stage: 'Must have one aggregate',
				},
				field: {
					name: 'Field',
					tip: 'Field processor',
					defaultText: 'Field processor',

					form: {
						name: {
							label: 'Node name',
							placeholder: 'Please input you node name'
						},
						description: {
							label: 'Description',
							placeholder: 'Please input you node description'
						},
						fieldName: 'Field name',
						fieldType: 'Field type',
						addField: 'Add Field',
						addEmbedField: 'Add Embed Field',
						scriptDialogTitle: 'Set Script',
					}
				},
				script: {
					name: 'JavaScript',
					tip: 'Script processor',
					defaultText: 'Script processor',

					none_script_type: 'Script type is required.',
					none_script: 'Script is required.',

					form: {
						name: {
							label: 'Node name',
							placeholder: '请输入节点名称'
						},
						type: {
							label: 'Script Type',
							placeholder: 'Please select script type'
						},
						script: {
							label: 'Script',
							placeholder: 'Please input script'
						},
					}
				},
				dataFilter: {
					name: 'Row Filter',
					tip: 'Row Data Filter',
					validate: {
						none_expression: 'Conditional expression cannot be empty',
						none_action: 'The execution action cannot be empty',
					},
					form: {
						name: {
							label: 'Node name',
							placeholder: 'Please enter the node name'
						},
						expression: {
							label: 'Conditional expression',
							placeholder: 'Please enter an expression',
							labelTip: 'Expressions can use comparison and calculation operators in JavaScript'
						},
						action: {
							label: 'Execute action',
							discard: 'Discard',
							retain: 'Retain'
						},
						expressionExample: {
							label: 'Example expression',
							labelTip: 'Expressions can use comparison and calculation operators in JavaScript',
							tip: 'Select men over 50 years old and people over 30 years old with income below 10,000, the expression is as follows:'
						},
						symbol: {
							label: 'Supported symbols',
							gtLt: 'Greater than, less than',
							geLe: 'Greater than and equal to, less than and equal to',
							eq: 'equal to',
							not: 'NO',
							and: 'And',
							or: 'Or',
							regexp: 'Regular expression',
							group: 'Conditional grouping'
						}
					}
				},
			},
			link: {
				none_join_type: 'JoinType is required',
				none_join_key: 'JoinKeys is required',
				none_join_path: 'JoinPath is required',
				form: {
					label: {
						label: 'Label',
						placeholder: 'Please input label'
					},
					joinType: {
						label: 'Data write model',
						placeholder: 'Please select Data Write model'
					},
					joinPath: {
						label: 'Target Path',
						placeholder: 'Please input target path'
					},
					joinKeys: {
						label: 'Association condition',
						sourceField: 'Source Field',
						targetField: 'Target Field',
					},
				},

				writeMode: {
					append: 'Append into Target',
					upsert: 'Match and Merge or Insert New',
					update: 'Match and Merge',
					merge_embed: 'Match then Embed as Array in target',
				}
			}
		},
		ui: {
			sidebar: {
				setting: 'Data Flow Settings',
				node_setting: 'Node Settings',
				logs: 'Logs',
				capture: 'Capture',
				style: 'Style',

				data_nodes: 'Data Nodes',
				processor: 'Processor',
			},
			toolbar: {
				undo: {
					tip: 'Undo'
				},
				redo: {
					tip: 'Redo'
				},
				clear_paper: {
					tip: 'Clear Paper'
				},
				export_svg: {
					tip: 'Open as SVG in a pop-up'
				},
				export_png: {
					tip: 'Open as SVG in a pop-up'
				},
				print: {
					tip: 'Open a Print Dialog'
				},
				to_back: {
					tip: 'Send Object to Back'
				},
				to_front: {
					tip: 'Bring Object to Front'
				},
				layout: {
					tip: 'Auto-layout Graph'
				},
				zoom_to_fit: {
					tip: 'Zoom To Fit'
				},
				zoom_out: {
					tip: 'Zoom Out'
				},
				zoom_in: {
					tip: 'Zoom In'
				},
				grid_size: {
					tip: 'Change Grid Size'
				},
				fullscreen: {
					tip: 'Toggle Fullscreen Mode'
				}
			},
		},
		preview: {
			stage: 'Stage',
			table: 'Table'
		}
	},
	dataVerify: {
		row: "row verify",
		hash: 'hash verify',
		advance: 'advance verify',
		dataVerify: 'data verify',
		dataWay: 'data way',
		range: "range",
		source: 'source',
		target: 'target',
		operate: 'operate',
		dataVerifySetting: 'data verify Setting',
		confirm: 'confirm',
		start: 'start',
		back: 'back',
		add: 'add',
		refresh: 'refresh',
		cancel: 'cancel',
		overView: 'overView',
		time: 'time',
		duration: 'duration',
		result: 'result',
		linageDifference: 'linage difference',
		errorTotal: 'error Total',
		accuracyRate: 'accuracy Rate',
		errorComparison: 'error Comparison',
		again: 'Check again',
		rows: 'Check by number of rows',
		sampleRate: 'By percentage',
		condition: 'Check condition',
	}
};

export default en;
