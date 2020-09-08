<template>
	<div class="esNode nodeStyle">
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
			<el-form class="e-form" label-position="top" :model="model" :disabled="disabled" ref="form">
				<!-- <span class="addTxt">+新建文件</span> -->
				<el-form-item
					:label="$t('editor.cell.data_node.redis.name')"
					prop="connectionId"
					:rules="rules"
					required
				>
					<el-select
						:filterable="!databaseLoading"
						:loading="databaseLoading"
						v-model="model.connectionId"
						:placeholder="$t('editor.cell.data_node.redis.chooseRedisName')"
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
					:label="$t('editor.cell.data_node.redis.cacheKey')"
					prop="redisKey"
					:rules="rules"
					required
				>
					<MultiSelection
						v-model="model.redisKey"
						:options="redisKeyOptions"
						:placeholder="$t('editor.cell.data_node.redis.cacheKey_placeholder')"
					></MultiSelection>
				</el-form-item>
				<el-form-item :label="$t('editor.cell.data_node.redis.prefixKey')">
					<el-input
						v-model="model.redisKeyPrefix"
						:placeholder="$t('editor.cell.data_node.redis.prefixKey_placeholder')"
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
import { convertSchemaToTreeData } from '../../util/Schema';
import Entity from '../link/Entity';
import _ from 'lodash';
import factory from '../../../api/factory';
let connections = factory('connections');
let editorMonitor = null;
import MultiSelection from '../../../components/MultiSelection';
export default {
	name: 'redis',
	components: { Entity, MultiSelection },
	props: {
		database_types: {
			type: Array,
			default: function() {
				return ['redis'];
			}
		}
	},

	data() {
		return {
			disabled: false,
			databases: [],
			databaseLoading: false,
			rules: {
				connectionId: [
					{
						required: true,
						trigger: 'blur',
						message: this.$t('editor.cell.data_node.redis.Redis_isNull')
					}
				],
				redisKey: [
					{
						required: true,
						trigger: 'blur',
						message: this.$t('editor.cell.data_node.redis.prefixKey_placeholder')
					}
				]
			},
			model: {
				connectionId: '',
				redisKey: '',
				redisKeyPrefix: '',
				type: 'redis'
			},
			redisKeyOptions: [],
			mergedSchema: null
		};
	},

	async mounted() {
		this.databaseLoading = true;
		let result = await connections.get({
			filter: JSON.stringify({
				where: {
					database_type: 'redis'
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
		mergedSchema: {
			handler() {
				if (this.mergedSchema && this.mergedSchema.fields && this.mergedSchema.fields.length > 0) {
					let fields = this.mergedSchema.fields;
					this.model.redisKey = [];
					this.redisKeyOptions = fields.map(f => f.field_name);
				}
			}
		}
	},

	methods: {
		convertSchemaToTreeData,

		async loadDataSource() {
			let result = await connections.get({
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
			connections.get([connectionId]).then(result => {
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

		setData(data, cell, dataNodeInfo, vueAdapter) {
			if (data) {
				_.merge(this.model, data);
			}

			this.mergedSchema = cell.getOutputSchema();
			cell.on('change:outputSchema', () => {
				this.mergedSchema = cell.getOutputSchema();
			});
			this.sourceList =
				this.mergedSchema && this.mergedSchema.fields
					? this.mergedSchema.fields.sort((v1, v2) =>
							v1.field_name > v2.field_name ? 1 : v1.field_name === v2.field_name ? 0 : -1
					  )
					: [];

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

		setDisabled(disabled) {
			this.disabled = disabled;
		},

		seeMonitor() {
			editorMonitor.goBackMontior();
		}
	}
};
</script>
