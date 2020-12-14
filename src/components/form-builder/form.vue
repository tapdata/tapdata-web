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
 *              labelSlot: (createElement) => createElement('span', {}, 'label'),
 * 			}
 * 		]
 *
 * }
 *
 */
const ele = {
	input: 'FbInput',
	select: 'FbSelect',
	radio: 'FbRadio',
	switch: 'FbSwitch',
	file: 'FbFile',
	field: 'FbSelect'
};
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
				labelSlot: () => null,
				on: {}
			},
			form: null
		};
	},
	watch: {
		config: {
			deep: true,
			handler() {
				this.show = false;
				this.$nextTick(() => {
					this.show = true;
					this.clearValidate();
				});
			}
		}
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
						if (!value || !(value + '').trim()) {
							callback(new Error(`${config.label}` + self.$t('formBuilder.noneText')));
						} else {
							callback();
						}
					}
				});
			}
			let prependSlot = config.prependSlot ? config.prependSlot(h) : null;
			let appendSlot = config.appendSlot ? config.appendSlot(h) : null;

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
					props: {
						prop: config.field,
						label: config.label,
						rules: rules
					}
				},
				[
					this.getLabel(h, config, rules),
					h('div', { class: { 'fb-item-group': true } }, [
						prependSlot ? h('div', { class: { 'fb-form-item-prepend-slot': true } }, [prependSlot]) : null,
						config.type === 'slot'
							? this.$slots[config.slot]
							: h(ele[config.type], {
									props: {
										value: self.value[config.field],
										config: config
									},
									on: {
										input(val) {
											if (config.domType === 'number') {
												val = Number(val);
											}
											if (self.value[config.field] === undefined) {
												throw new Error(
													`The field "${config.field}" of the model is not defined!`
												);
											}
											self.value[config.field] = val;
											config.on.input && config.on.input(val);
										},
										change(...args) {
											config.on.change && config.on.change(...args);
										}
									}
							  }),
						appendSlot ? h('div', { class: { 'fb-form-item-append-slot': true } }, [appendSlot]) : null
					])
				]
			);
			return config.show ? item : '';
		},
		getLabel(h, config) {
			let labelSlot = config.labelSlot ? config.labelSlot(h) : null;
			return !config.label && !labelSlot
				? null
				: h(
						'div',
						{
							class: 'e-form-builder-item-label',
							slot: 'label'
						},
						[
							labelSlot || config.label,
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
												innerHTML: config.tips.content || config.tips
											}
										}),
										h(
											'span',
											{
												class: 'color-warning',
												slot: 'reference'
											},
											[
												h('i', {
													class: 'el-icon-warning-outline e-form-builder-item-tips'
												}),
												config.tips.label
											]
										)
									]
								)
						]
				  );
		}
	}
};
</script>

<style lang="less">
.e-form-builder-container {
	.e-form-builder-item-label {
		display: flex;
		align-items: center;
		font-size: 12px;
		.e-form-builder-item-tips {
			margin-left: 5px;
			font-size: 14px;
		}
	}
	.el-form-item__label {
		padding-bottom: 0px;
		display: flex;
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
