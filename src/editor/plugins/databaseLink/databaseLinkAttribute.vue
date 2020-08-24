<template>
	<div class="database-link nodeStyle" @scroll="$refs.mappingComp.position()">
		<head class="head">
			<span class="headIcon iconfont icon-you2" type="primary"></span>
			<span class="txt">{{ $t('editor.cell.link.mappingRelations') }}</span>
		</head>
		<div class="nodeBody">
			<div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div>
			<el-form
				:disabled="disabled"
				class="e-form"
				label-position="top"
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
				label-position="top"
				label-width="160px"
				:model="model"
				ref="form"
				action="javascript:void(0);"
			>
				<el-form-item :label="$t('editor.cell.link.dataProcessing')">
					<el-select
						v-model="model.dataProcessing"
						:placeholder="$t('editor.cell.link.form.joinType.placeholder')"
						size="mini"
						:disabled="logsFlag"
					>
						<el-option
							v-for="(item, idx) in dataProcessingList"
							:label="`${item.label}`"
							:value="item.value"
							v-bind:key="idx"
						></el-option>
					</el-select>
				</el-form-item>
			</el-form>

			<div class="database-tableBox">
				<div class="box-text">
					<h3>{{ $t('editor.cell.link.migrationSetting') }}</h3>
					<div class="box-btn">
						<span>{{ $t('editor.cell.link.prefixAndSuffix') }}</span>
						<span>{{ $t('editor.cell.link.reduction') }}</span>
					</div>
				</div>
				<div class="transfer">
					<el-transfer
						filterable
						:titles="titles"
						:filter-method="filterMethod"
						:filter-placeholder="$t('editor.cell.link.searchContent')"
						v-model="value"
						:data="data"
					>
					</el-transfer>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import _ from 'lodash';
import log from '../../../log';
let editorMonitor = null;
export default {
	name: 'databaseLink',

	data() {
		const generateData = () => {
			const data = [];
			const cities = ['上海', '北京', '广州', '深圳', '南京', '西安', '成都'];
			const pinyin = ['shanghai', 'beijing', 'guangzhou', 'shenzhen', 'nanjing', 'xian', 'chengdu'];
			cities.forEach((city, index) => {
				data.push({
					label: city,
					key: index,
					pinyin: pinyin[index]
				});
			});
			return data;
		};
		return {
			disabled: false,
			logsFlag: false,

			configJoinTable: false,
			model: {
				label: '',
				dataProcessing: '1',
				includeTables: [],
				type: 'databaseLink'
			},
			dataProcessingList: [
				{ label: this.$t('editor.cell.link.keepExistingData'), value: '1' },
				{ label: this.$t('editor.cell.link.deleteExistingData'), value: '2' }
			],

			titles: [this.$t('editor.cell.link.migrationObjece'), this.$t('editor.cell.link.chosen')],

			data: generateData(),
			value: [],
			filterMethod(query, item) {
				return item.pinyin.indexOf(query) > -1;
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

	created() {
		this.renderSchema();
	},

	methods: {
		setData(data, cell, isSourceDataNode, vueAdapter) {
			if (data) {
				_.merge(this.model, data);
			}
			this.cell = cell;

			this.configJoinTable = cell.configJoinTable && cell.configJoinTable();

			if (!this.configJoinTable) return;

			editorMonitor = vueAdapter.editor;
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
		renderSchema() {
			debugger;
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
.database-link {
	.head {
		display: block;
	}
	.database-tableBox {
		.box-text {
			display: flex;
			padding-bottom: 10px;
			justify-content: space-between;
			font-size: 12px;
			color: #333;
			.box-btn {
				color: #48b6e2;
				cursor: pointer;
			}
		}
	}
}
</style>
<style lang="less"></style>
