<template>
	<div class="database nodeStyle">
		<head>
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
						></el-button>
						<DatabaseForm ref="databaseForm" @success="loadDataSource"></DatabaseForm>
					</div>
				</el-form-item>

				<el-form-item
					required
					:label="$t('editor.cell.data_node.collection.form.dropTable.label')"
					v-if="!isSourceDataNode"
				>
					<el-select v-model="model.dropTable" size="mini">
						<el-option
							:label="$t('editor.cell.data_node.collection.form.dropTable.keep')"
							:value="false"
						></el-option>
						<el-option
							:label="$t('editor.cell.data_node.collection.form.dropTable.remove')"
							:value="true"
						></el-option>
					</el-select>
				</el-form-item>

				<div class="databaseInfo">
					<span v-show="database_type">{{ database_type }}</span>
					<span v-show="database_host">{{ database_host }}</span>
					<span v-show="database_port">{{ database_port }}</span>
				</div>
			</el-form>
		</div>
		<div class="table-block">
			<div v-for="(pane, index) in tabs" :key="index" class="check-all" v-show="activeName == index && !disabled">
				<el-checkbox v-model="pane.checkAll" @input="checkAll"></el-checkbox>
				<span @click="moveAll()">{{ pane.checkAllLabel }}</span>
			</div>
			<el-tabs class="e-tabs" v-model="activeName">
				<el-tab-pane
					class="tab-pane"
					v-for="(pane, index) in tabs"
					:key="index"
					:name="index + ''"
					:label="pane.label + '(' + filterTables[index].length + ')'"
				>
					<div class="search">
						<el-input
							:disabled="disabled"
							:placeholder="$t('editor.cell.data_node.database.enterName')"
							prefix-icon="el-icon-search"
							clearable
							v-model="pane.keyword"
							@input="
								tabs[activeName].checkAll = false;
								checkAll();
							"
						>
						</el-input>
					</div>
					<el-row class="table-preffix-box" :gutter="10" v-if="index === 0">
						<el-col style="width: 50%">
							<el-input
								clearable
								:disabled="disabled"
								v-model="model.table_prefix"
								:placeholder="$t('editor.cell.data_node.database.tablePrefix')"
							></el-input>
						</el-col>
						<el-col style="width: 50%">
							<el-input
								:disabled="disabled"
								clearable
								v-model="model.table_suffix"
								:placeholder="$t('editor.cell.data_node.database.tableSuffix')"
							></el-input>
						</el-col>
					</el-row>
					<el-row
						class="list"
						v-for="item in filterTables[index]"
						:class="{ active: item.checked }"
						:key="item.id"
						:gutter="20"
					>
						<el-col :span="1">
							<el-checkbox
								v-model="item.checked"
								:disabled="disabled"
								@input="tabs[activeName].checkAll = false"
							></el-checkbox>
						</el-col>
						<el-col :span="17" style="padding-left:20px;">
							<i class="iconfont icon-table2"></i>
							<span class="tableName">{{ item.table_name }}</span>
						</el-col>
						<el-col :span="5" class="text-center" v-if="!disabled">
							<el-button type="text" @click="move([item])">{{ pane.buttonLabel }}</el-button>
						</el-col>
					</el-row>
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>

<script>
import factory from '../../../api/factory';
import _ from 'lodash';
import DatabaseForm from '../../../view/job/components/DatabaseForm/DatabaseForm';

let connections = factory('connections');
let editorMonitor = null;
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
			disabled: false,
			activeName: '0',
			tabs: [
				{
					list: [],
					checkAll: false,
					keyword: '',
					label: this.$t('editor.cell.data_node.database.queueCopied'),
					checkAllLabel: this.$t('editor.cell.data_node.database.bulkRemoval'),
					buttonLabel: this.$t('editor.cell.data_node.database.remove')
				},
				{
					list: [],
					checkAll: false,
					keyword: '',
					label: this.$t('editor.cell.data_node.database.tableRemoved'),
					checkAllLabel: this.$t('editor.cell.data_node.database.bulkRevocation'),
					buttonLabel: this.$t('editor.cell.data_node.database.Undo')
				}
			],

			isSourceDataNode: false,

			databaseSelectConfig: {
				size: 'mini',
				placeholder: this.$t('editor.cell.data_node.database.form.placeholder'),
				loading: false,
				filterable: true,
				on: {
					change() {
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
				includeTables: [],
				dropTable: false,
				table_prefix: '',
				table_suffix: ''
			},
			database_type: '',
			database_port: '',
			database_host: '',
			database_uri: ''
		};
	},

	computed: {
		filterTables() {
			let pane_0 = this.tabs[0];
			let pane_1 = this.tabs[1];
			return {
				0: this.filter(pane_0.list, pane_0.keyword),
				1: this.filter(pane_1.list, pane_1.keyword)
			};
		}
	},

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
		setData(data, cell, isSourceDataNode, vueAdapter) {
			this.model = {
				connectionId: '',
				includeTables: [],
				dropTable: false,
				table_prefix: '',
				table_suffix: ''
			};
			if (data) {
				_.merge(this.model, data);
			}

			this.isSourceDataNode = isSourceDataNode;
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
			this.model.includeTables = [];
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
			if (!connectionId) {
				return;
			}
			connections.get([connectionId]).then(result => {
				if (result.data) {
					let tables = (result.data.schema && result.data.schema.tables) || [];
					tables = tables.sort((t1, t2) =>
						t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
					);
					let modelIncludeTables = this.model.includeTables || [];
					let inList = [];
					let outList = [];
					if (!modelIncludeTables.length) {
						inList = tables;
						this.model.includeTables = inList.map(t => t.table_name);
					} else {
						tables.forEach(t => {
							if (modelIncludeTables.includes(t.table_name)) {
								inList.push(t);
							} else {
								outList.push(t);
							}
						});
					}
					this.tabs[0].list = inList;
					this.tabs[1].list = outList;

					if (this.database_type !== 'mongodb') {
						this.database_host = result.data.database_host;
						this.database_port = result.data.database_port;
					}
				}
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
		checkAll() {
			let pane = this.tabs[this.activeName];
			let checkAll = pane.checkAll;
			let filterList = this.filterTables[this.activeName];
			filterList.map(item => {
				item.checked = checkAll;
			});
		},

		move(list) {
			this.tabs[this.activeName].checkAll = false;
			let inList = this.tabs[0].list;
			let outList = this.tabs[1].list;
			let sourceList = this.activeName === '0' ? inList : outList;
			let targetList = this.activeName === '0' ? outList : inList;

			list.forEach(item => {
				item.checked = false;

				let tableIndex = sourceList.findIndex(table => table.table_name === item.table_name);
				sourceList.splice(tableIndex, 1);

				targetList.push(item);
			});

			targetList.sort((t1, t2) => (t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1));

			this.model.includeTables = inList.map(t => t.table_name);
		},

		moveAll() {
			let list = this.filterTables[this.activeName];
			this.move(list.filter(t => t.checked));
		},

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

	.table-block {
		position: relative;
		height: calc(100% - 165px);

		.check-all {
			position: absolute;
			right: 25px;
			line-height: 36px;
			z-index: 2;
			font-size: 12px;

			span {
				padding-left: 3px;
				cursor: pointer;
			}

			span:hover {
				color: #48b6e2;
			}
		}

		.el-tabs {
			height: 100%;
			.el-tabs__nav {
				margin: 0 25px;

				.el-tabs__item {
					font-size: 12px;
				}

				.el-tabs__active-bar {
					height: 4px;
				}
			}

			.el-tabs__content {
				height: calc(100% - 55px);
			}

			.el-tab-pane {
				height: 100%;
				overflow: auto;
			}

			.list {
				width: 100%;
				height: 36px;
				line-height: 36px;
				margin: 0 !important;
				padding: 0 15px;
				font-size: 12px;
				overflow: hidden;

				.iconfont {
					color: #4aaf47;
				}

				.el-button--text {
					font-size: 12px;
					opacity: 0;
					visibility: hidden;
				}

				.text-right {
					text-align: right;
				}

				.text-center {
					text-align: center;
				}

				.el-checkbox {
					opacity: 0;
					visibility: hidden;
				}
			}

			.list:hover,
			.active {
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

	.search {
		width: 100%;
		padding: 0 25px 10px;
		box-sizing: border-box;
		// overflow: hidden;
		.el-input,
		.el-input__inner,
		.el-input__icon {
			height: 30px;
			line-height: 30px;
			font-size: 12px;
		}
	}
	.table-preffix-box {
		width: 100%;
		padding: 0 13px 0 25px;
		box-sizing: border-box;
		// overflow: hidden;
		.el-input,
		.el-input__inner,
		.el-input__icon {
			height: 30px;
			line-height: 30px;
			font-size: 12px;
		}
	}
	.databaseInfo {
		span {
			display: inline-block;
			overflow: hidden;
			margin: 5px 20px 0 0;
			padding: 5px 10px;
			font-size: 12px;
			color: #666;
			text-overflow: ellipsis;
			background: #eee;
			border-radius: 10px;
		}
	}
}
</style>
