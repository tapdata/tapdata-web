<template>
	<div class="customName nodeStyle">
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
			<el-form class="e-form" label-position="top" :model="model" ref="form" :disabled="disabled">
				<!-- <span class="addTxt">+新建文件</span> -->
				<el-form-item :label="$t('editor.choose') + ' Custom'" prop="connectionId" :rules="rules" required>
					<el-select
						:filterable="!databaseLoading"
						:loading="databaseLoading"
						v-model="model.connectionId"
						:placeholder="$t('editor.cell.data_node.custom.chooseCustomName')"
						@change="handlerConnectionChange"
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
								v-for="(item, idx) in schemas"
								:label="`${item.table_name}`"
								:value="item.table_name"
								v-bind:key="idx"
							></el-option>
						</el-select>
						<ClipButton :value="model.tableName"></ClipButton>
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
			</el-form>
			<div class="e-entity-wrap" style="text-align: center;">
				<entity :schema="convertSchemaToTreeData(mergedSchema)" :editable="false"></entity>
			</div>
		</div>
		<relatedTasks :taskData="taskData" v-if="disabled"></relatedTasks>
	</div>
</template>

<script>
import _ from 'lodash';
import factory from '../../../api/factory';
// import MultiSelection from '../../../components/MultiSelection';
import RelatedTasks from '../../../components/relatedTasks';
import ClipButton from '@/components/ClipButton';
import Entity from '../link/Entity';
import { convertSchemaToTreeData, uuid } from '../../util/Schema';

let connectionApi = factory('connections');
let editorMonitor = null;
export default {
	name: 'CustomNode',
	components: { Entity, ClipButton, RelatedTasks },
	props: {
		connection_type: {
			type: String,
			default: 'source'
		}
	},
	data() {
		return {
			taskData: {
				id: '',
				tableName: ''
			},
			schemas: [],
			disabled: false,
			isSourceDataNode: true,
			databases: [],
			databaseLoading: false,
			rules: {
				connectionId: [
					{
						required: true,
						trigger: 'blur',
						message: this.$t('editor.cell.data_node.custom.chooseCustomName')
					}
				]
			},
			model: {
				connectionId: '',
				tableName: '',
				type: 'custom_connection'
				// primaryKeys: ''
			},
			mergedSchema: null,
			primaryKeyOptions: []
		};
	},

	async mounted() {
		this.databaseLoading = true;
		let result = await connectionApi.get({
			filter: JSON.stringify({
				where: {
					database_type: 'custom_connection'
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

		this.databaseLoading = false;
		if (result.data) {
			this.databases = result.data;
		}
	},
	watch: {
		model: {
			deep: true,
			handler() {
				this.$emit('dataChanged', this.getData());
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
			}
		},
		mergedSchema: {
			handler() {
				if (this.mergedSchema && this.mergedSchema.fields && this.mergedSchema.fields.length > 0) {
					let fields = this.mergedSchema.fields;
					this.primaryKeyOptions = fields.map(f => f.field_name);
					// if (!this.model.primaryKeys) {
					// 	let primaryKeys = fields.filter(f => f.primary_key_position > 0).map(f => f.field_name);
					// 	if (primaryKeys.length > 0) this.model.primaryKeys = primaryKeys.join(',');
					// }
				}
			}
		}
	},
	methods: {
		convertSchemaToTreeData,
		setData(data, cell, dataNodeInfo, vueAdapter) {
			if (data) {
				_.merge(this.model, data);
			}
			this.isSourceDataNode = dataNodeInfo && (dataNodeInfo.isSource || !dataNodeInfo.isTarget);
			this.mergedSchema = cell.getOutputSchema();
			cell.on('change:outputSchema', () => {
				this.mergedSchema = cell.getOutputSchema();
			});

			editorMonitor = vueAdapter.editor;
		},
		getData() {
			let result = _.cloneDeep(this.model);
			if (result.connectionId) {
				let database = this.databases.filter(db => db.id === result.connectionId);
				if (database && database.length > 0) {
					result.name = database[0].name;
				}
			}
			return result;
		},

		handlerConnectionChange() {
			for (let i = 0; i < this.databases.length; i++) {
				if (this.model.connectionId === this.databases[i].id) {
					this.model.databaseType = this.databases[i]['database_type'];
				}
			}
			this.loadDataModels(this.model.connectionId);
			if (this.model.connectionId) {
				this.taskData.id = this.model.connectionId;
				this.taskData.tableName = this.model.tableName;
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
		setDisabled(disabled) {
			this.disabled = disabled;
		},
		seeMonitor() {
			editorMonitor.goBackMontior();
		}
	}
};
</script>
