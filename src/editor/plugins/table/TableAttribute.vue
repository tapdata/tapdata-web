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
					<PrimaryKeyInput
						v-model="model.primaryKeys"
						:options="primaryKeyOptions"
						:placeholder="$t('editor.cell.data_node.collection.form.pk.placeholder')"
					></PrimaryKeyInput>
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
							style="margin-right: 20px"
							:active-value="$t('editor.cell.data_node.collection.form.filter.openFiflter')"
							:inactive-value="$t('editor.cell.data_node.collection.form.filter.closeFiflter')"
							@change="model.initialSyncOrder = 0"
						></el-switch>
					</div>
				</el-form-item>

				<el-tabs type="border-card">
					<el-tab-pane :label="$t('editor.cell.data_node.collection.form.filter.fiflterSetting')">
						<el-form-item>
							<el-select v-model="model.fieldFilterType" @change="handleCurrentFieldFilterType">
								<el-option
									v-for="item in filterTypeOptions"
									:key="item.value"
									:label="item.label"
									:value="item.value"
								></el-option>
							</el-select>
						</el-form-item>
						<el-form-item
							v-if="model.fieldFilterType !== 'keepAllFields'"
							:placeholder="
								model.fieldFilterType === 'retainedField'
									? $t('editor.cell.data_node.collection.form.fieldFilter.placeholderKeep')
									: $t('editor.cell.data_node.collection.form.fieldFilter.placeholderDelete')
							"
						>
							<el-select v-model="model.fieldFilter" size="mini">
								<el-option v-for="opt in options" :key="opt" :label="opt" :value="opt"></el-option>
							</el-select>
						</el-form-item>
						<div class="fiflter">
							<div class="title">{{ $t('editor.cell.data_node.collection.form.filter.label') }}</div>
							<div class="rowSlot">
								<span slot="prepend">{{
									$t('editor.cell.data_node.collection.form.filter.rowLimit')
								}}</span>
								<el-select v-model="model.dropTable" size="mini" class="e-select">
									<el-option
										v-for="item in rowNumberList"
										:key="item.value"
										:label="item.label"
										:value="item.value"
									></el-option>
								</el-select>
							</div>
							<el-row :gutter="12" class="e-row">
								<el-col :span="8">
									<el-select v-model="model.dropTable" multiple filterable size="mini">
										<el-option
											:label="$t('editor.cell.data_node.collection.form.dropTable.keep')"
											:value="false"
										></el-option>
									</el-select>
								</el-col>
								<el-col :span="5">
									<el-select v-model="model.dropTable" size="mini">
										<el-option
											v-for="item in calculationList"
											:label="item"
											:value="item"
											:key="item"
										></el-option>
									</el-select>
								</el-col>

								<el-col :span="6">
									<el-input type="text" v-model="model.dropTable" size="mini"></el-input>
								</el-col>

								<el-col :span="5">
									<div class="btn">
										<span class="iconfont icon-quxiao remove"></span>
										<span class="iconfont icon-xinzeng2 remove">or</span>
									</div>
									<!-- <el-radio-group v-model="labelPosition" size="small">
										<el-radio-button label="left">X</el-radio-button>
										<el-radio-button label="right">+ or</el-radio-button>
									</el-radio-group> -->
								</el-col>
							</el-row>
						</div>
					</el-tab-pane>
					<el-tab-pane :label="$t('editor.cell.data_node.collection.form.filter.fiflterSetting')">
						<el-form-item prop="sql" :rules="rules">
							<el-input
								type="textarea"
								rows="10"
								v-model="model.sql"
								:placeholder="$t('editor.cell.data_node.table.form.custom_sql.placeholder')"
								size="mini"
							></el-input>
						</el-form-item>

						<el-form-item :label="$t('editor.cell.data_node.table.form.initial_offset.label')">
							<el-input
								v-model="model.initialOffset"
								:placeholder="$t('editor.cell.data_node.table.form.initial_offset.placeholder')"
								size="mini"
							></el-input>
						</el-form-item>
					</el-tab-pane>
				</el-tabs>

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
				<entity :schema="convertSchemaToTreeData(mergedSchema)" :editable="false"></entity>
			</div>
		</div>
		<relatedTasks :taskData="taskData" v-if="disabled"></relatedTasks>
	</div>
</template>

<script>
import DatabaseForm from '../../../view/job/components/DatabaseForm/DatabaseForm';
import PrimaryKeyInput from '../../../components/PrimaryKeyInput';
import ClipButton from '@/components/ClipButton';
import { convertSchemaToTreeData } from '../../util/Schema';
import RelatedTasks from '../../../components/relatedTasks';
import Entity from '../link/Entity';
import _ from 'lodash';
import factory from '../../../api/factory';
let connectionApi = factory('connections');
let editor = null;
let tempSchemas = [];
export default {
	name: 'Table',
	components: { Entity, DatabaseForm, PrimaryKeyInput, ClipButton, RelatedTasks },
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
			handler() {
				let schemas = tempSchemas;
				if (this.schemaSelectConfig.options.length > 0) {
					if (this.model.tableName) {
						let schema = schemas.filter(s => s.table_name === this.model.tableName);
						schema = schema && schema.length > 0 ? schema[0] : {};
						let fields = schema.fields || [];
						let primaryKeys = fields
							.filter(f => f.primary_key_position > 0)
							.map(f => f.field_name)
							.join(',');
						this.primaryKeyOptions = fields.map(f => f.field_name);
						if (primaryKeys) {
							this.model.primaryKeys = primaryKeys;
						} else {
							this.model.primaryKeys = '';
						}
						this.$emit('schemaChange', _.cloneDeep(schema));
					}
				}
				this.taskData.tableName = this.model.tableName;
			}
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
				initialOffset: '',
				dropTable: false,
				type: 'table',
				primaryKeys: '',
				initialSyncOrder: 0,
				enableInitialOrder: false,

				fieldFilterType: 'keepAllFields',
				fieldFilter: [],
				selectSaveList: []
			},

			mergedSchema: null,

			primaryKeyOptions: [],
			filterTypeOptions: [
				{
					label: this.$t('editor.cell.data_node.collection.form.filter.allField'),
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
			rowNumberList: [
				{
					label: this.$t('editor.cell.data_node.collection.form.filter.allRows'),
					value: 'all'
				},
				{
					label: this.$t('editor.cell.data_node.collection.form.filter.oneThousandRows'),
					value: '1000'
				},
				{
					label: this.$t('editor.cell.data_node.collection.form.filter.tenThousandRows'),
					value: '10000'
				}
			],
			calculationList: ['=', '!=', '>', '<', '>=', '<=', 'like']
		};
	},

	async mounted() {
		await this.loadDataSource();
	},

	methods: {
		convertSchemaToTreeData,
		seeMonitor() {
			editor.goBackMontior();
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
					if (result.data) {
						let schemas = (result.data.schema && result.data.schema.tables) || [];
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

		setData(data, cell, isSourceDataNode, vueAdapter) {
			this.model = {
				connectionId: '',
				databaseType: '',
				tableName: '',
				sql: '',
				dropTable: false,
				type: 'table',
				primaryKeys: '',
				initialOffset: '',
				initialSyncOrder: 0,
				enableInitialOrder: false
			};
			if (data) {
				_.merge(this.model, data);
				//老数据的兼容处理
				if (data.initialSyncOrder > 0) {
					this.model.enableInitialOrder = true;
				}
			}
			this.isSourceDataNode = isSourceDataNode;
			this.loadDataModels(this.model.connectionId);
			if (this.model.connectionId) {
				this.taskData.id = this.model.connectionId;
			}

			this.mergedSchema = cell.getOutputSchema();
			cell.on('change:outputSchema', () => {
				this.mergedSchema = cell.getOutputSchema();
			});
			editor = vueAdapter.editor;
		},
		getData() {
			let result = _.cloneDeep(this.model);
			result.name = result.tableName || 'Table';
			if (this.isSourceDataNode) {
				delete result.dropTable;
			}
			return result;
		},

		setDisabled(disabled) {
			this.disabled = disabled;
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
		box-sizing: border-box;
		border: 1px solid #dcdfe6;
		.title {
			font-size: 14px;
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
	}
}
</style>
<style lang="less">
.e-table {
	.fiflter {
		.e-select .el-input--mini .el-input__inner {
			border: 0;
		}
	}
}
</style>
