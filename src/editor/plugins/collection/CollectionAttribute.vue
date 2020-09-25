<template>
	<div class="e-collection nodeStyle" :class="{ nodeHeight: disabled }">
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
				:rules="rules"
				:disabled="disabled"
			>
				<el-form-item
					:label="$t('editor.cell.data_node.collection.form.database.label')"
					prop="connectionId"
					:rules="rules"
					required
				>
					<div style="display:flex;">
						<FbSelect v-model="model.connectionId" :config="databaseSelectConfig"></FbSelect>
						<el-tooltip
							class="item"
							popper-class="collection-tooltip"
							effect="light"
							:content="$t('dataForm.createDatabase')"
							placement="top-start"
						>
							<el-button
								size="mini"
								icon="el-icon-plus"
								style="padding: 7px;margin-left: 7px"
								@click="$refs.databaseForm.show({ whiteList: ['mongodb'] })"
							></el-button>
						</el-tooltip>
						<el-tooltip
							class="item"
							popper-class="collection-tooltip"
							effect="light"
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
							popper-class="collection-tooltip"
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
					:label="$t('editor.cell.data_node.collection.form.collection.label')"
					prop="tableName"
					required
				>
					<div class="flex-block">
						<FbSelect
							class="e-select"
							v-model="model.tableName"
							:config="schemaSelectConfig"
							@change="handleFieldFilterType"
						></FbSelect>
						<el-tooltip
							class="item"
							popper-class="collection-tooltip"
							effect="light"
							:content="$t('dataForm.createCollection')"
						>
							<el-button
								size="mini"
								class="el-icon-plus"
								style="padding: 7px;margin-left: 7px"
								@click="addNewTable"
							></el-button>
						</el-tooltip>
						<el-tooltip
							class="item"
							popper-class="collection-tooltip"
							effect="light"
							:content="$t('dataForm.copyCollection')"
						>
							<el-button size="mini" style="padding: 7px;margin-left: 7px">
								<ClipButton :value="model.tableName"></ClipButton>
							</el-button>
						</el-tooltip>
						<el-tooltip
							class="item"
							popper-class="collection-tooltip"
							effect="light"
							:content="$t('dataForm.checkDatabase')"
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
				<el-form-item>
					<template slot="label">
						{{ $t('editor.cell.data_node.collection.form.fieldFilterTip.label') }}
						<el-tooltip effect="light" popper-class="collection-tooltip">
							<div slot="content">
								<div style="word-break: keep-all;">
									{{ $t('editor.cell.data_node.collection.form.fieldFilterTip.keepAllFields') }}
								</div>
								<div style="word-break: keep-all;">
									{{ $t('editor.cell.data_node.collection.form.fieldFilterTip.retainedField') }}
								</div>
								<div style="word-break: keep-all;">
									{{ $t('editor.cell.data_node.collection.form.fieldFilterTip.deleteField') }}
								</div>
							</div>
							<i class="e-primary el-icon-warning-outline"></i>
						</el-tooltip>
					</template>
					<el-select v-model="model.fieldFilterType" @change="handleCurrentFieldFilterType">
						<el-option
							v-for="item in filterTypeOptions"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item v-if="model.fieldFilterType !== 'keepAllFields'">
					<MultiSelection
						v-model="model.fieldFilter"
						:options="primaryKeyOptions"
						:placeholder="
							model.fieldFilterType === 'retainedField'
								? $t('editor.cell.data_node.collection.form.fieldFilter.placeholderKeep')
								: $t('editor.cell.data_node.collection.form.fieldFilter.placeholderDelete')
						"
						@change="handleFilterChange()"
					></MultiSelection>
				</el-form-item>

				<el-form-item
					required
					:label="$t('editor.cell.data_node.collection.form.initialSyncOrder.keep')"
					v-if="dataNodeInfo.isSource || !dataNodeInfo.isTarget"
				>
					<div class="flex-block">
						<el-switch
							v-model="model.enableInitialOrder"
							style="margin-right: 20px"
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
					:label="$t('editor.cell.data_node.collection.form.dropTable.label')"
					v-if="dataNodeInfo.isTarget"
				>
					<el-select v-model="model.dropTable" size="mini" :disabled="logsFlag">
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
					:databaseType="model.databaseType"
					:mergedSchema="defaultSchema"
				></queryBuilder>
			</el-form>
			<div class="e-entity-wrap" style="text-align: center;">
				<el-button
					class="fr"
					type="success"
					size="mini"
					:disabled="!model.connectionId && !model.tableName"
					@click="hanlderLoadSchema"
				>
					<i class="el-icon-loading" v-if="reloadModelLoading"></i>
					<span v-if="reloadModelLoading">{{ $t('dataFlow.loadingText') }}</span>
					<span v-else>{{ $t('dataFlow.updateModel') }}</span>
				</el-button>
				<entity
					v-loading="schemaSelectConfig.loading"
					:schema="convertSchemaToTreeData(defaultSchema)"
					:editable="false"
					:operations="model.operations"
				></entity>
			</div>
		</div>
		<CreateTable v-if="addtableFalg" :dialog="dialogData" @handleTable="getAddTableName"></CreateTable>
		<relatedTasks :taskData="taskData" v-if="disabled"></relatedTasks>
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
import DatabaseForm from '../../../view/job/components/DatabaseForm/DatabaseForm';
import MultiSelection from '../../../components/MultiSelection';
import RelatedTasks from '../../../components/relatedTasks';
import ClipButton from '@/components/ClipButton';
import queryBuilder from '@/components/QueryBuilder';
import CreateTable from '../../../components/dialog/createTable';
import { convertSchemaToTreeData, mergeJoinTablesToTargetSchema, uuid } from '../../util/Schema';
import Entity from '../link/Entity';
import _ from 'lodash';
import ws from '../../../api/ws';
import factory from '../../../api/factory';
let connectionApi = factory('connections');
const MetadataInstances = factory('MetadataInstances');
let editorMonitor = null;
let tempSchemas = [];
const RETAINED_OPS_TPL = {
	id: '',
	op: 'RETAINED'
};
const DELETE_OPS_TPL = {
	id: '',
	op: 'DELETE'
};
export default {
	name: 'Collection',
	components: { Entity, DatabaseForm, MultiSelection, ClipButton, RelatedTasks, CreateTable, queryBuilder },
	props: {
		database_types: {
			type: Array,
			default: function() {
				return ['mongodb'];
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
				let schemas = tempSchemas;
				if (this.schemaSelectConfig.options.length > 0) {
					if (this.model.tableName) {
						let schema = schemas.filter(s => s.table_name === this.model.tableName);
						schema =
							schema && schema.length > 0
								? schema[0]
								: {
										table_name: this.model.tableName,
										cdc_enabled: true,
										meta_type: 'collection',
										fields: [
											{
												autoincrement: false,
												columnSize: 0,
												dataType: 7,
												data_type: 'OBJECT_ID',
												field_name: '_id',
												id: uuid(),
												is_nullable: true,
												javaType: 'String',
												key: 'PRI',
												original_field_name: '_id',
												precision: 0,
												primary_key_position: 1,
												scale: 0,
												table_name: this.model.tableName
											}
										]
								  };

						let fields = schema.fields || [];
						// let primaryKeys = fields
						// 	.filter(f => f.primary_key_position > 0)
						// 	.map(f => f.field_name)
						// 	.join(',');
						this.primaryKeyOptions = fields.map(f => f.field_name);
						// if (primaryKeys) {
						// 	this.model.primaryKeys = primaryKeys;
						// } else {
						// 	this.model.primaryKeys = '';
						// }
						this.$emit('schemaChange', _.cloneDeep(schema));
					}
				}

				this.taskData.tableName = this.model.tableName;
				this.tableIsLink();
			}
		},
		defaultSchema: {
			handler() {
				if (this.defaultSchema && this.defaultSchema.fields && this.defaultSchema.fields.length > 0) {
					let fields = this.defaultSchema.fields;
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
			logsFlag: false,
			taskData: {
				id: '',
				tableName: ''
			},
			disabled: false,
			filterTypeOptions: [
				{
					label: this.$t('editor.cell.data_node.collection.form.fieldFilterType.keepAllFields'),
					value: 'keepAllFields'
				},
				{
					label: this.$t('editor.cell.data_node.collection.form.fieldFilterType.retainedField'),
					value: 'retainedField'
				},
				{
					label: this.$t('editor.cell.data_node.collection.form.fieldFilterType.deleteField'),
					value: 'deleteField'
				}
			],
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
				placeholder: this.$t('editor.cell.data_node.collection.form.collection.placeholder'),
				loading: false,
				filterable: true,
				options: [],
				allowCreate: false,
				defaultFirstOption: false,
				clearable: true
			},

			rules: {
				connectionId: [{ required: true, trigger: 'blur', message: `Please select database` }],
				filter: {
					type: 'string',
					message: this.$t('editor.cell.data_node.collection.form.filter.invalidJSON'),
					validator: (rule, value) => {
						if (value) {
							try {
								JSON.parse(value);
								return true;
							} catch (e) {
								return false;
							}
						}
					}
				}
			},
			dataNodeInfo: {},
			model: {
				connectionId: '',
				databaseType: 'mongodb',
				tableName: '',
				dropTable: false,
				type: 'collection',
				// primaryKeys: '',
				isFilter: false,
				sqlFromCust: true,
				custSql: {
					filterType: 'field',
					noFieldFilter: true,
					noLineLimit: true,
					selectedFields: [],
					fieldFilterType: 'keepAllFields',
					limitLines: '',
					cSql: '',
					editSql: '',
					conditions: []
				},
				filter: '',
				fieldFilterType: 'keepAllFields',
				fieldFilter: '',
				initialSyncOrder: 0,
				enableInitialOrder: false,
				operations: []
			},
			primaryKeyOptions: [],
			fieldFilterOptions: [],
			defaultSchema: null
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
	},

	methods: {
		// 新建表弹窗
		addNewTable() {
			this.addtableFalg = true;
			this.dialogData = {
				type: 'collection',
				title: this.$t('dialog.createCollection'),
				placeholder: this.$t('dialog.placeholderCollection'),
				visible: this.addtableFalg
			};
		},

		// 获取新建表名称
		getAddTableName(val) {
			this.model.tableName = val;
			this.tableIsLink();
			this.defaultSchema = null;
			let schema = {
				table_name: this.model.tableName,
				cdc_enabled: true,
				meta_type: 'collection',
				fields: [
					{
						autoincrement: false,
						columnSize: 0,
						dataType: 7,
						data_type: 'OBJECT_ID',
						field_name: '_id',
						id: uuid(),
						is_nullable: true,
						javaType: 'String',
						key: 'PRI',
						original_field_name: '_id',
						precision: 0,
						primary_key_position: 1,
						scale: 0,
						table_name: this.model.tableName
					}
				]
			};
			this.$emit('schemaChange', _.cloneDeep(schema));
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
			if (this.tableData && this.tableData.length) {
				this.tableData.forEach(item => {
					if (item.table_name === this.model.tableName) {
						this.tableNameId = item.tableId;
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
						original_name: true
					}
				})
			};

			MetadataInstances.get(params).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					this.databaseData = res.data;
				}
			});
		},

		handleFilterChange() {
			let fieldFilter = this.model.fieldFilter ? this.model.fieldFilter.split(',') : [];

			let fieldList = this.getFieldData(fieldFilter);
			if (this.model.fieldFilterType === 'retainedField') {
				this.handleRetainedField(fieldList);
			} else if (this.model.fieldFilterType === 'deleteField') {
				this.handleDeleteField(fieldList);
			}
			this.$nextTick(() => {
				this.$emit('schemaChange', _.cloneDeep(this.defaultSchema));
			});
		},
		handleRetainedField(fieldFilter) {
			this.model.operations = [];

			fieldFilter.forEach(f => {
				let self = this;
				let ops = self.model.operations.filter(v => v.op === 'RETAINED' && v.id === f.id);
				let op;
				if (ops.length === 0) {
					op = Object.assign(_.cloneDeep(RETAINED_OPS_TPL), {
						id: f.id,
						field: f.field_name
					});
					self.model.operations.push(op);
				}
			});
		},
		handleDeleteField(fieldFilter) {
			this.model.operations = [];
			fieldFilter.forEach(f => {
				let self = this;
				let fn = function(field) {
					let ops = self.model.operations.filter(v => v.op === 'DELETE' && v.id === field.id);
					let op;
					if (ops.length === 0) {
						op = Object.assign(_.cloneDeep(DELETE_OPS_TPL), {
							id: field.id,
							field: field.field_name
						});
						self.model.operations.push(op);
					}
					if (field.children) {
						field.children.forEach(fn);
					}
				};
				if (f) fn(f);
			});
		},
		getFieldData(fieldFilter) {
			let currentFiled = [];
			fieldFilter.forEach(f => {
				if (f && f.length) {
					let op = this.defaultSchema.fields.find(item => item.field_name === f);
					currentFiled.push(op);
				}
			});
			return currentFiled;
		},
		handleFieldFilterType() {
			this.model.operations = [];
			this.model.fieldFilter = '';
			this.model.fieldFilterType = 'keepAllFields';
		},
		handleCurrentFieldFilterType(type) {
			this.model.operations = [];
			this.model.fieldFilter = '';
			this.model.fieldFilterType = type;
			this.$nextTick(() => {
				this.$emit('schemaChange', _.cloneDeep(this.defaultSchema));
			});
		},
		convertSchemaToTreeData,

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

			connectionApi
				.get([connectionId])
				.then(result => {
					if (result.data && result.data.schema && result.data.schema.tables) {
						this.tableData = result.data.schema.tables;
						let schemas = (result.data.schema && result.data.schema.tables) || [];
						tempSchemas = schemas.sort((t1, t2) =>
							t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
						);
						self.schemaSelectConfig.options = tempSchemas.map(item => ({
							label: item.table_name,
							value: item.table_name
						}));

						this.tableIsLink();
					}
				})
				.finally(() => {
					this.schemaSelectConfig.loading = false;
				});
		},
		handlerConnectionChange() {
			this.model.tableName = '';
		},
		setData(data, cell, dataNodeInfo, vueAdapter) {
			if (data) {
				_.merge(this.model, data);
				//老数据的兼容处理
				if (data.initialSyncOrder > 0) {
					this.model.enableInitialOrder = true;
				}
				if (data.connectionId) {
					this.loadDataModels(data.connectionId);
				}

				this.tableIsLink();
			}

			this.dataNodeInfo = dataNodeInfo || {};
			this.defaultSchema = mergeJoinTablesToTargetSchema(cell.getSchema(), cell.getInputSchema());
			cell.on('change:outputSchema', () => {
				this.defaultSchema = mergeJoinTablesToTargetSchema(cell.getSchema(), cell.getInputSchema());
			});
			editorMonitor = vueAdapter.editor;

			let getCellData = vueAdapter.editor.graph.graph.getCells();

			if (getCellData && getCellData.length) {
				this.logsFlag = getCellData[0].get('type') === 'app.Logminer' ? true : false;
				if (this.logsFlag) {
					this.model.dropTable = true;
				}
			}
			// let sourceType = '';
		},
		getData() {
			let result = _.cloneDeep(this.model);
			if (this.model.isFilter)
				if (this.model.custSql.filterType === 'field') this.model.filter = this.model.custSql.cSql;
				else this.model.filter = this.model.custSql.editSql;
			result.name = result.tableName || 'Collection';
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

		seeMonitor() {
			editorMonitor.goBackMontior();
		},

		// 更新模型点击弹窗
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

			if (ws.ws.readyState == 1) ws.send(params);
			let self = this,
				schema = null,
				templeSchema = [];
			ws.on('execute_load_schema_result', res => {
				if (res.status === 'SUCCESS' && res.result && res.result.length) {
					templeSchema = res.result;
					this.reloadModelLoading = false;
					self.$message.success(this.$t('message.reloadSchemaSuccess'));
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
					self.$emit('schemaChange', _.cloneDeep(schema));
					this.defaultSchema = schema;
				});
			});
			this.dialogVisible = false;
		}
	}
};
</script>

<style lang="less" scoped>
.e-collection {
	.e-entity-wrap {
		flex: 1;
		overflow: auto;
	}
	.flex-block {
		display: flex;
		align-items: center;
	}
}
</style>
<style lang="less">
.e-collection {
	.iconfont {
		font-size: 12px;
	}
}
.collection-tooltip.is-light {
	border: 1px solid #ebeef5 !important;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
