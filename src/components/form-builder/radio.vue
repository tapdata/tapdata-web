<script>
export default {
	name: "FbRadio",
	props: {
		value: [String, Number, Boolean],
		config: {
			require: true,
			type: Object
		}
	},
	render(h) {
		let self = this;
		let config = self.config;
		if (!config.options) {
			config.options = [];
			throw new Error(`The component "FbRadio" is not config options!`);
		}
		return h(
			"ElRadioGroup",
			{
				class: {
					"fb-radio": true
				},
				props: {
					value: self.value
				},
				on: {
					input(val) {
						self.$emit("input", val);
					}
				}
			},
			config.options.map(opt => {
				return h(
					config.button ? "ElRadioButton" : "ElRadio",
					{
						class: {
							"fb-radio-option": true
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
	display: flex;
	justify-content: space-between;
	width: 100%;
	.fb-radio-option {
		flex: 1;
		margin-right: 10px;
		&:last-child {
			margin-right: 0;
		}
	}
}
</style>
