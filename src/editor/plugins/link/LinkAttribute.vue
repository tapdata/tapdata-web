<template>
	<div class="e-link-wrap" @scroll="$refs.mappingComp.position()">
		<div class="head-btns">
			<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
				{{ $t('dataFlow.button.viewMonitoring') }}
			</el-button>
		</div>
		<el-form
			:disabled="disabled"
			class="e-form"
			label-position="right"
			label-width="160px"
			:model="model"
			ref="form"
			action="javascript:void(0);"
		>
			<el-form-item :label="$t('editor.cell.link.form.label.label')">
				<el-input
					v-model="model.label"
					:placeholder="$t('editor.cell.link.form.label.placeholder')"
					size="mini"
					maxlength="50"
					show-word-limit
				>
				</el-input>
			</el-form-item>
		</el-form>

		<el-form
			:disabled="disabled"
			class="e-form"
			label-position="right"
			label-width="160px"
			:model="model"
			ref="form"
			v-show="configJoinTable"
			action="javascript:void(0);"
		>
			<!--<el-form-item label="Table name" required>
				<el-input
						v-model="model.joinTable.tableName"
						placeholder="please enter table name"></el-input>
			</el-form-item>

			<el-form-item label="Table primary key" required>
				<el-input
						v-model="model.joinTable.primaryKeys"
						placeholder="please enter primary key"></el-input>
			</el-form-item>-->

			<el-form-item :label="$t('editor.cell.link.form.joinType.label')" required>
				<el-select
					v-model="model.joinTable.joinType"
					:placeholder="$t('editor.cell.link.form.joinType.placeholder')"
					@change="handlerJoinTypeChanged"
					size="mini"
					:disabled="logsFlag"
				>
					<el-option
						v-for="(item, idx) in writeModels"
						:label="`${item.label}`"
						:value="item.value"
						v-bind:key="idx"
					></el-option>
				</el-select>
			</el-form-item>
			<el-form-item
				:label="$t('editor.cell.link.form.arrayUniqueKey.label')"
				required
				v-if="['merge_embed'].includes(model.joinTable.joinType)"
			>
				<el-input
					v-model="model.joinTable.arrayUniqueKey"
					:placeholder="$t('editor.cell.link.form.arrayUniqueKey.placeholder')"
					size="mini"
				></el-input>
				<ClipButton :value="model.joinTable.arrayUniqueKey"></ClipButton>
			</el-form-item>
			<el-form-item
				:label="$t('editor.cell.link.form.joinPath.label')"
				v-if="supportEmbedArray() && ['upsert', 'update', 'merge_embed'].includes(model.joinTable.joinType)"
			>
				<el-input
					v-model="model.joinTable.joinPath"
					:placeholder="$t('editor.cell.link.form.joinPath.placeholder')"
					size="mini"
					@input="checkRepeatId()"
				>
				</el-input>
				<ClipButton :value="model.joinTable.joinPath"></ClipButton>
			</el-form-item>

			<el-form-item
				:label="$t('editor.cell.link.form.joinMethod.label')"
				v-if="['merge_embed'].includes(model.joinTable.joinType)"
			>
				<el-select
					v-model="model.joinTable.manyOneUpsert"
					:placeholder="$t('editor.cell.link.form.joinMethod.placeholder')"
					size="mini"
				>
					<el-option
						v-for="(item, idx) in methodList"
						:label="item.label"
						:value="item.value"
						:key="idx"
					></el-option>
				</el-select>
			</el-form-item>

			<el-form-item
				:label="$t('editor.cell.link.form.joinKeys.label')"
				required
				v-if="!['append'].includes(model.joinTable.joinType)"
			>
				<table class="e-table">
					<thead>
						<tr>
							<th>{{ $t('editor.cell.link.form.joinKeys.sourceField') }}</th>
							<th>{{ $t('editor.cell.link.form.joinKeys.targetField') }}</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item, idx) in model.joinTable.joinKeys" v-bind:key="idx">
							<td>
								<el-select v-model="item.source" filterable allow-create default-first-option>
									<el-option
										v-for="(item, idx) in sourceList"
										:value="item.field_name"
										:label="item.field_name"
										v-bind:key="idx"
									></el-option>
								</el-select>
								<!-- <input type="text" v-model="item.source"> -->
							</td>
							<td>
								<el-select v-model="item.target" filterable allow-create default-first-option>
									<el-option
										v-for="(item, idx) in targetList"
										:value="item.field_name"
										:label="item.field_name"
										v-bind:key="idx"
									></el-option>
								</el-select>
								<!-- <input type="text" v-model="item.target"> -->
								<div class="e-action-bar">
									<el-button
										v-if="model.joinTable.joinKeys.length > 1"
										type="text"
										class="el-icon-close"
										size="mini"
										@click="removeCondition(idx)"
									></el-button>
									<el-button
										v-if="idx === model.joinTable.joinKeys.length - 1"
										type="text"
										class="el-icon-plus"
										size="mini"
										@click="addCondition"
									></el-button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</el-form-item>
		</el-form>

		<div class="e-mapping-wrap" v-show="configJoinTable">
			<Mapping ref="mappingComp"></Mapping>
		</div>
	</div>
</template>

<script>
import _ from 'lodash';
import { EditorEventType } from '../../lib/events';
import Mapping from './Mapping';
import log from '../../../log';
import { JOIN_TABLE_TPL } from '../../constants';
import ClipButton from '@/components/ClipButton';
let editorMonitor = null;
export default {
	name: 'Link',
	components: { Mapping, ClipButton },

	data() {
		return {
			disabled: false,
			logsFlag: false,
			sourceList: [],
			targetList: [],
			writeModels: [],
			sourceSchema: [],
			targetSchema: [],

			methodList: [
				{ label: this.$t('editor.cell.link.methodList.false'), value: false },
				{ label: this.$t('editor.cell.link.methodList.true'), value: true }
			],

			configJoinTable: false,
			model: {
				label: '',
				joinTable: _.cloneDeep(JOIN_TABLE_TPL),
				type: 'link'
			}
		};
	},

	watch: {
		model: {
			deep: true,
			handler() {
				this.$emit('dataChanged', this.getData());
			}
		},
		'model.joinTable.joinType': {
			handler() {
				if (this.model.joinTable.joinType === 'merge_embed' && this.cell) {
					if (!this.model.joinTable.arrayUniqueKey) {
						let sourceCell = this.cell.getSourceCell(),
							sourceSchema = sourceCell ? sourceCell.getOutputSchema() : null;
						let sourcePKs = this.getPKsFromSchema(sourceSchema);
						if (sourcePKs && sourcePKs.length > 0) {
							this.model.joinTable.arrayUniqueKey =
								sourcePKs[0].field_name || sourcePKs[0].original_field_name;
						}
					}
				} else {
					this.model.joinTable.arrayUniqueKey = '';
				}
			}
		}
	},

	created() {
		this.WRITE_MODELS = [
			{
				label: this.$t('editor.cell.link.writeMode.append'),
				value: 'append' // insert				{source: ''} + {target: ''}  =  {source: '', target: ''}
			},
			{
				label: this.$t('editor.cell.link.writeMode.upsert'),
				value: 'upsert' // OneOne				{source: ''} + {target: ''}  =  {source: '', joinPath: {target: ''}}
			},
			{
				label: this.$t('editor.cell.link.writeMode.update'),
				value: 'update' // OneMany				{source: ''} + {target: ''}  =  {source: '', joinPath: {target: ''}}
			},
			{
				label: this.$t('editor.cell.link.writeMode.merge_embed'),
				value: 'merge_embed' // ManyOne		{source: ''} + {target: ''}  =  {source: '', joinPath: [{target: ''}]}
			}
		];
		let self = this;
		self.$on(EditorEventType.RESIZE, () => {
			self.$refs.mappingComp && self.$refs.mappingComp.$emit(EditorEventType.RESIZE);
		});

		this.$on(EditorEventType.HIDE, () => {
			self.$refs.mappingComp && self.$refs.mappingComp.hide();
		});
		this.$on(EditorEventType.SHOW, () => {
			self.$refs.mappingComp && self.$refs.mappingComp.show();
		});
	},

	mounted() {
		this.model.joinTable.manyOneUpsert = this.methodList[0].value;
	},

	methods: {
		/**
		 * 	提示用户_id重复，需要更名
		 *  1. 数据写入模式：更新已存在或插入新数据、更新写入模式
		 *	2. 关联后写入路径为空
		 *	3. 两表合并且都存在_id
		 */
		checkRepeatId() {
			let self = this;
			let path = self.model.joinTable.joinPath;
			let type = self.model.joinTable.joinType;

			if (path && path.trim()) {
				return;
			}
			if (type !== 'update' && type !== 'upsert') {
				return;
			}
			let cell = self.cell;
			let targetCell = cell.getTargetCell();
			let fields = targetCell.attributes.outputSchema.fields || [];
			const h = self.$createElement;
			let messageArr = self.$t('editor.cell.link.repeatId.message').split('_id');
			let msgNode = [];
			messageArr.forEach((m, i) => {
				msgNode.push(m);
				if (i < messageArr.length - 1) {
					msgNode.push(h('i', { class: 'color-primary' }, '_id'));
				}
			});
			fields.forEach(field => {
				if (field.fromDB && field.field_name === '_id' && field.fromDB.length > 2) {
					self.$notify({
						title: self.$t('editor.cell.link.repeatId.title'),
						message: h('i', {}, msgNode),
						duration: 0
					});
				}
			});
		},
		supportEmbedArray() {
			return !['app.Table'].includes(this.targetCellType);
		},
		removeCondition(idx) {
			this.model.joinTable.joinKeys.splice(idx, 1);
			this.$emit(EditorEventType.RESIZE);
		},
		addCondition() {
			this.model.joinTable.joinKeys.push({ source: '', target: '' });
			this.$emit(EditorEventType.RESIZE);
		},

		setData(data, cell, isSourceDataNode, vueAdapter) {
			if (data) {
				_.merge(this.model, data);
			}
			this.cell = cell;

			this.configJoinTable = cell.configJoinTable && cell.configJoinTable();

			if (!this.configJoinTable) return;

			if (cell.getSourceCell()) {
				let sourceCell = cell.getSourceCell(),
					targetCell = cell.getTargetCell(),
					sourceSchema = sourceCell ? sourceCell.getOutputSchema() : null,
					// targetSchema = targetCell ? targetCell.getSchema() : null,
					mergedTargetSchema =
						targetCell && typeof targetCell.getOutputSchema === 'function'
							? targetCell.getOutputSchema()
							: null;

				let firstDataNode =
					typeof sourceCell.getFirstDataNode === 'function' ? sourceCell.getFirstDataNode() : [];
				this.model.joinTable.stageId = firstDataNode.length > 0 ? firstDataNode[0].id : '';
				// this.model.joinTable.stageId = cell.getSourceCell().id;

				let sourceList =
					sourceSchema && sourceSchema.fields
						? sourceSchema.fields.sort((v1, v2) =>
								v1.field_name > v2.field_name ? 1 : v1.field_name === v2.field_name ? 0 : -1
						  )
						: [];

				let targetList =
					mergedTargetSchema && mergedTargetSchema.fields
						? mergedTargetSchema.fields.sort((v1, v2) =>
								v1.field_name > v2.field_name ? 1 : v1.field_name === v2.field_name ? 0 : -1
						  )
						: [];
				this.sourceList = (sourceList && sourceList.filter(item => item.field_name !== '')) || [];
				this.targetList = (targetList && targetList.filter(item => item.field_name !== '')) || [];

				let joinKeys = this.model.joinTable.joinKeys;
				// 关联字段自动填充
				if (
					joinKeys.length === 0 ||
					(joinKeys.length === 1 && (joinKeys[0].source === '' || joinKeys[0].target === ''))
				) {
					if (this.model.joinTable.joinType === 'upsert') {
						let sourcePKs = this.getPKsFromSchema(sourceSchema).sort((v1, v2) =>
							v1 > v2 ? 1 : v1 === v2 ? 0 : -1
						);
						let mergeFields = [];
						if (mergedTargetSchema && mergedTargetSchema.fields) {
							mergeFields = mergedTargetSchema.fields;
						}

						mergeFields.sort((v1, v2) => (v1 > v2 ? 1 : v1 === v2 ? 0 : -1));

						// let targetPKs = this.getPKsFromSchema(targetSchema).sort((v1, v2) =>
						// 	v1 > v2 ? 1 : v1 === v2 ? 0 : -1
						// );
						// let comparedPKs = mergePKs || [];

						let initialAssociationPKs = this.model.joinTable.joinKeys;
						if (sourcePKs && sourcePKs.length > 0) {
							initialAssociationPKs = sourcePKs.map(field => {
								let source = field.field_name;
								let target = '';
								if (mergeFields && mergeFields.length) {
									let pk = mergeFields.find(tField => tField.field_name === field.field_name);
									if (pk) {
										target = pk.field_name;
									}
								}
								return {
									source,
									target
								};
							});
						}
						this.model.joinTable.joinKeys = initialAssociationPKs;
					}
				}
				// 日志挖掘
				this.logsFlag = sourceCell.get('type') === 'app.Logminer' ? true : false;
				if (this.logsFlag) {
					this.model.joinTable.joinType = 'append';
				}
			}

			this.$emit(EditorEventType.RESIZE);
			this.showMapping(data, cell, vueAdapter);

			editorMonitor = vueAdapter.editor;
		},

		handleUpSert() {},

		getPKsFromSchema(schema) {
			return schema && schema.fields && schema.fields.length > 0
				? schema.fields.filter(item => item.primary_key_position > 0)
				: [];
		},
		getData() {
			let data = JSON.parse(JSON.stringify(this.model));
			/* if( data.joinTable.joinKeys.length > 0 ){
					let joinKeys = data.joinTable.joinKeys.filter( key => key.source && key.target);
					data.joinTable.joinKeys = joinKeys;
				} */
			if (!this.configJoinTable) {
				delete data.joinTable;
			}
			if (data.joinType === 'append') delete data.joinPath;
			return data;
		},

		/**
		 * show current link source schema, target schema and config mapping
		 * @param cell
		 * @param vueAdapter
		 */
		showMapping() {
			this.targetCell = this.cell.getTargetCell();
			this.targetCellType = this.targetCell.get('type');
			this.writeModels.splice(0, this.writeModels.length);
			if (this.supportEmbedArray()) {
				this.WRITE_MODELS.forEach(model => this.writeModels.push(model));
			} else {
				this.WRITE_MODELS.filter(model => model.value !== 'merge_embed').forEach(model =>
					this.writeModels.push(model)
				);
			}

			this.unwatch = this.$watch(
				'model.joinTable',
				() => {
					log('Link.showMapping.watchJoinTable', arguments);
					this.targetCell.updateOutputSchema();
				},
				{ deep: true }
			);

			this.targetCell.on('change:outputSchema', this.renderSchema, this);

			this.renderSchema();
		},

		renderSchema() {
			if (this.cell) {
				let sourceCell = this.cell.getSourceCell(),
					targetCell = this.cell.getTargetCell(),
					sourceSchema = sourceCell ? sourceCell.getOutputSchema() : null;
				/* targetInputSchema = targetCell ? targetCell.getInputSchema() : null,
						targetSchema = targetCell ? targetCell.getSchema() : {
							meta_type: this.targetCell.get('type') === 'app.Collection' ? 'collection' : 'table'
						} */
				let mergedTargetSchema =
					targetCell && typeof targetCell.getOutputSchema === 'function'
						? targetCell.getOutputSchema()
						: null; // mergeJoinTablesToTargetSchema(targetSchema, targetInputSchema);

				let targetSchemaFields = (mergedTargetSchema && mergedTargetSchema.fields) || [];
				let targetJoinFields = targetSchemaFields.filter(
					field => field.field_name === this.model.joinTable.joinPath
				);
				let isArray =
					targetJoinFields && targetJoinFields.length > 0 && targetJoinFields[0].javaType === 'Array';
				if (this.model.joinTable.isArray !== isArray) this.model.joinTable.isArray = isArray;
				this.$refs.mappingComp.setSchema(sourceSchema, mergedTargetSchema);
				log('Link.renderSchema', sourceSchema, mergedTargetSchema);
			}
		},

		handlerJoinTypeChanged() {
			this.checkRepeatId();
			if (!this.model.joinTable.joinPath && ['merge_embed', 'update'].includes(this.model.joinTable.joinType)) {
				this.model.joinTable.joinPath = this.model.joinTable.tableName;
			}
			this.$refs.mappingComp.$emit(EditorEventType.RESIZE);
			this.model.joinTable.joinKeys = [{ source: '', target: '' }];
		},

		setDisabled(disabled) {
			this.disabled = disabled;
		},

		seeMonitor() {
			editorMonitor.goBackMontior();
		}
	},

	destroyed() {
		log('Link.destroyed');
		if (this.unwatch) this.unwatch();
		if (this.targetCell) {
			this.targetCell.off('change:outputSchema', this.renderSchema, this);
		}
		delete this.unwatch;
		delete this.cell;
		delete this.targetCell;
	}
};
</script>

<style lang="less" scoped>
.e-link-wrap {
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: start;
	padding: 10px;
	box-sizing: border-box;
	overflow: auto;
	.e-form {
		.el-input,
		.el-select {
			max-width: 400px;
			width: 80%;
		}
	}

	.e-table {
		display: inline-block;
		font-size: 0.9em;
		color: #606266;

		thead {
			background: whitesmoke;
		}

		th {
			font-weight: normal;
		}

		tr,
		td,
		th {
			border-collapse: collapse;
			border: 1px solid #ccc;
		}

		td {
			position: relative;
		}

		input {
			color: #606266;
			width: 174px;
			height: 20px;
			outline: none;
			border: none;
			padding: 0 10px;
			box-sizing: border-box;
		}

		.e-action-bar {
			position: absolute;
			right: -56px;
			top: 0;
			width: 50px;
		}
	}

	.e-mapping-wrap {
		flex: 1;
		height: 50%;
	}
}
</style>
<style lang="less">
.e-link-wrap .el-form .el-radio-group {
	display: flex;
	justify-content: center;
	align-items: baseline;
	flex-flow: column;
	padding-left: 55px;
}

.e-link-wrap {
	.e-table .el-select {
		width: 174px !important;
		border: 0;

		.el-input__inner {
			border: 0;
			height: 30px;
		}
	}
}
</style>
