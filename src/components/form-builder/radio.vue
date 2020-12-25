<script>
import mixins from './mixin';
export default {
	name: 'FbRadio',
	mixins: [mixins],
	props: {
		value: [String, Number, Boolean],
		config: {
			require: true,
			type: Object
		}
	},
	data() {
		return {
			defaultConfig: {
				border: true,
				isVertical: true
			}
		};
	},
	render(h) {
		let self = this;
		let config = Object.assign(self.defaultConfig, self.config);
		if (!config.options) {
			config.options = [];
			throw new Error(`The component "FbRadio" is not config options!`);
		}
		return h(
			'ElRadioGroup',
			{
				class: {
					'fb-radio': true,
					border: config.border,
					verical: config.isVertical
				},
				props: {
					value: self.value
				},
				on: self.on
			},
			config.options.map(opt => {
				return h(
					config.button ? 'ElRadioButton' : 'ElRadio',
					{
						class: {
							'fb-radio-option': true
						},
						props: {
							label: opt.value,
							border: config.border
						}
					},
					[
						h('span', opt.label),
						opt.tip && config.isVertical && config.border
							? h(
									'div',
									{
										class: 'fb-radio-option-tip'
									},
									opt.tip
							  )
							: null
					]
				);
			})
		);
	}
};
</script>

<style lang="less">
.fb-radio {
	display: flex;
	width: 100%;
	.fb-radio-option {
		display: flex;
		height: 100%;
		padding: 0 10px;
		.el-radio__input {
			height: 28px;
			line-height: 28px;
			.el-radio__inner {
				vertical-align: middle;
			}
		}
		.el-radio__label {
			line-height: 28px;
			.fb-radio-option-tip {
				margin-bottom: 5px;
				color: #999;
				line-height: 19px;
				white-space: pre-wrap;
				word-break: break-word;
			}
		}
	}
	&.border {
		display: flex;
		justify-content: space-between;
		.fb-radio-option {
			max-width: 50%;
			flex: 1;
			margin-right: 10px;
			&:last-child {
				margin-right: 0;
			}
		}
	}
	&.verical.border {
		display: block;
		.fb-radio-option {
			width: 100%;
			max-width: unset;
			flex: unset;
			margin-right: 0;
		}
		.el-radio.is-bordered + .el-radio.is-bordered {
			margin-top: 10px;
			margin-left: 0;
		}
	}
}
</style>
