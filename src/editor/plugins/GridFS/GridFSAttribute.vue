<template>
<div v-if="visible">
	<div class="gridFsNode nodeStyle">
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
			<el-form class="e-form" label-position="top" :model="model" :disabled="disabled" :rules="rules" ref="form">
				<!-- <span class="addTxt">+新建文件</span> -->
				<el-form-item :label="'GridFS'" prop="connectionId" :rules="rules" required>
					<el-select
						filterable
						v-model="model.connectionId"
						:placeholder="$t('editor.cell.data_node.gridfs.chooseGridFsName')"
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
					v-if="isSourceDataNode && model.gridfsReadMode !== 'binary'"
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

				<el-form-item
					v-if="isSourceDataNode && model.gridfsReadMode !== 'binary'"
					:label="$t('editor.cell.data_node.collection.form.pk.label')"
					prop="primaryKeys"
					:rules="rules"
					required
				>
					<el-input
						v-model="model.primaryKeys"
						:placeholder="$t('editor.cell.data_node.collection.form.pk.placeholder')"
						size="mini"
					></el-input>
				</el-form-item>
			</el-form>
		</div>
		<div
			v-if="isSourceDataNode && model.gridfsReadMode !== 'binary'"
			class="e-entity-wrap"
			style="text-align: center;"
		>
			<entity :schema="convertSchemaToTreeData(mergedSchema)" :editable="false"></entity>
		</div>
	</div>
</div>
</template>
<script>
import _ from 'lodash';
import factory from '../../../api/factory';
import Entity from '../link/Entity';
import { convertSchemaToTreeData } from '../../util/Schema';

let connections = factory('connections');
let editorMonitor = null;
export default {
	name: 'GridFsNode',
	components: { Entity },
	props: {
		database_types: {
			type: Array,
			default: function() {
				return ['gridfs'];
			}
		}
	},

	data() {
		return {
			disabled: false,
			databases: [],
			schemas: [],
			rules: {
				connectionId: [
					{
						required: true,
						trigger: 'blur',
						message: this.$t('editor.cell.data_node.gridfs.chooseGridFsName')
					}
				],
				primaryKeys: [
					{
						required: true,
						trigger: 'blur',
						message: this.$t('editor.cell.data_node.gridfs.none_pk')
					}
				],
				tableName: [
					{
						required: true,
						trigger: 'blur',
						message: this.$t('editor.cell.data_node.gridfs.none_collection')
					}
				]
			},
			isSourceDataNode: false,

			model: {
				connectionId: '',
				type: 'gridfs',
				databaseType: '',
				tableName: '',
				isSource: true,
				primaryKeys: '',
				filter: '',
				gridfsReadMode: ''
			},
			mergedSchema: null
		};
	},

	async mounted() {
		let result = await connections.get({
			filter: JSON.stringify({
				where: {
					database_type: 'gridfs'
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
										meta_type: 'gridfs',
										fields: []
								  };
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

	methods: {
		convertSchemaToTreeData,

		loadDataModels(connectionId) {
			if (!connectionId) {
				return;
			}
			let self = this;
			connections.get([connectionId]).then(result => {
				if (result.data) {
					let schemas = (result.data.schema && result.data.schema.tables) || [];
					schemas = schemas.sort((t1, t2) =>
						t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
					);
					self.schemas = schemas;
					self.model.gridfsReadMode = result.data.gridfsReadMode;
				}
			});
		},

			setData(data, cell, isSourceDataNode, vueAdapter) {
				this.model = {
					connectionId: "",
					type: "gridfs",
					databaseType: "",
					tableName: "",
					isSource: true,
					primaryKeys: "",
					filter: "",
					gridfsReadMode: ''
				}
				if (data) {
					_.merge(this.model, data);
				}
				this.isSourceDataNode = isSourceDataNode;
				this.mergedSchema = cell.getOutputSchema();
				cell.on("change:outputSchema", () => {
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
			if (!this.isSourceDataNode || this.model.gridfsReadMode === 'binary') {
				result.isSource = false;
				delete result.tableName;
				delete result.primaryKeys;
			} else {
				result.isSource = true;
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
.gridFsNode {
	.el-form-item {
		margin-bottom: 10px;
	}
}
</style>
