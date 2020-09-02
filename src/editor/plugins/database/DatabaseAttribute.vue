<template>
	<div class="database nodeStyle">
		<head class="head">
			<span class="headIcon iconfont icon-you2" type="primary"></span>
			<span class="txt">{{ $t('editor.nodeSettings') }}</span>
		</head>
		<div class="nodeBody">
			<div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div>

			<el-form
				class="e-form"
				label-position="top"
				label-width="160px"
				:model="model"
				ref="form"
				:disabled="disabled"
			>
				<el-form-item
					class="e-form"
					:label="$t('editor.cell.data_node.database.form.label')"
					prop="connectionId"
					:rules="rules"
					required
				>
					<div style="display:flex;">
						<FbSelect v-model="model.connectionId" :config="databaseSelectConfig"></FbSelect>
						<el-button
							size="mini"
							icon="el-icon-plus"
							style="padding: 7px;margin-left: 7px"
							@click="$refs.databaseForm.show()"
							>{{ $t('dataFlow.createNew') }}</el-button
						>
						<DatabaseForm ref="databaseForm" @success="loadDataSource"></DatabaseForm>
					</div>
				</el-form-item>
			</el-form>

			<div class="database-info">
				<ul class="info-box">
					<li>
						<span class="label">{{ $t('editor.cell.data_node.database.source') }}:</span>
						<span class="text">{{ databaseInfo.connection_type }}</span>
					</li>
					<li>
						<span class="label">{{ $t('editor.cell.data_node.database.type') }}:</span>
						<span class="text">{{ databaseInfo.database_type }}</span>
					</li>
					<li>
						<span class="label">Host/Port:</span>
						<span class="text">{{ databaseInfo.database_host }}:{{ databaseInfo.database_port }}</span>
					</li>
					<li>
						<span class="label"> {{ $t('editor.cell.data_node.database.databaseName') }}: </span>
						<span class="text">{{ databaseInfo.database_name }}</span>
					</li>
					<li>
						<span class="label"> {{ $t('editor.cell.data_node.database.account') }}: </span>
						<span class="text">{{ databaseInfo.database_username }}</span>
					</li>
					<li>
						<span class="label"> {{ $t('editor.cell.data_node.database.attributionAccount') }}: </span>
						<span class="text">{{ databaseInfo.database_owner }}</span>
					</li>
				</ul>

				<div class="info-table">
					<div class="head-text">
						{{ $t('editor.cell.data_node.database.includeTable') }}
						<span>{{ model.databaseTables.length }}</span>
					</div>
					<ul class="table-box" v-loading="tableLoading">
						<li v-for="item in model.databaseTables" :key="item.id" class="list">
							<i class="iconfont icon-table2"></i>
							<span class="tableName">{{ item }}</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import factory from '../../../api/factory';
import _ from 'lodash';
import DatabaseForm from '../../../view/job/components/DatabaseForm/DatabaseForm';

let connections = factory('connections');
let editorMonitor = null;
let clear = false;
export default {
	name: 'Database',

	components: {
		DatabaseForm
	},

	props: {
		connection_type: {
			type: String,
			default: 'source'
		}
	},

	data() {
		let self = this;
		return {
			tableLoading: false,
			disabled: false,
			activeName: '0',

			isSourceDataNode: false,

			databaseSelectConfig: {
				size: 'mini',
				placeholder: this.$t('editor.cell.data_node.database.form.placeholder'),
				loading: false,
				filterable: true,
				on: {
					change() {
						self.model.removeAllTables = false;
						self.changeConnection();
					}
				},
				options: []
			},

			rules: {
				connectionId: [
					{
						required: true,
						trigger: 'blur',
						message: this.$t('editor.cell.data_node.database.form.placeholder')
					}
				]
			},
			model: {
				connectionId: '',
				databaseTables: [],
				dropTable: false,
				table_prefix: '',
				table_suffix: ''
			},
			databaseInfo: {
				connection_type: '',
				database_type: '',
				database_port: '',
				database_host: '',
				database_uri: '',
				database_owner: '',
				database_name: '',
				database_username: ''
			}
		};
	},

	// computed: {
	// 	filterTables() {
	// 		let pane_0 = this.tabs[0];
	// 		let pane_1 = this.tabs[1];
	// 		return {
	// 			0: this.filter(pane_0.list, pane_0.keyword),
	// 			1: this.filter(pane_1.list, pane_1.keyword)
	// 		};
	// 	}
	// },

	mounted() {
		this.loadDataSource();
	},

	watch: {
		model: {
			deep: true,
			handler() {
				this.$emit('dataChanged', this.getData());
			}
		}
	},

	methods: {
		setData(data, cell, dataNodeInfo, vueAdapter) {
			if (data) {
				_.merge(this.model, data);
			}

			this.isSourceDataNode = dataNodeInfo && !dataNodeInfo.isTarget;
			editorMonitor = vueAdapter.editor;
		},
		async loadDataSource() {
			this.databaseSelectConfig.loading = true;
			let result = await connections.get({
				filter: JSON.stringify({
					where: {
						database_type: { nin: ['file', 'dummy', 'gridfs', 'rest api'] }
					},
					fields: {
						name: 1,
						id: 1,
						database_type: 1,
						connection_type: 1,
						status: 1
					},
					order: 'name ASC'
				})
			});

			this.databaseSelectConfig.loading = false;
			if (result.data) {
				this.databaseSelectConfig.options = result.data.map(item => {
					return {
						id: item.id,
						name: item.name,
						label: `${item.name} (${this.$t('connection.status.' + item.status) || item.status})`,
						value: item.id
					};
				});

				this.lookupDatabaseType();
			}
		},

		changeConnection() {
			this.model.databaseTables = [];
			this.lookupDatabaseType();
		},

		lookupDatabaseType() {
			if (!this.model.connectionId) return;
			let selectedDbs = this.databaseSelectConfig.options.filter(db => db.id === this.model.connectionId);
			if (selectedDbs && selectedDbs.length > 0) {
				this.database_type = selectedDbs[0].database_type;
			}
			if (this.database_type === 'mongodb') {
				this.getMongoDBData(this.model.connectionId);
			} else {
				this.loadDataModels(this.model.connectionId);
			}
		},
		// 获取表名称
		loadDataModels(connectionId) {
			this.tableLoading = true;
			let self = this;
			if (!connectionId) {
				return;
			}
			connections
				.get([connectionId])
				.then(result => {
					if (result.data) {
						self.databaseInfo = result.data;
						let tables = (result.data.schema && result.data.schema.tables) || [];
						tables = tables.sort((t1, t2) =>
							t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
						);
						let modelIncludeTables = self.model.databaseTables || [];
						let inList = [];
						let outList = [];

						if (clear) {
							inList = tables.map(item => {
								item.checked = false;
								return item;
							});
							this.model.databaseTables = inList.map(t => t.table_name);
						} else {
							tables.forEach(t => {
								t.checked = false;
								if (modelIncludeTables.includes(t.table_name)) {
									inList.push(t);
								} else {
									outList.push(t);
								}
							});
						}
						self.tabs[0].list = inList;
						self.tabs[1].list = outList;
						self.$forceUpdate();

						// if (this.database_type !== 'mongodb') {
						// 	this.database_host = result.data.database_host;
						// 	this.database_port = result.data.database_port;
						// }
					}
				})
				.finally(() => {
					clear = false;
					this.tableLoading = false;
				});
		},
		getMongoDBData(connectionId) {
			if (!connectionId) {
				return;
			}
			connections.customQuery([connectionId]).then(result => {
				if (result.data) {
					this.loadDataModels([connectionId]);
					this.database_host = result.data.database_host;
					this.database_port = result.data.database_port;
				}
			});
		},
		filter(list, keyword) {
			let reg = new RegExp(keyword, 'ig');
			return keyword ? list.filter(t => t.table_name.match(reg)) : list;
		},
		// checkAll() {
		// 	let pane = this.tabs[this.activeName];
		// 	let checkAll = pane.checkAll;
		// 	let filterList = this.filterTables[this.activeName];
		// 	filterList.map(item => {
		// 		item.checked = checkAll;
		// 	});
		// },

		// move(list) {
		// 	this.tabs[this.activeName].checkAll = false;
		// 	let inList = this.tabs[0].list;
		// 	let outList = this.tabs[1].list;
		// 	let sourceList = this.activeName === '0' ? inList : outList;
		// 	let targetList = this.activeName === '0' ? outList : inList;

		// 	list.forEach(item => {
		// 		item.checked = false;

		// 		let tableIndex = sourceList.findIndex(table => table.table_name === item.table_name);
		// 		sourceList.splice(tableIndex, 1);

		// 		targetList.push(item);
		// 	});

		// 	targetList.sort((t1, t2) => (t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1));

		// 	this.model.includeTables = inList.map(t => t.table_name);
		// },

		// moveAll() {
		// 	let list = this.filterTables[this.activeName];
		// 	this.move(list.filter(t => t.checked));
		// },

		getData() {
			let result = _.cloneDeep(this.model);
			if (result.connectionId) {
				let database = this.databaseSelectConfig.options || [];
				database = database.filter(db => db.id === result.connectionId);

				if (this.isSourceDataNode) {
					delete result.dropTable;
				}

				if (database && database.length > 0) {
					result.name = database[0].name;
				}
			}
			return result;
		},

		setDisabled(disabled) {
			this.disabled = disabled;
		},

		seeMonitor() {
			editorMonitor.goBackMontior();
		}
	}
};
</script>
<style lang="less">
.database {
	.el-form-item {
		position: relative;
		margin-bottom: 14px;
	}

	// .search {
	// 	width: 100%;
	// 	padding: 0 25px 10px;
	// 	box-sizing: border-box;
	// 	// overflow: hidden;
	// 	.el-input,
	// 	.el-input__inner,
	// 	.el-input__icon {
	// 		height: 30px;
	// 		line-height: 30px;
	// 		font-size: 12px;
	// 	}
	// }
	// .table-preffix-box {
	// 	width: 100%;
	// 	padding: 0 13px 0 25px;
	// 	box-sizing: border-box;
	// 	// overflow: hidden;
	// 	.el-input,
	// 	.el-input__inner,
	// 	.el-input__icon {
	// 		height: 30px;
	// 		line-height: 30px;
	// 		font-size: 12px;
	// 	}
	// }
	// .databaseInfo {
	// 	span {
	// 		display: inline-block;
	// 		overflow: hidden;
	// 		margin: 5px 20px 0 0;
	// 		padding: 5px 10px;
	// 		font-size: 12px;
	// 		color: #666;
	// 		text-overflow: ellipsis;
	// 		background: #eee;
	// 		border-radius: 10px;
	// 	}
	// }
}
</style>
<style scoped lang="less">
.database {
	.head {
		display: block;
	}

	.nodeBody {
		height: 100%;
		box-sizing: border-box;
		overflow: hidden;
	}

	.database-info {
		height: calc(100% - 61px);
		.info-box {
			padding: 10px 20px;
			box-sizing: border-box;
			overflow: hidden;
			font-size: 12px;
			color: #666;
			border: 1px solid #dedee4;
			li {
				padding-bottom: 8px;
			}
			.label {
				display: inline-block;
				width: 100px;
				text-align: right;
				color: #999;
			}
			.text {
				padding-left: 10px;
			}
		}
		.info-table {
			height: calc(100% - 180px);
			margin-top: 10px;
			border: 1px solid #dedee4;
			.head-text {
				height: 28px;
				padding: 0 10px;
				line-height: 28px;
				font-size: 12px;
				color: #333;
				border-bottom: 1px solid #dedee4;
				background-color: #f5f5f5;
				span {
					color: #999;
				}
			}
			.table-box {
				height: calc(100% - 29px);
				overflow-y: auto;
			}
			.list {
				width: 100%;
				height: 36px;
				line-height: 36px;
				margin: 0 !important;
				padding: 0 15px;
				font-size: 12px;
				overflow: hidden;
				box-sizing: border-box;
				.iconfont {
					color: #4aaf47;
				}
			}

			.list:hover {
				.tableName {
					color: #48b6e2;
				}

				background-color: #e7f5fa;

				.el-checkbox {
					opacity: 1;
					visibility: visible;
				}

				.el-button--text {
					opacity: 1;
					visibility: visible;
				}
			}
		}
	}
}
</style>
