<template>
	<div class="e-table nodeStyle" :class="{ nodeHeight: disabled }">
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
				:disabled="disabled"
				:model="model"
				ref="form"
			>
				<el-form-item
					:label="$t('editor.cell.data_node.table.form.database.label')"
					prop="connectionId"
					:rules="rules"
					required
				>
					<div style="display:flex;">
						<FbSelect v-model="model.connectionId" :config="databaseSelectConfig"></FbSelect>
						<el-tooltip
							class="item"
							effect="light"
							popper-class="table-tooltips"
							:content="$t('dataForm.createDatabase')"
							placement="top-start"
						>
							<el-button
								size="mini"
								icon="el-icon-plus"
								style="padding: 7px;margin-left: 7px"
								v-readonlybtn="'datasource_creation'"
								@click="$refs.databaseForm.show({ blackList: ['mongodb'] })"
							></el-button>
						</el-tooltip>
						<el-tooltip
							class="item"
							effect="light"
							popper-class="table-tooltips"
							:content="$t('dataForm.copyDatabase')"
							placement="top-start"
						>
							<el-button size="mini" style="padding: 7px;margin-left: 7px">
								<ClipButton :value="copyConnectionId"></ClipButton>
							</el-button>
						</el-tooltip>
						<el-tooltip
							class="item"
							effect="light"
							popper-class="table-tooltips"
							:content="$t('dataForm.checkDatabase')"
							placement="top-start"
						>
							<el-button
								size="mini"
								class="iconfont icon-dakai1"
								style="padding: 7px;margin-left: 7px"
								:disabled="!model.connectionId"
								@click="handDatabase"
							></el-button>
						</el-tooltip>
						<DatabaseForm ref="databaseForm" @success="loadDataSource"></DatabaseForm>
					</div>
				</el-form-item>

				<el-form-item
					:label="$t('editor.cell.data_node.table.form.table.label')"
					prop="tableName"
					:rules="rules"
					required
				>
					<div class="flex-block">
						<FbSelect class="e-select" v-model="model.tableName" :config="schemaSelectConfig"></FbSelect>
						<el-tooltip
							class="item"
							effect="light"
							popper-class=""
							:content="$t('dataForm.createTable')"
							placement="bottom-start"
						>
							<el-button
								size="mini"
								class="el-icon-plus"
								style="padding: 7px;margin-left: 7px"
								v-readonlybtn="'create_new_table_in_SYNC'"
								@click="addNewTable"
							></el-button>
						</el-tooltip>
						<el-tooltip
							class="item"
							effect="light"
							popper-class="table-tooltips"
							:content="$t('dataForm.copyTable')"
							placement="bottom-start"
						>
							<el-button size="mini" style="padding: 7px;margin-left: 7px">
								<ClipButton :value="model.tableName"></ClipButton>
							</el-button>
						</el-tooltip>
						<el-tooltip
							class="item"
							effect="light"
							popper-class="table-tooltips"
							:content="$t('dataForm.checkDatabase')"
							placement="bottom-end"
						>
							<el-button
								size="mini"
								class="iconfont icon-dakai1"
								style="padding: 7px;margin-left: 7px"
								:disabled="!tableNameId"
								@click="handTableName"
							></el-button>
						</el-tooltip>
					</div>
				</el-form-item>

				<!-- <el-form-item :label="$t('editor.cell.data_node.collection.form.pk.label')" required>
					<MultiSelection
						v-model="model.primaryKeys"
						:options="primaryKeyOptions"
						:placeholder="$t('editor.cell.data_node.collection.form.pk.placeholder')"
					></MultiSelection>
				</el-form-item> -->
				<el-form-item
					required
					:label="$t('editor.cell.data_node.collection.form.initialSyncOrder.keep')"
					v-if="dataNodeInfo.isSource || !dataNodeInfo.isTarget"
				>
					<div class="flex-block">
						<el-switch
							v-model="model.enableInitialOrder"
							style="margin-right: 20px"
							inactive-color="#dcdfe6"
							:active-text="
								model.enableInitialOrder
									? $t('editor.cell.data_node.collection.form.initialSyncOrder.open')
									: $t('editor.cell.data_node.collection.form.initialSyncOrder.close')
							"
							@change="model.initialSyncOrder = 0"
						></el-switch>
						<el-input-number
							v-if="model.enableInitialOrder"
							v-model="model.initialSyncOrder"
							controls-position="right"
							:min="1"
							size="mini"
						></el-input-number>
					</div>
				</el-form-item>

				<el-form-item
					required
					:label="$t('editor.cell.data_node.collection.form.filter.fiflterSetting')"
					v-if="dataNodeInfo.isSource || !dataNodeInfo.isTarget"
				>
					<div class="flex-block">
						<el-switch
							v-model="model.isFilter"
							inactive-color="#dcdfe6"
							:active-text="
								model.isFilter
									? $t('editor.cell.data_node.collection.form.filter.openFiflter')
									: $t('editor.cell.data_node.collection.form.filter.closeFiflter')
							"
							style="margin-right: 20px"
						></el-switch>
					</div>
				</el-form-item>

				<queryBuilder
					v-if="(dataNodeInfo.isSource || !dataNodeInfo.isTarget) && model.isFilter"
					v-model="model.custSql"
					v-bind:initialOffset.sync="model.initialOffset"
					:primaryKeyOptions="primaryKeyOptions"
					v-bind:selectedFields.sync="model.selectedFields"
					v-bind:custFields.sync="model.custFields"
					:tableName="model.tableName"
					:disabled="disabled"
					:databaseType="model.databaseType"
					:mergedSchema="mergedSchema"
				></queryBuilder>

				<el-form-item
					required
					:label="$t('editor.cell.data_node.collection.form.dropTable.label')"
					v-if="dataNodeInfo.isTarget"
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
				<el-form-item>
					<div class="flex-block fr">
						<el-button
							class="fr"
							type="success"
							v-if="model.connectionId && model.tableName"
							size="mini"
							@click="hanlderLoadSchema"
						>
							<i class="el-icon-loading" v-if="reloadModelLoading"></i>
							<span v-if="reloadModelLoading">{{ $t('dataFlow.loadingText') }}</span>
							<span v-else>{{ $t('dataFlow.updateModel') }}</span>
						</el-button>
					</div>
				</el-form-item>
			</el-form>
			<div class="e-entity-wrap" style="text-align: center;">
				<entity :schema="convertSchemaToTreeData(mergedSchema)" :editable="false"></entity>
			</div>
		</div>
		<CreateTable v-if="addtableFalg" :dialog="dialogData" @handleTable="getAddTableName"></CreateTable>
		<relatedTasks :taskData="taskData" v-if="disabled" v-loading="databaseSelectConfig.loading"></relatedTasks>
		<el-dialog
			:title="$t('message.prompt')"
			:visible.sync="dialogVisible"
			:close-on-click-modal="false"
			width="30%"
		>
			<span>{{ $t('editor.ui.nodeLoadSchemaDiaLog') }}</span>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">{{ $t('message.cancel') }}</el-button>
				<el-button type="primary" @click="confirmDialog">{{ $t('message.confirm') }}</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import DatabaseForm from '@/view/job/components/DatabaseForm/DatabaseForm';
import ClipButton from '@/components/ClipButton';
import queryBuilder from '@/components/QueryBuilder';
import { convertSchemaToTreeData, removeDeleted } from '../../util/Schema';
import RelatedTasks from '@/components/relatedTasks';
import CreateTable from '@/components/dialog/createTable';
import Entity from '../link/Entity';
import _ from 'lodash';
import ws from '@/api/ws';
import factory from '@/api/factory';

let connectionApi = factory('connections');
const MetadataInstances = factory('MetadataInstances');
let editor = null;
let tempSchemas = [];
export default {
	name: 'Table',
	components: { Entity, DatabaseForm, ClipButton, CreateTable, RelatedTasks, queryBuilder },
	props: {
		database_types: {
			type: Array,
			default: function() {
				return ['mysql', 'oracle', 'sqlserver', 'sybase ase', 'gbase-8s', 'db2', 'gaussdb200', 'postgres'];
			}
		}
	},

	watch: {
		model: {
			deep: true,
			handler() {
				this.$emit('dataChanged', this.getData());
			}
		},
		'model.connectionId': {
			immediate: true,
			handler() {
				this.loadDatabaseId(this.model.connectionId);
				this.loadDataModels(this.model.connectionId);
				if (this.model.connectionId) {
					this.taskData.id = this.model.connectionId;
					if (this.databaseSelectConfig.options.length) {
						this.databaseSelectConfig.options.forEach(item => {
							if (item.value === this.model.connectionId) {
								this.copyConnectionId = item.name;
							}
						});
					}
				}
			}
		},
		'model.tableName': {
			immediate: true,
			handler() {
				this.tableIsLink();
			}
		},
		mergedSchema: {
			handler() {
				if (this.mergedSchema && this.mergedSchema.fields && this.mergedSchema.fields.length > 0) {
					let fields = this.mergedSchema.fields;
					//过滤被删除的字段
					if (fields) {
						fields = removeDeleted(fields);
					}
					this.primaryKeyOptions = fields.map(f => f.field_name);
					// if (!this.model.primaryKeys) {
					// 	let primaryKeys = fields.filter(f => f.primary_key_position > 0).map(f => f.field_name);
					// 	if (primaryKeys.length > 0) this.model.primaryKeys = Array.from(new Set(primaryKeys)).join(',');
					// }
				}
			}
		}
	},

	data() {
		let self = this;
		return {
			reloadModelLoading: false,
			addtableFalg: false,
			dialogData: null,
			databaseData: [],
			tableData: [],
			copyConnectionId: '',
			tableNameId: '',

			dialogVisible: false,
			taskData: {
				id: '',
				tableName: ''
			},

			databaseSelectConfig: {
				size: 'mini',
				placeholder: this.$t('editor.cell.data_node.database.form.placeholder'),
				loading: false,
				filterable: true,
				on: {
					change() {
						self.handlerConnectionChange();
					}
				},
				options: []
			},

			schemaSelectConfig: {
				size: 'mini',
				placeholder: this.$t('editor.cell.data_node.table.form.table.placeholder'),
				loading: false,
				filterable: true,
				on: {
					change() {
						self.handlerSchemaChange();
					}
				},
				options: [],
				allowCreate: false,
				defaultFirstOption: false,
				clearable: true
			},
			disabled: false,
			rules: {
				connectionId: [
					{
						required: true,
						trigger: 'blur',
						message: `Please select database`
					}
				]
			},

			dataNodeInfo: {},

			model: {
				connectionId: '',
				databaseType: '',
				tableName: '',
				sql: '',
				isFilter: false,
				custFields: [],
				custSql: {
					filterType: 'field',
					selectedFields: [],
					fieldFilterType: 'keepAllFields',
					limitLines: '',
					cSql: '',
					editSql: '',
					conditions: []
				},
				initialOffset: '',
				dropTable: false,
				type: 'table',
				// primaryKeys: '',
				initialSyncOrder: 0,
				enableInitialOrder: false
			},

			mergedSchema: null,

			primaryKeyOptions: [],
			loadSchema: null
		};
	},

	async mounted() {
		await this.loadDataSource();
		if (this.model.connectionId) {
			this.taskData.id = this.model.connectionId;
			if (this.databaseSelectConfig.options.length) {
				this.databaseSelectConfig.options.forEach(item => {
					if (item.value === this.model.connectionId) {
						this.copyConnectionId = item.name;
					}
				});
			}
		}

		// setTimeout(() => {
		// 	this.tableIsLink();
		// }, 500);
	},

	methods: {
		convertSchemaToTreeData,
		// 查看监控
		seeMonitor() {
			editor.goBackMontior();
		},

		// 获取新建表名称
		getAddTableName(val) {
			this.model.tableName = val;
			this.tableIsLink();
			this.mergedSchema = null;
			let schema = {
				meta_type: 'table',
				table_name: this.model.tableName,
				fields: []
			};
			this.$emit('schemaChange', _.cloneDeep(schema));
		},

		// 新建表弹窗
		addNewTable() {
			this.addtableFalg = true;
			this.dialogData = {
				type: 'table',
				title: this.$t('dialog.createTable'),
				placeholder: this.$t('dialog.placeholderTable'),
				visible: this.addtableFalg
			};
		},

		// 打开数据目录数据库
		handDatabase() {
			let href = '/#/metadataInstances/' + this.databaseData[0].id;
			window.open(href);
		},

		// 跳转到数据目录当前表
		handTableName() {
			this.tableNameId = '';
			this.tableIsLink();

			if (this.tableNameId) {
				let href = '/#/metadataInstances/' + this.tableNameId;
				window.open(href);
			}
		},

		// 判断表是否可以跳转
		tableIsLink() {
			this.tableNameId = '';
			if (this.tableData.length) {
				this.tableData.forEach(item => {
					if (item.original_name === this.model.tableName) {
						this.tableNameId = item.id;
					}
				});
			}
		},

		// 获取数据库id
		loadDatabaseId(connectionId) {
			if (!connectionId) {
				return;
			}
			let params = {
				filter: JSON.stringify({
					where: {
						'source.id': connectionId,
						meta_type: {
							in: ['database'] //,
						},
						is_deleted: false
					},
					fields: {
						id: true,
						original_name: true,
						database_type: true
					}
				})
			};

			MetadataInstances.get(params).then(res => {
				this.databaseData = res.data;
			});
		},

		async loadDataSource() {
			this.databaseSelectConfig.loading = true;
			let result = await connectionApi.get({
				filter: JSON.stringify({
					where: {
						database_type: { in: this.database_types }
					},
					fields: {
						name: 1,
						id: 1,
						database_type: 1,
						connection_type: 1,
						status: 1
					}
				})
			});

			this.databaseSelectConfig.loading = false;
			if (result.data) {
				this.databaseSelectConfig.options = result.data.map(item => {
					return {
						id: item.id,
						name: item.name,
						database_type: item.database_type,
						label: `${item.name} (${item.status})`,
						value: item.id
					};
				});
			}
		},

		loadDataModels(connectionId) {
			if (!connectionId) {
				return;
			}
			let self = this;
			this.schemaSelectConfig.loading = true;
			let params = {
				filter: JSON.stringify({
					where: {
						'source.id': connectionId,
						meta_type: {
							in: ['collection', 'table', 'view'] //,
						},
						is_deleted: false
					},
					fields: {
						id: true,
						original_name: true
					}
				})
			};
			self.loading = true;
			MetadataInstances.get(params)
				.then(res => {
					this.tableData = res.data;
					this.tableIsLink();
					let schemas = res.data.map(it => {
						it.table_name = it.original_name;
						return it;
					});
					tempSchemas = schemas.sort((t1, t2) =>
						t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
					);
					self.schemaSelectConfig.options = tempSchemas.map(item => ({
						label: item.table_name,
						value: item.table_name
					}));
				})
				.finally(() => {
					this.schemaSelectConfig.loading = false;
				});
		},
		handlerConnectionChange() {
			this.model.tableName = '';
			let list = this.databaseSelectConfig.options;
			for (let i = 0; i < list.length; i++) {
				if (this.model.connectionId === list[i].id) {
					this.model.databaseType = list[i]['database_type'];
				}
			}
		},
		handlerSchemaChange() {
			this.model.custFields.length = 0;
			this.model.custSql.selectedFields.length = 0;
			this.model.custSql.conditions.length = 0;
			this.model.custSql.limitLines = '';
			this.model.cSql = '';
			let self = this;
			if (tempSchemas.length > 0) {
				let schemas = tempSchemas.filter(s => s.table_name === this.model.tableName);
				if (schemas && schemas.length > 0) this.model.tableId = schemas[0].id;
			}

			if (this.model.tableId) {
				let params = {
					filter: JSON.stringify({
						where: {
							id: this.model.tableId,
							is_deleted: false
						}
					})
				};
				self.loading = true;
				MetadataInstances.schema(params).then(res => {
					if (res.data) {
						let fields = res.data.records[0].schema.tables[0].fields;
						// let primaryKeys = fields
						// 	.filter(f => f.primary_key_position > 0)
						// 	.map(f => f.field_name)
						// 	.join(',');
						self.primaryKeyOptions = fields.map(f => f.field_name);
						self.model.custSql.custFields = fields.map(f => f.field_name);
						self.model.custSql.conditions.length = 0;
						self.model.custSql.fieldFilterType = 'keepAllFields';
						self.model.custSql.cSql = '';
						self.model.custSql.editSql = '';
						self.model.custSql.selectedFields.length = 0;
						// if (primaryKeys) {
						// 	self.model.primaryKeys = primaryKeys;
						// } else {
						// 	self.model.primaryKeys = '';
						// }
						this.loadSchema = res.data.records[0].schema.tables[0];
						self.$emit('schemaChange', _.cloneDeep(res.data.records[0].schema.tables[0]));
					}
				});
			}
			this.taskData.tableName = this.model.tableName;

			// 切换清空连线关联条件的值
			// this.cell.graph.getConnectedLinks(this.cell, { outbound: true }).forEach(link => {
			// 	let orignData = link.getFormData();
			// 	if (orignData) {
			// 		orignData.joinTable.joinKeys = [];
			// 	}
			// 	link.setFormData(orignData);
			// });
		},

		setData(data, cell, dataNodeInfo, vueAdapter) {
			if (data) {
				let conds;
				if (data.custSql && data.custSql.conditions) {
					conds = JSON.parse(JSON.stringify(data.custSql.conditions));
					delete data.custSql.conditions;
				}
				_.merge(this.model, data);
				if (this.model.custSql && this.model.custSql.conditions && conds && conds.length > 0)
					conds.forEach(it => {
						this.model.custSql.conditions.push(it);
					});
				if (data.sql && (!data.hasOwnProperty('isFilter') || data.hasOwnProperty('sqlNotFromCust'))) {
					this.model.custSql.editSql = data.sql;
					this.model.custSql.filterType = 'sql';
					this.model.isFilter = true;
				}
				if (data.initialSyncOrder > 0) {
					this.model.enableInitialOrder = true;
				}
				this.tableIsLink();
			}
			this.cell = cell;
			tempSchemas.length = 0;
			this.dataNodeInfo = dataNodeInfo || {};

			this.loadDataModels(this.model.connectionId);

			let ouputSchema = cell.getOutputSchema();
			if (this.model.connectionId && this.model.tableName && !ouputSchema) {
				this.handlerSchemaChange();
			} else {
				this.mergedSchema = ouputSchema;
			}

			cell.on('change:outputSchema', () => {
				this.mergedSchema = cell.getOutputSchema();
			});
			editor = vueAdapter.editor;
		},
		getData() {
			if (this.model.isFilter)
				if (this.model.custSql.filterType === 'field') this.model.sql = this.model.custSql.cSql;
				else this.model.sql = this.model.custSql.editSql;
			let result = _.cloneDeep(this.model);
			result.name = result.tableName || 'Table';
			if (!this.dataNodeInfo.isTarget) {
				delete result.dropTable;
			}
			this.taskData.id = result.connectionId;
			this.taskData.tableName = result.tableName;

			return result;
		},

		setDisabled(disabled) {
			this.disabled = disabled;
		},

		// 更新模型
		hanlderLoadSchema() {
			this.dialogVisible = true;
		},

		// 确定更新模型弹窗
		confirmDialog() {
			this.reloadModelLoading = true;
			let params = {
				type: 'reloadSchema',
				data: {
					tables: [
						{
							connId: this.model.connectionId,
							tableName: this.model.tableName,
							userId: this.$cookie.get('user_id')
						}
					]
				}
			};

			ws.send(params);
			let self = this,
				schema = null,
				templeSchema = [];

			ws.on('execute_load_schema_result', res => {
				if (res.status === 'SUCCESS' && res.result && res.result.length) {
					templeSchema = res.result;
					this.reloadModelLoading = false;
				} else {
					self.$message.error(this.$t('message.reloadSchemaError'));
				}
				this.reloadModelLoading = false;
				if (templeSchema && templeSchema.length) {
					templeSchema.forEach(item => {
						if (item.connId === this.model.connectionId && item.tableName === this.model.tableName) {
							schema = item.schema;
						}
					});
				}
				self.$nextTick(() => {
					if (schema) {
						self.$emit('schemaChange', _.cloneDeep(schema));
						this.mergedSchema = schema;
						self.$message.success(this.$t('message.reloadSchemaSuccess'));
					}
				});
			});
			this.dialogVisible = false;
		}
	}
};
</script>

<style lang="less" scoped>
.e-table {
	.e-entity-wrap {
		flex: 1;
		overflow: auto;
	}
	.flex-block {
		display: flex;
		align-items: center;
	}
	.fiflter {
		padding: 10px 12px;
		font-size: 12px;
		box-sizing: border-box;
		border: 1px solid #dcdfe6;
		.title {
			font-size: 12px;
			padding-bottom: 10px;
		}
		.rowSlot {
			display: inline-block;
			margin-bottom: 12px;
			border: 1px solid #dcdfe6;
			border-radius: 4px;
			box-sizing: border-box;
			span {
				float: left;
				display: inline-block;
				height: 28px;
				width: 80px;
				line-height: 28px;
				text-align: center;
				font-size: 12px;
				background-color: #f5f7fa;
			}
			.e-select {
				width: 160px;
			}
		}
		.e-row {
			padding-bottom: 5px;
			.btn {
				width: 84px;
				height: 28px;
				line-height: 27px;
				border: 1px solid #dcdfe6;
				border-radius: 4px;
				box-sizing: border-box;
				span {
					float: left;
					display: inline-block;
					text-align: center;
					color: #999;
					font-size: 12px;
					cursor: pointer;
					box-sizing: border-box;
				}
				span:first-child {
					width: 40px;
				}
				span:last-child {
					width: 42px;
					border-left: 1px solid #dcdfe6;
				}
				span:hover {
					background-color: #ecf5ff;
				}
			}
		}
		.selectSql {
			padding-top: 10px;
			font-size: 12px;
			color: #999;
			overflow: hidden;
			div {
				width: 100%;
			}
		}
	}
}
</style>
<style lang="less">
.e-table {
	.fiflter {
		.e-select .el-input--mini .el-input__inner {
			border: 0;
			font-size: 12px !important;
		}
	}
	.el-tabs__item,
	.el-input__inner {
		font-size: 12px !important;
	}
	.el-switch__label * {
		font-size: 12px !important;
		color: #999;
	}
}
.table-tooltips {
	border: 1px solid #ebeef5 !important;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
