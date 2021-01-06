<template>
	<div class="editor-file-form-builder">
		<header class="form-builder-header">
			<div class="img-box">
				<img :src="getImgByType(model.database_type)" />
			</div>
			<div class="content-box">
				<div class="content">
					{{ model.name }}
					<div class="addBtn" @click="dialogDatabaseTypeVisible = true">
						{{ $t('connection.change') }}
					</div>
				</div>
				<div class="tip">
					{{ $t('dataForm.form.guide') }}
					<a style="color: #48B6E2" href="https://docs.tapdata.net/data-source">{{
						$t('dataForm.form.guideDoc')
					}}</a>
				</div>
			</div>
		</header>
		<form-builder ref="form" v-model="model.formData" :config="config">
			<div class="url-tip" slot="tableFilter">{{ $t('dataForm.form.tableFilterTips') }}</div>
		</form-builder>
		<el-button size="mini" type="primary">加载模型</el-button>
	</div>
</template>
<script>
import _ from 'lodash';
import formConfigs from './config';
import { mergeJoinTablesToTargetSchema, removeDeleted } from '../../util/Schema';
let editorMonitor = null;
export default {
	name: 'FileNode',
	data() {
		return {
			disabled: false,
			model: {
				type: '',
				formData: {},
				script: '',
				isFormValid: true
			},
			config: {
				form: {},
				items: []
			},
			dialogDatabaseTypeVisible: false
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

	methods: {
		setData(data, cell, dataNodeInfo, vueAdapter) {
			if (data) {
				_.merge(this.model, data);
			}
			editorMonitor = vueAdapter.editor;
			let schema = mergeJoinTablesToTargetSchema(cell.getSchema(), cell.getInputSchema());
			let fields = schema.fields || [];
			if (fields.length) {
				fields = removeDeleted(fields);
			}
			let func = formConfigs[data.database_type];
			if (func) {
				let config = func(this);
				let items = config.items || [];
				let formData = this.model.formData;
				items.forEach(it => {
					let value = formData[it.field];
					if (!value && value !== 0) {
						value = '';
					}
					this.$set(this.model.formData, it.field, value);
					if (it.type === 'field') {
						let options = [];
						fields.forEach(f => {
							if (f.field_name) {
								options.push({
									label: f.field_name,
									value: f.field_name
								});
							}
						});
						it.options = options;
					}
				});
				this.config = Object.assign({}, this.config, config);
			}
		},
		getData() {
			return _.cloneDeep(this.model);
		},

		setDisabled(disabled) {
			this.disabled = disabled;
			this.formConfig.form.disabled = true;
		},

		seeMonitor() {
			editorMonitor.goBackMontior();
		},
		getImgByType(type) {
			if (!type) {
				return;
			}
			return require(`../../../../static/image/formBuilder/${type.toLowerCase()}.png`);
		}
	}
};
</script>
<style lang="less" scoped>
.editor-file-form-builder {
	margin: 0 30px 30px 30px;
	.form-builder-header {
		display: flex;
		justify-content: flex-start;
		margin-top: 20px;
		.img-box {
			display: flex;
			width: 48px;
			height: 48px;
			justify-content: center;
			align-items: center;
			background: #fff;
			border-radius: 3px;
			margin-right: 20px;
			img {
				width: 100%;
			}
		}
		.content-box {
			.addBtn {
				color: #48b6e2;
				cursor: pointer;
				font-size: 12px;
				margin-top: 5px;
				margin-left: 10px;
			}
			.tip {
				font-size: 12px;
				color: #999;
				margin-top: 5px;
				line-height: 18px;
			}
		}
		.content {
			display: flex;
			align-items: center;
			font-size: 22px;
			white-space: nowrap;
			word-break: break-word;
			text-overflow: ellipsis;
			overflow: hidden;
		}
	}
}
</style>
