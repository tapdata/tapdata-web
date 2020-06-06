<script>
export default {
	name: "FbSelect",
	props: {
		value: [String, Number],
		config: {
			require: true,
			type: Object
		}
	},
	render(h) {
		let self = this;
		let config = self.config;
		return h(
			"ElSelect",
			{
				props: {
					value: self.value,
					placeHolder: config.placeHolder
				},
				on: {
					input(val) {
						self.$emit("input", val);
					}
				}
			},
			config.options.map(opt => {
				return h("ElOption", {
					props: opt
				});
			})
		);
	}
};
</script>

<style></style>
