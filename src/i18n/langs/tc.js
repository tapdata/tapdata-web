import tcLocale from 'element-ui/lib/locale/lang/zh-TW';

const tc = {
	...tcLocale,
	message: {
		api: {
			get: {
				error: '加載數據失敗.',
				loading: '正在加載數據'
			}
		},
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
		deleteOrNot: '是否刪除',
		startupAfter_delete: '請啟動後刪除',
		startupAfter_add: '請啟動後添加',
		noData: '暫無數據',
		prompt: '提示',
		resetMessage: '重置任務將重新執行該項任務, 確定要重新執行任務嗎?',
		deteleMessage: '刪除任務將無法恢復, 請問確定要刪除任務嗎?',
		forceStoppingMessage: '強制停止將立即中斷數據傳輸，是否繼續執行?',
		stopInitial_syncMessage: '初始化類型的任務暫停後如果再次啟動，任務會被重新執行，確定要暫停任務嗎？',
		stopMessage: '確定要暫停任務嗎?',
		cancleReset: '已取消重置',
		resetOk: '重置成功',
		resetFailed: '重置失敗',
		notRest: '請選擇正確的數據進行重置',
		operator: '操作',
		edit: '修改',
		clickRelatedTasks: '點擊查看相關任務',
		currentTaskOpen: '當前任務已打開',
		noRelatedTask: '暫無相關任務'
	},
	dataFlow: {
		draftNotStart: '編輯中不能啟動，請進入編輯頁面啟動',
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
		SyncPoint: '同步節點',
		SyncInfo: {
			localTZ: '當前時區傳輸時間：系統所在時區下，開始傳輸任務的時刻',
			current: '當前時區時間：默認當前時間',
			connTZ: '數據庫時區傳輸時間： 數據庫所在時區下，開始傳輸任務的時刻',
			localTZType: '當前時區傳輸時間',
			currentType: '當前時區時間',
			connTZType: '數據庫時區傳輸時間'
		},
		Current: '當前時間',
		SyncTime: '同步時間',
		batchDelete: '批量刪除',
		batchRest: '批量重置',
		bulkExport: '批量導出',
		bulkScheuled: '批量啟動',
		bulkStopping: '批量停止',
		upload: '點擊上傳',
		import: '任務導入',
		uploadOK: '上傳成功',
		uploadError: '上傳失敗',
		uploadInfo: '點擊查看詳情',
		dataFlowExport: '導出',
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
		creationTime: '創建時間',
		state: '狀態',
		executionTime: '本次執行時間',
		inputNumber: '本次輸入',
		outputNumber: '本次輸出',
		rowCount: '條數',
		inputOutput: '輸入輸出統計',
		transf: '傳輸耗時',
		dataScreening: '數據總覽',
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
			force_stopping: '強制停止'
		},
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
		stop_on_error: '遇到錯誤時停止同步',
		need_to_create_Index: '自動創建目標索引',
		is_schedule: '定期調度任務',
		cron_expression: '調度cron表達式',
		data_quality_tag: '添加數據質量標籤',
		notification_lag: '通知',
		isOpenAutoDDL: '自動處理DDL操作',
		transformerConcurrency: '目標寫入線程數',
		processorConcurrency: '處理器線程數',
		send_email_when_replication: '幾秒後重新發送',
		send_email_at_most_one_replication: '超過多少秒取消發送',
		read_cdc_interval: '增量同步間隔(ms)',
		read_batch_size: '每次讀取多少',
		mission: '描述',
		yes: 'yes',
		no: 'no',
		cronExpression: '請輸入調度表達式',
		selectGrpupFiled: '請選擇分組字段',
		selectTargetField: '請選擇目標字段',
		aggName: '子處理名稱',
		nodeName: '節點名稱',
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
		continueEditing: '繼續編輯'
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
					queueCopied: '待複製隊列',
					tableRemoved: '已移除表',
					enterName: '請輸入名稱/字段名進行搜索'
				},
				collection: {
					name: '數據集',
					tip: 'MongoDB 數據集',
					defaultText: '數據集',

					none_database: 's數據庫必填.',
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
						dropTable: {
							label: '已存在的數據',
							placeholder: '',
							keep: '保持已存在的數據',
							remove: '運行前刪除已存在的數據'
						},
						initialSyncOrder: {
							keep: '啟用自定義初始化順序'
						},
						filter: {
							label: '過濾條件',
							placeholder: '過濾條件(Mongo Query Filter Document)',
							invalidJSON: 'Invalid JSON'
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
							placeholder: '請輸入自定義SQL'
						},
						initial_offset: {
							label: '自定義SQL增量條件',
							placeholder: '請輸入自定義SQL增量條件'
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
					name_notRepeated: '子處理名稱不能重複'
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
						scriptDialogTitle: '設置字段腳本'
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
						label: '插入方式',
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
						label: '关联条件',
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
				}
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
			}
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
		source: '源表',
		target: '目標表',
		operate: '操作',
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
		accuracyRate: '準確率',
		errorComparison: '錯誤對比',
		again: '再次校驗',
		rows: '按行數校驗',
		sampleRate: '按百分比',
		condition: '校驗條件'
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
		}
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
	}
};

export default tc;
