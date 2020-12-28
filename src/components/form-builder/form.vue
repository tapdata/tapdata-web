<script>
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
 *				label: "字段展示名称"，
 *              required: "是否必填",
 *
 *              //字段标题label的插槽，传一个function，参数为createElement
 * 			}
 * 		]
 *
 * }
 *
 */
import TYPE_MAPPING from './constant';
export default {
	name: 'FormBuilder',
	props: {
		value: Object,
		config: {
			require: true,
			type: Object
		}
	},
	data() {
		return {
			show: true,
			defaultFormConfig: {
				model: null,
				rules: null,
				inline: false,
				labelPosition: 'top',
				labelWidth: '160px',
				size: 'mini',
				disabled: false
			},
			defaultFormItemConfig: {
				show: true,
				type: 'input',
				field: 'field',
				label: '',
				domType: 'text',
				required: false,
				clearable: true,
				on: {}
			},
			form: null
		};
	},
	render(h) {
		let formConfig = Object.assign(this.defaultFormConfig, this.config.form, {
			model: this.value
		});
		let formItems = this.config.items || [];
		let el = h(
			'ElForm',
			{
				class: 'e-form-builder-container',
				ref: 'form',

				props: Object.assign(formConfig, {
					inlineMessage: true
				})
			},
			formItems.map(item => {
				return this.getFormItem(h, item);
			})
		);
		if (this.show) {
			return el;
		}
		return '';
	},
	methods: {
		validate(callback) {
			return this.$refs.form && this.$refs.form.validate(callback);
		},
		clearValidate() {
			return this.$refs.form && this.$refs.form.clearValidate();
		},
		getFormItem(h, itemConfig) {
			let self = this;
			let config = Object.assign({}, this.defaultFormItemConfig, itemConfig);
			let rules = config.rules || [];
			//改变必填项的默认提示
			if (config.required && !rules.find(r => r.required)) {
				rules.push({
					required: true,
					validator(rule, value, callback) {
						if ((!value && value !== 0) || (value && !(value + '').trim())) {
							callback(new Error(`${config.label}` + self.$t('formBuilder.noneText')));
						} else {
							callback();
						}
					}
				});
			}

			let dependOn = config.dependOn;
			if (dependOn && dependOn.length) {
				/**
				 * dependOn 配置说明：
				 *			triggerOptions: 依赖的字段与值
				 *						field: 依赖的字段
				 *						value: 依赖的值
				 *			triggerConfig: 依赖项满足条件后需要更新的配置
				 */
				dependOn.forEach(depend => {
					let triggerOptions = depend.triggerOptions;
					if (triggerOptions.every(opt => opt.value === this.value[opt.field])) {
						config = Object.assign(config, depend.triggerConfig);
					}
				});
			}
			let item = h(
				'ElFormItem',
				{
					class: 'e-form-builder-item',
					style: this.config.form.itemStyle,
					props: {
						prop: config.field,
						label: config.label,
						rules: rules.map(r => {
							let rule = Object.assign({}, r);
							if (rule.validator) {
								rule.validator = rule.validator.bind(this);
							}
							return rule;
						})
					},
					key: config.field
				},
				[this.getLabel(h, config), this.getBody(h, config)]
			);
			return config.show ? item : '';
		},
		getLabel(h, config) {
			return !config.label
				? null
				: h(
						'span',
						{
							class: 'e-form-builder-item-label',
							slot: 'label'
						},
						[
							config.label,
							config.tips &&
								h(
									'ElPopover',
									{
										style: { 'vertical-align': 'middle' },
										props: {
											trigger: 'hover',
											placement: 'top'
										}
									},
									[
										h('div', {
											domProps: {
												innerHTML: config.tips
											}
										}),
										h(
											'span',
											{
												class: 'color-primary',
												slot: 'reference'
											},
											[
												h('i', {
													class: 'el-icon-warning-outline e-form-builder-item-tips'
												})
											]
										)
									]
								)
						]
				  );
		},
		getBody(h, config) {
			let self = this;
			let appendSlot = config.appendSlot ? config.appendSlot(h, this.value) : null;
			let el =
				config.type === 'slot'
					? this.$slots[config.slot]
					: h(TYPE_MAPPING[config.type], {
							props: {
								value: self.value[config.field],
								config: config
							},
							on: {
								input(val) {
									if (self.value[config.field] === undefined) {
										throw new Error(`The field "${config.field}" of the model is not defined!`);
									}
									self.value[config.field] = val;
									let influences = config.influences;
									if (influences && influences.length) {
										influences.forEach(it => {
											if (it.byValue === val) {
												self.value[it.field] = it.value;
											}
										});
									}
									config.on.input && config.on.input(val);
								},
								change(...args) {
									config.on.change && config.on.change(...args);
								}
							}
					  });
			if (appendSlot) {
				return h('div', { class: { 'fb-item-group': true } }, [
					el,
					h('div', { class: { 'fb-form-item-append-slot': true } }, [appendSlot])
				]);
			} else {
				return [el];
			}
		}
	}
};
</script>

<style lang="less">
.e-form-builder-container {
	.color-warning {
		color: #e6a23c;
	}
	.e-form-builder-item-label {
		font-size: 12px;
		.e-form-builder-item-tips {
			margin-left: 5px;
			font-size: 14px;
		}
	}
	.el-form-item__label {
		padding-bottom: 0px;
	}
	.el-form-item {
		margin-bottom: 5px;
	}
	.fb-item-group {
		display: flex;
		align-items: center;
	}
	.fb-form-item-prepend-slot {
		margin-right: 5px;
	}
	.fb-form-item-append-slot {
		margin-left: 5px;
	}
}
</style>
