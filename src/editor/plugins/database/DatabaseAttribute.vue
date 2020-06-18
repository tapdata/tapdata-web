<template>
	<div class="database nodeStyle">
		<head>
			<span class="headIcon iconfont icon-you2" type="primary"></span>
			<span class="txt">{{ $t("editor.nodeSettings") }}</span>
		</head>
		<div class="nodeBody">
			<div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t("dataFlow.button.viewMonitoring") }}
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
					<el-select
						@change="changeConnection"
						filterable
						v-model="model.connectionId"
						:placeholder="$t('editor.cell.data_node.database.form.placeholder')"
						size="mini"
					>
						<el-option
							v-for="(item, idx) in databases"
							:label="`${item.name} (${$t('connection.status.' + item.status) || item.status})`"
							:value="item.id"
							v-bind:key="idx"
						></el-option>
					</el-select>
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
		<div class="processingBody">
			<div class="allCheck" v-if="activeName === 'first' && !disabled">
				<el-checkbox v-model="selectAllTables"></el-checkbox>
				<span @click="bulkRemoval()">{{ $t("editor.cell.data_node.database.bulkRemoval") }}</span>
			</div>

			<div class="allCheck" v-if="activeName === 'second' && !disabled">
				<el-checkbox v-model="selectAllRemoveTables"></el-checkbox>
				<span @click="bulkRevocation()">{{ $t("editor.cell.data_node.database.bulkRevocation") }}</span>
			</div>

			<el-tabs class="e-tabs" v-model="activeName">
				<el-tab-pane
					:label="$t('editor.cell.data_node.database.queueCopied') + '(' + computedTables.length + ')'"
					name="first"
				>
					<div class="search">
						<el-input
							:disabled="disabled"
							:placeholder="$t('editor.cell.data_node.database.enterName')"
							prefix-icon="el-icon-search"
							clearable
							v-model="search"
						>
						</el-input>
					</div>
					<el-row class="table-preffix-box" :gutter="10">
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
						:class="{ active: item.checked }"
						v-for="(item, index) in computedTables"
						:key="item.id"
						:gutter="20"
					>
						<el-col :span="1">
							<el-checkbox v-model="item.checked" :disabled="disabled"></el-checkbox>
						</el-col>
						<el-col :span="17" style="padding-left:20px;">
							<i class="iconfont icon-table2"></i>
							<span class="tableName">{{ item.table_name }}</span>
						</el-col>
						<el-col :span="5" class="text-center" v-if="!disabled">
							<el-button type="text" @click="removeTable(item, index)">
								{{ $t("editor.cell.data_node.database.remove") }}
							</el-button>
						</el-col>
					</el-row>
				</el-tab-pane>
				<!-- model.excludeTables -->
				<el-tab-pane
					:label="$t('editor.cell.data_node.database.tableRemoved') + '(' + computedRemoveTables.length + ')'"
					name="second"
				>
					<div class="search">
						<el-input
							:disabled="disabled"
							:placeholder="$t('editor.cell.data_node.database.enterName')"
							prefix-icon="el-icon-search"
							clearable
							v-model="removeSearch"
						>
						</el-input>
					</div>

					<el-row
						class="list"
						:class="{ active: item.checked }"
						v-for="(item, index) in computedRemoveTables"
						:key="item.id"
						:gutter="20"
					>
						<el-col :span="2">
							<el-checkbox :disabled="disabled" v-model="item.checked"></el-checkbox>
						</el-col>
						<el-col :span="17">
							<i class="iconfont icon-table2"></i>
							<span class="tableName">{{ item.table_name }}</span>
						</el-col>
						<el-col :span="5" class="text-center" v-if="!disabled">
							<el-button type="text" @click="undotble(item, index)">
								{{ $t("editor.cell.data_node.database.Undo") }}
							</el-button>
						</el-col>
					</el-row>
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>

<script>
import factory from "../../../api/factory";
import _ from "lodash";

let connections = factory("connections");
let editorMonitor = null;
export default {
	name: "Database",

	props: {
		connection_type: {
			type: String,
			default: "source"
		}
	},

	data() {
		return {
			disabled: false,
			removeSearch: "",
			search: "",

			tables: [],
			removeTables: [],

			isSourceDataNode: false,

			selectAllTables: false,
			selectAllRemoveTables: false,

			databases: [],
			activeName: "first",
			rules: {
				connectionId: [
					{
						required: true,
						trigger: "blur",
						message: this.$t("editor.cell.data_node.database.form.placeholder")
					}
				]
			},
			model: {
				connectionId: "",
				includeTables: [],
				dropTable: false,
				table_prefix: "",
				table_suffix: ""
			},
			database_type: "",
			database_port: "",
			database_host: "",
			database_uri: "",
			seachTables: [],
			removeSeachTables: []
		};
	},

	computed: {
		computedTables() {
			if (this.search) {
				this.seachTables = this.tables.filter(t => t.table_name.toLowerCase().indexOf(this.search.toLowerCase()) >= 0);
				return this.seachTables;
			} else {
				return this.tables;
			}
		},
		computedRemoveTables() {
			if (this.removeSearch) {
				this.removeSeachTables = this.removeTables.filter(
					t => t.table_name.toLowerCase().indexOf(this.removeSearch.toLowerCase()) >= 0
				);
				return this.removeSeachTables;
			} else {
				return this.removeTables;
			}
		}
	},

	async mounted() {
		let result = await connections.get({
			filter: JSON.stringify({
				where: {
					database_type: { nin: ["file", "dummy", "gridfs", "rest api"] }
				},
				fields: {
					name: 1,
					id: 1,
					database_type: 1,
					connection_type: 1,
					status: 1
				},
				order: "name ASC"
			})
		});

		if (result.data) {
			this.databases = result.data;
			this.lookupDatabaseType();
		}
	},

	watch: {
		model: {
			deep: true,
			handler() {
				this.$emit("dataChanged", this.getData());
			}
		},
		"model.connectionId": {
			immediate: true,
			handler() {
				this.tables = [];
				this.removeTables = [];
				this.lookupDatabaseType();
				if (this.database_type === "mongodb") {
					this.getMongoDBData(this.model.connectionId);
				} else {
					this.loadDataModels(this.model.connectionId);
				}
			}
		},
		// 移除全选
		selectAllTables: {
			handler() {
				if (this.search) {
					if (this.selectAllTables) {
						this.tables.forEach(item => {
							this.seachTables.forEach(table => {
								if (item.table_name === table.table_name) {
									item.checked = true;
								}
							});
						});
					}
				} else {
					this.tables.forEach(t => (t.checked = this.selectAllTables));
				}
			}
		},
		// 撤销全选
		selectAllRemoveTables: {
			handler() {
				if (this.removeSearch) {
					if (this.selectAllRemoveTables) {
						this.removeTables.forEach(item => {
							this.removeSeachTables.forEach(table => {
								if (item.table_name === table.table_name) {
									item.checked = true;
								}
							});
						});
					}
				} else {
					this.removeTables.forEach(t => (t.checked = this.selectAllRemoveTables));
				}
			}
		}
	},

	methods: {
		changeConnection() {
			this.model.includeTables = [];
		},
		lookupDatabaseType() {
			if (!this.model.connectionId) return;
			let selectedDbs = this.databases.filter(db => db.id === this.model.connectionId);
			if (selectedDbs && selectedDbs.length > 0) {
				this.database_type = selectedDbs[0].database_type;
			}
		},

		// 获取表名称
		loadDataModels(connectionId) {
			if (!connectionId) {
				return;
			}

			let self = this;

			connections.get([connectionId]).then(result => {
				if (result.data) {
					let tables = (result.data.schema && result.data.schema.tables) || [];
					tables = tables.sort((t1, t2) =>
						t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
					);
					let includeTables = [];
					tables.forEach(item => {
						let tableName = item.table_name;
						includeTables.push(item.table_name);
						if (self.model.includeTables.length === 0) {
							self.model.includeTables = includeTables;
						}

						if (self.model.includeTables.indexOf(tableName) >= 0) {
							self.tables.push({
								table_name: item.table_name,
								checked: false
							});
						} else {
							self.removeTables.push({
								table_name: item.table_name,
								checked: false
							});
						}
					});
					if(this.database_type !== "mongodb") {
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
			let self = this;
			connections.customQuery([connectionId]).then(result => {
				if (result.data) {
					this.loadDataModels([connectionId]);
					this.database_host = result.data.database_host;
					this.database_port = result.data.database_port;
				}
			});
		},

		// 移除
		removeTable(item, idx) {
			item.checked = false;
			let tableIndex = this.tables.findIndex(table => table.table_name === item.table_name);
			if (tableIndex >= 0) this.tables.splice(tableIndex, 1);

			this.removeTables.push(item);
			this.removeTables.sort((t1, t2) =>
				t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
			);

			let index = this.model.includeTables.indexOf(item.table_name);
			if (index >= 0) {
				this.model.includeTables.splice(index, 1);
			}
		},
		// 撤销
		undotble(item, idx) {
			item.checked = false;
			let tableIndex = this.removeTables.findIndex(table => table.table_name === item.table_name);
			if (tableIndex >= 0) this.removeTables.splice(tableIndex, 1);

			this.tables.push(item);
			this.tables.sort((t1, t2) =>
				t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
			);

			if (this.model.includeTables.indexOf(item.table_name) === -1) {
				this.model.includeTables.push(item.table_name);
			}
		},

		// 全部移除
		bulkRemoval() {
			for (let i = 0; i < this.tables.length; i++) {
				let item = this.tables[i];
				if (item.checked === true) {
					this.removeTable(item, i);
					i--;
				}
			}
			this.selectAllTables = false;
		},
		// 全部撤销
		bulkRevocation() {
			for (let i = 0; i < this.removeTables.length; i++) {
				let item = this.removeTables[i];
				if (item.checked === true) {
					this.undotble(item, i);
					i--;
				}
			}
			this.selectAllRemoveTables = false;
		},

		setData(data, cell, isSourceDataNode, vueAdapter) {
			if (data) {
				// Object.keys(data).forEach(key => (this.model[key] = data[key]));
				_.merge(this.model, data);
			}

			this.isSourceDataNode = isSourceDataNode;
			editorMonitor = vueAdapter.editor;
		},
		getData() {
			let result = _.cloneDeep(this.model);
			if (result.connectionId) {
				let database = this.databases.filter(db => db.id === result.connectionId);

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
		margin-bottom: 14px;
	}

	.processingBody {
		position: relative;
		height: calc(100% - 165px);

		.allCheck {
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
			margin-right: 20px;
			padding: 5px 10px;
			font-size: 12px;
			color: #666;
			background: #eee;
			border-radius: 10px;
		}
	}
}
</style>
