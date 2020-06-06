<script>
const ele = {
	input: "FbInput",
	select: "FbSelect",
	radio: "FbRadio"
};
export default {
	name: "FormBuilder",
	props: {
		value: Object,
		/**
		 * 表单规则设置
		 * @template {
		 *
		 * 		form: {},
		 *
		 * 		items: [
		 * 			{
		 * 				type: "类型",   //input,select....
		 *				field: "字段名",
		 *				label: "字段展示名称"
		 * 			}
		 * 		]
		 *
		 * }
		 *
		 */
		config: {
			require: true,
			type: Object
		}
	},
	data() {
		return {
			defaultFormConfig: {
				model: null,
				rules: null,
				inline: false,
				labelPosition: "top",
				labelWidth: "160px",
				hideRequiredAsterisk: false,
				size: "mini",
				disabled: false
			},
			defaultFormItemConfig: {
				type: "input",
				field: "field",
				label: "字段名",
				required: false
			}
		};
	},
	render(h) {
		let formConfig = Object.assign(this.defaultFormConfig, this.config.form, {
			model: this.value
		});
		let formItems = this.config.items || [];
		return h(
			"ElForm",
			{
				class: "e-form-builder-container",
				ref: "form",
				props: formConfig
			},
			formItems.map(item => {
				return this.getFormItem(h, item);
			})
		);
	},
	methods: {
		getFormItem(h, itemConfig) {
			let self = this;
			let config = Object.assign({}, this.defaultFormItemConfig, itemConfig);
			let item = h(
				"ElFormItem",
				{
					class: "e-form-builder-item",
					props: {
						prop: config.field,
						label: config.label,
						rules: config.rules
					}
				},
				[
					h(ele[config.type], {
						props: {
							value: self.value[config.field],
							config: config
						},
						on: {
							input(val) {
								if (self.value[config.field] === undefined) {
									throw new Error(`The field "${config.field}" of the model do not defined!`);
								}
								self.value[config.field] = val;
							}
						}
					})
				]
			);
			return item;
		}
	}
};
</script>

<style></style>
