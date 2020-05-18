import zhLocale from 'element-ui/lib/locale/lang/zh-CN';

const cn = {
	...zhLocale,
	message: {
		api: {
			get: {
				error: '加载数据失败.'
			}
		},
		exists_name: '名称已存在',
		search: '搜索',
		serviceCluMange: '服务集群管理',
		statusLog: '状态日志',
		sourchName: '名称搜索',
		placeholderServer: '请输入服务器名称',
		filter: '筛选',
		addServerMon: '添加服务监控',
		startUp: '启动',
		close: '关闭',
		manageSys: '管理后台',
		restart: '重启',
		syncGover: '同步治理',
		screen: '屏幕',
		delete: '删除',
		cancle: '取 消',
		cancel: '取 消',
		confirm: '确 定',
		placeholderMonServer: '请输入监控的服务名称',
		placeholderCommand: '请输入命令',
		nullContent: '不能为空',
		saveOK: '保存成功',
		saveFail: '保存失败',
		copyFail: '复制失败',
		copySuccess: '复制成功',
		deleteOK: '删除成功',
		deleteFail: '删除失败',
		selectTime: '选择时间',
		selectDate: '选择日期',
		server: '服务器',
		serviceType: '服务类型',
		level: '级别',
		placeholderSelect: '请选择',
		time: '时间',
		hostName: '主机名',
		ipAddress: 'ip地址',
		uniqueEncode: '唯一编码',
		logs: '日志信息',
		closeSever: '关闭服务',
		restartServer: '重启服务',
		deleteOrNot: "是否删除",
		startupAfter_delete: '请启动后删除',
		startupAfter_add: '请启动后添加',
		noData: '暂无数据',
		prompt: '提示',
		resetMessage: '此操作将重置该任务状态, 是否重置?',
		deteleMessage: '此操作将删除该任务, 是否删除?',
		cancleReset: '已取消重置',
		resetOk: '重置成功',
		resetFailed: '重置失败',
		operator: '操作',
    edit: '修改'
	},
	dataFlow: {
    loadingError: '加载失败,请',
    dataLoading: '数据努力加载中...',
    loadLogTip: '运行日志努力加载中，可能需要5~10秒，请稍等......',
    noLogTip: '没有数据',
    clickLoadTxt: '点击加载',
		average: '平均',
		current: '当前',
		allNode: '全部节点',
		taskName: '任务名称',
		creatdor: '创建人',
		creationTime: '创建时间',
		state: '状态',
		executionTime: '本次执行时间',
		inputNumber: '本次输入',
		outputNumber: '本次输出',
		rowCount: '条数',
		inputOutput: '输入输出统计',
		transf: '传输耗时',
		dataScreening: '数据总览',
		second: "秒",
		min: "分",
		hour: "时",
		day: "日",
		input: '输入',
		output: '输出',
		totalInput: '总输入',
		totalOutput: '总输出',
		replicate: "数据同步差距",
		throughputpop: '平均每秒源端数据采集的速度以及目标端写入的速度，数值越大越好',
		transtime_pop: '传输耗时:除源节点外，事件处理完的时间减去事件的发生时间。 节点间统计:事件从进入节点到输出到所消耗的时间 任务流统计:所有节点耗时相加，数值越小越好',
		replicate_pop: '源库和目标库数据最后更新时间的差距，数值越小越好',
		status: {
			running: '运行中',
			paused: '已暂停',
			draft: '草稿',
			scheduled: '调度中',
			stopping: '停止中',
			error: '错误',
			force_stopping: '强制停止',
		},
		searchPlaceholder: '任务名称/节点名/库表名',
		dataRange: '创建日期范围',
		startTime: '开始时间',
		endTime: '结束时间',
		separator: "至",
		dataPlaceholder: "选择时间范围",
		taskStatus: '启动开关',
		taskStatusPlaceholder: '请选择任务状态',
		updateTime: '更新时间',
		runningSpeed: '运行速度',
		operate: '操作',
		dataMap: '数据地图',
		edit: '编辑',
		copy: '复制',
		reset: '重置',
		detail: '任务监控',
		select_source_connection: '源端连接',
		select_sync_mode: '同步方式',
		mapping: '关联关系',
		select_target_connection: '目标端连接',
		sync_mode: '同步模式',
		sync_type: '同步类型',
		initial_sync: '初始化',
		cdc: '增量同步',
		send_email: '发送邮件',
		stopped: ' 当任务停止',
		error: '当任务出错',
		edited: '当任务被编辑',
		started: '当任务开启',
		drop_target_before_start: '开启任务前是否删除目标表',
		run_custom_sql: '重复运行自定义SQL',
		stop_on_error: '遇到错误时停止同步',
		need_to_create_Index: '自动创建目标索引',
		is_schedule: '定期调度任务',
		cron_expression: '调度cron表达式',
		data_quality_tag: '添加数据质量标签',
		notification_lag: '通知',
		isOpenAutoDDL: '自动处理DDL操作',
		send_email_when_replication: '几秒后重新发送',
		send_email_at_most_one_replication: '超过多少秒取消发送',
		read_cdc_interval: '增量同步间隔(ms)',
		read_batch_size: '每次读取多少',
		mission: '描述',
		yes: '是',
    no: '否',
    selectGrpupFiled: '请选择分组字段',
    selectTargetField: '请选择目标字段',
    aggName: '子处理名称',
		nodeName: '节点名称',
		aggFunction: '聚合函数',
		aggExpression: '作用目标',
		filterPredicate: '过滤器',
		groupByExpression: '分组字段',
    aggregation: '聚合处理',
    nameTip: '后续节点的脚本编辑需要引用此子处理的名称进行指定的数据处理，故不同的子处理名称不可重复。',
    enterFilterTable: '请输入过滤表内容',
		button: {
			setting: '设置',
			logs: '日志',
			preview: '预览',
			capture: '数据检视',
			stop_capture: '停止检视',
			start: '启动',
			stop: '停止',
			force_stop: '强制停止',
			reset: '重置',
			save: '保存',
			reloadSchema:'重新加载'
		},
		save_before_running: '请先保存再运行',
		reset_job: {
			msg: '重置任务?',
			tip: '提示',
		},
		stop_job: {
			msg: '停止任务?',
			force_stop_msg: '强制停止任务?',
			tip: '提示'
		},
    file_preview_fields: {
      file_name: "文件名称",
      file_size_ondisk: "文件大小(Byte)",
      file_modify_time_ondisk: "更新时间",
      file_create_time_ondisk: "创建时间",
      file_path: "文件路径"
    }
	},
	connection: {
		status: {
			testing: '测试中',
			invalid: '无效',
			ready: '有效',
		}
	},
	editor: {
		nodeSettings: '节点设置',
		choose: '选择',
		newTxt: '新建',
		cell: {
			validate: {
				empty_name: '名称必填.',
				none_setting: '设置不能为空.',
				none_stage: '至少有一个节点.',
				none_data_node: '至少有两个数据节点',
				none_link_node: '至少有一个连线',
				start_with_data_node: '必须使用数据节点作为源',
				acyclic: '数据处理流程不能有循环'
			},
			data_node: {
				database: {
					name: '数据库',
					tip: '任意类型数据库',
					defaultText: '数据库',
					tableSuffix: '表后缀',
					tablePrefix: '表前缀',
					none_database: '数据库必填.',

					form: {
						placeholder: '请选择数据库',
						label: '数据库'
          },
          remove: '移除',
          Undo: '撤销',
          bulkRemoval: '批量移除',
          bulkRevocation: '批量撤销',
          queueCopied: '待复制队列',
          tableRemoved: '已移除表',
          enterName: '请输入名称/字段名进行搜索'
				},
				collection: {
					name: '数据集',
					tip: 'MongoDB 数据集',
					defaultText: '数据集',

					none_database: 's数据库必填.',
					none_collection: '数据集必填.',
					none_pk: '主键必填.',

					form: {
						database: {
							label: '数据库',
							placeholder: '请选择MongoDB数据库'
						},
						collection: {
							label: '数据集',
							placeholder: '请选择数据集'
						},
						pk: {
							label: '主键',
							placeholder: '请输入主键'
						},
						dropTable: {
							label: '已存在的数据',
							placeholder: '',
							keep: '保持已存在的数据',
							remove: '运行前删除已存在的数据'
						},
						filter: {
							label: '过滤条件',
							placeholder: '过滤条件(Mongo Query Filter Document)',
							invalidJSON: '无效的JSON'
						}
					}
				},
				table: {
					name: '表',
					tip: 'RDBMS 表',
					defaultText: '表',
					none_database: '数据库必填.',
					none_table: '表必填.',
					none_pk: '主键必填.',

					form: {
						database: {
							label: '数据库',
							placeholder: '请选择数据库'
						},
						table: {
							label: '表',
							placeholder: '请选择表'
						},
						custom_sql: {
							label: '自定义SQL',
							placeholder: '请输入自定义SQL'
						}
					}
				},
				file: {
					tip: '文件节点',
					name: '文件',
					none_fileName: '文件名不能为空',
					configurationFile: '配置文件',
					chooseFileName: '请选择文件名'
				},
				gridfs: {
					name: 'GridFS',
					tip: 'GridFS节点',
					chooseGridFsName: '请选择GridFS',
          none_collection: '数据集必填.',
          none_pk: '主键必填.',
          gridFs_isNull: 'GridFS不能为空'
				},
				dummy: {
					name: 'Dummy',
					tip: 'Dummy节点',
					chooseDummyName: '请选择Dummy',
          none_collection: '数据集必填.',
          none_pk: '主键必填.',
					dummy_isNull: 'Dummy不能为空'
				},
				api: {
					name: 'API',
					tip: 'api节点',
					chooseApiName: '请选择API',
          none_collection: '数据集必填.',
          none_pk: '主键必填.',
          api_isNull: 'API不能为空',
          dataApiName: '数据发布API名称',
          description:'描述',
          method: '方法',
          fieldSettings:'字段设置',
          table_field: '字段',
          table_type: '类型',
          table_setting: '设置',
          enterPublishApiName: '请输入数据发布API的名称',
          enterNewlyReleasedApi: '请输入对新建发布API的描述',
          enterEndUrl: '请输入url末端路径名',
          required:'必填',
          availableQueries: '可用查询',
          publishApi_nameNone: 'API名称不能为空',
          publishApi_commentNone: '描述不为空',
				},
				es: {
					name: 'ES',
					tip: 'Elastic search节点',
					configurationES: '配置Elastic search',
					chooseESName: '请选择Elastic search',
					es_isNull: 'Elastic search不能为空'
        },
        custom: {
					tip: 'Custom节点',
					name: 'Custom',
					none_fileName: 'Custom不能为空',
					chooseCustomName: '请选择Custom'
				},
			},
			processor: {
				aggregate: {
					name: '聚合',
					tip: '聚合处理器',
					defaultText: '聚合',
					none_function: '聚合函数必填.',
          none_group: '分组表达式必填.',
          none_name: '子处理名称必填',
					none_aggregation_expression: '目标字段必填.',
					new_aggregate: '添加聚合',
          none_stage: '至少有一个聚合处理',
          none_subprocessingName: '子处理名称不能为空',
          name_notRepeated: '子处理名称不能重复'
				},
				field: {
					name: '字段',
					tip: '字段处理器',
					defaultText: '字段处理器',

					form: {
						name: {
							label: '节点名称',
							placeholder: '请输入节点名称'
						},
						description: {
							label: '描述',
							placeholder: '请输入节点描述'
						},
						fieldName: '字段名称',
						fieldType: '字段类型',
						addField: '添加字段',
						addEmbedField: '添加内嵌字段',
						scriptDialogTitle: '设置字段脚本',
					}
				},
				script: {
					name: '脚本',
					tip: '脚本处理器',
					defaultText: '脚本处理器',

					none_script_type: '脚本类型必填.',
					none_script: '脚本必填.',

					form: {
						name: {
							label: '节点名称',
							placeholder: '请输入节点名称'
						},
						type: {
							label: '脚本类型',
							placeholder: '请选择脚本类型'
						},
						script: {
							label: '脚本',
							placeholder: '请输入脚本'
						},
					}
				},
				dataFilter: {
					name: '数据过滤',
					tip: '行级数据过滤',
					validate: {
						none_expression: '条件表达式不能为空',
						none_action: '执行动作不能为空',
					},
					form: {
						name: {
							label: '节点名称',
							placeholder: '请输入节点名称'
						},
						expression: {
							label: '条件表达式',
							placeholder: '请输入表达式',
							labelTip: '表达式可以使用JavaScript中的比较符和计算符'
						},
						action: {
							label: '执行动作',
							discard: '丢弃匹配数据',
							retain: '保留匹配数据'
						},
						expressionExample: {
							label: '表达式示例',
							labelTip: '表达式可以使用JavaScript中的比较符和计算符',
							tip: '筛选出50岁以上的男性以及收入一万以下的30岁以上的人,表达式如下：'
						},
						symbol: {
							label: '支持的符号',
							gtLt: '大于、小于',
							geLe: '大于等于、小于等于',
							eq: '等于',
							not: '非',
							and: '且',
							or: '或',
							regexp: '正则表达式',
							group: '条件分组'
						}
					}
				},
			},
			link: {
				none_join_type: '关联类型必填',
				none_join_key: '关联字段必填',
				none_join_path: '关联写入路径必填',
				form: {
					label: {
						label: '标签',
						placeholder: '请输入标签'
					},
					joinType: {
						label: '数据写入模式',
						placeholder: '请选择数据写入模式'
					},
					joinPath: {
						label: '关联后写入路径',
						placeholder: '请输入关联后写入路径'
					},
					joinKeys: {
						label: '关联条件',
						sourceField: '源字段',
						targetField: '目标字段',
					},
				},

				writeMode: {
					append: '追加写入',
					upsert: '更新已存在或插入新数据',
					update: '更新写入',
					merge_embed: '更新内嵌数组',
				}
			}
		},
		ui: {
			sidebar: {
				setting: '任务设置',
				node_setting: '节点属性',
				logs: '日志',
				capture: '抓取数据',
				style: '样式',

				data_nodes: '数据节点',
				processor: '处理节点',
			},
			toolbar: {
				undo: {
					tip: '重做'
				},
				redo: {
					tip: '撤销'
				},
				clear_paper: {
					tip: '清空'
				},
				export_svg: {
					tip: '导出SVG'
				},
				export_png: {
					tip: '导出PNG'
				},
				print: {
					tip: '打印'
				},
				to_back: {
					tip: '置后'
				},
				to_front: {
					tip: '置前'
				},
				layout: {
					tip: '自动布局'
				},
				zoom_to_fit: {
					tip: '填充可视区域'
				},
				zoom_out: {
					tip: '放大'
				},
				zoom_in: {
					tip: '缩小'
				},
				grid_size: {
					tip: '网格大小'
				},
				fullscreen: {
					tip: '切换全屏'
				}
			},
		},
		preview: {
			stage: '节点',
			table: '数据表'
		}
	},
	dataVerify: {
		row: "行数校验",
		hash: '哈希校验',
		advance: '高级校验',
		dataVerify: '数据校验',
		dataWay: '校验方式',
		range: "采样范围",
		source: '源表',
		target: '目标表',
		operate: '操作',
		dataVerifySetting: '校验条件设置',
		confirm: '确认',
		start: '开始校验',
		back: '返回',
		add: '添加',
		refresh: '刷新',
		cancel: '取消',
		overView: '校验总览',
		time: '校验时间',
		duration: '耗时',
		result: '校验结果',
		linageDifference: '总体行数差',
		errorTotal: '不匹配条数',
		accuracyRate: '准确率',
		errorComparison: '错误对比',
		again: '再次校验',
		rows: '按行数校验',
		sampleRate: '按百分比',
		condition: '校验条件',
	}
};

export default cn;
