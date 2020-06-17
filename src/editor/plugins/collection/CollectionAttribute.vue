<template>
	<div class="e-collection nodeStyle">
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
						<el-select
							filterable
							v-model="model.connectionId"
							:placeholder="$t('editor.cell.data_node.collection.form.database.placeholder')"
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
							@click="$refs.databaseForm.show({ whiteList: ['mongodb'] })"
						></el-button>
						<DatabaseForm ref="databaseForm"></DatabaseForm>
					</div>
				</el-form-item>

				<el-form-item
					:label="$t('editor.cell.data_node.collection.form.collection.label')"
					prop="tableName"
					required
				>
					<el-select
						v-model="model.tableName"
						filterable
						allow-create
						default-first-option
						clearable
						:placeholder="$t('editor.cell.data_node.collection.form.collection.placeholder')"
						size="mini"
					>
						<el-option
							v-for="(item, idx) in schemas"
							:label="`${item.table_name}`"
							:value="item.table_name"
							v-bind:key="idx"
						></el-option>
					</el-select>
				</el-form-item>

				<el-form-item :label="$t('editor.cell.data_node.collection.form.pk.label')" required>
					<el-input
						v-model="model.primaryKeys"
						:placeholder="$t('editor.cell.data_node.collection.form.pk.placeholder')"
						size="mini"
					></el-input>
				</el-form-item>
				<el-form-item
					required
					:label="$t('editor.cell.data_node.collection.form.initialSyncOrder.keep')"
					v-if="isSourceDataNode"
				>
					<el-input-number
						v-model="model.initialSyncOrder"
						controls-position="right"
						:min="1"
						size="mini"
					></el-input-number>
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

				<el-form-item :label="$t('editor.cell.data_node.collection.form.filter.label')">
					<el-input
						v-model="model.filter"
						type="textarea"
						rows="5"
						:placeholder="$t('editor.cell.data_node.collection.form.filter.placeholder')"
						size="mini"
					></el-input>
				</el-form-item>
			</el-form>
			<div class="e-entity-wrap" style="text-align: center;">
				<entity :schema="convertSchemaToTreeData(mergedSchema)" :editable="false"></entity>
			</div>
		</div>
	</div>
</template>

<script>
import DatabaseForm from '../../../view/job/components/DatabaseForm/DatabaseForm';
import { convertSchemaToTreeData } from '../../util/Schema';
import Entity from '../link/Entity';
import _ from 'lodash';
import factory from '../../../api/factory';
let connectionApi = factory('connections');
let editorMonitor = null;
export default {
	name: 'Collection',
	components: { Entity, DatabaseForm },
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
				this.loadDataModels(this.model.connectionId);
			}
		},
		'model.tableName': {
			immediate: true,
			handler() {
				if (this.schemas.length > 0) {
					if (this.model.tableName) {
						let schema = this.schemas.filter(s => s.table_name === this.model.tableName);
						schema =
							schema && schema.length > 0
								? schema[0]
								: {
										table_name: this.model.tableName,
										cdc_enabled: true,
										meta_type: 'collection',
										fields: []
								  };
						/* let fields = schema.fields || [];
							let primaryKeys = fields.filter(f => f.primary_key_position > 0).map(f => f.field_name).join(',');
							if( primaryKeys) this.model.primaryKeys = primaryKeys; */
						this.$emit('schemaChange', _.cloneDeep(schema));
					}
				}
			}
		},
		mergedSchema: {
			handler() {
				if (
					!this.model.primaryKeys &&
					this.mergedSchema &&
					this.mergedSchema.fields &&
					this.mergedSchema.fields.length > 0
				) {
					let primaryKeys = this.mergedSchema.fields
						.filter(f => f.primary_key_position > 0)
						.map(f => f.field_name);
					let unique = {};
					primaryKeys.forEach(key => (unique[key] = 1));
					primaryKeys = Object.keys(unique);
					if (primaryKeys.length > 0) this.model.primaryKeys = primaryKeys.join(',');
				}
			}
		}
	},

	data() {
		return {
			disabled: false,
			databases: [],
			schemas: [],

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

			isSourceDataNode: false,

			model: {
				connectionId: '',
				databaseType: '',
				tableName: '',
				dropTable: false,
				type: 'collection',
				primaryKeys: '',
				filter: '',
				initialSyncOrder: 1
			},

			mergedSchema: null
		};
	},

	async mounted() {
		await this.loadDataSource();
	},

	methods: {
		convertSchemaToTreeData,

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
					let schemas = (result.data.schema && result.data.schema.tables) || [];
					schemas = schemas.sort((t1, t2) =>
						t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
					);
					self.schemas = schemas;
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
			if (data) {
				// Object.keys(data).forEach(key => (this.model[key] = data[key]));
				_.merge(this.model, data);
			}
			this.isSourceDataNode = isSourceDataNode;

			this.mergedSchema = cell.getOutputSchema();
			cell.on('change:outputSchema', () => {
				this.mergedSchema = cell.getOutputSchema();
			});

			editorMonitor = vueAdapter.editor;
		},
		getData() {
			let result = _.cloneDeep(this.model);
			result.name = result.tableName || 'Collection';
			if (this.isSourceDataNode) {
				delete result.dropTable;
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

<style lang="less" scoped>
.e-collection {
	.e-entity-wrap {
		flex: 1;
		overflow: auto;
	}
}
</style>
