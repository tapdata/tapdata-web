import zhLocale from 'element-ui/lib/locale/lang/zh-CN';

const cn = {
	...zhLocale,
	tap: {
		login: 'Tapdata-登录',
		home: 'Tapdata-首页',
		connection: 'Tapdata-数据源 ',
		connectionEdtion: 'Tapdata-编辑数据源',
		jobFlow: 'Tapdata-任务编排',
		jsFuncs: 'Tapdata-函数管理',
		dataCatalog: 'Tapdata-数据目录',
		metadataInstances: 'Tapdata-元数据详情',
		dataQuality: 'Tapdata-数据质量',
		TimeToLive: 'Tapdata-生命周期管理',
		dataLineage: 'Tapdata-数据地图',
		dataRules: 'Tapdata-数据规则 ',
		apiManagement: 'Tapdata-API管理 ',
		apiEdition: 'Tapdata-编辑API',
		dataExplor: 'Tapdata-数据浏览',
		docTest: 'Tapdata-API文档测试',
		apiStats: 'Tapdata-API统计',
		apiClients: 'Tapdata-API客户端管理 ',
		apiSever: 'Tapdata-服务器管理',
		dictionary: 'Tapdata-字典模板',
		serversOversee: 'Tapdata-运维',
		journal: 'Tapdata-用户操作日志',
		dataMap: 'Tapdata-数据地图',
		apiInfo: 'Tapdata-api详情',
		agentdownload: 'Tapdata-代理下载',
		dataCollect: 'Tapdata-任务列表',
		upload: 'Tapdata-点击上传',

		jobSchedule: 'Tapdata-调度任务',
		clusterManagement: 'Tapdata-集群管理 ',
		agentManagement: 'Tapdata-进程管理 ',
		userManagement: 'Tapdata-用户管理 ',
		userEdition: 'Tapdata-编辑用户',
		roleManagement: 'Tapdata-角色管理',
		roleEdition: 'Tapdata-编辑角色  ',
		systemSettings: 'Tapdata-系统设置'
	},
	app: {
		document: '帮助文档',
		qa: '客服',
		version: '系统版本',
		home: '官网',
		signOut: '退出登录',
		signOutMsg: '您确定要退出登录吗？',
		customerService: {
			technicalSupport: '技术支持',
			technicalSupportText: '在使用过程中，有任何问题，请在',
			technicalSupportText1: '留言，（用户支持的账户和密码，与cloud.tapdata.net中的相同），我们会尽快答复。',
			userSupport: '用户支持',
			otherDmands: '其他需求',
			otherDmandsText: '其他需求，请扫描下方企业微信二维码。'
		},
		signIn: {
			slogan: '像自来水一样方便地使用您的数据',
			signIn: '登录',
			keepSignIn: '保持登录状态',
			email_placeholder: '请输入邮箱',
			password_placeholder: '请输入密码',

			email_require: '邮箱地址必填',
			email_invalid: '请输入有效邮箱地址',
			password_invalid: '密码至少5个字符',
			account_waiting_approve: '您的账户还未通过管理员审核',
			account_disabled: '您的账户已被管理员禁用',
			permission_denied: '没有权限',
			signInFail: '登录失败'
		},
		menu: {
			dashboard: '控制台',
			connections: '数据源',
			dataFlows: '数据采集',
			dataGovernance: '数据治理',
			metadataDefinition: '数据目录',
			dataQuality: '数据质量',
			timeToLive: '生命周期管理',
			dataMap: '数据地图',
			dataRules: '数据规则',
			dictionary: '字典模板',
			dataPublish: '数据发布',
			modules: 'API 发布',
			dataExplorer: 'API 数据浏览',
			apiDocAndTest: 'API 文档及测试',
			apiAnalysis: 'API 统计分析',
			applications: 'API 客户端',
			apiServers: 'API 服务器',
			dataCollect: '数据采集(旧版)',
			system: '系统管理',
			tasks: '调度任务',
			agentdownload: '代理下载',
			clusterManagement: '集群管理',
			agents: '进程管理',
			serversOversee: '运维',
			users: '用户管理',
			journal: '用户操作日志',
			roles: '角色管理',
			settings: '系统设置',
			favorite: '我的收藏',

			delFavMenu: '删除收藏'
		},
		Home: {
			all: '全部',
			taskOverview: '任务概览',
			allTask: '全部任务',
			transmissionOverview: '传输总览',
			transferTask: '传输任务',
			wrongTask: '错误任务',
			taskRanking: '任务传输排行',
			serverProcess: '服务器与进程',
			before: '前',
			pcs: '条',
			server: '服务器',
			managementSide: '管理端',
			taskTransfer: '任务传输',
			apiService: 'API服务',
			totalOutput: '总输出',
			totalInput: '总写入',
			bar: '条',
			starting: '启动中',
			running: '运行中',
			stopping: '关闭中',
			stopped: '已关闭'
		}
	},
	message: {
		api: {
			get: {
				error: '加载数据失败.',
				loading: '正在加载数据'
			}
		},
		comfirm: '你确定要',
		operationSuccuess: '操作成功',
		modifyName: '修改名称',
		ok: '确定',
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
		createOK: '保存成功',
		createFail: '创建失败',
		copyFail: '创建失败',
		copySuccess: '复制成功',
		deleteOK: '删除成功',
		deleteFail: '删除失败',
		taskStart: '任务启动中',
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
		deleteOrNot: '是否删除',
		startupAfter_delete: '请启动后删除',
		startupAfter_add: '请启动后添加',
		noData: '暂无数据',
		prompt: '提示',
		resetMessage: '重置任务将清除任务同步进度，任务将从头执行, 确定重置?',
		deteleMessage: '删除任务将无法恢复, 确定删除?',
		forceStoppingMessage: '强制停止将立即中断数据传输，是否继续执行?',
		stopInitial_syncMessage: '初始化类型的任务暂停后如果再次启动，任务会从头开始同步，确定暂停?',
		stopMessage: '确定要暂停任务吗?',
		cancleReset: '已取消重置',
		resetOk: '重置成功',
		resetFailed: '重置失败',
		notRest: '请选择正确的数据进行重置',
		operator: '操作',
		edit: '修改',
		clickRelatedTasks: '点击查看相关任务',
		currentTaskOpen: '当前任务已打开',
		noRelatedTask: '暂无相关任务'
	},
	dataFlow: {
		updateModel: '更新模型',
		databseMigrationHead: '数据库迁移',
		atabseProcessingHead: '数据处理同步',
		databseFreedomHead: '自定义同步任务',
		createNew: '新建',
		DissedNoAction: 'oops~ 被禁用的节点或连线不能被删除、连入或连出',
		guidingMode: '引导模式',
		advancedMode: '高级模式',
		freedomMode: '转高级模式',
		advanceSetting: '更多高级设置',
		closeSetting: '收起',
		openPanel: '展开',
		execution: '开始执行',
		previous: '上一步',
		next: '下一步',
		sourceSetting: '设置源库',
		targetSetting: '设置目标库',
		jobSetting: '任务设置',
		databseMigration:
			'以引导的模式帮助新手用户快速了解数据库之间的迁移。数据库迁移能快速地实现数据库之间(内置表批量过滤和改名等设置)的全量和增量传输。',
		databseProcessing:
			'以引导的模式帮助新手用户快速了解表级的数据处理与同步，此功能除了能实现表级的全量或增量传输除功能外，更注重使用各种处理器(JS处理、字段过滤、聚合处理、行级过滤等)进行复杂的逻辑处理，以满足用户更高的数据处理需求',
		databseFreedom:
			'自定义数据同步模式下，用户可以根据需求自由地使用全部的数据节点与处理节点，自由的设置任务编排路径与功能配置。此模式可满足用户各种复杂的数据处理的场景需求。',
		multiError: {
			allSelectionError: '选中的任务状态不允许这种操作',
			notFound: '此任务不存在',
			statusError: '任务状态不允许这种操作',
			otherError: '操作失败, 请重试'
		},
		changeName: '改名',
		Enable: '启用',
		Disable: '禁用',
		draftNotStart: '任务配置未完成，无法启动',
		systemHint: '系统提示',
		systemText: '系统检测出有如下任务上次操作后未保存，请问是否继续编辑',
		stystemOpen: '打开',
		stystemOpenAll: '全部打开',
		stystemDeleteAll: '全部删除',
		stystemLgnoreAll: '全部忽略',
		newTaksName: '新任务未命名',
		selectNode: '请选择节点',
		submitExecute: '提交执行',
		submitOnly: '仅提交',
		implementationModalities: '执行方式',
		submitConfirmation: '提交确认',
		SyncPoint: '增量采集开始时刻',
		cdcLabel: '数据源:',
		syncType: '同步类型',
		SyncInfo: {
			localTZ: '当前时区传输时间：系统所在时区下，开始传输任务的时刻',
			current: '当前时区时间：默认当前时间',
			connTZ: '数据库时区传输时间： 数据库所在时区下，开始传输任务的时刻',
			localTZType: '用户浏览器时区',
			currentType: '此刻',
			connTZType: '数据库时区'
		},
		Current: '当前时间',
		SyncTime: '同步时间',
		batchRest: '批量重置',
		batchDelete: '批量删除',
		bulkExport: '批量导出',
		bulkScheuled: '批量启动',
		bulkStopping: '批量停止',
		taskBulkFx: '函数',
		taskBulkOperation: '批量操作',
		taskBulkTag: '设置分类',
		upload: '点击上传',
		import: '任务导入',
		uploadOK: '上传成功',
		uploadError: '上传失败',
		uploadInfo: '点击查看详情',
		dataFlowExport: '导出',
		addTag: '添加标签',
		bulkImport: '批量导入',
		overWrite: '覆盖已有数据',
		skipData: '跳过已有数据',
		loadingError: '加载失败,请',
		dataLoading: '数据努力加载中...',
		loadLogTip: '运行日志努力加载中，可能需要5~10秒，请稍等......',
		noLogTip: '没有数据',
		clickLoadTxt: '点击加载',
		average: '平均',
		current: '当前',
		allNode: '全部节点',
		taskName: '任务名称',
		ownedUser: '所属用户',
		ownedLibrary: '所属库',
		creatdor: '创建人',
		creationTime: '启动时间',
		state: '状态',
		executionTime: '本次执行时间',
		finishTime: '本次结束时间',
		inputNumber: '本次输入',
		outputNumber: '本次输出',
		sourceLibrary: '源库',
		targetLibrary: '目标库',
		rowCount: '条数',
		inputOutput: '输入输出统计',
		transf: '传输耗时',
		taskDetail: '任务详情',
		timePoint: '增量所处时间点',
		dataScreening: '数据统计',
		unit: '单位',
		article: '条',
		secondUnit: '秒',
		second: '秒',
		min: '分',
		hour: '时',
		day: '日',
		input: '输入',
		output: '输出',
		totalInput: '总输入',
		totalOutput: '总输出',
		totalInsert: '总插入',
		totalUpdate: '总更新',
		totalDelete: '总删除',
		category: '类别',
		replicate: '数据同步差距',
		throughputpop: '平均每秒源端数据采集的速度以及目标端写入的速度，数值越大越好',
		transtime_pop:
			'传输耗时:除源节点外，事件处理完的时间减去事件的发生时间。 节点间统计:事件从进入节点到输出到所消耗的时间 任务流统计:所有节点耗时相加，数值越小越好',
		replicate_pop: '源库和目标库数据最后更新时间的差距，数值越小越好',
		status: {
			running: '运行中',
			paused: '已暂停',
			draft: '编辑中',
			scheduled: '调度中',
			stopping: '停止中',
			error: '错误',
			force_stopping: '强制停止',
			cdc: '增量中',
			initializing: '初始化中',
			initialized: '初始化完成'
		},
		lag: '滞后',
		executionStatus: '执行状态',
		searchPlaceholder: '任务名称/节点名/库表名',
		dataRange: '创建日期范围',
		startTime: '开始时间',
		endTime: '结束时间',
		separator: '至',
		dataPlaceholder: '选择时间范围',
		taskStatus: '运行状态',
		taskStatusPlaceholder: '请选择任务状态',
		taskSettingPlaceholder: '请选择任务同步类型',
		updateTime: '更新时间',
		runningSpeed: '运行速度',
		taskSwitch: '运行开关',
		operate: '操作',
		dataMap: '数据地图',
		edit: '编辑',
		copy: '复制',
		reset: '重置',
		cut: '剪切',
		paste: '粘贴',
		undo: '撤销',
		redo: '重做',
		selectAll: '全选',
		amplification: '放大',
		zoomOut: '缩小',
		down: '向下',
		up: '向上',
		selectMultipleNode: '选择多节点',
		mouseDrag: '鼠标拖拽',
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
		run_custom_sql: '重复自定义SQL',
		stop_on_error: '遇到错误停止',
		need_to_create_Index: '自动创建索引',
		is_schedule: '定期调度任务',
		cron_expression: '调度cron表达式',
		data_quality_tag: '添加数据质量标签',
		notification_lag: '通知',
		isOpenAutoDDL: '自动处理DDL',
		transformerConcurrency: '目标写入线程数',
		processorConcurrency: '处理器线程数',
		send_email_when_replication: '几秒后重新发送',
		send_email_at_most_one_replication: '超过多少秒取消发送',
		read_cdc_interval: '增量同步间隔',
		read_batch_size: '每次读取数量',
		mission: '描述',
		yes: '是',
		no: '否',
		cronExpression: '请输入调度表达式',
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
			submit: '提交执行',
			viewConfig: '查看节点配置',
			viewMonitoring: '查看监控数据',
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
			saveDraft: '保存草稿',
			saveing: '保存中',
			reloadSchema: '刷新schema',
			debug: 'debug测试',
			quantitative: '定量',
			increment: '增量'
		},
		save_before_running: '请先保存再运行',
		reset_job: {
			msg: '重置任务?',
			tip: '提示'
		},
		stop_job: {
			msg: '停止任务?',
			force_stop_msg: '强制停止任务?',
			tip: '提示'
		},
		file_preview_fields: {
			file_name: '文件名称',
			file_size_ondisk: '文件大小(Byte)',
			file_modify_time_ondisk: '更新时间',
			file_create_time_ondisk: '创建时间',
			file_path: '文件路径'
		},
		importantReminder: '重要提醒',
		modifyEditText: '编辑任务如果修改了',
		nodeLayoutProcess: '节点排版流程',
		nodeAttributes: '节点属性',
		matchingRelationship: '匹配关系',
		afterSubmission: '提交后必须',
		runNomally: '才能正常运行',
		editLayerTip: ' 否则可能导致异常错误，请问您要继续编辑吗?',
		continueEditing: '继续编辑',
		setting: {
			distinctWriteType: '去重写入机制',
			intellect: '智能去重写入',
			compel: '强制去重写入',
			intellectTip: '智能去重写入：对目标已有数据进行智能检测，去重的同时能极大提升传输性能',
			compelTip: '强制去重写入：对目标已有数据进行强制去重检测，严格保证精准度但传输性能较低'
		}
	},
	connection: {
		status: {
			testing: '测试中',
			invalid: '无效',
			ready: '有效'
		}
	},
	editor: {
		nodeSettings: '节点设置',
		choose: '选择',
		newTxt: '新建',

		noResult: '未搜索到相关结果',
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
					queueCopied: '待迁移表',
					tableRemoved: '已移除表',
					enterName: '请输入名称/字段名进行搜索'
				},
				collection: {
					name: '数据集',
					tip: 'MongoDB 数据集',
					defaultText: '数据集',

					none_database: '数据库必填.',
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
						fieldFilterType: {
							keepAllFields: '不过滤字段',
							retainedField: '保留字段',
							deleteField: '删除字段'
						},
						fieldFilter: {
							placeholderKeep: ' 请选择要保留的字段',
							placeholderDelete: '  请选择要删除的字段'
						},
						fieldFilterTip: {
							label: '字段过滤',
							keepAllFields: '不过滤字段：保留此数据集的全部字段',
							retainedField: '保留字段：选择此项操作，将保留所选择的字段，舍弃其它字段全部.',
							deleteField: '删除字段：选择此项操作，将删除所选择的字段，保留其它全部字段.'
						},
						dropTable: {
							label: '已存在的数据',
							placeholder: '',
							keep: '保持已存在的数据',
							remove: '运行前删除已存在的数据'
						},
						initialSyncOrder: {
							keep: '启用自定义初始化顺序',
							open: '开启',
							close: '关闭'
						},
						filter: {
							label: '过滤条件',
							invalidJSON: '无效的JSON',
							fiflterSetting: '过滤设置',
							fieldFilter: '字段过滤',
							openFiflter: '开启过滤',
							closeFiflter: '关闭过滤',
							sqlFilter: 'SQL过滤',
							saveFields: '保留字段',
							allField: '全部字段',
							deleteField: '删除字段',
							rowLimit: '行数限制',
							allRows: '全部行数',
							oneThousandRows: '1000行',
							tenThousandRows: '10000行',
							placeholder: {
								savefield: '请选择保留字段',
								delField: '请选择',
								selectField: '请选择字段',
								Operator: '运算符',
								enterContent: '请输入条件内容',
								placeholder: '过滤条件(Mongo Query Filter Document)'
							}
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
							placeholder: '请选择表,区分大小写'
						},
						custom_sql: {
							label: '自定义SQL',
							placeholder: '请输入自定义SQL'
						},
						initial_offset: {
							label: '自定义SQL增量条件',
							placeholder: '请输入自定义SQL增量条件'
						},
						maximum_transaction: {
							label: '事务最大时长(小时)',
							tip: '等待事务提交的时间(小时)。输入您期望事务需要的最长时间。默认为12小时'
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
					description: '描述',
					method: '方法',
					fieldSettings: '字段设置',
					table_field: '字段',
					table_type: '类型',
					table_setting: '设置',
					required: '必填',
					publishName: '发布API',
					availableQueries: '可用查询',
					enterPublishApiName: '请输入数据发布API的名称',
					enterNewlyReleasedApi: '请输入对新建发布API的描述',
					enterEndUrl: '请输入URL末端路径名',
					variable_name: '只能包含字母、数字、下划线和美元符号,并且数字不能开头'
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
				memCache: {
					tip: '内存缓存节点',
					name: '内存缓存',

					applicationCode: '应用代码',

					form: {
						cacheName: {
							label: '缓存名称',
							placeholder: '请输入缓存名称',
							none: '缓存名称必填'
						},
						cacheKeys: {
							label: '缓存键',
							placeholder: '请选择缓存健',
							none: '缓存键必填'
						},
						maxSize: {
							label: '缓存最大容量',
							placeholder: '请输入缓存最大容量',
							none: '缓存最大容量必填',
							options: {
								unlimited: '容量不限',
								custom: '自定义最大缓存容量'
							}
						},
						maxRows: {
							label: '缓存最大记录数',
							placeholder: '请输入缓存最大记录数',
							none: '缓存最大容量必填',
							unit: '条',
							options: {
								unlimited: '条数不限',
								custom: '自定义最大记录条数'
							}
						}
					}
				},

				logminer: {
					add: '添加',
					day: '天',
					name: '日志挖掘',
					tip: '日志挖掘器',
					miningLogTime: '挖掘日志时间',
					logSaveTime: '日志保存时长',
					logSourceSetting: '日志源设置',
					currentTimeZone: '当前时区',
					databaseTimeZone: '数据库时区',
					allTables: '全部表',
					reservationTable: '保留表',
					exclusionTable: '排除表',
					nodeFunDes: '节点功能说明',
					function: '功              能',
					functionContent:
						'此节点用于采集指定数据库和表的日志，保存到MongoDB数据库，共享日志数据不需要重复开 启日志采集进程，能极大缓解源库资源的占用和浪费。',
					connectionTarget: '连接目标',
					connectionText: '只能连接Collection节点',
					tableFilter: {
						placeSletSource: '请选择采集的数据源',
						tableFilter: ' 请选择要保留的表',
						placeholderDelete: '请选择要排除的表'
					},
					validate: {
						name: '节点名称不能为空',
						source: '数据源不能为空',
						table: '数据表不能为空',
						sameConnection: '不能选择相同连接'
					}
				}
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
					name_notRepeated: '子处理名称不能重复',
					returnExample: '返回示例',
					school_name: 'school_name: "第一实验小学"',
					idComment: '// "students_sum" 自定义的子处理名称，多个子处理名称不可重复',
					countComment: '// COUNT为选择的函数, 132为函数值；如果函数是MAX, 则名称为MAX',
					school_nameComment: '// 分组汇总的字段名，如果不填写则不显示'
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
						toUpperCase: '转大写',
						toLowerCase: '转小写',
						delete: '删除',
						fieldName: '字段名称',
						fieldType: '字段类型',
						addField: '添加字段',
						addEmbedField: '添加内嵌字段',
						scriptDialogTitle: '设置字段脚本',
						expression: '请输入表达式',
						example: '示例',
						exampleRow1: 'var result = "a" + "b" // 字符串拼接, result的结果为 "ab"',
						exampleRow2: 'var result = 1 + 2 // 数字计算, result 的结果为 3',
						exampleRow3: 'var result = fn("1") // 调用自定义函数或内置函数, result的结果为 fn 函数的返回值',
						exampleRow4:
							'var result = record.isTrue ? true : false // 三元表达式, result的值根据判断表达式（record.isTrue）的结果为 true 或 false'
					}
				},
				script: {
					name: '脚本',
					tip: '脚本处理器',
					defaultText: '脚本处理器',

					none_script_type: '脚本类型必填.',
					none_script: '脚本必填.',

					debug_button_label: '调试脚本',
					warning_for_not_save: '当前任务未保存，无法进行连接测试，请保存之后再尝试',
					connect_server_fail: '连接服务器失败',

					debug: {
						top_header: '调试脚本',
						bottom_header: '调试详情',
						detail: {
							parameter: '输入',
							return: '输出'
						},
						order: '调试顺序',
						status: '返回状态',
						status_error: '错误',
						status_success: '成功',
						time: '耗时',
						log: '日志'
					},

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
						}
					}
				},
				dataFilter: {
					name: '数据过滤',
					tip: '行级数据过滤',
					validate: {
						none_expression: '条件表达式不能为空',
						none_action: '执行动作不能为空'
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
							tip: '筛选出50岁以上的男性或者收入一万以下的30岁以上的人,表达式如下：'
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
				}
			},
			link: {
				none_join_type: '关联类型必填',
				none_join_key: '关联字段必填',
				none_join_path: '关联写入路径必填',
				none_array_unique_key: '合并进数组时，必须提供唯一键',
				repeatId: {
					title: '_id字段冲突',
					message:
						'目标数据模型已存在 _id 字段，系统默认会移除已重复的_id字段，如想保留，请使用字段处理器对源表的 _id 进行重命名！'
				},
				form: {
					label: {
						label: '标签',
						placeholder: '请输入标签'
					},
					joinMethod: {
						label: '不匹配数据插入方式',
						placeholder: '请选择数据插入方式'
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
						targetField: '目标字段'
					},
					arrayUniqueKey: {
						label: '内嵌数组匹配条件',
						placeholder: '内嵌数组匹配条件'
					}
				},

				methodList: {
					false: '丢弃',
					true: '写入'
				},

				writeMode: {
					append: '追加写入',
					upsert: '更新已存在或插入新数据',
					update: '更新写入',
					merge_embed: '更新内嵌数组'
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
				tableSelector: '快速选择'
			},
			toolbar: {
				undo: {
					tip: '撤销'
				},
				redo: {
					tip: '重做'
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
					tip: '缩小'
				},
				zoom_in: {
					tip: '放大'
				},
				grid_size: {
					tip: '网格大小'
				},
				fullscreen: {
					tip: '切换全屏'
				}
			}
		},
		preview: {
			stage: '节点',
			table: '数据表'
		}
	},
	dataVerify: {
		row: '行数校验',
		hash: '哈希校验',
		advance: '高级校验',
		dataVerify: '数据校验',
		dataWay: '校验方式',
		range: '采样范围',
		source: '源表',
		target: '目标表',
		sourceDatabase: '数据源',
		targetDatabase: '目标源',
		sourceText: '请选择源表',
		targetText: '请选择目标表',
		sourceDatabaseText: '请选择数据源',
		targetDatabaseText: '请选择目标源',
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
		result: '行数差',
		linageDifference: '总体行数差',
		errorTotal: '不匹配条数',
		accuracyRate: '准确率(%)',
		errorComparison: '错误对比',
		again: '再次校验',
		rows: '按行数校验',
		sampleRate: '按百分比',
		condition: '采样范围',
		filter: '过滤',
		exampleSQL:
			'行数校验下仅支持 select count(*) 查询语句 示例: select count(*)  from tablename_1 where field__2 = A;',
		exampleMQL: '示例: db.collection_1.count({ field_2:A })',
		exampleHashSQL:
			'哈希校验下SQL仅支持select查询语句, 不支持count/sum/avg/max等查询 示例: select field_1 from tablename_1 where field__2 > A；',
		exampleHashMQL: '请输入MQL查询语句 示例: db.collection_1.find ({ field_2:A },{ field_1:1 })',
		exampleJS: '请输入JS代码, 高级校验JS必须返回return值, 具体请查看示例',
		verifyRunningInfo: '后台运行',
		verifyStatusWaiting: '校验阶段1-3:数据校验排队中，请等待... 点击',
		verifyStatusDraft: '校验阶段2-3:数据校验调度中，请等待... 点击',
		verifyStatusValidating: '校验阶段3-3:数据校验执行中，请等待... 点击',
		verifyStatusInterrupted: '数据校验终止中，请等待... 点击',
		verifyStatusStop: '终止校验',
		verifyStatusCompleted: '数据校验结果加载中',
		or: '或',
		psc: '条',
		all: '全部'
	},
	dataMap: {
		source: '来源',
		tapdata: 'Tapdata',
		API: '数据发布',
		noneData: '没有查找到数据模型',
		classification: '模型分类',
		topLevel: '顶级',
		dbLevel: '库级',
		tableLevel: '表级',
		fieldLevel: '字段映射',
		infoSource: '数据源',
		infoDAAS: '数据中台',
		infoAPI: 'API',
		dblclickDataModel: '请双击数据模型打开字段映射',
		properties: {
			name: '名称',
			type: '分类',
			path: '路径',
			database_type: '数据库类型',
			database_host: '数据库IP',
			database_username: '数据库用户',
			database_port: '数据库端口',
			database_uri: '数据库连接',
			database_name: '数据库名称',
			original_name: '原名称'
		}
	},
	apiInfo: {
		basicAttributes: '基本属性',
		trquestMethod: '请求方式',
		status: '状态',
		supportFormat: '支持格式',
		founder: '创建人',
		interfaceClassification: '接口分类',
		modifyTime: '修改时间',
		interface: '接口分类',
		version: '版本',
		parameter: '参数',
		typesof: '类型',
		is_required: '是否必填',
		examples: '示例',
		requestParameters: '请求参数',
		responseParameters: '响应参数',
		requestExample: '请求示例',
		backExamples: '返回示例',
		announcing: '发布中',
		apiTest: 'API文档及测试',
		isPublishAPI: '是否确认发布api?',
		unpublish_api: '是否确认取消发布api?',
		apiPublishSuccess: '已发布',
		apiPublishError: 'api发布失败',
		apiUnpublishSuccess: '未发布'
	},
	dataForm: {
		title: '新建数据库',
		saveSuccess: '测试通过并创建成功',
		saveFail: '保存失败',

		submit: '保存',
		cancel: '取消',
		test: {
			title: '连接测试',
			success: '测试通过',
			fail: '测试未通过',
			testing: '测试中...'
		},
		form: {
			connectionName: '连接名称',
			databaseType: '数据库类型',
			connectionType: '连接类型',
			host: '数据库地址',
			port: '端口',
			databaseName: '数据库名称',
			databaseSchema: '数据库模式',
			userName: '账号',
			password: '密码',
			nodeName: '编目节点名称',
			tableFilter: '包含表',
			additionalString: '其他连接串参数',
			isUrl: '是否使用URI',
			databaseUri: '数据库 URI',
			ssl: '使用 TLS/SSL 连接',
			sslKey: '客户端私钥',
			sslPass: '私钥密码',
			sslValidate: '验证服务端证书',
			sslCA: '证书颁发机构',
			thinType: '认证方式',
			databaseOwner: '数据库归属账户名',
			timeZone: '时间类型的时区',

			databaseHostPlaceholder: '数据库地址(127.0.0.1/Domain:{端口},多个地址请用,分开)',

			uriTips: {
				label: '示例',
				content:
					`<b>MongoDB 数据库连接 URI 示范:</b><br>` +
					`复制集: mongodb://192.168.0.100:27017/mydb?replicaSet=xxx<br>` +
					`启用认证的复制集: mongodb://admin:password@192.168.0.100:27017/mydb?replicaSet=xxx&authSource=admin<br>` +
					`多节点复制集: mongodb://192.168.0.1:27017,192.168.0.2:27017,192.168.0.3:27017/mydb?replicaSet=xxx<br>` +
					`分片集: mongodb://192.168.0.100:27017/mydb<br>` +
					`多个mongos: mongodb://192.168.0.1:27017,192.168.0.2:27017,192.168.0.3:27017/mydb<br>`
			},
			tableFilterTips: '逗号分割的表达式列表，使用 * 代表任意长度任意字符',
			timeZoneTips: '影响类型: DATE',

			options: {
				sourceAndTarget: '源头和目标',
				source: '源头',
				target: '目标'
			}
		},
		error: {
			connectionNameExist: '连接名称已存在',
			noneHost: '数据库地址不能为空',
			nonePort: '端口不能为空',
			portNumber: '端口必须为数字',
			portRange: '端口号取值范围 1 ~ 65535',
			noneSslKey: '客户端私钥不能为空',
			noneSslCA: '证书颁发机构不能为空'
		},
		createDatabase: '新建数据库',
		copyDatabase: '复制数据库名',
		checkDatabase: '查看详情',
		createTable: '创建新表',
		copyTable: '复制表名',
		createCollection: '创建新数据集',
		copyCollection: '复制数据集'
	},
	formBuilder: {
		noneText: '不能为空',
		file: {
			placeholder: '请选择文件',
			button: '选择文件'
		},
		input: {
			placeholderPrefix: '请输入'
		}
	},
	metaData: {
		title: '数据分类',
		nameExist: '分类名称已存在',
		addNode: '新增同级分类',
		addChildernNode: '新增子分类',
		editNode: '编辑',
		deleteNode: '删除',
		nodeName: '请输入分类名称',
		deteleMessage: '此操作会将该分类下存在的子类都删除，是否删除'
	},
	dialog: {
		createTable: '创建新表',
		placeholderTable: '请输入新表表名',
		createCollection: '创建新数据集 ',
		placeholderCollection: '请输入新的数据集名称'
	},
	notification: {
		notice: '消息通知',
		viewMore: '查看全部',
		setting: '通知设置',
		allNotice: '全部通知',
		unreadNotice: '未读消息',
		maskRead: '标记本页为已读',
		maskReadAll: '标记全部为已读',
		systemNotice: '系统通知',
		noticeCenter: '通知中心',
		dataFlow: '任务',
		manageSever: '管理端',
		started: '已启动',
		paused: '已暂停',
		edited: '被编辑',
		deleted: '被删除',
		abnormallyStopped: '意外停止',
		stoppedByError: '出错停止',
		startupFailed: '启动失败',
		stopFailed: '停止失败',
		encounterERRORSkipped: '运行中出现ERROR，跳过',
		CDCLag: 'CDC滞后超时',
		manageSeverRestartFailed: '管理端服务重启失败',
		APISeverRestartFailed: 'API服务重启失败',
		SYNCSeverRestartFailed: '同步治理服务重启失败',
		connectionInterrupted: '断开连接',
		manageSeverStartFailed: '管理端服务启动失败',
		APISeverStartFailed: 'API服务启动失败',
		SYNCSeverStartFailed: '同步治理服务启动失败',
		manageSeverStopFailed: '管理端服务停止失败',
		APISeverStopFailed: 'API服务停止失败',
		SYNCSeverStopFailed: '同步治理服务停止失败',
		APISeverAbnormallyStopped: 'API服务意外停止',
		SYNCSeverAbnormallyStopped: '同步治理服务意外停止',
		manageSeverAbnormallyStopped: '管理端服务意外停止',
		manageSeverStartedSuccessfully: '管理端服务已启动',
		APISeverStartedSuccessfully: 'API服务已启动',
		SYNCSeverStartedSuccessfully: '同步治理服务已启动',
		manageSeverStoppedSuccessfully: '管理端服务已停止',
		APISeverStoppedSuccessfully: 'API服务已停止',
		SYNCSeverStoppedSuccessfully: '同步治理服务已停止',
		manageSeverRestartedSuccessfully: '管理端服务已重启',
		APISeverRestartedSuccessfully: 'API服务已重启',
		SYNCSeverRestartedSuccessfully: '同步治理服务已重启',
		newSeverCreatedSuccessfully: '新服务监控被创建',
		newSeverDeletedSuccessfully: '新服务监控被删除',
		databaseDDLChanged: '监测到数据库DDL变化'
	},
	queryBuilder: {
		addCond: '字段条件'
	}
};

export default cn;
