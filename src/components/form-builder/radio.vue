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
				border: true
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
					border: config.border
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
					[opt.label]
				);
			})
		);
	}
};
</script>

<style lang="less">
.fb-radio {
	justify-content: space-between;
	width: 100%;
	&.border {
		display: flex;
	}
	.fb-radio-option {
		max-width: 50%;
		flex: 1;
		margin-right: 10px;
		&:last-child {
			margin-right: 0;
		}
	}
}
</style>
