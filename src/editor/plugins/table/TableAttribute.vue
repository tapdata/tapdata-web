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
						<el-button
							size="mini"
							icon="el-icon-plus"
							style="padding: 7px;margin-left: 7px"
							@click="$refs.databaseForm.show({ blackList: ['mongodb'] })"
						></el-button>
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
						<ClipButton :value="model.tableName"></ClipButton>
					</div>
				</el-form-item>

				<el-form-item :label="$t('editor.cell.data_node.collection.form.pk.label')" required>
					<MultiSelection
						v-model="model.primaryKeys"
						:options="primaryKeyOptions"
						:placeholder="$t('editor.cell.data_node.collection.form.pk.placeholder')"
					></MultiSelection>
				</el-form-item>
				<el-form-item
					required
					:label="$t('editor.cell.data_node.collection.form.initialSyncOrder.keep')"
					v-if="isSourceDataNode"
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
					v-if="isSourceDataNode"
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
					v-model="model.custSql"
					v-bind:initialOffset.sync="model.initialOffset"
					:primaryKeyOptions="primaryKeyOptions"
					v-bind:selectedFields.sync="model.selectedFields"
					v-bind:custFields.sync="model.custFields"
					:tableName="model.tableName"
					:mergedSchema="mergedSchema"
				></queryBuilder>

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
			</el-form>
			<div class="e-entity-wrap" style="text-align: center;">
				<!-- <el-button class="fr" type="success" size="mini"  @click="hanlderLoadSchema">{{
					$t('dataFlow.updateModel')
				}}</el-button> -->
				<entity :schema="convertSchemaToTreeData(mergedSchema)" :editable="false"></entity>
			</div>
		</div>
		<relatedTasks :taskData="taskData" v-if="disabled" v-loading="databaseSelectConfig.loading"></relatedTasks>
	</div>
</template>

<script>
import DatabaseForm from '../../../view/job/components/DatabaseForm/DatabaseForm';
import MultiSelection from '../../../components/MultiSelection';
import ClipButton from '@/components/ClipButton';
import queryBuilder from '@/components/QueryBuilder';
import { convertSchemaToTreeData } from '../../util/Schema';
import RelatedTasks from '../../../components/relatedTasks';
import Entity from '../link/Entity';
import _ from 'lodash';
import factory from '../../../api/factory';

let connectionApi = factory('connections');
const MetadataInstances = factory('MetadataInstances');
let tempSchemas = [];
export default {
	name: 'Table',
	components: { Entity, DatabaseForm, MultiSelection, ClipButton, RelatedTasks, queryBuilder },
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
				this.loadDataModels(this.model.connectionId);
				if (this.model.connectionId) {
					this.taskData.id = this.model.connectionId;
				}
			}
		},
		'model.tableName': {
			immediate: true,
			handler() {}
		},
		mergedSchema: {
			handler() {
				if (this.mergedSchema && this.mergedSchema.fields && this.mergedSchema.fields.length > 0) {
					let fields = this.mergedSchema.fields;
					this.primaryKeyOptions = fields.map(f => f.field_name);
					if (!this.model.primaryKeys) {
						let primaryKeys = fields.filter(f => f.primary_key_position > 0).map(f => f.field_name);
						if (primaryKeys.length > 0) this.model.primaryKeys = Array.from(new Set(primaryKeys)).join(',');
					}
				}
			}
		}
	},

	data() {
		let self = this;
		return {
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
				allowCreate: true,
				defaultFirstOption: true,
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

			isSourceDataNode: false,

			model: {
				connectionId: '',
				databaseType: '',
				tableName: '',
				sql: '',
				editSql: '',
				isFilter: false,
				sqlFromCust: true,
				custFields: [],
				cSql: '',
				filterType: 'field',
				custSql: {
					selectedFields: [],
					fieldFilterType: 'keepAllFields',
					limitLines: '',
					conditions: [{ field: '', command: '', value: '', condStr: '' }]
				},
				initialOffset: '',
				dropTable: false,
				type: 'table',
				primaryKeys: '',
				initialSyncOrder: 0,
				enableInitialOrder: false
			},

			mergedSchema: null,

			primaryKeyOptions: []
		};
	},

	async mounted() {
		await this.loadDataSource();
	},

	methods: {
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
					if (res.statusText === 'OK' || res.status === 200) {
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
					}
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
			this.model.selectedFields.length = 0;
			this.model.custSql.filterConds.length = 0;
			this.model.custSql.filterConds.push({ field: '', calcu: '', val: '', condStr: '' });
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
					if (res.statusText === 'OK' || res.status === 200) {
						let fields = res.data.records[0].schema.tables[0].fields;
						let primaryKeys = fields
							.filter(f => f.primary_key_position > 0)
							.map(f => f.field_name)
							.join(',');
						self.primaryKeyOptions = fields.map(f => f.field_name);
						self.model.custSql.custFields = fields.map(f => f.field_name);
						if (primaryKeys) {
							self.model.primaryKeys = primaryKeys;
						} else {
							self.model.primaryKeys = '';
						}
						self.$emit('schemaChange', _.cloneDeep(res.data.records[0].schema.tables[0]));
					}
				});
			}
			this.taskData.tableName = this.model.tableName;
		},

		setData(data, cell, isSourceDataNode) {
			_.merge(this.model, {
				connectionId: '',
				databaseType: '',
				tableName: '',
				sql: '',
				editSql: '',
				isFilter: false,
				sqlFromCust: true,
				sqlNotFromCust: false,
				custSql: {
					fieldFilterType: 'keepAllFields',
					limitLines: '',
					filterConds: [{ field: '', calcu: '', val: '', condStr: '' }],
					sql: ''
				},
				initialOffset: '',
				dropTable: false,
				type: 'table',
				primaryKeys: '',
				initialSyncOrder: 0,
				enableInitialOrder: false
			});
			if (data) {
				_.merge(this.model, data);
				//老数据的兼容处理
				if (data.initialSyncOrder > 0) {
					this.model.enableInitialOrder = true;
				}
			}
			tempSchemas.length = 0;
			this.isSourceDataNode = isSourceDataNode;
			this.loadDataModels(this.model.connectionId);
			if (this.model.connectionId) {
				this.taskData.id = this.model.connectionId;
			}

			this.mergedSchema = cell.getOutputSchema();
			cell.on('change:outputSchema', () => {
				this.mergedSchema = cell.getOutputSchema();
			});
		},
		getData() {
			if (this.model.isFilter)
				if (this.model.filterType === 'field') this.model.sql = this.model.cSql;
				else this.model.sql = this.model.editSql;
			let result = _.cloneDeep(this.model);
			result.name = result.tableName || 'Table';
			if (this.isSourceDataNode) {
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
			this.loadDataModels(this.model.connectionId);
			this.handlerSchemaChange();
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
</style>
