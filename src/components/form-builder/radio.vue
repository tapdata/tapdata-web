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

<style></style>
