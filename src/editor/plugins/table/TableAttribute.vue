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
						<el-select
							filterable
							v-model="model.connectionId"
							:placeholder="$t('editor.cell.data_node.table.form.database.placeholder')"
							@change="handlerConnectionChange"
							size="mini"
						>
							<el-option
								v-for="(item, idx) in databases"
								:label="`${item.name} (${item.status})`"
								:value="item.id"
								v-bind:key="idx"
							></el-option>
						</el-select>
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
						<el-select
							filterable
							allow-create
							default-first-option
							clearable
							class="e-select"
							v-model="model.tableName"
							:placeholder="$t('editor.cell.data_node.table.form.table.placeholder')"
							size="mini"
						>
							<el-option
								v-for="(item, idx) in tableNames"
								:label="`${item}`"
								:value="item"
								v-bind:key="idx"
							></el-option>
						</el-select>
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

				<el-form-item
					:label="$t('editor.cell.data_node.table.form.custom_sql.label')"
					prop="sql"
					:rules="rules"
				>
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
let schemas = [];
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
				if (schemas.length > 0) {
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
		return {
			tableNames: [],
			taskData: {
				id: '',
				tableName: ''
			},
			databases: [],
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
		seeMonitor() {
			editor.goBackMontior();
		},

		async loadDataSource() {
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

			if (result.data) {
				this.databases = result.data;
			}
		},

		loadDataModels(connectionId) {
			if (!connectionId) {
				return;
			}
			let self = this;
			connectionApi.get([connectionId]).then(result => {
				if (result.data) {
					let _schemas = (result.data.schema && result.data.schema.tables) || [];
					schemas = _schemas.sort((t1, t2) =>
						t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
					);
					self.tableNames = schemas.map(it => it.table_name);
				}
			});
		},

		handlerConnectionChange() {
			this.model.tableName = '';
			for (let i = 0; i < this.databases.length; i++) {
				if (this.model.connectionId === this.databases[i].id) {
					this.model.databaseType = this.databases[i]['database_type'];
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
}
</style>
