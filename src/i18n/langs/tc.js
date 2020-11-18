import tcLocale from 'element-ui/lib/locale/lang/zh-TW';

const tc = {
	...tcLocale,
	tap: {
		login: 'Tapdata-登錄',
		registry: 'Tapdata-註冊',
		home: 'Tapdata-首頁',
		connection: 'Tapdata-數據源 ',
		connectionEdtion: 'Tapdata-編輯數據源',
		jobFlow: 'Tapdata-任務編排',
		jsFuncs: 'Tapdata-函數管理',
		dataCatalog: 'Tapdata-數據目錄',
		metadataInstances: 'Tapdata-元數據詳情',
		dataQuality: 'Tapdata-數據質量',
		TimeToLive: 'Tapdata-生命週期管理',
		dataLineage: 'Tapdata-數據地圖',
		dataRules: 'Tapdata-數據規則 ',
		apiManagement: 'Tapdata-API管理 ',
		apiEdition: 'Tapdata-編輯API',
		dataExplor: 'Tapdata-數據瀏覽',
		docTest: 'Tapdata-API文檔測試',
		apiStats: 'Tapdata-API統計',
		apiClients: 'Tapdata-API客戶端管理 ',
		apiSever: 'Tapdata-服務器管理',
		dictionary: 'Tapdata-字典模板',
		serversOversee: 'Tapdata-運維',
		journal: 'Tapdata-用戶操作日誌',
		dataMap: 'Tapdata-數據地圖',
		apiInfo: 'Tapdata-api詳情',
		agentdownload: 'Tapdata-代理下載',
		dataCollect: 'Tapdata-任務列表',
		upload: 'Tapdata-點擊上傳',

		jobSchedule: 'Tapdata-調度任務',
		clusterManagement: 'Tapdata-集群管理 ',
		agentManagement: 'Tapdata-進程管理 ',
		userManagement: 'Tapdata-用戶管理 ',
		userEdition: 'Tapdata-編輯用戶',
		roleManagement: 'Tapdata-角色管理',
		roleEdition: 'Tapdata-編輯角色 ',
		systemSettings: 'Tapdata-系統設置',
		account: 'Tapdata-個人設置'
	},
	errorCode: {
		networkUnconnected: '網絡未連接',
		serverAbnormal: '服務器异常',
		requested: '請求的資源不存在',
		unauthorized: '未授權',
		parameters: '參數不正確'
	},
	app: {
		document: '幫助文檔',
		qa: '客服',
		account: '個人設置',
		version: '系統版本',
		home: '官網',
		signOut: '登出',
		signOutMsg: '您確定要登出嗎？',
		save: '保存',
		customerService: {
			technicalSupport: '技術支持',
			technicalSupportText: '在使用過程中，有任何問題，請在',
			technicalSupportText1: '留言，（用戶支持的賬戶和密碼，與cloud.tapdata.net中的相同），我們會盡快答复。',
			userSupport: '用戶支持',
			otherDmands: '其他需求',
			otherDmandsText: '其他需求，請掃描下方企業微信二維碼。'
		},
		signIn: {
			slogan: '像自來水一樣方便地使用您的數據',
			signIn: '登錄',
			keepSignIn: '保持登錄狀態',
			email_placeholder: '請輸入郵箱',
			password_placeholder: '請輸入密碼',

			email_require: '郵箱地址必填',
			email_invalid: '請輸入有效郵箱地址',
			email_null: '郵箱不能為空',
			password_invalid: '密碼至少5個字符',
			account_waiting_approve: '您的賬戶還未通過管理員審核',
			account_disabled: '您的賬戶已被管理員禁用',
			permission_denied: '沒有權限',
			signInFail: '登錄失敗',

			registry: '賬號註冊',
			registry_tip: '我已同意',
			userPplicy: '用戶政策',
			nextStep: '下一步',
			haveAccpunt: '已有賬號?',
			backLogin: '返回登錄',
			email_existed: 'Email 地址已被註冊',
			registry_sucess: '登錄前請檢查你的郵件並點擊驗證鏈接，將在5秒後轉跳到登錄頁面。 ',
			registry_sucess_wait_approval: '登錄前等待管理員審批，將在5秒後轉跳到登錄頁面。 ',
			userPplicy_message: '請選擇用戶政策',
			modifyPassword: '修改密碼',
			newPasswordTip: '輸入您註冊的郵箱和新密碼，我們將向您發送用於重置密碼的鏈接',
			newpassword_placeholder: '請設置新密碼',
			rememberPasswords: '想起密碼?',
			Registration: '註冊賬號',
			forgetPassword: '忘記密碼?',
			confirmationEmail: '賬號註冊確認郵件已發送至',
			mailbox: '請登錄郵箱後點擊鏈接進行確認~',
			receiveEmail: '沒有收到郵件？點擊',
			resend: '重新發送',
			orClick: '或點擊',
			account: '賬號',
			accountSuccess: '已註冊成功~',
			clickBtn: '點擊下方按鈕開啟數據傳輸之旅吧',
			resetClickBtn: '點擊下方按鈕登錄吧',
			goLogin: '去登錄',
			connectionFailed: '註冊確認鏈接失敗',
			resetConnectionFailed: '重置密碼確認鏈接已失效',
			clickText: '點擊',
			confirmEmail: '請重新',
			registered: '註冊',
			resetAccountSuccess: '的密碼已重置成功~',
			passwordResetText: '重置密碼確認郵件已發送至',
			notMailbox: 'oops~此郵箱尚未註冊',
			hasMailbox: 'oops~此郵箱已經被註冊了'
		},
		menu: {
			dashboard: '控制台',
			connections: '数据源',
			dataSync: '數據同步',
			dataTransmission: '數據傳輸',
			dataFlows: '數據採集',
			dataFlowsAll: '全部任務',
			dataFlowsRunning: '運行中任務',
			dataFlowsError: '出錯任務',
			dataFlowsPaused: '已暫停任務',
			dataFlowsDraft: '編輯中任務',
			dataGovernance: '數據治理',
			metadataDefinition: '數據目錄',
			dataQuality: '數據質量',
			timeToLive: '生命週期管理',
			dataMap: '數據地圖',
			dataRules: '數據規則',
			dictionary: '字典模型',
			dataPublish: '數據發布',
			modules: 'API 發布',
			dataExplorer: 'API 數據瀏覽',
			apiDocAndTest: 'API 文檔及測試',
			apiAnalysis: 'API 統計分析',
			applications: 'API 客戶端',
			apiServers: 'API 服務器',
			dataCollect: '數據採集（旧）',
			system: '系統管理',
			tasks: '調度任務',
			agentdownload: '代理下載',
			clusterManagement: '集群管理',
			agents: '進程管理',
			serversOversee: '運維',
			users: '用戶管理',
			journal: '用戶操作日誌',
			roles: '角色管理',
			settings: '系統設置',
			favorite: '我的收藏',
			dataVerification: '数据校验',
			delFavMenu: '删除收藏',
			license: 'License信息',
			licenseBefore: '提醒：License剩餘 ',
			licenseAfter: ' 天到期',
			licenseAfterOneDay: ' 天到期',
			licenseDate: 'License到期時間',
			dataFlowsCustom: '數據同步',
			dataFlowsClusterClone: '數據庫遷移'
		},
		Home: {
			all: '全部',
			syncJobsOverview: '同步任務概覽',
			migrationJobsOverview: '遷移任務概覽',
			allTask: '全部任務',
			transmissionOverview: '傳輸總覽',
			transferTask: '傳輸任務',
			wrongTask: '錯誤任務',
			taskRanking: '任務傳輸排行',
			serverProcess: '服務器與進程',
			syncJobsStatus: '同步任務狀態',
			migrationJobsStatus: '遷移任務狀態',
			before: '前',
			pcs: '條',
			server: '服務器',
			managementSide: '管理端',
			taskTransfer: '任務傳輸',
			apiService: 'API服務',
			totalOutput: '總輸出',
			totalInput: '總寫入',
			bar: '條',
			starting: '啟動中',
			running: '運行中',
			stopping: '關閉中',
			stopped: '已關閉',
			initialization: '初始化中',
			loadingFinished: '初始化完成',
			incremental: '增量中',
			incrementalLag: '增量滯後'
		}
	},
	message: {
		api: {
			get: {
				error: '加載數據失敗.',
				loading: '正在加載數據'
			}
		},
		comfirm: '您確定要',
		operationSuccuess: '操作成功',
		modifyName: '修改名稱',
		ok: '確定',
		exists_name: '名稱已存在',
		search: '搜索',
		serviceCluMange: '服務集群管理',
		statusLog: '狀態日誌',
		sourchName: '名稱搜索',
		placeholderServer: '請輸入服務器名稱',
		filter: '篩選',
		addServerMon: '添加服務監控',
		startUp: '啟動',
		close: '關閉',
		manageSys: '管理後台',
		restart: '重啓',
		syncGover: '同步治理',
		screen: '屏幕',
		delete: '刪 除',
		cancel: '取 消',
		confirm: '確定',
		placeholderMonServer: '請輸入監控的服務名稱',
		placeholderCommand: '請輸入command',
		nullContent: '不能為空',
		saveOK: '保存成功',
		saveFail: '保存失敗',
		copyFail: '複製失敗',
		copySuccess: '複製成功',
		deleteOK: '刪除成功',
		deleteFail: '刪除失敗',
		stopFail: '停止失敗',
		taskStart: '任務啟動中',
		selectTime: '選擇時間',
		selectDate: '選擇日期',
		server: '服務器',
		serviceType: '服務類型',
		level: '級別',
		placeholderSelect: '請選擇',
		time: '時間',
		hostName: '主機名',
		ipAddress: 'ip地址',
		uniqueEncode: '唯一編碼',
		logs: '日誌信息',
		closeSever: '關閉服務',
		restartServer: '重啓服務',
		startServer: '啟動服務',
		deleteOrNot: '是否刪除',
		startupAfter_delete: '請啟動後刪除',
		startupAfter_add: '請啟動後添加',
		noData: '暫無數據',
		prompt: '提示',
		resetMessage: '重置任務將清除任務同步進度，任務將從頭執行, 確定重置?',
		deteleMessage: '刪除任務將無法恢復, 確定刪除任務',
		deteleJobMessage: '刪除任務將無法恢復, 確定刪除?',
		forceStoppingMessage: '強制停止將立即中斷數據傳輸，是否繼續執行?',
		stopInitial_syncMessage: '初始化類型的任務暫停後如果再次啟動，任務會從頭開始同步，確定暫停？',
		stopMessage: '確定要暫停任務嗎?',
		cancelReset: '已取消重置',
		resetOk: '重置成功',
		resetFailed: '重置失敗',
		notRest: '請選擇正確的數據進行重置',
		operator: '操作',
		edit: '修改',
		clickRelatedTasks: '點擊查看相關任務',
		currentTaskOpen: '當前任務已打開',
		noRelatedTask: '暫無相關任務',
		loadingSchema: '源庫schema尚未加載完成，暫時無法啟動',
		reloadSchemaSuccess: '模型更新成功',
		reloadSchemaError: '模型更新失敗'
	},

	dataFlow: {
		batchSortOperation: '批量分類操作',
		selectRowdata: '請選擇行數據',
		clusterClone: '數據庫遷移',
		custom: '數據同步',
		searchNode: '查找節點',
		updateModel: '更新模型',
		loadingText: '加載中',
		databseMigrationHead: '數據庫遷移 -  新手引導模式',
		dataMigrationHead: '數據同步',
		databseProcessingHead: '數據處理同步',
		databseFreedomHead: '數據庫遷移',
		createNew: '新建',
		DissedNoAction: 'oops~ 被禁用的節點或連線不能被刪除、連入或連出',
		guidingMode: '引導模式',
		advancedMode: '標準模式',
		freedomMode: '轉標準模式',
		advanceSetting: '更多高級設置',
		closeSetting: '收起',
		openPanel: '展開',
		execution: '開始執行',
		previous: '上一步',
		next: '下一步',
		sourceSetting: '設置源庫',
		targetSetting: '設置目標庫',
		advancedetting: '高級設置',
		simpleSceneTitle: '創建數據庫複製任務',
		sourceLibrarySetting: '源庫結構與對象設置',
		databseMigration:
			'以引導的模式幫助新手用戶快速了解數據庫之間的遷移。數據庫遷移能快速地實現數據庫之間(內置表批量過濾和改名等設置)的結構、全量和增量遷移',
		databsenProcessing:
			'以引導的模式幫助新手用戶快速了解表級的數據處理與同步，此功能除了能實現表級的全量或增量傳輸除功能外，更註重使用各種處理器(JS處理、字段過濾、聚合處理、行級過濾等)進行復雜的邏輯處理，以滿足用戶更高的數據處理需求',
		databseFreedom:
			'數據遷移功能可幫助用戶在壹個任務內輕松實現多個同構或異構數據庫、文件之間的結構遷移、初始化遷移、或增量遷移等功能。',
		dataFreedom:
			'數據同布聚焦在表級別的數據處理與傳輸，可實現多表合並、數據拆分、關聯映射、字段增減合並、內容過濾、聚合處理、JS處理等功能的實時數據同步。',
		multiError: {
			allSelectionError: '選中的任務狀態不允許這種操作',
			notFound: '此任務不存在',
			statusError: '任務狀態不允許這種操作',
			otherError: '操作失敗，請重試'
		},
		changeName: '改名',
		Enable: '啟用',
		Disable: '禁用',
		draftNotStart: '任務配置未完成，無法啟動',
		systemHint: '系統提示',
		systemText: '系統檢測出有如下任務上次操作後未保存，請問是否繼續編輯',
		stystemOpen: '打開',
		stystemOpenAll: '全部打開',
		stystemDeleteAll: '全部刪除',
		stystemLgnoreAll: '全部忽略',
		newTaksName: '新任務未命名',
		selectNode: '請選擇節點',
		submitExecute: '提交執行',
		submitOnly: '僅提交',
		implementationModalities: '執行方式',
		submitConfirmation: '提交確認',
		SyncPoint: '增量採集開始時刻',
		cdcLabel: '數據源:',
		syncType: '同步類型',
		SyncInfo: {
			localTZ: '當前時區傳輸時間：系統所在時區下，開始傳輸任務的時刻',
			current: '當前時區時間：默認當前時間',
			connTZ: '數據庫時區傳輸時間： 數據庫所在時區下，開始傳輸任務的時刻',
			localTZType: '用戶瀏覽器時區',
			currentType: '此刻',
			connTZType: '數據庫時區'
		},
		Current: '當前時間',
		SyncTime: '同步時間',
		batchDelete: '批量刪除',
		batchRest: '批量重置',
		bulkExport: '批量導出',
		bulkImport: '批量導入',
		bulkScheuled: '批量啟動',
		bulkStopping: '批量停止',
		taskBulkFx: '函数',
		taskBulkOperation: '批量操作',
		taskBulkTag: '设置分类',
		upload: '點擊上傳',
		import: '任務導入',
		uploadOK: '上傳成功',
		uploadError: '上傳失敗',
		uploadInfo: '點擊查看詳情',
		dataFlowExport: '導出',
		addTag: '添加標籤',
		overWrite: '覆蓋已有數據',
		skipData: '跳過已有數據',
		loadingError: '加載失敗,請',
		dataLoading: '數據努力加載中...',
		loadLogTip: '運行日誌努力加載中，可能需要5~10秒，請稍等......',
		noLogTip: '沒有數據',
		clickLoadTxt: '點擊加載',
		average: '平均',
		current: '當前',
		allNode: '全部節點',
		taskName: '任務名稱',
		creatdor: '創建人',
		ownedUser: '所屬用戶',
		ownedLibrary: '所屬庫',
		creationTime: '啟動時間',
		state: '狀態',
		executionTime: '本次執行時間',
		finishTime: '本次結束時間',
		inputNumber: '本次輸入',
		outputNumber: '本次輸出',
		sourceLibrary: '源庫',
		targetLibrary: '目標庫',
		rowCount: '條數',
		inputOutput: '輸入輸出統計',
		transf: '傳輸耗時',
		taskDetail: '任務詳情',
		nodeDetail: '節點信息',
		dataScreening: '數據統計',
		timePoint: '增量所處時間點',
		unit: '單位',
		article: '條',
		secondUnit: '秒',
		second: '秒',
		min: '分',
		hour: '時',
		day: '日',
		input: '輸入',
		output: '輸出',
		totalInput: '總輸入',
		totalOutput: '總輸出',
		totalInsert: '總插入',
		totalUpdate: '總更新',
		totalDelete: '總刪除',
		category: '類別',
		replicate: '數據同步差距',
		throughputpop: '平均每秒源端數據採集的速度以及目標端寫入的速度，數值越大越好',
		transtime_pop:
			'傳輸耗時：除源節點外，事件處理完的時間減去事件的發生時間。節點間統計：事件從進入節點到輸出到所消耗的時間。任務流統計：所有節點耗時相加，數值越小越好',
		replicate_pop: '源庫和目標庫數據最後更新時間的差距，數值越小越好',
		status: {
			running: '運行中',
			paused: '已暫停',
			draft: '編輯中',
			scheduled: '調度中',
			stopping: '停止中',
			error: '錯誤',
			force_stopping: '強制停止',
			cdc: '增量中',
			initializing: '初始化中',
			initialized: '初始化完成',
			Lag: '增量滯後'
		},
		lag: '滯後',
		executionStatus: '執行狀態',
		searchPlaceholder: '任務名稱/節點名/庫表名',
		dataRange: '創建日期範圍',
		startTime: '開始時間',
		endTime: '結束時間',
		separator: '至',
		dataPlaceholder: '選擇時間範圍',
		taskStatus: '運行狀態',
		taskStatusPlaceholder: '請選擇任務狀態',
		taskSettingPlaceholder: '請選擇任務同步類型',
		updateTime: '更新時間',
		runningSpeed: '運行速度',
		taskSwitch: '运行开关',
		operate: '操作',
		dataMap: '數據地圖',
		edit: '編輯',
		copy: '複製',
		reset: '重置',
		cut: '剪切',
		paste: '粘貼',
		undo: '撤銷',
		redo: '重做',
		selectAll: '全選',
		amplification: '放大',
		zoomOut: '縮小',
		down: '向下',
		up: '向上',
		selectMultipleNode: '選擇多節點',
		mouseDrag: '鼠標拖拽',
		detail: '任务监控',
		select_source_connection: '源端連接',
		select_sync_mode: '同步方式',
		mapping: '關聯關係',
		select_target_connection: '目標端連接',
		sync_mode: '同步模式',
		sync_type: '同步類型',
		initial_sync: '初始化',
		cdc: '增量同步',
		send_email: '發送郵件',
		stopped: ' 當任務停止',
		error: '當任務出錯',
		edited: '當任務被編輯',
		started: '當任務開啟',
		drop_target_before_start: '開啟任務前是否刪除目標表',
		run_custom_sql: '重複運行自定義SQL',
		stop_on_error: '遇到錯誤停止',
		need_to_create_Index: '自動創建索引',
		is_schedule: '定期調度任務',
		cron_expression: '調度cron表達式',
		data_quality_tag: '添加數據質量標籤',
		notification_lag: '通知',
		isOpenAutoDDL: '自動處理DDL',
		transformerConcurrency: '目標寫入線程數',
		processorConcurrency: '處理器線程數',
		send_email_when_replication: '幾秒後重新發送',
		send_email_at_most_one_replication: '超過多少秒取消發送',
		read_cdc_interval: '增量同步間隔',
		read_batch_size: '每次讀取數量',
		cdcDataProcess: '增量數據處理機制',
		batch: '批量',
		onebyone: '逐條',
		mission: '描述',
		yes: 'yes',
		no: 'no',
		cronExpression: '請輸入調度表達式',
		selectGrpupFiled: '請選擇分組字段',
		selectTargetField: '請選擇目標字段',
		aggName: '子處理名稱',
		nodeName: '節點名稱',
		nodeType: '節點類型',
		aggFunction: '聚合函數',
		aggExpression: '作用目標',
		filterPredicate: '過濾器',
		groupByExpression: '分組字段',
		aggregation: '聚合處理',
		enterFilterTable: '請輸入過濾表內容',
		nameTip: '後續節點的腳本編輯需要引用此子處理的名稱進行指定的數據處理，故不同的子處理名稱不可重複。 ',
		button: {
			submit: '提交執行',
			viewConfig: '查看節點配置',
			viewMonitoring: '查看監控數據',
			setting: '設置',
			logs: '日誌',
			preview: '預覽',
			capture: '數據檢視',
			stop_capture: '停止檢視',
			start: '啟動',
			stop: '停止',
			force_stop: '強制停止',
			reset: '重置',
			save: '保存',
			saveDraft: '保存草稿',
			saveing: '保存中',
			reloadSchema: '刷新schema',
			debug: 'debug測試',
			quantitative: '定量',
			increment: '增量'
		},
		save_before_running: '請先保存再運行',
		reset_job: {
			msg: '重置任務?',
			tip: '提示'
		},
		stop_job: {
			msg: '停止任務?',
			force_stop_msg: '強制停止任務?',
			tip: '提示'
		},
		file_preview_fields: {
			file_name: '文件名稱',
			file_size_ondisk: '文件大小(Byte)',
			file_modify_time_ondisk: '更新時間',
			file_create_time_ondisk: '創建時間',
			file_path: '文件路徑'
		},
		importantReminder: '重要提醒',
		modifyEditText: '編輯任務如果修改了',
		nodeLayoutProcess: '節點排版流程',
		nodeAttributes: '節點屬性',
		matchingRelationship: '匹配關係',
		afterSubmission: '提交後必須',
		runNomally: '才能正常運行',
		editLayerTip: ' 否則可能導致異常錯誤，請問您要繼續編輯嗎?',
		continueEditing: '繼續編輯',
		setting: {
			distinctWriteType: '去重寫入機制',
			intellect: '智能去重寫入',
			compel: '強制去重寫入',
			intellectTip: '智能去重寫入：對目標已有數據進行智能檢測，去重的同時能極大提升傳輸性能',
			compelTip: '強制去重寫入：對目標已有數據進行強制去重檢測，嚴格保證精準度但傳輸性能較低',
			batchTip: '批量：對監測到的增量數據進行批量傳輸處理，性能較高',
			onebyoneTip: '逐行：對監測到的增量數據進行逐條處理，性能較差',
			sync_type_tip: '關閉數據集節點的聚合設置才能修改傳輸類型，已開啟節點:'
		},
		skipError: {
			skipErrorSettings: '跳過錯誤設定',
			tip: '請勾選則要跳過的錯誤，這些錯誤將在本次啟動後再次遇到時將會被跳過一次。',
			attention: '注意：若導致錯誤的髒數據未被處理，跳過錯誤可能導致這條髒數據被丟棄。',
			startJob: '啟動任務',
			cancel: '取消',
			taskName: '任务名'
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
		nodeSettings: '節點設置',
		choose: '選擇',
		newTxt: '新建',

		noResult: '未搜索到相關結果',
		cell: {
			validate: {
				empty_name: '名稱必填.',

				none_setting: '設置不能為空.',
				none_stage: '至少由一個節點.',
				none_data_node: '至少有兩個數據節點',
				none_link_node: '至少有一個連線',
				start_with_data_node: '必須使用數據節點作為源',
				acyclic: '數據處理流程不能有循環'
			},
			data_node: {
				database: {
					name: '數據庫',
					tip: '任意類型數據庫',
					defaultText: '數據庫',
					tableSuffix: '表後綴',
					tablePrefix: '表前綴',
					none_database: '數據庫必填.',

					form: {
						placeholder: '請選擇數據庫',
						label: '數據庫'
					},
					remove: '移除',
					Undo: '撤銷',
					bulkRemoval: '批量移除',
					bulkRevocation: '批量撤銷',
					queueCopied: '待遷移表',
					tableRemoved: '已移除表',
					enterName: '請輸入名稱/字段名進行搜索',
					source: '數據源',
					type: '數據庫類型',
					databaseName: '數據庫名',
					account: '數據庫賬號',
					attributionAccount: '歸屬賬號名',
					includeTable: '包含表'
				},
				collection: {
					name: '數據集',
					tip: 'MongoDB 數據集',
					defaultText: '數據集',

					none_database: '數據庫必填.',
					none_collection: '數據集必填.',
					none_pk: '主鍵必填.',

					form: {
						database: {
							label: '數據庫',
							placeholder: '請選擇MongoDB數據庫'
						},
						collection: {
							label: '數據集',
							placeholder: '請選擇數據集'
						},
						pk: {
							label: '主鍵',
							placeholder: '請輸入主鍵'
						},
						fieldFilterType: {
							keepAllFields: '不過濾字段',
							retainedField: '保留字段',
							deleteField: '刪除字段'
						},
						fieldFilter: {
							placeholderKeep: ' 請選擇要保留的字段',
							placeholderDelete: ' 請選擇要刪除的字段'
						},
						fieldFilterTip: {
							label: '字段過濾',
							keepAllFields: '不過濾字段：保留此數據集的全部字段',
							retainedField: '保留字段：選擇此項操作，將保留所選擇的字段，捨棄其它字段全部.',
							deleteField: '删除字段：選擇此項操作，將刪除所選擇的字段，保留其它全部字段.'
						},
						dropTable: {
							label: '已存在的數據',
							placeholder: '',
							keep: '保持已存在的數據',
							remove: '運行前刪除已存在的數據'
						},
						initialSyncOrder: {
							keep: '啟用自定義初始化順序',
							open: '開啟',
							close: '關閉'
						},
						filter: {
							label: '過濾條件',
							invalidJSON: '無效的JSON',
							fiflterSetting: '過濾設置',
							fieldFilter: '智慧模式',
							openFiflter: '開啟過濾',
							closeFiflter: '關閉過濾',
							sqlFilter: 'SQL模式',
							mqlFilter: 'MQL模式',
							saveFields: '保留字段',
							allField: '全部字段',
							deleteField: '刪除字段',
							rowLimit: '行數限制',
							allRows: '全部行數',
							oneThousandRows: '1000行',
							tenThousandRows: '10000行',
							placeholder: {
								savefield: '請選擇保留字段',
								delField: '請選擇',
								selectField: '請選擇字段',
								Operator: '運算符',
								enterContent: '請輸入條件內容',
								placeholder: '過濾條件(Mongo Query Filter Document)'
							}
						},
						aggregation: {
							aggregationText: '聚合設置',
							disabled: '已禁用',
							enabled: '已啟用',
							preview: '預覽',
							previewSampleData: '採樣數據預覽',
							addTextTip: '沒有預覽樣本數據',
							addTextTip1: '請輸入MongoDB聚合代碼，然後重定向“預覽”以在此處預覽樣本數據',
							filterAggreTip: '聚合設置與過濾設置不可同時開啟',
							seetingAggreTip: '此功能僅在初始化任務下可用'
						}
					}
				},
				table: {
					name: '表',
					tip: 'RDBMS 表',
					defaultText: '表',
					none_database: '數據庫必填.',
					none_table: '表必填.',
					none_pk: '主鍵必填.',

					form: {
						database: {
							label: '數據庫',
							placeholder: '請選擇數據庫'
						},
						table: {
							label: '表',
							placeholder: '請選擇表，區分大小寫'
						},
						custom_sql: {
							label: '自定義SQL',
							placeholder: '請輸入自定義SQL',
							mplaceholder: '請輸入自定義MQL'
						},
						initial_offset: {
							label: '自定義SQL增量條件',
							placeholder: '請輸入自定義SQL增量條件'
						},
						maximum_transaction: {
							label: '事務最大時長(小時)',
							tip: '等待事務提交的時間(小時)。輸入您期望事務需要的最長時間。默認為12小時'
						}
					}
				},
				file: {
					tip: '文件節點',
					name: '文件',
					none_fileName: '文件名不能為空',
					configurationFile: '配置文件',
					choiceFileName: '請選擇文件名'
				},
				gridfs: {
					name: 'GridFS',
					tip: 'GridFS節點',
					chooseGridFsName: '請選擇GridFS',
					none_collection: '數據集必填.',
					none_pk: '主鍵必填.',
					gridFs_isNull: 'GridFS不能為空'
				},
				dummy: {
					name: 'Dummy',
					tip: 'Dummy節點',
					chooseDummyName: '請選擇Dummy',
					dummy_isNull: 'Dummy不能為空',
					none_collection: '數據集必填.',
					none_pk: '主鍵必填.'
				},
				api: {
					name: 'API',
					tip: 'api節點',
					chooseApiName: '請選擇API',
					api_isNull: 'API不能為空',
					none_collection: '數據集必填.',
					none_database: '數據庫必填.',
					none_pk: '主鍵必填.',
					dataApiName: '數據發布API名稱',
					description: '描述',
					method: '方法',
					fieldSettings: '字段設置',
					table_field: '字段',
					table_type: '類型',
					table_setting: '設置',
					publishName: '發布API',
					enterPublishApiName: '請輸入數據發布API的名稱',
					enterNewlyReleasedApi: '請輸入對新建發布API的描述',
					enterEndUrl: '請輸入url末端路徑名',
					required: '必填',
					availableQueries: '可用查詢',
					publishApi_path: 'API路徑不為空',
					variable_name: '只能包含字母，數字，下劃線和美元符號，和數字不能開頭'
				},
				redis: {
					name: 'Redis',
					tip: 'Redis節點',
					chooseRedisName: '請選擇Redis',
					Redis_isNull: 'Redis不能為空',
					prefixKey: '緩存鍵前綴',
					prefixKey_placeholder: '請輸入緩存鍵前綴',
					cacheKey: '設置緩存鍵 ',
					cacheKey_placeholder: '請輸入緩存鍵前綴 '
				},
				es: {
					name: 'ES',
					tip: 'Elastic search節點',
					configurationES: '配置Elastic search',
					chooseESName: '請選擇Elastic search',
					es_isNull: 'Elastic search不能為空'
				},
				custom: {
					tip: 'Custom節點',
					name: 'Custom',
					none_fileName: 'Custom不能為空',
					chooseCustomName: '請選擇Custom'
				},
				memCache: {
					tip: '記憶體緩存節點',
					name: '記憶體緩存',

					applicationCode: '應用程式碼',

					form: {
						cacheName: {
							label: '緩存名稱',
							placeholder: '請輸入緩存名稱',
							none: '緩存名稱必填'
						},
						cacheKeys: {
							label: '緩存鍵',
							placeholder: '請選擇緩存鍵',
							none: '緩存鍵必填'
						},
						maxSize: {
							label: '緩存最大容量',
							placeholder: '請輸入緩存最大容量',
							none: '緩存最大容量必填',
							options: {
								unlimited: '容量不限',
								custom: '自定義最大緩存容量'
							}
						},
						maxRows: {
							label: '緩存最大記錄數',
							placeholder: '請輸入緩存最大記錄數',
							none: '緩存最大記錄數必填',
							unit: '條',
							options: {
								unlimited: '條數不限',
								custom: '自定義最大記錄條數'
							}
						}
					}
				},
				logminer: {
					add: '添加',
					day: '天',
					name: '日誌挖掘',
					tip: '日誌挖掘器',
					miningLogTime: '挖掘日誌時間',
					logSaveTime: '日誌保存時長',
					logSourceSetting: '日誌源設置',
					currentTimeZone: '當前時區',
					databaseTimeZone: '數據庫時區',
					allTables: '全部表',
					reservationTable: '保留表',
					exclusionTable: '排除表',
					nodeFunDes: '節點功能說明',
					function: '功 能',
					functionContent:
						'此節點用於採集指定數據庫和表的日誌，保存到MongoDB數據庫，共享日誌數據不需要重複開 啟日誌採集進程，能極大緩解源庫資源的佔用和浪費。 ',
					connectionTarget: '連接目標',
					connectionText: '只能連接Collection節點',
					tableFilter: {
						placeSletSource: '請選擇採集的數據源',
						tableFilter: ' 請選擇要保留的表',
						placeholderDelete: '請選擇要排除的表'
					},
					validate: {
						name: '節點名稱不能為空',
						source: '數據源不能為空',
						table: '數據表不能為空',
						sameConnection: '不能選擇相同連接'
					}
				}
			},

			processor: {
				aggregate: {
					name: '聚合',
					tip: '聚合處理器',
					defaultText: '聚合',
					none_function: '聚合函數必填.',
					none_group: '分組表達式必填.',
					none_name: '子處理名稱必填',
					none_aggregation_expression: '目標字段必填.',
					new_aggregate: '添加聚合',
					none_stage: '至少有一个聚合处理',
					none_subprocessingName: '子處理名稱不能為空',
					name_notRepeated: '子處理名稱不能重複',
					returnExample: '返回示例',
					school_name: 'school_name: "第一實驗小學"',
					idComment: '// "students_sum" 自定義的子處理名稱，多個子處理名稱不可重複',
					countComment: '// COUNT為選擇的函數, 132為函數值；如果函數是MAX, 則名稱為MAX',
					school_nameComment: ' // 分組匯總的欄位名，如果不填寫則不顯示'
				},
				field: {
					name: '字段',
					tip: '字段處理器',
					defaultText: '字段處理器',

					form: {
						name: {
							label: '節點名稱',
							placeholder: '請輸入節點名稱'
						},
						description: {
							label: '描述',
							placeholder: '請輸入節點描述'
						},
						toUpperCase: '轉大寫',
						delete: '删除',
						toLowerCase: '轉小寫',
						fieldName: '字段名稱',
						fieldType: '字段類型',
						addField: '添加字段',
						addEmbedField: '添加內嵌字段',
						scriptDialogTitle: '設置字段腳本',
						expression: '請輸入表達式',
						example: '示例',
						exampleRow1: 'var result = "a" + "b" // 字符串拼接, result的結果為 "ab"',
						exampleRow2: 'var result = 1 + 2 // 數字計算, result 的結果為 3',
						exampleRow3: 'var result = fn("1") // 調用自定義函數或內置函數, result的結果為 fn 函數的返回值',
						exampleRow4:
							'var result = record.isTrue ? true : false // 三元表達式, result的值根據判斷表達式（record.isTrue）的結果為 true 或 false'
					}
				},
				script: {
					name: '腳本',
					tip: '腳本處理器',
					defaultText: '腳本處理器',

					none_script_type: '腳本類型必填.',
					none_script: '腳本必填.',

					debug_button_label: '調試腳本',
					warning_for_not_save: '當前任務未保存，無法進行連接測試，請保存之後再嘗試',
					connect_server_fail: '連接服務器失敗',

					debug: {
						top_header: '調試腳本',
						bottom_header: '調試詳情',
						detail: {
							parameter: '輸入',
							return: '輸出'
						},
						order: '調試順序',
						status: '返回狀態',
						status_error: '錯誤',
						status_success: '成功',
						time: '耗時',
						log: '日誌'
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
					name: '數據過濾',
					tip: '行級數據過濾',
					validate: {
						none_expression: '條件表達式不能為空',
						none_action: '執行動作不能為空'
					},
					form: {
						name: {
							label: '節點名稱',
							placeholder: '請輸入節點名稱'
						},
						expression: {
							label: '條件表達式',
							placeholder: '請輸入表達式',
							labelTip: '表達式可以使用JavaScript中的比較符和計算符'
						},
						action: {
							label: '執行動作',
							discard: '丟棄',
							retain: '保留'
						},
						expressionExample: {
							label: '表達式示例',
							labelTip: '表達式可以使用JavaScript中的比較符和計算符',
							tip: '篩選出50歲以上的男性或者收入一萬以下的30歲以上的人,表達式如下：'
						},
						symbol: {
							label: '支持的符號',
							gtLt: '大於、小於',
							geLe: '大於等於、小於等於',
							eq: '等於',
							not: '非',
							and: '且',
							or: '或',
							regexp: '正則表達式',
							group: '條件分組'
						}
					}
				},
				jointCache: {
					name: '關聯緩存',
					tip: '關聯緩存節點',
					form: {
						name: {
							label: '節點名稱',
							placeholder: '請輸入節點名稱',
							none: '節點名稱必填'
						},
						cacheId: {
							label: '對應緩存節點',
							placeholder: '請選擇本任務內內存緩存節點',
							none: '請選擇本任務內內存緩存節點'
						},
						joinSettings: {
							label: '關聯設置',
							cacheKey: '緩存表主鍵',
							sourceKey: {
								label: '源表關聯鍵',
								placeholder: '請選擇關聯字段'
							},
							none: '請選擇關聯字段'
						},
						joinKey: {
							label: '寫入路徑',
							placeholder: '請選擇或創建寫入路徑字段'
						}
					}
				}
			},
			link: {
				none_join_type: '關聯類型必填',
				none_join_key: '關聯字段必填',
				none_join_path: '關聯寫入路徑必填',
				none_array_unique_key: '合併進數組時，必須提供唯一鍵',
				repeatId: {
					title: '_id字段衝突',
					message:
						'目標資料模型已存在 _id 字段，系統默認會移除已重複的_id字段，如想保留，請使用字段處理器對源錶的 _id 進行重命名！'
				},
				form: {
					label: {
						label: '标签',
						placeholder: '请输入标签'
					},
					joinMethod: {
						label: '不匹配數據插入方式',
						placeholder: '請選擇數據插入方式'
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
						label: '关联條件',
						sourceField: '源字段',
						targetField: '目标字段'
					},
					arrayUniqueKey: {
						label: '內嵌數組匹配條件',
						placeholder: '內嵌數組匹配條件'
					}
				},

				methodList: {
					false: '丟棄',
					true: '寫入'
				},

				writeMode: {
					append: '追加寫入',
					upsert: '更新已存在或插入新數據',
					update: '更新寫入',
					merge_embed: '更新內嵌數組'
				},
				existingSchema: {
					label: '對目標端已存在的結構和數據的處理',
					keepSchema: '保持目標端已存在的結構和數據',
					keepExistedData: ' 保持目標端已存在的結構，僅刪除數據',
					removeSchema: ' 刪除目標端已存在的結構和數據'
				},
				migrationSetting: '複製對象設置',
				dataProcessing: '已有數據處理',
				prefixAndSuffix: '加前後綴',
				keepExistingData: '保持已存在數據',
				deleteExistingData: '運行前刪除已存在數據',
				reduction: '還原',
				migrationObjece: '待複製表',
				chosen: '已選擇',
				searchContent: '搜索內容',
				mappingRelations: '映射關係',
				addPrefix: '添加前綴',
				addSuffix: '添加後綴',
				prefixPlaceholder: '請輸入前綴',
				suffixPlaceholder: '請輸入後綴',
				batchRename: '批量改名設置',
				tableNameExample: '表名示例',
				copySourceDatabase: '複製源庫結構類型',
				tableTip: 'Table暫不支持外鍵複製',
				viewTip: '複製view暫不支持表改名，勾選此項下方表改名功能會被禁用',
				formTip: 'View、function、procedure的複制功能僅支持MySQL到MySQL的場景',
				chooseATableTip: '至少選擇一個待複製表'
			}
		},
		ui: {
			sidebar: {
				setting: '任務設置',
				node_setting: '節點屬性',
				logs: '日誌',
				capture: '抓取數據',
				style: '樣式',

				data_nodes: '數據節點',
				processor: '處理節點',
				tableSelector: '快速選擇'
			},
			toolbar: {
				undo: {
					tip: '撤銷'
				},
				redo: {
					tip: '重做'
				},
				clear_paper: {
					tip: '清空'
				},
				export_svg: {
					tip: '導出SVG'
				},
				export_png: {
					tip: '導出PNG'
				},
				print: {
					tip: '打印'
				},
				to_back: {
					tip: '置後'
				},
				to_front: {
					tip: '置前'
				},
				layout: {
					tip: '自動佈局'
				},
				zoom_to_fit: {
					tip: '填充可視區域'
				},
				zoom_out: {
					tip: '縮小'
				},
				zoom_in: {
					tip: '放大'
				},
				grid_size: {
					tip: '網格大小'
				},
				fullscreen: {
					tip: '切換全屏'
				}
			},
			nodeLoadSchemaDiaLog: '如果數據源有更新，此操作會更新此例程的模型，是否繼續？',
			allNodeLoadSchemaDiaLog: '如果數據源有更新，此操作會更新各例程的模型，是否繼續？'
		},
		preview: {
			stage: '節點',
			table: '數據表'
		}
	},
	dataVerify: {
		row: '行數校驗',
		hash: '哈希校驗',
		advance: '高級校驗',
		dataVerify: '數據校驗',
		dataWay: '校驗方式',
		range: '採樣範圍',
		operate: '操作',
		source: '源表',
		target: '目標表',
		sourceDatabase: '數據源',
		targetDatabase: '目標源',
		sourceText: '請選擇源表',
		targetText: '請選擇目標表',
		sourceDatabaseText: '請選擇數據源',
		targetDatabaseText: '請選擇目標源',
		dataVerifySetting: '校驗條件設置',
		confirm: '確認',
		start: '開始校驗',
		back: '返回',
		add: '添加',
		refresh: '刷新',
		cancel: '取消',
		overView: '校驗總覽',
		time: '校驗時間',
		duration: '耗時',
		result: '校驗結果',
		linageDifference: '總體行數差',
		errorTotal: '不匹配條數',
		accuracyRate: '準確率(%)',
		errorComparison: '錯誤對比',
		again: '再次校驗',
		rows: '按行數校驗',
		sampleRate: '按百分比',
		condition: '採樣範圍',
		filter: '过滤',
		filterMQL: '請輸入MQL語句',
		filterSQL: '行數校驗下僅支持 select count(*) 查詢語句',
		exampleSQL: '示例: select count(*) from tablename_1 where field__2 = A;',
		exampleMQL: '示例: db.collection_1.count({ field_2:A })',
		exampleHashSQL:
			'請輸入 SELECT 查詢語句 哈希校驗下SQL僅支持select查詢語句, 不支持count/sum/avg/max等查詢 示例: select field_1 from tablename_1 where field__2 > A；',
		exampleHashMQL: '請輸入MQL查詢語句 示例: db.collection_1.find ({ field_2:A },{ field_1:1 })',
		exampleJS: '请输入JS代码, 高级校验JS必须返回return值, 具体请查看示例',
		showResult: '顯示數據校驗結果',
		verifyRunningInfo: '後台運行',
		verifyStatusWaiting: '校驗階段1-3:數據校驗排隊中，請等待... 點擊',
		verifyStatusDraft: '校驗階段2-3:數據校驗調度中，請等待... 點擊',
		verifyStatusValidating: '校驗階段3-3:數據校驗執行中，請等待... 點擊',
		verifyStatusInterrupted: '數據校驗終止中，請等待... 點擊',
		verifyStatusStop: '終止校驗',
		verifyStatusCompleted: '數據校驗結果加載中',
		or: '或',
		psc: '條',
		all: '全部',
		setting: {
			title: '校驗默認設置',
			text: '校驗設置為全局的校驗設置，創建的校驗任務裡的高級設置的優先級高於此處的設置。 ',
			keepTimeLabel: '校驗歷史結果和詳情信息保留時間',
			errorSaveSumLable: '校驗出每張表的錯誤信息保存數量限制',
			errorDifferenceResult: '校驗結果允許的差異數據容錯量',
			lineNumberFrequency: '行數校驗間隔頻率',
			lineNumVerfyDuration: '行數校驗持續時間',
			intervalFrequency: '內容校驗間隔頻率',
			verifyDuration: '內容校驗持續時間',
			verifyStartTime: '內容校驗開始執行時間',
			verifySetting: '校验設置'
		}
	},
	dataMap: {
		source: '來源',
		tapdata: 'Tapdata',
		API: '數據發布',
		noneData: '沒有查找到數據模型',

		classification: '數據模型',
		topLevel: '頂級',
		dbLevel: '庫級',
		tableLevel: '表級',
		fieldLevel: '字段映射',
		infoSource: '數據源',
		infoDAAS: '數據中台',
		infoAPI: 'API',
		dblclickDataModel: '請雙擊數據模型打開字段映射',
		properties: {
			name: '名稱',
			type: '分類',
			path: '路徑',
			database_type: '數據庫類型',
			database_host: '數據庫IP',
			database_username: '數據庫用戶',
			database_port: '數據庫端口',
			database_uri: '數據庫連接',
			database_name: '數據庫名稱',
			original_name: '原名稱'
		}
	},
	apiInfo: {
		basicAttributes: '基本屬性',
		trquestMethod: '請求方式',
		status: '狀態',
		supportFormat: '支持格式',
		founder: '創建人',
		interfaceClassification: '接口分類',
		modifyTime: '修改時間',
		interface: '接口分類',
		version: '版本',
		parameter: '參數',
		typesof: '類型',
		is_required: '是否必填',
		examples: '示例',
		requestParameters: '請求參數',
		responseParameters: '響應參數',
		requestExample: '請求示例',
		backExamples: '返回示例',
		announcing: '發布中',
		apiTest: 'API文檔及測試',
		isPublishAPI: '是否確認發布api?',
		unpublish_api: '是否確認取消發布api?',
		apiPublishSuccess: '已發布',
		apiPublishError: 'api發布失敗',
		apiUnpublishSuccess: '未發布'
	},
	dataForm: {
		title: '新建數據庫',
		saveSuccess: '測試通過並創建成功',
		saveFail: '保存失敗',

		submit: '保存',
		cancel: '取消',
		test: {
			title: '連接測試',
			success: '測試通過',
			fail: '測試未通過',
			testing: '測試中...'
		},
		form: {
			connectionName: '連接名稱',
			databaseType: '數據庫類型',
			connectionType: '連接類型',
			host: '數據庫地址',
			port: '端口',
			databaseName: '數據庫名稱',
			databaseSchema: '數據庫模式',
			userName: '帳號',
			password: '密碼',
			nodeName: '編目節點名稱',
			tableFilter: '包含表',
			additionalString: '其他連接串參數',
			isUrl: '是否使用URI',
			databaseUri: '數據庫 URI',
			ssl: '使用 TLS/SSL 連接',
			sslKey: '用戶端私鑰',
			sslPass: '私鑰密碼',
			sslValidate: '驗證服務端證書',
			sslCA: '證書頒發機构',
			thinType: '認證方式',
			databaseOwner: '數據庫歸屬帳戶名',
			timeZone: '時間類型的時區',

			databaseHostPlaceholder: '資料庫地址（127.0.0.1/Domain:{端口}，多個地址請用，分開）',

			uriTips: {
				label: '示例',
				content:
					`<b>MongoDB 數據庫連接 URI 示範:</b><br>` +
					`複製集: mongodb://192.168.0.100:27017/mydb?replicaSet=xxx<br>` +
					`啟用認證的複製集: mongodb://admin:password@192.168.0.100:27017/mydb?replicaSet=xxx&authSource=admin<br>` +
					`多節點複製集: mongodb://192.168.0.1:27017,192.168.0.2:27017,192.168.0.3:27017/mydb?replicaSet=xxx<br>` +
					`分片集: mongodb://192.168.0.100:27017/mydb<br>` +
					`多個mongos: mongodb://192.168.0.1:27017,192.168.0.2:27017,192.168.0.3:27017/mydb<br>`
			},
			tableFilterTips: '逗號分割的表達式列表，使用*代表任意長度任意字符',
			timeZoneTips: '影響類型: DATE',

			options: {
				sourceAndTarget: '源頭和目標',
				source: '源頭',
				target: '目標'
			}
		},
		error: {
			connectionNameExist: '連接名稱已存在',
			noneHost: '數據庫地址不能為空',
			nonePort: '端口不能為空',
			portNumber: '端口必須為數位',
			portRange: '端口號取值範圍 1 ~ 65535',
			noneSslKey: '用戶端私鑰不能為空',
			noneSslCA: '證書頒發機构不能為空'
		},
		createDatabase: '新建數據庫',
		copyDatabase: '複製數據庫名',
		checkDatabase: '查看詳情',
		createTable: '創建新表',
		copyTable: '複製表名',
		createCollection: '創建新數據集',
		copyCollection: '複製數據集'
	},
	formBuilder: {
		noneText: '不能為空',
		file: {
			placeholder: '請選擇文件',
			button: '選擇文件'
		},
		input: {
			placeholderPrefix: '請輸入'
		}
	},
	metaData: {
		title: '數據分類',
		nameExist: '分類名稱已存在',
		ddNode: '新增同級分類',
		addChildernNode: '新增子分類',
		editNode: '編輯',
		deleteNode: '刪除',
		nodeName: '請輸入分類名稱',
		deteleMessage: '此操作會將該分類下存在的子類都刪除，是否刪除'
	},
	notification: {
		notice: '消息通知',
		viewMore: '查看全部',
		setting: '通知設置',
		allNotice: '全部通知',
		unreadNotice: '未讀消息',
		maskRead: '標記本頁為已讀',
		maskReadAll: '標記全部為已讀',
		systemNotice: '系统通知',
		userNotice: '用戶操作',
		noticeCenter: '通知中心',
		dataFlow: '任務',
		manageSever: '管理端',
		noticeType: '請選擇消息類型',
		noticeLevel: '請選擇消息級別',
		inspect: '校驗任務',
		started: '已啟動',
		paused: '已暫停',
		edited: '被編輯',
		deleted: '被刪除',
		abnormallyStopped: '意外停止',
		stoppedByError: '出錯停止',
		startupFailed: '啟動失敗',
		stopFailed: '停止失敗',
		encounterERRORSkipped: '運行中跳過一個ERROR',
		CDCLag: 'CDC滯後超時',
		manageSeverRestartFailed: '管理端服務重啟失敗',
		APISeverRestartFailed: 'API服務重啟失敗',
		SYNCSeverRestartFailed: '同步治理服務重啟失敗',
		connectionInterrupted: '斷開連接',
		manageSeverStartFailed: '管理端服務啟動失敗',
		APISeverStartFailed: 'API服務啟動失敗',
		SYNCSeverStartFailed: '同步治理服務啟動失敗',
		manageSeverStopFailed: '管理端服務停止失敗',
		APISeverStopFailed: 'API服務停止失敗',
		SYNCSeverStopFailed: '同步治理服務停止失敗',
		APISeverAbnormallyStopped: 'API服務意外停止',
		SYNCSeverAbnormallyStopped: '同步治理服務意外停止',
		manageSeverAbnormallyStopped: '管理端服務意外停止',
		manageSeverStartedSuccessfully: '管理端服務已啟動',
		APISeverStartedSuccessfully: 'API服務已啟動',
		SYNCSeverStartedSuccessfully: '同步治理服務已啟動',
		manageSeverStoppedSuccessfully: '管理端服務已停止',
		APISeverStoppedSuccessfully: 'API服務已停止',
		SYNCSeverStoppedSuccessfully: '同步治理服務已停止',
		manageSeverRestartedSuccessfully: '管理端服務已重啟',
		APISeverRestartedSuccessfully: 'API服務已重啟',
		SYNCSeverRestartedSuccessfully: '同步治理服務已重啟',
		newSeverCreatedSuccessfully: '新服務監控被創建',
		newSeverDeletedSuccessfully: '新服務監控被刪除',
		databaseDDLChanged: '監測到數據庫DDL變化',
		inspectVerifyJobCount: 'Count有差異',
		inspectVerifyJobValue: '內容有差異',
		inspectVerifyJobDelete: '被刪除',
		inspectVerifyJobError: '運行error',
		settingCenter: '設置中心',
		systemSetting: '系統設置',
		noticeSetting: '通知設置',
		tip: '此處通知設置為系統全局通知的設置，任務編排頁的通知設置的其優先級高於此處的全局通知設置',
		jobOperationNotice: '任務運行通知',
		emailNotice: '郵件通知',
		jobStarted: '任務被啟動',
		jobPaused: '任務被停止',
		jobDeleted: '任務被刪除',
		jobEdited: '任務被編輯',
		jobStateError: '任務狀態error',
		jobEncounterError: '任務遇到錯誤',
		noticeInterval: '發送間隔',
		CDCLagTime: 'CDC滯後通知',
		lagTime: '滯後時間',
		DDL: '數據庫DDL變化',
		agentNotice: 'Agent通知',
		serverDisconnected: '服務器斷開連接',
		agentAbnormallyStopped: 'Agent服務意外停止',
		agentStarted: 'Agent服務被啟動',
		agentStopped: 'Agent服務被停止',
		agentFailed: 'Agent服務啟動失敗',
		agentStop: 'Agent服務停止失敗',
		agentCreated: 'Agent被創建',
		agentDeleted: 'Agent被刪除',
		inspectCount: '校驗任務count差異',
		inspectValue: '校驗任務内容差異',
		inspectDelete: '校驗任務被刪除',
		inspectError: '校驗任務運行error',
		ddlDeal: 'DDL處理',
		sourceName: '源連接',
		databaseName: '數據庫名',
		schemaName: '模型名',
		placeholder: {
			user: '請選擇操作人',
			keyword: '按數據源/任務名搜索'
		},
		account: '用戶',
		operation: {
			create: '創建了',
			update: '更新了',
			delete: '刪除了',
			start: '啟動了',
			stop: '停止了',
			forceStop: '強制停止了',
			reset: '重置了',
			copy: '複製了',
			upload: '導出了',
			download: '下載了'
		},
		modular: {
			connection: '數據源',
			dataflow: '數據傳輸任務',
			inspect: '校驗任務'
		}
	},
	dialog: {
		createTable: '創建新表',
		placeholderTable: '僅支持英文、數字、下劃線、點、減號，並以英文字母開頭，不允許system開頭',
		createCollection: '創建新數據集 ',
		placeholderCollection: '僅支持英文、數字、下劃線、點、減號，並以英文字母開頭，不允許system開頭',
		tableValidateTip: '新建表名稱僅支持英文、數字、下劃線、點、減號，並以英文字母開頭，不允許system開頭',
		collectionValidateTip:
			'新建數據集名稱僅支持英文、數字、下劃線下劃線、點、減號，並以英文字母開頭，不允許system開頭',
		downAgent: {
			headTitle: 'Agent下載與安裝',
			headInterpretation: 'Tapdata DFS雲版需要在本地安裝agent以確保連接數據庫和傳輸服務正常運行',
			downloadInstall: '下載安裝',
			text: '直接在要安裝的機器上使用以下命令下載安裝agent',
			copy: '複製命令',
			refresh: '刷新',
			copied: '已復制',
			downloadInstallInstructions: '下載安裝說明',
			linuxInstructionsText1: '· 直接在安裝agent的Linux機器上使用上述命令進行下載並啟動',
			linuxInstructionsText2: '· 執行命令後自動下載並啟動安裝包',
			linuxInstructionsText3: '· 下載和安裝包含agent包（64M）和Java程序包（160M）',
			waitingInstall: '等待安裝',
			agentNum: 'Agent已安裝數',
			downLoadAgent: '下載Agent',
			windowsText: '下載到待安裝的機器上，在存放下載文件的目錄下執行複制下述命令進行安裝',
			windowsInstructionsText1: '· 點擊“下載Agent”下載Agent至windows環境的機器',
			windowsInstructionsText2: '· 下載後復制上述命令並在Agent文件存放目錄下執行安裝',
			windowsInstructionsText3: '· 執行命令後系統將自動安裝並啟動Agent',
			windowsInstructionsText5: '· Agent安裝啟動成功後執行任務將不再彈出此頁面',
			noAgent: '您尚未安裝Agent,無法執行傳輸任務，請',
			clickDownLoad: '點擊下載安裝',
			dfsSuccessText: 'DFS代理安裝成功，',
			dfsSuccessText1: '或點擊',
			dfsSuccessText2: '創建數據傳輸任務，體驗Tapdata DFS急速數據傳輸功能',
			dfsSuccessText3: 'DFS代理安裝成功，任務',
			dfsSuccessText4: '已啟動執行',
			creatTask: '新建任務',
			clickView: '點擊查看',
			ok: '好的'
		}
	},
	dataVerification: {
		verifyDetail: '校驗詳情',
		sourceTable: '源表',
		targetTable: '目標表',
		sourceRows: '源/目標表行數',
		verifyResult: '校驗結果',
		rowConsistent: '行數差異',
		contConsistent: '內容差異',
		verifyHistory: '校驗歷史',
		tableDetail: '表明細',
		configuration: '查看配置',
		verifyName: '校驗任務',
		sourceTotalRows: '源總行數',
		targetTotalRows: '目標總行數',
		verifyStatus: '校驗狀態',
		verifystatus: '校驗狀態',
		verifyTime: '校驗時間',
		operation: '操作',
		rowVerify: '快速count校驗',
		contentVerify: '表全字段值校驗',
		jointVerify: '關聯字段值校驗',
		singleVerify: '單次校驗',
		repeatingVerify: '重複校驗',
		consistent: '一致',
		toBeVerified: '待校驗',
		verifying: '校驗中',
		verifyFinished: '校驗完成',
		verifyJobExpired: '校驗任務結束',
		executeVerifyInstantly: '執行校驗',
		deleteVerifyJob: '刪除',
		verifySetting: '校驗設置',
		batchVerify: '批量校驗',
		verifyJobName: '校驗任務名',
		verifyjobname: '校驗任務名',
		verifyType: '校驗類型',
		verifytype: '校驗類型',
		singleRepeatingVerify: '單次/重複校驗',
		rowAndContConsistent: '行數和內容差異',
		sourceFieldName: '源表字段名',
		targetFieldName: '目標字段名',
		Value: '值',
		inconsistentType: '差異類型',
		chooseJob: '選擇任務',
		frequency: '校驗頻次',
		startTime: '開始時間',
		LastTime: '結束時間',
		verifyInterval: '校驗間隔',
		inconsistent: '錯誤數據保存條數',
		table: '待校驗表',
		addTable: '添加表',
		automaticallyAdd: '自動添加',
		enable: '已啟用',
		disable: '已禁止',
		newVerify: '新建校驗',
		edit: '編輯校驗',
		clickVerified: '點下方按鈕添加校驗表',
		ChoosePKField: '請選索引或主鍵字段',
		indexField: '索引字段',
		BasicSettings: '基本設置',
		verifyCondition: '校驗條件',
		clear: '清空',
		fastCountTip: '快速count僅對源表和目標表的行數進行count校驗，速度極快，但是不會展示差異的具體字段內容。 ',
		contentVerifyTip: '全表字段值校驗會對源表和目標表的全部字段進行逐行校驗，能查出所有字段的差異，但是速度慢。 ',
		jointFieldTip: '關聯鍵校驗只對源表和目標表的關聯字段的值進行比對校驗，速度快於全表字段值校驗模式.',
		waiting: '待校驗',
		scheduling: '校驗啟動中',
		error: 'Error',
		done: '校驗結束',
		running: '校驗中',
		verifyProgress: '校验进度',
		tasksTime: '請選擇起止時間',
		tasksDataFlow: '請選擇任務',
		tasksJobName: '請輸入校驗任務名稱',
		tasksVerifyCondition: '請添加校驗條件',
		tasksVerifyInterval: '請輸入校驗間隔',
		lackSource: '校驗條件中源表或目標表未選擇',
		lackIndex: '校驗條件中源表或目標表的索引字段未選擇',
		tasksAmount: '校驗條件中源表與目標表的索引字段個數不相等',
		uniqueField: '唯一字段差異',
		otherField: '其他字段差異',
		back: '返回',
		startVerify: '正在執行校驗',
		deleteMessage: '刪除校驗任務將無法恢復, 確定刪除',
		executeVerifyTip: '執行校驗',
		addVerifyTip: '新建校驗任務',
		historyTip: '校驗歷史',
		detailTip: '校驗詳情',
		configurationTip: '校驗配置',
		deleteTip: '刪除',
		checkStatusPre: '此任務處於 ',
		checkStatusSuffix: '狀態，無法配置校驗設置'
	},
	queryBuilder: {
		addCond: '字段條件'
	},
	tableFlow: {
		task_view: '任務視圖',
		table_view: '表視圖',
		source_target_table: '源表/目標表',
		task_execution_time: '所在任務/執行時間',
		status_text: '狀態',
		stage: '階段',
		output_input: '輸出/輸入(條)',
		speed: '速度(條/s)',
		rows: '行數',
		opear: '操作',
		output: '輸出',
		input: '輸入',
		row_count_check: '行數檢查',
		batch_verification: '批量校驗'
	},
	account: {
		accountSettings: '個人設置 ',
		setCenter: '設置中心',
		systemSetting: '系統設置',
		noticeSetting: '通知設置',
		email: '郵箱',
		userName: '用戶名',
		password: '密碼',
		accessCode: '訪問碼',
		changePassword: '修改密碼',
		currentPassword: '請輸入當前密碼',
		newPassword: '請輸入新密碼',
		confirmPassword: '再次確認密碼',
		changeEmail: '修改郵箱',
		enterMailbox: '請輸入郵箱',
		enterNewMailbox: '請輸入新郵箱',
		changeUsername: '修改用戶名',
		newUsername: '請輸入新的用戶名',
		sendEmail: '發送驗證郵件',
		samePawTip: '新密碼不能與原密碼相同!',
		newPawInconsistent: '與新密碼不一致!',
		pawSaveSuccess: '密碼保存成功',
		currerPawErrorTip: '當前密碼錯誤，請輸入正確的密碼',
		nameModifySuccess: '名稱修改成功',
		passwordNotCN: '密碼僅允許英文、數字和英文標點符號'
	}
};

export default tc;
