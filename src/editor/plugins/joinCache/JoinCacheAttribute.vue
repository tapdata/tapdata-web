<template>
	<section class="join-cache-wrap">
		<div class="head-btns">
			<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
				{{ $t('dataFlow.button.viewMonitoring') }}
			</el-button>
		</div>
		<form-builder ref="form" v-model="model" :config="config">
			<el-table border size="mini" slot="joinSettings" :data="model.joinSettings">
				<el-table-column
					:label="$t('editor.cell.processor.joinCache.form.joinSettings.cacheKey')"
					prop="cacheKey"
				></el-table-column>
				<el-table-column :label="$t('editor.cell.processor.joinCache.form.joinSettings.sourceKey.label')">
					<template slot-scope="scope">
						<el-select
							class="source-key-selection"
							v-model="scope.row.sourceKey"
							:placeholder="$t('editor.cell.processor.joinCache.form.joinSettings.sourceKey.placeholder')"
						>
							<el-option v-for="name in sourceFields" :key="name" :label="name" :value="name"></el-option>
						</el-select>
					</template>
				</el-table-column>
			</el-table>
		</form-builder>
		<div class="schema-mapping">
			<Mapping ref="mappingComp"></Mapping>
		</div>
	</section>
</template>

<script>
import Mapping from '../link/Mapping';
import { convertSchemaToTreeData, mergeJoinTablesToTargetSchema, mergeSchema } from '../../util/Schema';
// import log from '../../../log';
import _ from 'lodash';
let editorMonitor = null;
export default {
	name: 'JoinCache',
	components: {
		Mapping
	},
	data() {
		let self = this;
		return {
			disabled: false,
			model: {
				name: '',
				cacheId: '',
				joinSettings: [],
				joinKey: '',
				type: 'custom_processor',
				scripts: ''
			},
			config: {
				items: [
					{
						type: 'input',
						field: 'name',
						label: this.$t('editor.cell.processor.joinCache.form.name.label'),
						placeholder: this.$t('editor.cell.processor.joinCache.form.name.placeholder'),
						required: true
					},
					{
						type: 'select',
						field: 'cacheId',
						label: this.$t('editor.cell.processor.joinCache.form.cacheId.label'),
						placeholder: this.$t('editor.cell.processor.joinCache.form.cacheId.placeholder'),
						required: true,
						options: [],
						clearable: false,
						on: {
							change(val) {
								let cache = self.cacheMap[val];
								if (cache) {
									let settings = cache.cacheKeys
										.split(',')
										.map(it => ({ cacheKey: it, sourceKey: '' }));
									self.$set(self.model, 'joinSettings', settings);
								}
								self.showMapping();
							}
						}
					},
					{
						type: 'slot',
						label: this.$t('editor.cell.processor.joinCache.form.joinSettings.label'),
						required: true,
						field: 'joinSettings',
						slot: 'joinSettings'
					},
					{
						type: 'select',
						label: this.$t('editor.cell.processor.joinCache.form.joinKey.label'),
						field: 'joinKey',
						placeholder: this.$t('editor.cell.processor.joinCache.form.joinKey.placeholder'),
						options: [],
						filterable: true,
						allowCreate: true,
						defaultFirstOption: true,
						on: {
							change() {
								self.showMapping();
							}
						}
					}
				],
				sourceFields: [],
				cacheMap: {},
				inputSchema: null
			}
		};
	},
	watch: {
		model: {
			deep: true,
			handler() {
				this.$emit('dataChanged', this.getData());
			}
		}
	},
	mounted() {},
	methods: {
		convertSchemaToTreeData,
		getCacheList(editor) {
			let cells = editor.getAllCells();
			let cacheList = [];
			let map = {};
			cells.forEach(cell => {
				let attr = cell.attributes;
				if (attr.type === 'app.MemCache') {
					let formData = attr.form_data;
					cacheList.push({ label: formData.name, value: attr.id });
					map[attr.id] = {
						fields: attr.outputSchema.fields || [],
						cacheKeys: formData.cacheKeys,
						cell: cell,
						name: formData.name
					};
				}
			});
			this.cacheMap = map;
			this.config.items.find(it => it.field === 'cacheId').options = cacheList;
		},
		getSourceFields(schema) {
			let fields = schema.fields || [];
			let sourceFields = [];
			fields.forEach(f => {
				if (f.field_name) {
					sourceFields.push(f.field_name);
				}
			});
			this.sourceFields = sourceFields;
			this.config.items.find(it => it.field === 'joinKey').options = fields.map(it => ({
				label: it.field_name,
				value: it.field_name
			}));
			this.inputSchema = schema;
		},
		showMapping() {
			if (this.model.cacheId) {
				let cacheCell = this.cacheMap[this.model.cacheId];
				if (!cacheCell) {
					this.model.cacheId = '';
					this.model.joinSettings = [];
					this.model.joinKey = '';
					return;
				}
				let cacheOutputSchema = cacheCell.cell.getInputSchema()[0].sourceSchema;
				let joinPath = this.model.joinKey;
				let mergedTargetSchema = mergeSchema(_.cloneDeep(this.inputSchema), cacheOutputSchema, {
					joinType: joinPath ? 'merge_embed' : 'upsert',
					joinPath
				});
				this.$refs.mappingComp.setSchema(cacheOutputSchema, mergedTargetSchema);
				this.$emit('schemaChange', _.cloneDeep(mergedTargetSchema));
			}
		},
		setData(data, cell, isSourceDataNode, vueAdapter) {
			let schema = mergeJoinTablesToTargetSchema(null, cell.getInputSchema());
			if (data) {
				_.merge(this.model, data);
			}

			this.getCacheList(vueAdapter.editor);
			this.getSourceFields(schema);
			this.showMapping();

			editorMonitor = vueAdapter.editor;
		},
		getScripts() {
			let { cacheId, joinSettings, joinKey } = this.model;
			if (!cacheId || !joinSettings.length || joinSettings.some(it => !it.sourceKey)) {
				return '';
			}
			let cacheCell = this.cacheMap[cacheId];

			let sourceFieldStr = joinSettings.map(it => 'record.' + it.sourceKey).join(',');

			//MapUtils.removeKey(cachedRow, ${删除字段名1});
			let scripts = `
				function customProcess(record) {
					var isCdc = context.syncType == 'cdc';
					var cachedRow = CacheService.getAndSetCache( ${cacheCell.name}, isCdc, ${sourceFieldStr} );
					if (cachedRow) {

						if ('${joinKey}') {
							record.put('${joinKey}', cachedRow);
						} else {
							record.putAll(cachedRow);
						}
					}

					return record;
				}
			`;
			return scripts;
		},
		getData() {
			this.model.scripts = this.getScripts();
			return _.cloneDeep(this.model);
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
.join-cache-wrap {
	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 10px;
	.source-key-selection {
		width: 100%;
		input.el-input__inner {
			border: none;
		}
	}
	.schema-mapping {
		flex: 1;
		overflow-y: auto;
	}
}
</style>
