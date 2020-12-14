<template>
	<section class="template-process-wrap">
		<main style="padding: 20px;">
			<div style="text-align: right;">
				<el-button size="mini" type="primary">更新节点配置</el-button>
			</div>
			<form-builder ref="form" v-model="model.formData" :config="formConfig"></form-builder>
			<div style="padding: 5px 15px;background: #fff;color: #333;font-size: 12px;margin-top: 20px;">
				<pre>{{ this.model.script }}</pre>
			</div>
		</main>
	</section>
</template>
<script>
import _ from 'lodash';
import { mergeJoinTablesToTargetSchema, removeDeleted } from '../../util/Schema';
// import log from '../../../log';

export default {
	name: 'TemplateProcess',
	data() {
		return {
			disabled: false,
			model: {
				type: 'template_processor',
				formData: {},
				script: ''
			},
			formConfig: {
				form: {},
				items: []
			},
			scriptTemplate: '',
			isValid: true
		};
	},
	created() {},
	watch: {
		model: {
			deep: true,
			handler() {
				this.$nextTick(() => {
					this.$refs.form.validate(isValid => {
						this.model.isValid = isValid;
						this.$emit('dataChanged', this.getData());
					});
				});
			}
		}
	},

	methods: {
		setData(data, cell) {
			if (data) {
				this.model = Object.assign(this.model, data);
			}

			let schema = mergeJoinTablesToTargetSchema(cell.getSchema(), cell.getInputSchema());
			let fields = schema.fields || [];
			if (fields.length) {
				fields = removeDeleted(fields);
			}

			let config = cell.getConfig();
			let formConfig = config.formConfig;

			if (formConfig && formConfig.items) {
				let items = formConfig.items || [];
				let formData = this.model.formData;
				items.forEach(it => {
					this.$set(this.model.formData, it.field, formData[it.field] || '');
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
			}
			debugger;
			this.formConfig = formConfig;
			this.scriptTemplate = config.scriptTemplate;
		},
		getScript() {
			let { formData } = this.model;
			let script = this.scriptTemplate;
			for (let key in formData) {
				let value = formData[key];
				switch (Object.prototype.toString.call(value)) {
					case '[object String]':
						value = `"${value}"`;
						break;
					case '[object Array]':
						value = `[${value
							.map(v => {
								if (Object.prototype.toString.call(v) === '[object Number]') {
									return v;
								} else {
									return `"${v}"`;
								}
							})
							.toString()}]`;
						break;
					case '[object Number]':
						value = `${value}`;
						break;
					default:
						value = `"${value}"`;
						break;
				}
				script = script.replace('${' + key + '}', value);
			}
			return script;
		},
		getData() {
			this.model.script = this.getScript();
			return _.cloneDeep(this.model);
		},

		setDisabled(disabled) {
			this.disabled = disabled;
		}
	}
};
</script>

<style lang="less" scoped>
.template-process-wrap {
	height: 100%;
	overflow: hidden;
	main {
		padding: 20px;
		height: 100%;
		overflow: auto;
		box-sizing: border-box;
	}
}
</style>
